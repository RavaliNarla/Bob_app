// src/template-studio/components/TemplateEditor.js
import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Card, Form, InputGroup, Button } from "react-bootstrap";
import { useTemplateStore } from "../../store/useTemplateStore";
import SectionToggles from "./SectionToggles";
import LogoUploader from "./LogoUploader";
import BackgroundLogoPicker from "./BackgroundLogoPicker";
import LivePreview from "./LivePreview";
import Toolbar from "./Toolbar";
import defaultTemplate from "./defaultTemplate.json";
import "../../css/Editor.css";

/* Restore ReactQuill ONLY for Terms so it doesn’t show raw <p> tags */
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { buildHtmlForExport } from "./utils/exportHtml";
import apiService from "../../services/apiService";
/* ------- token helpers (chips only) ------- */
const TOKEN_CLASS = "quill-token";
const TOKEN_RE = /\{\{\s*fields\.(positionTitle|companyName|joiningDate)\s*\}\}/g;

// wrap plain tokens once; keep existing spans if already wrapped
function wrapTokensOnce(html = "") {
  if (!html) return "";
  if (html.includes(`class="${TOKEN_CLASS}"`)) return html;
  return html.replace(
    TOKEN_RE,
    (m) => `<span class="${TOKEN_CLASS}" data-token="${m}" contenteditable="false">${m}</span>`
  );
}

// block deletion when caret touches a token chip
function selectionTouchesToken(root) {
  const sel = window.getSelection?.();
  if (!sel || sel.rangeCount === 0) return false;
  const r = sel.getRangeAt(0);
  const near = (n) =>
    n &&
    (n.parentElement?.closest?.(`.${TOKEN_CLASS}`) ||
      (n.nodeType === 1 && n.closest?.(`.${TOKEN_CLASS}`)));
  return !!(near(r.startContainer) || near(r.endContainer) || near(r.commonAncestorContainer));
}

/* very small contentEditable editor JUST for the Intro */
function IntroEditor({ value, onChange }) {
  const quillRef = useRef(null);

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const safe = wrapTokensOnce(value || "");

    // Save current scroll
    const scrollY = window.scrollY;

    // Insert content WITHOUT focusing
    quill.root.innerHTML = safe;

    // Restore scroll
    window.scrollTo(0, scrollY);
  }, []);

  const handleChange = (html) => {
    onChange?.(html);
  };

  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const quillFormats = [
    "bold", "italic", "underline", "strike",
    "color", "background",
    "align",
  ];

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={value}
      onChange={handleChange}
      modules={quillModules}
      formats={quillFormats}
      style={{ minHeight: 140 }}
      className="intro-editor"
    />
  );
}

export default function TemplateEditor() {
  const template = useTemplateStore((s) => s.template);
  const setTemplateName = useTemplateStore((s) => s.setTemplateName);
  const setField = useTemplateStore((s) => s.setField);
  const setContent = useTemplateStore((s) => s.setContent);
  const setLayout = useTemplateStore((s) => s.setLayout);

  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  // ensure chips exist once on first mount
  useEffect(() => {
    const intro = template?.content?.intro ?? defaultTemplate.content.intro ?? "";
    if (!intro.includes(`class="${TOKEN_CLASS}"`)) {
      setContent("intro", wrapTokensOnce(intro));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // basic
      [{ 'color': [] }, { 'background': [] }],         // text & background color
      [{ 'align': [] }],                               // alignment
      ['clean']                                        // remove formatting
    ]
  };

  const quillFormats = [
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align'
  ];

  const handleSave = async () => {
    let name = (template?.templateName || "").trim();
    if (!name) {
      alert("Please enter a Template Name");
      return;
    }

    try {
      setSaving(true);
      const html = buildHtmlForExport(template, useTemplateStore.getState().layout);
      name = name.replace(/_\d+$/, "");

      const fd = new FormData();
      fd.append("name", name);
      fd.append("templateFile", new Blob([html], { type: "text/html" }));
      if (selectedId) fd.append("id", selectedId);

      const { data } = await apiService.uploadTemplate(fd);

      // ✅ Update templates list immediately
      setTemplates((prev) => {
        const filtered = prev.filter((t) => t.id !== selectedId);
        return [...filtered, data];
      });

      alert(`✅ Saved: ${data?.name || name}\nFile: ${data?.id}`);

      // 🔹 Reset editor after saving
      useTemplateStore.getState().setTemplate(defaultTemplate); // reset store
      setSelectedId(""); // clear selected saved template
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiService.getTemplates();
        setTemplates(data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);
  return (
    <>
      <Toolbar
        templates={templates}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />
      <Form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <Row className="mt-3 g-3">
          {/* Left column: editor */}
          <Col md={6}>
            <div className="ts-scope ts-left shadow offer" style={{ background: "#fff", padding: "2rem", height: "calc(128vh - 80px)", overflowY: "auto", }}>
              <Card.Body>

                <Form.Label>Template Name</Form.Label>
                <InputGroup>
                  <Form.Control
                    value={template.templateName}  // ✅ will now default to "Template 1"
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </InputGroup>

                <hr />
                <LogoUploader />
                <hr />
                <BackgroundLogoPicker />

                <SectionToggles />
              </Card.Body>
              <hr />
              <Card.Body>
                <div className="fields_data">

                  <h6 className="mb-3" style={{ fontWeight: '500' }}>Fields</h6>
                  <Form.Label>Signature</Form.Label>
                  <Form.Group className="mb-2">

                    <Form.Control
                      className="mb-2 w-48"
                      value={template.fields.hrName}
                      onChange={(e) => setField("hrName", e.target.value)}
                      placeholder="e.g. HR Department"
                    />
                    <Form.Control
                      className="mb-2 w-48"
                      value={template.fields.companyName}
                      onChange={(e) => setField("companyName", e.target.value)}
                      placeholder="e.g. Company Name"
                    />
                  </Form.Group>
                </div>

                {/* <Form.Group className="mb-2">
                <Form.Label>Position Title (token OK)</Form.Label>
                <Form.Control
                  value={template.fields.positionTitle}
                  onChange={(e) => setField("positionTitle", e.target.value)}
                  placeholder="e.g. {{job.position}}"
                />
                <div className="small text-muted">
                  Use token <code>{"{{job.position}}"}</code> for dynamic.
                </div>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Gross Annual (token OK)</Form.Label>
                <Form.Control
                  value={template.fields.grossAnnual}
                  onChange={(e) => setField("grossAnnual", e.target.value)}
                  placeholder="e.g. {{job.salary}}"
                />
                <div className="small text-muted">
                  Use token <code>{"{{job.salary}}"}</code> for dynamic.
                </div>
              </Form.Group> */}
              </Card.Body>
              <hr />
              <Card.Body>
                <div class="content_data">
                  <h6 className="mb-2" style={{ fontWeight: '500' }}>Content</h6>

                  {/* Subject */}
                  <Form.Group className="mb-2" style={{ marginBottom: '15px !important' }}>
                    <Form.Label>Subject</Form.Label>
                    <ReactQuill
                      theme="snow"
                      value={template.content.subject}
                      onChange={(v) => setContent("subject", v)}
                      style={{ minHeight: 50 }}
                      modules={quillModules}
                      formats={quillFormats}
                    />
                  </Form.Group>

                  {/* Intro (chips, non-editable) */}
                  <Form.Label>Body Text</Form.Label>
                  <IntroEditor
                    value={template.content.intro}
                    onChange={(v) => setContent("intro", v)}
                  />

                  {/* Terms (restored to ReactQuill so no raw <p> shows) */}
                  <Form.Label>Terms</Form.Label>
                  <ReactQuill
                    theme="snow"
                    value={template.content.termsHtml}
                    onChange={(v) => setContent("termsHtml", v)}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </div>

                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    className="mt-3 save-template-btn"
                    disabled={saving}
                    variant="primary"
                  >
                    {saving ? "Saving…" : "Save Template"}
                  </Button>
                </div>
              </Card.Body>
            </div>
          </Col>

          {/* Right column: live preview */}
          <Col md={6}>
            <LivePreview />
          </Col>
        </Row>
      </Form>
    </>
  );
}