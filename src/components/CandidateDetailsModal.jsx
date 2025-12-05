import React, { useMemo } from "react";
import { Modal, Button, Row, Col, Badge } from "react-bootstrap";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("candidateModal");

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

  // present skills as pills if possible (but keep raw fallback)
  const skillList = useMemo(() => {
    if (Array.isArray(skills)) return skills.filter(Boolean).map(String);
    if (typeof skills === "string") {
      const arr = skills.split(/[,|]/).map((s) => s.trim()).filter(Boolean);
      return arr;
    }
    return [];
  }, [skills]);

  // nicer labels
  const expLabel =
    total_experience === 0 || total_experience
      ? `${total_experience} ${Number(total_experience) === 1 ? t("yearShort") || "yr" : t("yearsShort") || "yrs"}`
      : null;

  const createdLabel = created_date
    ? new Date(created_date).toLocaleString()
    : "-";

  // address can stay as-is (string). If object ever comes, join gracefully.
  const addressText = useMemo(() => {
    if (!address) return "-";
    if (typeof address === "string") return address;
    if (typeof address === "object") {
      const parts = [address.street, address.city, address.state, address.country, address.zip]
        .filter(Boolean);
      return parts.length ? parts.join(", ") : "-";
    }
    return "-";
  }, [address]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="table-header-orange">
        <Modal.Title className="table_heading">{t("candidateDetailsModalTitle")}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Summary */}
        <Row className="mb-3">
          <Col md={8}>
            <h5 className="mb-1">{V(full_name)}</h5>
            <div className="text-muted small">{t("candidateId")}: {V(candidate_id)}</div>
            <div className="text-muted small">{V(email)} • {V(phone)}</div>
          </Col>
          <Col md={4} className="text-md-end mt-2 mt-md-0">
            {expLabel && (
              <Badge bg="light" text="dark" className="border rounded-pill">
                {t("experienceShort")} {expLabel}
              </Badge>
            )}
          </Col>
        </Row>

        {/* Meta */}
        <div className="p-3 border rounded-3 mb-3 bg-white">
          <Row className="g-3">
            <Col md={4}>
              <div className="text-muted small">{t("designation")}</div>
              <div className="fw-medium">{V(current_designation)}</div>
            </Col>
            <Col md={4}>
              <div className="text-muted small">{t("employer")}</div>
              <div className="fw-medium">{V(current_employer)}</div>
            </Col>
            <Col md={4}>
              <div className="text-muted small">{t("created")}</div>
              <div className="fw-medium">{createdLabel}</div>
            </Col>
          </Row>
        </div>

        {/* Address + Education */}
        <div className="p-3 border rounded-3 mb-3 bg-white">
          <Row className="g-3">
            <Col md={8}>
              <div className="text-muted small">{t("address")}</div>
              <div className="fw-medium">{addressText}</div>
            </Col>
            <Col md={4}>
              <div className="text-muted small">{t("education")}</div>
              <div className="fw-medium">{V(education_qualification)}</div>
            </Col>
          </Row>
        </div>

        {/* Skills */}
        <div className="mb-3">
          <div className="text-muted small mb-1">{t("skills")}</div>
          {skillList.length ? (
            <div className="d-flex flex-wrap gap-2">
              {skillList.map((s, i) => (
                <span key={`${s}-${i}`} className="badge bg-light text-dark border rounded-pill">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <div>{V(skills)}</div>
          )}
        </div>

        {/* Resume */}
        <div className="mb-3">
          <div className="text-muted small mb-1">{t("resume")}</div>
          {resumeURL ? (
            <a href={resumeURL} target="_blank" rel="noreferrer">
              {t("viewDownload")}
            </a>
          ) : (
            <span>-</span>
          )}
        </div>

        {/* Comments */}
        {comments && (
          <div className="mt-2">
            <div className="text-muted small mb-1">{t("comments")}</div>
            <div className="p-2 border rounded small" style={{ whiteSpace: "pre-wrap" }}>
              {comments}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" className="bulkupload_btn" onClick={onHide}>
          {t("candidateDetailsClose")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
