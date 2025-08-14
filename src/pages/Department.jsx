// Jobdepartment.js
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
import "../css/Department.css";
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

const Department = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentDept, setCurrentDept] = useState({
    department_name: "",
    department_desc: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errr, setErrr] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchDepartment();
  }, []);

  const fetchDepartment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/departments/all`);
      setDepts(res.data.data || res.data); // adjust if API returns differently
    } catch (err) {
      setError("Failed to fetch Department.");
      console.error("GET Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (req = { department_name: "", department_desc: "" }, index = null) => {
    setCurrentDept(req);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSave = () => {
    const newErrors = {};
    if (!currentDept.department_name?.trim()) {
      newErrors.department_name = "Name is required";
    }
    if (!currentDept.department_desc?.trim()) {
      newErrors.department_desc = "Description is required";
    }
    setErrr(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handleSaveCallback();
    }
  };

  const handleSaveCallback = async () => {
    try {
      if (editIndex !== null) {
        const updatedDept = {
          ...currentDept,
          department_id: depts[editIndex].department_id,
        };

        await axios.put(`${API_BASE}/departments/update/${updatedDept.department_id}`, updatedDept);

        toast.info("Department updated successfully");

        const updatedDepts = [...depts];
        updatedDepts[editIndex] = updatedDept;
        setDepts(updatedDepts);
      } else {
        console.log("Adding new department:", currentDept);
        const response = await axios.post(`${API_BASE}/departments/add`, currentDept);
        const newDept = response.data?.data || currentDept;

        toast.success("Department added successfully");
        setDepts(prev => [...prev, newDept]);
      }
      resetForm();
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("Save failed");
    }
  };

  const handleDelete = async (index) => {
    const idToDelete = depts[index]?.department_id;

    try {
      await axios.delete(`${API_BASE}/departments/delete/${idToDelete}`);
      setDepts(depts.filter((dept) => dept.department_id !== idToDelete));
      toast.error("Department deleted");
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Delete failed");
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setCurrentDept({ department_name: "", department_desc: "" });
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
    let filteredItems = [...depts];

    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(
        (dept) =>
          dept.department_name?.toLowerCase().includes(lowerTerm) ||
          dept.department_desc?.toLowerCase().includes(lowerTerm)
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
    <div className="container mt-5 deptfon">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Department</h2>
        <Button variant="orange" onClick={() => openModal()}>+ Add</Button>
      </div>

      <InputGroup className="mb-3 w-50">
        <InputGroup.Text style={{ backgroundColor: '#FF7043' }}>
          <FontAwesomeIcon icon={faSearch} style={{ color: '#fff' }}/>
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
        <p className="text-muted text-center mt-5">No Department match your criteria.</p>
      ) : (
        <Table responsive hover>
          <thead className="table-header-orange">
            <tr>
              <th onClick={() => handleSort("department_name")} style={{ cursor: "pointer", width: "40%" }}>
                Name{getSortIndicator("department_name")}
              </th>
              <th onClick={() => handleSort("department_desc")} style={{ cursor: "pointer", width: "52%" }}>
                Description{getSortIndicator("department_desc")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {jobsToDisplay.map((job, index) => (
              <tr key={job.department_id || index}>
                <td>{job.department_name}</td>
                <td>{job.department_desc}</td>
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
            {editIndex !== null ? "Edit Department" : "Add Department"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="department-form">
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter Name"
                    value={currentDept.department_name}
                    isInvalid={!!errr.department_name}
                    onChange={(e) =>
                      setCurrentDept({ ...currentDept, department_name: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.department_name}
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
                    value={currentDept.department_desc}
                    isInvalid={!!errr.department_desc}
                    onChange={(e) =>
                      setCurrentDept({ ...currentDept, department_desc: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.department_desc}
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
            {editIndex !== null ? "Update Department" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Department;
