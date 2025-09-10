import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import OfferLetter from './OfferLetter';
// import CandidateCard from './CandidateCard'; // (unused here)

const TEMPLATES_API =
  `http://localhost:5000/api/offer-templates`; 
// -> your Express router base path that serves the routes shown

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
  offerLetterPath,            // (unused by this flow, can remove later)
  setOfferLetterPath,         // (unused by this flow, can remove later)
  setApiLoading               // (optional)
}) => {
  const [triggerDownload, setTriggerDownload] = useState(false); // legacy flag not used
  const [showPreview, setShowPreview] = useState(false);
  const [generatingOffer, setGeneratingOffer] = useState(false);

  // NEW: templates state
  const [templates, setTemplates] = useState([]);
  const [tplLoading, setTplLoading] = useState(false);
  const [tplError, setTplError] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Build the content URL the OfferLetter will fetch
  const selectedTemplateContentUrl = useMemo(() => {
    if (!selectedTemplateId) return '';
    return `${TEMPLATES_API}/${encodeURIComponent(selectedTemplateId)}/content`;
  }, [selectedTemplateId]);

  // Fetch templates whenever modal opens
  useEffect(() => {
    if (!show) return;

    const loadTemplates = async () => {
      try {
        setTplError('');
        setTplLoading(true);
        setApiLoading?.(true);

        const res = await fetch(`${TEMPLATES_API}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json(); // [{id,name,type,path}, ...]

        setTemplates(data);
        // Default select: keep previous selection if still present, else first item
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

  const handleDownloadClick = () => {
    setShowPreview(true);
  };

  // Called by hidden OfferLetter generator
  const handleDownloadComplete = async (data) => {
    setGeneratingOffer(false);
    const url = data.public_url;
    await handleOffer(url);
  };

  // Generate & send using the selected template
  const generateOfferAndSend = async () => {
    if (!selectedTemplateContentUrl) return;

    try {
      setShowPreview(false);
      setGeneratingOffer(true);

      // We render a hidden <OfferLetter> below. It will call our onDownloadComplete.
      // No need to manually create promises or setTriggerDownload.
      // The `generatingOffer` flag will render it.
    } catch (err) {
      console.error("Failed to generate offer:", err);
      setGeneratingOffer(false);
    }
  };

  const isActionDisabled =
    !salary || !candidate || !position_id || !selectedTemplateId || tplLoading || !!tplError;

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg" className="fontinter">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "18px", color: ' #FF7043 ' }}>Offers</Modal.Title>
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

            {/* NEW: Template dropdown */}
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
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
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

      {/* Hidden generator: renders only while generatingOffer is true */}
      {generatingOffer && (
        <div style={{ display: "none" }}>
          <OfferLetter
            candidate={candidate}
            jobPosition={position_title}
            salary={salary}
            reqId={reqId}
            templateUrl={selectedTemplateContentUrl}   // NEW
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
            reqId={reqId}
            templateUrl={selectedTemplateContentUrl}   // NEW
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
