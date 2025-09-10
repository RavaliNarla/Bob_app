// OfferModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import OfferLetter from './OfferLetter';

const TEMPLATES_API = `${process.env.REACT_APP_NODE_API_URL}/offer-templates`;

// Helper: local YYYY-MM-DD (avoid timezone off-by-one)
function localISODate(date = new Date()) {
  const tz = date.getTimezoneOffset();
  const local = new Date(date.getTime() - tz * 60000);
  return local.toISOString().slice(0, 10);
}

const OfferModal = ({
  show,
  handleClose,
  candidate,
  position_title,
  reqId,
  salary,
  setSalary,
  position_id,
  handleOffer,              // expect (offerLetterUrl, joiningDate)
  offerLetterPath,          // (unused)
  setOfferLetterPath,       // (unused)
  setApiLoading
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [generatingOffer, setGeneratingOffer] = useState(false);

  // Joining Date with validation
  const [joiningDate, setJoiningDate] = useState('');
  const minDate = localISODate(); // today

  // Templates
  const [templates, setTemplates] = useState([]);
  const [tplLoading, setTplLoading] = useState(false);
  const [tplError, setTplError] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Build selected template content URL
  const selectedTemplateContentUrl = useMemo(() => {
    if (!selectedTemplateId) return '';
    return `${TEMPLATES_API}/${encodeURIComponent(selectedTemplateId)}/content`;
  }, [selectedTemplateId]);

  // Load templates whenever modal opens
  useEffect(() => {
    if (!show) return;

    const loadTemplates = async () => {
      try {
        setTplError('');
        setTplLoading(true);
        setApiLoading?.(true);

        const res = await fetch(TEMPLATES_API);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json(); // [{id,name,type,path}, ...]

        setTemplates(data || []);
        if (data?.length) {
          const stillValid = data.some(t => t.id === selectedTemplateId);
          setSelectedTemplateId(stillValid ? selectedTemplateId : data[0].id);
        } else {
          setSelectedTemplateId('');
        }
      } catch (e) {
        console.error(e);
        setTplError('Failed to load templates. Please try again.');
      } finally {
        setTplLoading(false);
        setApiLoading?.(false);
      }
    };

    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleDownloadClick = () => setShowPreview(true);

  // Called by hidden OfferLetter generator after upload
  const handleDownloadComplete = async (data) => {
    setGeneratingOffer(false);
    const url = data.public_url;
    await handleOffer(url, joiningDate); // include joining date
  };

  // Generate (hidden) and send using selected template
  const generateOfferAndSend = () => {
    if (!selectedTemplateContentUrl) return;
    setShowPreview(false);
    setGeneratingOffer(true);
  };

  // Past-date validation (covers manual typing)
  const isJoiningPast = joiningDate && joiningDate < minDate;

  // Disable actions unless all required inputs are set
  const isActionDisabled =
    !salary ||
    !joiningDate ||
    isJoiningPast ||
    !candidate ||
    !position_id ||
    !selectedTemplateId ||
    tplLoading ||
    !!tplError;

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg" className="fontinter">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "18px", color: '#FF7043' }}>Offers</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {tplError && <Alert variant="danger" className="mb-3">{tplError}</Alert>}
          <Form>
            <Form.Group className="mb-3 form45">
              <Form.Label>Candidate Name</Form.Label>
              <Form.Control type="text" value={candidate?.full_name || ''} readOnly />
            </Form.Group>

            <Form.Group className="mb-3 form45">
              <Form.Label>Job Position</Form.Label>
              <Form.Control type="text" value={position_title || ''} readOnly />
            </Form.Group>

            <Form.Group className="mb-3 form45">
              <Form.Label>Requisition ID</Form.Label>
              <Form.Control type="text" value={reqId || ''} readOnly />
            </Form.Group>

            {/* Template dropdown */}
            <Form.Group className="mb-3 form45">
              <Form.Label>Offer Template</Form.Label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Form.Select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  disabled={tplLoading}
                >
                  {tplLoading && <option>Loading templates…</option>}
                  {!tplLoading && templates.length === 0 && <option>No templates found</option>}
                  {!tplLoading && templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Form.Select>
                {tplLoading && <Spinner animation="border" size="sm" />}
              </div>
            </Form.Group>

            <Form.Group className="mb-3 form45">
              <Form.Label>Salary</Form.Label>
              <Form.Control
                type="text"
                value={salary ? `₹ ${Number(salary).toLocaleString("en-IN")}` : ""}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, "");
                  setSalary(numericValue);
                }}
              />
            </Form.Group>

            {/* Joining Date with validation */}
            <Form.Group className="mb-3 form45">
              <Form.Label>Joining Date</Form.Label>
              <Form.Control
                type="date"
                min={minDate}                     // disables past dates in picker
                value={joiningDate}
                isInvalid={!!joiningDate && isJoiningPast}
                onChange={(e) => setJoiningDate(e.target.value)} // YYYY-MM-DD
              />
              <Form.Control.Feedback type="invalid">
                Joining date cannot be earlier than today.
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleDownloadClick}
            disabled={isActionDisabled}
            style={{ backgroundColor: "#FF7043", borderColor: "#FF7043", color: "#fff" }}
          >
            Preview
          </Button>

          <Button
            variant="primary"
            onClick={generateOfferAndSend}
            disabled={isActionDisabled}
            style={{ backgroundColor: "#FF7043", borderColor: "#FF7043", color: "#fff" }}
          >
            {generatingOffer ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Generating…
              </>
            ) : (
              'Send Offer'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Hidden generator: only renders while generatingOffer is true */}
      {generatingOffer && (
        <div style={{ display: "none" }}>
          <OfferLetter
            candidate={candidate}
            jobPosition={position_title}
            salary={salary}
            joiningDate={joiningDate}                 // pass to generator
            reqId={reqId}
            templateUrl={selectedTemplateContentUrl}
            autoDownload={true}
            onDownloadComplete={handleDownloadComplete}
          />
        </div>
      )}

      {/* Preview modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Offer Letter Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OfferLetter
            candidate={candidate}
            jobPosition={position_title}
            salary={salary}
            joiningDate={joiningDate}                 // pass to preview
            reqId={reqId}
            templateUrl={selectedTemplateContentUrl}
            autoDownload={false}
            onDownloadComplete={() => {}}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OfferModal;
