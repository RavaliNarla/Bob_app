import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
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
  templateUrl, // <-- pass /offer-templates/:id/content from the modal
  ...props
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    address1: '',
    address2: '',
    position_title: jobPosition || '',
    companyName: '',
    joiningDate: '',
    location: '',
    reportingManager: '',
    grossAnnual: '',
    hrName: '',
  });

  const [logoLoaded, setLogoLoaded] = useState(false);
  const [templateHtml, setTemplateHtml] = useState('');
  const offerLetterRef = useRef(null);

  useEffect(() => {
    if (candidate) {
      const addressParts = candidate.address?.split(',') || [];
      const joiningDate = new Date();
      joiningDate.setDate(joiningDate.getDate() + 15);
      const joiningDateString = joiningDate.toLocaleDateString('en-CA');
      const location = candidate.location_details
        ? Object.values(candidate.location_details).join(', ')
        : '';

      setFormData(prev => ({
        ...prev,
        full_name: candidate.full_name,
        address1: addressParts[0]?.trim() || '',
        address2: addressParts.slice(1).join(',').trim() || '',
        position_title: jobPosition || '',
        companyName: 'Bank of Baroda',
        joiningDate: joiningDateString,
        location,
        reportingManager: 'John Doe',
        grossAnnual: salary,
        hrName: 'HR Department',
      }));
    }
  }, [candidate, jobPosition, salary, reqId]);

  // Load selected template (if provided) and merge placeholders
  useEffect(() => {
    let abort = false;

    async function loadTemplate() {
      if (!templateUrl) {
        setTemplateHtml('');
        return; // fallback to built-in JSX below
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

        // Ensure autoDownload isn’t blocked waiting for <img> in fallback JSX
        setLogoLoaded(true);
      } catch (e) {
        console.error('Template load error:', e);
        setTemplateHtml(''); // fallback JSX will render
      }
    }

    loadTemplate();
    return () => { abort = true; };
  }, [templateUrl, formData, reqId]);

  // Auto-download once DOM (+logo or template) is ready
  useEffect(() => {
    if (
      autoDownload &&
      candidate &&
      candidate.candidate_id &&
      formData.full_name &&
      formData.location &&
      formData.grossAnnual &&
      logoLoaded
    ) {
      const timer = setTimeout(() => {
        handleDownload();
      }, 600);
      return () => clearTimeout(timer);
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
      filename: filename,
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
      fd.append("candidateId", candidateId);

      const data = await apiService.uploadOfferLetter(fd);

      if (data?.data?.public_url) {
        onDownloadComplete?.({ public_url: data.data.public_url });
      } else if (data?.public_url) {
        onDownloadComplete?.({ public_url: data.public_url });
      } else {
        throw new Error("Public URL not found in upload response.");
      }
    } catch (error) {
      console.error("Upload/Download error:", error);
      alert("Failed to upload and open PDF.");
    }
  };

  // ========= Helpers =========
  function safe(v) { return (v ?? '').toString(); }
  function formatINR(v) {
    const n = Number(v || 0);
    return `₹ ${n.toLocaleString('en-IN')}`;
  }

  // Take the rightmost segment after a dot. E.g. "candidate.full_name" -> "full_name"
  // "fields.positionTitle" -> "positionTitle"
  function extractCoreKey(s) {
    const parts = (s || '').toString().split('.');
    return parts[parts.length - 1] || '';
  }

  // Normalize keys: lowercase and remove spaces/._-
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

    // Aliases (to support camelCase and common wording in templates)
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
      positiontitle: base.position_title, // camelCase alias support

      // company
      company: base.company_name,
      employer: base.company_name,
      organization: base.company_name,
      organisation: base.company_name,
      companyname: base.company_name, // camelCase alias support

      // joining date
      doj: base.joining_date,
      dateofjoining: base.joining_date,
      joining: base.joining_date,
      joiningdate: base.joining_date, // camelCase alias support

      // salary
      salary: base.gross_annual,
      grosssalary: base.gross_annual,
      ctc: base.gross_annual,
      annualsalary: base.gross_annual,
      annualctc: base.gross_annual,
      package: base.gross_annual,
      grossannual: base.gross_annual, // camelCase alias support

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

  // Replace all {{ ... }}:
  //  1) extract rightmost segment after dot (handles "candidate.full_name", "fields.positionTitle")
  //  2) normalize and match using valuesMap + aliases
  function mergeTemplateSmart(html, valuesMap) {
    if (!html) return html;
    const tokenRegex = /{{\s*([^}]+?)\s*}}/g;
    const unmatched = new Set();

    const out = html.replace(tokenRegex, (m, raw) => {
      const core = extractCoreKey(raw);       // strip prefixes like "candidate.", "fields."
      const norm = normalizeKey(core);        // lowercase, remove spaces/._-
      if (norm in valuesMap) return valuesMap[norm];
      unmatched.add(raw.trim());
      return m; // leave token as-is if not matched
    });

    if (unmatched.size) {
      console.warn('[OfferLetter] Unmapped template tokens:', Array.from(unmatched).join(', '));
    }
    return out;
  }

  // ========= Render =========
  return (
    <>
      {templateHtml ? (
        // TEMPLATE MODE: render merged HTML
        <div className='offer-letter-container' ref={offerLetterRef}>
          <div dangerouslySetInnerHTML={{ __html: templateHtml }} />
        </div>
      ) : (
        // FALLBACK: your original static JSX (unchanged)
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
            We are pleased to offer you the position of <b>{formData.position_title}</b> at <b>Bank of Baroda</b>.
            Your expected date of joining will be <b>{formData.joiningDate}</b>.
            The terms and conditions of your employment are as follows:
          </p>

          <ul>
            <li><strong>Job Title:</strong> {formData.position_title}</li>
            <li><strong>Location:</strong> {formData.location}</li>
            <li>
              <strong>Gross Salary:</strong>{" "}
              ₹ {Number(formData.grossAnnual || 0).toLocaleString("en-IN")}
            </li>
          </ul>

          <p>This offer is subject to successful completion of all background checks.</p>

          <p>Sincerely,</p>
          <p>
            {formData.hrName || 'HR Department'}<br />
            Bank of Baroda
          </p>
        </div>
      )}
    </>
  );
};

export default OfferLetter;
