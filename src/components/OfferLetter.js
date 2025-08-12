import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import "../css/OfferLetter.css";
import logo from '../assets/pdflogo.png';

const OfferLetter = ({ candidate, jobPosition, salary, reqId, autoDownload = false, onDownloadComplete }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    address1: '',
    address2: '',
    position_title: jobPosition ||'',
    companyName: '',
    joiningDate: '',
    location: '',
    reportingManager: '',
    grossAnnual: '',
  });

  const offerLetterRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);

useEffect(() => {
  if (candidate) {
    const addressParts = candidate.address?.split(',') || [];
    const joiningDate = new Date();
    joiningDate.setDate(joiningDate.getDate() + 15);
    const joiningDateString = joiningDate.toLocaleDateString('en-CA');

    // ✅ Extract location from location_details object
    const location = candidate.location_details
      ? Object.values(candidate.location_details).join(', ')
      : '';

    setFormData(prev => ({
      ...prev,
      full_name: candidate.full_name,
      address1: addressParts[0]?.trim() || '',
      address2: addressParts.slice(1).join(',').trim() || '',
      position_title: jobPosition || '',
      companyName: 'Your Company Name',
      joiningDate: joiningDateString,
      location, // now uses location_details
      reportingManager: 'John Doe',
      grossAnnual: salary,
    }));
  }
}, [candidate, jobPosition, salary, reqId]);


  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

const hasDownloadedRef = useRef(false);

useEffect(() => {
  if (autoDownload && !hasDownloadedRef.current) {
    hasDownloadedRef.current = true; // mark as downloaded
    setTimeout(() => {
      handleDownload();
    }, 500);
  }
}, [autoDownload]);


  const handleDownload = () => {
    const element = offerLetterRef.current;
    const opt = {
      margin: 0.5,
      filename: `Offer_Letter_${formData.full_name.replace(/\s/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save().then(() => {
      if (onDownloadComplete) onDownloadComplete();
    });
  };

  return (
    <div className='offer-letter-container' ref={offerLetterRef}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <img
          src={logo} // Update with your logo path
          alt="Company Logo"
          style={{ width: '100%', height: '120px' }}
        />
      </div>
      <p style={{ textAlign: 'right' }}>Date: {today}</p>
      <p>
        To,<br />
        {formData.full_name}<br />
        {formData.address1}<br />
        {formData.address2}
      </p>

      <p><strong>Subject: Offer of Employment</strong></p>
      <p>Dear <b>{formData.full_name}</b>,</p>
      <p>
        We are pleased to offer you the position of <b>{formData.position_title}</b> at <b>Bank of Baroda</b>. Your expected date of joining will be <b>{formData.joiningDate}</b>. The terms and conditions of your employment are as follows:
      </p>

      <ul>
        <li><strong>Job Title:</strong> {formData.position_title}</li>
        <li><strong>Location:</strong> {formData.location}</li>
        {/* <li><strong>Reporting To:</strong> {formData.reportingManager}</li> */}
        <li><strong>Gross Salary:</strong> {formData.grossAnnual}</li>
      </ul>

      <p>
        This offer is subject to successful completion of all background checks.
      </p>

      <p>Sincerely,</p>
      <p>
        {formData.hrName || 'HR Department'}<br />
        Bank of Baroda
      </p>
    </div>
  );
};

export default OfferLetter;