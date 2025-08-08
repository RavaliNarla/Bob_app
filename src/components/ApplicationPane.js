// components/Tabs/ApplicationPane.jsx
import React from 'react';

const ApplicationPane = () => {
  return (
    <div className="col-lg-6">
      <div className="job-card">
        <div className="job-card-header">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6>General Manager - Asset Commission</h6>
              <div className="job-meta">
                Jaisalmer, Rajasthan, India • Posting Dates: 07/09/2025
              </div>
              <div className="mt-2">
                <span className="job-card-tag">BE THE FIRST TO APPLY</span>
              </div>
            </div>
            <i className="ph ph-star"></i>
          </div>
        </div>
        <div className="job-card-body">
          <b>BOT Link</b><br />
          <a href="#">http://192.168.100.134/Bot_Interview/21072025_username</a>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPane;
