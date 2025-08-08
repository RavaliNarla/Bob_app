import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import OfferLetter from './OfferLetter';

const OfferModal = ({
  show,
  handleClose,
  candidate,
  jobPosition,
  reqId,
  salary,
  setSalary,
  handleOffer
}) => {
  const [triggerDownload, setTriggerDownload] = useState(false);

  const handlePreviewClick = () => {
    setTriggerDownload(true);
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
              <Form.Control type="text" value={candidate?.firstname} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Job Position</Form.Label>
              <Form.Control type="text" value={jobPosition} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Requisition ID</Form.Label>
              <Form.Control type="text" value={reqId} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Salary</Form.Label>
              <Form.Control
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePreviewClick}>
            Download
          </Button>
          <Button variant="success" onClick={handleOffer}>
            Offer
          </Button>
        </Modal.Footer>
      </Modal>

      {triggerDownload && (
        <OfferLetter
          candidate={candidate}
          jobPosition={jobPosition}
          reqId={reqId}
          salary={salary}
          autoDownload={true}
          onDownloadComplete={handleDownloadComplete}
        />
      )}
    </>
  );
};

export default OfferModal;
