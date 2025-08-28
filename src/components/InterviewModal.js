import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form, Spinner, Alert, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../services/apiService";
import apiService from "../services/apiService";

const API_BASE = "https://bobbe.sentrifugo.com";
// const INTERVIEWERS_API = `${API_BASE}/api/getdetails/users/all`; // filter role='Interviewer'
const INTERVIEWERS_API = `http://localhost:5000/api/getdetails/users/all`; // filter role='Interviewer'

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
  });

  // interviewer list + selection
  const [interviewers, setInterviewers] = useState([]); // [{id?, name, email}]
  const [interviewerEmail, setInterviewerEmail] = useState("");
  const [loadingInterviewers, setLoadingInterviewers] = useState(false);
  const [interviewersError, setInterviewersError] = useState("");

  // slots
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Fetch interviewers when modal opens
  useEffect(() => {
    if (!show) return;
    (async () => {
      setLoadingInterviewers(true);
      setInterviewersError("");
      try {
        const token =
          localStorage.getItem("access_token") || localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const resp = await fetch(INTERVIEWERS_API, { headers });
        if (!resp.ok) {
          const errJson = await resp.json().catch(() => ({}));
          throw new Error(errJson.error || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        const list = Array.isArray(data) ? data : data?.data || [];
        const onlyInterviewers = list
          .filter(
            (u) => (u.role || u.user_role || "").toLowerCase() === "interviewer"
          )
          .map((u) => ({
            id: u.userid || u.id,
            name:
              u.name ||
              u.full_name ||
              (u.email ? u.email.split("@")[0] : "Interviewer"),
            email: u.email,
          }));
        setInterviewers(onlyInterviewers);

        // pick from candidate if rescheduling; otherwise first interviewer
        const candidatePick =
          isReschedule && candidate?.interviewer_email
            ? candidate.interviewer_email
            : null;
        const firstEmail = onlyInterviewers[0]?.email || "";
        setInterviewerEmail(candidatePick || firstEmail);
      } catch (err) {
        setInterviewersError(err.message || "Failed to load interviewers");
        setInterviewers([]);
        setInterviewerEmail("");
      } finally {
        setLoadingInterviewers(false);
      }
    })();
  }, [show, isReschedule, candidate]);

  // Prefill date/time and fetch slots (on open OR interviewerEmail change)
  useEffect(() => {
    setSlots([]);
    setSlotsError("");
    setSelectedSlot(null);
    if (!show) return;

    let formattedDate = "";
    if (isReschedule && candidate) {
      if (candidate.interview_date) formattedDate = ymdInIST(candidate.interview_date);
      const time = candidate.interview_time;
      setInterviewData({
        interview_date: formattedDate || ymdInIST(new Date()),
        interview_time: time ? String(time).slice(0, 5) : "",
      });
    } else {
      const now = new Date();
      formattedDate = ymdInIST(now);
      setInterviewData({ interview_date: formattedDate, interview_time: "" });
    }

    const runDate = formattedDate || interviewData.interview_date;
    if (runDate && interviewerEmail) {
      fetchSlotsForDate(runDate, interviewerEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isReschedule, candidate, interviewerEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInterviewData((prev) => ({ ...prev, [name]: value }));
    if (name === "interview_date") {
      setInterviewData((prev) => ({ ...prev, interview_time: "" }));
      setSelectedSlot(null);
      if (value && interviewerEmail) {
        fetchSlotsForDate(value, interviewerEmail);
      } else {
        setSlots([]);
      }
    }
  };

  const onInterviewerChange = (e) => {
    setInterviewerEmail(e.target.value);
    setSelectedSlot(null);
    setInterviewData((prev) => ({ ...prev, interview_time: "" }));
  };

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
    const selectedInterviewer =
      interviewers.find((iv) => iv.email === interviewerEmail) || {
        name: "",
        email: interviewerEmail,
        id: undefined,
      };

    handleSave({
      interview_date: interviewData.interview_date,
      interview_time: String(interviewData.interview_time).slice(0, 5), // "HH:mm"
      interviewerEmail: selectedInterviewer.email,
      interviewerName: selectedInterviewer.name,
      interviewerId: selectedInterviewer.id,
    });
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
    setInterviewData({ interview_date: dateIST, interview_time: hhmm });
  };

  const minDateIST = ymdInIST(new Date());

  return (
    <Modal show={show} onHide={handleClose} centered className="fontinter">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "18px", color: "#FF7043" }}>
          {isReschedule ? "Reschedule Interview" : "Schedule Interview"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Candidate</Form.Label>
            <Form.Control type="text" value={candidate?.full_name || ""} readOnly />
          </Form.Group>

          {/* Interviewer dropdown (fetched) */}
          <Form.Group className="mb-3">
            <Form.Label>Interviewer</Form.Label>
            {loadingInterviewers ? (
              <div className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" />
                <span>Loading interviewers…</span>
              </div>
            ) : interviewersError ? (
              <Alert variant="danger" className="py-2 my-2">
                {interviewersError}
              </Alert>
            ) : (
              <Form.Select value={interviewerEmail} onChange={onInterviewerChange}>
                {interviewers.map((iv) => (
                  <option key={iv.id || iv.email} value={iv.email}>
                    {iv.name}
                  </option>
                ))}
              </Form.Select>
            )}
            <div className="text-muted mt-1" style={{ fontSize: 12 }}>
              Using <b>{interviewerEmail || "—"}</b> to check availability.
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Interview Date</Form.Label>
            <Form.Control
              type="date"
              name="interview_date"
              value={interviewData.interview_date}
              onChange={handleChange}
              min={minDateIST}
            />
          </Form.Group>

          <Form.Group className="mb-3">
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
                <Badge bg="secondary">Selected: {interviewData.interview_time}</Badge>
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
          <Button variant="danger" onClick={handleCancelInterview}>
            Cancel Interview
          </Button>
        )}
        <Button
          variant="primary"
          onClick={onSave}
          disabled={
            !interviewerEmail ||
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
