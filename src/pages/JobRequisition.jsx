import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Table,
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";
import "../css/JobRequisition.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faTrash,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { apiService } from "../services/apiService";

const JobRequisition = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentReq, setCurrentReq] = useState({
    title: "",
    description: "",
    positions: "",
    startDate: "",
    endDate: "",
    comments: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  // Toast state removed
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const fetchRequistions = async () => {
      setLoading(true);
      setError(null);
      try {
        const responseData = await apiService.getReqData();
        if (responseData && Array.isArray(responseData.data)) {
          setReqs(responseData.data);
        } else {
          setError("Failed to fetch job postings: Unexpected data format.");
        }
      } catch (err) {
        if (err.response) {
          setError(`Failed to fetch job postings: Server Error ${err.response.status}`);
        } else if (err.request) {
          setError("Failed to fetch job postings: No response from server.");
        } else {
          setError(`Failed to fetch job postings: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRequistions();
  }, []);

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

  const handleDelete = (index) => {
    const updatedreqs = reqs.filter((_, i) => i !== index);
    setReqs(updatedreqs);
    showToast("Requisition deleted", "danger");
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

  const showToast = (message, variant) => {
    alert(message);
  };
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  const filteredAndSortedJobs = () => {
    let sortableItems = [...reqs];
    if (searchTerm) {
      sortableItems = sortableItems.filter((job) =>
        job.requisition_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested properties for sorting
        if (sortConfig.key === 'title') {
          aValue = a.requisition_title;
          bValue = b.requisition_title;
        } else if (sortConfig.key === 'description') {
          aValue = a.requisition_description;
          bValue = b.requisition_description;
        } else if (sortConfig.key === 'positions') {
          aValue = a.no_of_positions;
          bValue = b.no_of_positions;
        } else if (sortConfig.key === 'startDate') {
          aValue = new Date(a.requisition_start_date);
          bValue = new Date(b.requisition_start_date);
        } else if (sortConfig.key === 'endDate') {
          aValue = new Date(a.requisition_end_date);
          bValue = new Date(b.requisition_end_date);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  };
  
  const jobsToDisplay = filteredAndSortedJobs();

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Requisitions</h2>
        <Button variant="orange" onClick={() => openModal()}>
          + Add
        </Button>
      </div>

      <div className="mb-3">
        <InputGroup className="w-50">
          <InputGroup.Text>
            <FontAwesomeIcon icon={faSearch} />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>
      <hr />

      {jobsToDisplay.length === 0 ? (
        <p className="text-muted text-center mt-5">No requisitions match your criteria.</p>
      ) : (
        <Table responsive hover>
          <thead>
            <tr>
              <th onClick={() => handleSort('title')} style={{cursor: 'pointer'}}>
                Title{getSortIndicator('title')}
              </th>
              <th onClick={() => handleSort('description')} style={{cursor: 'pointer'}}>
                Description{getSortIndicator('description')}
              </th>
              <th onClick={() => handleSort('positions')} style={{cursor: 'pointer'}}>
                Positions{getSortIndicator('positions')}
              </th>
              <th onClick={() => handleSort('startDate')} style={{cursor: 'pointer'}}>
                Start Date{getSortIndicator('startDate')}
              </th>
              <th onClick={() => handleSort('endDate')} style={{cursor: 'pointer'}}>
                End Date{getSortIndicator('endDate')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobsToDisplay.map((job, index) => (
              <tr key={job._id}>
                <td>{job.requisition_title}</td>
                <td>{job.requisition_description}</td>
                <td>{job.no_of_positions}</td>
                <td>{job.requisition_start_date}</td>
                <td>{job.requisition_end_date}</td>
                <td>
                  <FontAwesomeIcon
                    icon={faPencil}
                    className="text-info me-3 cursor-pointer"
                    onClick={() => openModal(job, index)}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="text-danger cursor-pointer"
                    onClick={() => handleDelete(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editIndex !== null ? "Edit Requisition" : "Add Requisition"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="requisition-form">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentReq.title}
                    onChange={(e) => setCurrentReq({ ...currentReq, title: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={currentReq.description}
                  onChange={(e) => setCurrentReq({ ...currentReq, description: e.target.value })}
                />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={currentReq.endDate}
                    onChange={(e) => setCurrentReq({ ...currentReq, endDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={currentReq.startDate}
                    onChange={(e) => setCurrentReq({ ...currentReq, startDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>No. of Positions</Form.Label>
                  <Form.Control
                    type="number"
                    value={currentReq.positions}
                    onChange={(e) => setCurrentReq({ ...currentReq, positions: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Comments</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={currentReq.comments}
                    onChange={(e) => setCurrentReq({ ...currentReq, comments: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary" onClick={resetForm}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editIndex !== null ? "Update" : "Save"}
          </Button> */}

          <Button variant="outline-secondary" onClick={resetForm}>Cancel</Button>
                    <Button type="submit" className="text-white" onClick={handleSave} style={{ backgroundColor: '#FF7043', borderColor: '#FF7043' }}>
                       {editIndex !== null ? "Update" : "Save"}
                    </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast removed, using alert instead */}
    </div>
  );
};

export default JobRequisition;