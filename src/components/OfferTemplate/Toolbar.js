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

export default function Toolbar({ templates, selectedId, setSelectedId }) {
  const template = useTemplateStore((s) => s.template);
  const setLayout = useTemplateStore((s) => s.setLayout);
  const setTemplateName = useTemplateStore((s) => s.setTemplateName); // ⬅ add this
  const layout = useTemplateStore((s) => s.layout);
  const [saving, setSaving] = useState(false);

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
      <h5 style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '20px' }}>Offer Letter Templates</h5>
      <div className="d-flex gap-2 flex-wrap mb-3">


        <Dropdown>
          <Dropdown.Toggle variant="secondary" id="template-dropdown">
            {layout
              ? layout === "template1"
                ? "Template 1"
                : layout === "template2"
                  ? "Template 2"
                  : "Template 3"
              : "Master Template"}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                setLayout("template1");
                setTemplateName("Template 1");
              }}
            >
              Template 1
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                setLayout("template2");
                setTemplateName("Template 2");
              }}
            >
              Template 2
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                setLayout("template3");
                setTemplateName("Template 3");
              }}
            >
              Template 3
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>


        {/* Dropdown: select saved template and load it into the editor */}
        <Dropdown>
          <Dropdown.Toggle variant="secondary" id="saved-template-dropdown">
            {selectedId
              ? templates.find((t) => t.id === selectedId)?.name.replace(/_\d+$/, "")
              : "Saved Template"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {templates.length === 0 ? (
              <Dropdown.Item disabled>No saved templates</Dropdown.Item>
            ) : (
              templates.map((tpl) => {
                const displayName = tpl.name.replace(/_\d+$/, "");
                return (
                  <Dropdown.Item
                    key={tpl.id}
                    onClick={() => {
                      setSelectedId(tpl.id);
                      handleSelect(tpl);
                    }}
                  >
                    {displayName}
                  </Dropdown.Item>
                );
              })
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}