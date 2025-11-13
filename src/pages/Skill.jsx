// Skill.js
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
import "../css/Skill.css";
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


const Skill = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentSkill, setCurrentSkill] = useState({
    skill_name: "",
    skill_desc: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errr, setErrr] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchSkill();
  }, []);

  const fetchSkill = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getallSkills();
      setSkills(res.data.data || res.data); // adjust if API returns differently
    } catch (err) {
      setError("Failed to fetch Skill.");
      console.error("GET Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (req = { skill_name: "", skill_desc: "" }, index = null) => {
    setCurrentSkill(req);
    setEditIndex(index);
    setShowModal(true);
  };

 const handleSave = () => {
  const newErrors = {};

  const trimmedName = currentSkill.skill_name?.trim();
  const trimmedDesc = currentSkill.skill_desc?.trim();

  // Step 1: Required fields
  if (!trimmedName) {
    newErrors.skill_name = "Name is required";
  }
  // if (!trimmedDesc) {
  //   newErrors.skill_desc = "Description is required";
  // }

  // Step 2: Only check duplicate name (description can repeat)
  if (trimmedName) {
    const isDuplicateName = skills.some(
      (skill, index) =>
        skill.skill_name?.trim().toLowerCase() === trimmedName.toLowerCase() &&
        index !== editIndex
    );

    if (isDuplicateName) {
      newErrors.skill_name = "Skill name already exists";
    }
  }

  // ✅ Description is not checked for duplicates (can repeat)

  setErrr(newErrors);

  if (Object.keys(newErrors).length === 0) {
    handleSaveCallback();
  }
};



  const handleSaveCallback = async () => {
    try {
      if (editIndex !== null) {
        const updatedSkill = {
          ...currentSkill,
          skill_id: skills[editIndex].skill_id,
        };
        await apiService.updateSkill(updatedSkill.skill_id, updatedSkill);
        // console.log("Updating Skill:", updatedSkill);

        toast.success("Skill updated successfully");

        const updatedSkills = [...skills];
        updatedSkills[editIndex] = updatedSkill;
        setSkills(updatedSkills);
      } else {
        // console.log("Adding new Skill:", currentSkill);
        const response = await apiService.addSkill(currentSkill);
        const newSkill = response.data?.data || currentSkill;

        toast.success("Skill added successfully");
        setSkills(prev => [...prev, newSkill]);
        await fetchSkill();
      }
      resetForm();
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("Save failed");
    }
  };

  const handleDelete = async (index) => {
    const idToDelete = skills[index]?.skill_id;

    try {
      await apiService.deleteSkill(idToDelete);
      // console.log("Deleting Skill ID:", idToDelete);
      setSkills(skills.filter((skill) => skill.skill_id !== idToDelete));
      toast.success("Skill deleted");
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Delete failed");
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setCurrentSkill({ skill_name: "", skill_desc: "" });
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
    let filteredItems = [...skills];

    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(
        (skill) =>
          skill.skill_name?.toLowerCase().includes(lowerTerm) ||
          skill.skill_desc?.toLowerCase().includes(lowerTerm)
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
    <div className="register_container px-5 skillfon py-3">
      <div className="d-flex justify-content-between align-items-center pb-4">
      {/* <InputGroup className="w-50">
         <InputGroup.Text style={{ backgroundColor: '#FF7043' }}>
            <FontAwesomeIcon icon={faSearch} style={{ color: '#fff' }}/>
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Search by skill"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup> */}
      <h5 style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>Skills</h5>
      <Button variant="orange" onClick={() => openModal()}>+ Add</Button>
      </div>
      {/* <hr /> */}

      {jobsToDisplay.length === 0 ? (
        <p className="text-muted text-center mt-5">No Skill match your criteria.</p>
      ) : (
        <Table responsive hover className="skill_table">
          <thead className="table-header-orange">
            <tr>
              <th onClick={() => handleSort("skill_name")} style={{ cursor: "pointer", width: "40%" }}>
                Skill{getSortIndicator("skill_name")}
              </th>
              <th onClick={() => handleSort("skill_desc")} style={{ cursor: "pointer", width: "52%" }}>
                Description{getSortIndicator("skill_desc")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody className="table-body-orange">
            {jobsToDisplay.map((job, index) => (
              <tr key={job.skill_id || index}>
                <td>{job.skill_name}</td>
                <td>{job.skill_desc}</td>
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
            {editIndex !== null ? "Edit Skill" : "Add Skill"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="skill-form">
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    Skill <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter skill"
                    value={currentSkill.skill_name}
                    isInvalid={!!errr.skill_name}
                    onChange={(e) =>
                      setCurrentSkill({ ...currentSkill, skill_name: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.skill_name}
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
                    value={currentSkill.skill_desc}
                    isInvalid={!!errr.skill_desc}
                    onChange={(e) =>
                      setCurrentSkill({ ...currentSkill, skill_desc: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.skill_desc}
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
            {editIndex !== null ? "Update Skill" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Skill;
