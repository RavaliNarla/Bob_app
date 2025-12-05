import { CheckCircle, Mail, FileText, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../../services/apiService';
export function OfferPoolScreen({ candidates,onViewProfile,selectedRequisition,selectedPosition,positions,onBackToMain }) {

  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [templateContent, setTemplateContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
const [candidateStatus, setCandidateStatus] = useState({});
  // ✅ Fetch Offer Templates once on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await apiService.getTemplates();

        // Your backend response may return templates inside data or data.data
        const templateList =
          res|| [];
        if (Array.isArray(templateList)) {
          setTemplates(templateList);
        } else {
          console.warn('⚠️ Unexpected template format:', res);
          setTemplates([]);
        }
      } catch (error) {
        console.error('❌ Error fetching templates:', error);
        toast.error('Failed to load offer templates. Please try again.');
      }
    };

    fetchTemplates();
  }, []);
  // ✅ Handle candidate selection
  const toggleCandidate = (candidateId) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  // ✅ Handle select all
  const toggleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map((c) => c.id));
    }
  };

  // ✅ Handle Send Offer API
 const handleSendOffer = async () => {
  if (selectedCandidates.length === 0) {
    toast.error('Please select at least one candidate.');
    return;
  }
  if (!selectedTemplate) {
    toast.error('Please select an offer template.');
    return;
  }
  if (!joiningDate) {
    toast.error('Please select a joining date.');
    return;
  }

  setIsSending(true);

  try {
    const BATCH_SIZE = 20;
    const remaining = [...selectedCandidates];
    let successCount = 0;
    let batchCount = 0;

    // Initialize statuses
    const initialStatus = {};
    selectedCandidates.forEach(id => (initialStatus[id] = 'pending'));
    setCandidateStatus(initialStatus);

    while (remaining.length > 0) {
      batchCount++;
      const batch = remaining.splice(0, BATCH_SIZE);

      console.log(`📦 Sending batch ${batchCount} (${batch.length} candidates)`);

      await Promise.all(
        batch.map(async (candidateId) => {
          // set status to sending
          setCandidateStatus((prev) => ({
            ...prev,
            [candidateId]: 'sending',
          }));

          const payload = {
            candidate_id: candidateId,
            offer_template_id: selectedTemplate,
            joining_date: joiningDate,
            position_id: selectedPosition || null,
            position:
              positions.find(p => p.position_id === selectedPosition)?.position_title || "",
          };

          try {
            const res = await apiService.sendBulkOffer(payload);

            if (res?.status === 200) {
              successCount++;
              // ✅ mark as sent
              setCandidateStatus((prev) => ({
                ...prev,
                [candidateId]: 'sent',
              }));
            } else {
              // ❌ mark as failed
              setCandidateStatus((prev) => ({
                ...prev,
                [candidateId]: 'failed',
              }));
            }
          } catch (err) {
            console.error(`❌ Error sending offer for candidate ${candidateId}:`, err);
            setCandidateStatus((prev) => ({
              ...prev,
              [candidateId]: 'failed',
            }));
          }
        })
      );

      await new Promise((r) => setTimeout(r, 300));
    }

   const message = `✅ Offers sent successfully for ${successCount} candidates!`;
    toast.success(message, {
      autoClose: 2000,
      onClose: () => {
        
        // Navigate back to main view after toast is closed
        if (onBackToMain) {
           console.log("🎯 Toast closed, navigating back...");
          onBackToMain();
        }
      }
    });
  } catch (error) {
    console.error('❌ Error sending offers:', error);
    toast.error('Failed to send offers. Please try again.');
  } finally {
    setIsSending(false);
  }
};


const handlePreviewTemplate = async () => {
    if (!selectedTemplate) {
      toast.warn('Please select a template to preview.');
      return;
    }
    setIsPreviewLoading(true);
    try {
      const res = await apiService.getTemplateContent(selectedTemplate);
      // Assuming res.data contains raw HTML string
      const html = res || '';
      setTemplateContent(html);
      setShowPreview(true);
    } catch (err) {
      console.error('Error loading template preview:', err);
      toast.error('Failed to load template content.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="m-0 text-bob-blue">Offer Management</h5>
      </div>

      {/* Offer Controls */}
      <div className="card shadow-lg mb-4 border-0 bg-light">
        <div className="card-body d-flex flex-wrap align-items-end gap-3">
          {/* Offer Template */}
           <div className="d-flex-grow-1 col-md-4">
            <label className="form-label fw-semibold text-muted">
              Offer Template
            </label>
             {selectedTemplate && (
                <button
                  className="btn btn-link p-0 px-2 d-inline-flex align-items-center"
                  type="button"
                  title="Preview Template"
                  onClick={handlePreviewTemplate}
                >
                  {isPreviewLoading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    ></span>
                  ) : (
                    <Info size={18} />
                  )}
                </button>
              )}
            <div className="">
              <select
                className="form-select"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                disabled={selectedCandidates.length === 0 || isSending}
              >
                <option value="">Select Template...</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
             
            </div>
          </div>

          {/* Joining Date */}
           {/* Joining Date */}
          <div className="col-md-4">
            <label className="form-label fw-semibold text-muted">
              Joining Date
            </label>
            <input
              type="date"
              className="form-control"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
               disabled={selectedCandidates.length === 0 || isSending}
            />
          </div>

          {/* Send Offer Button */}
           <div className="ms-auto">
            <button
              className="btn btn-bob-primary d-flex align-items-center gap-2 px-4"
              onClick={handleSendOffer}
               disabled={
          isSending ||
          selectedCandidates.length === 0 || // disable if no candidate selected
          !selectedTemplate || // disable if template not chosen
          !joiningDate // disable if no joining date
        }
            >
              {isSending ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={16} /> Send Offers
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* ✅ Template Preview Modal */}
      {showPreview && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-bob-blue">Template Preview</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPreview(false)}
                ></button>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: '70vh', overflowY: 'auto' }}
              >
                {templateContent ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: templateContent }}
                  ></div>
                ) : (
                  <p className="text-muted">No content available.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPreview(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle border">
          <thead className="table-light">
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedCandidates.length === candidates.length &&
                    candidates.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Candidate</th>
              <th>Position</th>
              <th>Status</th>
              <th>Offer Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length > 0 ? (
              candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => toggleCandidate(candidate.id)}
                    />
                  </td>
                  <td>{candidate.name}</td>
                  <td>{ positions.find(p => p.position_id === selectedPosition)?.position_title|| '-'}</td>
                  <td>
                    <span className="badge bg-success">Selected</span>
                  </td>
                  <td>{new Date().toLocaleDateString()}</td>
                 <td>
                    {candidateStatus[candidate.id] === 'sending' && (
                      <span className="text-primary d-flex align-items-center gap-1">
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                        ></span>
                        Sending...
                      </span>
                    )}

                    {candidateStatus[candidate.id] === 'sent' && (
                      <span className="badge bg-success">Offer Sent</span>
                    )}

                    {candidateStatus[candidate.id] === 'failed' && (
                      <span className="badge bg-danger">Failed</span>
                    )}

                    {!candidateStatus[candidate.id] && (
                      <span className="badge bg-secondary">Pending</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-muted">
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
