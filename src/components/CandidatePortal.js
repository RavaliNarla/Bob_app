// App.jsx
import React, { useState } from 'react';
// import Header from './components/Header';
import ResumeUpload from '../components/ResumeUpload';
import MyDetailsForm from '../components/MyDetailsForm';
import ReviewDetails from '../components/ReviewDetails';
import ApplicationPane from '../components/ApplicationPane';
import RelevantJobs from '../components/RelevantJobs';
// import './custom-bootstrap-overrides.css'





const CandidatePortal = () => {
  const [activeTab, setActiveTab] = useState('resume');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'resume': return <ResumeUpload setActiveTab={setActiveTab} />;
      case 'info': return <MyDetailsForm setActiveTab={setActiveTab} />;
      case 'details': return <ReviewDetails />;
      case 'application': return <ApplicationPane />;
      case 'jobs': return <RelevantJobs />;
      default: return null;
    }
  };

  return (
    
    <div className="main-container container">
      {/* <Header />  */}
      <div className='d-flex'>
        
        <div className='flex-grow-1 m-4 '>
            <ul className="nav nav-tabs navbarupload justify-content-start">
  <li className="nav-item">
    <button className={`nav-link bornav ${activeTab === 'resume' ? 'active' : ''}`} onClick={() => setActiveTab('resume')}>Upload Resume</button>
  </li>
  <li className="nav-item">
    <button className={`nav-link bornav ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>My Details</button>
  </li>
  <li className="nav-item">
    <button className={`nav-link bornav ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Review Details</button>
  </li>
  <li className="nav-item">
    <button className={`nav-link bornav ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>Relevant Jobs</button>
  </li>
</ul>
            <div className="tab-content mt-3">
                {renderTabContent()}
            </div>
        </div>
     </div>
    </div>
    
  );
};

export default CandidatePortal;
