// Position.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Table,
  Row,
  Col
} from "react-bootstrap";
import "../css/Position.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import apiService from "../services/apiService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Position = () => {
  const [showModal, setShowModal] = useState(false);
  const [positions, setPositions] = useState([]);
  const [jobGrades, setJobGrades] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [currentPosition, setCurrentPosition] = useState({
  masterPositionId: null,
  positionName: "",
  positionDescription: "",
  jobGradeId: "",
  deptId: ""
});

  const [errr, setErrr] = useState({});
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Fetch Positions + JobGrades
  const fetchData = async () => {
    setLoading(true);
    setDataError(null);
    try {
      const [posRes, gradeRes,deptRes] = await Promise.all([
        apiService.getAllPositions(),
        apiService.getallJobGrade(),
        apiService.getallDepartment()
      ]);
// console.log("Position Response:", deptRes);
      setPositions(posRes.data.data || posRes.data || []);
      setJobGrades(gradeRes.data.data || gradeRes.data || []);
      setDepartments(deptRes.data.data || deptRes.data || []);
    } catch (err) {
      console.error(err);
      setDataError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
// console.log("Position grades:", jobGrades);
  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (
    pos = { id: null, positionName: "", positionDescription: "", jobGradeId: "", deptId: "" },
    index = null
  ) => {
    setCurrentPosition(pos);
    setEditIndex(index);
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentPosition({ id: null, positionName: "", positionDescription: "", jobGradeId: "", deptId: "" });
    setEditIndex(null);
    setErrr({});
    setShowModal(false);
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!currentPosition.positionName?.trim()) newErrors.positionName = "Position name is required";
    if (!currentPosition.jobGradeId) newErrors.jobGradeId = "Job Grade is required";
    if (!currentPosition.deptId) newErrors.deptId = "Department is required";
    // Check duplicate name
    const isDuplicate = positions.some((pos, index) =>
      pos.positionName.trim().toLowerCase() === currentPosition.positionName.trim().toLowerCase() &&
      index !== editIndex
    );
    if (isDuplicate) newErrors.positionName = "Position name already exists";

    setErrr(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      if (editIndex !== null && currentPosition.masterPositionId) {
  await apiService.updatePosition(currentPosition.masterPositionId, currentPosition);
  toast.success("Position updated successfully");
}
else {
  // console.log("Adding Position:", currentPosition);
        await apiService.addPosition(currentPosition);
        toast.success("Position added successfully");
      }
      fetchData();
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save position");
    }
  };

 const handleDelete = async (index) => {
  const idToDelete = positions[index]?.masterPositionId;

  if (!idToDelete) {
    toast.error("Delete failed: No identifier found");
    return;
  }

  try {
    await apiService.deletePosition(idToDelete);
    setPositions(positions.filter((_, i) => i !== index));
    toast.success("Position deleted Sucessfully");
  } catch (err) {
    console.error("Delete Error:", err);
    toast.error("Delete failed");
  }
};



  

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (dataError) return <div className="alert alert-danger mt-5">{dataError}</div>;

  return (
    <div className="register_container px-5 gradefont py-3">
      <div className="d-flex justify-content-between align-items-center pb-4">
        <h5 style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>Positions</h5>
        <Button variant="orange" onClick={() => openModal()}>+ Add</Button>
      </div>

      {positions.length === 0 ? (
        <p className="text-muted text-center mt-5">No positions available.</p>
      ) : (
        <Table responsive hover className="jobgrade_table">
          <thead className="table-header-orange">
            <tr>
              <th>Title</th>
              <th>Department</th>
              <th>Job Grade</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="table-body-orange">
            {positions.map((pos, index) => (
            <tr key={pos.masterPositionId}>

                <td>{pos.positionName}</td>
                <td>{  departments.find(g => g.department_id === pos.deptId)?.department_name || "-"}</td>
                <td>{  jobGrades.find(g => g.job_grade_id === pos.jobGradeId)?.job_scale || "-"}</td>
                <td>{pos.positionDescription}</td>
                <td>
                  <FontAwesomeIcon
                    icon={faPencil}
                    className="text-info me-3 cursor-pointer iconhover"
                    onClick={() => openModal(pos, index)}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="text-danger cursor-pointer iconhover"
                    onClick={() => handleDelete(index)}
                  />
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
            {editIndex !== null ? "Edit Position" : "Add Position"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="grade-form">
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Position Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter position title"
                    value={currentPosition.positionName}
                    isInvalid={!!errr.positionName}
                    onChange={(e) => setCurrentPosition({ ...currentPosition, positionName: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">{errr.positionName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Department<span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={currentPosition.deptId}
                    isInvalid={!!errr.deptId}
                    onChange={(e) => setCurrentPosition({ ...currentPosition, deptId: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {departments.map((jg) => (
                      <option key={jg.department_id} value={jg.department_id}>
                        {jg.department_name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errr.deptId}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Job Grade <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={currentPosition.jobGradeId}
                    isInvalid={!!errr.jobGradeId}
                    onChange={(e) => setCurrentPosition({ ...currentPosition, jobGradeId: e.target.value })}
                  >
                    <option value="">Select Job Grade</option>
                    {jobGrades.map((jg) => (
                      <option key={jg.job_grade_id} value={jg.job_grade_id}>
                        {jg.job_grade_code}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errr.jobGradeId}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter description"
                    value={currentPosition.positionDescription}
                    onChange={(e) => setCurrentPosition({ ...currentPosition, positionDescription: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer className="justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={resetForm}>Cancel</Button>
          <Button className="text-white" onClick={handleSave} style={{ backgroundColor: "#FF7043", borderColor: "#FF7043" }}>
            {editIndex !== null ? "Update Position" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Position;
