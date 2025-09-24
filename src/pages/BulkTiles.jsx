// src/pages/BulkTiles.jsx
import React from "react";
import { Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

export default function BulkTiles() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const go = (to) => navigate(to);

  const isUpload = pathname === "/bulk-upload";
  const isAssign = pathname === "/candidate-assign";

  return (
    <div className="d-flex gap-2 mb-3">
      <Button
        type="button"
        className="px-4 btn btn-secondary tile-btn"
        active={isUpload}
        onClick={() => go("/bulk-upload")}
      >
        Bulk Upload
      </Button>

      <Button
        type="button"
        className="px-4 btn btn-secondary tile-btn"
        active={isAssign}
        onClick={() => go("/candidate-assign")}
      >
        Candidate Assign
      </Button>
    </div>
  );
}
