import React, { useState, useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
import "../css/OfferLetter.css";
import logo from '../assets/pdflogo.png';
import apiService from '../services/apiService';

const OfferLetter = ({ candidate, jobPosition, salary, reqId, autoDownload = false, onDownloadComplete, ...props }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    address1: '',
    address2: '',
    position_title: jobPosition || '',
    companyName: '',
    joiningDate: '',
    location: '',
    reportingManager: '',
    grossAnnual: '',
  });

  const [logoLoaded, setLogoLoaded] = useState(false);
  const offerLetterRef = useRef(null);

  useEffect(() => {
    if (candidate) {
      const addressParts = candidate.address?.split(',') || [];
      const joiningDate = new Date();
      joiningDate.setDate(joiningDate.getDate() + 15);
      const joiningDateString = joiningDate.toLocaleDateString('en-CA');
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
        location,
        reportingManager: 'John Doe',
        grossAnnual: salary,
      }));
    }
  }, [candidate, jobPosition, salary, reqId]);

  // Delay autoDownload until DOM + logo are ready
  useEffect(() => {
    if (
      autoDownload &&
      candidate &&
      candidate.candidate_id &&
      formData.full_name &&
      formData.location &&
      formData.grossAnnual &&
      logoLoaded
    ) {
      const timer = setTimeout(() => {
        handleDownload();
      }, 600); // small delay ensures DOM & images fully rendered
      return () => clearTimeout(timer);
    }
  }, [autoDownload, candidate, formData, logoLoaded]);

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const handleDownload = async () => {
    const element = offerLetterRef.current;
    if (!element || !candidate?.candidate_id) {
      console.error("Missing DOM element or candidate ID.");
      return;
    }

    const candidateId = candidate.candidate_id;
    const filename = `Offer_Letter_${candidateId}_${new Date().toISOString()}.pdf`;

    const opt = {
      margin: 0.5,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true }, // reduced scale for stability
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      const fd = new FormData();
      fd.append("pdfFile", file, filename);
      fd.append("candidateId", candidateId);

     const data = await apiService.uploadOfferLetter(fd);

      // console.log("Upload Response Data:", data?.data);

      if (data?.data?.public_url) { 
        onDownloadComplete({ public_url: data.data.public_url });
      } else {
        throw new Error("Public URL not found in upload response.");
      }
      // window.open(data.data.public_url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Upload/Download error:", error);
      alert("Failed to upload and open PDF.");
    }
  };

  return (
    <>
      <div className='offer-letter-container' ref={offerLetterRef}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <img
            src={logo}
            alt="Company Logo"
            onLoad={() => setLogoLoaded(true)} // wait for logo
            style={{ width: '100%', height: '120px', objectFit: 'contain' }}
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
          We are pleased to offer you the position of <b>{formData.position_title}</b> at <b>Bank of Baroda</b>. 
          Your expected date of joining will be <b>{formData.joiningDate}</b>. 
          The terms and conditions of your employment are as follows:
        </p>

        <ul>
  <li><strong>Job Title:</strong> {formData.position_title}</li>
  <li><strong>Location:</strong> {formData.location}</li>
  <li>
    <strong>Gross Salary:</strong>{" "}
    ₹ {Number(formData.grossAnnual || 0).toLocaleString("en-IN")}
  </li>
</ul>


        <p>This offer is subject to successful completion of all background checks.</p>

        <p>Sincerely,</p>
        <p>
          {formData.hrName || 'HR Department'}<br />
          Bank of Baroda
        </p>
      </div>
    </>
  );
};

export default OfferLetter;
