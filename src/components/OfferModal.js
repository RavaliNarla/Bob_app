import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import OfferLetter from './OfferLetter';
import CandidateCard from './CandidateCard';

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
  setOfferLetterPath,
  setApiLoading
}) => {
  const [triggerDownload, setTriggerDownload] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingOffer, setGeneratingOffer] = useState(false);

  // const handlePreviewClick = () => {
  //   setShowPreview(true);
  // };

  const handleDownloadClick = () => {
    setShowPreview(true);
    // setTriggerDownload(true);
  };

  const handleDownloadComplete = async (data) => {
    setGeneratingOffer(false);
    const url = data.public_url;
    await handleOffer(url);
    // setTriggerDownload(false);
    // setOfferLetterPath(data.public_url); // Store the correct URL in state
  };

  const generateOfferAndSend = async () => {
  try {
    const generatedUrl = await new Promise((resolve) => {
      const handleDownloadComplete = (data) => resolve(data.public_url);
      // console.log("Generating offer letter...",handleDownloadComplete);
      // Render hidden OfferLetter only for generation
      const hidden = (
        <OfferLetter
          candidate={candidate}
          jobPosition={position_title}
          salary={salary}
          reqId={reqId}
          autoDownload={true}
          onDownloadComplete={handleDownloadComplete}
        />
      );
      // Attach temporarily in DOM
      setGeneratingOffer(true);
    });

    await handleOffer(generatedUrl); // <-- call CandidateCard handleOffer
  } catch (err) {
    console.error("Failed to generate offer:", err);
  }
};


  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg" className="fontinter">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "18px", color: ' #FF7043 ' }}></Modal.Title>
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
  <Form.Control
    type="text"
    value={
      salary
        ? `₹ ${Number(salary).toLocaleString("en-IN")}` // Format salary with commas
        : ""
    }
    onChange={(e) => {
      const numericValue = e.target.value.replace(/[^0-9]/g, ""); // allow only numbers
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
          {/* <Button variant="info" onClick={handlePreviewClick}>
            Preview
          </Button>
          <Button variant="primary" onClick={handleDownloadClick}>
            Download
          </Button> */}
          <Button variant="primary" onClick={handleDownloadClick} disabled={!salary || !candidate || !position_id} style={{ backgroundColor: "#FF7043", borderColor: "#FF7043" ,color: "#fff"}}>
            Preview
          </Button>
          <Button
            variant="primary"
            // onClick={() => handleOffer(offerLetterPath)} // Pass the valid state to the handler
            // disabled={!salary || !candidate || !position_id}
            onClick={() => {
              // generate the letter first
              setShowPreview(false);
              setTriggerDownload(true); // REMOVE this line
              // Instead call a wrapper function
              generateOfferAndSend();
            }}
            disabled={!salary || !candidate || !position_id}
            style={{ backgroundColor: "#FF7043", borderColor: "#FF7043", color: "#fff" }}
          >
            Send Offer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* {triggerDownload && (
        <OfferLetter
          candidate={candidate}
          jobPosition={position_title}
          salary={salary}
          reqId={reqId}
          autoDownload={true}
          onDownloadComplete={handleDownloadComplete}
        />
      )} */}

      {generatingOffer && (
        <div style={{ display: "none" }}>
          <OfferLetter
            candidate={candidate}
            jobPosition={position_title}
            salary={salary}
            reqId={reqId}
            autoDownload={true}
            onDownloadComplete={handleDownloadComplete}
          />
        </div>
      )}

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
            autoDownload={false}
            onDownloadComplete={() => { }}
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