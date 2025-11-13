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
  const [readOnly, setReadOnly] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

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
      // console.log("Job Postings Response:", responseData);

      if (responseData && Array.isArray(responseData.data)) {
        // 🔽 Sort by requisition_code in descending order
        const sortedData = responseData.data.sort((a, b) => {
          const numA = parseInt(a.requisition_code.replace(/\D/g, ""), 10);
          const numB = parseInt(b.requisition_code.replace(/\D/g, ""), 10);
          return numB - numA; // Descending
        });

        setJobPostings(sortedData);
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

  // Search and Status filtering
  const filteredApprovals = workflowApprovals.filter((approval) => {
    const job = jobPostings.find((j) => j.requisition_id === approval.entityId);
    if (!job) return false;

    const matchesSearch =
      job.requisition_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requisition_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !selectedStatus ||
      (approval.action || job.requisition_status)
        .toLowerCase()
        .includes(selectedStatus.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // 🔽 Sort descending by requisition_code
  const sortedApprovals = [...filteredApprovals].sort((a, b) => {
    const jobA = jobPostings.find((j) => j.requisition_id === a.entityId);
    const jobB = jobPostings.find((j) => j.requisition_id === b.entityId);

    if (!jobA || !jobB) return 0;

    const numA = parseInt(jobA.requisition_code.replace(/\D/g, ""), 10);
    const numB = parseInt(jobB.requisition_code.replace(/\D/g, ""), 10);

    return numB - numA; // Descending
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
      requisitionIdList: selectedJobIds,
      status: "rejected",
      description: rejectDescription,
      userId: user.userid,
    };

    try {
      await apiService.updateApproval(payload);
      toast.success(`Rejected the requisition(s) successfully.`);
      setJobPostings((prev) =>
        prev.filter((job) => !selectedJobIds.includes(job.requisition_id))
      );
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
      <div className="d-flex flex-row align-items-end justify-content-between mb-3">
        <div className="d-flex align-items-end gap-5 mb-2 mb-md-0">
          <div className="d-flex flex-row align-items-center">
            <h5 className="header me-2" style={{ marginBottom: "0.25rem" }}>
              Select Status
            </h5>
            <Form.Select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setActiveKey(null);
              }}
              style={{ width: "200px" }}
              className="fonreg dropdowntext"
            >
              <option value="">All</option>
              <option value="Pending">Pending for Approval</option>
              <option value="Approved">Approved</option>
            </Form.Select>
          </div>
        </div>

        <div className="col-md-6 search-container fonreg">
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
      ) : filteredApprovals.length === 0 ? (
        <div className="text-center text-muted py-4">No records for approval.</div>
      ) : (
        <Accordion activeKey={activeKey}>
          {sortedApprovals.map((approval, index) => {
            const job = jobPostings.find((j) => j.requisition_id === approval.entityId);
            return (
              <Accordion.Item
                eventKey={index.toString()}
                key={`${job.requisition_id}-${index}`}
                className="mb-2 border rounded list"
              >
                <Accordion.Header onClick={() => toggleAccordion(index.toString(), job.requisition_id)}>
                  <Row className="w-100 align-items-center fontreg">
                    <Col xs={12} md={6} className="d-flex align-items-start mb-2 mb-md-0">
                      <Form.Check
                        type="checkbox"
                        className="form-check-orange me-2 mt-1"
                        checked={selectedJobIds.includes(job.requisition_id)}
                        onChange={(e) => handleJobSelection(e, job.requisition_id)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={(approval.action || job.requisition_status).toLowerCase() === "approved"}
                      />
                      <div className="fontcard">
                        <div className="text-dark mb-1">Title: {job.requisition_title}</div>
                        <div className="text-muted mb-1 boldnes">
                          <b>Requisition:</b> {job.requisition_code} (
                          {approval.action === "Pending" ? "Pending for Approval" : approval.action || job.requisition_status})
                        </div>
                      </div>
                    </Col>

                    <Col xs={12} md={5} className="d-flex flex-column fontcard">
                      <div className="d-flex">
                        <div className="boldnes">
                          <b>Postings:</b>{" "}
                          {job.job_postings
                            ? job.job_postings
                                .split(",")
                                .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
                                .join(", ")
                            : "Not Posted"}
                        </div>
                      </div>

                      <div className="d-flex mb-1 mt-1">
                        <div className="me-4 boldnes">
                          <b>Start Date:</b> {job.registration_start_date} &nbsp;&nbsp;|&nbsp;&nbsp;
                          <b>End Date:</b> {job.registration_end_date}
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
                              Position {getSortIndicator("title")}
                            </th>
                            <th onClick={() => handleSort("positions")} style={{ cursor: "pointer" }}>
                              Position Code {getSortIndicator("positions")}
                            </th>
                            <th onClick={() => handleSort("description")} style={{ cursor: "pointer" }}>
                              Grade {getSortIndicator("description")}
                            </th>
                            <th>Vacancies</th>
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
                          ) : !apiData || apiData.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center text-muted py-3">
                                No positions added yet
                              </td>
                            </tr>
                          ) : (
                            apiData.map((row, i) => (
                              <tr key={row.position_id || i}>
                                <td>{row.position_title}</td>
                                <td>{row.position_code}</td>
                                <td>{row.grade_id}</td>
                                <td>{row.no_of_vacancies ?? "-"}</td>
                                <td>
                                  {job.requisition_status === "New" ? (
                                    <FontAwesomeIcon
                                      icon={faPencil}
                                      className="text-info me-3 cursor-pointer iconhover"
                                      onClick={() => {
                                        setEditRequisitionId(row.requisition_id);
                                        setEditPositionId(row.position_id);
                                        setShowModal(true);
                                        setReadOnly(false);
                                      }}
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faEye}
                                      className="text-info me-3 cursor-pointer iconhover"
                                      onClick={() => {
                                        setEditRequisitionId(row.requisition_id);
                                        setEditPositionId(row.position_id);
                                        setShowModal(true);
                                        setReadOnly(true);
                                      }}
                                    />
                                  )}
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
            );
          })}
        </Accordion>
      )}

      {/* Approve / Reject buttons */}
      {filteredApprovals.length > 0 && (
        <div className="d-flex justify-content-end mt-4 gap-2">
          <Button variant="danger" disabled={selectedJobIds.length === 0} onClick={handleReject}>
            Reject
          </Button>
          <Button variant="success" disabled={selectedJobIds.length === 0} onClick={handleApprove}>
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
            {editRequisitionId !== null ? "View Job Posting" : "Add Job Posting"}
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
