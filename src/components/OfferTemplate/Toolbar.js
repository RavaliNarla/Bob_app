// src/components/OfferTemplate/Toolbar.jsx
import { useState, useEffect } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { useTemplateStore } from '../../store/useTemplateStore';
import { buildHtmlForExport } from "./utils/exportHtml";
import apiService from "../../services/apiService";
import defaultTemplate from "./defaultTemplate.json";

// Only wrap tokens if not already wrapped by Quill (prevents double)
function ensureQuillTokens(html = "") {
  if (!html) return "";
  if (html.includes('class="quill-token"')) return html;
  return html.replace(/\{\{fields\.(positionTitle|companyName|joiningDate)\}\}/g, (m) =>
    `<span class="quill-token" data-token="${m}" contenteditable="false">${m}</span>`
  );
}

export default function Toolbar() {
  const template = useTemplateStore((s) => s.template);
  const setLayout = useTemplateStore((s) => s.setLayout);
  const setTemplateName = useTemplateStore((s) => s.setTemplateName); // ⬅ add this
  const layout = useTemplateStore((s) => s.layout);

  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const handleSave = async () => {
    let name = (template?.templateName || "").trim();
    if (!name) {
      alert("Please enter a Template Name");
      return;
    }

    try {
      setSaving(true);
      const html = buildHtmlForExport(template, layout);

      // remove trailing "_<digits>" if backend appended timestamp earlier
      name = name.replace(/_\d+$/, "");

      const fd = new FormData();
      fd.append("name", name);
      fd.append("templateFile", new Blob([html], { type: "text/html" }));

      if (selectedId) {
        fd.append("id", selectedId);
      }

      const { data } = await apiService.uploadTemplate(fd);

      // ✅ Update dropdown list (add or replace)
      setTemplates(prev => {
        const filtered = prev.filter(t => t.id !== selectedId); // remove old template being edited
        return [...filtered, data]; // add the newly saved template
      });
      setSelectedId(""); // reset selection


      // ✅ Reset dropdown to "Select template"
      setSelectedId("");

      // ✅ Reset LivePreview to initial state
      const { setTemplate, setLayout } = useTemplateStore.getState();
      setTemplate(defaultTemplate); // reset template fields/content
      setLayout("template1");       // reset layout if needed

      alert(`✅ Saved: ${data?.name || name}\nFile: ${data?.id}`);
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
        const { data } = await apiService.getTemplates(); // GET /api/offer-templates
        setTemplates(data || []);
        if (data?.length) {
          // setSelectedId(prev => (data.some(t => t.id === prev) ? prev : data[0].id));
          setSelectedId(prev => (data.some(t => t.id === prev) ? prev : ""));
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleSelect = async (tpl) => {
    try {
      const contentUrl = tpl?.id
        ? `${process.env.REACT_APP_NODE_API_URL}/offer-templates/${encodeURIComponent(tpl.id)}/content`
        // ? `http://localhost:5000/api/offer-templates/${encodeURIComponent(tpl.id)}/content`

        : tpl?.path;
      if (!contentUrl) throw new Error("No template content URL");

      const res = await fetch(contentUrl, { headers: { Accept: "text/html" } });
      if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);
      const htmlContent = await res.text();

      const parsed = parseTemplateHTML(htmlContent);

      const normalized = {
        templateName: parsed.templateName || tpl.name || "",
        branding: parsed.branding || {},
        // Default ON if sections missing, so users immediately see everything
        sections: parsed.sections || {
          header: true, salutation: true, jobDetails: true, terms: true, signature: true,
        },
        fields: {
          hrName: "", companyName: "", positionTitle: "", grossAnnual: "",
          ...(parsed.fields || {}),
        },
        content: {
          subject: parsed.content?.subject || "Offer of Employment",
          intro: ensureQuillTokens(parsed.content?.intro || ""),
          termsHtml: parsed.content?.termsHtml || "",
          signature: parsed.content?.signature || "",
        },
      };

      useTemplateStore.getState().setTemplate(normalized);
      if (parsed.layout) setLayout(parsed.layout);
    } catch (err) {
      console.error("Error loading template:", err);
      alert("Failed to load the selected template.");
    }
  };

  function parseTemplateHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // 1) Prefer embedded metadata (exact state that was saved)
    const metaEl = doc.querySelector('script#tpl-meta[type="application/json"]');
    if (metaEl && metaEl.textContent) {
      try {
        const meta = JSON.parse(metaEl.textContent);
        return {
          templateName: meta.templateName || "",
          branding: meta.branding || {},
          sections: {
            header: !!meta.sections?.header,
            salutation: !!meta.sections?.salutation,
            jobDetails: !!meta.sections?.jobDetails,
            // compensation: !!meta.sections?.compensation,
            terms: !!meta.sections?.terms,
            signature: !!meta.sections?.signature,
            // footer: !!meta.sections?.footer,
          },
          fields: meta.fields || {},
          content: {
            subject: meta.content?.subject || "",
            intro: meta.content?.intro || "",      // just the intro, not the whole page
            termsHtml: meta.content?.termsHtml || "",
            signature: meta.content?.signature || "",
          },
          layout: meta.layout || "template1",
        };
      } catch (e) {
        console.warn("tpl-meta parse failed, falling back:", e);
      }
    }

    // 2) Fallback (legacy): extract strict by IDs first; no dumping
    const root = doc.querySelector(".offer-content") || doc.body;

    const subjectEl = root.querySelector("#subject") || root.querySelector(".subject") || root.querySelector("h1,h2,h3,h4");
    const introEl = root.querySelector("#intro") || root.querySelector(".intro");
    const termsEl = root.querySelector("#terms") || root.querySelector(".terms");
    const signatureEl = root.querySelector("#signature") || root.querySelector(".signature");

    const logoEl = doc.querySelector("img.logo") || root.querySelector("img.logo");

    return {
      templateName: "",
      branding: {
        logoUrl: logoEl ? logoEl.src : "",
        backgroundLogoUrl: "",
        backgroundLogoSizePx: 120,
        backgroundLogoOpacity: 0.06,
      },
      // Turn on sections if their block exists (else default true so UI shows content)
      sections: {
        header: true,
        salutation: !!root.querySelector("#salutation, .salutation"),
        jobDetails: !!root.querySelector("#job-details, .job-details"),
        // compensation: true,
        terms: !!termsEl,
        signature: !!signatureEl,
        // footer: false,
      },
      fields: { hrName: "", companyName: "", positionTitle: "", grossAnnual: "" },
      content: {
        subject: subjectEl ? subjectEl.innerHTML.trim() : "",
        intro: (introEl ? introEl.innerHTML : ""),      // ONLY the intro block
        termsHtml: termsEl ? termsEl.innerHTML : "",
        signature: signatureEl ? signatureEl.innerHTML : "",
      },
    };
  }

  return (
    <div>
      {/* Heading */}
            <h5 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '18px !important', color: '#FF7043', marginBottom: '20px' }}>Offer Letter Templates</h5>
      <div className="d-flex gap-2 flex-wrap mb-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Template"}
        </Button>

        <Dropdown>
          <Dropdown.Toggle variant="secondary" id="template-dropdown">
            {layout === "template1" ? "Template 1" : layout === "template2" ? "Template 2" : "Template 3"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                setLayout("template1");
                setTemplateName("Template 1"); // ✅ update store
              }}
            >
              Template 1
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                setLayout("template2");
                setTemplateName("Template 2"); // ✅ update store
              }}
            >
              Template 2
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                setLayout("template3");
                setTemplateName("Template 3"); // ✅ update store
              }}
            >
              Template 3
            </Dropdown.Item>
          </Dropdown.Menu>

        </Dropdown>

        {/* Dropdown: select saved template and load it into the editor */}
        <select
          value={selectedId}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedId(id);
            const tpl = templates.find(t => t.id === id);
            if (tpl) handleSelect(tpl);
          }}
        >
          <option value="">Select template</option>
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}