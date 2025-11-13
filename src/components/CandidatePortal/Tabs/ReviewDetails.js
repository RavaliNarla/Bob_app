import React, { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
import '../../../css/review_details.css';
import Tesseract from 'tesseract.js';
const ReviewDetails = ({ initialData = {}, onSubmit ,resumePublicUrl, selectedPositionId, onSubmitSuccess }) => {
  const [formData, setFormData] = useState(initialData);
  const user = useSelector((state) => state.user.user);
  const candidateId = useSelector((state) => state.user.candidateId)
  //  console.log("Redux user state:", candidateId);
  // const candidateId = user?.candidate_id;
  // console.log('selectedPositionId: ', selectedPositionId)


   const [selectedIdProof, setSelectedIdProof] = useState('');
  const [idProofFile, setIdProofFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
    const [dobError, setDobError] = useState("");
  const [aadharDob, setAadharDob] = useState(""); 
   // Sync formData and selectedIdProof with initialData
  useEffect(() => {
    // console.log( 'initialData',initialData )
    setFormData(initialData);
    setSelectedIdProof(initialData.id_proof || '');
    setDocumentUrl(initialData.document_url || '');
  }, [initialData]);

  const [masterData, setMasterData] = useState({
    countries: [],
    specialCategories: [],
    reservationCategories: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch master data on component mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const response = await apiService.getMasterData();
        setMasterData({
          countries: response.countries || [],
          specialCategories: response.special_categories || [],
          reservationCategories: response.reservation_categories || []
        });
      } catch (error) {
        console.error('Error fetching master data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMasterData();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) {
      toast.info("Please wait until your Aadhaar is processed.");
      return;
    }
      // Aadhaar DOB validation at submission
      if (selectedIdProof === 'Aadhar' || selectedIdProof === 'PAN') {
        // Ensure file is uploaded and OCR processed
        if (!idProofFile || !aadharDob) {
          setDobError("Dob verification incomplete. Please upload a valid Id Proof.");
          return;
        }
      
        if (formData.dob) {
          const formDob = new Date(formData.dob).toISOString().split('T')[0];
          if (formDob !== aadharDob) {
            setDobError(`DOB mismatch! Aadhaar shows: ${aadharDob.split('-').reverse().join('/')}`);
            return;
          }
        }
      }
      
    if (dobError) {
      toast.error("Please correct your Date of Birth before submitting.");
      return; // Stop submission
    }
    try {
      const candidatePayload = {
        candidate_id: candidateId,
        file_url: resumePublicUrl,
        document_url: documentUrl,
        full_name: formData.name || '',
        email: formData.email || '',
        gender: formData.gender || 'Male',
        id_proof: formData.id_proof || '',
        phone: formData.phone || '',
        date_of_birth: formData.dob || '',
        skills: formData.skills || '',
        total_experience: formData.totalExperience || 0,
        current_designation: formData.currentDesignation || '',
        current_employer: formData.currentEmployer || '',
        address: formData.address || '',
        nationality_id: formData.nationality_id || '',
        education_qualification: formData.education_qualification || ''
      };
        // console.log("candidatePayload",candidatePayload);

      const response = await apiService.updateCandidates(candidatePayload);
      toast.success('Candidate data updated successfully!');
      onSubmit(formData);
     const applyjob = await apiService.applyJobs({
        position_id: selectedPositionId,
        candidate_id: candidateId,
      });
      // console.log('applyjob' , applyjob);
      if (onSubmitSuccess) {
        onSubmitSuccess();  // 👈 This will tell parent to close modal
      }
      if (onSubmitSuccess) {
      onSubmitSuccess();
    }
    } catch (error) {
      console.error('Error submitting candidate data:', error);
      alert('Failed to submit candidate data: ' + error.message);
    }
  };
  const handleIdProofChange = (e) => {
    const value = e.target.value;
    setSelectedIdProof(value);
    setFormData(prev => ({ ...prev, id_proof: value }));
    setIdProofFile(null);
  };

  const extractDOBFromAadhar = async (file) => {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m),
      });

      // console.log("Extracted text:", text);

      // Step 1: Find DOB near "DOB"
      let extractedDob = "";
      const dobLine = text.split("\n").find((line) =>
        line.toUpperCase().includes("DOB")
      );

      if (dobLine) {
        const match = dobLine.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (match) extractedDob = match[1];
      }

      // Step 2: If not found, check whole text
      if (!extractedDob) {
        const match = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (match) extractedDob = match[1];
      }

      // Step 3: As fallback, check just for year
      if (!extractedDob) {
        const match = text.match(/\b(19|20)\d{2}\b/);
        if (match) extractedDob = match[0];
      }

      if (!extractedDob) return null;

      // Normalize to YYYY-MM-DD if it's full date
      if (extractedDob.includes("/") || extractedDob.includes("-")) {
        const [d, m, y] = extractedDob.split(/[-/]/);
        return `${y.length === 2 ? '20' + y : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }

      return extractedDob; // Only year (e.g., "1998")
    } catch (error) {
      console.error('Error extracting DOB from Aadhaar:', error);
      throw new Error('Failed to extract DOB from Aadhaar');
    }
  };
  const handleDocumentUpload = async (file) => {
    // console.log("file1111111111",file);
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('docFile', file);
      formData.append('candidateId', candidateId);

      const uploadResponse = await fetch('https://bobbe.sentrifugo.com/api/uploaddoc/uploaddoc', {
        method: 'POST',
        body: formData,
      });
    // console.log("uploadResponse",uploadResponse);
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload resume');
      }

      const uploadResult = await uploadResponse.json();
      // console.log('Resume upload successful:', uploadResult);
     // toast.success('Document uploaded successfully!');
     setDocumentUrl(uploadResult.public_url);
      }
     catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document. Please try again.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setIsUploading(true);
    setDobError("");
    setIdProofFile(file); // <-- set file immediately here (not at the end)
  
    try {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid file (PDF, JPG, or PNG)');
        setIdProofFile(null);
        return;
      }
  
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        setIdProofFile(null);
        return;
      }
      await handleDocumentUpload(file);
      if (selectedIdProof === 'Aadhar' || selectedIdProof === 'PAN') {
      //  toast.info('Processing Aadhaar card...');
      
        const extractedDOB = await extractDOBFromAadhar(file);
  
        if (extractedDOB) {
          setAadharDob(extractedDOB);
          
          if (!formData.dob) {
            setFormData(prev => ({ ...prev, dob: extractedDOB }));
            toast.success(`DOB auto-filled from Aadhaar: ${extractedDOB.split('-').reverse().join('/')}`);
          } else {
            const formDob = new Date(formData.dob).toISOString().split('T')[0];
            if (extractedDOB !== formDob) {
              setDobError(`DOB mismatch! Aadhaar shows: ${extractedDOB.split('-').reverse().join('/')}`);
              return;
            }
           // toast.success('Aadhaar verified successfully!');
           

          }
         
        } else {
          toast.error("Could not extract DOB from Aadhaar. Please upload a clear image.");
        }
      }
      

    } catch (error) {
      console.error('Error handling file upload:', error);
      toast.error('Error processing file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!formData) {
    return <p>Loading details...</p>; // fallback UI
  }

  return (
    <div className="form-content-section text-start spaceform">
      <form className="row g-4" onSubmit={handleSubmit}>
        <div className="col-md-3  p-2 review_input">
          <label htmlFor="name" className="form-label ">Name *</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-3">
          <label htmlFor="dob" className="form-label">Date of Birth <span className="text-danger">*</span></label>
          <input
            type="date"
            className={`form-control ${dobError ? 'is-invalid' : ''}`}
            id="dob"
            value={formData.dob || ''}
            onChange={(e) => {
              handleChange(e);
              if (dobError) setDobError(""); // Clear error when user edits DOB
            }}
            required
          />
          {dobError && (
            <div className="text-danger mt-1">
              {dobError}
            </div>
          )}
        </div>

        <div className="col-md-3 p-2 review_input" >
          <label htmlFor="email" className="form-label ">Email *</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={formData.email || ''}   // ✅ use resume/entered email
            onChange={handleChange}
            disabled
            required
          />
        </div>

        <div className="col-md-3 p-2 review_input">
          <label htmlFor="gender" className="form-label ">Gender *</label>
          <select
            className="form-select"
            id="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

       

        <div className="col-md-3 p-2 review_input">
          <label htmlFor="phone" className="form-label ">Phone *</label>
          <input
            type="text"
            className="form-control"
            id="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-3 p-2 review_input">
          <label htmlFor="education_qualification" className="form-label ">Education Qualification *</label>
          <input
            type="text"
            className="form-control"
            id="education_qualification"
            value={formData.education_qualification || ''}
            onChange={handleChange}
            required
          />
        </div>
<div className="col-md-3 p-2 review_input">
          <label htmlFor="nationality_id" className="form-label ">Nationality *</label>
          <select
            className="form-select"
            id="nationality_id"
            value={formData.nationality_id || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select Nationality</option>
            {masterData.countries.map(country => (
              <option key={country.country_id} value={country.country_id}>
                {country.country_name}
              </option>
            ))}
          </select>
        </div>
        

        <div className="col-md-3 p-2 review_input" >
          <label htmlFor="totalExperience" className="form-label ">Total Experience</label>
          <input
            type="text"
            className="form-control"
            id="totalExperience"
            value={formData.totalExperience || ''}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-3 p-2 review_input">
          <label htmlFor="currentDesignation" className="form-label ">Current Designation</label>
          <input
            type="text"
            className="form-control"
            id="currentDesignation"
            value={formData.currentDesignation || ''}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-3 p-2 review_input">
          <label htmlFor="currentEmployer" className="form-label ">Current Employer</label>
          <input
            type="text"
            className="form-control"
            id="currentEmployer"
            value={formData.currentEmployer || ''}
            onChange={handleChange}
          />
        </div>
<div className="col-md-3 p-2 review_input">
          <label htmlFor="skills" className="form-label ">Skills</label>
          <textarea
            className="form-control"
            id="skills"
            rows="3"
            value={formData.skills || ''}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3 p-2 review_input">
          <label htmlFor="address" className="form-label ">Address</label>
          <textarea
            className="form-control"
            id="address"
            rows="3"
            value={formData.address || ''}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="id_proof" className="form-label">ID Proof</label>
          <select className="form-select mb-2" id="id_proof" value={selectedIdProof} onChange={handleIdProofChange}>
            <option value="">Select ID Proof</option>
            <option value="Aadhar">Aadhar</option>
            <option value="PAN">PAN</option>
          </select>

          
        </div>
        <div className="col-md-3">
  

          {selectedIdProof && (
            // console.log("selectedIdProof",selectedIdProof),
            <div className="">
              <label htmlFor="id_proof_file" className="form-label">
                Upload {selectedIdProof} Card {isUploading && <span className="spinner-border spinner-border-sm ms-2"></span>}
                <span className="text-danger">*</span>
              </label>
              <input
                type="file"
                className={`form-control ${isUploading ? 'opacity-50' : ''}`}
                id="id_proof_file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required={!idProofFile && !documentUrl}  // <-- updated condition
                disabled={isUploading}
                
              />
              

              {idProofFile ? (
                <div className="mt-2 text-success">
                  <i className="bi bi-check-circle-fill me-1"></i>
                  {idProofFile.name} ({(idProofFile.size / 1024).toFixed(2)} KB)
                </div>
              ) : documentUrl ? ( // <-- if document already exists
                <div className="mt-2">
                  <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-link p-0">
                    <i className="bi bi-download me-2"></i> Download Document
                  </a>
                </div>
              ) : (
                <div className="form-text">
                  {selectedIdProof === 'Aadhar'
                    ? 'Upload a clear image of your Aadhaar card (Front side with DOB visible)'
                    : 'Upload your PAN card (PDF, JPG, or PNG, max 5MB)'}
                </div>
              )}
            </div>
          )}
        </div>
        

        

        <div className="col-12">
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              backgroundColor: 'rgb(255, 112, 67)',
              color: 'white',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewDetails;
