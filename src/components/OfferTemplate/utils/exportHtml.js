// src/components/OfferTemplate/utils/exportHtml.js

const wrapHtmlDoc = (body, title = "Offer Template", metaJSON = "{}") => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root { color-scheme: light; }
    body { font-family: Arial, sans-serif; line-height: 1.45; margin: 0; padding: 0; color: #111; }
    .offer-page { position: relative; background:#fff; margin: 24px; padding: 24px; min-height: 820px; }
    .offer-content { position: relative; z-index: 2; }
    .offer-bg { position: absolute; inset: 0; display:flex; justify-content: center; align-items: center; z-index: 1; pointer-events: none; }
    .text-right { text-align: right; }
    .mb-2 { margin-bottom: 8px; }
    .mt-2 { margin-top: 8px; }
    .mt-4 { margin-top: 16px; }
    ul { padding-left: 18px; }
    img.logo { height: 80px; object-fit: contain; }
    .header { display:flex; align-items:center; justify-content:center; margin-bottom: 8px; }
    #salutation{color:#162b75;}
  </style>
</head>
<body>
  <!-- Template Studio Metadata (do not remove) -->
  <script id="tpl-meta" type="application/json">${metaJSON}</script>
  ${body}
</body>
</html>`;

export function buildHtmlForExport(tpl, layout) {
  const t = tpl || {};
  const s = t.sections || {};
  const c = t.content || {};
  const b = t.branding || {};

  const wmSize = Number(b.backgroundLogoSizePx) || 160;
  const wmOpacity = b.backgroundLogoOpacity != null ? Number(b.backgroundLogoOpacity) : 0.12;

  const watermark = b.backgroundLogoUrl
    ? `
    <div class="offer-bg" aria-hidden="true">
      <img src="${b.backgroundLogoUrl}" alt=""
           style="width:${wmSize}px;height:${wmSize}px;opacity:${wmOpacity};object-fit:contain;" />
    </div>`
    : "";

  // Mark each logical block with an id so we can extract it on reload
  const date = `<div id="date-line" class="text-right">Date: {{fields.letterDate}}</div>`;
  const salutation = s.salutation ? `
    <div id="salutation" class="mt-2">
      <div>To,</div>
      <div>{{candidate.full_name}}</div>
      <div>{{candidate.address}}</div>
      <p class="mt-2">Dear <b>{{candidate.full_name}}</b>,</p>
    </div>` : "";
  const subject = c.subject ? `<p id="subject" class="subject" style="text-align:center; "><strong>${c.subject}</strong></p>` : "";
  const intro = `<div id="intro" class="intro">${c.intro || ""}</div>`;
  const terms = s.terms ? `<div id="terms" class="terms">${c.termsHtml || ""}</div>` : "";
  const signature = s.signature ? `
    <div id="signature" class="signature">
      <p class="mt-4">
        {{fields.hrName}}<br/>
        {{fields.companyName}}
      </p>
    </div>` : "";

  let body = "";

  if (layout === "template1") {
    body = `
      ${date}
      ${salutation}
      ${subject}
      ${intro}
      <ul id="job-details" class="job-details">
        <li><b>Job Title:</b> {{job.position}}</li>
        <li><b>Location:</b> {{job.location_name}}</li>
        <li><b>Gross Salary:</b> {{job.salary}}</li>
      </ul>
      ${terms}
      ${signature}
    `;
  } else if (layout === "template2") {
    body = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        ${b.logoUrl ? `<img src="${b.logoUrl}" class="logo" style="height:64px;object-fit:contain" />` : ""}
        ${date}
      </div>
      ${subject}
      ${salutation}
      ${intro}
      <div id="job-details" class="job-details" style="display:grid;grid-template-columns:180px 1fr;gap:6px;">
        <div><b>Job Title:</b></div><div>{{job.position}}</div>
        <div><b>Location:</b></div><div>{{job.location_name}}</div>
        <div><b>Gross Salary:</b></div><div>{{job.salary}}</div>
      </div>
      ${terms}
      <div style="text-align:right">${signature}</div>
    `;
  } else { // template3
    body = `
      ${subject}
      <div style="display:flex;justify-content:space-between;align-items:center;">
        ${b.logoUrl ? `<img src="${b.logoUrl}" class="logo" style="height:50px;object-fit:contain" />` : ""}
        ${date}
      </div>
      ${salutation}
      ${intro}
      <div id="job-details" class="job-details">
        <p><b>Job Title:</b> {{job.position}}</p>
        <p><b>Location:</b> {{job.location_name}}</p>
        <p><b>Gross Salary:</b> {{job.salary}}</p>
      </div>
      ${terms}
      <div style="text-align:center">${signature}</div>
    `;
  }

  // Embed metadata so we can round-trip exactly
  const meta = {
    templateName: t.templateName || "Offer Template",
    layout,
    branding: {
      logoUrl: b.logoUrl || "",
      backgroundLogoUrl: b.backgroundLogoUrl || "",
      backgroundLogoSizePx: Number(b.backgroundLogoSizePx) || 120,
      backgroundLogoOpacity: b.backgroundLogoOpacity != null ? Number(b.backgroundLogoOpacity) : 0.06,
    },
    sections: {
      header: !!s.header,
      salutation: !!s.salutation,
      jobDetails: !!s.jobDetails,
      // compensation: !!s.compensation,
      terms: !!s.terms,
      signature: !!s.signature,
      // footer: !!s.footer,
    },
    fields: t.fields || {},
    content: {
      subject: c.subject || "",
      intro: c.intro || "",
      termsHtml: c.termsHtml || "",
      signature: c.signature || "",
    },
  };

  return wrapHtmlDoc(
    `<div class="offer-page">${watermark}<div class="offer-content">${body}</div></div>`,
    t.templateName || "Offer Template",
    JSON.stringify(meta)
  );
}
