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
import apiService from "../services/apiService";


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
     const res = await apiService.getallDepartment();
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

    const trimmedName = currentDept.department_name?.trim();
    const trimmedDesc = currentDept.department_desc?.trim();

    if (!trimmedName) {
      newErrors.department_name = "Name is required";
    }
   

    // Check if either name or description already exists
    const isDuplicate = depts.some((dept, index) =>
      (dept.department_name?.trim().toLowerCase() === trimmedName?.toLowerCase() ||
        dept.department_desc?.trim().toLowerCase() === trimmedDesc?.toLowerCase()) &&
      index !== editIndex
    );

    if (isDuplicate) {
      newErrors.department_name = "Department name already exists";
      newErrors.department_desc = "Department description already exists";
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
       await apiService.updateDepartment(updatedDept.department_id, updatedDept);

        toast.success("Department updated successfully");

        const updatedDepts = [...depts];
        updatedDepts[editIndex] = updatedDept;
        setDepts(updatedDepts);
      } else {
        // console.log("Adding new department:", currentDept);
        const response = await apiService.addDepartment(currentDept);
        const newDept = response.data?.data || currentDept;

        toast.success("Department added successfully");
        setDepts(prev => [...prev, newDept]);
        await fetchDepartment();
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
      await apiService.deleteDepartment(idToDelete);
      setDepts(depts.filter((dept) => dept.department_id !== idToDelete));
      toast.success("Department deleted Successfully");
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
    <div className="register_container px-5 deptfon py-3">
      <div className="d-flex justify-content-between align-items-center pb-4">
        {/* <InputGroup className=" w-50">
          <InputGroup.Text style={{ backgroundColor: '#FF7043' }}>
            <FontAwesomeIcon icon={faSearch} style={{ color: '#fff' }} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup> */}
        <h5 style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>Departments</h5>
        <Button variant="orange" onClick={() => openModal()}>+ Add</Button>
      </div>
      {/* <hr /> */}

      {jobsToDisplay.length === 0 ? (
        <p className="text-muted text-center mt-5">No Department match your criteria.</p>
      ) : (
        <Table className="dept_table" responsive hover>
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

          <tbody className="table-body-orange">
            {jobsToDisplay.map((job, index) => (
              <tr key={job.department_id || index}>
                <td>{job.department_name}</td>
                <td>{job.department_desc}</td>
                <td>
                  <FontAwesomeIcon icon={faPencil} className="text-info me-3 cursor-pointer iconhover" onClick={() => openModal(job, index)} />
                  <FontAwesomeIcon icon={faTrash} className="text-danger cursor-pointer iconhover" onClick={() => handleDelete(index)} />
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
                    Description
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
