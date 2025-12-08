import { Modal } from 'react-bootstrap'; 
// Note: Since we are using "Bootstrap Only" via CDN in index.html, we can't easily use react-bootstrap components 
// without installing the package. I will stick to my custom modal implementation which mimics Bootstrap classes.
import { useState, useEffect } from "react";
import apiService from '../../services/apiService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export function FeedbackModal({ show, onClose, onConfirm, candidateName ,candidateDetails}) {

  const [status, setStatus] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
const [feedbacks, setFeedbacks] = useState([]);

useEffect(() => {
  const fetchFeedbacks = async () => {
    if (show && candidateDetails?.application_id) {
      try {
        const res = await apiService.getfeedback(candidateDetails.application_id);
        console.log("Fetched Feedbacks:", res);
        if (res?.status === 200 && Array.isArray(res.data)) {
          setFeedbacks(res.data);
          console.log("Feedbacks set to state:", feedbacks);
        } else {
          setFeedbacks([]);
        }
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
        setFeedbacks([]);
      }
    }
  };

  fetchFeedbacks();
}, [show, candidateDetails?.application_id]);
  if (!show) return null;



  
  const handleSaveFeedback = async () => {
  // 🧩 1. Validate required fields
  if (!status || status.trim() === "") {
    toast.error("Please select a status before submitting feedback.");
    return;
  }

  if (!comments || comments.trim() === "") {
    toast.error("Please enter comments before submitting feedback.");
    return;
  }

  if (!candidateDetails?.application_id) {
    toast.error("Missing candidate application ID.");
    return;
  }

  setError("");
  setSaving(true); // show loading spinner if used

  try {
    const payload = {
      comments: comments.trim(),
      status: status.trim(),
      application_id: candidateDetails.application_id,
    };

    const res = await apiService.postFeedback(payload);
    console.log("Feedback Response:", res);

    // 🧩 2. Normalize message for both plain text and JSON responses
    const message =
      typeof res === "string"
        ? res
        : res?.data?.message || res?.data || res?.message || "";

    if (
      message.toLowerCase().includes("feedback submitted successfully") ||
      message.toLowerCase().includes("success")
    ) {
      toast.success("Feedback submitted successfully!");

       // ✅ Re-fetch feedback list
        const updated = await apiService.getfeedback(candidateDetails.application_id);
        if (updated?.status == 200) {
          setFeedbacks(updated.data);
        }


      // ✅ Refresh and close
      onConfirm();
      //onClose();

      // Reset fields
      setComments("");
      setStatus("");
      setIsEditing(false);
    } else {
      toast.warning("Unexpected response. Please verify if feedback was saved.");
      console.warn("Unexpected feedback response:", res);
    }
  } catch (err) {
    console.error("Feedback save error:", err);
    const errorMsg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Failed to save feedback.";
    setError(errorMsg);
    toast.error(errorMsg);
  } finally {
    setSaving(false);
  }
};
return (
  <div
    className="modal show d-block"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    tabIndex={-1}
  >
    <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content shadow">
        {/* Header */}
        <div className="modal-header border-0 border-bottom">
          <h5 className="modal-title text-bob-blue fw-bold">
            Interview Feedback: {candidateName}
          </h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status Dropdown */}
          <div className="mb-3">
            <label className="form-label fw-semibold text-muted">
              Update Status
            </label>
            <select
              className="form-select shadow-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="">Select Status...</option>
              <option value="Selected for Next Round">
                Selected for Next Round
              </option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>

          {/* Comments */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-muted">
              Comments
            </label>
            <textarea
              className="form-control shadow-sm"
              rows={3}
              placeholder="Enter comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Divider */}
          {feedbacks && feedbacks.length > 0 && (
            <>
              <hr className="border-bob-orange opacity-75" />
              <h6 className="fw-bold text-bob-orange mb-3 d-flex align-items-center">
                <i className="bi bi-chat-text me-2"></i> Previous Feedbacks
              </h6>

              <div
                className="table-responsive border rounded"
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th className="fw-semibold text-secondary">Status</th>
                      <th className="fw-semibold text-secondary">Comments</th>
                      <th className="fw-semibold text-secondary">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((fb, i) => (
                      <tr key={i}>
                        <td >{fb.status || "-"}</td>
                        <td>{fb.comments || "-"}</td>
                        <td className="text-muted small">
                          {new Date(fb.actionDate).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer border-top">
          <button
            type="button"
            className="btn btn-outline-secondary px-4"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="feedbackForm"
            className="btn btn-bob-primary px-4 fw-semibold"
            disabled={saving}
            onClick={handleSaveFeedback}
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Saving...
              </>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

}

export function ConfirmationModal({ show, onClose, onConfirm, title, message, confirmText, confirmClass = 'btn-bob-primary' }) {
  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="button" className={`btn ${confirmClass}`} onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
