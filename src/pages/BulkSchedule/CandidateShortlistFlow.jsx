import { useState } from 'react';
import { Users, FileText, CheckCircle, Filter, Briefcase } from 'lucide-react';
import { CandidatePoolTable } from './CandidatePoolTable';
import { OfferPoolScreen } from './OfferPoolScreen';
import { FeedbackModal, ConfirmationModal } from './RecruitmentModals';
import { InterviewSchedulePanel } from './InterviewSchedulePanel';
import { mockRequisitions, mockCandidates } from './mockData';
import '../../css/globals.css';

 function CandidateShortlistFlow() {
  const [activeTab, setActiveTab] = useState('candidates');
  const [viewMode, setViewMode] = useState('main');
  const [selectedRequisition, setSelectedRequisition] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  
  // Data states
  const [candidates, setCandidates] = useState(mockCandidates);
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

  const STAGES = [
    { id: 'Applied', label: 'Applied', color: 'secondary' },
    { id: 'Shortlisted', label: 'Shortlisted', color: 'info' },
    { id: 'Interview Scheduled', label: 'Interview', color: 'warning' },
    { id: 'Selected for Next Round', label: 'Next Round', color: 'primary' },
    { id: 'Selected', label: 'Selected', color: 'success' },
    { id: 'Offered', label: 'Offered', color: 'success' },
    { id: 'Rejected', label: 'Rejected', color: 'danger' },
  ];

  // Derived state
  const filteredCandidates = candidates.filter(c => {
    if (selectedPosition && c.positionId !== selectedPosition) return false;
    if (filters.stages.length > 0 && !filters.stages.includes(c.stage)) return false;
    if (filters.skills.length > 0 && !filters.skills.some(s => c.skills.includes(s))) return false;
    if (filters.location.length > 0 && !filters.location.some(l => c.location.includes(l))) return false;
    return true;
  });

  const handlePositionChange = (posId) => {
    setSelectedPosition(posId);
    setSelectedCandidates([]);
  };

  const handleStageToggle = (stage) => {
    setFilters(prev => {
      const newStages = prev.stages.includes(stage)
        ? prev.stages.filter(s => s !== stage)
        : [...prev.stages, stage];
      return { ...prev, stages: newStages };
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

  const handleScheduleConfirm = (schedules) => {
    // schedules is an object { candidateId: { date, time, panel, ... } }
    setCandidates(prev => prev.map(c => 
      schedules[c.id] 
        ? { ...c, stage: 'Interview Scheduled', interviewDetails: schedules[c.id] } 
        : c
    ));
    
    setViewMode('main');
    setSelectedCandidates([]);
  };

  const handleScheduleCancel = () => {
    setViewMode('main');
    // Optional: clear selection if desired, or keep it
  };

  // 2. Cancel Interview
  const openCancelModal = (targetId = null) => {
    setActionTargetId(targetId);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = () => {
    const targetIds = actionTargetId ? [actionTargetId] : selectedCandidates;
    
    setCandidates(prev => prev.map(c => 
      targetIds.includes(c.id) 
        ? { ...c, stage: 'Shortlisted', interviewDetails: undefined } 
        : c
    ));
    
    setCancelModalOpen(false);
    setSelectedCandidates([]);
    setActionTargetId(null);
  };

  // 3. Feedback
  const openFeedbackModal = (targetId) => {
    setActionTargetId(targetId);
    setFeedbackModalOpen(true);
  };

  const handleFeedbackConfirm = (e) => {
    const formData = new FormData(e.target);
    const newStatus = formData.get('status');

    if (actionTargetId && newStatus) {
      setCandidates(prev => prev.map(c => 
        c.id === actionTargetId 
          ? { ...c, stage: newStatus } 
          : c
      ));
    }
    setFeedbackModalOpen(false);
    setActionTargetId(null);
  };

  // 4. Offer
  const handleOfferRelease = (candidateId) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: 'Offered' } : c));
  };

  const getCandidateName = () => {
    if (!actionTargetId) return '';
    return candidates.find(c => c.id === actionTargetId)?.name || '';
  };

  // Render Schedule View
  if (viewMode === 'schedule') {
    // Filter full candidates list to match selected IDs
    const candidatesToSchedule = candidates.filter(c => selectedCandidates.includes(c.id));
    return (
      <div className="container-fluid p-4 h-100">
        <InterviewSchedulePanel 
          selectedCandidates={candidatesToSchedule}
          onSchedule={handleScheduleConfirm}
          onCancel={handleScheduleCancel}
          isReschedule={isReschedule}
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
          <div className="flex-grow-1">
             <label className="form-label fw-bold text-bob-blue">Requisition</label>
             <select 
               className="form-select"
               value={selectedRequisition} 
               onChange={(e) => setSelectedRequisition(e.target.value)}
             >
               <option value="">Select Requisition...</option>
               {mockRequisitions.map(req => (
                 <option key={req.id} value={req.id}>{req.name}</option>
               ))}
             </select>
          </div>
          <div className="flex-grow-1">
             <label className="form-label fw-bold text-bob-blue">Position</label>
             <select 
               className="form-select"
               value={selectedPosition}
               onChange={(e) => handlePositionChange(e.target.value)}
               disabled={!selectedRequisition}
             >
               <option value="">All Positions</option>
               {mockRequisitions
                 .find(r => r.id === selectedRequisition)
                 ?.positions.map(pos => (
                   <option key={pos.id} value={pos.id}>{pos.title}</option>
                 ))}
             </select>
          </div>
          {/* Removed Filters and Create Req buttons as requested */}
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
            Candidate Pool <span className="badge bg-secondary ms-1">{filteredCandidates.length}</span>
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link border-0 rounded-top-2 px-4 py-2 fw-semibold ${activeTab === 'offers' ? 'bg-white text-bob-blue shadow-sm border-top border-start border-end' : 'text-muted'}`}
            onClick={() => setActiveTab('offers')}
          >
            <CheckCircle size={18} className="me-2" />
            Offer Pool <span className="badge bg-secondary ms-1">{candidates.filter(c => c.stage === 'Offered').length}</span>
          </button>
        </li>
      </ul>

      {/* Content Area */}
      <div className="bg-white rounded shadow-sm p-4 border">
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
            />
          </>
        )}
        
        {activeTab === 'offers' && (
          <OfferPoolScreen 
            candidates={candidates.filter(c => c.stage === 'Offered')}
            onReleaseOffer={handleOfferRelease}
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
      />
    </div>
  );
}

export default CandidateShortlistFlow;