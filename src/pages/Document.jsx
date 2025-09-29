// Documents.jsx
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
import "../css/Department.css"; // reuse same CSS or create Documents.css
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faTrash,
  faSearch
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiService from "../services/apiService";

const Document = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentDoc, setCurrentDoc] = useState({
    document_name: "",
    document_desc: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errr, setErrr] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getAllDocuments(); // 🔹 Replace with your API call
      setDocs(res.data.data || res.data);
    } catch (err) {
      setError("Failed to fetch Documents.");
      console.error("GET Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (doc = { document_name: "", document_desc: "" }, index = null) => {
    setCurrentDoc(doc);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSave = () => {
    const newErrors = {};
    const trimmedName = currentDoc.document_name?.trim();
    const trimmedDesc = currentDoc.document_desc?.trim();

    if (!trimmedName) {
      newErrors.document_name = "Document Name is required";
    }

    // Duplicate check
    const isDuplicate = docs.some((doc, idx) =>
      (doc.document_name?.trim().toLowerCase() === trimmedName?.toLowerCase()) &&
      idx !== editIndex
    );

    if (isDuplicate) {
      newErrors.document_name = "Document name already exists";
    }

    setErrr(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handleSaveCallback();
    }
  };

  const handleSaveCallback = async () => {
    try {
      if (editIndex !== null) {
        const updatedDoc = {
          ...currentDoc,
          document_id: docs[editIndex].document_id,
        };
        await apiService.updateDocument(updatedDoc.document_id, updatedDoc); // 🔹 Update API
        toast.success("Document updated successfully");

        const updatedDocs = [...docs];
        updatedDocs[editIndex] = updatedDoc;
        setDocs(updatedDocs);
      } else {
        const response = await apiService.addDocument(currentDoc); // 🔹 Add API
        const newDoc = response.data?.data || currentDoc;

        toast.success("Document added successfully");
        setDocs(prev => [...prev, newDoc]);
        await fetchDocuments();
      }
      resetForm();
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("Save failed");
    }
  };

  const handleDelete = async (index) => {
    const idToDelete = docs[index]?.document_id;

    try {
      await apiService.deleteDocument(idToDelete); // 🔹 Delete API
      setDocs(docs.filter((doc) => doc.document_id !== idToDelete));
      toast.success("Document deleted successfully");
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Delete failed");
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setCurrentDoc({ document_name: "", document_desc: "" });
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

  const filteredAndSortedDocs = () => {
    let filteredItems = [...docs];

    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(
        (doc) =>
          doc.document_name?.toLowerCase().includes(lowerTerm) ||
          doc.document_desc?.toLowerCase().includes(lowerTerm)
      );
    }

    if (sortConfig.key !== null) {
      filteredItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (aValue == null || bValue == null) return 0;
        return sortConfig.direction === "asc"
          ? aValue > bValue ? 1 : -1
          : aValue < bValue ? 1 : -1;
      });
    }

    return filteredItems;
  };

  const docsToDisplay = filteredAndSortedDocs();

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="register_container px-5 deptfon py-3">
      <div className="d-flex justify-content-between align-items-center pb-4">
        <h5
          style={{
            fontFamily: "Noto Sans",
            fontWeight: 600,
            fontSize: "16px",
            color: "#FF7043",
            marginBottom: "0px",
          }}
        >
          Documents
        </h5>
        <Button variant="orange" onClick={() => openModal()}>+ Add</Button>
      </div>

      {docsToDisplay.length === 0 ? (
        <p className="text-muted text-center mt-5">
          No Documents match your criteria.
        </p>
      ) : (
        <Table className="dept_table" responsive hover>
          <thead className="table-header-orange">
            <tr>
              <th
                onClick={() => handleSort("document_name")}
                style={{ cursor: "pointer", width: "40%" }}
              >
                Document Name{getSortIndicator("document_name")}
              </th>
              <th
                onClick={() => handleSort("document_desc")}
                style={{ cursor: "pointer", width: "52%" }}
              >
                Description{getSortIndicator("document_desc")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody className="table-body-orange">
            {docsToDisplay.map((doc, index) => (
              <tr key={doc.document_id || index}>
                <td>{doc.document_name}</td>
                <td>{doc.document_desc}</td>
                <td>
                  <FontAwesomeIcon
                    icon={faPencil}
                    className="text-info me-3 cursor-pointer iconhover"
                    onClick={() => openModal(doc, index)}
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
            {editIndex !== null ? "Edit Document" : "Add Document"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="document-form">
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">
                    Document Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Enter document name"
                    value={currentDoc.document_name}
                    isInvalid={!!errr.document_name}
                    onChange={(e) =>
                      setCurrentDoc({ ...currentDoc, document_name: e.target.value })
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errr.document_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="form-label">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter description"
                    value={currentDoc.document_desc}
                    onChange={(e) =>
                      setCurrentDoc({ ...currentDoc, document_desc: e.target.value })
                    }
                  />
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
            {editIndex !== null ? "Update Document" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Document;
