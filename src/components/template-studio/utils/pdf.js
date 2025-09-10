import html2pdf from "html2pdf.js";

// simple token resolver: {{path.to.value}}
const get = (obj, path) =>
  path.split(".").reduce((a, k) => (a ? a[k] : ""), obj);

function replaceTokens(str, ctx) {
  return (str || "").replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, p) => {
    const val = get(ctx, p.trim());
    return (val ?? "").toString();
  });
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function formatINR(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return n;
  return num.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export function resolveTemplate(template, { candidate, job }) {
  const baseCtx = { candidate, job, fields: template.fields };

  const joiningDate = addDays(
    template.fields.joiningDatePlusDays || 15
  ).toLocaleDateString("en-CA"); // YYYY-MM-DD

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const fields = {
    ...template.fields,
    positionTitle: replaceTokens(template.fields.positionTitle, baseCtx),
    location: replaceTokens(template.fields.location, baseCtx),
    grossAnnual: formatINR(replaceTokens(template.fields.grossAnnual, baseCtx)),
    joiningDate,
  };

  const introHtml = replaceTokens(template.content.intro, {
    candidate,
    job,
    fields,
  });
  const termsHtml = replaceTokens(template.content.termsHtml, {
    candidate,
    job,
    fields,
  });

  return { today, fields, introHtml, termsHtml };
}

export async function generateLocalPdf() {
  // Use the preview container to render to PDF
  const container = document.getElementById("offer-preview");
  if (!container) return;

  const filename = `Offer_Letter_${Date.now()}.pdf`;
  const opt = {
    margin: 0.5,
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true }, // still supported
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  await html2pdf().from(container).set(opt).save();
}
