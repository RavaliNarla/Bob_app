import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileAlt, faCheck } from '@fortawesome/free-solid-svg-icons';
import JobRequisitionForm from './../components/JobCreationForm';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { jobSchema } from './../components/validationSchema';

const JobCreation = ({ editRequisitionId, isEditMode, onClose, editPositionId }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState('direct');
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [jsonData, setJsonData] = useState([]);

  // State for form data
  const [formData, setFormData] = useState({
    requisition_id: '',
    position_title: '',
    department: '',
    country: '',
    state: '',
    city: '',
    location: '',
    description: '',
    roles_responsibilities: '',
    grade_id: '',
    employment_type: '',
    eligibility_age_min: '',
    eligibility_age_max: '',
    mandatory_qualification: '',
    preferred_qualification: '',
    mandatory_experience: '',
    preferred_experience: '',
    probation_period: '',
    documents_required: '',
    min_credit_score: '',
  });

  // State for dropdown master data
  const [masterData, setMasterData] = useState({
    requisitionIdOptions: [],
    positionTitleOptions: [],
    departmentOptions: [],
    countryOptions: [],
    stateOptions: [],
    cityOptions: [],
    locationOptions: [],
    gradeIdOptions: [],
    employmentTypeOptions: [],
    mandatoryQualificationOptions: [],
    preferredQualificationOptions: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Fetch all dropdown master data on mount
  useEffect(() => {
    const fetchAllMasterData = async () => {
      setLoading(true);
      setDataError(null);
      try {
        // Simulating the API calls
        const masterDataRes = {
          position_title: ["Digital Banking", "Information Security", "Security", "Information Technology"],
          departments: [
            { "department_id": 1, "department_name": "Digital Banking" },
            { "department_id": 2, "department_name": "Information Security" },
            { "department_id": 3, "department_name": "Security" },
            { "department_id": 4, "department_name": "Information Technology" }
          ],
          countries: [
            { "country_name": "India", "country_id": 1 },
            { "country_name": "USA", "country_id": 2 }
          ],
          states: [
            { "state_name": "Telangana", "state_id": 1 },
            { "state_id": 2, "state_name": "California" }
          ],
          cities: [
            { "city_name": "Hyderabad", "city_id": 1 },
            { "city_name": "Los Angeles", "city_id": 2 }
          ],
          locations: [
            { "location_name": "HiTech City", "location_id": 1 },
            { "location_name": "Downtown LA", "location_id": 2 }
          ],
          job_grade_ids: [1, 2, 3],
          employment_type: ["Full-Time", "Part-Time", "Contract"],
          mandatory_qualification: ["Bachelor's Degree", "Master's Degree"],
          preferred_qualification: ["PhD", "Certifications"]
        };

        const requisitionDataRes = {
          data: [
            { requisition_id: 1, requisition_code: "REQ-2025-001", requisition_title: "Senior Software Engineer" },
            { requisition_id: 2, requisition_code: "REQ-2025-002", requisition_title: "UI/UX Designer" },
            { requisition_id: 3, requisition_code: "REQ-2025-005", requisition_title: "Senior Software Engineer" },
            { requisition_id: 4, requisition_code: "REQ-2025-006", requisition_title: "Senior Software Engineer" }
          ]
        };

        setMasterData({
          requisitionIdOptions: (requisitionDataRes.data || []).map(req => ({
            id: req.requisition_id,
            name: req.requisition_code
          })),
          positionTitleOptions: (masterDataRes.position_title || []).map(name => ({ id: name, name })),
          departmentOptions: masterDataRes.departments,
          countryOptions: masterDataRes.countries,
          stateOptions: masterDataRes.states,
          cityOptions: masterDataRes.cities,
          locationOptions: masterDataRes.locations,
          gradeIdOptions: (masterDataRes.job_grade_ids || []).map(id => ({ id, name: id })),
          employmentTypeOptions: (masterDataRes.employment_type || []).map(type => ({ id: type, name: type })),
          mandatoryQualificationOptions: (masterDataRes.mandatory_qualification || []).map(q => ({ id: q, name: q })),
          preferredQualificationOptions: (masterDataRes.preferred_qualification || []).map(q => ({ id: q, name: q })),
        });
      } catch (err) {
        console.error('Failed to fetch master data:', err);
        setDataError('Failed to fetch master data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllMasterData();
  }, []);

  useEffect(() => {
    if (editRequisitionId) {
      apiService.getByRequisitionId(editRequisitionId).then((response) => {
        const allPositions = response.data || [];

        // ✅ Pick the exact position using position_id
        const selectedPosition = allPositions.find(
          (item) => item.position_id === editPositionId
        );

        if (selectedPosition) {
          setFormData({
            requisition_id: selectedPosition.requisition_id || '',
            position_title: selectedPosition.position_title || '',
            department: selectedPosition.department || '',
            country: selectedPosition.country || '',
            state: selectedPosition.state || '',
            city: selectedPosition.city || '',
            location: selectedPosition.location || '',
            description: selectedPosition.description || '',
            roles_responsibilities: selectedPosition.roles_responsibilities || '',
            grade_id: selectedPosition.grade_id || '',
            employment_type: selectedPosition.employment_type || '',
            eligibility_age_min: selectedPosition.eligibility_age_min || '',
            eligibility_age_max: selectedPosition.eligibility_age_max || '',
            mandatory_qualification: selectedPosition.mandatory_qualification || '',
            preferred_qualification: selectedPosition.preferred_qualification || '',
            mandatory_experience: selectedPosition.mandatory_experience || '',
            preferred_experience: selectedPosition.preferred_experience || '',
            probation_period: selectedPosition.probation_period || '',
            documents_required: selectedPosition.document_required || '',
            min_credit_score: selectedPosition.min_credit_score || ''
          });
        }
      });
    }
  }, [editRequisitionId, editPositionId]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      console.log('✅ Valid form data:', formData);
      // Your API submission logic here
    } else {
      setErrors(validationErrors);
    }
  };

  const handleCancel = () => {
    setFormData({
      requisition_id: '', position_title: '', department: '', country: '', state: '', city: '', location: '', description: '', roles_responsibilities: '', grade_id: '', employment_type: '', eligibility_age_min: '', eligibility_age_max: '', mandatory_qualification: '', preferred_qualification: '', mandatory_experience: '', preferred_experience: '', probation_period: '', documents_required: '', min_credit_score: '',
    });
    setErrors({});
  };
  
  // Basic client-side validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.requisition_id) newErrors.requisition_id = 'Requisition ID is required';
    if (!formData.position_title.trim()) newErrors.position_title = 'Position Title is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.roles_responsibilities.trim()) newErrors.roles_responsibilities = 'Roles & Responsibilities are required';
    if (!formData.grade_id) newErrors.grade_id = 'Grade ID is required';
    if (!formData.employment_type) newErrors.employment_type = 'Employment Type is required';
    if (!formData.eligibility_age_min || isNaN(formData.eligibility_age_min)) newErrors.eligibility_age_min = 'Min Age is required and must be a number';
    if (!formData.eligibility_age_max || isNaN(formData.eligibility_age_max)) newErrors.eligibility_age_max = 'Max Age is required and must be a number';
    if (!formData.mandatory_qualification) newErrors.mandatory_qualification = 'Mandatory Qualification is required';
    if (!formData.preferred_qualification) newErrors.preferred_qualification = 'Preferred Qualification is required';
    if (!formData.mandatory_experience || isNaN(formData.mandatory_experience)) newErrors.mandatory_experience = 'Mandatory Experience is required and must be a number';
    if (!formData.preferred_experience || isNaN(formData.preferred_experience)) newErrors.preferred_experience = 'Preferred Experience is required and must be a number';
    if (!formData.probation_period.trim()) newErrors.probation_period = 'Probation Period is required';
    if (!formData.documents_required.trim()) newErrors.documents_required = 'Documents Required is required';
    if (!formData.min_credit_score.trim()) newErrors.min_credit_score = 'Min Credit Score is required';
    return newErrors;
  };

  // File upload and Excel handling logic (kept for completeness)
  const handleFileChange = (e) => {
    const newErrors = {};
    const selectedFiles = Array.from(e.target.files);
    const validExtensions = ['.xls', '.xlsx'];
    const validFiles = selectedFiles.filter(file => validExtensions.includes(file.name.slice(file.name.lastIndexOf('.')).toLowerCase()));
    if (validFiles.length !== selectedFiles.length) {
      newErrors.file = "Only Excel files (.xls, .xlsx) are allowed.";
    } else {
      delete newErrors.file;
    }
    setErrors(newErrors);
    setFiles([...files, ...validFiles]);
    validFiles.forEach(file => readExcel(file));
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
      droppedFiles.forEach(file => readExcel(file));
    }
  };
  const handleDragOver = (e) => e.preventDefault();
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  const convertKeysToSnakeCase = (dataArray) => {
    return dataArray.map((item) => ({
      requisition_id: item["Requisition ID"],
      position_title: item["Position Title"],
      department: item["Department"],
      country: item["Country"],
      state: item["State"],
      city: item["City"],
      location: item["Location"],
      description: item["Description"],
      roles_responsibilities: item["Roles & Responsibilities"],
      grade_id: item["Grade ID"],
      employment_type: item["Employment Type"],
      eligibility_age_min: item["Eligibility Age Min"],
      eligibility_age_max: item["Eligibility Age Max"],
      mandatory_qualification: item["Mandatory Qualification"],
      preferred_qualification: item["Preferred Qualification"],
      mandatory_experience: item["Mandatory Experience"],
      preferred_experience: item["Preferred Experience"],
      probation_period: item["Probation Period"],
      documents_required: item["Documents Required"],
      min_credit_score: item["Min Credit Score"],
    }));
  };
  const readExcel = async (file) => {
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
          errorList.push({ row: i + 2, messages: err.errors });
        }
      }
      setErrors(errorList);
      const formattedData = convertKeysToSnakeCase(validRows);
      setJsonData(formattedData);
    };
    reader.readAsArrayBuffer(file);
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
      // await apiService.uploadJobExcel(jsonData);
      toast.success("Excel data posted successfully!");
      setFiles([]);
      setJsonData([]);
      navigate('/job-postings');
    } catch (error) {
      toast.error("Failed to post Excel data.");
      console.error("Error posting Excel data:", error);
    }
  };

  return (
    <Container fluid className="py-2">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <div className="p-4">
            {/* Toggle Buttons */}
            <div className="mb-4 d-flex gap-3 align-items-center justify-content-center flex-wrap buttons_div">
              <div
                onClick={() => setSelectedOption('upload')}
                className={`px-3 py-2 rounded-pill d-flex align-items-center justify-content-center ${selectedOption === 'upload' ? '' : ''}`}
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
                    {selectedOption === 'upload' && (<FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px', color: '#FFF' }} />)}
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
                className={`px-3 py-2 rounded-pill d-flex align-items-center justify-content-center ${selectedOption === 'direct' ? '' : ''}`}
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
                    {selectedOption === 'direct' && (<FontAwesomeIcon icon={faCheck} style={{ fontSize: '12px', color: '#FFF' }} />)}
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
                <Form.Control type="file" id="file-upload" className="d-none" onChange={handleFileChange} ref={fileInputRef} multiple />
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
                {Array.isArray(errors) && errors.length > 0 && (
                  <ul style={{ color: 'red', marginTop: '20px' }}>
                    {errors.map((err, i) => (
                      <li key={i}>
                        Row {err.row}
                        <ul>
                          {err.messages.map((msg, j) => (<li key={j}>{msg}</li>))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Form Section */}
            {selectedOption === 'direct' && (
              <JobRequisitionForm
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                requisitionIdOptions={masterData.requisitionIdOptions}
                departmentOptions={masterData.departmentOptions}
                countryOptions={masterData.countryOptions}
                stateOptions={masterData.stateOptions}
                cityOptions={masterData.cityOptions}
                locationOptions={masterData.locationOptions}
                gradeIdOptions={masterData.gradeIdOptions}
                employmentTypeOptions={masterData.employmentTypeOptions}
                mandatoryQualificationOptions={masterData.mandatoryQualificationOptions}
                preferredQualificationOptions={masterData.preferredQualificationOptions}
              />
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default JobCreation;