import React, { useState,useEffect } from "react";
import { Modal, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import "../css/JobRequisition.css";
import { Card, Row, Col, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { apiService } from '../services/apiService';
const JobRequisition = () => {


  const [showModal, setShowModal] = useState(false);
  const [currentReq, setCurrentReq] = useState({ title: "", description: "", positions: "", startDate: "", endDate: "", comments: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });

  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const openModal = (req = { title: "", description: "", positions: "", startDate: "", endDate: "", comments: "" }, index = null) => {
    setCurrentReq(req);
    setEditIndex(index);
    setShowModal(true);
  };
useEffect(() => {
      const fetchJobPostings = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log('Attempting to fetch job postings...');
          const responseData = await apiService.getReqData(); 

          console.log('API Response Data:', responseData.data);
          
          // Ensure the response has a `data` property that is an array
          if (responseData && Array.isArray(responseData.data)) {
            console.log('Successfully received job postings:', responseData.data.length);
            setJobPostings(responseData.data);
          } else {
            // This block will catch unexpected response formats
            console.error('API response format is incorrect:', responseData);
            setError('Failed to fetch job postings: Unexpected data format.');
          }
  
        } catch (err) {
          // This is the most crucial part to debug
          console.error("Caught an error during API call:", err);
          
          // Log the details of the error object
          if (err.response) {
            // Server responded with a status other than 2xx
            console.error("Error Response Status:", err.response.status);
            console.error("Error Response Data:", err.response.data);
            setError(`Failed to fetch job postings: Server Error ${err.response.status}`);
          } else if (err.request) {
            // Request was made but no response was received
            console.error("Error Request:", err.request);
            setError('Failed to fetch job postings: No response from server.');
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
  const handleSave = () => {
    if (!currentReq.title || !currentReq.description || !currentReq.positions || !currentReq.startDate || !currentReq.endDate) return;
    let updatedjobPostings = [...jobPostings];

    if (editIndex !== null) {
      updatedjobPostings[editIndex] = currentReq;
      setJobPostings(updatedjobPostings);
      showToast("Requisition updated successfully", "info");
    } else {
      updatedjobPostings.push({ ...currentReq, _id: Date.now().toString() });
      setJobPostings(updatedjobPostings);
      showToast("Requisition added successfully", "success");
    }

    resetForm();
  };

  const handleDelete = (index) => {
    const updatedjobPostings = jobPostings.filter((_, i) => i !== index);
    setJobPostings(updatedjobPostings);
    showToast("Requisition deleted", "danger");
  };

  const resetForm = () => {
    setShowModal(false);
    setCurrentReq({ title: "", description: "", positions: "", startDate: "", endDate: "", comments: "" });
    setEditIndex(null);
  };

  const showToast = (message, variant) => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Requisitions</h2>
        <button className="btn btn-orange" onClick={() => openModal()}>+ Add</button>
      </div>

      <Card className="border-0 mb-4">
  {jobPostings.length === 0 ? (
    <p className="text-muted px-3">No requisitions added yet.</p>
  ) : (
    jobPostings.map((job, index) => (
      <Row key={index} className="job-row border-bottom py-2 align-items-center text-muted px-3">

        {/* Left: Bullets + Checkbox + Title/Description */}
        <Col xs={12} md={5} className="d-flex align-items-center">
          <div className="bullet-columns d-flex me-2">
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
          </div>
          <Form.Check type="checkbox" className="form-check-orange me-2" />
          <div>
            <div className="fw-semibold text-dark">{job.requisition_title}</div>
            <div className="text-muted small">{job.requisition_description}</div>
          </div>
        </Col>

        {/* Center: No. of Positions */}
        <Col xs={6} md={2} className="job-detail">
          Positions: {job.no_of_positions}
        </Col>

        {/* Right: Start/End Dates + Dropdown */}
        <Col xs={6} md={3} className="d-flex justify-content-end align-items-center">
          <div className="me-4 text-end small text-secondary">
            <div><strong>From:</strong> {job.requisition_start_date}</div>
            <div><strong>To:</strong> {job.requisition_end_date}</div>
          </div>
          {/* <Dropdown align="end">
            <Dropdown.Toggle variant="light" size="sm" className="border-0 bg-transparent p-0 custom-dropdown">
              <i className="fas fa-ellipsis-h text-dark"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => openModal(job, index)}>Edit</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-danger" onClick={() => handleDelete(index)}>Delete</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown> */}

        </Col>
        <Col xs={6} md={2} className="d-flex justify-content-end align-items-center">
          <div className="d-flex gap-4" >
          <Col xs={6} md={1} className="editanddelete">
                                        <FontAwesomeIcon onClick={() => openModal(job, index)} icon={faPencil} style={{ fontSize: '12px' }} />
                    
                  </Col>
                  <Col xs={6} md={1} className="editanddelete">
                                        <FontAwesomeIcon onClick={() => handleDelete(index)} icon={faTrash} style={{ fontSize: '12px' }} />
                    
                  </Col>
          </div>
          </Col>
      </Row>
    ))
  )}
</Card>

      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editIndex !== null ? "Edit Requisition" : "Add Requisition"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="requisition-form">
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={currentReq.title}
                onChange={(e) => setCurrentReq({ ...currentReq, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={currentReq.description}
                onChange={(e) => setCurrentReq({ ...currentReq, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>No. of Positions</Form.Label>
              <Form.Control
                type="number"
                value={currentReq.positions}
                onChange={(e) => setCurrentReq({ ...currentReq, positions: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={currentReq.startDate}
                onChange={(e) => setCurrentReq({ ...currentReq, startDate: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={currentReq.endDate}
                onChange={(e) => setCurrentReq({ ...currentReq, endDate: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={currentReq.comments}
                onChange={(e) => setCurrentReq({ ...currentReq, comments: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
          <button className="btn btn-orange" onClick={handleSave}>
            {editIndex !== null ? "Update" : "Save"}
          </button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast show={toast.show} bg={toast.variant} onClose={() => setToast({ ...toast, show: false })} delay={3000} autohide>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default JobRequisition;
