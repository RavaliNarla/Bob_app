// src/template-studio/components/ImportTemplate.js
import React, { useRef, useState } from "react";
import { Button } from "react-bootstrap";
import apiService from "../../services/apiService";

export default function ImportTemplateButton({ onImported }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const pickFile = () => fileRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const okType = /html$/i.test(file.name) || /text\/html|application\/xhtml\+xml/.test(file.type);
    if (!okType) {
      alert("Please select an .html file.");
      return;
    }

    const base = (file.name || "Imported Template").replace(/\.[^.]+$/, "");
    const name = window.prompt("Template Name", base) || base;

    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("name", name);
      fd.append("templateFile", file, file.name);

      const { data } = await apiService.uploadTemplate(fd);
      alert(`✅ Imported: ${data?.name || name}`);
      onImported?.(data);
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
      <Button variant="outline-secondary" onClick={pickFile} disabled={busy}>
        {busy ? "Importing…" : "Import Template (.html)"}
      </Button>
    </>
  );
}
