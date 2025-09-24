// src/pages/BulkUploadBatch.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../css/bulkUpload.css";
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
  ProgressBar,
  Alert,
  Form,
  Pagination,
  InputGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { toast } from "react-toastify";

const styles = {
  cardTitle: {
    fontFamily: "Poppins",
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
    lastProcessStartedAt,
    processError,
  } = useSelector((s) => s.resume);

  const batch = activeBatchId ? batches[activeBatchId] : null;
  const fileInputRef = useRef(null);
  const lastToastBatchId = useRef(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Load ALL once
  useEffect(() => {
    dispatch(fetchAllResumes());
  }, [dispatch,location.key]);

  useEffect(() => {
    setPage(1);
  }, [perPage, q, statusFilter, allResumes]);

  // Show "Added X files" once the new batch is actually in Redux
  useEffect(() => {
    if (!batch) return;
    if (batch.id !== lastToastBatchId.current) {
      lastToastBatchId.current = batch.id;
      toast.success(`Added ${batch.items?.length || 0} files`);
    }
  }, [batch?.id]); // fire once per new batch

  useEffect(() => {
  const onFocus = () => dispatch(fetchAllResumes());
  window.addEventListener("focus", onFocus);
  return () => window.removeEventListener("focus", onFocus);
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

  // show the toast immediately and decouple from heavy work
  setTimeout(() => {

}, 0);

  // now do your state updates
  const action = createBatch({
    name: `Batch • ${new Date().toLocaleString()}`,
    files,
  });

  try {
    dispatch(action); // creates the batch in redux
    dispatch(setActiveBatch(action.payload.batchId)); // activate it
  } catch (err) {
    // if something throws here, at least you still saw the toast above
    console.error("Failed to create/activate batch", err);
    toast.error("Failed to add files to batch");
  }

  // allow selecting the same files again later
  e.target.value = "";
};

const getFailureReason = (row) => {
  // server may use any of these keys; try them in order
  return (
    row?.reason ||
    row?.error ||
    row?.error_message ||
    row?.failure_reason ||
    row?.failureMessage ||
    ""
  );
};

const onDeleteRow = async (resumeId) => {
  try {
    await dispatch(deleteResume(resumeId)).unwrap();
    toast.success("Deleted");
  } catch (e) {
    const msg = typeof e === "string" ? e : (e?.message || "Delete failed / API not ready");
    toast.error(msg);
  }
};



// put near your other handlers (e.g., under onUpload / onProcess / onSync)
const onSyncAll = async () => {
  // 1) PROCESS
  try {
    const res = await dispatch(processAllResumes()).unwrap();
    toast.info(res?.message || "Process started");   // toast #1
  } catch (e) {
    toast.error(typeof e === "string" ? e : "Failed to start process"); // still continue to fetch
  }

  // 2) FETCH LATEST TABLE
  try {
    await dispatch(fetchAllResumes()).unwrap();
    toast.success("Synced latest table data");       // toast #2
  } catch (e) {
    toast.error("Sync failed");
  }
};


  const onUpload = async () => {
    if (!batch) return toast.error("No active batch");
    const res = await dispatch(uploadBatch({ batchId: batch.id }));
    const ok = res?.payload?.uploadedCount || 0;
    if (ok > 0) {
      toast.success(`Uploaded ${ok} file(s). List refreshed.`);
      // fetchAllResumes already triggered in thunk if ok>0, but this is harmless
      dispatch(fetchAllResumes());
    } else {
      toast.info("No files uploaded (all failed or none queued).");
    }
  };


  const onDownload = async (row) => {
  try {
    const name = row?.original_filename || "resume";
    const url = row?.file_url;

    // if/when your API starts returning real http(s) URLs, this will just work:
    if (isHttpUrl(url)) {
      window.open(url, "_blank", "noopener");
      return;
    }

    // fallback: use backend download endpoint by resume_id (stub above)
    if (typeof apiService.downloadResumeJC === "function" && row?.resume_id) {
      const blob = await apiService.downloadResumeJC(row.resume_id); // axios instance returns Blob here
      if (blob instanceof Blob) {
        saveBlob(blob, name);
        return;
      }
    }

    // otherwise, we don't have a usable URL yet
    toast.error("Download link not available yet.");
  } catch (err) {
    console.error("download error:", err);
    toast.error("Failed to download file.");
  }
};




  const onProcess = async () => {
    try {
      const res = await dispatch(processAllResumes()).unwrap();
      toast.info(res?.message || "Process started");
    } catch (e) {
      toast.error(typeof e === "string" ? e : "Failed to start process");
    }
  };

  const onSync = () => {
    dispatch(fetchAllResumes());
    toast.success("Synced latest table data");
  };

  const onClear = () => {
    if (!batch) return;
    dispatch(clearBatch(batch.id));
    toast.info("Batch cleared");
  };

  const badgeFor = (status = "") => {
    const s = status.toUpperCase();
    if (s === "UPLOADED") return "success";
    if (s === "FAILED") return "danger";
    if (s === "PENDING") return "warning";
    return "secondary";
  };

  const normalizedQuery = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    let list = allResumes || [];
    if (statusFilter !== "ALL")
      list = list.filter(
        (r) => (r.status || "").toUpperCase() === statusFilter
      );
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

  const movePage = (p) => {
    if (p < 1 || p > pages) return;
    setPage(p);
  };

  const renderPagination = () => {
    if (pages <= 1) return null;
    const items = [];
    const add = (p, label = p, disabled = false, active = false) =>
      items.push(
        <Pagination.Item
          key={`p_${p}_${label}`}
          active={active}
          disabled={disabled}
          onClick={() => movePage(p)}
        >
          {label}
        </Pagination.Item>
      );
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={page === 1}
        onClick={() => movePage(page - 1)}
      />
    );
    const windowSize = 2;
    const startPage = Math.max(1, page - windowSize);
    const endPage = Math.min(pages, page + windowSize);
    add(1, 1, false, page === 1);
    if (startPage > 2) items.push(<Pagination.Ellipsis key="el1" disabled />);
    for (let p = startPage; p <= endPage; p++) {
      if (p !== 1 && p !== pages) add(p, p, false, page === p);
    }
    if (endPage < pages - 1)
      items.push(<Pagination.Ellipsis key="el2" disabled />);
    if (pages > 1) add(pages, pages, false, page === pages);
    items.push(
      <Pagination.Next
        key="next"
        disabled={page === pages}
        onClick={() => movePage(page + 1)}
      />
    );
    return <Pagination className="mb-0">{items}</Pagination>;
  };

  const showSync = !!lastProcessStartedAt; // show Sync after first Process click (toggle as you like)

  return (
    <Container
      fluid
      className="py-3 px-0"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
        <BulkTiles />

      {/* Header */}
      <Row className="mb-3">
        <Col className="d-flex align-items-center justify-content-between">
          {/* <h5 style={styles.cardTitle}>Bulk Upload</h5> */}
          <div className="d-flex align-items-center gap-3 small text-muted">
            {processing && <span className="text-warning">Processing…</span>}
            {processError && <span className="text-danger">Process failed</span>}
            {processMessage && !processing && (
              <span className="text-success">{processMessage}</span>
            )}
            {allLastLoadedAt
              ? `Last loaded: ${new Date(allLastLoadedAt).toLocaleString()}`
              : ""}
          </div>
        </Col>
      </Row>

      <Row className="g-0">
        <Col
          xs={12}
          className="px-0 d-flex flex-column"
          style={{ minHeight: 0 }}
        >
          {/* Upload Panel */}
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body>
              {/* Pick & actions */}
              <div className="d-flex flex-wrap align-items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  accept=".pdf,.doc,.docx,.rtf,.odt,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={onPick}
                />
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="bulkupload_btn"
                  onClick={onPickClick}
                >
                  Load resumes…
                </Button>

                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Tooltip>
                      Select files, then start controlled uploads.
                    </Tooltip>
                  }
                >
                  <Button
                    size="sm"
                    variant=""
                    onClick={onUpload}
                    className="bulkupload_btn"
                    disabled={!batch || !batch.items.length}
                  >
                    Start Upload
                  </Button>
                </OverlayTrigger>

                {/* <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={onClear}
                  disabled={!batch}
                  className="bulkupload_btn"
                >
                  Clear Batch
                </Button> */}

                {/* NEW: Process + Sync */}
                <Button
                  size="sm"
                  variant="warning"
                  onClick={onSyncAll}
                  disabled={processing}
                  className="bulkupload_btn"
                >
                  {processing ? "Processing…" : "Sync"}
                </Button>

                {/* <Button
                  size="sm"
                  variant="success"
                  onClick={onSync}
                  disabled={!showSync}
                  className="bulkupload_btn"
                >
                  Sync
                </Button> */}
              </div>

              {/* Batch summary */}
              {batch && (
                <div className="mt-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Badge
                      bg={batch.status === "uploaded" ? "info" : "secondary"}
                    >
                      {batch.status.toUpperCase()}
                    </Badge>

                    {summary && (
                      <div className="d-flex flex-wrap gap-2">
                        <span className="bg-light" style={styles.statPill}>
                          Total: <b>{summary.total}</b>
                        </span>
                        <span className="bg-light" style={styles.statPill}>
                          Uploaded:{" "}
                          <b className="text-success">{summary.uploaded}</b>
                        </span>
                        <span className="bg-light" style={styles.statPill}>
                          Failed:{" "}
                          <b className="text-danger">{summary.failed}</b>
                        </span>
                        <span className="bg-light" style={styles.statPill}>
                          Uploading:{" "}
                          <b className="text-info">{summary.uploading}</b>
                        </span>
                        <span className="bg-light" style={styles.statPill}>
                          Queued: <b>{summary.queued}</b>
                        </span>
                      </div>
                    )}
                  </div>

                  <ProgressBar
                    now={summary?.pct || 0}
                    label={`${summary?.pct || 0}%`}
                  />
                </div>
              )}
            </Card.Body>
          </Card>

          {/* ALL Resumes */}
          <Card className="border-0 shadow-sm flex-grow-1 d-flex w-100">
            <Card.Header className="py-2">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <div className="fw-semibold table_heading">All Resumes</div>
                <div className="text-muted small">
                  ({allResumes?.length ?? 0} total)
                </div>

                <div className="ms-auto d-flex align-items-center gap-2">
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
                  </Form.Select>

                  <InputGroup size="sm" style={{ width: 260 }}>
                    <InputGroup.Text id="search-fn">Search</InputGroup.Text>
                    <Form.Control
                      aria-label="Search by filename or resume id"
                      aria-describedby="search-fn"
                      placeholder="filename or resume id…"
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

            <Card.Body
              className="p-0 d-flex flex-column row"
              style={{ margin: "20px" }}
            >
              <div style={{ flex: 1, overflow: "auto" }}>
                <Table
                  bordered
                  responsive
                  hover
                  className="mb-0"
                  style={{ tableLayout: "fixed" }}
                >
                  <thead className="table-light" style={styles.stickyHeader}>
  <tr style={{ textAlign: "center" }}>
    <th style={{ width: 40 }}>#</th>
    <th style={{ width: 200 }}>Original Filename</th>
    <th style={{ width: 120 }}>Status</th>
    {/* <th style={{ width: 320 }}>File Path</th> */}
    {/* <th style={{ width: 260 }}>Resume ID</th> */}
    {/* <th style={{ width: 200 }}>Created By</th> */}
    <th style={{ width: 160 }}>Created Date</th>
    {/* <th style={{ width: 160 }}>Updated By</th> */}
    {/* <th style={{ width: 160 }}>Updated Date</th> */}
    {/* ADD: show reason only for FAILED */}
    <th style={{ width: 260 }}>Reason For Failed</th>
    {/* ADD: action column (delete icon) */}
    <th style={{ width: 80 }}>Action</th>
  </tr>
</thead>

                  <tbody>
  {current.length ? (
    current.map((r, i) => {
      const status = (r.status || "").toUpperCase();
      const created = r.created_date
        ? new Date(r.created_date).toLocaleString()
        : "-";
      const reason = getFailureReason(r);
      const isFailed = status === "FAILED";

      return (
        <tr
          style={{ textAlign: "center" }}
          key={(r.resume_id || r.original_filename || i) + "_row"}
        >
          <td>{start + i + 1}</td>
          <td
  style={styles.truncate(360)}
  title={r.original_filename || "-"}
>
  <Button
    variant="link"
    className="p-0 text-decoration-none"
    onClick={() => onDownload(r)}
  >
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

          {/* ADD: Reason (only show text for FAILED, else empty) */}
          <td
            className={isFailed ? "text-danger" : ""}
            style={styles.truncate(360)}
            title={isFailed ? reason || "Unknown error" : ""}
          >
            {isFailed ? (reason || "Unknown error") : ""}
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
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className="text-danger"
    >
      {/* trash outline */}
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
