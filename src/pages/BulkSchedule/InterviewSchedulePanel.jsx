import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ArrowLeft, CheckCircle, Video } from 'lucide-react';

const INTERVIEW_PANELS = [
  "Amit Verma, Priya Singh, Rajesh K", 
  "Sarah Connors, Mike Ross, Simran K", 
  "Robert B, Emily Watson, David Tennant",
  "John Smith, Jane Doe, Bob Anderson"
];

export function InterviewSchedulePanel({ 
  selectedCandidates, 
  onSchedule, 
  onCancel,
  isReschedule = false 
}) {
  // Global settings state
  const [globalDate, setGlobalDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState(45); // minutes
  
  // Individual schedules state
  const [schedules, setSchedules] = useState({});

  // Initialize schedules
  useEffect(() => {
    const initialSchedules = {};
    selectedCandidates.forEach(c => {
      initialSchedules[c.id] = {
        candidateId: c.id,
        date: globalDate,
        time: '',
        duration: duration,
        panel: '',
        link: 'https://meet.google.com/abc-defg-hij'
      };
    });
    setSchedules(initialSchedules);
  }, [selectedCandidates.length]); // Run once on mount/candidates change

  const handleApplyAutoSchedule = () => {
    const newSchedules = { ...schedules };
    
    // Parse start time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    let currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0);

    selectedCandidates.forEach((candidate, index) => {
      // Format time HH:mm
      const timeStr = currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      
      // Round robin panel assignment
      const panel = INTERVIEW_PANELS[index % INTERVIEW_PANELS.length];

      newSchedules[candidate.id] = {
        ...newSchedules[candidate.id],
        date: globalDate,
        time: timeStr,
        duration: duration,
        panel: panel,
      };

      // Increment time (no gap)
      currentTime.setMinutes(currentTime.getMinutes() + duration);
    });

    setSchedules(newSchedules);
  };

  const updateSchedule = (id, field, value) => {
    setSchedules(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleConfirm = () => {
    // Validate
    const incomplete = Object.values(schedules).some(s => !s.date || !s.time || !s.panel);
    if (incomplete) {
      alert("Please ensure all candidates have a date, time, and panel assigned.");
      return;
    }
    
    // Show alert as requested
    alert(`${selectedCandidates.length} candidates interview scheduled`);
    
    onSchedule(schedules);
  };

  return (
    <div className="h-100 d-flex flex-column">
      {/* Header */}
      <div className="mb-4 d-flex align-items-center justify-content-between border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary rounded-circle p-2" onClick={onCancel}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h4 className="m-0 text-bob-blue fw-bold">
              {isReschedule ? 'Reschedule Interviews' : 'Schedule Interviews'}
            </h4>
            <div className="text-muted small">
              {isReschedule ? 'Rescheduling' : 'Scheduling'} for {selectedCandidates.length} candidates
            </div>
          </div>
        </div>
        
        {/* Action Buttons MOVED HERE (Above table right corner, header area) */}
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary shadow-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-bob-primary shadow-sm px-4 fw-semibold" onClick={handleConfirm}>
            <CheckCircle size={18} className="me-2" />
            Confirm Schedule
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="card border-bob-orange mb-4 shadow-sm bg-light">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-end">
            <div>
               <h6 className="card-title fw-bold text-bob-orange mb-3 d-flex align-items-center">
                 <Calendar size={18} className="me-2" /> Batch Scheduling Configuration
               </h6>
               <div className="d-flex gap-3 align-items-end">
                 <div>
                   <label className="form-label small fw-bold text-muted">Interview Date</label>
                   <input 
                     type="date" 
                     className="form-control shadow-sm" 
                     value={globalDate}
                     onChange={(e) => setGlobalDate(e.target.value)}
                   />
                 </div>
                 <div>
                   <label className="form-label small fw-bold text-muted">Start Time</label>
                   <input 
                     type="time" 
                     className="form-control shadow-sm" 
                     value={startTime}
                     onChange={(e) => setStartTime(e.target.value)}
                   />
                 </div>
                 <div>
                   <label className="form-label small fw-bold text-muted">Duration (min)</label>
                   <select 
                     className="form-select shadow-sm" 
                     value={duration} 
                     onChange={(e) => setDuration(Number(e.target.value))}
                   >
                     <option value="30">30 mins</option>
                     <option value="45">45 mins</option>
                     <option value="60">60 mins</option>
                   </select>
                 </div>
               </div>
            </div>

            {/* Apply Auto Schedule Button - Moved to Right Corner and Styled */}
            <div>
              <button 
                className="btn btn-bob-primary shadow px-4 py-2 fw-semibold border border-2 border-white"
                style={{ transition: 'all 0.2s' }}
                onClick={handleApplyAutoSchedule}
              >
                <Clock size={18} className="me-2" /> Apply Auto-Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm flex-grow-1 border-0">
        <div className="card-body p-0 overflow-auto">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light sticky-top">
              <tr>
                <th className="ps-4">Candidate</th>
                <th>Date</th>
                <th>Time</th>
                <th>Panel / Interviewer</th>
                <th>Meeting Link</th>
              </tr>
            </thead>
            <tbody>
              {selectedCandidates.map(candidate => {
                const schedule = schedules[candidate.id] || {};
                return (
                  <tr key={candidate.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-bob-blue">{candidate.name}</div>
                      <div className="small text-muted">{candidate.positionId}</div>
                    </td>
                    <td>
                      <input 
                        type="date" 
                        className="form-control form-control-sm" 
                        value={schedule.date || ''}
                        onChange={(e) => updateSchedule(candidate.id, 'date', e.target.value)}
                        style={{ width: '140px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="time" 
                        className="form-control form-control-sm" 
                        value={schedule.time || ''}
                        onChange={(e) => updateSchedule(candidate.id, 'time', e.target.value)}
                        style={{ width: '110px' }}
                      />
                    </td>
                    <td>
                      <select 
                        className="form-select form-select-sm"
                        value={schedule.panel || ''}
                        onChange={(e) => updateSchedule(candidate.id, 'panel', e.target.value)}
                        style={{ width: '250px' }}
                      >
                        <option value="">Select Panel...</option>
                        {INTERVIEW_PANELS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                       <div className="input-group input-group-sm" style={{ width: '200px' }}>
                         <span className="input-group-text bg-light"><Video size={14}/></span>
                         <input 
                           type="text" 
                           className="form-control" 
                           value={schedule.link || ''}
                           onChange={(e) => updateSchedule(candidate.id, 'link', e.target.value)}
                           placeholder="Link"
                         />
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
