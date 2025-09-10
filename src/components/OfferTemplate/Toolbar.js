import { useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import axios from "axios";
import { useTemplateStore } from '../../store/useTemplateStore';
import { buildHtmlForExport } from "./utils/exportHtml";
import ImportTemplateButton from "./ImportTemplate";
import apiService from "../../services/apiService";

// const API_BASE = "http://localhost:5000";
// const TEMPLATE_UPLOAD_URL = `${API_BASE}/api/offer-templates/upload`;

export default function Toolbar() {
  const template = useTemplateStore((s) => s.template);
  const [saving, setSaving] = useState(false);
    const setLayout = useTemplateStore((s) => s.setLayout);
const layout = useTemplateStore((s) => s.layout);


  const handleSave = async () => {
    const name = (template?.templateName || "").trim();
    if (!name) {
      alert("Please enter a Template Name");
      return;
    }

    try {
      setSaving(true);

      // 🔁 Use the shared exporter so saved HTML matches the LivePreview structure
      const html = buildHtmlForExport(template);

      const fd = new FormData();
      fd.append("name", name);
      fd.append(
        "templateFile",
        new Blob([html], { type: "text/html" }),
        `template_${name.replace(/\s+/g, "_")}.html`
      );

      // const { data } = await axios.post(TEMPLATE_UPLOAD_URL, fd, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });
      const { data } = await apiService.uploadTemplate(fd);

      alert(`✅ Saved: ${data?.name || name}\nFile: ${data?.id}`);
      console.log("Template saved:", data);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.error || err?.message || "Failed to save template";
      alert(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex gap-2 flex-wrap mb-3">
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save Template"}
      </Button>
       {/* 🔹 Template Selector Dropdown */}
      <Dropdown>
        <Dropdown.Toggle variant="secondary" id="template-dropdown">
          {layout === "template1"
            ? "Template 1"
            : layout === "template2"
            ? "Template 2"
            : "Template 3"}
        </Dropdown.Toggle>

       <Dropdown.Menu>
  <Dropdown.Item
    onClick={() => {
      setLayout("template1");
      useTemplateStore.getState().setTemplateName("Template 1");
    }}
  >
    Template 1
  </Dropdown.Item>
  <Dropdown.Item
    onClick={() => {
      setLayout("template2");
      useTemplateStore.getState().setTemplateName("Template 2");
    }}
  >
    Template 2
  </Dropdown.Item>
  <Dropdown.Item
    onClick={() => {
      setLayout("template3");
      useTemplateStore.getState().setTemplateName("Template 3");
    }}
  >
    Template 3
  </Dropdown.Item>
</Dropdown.Menu>

      </Dropdown>
      <ImportTemplateButton
        onImported={()=>{

        }}
        />
    </div>
  );
}