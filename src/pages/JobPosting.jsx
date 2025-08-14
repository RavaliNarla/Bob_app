import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Alert,
  Accordion,
  Table,
  Modal,
  InputGroup,
} from "react-bootstrap";
import "../css/JobPosting.css";
import { apiService } from "../services/apiService";
import { faPencil, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import JobCreation from "./JobCreation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const EllipsisIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 128 512"
    fill="currentColor"
    className="text-muted"
    style={{ verticalAlign: "middle" }}
  >
    <path d="M64 144a56 56 0 1 1 0-112 56 56 0 1 1 0 112zm0 224c30.9 0 56 25.1 56 56s-25.1 56-56 56-56-25.1-56-56 25.1-56 56-56zm56-112c0 30.9-25.1 56-56 56s-56-25.1-56-56 25.1-56 56-56 56 25.1 56 56z" />
  </svg>
);
const JobPosting = () => {
  const [jobBoards, setJobBoards] = useState({
    linkedin: false,
    careerPage: false,
    naukri: false,
    glassDoor: false,
    indeed: false,
    foundit: false,
    freshersWorld: false,
  });

  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [activeKey, setActiveKey] = useState(null);
  const [reqs, setReqs] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);

  const [apiData, setApiData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [editRequisitionId, setEditRequisitionId] = useState(null);
  const [editPositionId, setEditPositionId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  
  const [jobBoardError, setJobBoardError] = useState("");

  const toggleAccordion = async (key, requisition_id) => {
    const newKey = activeKey === key ? null : key;
    setActiveKey(newKey);

    if (newKey !== null && requisition_id) {
      setApiData([]);
      setTableLoading(true);
      try {
        const data = await apiService.getByRequisitionId(requisition_id);
        setApiData(data?.data || []);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setApiData([]);
        } else {
          console.error("Error fetching requisition details:", err);
        }
      } finally {
        setTableLoading(false);
      }
    }
    // If closing, clear data and loading state
    if (newKey === null) {
      setApiData([]);
      setTableLoading(false);
    }
  };

  const fetchJobPostings = async () => {
    setLoading(true);
    setError(null);
    try {
      const responseData = await apiService.getReqData();
      if (responseData && Array.isArray(responseData.data)) {
        setJobPostings(responseData.data);
      } else {
        console.log("No data")
        setError("Failed to fetch job postings: Unexpected data format.");
      }
    } catch (err) {
      setError("Failed to fetch job postings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobPostings();
  }, []);

  const handleCheckboxChange = (e) => {
    setJobBoards({
      ...jobBoards,
      [e.target.name]: e.target.checked,
    });
  };

  const handleJobSelection = (e, requisitionId) => {
    if (e.target.checked) {
      setSelectedJobIds([...selectedJobIds, requisitionId]);
    } else {
      setSelectedJobIds(selectedJobIds.filter((id) => id !== requisitionId));
    }
  };  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });


  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  }; 
   const [currentReq, setCurrentReq] = useState({
    title: "",
    description: "",
    positions: "",
    startDate: "",
    endDate: "",
    comments: "",
  });

  const resetForm = () => {
    setShowModal(false);
    setCurrentReq({
      title: "",
      description: "",
      positions: "",
      startDate: "",
      endDate: "",
      comments: "",
    });
    setEditRequisitionId(null);
  };

  const handleSavePostings = async () => {
  const selectedJobBoards = Object.keys(jobBoards).filter((key) => jobBoards[key]);

  // Validation: At least 1 posting must be selected
  if (selectedJobBoards.length < 1) {
    setJobBoardError("Please select at least 1 posting.");
    return;
  } else {
    setJobBoardError("");
  }

  if (approvalStatus === "") {
    toast.info("Please select an approval status.");
    return;
  }

  if (selectedJobIds.length === 0) {
    toast.info("Please select at least one requisition to save.");
    return;
  }

  const payload = {
    requisition_id: selectedJobIds,
    job_postings: selectedJobBoards,
    approval_status: approvalStatus,
  };

  try {
    console.log("Saving job postings with payload:", payload);
    await apiService.jobpost(payload);
    toast.success("Job postings updated successfully!");

    // ✅ Reset all filters, selections, and checkboxes
    setSelectedJobIds([]);
    setApprovalStatus("");
    setSelectedApproval("");
    setJobBoards({
      linkedin: false,
      careerPage: false,
      naukri: false,
      glassDoor: false,
      indeed: false,
      foundit: false,
      freshersWorld: false,
    });

    // ✅ Reload all requisitions
    fetchJobPostings();

  } catch (err) {
    console.error("Error saving job postings:", err);
    toast.error("Failed to save job postings. Please try again.");
  }
};

  const filteredJobPostings = jobPostings.filter((job) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      job.requisition_title.toLowerCase().includes(search) ||
      job.requisition_code.toLowerCase().includes(search);

    const matchesApproval =
      selectedApproval === "" || job.requisition_status === selectedApproval;

    return matchesSearch && matchesApproval;
  });

  return (
    <Container fluid className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap">
        <div className="d-flex align-items-center mb-2 mb-md-0">
          <h5 className="fonall me-3" style={{ marginBottom: "0.25rem" }}>
            All Requisitions
          </h5>
          <Form.Select
            value={selectedApproval}
            onChange={(e) => setSelectedApproval(e.target.value)}
            style={{ width: "200px" }}
            className="fonreg"
          >
            <option value="">All Requisitions</option>
            <option value="Submitted">Submitted</option>
            <option value="Pending">Pending for Approval</option>
            <option value="Approved">Approved</option>
            <option value="Published">Published</option>
            <option value="Rejected">Rejected</option>
          </Form.Select>
        </div>
        <div className="col-md-6 search-container fonreg">
          <InputGroup>
            <InputGroup.Text style={{ backgroundColor: "#FF7043" }}>
              <FontAwesomeIcon icon={faSearch} style={{ color: "#fff" }} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search requisitions"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Accordion activeKey={activeKey}>
          {filteredJobPostings.map((job, index) => (
            <Accordion.Item eventKey={index.toString()} key={index} className="mb-2 border rounded">
              <Accordion.Header onClick={() => toggleAccordion(index.toString(), job.requisition_id)}>
                <Row className="w-100 align-items-center fontreg">
                  <Col xs={12} md={4} className="d-flex align-items-center">
                    <Form.Check
                      type="checkbox"
                      className="form-check-orange me-2"
                      checked={selectedJobIds.includes(job.requisition_id)}
                      onChange={(e) => handleJobSelection(e, job.requisition_id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="job-title fw-semibold text-dark">{job.requisition_code}</span>
                  </Col>
                  <Col xs={6} md={3} className="job-detail">
                    Title: {job.requisition_title}
                  </Col>
                  <Col xs={6} md={2} className="job-detail">
                    Positions: {job.no_of_positions}
                  </Col>
                  <Col xs={6} md={2} className="job-detail">
                    Status: {job.requisition_status}
                  </Col>
                </Row>
              </Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col xs={12} className="text-muted">
                    <Table className="req_table" responsive hover>
                      <thead className="table-header-orange">
                        <tr>
                          <th onClick={() => handleSort("title")} style={{ cursor: "pointer" }}>
                            Title{getSortIndicator("title")}
                          </th>
                          <th onClick={() => handleSort("description")} style={{ cursor: "pointer" }}>
                            Description{getSortIndicator("description")}
                          </th>
                          <th onClick={() => handleSort("positions")} style={{ cursor: "pointer" }}>
                            Position Code{getSortIndicator("positions")}
                          </th>
                          <th onClick={() => handleSort("startDate")} style={{ cursor: "pointer" }}>
                            Experience{getSortIndicator("startDate")}
                          </th>
                          <th onClick={() => handleSort("endDate")} style={{ cursor: "pointer" }}>
                            Status{getSortIndicator("endDate")}
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="table-body-orange">
                        {tableLoading ? (
                          <tr>
                            <td colSpan="6" className="text-center py-3">
                              <Spinner animation="border" size="sm" /> Loading positions...
                            </td>
                          </tr>
                        ) : (!apiData || apiData.length === 0) ? (
                          <tr>
                            <td colSpan="6" className="text-center text-muted py-3">No positions added yet</td>
                          </tr>
                        ) : (
                          apiData.map((job, index) => (
                            <tr key={job.position_id || index}>
                              <td>{job.position_title}</td>
                              <td>{job.description}</td>
                              <td>{job.position_code}</td>
                              <td>{job.preferred_experience}</td>
                              <td>{job.position_status}</td>
                              <td>
                                <FontAwesomeIcon
                                  icon={faPencil}
                                  className="text-info me-3 cursor-pointer"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    setEditRequisitionId(job.requisition_id);
                                    setEditPositionId(job.position_id);
                                    setShowModal(true);
                                  }}
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      {selectedApproval === "Submitted" && (
        <>
          <div className="mt-5 mb-4">
            <Row className="align-items-start">
              <Col xs={12} sm={12} md={8}>
                <div className="d-flex flex-wrap">
                  {/* Label + Error */}
                  <div className="d-flex">
                    <Form.Label
                      className="postingfont mb-0"
                      style={{
                        minWidth: "130px",
                        alignSelf: "flex-start",
                        
                      }}
                    >
                      Job Postings: <br />
                      {jobBoardError && (
                      <span style={{ color: "red", fontSize: "10px" }}>{jobBoardError}</span>
                    )}
                    </Form.Label>
                    
                  </div>

                  {/* Checkboxes */}
                  <div className="d-flex flex-wrap checkbtnspost" style={{ flex: 1 }}>
                    {Object.entries(jobBoards).map(([key, value], idx) => (
                      <div key={idx} className="me-4 mb-2">
                        <Form.Check
                          type="checkbox"
                          label={key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                          name={key}
                          checked={value}
                          onChange={handleCheckboxChange}
                          className="d-inline-block"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <div className="d-flex align-items-center mb-4">
            <span className="postingfont me-3">Approval Type</span>
            <Form.Select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
              style={{ width: "auto", minWidth: "200px" }}
              className="ms-2"
            >
              <option value="">Select Status</option>
              <option value="Direct Approval">Direct Approval</option>
              <option value="workflow">Workflow</option>
            </Form.Select>
          </div>
        </>
      )}

      {selectedApproval === "Submitted" && (
        <div className="d-flex justify-content-end gap-3">
          <Button variant="outline-secondary">Cancel</Button>
          <Button
            style={{ backgroundColor: "#FF7043", borderColor: "#FF7043" }}
            className="text-white"
            onClick={handleSavePostings}
          >
            Save
          </Button>
        </div>
      )}

      <Modal show={showModal} onHide={resetForm} className="modal_container">
        <Modal.Header closeButton>
          <Modal.Title className="fonall">{editRequisitionId !== null ? "Edit Job Posting" : "Add Job Posting"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <JobCreation
            editRequisitionId={editRequisitionId}
            showModal={showModal}
            onClose={() => setShowModal(false)}
            editPositionId={editPositionId}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default JobPosting;
