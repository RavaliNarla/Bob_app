// src/pages/BulkUploadBatch.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../css/bulkUpload.css";
import "../css/JobPosting.css";
import apiService from "../services/apiService";
import BulkTiles from "./BulkTiles";
import { useLocation } from "react-router-dom";
import {
  createBatch,
  setActiveBatch,
  uploadBatch,
  clearBatch,
  fetchAllResumes,
  processAllResumes,
  deleteResume,
} from "../store/resumestore";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Form,
  Pagination,
  InputGroup,
  OverlayTrigger,
  Tooltip,
  Spinner, // <-- used
} from "react-bootstrap";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate,faSearch } from "@fortawesome/free-solid-svg-icons";

const styles = {
  cardTitle: {
    fontFamily: "Noto Sans",
    fontWeight: 600,
    fontSize: 16,
    color: "#FF7043",
    margin: 0,
  },
  statPill: { padding: "6px 10px", borderRadius: 10, fontSize: 12 },
  stickyHeader: { position: "sticky", top: 0, zIndex: 1 },
  truncate: (max = 320) => ({
    maxWidth: max,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
};

/* inline icons (no extra packages) */
const IconDoc = ({ color = "currentColor" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke={color} strokeWidth="1.8"/>
    <path d="M14 2v6h6" stroke={color} strokeWidth="1.8"/>
  </svg>
);
const IconUpload = ({ color = "currentColor" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 3v12" stroke={color} strokeWidth="1.8"/>
    <path d="m7 8 5-5 5 5" stroke={color} strokeWidth="1.8"/>
    <path d="M5 21h14" stroke={color} strokeWidth="1.8"/>
  </svg>
);
const IconDb = ({ color = "currentColor" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="5" rx="7" ry="3" stroke={color} strokeWidth="1.8"/>
    <path d="M5 5v7c0 1.66 3.13 3 7 3s7-1.34 7-3V5" stroke={color} strokeWidth="1.8"/>
    <path d="M5 12v7c0 1.66 3.13 3 7 3s7-1.34 7-3v-7" stroke={color} strokeWidth="1.8"/>
  </svg>
);

const IconFilePlus = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="12" x2="12" y2="18" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

export default function BulkUploadBatch() {
  const dispatch = useDispatch();
  const location = useLocation();
  const {
    batches,
    activeBatchId,
    allResumes,
    allLastLoadedAt,
    processing,
    processMessage,
    processError,
  } = useSelector((s) => s.resume);

  const batch = activeBatchId ? batches[activeBatchId] : null;
  const fileInputRef = useRef(null);
  const lastToastBatchId = useRef(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // NEW: track auto refresh spinner state + lock
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  // --- Sync cooldown (60s) ---
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownLeft(left);
      if (left <= 0) {
        setCooldownUntil(0);
        clearInterval(id);
      }
    }, 250);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const isCoolingDown = cooldownLeft > 0;

  /* fetch on enter + on navigation change */
  useEffect(() => { dispatch(fetchAllResumes()); }, [dispatch, location.key]);

  /* reset pagination on filter/search change */
  useEffect(() => { setPage(1); }, [perPage, q, statusFilter, allResumes]);

  /* one-time toast when new batch appears */
  useEffect(() => {
    if (!batch) return;
    if (batch.id !== lastToastBatchId.current) {
      lastToastBatchId.current = batch.id;
      toast.success(`Added ${batch.items?.length || 0} files`);
    }
  }, [batch?.id]);

  /* refresh when window regains focus */
  useEffect(() => {
    const onFocus = () => dispatch(fetchAllResumes());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [dispatch]);

  /* NEW: auto-refresh tick */
  useEffect(() => {
    const tick = async () => {
      if (isRefreshingRef.current) return; // prevent overlap
      isRefreshingRef.current = true;
      setAutoRefreshing(true);
      try {
        await dispatch(fetchAllResumes()).unwrap();
      } catch {
        // ignore errors; next tick will try again
      } finally {
        isRefreshingRef.current = false;
        setAutoRefreshing(false);
      }
    };
    const id = setInterval(tick, 360_000); // 1 minute (note: 360_000ms)
    return () => clearInterval(id);
  }, [dispatch]);

  const isHttpUrl = (u) => typeof u === "string" && /^https?:\/\//i.test(u);

  const saveBlob = (blob, filename = "file") => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const summary = useMemo(() => {
    if (!batch) return null;
    const total = batch.items.length;
    const uploaded = batch.items.filter((i) => i.status === "uploaded").length;
    const failed = batch.items.filter((i) => i.status === "failed").length;
    const uploading = batch.items.filter((i) => i.status === "uploading").length;
    const queued = batch.items.filter((i) => i.status === "queued").length;
    const pct = total ? Math.round((uploaded / total) * 100) : 0;
    return { total, uploaded, failed, uploading, queued, pct };
  }, [batch]);

  const onPickClick = () => fileInputRef.current?.click();
  const onPick = (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    const action = createBatch({
      name: `Batch • ${new Date().toLocaleString()}`,
      files,
    });

    try {
      dispatch(action);
      dispatch(setActiveBatch(action.payload.batchId));
    } catch (err) {
      console.error("Failed to create/activate batch", err);
      toast.error("Failed to add files to batch");
    }
    e.target.value = ""; // allow reselection of same files
  };

  const getFailureReason = (row) =>
    row?.reason ||
    row?.error ||
    row?.error_message ||
    row?.failure_reason ||
    row?.failureMessage ||
    "";

  const onDeleteRow = async (resumeId) => {
    try {
      await dispatch(deleteResume(resumeId)).unwrap();
      toast.success("Deleted");
    } catch (e) {
      toast.error(typeof e === "string" ? e : e?.message || "Delete failed / API not ready");
    }
  };

  const onSyncAll = async () => {
    // start 60s cooldown for the CTA only
    if (!isCoolingDown) setCooldownUntil(Date.now() + 60_000);

    try {
      const res = await dispatch(processAllResumes()).unwrap();
      toast.info(res?.message || "Process started");
    } catch {
      toast.error("Failed to start process");
    }
    try {
      await dispatch(fetchAllResumes()).unwrap();
      toast.success("Synced latest table data");
    } catch {
      toast.error("Sync failed");
    }
  };

  const onUpload = async () => {
    if (!batch) return toast.error("No active batch");
    const res = await dispatch(uploadBatch({ batchId: batch.id }));
    const ok = res?.payload?.uploadedCount || 0;
    if (ok > 0) {
      toast.success(`Uploaded ${ok} file(s). List refreshed.`);
      dispatch(fetchAllResumes());
    } else {
      toast.info("No files uploaded (all failed or none queued).");
    }
  };

  const onDownload = async (row) => {
    try {
      const name = row?.original_filename || "resume";
      const url = row?.file_url;
      if (isHttpUrl(url)) return void window.open(url, "_blank", "noopener");
      if (typeof apiService.downloadResumeJC === "function" && row?.resume_id) {
        const blob = await apiService.downloadResumeJC(row.resume_id);
        if (blob instanceof Blob) return saveBlob(blob, name);
      }
      toast.error("Download link not available yet.");
    } catch (err) {
      console.error("download error:", err);
      toast.error("Failed to download file.");
    }
  };

  const onStartOver = () => {
    try {
      if (batch) dispatch(clearBatch(batch.id));
      setQ("");
      setStatusFilter("ALL");
      setPage(1);
      setCooldownUntil(0);
      setCooldownLeft(0);
      toast.info("Reset. Load new files to start again.");
    } catch {}
  };

  const onSync = () => {
    dispatch(fetchAllResumes());
    toast.success("Synced latest table data");
  };

  const badgeFor = (status = "") => {
    const s = status.toUpperCase();
    if (s === "UPLOADED") return "success";
    if (s === "FAILED") return "danger";
    if (s === "PENDING") return "warning";
    return "secondary";
  };

  /* ---------- stepper state ---------- */
  const filesSelected = !!batch && (batch.items?.length || 0) > 0;
  const uploadDone   = (summary?.uploaded || 0) > 0;
  const syncActive   = !!processing;
  const syncDone = filesSelected && !!processMessage && !processing;

  const step1 = filesSelected ? "completed" : "active";
  const step2 = uploadDone ? "completed" : filesSelected ? "active" : "waiting";
  const step3 = syncDone ? "completed" : syncActive ? "active" : "waiting";

  /* CTA logic */
  let ctaLabel = "Browse Files to Upload";
  let ctaDisabled = !filesSelected;
  let ctaHandler = onPickClick;
  if (filesSelected && !uploadDone) {
    ctaLabel = "Start Upload";
    ctaDisabled = false;
    ctaHandler = onUpload;
  } else if (uploadDone) {
    ctaLabel = syncActive
      ? "Processing…"
      : isCoolingDown
      ? `Sync (${cooldownLeft}s)`
      : "Sync";
    ctaDisabled = syncActive || isCoolingDown;
    ctaHandler = onSyncAll;
  }

  /* ---------- table derivations ---------- */
  const normalizedQuery = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    let list = allResumes || [];
    if (statusFilter !== "ALL")
      list = list.filter((r) => (r.status || "").toUpperCase() === statusFilter);
    if (normalizedQuery) {
      list = list.filter((r) => {
        const name = (r.original_filename || "").toLowerCase();
        const id = (r.resume_id || "").toLowerCase();
        return name.includes(normalizedQuery) || id.includes(normalizedQuery);
      });
    }
    return list;
  }, [allResumes, normalizedQuery, statusFilter]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const current = filtered.slice(start, start + perPage);

  const movePage = (p) => { if (p >= 1 && p <= pages) setPage(p); };

  const renderPagination = () => {
    if (pages <= 1) return null;
    const items = [];
    const add = (p, label = p, disabled = false, active = false) =>
      items.push(
        <Pagination.Item key={`p_${p}_${label}`} active={active} disabled={disabled} onClick={() => movePage(p)}>
          {label}
        </Pagination.Item>
      );
    items.push(<Pagination.Prev key="prev" disabled={page === 1} onClick={() => movePage(page - 1)} />);
    const windowSize = 2;
    const startPage = Math.max(1, page - windowSize);
    const endPage = Math.min(pages, page + windowSize);
    add(1, 1, false, page === 1);
    if (startPage > 2) items.push(<Pagination.Ellipsis key="el1" disabled />);
    for (let p = startPage; p <= endPage; p++) {
      if (p !== 1 && p !== pages) add(p, p, false, page === p);
    }
    if (endPage < pages - 1) items.push(<Pagination.Ellipsis key="el2" disabled />);
    if (pages > 1) add(pages, pages, false, page === pages);
    items.push(<Pagination.Next key="next" disabled={page === pages} onClick={() => movePage(page + 1)} />);
    return <Pagination className="mb-0">{items}</Pagination>;
  };

  /* keyboard support for dropzone */
  const onDropzoneKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPickClick();
    }
  };

  // === Animated rail fill between dots (Load -> Upload -> Sync) ===
  let railPct = 0;
  if (filesSelected) {
    if (step2 === "active" || step2 === "completed" || uploadDone) railPct = 50;
    if (step3 === "active" || step3 === "completed" || syncDone)  railPct = 100;
  }

  return (
    <Container fluid className="py-4 px-3 bulk-container" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <BulkTiles />

      {/* Header */}
      <Row className="mb-3">
        <Col className="d-flex align-items-center justify-content-between">
          {/* <h5 style={styles.cardTitle}>Bulk Upload</h5> */}
          <div className="d-flex align-items-center gap-3 small text-muted">
            {processing && <span className="text-warning">Processing…</span>}
            {processError && <span className="text-danger">Process failed</span>}
            {processMessage && !processing && <span className="text-success">{processMessage}</span>}
            {allLastLoadedAt ? `Last loaded: ${new Date(allLastLoadedAt).toLocaleString()}` : ""}

            {/* NEW: tiny loader during auto-refresh */}
            {autoRefreshing && (
              <span className="d-inline-flex align-items-center gap-1 text-primary" title="Refreshing…">
                <Spinner animation="border" size="sm" />
                Refreshing…
              </span>
            )}
          </div>
        </Col>
      </Row>

      <Row className="g-0">
        <Col xs={12} className="px-0 d-flex flex-column" style={{ minHeight: 0 }}>
          {/* === Upload Panel (optimized) === */}
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body className="p-0">
              {/* Stepper */}
              <div className="bulkstepper">
                <div className="bulkstepper-rail" />
                <div className="bulkstepper-railfill">
                  <span style={{ width: `${railPct}%` }} />
                </div>
                <div className="d-flex justify-content-between text-center position-relative">
                  {/* Step 1 */}
                  <div className="bulkstepper-step">
                    <div className={`bulkstepper-dot ${step1}`} aria-current={step1 === "active" ? "step" : undefined}>
                      <div className="dot-icon">
                        <IconDoc color={step1 === "waiting" ? "black" : "#fff"} />
                      </div>
                      <span className="dot-check" role="img" aria-label="completed">✓</span>
                    </div>

                    <div className="fw-semibold mt-2 stephead">Load Resumes</div>
                    {/* <div className={`bulkstepper-badge ${step1}`}>{step1 === "completed" ? "Done" : "Active"}</div> */}
                    <div className="text-muted small mt-2">Loading resumes from the Localstorage</div>
                  </div>

                  {/* Step 2 */}
                  <div className="bulkstepper-step">
                    <div className={`bulkstepper-dot ${step2}`}>
                      <div className="dot-icon">
                        <IconUpload color={step2 === "waiting" ? "black" : "#fff"} />
                      </div>
                      <span className="dot-check" role="img" aria-label="completed">✓</span>
                    </div>

                    <div className="fw-semibold mt-2 stephead">Upload</div>
                    {/* <div className={`bulkstepper-badge ${step2}`}>{step2 === "completed" ? "Done" : "Waiting"}</div> */}
                    <div className="text-muted small mt-2">Uploading Loaded resumes to the Cloud</div>
                  </div>

                  {/* Step 3 */}
                  <div className="bulkstepper-step">
                    <div className={`bulkstepper-dot ${step3}`}>
                      <div className="dot-icon">
                        <IconDb color={step3 === "waiting" ? "black" : "#fff"} />
                      </div>
                      <span className="dot-check" role="img" aria-label="completed">✓</span>
                    </div>

                    <div className="fw-semibold mt-2 stephead">Sync Data</div>
                    {/* <div className={`bulkstepper-badge ${step3}`}>
                      {step3 === "completed" ? "Done" : step3 === "active" ? "Active" : "Waiting"}
                    </div> */}
                    <div className="text-muted small mt-2">Starting the Batch Process and Syncing the Table</div>
                  </div>
                </div>
              </div>

              <hr className="m-0" />

              {/* Dropzone + CTA */}
              <div className="p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  accept=".pdf,.doc,.docx,.rtf,.odt,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={onPick}
                />

                <div
                  className="bulkstepper-dropzone"
                  role="button"
                  tabIndex={0}
                  aria-label="Select resume files"
                  onClick={onPickClick}
                  onKeyDown={onDropzoneKey}
                >
                  <IconFilePlus />
                  <div className="mt-2 fileupload">Click to select resume files</div>
                  <div className="text-muted small">PDF, DOC, DOCX files supported</div>
                </div>

                <div className="mt-3 d-flex justify-content-center">
                  <Button className="bulkstepper-cta actionbtn" disabled={ctaDisabled} onClick={ctaHandler}>
                    {ctaLabel}
                  </Button>
                </div>
                {step3 === "completed" && !processing && (
                  <div className="mt-2 d-flex justify-content-center">
                    <Button variant="outline-secondary" size="sm" onClick={onStartOver}>
                      Start Over
                    </Button>
                  </div>
                )}

                {/* Batch summary (unchanged) */}
                {/* {batch && (
                  ...
                  <ProgressBar now={summary?.pct || 0} label={`${summary?.pct || 0}%`} />
                )} */}
              </div>
            </Card.Body>
          </Card>

          {/* ===== TABLE (unchanged) ===== */}
          <Card className="border-0 shadow-sm flex-grow-1 d-flex w-100">
            <Card.Header className="allresumes py-2">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <div className="fw-semibold table_heading">All Resumes</div>
                <div className="text-muted small">({allResumes?.length ?? 0} total)</div>

                <div className="ms-auto d-flex align-items-center gap-2">
                  <div>
                    <button
                      className={`sync-btn ${autoRefreshing ? "sync-btn--loading" : ""}`}
                      onClick={onSync}
                      disabled={autoRefreshing}
                      aria-busy={autoRefreshing}
                      aria-label={autoRefreshing ? "Refreshing" : "Sync"}
                    >
                      <FontAwesomeIcon
                        icon={faArrowsRotate}
                        spin={autoRefreshing}
                        className="sync-btn__icon"
                      />
                      <span className="sync-btn__text">
                        {autoRefreshing ? "Refreshing…" : "Sync"}
                      </span>
                    </button>
                  </div>

                  <Form.Select
                    size="sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: 140 }}
                    aria-label="Filter by status"
                  >
                    <option value="ALL">All statuses</option>
                    <option value="UPLOADED">Uploaded</option>
                    <option value="FAILED">Failed</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                  </Form.Select>

                  <InputGroup className="posting-search" size="sm" style={{ width: 290 }}>
                    <InputGroup.Text style={{ backgroundColor: "#FF7043" }} id="search-fn">
                      <FontAwesomeIcon icon={faSearch} style={{ color: "#fff" }} />
                    </InputGroup.Text>
                    <Form.Control
                      aria-label="Search by filename"
                      aria-describedby="search-fn"
                      placeholder="Search Candidate"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </InputGroup>

                  <Form.Select
                    size="sm"
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    style={{ width: 110 }}
                    aria-label="Rows per page"
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </Form.Select>

                  {renderPagination()}
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-0 d-flex flex-column row" style={{ margin: "20px" }}>
              <div className="accordion-body" style={{ flex: 1, overflow: "auto" }}>
                <Table hover responsive className="req_table mt-2" style={{ tableLayout: "fixed" }}>
                  <thead className="table-header-orange">
                    <tr style={{ textAlign: "" }}>
                      <th style={{ width: 40 }}>#</th>
                      <th style={{ width: 250 }}>Original Filename</th>
                      <th style={{ width: 80 }}>Status</th>
                      {/* <th style={{ width: 320 }}>File Path</th> */}
                      {/* <th style={{ width: 260 }}>Resume ID</th> */}
                      {/* <th style={{ width: 200 }}>Created By</th> */}
                      <th style={{ width: 140 }}>Created Date</th>
                      {/* <th style={{ width: 160 }}>Updated By</th> */}
                      {/* <th style={{ width: 160 }}>Updated Date</th> */}
                      {/* ADD: show reason only for FAILED */}
                      <th style={{ width: 260 }}>Reason For Failed</th>
                      {/* ADD: action column (delete icon) */}
                      <th style={{ width: 80 }}>Action</th>
                    </tr>
                  </thead>

                  <tbody className="table-body-orange">
                    {current.length ? (
                      current.map((r, i) => {
                        const status = (r.status || "").toUpperCase();
                        const created = r.created_date ? new Date(r.created_date).toLocaleString() : "-";
                        const reason = getFailureReason(r);
                        const isFailed = status === "FAILED";

                        return (
                          <tr key={(r.resume_id || r.original_filename || i) + "_row"}>
                            <td>{start + i + 1}</td>
                            <td style={styles.truncate(360)} title={r.original_filename || "-"}>
                              <Button variant="link" className="p-0 text-decoration-none linkname" onClick={() => onDownload(r)}>
                                {r.original_filename || "-"}
                              </Button>
                            </td>

                            <td>
                              <Badge bg={badgeFor(status)}>{status || "-"}</Badge>
                            </td>
                            {/* <td style={styles.truncate(360)} title={r.file_url || "-"}>{r.file_url || "-"}</td> */}
                            {/* <td style={styles.truncate(300)} title={r.resume_id || "-"}>{r.resume_id || "-"}</td> */}
                            {/* <td style={styles.truncate(220)} title={r.created_by || "-"}>{r.created_by || "-"}</td> */}
                            <td>{created}</td>
                            {/* <td style={styles.truncate(220)} title={r.updated_by || "-"}>{r.updated_by || "-"}</td> */}
                            {/* <td>{r.updated_date ? new Date(r.updated_date).toLocaleString() : "-"}</td> */}

                            {/* ADD: Reason (only for FAILED) */}
                            <td className={isFailed ? "text-danger" : ""} style={styles.truncate(360)} title={isFailed ? reason || "Unknown error" : ""}>
                              {isFailed ? reason || "Unknown error" : ""}
                            </td>

                            {/* ADD: Action (trash icon only for FAILED) */}
                            <td>
                              {isFailed ? (
                                <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                                  <Button
                                    variant="light"
                                    size="sm"
                                    className="p-0 d-inline-flex align-items-center justify-content-center border-0"
                                    style={{ width: 28, height: 28, borderRadius: "50%" }}
                                    onClick={() => onDeleteRow(r.resume_id)}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
                                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                      <path d="M10 11v7M14 11v7" />
                                    </svg>
                                  </Button>
                                </OverlayTrigger>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        {/* update colspan to include the 2 new columns */}
                        <td colSpan={6} className="text-center text-muted py-4">
                          {allResumes.length ? "No rows match your filters." : "No resumes found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-end align-items-center p-2">
                {/* {renderPagination()} */}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
