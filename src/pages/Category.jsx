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

const Category = () => {
  const { t } = useTranslation('category');
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    category_code: "",
    category_name: "",
    category_desc: "",
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
      const res = await apiService.getAllCategories(); // your API call
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

  const openModal = (req = { category_code: "", category_name: "", category_desc: "" }, index = null) => {
    setCurrentCategory(req);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSave = () => {
    const newErrors = {};
    const trimmedCode = currentCategory.category_code?.trim();
    const trimmedName = currentCategory.category_name?.trim();
    const trimmedDesc = currentCategory.category_desc?.trim();

    if (!trimmedCode) {
      newErrors.category_code = t('code_required');
    }
    if (!trimmedName) {
      newErrors.category_name = t('name_required');
    }
   

    // duplicate check
    if (trimmedCode && trimmedName) {
      const isDuplicate = categories.some((cat, index) =>
        (
          cat.category_code?.trim().toLowerCase() === trimmedCode.toLowerCase() ||
          cat.category_name?.trim().toLowerCase() === trimmedName.toLowerCase()
        ) && index !== editIndex
      );

      if (isDuplicate) {
        if (categories.some((cat, index) =>
          cat.category_code?.trim().toLowerCase() === trimmedCode.toLowerCase() &&
          index !== editIndex
        )) {
          newErrors.category_code = t('code_exists');
        }
        if (categories.some((cat, index) =>
          cat.category_name?.trim().toLowerCase() === trimmedName.toLowerCase() &&
          index !== editIndex
        )) {
          newErrors.category_name = t('name_exists');
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
          reservation_categories_id: categories[editIndex].reservation_categories_id,
        };
        await apiService.updateCategory(updatedCategory.reservation_categories_id, updatedCategory);

        toast.success(t('update_success'));

        const updatedCategories = [...categories];
        updatedCategories[editIndex] = updatedCategory;
        setCategories(updatedCategories);
      } else {
        const response = await apiService.addCategory(currentCategory);
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
    const idToDelete = categories[index]?.reservation_categories_id;
    try {
      await apiService.deleteCategory(idToDelete);
      setCategories(categories.filter((cat) => cat.reservation_categories_id !== idToDelete));
      toast.success(t('delete_success'));
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error(t('delete_failed'));
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setCurrentCategory({ category_code: "", category_name: "", category_desc: "" });
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
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="register_container px-5 py-3">
      <div className="d-flex justify-content-between align-items-center pb-4">
        <h5 style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>
          {t('categories')}
        </h5>
        <Button variant="orange" onClick={() => openModal()}>+ {t('add_category')}</Button>
      </div>

      {categoriesToDisplay.length === 0 ? (
        <p className="text-muted text-center mt-5">{t('no_categories')}</p>
      ) : (
        <Table className="dept_table" responsive hover>
          <thead className="table-header-orange">
            <tr>
              <th onClick={() => handleSort("category_code")} style={{ cursor: "pointer", width: "20%" }}>
                {t('code')}{getSortIndicator("category_code")}
              </th>
              <th onClick={() => handleSort("category_name")} style={{ cursor: "pointer", width: "35%" }}>
                {t('name')}{getSortIndicator("category_name")}
              </th>
              <th onClick={() => handleSort("category_desc")} style={{ cursor: "pointer", width: "35%" }}>
                {t('description')}{getSortIndicator("category_desc")}
              </th>
              <th>{t('actions')}</th>
            </tr>
          </thead>

          <tbody className="table-body-orange">
            {categoriesToDisplay.map((cat, index) => (
              <tr key={cat.reservation_categories_id || index}>
                <td>{cat.category_code}</td>
                <td>{cat.category_name}</td>
                <td>{cat.category_desc}</td>
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
            {editIndex !== null ? t('edit_category') : t('add_category')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    {t('code')} <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('enter_code')}
                    value={currentCategory.category_code}
                    isInvalid={!!errr.category_code}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, category_code: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.category_code}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    {t('name')} <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('enter_name')}
                    value={currentCategory.category_name}
                    isInvalid={!!errr.category_name}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, category_name: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.category_name}
                  </Form.Control.Feedback>
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
                    value={currentCategory.category_desc}
                    isInvalid={!!errr.category_desc}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, category_desc: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.category_desc}
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

export default Category;
