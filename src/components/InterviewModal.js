import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const InterviewModal = ({ show, handleClose, candidate, date, setDate, time, setTime, handleSchedule }) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Schedule Interview</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {candidate && (
                    <p>Schedule an interview for: <strong>{candidate.firstname}</strong></p>
                )}
                <Form.Group className="mb-3">
                    <Form.Label>Interview Date</Form.Label>
                    <Form.Control
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Interview Time</Form.Label>
                    <Form.Control
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSchedule}>
                    Schedule & Send email
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InterviewModal;