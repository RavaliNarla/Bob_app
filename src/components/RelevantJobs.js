// components/Tabs/RelevantJobs.jsx
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBriefcase,
  faMapMarkerAlt,
  faClipboardList,
  faCalendarAlt,
  faUsers,
  faClock,
  faCode,
  faTools 
} from '@fortawesome/free-solid-svg-icons';


const RelevantJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('formData'));
    if (!storedData || !storedData.skills) return;

    const cachedJobs = localStorage.getItem('matchedJobs');
    if (cachedJobs) {
      setJobs(JSON.parse(cachedJobs));
      setLoading(false);
      return;
    }

    const candidateSkills = storedData.skills.split(',').map(skill => skill.trim());

    fetch('https://backend.sentrifugo.com/relevant-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills: candidateSkills })
    })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('matchedJobs', JSON.stringify(data.matchedJobs));
        setJobs(data.matchedJobs);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {loading && (
        <div style={{ textAlign: 'center', margin: '20px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading Relevant Jobs...</p>
        </div>
      )}

      <div className="row" id="matched-jobs-container">
        {jobs.length === 0 && !loading && <p>No matching jobs found.</p>}

        {jobs.map((job, index) => (
          // <div className="col-lg-4 mb-4" key={index}>
          //   <div className="job-card">
          //     <div className="job-card-header">
          //       <div className="d-flex justify-content-between align-items-start">
          //         <div>
          //           <h6>{job.JobTitle}</h6>
          //           <div className="job-meta">
          //             Location: {job.JobLocation} Posted: {job.JobPostedDate}
          //           </div>
          //           <div className="mt-2">
          //             <span className="job-card-tag">RECOMMENDED</span>
          //           </div>
          //         </div>
          //         <i className="ph ph-star"></i>
          //       </div>
          //     </div>
          //     <div className="job-card-body">
          //       {job.JobDescription}
          //       <br /><br />
          //       <strong>Required Skills:</strong> {job.JobSkills}
          //     </div>
          //   </div>
          // </div>
          // This is the for static purpose
          <div className="col-md-4 mb-4" key={index}>
   
                  <div className="card h-100" style={{
      background: 'linear-gradient(135deg, #e0f7fa, #ffffff)',
      boxShadow: '0px 8px 20px rgba(0, 123, 255, 0.15)',
      borderRadius: '12px',
      
      border: 0
    }}>

                    <div className="card-body">
                      
<h6 className="job-title">
  
            <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" />
             <b>{job.JobTitle}</b>
          </h6>       
                       <p className="mb-1 text-muted small "><FontAwesomeIcon icon={faBriefcase} className="me-2 text-muted" />{job.JobDescription}</p>
                      <p className="mb-1 text-muted small"> <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted" /><b>Location:</b> {job.JobLocation}</p>
                      <p className="mb-1 text-muted small"><FontAwesomeIcon icon={faUsers} className="me-2 text-muted" /><b>Vacancies:</b> {job.Vacancies || 'NA'}</p>
                      <p className="mb-1 text-muted small"><FontAwesomeIcon icon={faClock} className="me-2 text-muted" /><b>Experience:</b> {job.Experience || 'As per details'}</p>
                      <p className="mb-1 text-muted small"><FontAwesomeIcon icon={faTools} className="me-2 text-muted" /><b>Required Skills:</b> {job.JobSkills || 'As per details'}</p>

                      <p className="mb-1 text-muted small"><FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-muted" /><b>Last Date to Apply:</b>  {job.JobPostedDate}</p>

                      <div className="d-flex   mt-3">
                        <button className="btn btn-sm btn-outline-primary hovbtn"><b>Apply Online</b></button>
                        <button className="btn btn-sm knowntb ms-2"><b>Know More</b></button>
                      </div>
                    </div>
                  </div>
                </div>
          
        ))}
      </div>
    </div>
  );
};

export default RelevantJobs;
