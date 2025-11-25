import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Table,
  Row,
  Col
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import apiService from "../services/apiService";

const RelaxationType = () => {
  const { t } = useTranslation('relaxationtype');
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    relaxation_type_name: "",
    description: "",
    input: "number",   // default
    operator: "<="     // default
  });
  const [editIndex, setEditIndex] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errr, setErrr] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getAllRelaxationType(); // your API call
      // your API returns object { "0": {...} } → convert to array
      const data = Object.values(res.data);
      setCategories(data);
    } catch (err) {
      setError(t('fetch_error'));
      console.error("GET Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (req = { relaxation_type_name: "", description: "",input: "number", operator: "<=" }, index = null) => {
    setCurrentCategory(req);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSave = () => {
    const newErrors = {};
    const trimmedName = currentCategory.relaxation_type_name?.trim();

   
    if (!trimmedName) {
      newErrors.relaxation_type_name = t('name_required');
    }
   

    // duplicate check
    if (trimmedName) {
      const isDuplicate = categories.some((cat, index) =>
        (
          cat.relaxation_type_name?.trim().toLowerCase() === trimmedName.toLowerCase()
        ) && index !== editIndex
      );

      if (isDuplicate) {
       
        if (categories.some((cat, index) =>
          cat.relaxation_type_name?.trim().toLowerCase() === trimmedName.toLowerCase() &&
          index !== editIndex
        )) {
          newErrors.relaxation_type_name = t('name_exists');
        }
      }
    }

    setErrr(newErrors);
    if (Object.keys(newErrors).length === 0) {
      handleSaveCallback();
    }
  };

  const handleSaveCallback = async () => {
    try {
      if (editIndex !== null) {
        const updatedCategory = {
          ...currentCategory,
          relaxation_type_id: categories[editIndex].relaxation_type_id,
        };
        await apiService.updateRelaxationType(updatedCategory.relaxation_type_id, updatedCategory);

        toast.success(t('update_success'));

        const updatedCategories = [...categories];
        updatedCategories[editIndex] = updatedCategory;
        setCategories(updatedCategories);
      } else {
        //console.log(currentCategory);return false;
        const response = await apiService.addRelaxationType(currentCategory);
        const newCategory = response.data?.data || currentCategory;

        toast.success(t('save_success'));
        setCategories(prev => [...prev, newCategory]);
        await fetchCategories();
      }
      resetForm();
    } catch (err) {
      console.error("Save Error:", err);
      toast.error(t('save_failed'));
    }
  };

  const handleDelete = async (index) => {
    const idToDelete = categories[index]?.relaxation_type_id;
    try {
      await apiService.deleteRelaxationType(idToDelete);
      setCategories(categories.filter((cat) => cat.relaxation_type_id !== idToDelete));
      toast.success(t('delete_success'));
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error(t('delete_failed'));
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setCurrentCategory({ relaxation_type_name: "", description: "" });
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

  const sortedCategories = () => {
    let items = [...categories];
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
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
    return items;
  };

  const categoriesToDisplay = sortedCategories();

  if (loading) return <div className="text-center mt-5">{t('loading')}</div>;
  if (error) return <div className="alert alert-danger mt-5">{t('fetch_error')}</div>;

  return (
    <div className="register_container px-5 py-3">
      <div className="d-flex justify-content-between align-items-center pb-4">
        <h5 style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>
           {t('relaxation_type')}
        </h5>
        <Button variant="orange" onClick={() => openModal()}>+ {t('add_relaxation_type')}</Button>
      </div>

      {categoriesToDisplay.length === 0 ? (
        <p className="text-muted text-center mt-5">{t('no_categories')}</p>
      ) : (
        <Table className="dept_table" responsive hover>
          <thead className="table-header-orange">
            <tr>
              
              <th onClick={() => handleSort("relaxation_type_name")} style={{ cursor: "pointer", width: "25%" }}>
                {t('name')}{getSortIndicator("relaxation_type_name")}
              </th>
              <th onClick={() => handleSort("input")} style={{ cursor: "pointer", width: "15%" }}>
                {t('input')}{getSortIndicator("input")}
              </th>
              <th onClick={() => handleSort("operator")} style={{ cursor: "pointer", width: "15%" }}>
                {t('operator')}{getSortIndicator("operator")}
              </th>
              <th onClick={() => handleSort("description")} style={{ cursor: "pointer", width: "35%" }}>
                {t('description')}{getSortIndicator("description")}
              </th>
              <th style={{width: "10%"}}>{t('actions')}</th>
            </tr>
          </thead>

          <tbody className="table-body-orange">
            {categoriesToDisplay.map((cat, index) => (
              <tr key={cat.relaxation_type_id || index}>
                <td>{cat.relaxation_type_name}</td>
                <td>{cat.input === 'Number' ? t('number') : t('text')}</td>
                <td>{
                  cat.operator === '<=' ? t('less_than_equal') :
                  cat.operator === '>=' ? t('greater_than_equal') :
                  t('equal_to')
                }</td>
                <td>{cat.description}</td>
                <td>
                  <FontAwesomeIcon icon={faPencil} className="text-info me-3 cursor-pointer iconhover" onClick={() => openModal(cat, index)} />
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
            {editIndex !== null ? t('edit_relaxation_type') : t('add_relaxation_type')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-4">
              
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    {t('name')} <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('enter_name')}
                    value={currentCategory.relaxation_type_name}
                    isInvalid={!!errr.relaxation_type_name}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, relaxation_type_name: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.relaxation_type_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('field_type')}</Form.Label>
                  <Form.Select
                    value={currentCategory.input}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, input: e.target.value })
                    }
                  >
                    <option value="Number">{t('number')}</option>
                    <option value="Text">{t('text')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('operator')}</Form.Label>
                  <Form.Select
                    value={currentCategory.operator}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, operator: e.target.value })
                    }
                  >
                    <option value="<=">{t('less_than_equal')}</option>
                    <option value=">=">{t('greater_than_equal')}</option>
                    <option value="==">{t('equal_to')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    {t('description')}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={t('enter_description')}
                    value={currentCategory.description}
                    isInvalid={!!errr.description}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, description: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={resetForm}>
            {t('cancel')}
          </Button>
          <Button
            className="text-white"
            onClick={handleSave}
            style={{ backgroundColor: "#FF7043", borderColor: "#FF7043" }}
          >
            {editIndex !== null ? t('update') : t('save')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RelaxationType;
