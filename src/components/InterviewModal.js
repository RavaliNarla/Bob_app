import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form, Spinner, Alert, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE = "http://localhost:5000";
const INTERVIEWER_EMAIL = "harsha.tatapudi@sagarsoft.in"; // <-- fixed for now
const TZ = "Asia/Kolkata";
const SLOT_MINUTES = 60; // 1-hour slots

function ceilToInterval(date, minutes) {
  const d = new Date(date);
  const ms = minutes * 60 * 1000;
  const t = d.getTime();
  const rounded = Math.ceil(t / ms) * ms;
  return new Date(rounded);
}
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}
function fmtLabelIST(iso) {
  // Render time label in IST without adding libraries
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
function toISO(date) {
  // safe ISO without milliseconds
  return new Date(date).toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * Convert continuous free ranges from API into discrete slots (1-hour).
 * Each slot fully fits within a free window.
 */
function generateSlotsFromFree(freeRanges, slotMinutes = SLOT_MINUTES) {
  const slots = [];
  for (const r of freeRanges || []) {
    const start = new Date(r.start);
    const end = new Date(r.end);

    // Align to next interval boundary (00, 60, 120…)
    let cur = ceilToInterval(start, slotMinutes);
    while (addMinutes(cur, slotMinutes) <= end) {
      slots.push({
        startISO: toISO(cur),
        endISO: toISO(addMinutes(cur, slotMinutes)),
      });
      cur = addMinutes(cur, slotMinutes);
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

  // New state for available slots
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  // prefill on reschedule
  useEffect(() => {
    if (show && isReschedule && candidate) {
      let formattedDate = "";
      let formattedTime = "";
      if (candidate.interview_date) {
        formattedDate = new Date(candidate.interview_date).toISOString().split("T")[0];
      }
      if (candidate.interview_time) {
        const [hour, minute] = candidate.interview_time.split(":");
        formattedTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      }
      setInterviewData({ interview_date: formattedDate, interview_time: formattedTime });
    } else {
      setInterviewData({ interview_date: "", interview_time: "" });
    }
    // reset slots when modal opens/closes
    setSlots([]);
    setSlotsError("");
    setLoadingSlots(false);
  }, [show, isReschedule, candidate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInterviewData((prev) => ({ ...prev, [name]: value }));

    // If date changes, clear chosen time and (re)fetch slots
    if (name === "interview_date") {
      setInterviewData((prev) => ({ ...prev, interview_time: "" }));
      if (value) {
        fetchSlotsForDate(value);
      } else {
        setSlots([]);
      }
    }
  };

  // Build day window (IST) → send as ISO to API
  function buildDayWindowISO(dateStr) {
    // Interpret dateStr as local IST day [00:00:00, 23:59:59]
    // Create Date in IST by composing and then adjust to ISO
    // Simpler practical approach: create at 00:00 and 23:59:59, then toISOString
    const start = new Date(`${dateStr}T00:00:00`);
    const end = new Date(`${dateStr}T23:59:59`);
    return { startISO: toISO(start), endISO: toISO(end) };
  }

  async function fetchSlotsForDate(dateStr) {
    setLoadingSlots(true);
    setSlotsError("");
    setSlots([]);

    try {
      const { startISO, endISO } = buildDayWindowISO(dateStr);
      const token = localStorage.getItem("access_token"); // Auth0 access token
      const url = new URL(`${API_BASE}/api/calendar/free-busy`);
      url.searchParams.set("email", INTERVIEWER_EMAIL);
      url.searchParams.set("start", startISO);
      url.searchParams.set("end", endISO);
      url.searchParams.set("interval", String(SLOT_MINUTES)); // backend iv; we still slice client-side
      url.searchParams.set("tz", TZ);

      const resp = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      // data.free = [{start,end}]; turn into discrete 1-hour slots
      const nextSlots = generateSlotsFromFree(data.free, SLOT_MINUTES);

      setSlots(nextSlots);
    } catch (err) {
      setSlotsError(err.message || "Failed to load available slots");
    } finally {
      setLoadingSlots(false);
    }
  }

  const onSave = () => {
    handleSave(interviewData);
  };

  // For highlighting selected slot
  const selectedSlotKey = useMemo(() => {
    if (!interviewData.interview_date || !interviewData.interview_time) return "";
    // Compare on HH:MM within IST
    return `${interviewData.interview_date}T${interviewData.interview_time}`;
  }, [interviewData.interview_date, interviewData.interview_time]);

  const selectSlot = (slot) => {
    // Set date if not set (defensive)
    if (!interviewData.interview_date) {
      const d = new Date(slot.startISO);
      const dateIST = new Date(
        d.toLocaleString("en-US", { timeZone: TZ })
      );
      const y = dateIST.getFullYear();
      const m = String(dateIST.getMonth() + 1).padStart(2, "0");
      const da = String(dateIST.getDate()).padStart(2, "0");
      setInterviewData((prev) => ({ ...prev, interview_date: `${y}-${m}-${da}` }));
    }

    // Extract HH:MM (IST) for interview_time
    const label = new Date(slot.startISO).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: TZ,
    }); // e.g., "10:00"
    setInterviewData((prev) => ({ ...prev, interview_time: label }));
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isReschedule ? "Reschedule Interview" : "Schedule Interview"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Candidate</Form.Label>
            <Form.Control type="text" value={candidate?.full_name || ""} readOnly />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Interview Date</Form.Label>
            <Form.Control
              type="date"
              name="interview_date"
              value={interviewData.interview_date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Interview Time</Form.Label>
            <Form.Control
              type="time"
              name="interview_time"
              value={interviewData.interview_time}
              onChange={handleChange}
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
            {slotsError && <Alert variant="danger" className="py-2 my-2">{slotsError}</Alert>}
            {!loadingSlots && !slotsError && interviewData.interview_date && (
              <>
                {slots.length === 0 ? (
                  <div className="text-muted">No available 1‑hour slots for this date.</div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {slots.map((s, idx) => {
                      const label = fmtLabelIST(s.startISO);
                      const key = `${s.startISO}-${s.endISO}`;
                      const isSelected =
                        interviewData.interview_time &&
                        label.startsWith(
                          new Date(`1970-01-01T${interviewData.interview_time}:00`).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: TZ,
                          })
                        );

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
            Checking {INTERVIEWER_EMAIL} in {TZ}. Slots are 1‑hour and must be fully free.
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        {isReschedule && (
          <Button variant="danger" onClick={handleCancelInterview}>
            Cancel Interview
          </Button>
        )}
        <Button variant="primary" onClick={onSave}>
          {isReschedule ? "Reschedule Interview" : "Schedule Interview"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InterviewModal;
