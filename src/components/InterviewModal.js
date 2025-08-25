import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form, Spinner, Alert, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE = "https://bobbe.sentrifugo.com";
const INTERVIEWER_EMAIL = "harsha.tatapudi@sagarsoft.in"; // fixed for now
const TZ = "Asia/Kolkata";
const SLOT_MINUTES = 60; // 1-hour slots

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

/** Build YYYY-MM-DD string in IST for a Date/ISO */
function ymdInIST(dOrIso) {
  return new Date(dOrIso).toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
}

// Fallback if backend doesn't return slots (kept for safety)
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

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Prefill and fetch slots
  useEffect(() => {
    setSlots([]);
    setSlotsError("");
    setSelectedSlot(null);

    let formattedDate = "";
    let formattedTime = "";

    if (show && isReschedule && candidate) {
      if (candidate.interview_date) {
        formattedDate = ymdInIST(candidate.interview_date);
      }
      if (candidate.interview_time) {
        const [hour, minute] = String(candidate.interview_time).split(":");
        formattedTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      }
      setInterviewData({ interview_date: formattedDate, interview_time: formattedTime });
    } else {
      const now = new Date();
      formattedDate = ymdInIST(now); // TODAY in IST
      const hour = now.getHours();
      const minute = now.getMinutes();
      formattedTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      setInterviewData({ interview_date: formattedDate, interview_time: "" });
    }

    if (formattedDate) {
      fetchSlotsForDate(formattedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isReschedule, candidate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInterviewData((prev) => ({ ...prev, [name]: value }));

    if (name === "interview_date") {
      setInterviewData((prev) => ({ ...prev, interview_time: "" }));
      setSelectedSlot(null);
      if (value) {
        fetchSlotsForDate(value);
      } else {
        setSlots([]);
      }
    }
  };

  async function fetchSlotsForDate(ymd) {
    setLoadingSlots(true);
    setSlotsError("");
    setSlots([]);

    try {
      const token = localStorage.getItem("access_token");
      const url = new URL(`${API_BASE}/api/calendar/free-busy`);
      url.searchParams.set("email", INTERVIEWER_EMAIL);
      url.searchParams.set("date", ymd); // <-- backend expects "date" now
      url.searchParams.set("interval", String(SLOT_MINUTES));
      url.searchParams.set("tz", TZ);

      const resp = await fetch(url.toString(), {
        headers: {
          // Keep this if your route is protected; harmless if not.
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${resp.status}`);
      }

      const data = await resp.json();

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
    if (!selectedSlot) return;
    handleSave({
      ...interviewData,
      startISO: selectedSlot.startISO || selectedSlot.start,
      endISO: selectedSlot.endISO || selectedSlot.end,
      tz: TZ,
      interviewerEmail: INTERVIEWER_EMAIL,
    });
  };

  const selectedSlotKey = useMemo(() => {
    if (!selectedSlot) return "";
    return `${selectedSlot.startISO || selectedSlot.start}`;
  }, [selectedSlot]);

  const selectSlot = (slot) => {
    setSelectedSlot(slot);
    const dateIST = ymdInIST(slot.startISO || slot.start); // YYYY-MM-DD in IST
    const timeIST = new Date(slot.startISO || slot.start).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: TZ,
    });
    setInterviewData({ interview_date: dateIST, interview_time: timeIST });
  };

  // Use IST "today" to avoid UTC shifting the min
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

          <Form.Group className="mb-3">
            <Form.Label>Interview Date</Form.Label>
            <Form.Control
              type="date"
              name="interview_date"
              value={interviewData.interview_date}
              onChange={handleChange}
              min={minDateIST} // <-- IST-safe min
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
                  <div className="text-muted">No available 1‑hour slots (9:00–18:00 IST).</div>
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
            Checking {INTERVIEWER_EMAIL} in {TZ}. Slots are 1‑hour within 9:00–18:00 IST.
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
          disabled={!selectedSlot}
          style={{ backgroundColor: "#FF7043", color: "#fff", borderColor: "#FF7043" }}
        >
          {isReschedule ? "Reschedule Interview" : "Schedule Interview"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InterviewModal;
