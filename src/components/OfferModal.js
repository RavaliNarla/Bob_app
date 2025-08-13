import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import OfferLetter from './OfferLetter';

const OfferModal = ({
  show,
  handleClose,
  candidate,
  position_title,
  reqId,
  salary,
  setSalary,
  position_id,
  handleOffer
}) => {
  // console.log("Position Title in Modal:", position_title); 
  const [triggerDownload, setTriggerDownload] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // State for preview modal

  const handlePreviewClick = () => {
    setShowPreview(true); // Show the preview modal
  };

  const handleDownloadComplete = () => {
    setTriggerDownload(false);
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Offer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Candidate Name</Form.Label>
              <Form.Control type="text" value={candidate?.full_name} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Job Position</Form.Label>
              <Form.Control type="text" value={position_title} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Requisition ID</Form.Label>
              <Form.Control type="text" value={reqId} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Salary</Form.Label>
              <Form.Control type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="info" onClick={handlePreviewClick}>
            Preview
          </Button>
          <Button variant="primary" onClick={() => setTriggerDownload(true)}>
            Download
          </Button>
          <Button variant="primary" onClick={handleOffer}>
            Send Offer
          </Button>
        </Modal.Footer>
      </Modal>

      {triggerDownload && (
        <OfferLetter
          candidate={candidate}
          jobPosition={position_title}
          salary={salary}
          reqId={reqId}
          autoDownload={triggerDownload}
          onDownloadComplete={handleDownloadComplete}
        />
      )}

      {/* Preview Modal */}
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
            autoDownload={false} // Do not auto-download in preview
            onDownloadComplete={handleDownloadComplete}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Cancel
          </Button>
          {/* <Button variant="primary" onClick={() => {
            setTriggerDownload(true);
            setShowPreview(false); // Close preview and trigger download
          }}>
            Download
          </Button> */}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OfferModal;
