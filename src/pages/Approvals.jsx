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
import "../css/Approvals.css";
import { apiService } from "../services/apiService";
import { faEye, faPencil, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import JobCreation from "./JobCreation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const Approvals = () => {
  const user = useSelector((state) => state?.user?.user);
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [apiData, setApiData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [editRequisitionId, setEditRequisitionId] = useState(null);
  const [editPositionId, setEditPositionId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectDescription, setRejectDescription] = useState("");
  const [workflowApprovals, setWorkflowApprovals] = useState([]);
  // Toggle accordion and fetch requisition details
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
    } else {
      setApiData([]);
      setTableLoading(false);
    }
  };

  // Fetch requisitions and positions based on user's role
   const fetchJobPostings = async () => {
    if (!user || !user.role) {
      setError("User role not found. Cannot fetch data.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // ✅ get job postings
      const responseData = await apiService.getApprovalstatus(user.userid);
      if (responseData && Array.isArray(responseData.data)) {
        setJobPostings(responseData.data);
      } else {
        setError("No Approvals: Unexpected data format.");
      }

      // ✅ get workflow approvals
      const approvalsRes = await apiService.getWorkflowApprovals(user.userid);
      if (approvalsRes && Array.isArray(approvalsRes.data)) {
        setWorkflowApprovals(approvalsRes.data);
      }
    } catch (err) {
      console.error("Error fetching job postings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userid) {
      fetchJobPostings();
    }
  }, [user]);

  // Checkbox selection
  const handleJobSelection = (e, requisitionId) => {
    if (e.target.checked) {
      setSelectedJobIds([...selectedJobIds, requisitionId]);
    } else {
      setSelectedJobIds(selectedJobIds.filter((id) => id !== requisitionId));
    }
  };

  // Sorting
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

  const resetForm = () => {
    setShowModal(false);
    setEditRequisitionId(null);
  };

  // Search
  const filteredJobPostings = jobPostings.filter((job) => {
    const search = searchTerm.toLowerCase();
    return (
      job.requisition_title.toLowerCase().includes(search) ||
      job.requisition_code.toLowerCase().includes(search)
    );
  });

  const handleApprove = async () => {
    if (selectedJobIds.length === 0) {
      toast.info("Please select at least one requisition to approve.");
      return;
    }

    const payload = {
    
      requisitionIdList: selectedJobIds,
      status: "approved",
      description: rejectDescription,
      userId: user.userid,
    };
    
    try {
      await apiService.updateApproval(payload);
      toast.success(`Approved ${selectedJobIds.length} requisitions successfully`);

      // setJobPostings((prev) =>
      //   prev.filter((job) => !selectedJobIds.includes(job.requisition_id))
      // );

       fetchJobPostings();
      setSelectedJobIds([]);
    } catch (err) {
      console.error("Error updating approval:", err);
      toast.error("Failed to approve requisition(s)");
    }
  };

  const handleReject = () => {
    if (selectedJobIds.length === 0) {
      toast.info("Please select at least one requisition to reject.");
      return;
    }
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectDescription.trim()) {
      toast.error("Please enter a description before rejecting");
      return;
    }
    if (!user) {
      toast.error("User information not available.");
      return;
    }
    
    const payload = {
      role: user.role,
      requisitionId: selectedJobIds,
      status: "REJECTED",
      description: rejectDescription,
      userid: user.userid,
    };
    

    try {
      await apiService.updateApproval(payload);
      toast.success(
        `Rejected ${selectedJobIds.length} requisitions with reason: ${rejectDescription}`
      );

      setJobPostings((prev) =>
        prev.filter((job) => !selectedJobIds.includes(job.requisition_id))
      );
      
      // fetchJobPostings();
      setSelectedJobIds([]);
      setRejectDescription("");
      setShowRejectModal(false);
    } catch (err) {
      console.error("Error rejecting requisition:", err);
      toast.error("Failed to reject requisition(s)");
    }
  };

  const cancelReject = () => {
    setShowRejectModal(false);
    setRejectDescription("");
  };

  return (
    <Container fluid className="p-4 approvals_tab">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap">
              {/* <div className="d-flex align-items-center mb-2 mb-md-0">
                <h5 className="fonall me-3" style={{ marginBottom: "0.25rem" }}>
                  My Approvals
                </h5>
                
              </div> */}

        <div className="col-md-12 search-container fonreg">
          <InputGroup className="searchinput">
            <InputGroup.Text style={{ backgroundColor: "#FF7043" }}>
              <FontAwesomeIcon icon={faSearch} style={{ color: "#fff" }} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by Title"
              value={searchTerm}
              className="title"
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
                    No records for approval.
             </div>
             )  : (
        <Accordion activeKey={activeKey}>
          {filteredJobPostings.map((job, index) => {
            const approval = workflowApprovals.find(
                (a) => a.entityId === job.requisition_id
              );
           return  (
            <Accordion.Item
              eventKey={index.toString()}
              key={index}
              className="mb-2 border rounded"
            >
              <Accordion.Header
                onClick={() =>
                  toggleAccordion(index.toString(), job.requisition_id)
                }
              >
                <Row className="w-100 align-items-center fontreg ">
                  <Col xs={12} md={4} className="d-flex align-items-center ">
                    <Form.Check
                      type="checkbox"
                      className="form-check-orange me-2"
                      checked={selectedJobIds.includes(job.requisition_id)}
                      onChange={(e) => handleJobSelection(e, job.requisition_id)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={(approval ? approval.action : job.requisition_status)?.toLowerCase() === "approved"}
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
                  <Col xs={6} md={3} className="job-detail">
             
                    <span>
                        Status: {approval ? approval.action : job.requisition_status}
                      </span>
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
                        {tableLoading ? (
                          <tr>
                            <td colSpan="6" className="text-center py-3">
                              <Spinner animation="border" size="sm" />{" "}
                              Loading positions...
                            </td>
                          </tr>
                        ) : !apiData || apiData.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center text-muted py-3">
                              No positions added yet
                            </td>
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
                                  icon={faEye}
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
          )
          })}
        </Accordion>
      )}

      {/* Approve / Reject buttons */}
       {filteredJobPostings.length > 0 && (
        <div className="d-flex justify-content-end mt-4 gap-2">
          
          <Button
            variant="danger"
            disabled={selectedJobIds.length === 0}
            onClick={handleReject}
          >
            Reject
          </Button>
          <Button
            variant="success"
            disabled={selectedJobIds.length === 0}
            onClick={handleApprove}
          >
            Approve
          </Button>
        </div>
      )}

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={cancelReject} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Requisition</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter reason for rejection..."
              value={rejectDescription}
              onChange={(e) => setRejectDescription(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelReject}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmReject}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Job Creation Modal */}
      <Modal show={showModal} onHide={resetForm} className="modal_container">
        <Modal.Header closeButton>
          <Modal.Title className="fonall">
            {editRequisitionId !== null
              ? "Edit Job Posting"
              : "Add Job Posting"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <JobCreation
            editRequisitionId={editRequisitionId}
            showModal={showModal}
            onClose={() => setShowModal(false)}
            editPositionId={editPositionId}
            readOnly={true}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Approvals;