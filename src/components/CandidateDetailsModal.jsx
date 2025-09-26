import React from "react";
import { Modal, Button, Row, Col, Badge } from "react-bootstrap";

const V = (v, dash = "-") => (v === 0 || v ? String(v) : dash);

// naive path→URL helper; replace with your own mapping if needed
const resumeLinkFrom = (file_url) => {
  if (!file_url) return null;
  // EXAMPLES: adapt one of these to your backend
  // return `/api/files/stream?path=${encodeURIComponent(file_url)}`;
  // return file_url.replace("E:\\var\\www\\html\\documents", "/documents").replace(/\\/g, "/");
  return file_url; // temporary direct link (works only if server serves it)
};

export default function CandidateDetailsModal({ show, onHide, data = {} }) {
  const {
    candidate_id,
    full_name,
    email,
    phone,
    address,
    created_date,
    skills,
    current_designation,
    current_employer,
    education_qualification,
    total_experience,
    file_url,
    comments,
  } = data || {};

  const resumeURL = resumeLinkFrom(file_url);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="table-header-orange">
        <Modal.Title className="table_heading">Candidate Details</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Summary */}
        <Row className="mb-3">
          <Col md={8}>
            <h5 className="mb-1">{V(full_name)}</h5>
            <div className="text-muted small">ID: {V(candidate_id)}</div>
            <div className="text-muted small">
              {V(email)} • {V(phone)}
            </div>
          </Col>
          <Col md={4} className="text-md-end mt-2 mt-md-0">
            {total_experience && (
              <Badge bg="light" text="dark">
                Exp: {V(total_experience)} yrs
              </Badge>
            )}
          </Col>
        </Row>

        {/* Meta */}
        <Row className="g-3 mb-3">
          <Col md={4}>
            <div className="text-muted small">Designation</div>
            <div>{V(current_designation)}</div>
          </Col>
          <Col md={4}>
            <div className="text-muted small">Employer</div>
            <div>{V(current_employer)}</div>
          </Col>
          <Col md={4}>
            <div className="text-muted small">Created</div>
            <div>{created_date ? new Date(created_date).toLocaleString() : "-"}</div>
          </Col>
        </Row>

        {/* Address + Education */}
        <Row className="g-3 mb-3">
          <Col md={8}>
            <div className="text-muted small">Address</div>
            <div>{V(address)}</div>
          </Col>
          <Col md={4}>
            <div className="text-muted small">Education</div>
            <div>{V(education_qualification)}</div>
          </Col>
        </Row>

        {/* Skills */}
        <div className="mb-3">
          <div className="text-muted small mb-1">Skills</div>
          <div>{V(skills)}</div>
        </div>

        {/* Resume */}
        <div className="mb-2">
          <div className="text-muted small mb-1">Resume</div>
          {resumeURL ? (
            <a href={resumeURL} target="_blank" rel="noreferrer">
              View / Download
            </a>
          ) : (
            <span>-</span>
          )}
        </div>

        {/* Comments */}
        {comments && (
          <div className="mt-2">
            <div className="text-muted small mb-1">Comments</div>
            <div className="p-2 border rounded small">{comments}</div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" className="bulkupload_btn" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
