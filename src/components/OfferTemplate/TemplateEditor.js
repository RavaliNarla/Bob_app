// src/template-studio/components/TemplateEditor.js
import { Row, Col, Card, Form, InputGroup } from "react-bootstrap";
import { useTemplateStore } from '../../store/useTemplateStore';
import SectionToggles from "./SectionToggles";
import LogoUploader from "./LogoUploader";
import BackgroundLogoPicker from "./BackgroundLogoPicker";
import LivePreview from "./LivePreview";
import Toolbar from "./Toolbar";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useEffect, useRef } from "react";
import defaultTemplate from "./defaultTemplate.json";
import '../../css/Editor.css';

// --- Custom Quill Blot for tokens ---
const TOKEN_REGEX = /(\{\{fields\.(positionTitle|companyName|joiningDate)\}\})/g;
const Inline = Quill.import("blots/inline");

class TokenBlot extends Inline {
  static create(value) {
    let node = super.create();
    node.setAttribute("contenteditable", "false");
    node.setAttribute("data-token", value);
    node.className = "quill-token";
    node.innerText = value;
    return node;
  }
  static formats(node) {
    return node.getAttribute("data-token");
  }
}

TokenBlot.blotName = "token";
TokenBlot.tagName = "span";
TokenBlot.className = "quill-token";
Quill.register(TokenBlot);

// --- Utility to convert tokens in HTML to Quill tokens ---
export function htmlToDeltaWithTokens(html) {
  if (!html) return "";
  return html.replace(TOKEN_REGEX, (match) => {
    return `<span class="quill-token" data-token="${match}" contenteditable="false">${match}</span>`;
  });
}

// --- Initialize template with processed intro content ---
const initialTemplate = {
  ...defaultTemplate,
  content: {
    ...defaultTemplate.content,
    intro: htmlToDeltaWithTokens(defaultTemplate.content.intro)
  }
};

export default function TemplateEditor() {
  const template = useTemplateStore((s) => s.template);
  const setTemplateName = useTemplateStore((s) => s.setTemplateName);
  const setField = useTemplateStore((s) => s.setField);
  const setContent = useTemplateStore((s) => s.setContent);
  const quillRef = useRef();

  useEffect(() => {
    // Reset state on unmount
    return () => {
      useTemplateStore.setState({
        template: initialTemplate, // show styled tokens on fresh open
        candidate: {
          full_name: "",
          address: "",
          address1: "",
          address2: "",
          location: ""
        },
        job: {
          position: "",
          salary: ""
        },
        layout: "template1"
      });
    };
  }, []);

  const handleIntroChange = (value) => {
    setContent("intro", value);
  };

  // Prevent deleting tokens via keyboard
  useEffect(() => {
    const quill = quillRef.current && quillRef.current.getEditor && quillRef.current.getEditor();
    if (!quill) return;

    function preventTokenDelete() {
      const tokens = quill.container.querySelectorAll(".quill-token");
      if (!tokens.length) return false;
      const selection = quill.getSelection();
      if (!selection) return false;

      for (let token of tokens) {
        const blot = Quill.find(token);
        if (!blot) continue;
        const index = blot.offset(quill.scroll);
        const length = blot.length();
        if (selection.index < index + length && selection.index + selection.length > index) {
          return true;
        }
      }
      return false;
    }

    const handleKeyDown = (e) => {
      if ((e.key === "Backspace" || e.key === "Delete") && preventTokenDelete()) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    quill.root.addEventListener("keydown", handleKeyDown);
    return () => quill.root.removeEventListener("keydown", handleKeyDown);
  }, [template.content.intro]);

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
              <Form.Group className="mb-2">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  value={template.content.subject}
                  onChange={(e) => setContent("subject", e.target.value)}
                  placeholder="e.g. Offer of Employment"
                />
              </Form.Group>

              <Form.Label>Intro (HTML / tokens OK)</Form.Label>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={template.content.intro}
                onChange={handleIntroChange}
                className="mb-3"
                modules={{
                  toolbar: [
                    ["bold", "italic", "underline"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["clean"],
                  ],
                }}
                formats={["bold", "italic", "underline", "list", "bullet", "token"]}
              />

              <Form.Label>Terms (HTML)</Form.Label>
              <ReactQuill
                theme="snow"
                value={template.content.termsHtml}
                onChange={(v) => setContent("termsHtml", v)}
                className="mb-2"
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
