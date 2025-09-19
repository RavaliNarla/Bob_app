// src/components/OfferTemplate/LivePreview.js
import React from "react";
import { useTemplateStore } from '../../store/useTemplateStore';

// Only wrap tokens if not already wrapped by Quill (prevents double)
function introWithTokens(html = "") {
  if (!html) return "";

  return html
    .replace(/(<span class="quill-token"[^>]*>.*?<\/span>|{{[^}]+}})/g, (match) => {
      if (match.startsWith("<span")) {
        return match; // already wrapped
      }
      return `<span class="quill-token" contenteditable="false" data-token="${match}">${match}</span>`;
    })
    .replace(/&nbsp;/g, " ");
}

function TemplateBase({ template, candidate, s, c, b, variant }) {
  return (
    <>
      {/* Header */}
      {s.header !== false && (
        <div style={{ position: "relative", marginBottom: 8 }}>
          {b.logoUrl && (
            <div style={{ textAlign: "center" }}>
              <img
                src={b.logoUrl}
                alt="logo"
                style={{
                  height: variant === 3 ? 50 : 64,
                  objectFit: "contain"
                }}
              />
            </div>
          )}
          <div style={{ textAlign: "right", marginTop: 4 }}>
            <span>Date:</span>
          </div>
        </div>
      )}

      {/* Subject */}
      {c.subject ? (
  <div
    style={{ textAlign: "center", margin: "6px 0 10px 0", color: '#162b75', fontWeight: '500' }}
    dangerouslySetInnerHTML={{ __html: c.subject }}
  />
) : null}

      {/* Salutation */}
      {s.salutation !== false && (
        <div style={{ marginTop: 8 }}>
          <div style={{color: '#000',fontWeight : '400', fontSize:'14px'}}>To,</div>
          <div style={{color: '#000',fontWeight : '400', fontSize:'14px'}}>{candidate.full_name || "Candidate Name"}</div>
          <div style={{color: '#000',fontWeight : '400', fontSize:'14px'}}>{candidate.address || "Address Line"}</div>
          <p style={{ marginTop: 8 }}>
            Dear <b style={{color: '#162b75', fontWeight : '500', fontSize:'14px'}}>{candidate.full_name || "Candidate Name"}</b>,
          </p>
        </div>
      )}

      {/* Intro */}
      <div style={{color: '#414141',fontWeight : '400', fontSize:'14px'}} dangerouslySetInnerHTML={{ __html: introWithTokens(c.intro) }} />

      {/* Job details */}
      {s.jobDetails !== false && (
        variant === 2 ? (
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", rowGap: 6, columnGap: 12,  marginTop:'15px'}}>
            <div><b style={{color: '#000',fontWeight : '400', fontSize:'14px'}}>Job Title:</b></div><div style={{color: '#162b75',fontWeight : '500', fontSize:'14px'}}>{"{{job.position}}"}</div>
            <div><b style={{color: '#000',fontWeight : '400', fontSize:'14px'}}>Location:</b></div><div style={{color: '#162b75',fontWeight : '500', fontSize:'14px'}}>{"{{job.location_name}}"}</div>
            <div><b style={{color: '#000',fontWeight : '400', fontSize:'14px'}}>Gross Salary:</b></div ><div style={{color: '#162b75',fontWeight : '500', fontSize:'14px'}}>{"{{job.salary}}"}</div>
          </div>
        ) : (
          <div style={{ marginTop:'15px' }}>
            <p style={{ margin: 0, color: '#162b75',fontWeight : '500', fontSize:'14px'}}><b style={{color: '#000',fontWeight : '400', fontSize:'14px'}}>Job Title:</b> {"{{job.position}}"}</p>
            <p style={{ margin: 0 , color: '#162b75',fontWeight : '500', fontSize:'14px'}}><b style={{color: '#000',fontWeight : '400', fontSize:'14px'}}>Location:</b> {"{{job.location_name}}"}</p>
            <p style={{ margin: 0 , color: '#162b75',fontWeight : '500', fontSize:'14px'}}><b style={{color: '#000',fontWeight : '400', fontSize:'14px'}}>Gross Salary:</b> {"{{job.salary}}"}</p>
          </div>
        )
      )}

      {/* Terms */}
      {s.terms !== false && (
        <div style={{ marginTop:'15px', color: '#414141',fontWeight : '400', fontSize:'14px'}} dangerouslySetInnerHTML={{ __html: c.termsHtml || "" }} />
      )}

      {/* Signature */}
      {s.signature !== false && (
        <div style={{ marginTop: 16, textAlign: variant === 2 ? "right" : variant === 3 ? "center" : "left" }}>
          <div style={{color: '#000',fontWeight : '400', fontSize:'14px'}}>{template.fields?.hrName || "HR Department"}</div>
          <div style={{color: '#000',fontWeight : '400', fontSize:'14px'}}>{template.fields?.companyName || "Company Name"}</div>
        </div>
      )}
    </>
  );
}

export default function LivePreview() {
  const template = useTemplateStore((s) => s.template);
  const candidate = useTemplateStore((s) => s.candidate);
  const layout = useTemplateStore((s) => s.layout);

  const s = template.sections || {};
  const c = template.content || {};
  const b = template.branding || {};

  const wmSize = Number(b.backgroundLogoSizePx) || 160;
  const wmOpacity = b.backgroundLogoOpacity != null ? Number(b.backgroundLogoOpacity) : 0.12;

  return (
    <div
      id="offer-preview"
      style={{
        position: "relative",
        background: "#fff",
        minHeight: 820,
        padding: 24,
        overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
      }}
    >
      {/* Watermark */}
      {b.backgroundLogoUrl ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <img
            src={b.backgroundLogoUrl}
            alt=""
            style={{ width: wmSize, height: wmSize, opacity: wmOpacity, objectFit: "contain" }}
          />
        </div>
      ) : null}

      <div style={{ position: "relative", zIndex: 2 }}>
        {layout === "template1" && <TemplateBase template={template} candidate={candidate} s={s} c={c} b={b} variant={1} />}
        {layout === "template2" && <TemplateBase template={template} candidate={candidate} s={s} c={c} b={b} variant={2} />}
        {layout === "template3" && <TemplateBase template={template} candidate={candidate} s={s} c={c} b={b} variant={3} />}
      </div>
    </div>
  );
}
