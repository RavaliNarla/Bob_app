import React, { useState, useEffect, useRef } from 'react';
import { JobCreationApiService } from '../services/JobCreationApiService';
import { useLanguage } from '../context/LanguageContext';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileAlt, faCircle, faCheckCircle, faCheck } from '@fortawesome/free-solid-svg-icons';
import { apiService } from '../services/apiService';
import * as XLSX from 'xlsx';
import { jobSchema } from './../components/validationSchema'; 

const JobCreation = () => {
  // Ref for file input
  const fileInputRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState('upload');
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [gradeOptions, setGradeOptions] = useState([]);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState(null);
  const [jobTitleOptions, setJobTitleOptions] = useState([]);
  const [jobTitleLoading, setJobTitleLoading] = useState(false);
  const [jobTitleError, setJobTitleError] = useState(null);
  // New state for location, job type, caste
  const [locationOptions, setLocationOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [jobTypeOptions, setJobTypeOptions] = useState([]);
  const [jobTypeLoading, setJobTypeLoading] = useState(false);
  const [jobTypeError, setJobTypeError] = useState(null);
  const [casteOptions, setCasteOptions] = useState([]);
  const [casteLoading, setCasteLoading] = useState(false);
  const [casteError, setCasteError] = useState(null);
  // New state for work experience, education qualification, relaxation policy, priority, no of positions
  const [workExperienceOptions, setWorkExperienceOptions] = useState([]);
  const [workExperienceLoading, setWorkExperienceLoading] = useState(false);
  const [workExperienceError, setWorkExperienceError] = useState(null);
  const [educationQualificationOptions, setEducationQualificationOptions] = useState([]);
  const [educationQualificationLoading, setEducationQualificationLoading] = useState(false);
  const [educationQualificationError, setEducationQualificationError] = useState(null);
  const [relaxationPolicyOptions, setRelaxationPolicyOptions] = useState([]);
  const [relaxationPolicyLoading, setRelaxationPolicyLoading] = useState(false);
  const [relaxationPolicyError, setRelaxationPolicyError] = useState(null);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [priorityError, setPriorityError] = useState(null);
  const [noOfPositionsOptions, setNoOfPositionsOptions] = useState([]);
  const [noOfPositionsLoading, setNoOfPositionsLoading] = useState(false);
  const [noOfPositionsError, setNoOfPositionsError] = useState(null);
  const [jsonData, setJsonData] = useState([]);

  useEffect(() => {
    // Fetch work experience options
    setWorkExperienceLoading(true);
    setWorkExperienceError(null);
    JobCreationApiService.getWorkExperienceData && JobCreationApiService.getWorkExperienceData()
      .then((data) => {
        setWorkExperienceOptions(Array.isArray(data) ? data : []);
        setWorkExperienceLoading(false);
      })
      .catch((err) => {
        setWorkExperienceError('Failed to load work experience');
        setWorkExperienceLoading(false);
      });
  
    // Fetch education qualification options
    setEducationQualificationLoading(true);
    setEducationQualificationError(null);
    JobCreationApiService.getEducationalQualificationData && JobCreationApiService.getEducationalQualificationData()
      .then((data) => {
        setEducationQualificationOptions(Array.isArray(data) ? data : []);
        setEducationQualificationLoading(false);
      })
      .catch((err) => {
        setEducationQualificationError('Failed to load education qualifications');
        setEducationQualificationLoading(false);
      });
  
    // Fetch relaxation policy options
    setRelaxationPolicyLoading(true);
    setRelaxationPolicyError(null);
    JobCreationApiService.getRelaxationPolicyData && JobCreationApiService.getRelaxationPolicyData()
      .then((data) => {
        setRelaxationPolicyOptions(Array.isArray(data) ? data : []);
        setRelaxationPolicyLoading(false);
      })
      .catch((err) => {
        setRelaxationPolicyError('Failed to load relaxation policies');
        setRelaxationPolicyLoading(false);
      });
  
    // Fetch priority options
    setPriorityLoading(true);
    setPriorityError(null);
    JobCreationApiService.getPriorityData && JobCreationApiService.getPriorityData()
      .then((data) => {
        setPriorityOptions(Array.isArray(data) ? data : []);
        setPriorityLoading(false);
      })
      .catch((err) => {
        setPriorityError('Failed to load priorities');
        setPriorityLoading(false);
      });
  
    // Fetch no of positions options
    setNoOfPositionsLoading(true);
    setNoOfPositionsError(null);
    JobCreationApiService.getNoOfPositionsData && JobCreationApiService.getNoOfPositionsData()
      .then((data) => {
        setNoOfPositionsOptions(Array.isArray(data) ? data : []);
        setNoOfPositionsLoading(false);
      })
      .catch((err) => {
        setNoOfPositionsError('Failed to load no of positions');
        setNoOfPositionsLoading(false);
      });
    setGradeLoading(true);
    setGradeError(null);
    JobCreationApiService.getGradeData()
      .then((data) => {
        setGradeOptions(Array.isArray(data) ? data : []);
        setGradeLoading(false);
      })
      .catch((err) => {
        setGradeError('Failed to load grades');
        setGradeLoading(false);
      });
  
    setJobTitleLoading(true);
    setJobTitleError(null);
    JobCreationApiService.getJobTitleData()
      .then((data) => {
        setJobTitleOptions(Array.isArray(data) ? data : []);
        setJobTitleLoading(false);
      })
      .catch((err) => {
        setJobTitleError('Failed to load job titles');
        setJobTitleLoading(false);
      });
  
    // Fetch location options
    setLocationLoading(true);
    setLocationError(null);
    JobCreationApiService.getLocationData()
      .then((data) => {
        setLocationOptions(Array.isArray(data) ? data : []);
        setLocationLoading(false);
      })
      .catch((err) => {
        setLocationError('Failed to load locations');
        setLocationLoading(false);
      });
  
    // Fetch job type options
    setJobTypeLoading(true);
    setJobTypeError(null);
    JobCreationApiService.getJobTypeData()
      .then((data) => {
        setJobTypeOptions(Array.isArray(data) ? data : []);
        setJobTypeLoading(false);
      })
      .catch((err) => {
        setJobTypeError('Failed to load job types');
        setJobTypeLoading(false);
      });
  
    // Fetch caste options
    setCasteLoading(true);
    setCasteError(null);
    JobCreationApiService.getCasteData()
      .then((data) => {
        setCasteOptions(Array.isArray(data) ? data : []);
        setCasteLoading(false);
      })
      .catch((err) => {
        setCasteError('Failed to load castes');
        setCasteLoading(false);
      });
  }, []);
  const fieldLabels = {
    en: {
      bussiness_unit: 'Business Unit *',
      grade: 'Grade *',
      job_title: 'Job Title *',
      budget: 'Budget *',
      job_start_date: 'Job Start Date *',
      job_end_date: 'Job End Date *',
      required_hours: 'Required Hours *',
      interview_mode: 'Interview Mode *',
      domain: 'Domain *',
      client: 'Client *',
      priority: 'Priority *',
      location: 'Location *',
      job_type: 'Job Type *',
      age: 'Age * (5 Yrs age relaxation for SC, ST & BC)',
      caste: 'Caste *',
      work_experience: 'Experience *',
      no_of_positions: 'No of Positions *',
      education_qualification: 'Educational Qualification *',
      relaxation_policy: 'Relaxation Policy *',
    },
    hi: {
      bussiness_unit: 'व्यावसायिक इकाई *',
      grade: 'ग्रेड *',
      job_title: 'नौकरी का शीर्षक *',
      budget: 'बजट *',
      job_start_date: 'नौकरी प्रारंभ तिथि *',
      job_end_date: 'नौकरी समाप्ति तिथि *',
      required_hours: 'आवश्यक घंटे *',
      interview_mode: 'साक्षात्कार मोड *',
      domain: 'डोमेन *',
      client: 'क्लाइंट *',
      priority: 'प्राथमिकता *',
      location: 'स्थान *',
      job_type: 'नौकरी का प्रकार *',
      age: 'आयु * (SC, ST & BC के लिए 5 वर्ष की छूट)',
      caste: 'जाति *',
      work_experience: 'अनुभव *',
      no_of_positions: 'पदों की संख्या *',
      education_qualification: 'शैक्षिक योग्यता *',
      relaxation_policy: 'छूट नीति *',
    }
  };
  const [lang, setLang] = useState('en');
  const handleFileChange = (e) => {
    const newErrors = {};
    const selectedFiles = Array.from(e.target.files);
    const validExtensions = ['.xls', '.xlsx'];

    const validFiles = selectedFiles.filter(file => {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      return validExtensions.includes(ext);
    });

    if (validFiles.length !== selectedFiles.length) {
      newErrors.file = "Only Excel files (.xls, .xlsx) are allowed.";
    } else {
      delete newErrors.file;
    }
    setErrors(newErrors);
    setFiles([...files, ...validFiles]);
    // Call readExcel for each valid file
    validFiles.forEach(file => {
      console.log('Calling readExcel for uploaded file:', file.name);
      readExcel(file);
    });
  };
  const [formData, setFormData] = useState({
    bussiness_unit: '',
    grade: '',
    job_title: '',
    budget: '',
    job_start_date: '',
    job_end_date: '',
    required_hours: '',
    interview_mode: '',
    domain: '',
    client: '',
    priority: '',
    location: '',
    job_type: '',
    age: '',
    caste: '',
    work_experience: '',
    no_of_positions: '',
    education_qualification: '',
    relaxation_policy: ''
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleDrop = (e) => {
    e.preventDefault();
    console.log('handleDrop called');
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
      // Optionally, call readExcel for each file (if you want to validate immediately)
      droppedFiles.forEach(file => {
        console.log('Calling readExcel for dropped file:', file.name);
        readExcel(file);
      });
    }
  };

  const readExcel = async (file) => {
    console.log('readExcel called for:', file.name);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      const validRows = [];
      const errorList = [];

      for (let i = 0; i < rows.length; i++) {
        try {
          const validated = await jobSchema.validate(rows[i], { abortEarly: false });
          validRows.push(validated);
        } catch (err) {
          errorList.push({
            row: i + 2, // Excel row (account for header)
            messages: err.errors,
          });
        }
      }
      setErrors(errorList);
      setJsonData(validRows); // Store valid rows for later submit
    };

    reader.readAsArrayBuffer(file); // ✅ Modern replacement
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      console.log('Valid form:', JSON.stringify(formData));
      // Call your backend API here
      apiService.createJobPost(formData)
        .then((res) => {
          alert("Job post submitted successfully!");
        })
        .catch((err) => {
          console.error("Error submitting job post", err);
        });
    } else {
      // Always log validation errors immediately
      console.log('Validation errors:', validationErrors);
      setErrors(validationErrors);
      // Optionally scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField) {
        const el = document.getElementsByName(firstErrorField)[0];
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  const handleCancel = () => {
    // Reset form and errors
    setFormData({
      bussiness_unit: '',
      grade: '',
      job_title: '',
      budget: '',
      job_start_date: '',
      job_end_date: '',
      required_hours: '',
      interview_mode: '',
      domain: '',
      client: '',
      priority: '',
      location: '',
      job_type: '',
      age: '',
      caste: '',
      work_experience: '',
      no_of_positions: '',
      education_qualification: '',
      relaxation_policy: ''
    });
    setErrors({});
  };
  const validateForm = () => {
    const newErrors = {};
  
    if (!formData.bussiness_unit.trim()) newErrors.bussiness_unit = 'Business Unit is required';
    if (!formData.grade.trim()) newErrors.grade = 'Please select a grade from the list';
    if (!formData.job_title.trim()) newErrors.job_title = 'Please select a job title from the list';
  
    if (!formData.budget.trim()) newErrors.budget = 'Budget is required';
    else if (!/^\d+(,\d+)?/.test(formData.budget)) newErrors.budget = 'Invalid budget format';
  
    if (!formData.job_start_date) newErrors.job_start_date = 'Start date is required';
    if (!formData.job_end_date) {
      newErrors.job_end_date = 'Job end date is required';
    } else if (formData.job_start_date && formData.job_end_date < formData.job_start_date) {
      newErrors.job_end_date = 'End date cannot be before start date';
    }
  
    if (!formData.required_hours) newErrors.required_hours = 'Required hours is required';
    else if (isNaN(formData.required_hours)) newErrors.required_hours = 'Must be a number';
  
    if (!formData.age.trim()) newErrors.age = 'Age is required';
    else if (!/^\d{1,2}/.test(formData.age)) newErrors.age = 'Invalid age';
  
    // For dropdowns, show a user-friendly message if not selected
    if (!formData.no_of_positions) newErrors.no_of_positions = 'Please select the number of positions from the list';
    if (!formData.priority) newErrors.priority = 'Please select a priority from the list';
    if (!formData.location) newErrors.location = 'Please select a location from the list';
    if (!formData.job_type) newErrors.job_type = 'Please select a job type from the list';
    if (!formData.caste) newErrors.caste = 'Please select a caste from the list';
    if (!formData.work_experience) newErrors.work_experience = 'Please select work experience from the list';
    if (!formData.education_qualification) newErrors.education_qualification = 'Please select an education qualification from the list';
    if (!formData.relaxation_policy) newErrors.relaxation_policy = 'Please select a relaxation policy from the list';
  
    // For text fields
    if (!formData.interview_mode) newErrors.interview_mode = 'Interview mode is required';
    if (!formData.domain) newErrors.domain = 'Domain is required';
    if (!formData.client) newErrors.client = 'Client is required';
  
    return newErrors;
  };
  const handleUploadSubmit = async () => {
    if (files.length === 0) {
      setErrors(prev => ({ ...prev, file: "Please upload at least one Excel file." }));
      return;
    }
    if (errors && Array.isArray(errors) && errors.length > 0) {
      alert("Please fix validation errors before submitting.");
      return;
    }
    if (!jsonData || jsonData.length === 0) {
      alert("No valid data to submit.");
      return;
    }
    try {
      // Replace with your actual API endpoint if different
      console.log('Posting JSON data:', jsonData);
      const response = await apiService.createJobPost(jsonData);
      alert("Excel data posted successfully!");
      setFiles([]);
      setJsonData([]);
    } catch (error) {
      alert("Failed to post Excel data.");
      console.error("Error posting Excel data:", error);
    }
  };
  return (
    <Container fluid className="py-5">
    <Row className="justify-content-center">
      <Col xs={12} md={10} lg={8}>
        <div className="p-4">

          {/* Toggle Buttons */}
          <div className="mb-4 d-flex gap-3 align-items-center justify-content-center flex-wrap">
            <div
              onClick={() => setSelectedOption('upload')}
              className={`px-4 py-3 rounded-pill d-flex align-items-center justify-content-center ${selectedOption === 'upload' ? 'border border-2' : ''}`}
              style={{
                minWidth: '280px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #FF7043',
                cursor: 'pointer'
              }}
            >
              <div className="position-relative me-3">
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: selectedOption === 'upload' ? '#FF7043' : '#FFFFFF',
                  border: '2px solid #FF7043',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedOption === 'upload' && (
                    <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px', color: '#FFF' }} />
                  )}
                </div>
              </div>
              <span style={{
                color: selectedOption === 'upload' ? '#212121' : '#757575',
                fontWeight: selectedOption === 'upload' ? '600' : '400',
                fontSize: '14px'
              }}>
                Upload Recruitment Request Document(s)
              </span>
            </div>

            <div
              onClick={() => setSelectedOption('direct')}
              className={`px-4 py-3 rounded-pill d-flex align-items-center justify-content-center ${selectedOption === 'direct' ? 'border border-2' : ''}`}
              style={{
                minWidth: '280px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #FF7043',
                cursor: 'pointer'
              }}
            >
              <div className="position-relative me-3">
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: selectedOption === 'direct' ? '#FF7043' : '#FFFFFF',
                  border: '2px solid #FF7043',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedOption === 'direct' && (
                    <FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px', color: '#FFF' }} />
                  )}
                </div>
              </div>
              <span style={{
                color: selectedOption === 'direct' ? '#212121' : '#757575',
                fontWeight: selectedOption === 'direct' ? '600' : '400',
                fontSize: '14px'
              }}>
                Go to Job Requisition Form
              </span>
            </div>
          </div>

          {/* Upload Section */}
          {selectedOption === 'upload' && (
            <div className="upload-section">
              <a href="/JobRequisitionTemplate.xlsx" download className="btn btn-outline-primary mb-3">
                Export Excel Format
              </a>
              <div
                className="border rounded p-5 text-center mb-3"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  borderStyle: 'dashed',
                  backgroundColor: 'rgb(255, 231, 222)',
                  cursor: 'pointer',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FontAwesomeIcon icon={faUpload} size="3x" className="mb-3 text-muted" />
                <h5>Drag and drop your files here</h5>
                <p className="text-muted">or click to browse files</p>
              </div>
              {/* Hidden file input outside drop area */}
              <Form.Control
                type="file"
                id="file-upload"
                className="d-none"
                onChange={handleFileChange}
                ref={fileInputRef}
              />

              {errors.file && <small className="error d-block mb-2">{errors.file}</small>}

              {files.length > 0 && (
                <div className="mb-3">
                  <h6>Selected Files:</h6>
                  <ul className="list-unstyled">
                    {files.map((file, index) => (
                      <li key={index} className="d-flex align-items-center justify-content-between">
                        <span><FontAwesomeIcon icon={faFileAlt} className="me-2 text-muted" /> {file.name}</span>
                        <button className="btn btn-sm btn-danger ms-2" onClick={() => removeFile(index)}>✕</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                onClick={handleUploadSubmit}
                className="text-white fw-semibold"
                style={{ backgroundColor: '#FF7043', borderColor: '#FF7043', minWidth: '250px' }}
              >
                Submit
              </Button>
                    {/* <hr /> */}

      {/* <h4>Validation Errors</h4> */}
      {errors.length > 0 ? (
        <ul style={{ color: 'red' }}>
          {errors.map((err, i) => (
            <li key={i}>
              Row {err.row}
              <ul>
                {err.messages.map((msg, j) => (
                  <li key={j}>{msg}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
         <p></p>
      )}

      {/*
      <h4 className="mt-4">Valid JSON Output</h4>
      {jsonData.length > 0 ? (
        <pre>{JSON.stringify(jsonData, null, 2)}</pre>
      ) : (
        <p>No valid data yet</p>
      )}
      */}
            </div>



          )}

          {/* Form Section */}
          {selectedOption === 'direct' && (
            <div className="form-section mt-4">
            <h4 className="mb-4">Job Requisition Form</h4>
            <form className="job-form" onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Business Unit */}
                <div className="col-md-6">
                  <label htmlFor="bussiness_unit" className="form-label">{fieldLabels[lang].bussiness_unit}</label>
                  <input type="text" className="form-control" id="bussiness_unit" name="bussiness_unit" value={formData.bussiness_unit} onChange={handleInputChange} placeholder="Bank of Telangana" />
                  {errors.bussiness_unit && <small className="error">{errors.bussiness_unit}</small>}
                </div>
          
                {/* Grade */}
                <div className="col-md-6">
                  <label htmlFor="grade" className="form-label">{fieldLabels[lang].grade}</label>
                  <select id="grade" name="grade" className="form-select" value={formData.grade} onChange={handleInputChange} disabled={gradeLoading}>
                    <option value="">{gradeLoading ? 'Loading grades...' : 'Select Grade'}</option>
                    {gradeOptions.map((option, idx) => (
                      <option key={option.JobGradeID || idx} value={option.JobGradeID}>{option.GradeName}</option>
                    ))}
                  </select>
                  {gradeError && <small className="error">{gradeError}</small>}
                  {errors.grade && <small className="error">{errors.grade}</small>}
                </div>
          
                {/* Job Title */}
                <div className="col-md-6">
                  <label htmlFor="job_title" className="form-label">{fieldLabels[lang].job_title}</label>
                  <select id="job_title" name="job_title" className="form-select" value={formData.job_title} onChange={handleInputChange} disabled={jobTitleLoading}>
                    <option value="">{jobTitleLoading ? 'Loading job titles...' : 'Select Job Title'}</option>
                    {jobTitleOptions.map((option, idx) => (
                      <option key={option.JobTitleID || idx} value={option.JobTitleName}>{option.JobTitleName}</option>
                    ))}
                  </select>
                  {jobTitleError && <small className="error">{jobTitleError}</small>}
                  {errors.job_title && <small className="error">{errors.job_title}</small>}
                </div>
          
                {/* Budget */}
                <div className="col-md-6">
                  <label htmlFor="budget" className="form-label">{fieldLabels[lang].budget}</label>
                  <input type="text" className="form-control" id="budget" name="budget" value={formData.budget} onChange={handleInputChange} />
                  {errors.budget && <small className="error">{errors.budget}</small>}
                </div>
          
                {/* Job Start Date */}
                <div className="col-md-6">
                  <label htmlFor="job_start_date" className="form-label">{fieldLabels[lang].job_start_date}</label>
                  <input type="date" className="form-control" id="job_start_date" name="job_start_date" value={formData.job_start_date} onChange={handleInputChange} />
                  {errors.job_start_date && <small className="error">{errors.job_start_date}</small>}
                </div>
          
                {/* Job End Date */}
                <div className="col-md-6">
                  <label htmlFor="job_end_date" className="form-label">{fieldLabels[lang].job_end_date}</label>
                  <input type="date" className="form-control" id="job_end_date" name="job_end_date" value={formData.job_end_date} onChange={handleInputChange} />
                  {errors.job_end_date && <small className="error">{errors.job_end_date}</small>}
                </div>
          
                {/* Required Hours */}
                <div className="col-md-6">
                  <label htmlFor="required_hours" className="form-label">{fieldLabels[lang].required_hours}</label>
                  <input type="text" className="form-control" id="required_hours" name="required_hours" value={formData.required_hours} onChange={handleInputChange} />
                  {errors.required_hours && <small className="error">{errors.required_hours}</small>}
                </div>
          
                {/* Interview Mode */}
                <div className="col-md-6">
                  <label htmlFor="interview_mode" className="form-label">{fieldLabels[lang].interview_mode}</label>
                  <select id="interview_mode" name="interview_mode" className="form-select" value={formData.interview_mode} onChange={handleInputChange}>
                    <option value="">Select Interview Mode</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                  {errors.interview_mode && <small className="error">{errors.interview_mode}</small>}
                </div>
          
                {/* Domain */}
                <div className="col-md-6">
                  <label htmlFor="domain" className="form-label">{fieldLabels[lang].domain}</label>
                  <input type="text" className="form-control" id="domain" name="domain" value={formData.domain} onChange={handleInputChange} />
                  {errors.domain && <small className="error">{errors.domain}</small>}
                </div>
          
                {/* Client */}
                <div className="col-md-6">
                  <label htmlFor="client" className="form-label">{fieldLabels[lang].client}</label>
                  <input type="text" className="form-control" id="client" name="client" value={formData.client} onChange={handleInputChange} />
                  {errors.client && <small className="error">{errors.client}</small>}
                </div>
          
                {/* Priority */}
                <div className="col-md-6">
                  <label htmlFor="priority" className="form-label">{fieldLabels[lang].priority}</label>
                  <select id="priority" name="priority" className="form-select" value={formData.priority} onChange={handleInputChange}>
                    <option value="">Select Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  {errors.priority && <small className="error">{errors.priority}</small>}
                </div>
          
                {/* Location */}
                <div className="col-md-6">
                  <label htmlFor="location" className="form-label">{fieldLabels[lang].location}</label>
                  <select 
                    id="location" 
                    name="location" 
                    className="form-select" 
                    value={formData.location} 
                    onChange={handleInputChange}
                    disabled={locationLoading}
                  >
                    <option value="">{locationLoading ? 'Loading locations...' : 'Select Location'}</option>
                    {locationOptions.map((option, idx) => (
                      <option key={option.LocationID || idx} value={option.LocationName}>
                        {option.LocationName}
                      </option>
                    ))}
                  </select>
                  {locationError && <small className="error">{locationError}</small>}
                  {errors.location && <small className="error">{errors.location}</small>}
                </div>
          
                {/* Job Type */}
                <div className="col-md-6">
                  <label htmlFor="job_type" className="form-label">{fieldLabels[lang].job_type}</label>
                  <select 
                    id="job_type" 
                    name="job_type" 
                    className="form-select" 
                    value={formData.job_type} 
                    onChange={handleInputChange}
                    disabled={jobTypeLoading}
                  >
                    <option value="">{jobTypeLoading ? 'Loading job types...' : 'Select Job Type'}</option>
                    {jobTypeOptions.map((option, idx) => (
                      <option key={option.JobTypeID || idx} value={option.JobTypeName}>
                        {option.JobTypeName}
                      </option>
                    ))}
                  </select>
                  {jobTypeError && <small className="error">{jobTypeError}</small>}
                  {errors.job_type && <small className="error">{errors.job_type}</small>}
                </div>
          
                {/* Age */}
                <div className="col-md-6">
                  <label htmlFor="age" className="form-label">{fieldLabels[lang].age}</label>
                  <input type="text" className="form-control" id="age" name="age" value={formData.age} onChange={handleInputChange} />
                  {errors.age && <small className="error">{errors.age}</small>}
                </div>
          
                {/* Caste */}
                {/* Caste */}
                <div className="col-md-6">
                  <label htmlFor="caste" className="form-label">{fieldLabels[lang].caste}</label>
                  <select
                    id="caste"
                    name="caste"
                    className="form-select"
                    value={formData.caste}
                    onChange={handleInputChange}
                    disabled={casteLoading}
                  >
                    <option value="">{casteLoading ? 'Loading castes...' : 'Select Caste'}</option>
                    {casteOptions.map((option, idx) => (
                      <option key={option.CasteID || idx} value={option.CasteName}>
                        {option.CasteName}
                      </option>
                    ))}
                  </select>
                  {casteError && <small className="error">{casteError}</small>}
                  {errors.caste && <small className="error">{errors.caste}</small>}
                </div>
          
                {/* Work Experience */}
                <div className="col-md-6">
                  <label htmlFor="work_experience" className="form-label">{fieldLabels[lang].work_experience}</label>
                  <select
                    id="work_experience"
                    name="work_experience"
                    className="form-select"
                    value={formData.work_experience}
                    onChange={handleInputChange}
                    disabled={workExperienceLoading}
                  >
                    <option value="">{workExperienceLoading ? 'Loading experience...' : 'Select Years of Exp'}</option>
                    {workExperienceOptions.map((option, idx) => (
                      <option key={option.WorkExperienceID || idx} value={option.WorkExperienceName}>
                        {option.WorkExperienceName}
                      </option>
                    ))}
                  </select>
                  {workExperienceError && <small className="error">{workExperienceError}</small>}
                  {errors.work_experience && <small className="error">{errors.work_experience}</small>}
                </div>
                
                {/* Education Qualification */}
                <div className="col-md-6">
                  <label htmlFor="education_qualification" className="form-label">{fieldLabels[lang].education_qualification}</label>
                  <select
                    id="education_qualification"
                    name="education_qualification"
                    className="form-select"
                    value={formData.education_qualification}
                    onChange={handleInputChange}
                    disabled={educationQualificationLoading}
                  >
                    <option value="">{educationQualificationLoading ? 'Loading qualifications...' : 'Select Qualification'}</option>
                    {educationQualificationOptions.map((option, idx) => (
                      <option key={option.QualificationID || idx} value={option.QualificationName}>
                        {option.QualificationName}
                      </option>
                    ))}
                  </select>
                  {educationQualificationError && <small className="error">{educationQualificationError}</small>}
                  {errors.education_qualification && <small className="error">{errors.education_qualification}</small>}
                </div>

                {/* Priority */}
                <div className="col-md-6">
                  <label htmlFor="priority" className="form-label">{fieldLabels[lang].priority}</label>
                  <select
                    id="priority"
                    name="priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={handleInputChange}
                    disabled={priorityLoading}
                  >
                    <option value="">{priorityLoading ? 'Loading priorities...' : 'Select Priority'}</option>
                    {priorityOptions.map((option, idx) => (
                      <option key={option.PriorityID || idx} value={option.PriorityName}>
                        {option.PriorityName}
                      </option>
                    ))}
                  </select>
                  {priorityError && <small className="error">{priorityError}</small>}
                  {errors.priority && <small className="error">{errors.priority}</small>}
                </div>

                {/* Number of Positions */}
                <div className="col-md-6">
                  <label htmlFor="no_of_positions" className="form-label">{fieldLabels[lang].no_of_positions}</label>
                  <select
                    id="no_of_positions"
                    name="no_of_positions"
                    className="form-select"
                    value={formData.no_of_positions}
                    onChange={handleInputChange}
                    disabled={noOfPositionsLoading}
                  >
                    <option value="">{noOfPositionsLoading ? 'Loading positions...' : 'Select No of Positions'}</option>
                    {noOfPositionsOptions.map((option, idx) => (
                      <option key={option.NoOfPositionsID || idx} value={option.NoOfPositionsValue}>
                        {option.NoOfPositionsValue}
                      </option>
                    ))}
                  </select>
                  {noOfPositionsError && <small className="error">{noOfPositionsError}</small>}
                  {errors.no_of_positions && <small className="error">{errors.no_of_positions}</small>}
                </div>

                {/* Relaxation Policy */}
                <div className="col-md-6">
                  <label htmlFor="relaxation_policy" className="form-label">{fieldLabels[lang].relaxation_policy}</label>
                  <select
                    id="relaxation_policy"
                    name="relaxation_policy"
                    className="form-select"
                    value={formData.relaxation_policy}
                    onChange={handleInputChange}
                    disabled={relaxationPolicyLoading}
                  >
                    <option value="">{relaxationPolicyLoading ? 'Loading policies...' : 'Select Policy'}</option>
                    {relaxationPolicyOptions.map((option, idx) => (
                      <option key={option.policy_id || idx} value={option.RelaxationPolicyName}>
                        {option.policy_name}
                      </option>
                    ))}
                  </select>
                  {relaxationPolicyError && <small className="error">{relaxationPolicyError}</small>}
                  {errors.relaxation_policy && <small className="error">{errors.relaxation_policy}</small>}
                </div>
              </div>
          
              <div className="d-flex justify-content-end mt-4 gap-3">
                <Button variant="outline-secondary" onClick={handleCancel}>Cancel</Button>
                <Button type="submit" className="text-white" style={{ backgroundColor: '#FF7043', borderColor: '#FF7043' }}>
                  Save
                </Button>
              </div>
            </form>
          </div>
          
          )}

        </div>
      </Col>
    </Row>
  </Container>
  );
};

export default JobCreation;
