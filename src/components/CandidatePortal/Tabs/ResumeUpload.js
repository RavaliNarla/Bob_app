// components/Tabs/ResumeUpload.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCandidate, setUser } from '../../../store/userSlice';
import apiService from '../../../services/apiService';
import CryptoJS from "crypto-js";

const ResumeUpload = ({ resumeFile, setResumeFile, setParsedData, setResumePublicUrl, goNext, resumePublicUrl }) => {
  const SECRET_KEY = "fdf4-832b-b4fd-ccfb9258a6b3";
  const [fileName, setFileName] = useState(resumeFile ? resumeFile.name : '');
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  // 🔒 Helper
  function encryptPassword(password) {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  }
  // console.log(user)
  const candidateId = user?.candidate_id;
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setFileName(file.name);
    }
  };

  const handleBrowseClick = () => {
    const fileInput = document.getElementById('resume-input');
    if (fileInput) {
      fileInput.click();
    }
  };


  // const handleContinue = async () => {
  //   if (!resumeFile) {
  //     alert('Please select a file');
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     // Step 1: Parse resume
  //     const parseFormData = new FormData();
  //     parseFormData.append('resume', resumeFile);

  //     const parseResponse = await fetch('https://backend.sentrifugo.com/parse-resume2', {
  //       method: 'POST',
  //       body: parseFormData,
  //     });

  //     if (!parseResponse.ok) throw new Error('Failed to parse resume');

  //     const parsedData = await parseResponse.json();
  //     console.log("Parsed resume:", parsedData);

  //     // Save parsed data in parent state
  //     setParsedData(parsedData);
  //     console.log(setParsedData);


  //     // Step 2: Register candidate with parsed info
  //     const registerPayload = {
  //       name: parsedData.name || "",
  //       email: parsedData.email || "",
  //        mobile: 9999999999,   // <-- use mobile instead of phone
  //       password: "Sagrsoft@123",
  //     };

  //     const registerResponse = await fetch('https://bobbe.sentrifugo.com/api/auth/candidate-register', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(registerPayload),
  //     });

  //     // Read as text first
  //     const registerText = await registerResponse.text();
  //     console.log("Register API raw response:", registerText);

  //     let registerResult;
  //     try {
  //       registerResult = JSON.parse(registerText);
  //       const candidateId = registerResult?.candidate_id
  //       dispatch(setCandidate(candidateId));
  //       console.log('candidateId: ', candidateId)
  //     } catch (e) {
  //       throw new Error("Register API did not return valid JSON. Response: " + registerText);
  //     }

  //     if (!registerResponse.ok) {
  //       throw new Error("Failed to register candidate: " + (registerResult.error || registerText));
  //     }

  //     console.log("Candidate registered:", registerResult);


  //     const candidateId = registerResult.candidate_id;


  //     // Step 3: Upload resume to bobbe server
  //     const uploadFormData = new FormData();
  //     uploadFormData.append('resumeFile', resumeFile);
  //     uploadFormData.append('candidateId', candidateId);

  //     const uploadResponse = await fetch('https://bobbe.sentrifugo.com/api/resume/upload', {
  //       method: 'POST',
  //       body: uploadFormData,
  //     });

  //     if (!uploadResponse.ok) throw new Error('Failed to upload resume');

  //     const uploadResult = await uploadResponse.json();
  //     console.log("Resume upload successful:", uploadResult);

  //     // Save the public URL
  //     setResumePublicUrl(uploadResult.public_url);

  //     // Step 4: Move to next tab
  //     goNext();

  //   } catch (err) {
  //     alert('Error: ' + err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleContinue = async () => {
  if (!resumeFile) {
    alert("Please select a file");
    return;
  }

  setLoading(true);

  try {
    // Step 1: Parse resume
    const parseFormData = new FormData();
    parseFormData.append("resume", resumeFile);
    const parseResponse = await apiService.parseResume(parseFormData);
    const parsedData = parseResponse?.data || parseResponse;
    // console.log("Parsed resume:", parsedData);

    setParsedData(parsedData);

    // Step 2: Register candidate
    const encryptedPassword = encryptPassword("Sagrsoft@123");

    const registerResponse = await apiService.candidateRegister({
      name: parsedData.name || "",
      email: parsedData.email || "",
      mobile: 9999999999,
      password: encryptedPassword,
    });
    const registerResult = registerResponse?.data || registerResponse;
    // console.log("Candidate registered:", registerResult);

    const candidateId = registerResult?.candidate_id;
    if (!candidateId) throw new Error("Candidate registration did not return candidate_id");
    dispatch(setCandidate(candidateId));

    // Step 3: Upload resume
    const uploadFormData = new FormData();
    uploadFormData.append("resumeFile", resumeFile);
    uploadFormData.append("candidateId", candidateId);

    const uploadResponse = await apiService.uploadResume(uploadFormData);
    const uploadResult = uploadResponse?.data || uploadResponse;
    // console.log("Resume upload successful:", uploadResult);

    if (!uploadResult?.public_url) {
      throw new Error("Upload API did not return a valid public_url");
    }
    setResumePublicUrl(uploadResult.public_url);

    // Step 4: Next tab
    goNext();
  } catch (err) {
    alert("Error: " + (err.response?.data?.error || err.message));
    console.error("Resume process error:", err);
  } finally {
    setLoading(false);
  }
};





  return (
    <div className="form-content-section text-center">
      {/* <h2 style={{fontSize:'16px'}}>Upload Resume</h2> */}
      <p style={{fontSize:'13px'}}>Resume/CV* (Supported format: .docx/.pdf; Max size: 4.5 MB)</p>

      {/* Show existing resume if available */}
      {resumePublicUrl && (
        <div className="existing-resume mb-4">
          <p>You have already uploaded a resume:</p>
          <a
            href={resumePublicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-link"
          >
            <i className="ph-light ph-file-text me-2"></i>View Current Resume
          </a>
        </div>
      )}

      {/* Keep the existing upload UI as is */}
      <div className="dropzone" onClick={handleBrowseClick}>
        <i className="ph-light ph-upload-simple"></i>
        <div className="dropzone-text">
          {resumePublicUrl ? (
            <>
              <span style={{fontSize:'14px'}}>Click here to upload your resume or{' '}</span>
              <span style={{ color: '#ff7043', cursor: 'pointer' }}>
                <b>Browse to Upload</b>
              </span>
            </>
          ) : (
            <>
              <span style={{fontSize:'14px'}}>Click here to upload your resume or{' '}</span>
              <span style={{ color: '#ff7043', cursor: 'pointer' }}>
               <b>Browse to Upload</b>
              </span>
            </>
          )}
        </div>
        <input
          type="file"
          id="resume-input"
          accept=".pdf,.doc,.docx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {fileName && <div className="mt-2 filename">{fileName}</div>}
      </div>

      <div className="mt-4">
        <button
          className="btn btn-primary"
          style={{
            backgroundColor: '#ff7043',
            color: '#fff',
            border: 'none',
            padding: '8px 24px',
            borderRadius: '4px'
          }}
          onClick={handleContinue}
          disabled={!resumeFile && !resumePublicUrl}
        >
          {loading ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default ResumeUpload;