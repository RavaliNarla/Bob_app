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
import "../css/Location.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiService from "../services/apiService";


const Location = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentLoc, setCurrentLoc] = useState({
    location_name: "",
    city_id: ""
  });
  const [editIndex, setEditIndex] = useState(null);
  const [locs, setLocs] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errr, setErrr] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
     setLoading(true);
        const [locationRes, cityRes] = await Promise.all([
        apiService.getallLocations(),
        apiService.getallCities()
        ]);

      const locations = locationRes.data.data || locationRes.data;
      const citiesData = cityRes.data.data || cityRes.data;
      setCities(citiesData);

      // Merge city_name into locations for display
      const mergedData = locations.map(loc => {
        const city = citiesData.find(c => c.city_id === loc.city_id);
        return {
          ...loc,
          city_name: city ? city.city_name : "Unknown"
        };
      });

      setLocs(mergedData);
    } catch (err) {
      setError("Failed to fetch data.");
      console.error("GET Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (req = { location_name: "", city_id: "" }, index = null) => {
    setCurrentLoc(req);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleSave = () => {
  const newErrors = {};

  if (!currentLoc.location_name?.trim()) {
    newErrors.location_name = "Location is required";
  }
  if (!currentLoc.city_id) {
    newErrors.city_id = "City is required";
  }

  // Duplicate check (case-insensitive)
  const isDuplicate = locs.some((loc, index) =>
    loc.location_name.trim().toLowerCase() === currentLoc.location_name.trim().toLowerCase() &&
    loc.city_id === parseInt(currentLoc.city_id) && // Ensure city_id matches
    index !== editIndex // Ignore same row if editing
  );

  if (isDuplicate) {
    newErrors.location_name = "This location already exists for the selected city";
  }

  setErrr(newErrors);

  if (Object.keys(newErrors).length === 0) {
    handleSaveCallback();
  }
};


  const handleSaveCallback = async () => {
    try {
      if (editIndex !== null) {
        const updatedLoc = {
          ...currentLoc,
          location_id: locs[editIndex].location_id
        };
       await apiService.updateLocation(updatedLoc.location_id, updatedLoc);

        toast.success("Location updated successfully");
        await fetchData(); // reload with updated city name
      } else {
        const response =  await apiService.addLocation(currentLoc);
        toast.success("Location added successfully");
        await fetchData();
      }
      resetForm();
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("Save failed");
    }
  };

  const handleDelete = async (index) => {
    const idToDelete = locs[index]?.location_id;
    try {
      await apiService.deleteLocation(idToDelete);
      setLocs(locs.filter((loc) => loc.location_id !== idToDelete));
      toast.success("Location deleted");
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Delete failed");
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setCurrentLoc({ location_name: "", city_id: "" });
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
    let filteredItems = [...locs];
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(
        (loc) =>
          loc.location_name?.toLowerCase().includes(lowerTerm) ||
          loc.city_name?.toLowerCase().includes(lowerTerm)
      );
    }
    if (sortConfig.key !== null) {
      filteredItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (aValue == null || bValue == null) return 0;
        return sortConfig.direction === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
          ? 1
          : -1;
      });
    }
    return filteredItems;
  };

  const jobsToDisplay = filteredAndSortedJobs();

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="register_container px-5 loctfon py-3">
      <div className="d-flex justify-content-between align-items-center pb-4">
        {/* <InputGroup className="w-50">
          <InputGroup.Text style={{ backgroundColor: '#FF7043' }}>
                  <FontAwesomeIcon icon={faSearch} style={{ color: '#fff' }}/>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup> */}
        <h5 style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>Locations</h5>
        <Button variant="orange" onClick={() => openModal()}>
            + Add
          </Button>

      </div>
      {/* <hr /> */}

      {jobsToDisplay.length === 0 ? (
        <p className="text-muted text-center mt-5">
          No Location matches your criteria.
        </p>
      ) : (
        <Table responsive hover className="location_table">
  <thead className="table-header-orange">
    <tr>
      <th
        onClick={() => handleSort("city_name")}
        style={{ cursor: "pointer", width: "40%" }}
      >
        City Name{getSortIndicator("city_name")}
      </th>
      <th
        onClick={() => handleSort("location_name")}
        style={{ cursor: "pointer", width: "52%" }}
      >
        Location Name{getSortIndicator("location_name")}
      </th>
      <th>Actions</th>
    </tr>
  </thead>

  <tbody className="table-body-orange">
    {jobsToDisplay.map((job, index) => (
      <tr key={job.location_id || index}>
        <td>{job.city_name}</td>
        <td>{job.location_name}</td>
        <td>
          <FontAwesomeIcon
            icon={faPencil}
            className="text-info me-3 cursor-pointer iconhover"
            onClick={() => openModal(job, index)}
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
            {editIndex !== null ? "Edit Location" : "Add Location"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="location-form">
            <Row className="g-4">
  <Col md={12}>
    <Form.Group>
      <Form.Label>
        City Name <span className="text-danger">*</span>
      </Form.Label>
      <Form.Select
        value={currentLoc.city_id}
        isInvalid={!!errr.city_id}
        onChange={(e) =>
          setCurrentLoc({ ...currentLoc, city_id: e.target.value })
        }
      >
        <option value="">Select City</option>
        {cities.map((city) => (
          <option key={city.city_id} value={city.city_id}>
            {city.city_name}
          </option>
        ))}
      </Form.Select>
      <Form.Control.Feedback type="invalid">
        {errr.city_id}
      </Form.Control.Feedback>
    </Form.Group>
  </Col>

  <Col md={12} style={{ marginTop: '10px' }}>
    <Form.Group>
      <Form.Label>
        Location Name <span className="text-danger">*</span>
      </Form.Label>
      <Form.Control
        type="text"
        placeholder="Enter location name"
        value={currentLoc.location_name}
        isInvalid={!!errr.location_name}
        onChange={(e) =>
          setCurrentLoc({ ...currentLoc, location_name: e.target.value })
        }
      />
      <Form.Control.Feedback type="invalid">
        {errr.location_name}
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
            {editIndex !== null ? "Update Location" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Location;
