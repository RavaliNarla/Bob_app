import { useState } from 'react';
import { MoreVertical, Calendar, MessageSquare, X, RefreshCw, User } from 'lucide-react';

export function CandidatePoolTable({ 
  candidates, 
  selectedCandidates, 
  onSelectionChange, 
  onSchedule,
  onReschedule,
  onCancel,
  onFeedback,
  onBulkReschedule,
  onBulkCancel,
  onViewProfile,
   filters,  // Add this line
  activeStage 
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const isActionTab = !['Rejected', 'Selected', 'Offered'].includes(activeStage);

  console.log('active tab:', activeStage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange(candidates.map(c => c.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      onSelectionChange([...selectedCandidates, id]);
    } else {
      onSelectionChange(selectedCandidates.filter(cid => cid !== id));
    }
  };

  const getStageBadgeClass = (stage) => {
    switch(stage) {
      case 'Shortlisted': return 'bg-success text-dark';
      case 'Scheduled': return 'bg-primaryy';
      case 'Selected for Next Round': return 'bg-info';
      case 'Selected': return 'bg-secondaryy';
      case 'Offered': return 'bg-success';
      case 'Rejected': return 'bg-danger';
      case 'Cancelled': return 'bg-warning';
      default: return 'bg-light text-dark';
    }
  };

  const getBulkActions = () => {
    if (selectedCandidates.length === 0) return null;
    const selectedObjs = candidates.filter(c => selectedCandidates.includes(c.id));
    const allScheduled = selectedObjs.every(c => ['Scheduled', 'Selected for Next Round','Cancelled'].includes(c.stage));
    const allShortlisted = selectedObjs.every(c => ['Shortlisted', 'Applied'].includes(c.stage));
    return { allScheduled, allShortlisted };
  };

  const bulkState = getBulkActions();

  return (
    <div className="d-flex flex-column h-100">

      {/* ✅ Show Toolbar only for actionable tabs */}
      {isActionTab && (
        <div className="d-flex justify-content-between align-items-center mb-3 bg-light p-2 rounded border">
          <div className="d-flex align-items-center gap-3">
            {selectedCandidates.length > 0 ? (
              <span className="text-bob-blue fw-bold ms-2">
                {selectedCandidates.length} selected
              </span>
            ) : (
              <span className="text-muted ms-2 small">
                Select candidates to perform actions
              </span>
            )}
          </div>
          <div className="d-flex gap-2">
            {bulkState?.allShortlisted && (
              <button 
                className="btn btn-sm btn-bob-primary" 
                onClick={onSchedule}
              >
                <Calendar size={16} className="me-1" /> Schedule Interview
              </button>
            )}
            {bulkState?.allScheduled && (
              <>
                <button 
                  className="btn btn-sm btn-outline-bob-blue bg-white text-bob-blue" 
                  onClick={onBulkReschedule}
                >
                  <RefreshCw size={16} className="me-1" /> Reschedule
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={onBulkCancel}
                >
                  <X size={16} className="me-1" /> Cancel Interview
                </button>
              </>
            )}
            {selectedCandidates.length > 0 && !bulkState?.allScheduled && !bulkState?.allShortlisted && (
              <button className="btn btn-sm btn-outline-secondary" disabled>
                Mixed Selection Actions Unavailable
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-responsive flex-grow-1" style={{ minHeight: '400px' }}>
        <table className="table table-hover table-bordered align-middle" style={{ fontSize: '0.9rem' }}>
          <thead className="table-light text-muted sticky-top">
            <tr>
              {isActionTab && (
                <th style={{ width: '40px' }} className="text-center">
                  <input 
                    type="checkbox" 
                    className="form-check-input"
                    checked={candidates.length > 0 && selectedCandidates.length === candidates.length}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th>Candidate Details</th>
              <th>Skills</th>
              <th>Experience</th>
              <th>Current Role</th>
              <th>Status</th>
              <th>Education</th>
              <th style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => (
              <tr key={candidate.id} className={selectedCandidates.includes(candidate.id) ? 'table-active' : ''}>
                {isActionTab && (
                  <td className="text-center">
                    <input 
                      type="checkbox" 
                      className="form-check-input"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={(e) => handleSelectOne(candidate.id, e.target.checked)}
                    />
                  </td>
                )}
                <td className="fw-semibold text-bob-blue">
                  {candidate.name}
                  <div className="small text-muted fw-normal">{candidate.email}</div>
                  <div className="small text-muted">{candidate.phone}</div>
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {candidate.skills?.length ? (
                      <>
                        {candidate.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="badge bg-light text-secondary border fw-normal">
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="badge bg-light text-muted border fw-normal">
                            +{candidate.skills.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted small">No skills listed</span>
                    )}
                  </div>
                </td>
                <td>{candidate.experience} {candidate.experience === '1' ? 'year' : 'years'}</td>
                <td>
                  {candidate.current_employer && (
                    <div className="small text-muted">{candidate.current_employer}</div>
                  )}
                  <div className="small">{candidate.current_designation}</div>
                </td>
                <td>
                  <span className={`badge ${getStageBadgeClass(candidate.stage)}`}>
                    {candidate.stage}
                  </span>
                </td>
                <td className="small text-truncate" style={{ maxWidth: '150px' }}>
                  {candidate.education_qualification}
                </td>
                <td className="text-center position-relative">
                  <button 
                    className="btn btn-link text-muted p-0" 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(openDropdownId === candidate.id ? null : candidate.id);
                    }}
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openDropdownId === candidate.id && (
                    <div 
                      className="position-absolute end-0 mt-1 bg-white border rounded shadow-sm py-1 p-1 text-start" 
                      style={{ zIndex: 1050, width: '180px', top: '100%', fontSize: '14px' }}
                    >
                      {['Applied', 'Shortlisted'].includes(candidate.stage) && (
                        <button 
                          className="dropdown-item small py-2 d-flex align-items-center gap-2"
                          onClick={() => { onSelectionChange([candidate.id]); onSchedule(); setOpenDropdownId(null); }}
                        >
                          <Calendar size={14} className="text-muted" /> Schedule Interview
                        </button>
                      )}

                      {['Scheduled','Selected for Next Round','Cancelled'].includes(candidate.stage) && (
                        <>
                          <button 
                            className="dropdown-item small py-2 d-flex align-items-center gap-2"
                            onClick={() => { onReschedule(candidate.id); setOpenDropdownId(null); }}
                          >
                            <RefreshCw size={14} className="text-muted" /> Reschedule
                          </button>
                          <button 
                            className="dropdown-item small py-2 d-flex align-items-center gap-2"
                            onClick={() => { onFeedback(candidate.id); setOpenDropdownId(null); }}
                          >
                            <MessageSquare size={14} className="text-muted" /> Add Feedback
                          </button>
                          <div className="dropdown-divider my-1"></div>
                          <button 
                            className="dropdown-item small py-2 text-danger d-flex align-items-center gap-2"
                            onClick={() => { onCancel(candidate.id); setOpenDropdownId(null); }}
                          >
                            <X size={14} /> Cancel Interview
                          </button>
                        </>
                      )}

                      <div className="dropdown-divider my-1"></div>
                      <button 
                        className="dropdown-item small py-2 d-flex align-items-center gap-2"
                        onClick={() => onViewProfile(candidate)}
                      >
                        <User size={14} /> View Profile
                      </button>
                      {/* <button 
                        className="dropdown-item small py-2"
                        onClick={() => setOpenDropdownId(null)}
                      >
                        Close Menu
                      </button> */}
                    </div>
                  )}

                  {openDropdownId === candidate.id && (
                    <div 
                      className="position-fixed top-0 start-0 w-100 h-100" 
                      style={{ zIndex: 1040 }} 
                      onClick={() => setOpenDropdownId(null)}
                    ></div>
                  )}
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={isActionTab ? 8 : 7} className="text-center py-5 text-muted">
                  No candidates found matching the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
