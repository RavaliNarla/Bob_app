// src/components/RelaxationPolicyDetails.jsx
import React from 'react';

const RelaxationPolicyDetails = ({ policy }) => {
  if (!policy) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-info-circle fs-1 text-muted mb-3"></i>
        <p className="text-muted">No policy details available</p>
      </div>
    );
  }

  return (
    <div className="relaxation-policy-details">
      <div className="mb-3">
        <h6 className="fw-bold mb-2">Policy Number</h6>
        <p>{policy.relaxation_policy_number || 'N/A'}</p>
      </div>
      
      <div className="mb-3">
        <h6 className="fw-bold mb-2">Description</h6>
        <p>{policy.description || 'No description available'}</p>
      </div>
      
      <div className="mb-3">
        <h6 className="fw-bold mb-2">Effective Date</h6>
        <p>{policy.effective_date || 'N/A'}</p>
      </div>
      
      <div className="mb-3">
        <h6 className="fw-bold mb-2">Expiry Date</h6>
        <p>{policy.expiry_date || 'N/A'}</p>
      </div>
      
      {policy.relaxation_rules?.length > 0 && (
        <div className="mb-3">
          <h6 className="fw-bold mb-2">Relaxation Rules</h6>
          <ul className="list-group">
            {policy.relaxation_rules.map((rule, index) => (
              <li key={index} className="list-group-item">
                <div className="d-flex justify-content-between">
                  <span className="fw-medium">{rule.rule_name || `Rule ${index + 1}`}</span>
                  <span className="badge bg-primary">{rule.rule_value || 'N/A'}</span>
                </div>
                {rule.description && (
                  <small className="text-muted d-block mt-1">{rule.description}</small>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RelaxationPolicyDetails;