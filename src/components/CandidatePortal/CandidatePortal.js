// CandidatePortal.js
import React, { useState, useEffect } from 'react';
// import './custom-bootstrap-overrides.css';
import '../../custom-bootstrap-overrides.css';
import { useSelector } from 'react-redux';
import ResumeUpload from './Tabs/ResumeUpload';
import ReviewDetails from './Tabs/ReviewDetails';
import apiService from '../../services/apiService';


const CandidatePortal = ({ selectedPositionId, onSubmitSuccess }) => {
  const user = useSelector((state) => state.user.user);
  const authUser = useSelector((state) => state.user.authUser);
  console.log("User from Redux:", user);
  console.log("Auth User from Redux:", authUser);
  const [activeTab, setActiveTab] = useState('resume');
  const [resumeFile, setResumeFile] = useState(null);
  const [ResumePublicUrl, setResumePublicUrl] = useState(null);
  const [candidateData, setCandidateData] = useState({});
  const [jobsList, setJobsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
   const [isResumeStepDone, setIsResumeStepDone] = useState(false);

  // Handle form submission from ReviewDetails
  const handleFormSubmit = (updatedData) => {
    setCandidateData(updatedData);
  };
  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!user?.candidate_id) return; // Add a guard clause
      const candidateId = user?.candidate_id;
      try {
        const response = await apiService.getCandidateDetails(candidateId);
        if (response.success && response.data) {
          const data = response.data;
          console.log("Candidate Data:", data);
          if (data) {
            // Map API response to your form fields
            setCandidateData({
              name: data.full_name || '',
              email: data.email || '',
              phone: data.phone || '',
              gender: data.gender || 'Male',
              id_proof: data.id_proof || '',
              dob: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
              nationality_id: data.nationality_id || '',
              special_category_id: data.special_category_id || '',
              reservation_category_id: data.reservation_category_id || '',
              education_qualification: data.education_qualification || '',
              totalExperience: data.total_experience || 0,
              currentDesignation: data.current_designation || '',
              currentEmployer: data.current_employer || '',
              address: data.address || '',
              skills: data.skills || ''
            });

            // Set resume URL if exists
            if (data.file_url) {
              setResumePublicUrl(data.file_url);
              setIsResumeStepDone(true);
              // You might want to set a flag to show resume is already uploaded
            }
          }
        }
      } catch (error) {
        console.error('Error fetching candidate data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidateData();
  }, [user?.candidate_id]);
  const renderTabContent = () => {
    switch (activeTab) {
      case 'resume':
        return (
          <ResumeUpload
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            setParsedData={setCandidateData}
            setResumePublicUrl={setResumePublicUrl}
            resumePublicUrl={ResumePublicUrl}
            goNext={() => {
              setIsResumeStepDone(true); // ✅ mark resume step complete
              setActiveTab('info');
            }}
          />
        );

      case 'info':
        return (
          <ReviewDetails
            initialData={candidateData}
            resumePublicUrl={ResumePublicUrl}
            onSubmit={handleFormSubmit}
            selectedPositionId={selectedPositionId}
            onSubmitSuccess={onSubmitSuccess}
          />
        );

      // case 'details':
      //   return (
      //     <MyDetailsForm
      //       data={candidateData}     
      //     />
      //   );



      default:
        return null;
    }
  };

  return (
    <div>
      <div className="d-flex">
        <div className="flex-grow-1 m-4">
          {/* Tabs */}
          <ul className="nav nav-tabs navbarupload justify-content-start">
            <li className="nav-item">
              <button
                className={`nav-link bornav ${activeTab === 'resume' ? 'active' : ''}`}
                onClick={() => setActiveTab('resume')}
              >
                Upload Resume
              </button>
            </li>
            {/* <li className="nav-item">
              <button
                className={`nav-link bornav ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => {
                  if (isResumeStepDone) {
                    setActiveTab('info');
                  }
                }}
                disabled={!isResumeStepDone} // 🔒 disable until resume step done
              >
                Review Details
              </button>
            </li> */}
            {/* 🔒 Only show Review Details tab if resume step is done */}
  {isResumeStepDone && (
    <li className="nav-item">
      <button
        className={`nav-link bornav navs-link ${activeTab === 'info' ? 'active' : ''}`}
        onClick={() => setActiveTab('info')}
      >
        Review Details
      </button>
    </li>
  )}
            {/* <li className="nav-item">
              <button
                className={`nav-link bornav ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                My Details
              </button>
            </li> */}
            {/* <li className="nav-item">
              <button
                className={`nav-link bornav ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobs')}
              >
                Careers
              </button>
            </li> */}
          </ul>

          {/* Tab Content */}
          <div className="tab-content mt-3">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePortal;
