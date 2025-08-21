// OfferModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import OfferLetter from './OfferLetter';
import html2pdf from 'html2pdf.js';

// ===== API base (local dev) =====
const API_BASE = 'http://localhost:5000';
const TEMPLATE_API = `${API_BASE}/api/offer-templates`;
const OFFER_PDF_UPLOAD_URL = `${API_BASE}/api/offer-letters/upload`;

// ===== helpers (tokens + context) =====
const formatINR = (v) => {
  const n = Number(v);
  return Number.isNaN(n)
    ? (v ?? '')
    : n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
};

const replaceTokens = (tpl, ctx) => {
  const get = (obj, path) => path.split('.').reduce((a, k) => (a ? a[k] : ''), obj);
  return (tpl || '').replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, p) => {
    const key = p.trim();
    const val = get(ctx, key);
    return (val ?? '').toString();
  });
};

const extractBodyHtml = (html) => {
  if (!html) return '';
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return m ? m[1] : html; // if full document provided, use body; else use as-is
};

const buildContext = ({ candidate, position_title, salary }) => {
  const today = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });

  // candidate pieces
  const cand = {
    full_name: candidate?.full_name || '',
    address1: (candidate?.address || '').split(',')[0]?.trim() || '',
    address2: (candidate?.address || '').split(',').slice(1).join(',').trim() || '',
    location:
      candidate?.location ||
      [candidate?.location_details?.city, candidate?.location_details?.state, candidate?.location_details?.country, candidate?.location_details?.pincode]
        .filter(Boolean).join(', ')
  };

  // job pieces
  const job = {
    position: position_title || '',
    salary: salary,
    salary_inr: formatINR(salary)
  };

  // fields base (empty by default; tokens will resolve later)
  const fieldsBase = {
    companyName: '',
    companyAddress: '',
    hrName: '',
    hrTitle: '',
    reportingManager: '',
    dateFormat: 'dd MMM yyyy',
    joiningDatePlusDays: 15,
    joiningDateManual: '',
    positionTitle: '{{job.position}}',
    location: '{{candidate.location}}',
    grossAnnual: '{{job.salary_inr}}'
  };

  // Resolve computed joining date or manual
  const computeJoiningDate = (plusDays) => {
    const d = new Date();
    d.setDate(d.getDate() + (Number(plusDays) || 0));
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD for consistency
  };

  // resolve tokenized fields AFTER base ctx assembled
  const baseCtx = { today, candidate: cand, job, fields: fieldsBase };

  const replaceTokensInField = (tpl) =>
    (tpl || '').replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, p) => {
      const get = (obj, path) => path.split('.').reduce((a, k) => (a ? a[k] : ''), obj);
      return (get(baseCtx, p.trim()) ?? '').toString();
    });

  const joiningDate = fieldsBase.joiningDateManual
    ? fieldsBase.joiningDateManual
    : computeJoiningDate(fieldsBase.joiningDatePlusDays);

  const fields = {
    ...fieldsBase,
    joiningDate,
    positionTitle: replaceTokensInField(fieldsBase.positionTitle),
    location: replaceTokensInField(fieldsBase.location),
    grossAnnual: replaceTokensInField(fieldsBase.grossAnnual)
  };

  return { today, candidate: cand, job, fields };
};

// ===== component =====
const OfferModal = ({
  show,
  handleClose,
  candidate,
  position_title,
  reqId,
  salary,
  setSalary,
  position_id,
  handleOffer,
  offerLetterPath,
  setOfferLetterPath
}) => {
  const [showPreview, setShowPreview] = useState(false);

  // server templates
  const [templates, setTemplates] = useState([]); // [{id,name,path}]
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState('');

  const [selectedTemplateId, setSelectedTemplateId] = useState(''); // none by default
  const [templateHtmlRaw, setTemplateHtmlRaw] = useState('');       // raw fetched (could be full HTML doc)
  const [templateHtmlLoading, setTemplateHtmlLoading] = useState(false);

  const canProceed = !!(salary && candidate && position_id);

  // load templates list from backend when modal opens
  useEffect(() => {
    if (!show) return;
    (async () => {
      try {
        setTemplatesLoading(true);
        setTemplatesError('');
        const res = await fetch(TEMPLATE_API, { credentials: 'same-origin' });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load templates');
        setTemplates(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setTemplates([]);
        setTemplatesError(e.message || 'Failed to load templates');
      } finally {
        setTemplatesLoading(false);
      }
    })();
  }, [show]);

  // fetch selected template HTML
   useEffect(() => {
    (async () => {
      setTemplateHtmlRaw('');
      if (!selectedTemplateId) return;
      try {
        setTemplateHtmlLoading(true);
        // fetch via our backend to avoid CDN/CORS/404 issues
        const url = `${TEMPLATE_API}/${encodeURIComponent(selectedTemplateId)}/content`;
        const res = await fetch(url, { credentials: 'same-origin' });
        if (!res.ok) throw new Error(`Failed to fetch template (${res.status})`);
        const html = await res.text();
        setTemplateHtmlRaw(html || '');
      } catch (e) {
        console.error('Failed to fetch template HTML', e);
        setTemplateHtmlRaw('');
      } finally {
        setTemplateHtmlLoading(false);
      }
    })();
  }, [selectedTemplateId]);

  // Build context and filled HTML
  const ctx = useMemo(
    () => buildContext({ candidate, position_title, salary }),
    [candidate, position_title, salary]
  );

  const filledHtml = useMemo(() => {
    if (!templateHtmlRaw) return '';
    const bodyHtml = extractBodyHtml(templateHtmlRaw);
    return replaceTokens(bodyHtml, ctx);
  }, [templateHtmlRaw, ctx]);

  // Preview + PDF download
  const handlePreviewClick = () => setShowPreview(true);

  const handleDownloadPdf = async () => {
    const el = document.getElementById('offer-preview');
    if (!el) return;
    const filename = `Offer_Letter_${candidate?.candidate_id || 'candidate'}_${new Date()
      .toISOString()
      .replace(/[:]/g, '-')}.pdf`;
    const opt = {
      margin: 0.5,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().from(el).set(opt).save();
  };

  // Send Offer -> generate PDF (from preview DOM) -> upload -> call parent handler
  const sendOffer = async () => {
    if (!candidate?.candidate_id) {
      alert('Missing candidate ID');
      return;
    }
    const el = document.getElementById('offer-preview');
    if (!el) {
      alert('Preview not ready');
      return;
    }

    const filename = `Offer_Letter_${candidate.candidate_id}_${new Date()
      .toISOString()
      .replace(/[:]/g, '-')}.pdf`;

    const opt = {
      margin: 0.5,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
      // make PDF blob (no save dialog)
      const pdfBlob = await html2pdf().from(el).set(opt).output('blob');

      // upload to backend
      const fd = new FormData();
      fd.append('pdfFile', new File([pdfBlob], filename, { type: 'application/pdf' }));
      fd.append('candidateId', candidate.candidate_id);

      const res = await fetch(OFFER_PDF_UPLOAD_URL, {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok || !data?.public_url) {
        console.error('Upload failed:', data);
        alert(data?.error || 'Failed to upload PDF');
        return;
      }

      // keep your existing flow
      setOfferLetterPath?.(data.public_url);
      handleOffer?.(data.public_url);
    } catch (err) {
      console.error(err);
      alert('Failed to prepare or upload PDF');
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg" className="fontinter">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "18px", color: ' #FF7043 ' }}>Offer Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Offer Template</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  disabled={templatesLoading || !!templatesError}
                >
                  <option value="">(Use current static template)</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Form.Select>
                {templatesLoading && <Spinner animation="border" size="sm" />}
              </div>
              {templatesError && (
                <div className="text-danger small mt-1">{templatesError}</div>
              )}
              {templateHtmlLoading && selectedTemplateId && (
                <div className="text-muted small mt-1">Loading template…</div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Candidate Name</Form.Label>
              <Form.Control type="text" value={candidate?.full_name || ''} readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Job Position</Form.Label>
              <Form.Control type="text" value={position_title || ''} readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Requisition ID</Form.Label>
              <Form.Control type="text" value={reqId || ''} readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Salary (INR)</Form.Label>
              <Form.Control
                type="number"
                inputMode="numeric"
                value={salary ?? ''}
                onChange={(e) => setSalary(e.target.value)}
                min="0"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={() => setShowPreview(true)} disabled={!canProceed}>
            Preview
          </Button>
          <Button variant="primary" onClick={handleDownloadClick}>
            Download
          </Button>
          <Button variant="primary" onClick={handleDownloadClick} disabled={!salary || !candidate || !position_id} style={{ backgroundColor: "#FF7043", borderColor: "#FF7043" ,color: "#fff"}}>
            Preview & Download
          </Button>
          <Button
            variant="primary"
            onClick={() => handleOffer(offerLetterPath)} // Pass the valid state to the handler
            disabled={!salary || !candidate || !position_id} style={{ backgroundColor: "#FF7043", borderColor: "#FF7043", color: "#fff" }}
          >
            Send Offer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Preview modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Offer Letter Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {filledHtml ? (
            <div id="offer-preview" dangerouslySetInnerHTML={{ __html: filledHtml }} />
          ) : (
            <OfferLetter
              candidate={candidate}
              jobPosition={position_title}
              salary={salary}
              reqId={reqId}
              autoDownload={false}
              onDownloadComplete={() => {}}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleDownloadPdf}>
            Download PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OfferModal;
