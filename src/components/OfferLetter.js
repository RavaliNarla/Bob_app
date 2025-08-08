import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import "../css/OfferLetter.css";

const OfferLetter = ({ candidate, jobPosition, salary, reqId, autoDownload = false, onDownloadComplete }) => {
  const [formData, setFormData] = useState({
    candidateName: '',
    address1: '',
    address2: '',
    jobTitle: '',
    companyName: '',
    joiningDate: '',
    location: '',
    reportingManager: '',
    hrName: '',
    basicMonthly: '',
    basicAnnual: '',
    hraMonthly: '',
    hraAnnual: '',
    conveyanceMonthly: '',
    conveyanceAnnual: '',
    medicalMonthly: '',
    medicalAnnual: '',
    specialMonthly: '',
    specialAnnual: '',
    pfMonthly: '',
    pfAnnual: '',
    grossMonthly: '',
    grossAnnual: '',
  });

  const offerLetterRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (candidate) {
      const addressParts = candidate.address?.split(',') || [];
      setFormData(prev => ({
        ...prev,
        candidateName: candidate.firstname,
        address1: addressParts[0]?.trim() || '',
        address2: addressParts.slice(1).join(',').trim() || '',
        jobTitle: jobPosition,
        companyName: candidate.currentCompany || '',
        location: candidate.companyLocation || '',
        grossAnnual: salary || '',
        // Add more logic to calculate monthly breakdown if needed
      }));
    }
  }, [candidate, jobPosition, salary]);

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  useEffect(() => {
    if (autoDownload) {
      // wait for ref to be ready
      setTimeout(() => {
        handleDownload();
      }, 500);
    }
  }, [formData, autoDownload]);

  const handleDownload = () => {
    const element = offerLetterRef.current;
    const opt = {
      margin: 0.5,
      filename: 'Offer_Letter.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save().then(() => {
      if (onDownloadComplete) onDownloadComplete();
    });
  };

  return (
    <div style={{ display: 'none' }}>
      <div ref={offerLetterRef} className="offer-preview">
        <p style={{ textAlign: 'right' }}>Date: {today}</p>
        <p>
          To,<br />
          {formData.candidateName}<br />
          {formData.address1}<br />
          {formData.address2}
        </p>

        <p><strong>Subject: Offer of Employment</strong></p>
        <p>Dear {formData.candidateName},</p>
        <p>
          We are pleased to offer you the position of {formData.jobTitle} at {formData.companyName}. Your expected date of joining will be {formData.joiningDate}. The terms and conditions of your employment are as follows:
        </p>

        <ul>
          <li><strong>Job Title:</strong> {formData.jobTitle}</li>
          <li><strong>Location:</strong> {formData.location}</li>
          <li><strong>Reporting To:</strong> {formData.reportingManager}</li>
          <li><strong>Gross Salary:</strong> {formData.grossAnnual}</li>
        </ul>

        {/* <h4>Salary Details:</h4>
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr><th>Component</th><th>Monthly (INR)</th><th>Annually (INR)</th></tr>
          </thead>
          <tbody>
            <tr><td>Basic Salary</td><td>{formData.basicMonthly}</td><td>{formData.basicAnnual}</td></tr>
            <tr><td>House Rent Allowance (HRA)</td><td>{formData.hraMonthly}</td><td>{formData.hraAnnual}</td></tr>
            <tr><td>Conveyance Allowance</td><td>{formData.conveyanceMonthly}</td><td>{formData.conveyanceAnnual}</td></tr>
            <tr><td>Medical Allowance</td><td>{formData.medicalMonthly}</td><td>{formData.medicalAnnual}</td></tr>
            <tr><td>Special Allowance</td><td>{formData.specialMonthly}</td><td>{formData.specialAnnual}</td></tr>
            <tr><td>Provident Fund (Employer Contribution)</td><td>{formData.pfMonthly}</td><td>{formData.pfAnnual}</td></tr>
            <tr><th>Gross Salary</th><th>{formData.grossMonthly}</th><th>{formData.grossAnnual}</th></tr>
          </tbody>
        </table> */}

        <p>We look forward to your confirmation and joining. Please sign and return a copy of this letter as a token of your acceptance.</p>

        <p>
          Sincerely,<br />
          {formData.hrName}<br />
          HR Manager<br />
          {formData.companyName}
        </p>
      </div>
    </div>
  );
};

export default OfferLetter;
