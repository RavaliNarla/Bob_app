import React, { useEffect, useState } from 'react';

const ReviewDetails = () => {
  const [details, setDetails] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem('formData');
    if (stored) {
      const data = JSON.parse(stored);
      setDetails({
        'Name *': data.Name || '',
        'Date of Birth *': data.DateOfBirth
          ? new Date(data.DateOfBirth).toLocaleDateString('en-US')
          : '',
        'Email *': data.Email || '',
        'Skills': data.skills || '',
        'Total Experience': data.totalExperience || '',
        'Current Designation': data.currentDesignation || '',
        'Current Employer': data.currentEmployer || '',
        'Address': data.address || ''
      });
    }
  }, []);

  return (
    <div className="details-section">
      <div className="details-header">
        <h5>My Details</h5>
      </div>
      <div className="details-grid">
        {details && typeof details === 'object' &&
          Object.entries(details).map(([label, value]) => (
            <div className="detail-item" key={label}>
              <label>{label}</label>
              <p>{value}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ReviewDetails;
