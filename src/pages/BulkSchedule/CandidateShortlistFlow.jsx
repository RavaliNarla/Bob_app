import { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { Users, FileText, CheckCircle, Filter, Briefcase,Loader2 } from 'lucide-react';
import { CandidatePoolTable } from './CandidatePoolTable';
import { OfferPoolScreen } from './OfferPoolScreen';
import { FeedbackModal, ConfirmationModal } from './RecruitmentModals';
import { InterviewSchedulePanel } from './InterviewSchedulePanel';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//import { mockRequisitions, mockCandidates } from './mockData';
import '../../css/globals.css';
import { CandidateProfileModal } from "./CandidateProfileModal";
import Select from 'react-select';
 function CandidateShortlistFlow() {
  const [activeTab, setActiveTab] = useState('candidates');
  const [viewMode, setViewMode] = useState('main');
  const [requisitions, setRequisitions] = useState([]);
  const [selectedRequisition, setSelectedRequisition] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [positions, setPositions] = useState([]);
  // Data states
  const [candidates, setCandidates] = useState([]);
const [panels, setPanels] = useState([]);
const [isScheduling, setIsScheduling] = useState(false);
const [progress, setProgress] = useState({
  completed: 0,
  total: 0,
  percentage: 0,
});
const [profileModalOpen, setProfileModalOpen] = useState(false);
const [selectedProfile, setSelectedProfile] = useState(null);
  // Fetch requisitions on component mount
  useEffect(() => {
    const fetchRequisitions = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getReqData();
        if (response.success) {
          setRequisitions(response.data);
        } else {
          console.error('Failed to fetch requisitions:', response.message);
        }
      } catch (error) {
        console.error('Error fetching requisitions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequisitions();
  }, []);
  useEffect(() => {
  const fetchPositions = async () => {
    if (!selectedRequisition) {
      setPositions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.getByRequisitionId(selectedRequisition);
      if (response.success) {
        setPositions(response.data || []);
        setPanels(response.data[0]?.panels || []);
      } else {
        console.error('Failed to fetch positions:', response.message);
        setPositions([]);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      setPositions([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchPositions();
}, [selectedRequisition]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  // Modal States
  const [isReschedule, setIsReschedule] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  
  // Target candidate(s) for the current action
  const [actionTargetId, setActionTargetId] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    stages: [],
    skills: [],
    location: [],
    rating: [0, 5]
  });

  // const STAGES = [
  //   { id: 'Applied', label: 'Applied', color: 'secondary' },
  //   { id: 'Shortlisted', label: 'Shortlisted', color: 'info' },
  //   { id: 'Interview Scheduled', label: 'Interview', color: 'warning' },
  //   { id: 'Selected for Next Round', label: 'Next Round', color: 'primary' },
  //   { id: 'Selected', label: 'Selected', color: 'success' },
  //   { id: 'Offered', label: 'Offered', color: 'success' },
  //   { id: 'Rejected', label: 'Rejected', color: 'danger' },
  // ];

  const STAGES = [
   // { id: 'Applied', label: 'Applied', color: 'secondary' },
    { id: 'Shortlisted', label: 'Shortlisted', color: 'info' },
    { id: 'Scheduled', label: 'Scheduled', color: 'warning' },
    { id: 'Selected for Next Round', label: 'Next Round', color: 'primary' },
    { id: 'Selected', label: 'Selected', color: 'success' },
    { id: 'Offered', label: 'Offered', color: 'success' },
    { id: 'Rejected', label: 'Rejected', color: 'danger' },
     { id: 'Cancelled', label: 'Cancelled', color: 'secondary' }
  ];

  
  const handleViewProfile = (candidate) => {
  setSelectedProfile(candidate);
  setProfileModalOpen(true);
};

  // Derived state
  // const filteredCandidates = candidates.filter(c => {
  //   if (selectedPosition && c.positionId !== selectedPosition) return false;
  //   if (filters.stages.length > 0 && !filters.stages.includes(c.application_status)) return false;
  //   //if (filters.skills.length > 0 && !filters.skills.some(s => c.skills.includes(s))) return false;
  //   //if (filters.location.length > 0 && !filters.location.some(l => c.location.includes(l))) return false;
  //   return true;
  // });
const filteredCandidates = candidates.filter(c => {
  // 1️⃣ Filter by selected position (optional)
  if (selectedPosition && c.positionId && c.positionId !== selectedPosition) return false;

  // 2️⃣ Filter by selected stage(s)
  if (filters.stages.length > 0 && !filters.stages.includes(c.stage)) return false;

  return true;
});

 const handlePositionChange = async (posId) => {
  setSelectedPosition(posId);

  if (!posId) {
    setCandidates([]);
    return;
  }

  try {
    setIsLoading(true);
    const response = await apiService.getCanByPosition(posId);
    console.log('API Response:', response.data.data);

    const candidatesArray = response?.data?.data;
    if (Array.isArray(candidatesArray)) {
      const mappedCandidates = candidatesArray.map((candidate) => ({
        id: candidate?.candidate_id || '',
        positionId: posId, // ✅ Add positionId for filtering
        name: candidate?.full_name || 'N/A',
        email: candidate?.email || 'N/A',
        phone: candidate?.phone || 'N/A',
        gender: candidate?.gender || 'N/A',
        dob: candidate?.date_of_birth || 'N/A',
        experience: candidate?.total_experience || 'N/A',
        skills: candidate?.skills
          ? candidate.skills.split(',').map((s) => s.trim())
          : [],
        stage: candidate?.application_status || 'Shortlisted',
        current_designation: candidate?.current_designation || 'N/A',
        current_employer: candidate?.current_employer || 'N/A',
        education_qualification: candidate?.education_qualification || 'N/A',
        id_proof: candidate?.id_proof || 'N/A',
        nationality_id: candidate?.nationality_id || '',
        address: candidate?.address || 'N/A',
        comments: candidate?.comments || '',
        resumeUrl: candidate?.fileUrl || '',
        offerLetterUrl: candidate?.offerLetterUrl || '',
        document_url: candidate?.document_url || '',
        application_id: candidate?.application_id || '',
        reservation_category_id: candidate?.reservation_category_id || '',
        special_category_id: candidate?.special_category_id || '',
      }));

      console.log('Mapped Candidates:', mappedCandidates);
      setCandidates(mappedCandidates);
    } else {
      console.error('Invalid or empty candidate array:', response);
      setCandidates([]);
    }
  } catch (error) {
    console.error('Error fetching candidates:', error);
    setCandidates([]);
  } finally {
    setIsLoading(false);
  }
};


useEffect(() => {
  // only refresh when we return to the main view and a position is selected
  if (viewMode === 'main' && selectedPosition) {
    handlePositionChange(selectedPosition);
  }
}, [viewMode, selectedPosition]);

  // const handleStageToggle = (stage) => {
  //   setFilters(prev => {
  //     const newStages = prev.stages.includes(stage)
  //       ? prev.stages.filter(s => s !== stage)
  //       : [...prev.stages, stage];
  //     return { ...prev, stages: newStages };
  //   });
  // };
const handleStageToggle = (stage) => {
  setFilters(prev => {
    const isSameStageSelected = prev.stages[0] === stage;
    return { 
      ...prev, 
      stages: isSameStageSelected ? [] : [stage]  // ✅ Only one stage at a time
    };
  });
};
  // --- Action Handlers ---

  // 1. Schedule / Reschedule Switcher
  const handleOpenScheduleView = (isResched = false, targetId = null) => {
    if (targetId) {
      // Single Action: Ensure only this candidate is selected for the schedule view
      setSelectedCandidates([targetId]);
    } else if (selectedCandidates.length === 0) {
      return; // Should not happen if button disabled
    }
    
    setIsReschedule(isResched);
    setViewMode('schedule');
  };

//   const handleScheduleConfirm = (schedules) => {
//     // schedules is an object { candidateId: { date, time, panel, ... } }
//     // setCandidates(prev => prev.map(c => 
//     //   schedules[c.id] 
//     //     ? { ...c, stage: 'Interview Scheduled', interviewDetails: schedules[c.id] } 
//     //     : c
//     // ));
// console.log("Scheduling interviews with data:", schedules);
//         const timeHHMM = String(schedules.startTime).slice(0, 5);
//         //console.log("Formatted time (HH:MM):", timeHHMM);
//         const interviewPayload = {
//             application_id: schedules?.applicationId,
//             date: schedules?.date,
//             time: schedules.startTime,
            
//             interviewer_id: schedules?.panelId,
//             status: "Scheduled",
//             interview_type: schedules?.interview_type,
//             location: "",
//             phone: "",
//             is_panel_interview: true,
//         };
// console.log("Interview Payload:", interviewPayload);
//         try {
//             //const response =  apiService.scheduleInterview(interviewPayload);
//         }
//         catch (error) {
//               toast.error("Error scheduling interview:", error);
//           } 
    
//     setViewMode('main');
//     setSelectedCandidates([]);
//   };
const handleScheduleConfirm = async (schedules) => {
  try {
    const allSchedules = Object.values(schedules);
    if (allSchedules.length === 0) {
      toast.warning("No candidates to schedule.");
      return;
    }

    const CHUNK_SIZE = 200; // ⚙️ adjust depending on server capacity
    const remaining = [...allSchedules];
    let successCount = 0;
    let batchCount = 1;
setIsScheduling(true);
setProgress({ completed: 0, total: allSchedules.length, percentage: 0 });

    while (remaining.length > 0) {
      const batch = remaining.splice(0, CHUNK_SIZE);
      console.log(`⚡ Processing batch ${batchCount} (${batch.length} candidates)`);

      // Run all API calls in parallel
      const results = await Promise.allSettled(
        batch.map(async (s) => {
          const interviewPayload = {
            application_id: s.applicationId,
            date: s.date,
            time: s.startTime,
            interviewer_id: s.panelId,
            status: "Scheduled",
            interview_type: s.interview_type || "Panel",
            location: "",
            phone: "",
            is_panel_interview: true,
          };

          try {
            const response = await apiService.scheduleInterview(interviewPayload);
            const message = String(response?.data || response).toLowerCase();
            if (message.includes("interview scheduled")) {
              return { success: true };
            } else {
              console.warn(`❌ Failed to schedule candidate ${s.candidateId}`);
              return { success: false };
            }
          } catch (error) {
            console.error(`⚠️ Error scheduling ${s.candidateId}:`, error);
            return { success: false };
          }
        })
      );

      // Count successful results
      const batchSuccess = results.filter(r => r.status === "fulfilled" && r.value.success).length;
      successCount += batchSuccess;

      // Update progress
      setProgress(prev => {
        const completed = prev.completed + batch.length;
        return {
          ...prev,
          completed,
          percentage: Math.round((completed / prev.total) * 100),
        };
      });

      console.log(`✅ Batch ${batchCount} done: ${batchSuccess}/${batch.length} successful`);

      batchCount++;
      await new Promise(r => setTimeout(r, 300)); // optional delay between batches
    }

    toast.success('Successfully scheduled ${successCount} candidates!');
    setViewMode("main");
    setSelectedCandidates([]);

  } catch (error) {
    console.error("Scheduling error:", error);
    toast.error("Error scheduling interviews. Please try again.");
  } finally {
   setIsScheduling(false);
  }
};


  const handleScheduleCancel = () => {
    setViewMode('main');
    // Optional: clear selection if desired, or keep it
  };

  // 2. Cancel Interview
  const openCancelModal = (targetId = null) => {
    console.log("targetId",targetId);

    setActionTargetId(targetId);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
  try {
    const targetIds = actionTargetId ? [actionTargetId] : selectedCandidates;
    if (targetIds.length === 0) {
      toast.warning("Please select at least one candidate to cancel.");
      return;
    }

    setIsLoading(true);

    // Find candidate(s) to cancel
    const candidatesToCancel = candidates.filter(c => targetIds.includes(c.id));

    // Loop through candidates or call in parallel
    const results = await Promise.allSettled(
      candidatesToCancel.map(async (c) => {
        const payload = {
          application_id: c.application_id,
          status: "Cancelled",
        };

        console.log("Cancelling interview for:", c.name, payload);

        try {
          const response = await apiService.updateInterviewStatus(payload);
          if (response?.success || response?.status === 200) {
            console.log(`✅ Cancelled: ${c.name}`);
            return true;
          } else {
            console.warn(`⚠️ Failed to cancel ${c.name}`);
            return false;
          }
        } catch (err) {
          console.error(`❌ Error cancelling ${c.name}:`, err);
          return false;
        }
      })
    );

    // Count success
    const successCount = results.filter(r => r.status === "fulfilled" && r.value).length;
    toast.success(`Cancelled ${successCount} interview(s) successfully!`);

    // ✅ Update local UI
    setCandidates(prev =>
      prev.map(c =>
        targetIds.includes(c.id)
          ? { ...c, stage: "Cancelled", interviewDetails: undefined }
          : c
      )
    );

  } catch (error) {
    console.error("Cancel interview error:", error);
    toast.error("Failed to cancel interview(s). Please try again.");
  } finally {
    setIsLoading(false);
    setCancelModalOpen(false);
    setSelectedCandidates([]);
    setActionTargetId(null);
  }
};


  // 3. Feedback
  const openFeedbackModal = (targetId) => {
    setActionTargetId(targetId);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackConfirm = async () => {
  try {
    // ✅ Refresh candidates for the current position after feedback submission
    if (selectedPosition) {
      await handlePositionChange(selectedPosition);
    }
  } catch (error) {
    console.error("Error refreshing candidate list:", error);
    toast.error("Failed to refresh candidate data after feedback.");
  } finally {
    // ✅ Close modal and reset state
    setFeedbackModalOpen(false);
    setActionTargetId(null);
    setViewMode("main"); // Back to main view
  }
};

  // 4. Offer
  const handleOfferRelease = (candidateId) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: 'Offered' } : c));
  };

  const getCandidateName = () => {
    if (!actionTargetId) return '';
    return candidates.find(c => c.id === actionTargetId)?.name || '';
  };
const getCandidateDetails = () => {
  if (!actionTargetId) return null;
  return candidates.find(c => c.id === actionTargetId) || null;
};
  // Render Schedule View
  if (viewMode === 'schedule') {
    // Filter full candidates list to match selected IDs
    console.log('Selected Candidates:', selectedCandidates);
    const candidatesToSchedule = candidates.filter(c => selectedCandidates.includes(c.id));
    return (
      <div className="container-fluid p-4 h-100">
        <InterviewSchedulePanel 
          selectedCandidates={candidatesToSchedule}
          onSchedule={handleScheduleConfirm}
          onCancel={handleScheduleCancel}
          isReschedule={isReschedule}
          panels={panels}
          selectedPosition={selectedPosition}
          selectedRequisition={selectedRequisition}
          candidates={filteredCandidates}
          
        />
      </div>
    );
  }

  // Render Main View
  return (
    <div className="container-fluid p-4">
      {/* Header / Requisition Selector */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body d-flex flex-wrap align-items-end gap-3 p-3">
          {/* Requisition */}
          <div className="col-md-4">
            <label className="form-label fw-bold text-bob-blue">Requisition</label>

              <Select
                className="shadow-sm"
                placeholder="Select Requisition..."
                // ✅ value must be the *object* that matches one of the options
                value={
                  requisitions
                    .map(req => ({
                      value: req.requisition_id,
                      label: `${req.requisition_code} - ${req.requisition_title}`,
                    }))
                    .find(opt => opt.value === selectedRequisition) || null
                }
                // ✅ onChange gives you the selected object
                onChange={(option) => setSelectedRequisition(option?.value || '')}
                options={requisitions.map(req => ({
                  value: req.requisition_id,
                  label: `${req.requisition_code} - ${req.requisition_title}`,
                }))}
                isDisabled={isLoading}
                isSearchable
              />

          </div>

          {/* Position */}
          <div className="col-md-4">
            <label className="form-label fw-bold text-bob-blue">Position</label>
           <Select
                placeholder="Select Position..."
                value={
                  positions
                    .map(pos => ({
                      value: pos.position_id,
                      label: pos.position_title || pos.title || `Position ${pos.position_id}`,
                    }))
                    .find(opt => opt.value === selectedPosition) || null
                }
                onChange={(option) => handlePositionChange(option?.value || '')}
                options={positions.map(pos => ({
                  value: pos.position_id,
                  label: pos.position_title || pos.title || `Position ${pos.position_id}`,
                }))}
                isDisabled={!selectedRequisition || isLoading}
                isSearchable
            />

          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3 border-bottom-0">
        <li className="nav-item">
          <button 
            className={`nav-link border-0 rounded-top-2 px-4 py-2 fw-semibold ${activeTab === 'candidates' ? 'bg-white text-bob-orange shadow-sm border-top border-start border-end' : 'text-muted'}`}
            onClick={() => setActiveTab('candidates')}
          >
            <Users size={18} className="me-2" />
           Candidate Pool {/*  <span className="badge bg-secondary ms-1">{filteredCandidates.length}</span> */}
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link border-0 rounded-top-2 px-4 py-2 fw-semibold ${activeTab === 'offers' ? 'bg-white text-bob-blue shadow-sm border-top border-start border-end' : 'text-muted'}`}
            onClick={() => setActiveTab('offers')}
          >
            <CheckCircle size={18} className="me-2" />
            Offer Pool {/* <span className="badge bg-secondary ms-1">{candidates.filter(c => c.stage === 'Offered').length}</span> */}
          </button>
        </li>
      </ul>

      {/* Content Area */}
      <div className="bg-white rounded shadow-sm p-4 border">
              
          {/* Scheduling Progress Overlay */}
          {isScheduling && (
            <div 
              className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-dark bg-opacity-50"
              style={{ zIndex: 1050 }}
            >
              <div className="bg-white rounded shadow-lg p-4 text-center" style={{ width: "400px" }}>
                <div className="d-flex justify-content-center mb-3">
                  <Loader2 size={40} className="text-primary spin" />
                </div>
                <h5 className="text-primary mb-2">Scheduling Interviews...</h5>
                <p className="text-muted mb-3 small">
                  {progress.completed} / {progress.total} candidates processed
                </p>
                <div className="progress" style={{ height: "10px" }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                    role="progressbar"
                    style={{ width: `${progress.percentage}%` }}
                    aria-valuenow={progress.percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                <p className="mt-2 text-secondary small fw-semibold">
                  {progress.percentage}% Complete
                </p>
              </div>
            </div>
          )}

        {activeTab === 'candidates' && (
          <>
            {/* Stage Filters */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="fw-bold text-muted small text-uppercase">Filter by Stage:</span>
                {filters.stages.length > 0 && (
                  <button 
                    className="btn btn-link btn-sm text-danger text-decoration-none p-0"
                    onClick={() => setFilters(prev => ({...prev, stages: []}))}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="d-flex flex-wrap gap-2">
                {STAGES.map(stage => {
                  const isActive = filters.stages.includes(stage.id);
                  const count = candidates.filter(c => c.stage === stage.id && (!selectedPosition || c.positionId === selectedPosition)).length;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => handleStageToggle(stage.id)}
                      className={`btn btn-sm rounded-pill px-3 border d-flex align-items-center gap-2 ${isActive ? `btn-${stage.color} text-white` : 'btn-light text-secondary'}`}
                      style={{ transition: 'all 0.2s' }}
                    >
                      {stage.label}
                      <span className={`badge ${isActive ? 'bg-white text-dark' : 'bg-secondary text-white'}`} style={{ fontSize: '0.7em' }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <CandidatePoolTable 
              candidates={filteredCandidates}
              selectedCandidates={selectedCandidates}
              onSelectionChange={setSelectedCandidates}
              onSchedule={() => handleOpenScheduleView(false)}
              onReschedule={(id) => handleOpenScheduleView(true, id)}
              onCancel={(id) => openCancelModal(id)}
              onFeedback={(id) => openFeedbackModal(id)}
              onBulkReschedule={() => handleOpenScheduleView(true)}
              onBulkCancel={() => openCancelModal()}
              onViewProfile={handleViewProfile} // ✅ NEW
                filters={filters} 
                activeStage={filters.stages.length === 1 ? filters.stages[0] : null}

            />
          </>
        )}
        
        {activeTab === 'offers' && (
          <OfferPoolScreen 
            candidates={candidates.filter(c => c.stage === 'Selected')}
           
            onViewProfile={handleViewProfile}
            selectedPosition={selectedPosition}
            selectedRequisition={selectedRequisition}
            positions={positions}
            onBackToMain={() => {
            console.log("🔄 Navigating back to main view...");
            setViewMode('main');
            setActiveTab('candidates');
            // Set the stage filter to 'Offered'
            setFilters(prev => ({
              ...prev,
              stages: ['Offered']  // This will automatically select the Offered stage
            }));
          }}
          />
        )}
      </div>

      {/* Modals */}
      {/* Note: Schedule Modal is replaced by ViewMode 'schedule' */}
      
      <ConfirmationModal 
        show={cancelModalOpen} 
        onClose={() => setCancelModalOpen(false)} 
        onConfirm={handleCancelConfirm}
        title="Cancel Interview"
        message={`Are you sure you want to cancel the interview${actionTargetId ? '' : 's'}? The candidate${actionTargetId ? '' : 's'} will be moved back to 'Shortlisted'.`}
        confirmText="Yes, Cancel Interview"
        confirmClass="btn-danger"
      />

      <FeedbackModal 
        show={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onConfirm={handleFeedbackConfirm}
        candidateName={getCandidateName()}
        candidateDetails={getCandidateDetails()}
      />
      <CandidateProfileModal
        show={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        candidate={selectedProfile}
      />
    </div>
  );
}

export default CandidateShortlistFlow;