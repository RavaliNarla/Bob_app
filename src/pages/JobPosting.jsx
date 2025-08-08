import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Dropdown,
  Spinner,
  Alert,
  Accordion,
  Table,
  Modal
} from "react-bootstrap";
import "../css/JobPosting.css";
import { apiService } from "../services/apiService";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
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

  const jobTable = [
    {
      requisition_title: "Frontend Developer",
      requisition_description: "Develop user-facing features using React.",
      no_of_positions: 2,
      requisition_start_date: "2025-08-01",
      requisition_end_date: "2025-08-31",
    },
    {
      requisition_title: "Backend Engineer",
      requisition_description:
        "Work on APIs and data storage using Java and PostgreSQL.",
      no_of_positions: 3,
      requisition_start_date: "2025-08-05",
      requisition_end_date: "2025-09-05",
    },
    {
      requisition_title: "UI/UX Designer",
      requisition_description:
        "Design intuitive user interfaces and improve UX.",
      no_of_positions: 1,
      requisition_start_date: "2025-08-10",
      requisition_end_date: "2025-09-10",
    },
    {
      requisition_title: "QA Automation Tester",
      requisition_description:
        "Automate test cases and ensure product quality.",
      no_of_positions: 2,
      requisition_start_date: "2025-08-15",
      requisition_end_date: "2025-09-15",
    },
  ];

  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //const [selectedFilterStatus, setSelectedFilterStatus] = useState('');
  const [selectedApproval, setSelectedApproval] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [activeKey, setActiveKey] = useState(null);
  const [reqs, setReqs] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const showToast = (message, variant) => {
    alert(message);
  };

  // const toggleAccordion = (key) => {
  //   setActiveKey(activeKey === key ? null : key);
  // };
  const [apiData, setApiData] = useState([]);

  const toggleAccordion = async (key, requisition_id) => {
    const newKey = activeKey === key ? null : key;
    setActiveKey(newKey);

    if (newKey !== null && requisition_id) {
      try {
        const data = await apiService.getByRequisitionId(requisition_id);
        console.log("Fetched requisition data:", data);
        setApiData(data.data || []); // Ensure data is set correctly
        // You can update state here to display in UI if needed
      } catch (err) {
        console.error("Error fetching requisition details:", err);
      }
    }
  };


  useEffect(() => {
    const fetchJobPostings = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Attempting to fetch job postings...");
        const responseData = await apiService.getReqData();
        //          const responseData = {
        //   data: [
        //     {
        //       requisition_id: 1,
        //       requisition_code: "REQ-2025-001",
        //       requisition_title: "Senior Software Engineer",
        //       requisition_description: "Looking for a senior software engineer with 5+ years experience in full-stack development.",
        //       registration_start_date: "2025-08-01",
        //       registration_end_date: "2025-08-15",
        //       requisition_status: "Open",
        //       requisition_comments: "Urgent requirement",
        //       requisition_approval: "Approved",
        //       created_by: "hr_manager",
        //       created_date: "2025-07-30",
        //       updated_by: "hr_admin",
        //       updated_date: "2025-08-05",
        //       others: "Remote work allowed",
        //       no_of_positions: 3,
        //       job_postings: "LinkedIn, Indeed"
        //     },
        //     {
        //       requisition_id: 1,
        //       requisition_code: "REQ-2025-005",
        //       requisition_title: "Senior Software Engineer",
        //       requisition_description: "Looking for a senior software engineer with 5+ years experience in full-stack development.",
        //       registration_start_date: "2025-08-01",
        //       registration_end_date: "2025-08-15",
        //       requisition_status: "Open",
        //       requisition_comments: "Urgent requirement",
        //       requisition_approval: "Submitted",
        //       created_by: "hr_manager",
        //       created_date: "2025-07-30",
        //       updated_by: "hr_admin",
        //       updated_date: "2025-08-05",
        //       others: "Remote work allowed",
        //       no_of_positions: 3,
        //       job_postings: "LinkedIn, Indeed"
        //     },
        //     {
        //       requisition_id: 1,
        //       requisition_code: "REQ-2025-006",
        //       requisition_title: "Senior Software Engineer",
        //       requisition_description: "Looking for a senior software engineer with 5+ years experience in full-stack development.",
        //       registration_start_date: "2025-08-01",
        //       registration_end_date: "2025-08-15",
        //       requisition_status: "Open",
        //       requisition_comments: "Urgent requirement",
        //       requisition_approval: "Submitted",
        //       created_by: "hr_manager",
        //       created_date: "2025-07-30",
        //       updated_by: "hr_admin",
        //       updated_date: "2025-08-05",
        //       others: "Remote work allowed",
        //       no_of_positions: 3,
        //       job_postings: "LinkedIn, Indeed"
        //     },
        //     {
        //       requisition_id: 2,
        //       requisition_code: "REQ-2025-002",
        //       requisition_title: "UI/UX Designer",
        //       requisition_description: "Creative designer needed for mobile and web apps.",
        //       registration_start_date: "2025-08-02",
        //       registration_end_date: "2025-08-20",
        //       requisition_status: "Open",
        //       requisition_comments: "Portfolio must be attached",
        //       requisition_approval: "Pending",
        //       created_by: "design_lead",
        //       created_date: "2025-08-01",
        //       updated_by: "design_lead",
        //       updated_date: "2025-08-03",
        //       others: "Hybrid work",
        //       no_of_positions: 2,
        //       job_postings: "Behance, LinkedIn"
        //     }
        //   ]
        // };

        console.log("API Response Data:", responseData.data);

        // Ensure the response has a `data` property that is an array
        if (responseData && Array.isArray(responseData.data)) {
          console.log(
            "Successfully received job postings:",
            responseData.data.length
          );
          setJobPostings(responseData.data);
        } else {
          // This block will catch unexpected response formats
          console.error("API response format is incorrect:", responseData);
          setError("Failed to fetch job postings: Unexpected data format.");
        }
      } catch (err) {
        // This is the most crucial part to debug
        console.error("Caught an error during API call:", err);

        // Log the details of the error object
        if (err.response) {
          // Server responded with a status other than 2xx
          console.error("Error Response Status:", err.response.status);
          console.error("Error Response Data:", err.response.data);
          setError(
            `Failed to fetch job postings: Server Error ${err.response.status}`
          );
        } else if (err.request) {
          // Request was made but no response was received
          console.error("Error Request:", err.request);
          setError("Failed to fetch job postings: No response from server.");
        } else {
          // Something else happened in setting up the request
          console.error("Error Message:", err.message);
          setError(`Failed to fetch job postings: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobPostings();
  }, []);

  const handleCheckboxChange = (e) => {
    setJobBoards({
      ...jobBoards,
      [e.target.name]: e.target.checked,
    });
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
  const [editIndex, setEditIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openModal = (
    req = {
      title: "",
      description: "",
      positions: "",
      startDate: "",
      endDate: "",
      comments: "",
    },
    index = null
  ) => {
    setCurrentReq({
      title: req.requisition_title || "",
      description: req.requisition_description || "",
      positions: req.no_of_positions || "",
      startDate: req.requisition_start_date || "",
      endDate: req.requisition_end_date || "",
      comments: req.requisition_comments || "",
    });
    setEditIndex(index);
    setShowModal(true);
  };

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
    setEditIndex(null);
  };

    const handleSave = () => {
    if (
      !currentReq.title ||
      !currentReq.description ||
      !currentReq.positions ||
      !currentReq.startDate ||
      !currentReq.endDate
    ) {
      showToast("Please fill all required fields.", "warning");
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

    if (editIndex !== null) {
      updatedreqs[editIndex] = newReq;
      showToast("Requisition updated successfully", "info");
    } else {
      updatedreqs.push({
        ...newReq,
        _id: Date.now().toString(),
      });
      showToast("Requisition added successfully", "success");
    }

    setReqs(updatedreqs);
    resetForm();
  };

  const [editRequisitionId, setEditRequisitionId] = useState(null);
  const [editPositionId, setEditPositionId] = useState(null);

  // const fetchRequisition = async () => {
  //   try {
  //     const data = await apiService.getByRequisitionId("11111111-1111-1111-1111-111111111111");
  //     console.log("Requisition data:", data);
  //   } catch (error) {
  //     console.error("Error fetching requisition:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchRequisition();
  // }, []);

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Filter job postings based on search term
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
      {/* Title and Search Bar Row */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap">
        {/* Title and Dropdown */}
        <div className="d-flex align-items-center mb-2 mb-md-0">
          <h5 className="fonall me-3" style={{ marginBottom: "0.25rem" }}>
            All Requisitions
          </h5>
          <Form.Select
            value={selectedApproval}
            onChange={(e) => setSelectedApproval(e.target.value)}
            style={{ width: "200px" }}
          >
            <option value="">All Requisitions</option>
            <option value="Submitted">Submitted</option>
            <option value="Pending">Pending for Approval</option>
            <option value="Approved">Approved</option>
            <option value="Published">Published</option>
            <option value="Rejected">Rejected</option>
          </Form.Select>
        </div>

        {/* Search Box */}
        <div
          className="search-container"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search requisitions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {/* <div className="search-container" style={{ width: '100%', maxWidth: '400px' }}>
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search requisitions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}
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
        //       <Card className="border-0 mb-4">
        //   {filteredJobPostings.map((job, index) => (
        //    <Row key={index} className="job-row border-bottom py-2 align-items-center text-muted">
        //    {/* Title + Bullets + Checkbox */}
        //    <Col xs={12} md={6} className="d-flex align-items-center">
        //      <div className="bullet-columns d-flex me-2">
        //        <div className="d-flex flex-column me-1">
        //          <span className="job-bullet mb-1"></span>
        //          <span className="job-bullet mb-1"></span>
        //          <span className="job-bullet mb-1"></span>
        //          <span className="job-bullet"></span>
        //        </div>
        //        <div className="d-flex flex-column">
        //          <span className="job-bullet mb-1"></span>
        //          <span className="job-bullet mb-1"></span>
        //          <span className="job-bullet mb-1"></span>
        //          <span className="job-bullet"></span>
        //        </div>
        //      </div>
        //      <Form.Check type="checkbox" className="form-check-orange me-2" />
        //      <span className="job-title fw-semibold text-dark">{job.requisition_code}</span>
        //    </Col>

        //    {/* Job Code */}
        //    <Col xs={6} md={2} className="job-detail">
        //       Title: {job.requisition_title}
        //    </Col>

        //    {/* Experience */}
        //    {/* <Col xs={6} md={1} className="job-detail">
        //      Exp: {job.work_experience}
        //    </Col> */}
        //   {/* <Col xs={6} md={1} className="job-detail">
        //      {job.requisition_approval}
        //    </Col>  */}
        //    {/* Positions */}
        //    <Col xs={6} md={1} className="job-detail">
        //      Positions: {job.no_of_positions}
        //    </Col>
        //   <Col xs={6} md={1} className="job-detail">
        //      Strat Date: {job.requisition_status}
        //    </Col>

        //    {/* Location + Actions */}
        //    <Col xs={6} md={2} className="d-flex justify-content-end align-items-center">
        //      <Dropdown align="end">
        //        <Dropdown.Toggle variant="light" size="sm" className="border-0 bg-transparent p-0 custom-dropdown">
        //          <EllipsisIcon />
        //        </Dropdown.Toggle>
        //        <Dropdown.Menu>
        //          <Dropdown.Item>View Details</Dropdown.Item>
        //          <Dropdown.Item>Edit</Dropdown.Item>
        //          <Dropdown.Divider />
        //          <Dropdown.Item className="text-danger">Delete</Dropdown.Item>
        //        </Dropdown.Menu>
        //      </Dropdown>
        //    </Col>
        //  </Row>

        //   ))}
        // </Card>

        <Accordion activeKey={activeKey}>
          {filteredJobPostings.map((job, index) => (
            <Accordion.Item
              eventKey={index.toString()}
              key={index}
              className="mb-2 border rounded"
            >
              {/* Header (Accordion Trigger) */}
              <Accordion.Header
                // onClick={() => toggleAccordion(index.toString())}
                onClick={() => toggleAccordion(index.toString(), job.requisition_id)}
              >
                <Row className="w-100 align-items-center">
                  <Col xs={12} md={4} className="d-flex align-items-center">
                    {/* <div className="bullet-columns d-flex me-2">
                  <div className="d-flex flex-column me-1">
                    <span className="job-bullet mb-1"></span>
                    <span className="job-bullet mb-1"></span>
                    <span className="job-bullet mb-1"></span>
                    <span className="job-bullet"></span>
                  </div>
                  <div className="d-flex flex-column">
                    <span className="job-bullet mb-1"></span>
                    <span className="job-bullet mb-1"></span>
                    <span className="job-bullet mb-1"></span>
                    <span className="job-bullet"></span>
                  </div>
                </div> */}
                    <Form.Check
                      type="checkbox"
                      className="form-check-orange me-2"
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
                    Start Date: {job.requisition_status}
                  </Col>

                  {/* <Col xs={6} md={2} className="d-flex justify-content-end align-items-center">
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" size="sm" className="border-0 bg-transparent p-0 custom-dropdown">
                    <EllipsisIcon />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>View Details</Dropdown.Item>
                    <Dropdown.Item>Edit</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item className="text-danger">Delete</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col> */}
                </Row>
              </Accordion.Header>

              {/* Body (Expandable Section) */}
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
                                // onClick={() => openModal(job, index)}
                                onClick={() => {
                                  setEditRequisitionId(job.requisition_id); // 👈 set the ID
                                  setEditPositionId(job.position_id);
                                  setShowModal(true);
                                }}
                                // onClick={() => navigate("/job-creation", { state: { job } })}
                              />
                              {/* <FontAwesomeIcon
                    icon={faTrash}
                    className="text-danger cursor-pointer"
                    // onClick={() => handleDelete(index)}
                  /> */}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {/* Add more fields if needed */}
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      {/* Job Posting Channels and Approval Status: Show only if selectedApproval is 'Submitted' */}
      {selectedApproval === "Submitted" && (
        <>
          {/* Job Posting Channels - Left Aligned */}
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

          {/* Approval Status */}
          <div className="d-flex align-items-center mb-4">
            <span className="postingfont me-3">Approved Status</span>
            <Form.Select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
              style={{ width: "auto", minWidth: "200px" }}
              className="ms-2"
            >
              <option value="">Select Status</option>
              <option value="approved">Direct Approval</option>
              <option value="workflow">Workflow</option>
            </Form.Select>
          </div>
        </>
      )}

      {/* Action Buttons: Show only if selectedApproval is 'Submitted' */}
      {selectedApproval === "Submitted" && (
        <div className="d-flex justify-content-end gap-3">
          <Button variant="outline-secondary">Cancel</Button>
          <Button
            style={{ backgroundColor: "#FF7043", borderColor: "#FF7043" }}
            className="text-white"
          >
            Save
          </Button>
        </div>
      )}

      <Modal show={showModal} onHide={resetForm} className="modal_container">
        <Modal.Header closeButton>
          <Modal.Title>{editIndex !== null ? "Edit Requisition" : "Add Requisition"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <JobCreation editRequisitionId={editRequisitionId} showModal={showModal} onClose={() => setShowModal(false)} editPositionId={editPositionId} />
        </Modal.Body>
        {/* <Modal.Footer>
          <Button variant="outline-secondary" onClick={resetForm}>Cancel</Button>
          <Button type="submit" className="text-white" onClick={handleSave} style={{ backgroundColor: '#FF7043', borderColor: '#FF7043' }}>
              {editIndex !== null ? "Update" : "Save"}
          </Button>
        </Modal.Footer> */}
      </Modal>
    </Container>
  );
};

export default JobPosting;
