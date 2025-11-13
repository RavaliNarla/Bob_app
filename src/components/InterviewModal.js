import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form, Spinner, Alert, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import apiService from "../services/apiService";

const API_BASE = "https://bobbe.sentrifugo.com";
 const INTERVIEWERS_API = `${API_BASE}/api/getdetails/users/all`; // filter role='Interviewer'
//const INTERVIEWERS_API = `http://localhost:5000/api/getdetails/users/all`; // filter role='Interviewer'

const TZ = "Asia/Kolkata";
const SLOT_MINUTES = 30; // 1-hour slots

function fmtLabelIST(iso) {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: TZ,
    });
  } catch {
    return iso;
  }
}
function ymdInIST(dOrIso) {
  return new Date(dOrIso).toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
}
function generateSlotsFromFree(freeRanges, slotMinutes = SLOT_MINUTES) {
  const slots = [];
  const ms = slotMinutes * 60 * 1000;
  for (const r of freeRanges || []) {
    let s = new Date(r.start);
    s.setSeconds(0, 0);
    const end = new Date(r.end);
    while (s.getTime() + ms <= end.getTime()) {
      const e = new Date(s.getTime() + ms);
      slots.push({ startISO: s.toISOString(), endISO: e.toISOString() });
      s = new Date(s.getTime() + ms);
    }
  }
  return slots;
}

const interviewModes = [
  { id: 1, name: "Online"},
  { id: 2, name: "In-Person"},
  { id: 3, name: "Telephonic"},
]

const InterviewModal = ({
  show,
  handleClose,
  handleSave,
  candidate,
  isReschedule,
  handleCancelInterview,
}) => {
  const [interviewData, setInterviewData] = useState({
    interview_date: "",
    interview_time: "",
    interview_type: candidate?.interview_type || "",
    location: candidate?.location || "",
    phone:  candidate?.phone || "",
  });

  const [isPanelInterview, setIsPanelInterview] = useState(false);
  const [resetOnPanelToggle, setResetOnPanelToggle] = useState(false);

  // interviewers
  const [interviewers, setInterviewers] = useState([]); // [{id?, name, email}]
  const [panels, setPanels] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState("");

  const [interviewerEmail, setInterviewerEmail] = useState(candidate?.interviewer_email || candidate?.interviewerEmail || "");
  const [interviewerName, setInterviewerName] = useState(candidate?.interviewer || candidate?.interviewerName || "");
  const [interviewerId, setInterviewerId] = useState(String(candidate?.interviewer_id || candidate?.interviewerId || ""));
  const [loadingInterviewers, setLoadingInterviewers] = useState(false);
  const [interviewersError, setInterviewersError] = useState("");

  // panel selection
  const [panelId, setPanelId] = useState("");
  const [panelName, setPanelName] = useState("");

  // slots
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  // useEffect(() => {
  //   if (!show) {
  //     // Reset interview type, location, and phone when modal is closed
  //     setInterviewData((prev) => ({
  //       ...prev,
  //       interview_type: "",
  //       location: "",
  //       phone: "",
  //     }));
  //   }
  // }, [show]);

  useEffect(() => {
    if (show && interviewers.length && candidate?.interviewer_id) {
      const match = interviewers.find(
        iv => String(iv.interviewer_id) === String(candidate.interviewer_id)
      );

      if (match) {
        setInterviewerId(String(candidate.interviewer_id));
        setInterviewerName(match.full_name);
        setInterviewerEmail(match.email);
      }
    }
  }, [show, interviewers, candidate]);

  // fetch interviewers or panels based on toggle
useEffect(() => {
  if (!show) return;

  (async () => {
    setLoadingOptions(true);
    setOptionsError("");
    try {
      if (isPanelInterview) {
        const resp = await apiService.getInterviewPanels();
        setPanels(resp.data || []);
      } else {
        const resp = await apiService.getInterviewers();
        let interviewerList = (resp.data || []).map(iv => ({
          interviewer_id: String(iv.interviewer_id || iv.id || iv.user_id),
          full_name: iv.full_name || iv.name || 
                    (String(iv.interviewer_id) === String(candidate?.interviewer_id) 
                        ? candidate?.interviewer 
                        : ""),
          email: iv.email,
        }));

        // Always include candidate's interviewer
        if (candidate?.interviewer_id && candidate?.interviewer) {
          interviewerList = interviewerList.map(iv =>
            String(iv.interviewer_id) === String(candidate.interviewer_id)
              ? { ...iv, full_name: candidate.interviewer }
              : iv
          );
        }

        setInterviewers(interviewerList);
        // Preselect the interviewer AFTER the list is ready
        if (candidate?.interviewer_id) {
          setInterviewerId(String(candidate.interviewer_id));
          setInterviewerName(candidate.interviewer || "");
          setInterviewerEmail(candidate.interviewer_email || "");
          setInterviewData(prev => ({
            ...prev,
            interview_type: candidate.interview_type || "",
            location: candidate.location || "",
            phone: candidate.phone || "",
          }));
        }
      }
    } catch (err) {
      setOptionsError(err.message || "Failed to load options");
      setInterviewers([]);
      setPanels([]);
    } finally {
      setLoadingOptions(false);
    }
  })();
}, [show, isPanelInterview, candidate]);

  // Prefill date/time and fetch slots (on open OR interviewerEmail change)
  useEffect(() => {
    setSlots([]);
    setSlotsError("");
    setSelectedSlot(null);
    if (!show) return;

    let formattedDate = "";
    if (isReschedule && candidate) {
      if (candidate.interviewDate) formattedDate = ymdInIST(candidate.interviewDate);
      const time = candidate.interviewTime;
      setInterviewData(prev => ({
        ...prev,
        interview_date: formattedDate || ymdInIST(new Date()),
        interview_time: time ? String(time).slice(0, 5) : "",
      }));
    } else {
      const now = new Date();
      formattedDate = ymdInIST(now);
      setInterviewData(prev => ({ ...prev, interview_date: formattedDate, interview_time: "" }));
    }

    const runDate = formattedDate || interviewData.interview_date;
    if (runDate && interviewerEmail) {
      fetchSlotsForDate(runDate, interviewerEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isReschedule, candidate, interviewerEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "interview_type") {
      let updatedData = { ...interviewData, interview_type: value };

      // Clear irrelevant fields
      if (value === "Online") {
        updatedData.location = "";
        updatedData.phone = "";
      } else if (value === "In-Person") {
        updatedData.phone = "";
        // keep location editable
      } else if (value === "Telephonic") {
        updatedData.location = "";
        // keep phone editable
        if (candidate?.phone) updatedData.phone = candidate.phone;
      }

      setInterviewData(updatedData);
      return;
    }

    // handle other input fields normally
    setInterviewData((prev) => ({ ...prev, [name]: value }));

    // handle date changes to reset slots
    if (name === "interview_date") {
      setInterviewData((prev) => ({ ...prev, interview_time: "" }));
      setSelectedSlot(null);
      if (value) {
        if (isPanelInterview && panelId) {
          fetchPanelSlotsForDate(value, panelId);
        } else if (!isPanelInterview && interviewerEmail) {
          fetchSlotsForDate(value, interviewerEmail);
        } else {
          setSlots([]);
        }
      }
    }
  };

  // const onInterviewerChange = (e) => {
  //   setInterviewerEmail(e.target.value);
  //   setSelectedSlot(null);
  //   setInterviewData((prev) => ({ ...prev, interview_time: "" }));
  // };

  // interviewer change (single)
  const onInterviewerChange = (e) => {
    const id = e.target.value;
    const iv = interviewers.find((x) => String(x.interviewer_id) === String(id));

    setInterviewerId(id);
    setInterviewerName(iv?.full_name ?? "");
    setInterviewerEmail(iv?.email ?? "");
  };

  // panel change
  const onPanelChange = (e) => {
    const id = e.target.value;
    const p = panels.find((x) => String(x.panel_id) === id);
    setPanelId(p?.panel_id ?? "");
    setPanelName(p?.panel_name ?? "");

    // fetch slots immediately when panel changes + date already selected
    if (p?.panel_id && interviewData.interview_date) {
      fetchPanelSlotsForDate(interviewData.interview_date, p.panel_id);
    }
  };

  useEffect(() => {
    if (!show) return;

    setSlots([]);
    setSlotsError("");
    setSelectedSlot(null);

    let formattedDate = "";
    if (isReschedule && candidate) {
      if (candidate.interviewDate) formattedDate = ymdInIST(candidate.interviewDate);
      const time = candidate.interviewTime;

      // 👇 Only prefill interview_time if NOT resetting due to panel toggle
      setInterviewData(prev => ({
        ...prev,
        interview_date: formattedDate || ymdInIST(new Date()),
        interview_time: resetOnPanelToggle ? "" : (time ? String(time).slice(0, 5) : ""),
      }));
    } else {
      const now = new Date();
      formattedDate = ymdInIST(now);
      setInterviewData(prev => ({ ...prev, interview_date: formattedDate, interview_time: "" }));
    }

    const runDate = formattedDate || interviewData.interview_date;

    if (runDate) {
      if (isPanelInterview && panelId) {
        fetchPanelSlotsForDate(runDate, panelId);
      } else if (!isPanelInterview && interviewerEmail) {
        fetchSlotsForDate(runDate, interviewerEmail);
      }
    }

    // ✅ clear reset flag
    if (resetOnPanelToggle) setResetOnPanelToggle(false);
  }, [show, isReschedule, candidate, interviewerEmail, isPanelInterview, panelId, resetOnPanelToggle]);

  async function fetchSlotsForDate(ymd, email) {
    setLoadingSlots(true);
    setSlotsError("");
    setSlots([]);
    try {
      const data = await apiService.getFreeBusySlots(
        email,
        ymd,
        SLOT_MINUTES,
        TZ
      );

      // Prefer backend-provided discrete slots; fall back to free ranges if present
      const nextSlots =
        Array.isArray(data.slots) && data.slots.length
          ? data.slots.map((s) => ({ startISO: s.start, endISO: s.end }))
          : generateSlotsFromFree(data.free, SLOT_MINUTES);
      setSlots(nextSlots);
    } catch (err) {
      setSlotsError(err.message || "Failed to load available slots");
    } finally {
      setLoadingSlots(false);
    }
  }

  const onSave = () => {
    if (!selectedSlot && !(isReschedule && interviewData.interview_time)) return;
      // console.log(interviewData)
      let interviewobj={
      interview_date: interviewData.interview_date,
      interview_time: String(interviewData.interview_time).slice(0, 5), // "HH:mm"
      interviewer_email: interviewerEmail,
      interviewer: interviewerName,
      interviewer_id: isPanelInterview ? panelId : interviewerId,
      interview_type: interviewData.interview_type,
      location: interviewData.interview_type === "In-Person" ? interviewData.location : "",
      phone: interviewData.interview_type === "Telephonic" ? interviewData.phone : "",
      // type: interviewData.interview_type,
      is_panel_interview: isPanelInterview,
    }

    handleSave(interviewobj);
  };

  const onCancel = () => {
    
    const selectedInterviewer =
      interviewers.find((iv) => iv.email === interviewerEmail) || {
        name: "",
        email: interviewerEmail,
        id: undefined,
      };
      let interviewobj={
      interview_date: interviewData.interview_date,
      interview_type: interviewData.interview_type,
      interview_time: String(interviewData.interview_time).slice(0, 5), // "HH:mm"
      interviewer_email: selectedInterviewer.email,
      interviewer: selectedInterviewer.name,
      interviewer_id: selectedInterviewer.id,
    }

    handleCancelInterview(interviewobj);
  };

  const selectedSlotKey = useMemo(() => {
    if (!selectedSlot) return "";
    return `${selectedSlot.startISO || selectedSlot.start}`;
  }, [selectedSlot]);

  const selectSlot = (slot) => {
    setSelectedSlot(slot);
    const dateIST = ymdInIST(slot.startISO || slot.start);
    const timeIST = new Date(slot.startISO || slot.start).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: TZ,
      }
    );
    // ensure HH:mm
    const hhmm = String(timeIST).slice(0, 5);
    setInterviewData((prev) => ({
      ...prev,
      interview_date: dateIST,
      interview_time: hhmm,
    }));
    // console.log("interviewData222",  interviewData);
  };

  const minDateIST = ymdInIST(new Date());
  const formatTimeRange = (time) => {
    if (!time) return '';
  
    const [hours, minutes] = time.split(':');
    const startHour = parseInt(hours, 10);
    const endHour = (startHour + 1) % 24; // wrap around if 23 → 00
  
    const start = `${String(startHour).padStart(2, '0')}:${minutes}`;
    const end = `${String(endHour).padStart(2, '0')}:${minutes}`;
  
    return `${start} - ${end}`;
  };

  useEffect(() => {
    if (interviewers.length && candidate?.interviewer_id) {
      const match = interviewers.find(
        iv => String(iv.interviewer_id) === String(candidate.interviewer_id)
      );

      setInterviewerId(String(candidate.interviewer_id));
      setInterviewerName(match?.full_name || candidate.interviewer || "");
      setInterviewerEmail(match?.email || candidate.interviewer_email || "");
      setInterviewData(prev => ({
        ...prev,
        interview_type: candidate.interview_type || "",
        location: candidate.location || "",
        phone: candidate.phone || "",
      }));
    }
  }, [interviewers, candidate]);

  async function fetchPanelSlotsForDate(ymd, panelId) {
    setLoadingSlots(true);
    setSlotsError("");
    setSlots([]);
    try {
      const data = await apiService.getPanelSlots(panelId, ymd);

      let nextSlots =
        Array.isArray(data.data.data) && data.data.data.length
          ? data.data.data.map((s) => ({ startISO: s.start, endISO: s.end }))
          : generateSlotsFromFree(data.data.data.free, SLOT_MINUTES);

      // Filter expired slots (compare against current IST time)
      const nowIST = new Date(
        new Date().toLocaleString("en-US", { timeZone: TZ })
      ).getTime();

      nextSlots = nextSlots.filter((s) => {
        const slotStart = new Date(s.startISO || s.start).getTime();
        return slotStart >= nowIST; // keep only future slots
      });

      setSlots(nextSlots);
      // console.log("Panel slots data:", data);
      // console.log("Filtered Panel slots:", nextSlots);
    } catch (err) {
      setSlotsError(err.message || "Failed to load panel slots");
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    if (!candidate) return;

    setInterviewData((prev) => ({
      ...prev,
      interview_date: candidate.interviewDate || ymdInIST(new Date()),
      interview_time: candidate.interviewTime || "", // only sets if API has value
      interview_type: candidate.interview_type || "",
      location: candidate.location || "",
      phone: candidate.phone || "",
    }));

    setInterviewerEmail(candidate.interviewer_email || "");
    setInterviewerName(candidate.interviewer || "");
    setInterviewerId(String(candidate.interviewer_id || ""));

    setPanelId(candidate.is_panel_interview ? candidate.interviewer_id || "" : "");
    setPanelName(""); // optional
    setIsPanelInterview(Boolean(candidate.is_panel_interview));

    setSelectedSlot(null);
    setSlots([]);

    if (resetOnPanelToggle) setResetOnPanelToggle(false);
  }, [candidate]);

  return (
    <Modal show={show} onHide={handleClose} centered className="fontinter">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "16px", color: "#FF7043" }}>
          {isReschedule ? "Reschedule Interview" : "Schedule Interview"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3 form45">
            <Form.Label>Candidate</Form.Label>
            <Form.Control type="text" value={candidate?.full_name || ""} readOnly />
          </Form.Group>

          <Form.Group className="mb-3 form45">
            <Form.Label>Interview Mode</Form.Label>
            <Form.Select
              name="interview_type"
              value={interviewData.interview_type}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select Interview Mode
              </option>
              {interviewModes.map((iv) => (
                <option key={iv.id} value={iv.name}>
                  {iv.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {interviewData.interview_type === "In-Person" && (
            <Form.Group className="mb-3 form45">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={interviewData.location}
                onChange={handleChange}
                placeholder="Enter interview location"
              />
            </Form.Group>
          )}

          {interviewData.interview_type === "Telephonic" && (
            <Form.Group className="mb-3 form45">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={interviewData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </Form.Group>
          )}

          {/* Interviewer dropdown (fetched) */}
          <Form.Group className="mb-3 form45">
            <Form.Label>{isPanelInterview ? "Select Panel" : "Select Interviewer"}</Form.Label>
              {loadingOptions ? (
                <Spinner animation="border" size="sm" />
              ) : optionsError ? (
                <Alert variant="danger">{optionsError}</Alert>
              ) : isPanelInterview ? (
                <Form.Select value={panelId} onChange={onPanelChange}>
                  <option value="" disabled>Select Panel</option>
                  {panels.map((p) => (
                    <option key={p.panel_id} value={p.panel_id}>{p.panel_name}</option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Select value={interviewerId} onChange={onInterviewerChange}>
                  <option value="">Select Interviewer</option>
                  {interviewers.map((iv) => (
                    <option key={iv.interviewer_id} value={iv.interviewer_id}>
                      {iv.full_name}
                    </option>
                  ))}
                </Form.Select>
              )}
            <div className="mt-1">
              <Form.Check
                type="checkbox"
                label="Panel Interview"
                checked={isPanelInterview}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsPanelInterview(checked);

                  // Reset interviewer/panel and interview time
                  setInterviewerId("");
                  setInterviewerName("");
                  setInterviewerEmail("");
                  setPanelId("");
                  setPanelName("");
                  setSelectedSlot(null);
                  setSlots([]);

                  // Force clear interview_time
                  setInterviewData((prev) => ({
                    ...prev,
                    interview_time: "",
                  }));

                  setResetOnPanelToggle(true);
                }}
              />
            </div>
            {!isPanelInterview && (
              <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                Using <b>{interviewerEmail || "—"}</b> to check availability.
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3 form45">
            <Form.Label>Interview Date</Form.Label>
            <Form.Control
              type="date"
              name="interview_date"
              value={interviewData.interview_date}
              onChange={handleChange}
              min={minDateIST}
            />
          </Form.Group>

          {/* Panel Interview Toggle */}
          {/* <Form.Group className="mb-3 form45">
            <Form.Check
              type="checkbox"
              label="Panel Interview"
              checked={isPanelInterview}
              onChange={(e) => setIsPanelInterview(e.target.checked)}
            />
          </Form.Group> */}

          <Form.Group className="mb-3 form45">
            <Form.Label>Interview Time</Form.Label>
            <Form.Control
              type="time"
              name="interview_time"
              value={interviewData.interview_time}
              onChange={handleChange}
              disabled
            />
            {!!interviewData.interview_time && (
              <div className="mt-2">
                <Badge bg="secondary">Selected: {formatTimeRange(interviewData.interview_time)}</Badge>
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Available times (1 hour)</Form.Label>
            {loadingSlots && (
              <div className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" />
                <span>Loading slots…</span>
              </div>
            )}
            {slotsError && (
              <Alert variant="danger" className="py-2 my-2">
                {slotsError}
              </Alert>
            )}
            {!loadingSlots && !slotsError && interviewData.interview_date && (
              <>
                {slots.length === 0 ? (
                  <div className="text-muted">No available 1-hour slots (9:00–18:00 IST).</div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {slots.map((s) => {
                      const label = fmtLabelIST(s.startISO || s.start);
                      const key = `${s.startISO || s.start}-${s.endISO || s.end}`;
                      const isSelected =
                        selectedSlotKey && selectedSlotKey === (s.startISO || s.start);
                      return (
                        <Button
                          key={key}
                          variant={isSelected ? "primary" : "outline-primary"}
                          size="sm"
                          onClick={() => selectSlot(s)}
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </Form.Group>

          <div className="text-muted" style={{ fontSize: 12 }}>
            Checking availability in {TZ}. Slots are 1-hour within 9:00–18:00 IST.
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        {isReschedule && (
          <Button variant="danger" onClick={onCancel} className="btn_action">
            Cancel Interview
          </Button>
        )}
        <Button
        className="btn_action"
          variant="primary"
          onClick={onSave}
          disabled={
            (!isPanelInterview && !interviewerEmail) ||
            (isPanelInterview && !panelId) ||
            (!selectedSlot && !(isReschedule && interviewData.interview_time))
          }
          style={{ backgroundColor: "#FF7043", color: "#fff", borderColor: "#FF7043" }}
        >
          {isReschedule ? "Reschedule Interview" : "Schedule Interview"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InterviewModal;
