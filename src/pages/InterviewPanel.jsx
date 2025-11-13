import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap'
import Select from 'react-select'
import apiService from '../services/apiService'

const InterviewPanel = () => {
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [panels, setPanels] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [availableInterviewers, setAvailableInterviewers] = useState([]);
  const [currentPanel, setCurrentPanel] = useState({
    panel_id: null,
    panel_name: "",
    panel_description: "",
    interviewer_ids: [],
    // jobGradeId: "",
    // deptId: ""
  });
  const [loading, setLoading] = useState(false);
  const [loadingInterviewers, setLoadingInterviewers] = useState(false);

  const panelMembers = [
    { value: "Akhil Kumar", label: "Akhil Kumar" },
    { value: "Saketh Rao", label: "Saketh Rao" },
    { value: "Manish Reddy", label: "Manish Reddy" },
    { value: "Nikilesh Sethi", label: "Nikilesh Sethi" },
    { value: "Purvi Nair", label: "Purvi Nair" },
  ];

  const fetchInterviewPanels = async () => {
    try {
      setLoading(true);
      const res = await apiService.getInterviewPanels(); // your GET call
      setPanels(res?.data || []); // adjust according to response structure
      // console.log("Fetched panels:", res?.data);
    } catch (err) {
      console.error("Failed to fetch panels:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewers = async () => {
    try {
      const res = await apiService.getInterviewers();
      const allInterviewers = res?.data || [];
      setInterviewers(allInterviewers);
    } catch (err) {
      console.error("Failed to fetch interviewers:", err);
    }
  };

  const fetchActiveMembers = async () => {
    try {
      const res = await apiService.activeMembers();
      setActiveMembers(res?.data || []); // [2,1]
    } catch (err) {
      console.error("Failed to fetch active members:", err);
    }
  };

  // Compute available interviewers whenever interviewers/activeMembers change
  useEffect(() => {
    const mapped = interviewers.map(i => ({
      value: i.interviewer_id,
      label: i.full_name,
      isDisabled: activeMembers.includes(i.interviewer_id), // mark instead of removing
    }));
    setAvailableInterviewers(mapped);
  }, [interviewers, activeMembers]);


    useEffect(() => {
      fetchInterviewers();
      fetchInterviewPanels();
      fetchActiveMembers();
    }, []);

  const handleDelete = async (panelId) => {
    try {
      await apiService.deleteInterviewPanel(panelId);
      // Refresh list after delete
      fetchInterviewPanels();
    } catch (err) {
      console.error("Failed to delete panel:", err);
    }
  };

  const handleSavePanel = async () => {
    try {
      const payload = {
        panel_name: currentPanel.panelName,
        panel_description: currentPanel.panelDescription,
        interviewer_ids: currentPanel.interviewer_ids,
      };
      if (editIndex !== null && currentPanel.panel_id) {
        await apiService.updateInterviewPanel(currentPanel.panel_id, payload);
      } else {
        await apiService.addInterviewPanel(payload);
      }
      await fetchInterviewPanels();
      resetForm();
    } catch (err) {
      console.error("Failed to save/update panel:", err);
    }
  };

  const handleEdit = async (panel, index) => {
    setEditIndex(index);

    // fetch interviewers first if not already fetched
    if (interviewers.length === 0) {
      await fetchInterviewers();
    }

    setCurrentPanel({
      panel_id: panel.panel_id,
      panelName: panel.panel_name,
      panelDescription: panel.panel_description,
      interviewer_ids: panel.interviewer_ids || [], // always array
    });

    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentPanel({ panel_id: null, panel_name: "", panel_description: "", interviewer_ids: [] });
    setEditIndex(null);
    setShowModal(false);
  };

  return (
    <div className='register_container login-container d-flex flex-column py-3 px-5'>
      <div className="d-flex justify-content-between align-items-center pb-4">
        <h5 className='mt-1' style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>Interview Panels</h5>
        <Button variant="orange" onClick={() => setShowModal(true)}>+ Add</Button>
      </div>
      <Table className="req_table mt-2" responsive hover>
        <thead className="table-header-orange">
          <tr>
            <th style={{ cursor: "pointer", width: '10%' }}>
              S No.
            </th>
            <th style={{ cursor: "pointer", width: '20%' }}>
              Panel Name
            </th>
            <th style={{ cursor: "pointer", width: '60%' }}>
              Panel Members
            </th>
            {/* <th style={{ cursor: "pointer" }}>
              Panel Status
            </th> */}
            <th style={{ cursor: "pointer", width: '10%' }}>
              Actions
            </th>
          </tr>
        </thead>
                <tbody className="table-body-orange">
          {loading ? (
            <tr>
              <td colSpan={4} className="text-center">
                <Spinner animation="border" size="sm" /> Loading...
              </td>
            </tr>
          ) : panels.length > 0 ? (
            panels.map((panel, index) => (
              <tr key={panel.panel_id || index}>
                <td>{index + 1}</td>
                <td>{panel.panel_name}</td>
                {/* <td>{panel.interviewer_ids.join(", ")}</td> */}
                <td>{panel.interviewer_ids.map(id => interviewers.find(i => i.interviewer_id === id)?.full_name).filter(Boolean).join(", ")}</td>
                <td>
                  <FontAwesomeIcon
                    icon={faPencil}
                    className="text-info me-3 cursor-pointer iconhover"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleEdit(panel, index)}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="text-danger cursor-pointer iconhover"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleDelete(panel.panel_id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                No panels found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* MODAL */}
      <Modal show={showModal} onHide={resetForm} centered dialogClassName="wide-modal">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-orange fs-4">
            {editIndex !== null ? "Edit Interview Panel" : "Add Interview Panel"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="grade-form">
            <Row className="g-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Panel Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter panel name"
                    value={currentPanel.panelName}
                    // isInvalid={!!errr.positionName}
                    onChange={(e) => setCurrentPanel({ ...currentPanel, panelName: e.target.value })}
                  />
                  {/* <Form.Control.Feedback type="invalid">{errr.positionName}</Form.Control.Feedback> */}
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
                    value={currentPanel.panelDescription}
                    // isInvalid={!!errr.skill_name}
                    onChange={(e) =>
                      setCurrentPanel({ ...currentPanel, panelDescription: e.target.value })
                    }
                  />
                  {/* <Form.Control.Feedback type="invalid">
                    {errr.skill_name}
                  </Form.Control.Feedback> */}
                </Form.Group>
              </Col>

              <Col md={12} style={{ paddingBottom: '20px' }}>
                <Form.Group>
                  <Form.Label>
                    Panel Members <span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    isMulti
                    options={availableInterviewers}
                    closeMenuOnSelect={false}
                    value={availableInterviewers.filter(m =>
                      currentPanel.interviewer_ids.includes(m.value)
                    )}
                    onMenuOpen={async () => {
                      try {
                        const [interviewersRes, activeRes] = await Promise.all([
                          apiService.getInterviewers(),
                          apiService.activeMembers()
                        ]);

                        const allInterviewers = interviewersRes?.data || [];
                        const active = activeRes?.data || [];

                        const mapped = allInterviewers.map(i => ({
                          value: i.interviewer_id,
                          label: i.full_name,
                          isDisabled: active.includes(i.interviewer_id), // disable if active
                        }));

                        setAvailableInterviewers(mapped);
                      } catch (err) {
                        console.error("Error fetching dropdown data:", err);
                      }
                    }}
                    onChange={(selected) => {
                      const values = selected.map(opt => opt.value);
                      setCurrentPanel({ ...currentPanel, interviewer_ids: values });
                    }}
                  />

                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer className="justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={resetForm}>Cancel</Button>
          <Button className="text-white" style={{ backgroundColor: "#FF7043", borderColor: "#FF7043" }} onClick={handleSavePanel}>
            {editIndex !== null ? "Update Panel" : "Save Panel"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default InterviewPanel