import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Offcanvas,
  Tab,
  Nav,
  Button,
  Form,
  Table,
  Badge,
} from "react-bootstrap";
import "../css/Drawer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import profile from "../assets/profile_icon.png";
import apiService from "../services/apiService";
import axios from "axios";

function Drawer({
  isOpen,
  toggleDrawer,
  candidate,
  ratedCandidates,
  onFeedbackSaved, // callback to parent (CandidateCard)
  positionId,      // passed from CandidateCard
}) {
  const [activeTab, setActiveTab] = useState("details");

  // ======= FEEDBACK STATE =======
  const [feedbacks, setFeedbacks] = useState([]); // local view list (latest at index 0)
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState("Selected for next round");
  const [comments, setComments] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // edit mode for the latest feedback only
  const [isEditing, setIsEditing] = useState(false); // when true, we edit feedbacks[0]

  // interviewer info (read-only — from candidate)
  const interviewerName =
    candidate?.interviewer_name ||
    candidate?.interviewerName ||
    (candidate?.interviewer_email ? candidate?.interviewer_email.split("@")[0] : "") ||
    "";
  const interviewerEmail = candidate?.interviewer_email || candidate?.interviewerEmail || "";
  const interviewerId = candidate?.interviewer_id;

  // Load/save feedbacks per candidate via localStorage (quick UI storage)
  useEffect(() => {
    if (!candidate?.candidate_id) return;
    try {
      const raw = localStorage.getItem(`feedbacks_${candidate.candidate_id}`);
      setFeedbacks(raw ? JSON.parse(raw) : []);
    } catch {
      setFeedbacks([]);
    }
    setShowForm(false);
    setIsEditing(false);
    setError("");
    setStatus("Selected for next round");
    setComments("");
  }, [candidate?.candidate_id, isOpen]);

  useEffect(() => {
    if (!candidate?.candidate_id) return;
    localStorage.setItem(`feedbacks_${candidate.candidate_id}`, JSON.stringify(feedbacks));
  }, [feedbacks, candidate?.candidate_id]);

  const startAdd = () => {
    setIsEditing(false);
    setStatus("Selected for next round");
    setComments("");
    setShowForm(true);
  };

  const startEditLatest = () => {
    if (!feedbacks[0]) return;
    setIsEditing(true);
    setStatus(feedbacks[0].status || "Selected for next round");
    setComments(feedbacks[0].comments || "");
    setShowForm(true);
  };

  const handleSaveFeedback = async () => {
  if (!candidate?.candidate_id || !(positionId || candidate?.position_id)) {
    alert("Missing candidate or position.");
    return;
  }
  if (!interviewerEmail) {
    alert("Interviewer not set. Schedule the interview first.");
    return;
  }

  setError("");
  setSaving(true);

  try {
    const payload = {
      comments,
      status, // "Selected for next round" | "Selected" | "Rejected" | etc.
      candidate_id: candidate.candidate_id,
      position_id: positionId || candidate.position_id,
      ...(interviewerId != null && { interviewer_id: Number(interviewerId) }),
      interviewer_name: interviewerName || interviewerEmail,
      interviewer_email: interviewerEmail,
    };

    const token =
      localStorage.getItem("access_token") || localStorage.getItem("token");

    await axios.post(
      "http://192.168.20.111:8081/api/candidates/feedback",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    // Build entry to show in the table
    const entry = {
      interviewer_name: interviewerName || interviewerEmail,
      interviewer_email: interviewerEmail,
      status,
      comments,
      created_at: new Date().toISOString(),
    };

    if (isEditing) {
      // Update latest (index 0)
      setFeedbacks((prev) => {
        if (!prev.length) return [entry];
        const next = [...prev];
        next[0] = { ...next[0], ...entry };
        return next;
      });
    } else {
      // Prepend as newest
      setFeedbacks((prev) => [entry, ...prev]);
    }

    setShowForm(false);
    setIsEditing(false);
    setComments("");

    // Let parent column update status/interviewer fields
    onFeedbackSaved?.(candidate?.candidate_id, status, {
      id: interviewerId,
      name: entry.interviewer_name,
      email: interviewerEmail,
    });
  } catch (err) {
    setError(
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Failed to save feedback"
    );
  } finally {
    setSaving(false);
  }
};

  const handleCloseIconClick = () => {
    toggleDrawer();
  };

  return (
    <Offcanvas
      show={isOpen}
      onHide={toggleDrawer}
      placement="end"
      className="drawer-slide custom-offcanvas"
    >
      <Offcanvas.Body className="p-0">
        <Card style={{ borderRadius: "10px", height: "100vh" }} className="fontdraw">
          <div className="drawer_main">
            <FontAwesomeIcon icon={faXmark} className="close_icon" onClick={handleCloseIconClick} />
            <div className="d-flex gap-4">
              <div>
                <img src={profile} alt={candidate?.full_name} className="candidate_image me-3" />
              </div>
              <div>
                <h5 className="mb-0">
                  {candidate?.full_name} {candidate?.lastname}
                </h5>
                <p className="text-muted mb-0 py-1">{candidate?.address}</p>
                <p className="text-muted mb-0">{candidate?.phone}</p>
              </div>
              <div className="px-3">
                <Badge className="Active_round_pill">Active</Badge>
              </div>
            </div>
          </div>

          <Card>
            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav variant="tabs" className="drawer-nav">
                <Nav.Item>
                  <Nav.Link eventKey="details">Details</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="resume">Resume</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="feedback">Feedback</Nav.Link>
                </Nav.Item>
              </Nav>

              <CardBody>
                <Tab.Content>
                  {/* ----- DETAILS ----- */}
                  <Tab.Pane eventKey="details">
                    <Row className="mt-3">
                      <Col md={6}>
                        <div className="info-card">
                          <div className="info-header d-flex justify-content-between align-items-center">
                            <h6 style={{ color: "#FF7043" }}>Basic Information</h6>
                          </div>
                          <Row>
                            <Col md={12}>
                              <div className="head-section">NAME:</div>
                              <p className="sum-data">{candidate?.full_name}</p>
                            </Col>
                            <Col md={12}>
                              <div className="head-section">EMAIL:</div>
                              <p className="sum-data">{candidate?.email}</p>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <div className="head-section">LOCATION:</div>
                              <p className="sum-data">{candidate?.location}</p>
                            </Col>
                            <Col md={12}>
                              <div className="head-section">CONTACT INFO:</div>
                              <p className="sum-data">{candidate?.phone}</p>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <div className="head-section">ADDRESS:</div>
                              <p>{candidate?.address}</p>
                            </Col>
                          </Row>
                        </div>

                        <div className="info-card mt-3">
                          <div className="info-header d-flex justify-content-between align-items-center">
                            <h6 style={{ color: "#FF7043" }}>Education Information</h6>
                          </div>
                          <div className="info-body">
                            <Row>
                              <Col md={12}>
                                <div className="head-section">POST GRADUATION:</div>
                                <p className="sum-data">{candidate?.postGraduation}</p>
                              </Col>
                              <Col md={12}>
                                <div className="head-section">UNIVERSITY:</div>
                                <p className="sum-data">{candidate?.postGraduationUniversity}</p>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={12}>
                                <div className="head-section">GRADE/SCORE:</div>
                                <p className="sum-data">{candidate?.postGraduationGrade}</p>
                              </Col>
                              <Col md={12}>
                                <div className="head-section">YEAR OF PASSING:</div>
                                <p className="sum-data">{candidate?.postGraduationYear}</p>
                              </Col>
                            </Row>
                            <div style={{ borderTop: "1px dashed #ccc", margin: "1.5rem 0 0 0" }} />
                            <div style={{ borderTop: "1px dashed #ccc", margin: "0.25rem 0 1.5rem 0" }} />
                            <Row>
                              <Col md={12}>
                                <div className="head-section">GRADUATION:</div>
                                <p className="sum-data">{candidate?.graduation}</p>
                              </Col>
                              <Col md={12}>
                                <div className="head-section">UNIVERSITY:</div>
                                <p className="sum-data">{candidate?.graduationUniversity}</p>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={12}>
                                <div className="head-section">GRADE/SCORE:</div>
                                <p className="sum-data">{candidate?.graduationGrade}</p>
                              </Col>
                              <Col md={12}>
                                <div className="head-section">YEAR OF PASSING:</div>
                                <p className="sum-data">{candidate?.graduationYear}</p>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="pro-info-card">
                          <div className="info-header d-flex justify-content-between align-items-center">
                            <h6 style={{ color: "#FF7043" }}>Professional Information</h6>
                          </div>
                          <div className="info-body">
                            <Row>
                              <Col md={12}>
                                <div className="head-section">CURRENT JOB TITTLE:</div>
                                <p className="sum-data">{candidate?.requisition_title}</p>
                              </Col>
                              <Col md={12}>
                                <div className="head-section">TOTAL EXPERIENCE:</div>
                                <p className="sum-data">{candidate?.total_experience}</p>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={12}>
                                <div className="head-section">CURRENT CTC:</div>
                                <p className="sum-data">{candidate?.currentCTC}</p>
                              </Col>
                              <Col md={12}>
                                <div className="head-section">EXPECTED CTC:</div>
                                <p className="sum-data">{candidate?.expectedCTC}</p>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={12}>
                                <div className="head-section">CURRENT COMPANY:</div>
                                <p className="sum-data">{candidate?.currentCompany}</p>
                              </Col>
                              <Col md={12}>
                                <div className="head-section">COMPANY LOCATION:</div>
                                <p className="sum-data">{candidate?.companyLocation}</p>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={12}>
                                <div className="head-section">SKILL SET:</div>
                                <div className="d-flex flex-wrap">
                                  {candidate?.skills?.split(",")?.map((skill, i) => (
                                    <span style={{ backgroundColor: "#f2f4fc" }} key={i} className="skill-pill">
                                      {skill.trim()}
                                    </span>
                                  ))}
                                </div>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  {/* ----- RESUME ----- */}
                  <Tab.Pane eventKey="resume">
                    <h6>Resume</h6>
                    {candidate?.fileUrl ? (
                      <div>
                        <p>Click the link below to view or download the resume:</p>
                        <a href={candidate.fileUrl} target="_blank" rel="noopener noreferrer">
                          {candidate.fileUrl || "View Resume"}
                        </a>
                        <iframe
                          src={candidate.fileUrl}
                          width="100%"
                          height="500px"
                          style={{ border: "none", marginTop: "10px" }}
                          title="Resume Viewer"
                        />
                      </div>
                    ) : (
                      <p>No resume available.</p>
                    )}
                  </Tab.Pane>

                  {/* ----- FEEDBACK ----- */}
                  <Tab.Pane eventKey="feedback">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 style={{ color: "#FF7043", marginBottom: 0 }}>Feedback</h6>
                      <div className="d-flex gap-2">
                        {feedbacks.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={startEditLatest}
                          >
                            Edit latest
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={startAdd}
                          style={{ borderColor: "#FF7043", color: "#FF7043" }}
                        >
                          {showForm && !isEditing ? "Close" : "Add"}
                        </Button>
                      </div>
                    </div>

                    {showForm && (
                      <div className="p-3 border rounded mb-3">
                        <Form>
                          {error && <div className="alert alert-danger py-2">{error}</div>}

                          <Form.Group className="mb-2">
                            <Form.Label>Interviewer</Form.Label>
                            <Form.Control
                              readOnly
                              value={
                                interviewerEmail
                                  ? (interviewerName ? `${interviewerName} (${interviewerEmail})` : interviewerEmail)
                                  : "Not set"
                              }
                            />
                            {!interviewerEmail && (
                              <small className="text-muted">
                                Schedule the interview first to capture interviewer.
                              </small>
                            )}
                          </Form.Group>

                          <Form.Group className="mb-2">
                            <Form.Label>Status</Form.Label>
                            <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                              <option value="Selected for next round">Selected for next round</option>
                              <option value="Selected">Selected</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Not available">Not Available</option>
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Comments</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              placeholder="Enter comments"
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                            />
                          </Form.Group>

                          <div className="d-flex gap-2">
                            <Button
                              disabled={!interviewerEmail || saving}
                              onClick={handleSaveFeedback}
                              style={{ backgroundColor: "#FF7043", borderColor: "#FF7043" }}
                            >
                              {saving ? "Saving..." : (isEditing ? "Update" : "Save")}
                            </Button>
                            {showForm && (
                              <Button
                                variant="outline-secondary"
                                onClick={() => { setShowForm(false); setIsEditing(false); }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </Form>
                      </div>
                    )}

                    <Table bordered hover size="sm">
                      <thead>
                        <tr>
                          <th style={{ width: "28%" }}>Interviewer</th>
                          <th style={{ width: "18%" }}>Status</th>
                          <th>Comments</th>
                          <th style={{ width: "18%" }}>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feedbacks.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center text-muted">
                              No feedback yet.
                            </td>
                          </tr>
                        ) : (
                          feedbacks.map((f, idx) => (
                            <tr key={idx}>
                              <td>{f.interviewer_name}</td>
                              <td>{f.status}</td>
                              <td>{f.comments || "-"}</td>
                              <td>{new Date(f.created_at).toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </Tab.Pane>
                </Tab.Content>
              </CardBody>
            </Tab.Container>
          </Card>
        </Card>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default Drawer;
