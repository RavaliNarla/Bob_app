import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const InterviewModal = ({ show, handleClose, handleSave, candidate, isReschedule, handleCancelInterview }) => {
  const [interviewData, setInterviewData] = useState({
    interview_date: '',
    interview_time: '',
  });

useEffect(() => {
  if (show && isReschedule && candidate) {
    let formattedDate = '';
    let formattedTime = '';

    if (candidate.interview_date) {
      // Convert to YYYY-MM-DD
      formattedDate = new Date(candidate.interview_date).toISOString().split('T')[0];
    }
    if (candidate.interview_time) {
      // Ensure HH:MM format
      const [hour, minute] = candidate.interview_time.split(':');
      formattedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    }

    setInterviewData({
      interview_date: formattedDate,
      interview_time: formattedTime,
    });
  } else {
    setInterviewData({
      interview_date: '',
      interview_time: '',
    });
  }
}, [show, isReschedule, candidate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInterviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSave = () => {
    if (isReschedule) {
      handleSave(interviewData); // Call reschedule handler
    } else {
      handleSave(interviewData); // Call original schedule handler
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isReschedule ? "Reschedule Interview" : "Schedule Interview"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Candidate</Form.Label>
            <Form.Control type="text" value={candidate?.full_name || ''} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Interview Date</Form.Label>
            <Form.Control 
              type="date" 
              name="interview_date" 
              value={interviewData.interview_date}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Interview Time</Form.Label>
            <Form.Control 
              type="time" 
              name="interview_time" 
              value={interviewData.interview_time}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        {isReschedule && (
          <Button variant="danger" onClick={handleCancelInterview}>
            Cancel Interview
          </Button>
        )}
        <Button variant="primary" onClick={onSave}>
          {isReschedule ? "Reschedule Interview" : "Schedule Interview"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InterviewModal;