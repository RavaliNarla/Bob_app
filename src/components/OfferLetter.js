// OfferLetter.jsx
import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import "../css/OfferLetter.css";
import apiService from '../services/apiService';

const OfferLetter = ({
  candidate,
  jobPosition,
  salary,
  reqId,
  autoDownload = false,
  onDownloadComplete,
  templateUrl,    // e.g. /api/offer-templates/:id/content
  joiningDate,    // YYYY-MM-DD from OfferModal
  companyName,    // optional override (used if template/props lack it)
  hrName,         // optional override (used if template/props lack it)
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    address1: '',
    address2: '',
    position_title: jobPosition || '',
    companyName: companyName || '',
    joiningDate: '',
    location: '',
    reportingManager: '',
    grossAnnual: '',
    hrName: hrName || '',
    reqId: reqId || '',
  });

  const [branding, setBranding] = useState({
    logoUrl: '',
    backgroundLogoUrl: '',
    backgroundLogoSizePx: 120,
    backgroundLogoOpacity: 0.06,
  });

  // 🔹 NEW: keep fields that were filled & saved in the Template Editor (from tpl-meta)
  const [templateFields, setTemplateFields] = useState({});

  const [templateHtml, setTemplateHtml] = useState('');
  const [assetsReady, setAssetsReady] = useState(false);
  const offerLetterRef = useRef(null);

  // ---------- seed form data ----------
  useEffect(() => {
    if (!candidate) return;

    const addressParts = (candidate.address || '').split(',');
    let resolvedJoiningDate = joiningDate;
    if (!resolvedJoiningDate) {
      const d = new Date();
      d.setDate(d.getDate() + 15);
      resolvedJoiningDate = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    }

    const location =
      candidate.location_details
        ? Object.values(candidate.location_details).join(', ')
        : (candidate.location || '');

    setFormData(prev => ({
      ...prev,
      full_name: candidate.full_name || '',
      address1: addressParts[0]?.trim() || '',
      address2: addressParts.slice(1).join(',').trim() || '',
      position_title: jobPosition || '',
      companyName: prev.companyName || companyName || '',
      joiningDate: resolvedJoiningDate,
      location,
      reportingManager: prev.reportingManager || '',
      grossAnnual: salary,
      hrName: prev.hrName || hrName || '',
      reqId: reqId || '',
    }));
  }, [candidate, jobPosition, salary, reqId, joiningDate, companyName, hrName]);

  // ---------- fetch template & merge + inject branding ----------
  useEffect(() => {
    let abort = false;

    (async () => {
      if (!templateUrl) { setTemplateHtml(''); return; }
      try {
        const res = await fetch(templateUrl, { headers: { Accept: 'text/html' } });
        if (!res.ok) throw new Error(`Template HTTP ${res.status}`);
        const html = await res.text();
        if (abort) return;

        // parse meta (branding + fields) if present
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const metaEl = parsed.querySelector('script#tpl-meta[type="application/json"]');

        let tplFields = {};
        if (metaEl?.textContent) {
          try {
            const meta = JSON.parse(metaEl.textContent);

            // 🔹 capture fields the user filled in Template Editor
            tplFields = meta?.fields || {};
            setTemplateFields(tplFields);

            // branding
            const b = meta?.branding || {};
            setBranding({
              logoUrl: b.logoUrl || '',
              backgroundLogoUrl: b.backgroundLogoUrl || '',
              backgroundLogoSizePx: Number(b.backgroundLogoSizePx ?? 120),
              backgroundLogoOpacity: Number(b.backgroundLogoOpacity ?? 0.06),
            });
          } catch {
            // ignore bad meta
          }
        }

        // merge tokens (prefer template fields → then props → then static)
        const merged = mergeTemplateSmart(html, buildValueMap({ formData, templateFields: tplFields }));

        // ensure branding (header logo + watermark) is in the DOM
        const withBranding = applyBrandingToHtml(merged, branding);

        setTemplateHtml(withBranding);

        // preload images so html2pdf catches them
        await preloadBrandingAssets(branding);
        setAssetsReady(true);
      } catch (e) {
        console.error('Template load error:', e);
        setTemplateHtml(''); // fallback JSX
        setAssetsReady(true);
      }
    })();

    return () => { abort = true; };
    // include branding so updates re-apply
  }, [
    templateUrl,
    formData,
    branding.logoUrl,
    branding.backgroundLogoUrl,
    branding.backgroundLogoOpacity,
    branding.backgroundLogoSizePx,
  ]);

  // ---------- auto download when ready ----------
  useEffect(() => {
    if (
      autoDownload &&
      candidate?.candidate_id &&
      formData.full_name &&
      formData.grossAnnual &&
      assetsReady
    ) {
      const t = setTimeout(() => { handleDownload(); }, 600);
      return () => clearTimeout(t);
    }
  }, [autoDownload, candidate, formData, assetsReady]);

  const todayLong = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleDownload = async () => {
    const element = offerLetterRef.current;
    if (!element || !candidate?.candidate_id) return;

    const candidateId = candidate.candidate_id;
    const filename = `Offer_Letter_${candidateId}_${new Date().toISOString()}.pdf`;

    const opt = {
      margin: 0.5,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    try {
      const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      const fd = new FormData();
      fd.append('pdfFile', file, filename);
      fd.append('candidateId', String(candidateId));

      const data = await apiService.uploadOfferLetter(fd);
      const publicUrl = data?.data?.public_url || data?.public_url || null;
      if (!publicUrl) throw new Error('Public URL not found in upload response.');
      onDownloadComplete?.({ public_url: publicUrl });
    } catch (err) {
      console.error('Upload/Download error:', err);
      alert('Failed to upload and open PDF.');
    }
  };

  // ---------- helpers ----------
  const safe = v => (v ?? '').toString();
  const formatINR = v => `₹ ${Number(v || 0).toLocaleString('en-IN')}`;

  const extractCoreKey = s => (s || '').toString();
  const normalizeKey = s => (s || '')
    .toString()
    .toLowerCase()
    .replace(/[\s._-]+/g, '');

  // 🔧 FIXED: Build a map that prefers fields from the saved template (tpl-meta),
  //           then falls back to values coming from OfferModal (props),
  //           then to static defaults.
  function buildValueMap({ formData, templateFields = {} }) {
    // read both camelCase and snake_case from template fields
    const hrFromTpl = (templateFields.hrName ?? templateFields.hr_name ?? '').toString().trim();
    const companyFromTpl = (templateFields.companyName ?? templateFields.company_name ?? '').toString().trim();

    const hrFinal = hrFromTpl || (formData.hrName ?? '').toString().trim() || 'HR Department';
    const companyFinal = companyFromTpl || (formData.companyName ?? '').toString().trim() || 'Company Name';

    const composedAddress = [formData.address1, formData.address2]
      .filter(Boolean)
      .map(s => String(s).trim())
      .filter(Boolean)
      .join(', ');

    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    const base = {
      full_name: safe(formData.full_name),
      address1: safe(formData.address1),
      address2: safe(formData.address2),
      address: composedAddress,

      position_title: safe(formData.position_title),
      company_name: companyFinal,         // snake_case
      companyName: companyFinal,          // camelCase
      joining_date: safe(formData.joiningDate),
      location: safe(formData.location),
      reporting_manager: safe(formData.reportingManager),
      gross_annual: formatINR(formData.grossAnnual),
      hr_name: hrFinal,                   // snake_case
      hrName: hrFinal,                    // camelCase
      req_id: safe(formData.reqId),

      today: todayStr,
    };

    // aliases used by templates
    const jobMap = {
      'job.position': base.position_title,
      'job.salary': base.gross_annual,
      'job.location_name': base.location,
    };

    const finalMap = {};

    // add base keys + normalized variants + fields.* / candidate.* helpers
    for (const [k, v] of Object.entries(base)) {
      const norm = normalizeKey(k);         // e.g. hr_name -> hrname
      finalMap[norm] = v;                   // hrname
      finalMap[k] = v;                      // hr_name / hrName
      finalMap['fields' + norm] = v;        // fieldshrname (legacy helper)
      finalMap['candidate' + norm] = v;     // candidatefull_name etc.

      // also add dotted form for fields: fields.hrName / fields.hr_name
      finalMap['fields.' + k] = v;
    }

    for (const [k, v] of Object.entries(jobMap)) {
      const norm = normalizeKey(k);         // job.position -> jobposition
      finalMap[norm] = v;                   // jobposition
      finalMap[k] = v;                      // job.position
      finalMap['job' + norm] = v;           // legacy helper
    }

    // letter date aliases used by exportHtml.js
    finalMap['fieldsletterdate'] = todayStr;
    finalMap['letterdate'] = todayStr;

    return finalMap;
  }

  function mergeTemplateSmart(html, valuesMap) {
    if (!html) return html;
    const tokenRegex = /{{\s*([^}]+?)\s*}}/g;
    const unmatched = new Set();

    const out = html.replace(tokenRegex, (m, raw) => {
      const core = extractCoreKey(raw);
      const norm = normalizeKey(core);
      if (norm in valuesMap) return valuesMap[norm];
      if (core in valuesMap) return valuesMap[core]; // exact match (e.g., fields.hrName)
      unmatched.add(raw.trim());
      return m; // leave unrecognized tokens as-is
    });

    if (unmatched.size) {
      console.warn('[OfferLetter] Unmapped tokens:', Array.from(unmatched).join(', '));
    }
    return out;
  }

  // inject branding (logo + watermark) even if missing in body at save-time
  function applyBrandingToHtml(html, b) {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // 1) ensure watermark
      if (b.backgroundLogoUrl) {
        const hasWatermark = !!doc.querySelector('.offer-bg img');
        if (!hasWatermark) {
          const page = doc.querySelector('.offer-page') || doc.body;
          const wm = doc.createElement('div');
          wm.className = 'offer-bg';
          wm.setAttribute('aria-hidden', 'true');
          wm.style.position = 'absolute';
          wm.style.inset = '0';
          wm.style.display = 'flex';
          wm.style.justifyContent = 'center';
          wm.style.alignItems = 'center';
          wm.style.pointerEvents = 'none';
          wm.style.zIndex = '1';

          const img = doc.createElement('img');
          img.src = b.backgroundLogoUrl;
          img.alt = '';
          img.style.width = (Number(b.backgroundLogoSizePx) || 120) + 'px';
          img.style.height = (Number(b.backgroundLogoSizePx) || 120) + 'px';
          img.style.opacity = (b.backgroundLogoOpacity ?? 0.06).toString();
          img.style.objectFit = 'contain';

          wm.appendChild(img);
          // wrap if missing .offer-page
          if (page.classList.contains('offer-page')) {
            page.insertBefore(wm, page.firstChild);
          } else {
            const wrapper = doc.createElement('div');
            wrapper.className = 'offer-page';
            wrapper.style.position = 'relative';
            wrapper.style.background = '#fff';
            wrapper.style.minHeight = '1123px';
            wrapper.style.margin = '24px';
            wrapper.style.padding = '24px';
            page.insertBefore(wrapper, page.firstChild);
            wrapper.appendChild(wm);
            const content = doc.querySelector('.offer-content') || page;
            wrapper.appendChild(content);
          }
        }
      }

      // 2) ensure header logo <img class="logo">
      if (b.logoUrl) {
        let logoImg = doc.querySelector('img.logo');
        if (!logoImg) {
          // insert a simple header if none exists
          const content = doc.querySelector('.offer-content') || doc.body;
          const header = doc.createElement('div');
          header.className = 'header';
          header.style.display = 'flex';
          header.style.alignItems = 'center';
          header.style.justifyContent = 'center';
          header.style.marginBottom = '8px';

          logoImg = doc.createElement('img');
          logoImg.className = 'logo';
          logoImg.src = b.logoUrl;
          logoImg.alt = 'logo';
          logoImg.style.height = '64px';
          logoImg.style.objectFit = 'contain';

          header.appendChild(logoImg);

          // insert header before date line or at the top
          const dateLine = doc.querySelector('#date-line') || content.firstChild;
          if (dateLine) {
            content.insertBefore(header, dateLine);
          } else {
            content.insertBefore(header, content.firstChild);
          }
        } else if (!logoImg.getAttribute('src')) {
          logoImg.setAttribute('src', b.logoUrl);
        }
      }

      return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    } catch (e) {
      console.warn('Branding injection failed, using original HTML:', e);
      return html;
    }
  }

  async function preloadBrandingAssets(b) {
    const tasks = [];
    const pushPreload = (src) => {
      if (!src) return;
      tasks.push(new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true); // don't block on failure
        img.crossOrigin = 'anonymous';
        img.src = src;
      }));
    };
    pushPreload(b.logoUrl);
    pushPreload(b.backgroundLogoUrl);
    if (tasks.length) {
      await Promise.race([
        Promise.all(tasks),
        new Promise(res => setTimeout(res, 1500)) // safety timeout
      ]);
    }
  }

  // ---------- render ----------
  return (
    <>
      {templateHtml ? (
        <div className='offer-letter-container' ref={offerLetterRef}>
          <div dangerouslySetInnerHTML={{ __html: templateHtml }} />
        </div>
      ) : (
        // Fallback JSX (only if template fetch fails)
        <div className='offer-letter-container' ref={offerLetterRef}>
          <p style={{ textAlign: 'right' }}>Date: {todayLong}</p>
          <p>
            To,<br />
            {formData.full_name}<br />
            {formData.address1}<br />
            {formData.address2}
          </p>

          <p><strong>Subject: Offer of Employment</strong></p>
          <p>Dear <b>{formData.full_name}</b>,</p>
          <p>
            We are pleased to offer you the position of <b>{formData.position_title}</b> at <b>{formData.companyName || 'Company Name'}</b>.
            Your expected date of joining will be <b>{formData.joiningDate}</b>.
          </p>

          <ul>
            <li><strong>Job Title:</strong> {formData.position_title}</li>
            <li><strong>Location:</strong> {formData.location}</li>
            <li><strong>Gross Salary:</strong> {`₹ ${Number(formData.grossAnnual || 0).toLocaleString('en-IN')}`}</li>
          </ul>

          <p>This offer is subject to successful completion of all background checks.</p>

          <p>Sincerely,</p>
          <p>
            {formData.hrName || 'HR Department'}<br />
            {formData.companyName || 'Company Name'}
          </p>
        </div>
      )}
    </>
  );
};

export default OfferLetter;
