// CandidatePortalModal.js
import React from 'react';
import { Modal } from 'react-bootstrap';
import CandidatePortal from './CandidatePortal';

const CandidatePortalModal = ({ show, handleClose, selectedPositionId, onSubmitSuccess  }) => {
    return (
        <Modal show={show} onHide={handleClose} size="lg" className='candidate-modal-form'>
            <Modal.Header closeButton>
                <Modal.Title>Candidate Portal</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <CandidatePortal selectedPositionId={selectedPositionId} onSubmitSuccess ={onSubmitSuccess}/>
            </Modal.Body>
        </Modal>
    );
};

export default CandidatePortalModal;
