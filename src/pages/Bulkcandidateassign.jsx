// src/pages/BulkCandidateAssign.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Container,
  Spinner,
  Table,
  InputGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import apiService from "../services/apiService";
import "../css/bulkUpload.css";
import BulkTiles from "./BulkTiles";
import CandidateDetailsModal from "../components/CandidateDetailsModal";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function BulkCandidateAssign() {
  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingPos, setLoadingPos] = useState(false);
  const [loadingCand, setLoadingCand] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [requisitions, setRequisitions] = useState([]);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [selectedReq, setSelectedReq] = useState("");
  const [selectedPos, setSelectedPos] = useState("");

  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [candidateDetails, setCandidateDetails] = useState(null);

  const openCandidate = (row) => {
    setCandidateDetails(row);
    setShowDetails(true);
  };

  // load requisitions
  useEffect(() => {
    const run = async () => {
      setLoadingReq(true);
      try {
        const res = await apiService.getReqData();
        const list = Array.isArray(res?.data) ? res.data : [];
        setRequisitions(list);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load requisitions");
      } finally {
        setLoadingReq(false);
      }
    };
    run();
  }, []);

  // load positions for selected requisition
  useEffect(() => {
    const run = async () => {
      setPositions([]);
      setSelectedPos("");
      setCandidates([]);
      setSelected(new Set());
      if (!selectedReq) return;
      setLoadingPos(true);
      try {
        const res = await apiService.getByRequisitionId(selectedReq);
        const list = Array.isArray(res?.data) ? res.data : [];
        setPositions(list);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load positions");
      } finally {
        setLoadingPos(false);
      }
    };
    run();
  }, [selectedReq]);

  // load candidates when a position is selected
  useEffect(() => {
    const run = async () => {
      setCandidates([]);
      setSelected(new Set());
      if (!selectedPos) return;

      setLoadingCand(true);
      try {
        const res = await apiService.getNotAppliedBulkUploadCandidates(selectedPos);

        // works whether interceptor returns axios.response or response.data
        const body = res?.data ?? res;
        const list = Array.isArray(body)
          ? body
          : (Array.isArray(body?.data) ? body.data : []);

        setCandidates(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load candidates");
      } finally {
        setLoadingCand(false);
      }
    };
    run();
  }, [selectedPos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter((c) =>
      [c.name, c.full_name, c.email, c.phone, c.mobile]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [candidates, query]);

  const allVisibleIds = useMemo(
    () => filtered.map((c) => c.id || c.candidate_id || c._id),
    [filtered]
  );

  const isAllVisibleSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selected.has(id));

  const toggleAllVisible = (checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        allVisibleIds.forEach((id) => next.add(id));
      } else {
        allVisibleIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  };

  const toggleOne = (id, checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleAssign = async () => {
    if (!selectedPos || selected.size === 0) return;
    setAssigning(true);
    try {
      // Build candidateIds as the API expects (UUIDs from candidate.candidate_id)
      const ids = Array.from(selected)
        .map((selId) => {
          const obj = candidates.find(
            (c) => (c.id || c.candidate_id || c._id) === selId
          );
          return obj?.candidate_id ?? selId; // fallback if we already stored candidate_id
        })
        .filter(Boolean);

      const res = await apiService.bulkShortlistCandidates(selectedPos, ids);
      const body = res?.data ?? res; // works whether interceptor returns response or data
      const ok = body?.success ?? true;

      if (ok) {
        toast.success(`Assigned ${ids.length} candidate(s) to the position.`);
        // Refresh the "not-applied" list so assigned ones disappear
        setSelected(new Set());
        setLoadingCand(true);
        try {
          const ref = await apiService.getNotAppliedBulkUploadCandidates(selectedPos);
          const payload = ref?.data ?? ref;
          const list = Array.isArray(payload) ? payload : payload?.data ?? [];
          setCandidates(Array.isArray(list) ? list : []);
        } finally {
          setLoadingCand(false);
        }
      } else {
        toast.error(body?.message || "Assignment failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to assign candidates");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Container
      fluid
      className="py-4 px-3"
      style={{ height: "100vh", display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      <BulkTiles />

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="mb-1">Requisition</Form.Label>
              <Form.Select
              className="requisition"
                size="sm"
                value={selectedReq}
                onChange={(e) => setSelectedReq(e.target.value)}
                disabled={loadingReq}
              >
                <option value="" className="reqvalues">
                  {loadingReq ? "Loading…" : "Select requisition"}
                </option>
                {requisitions.map((r) => (
                  <option
                    key={r.requisition_id || r.id}
                    value={r.requisition_id || r.id}
                  >
                    {r.requisition_title ||
                      r.title ||
                      `REQ-${r.requisition_id || r.id}`}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Label className="mb-1">Position</Form.Label>
              <Form.Select
                size="sm"
                value={selectedPos}
                onChange={(e) => setSelectedPos(e.target.value)}
                disabled={!selectedReq || loadingPos}
              >
                <option value="">
                  {loadingPos
                    ? "Loading…"
                    : selectedReq
                    ? "Select position"
                    : "Select requisition first"}
                </option>
                {positions.map((p) => (
                  <option key={p.position_id || p.id} value={p.position_id || p.id}>
                    {p.position_title ||
                      p.title ||
                      `POS-${p.position_id || p.id}`}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* <Col md={4}>
              <Form.Label className="mb-1">Search</Form.Label>
              <InputGroup size="sm">
                <Form.Control
                  placeholder="Search candidates (name, email, phone)…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loadingCand || candidates.length === 0}
                />
              </InputGroup>
            </Col> */}
          </Row>
        </Card.Body>
      </Card>

      {/* Candidates table */}
      <Card
        className="border-0 shadow-sm"
        style={{ flex: 1, overflow: "hidden", minHeight: 0 }}
      >
        <Card.Body
          className="p-0 d-flex flex-column"
          style={{ minHeight: 0 }}
        >
          {loadingCand ? (
            <div className="d-flex align-items-center justify-content-center py-5 text-muted">
              <Spinner animation="border" size="sm" className="me-2" />
              Loading candidates…
            </div>
          ) : !selectedPos ? (
            <div className="text-center text-muted py-5">
              Select a position to load candidates.
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center text-muted py-5">
              No candidates found for this position.
            </div>
          ) : (
            <>
              <div className="px-3 py-2 small text-muted d-flex justify-content-between align-items-center">
                <div className="mt-2">
                  <p className="text-muted">Showing {filtered.length} of {candidates.length}</p>
                </div>
                <div className="d-flex gap-3" style={{ height: '40px' }}>

                  {/* <Form.Label className="mb-1">Search</Form.Label> */}
                  <InputGroup className="posting-search" size="sm">
                  <InputGroup.Text style={{ backgroundColor: "#FF7043" }}>
                                <FontAwesomeIcon icon={faSearch} style={{ color: "#fff" }} />
                              </InputGroup.Text>
                    <Form.Control
                      placeholder="Search candidates..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      disabled={loadingCand || candidates.length === 0}
                      style={{ width: '350px' }}
                    />
                  </InputGroup>
                  <div>
                    <Button
                      size="sm"
                      className="bulkupload_btn"
                      disabled={
                        assigning ||
                        loadingCand ||
                        selected.size === 0 ||
                        !selectedPos
                      }
                      onClick={handleAssign}
                      style={{ width: '140px', padding: '0.5rem' }}
                    >
                      {assigning ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Assigning…
                        </>
                      ) : (
                        "Assign to position"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <Table hover responsive className="req_table mt-2">
                  <thead className="table-header-orange">
                    <tr>
                      <th style={{ width: 40 }}>
                        <Form.Check
                          type="checkbox"
                          checked={isAllVisibleSelected}
                          onChange={(e) => toggleAllVisible(e.target.checked)}
                        />
                      </th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Education Qualification</th>
                    </tr>
                  </thead>
                  <tbody className="table-body-orange">
                    {filtered.map((c) => {
                      const id = c.id || c.candidate_id || c._id;
                      return (
                        <tr key={id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selected.has(id)}
                              onChange={(e) => toggleOne(id, e.target.checked)}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link p-0"
                              onClick={() => openCandidate(c)}
                            >
                              {c.full_name || c.name || "-"}
                            </button>
                          </td>
                          <td>{c.email || "-"}</td>
                          <td>{c.phone || c.mobile || "-"}</td>
                          <td>{c.education_qualification || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top bg-light">
                <div className="small text-muted">
                  Selected: {selected.size}
                </div>
              </div>

              <CandidateDetailsModal
                show={showDetails}
                onHide={() => setShowDetails(false)}
                data={candidateDetails}
              />
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
