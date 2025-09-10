const wrapHtmlDoc = (body, title = "Offer Template") => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root { color-scheme: light; }
    body { font-family: Arial, sans-serif; line-height: 1.45; margin: 0; padding: 0; color: #111; }
    .offer-page { position: relative; background:#fff; margin: 24px; padding: 24px; min-height: 1123px; }
    .offer-content { position: relative; z-index: 2; }
    .offer-bg { position: absolute; inset: 0; display:flex; justify-content: center; align-items: center; z-index: 1; pointer-events: none; }
    .text-right { text-align: right; }
    .mb-2 { margin-bottom: 8px; }
    .mt-2 { margin-top: 8px; }
    .mt-4 { margin-top: 16px; }
    ul { padding-left: 18px; }
    img.logo { height: 80px; object-fit: contain; }
    .header { display:flex; align-items:center; justify-content:center; margin-bottom: 8px; }
  </style>
</head>
<body>${body}</body>
</html>`;

export function buildHtmlForExport(tpl) {
  const t = tpl || {};
  const s = t.sections || {};
  const c = t.content || {};
  const b = t.branding || {};

  const wmSize = Number(b.backgroundLogoSizePx) || 160;
  const wmOpacity = b.backgroundLogoOpacity != null ? Number(b.backgroundLogoOpacity) : 0.12;
  const watermark = b.backgroundLogoUrl ? `
    <div class="offer-bg" aria-hidden="true">
      <img src="${b.backgroundLogoUrl}" alt=""
           style="width:${wmSize}px;height:${wmSize}px;opacity:${wmOpacity};object-fit:contain;" />
    </div>` : "";

  const header = s.header ? `
    <div class="header mb-2">
      ${b.logoUrl ? `<img class="logo" src="${b.logoUrl}" alt="logo" />` : ""}
    </div>` : "";

  // Date comes at runtime via OfferModal
  const date = `<div class="text-right">Date: {{fields.letterDate}}</div>`;

  // "To" uses only name + single-line address
  const salutation = s.salutation ? `
    <div class="mt-2">
      <div>To,</div>
      <div>{{candidate.full_name}}</div>
      <div>{{candidate.address}}</div>
      <p class="mt-2">Dear <b>{{candidate.full_name}}</b>,</p>
    </div>` : "";

  const subject = `<p><strong>${c.subject || ""}</strong></p>`;
  const intro = c.intro || "";
  const terms = s.terms ? (c.termsHtml || "") : "";

  const jobDetails = s.jobDetails ? `
    <ul>
      <li><b>Job Title:</b> {{fields.positionTitle}}</li>
      <li><b>Location:</b> {{fields.location}}</li>
      <li><b>Gross Salary:</b> {{fields.grossAnnual}}</li>
    </ul>` : "";

  const signature = s.signature ? `
    <p class="mt-4">
      {{fields.hrName}}<br/>
      Bank of Baroda
    </p>` : "";

  const body = `
  <div class="offer-page">
    ${watermark}
    <div class="offer-content">
      ${header}
      ${date}
      ${salutation}
      ${subject}
      <div>${intro}</div>
      ${jobDetails}
      <div>${terms}</div>
      ${signature}
    </div>
  </div>`.trim();

  return wrapHtmlDoc(body, t.templateName || "Offer Template");
}