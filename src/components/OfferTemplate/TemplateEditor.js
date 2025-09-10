import { Row, Col, Card, Form, InputGroup } from "react-bootstrap";
import { useTemplateStore } from '../../store/useTemplateStore';
import SectionToggles from "./SectionToggles";
import LogoUploader from "./LogoUploader";
import BackgroundLogoPicker from "./BackgroundLogoPicker";
import LivePreview from "./LivePreview";
import Toolbar from "./Toolbar";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useEffect } from "react";
import { useRef } from "react";
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
Quill.register(TokenBlot);

// --- Utility to convert tokens in HTML to Quill tokens ---
function htmlToDeltaWithTokens(html) {
  // Replace tokens with <span> for Quill
  return html.replace(TOKEN_REGEX, (match) => {
    return `<span class="quill-token" data-token="${match}" contenteditable="false">${match}</span>`;
  });
}

export default function TemplateEditor() {
  const template = useTemplateStore((s) => s.template);
  const setTemplateName = useTemplateStore((s) => s.setTemplateName);
  const setField = useTemplateStore((s) => s.setField);
  const setContent = useTemplateStore((s) => s.setContent);
const quillRef = useRef();

useEffect(() => {
  if (template.content.intro) {
    const processed = htmlToDeltaWithTokens(template.content.intro);
    if (processed !== template.content.intro) {
      setContent("intro", processed);
    }
  }
}, []); // run once on mount

  // Handler to process input and re-tokenize if needed
 const handleIntroChange = (value) => {
  setContent("intro", value);
};

// Prevent deleting tokens via keyboard
  useEffect(() => {
    const quill = quillRef.current && quillRef.current.getEditor && quillRef.current.getEditor();
    if (!quill) return;

    function preventTokenDelete(range, context) {
      // Get all tokens in editor
      const tokens = quill.container.querySelectorAll(".quill-token");
      if (!tokens.length) return;

      // Check if selection overlaps a token
      const selection = quill.getSelection();
      if (!selection) return;

      // For each token, check if selection includes it
      for (let token of tokens) {
        const blot = Quill.find(token);
        if (!blot) continue;
        const [index, length] = [blot.offset(quill.scroll), blot.length()];
        // If selection covers any part of the token, block delete/backspace
        if (
          (selection.index < index + length && selection.index + selection.length > index)
        ) {
          return true;
        }
      }
      return false;
    }

    // Listen for keyboard events
    quill.root.addEventListener("keydown", (e) => {
      if (
        (e.key === "Backspace" || e.key === "Delete") &&
        preventTokenDelete()
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // Cleanup
    return () => {
      quill.root.removeEventListener("keydown", () => {});
    };
  }, [template.content.intro]);

  return (
    <>
      <Toolbar />
      <Row className="mt-3 g-3">
        {/* ===== Left column: editor ===== */}
        <Col md={4}>
          <div
            className="ts-scope ts-left shadow"
            style={{ background: "#fff", padding: "2rem" }}
          >
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

            {/* ===== Dynamic Fields (only 4 kept) ===== */}
            <Card.Body>
              <h6 className="mb-3">Fields</h6>

              <Form.Group className="mb-2">
                <Form.Label>HR Name</Form.Label>
                <Form.Control
                  value={template.fields.hrName}
                  onChange={(e) => setField("hrName", e.target.value)}
                  placeholder="e.g. HR Department"
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

            {/* ===== Content (Subject + Intro + Terms) ===== */}
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
        formats={[
          "bold",
          "italic",
          "underline",
          "list",
          "bullet",
          "token",
        ]}
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

        {/* ===== Right column: live preview ===== */}
        <Col md={8}>
          <LivePreview />
        </Col>
      </Row>
      <style>{`
        .quill-token {
          background: #f5f5f5;
          color: #d35400;
          border-radius: 3px;
          padding: 0 2px;
          margin: 0 1px;
          font-weight: 600;
          cursor: not-allowed;
          user-select: all;
        }
      `}</style>
    </>
  );
}