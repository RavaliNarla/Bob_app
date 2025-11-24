import { Modal } from 'react-bootstrap'; 
// Note: Since we are using "Bootstrap Only" via CDN in index.html, we can't easily use react-bootstrap components 
// without installing the package. I will stick to my custom modal implementation which mimics Bootstrap classes.

export function FeedbackModal({ show, onClose, onConfirm, candidateName }) {
  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Interview Feedback: {candidateName}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form id="feedbackForm" onSubmit={(e) => { e.preventDefault(); onConfirm(e); }}>
              <div className="mb-3">
                <label className="form-label">Recommendation</label>
                <select className="form-select" name="status" required>
                  <option value="">Select Outcome...</option>
                  <option value="Selected for Next Round">Selected for Next Round</option>
                  <option value="Selected">Selected (Final)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Rating (1-5)</label>
                <input type="number" min="1" max="5" className="form-control" name="rating" />
              </div>
              <div className="mb-3">
                <label className="form-label">Comments</label>
                <textarea className="form-control" rows={3} required></textarea>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" form="feedbackForm" className="btn btn-bob-primary">Submit Feedback</button>
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
