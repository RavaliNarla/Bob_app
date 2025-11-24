import { useState } from 'react';
import { MoreVertical, Calendar, MessageSquare, Trash2, Check, X, RefreshCw, AlertTriangle } from 'lucide-react';

export function CandidatePoolTable({ 
  candidates, 
  selectedCandidates, 
  onSelectionChange, 
  onSchedule,
  onReschedule,
  onCancel,
  onFeedback,
  onBulkReschedule,
  onBulkCancel
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null);

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
      case 'Applied': return 'bg-secondary';
      case 'Shortlisted': return 'bg-info text-dark';
      case 'Interview Scheduled': return 'bg-warning text-dark';
      case 'Selected for Next Round': return 'bg-primary';
      case 'Offered': return 'bg-success';
      case 'Rejected': return 'bg-danger';
      default: return 'bg-light text-dark';
    }
  };

  // Helper to determine available bulk actions based on selection state
  const getBulkActions = () => {
    if (selectedCandidates.length === 0) return null;

    const selectedObjs = candidates.filter(c => selectedCandidates.includes(c.id));
    const allScheduled = selectedObjs.every(c => c.stage === 'Interview Scheduled');
    const allShortlisted = selectedObjs.every(c => c.stage === 'Shortlisted' || c.stage === 'Applied');

    return { allScheduled, allShortlisted };
  };

  const bulkState = getBulkActions();

  return (
    <div className="d-flex flex-column h-100">
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3 bg-light p-2 rounded border">
         <div className="d-flex align-items-center gap-3">
           {selectedCandidates.length > 0 ? (
             <span className="text-bob-blue fw-bold ms-2">{selectedCandidates.length} selected</span>
           ) : (
             <span className="text-muted ms-2 small">Select candidates to perform actions</span>
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
                  className="btn btn-sm btn-outline-danger bg-white" 
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

      {/* Table */}
      <div className="table-responsive flex-grow-1" style={{ minHeight: '400px' }}>
        <table className="table table-hover table-bordered align-middle" style={{ fontSize: '0.9rem' }}>
          <thead className="table-light text-muted sticky-top">
            <tr>
              <th style={{ width: '40px' }} className="text-center">
                <input 
                  type="checkbox" 
                  className="form-check-input"
                  checked={candidates.length > 0 && selectedCandidates.length === candidates.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Candidate Name</th>
              <th>Skills</th>
              <th>Exp</th>
              <th>Rating</th>
              <th>Stage</th>
              <th>Location</th>
              <th style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => (
              <tr key={candidate.id} className={selectedCandidates.includes(candidate.id) ? 'table-active' : ''}>
                <td className="text-center">
                  <input 
                    type="checkbox" 
                    className="form-check-input"
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={(e) => handleSelectOne(candidate.id, e.target.checked)}
                  />
                </td>
                <td className="fw-semibold text-bob-blue">
                  {candidate.name}
                  <div className="small text-muted fw-normal">{candidate.source}</div>
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="badge bg-light text-secondary border fw-normal">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="badge bg-light text-muted border fw-normal">+{candidate.skills.length - 3}</span>
                    )}
                  </div>
                </td>
                <td>{candidate.experience}</td>
                <td>
                  <span className={`badge ${candidate.rating >= 4.5 ? 'bg-success' : candidate.rating >= 4.0 ? 'bg-info' : 'bg-warning'}`}>
                    {candidate.rating}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getStageBadgeClass(candidate.stage)}`}>
                    {candidate.stage}
                  </span>
                </td>
                <td className="small text-truncate" style={{ maxWidth: '150px' }}>
                  {candidate.location}
                </td>
                <td className="text-center position-relative">
                   {/* Simple Custom Dropdown Trigger */}
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

                   {/* Custom Dropdown Menu */}
                   {openDropdownId === candidate.id && (
                     <div 
                       className="position-absolute end-0 mt-1 bg-white border rounded shadow-sm py-1 text-start" 
                       style={{ zIndex: 1050, width: '180px', top: '100%' }}
                     >
                       {/* Context Aware Actions */}
                       {['Applied', 'Shortlisted'].includes(candidate.stage) && (
                         <button 
                           className="dropdown-item small py-2 d-flex align-items-center gap-2"
                           onClick={() => { onSelectionChange([candidate.id]); onSchedule(); setOpenDropdownId(null); }}
                         >
                           <Calendar size={14} className="text-muted" /> Schedule Interview
                         </button>
                       )}

                       {candidate.stage === 'Interview Scheduled' && (
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
                       
                       {['Selected for Next Round', 'Selected'].includes(candidate.stage) && (
                         <button 
                           className="dropdown-item small py-2 d-flex align-items-center gap-2"
                           onClick={() => { /* Offer Logic */ setOpenDropdownId(null); }}
                         >
                           <Check size={14} className="text-muted" /> Release Offer
                         </button>
                       )}
                       
                       {/* Fallback / Always available */}
                       <div className="dropdown-divider my-1"></div>
                       <button className="dropdown-item small py-2" onClick={() => setOpenDropdownId(null)}>
                         Close Menu
                       </button>
                     </div>
                   )}
                   
                   {/* Backdrop to close dropdown on click outside */}
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
                <td colSpan={8} className="text-center py-5 text-muted">
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
