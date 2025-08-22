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
      //const responseData = await axios.get('http://192.168.20.111:8080/api/getreq');
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
  const fetchRequisitionDetails = async (requisitionId) => {
    try {
      const data = await apiService.getByRequisitionId(requisitionId);
      setApiData(data?.data || []); // ✅ always an array
    } catch (error) {
      console.error("Error fetching requisition details:", error);
      setApiData([]); // fallback to empty array
    }
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
    (job.requisition_title?.toLowerCase() ?? "").includes(search) ||
    (job.requisition_code?.toLowerCase() ?? "").includes(search);

  let matchesApproval = true;

  if (selectedApproval !== "") {
    if (selectedApproval === "Pending") {
      matchesApproval =
        job.requisition_status === "Pending L1 Approval" ||
        job.requisition_status === "Pending L2 Approval";
    } else {
      matchesApproval = job.requisition_status === selectedApproval;
    }
  }
  return matchesSearch && matchesApproval;
});



  return (
    <Container fluid className="p-4 px-5 fonsty">
      <h5 className="pb-3" style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '18px !important', color: '#FF7043', marginBottom: '0px' }}>Job Postings</h5>
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap">
        <div className="d-flex align-items-center mb-2 mb-md-0">
          <h5 className="header me-3" style={{ marginBottom: "0.25rem" }}>
           Select Status
          </h5>
          <Form.Select
            value={selectedApproval}
            onChange={(e) => {
              setSelectedApproval(e.target.value);
              setActiveKey(null); // close all accordions when filter changes
            }}
            style={{ width: "200px"}}
            className="fonreg dropdowntext"
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
              placeholder="Search by Title"
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
          ) : filteredJobPostings.length === 0 ? (
          <div className="text-center text-muted py-4">
                 No requisitions found for the selected filter.
          </div>
          ) :(
        <Accordion activeKey={activeKey}>
      
          {filteredJobPostings.map((job, index) => (
            <Accordion.Item eventKey={index.toString()} key={index} className="mb-2 border rounded">
          <Accordion.Header onClick={() => toggleAccordion(index.toString(), job.requisition_id)}>
  <Row className="w-100 align-items-center fontreg">
    
    {/* Left side: Checkbox + Title + Requisition + Status */}
    <Col xs={12} md={6} className="d-flex align-items-start mb-2 mb-md-0">
      <Form.Check
        type="checkbox"
        className="form-check-orange me-2 mt-1"
        checked={selectedJobIds.includes(job.requisition_id)}
        onChange={(e) => handleJobSelection(e, job.requisition_id)}
        onClick={(e) => e.stopPropagation()}
        disabled={job.count === 0 || job.requisition_status !== "Submitted"} 
      />
      <div className="fontcard">
        <div className=" text-dark mb-1">
          Title: {job.requisition_title}
        </div>
        <div className="text-muted mb-1 boldnes">
          <b>Requisition:</b> {job.requisition_code} ({job.requisition_status})
          
        </div>
      </div>
    </Col>

    {/* Right side: Expected/Added Positions + Postings */}
    <Col xs={12} md={6} className="d-flex flex-column fontcard">
      {/* Row 1 */}
      <div className="d-flex">
        <div className="boldnes">
           <b>Postings:</b>{" "}
          {job.job_postings
            ? job.job_postings
                .split(",") // split into array
                .map(
                  (item) =>
                    item.charAt(0).toUpperCase() + item.slice(1) // capitalize each
                )
                .join(", ") // join back with comma + space
            : "NA"}
        </div>
      </div>
      {/* Row 2 */}
       <div className="d-flex mb-1 mt-1">
        <div className="me-4 boldnes">
          <b>Expected Positions:</b> {job.no_of_positions}&nbsp;|&nbsp;
          <b>Added Positions:</b> {job.count ? job.count : "0"}

        </div>
        
      </div>
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
                          <th>Positions</th>
                          <th onClick={() => handleSort("startDate")} style={{ cursor: "pointer" }}>
                            Experience{getSortIndicator("startDate")}
                          </th>
                          {/* <th onClick={() => handleSort("endDate")} style={{ cursor: "pointer" }}>
                            Status{getSortIndicator("endDate")}
                          </th> */}
                          <th>{
                                job.requisition_status==='Submitted' &&'Actions'}</th>
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
                            <td colSpan="7" className="text-center text-muted py-3">No positions added yet</td>
                          </tr>
                        ) : (
                          apiData.map((row, index) => (
                            <tr key={row.position_id || index}>
                              <td>{row.position_title}</td>
                              <td>{row.description}</td>
                              <td>{row.position_code}</td>
                              <td>{row.no_of_vacancies ?? '-'}</td>
                              <td>{row.mandatory_experience}</td>
                              {/* <td>{row.position_status}</td> */}
                              {/* <td>
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
                              </td> */}
                               <td>{
                                job.requisition_status==='Submitted' && (
                                  <FontAwesomeIcon
                                    icon={faPencil}
                                    className="text-info me-3 cursor-pointer"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setEditRequisitionId(row.requisition_id);
                                      setEditPositionId(row.position_id);
                                      setShowModal(true);
                                    }}
                                  />
                                )
                              }</td>
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
              style={{ width: "auto", minWidth: "200px", fontWeight: "300" }}
              className="ms-2"
            >
              <option value="">Select Status</option>
              <option value="Direct Approval">Direct Approval</option>
              <option value="Workflow">Workflow</option>
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
            onUpdateSuccess={() => {
              // 🔥 Immediately refresh requisition details after update
              if (editRequisitionId) {
               // toggleAccordion(activeKey, editRequisitionId);
                 // ✅ Re-fetch data but keep accordion open
                  fetchRequisitionDetails(editRequisitionId);
              } else {
                fetchJobPostings();
              }
            }}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default JobPosting;
