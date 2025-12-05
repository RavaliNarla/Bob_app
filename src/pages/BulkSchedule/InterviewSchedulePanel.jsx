import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ArrowLeft, CheckCircle ,Loader2 } from 'lucide-react';
import apiService from '../../services/apiService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
export function InterviewSchedulePanel({ 
  selectedCandidates, 
  onSchedule, 
  onCancel,
  isReschedule = false,
  panels,
  selectedPosition,
  selectedRequisition,
  candidates
}) {
  // Global settings state
  const [globalDate, setGlobalDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState(45);
  
  // Individual schedules state
  const [schedules, setSchedules] = useState({});
  // ✅ Loading + Progress State
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, batch: 0 });
  // Initialize schedules when candidates change

  // 🧠 Fetch interview details during reschedule mode
useEffect(() => {
  if (!isReschedule || !selectedCandidates?.length) return;

  const fetchInterviewDetails = async () => {
    setIsLoading(true);
    setProgress({ completed: 0, total: selectedCandidates.length, batch: 0 });

    try {
      const CHUNK_SIZE = 200; // safe batch size
      const remaining = [...selectedCandidates];
      let fetchedSchedules = {};
      let batchCount = 1;

      while (remaining.length > 0) {
        const batch = remaining.splice(0, CHUNK_SIZE);
console.log("candidates",candidates)
        console.log(`Fetching reschedule batch ${batchCount} (${batch.length} candidates)`);

        const results = await Promise.allSettled(
  batch.map(async (candidate) => {
    if (!candidate?.application_id) return null;

    try {
      const res = await apiService.createInterview(candidate.application_id);
      const data = res?.data?.data || res?.data || res;

      console.log("🔍 Raw API Response:", res);
      console.log("✅ Extracted Interview Data:", data);

      if (!data || typeof data !== "object" || !data.scheduled_at) {
        console.warn(`⚠️ No valid interview for ${candidate.application_id}`);
        return null;
      }

      // Parse the datetime field
      const dt = new Date(data.scheduled_at);
      // console.log("🗓️ Parsed DateTime:", dt);
      const date = dt.toISOString().split("T")[0];
       const time = dt.toTimeString().slice(0, 5);
      // console.log("datee:", date, "time:", time);
      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        applicationId: candidate.application_id,
        date,
        startTime: data.interviewStartTime,
        endTime: data.interviewEndTime, // optional
        duration: duration,
        panelName: data.interviewer || "Not Assigned",
        panelId: data.interviewer_id || "",
        interview_type: data.interview_type || "Panel",
        is_panel_interview: data.is_panel_interview ?? true,
        status: data.status || "Scheduled",
        location: data.location || "",
        phone: data.phone || "",
        time: time,
      };
    } catch (error) {
      console.error(`❌ Error fetching interview for ${candidate.application_id}:`, error);
      return null;
    }
  })
);

        console.log(`Batch ${batchCount} fetch results:`, results);
        // Merge fetched results
        results.forEach((r) => {
          if (r.status === "fulfilled" && r.value) {
            fetchedSchedules[r.value.candidateId] = r.value;
          }
        });

        // Update progress
        setProgress((prev) => ({
          ...prev,
          completed: prev.completed + batch.length,
          batch: batchCount,
        }));

        batchCount++;
        await new Promise((r) => setTimeout(r, 200)); // small delay between batches
      }

      // ✅ Finalize
      setSchedules(fetchedSchedules);
      //toast.success(`✅ Loaded interview details for ${Object.keys(fetchedSchedules).length} candidates.`);
    } catch (error) {
      console.error("Error fetching interview details:", error);
      toast.error("Failed to load interview details for rescheduling.");
    } finally {
      setIsLoading(false);
      setProgress({ completed: 0, total: 0, batch: 0 });
    }
  };

  fetchInterviewDetails();
}, [isReschedule, selectedCandidates, candidates]);

  useEffect(() => {
      if (isReschedule) return;
    const initialSchedules = {};
    selectedCandidates.forEach(c => {
      initialSchedules[c.id] = {
        candidateId: c.id,
        date: globalDate,
        time: '',
        duration: duration,
        panelName: ''
      };
    });
    setSchedules(initialSchedules);
  }, [selectedCandidates.length]);

  // ✅ Auto-Schedule function with API integration
   const handleApplyAutoSchedule = async () => {
    try {
      const candidateIds = selectedCandidates.map(c => c.id);
      if (candidateIds.length === 0) {
        alert("Please select at least one candidate.");
        return;
      }

      const CHUNK_SIZE = 200;
      let allSchedules = {};
      let currentDate = globalDate;
      let remaining = [...candidateIds];
      let batchCount = 1;

      // ✅ Initialize progress
      setIsLoading(true);
      setProgress({ completed: 0, total: candidateIds.length, batch: 0 });

      while (remaining.length > 0) {
        const batch = remaining.splice(0, CHUNK_SIZE);
        console.log(`Scheduling batch ${batchCount}, size: ${batch.length}`);
        setProgress(prev => ({
          ...prev,
          batch: batchCount,
          completed: candidateIds.length - remaining.length
        }));

        const payload = {
          panelId: (Array.isArray(panels) && panels.length > 0) ? panels : [17, 18],
          candidateIds: batch,
          date: currentDate,
          startTime,
          durationMinutes: duration,
          jobRequisitionId: selectedRequisition,
          jobPositionId: selectedPosition,
        };

        const response = await apiService.applyAutoSchedule(payload);
        if (!response.success) {
          alert(`Batch ${batchCount} failed. Please retry.`);
          break;
        }

        const scheduleData = response?.data?.schedules || [];
        const overflow = response?.data?.overflow || false;
        scheduleData.forEach(item => {
          allSchedules[item.candidateId] = {
            candidateId: item.candidateId,
            candidateName: item.candidateName,
            date: item.interviewDate,
            startTime: item.interviewStartTime,
            endTime: item.interviewEndTime,
            duration: item.durationMinutes,
            panelName: item.panelName,
            applicationId: item.jobApplicationId,
            panelId: item.panelId,
          };
        });

        // ✅ Overflow Handling
        if (overflow) {
         // alert(`The schedule for ${currentDate} is full. Moving to the next day automatically.`);

          Swal.fire({
          icon: 'info',
          title: 'Schedule Notice',
          text: `The schedule for ${currentDate} is full. Moving to the next day automatically.`,
          confirmButtonText: 'OK'
        });
          // const nextDay = new Date(currentDate);
          // nextDay.setDate(nextDay.getDate() + 1);
          // currentDate = nextDay.toISOString().split('T')[0];
        }

        batchCount++;
        await new Promise(r => setTimeout(r, 150)); // small delay to avoid backend overload
      }

      setSchedules(allSchedules);
      toast.success('Panels have been successfully mapped to the candidates. Please confirm the schedules.');
      //toast.success(`Successfully scheduled ${Object.keys(allSchedules).length} candidates!`);
    } catch (err) {
      console.error("Scheduling error:", err);
      toast.error("An error occurred while scheduling interviews.");
    } finally {
      setIsLoading(false);
      setProgress({ completed: 0, total: 0, batch: 0 });
    }
  };



  // ✅ Loading Overlay (shown when scheduling)
  const LoadingOverlay = () => (
    <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex flex-column align-items-center justify-content-center text-white" style={{ zIndex: 1050 }}>
      <Loader2 size={50} className="mb-3 spin" />
      <h5>Scheduling in progress...</h5>
      <p className="mb-0 small">
        Processed {progress.completed} / {progress.total} candidates (Batch {progress.batch})
      </p>
    </div>
  );
  // ✅ Manual field update handler (for date/time only)
  const updateSchedule = (id, field, value) => {
    setSchedules(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  // ✅ Confirm handler
  const handleConfirm = () => {
    if (Object.values(schedules).some(s => !s.date || !s.startTime || !s.panelName)) {
      toast.error("Please ensure all candidates have a date, start time, and panel assigned.");
      return;
    }
      try {
        // show local overlay while parent schedules (onSchedule is async)
        setIsLoading(true);
        onSchedule(schedules);
      }
      // parent is expected to navigate back to main view; overlay will hide in finally+    } catch (err) {
      catch (err) {
        console.error("Error during confirm schedule:", err);
        toast.error("An error occurred while confirming the schedule.");
      } finally {
        setIsLoading(false);
      }
  };
console.log("schedules",schedules)
  return (
    <div className="h-100 d-flex flex-column">
       {isLoading && <LoadingOverlay />}
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

        {/* Action Buttons */}
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-bob-primary  px-4 fw-semibold" onClick={handleConfirm}>
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
                     min={new Date().toISOString().split('T')[0]} // Set minimum date to today
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
                    <option value="360">360 mins</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Apply Auto Schedule Button */}
            <div>
              <button 
                className="btn btn-bob-primary shadow px-4 py-2 fw-semibold border border-2 border-white"
                onClick={handleApplyAutoSchedule}
              >
                <Clock size={18} className="me-2" />   {isLoading ? 'Scheduling...' : 'Apply Auto-Schedule'}
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
                <th className="ps-4">Candidate Details</th>
                <th>Date</th>
                <th>Start - End Time</th>
                <th>Panel Name</th>
              </tr>
            </thead>
            <tbody>
              {selectedCandidates.map(candidate => {
                const schedule = schedules[candidate.id] || {};
                return (
                  <tr key={candidate.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-bob-blue">{candidate.name}</div>
                      <div className="small text-muted">{candidate.email}</div>
                      <div className="small text-muted">{candidate.phone}</div>
                    </td>
                    <td>{schedule.date || '-'}</td>
                    <td>
                      {schedule.startTime && schedule.endTime 
                        ? `${schedule.startTime} - ${schedule.endTime}`
                        : '-'}
                    </td>
                    <td>
                      {schedule.panelName 
                        ? <span className="fw-semibold text-success">{schedule.panelName}</span>
                        : <span className="text-muted">Not Assigned</span>}
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
