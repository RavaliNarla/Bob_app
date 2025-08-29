import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Badge,
  Row,
  Col,
  Offcanvas,
  Tab,
  Nav,
  Form,
  Table,
} from "react-bootstrap";
import "../css/Drawer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faArrowLeft,
  faArrowRight,
  faMarker,
} from "@fortawesome/free-solid-svg-icons";
import profile from "../assets/profile_icon.png";
import axios from "axios";
import apiService from "../services/apiService";

/**
 * Drawer (merged)
 * - Keeps your Details/Resume/OfferLetter tabs
 * - Adds Feedback tab with add/edit + save to backend
 *
 * Props:
 *   isOpen, toggleDrawer, candidate, handleShortlist, ratedCandidates
 *   positionId? (optional)
 *   onFeedbackSaved?(candidateId, status, interviewerObj) (optional)
 */
function Drawer({
  isOpen,
  toggleDrawer,
  candidate,
  handleShortlist,
  ratedCandidates,
  positionId,            // optional: can come from parent
  onFeedbackSaved,
  interviewer,
  interviewFeedBacks,
         // optional: callback when feedback saved
}) {
  const handleCloseIconClick = () => toggleDrawer();

  const [activeTab, setActiveTab] = useState("details");

  // ===== Your existing schedule state (kept; commented where unused) =====
  const [meetingType, setMeetingType] = useState("online");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/jgn-bxng-zpp");
  const [attendees, setAttendees] = useState([]);
  const [message, setMessage] = useState("");
  const [isInterviewListOpen, setIsInterviewListOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const skills = useMemo(() => candidate?.skills?.split(",") || [], [candidate?.skills]);

  // ======= FEEDBACK STATE (from your first Drawer) =======
  const [feedbacks, setFeedbacks] = useState(interviewFeedBacks);// newest at index 0
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState("Selected for next round");
  const [comments, setComments] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false); // edit latest only
  // console.log(candidate)
  //  console.log(interviewer);
  //  console.log("interviewFeedBacks",interviewFeedBacks);
  //  console.log("feedbacks",feedbacks);
   
  // interviewer info (read-only — from candidate)
  const interviewerName = interviewer?.interviewer;
  const interviewerEmail = interviewer?.interviewer_email || interviewer?.interviewer_email || "";
  const interviewerId = interviewer?.interviewer_id;

  useEffect(() => {
    setFeedbacks(interviewFeedBacks ?? []);
  }, [interviewFeedBacks]);

  // Load/save feedbacks per candidate via localStorage
  useEffect(() => {
    if (!candidate?.candidate_id) return;
    setShowForm(false);
    setIsEditing(false);
    setError("");
    setStatus("Selected for next round");
    setComments("");
  }, [candidate?.candidate_id, isOpen]);

  useEffect(() => {
    if (!candidate?.candidate_id) return;
    
  }, [candidate?.candidate_id]);

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

      const res = await apiService.postFeedback(payload);
      if(res.status===200)
      {
         const feedbackRes = await apiService.getfeedback(candidate.candidate_id,positionId || candidate.position_id);
                  if (feedbackRes?.status === 200) 
                  {
                    // console.log("feedbackRes",feedbackRes.data);
                    
                     setFeedbacks(feedbackRes?.data);
                  }
      }

      // Build entry to show in the table
      const entry = {
        interviewer_name: interviewerName || interviewerEmail,
        interviewer_email: interviewerEmail,
        status,
        comments,
        created_at: new Date().toISOString(),
      };

      

      setShowForm(false);
      setIsEditing(false);
      setComments("");

      // Notify parent (optional)
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

  // ===== helpers you already had for attendees (kept) =====
  const addAttendee = (event) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      event.preventDefault();
      setAttendees((prev) => [...prev, inputValue.trim()]);
      setInputValue("");
    }
  };
  const removeAttendee = (indexToRemove) => {
    setAttendees((prev) => prev.filter((_, i) => i !== indexToRemove));
  };
  const shortlistFunction = () => handleShortlist?.(candidate);

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

          {/* TABS */}
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
                  <Nav.Link eventKey="offerLetter">Offer Letter</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="feedback">Feedback</Nav.Link>
                </Nav.Item>
              </Nav>

              <CardBody>
                <Tab.Content>
                  {/* ===== DETAILS ===== */}
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
                                  {skills.map((skill, index) => (
                                    <span
                                      key={index}
                                      className="skill-pill"
                                      style={{ backgroundColor: "#f2f4fc" }}
                                    >
                                      {skill.trim()}
                                    </span>
                                  ))}
                                </div>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={12}>
                                <div className="head-section">Additional Info:</div>
                                <div className="d-flex flex-wrap">
                                  Highly knowledgeable about the company's application
                                </div>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  {/* ===== RESUME ===== */}
                  <Tab.Pane eventKey="resume">
                    <h6>Resume</h6>
                    {candidate?.fileUrl ? (
                      <div>
                        {(() => {
                          const fileUrl = candidate.fileUrl;
                          const fileExtension = fileUrl.split(".").pop().toLowerCase();
                          const isPdf = fileExtension === "pdf";
                          const isDocx = fileExtension === "docx" || fileExtension === "doc";
                          const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
                            fileUrl
                          )}&embedded=true`;

                          return (
                            <div>
                              {isDocx ? (
                                <div>
                                  <div className="d-flex gap-3 mb-3">
                                    <a
                                      href={googleDocsViewerUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-outline-primary"
                                    >
                                      View in Google Docs
                                    </a>
                                    <a href={fileUrl} download className="btn btn-outline-secondary">
                                      Download Document
                                    </a>
                                  </div>
                                </div>
                              ) : isPdf ? (
                                <div>
                                  <div className="d-flex justify-content-end mb-2">
                                    <a href={fileUrl} download className="btn btn-sm btn-outline-secondary">
                                      Download PDF
                                    </a>
                                  </div>
                                  <iframe
                                    src={fileUrl}
                                    width="100%"
                                    height="600px"
                                    style={{ border: "1px solid #ddd", borderRadius: "4px" }}
                                    title="Resume Viewer"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <p>This file format cannot be previewed. Please download it to view.</p>
                                  <a href={fileUrl} download className="btn btn-primary">
                                    Download File
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p>No resume available for this candidate.</p>
                      </div>
                    )}
                  </Tab.Pane>

                  {/* ===== OFFER LETTER ===== */}
                  <Tab.Pane eventKey="offerLetter">
                    {candidate?.offerLetterUrl ? (
                      <div>
                        <div className="d-flex justify-content-end mb-2">
                          <a
                            href={candidate.offerLetterUrl}
                            download
                            className="btn btn-sm btn-outline-secondary"
                            target="_blank"
                          >
                            Download Offer Letter
                          </a>
                        </div>
                        <iframe
                          src={candidate.offerLetterUrl}
                          width="100%"
                          height="600px"
                          style={{ border: "1px solid #ddd", borderRadius: "4px" }}
                          title="Offer Letter Viewer"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-4 fonreg">
                        <p>No offer letter available for this candidate.</p>
                      </div>
                    )}
                  </Tab.Pane>

                  {/* ===== FEEDBACK (new) ===== */}
                  <Tab.Pane eventKey="feedback">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 style={{ color: "#FF7043", marginBottom: 0 }}>Feedback</h6>
                      <div className="d-flex gap-2">
                        {/* {feedbacks.length > 0 && (
                          <Button size="sm" variant="outline-secondary" onClick={startEditLatest}>
                            Edit latest
                          </Button>
                        )} */}
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
                                  ? interviewerName
                                    ? `${interviewerName} (${interviewerEmail})`
                                    : interviewerEmail
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
                              {saving ? "Saving..." : isEditing ? "Update" : "Save"}
                            </Button>
                            <Button
                              variant="outline-secondary"
                              onClick={() => {
                                setShowForm(false);
                                setIsEditing(false);
                              }}
                            >
                              Cancel
                            </Button>
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
                        {(feedbacks.length === 0 || feedbacks === null) ? (
                          <tr>
                            <td colSpan={4} className="text-center text-muted">
                              No feedback yet.
                            </td>
                          </tr>
                        ) : (
                          feedbacks.map((f, idx) => (
                            <tr key={idx}>
                              <td>{f.interviewerName}</td>
                              <td>{f.status}</td>
                              <td>{f.comments || "-"}</td>
                              <td>{new Date(f.actionDate).toLocaleString()}</td>
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
