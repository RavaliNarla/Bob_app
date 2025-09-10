import React, { useRef, useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import apiService from "../../services/apiService";

// const API_BASE = "http://localhost:5000";
// const TEMPLATE_UPLOAD_URL = `${API_BASE}/api/offer-templates/upload`;

export default function ImportTemplateButton({ onImported }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const pickFile = () => fileRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset input for next time
    if (!file) return;

    // Basic client-side validation
    const okType = /html$/i.test(file.name) || /text\/html|application\/xhtml\+xml/.test(file.type);
    if (!okType) {
      alert("Please select an .html file.");
      return;
    }

    // Ask for a display name (fallback to filename)
    const base = (file.name || "Imported Template").replace(/\.[^.]+$/, "");
    const name = window.prompt("Template Name", base) || base;

    try {
      setBusy(true);

      const fd = new FormData();
      fd.append("name", name);
      fd.append("templateFile", file, file.name);

      // const { data } = await axios.post(TEMPLATE_UPLOAD_URL, fd, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });
      const { data } = await apiService.uploadTemplate(fd);

      alert(`✅ Imported: ${data?.name || name}`);
      if (typeof onImported === "function") onImported(data);
    } catch (err) {
      console.error("Import failed", err);
      const msg = err?.response?.data?.error || err?.message || "Failed to import template";
      alert(`❌ ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".html,text/html,application/xhtml+xml"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      {/* <Button variant="outline-secondary" onClick={pickFile} disabled={busy}>
        {busy ? "Importing…" : "Import Template (.html)"}
      </Button> */}
    </>
  );
}