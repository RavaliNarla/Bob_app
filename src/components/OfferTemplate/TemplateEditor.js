// src/template-studio/components/TemplateEditor.js
import React, { useEffect, useRef } from "react";
import { Row, Col, Card, Form, InputGroup } from "react-bootstrap";
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
function CEIntro({ value, onChange }) {
  const ref = useRef(null);

  // paint HTML (idempotent) without caret jumps
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const safe = wrapTokensOnce(value || "");
    if (el.innerHTML !== safe) el.innerHTML = safe;
  }, [value]);

  const onPaste = (e) => {
    // paste as plain text; tokens will wrap on re-render
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text/plain") || "";
    document.execCommand("insertHTML", false, text.replace(/\n/g, "<br>"));
  };

  const onBeforeInput = (e) => {
    if (
      (e.inputType || "").startsWith("delete") &&
      selectionTouchesToken(ref.current)
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onKeyDown = (e) => {
    if ((e.key === "Backspace" || e.key === "Delete") && selectionTouchesToken(ref.current)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onInput = () => onChange?.(ref.current.innerHTML);

  return (
    <div
      ref={ref}
      className="form-control mb-3"
      contentEditable
      suppressContentEditableWarning
      style={{ minHeight: 140, whiteSpace: "pre-wrap" }}
      onPaste={onPaste}
      onBeforeInput={onBeforeInput}
      onKeyDown={onKeyDown}
      onInput={onInput}
    />
  );
}

export default function TemplateEditor() {
  const template = useTemplateStore((s) => s.template);
  const setTemplateName = useTemplateStore((s) => s.setTemplateName);
  const setField = useTemplateStore((s) => s.setField);
  const setContent = useTemplateStore((s) => s.setContent);

  // ensure chips exist once on first mount
  useEffect(() => {
    const intro = template?.content?.intro ?? defaultTemplate.content.intro ?? "";
    if (!intro.includes(`class="${TOKEN_CLASS}"`)) {
      setContent("intro", wrapTokensOnce(intro));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Toolbar />
      <Row className="mt-3 g-3">
        {/* Left column: editor */}
        <Col md={4}>
          <div className="ts-scope ts-left shadow" style={{ background: "#fff", padding: "2rem" }}>
            <Card.Body>
              <Form.Label>Template Name</Form.Label>
              <InputGroup>
                <Form.Control
                  value={template.templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </InputGroup>

              <hr />
              <LogoUploader />
              <BackgroundLogoPicker />

              <hr />
              <SectionToggles />
            </Card.Body>

            <Card.Body>
              <h6 className="mb-3">Fields</h6>

              <Form.Group className="mb-2">
                <Form.Label>Signature</Form.Label>
                <Form.Control
                  className="mb-2"
                  value={template.fields.hrName}
                  onChange={(e) => setField("hrName", e.target.value)}
                  placeholder="e.g. HR Department"
                />
                <Form.Control
                  value={template.fields.companyName}
                  onChange={(e) => setField("companyName", e.target.value)}
                  placeholder="e.g. Company Name"
                />
              </Form.Group>

              <Form.Group className="mb-2">
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
              </Form.Group>
            </Card.Body>

            <Card.Body>
              <h6 className="mb-2">Content</h6>

              {/* Subject */}
              <Form.Group className="mb-2">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  value={template.content.subject}
                  onChange={(e) => setContent("subject", e.target.value)}
                  placeholder="e.g. Offer of Employment"
                />
              </Form.Group>

              {/* Intro (chips, non-editable) */}
              <Form.Label>Intro (tokens are orange chips, non-editable)</Form.Label>
              <CEIntro
                value={template.content.intro}
                onChange={(v) => setContent("intro", v)}
              />

              {/* Terms (restored to ReactQuill so no raw <p> shows) */}
              <Form.Label>Terms</Form.Label>
              <ReactQuill
                theme="snow"
                value={template.content.termsHtml}
                onChange={(v) => setContent("termsHtml", v)}
              />
            </Card.Body>
          </div>
        </Col>

        {/* Right column: live preview */}
        <Col md={8}>
          <LivePreview />
        </Col>
      </Row>
    </>
  );
}
