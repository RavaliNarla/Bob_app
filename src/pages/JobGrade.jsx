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
import { useTranslation } from 'react-i18next';
import apiService from "../services/apiService";


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
  const { t } = useTranslation('jobgrade');

  useEffect(() => {
    fetchGrade();
  }, []);

  const fetchGrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getallJobGrade();
      setGrads(res.data.data || res.data); // adjust if API returns differently
    } catch (err) {
      setError("Failed to fetch Grade.");
      console.error("GET Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (req = { job_grade_code: "", job_grade_desc: "", job_scale: "", min_salary: "", max_salary: "" }, index = null) => {
    setCurrentGrade(req);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSave = () => {
  const newErrors = {};

  const trimmedCode = currentGrade.job_grade_code?.trim();
  const trimmedDesc = currentGrade.job_grade_desc?.trim();
  const trimmedScale = currentGrade.job_scale?.trim();
  const minSalary = String(currentGrade.min_salary)?.trim();
  const maxSalary = String(currentGrade.max_salary)?.trim();

  // ---------------------------
  // Required validations
  // ---------------------------
  if (!trimmedScale) newErrors.job_scale = "scale_required";
  if (!minSalary) newErrors.min_salary = "min_salary_required";
  if (!maxSalary) newErrors.max_salary = "max_salary_required";
  // Description is now optional, so no required check

  // Numeric validation
  if (minSalary && isNaN(Number(minSalary))) {
    newErrors.min_salary = "number_required";
  }
  if (maxSalary && isNaN(Number(maxSalary))) {
    newErrors.max_salary = "number_required";
  }

  // Min ≤ Max validation
  if (
    minSalary &&
    maxSalary &&
    !isNaN(Number(minSalary)) &&
    !isNaN(Number(maxSalary)) &&
    Number(minSalary) > Number(maxSalary)
  ) {
    newErrors.min_salary = "min_less_than_max";
    newErrors.max_salary = "max_greater_than_min";
  }

  // ---------------------------
  // Duplicate check (only if field has value)
  // ---------------------------
  if (trimmedScale) {
    const duplicateScale = grads.some(
      (grad, index) =>
        grad.job_scale?.trim().toLowerCase() === trimmedScale.toLowerCase() &&
        index !== editIndex
    );
    if (duplicateScale) newErrors.job_scale = "scale_exists";
  }

  if (trimmedDesc) {
    const duplicateDesc = grads.some(
      (grad, index) =>
        grad.job_grade_desc?.trim().toLowerCase() === trimmedDesc.toLowerCase() &&
        index !== editIndex
    );
    if (duplicateDesc) newErrors.job_grade_desc = "desc_exists";
  }

  if (trimmedCode) {
    const duplicateCode = grads.some(
      (grad, index) =>
        grad.job_grade_code?.trim().toLowerCase() === trimmedCode.toLowerCase() &&
        index !== editIndex
    );
    if (duplicateCode) newErrors.job_grade_code = "code_exists";
  }

  // ---------------------------
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

        await apiService.updateJobGrade(updatedGrad.job_grade_id, updatedGrad);


        toast.success(t('update_success'));

        const updatedGrads = [...grads];
        updatedGrads[editIndex] = updatedGrad;
        setGrads(updatedGrads);
      } else {
        // console.log("Adding new Grade:", currentGrade);
        const response = await apiService.addJobGrade(currentGrade);
        const newGrad = response.data?.data || currentGrade;

        toast.success(t('save_success'));
        setGrads(prev => [...prev, newGrad]);
        await fetchGrade();
      }
      resetForm();
    } catch (err) {
      console.error("Save Error:", err);
      toast.error(t('error_occurred'));
    }
  };

  const handleDelete = async (index) => {
    const idToDelete = grads[index]?.job_grade_id;

    try {
      await apiService.deleteJobGrade(idToDelete);
      setGrads(grads.filter((grad) => grad.job_grade_id !== idToDelete));
      toast.success(t('delete_success'));
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error(t('error_occurred'));
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

  if (loading) return <div className="text-center mt-5">{t('loading')}</div>;
  if (error) return <div className="alert alert-danger mt-5">{t('error_loading')}</div>;

  return (
    <div className="register_container px-5 gradefont py-3">
      <div className="d-flex justify-content-between align-items-center pb-4">
        {/* <InputGroup className="w-50">
         <InputGroup.Text style={{ backgroundColor: '#FF7043' }}>
                  <FontAwesomeIcon icon={faSearch} style={{ color: '#fff' }}/>
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Search by code"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup> */}
        <h5 style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>{t('job_grade')}</h5>
        <Button variant="orange" onClick={() => openModal()}>+ {t('add_grade')}</Button>
      </div>
      {/* <hr /> */}

      {jobsToDisplay.length === 0 ? (
        <p className="text-muted text-center mt-5">{t('no_grades_found')}</p>
      ) : (
        <Table responsive hover className="jobgrade_table">
          <thead className="table-header-orange">
            <tr>
              {/* <th onClick={() => handleSort("job_grade_code")} style={{ cursor: "pointer", width: "20%" }}>
                Code{getSortIndicator("job_grade_code")}
              </th> */}

              <th onClick={() => handleSort("job_scale")} style={{ cursor: "pointer", width: "10%" }}>
                {t('scale')}{getSortIndicator("job_scale")}
              </th>
              <th onClick={() => handleSort("min_salary")} style={{ cursor: "pointer", width: "15%" }}>
                {t('min_salary')}{getSortIndicator("min_salary")}
              </th>
              <th onClick={() => handleSort("max_salary")} style={{ cursor: "pointer", width: "15%" }}>
                {t('max_salary')}{getSortIndicator("max_salary")}
              </th>
              <th onClick={() => handleSort("job_grade_desc")} style={{ cursor: "pointer", width: "50%" }}>
                {t('description')}{getSortIndicator("job_grade_desc")}
              </th>

              <th>{t('actions')}</th>
            </tr>
          </thead>

          <tbody className="table-body-orange">
            {jobsToDisplay.map((job, index) => (
              //<tr key={job.job_grade_id || index}>
              <tr
                key={
                  job.job_grade_id ??
                  `${String(job.job_grade_code)}__${String(job.job_grade_desc)}__${String(job.job_scale)}`
                }
              >

                {/* <td>{job.job_grade_code}</td> */}

                <td>{job.job_scale}</td>
                <td>{job.min_salary}</td>
                <td>{job.max_salary}</td>
                <td>{job.job_grade_desc}</td>
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
            {editIndex !== null ? t('edit_grade') : t('add_grade')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="grade-form">
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    {t('scale')} <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={t('enter_scale')}
                    value={currentGrade.job_scale}
                    isInvalid={!!errr.job_scale}
                    onChange={(e) =>
                      setCurrentGrade({ ...currentGrade, job_scale: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {t(errr.job_scale)}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    {t('description')}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={t('enter_description')}
                    value={currentGrade.job_grade_desc}
                    isInvalid={!!errr.job_grade_desc}
                    onChange={(e) =>
                      setCurrentGrade({ ...currentGrade, job_grade_desc: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {t(errr.job_grade_desc)}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    {t('grade_code')}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={t('enter_grade_code')}
                    value={currentGrade.job_grade_code}
                    isInvalid={!!errr.job_grade_code}
                    onChange={(e) =>
                      setCurrentGrade({ ...currentGrade, job_grade_code: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {t(errr.job_grade_code)}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    {t('min_salary')} <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={t('enter_min_salary')}
                    value={currentGrade.min_salary}
                    isInvalid={!!errr.min_salary}
                    onChange={(e) =>
                      setCurrentGrade({ ...currentGrade, min_salary: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {t(errr.min_salary)}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    {t('max_salary')} <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={t('enter_max_salary')}
                    value={currentGrade.max_salary}
                    isInvalid={!!errr.max_salary}
                    onChange={(e) =>
                      setCurrentGrade({ ...currentGrade, max_salary: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {t(errr.max_salary)}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer className="justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={resetForm}>
            {t('cancel')}
          </Button>
          <Button
            className="text-white"
            onClick={handleSave}
            style={{ backgroundColor: "#FF7043", borderColor: "#FF7043" }}
          >
            {editIndex !== null ? t('update_grade') : t('save')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JobGrade;
