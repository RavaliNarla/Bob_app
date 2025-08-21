// JobRequisition.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Table,
  InputGroup,
  Row,
  Col
} from "react-bootstrap";
import "../css/JobRequisition.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faTrash,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from "../services/apiService";

const API_BASE = "https://bobjava.sentrifugo.com:8443/jobcreation/api";

const JobRequisition = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentReq, setCurrentReq] = useState({
    requisition_title: "",
    requisition_description: "",
    no_of_positions: "",
    registration_start_date: "",
    registration_end_date: "",
    requisition_comments: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errr, setErrr] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getReqData();
      setReqs(res?.data);
    } catch (err) {
      setError("Failed to fetch requisitions.");
      console.error("GET Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (req = currentReq, index = null) => {
    setCurrentReq(req);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSave = () => {
    const newErrors = {};
    if (!currentReq.requisition_title?.trim()) {
      newErrors.requisition_title = "Title is required";
    }
    if (!currentReq.requisition_description?.trim()) {
      newErrors.requisition_description = "Description is required";
    }
    if (!currentReq.registration_start_date) {
      newErrors.registration_start_date = "Start date is required";
    }
    if (!currentReq.registration_end_date) {
      newErrors.registration_end_date = "End date is required";
    } else if (
      currentReq.registration_start_date &&
      new Date(currentReq.registration_end_date) < new Date(currentReq.registration_start_date)
    ) {
      newErrors.registration_end_date = "End date must be after start date";
    }
    if (!currentReq.no_of_positions || currentReq.no_of_positions <= 0) {
      newErrors.no_of_positions = "Number of Positions must be a positive number";
    }

    if (
      reqs.some(
        (req, idx) =>
          req.requisition_title.trim().toLowerCase() === currentReq.requisition_title.trim().toLowerCase() &&
          idx !== editIndex
      )
    ) {
      newErrors.requisition_title = "Title must be unique";
    }

    setErrr(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handleSaveCallback();
    }
  };

  const handleSaveCallback = async () => {
    try {
      if (editIndex !== null) {
        const updatedReq = {
          ...currentReq,
          requisition_id: reqs[editIndex].requisition_id,
        };
        const response= await apiService.updateRequisition(updatedReq);
        console.log("Response",response)
        if(response.success === true){
          toast.success("Requisition updated successfully");
          const updatedReqs = [...reqs];
          updatedReqs[editIndex] = updatedReq;
          setReqs(updatedReqs);
        }
       
      } else {
        const response= await apiService.createRequisition(currentReq);
        if(response.success === true){
          toast.success("Requisition added successfully");
        }
        fetchRequisitions();
      }
      resetForm();
    } catch (err) {
      toast.error("Save failed");
    }
  };

  const handleDelete = async (index) => {
    try {
      const id = reqs[index]?.requisition_id;
      const response= await apiService.deleteRequisition(id);
      if(response.success === true){
        toast.success("Requisition deleted successfully");
      }
      fetchRequisitions();
    } catch (err) {
      //console.error("Delete Error:", err.response?.data || err.message);
      toast.error("Delete failed");
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setCurrentReq({
      requisition_title: "",
      requisition_description: "",
      no_of_positions: "",
      registration_start_date: "",
      registration_end_date: "",
      requisition_comments: "",
    });
    setEditIndex(null);
    setErrr({});
  };

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

  const filteredAndSortedJobs = () => {
    let sortableItems = [...reqs];
    if (searchTerm) {
      sortableItems = sortableItems.filter((job) =>
        job.requisition_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (aValue == null || bValue == null) return 0;
        if (sortConfig.key.includes("date")) {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        return sortConfig.direction === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
          ? 1
          : -1;
      });
    }
    return sortableItems;
  };

  const jobsToDisplay = filteredAndSortedJobs();

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container my-3 fonsty">
      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fonall">Requisitions</h5>
      </div> */}

      {/* Search + Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <InputGroup className="w-50 fonreg">
          <InputGroup.Text style={{ backgroundColor: '#FF7043' }}>
            <FontAwesomeIcon icon={faSearch} style={{ color: '#fff' }} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search by Title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Button
          onClick={() => openModal()}
          style={{ backgroundColor: '#FF7043', borderColor: '#FF7043', color: '#fff' }}
        >
          + Add
        </Button>
      </div>

      {/* Error message (if API fails) */}
      {error && <div className="alert alert-danger my-2">{error}</div>}

      {/* Table */}
      <Table className="req_table" responsive hover>
        <thead className="table-header-orange">
          <tr>
            <th onClick={() => handleSort("requisition_title")} style={{ cursor: "pointer", width: "35%" }}>
              Requisition Title{getSortIndicator("requisition_title")}
            </th>
            <th onClick={() => handleSort("no_of_positions")} style={{ cursor: "pointer", width: "25%"  }}>
            Number of Positions{getSortIndicator("no_of_positions")}
            </th>
            <th onClick={() => handleSort("registration_start_date")} style={{ cursor: "pointer", width: "15%"  }}>
              Start Date{getSortIndicator("registration_start_date")}
            </th>
            <th onClick={() => handleSort("registration_end_date")} style={{ cursor: "pointer", width: "15%"  }}>
              End Date{getSortIndicator("registration_end_date")}
            </th>
            <th style={{width: "10%"  }}>Actions</th>
          </tr>
        </thead>

        <tbody className="table-body-orange">
          {jobsToDisplay.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No Requisitions added yet
              </td>
            </tr>
          ) : (
            jobsToDisplay.map((job, index) => (
              <tr key={job.requisition_id || index}>
                <td>{job.requisition_title}</td>
                <td>{job.no_of_positions}</td>
                <td>{job.registration_start_date}</td>
                <td>{job.registration_end_date}</td>
                <td>
                  <FontAwesomeIcon
                    icon={faPencil}
                    className="me-3 cursor-pointer"
                    style={{ color: '#0d6dfdd3', cursor: 'pointer' }}
                    onClick={() => openModal(job, index)}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="required-asterisk cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleDelete(index)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={resetForm}
        centered
        dialogClassName="wide-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-orange" style={{ fontSize: '18px' }}>
            {editIndex !== null ? "Edit Requisition" : "Add Requisition"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="requisition-form">
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    Requisition Title <span className="required-asterisk">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={currentReq.requisition_title}
                    isInvalid={!!errr.requisition_title}
                    onChange={(e) => {
                        setCurrentReq({ ...currentReq, requisition_title: e.target.value });
                        if (errr.requisition_title) {
                          setErrr({ ...errr, requisition_title: "" });
                        }
                      }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.requisition_title}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    Description <span className="required-asterisk">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={currentReq.requisition_description}
                    isInvalid={!!errr.requisition_description}
                    onChange={(e) => {
                      setCurrentReq({ ...currentReq, requisition_description: e.target.value });
                      if (errr.requisition_description) {
                        setErrr({ ...errr, requisition_description: "" });
                      }
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.requisition_description}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <div className="d-flex gap-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label">
                      Start Date <span className="required-asterisk">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={currentReq.registration_start_date}
                      isInvalid={!!errr.registration_start_date}
                      onChange={(e) => {
                        setCurrentReq({ ...currentReq, registration_start_date: e.target.value });
                        if (errr.registration_start_date) {
                          setErrr({ ...errr, registration_start_date: "" });
                        }
                      }}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errr.registration_start_date}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label">
                      End Date <span className="required-asterisk">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={currentReq.registration_end_date}
                      isInvalid={!!errr.registration_end_date}
                     onChange={(e) => {
                        setCurrentReq({ ...currentReq, registration_end_date: e.target.value });
                        if (errr.registration_end_date) {
                          setErrr({ ...errr, registration_end_date: "" });
                        }
                      }}
                      min={currentReq.registration_start_date || new Date().toISOString().split("T")[0]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errr.registration_end_date}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </div>

              <div className="d-flex gap-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label">
                      Number of Positions <span className="required-asterisk">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={currentReq.no_of_positions}
                      isInvalid={!!errr.no_of_positions}
                      
                     onChange={(e) => {
                      setCurrentReq({ ...currentReq, no_of_positions: e.target.value });
                      if (errr.no_of_positions) {
                        setErrr({ ...errr, no_of_positions: "" });
                      }
                    }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errr.no_of_positions}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label">Comments</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={currentReq.requisition_comments}
                      onChange={(e) =>
                        setCurrentReq({ ...currentReq, requisition_comments: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </div>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer className="justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            className="text-white"
            onClick={handleSave}
            style={{ backgroundColor: "#FF7043", borderColor: "#FF7043" }}
          >
            {editIndex !== null ? "Update Requisition" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JobRequisition;
