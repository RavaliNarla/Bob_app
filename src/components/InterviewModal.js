import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const InterviewModal = ({ show, handleClose, candidate, date, setDate, time, setTime, handleSchedule }) => {
    const [isDateTimeValid, setIsDateTimeValid] = useState(false);

    useEffect(() => {
        const validateDateTime = () => {
            if (!date || !time) {
                setIsDateTimeValid(false);
                return;
            }

            const now = new Date();
            const selectedDateTime = new Date(`${date}T${time}`);
            setIsDateTimeValid(selectedDateTime > now);
        };

        validateDateTime();
    }, [date, time]);

    return (
        <Modal show={show} onHide={handleClose} centered size='lg'>
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
                        min={new Date().toISOString().split('T')[0]} // Sets the minimum date to today
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
                <Button variant="primary" onClick={handleSchedule} disabled={!isDateTimeValid}>
                    Schedule & Send email
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InterviewModal;