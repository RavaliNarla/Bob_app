// components/Tabs/ResumeUpload.jsx
import React, { useState } from 'react';

const ResumeUpload = ({ setActiveTab }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      localStorage.clear();
    }
  };

  const handleBrowseClick = () => {
    document.getElementById('resume-input').click();
  };

  const handleContinue = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const response = await fetch('https://backend.sentrifugo.com/parse-resume2', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      localStorage.setItem('formData', JSON.stringify(data));

      setActiveTab('info');
    } catch (err) {
      alert('Error parsing resume: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-content-section text-center">
      <h2>Upload Resume</h2>
      <p>Resume/CV* (Supported format: .docx/.pdf; Max size: 4.5 MB)</p>

      <div className="dropzone">
        <i className="ph-light ph-upload-simple"></i>
        <div className="dropzone-text">
          Drag and drop your files here<br />or{' '}
          <span onClick={handleBrowseClick} style={{ color: '#ff7043 ', cursor: 'pointer' }}>browse to upload</span>
        </div>
        <input type="file" id="resume-input" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} />
        <div id="selected-file-name" style={{ marginTop: '10px' }}>{fileName}</div>
      </div>

      {loading && (
        <div style={{ marginTop: '20px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading...</p>
        </div>
      )}

      <div className="form-navigation">
        <button className="btn btn-primary mt-3 btncolor" onClick={handleContinue} disabled={loading}>Continue</button>
      </div>
    </div>
  );
};

export default ResumeUpload;
