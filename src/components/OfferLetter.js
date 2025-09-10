// OfferLetter.jsx
import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import "../css/OfferLetter.css";
import logo from '../assets/pdflogo.png';
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
  ...props
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    address1: '',
    address2: '',
    position_title: jobPosition || '',
    companyName: 'Bank of Baroda',
    joiningDate: '',            // will resolve below
    location: '',
    reportingManager: 'John Doe',
    grossAnnual: '',
    hrName: 'HR Department',
  });

  const [logoLoaded, setLogoLoaded] = useState(false);
  const [templateHtml, setTemplateHtml] = useState('');
  const offerLetterRef = useRef(null);

  // Seed formData from candidate + props, preferring provided joiningDate
  useEffect(() => {
    if (!candidate) return;

    const addressParts = candidate.address?.split(',') || [];
    // Prefer the prop; fallback to +15 days from today in YYYY-MM-DD
    let resolvedJoiningDate = joiningDate;
    if (!resolvedJoiningDate) {
      const d = new Date();
      d.setDate(d.getDate() + 15);
      // en-CA ensures YYYY-MM-DD
      resolvedJoiningDate = d.toLocaleDateString('en-CA');
    }

    const location = candidate.location_details
      ? Object.values(candidate.location_details).join(', ')
      : '';

    setFormData(prev => ({
      ...prev,
      full_name: candidate.full_name || '',
      address1: addressParts[0]?.trim() || '',
      address2: addressParts.slice(1).join(',').trim() || '',
      position_title: jobPosition || '',
      companyName: 'Bank of Baroda',
      joiningDate: resolvedJoiningDate,
      location,
      reportingManager: prev.reportingManager || 'John Doe',
      grossAnnual: salary,
      hrName: prev.hrName || 'HR Department',
    }));
  }, [candidate, jobPosition, salary, reqId, joiningDate]);

  // Load selected HTML template and merge placeholders
  useEffect(() => {
    let abort = false;

    async function loadTemplate() {
      if (!templateUrl) {
        setTemplateHtml('');
        return;
      }
      try {
        const res = await fetch(templateUrl, { headers: { 'Accept': 'text/html' } });
        if (!res.ok) throw new Error(`Template HTTP ${res.status}`);
        const html = await res.text();
        if (abort) return;

        const merged = mergeTemplateSmart(
          html,
          buildValueMap({ formData, reqId })
        );
        setTemplateHtml(merged);

        // ensure autoDownload not blocked by image in fallback JSX
        setLogoLoaded(true);
      } catch (e) {
        console.error('Template load error:', e);
        setTemplateHtml(''); // fallback to JSX
      }
    }

    loadTemplate();
    return () => { abort = true; };
  }, [templateUrl, formData, reqId]);

  // Auto-download after ready
  useEffect(() => {
    if (
      autoDownload &&
      candidate &&
      candidate.candidate_id &&
      formData.full_name &&
      formData.grossAnnual &&
      logoLoaded
    ) {
      const t = setTimeout(() => {
        handleDownload();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [autoDownload, candidate, formData, logoLoaded]);

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const handleDownload = async () => {
    const element = offerLetterRef.current;
    if (!element || !candidate?.candidate_id) {
      console.error("Missing DOM element or candidate ID.");
      return;
    }

    const candidateId = candidate.candidate_id;
    const filename = `Offer_Letter_${candidateId}_${new Date().toISOString()}.pdf`;

    const opt = {
      margin: 0.5,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      const fd = new FormData();
      fd.append("pdfFile", file, filename);
      fd.append("candidateId", String(candidateId));

      const data = await apiService.uploadOfferLetter(fd);

      const publicUrl =
        data?.data?.public_url ||
        data?.public_url ||
        null;

      if (!publicUrl) throw new Error("Public URL not found in upload response.");

      onDownloadComplete?.({ public_url: publicUrl });
    } catch (error) {
      console.error("Upload/Download error:", error);
      alert("Failed to upload and open PDF.");
    }
  };

  // ===== Helpers =====
  function safe(v) { return (v ?? '').toString(); }
  function formatINR(v) {
    const n = Number(v || 0);
    return `₹ ${n.toLocaleString('en-IN')}`;
  }
  function extractCoreKey(s) {
    const parts = (s || '').toString().split('.');
    return parts[parts.length - 1] || '';
  }
  function normalizeKey(s) {
    return (s || '')
      .toString()
      .toLowerCase()
      .replace(/[\s._-]+/g, '');
  }

  function buildValueMap({ formData, reqId }) {
    const base = {
      full_name: safe(formData.full_name),
      address1: safe(formData.address1),
      address2: safe(formData.address2),
      position_title: safe(formData.position_title),
      company_name: safe(formData.companyName || 'Bank of Baroda'),
      joining_date: safe(formData.joiningDate),
      location: safe(formData.location),
      reporting_manager: safe(formData.reportingManager || 'John Doe'),
      gross_annual: formatINR(formData.grossAnnual),
      req_id: safe(reqId),
      today: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      hr_name: safe(formData.hrName || 'HR Department'),
    };

    const aliases = {
      // full name
      fullname: base.full_name,
      name: base.full_name,
      candidate: base.full_name,
      candidatename: base.full_name,

      // addresses
      addressline1: base.address1,
      addressline2: base.address2,

      // position
      jobtitle: base.position_title,
      position: base.position_title,
      jobposition: base.position_title,
      role: base.position_title,
      positiontitle: base.position_title,

      // company
      company: base.company_name,
      employer: base.company_name,
      organization: base.company_name,
      organisation: base.company_name,
      companyname: base.company_name,

      // joining date
      doj: base.joining_date,
      dateofjoining: base.joining_date,
      joining: base.joining_date,
      joiningdate: base.joining_date,

      // salary / CTC
      salary: base.gross_annual,
      grosssalary: base.gross_annual,
      ctc: base.gross_annual,
      annualsalary: base.gross_annual,
      annualctc: base.gross_annual,
      package: base.gross_annual,
      grossannual: base.gross_annual,

      // location
      joblocation: base.location,
      worklocation: base.location,

      // manager
      manager: base.reporting_manager,
      managername: base.reporting_manager,
      reportingto: base.reporting_manager,

      // req id
      requisitionid: base.req_id,
      reqid: base.req_id,

      // today
      date: base.today,
      currentdate: base.today,

      // hr name
      hrname: base.hr_name,
    };

    const finalMap = {};
    Object.entries(base).forEach(([k, v]) => { finalMap[normalizeKey(k)] = v; });
    Object.entries(aliases).forEach(([k, v]) => { finalMap[normalizeKey(k)] = v; });
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
      unmatched.add(raw.trim());
      return m; // leave token as-is if not matched
    });

    if (unmatched.size) {
      console.warn('[OfferLetter] Unmapped template tokens:', Array.from(unmatched).join(', '));
    }
    return out;
  }

  // ===== Render =====
  return (
    <>
      {templateHtml ? (
        // TEMPLATE MODE
        <div className='offer-letter-container' ref={offerLetterRef}>
          <div dangerouslySetInnerHTML={{ __html: templateHtml }} />
        </div>
      ) : (
        // FALLBACK JSX (used if no template or template fetch fails)
        <div className='offer-letter-container' ref={offerLetterRef}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <img
              src={logo}
              alt="Company Logo"
              onLoad={() => setLogoLoaded(true)}
              style={{ width: '100%', height: '120px', objectFit: 'contain' }}
            />
          </div>

          <p style={{ textAlign: 'right' }}>Date: {today}</p>
          <p>
            To,<br />
            {formData.full_name}<br />
            {formData.address1}<br />
            {formData.address2}
          </p>

          <p><strong>Subject: Offer of Employment</strong></p>
          <p>Dear <b>{formData.full_name}</b>,</p>
          <p>
            We are pleased to offer you the position of <b>{formData.position_title}</b> at <b>{formData.companyName}</b>.
            Your expected date of joining will be <b>{formData.joiningDate}</b>.
            The terms and conditions of your employment are as follows:
          </p>

          <ul>
            <li><strong>Job Title:</strong> {formData.position_title}</li>
            <li><strong>Location:</strong> {formData.location}</li>
            <li>
              <strong>Gross Salary:</strong> {formatINR(formData.grossAnnual)}
            </li>
          </ul>

          <p>This offer is subject to successful completion of all background checks.</p>

          <p>Sincerely,</p>
          <p>
            {formData.hrName}<br />
            {formData.companyName}
          </p>
        </div>
      )}
    </>
  );
};

export default OfferLetter;
