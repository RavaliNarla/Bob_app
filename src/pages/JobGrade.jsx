// JobGrade.js
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
import "../css/JobGrade.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faTrash,
  faSearch
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = "http://docs.sentrifugo.com:8080/master/api";

const JobGrade = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentGrade, setCurrentGrade] = useState({
    job_grade_code: "",
    job_grade_desc: "",
    job_scale: "",
    min_salary: "",
    max_salary: ""
  });
  const [editIndex, setEditIndex] = useState(null);
  const [grads, setGrads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errr, setErrr] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchGrade();
  }, []);

  const fetchGrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/jobgrade/all`);
      setGrads(res.data.data || res.data); // adjust if API returns differently
    } catch (err) {
      setError("Failed to fetch Grade.");
      console.error("GET Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (req = { job_grade_code: "", job_grade_desc: "", job_scale: "",min_salary: "", max_salary: "" }, index = null) => {
    setCurrentGrade(req);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSave = () => {
    const newErrors = {};
    
    if (!currentGrade.job_grade_code?.trim()) {
      newErrors.job_grade_code = "Code is required";
    }
    
     if (!currentGrade.job_scale?.trim()) {
      newErrors.job_scale = "Scale is required";
    }
    if (!currentGrade.job_grade_desc?.trim()) {
      newErrors.job_grade_desc = "Description is required";
    }
    if (!String(currentGrade.min_salary)?.trim()) {
    newErrors.min_salary = "Minimum salary is required";
    }
    if (!String(currentGrade.max_salary)?.trim()) {
    newErrors.max_salary = "Maximum salary is required";
    }

    setErrr(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handleSaveCallback();
    }
  };

  const handleSaveCallback = async () => {
    try {
      if (editIndex !== null) {
        const updatedGrad = {
          ...currentGrade,
          job_grade_id: grads[editIndex].job_grade_id,
        };

        await axios.put(`${API_BASE}/jobgrade/update/${updatedGrad.job_grade_id}`, updatedGrad);

        toast.info("Grade updated successfully");

        const updatedGrads = [...grads];
        updatedGrads[editIndex] = updatedGrad;
        setGrads(updatedGrads);
      } else {
        console.log("Adding new Grade:", currentGrade);
        const response = await axios.post(`${API_BASE}/jobgrade/add`, currentGrade);
        const newGrad = response.data?.data || currentGrade;

        toast.success("Grade added successfully");
        setGrads(prev => [...prev, newGrad]);
      }
      resetForm();
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("Save failed");
    }
  };

  const handleDelete = async (index) => {
    const idToDelete = grads[index]?.job_grade_id;

    try {
      await axios.delete(`${API_BASE}/jobgrade/delete/${idToDelete}`);
      setGrads(grads.filter((grad) => grad.job_grade_id !== idToDelete));
      toast.error("Grade deleted");
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Delete failed");
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setCurrentGrade({ job_grade_code: "", job_grade_desc: "", job_scale: "", min_salary: "", max_salary: "", max_salary: "" });
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
    let filteredItems = [...grads];

    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(
        (grad) =>
          grad.job_grade_code?.toLowerCase().includes(lowerTerm) ||
          grad.job_grade_desc?.toLowerCase().includes(lowerTerm) ||
          grad.job_scale?.toLowerCase().includes(lowerTerm) ||
          String(grad.min_salary)?.toLowerCase().includes(lowerTerm) ||
          String(grad.max_salary)?.toLowerCase().includes(lowerTerm)
      );
    }

    if (sortConfig.key !== null) {
      filteredItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (aValue == null || bValue == null) return 0;
        if (sortConfig.key.includes("date")) {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        return sortConfig.direction === "asc"
          ? aValue > bValue ? 1 : -1
          : aValue < bValue ? 1 : -1;
      });
    }

    return filteredItems;
  };

  const jobsToDisplay = filteredAndSortedJobs();

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="container mt-5 gradefont">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Grade</h2>
        <Button variant="orange" onClick={() => openModal()}>+ Add</Button>
      </div>

      <InputGroup className="mb-3 w-50">
        <InputGroup.Text>
          <FontAwesomeIcon icon={faSearch} />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>
      <hr />

      {jobsToDisplay.length === 0 ? (
        <p className="text-muted text-center mt-5">No Grade match your criteria.</p>
      ) : (
        <Table responsive hover>
          <thead className="table-header-orange">
            <tr>
              <th onClick={() => handleSort("job_grade_code")} style={{ cursor: "pointer", width: "20%" }}>
                Code{getSortIndicator("job_grade_code")}
              </th>
              <th onClick={() => handleSort("job_grade_desc")} style={{ cursor: "pointer" ,width: "40%"}}>
                Description{getSortIndicator("job_grade_desc")}
              </th>
              <th onClick={() => handleSort("job_scale")} style={{ cursor: "pointer", width: "10%"}}>
                Scale{getSortIndicator("job_scale")}
              </th>
              <th onClick={() => handleSort("min_salary")} style={{ cursor: "pointer", width: "15%"}}>
                Minimum Salary{getSortIndicator("min_salary")}
              </th>
              <th onClick={() => handleSort("max_salary")} style={{ cursor: "pointer", width: "15%" }}>
                Maximum Salary{getSortIndicator("max_salary")}
              </th>
              
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {jobsToDisplay.map((job, index) => (
              <tr key={job.job_grade_id || index}>
                <td>{job.job_grade_code}</td>
                <td>{job.job_grade_desc}</td>
                <td>{job.job_scale}</td>
                <td>{job.min_salary}</td>
                <td>{job.max_salary}</td>
                <td>
                  <FontAwesomeIcon icon={faPencil} className="text-info me-3 cursor-pointer" onClick={() => openModal(job, index)} />
                  <FontAwesomeIcon icon={faTrash} className="text-danger cursor-pointer" onClick={() => handleDelete(index)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* MODAL */}
      <Modal show={showModal} onHide={resetForm} centered dialogClassName="wide-modal">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-orange fs-4">
            {editIndex !== null ? "Edit Grade" : "Add Grade"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="grade-form">
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    Grade Code <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter grade code"
                    value={currentGrade.job_grade_code}
                    isInvalid={!!errr.job_grade_code}
                    onChange={(e) =>
                      setCurrentGrade({ ...currentGrade, job_grade_code: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.job_grade_code}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    Description <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter description"
                    value={currentGrade.job_grade_desc}
                    isInvalid={!!errr.job_grade_desc}
                    onChange={(e) =>
                      setCurrentGrade({ ...currentGrade, job_grade_desc: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.job_grade_desc}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    Scale <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter scale"
                    value={currentGrade.job_scale}
                    isInvalid={!!errr.job_scale}
                    onChange={(e) =>
                      setCurrentGrade({ ...currentGrade, job_scale: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.job_scale}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    Minimum Salary <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter minimum salary"
                    value={currentGrade.min_salary}
                    isInvalid={!!errr.min_salary}
                    onChange={(e) =>
                      setCurrentGrade({ ...currentGrade, min_salary: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.min_salary}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    Maximum Salary <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter maximum salary"
                    value={currentGrade.max_salary}
                    isInvalid={!!errr.max_salary}
                    onChange={(e) =>
                      setCurrentGrade({ ...currentGrade, max_salary: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.max_salary}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
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
            {editIndex !== null ? "Update Grade" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JobGrade;
