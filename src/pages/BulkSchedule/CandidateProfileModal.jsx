import React, { useState } from "react";

export function CandidateProfileModal({ show, onClose, candidate }) {
  const [activeTab, setActiveTab] = useState("basic");

  if (!show || !candidate) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          {/* 🔹 Header */}
          <div className="modal-header d-flex justify-content-between align-items-center">
            <h5 className="modal-title">
              Candidate Profile: {candidate.name}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* 🔹 Tabs Navigation */}
          <ul className="nav nav-tabs px-3 pt-2 border-bottom-0">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "basic" ? "active" : ""}`}
                onClick={() => setActiveTab("basic")}
              >
                Basic Info
              </button>
            </li>

            {candidate.resumeUrl && (
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "resume" ? "active" : ""}`}
                  onClick={() => setActiveTab("resume")}
                >
                  Resume
                </button>
              </li>
            )}

            {candidate.offerLetterUrl && (
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "offer" ? "active" : ""}`}
                  onClick={() => setActiveTab("offer")}
                >
                  Offer Letter
                </button>
              </li>
            )}
          </ul>

          {/* 🔹 Tab Content */}
          <div className="modal-body">
            {/* 🟠 Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="row">
                {/* Left Column */}
                <div className="col-md-6">
                  <div className="mb-4 border p-3 rounded">
                    <h6 className="text-bob-orange fw-bold border-bottom pb-2">
                      Basic Information
                    </h6>
                    <p><strong>NAME:</strong> {candidate.name}</p>
                    <p><strong>EMAIL:</strong> {candidate.email}</p>
                    <p><strong>LOCATION:</strong> {candidate.address || "-"}</p>
                    <p><strong>CONTACT INFO:</strong> {candidate.phone || "-"}</p>
                    <p><strong>ADDRESS:</strong> {candidate.address || "-"}</p>
                  </div>

                  <div className="border p-3 rounded">
                    <h6 className="text-bob-orange fw-bold border-bottom pb-2">
                      Education Information
                    </h6>
                    <p><strong>Education:</strong> {candidate.education_qualification || "-"}</p>
                    <p><strong>Grade/Score:</strong> {candidate.grade || "-"}</p>
                    <p><strong>Year of Passing:</strong> {candidate.year_of_passing || "-"}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-md-6">
                  <div className="border p-3 rounded">
                    <h6 className="text-bob-orange fw-bold border-bottom pb-2">
                      Professional Information
                    </h6>
                    <p><strong>Current Job Title:</strong> {candidate.current_designation || "-"}</p>
                    <p><strong>Total Experience:</strong> {candidate.experience || "-"}</p>
                    <p><strong>Current CTC:</strong> {candidate.current_ctc || "-"}</p>
                    <p><strong>Expected CTC:</strong> {candidate.expected_ctc || "-"}</p>
                    <p><strong>Current Company:</strong> {candidate.current_employer || "-"}</p>
                    <p><strong>Company Location:</strong> {candidate.company_location || "-"}</p>
                    <p><strong>Skill Set:</strong> {candidate.skills?.join(", ") || "-"}</p>
                    <p><strong>Additional Info:</strong> {candidate.comments || "-"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 🟢 Resume Tab */}
            {activeTab === "resume" && candidate.resumeUrl && (
  <div>
   

    {(() => {
      const fileUrl = candidate.resumeUrl;
      const ext = fileUrl.split(".").pop().toLowerCase();
      const isPdf = ext === "pdf";
      const isDoc = ext === "docx" || ext === "doc";

      // Choose appropriate viewer URL
      const viewerUrl = isPdf
        ? fileUrl
        : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;

      return (
        <div>
           {/* Download button at top */}
          <div className="d-flex justify-content-end mb-2">
            <a
              href={fileUrl}   target="_blank"
              download
              className="btn btn-sm btn-outline-secondary"
            >
              Download Resume
            </a>
          </div>
          <iframe
            src={viewerUrl}
            title="Candidate Resume"
            width="100%"
            height="500px"
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          ></iframe>

          {/* Download Button */}
          {/* <div className="text-end mt-2">
            <a
              href={fileUrl}
              download
              className="btn btn-sm btn-outline-secondary"
            >
              Download Resume
            </a>
          </div> */}
        </div>
      );
    })()}
  </div>
)}


            {/* 🔵 Offer Letter Tab */}
            {activeTab === "offer" && candidate.offerLetterUrl && (
              <div>
                 <div className="d-flex justify-content-end mb-2">
                          <a
                            href={candidate?.offerLetterUrl}
                            download
                            className="btn btn-sm btn-outline-secondary"
                            target="_blank"
                          >
                            Download Offer Letter
                          </a>
                        </div>
                <iframe
                  src={candidate.offerLetterUrl}
                  title="Candidate Offer Letter"
                  width="100%"
                  height="500px"
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                ></iframe>
              </div>
            )}
          </div>

          {/* 🔹 Footer */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
