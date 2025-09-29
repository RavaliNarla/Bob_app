// SpecialCategory.js
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
import apiService from "../services/apiService";

const SpecialCategory = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    special_category_code: "",
    special_category_name: "",
    special_category_desc: "",
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
      const res = await apiService.getAllSpecialCategories(); // your API call
      // your API returns object { "0": {...} } → convert to array
      const data = Object.values(res.data);
      setCategories(data);
    } catch (err) {
      setError("Failed to fetch categories.");
      console.error("GET Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (req = { special_category_code: "", special_category_name: "", special_category_desc: "" }, index = null) => {
    setCurrentCategory(req);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSave = () => {
    const newErrors = {};
    const trimmedCode = currentCategory.special_category_code?.trim();
    const trimmedName = currentCategory.special_category_name?.trim();
    const trimmedDesc = currentCategory.special_category_desc?.trim();

    if (!trimmedCode) {
      newErrors.special_category_code = "Code is required";
    }
    if (!trimmedName) {
      newErrors.special_category_name = "Name is required";
    }
   

    // duplicate check
    if (trimmedCode && trimmedName) {
      const isDuplicate = categories.some((cat, index) =>
        (
          cat.special_category_code?.trim().toLowerCase() === trimmedCode.toLowerCase() ||
          cat.special_category_name?.trim().toLowerCase() === trimmedName.toLowerCase()
        ) && index !== editIndex
      );

      if (isDuplicate) {
        if (categories.some((cat, index) =>
          cat.special_category_code?.trim().toLowerCase() === trimmedCode.toLowerCase() &&
          index !== editIndex
        )) {
          newErrors.special_category_code = "Code already exists";
        }
        if (categories.some((cat, index) =>
          cat.special_category_name?.trim().toLowerCase() === trimmedName.toLowerCase() &&
          index !== editIndex
        )) {
          newErrors.special_category_name = "Name already exists";
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
          special_category_id: categories[editIndex].special_category_id,
        };
        await apiService.updateSpecialCategory(updatedCategory.special_category_id, updatedCategory);

        toast.success("Category updated successfully");

        const updatedCategories = [...categories];
        updatedCategories[editIndex] = updatedCategory;
        setCategories(updatedCategories);
      } else {
        const response = await apiService.addSpecialCategory(currentCategory);
        const newCategory = response.data?.data || currentCategory;

        toast.success("Category added successfully");
        setCategories(prev => [...prev, newCategory]);
        await fetchCategories();
      }
      resetForm();
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("Save failed");
    }
  };

  const handleDelete = async (index) => {
    const idToDelete = categories[index]?.special_category_id;
    try {
      await apiService.deleteSpecialCategory(idToDelete);
      setCategories(categories.filter((cat) => cat.special_category_id !== idToDelete));
      toast.success("Category deleted");
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Delete failed");
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setCurrentCategory({ special_category_code: "", special_category_name: "", special_category_desc: "" });
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

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="register_container px-5 py-3">
      <div className="d-flex justify-content-between align-items-center pb-4">
        <h5 style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>
          Special Categories
        </h5>
        <Button variant="orange" onClick={() => openModal()}>+ Add</Button>
      </div>

      {categoriesToDisplay.length === 0 ? (
        <p className="text-muted text-center mt-5">No categories found.</p>
      ) : (
        <Table className="dept_table" responsive hover>
          <thead className="table-header-orange">
            <tr>
              <th onClick={() => handleSort("special_category_code")} style={{ cursor: "pointer", width: "20%" }}>
                Code{getSortIndicator("special_category_code")}
              </th>
              <th onClick={() => handleSort("special_category_name")} style={{ cursor: "pointer", width: "35%" }}>
                Name{getSortIndicator("special_category_name")}
              </th>
              <th onClick={() => handleSort("special_category_desc")} style={{ cursor: "pointer", width: "35%" }}>
                Description{getSortIndicator("special_category_desc")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody className="table-body-orange">
            {categoriesToDisplay.map((cat, index) => (
              <tr key={cat.special_category_id || index}>
                <td>{cat.special_category_code}</td>
                <td>{cat.special_category_name}</td>
                <td>{cat.special_category_desc}</td>
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
            {editIndex !== null ? "Edit Special Category" : "Add Special Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    Code <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter code"
                    value={currentCategory.special_category_code}
                    isInvalid={!!errr.special_category_code}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, special_category_code: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.special_category_code}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={currentCategory.special_category_name}
                    isInvalid={!!errr.special_category_name}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, special_category_name: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.special_category_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>
                    Description
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter description"
                    value={currentCategory.special_category_desc}
                    isInvalid={!!errr.special_category_desc}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, special_category_desc: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.special_category_desc}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={resetForm}>
            Cancel
          </Button>
          <Button
            className="text-white"
            onClick={handleSave}
            style={{ backgroundColor: "#FF7043", borderColor: "#FF7043" }}
          >
            {editIndex !== null ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SpecialCategory;
