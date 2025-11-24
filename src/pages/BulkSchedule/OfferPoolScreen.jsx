import { CheckCircle, Download, Mail } from 'lucide-react';

export function OfferPoolScreen({ candidates, onReleaseOffer }) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="m-0 text-bob-blue">Offer Management</h5>
        <button className="btn btn-bob-primary">
          <Mail size={16} className="me-2" /> Send Bulk Offers
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped border">
          <thead className="table-light">
            <tr>
              <th>Candidate</th>
              <th>Position</th>
              <th>Status</th>
              <th>Offer Date</th>
              <th>Acceptance Deadline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => (
              <tr key={candidate.id}>
                <td className="fw-bold">{candidate.name}</td>
                <td>{candidate.positionId}</td>
                <td>
                  <span className="badge bg-success">Offered</span>
                </td>
                <td>{new Date().toLocaleDateString()}</td>
                <td>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" title="View Offer Letter">
                      <FileTextIcon />
                    </button>
                    <button className="btn btn-sm btn-outline-success" title="Mark Accepted">
                      <CheckCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  No candidates currently in Offer stage.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FileTextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );
}
