// src/template-studio/components/LivePreview.jsx
import React from "react";
import { useTemplateStore } from '../../store/useTemplateStore';

function Template1({ template, candidate, s, c, b }) {
  return (
    <>
      {/* Header logo (center) */}
      {s.header && b.logoUrl ? (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <img src={b.logoUrl} alt="logo" style={{ height: 80, objectFit: "contain" }} />
        </div>
      ) : null}

      {/* Date (right) */}
      <div style={{ textAlign: "right", minHeight: 22 }}>
        <span>Date:</span>
      </div>

      {/* Salutation (To: + single-line address + Dear) */}
      {s.salutation !== false && (
        <div style={{ marginTop: 8 }}>
          <div>To,</div>
          <div>{candidate.full_name || "Candidate Name"}</div>
          <div>{candidate.address || "Address Line"}</div>
          <p style={{ marginTop: 8 }}>
            Dear <b>{candidate.full_name || "Candidate Name"}</b>,
          </p>
        </div>
      )}

      {/* Subject */}
      {c.subject ? (
        <p>
          <strong>{c.subject}</strong>
        </p>
      ) : null}

      {/* Intro (HTML) */}
      <div
        dangerouslySetInnerHTML={{
          __html: c.intro || "",
        }}
      />

      {/* Job details (tokens) */}
      {s.jobDetails !== false && (
        <ul style={{ paddingLeft: 18, marginTop: 8 }}>
          <li>
            <b>Job Title:</b> {"{{job.position}}"}
          </li>
          <li>
            <b>Location:</b> {"{{job.location_name}}"}
          </li>
          <li>
            <b>Gross Salary:</b> {"{{job.salary}}"}
          </li>
        </ul>
      )}

      {/* Terms */}
      {s.terms !== false && (
        <div
          dangerouslySetInnerHTML={{
            __html: c.termsHtml || "",
          }}
        />
      )}

      {/* Signature */}
      {s.signature !== false && (
        <p style={{ marginTop: 16 }}>
          {template.fields?.hrName || "HR Name"} <br />
          Bank of Baroda
        </p>
      )}
    </>
  );
}

function Template2({ template, candidate, s, c, b }) {
  return (
    <>
      {/* Top row: logo left, date right */}
      {(s.header && b.logoUrl) || true ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 8,
          }}
        >
          {s.header && b.logoUrl ? (
            <img src={b.logoUrl} alt="logo" style={{ height: 64, objectFit: "contain" }} />
          ) : <span />}
          <div style={{ minHeight: 22 }}><span>Date:</span></div>
        </div>
      ) : null}

      {/* Subject centered */}
      {c.subject ? (
        <div style={{ textAlign: "center", margin: "6px 0 10px 0" }}>
          <strong style={{ fontSize: 16 }}>{c.subject}</strong>
        </div>
      ) : null}

      {/* Salutation block */}
      {s.salutation !== false && (
        <div style={{ marginTop: 8 }}>
          <div>To,</div>
          <div>{candidate.full_name || "Candidate Name"}</div>
          <div>{candidate.address || "Address Line"}</div>
          <p style={{ marginTop: 8 }}>
            Dear <b>{candidate.full_name || "Candidate Name"}</b>,
          </p>
        </div>
      )}

      {/* Intro (HTML) */}
      <div
        dangerouslySetInnerHTML={{
          __html: c.intro || "",
        }}
      />

      {/* Job details in two-column look (still same items/tokens) */}
      {s.jobDetails !== false && (
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", rowGap: 6, columnGap: 12, marginTop: 8 }}>
          <div><b>Job Title:</b></div>
          <div>{"{{job.position}}"}</div>
          <div><b>Location:</b></div>
          <div>{"{{job.location_name}}"}</div>
          <div><b>Gross Salary:</b></div>
          <div>{"{{job.salary}}"}</div>
        </div>
      )}

      {/* Terms */}
      {s.terms !== false && (
        <div
          style={{ marginTop: 8 }}
          dangerouslySetInnerHTML={{
            __html: c.termsHtml || "",
          }}
        />
      )}

      {/* Signature right-aligned */}
      {s.signature !== false && (
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <div>{template.fields?.hrName || "HR Name"}</div>
          <div>Bank of Baroda</div>
        </div>
      )}
    </>
  );
}

function Template3({ template, candidate, s, c, b }) {
  return (
    <>
      {/* Subject first (center), then a thin separator row with date on the right */}
      {c.subject ? (
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <strong style={{ fontSize: 16 }}>{c.subject}</strong>
        </div>
      ) : null}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        {/* Optional small logo left if header enabled */}
        {s.header && b.logoUrl ? (
          <img src={b.logoUrl} alt="logo" style={{ height: 50, objectFit: "contain" }} />
        ) : <span />}
        <div style={{ minHeight: 22 }}><span>Date:</span></div>
      </div>

      {/* Salutation (To + address + Dear) */}
      {s.salutation !== false && (
        <div style={{ marginTop: 4 }}>
          <div>To,</div>
          <div>{candidate.full_name || "Candidate Name"}</div>
          <div>{candidate.address || "Address Line"}</div>
          <p style={{ marginTop: 8 }}>
            Dear <b>{candidate.full_name || "Candidate Name"}</b>,
          </p>
        </div>
      )}

      {/* Intro (HTML) */}
      <div
        dangerouslySetInnerHTML={{
          __html: c.intro || "",
        }}
      />

      {/* Job details as definition-list style */}
      {s.jobDetails !== false && (
        <div style={{ marginTop: 8 }}>
          <p style={{ margin: 0 }}>
            <b>Job Title:</b> {"{{job.position}}"}
          </p>
          <p style={{ margin: 0 }}>
            <b>Location:</b> {"{{job.location_name}}"}
          </p>
          <p style={{ margin: 0 }}>
            <b>Gross Salary:</b> {"{{job.salary}}"}
          </p>
        </div>
      )}

      {/* Terms */}
      {s.terms !== false && (
        <div
          style={{ marginTop: 8 }}
          dangerouslySetInnerHTML={{
            __html: c.termsHtml || "",
          }}
        />
      )}

      {/* Signature centered with logo below */}
      {s.signature !== false && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <div>{template.fields?.hrName || "HR Name"}</div>
          <div>Bank of Baroda</div>
        </div>
      )}

      {/* Bottom logo (if provided) */}
      {/* {s.header && b.logoUrl ? (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <img src={b.logoUrl} alt="logo" style={{ height: 56, objectFit: "contain" }} />
        </div>
      ) : null} */}
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

  // Watermark (centered)
  const wmSize = Number(b.backgroundLogoSizePx) || 160;
  const wmOpacity =
    b.backgroundLogoOpacity != null ? Number(b.backgroundLogoOpacity) : 0.12;

  return (
    <div
      id="offer-preview"
      style={{
        position: "relative",
        background: "#fff",
        minHeight: 1123,
        margin: 24,
        padding: 24,
        overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
      }}
    >
      {/* Watermark overlay (centered) */}
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
            style={{
              width: wmSize,
              height: wmSize,
              opacity: wmOpacity,
              objectFit: "contain",
            }}
          />
        </div>
      ) : null}

      {/* Content wrapper above watermark */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {layout === "template1" && (
          <Template1 template={template} candidate={candidate} s={s} c={c} b={b} />
        )}
        {layout === "template2" && (
          <Template2 template={template} candidate={candidate} s={s} c={c} b={b} />
        )}
        {layout === "template3" && (
          <Template3 template={template} candidate={candidate} s={s} c={c} b={b} />
        )}
      </div>
    </div>
  );
}
