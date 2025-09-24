// src/pages/BulkCandidateAssign.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Container,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";
import apiService from "../services/apiService";
import "../css/bulkUpload.css";
import BulkTiles from "./BulkTiles";

export default function BulkCandidateAssign() {
  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingPos, setLoadingPos] = useState(false);

  const [requisitions, setRequisitions] = useState([]);
  const [positions, setPositions] = useState([]);

  const [selectedReq, setSelectedReq] = useState("");
  const [selectedPos, setSelectedPos] = useState("");

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

  return (
    <Container
      fluid
      className="py-3 px-0"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <BulkTiles />

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="mb-1">Requisition</Form.Label>
              <Form.Select
                size="sm"
                value={selectedReq}
                onChange={(e) => setSelectedReq(e.target.value)}
                disabled={loadingReq}
              >
                <option value="">
                  {loadingReq ? "Loading…" : "Select requisition"}
                </option>
                {requisitions.map((r) => (
                  <option
                    key={r.requisition_id || r.id}
                    value={r.requisition_id || r.id}
                  >
                    {r.requisition_title || r.title || `REQ-${r.requisition_id || r.id}`}
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
                    {p.position_title || p.title || `POS-${p.position_id || p.id}`}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md="auto">
              <Button size="sm" className="bulkupload_btn" disabled>
                {loadingReq || loadingPos ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Preparing…
                  </>
                ) : (
                  "Assign (coming soon)"
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center text-muted py-5">
          <div className="mb-2 fw-semibold">Candidate API pending</div>
          <div>
            Once the API is ready, we’ll show the candidates for the selected
            requisition & position right here, with checkboxes and an Assign button.
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
