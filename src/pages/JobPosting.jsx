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
  Toast,
  ToastContainer
} from "react-bootstrap";
import "../css/JobPosting.css";
import { apiService } from "../services/apiService";
import { faPencil, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import JobCreation from "./JobCreation";
import { useNavigate } from "react-router-dom";


// Inline SVG for ellipsis
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
  const [editRequisitionId, setEditRequisitionId] = useState(null);
  const [editPositionId, setEditPositionId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // New state to track selected job requisition IDs
  const [selectedJobIds, setSelectedJobIds] = useState([]);

  // Helper function to show a custom toast message
  const showToastMessage = (message, variant) => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const toggleAccordion = async (key, requisition_id) => {
    const newKey = activeKey === key ? null : key;
    setActiveKey(newKey);

    if (newKey !== null && requisition_id) {
      try {
        const data = await apiService.getByRequisitionId(requisition_id);
        console.log("Fetched requisition data:", data);
        setApiData(data.data || []);
      } catch (err) {
        console.error("Error fetching requisition details:", err);
      }
    }
  };

  const fetchJobPostings = async () => {
    setLoading(true);
    setError(null);
    try {
      const responseData = await apiService.getReqData();
      
      if (responseData && Array.isArray(responseData.data)) {
        console.log(
          "Successfully received job postings:",
          responseData.data.length
        );
        setJobPostings(responseData.data);
      } else {
        console.error("API response format is incorrect:", responseData);
        setError("Failed to fetch job postings: Unexpected data format.");
      }
    } catch (err) {
      console.error("Caught an error during API call:", err);
      if (err.response) {
        console.error("Error Response Status:", err.response.status);
        console.error("Error Response Data:", err.response.data);
        setError(
          `Failed to fetch job postings: Server Error ${err.response.status}`
        );
      } else if (err.request) {
        console.error("Error Request:", err.request);
        setError("Failed to fetch job postings: No response from server.");
      } else {
        console.error("Error Message:", err.message);
        setError(`Failed to fetch job postings: ${err.message}`);
      }
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

  // New function to handle the checkbox for selecting jobs
  const handleJobSelection = (e, requisitionId) => {
    if (e.target.checked) {
      setSelectedJobIds([...selectedJobIds, requisitionId]);
    } else {
      setSelectedJobIds(selectedJobIds.filter(id => id !== requisitionId));
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
    if (sortConfig.key !== key) {
      return null;
    }
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

  const handleSave = () => {
    if (
      !currentReq.title ||
      !currentReq.description ||
      !currentReq.positions ||
      !currentReq.startDate ||
      !currentReq.endDate
    ) {
      showToastMessage("Please fill all required fields.", "warning");
      return;
    }

    let updatedreqs = [...reqs];
    const newReq = {
      ...currentReq,
      requisition_title: currentReq.title,
      requisition_description: currentReq.description,
      no_of_positions: currentReq.positions,
      requisition_start_date: currentReq.startDate,
      requisition_end_date: currentReq.endDate,
      requisition_comments: currentReq.comments,
    };

    if (editRequisitionId !== null) {
      const indexToUpdate = updatedreqs.findIndex(r => r.requisition_id === editRequisitionId);
      if (indexToUpdate !== -1) {
          updatedreqs[indexToUpdate] = newReq;
          showToastMessage("Requisition updated successfully", "info");
      }
    } else {
      updatedreqs.push({
        ...newReq,
        requisition_id: Date.now().toString(),
      });
      showToastMessage("Requisition added successfully", "success");
    }

    setReqs(updatedreqs);
    resetForm();
  };

  // New function to handle the API call when the "Save" button is clicked
  const handleSavePostings = async () => {
    // 1. Validate that job boards and approval status are selected
    const selectedJobBoards = Object.keys(jobBoards).filter(key => jobBoards[key]);
    if (selectedJobBoards.length === 0) {
      showToastMessage("Please select at least one job board.", "warning");
      return;
    }

    if (approvalStatus === "") {
      showToastMessage("Please select an approval status.", "warning");
      return;
    }

    // New validation: check if any jobs are selected
    if (selectedJobIds.length === 0) {
      showToastMessage("Please select at least one requisition to save.", "warning");
      return;
    }

    // 2. Map the SELECTED job requisition IDs to create the payload for the API
    const payload = selectedJobIds.map(id => ({
      requisition_id: id,
      job_postings_areas: selectedJobBoards,
      approval_status: approvalStatus,
    }));
    
    console.log("API Payload:", payload);
    
    // 3. Make the API call
    try {
      // Replace the mock API call with your actual API service
      // await apiService.updateJobPostingStatus(payload);
      
      console.log("Saving job postings with payload:", payload);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      showToastMessage("Job postings updated successfully!", "success");
      // Optionally, clear the selected IDs and refetch the data after success
      setSelectedJobIds([]);
      fetchJobPostings();
      
    } catch (err) {
      console.error("Error saving job postings:", err);
      showToastMessage("Failed to save job postings. Please try again.", "danger");
    }
  };


  // Filter job postings based on search term and selected approval status
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
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap">
        <div className="d-flex align-items-center mb-2 mb-md-0">
          <h5 className="fonall me-3" style={{ marginBottom: "0.25rem" }}>
            All Requisitions
          </h5>
          <Form.Select
            value={selectedApproval}
            onChange={(e) => setSelectedApproval(e.target.value)}
            style={{ width: "200px" }} className="fonreg"
          >
            <option value="">All Requisitions</option>
            <option value="Submitted">Submitted</option>
            <option value="Pending">Pending for Approval</option>
            <option value="Approved">Approved</option>
            <option value="Published">Published</option>
            <option value="Rejected">Rejected</option>
          </Form.Select>
        </div>
        <div
          className="col-md-6 search-container fonreg"
        >
          {/* <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search requisitions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          /> */}
          <InputGroup className="" >
            <InputGroup.Text style={{ backgroundColor: '#FF7043' }}>
              <FontAwesomeIcon icon={faSearch} style={{ color: '#fff' }} />
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
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "200px" }}
        >
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Accordion activeKey={activeKey}>
          {filteredJobPostings.map((job, index) => (
            <Accordion.Item
              eventKey={index.toString()}
              key={index}
              className="mb-2 border rounded"
            >
              <Accordion.Header
                onClick={() => toggleAccordion(index.toString(), job.requisition_id)}
              >
                <Row className="w-100 align-items-center fontreg">
                  <Col xs={12} md={4} className="d-flex align-items-center">
                    <Form.Check
                      type="checkbox"
                      className="form-check-orange me-2"
                      checked={selectedJobIds.includes(job.requisition_id)}
                      onChange={(e) => handleJobSelection(e, job.requisition_id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="job-title fw-semibold text-dark">
                      {job.requisition_code}
                    </span>
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
                          <th
                            onClick={() => handleSort("title")}
                            style={{ cursor: "pointer" }}
                          >
                            Title{getSortIndicator("title")}
                          </th>
                          <th
                            onClick={() => handleSort("description")}
                            style={{ cursor: "pointer" }}
                          >
                            Description{getSortIndicator("description")}
                          </th>
                          <th
                            onClick={() => handleSort("positions")}
                            style={{ cursor: "pointer" }}
                          >
                            Position Code{getSortIndicator("positions")}
                          </th>
                          <th
                            onClick={() => handleSort("startDate")}
                            style={{ cursor: "pointer" }}
                          >
                            Experience{getSortIndicator("startDate")}
                          </th>
                          <th
                            onClick={() => handleSort("endDate")}
                            style={{ cursor: "pointer" }}
                          >
                            Status{getSortIndicator("endDate")}
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="table-body-orange">
                        {apiData.map((job, index) => (
                          <tr key={job.position_id || index}>
                            <td>{job.position_title}</td>
                            <td>{job.description}</td>
                            <td>{job.position_code}</td>
                            <td>{job.preferred_experience}</td>
                            <td>{job.position_status}</td>
                            <td className="text-center">
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
                        ))}
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
                <div className="d-flex flex-wrap align-items-center">
                  <Form.Label
                    className="postingfont me-3 mb-0"
                    style={{
                      minWidth: "100px",
                      alignSelf: "flex-start",
                      paddingTop: "4px",
                    }}
                  >
                    Job Postings:
                  </Form.Label>
                  <div
                    className="d-flex flex-wrap checkbtnspost"
                    style={{ flex: 1 }}
                  >
                    {Object.entries(jobBoards).map(([key, value], idx) => (
                      <div key={idx} className="me-4 mb-2">
                        <Form.Check
                          type="checkbox"
                          label={key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
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
          <Modal.Title>{editRequisitionId !== null ? "Edit Requisition" : "Add Requisition"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <JobCreation editRequisitionId={editRequisitionId} showModal={showModal} onClose={() => setShowModal(false)} editPositionId={editPositionId} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default JobPosting;
