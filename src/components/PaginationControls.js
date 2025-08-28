// src/components/PaginationControls.js
import React from "react";
import { Form } from "react-bootstrap";

const PaginationControls = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      {/* Rows per page */}
      <div>
        <Form.Select
          style={{ width: "120px", fontSize: "12px" }}
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={5}>5 rows</option>
          <option value={10}>10 rows</option>
          <option value={20}>20 rows</option>
        </Form.Select>
      </div>

      {/* Pagination buttons */}
      <nav className="pagination_container">
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              style={{ fontSize: "12px" }}
            >
              Previous
            </button>
          </li>

          {[...Array(totalPages)].map((_, idx) => (
            <li
              key={idx}
              className={`page-item ${currentPage === idx + 1 ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(idx + 1)}
                style={{ fontSize: "12px" }}
              >
                {idx + 1}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              style={{ fontSize: "12px" }}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default PaginationControls;
