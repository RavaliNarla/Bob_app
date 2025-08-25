import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Row, Col, Card, Button,
  InputGroup, Form, Image, Badge, Placeholder
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import profileIcon from '../assets/profile_icon.png'

/** ================= CONFIG ================= */
const API_BASE_URL = "https://bobjava.sentrifugo.com:8443/candidate"; // ← match your curl host
const ENDPOINT = "/api/candidates/interviews/by-date-range";

/** ============ Local date helpers (NO UTC drift) ============ */
const localISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfWeek = (d) => {
  const date = new Date(d);
  const day = date.getDay();               // 0..6
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

/** ====== Epoch range in LOCAL time (SECONDS, not millis) ====== */
const startOfDayLocal = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDayLocal   = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };
const toEpochSeconds  = (dateObj) => Math.floor(dateObj.getTime() / 1000);

/** ============ Display helpers ============ */
const fmtMonth = (d) => d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
const to12h = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hr = ((h + 11) % 12) + 1;
  return `${String(hr).padStart(2,"0")}:${String(m).padStart(2,"0")} ${suffix}`;
};

/** ============ Map API rows -> UI rows ============ */
/* API row:
  {
    "interviewTime": "2025-08-22T10:00",
    "interviewTitle": "React JS lead",
    "candidateName": "Lok Singh",
    "candidateSkill": "Safety Officer"
  }
*/
function mapApiToEvents(rows) {
  return (rows || []).map((row, idx) => {
    const iso = String(row.interviewTime || "").slice(0, 16); // "YYYY-MM-DDTHH:mm"
    const dt = new Date(iso); // treated as LOCAL time
    if (isNaN(dt)) return null;

    const dateKey = localISO(dt);
    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(dt.getMinutes()).padStart(2, "0");

    return {
      id: idx + 1,
      date: dateKey,
      time: `${hh}:${mm}`,
      title: row.interviewTitle || "Interview",
      person: `${row.candidateName ?? ""} — ${row.candidateSkill ?? ""}`.replace(/\s—\s$/, ""),
      avatar: {profileIcon},
      color: "primary",
      applicationStatus: row?.applicationStatus
    };
  }).filter(Boolean);
}

/** ============ Axios GET (range) — sends epoch SECONDS ============ */
/** ============ Axios GET (range) — epoch SECONDS, 200/204 safe ============ */
async function httpGetRange(startDateObj, endDateObj) {
  const toEpochMillis = (d) => d.getTime();

  // full local-day window
  const startMillis = toEpochMillis(startOfDayLocal(startDateObj));
  const endMillis   = toEpochMillis(endOfDayLocal(endDateObj));

  // auto-fix reversed inputs
  const from = Math.min(startMillis, endMillis);
  const to   = Math.max(startMillis, endMillis);

  const url = `${API_BASE_URL}${ENDPOINT}`;

  try {
    const res = await axios.get(url, {
      params: { startTimestamp: from, endTimestamp: to },
      headers: { Accept: "application/json" },
      validateStatus: (s) => s === 200 || s === 204,
    });

    if (res.status === 204) return [];
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || "Request failed";
    throw new Error(msg);
  }
}


/** ===================== Component ===================== */
export default function Calendar() {
  // Mon–Sun strip around selected day
  const [anchor, setAnchor] = useState(startOfWeek(new Date()));
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(anchor, i)), [anchor]);

  const [selectedDate, setSelectedDate] = useState(localISO(new Date()));
  const [search, setSearch] = useState("");

  const [events, setEvents] = useState([]);  // holds day or week data
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const headerTitle = fmtMonth(anchor);

  /** -------- Load today's day on mount -------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true); setApiError("");
        const today = new Date();
        const data = await httpGetRange(today, today);
        const mapped = mapApiToEvents(data);
        if (!cancelled) setEvents(mapped);
      } catch (e) {
        if (!cancelled) setApiError(e?.message || "Failed to load today's interviews");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /** -------- Day click: fetch that day's range -------- */
  const onSelectDay = async (dateKey) => {
    try {
      setSelectedDate(dateKey);
      setAnchor(startOfWeek(new Date(dateKey))); // keep strip aligned
      setLoading(true); setApiError("");
      const d = new Date(dateKey);
      const data = await httpGetRange(d, d);
      setEvents(mapApiToEvents(data));
    } catch (e) {
      setApiError(e?.message || "Failed to load day");
    } finally {
      setLoading(false);
    }
  };

  /** -------- Week: selectedDate .. selectedDate+6 -------- */
  const onWeek = async () => {
    try {
      setLoading(true); setApiError("");
      const start = new Date(selectedDate);
      const end   = addDays(start, 6);
      const data = await httpGetRange(start, end);
      setEvents(mapApiToEvents(data));
    } catch (e) {
      setApiError(e?.message || "Failed to load week");
    } finally {
      setLoading(false);
    }
  };

  /** -------- Prev/Next week navigation (and fetch that day) -------- */
  const goPrev = async () => {
    const newAnchor = addDays(anchor, -7);
    const newSelected = localISO(newAnchor);
    setAnchor(newAnchor);
    await onSelectDay(newSelected);
  };
  const goNext = async () => {
    const newAnchor = addDays(anchor, 7);
    const newSelected = localISO(newAnchor);
    setAnchor(newAnchor);
    await onSelectDay(newSelected);
  };
  const goToday = async () => {
    const now = new Date();
    setAnchor(startOfWeek(now));
    await onSelectDay(localISO(now));
  };

  /** -------- Filter current list to the selected day -------- */
  const dayEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events
      .filter((e) => e.date === selectedDate)
      .filter((e) => !q || (e.title).toLowerCase().includes(q) || (e.person).toLowerCase().includes(q))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDate, search]);

  return (
    <Container fluid className="py-3 px-5 fonreg">
      {/* Controls */}
      <Row className="align-items-center g-2 mb-3">
        <Col md="auto"><h5 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '18px !important', color: '#FF7043', marginBottom: '0px' }}>{headerTitle}</h5></Col>
        <Col md="auto">
          <Button size="sm" variant="" onClick={goToday} className="week_filter me-2" style={{ marginLeft: '0.5rem', borderRadius: '5px', borderColor: '#ff6a00', color: '#ff6a00', padding: '0.45rem' }}>Today</Button>
          <div className="btn-group">
            <Button size="sm" variant="outline-secondary" className="week_filter" onClick={goPrev} style={{ borderRadius: '5px', borderColor: '#ff6a00', color: '#ff6a00', fontWeight: 500, fontSize: '1.5rem', padding: '0px 12px' }}>‹</Button>
            <Button size="sm" variant="outline-secondary" className="week_filter" onClick={goNext} style={{ marginLeft: '2px', borderRadius: '5px', borderColor: '#ff6a00', color: '#ff6a00', fontWeight: 500, fontSize: '1.5rem', padding: '0px 12px' }}>›</Button>
          </div>
        </Col>
        <Col md="auto" className="ms-auto" style={{ width: '40%' }}>
          <InputGroup className="w-100 fonreg">
            <InputGroup.Text style={{ backgroundColor: '#FF7043' }}>
              <FontAwesomeIcon icon={faSearch} style={{ color: '#fff' }} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by title or name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* <Button variant="outline-secondary" onClick={onWeek} className="week_filter" style={{ marginLeft: '0.5rem', borderRadius: '5px', borderColor: '#ff6a00', color: '#ff6a00' }}>
              Week ▾
            </Button> */}
          </InputGroup>
        </Col>
      </Row>

      {/* Error banner (non-blocking) */}
      {apiError && (
        <Row className="mb-2">
          <Col>
            <div className="alert alert-warning py-2 mb-0">{apiError}</div>
          </Col>
        </Row>
      )}

      <div className="border-0">
        {/* Week strip */}
        <div className="bg-white p-2 shadow-sm" style={{ borderRadius: '8px' }}>
          <Row xs={7} className="g-2 text-center">
            {days.map((d) => {
              const key = localISO(d);
              const isActive = key === selectedDate;
              const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
              return (
                <Col key={key}>
                  <Button
                    variant={isActive ? "" : "light"}
                    className={`w-100 fw-semibold ${isActive ? "text-white warning_class" : ""}`}
                    onClick={() => onSelectDay(key)}
                    style={{ borderRadius: 999 }}
                  >
                    <div className="small mb-1">{weekday}</div>
                    <div className="fs-6">{d.getDate()}</div>
                  </Button>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* Event list */}
        <div className="my-3">
          {loading && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <Row key={i} className="align-items-stretch g-3 mb-2">
                  <Col xs="auto" className="text-end pt-2" style={{ width: 90 }}>
                    <Placeholder as="div" animation="glow">
                      <Placeholder xs={8} />
                    </Placeholder>
                  </Col>
                  <Col>
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="d-flex align-items-center">
                        <Placeholder as="div" animation="glow" className="me-3">
                          <Placeholder style={{ width: 42, height: 42, borderRadius: 9999 }} />
                        </Placeholder>
                        <div className="flex-grow-1">
                          <Placeholder as="div" animation="glow"><Placeholder xs={6} /></Placeholder>
                          <Placeholder as="div" animation="glow"><Placeholder xs={4} /></Placeholder>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              ))}
            </>
          )}

          {!loading && dayEvents.length === 0 && (
            <Card className="border-0">
              <Card.Body className="text-muted text-center">No interviews scheduled for this day.</Card.Body>
            </Card>
          )}

          {!loading && dayEvents.map((ev) => (
            <Row key={ev.id} className="align-items-center gap-2 mb-2">
              <Col xs="auto" className="text-end pt-2" style={{ width: 90 }}>
                <div className="text-muted fw-semibold fs-14">{to12h(ev.time)}</div>
              </Col>
              <Col style={{ paddingLeft: '0px' }}>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="d-flex align-items-center">
                    <Image roundedCircle width={42} height={42} src={profileIcon} alt={ev.person} className="me-3 object-fit-cover" />
                    <div className="flex-grow-1">
                      <div className="fw-bold text-muted">{ev.title}</div>
                      <div className="text-muted small">{ev.person}</div>
                    </div>
                    <Badge bg={ev.applicationStatus.toLowerCase() === 'cancelled' ? 'danger' : 'primary'} className="ms-2">{ev?.applicationStatus}</Badge>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ))}
        </div>
      </div>
    </Container>
  );
}

/** ============== badge helpers ============== */
function mapBadge(c) {
  if (c === "primary") return "primary";
  if (c === "success") return "success";
  if (c === "warning") return "warning";
  if (c === "danger") return "danger";
  return "secondary";
}
