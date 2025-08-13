import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileAlt, faCheck, faDownload, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import JobCreationForm from './../components/JobCreationForm';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { jobSchema } from './../components/validationSchema';
import '../css/JobCreation.css';

const JobCreation = ({ editRequisitionId, showModal, onClose, editPositionId }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState('direct');
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [jsonData, setJsonData] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReqIndex, setSelectedReqIndex] = useState(null);
  const [reqs, setReqs] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const initialState = {
    requisition_id: '',
    position_title: '',
    dept_id: '',
    country_id: '',
    state_id: '',
    city_id: '',
    location_id: '',
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
    no_of_vacancies: '',
    selection_procedure: '',
    // special_cat_id: '0',
    // reservation_cat_id:'0',
    // position_status:'submitted'
  };

  const [formData, setFormData] = useState(initialState);
  const [masterData, setMasterData] = useState({
    requisitionIdOptions: [],
    positionTitleOptions: [],
    departmentOptions: [],
    countryOptions: [],
    stateOptions: [],
    cityOptions: [],
    locationOptions: [],
    gradeIdOptions: [],
    employmentTypeOptions: ["Full-Time", "Part-Time", "Contract"],
    mandatoryQualificationOptions: [],
    preferredQualificationOptions: [],
    allCountries: [],
    allStates: [],
    allCities: [],
    allLocations: [],
  });

  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  useEffect(() => {
    const fetchAllMasterData = async () => {
      setLoading(true);
      setDataError(null);
      try {
        const [masterDataRes, requisitionDataRes] = await Promise.all([
          apiService.getMasterData(),
          apiService.getReqData()
        ]);

        console.log('Master Data Response:', masterDataRes);
       console.log('Requisition Data Response:', requisitionDataRes);
        // const staticJobGrades = [
        //   { job_grade_id: 1, job_scale: "S1","min_salary":20000, "max_salary": 30000 },
        //   { job_grade_id: 2, job_scale: "S2" ,"min_salary":20000, "max_salary": 30000}
        // ];
        const jobGrades = masterDataRes.job_grade_data;

        setMasterData({
          requisitionIdOptions: (requisitionDataRes.data || []).map(req => ({
            id: req.requisition_id,
            name: req.requisition_code
          })),
          positionTitleOptions: (masterDataRes.position_title || []).map(name => ({ id: name, name })),
          departmentOptions: masterDataRes.departments,
          // countryOptions: masterDataRes.countries,
          // stateOptions: masterDataRes.states,
          // cityOptions: masterDataRes.cities,
          // locationOptions: masterDataRes.locations,
          allCountries: masterDataRes.countries,
          allStates: masterDataRes.states,
          allCities: masterDataRes.cities,
          allLocations: masterDataRes.locations,
          gradeIdOptions: jobGrades.map(grade => ({
            id: grade.job_grade_id,
            name: `${grade.job_scale} (${grade.min_salary} - ${grade.max_salary})`
          })),
          employmentTypeOptions: ((masterDataRes.employment_type && masterDataRes.employment_type.length > 0)
            ? masterDataRes.employment_type
            : ["Full-Time", "Part-Time", "Contract"]
          ).map(type => ({ id: type, name: type })),
          mandatoryQualificationOptions: (masterDataRes.mandatory_qualification || []).map(q => ({ id: q, name: q })),
          preferredQualificationOptions: (masterDataRes.preferred_qualification || []).map(q => ({ id: q, name: q })),
        });
        setReqs(requisitionDataRes.data || []);
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

    if (editPositionId) {

      apiService.getByPositionId(editPositionId).then((response) => {

        const selectedPosition = response.data || [];
      console.log('Selected Position:', selectedPosition);

     // console.log('All Positions:', allPositions);
        // ✅ Pick the exact position using position_id

        // const selectedPosition = allPositions.find(

        //   (item) => item.position_id === editPositionId

        // );


        if (selectedPosition) {

          setFormData({

            requisition_id: selectedPosition.requisition_id || '',
            position_id:editPositionId || '',
            position_title: selectedPosition.position_title || '',
            dept_id: selectedPosition.dept_id || '',
            country_id: selectedPosition.country_id || '',
            state_id: selectedPosition.state_id || '',
            city_id: selectedPosition.city_id || '',
            location_id: selectedPosition.location_id || '',
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
            documents_required: selectedPosition.documents_required || '',
            min_credit_score: selectedPosition.min_credit_score || '',
            no_of_vacancies: selectedPosition.no_of_vacancies || '',
            selection_procedure: selectedPosition.selection_procedure || '',

            // job_application_fee_id: selectedPosition.job_application_fee_id || '',

          });

          const states = masterData.allStates.filter(
    (s) => s.countryId === Number(selectedPosition.country_id)
  );
  setFilteredStates(states);

  // 2. Filter cities for the selected state
  const cities = masterData.allCities.filter(
    (c) => c.state_id === Number(selectedPosition.state_id)
  );
  setFilteredCities(cities);

  // 3. Filter locations for the selected city
  const locations = masterData.allLocations.filter(
    (l) => l.city_id === Number(selectedPosition.city_id)
  );
  setFilteredLocations(locations);

          // setFormData((prev) => ({
          //   ...prev,
          //   position_id:editPositionId
          // }));
        }

      });

    }

  }, [ editPositionId, masterData]);
const handleInputChange = (e) => {
  const { name, value } = e.target;
 // console.log('Input change:', name, value);
  setFormData((prev) => ({ ...prev, [name]: value }));
 // ✅ Clear error for this field when it's valid
  setErrors((prev) => ({
    ...prev,
    [name]: value ? "" : prev[name]
  }));
  if (name === "country_id") {
    // Convert the value to a number since IDs are numbers
    const countryId = Number(value); 
    console.log('Selected country ID:', countryId);
    if (countryId) {
      // Filter states based on the countryId
      const states = masterData.allStates.filter(
        (s) => s.countryId === countryId
      );
      setFilteredStates(states);
    } else {
      // If no country is selected, clear the dependent dropdowns
      setFilteredStates([]);
    }

    // Reset subsequent form fields and dropdowns
    setFormData((prev) => ({
      ...prev,
      state_id: "",
      city_id: "",
      location_id: "",
    }));
    setFilteredCities([]);
    setFilteredLocations([]);

  } else if (name === "state_id") {
    // Convert the value to a number since IDs are numbers
    const stateId = Number(value); 

    if (stateId) {
      // Filter cities where the state_id matches the selected state's ID
      const cities = masterData.allCities.filter(
        (c) => c.state_id === stateId
      );
      setFilteredCities(cities);
    } else {
      setFilteredCities([]);
    }

    // Reset subsequent form fields and dropdowns
    setFormData((prev) => ({
      ...prev,
      city_id: "",
      location_id: "",
    }));
    setFilteredLocations([]);

  } else if (name === "city_id") {
    // Convert the value to a number since IDs are numbers
    const cityId = Number(value);

    if (cityId) {
      // Filter locations where the city_id matches the selected city's ID
      const locations = masterData.allLocations.filter(
        (l) => l.city_id === cityId
      );
      setFilteredLocations(locations);
    } else {
      setFilteredLocations([]);
    }

    // Reset the final form field
    setFormData((prev) => ({
      ...prev,
      location_id: "",
    }));
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      try {
        let response;
        if (!showModal) {
          response = await apiService.jobCreation(formData);
          navigate("/job-postings");
        } else {
          console.log('Updating job with form data:', formData);
          response = await apiService.updateJob(formData);
          onClose();
        }
        console.log('✅ Valid form data:', formData);
        console.log('✅ API response:', response);
        setFormData(initialState);
        setErrors({});

        toast.success(showModal ? 'Job updated successfully!' : 'Job created successfully!');
        setFormData(initialState);
         
      } catch (error) {
        console.error('❌ API error:', error);
        toast.error(showModal ? 'Failed to update job.' : 'Failed to create job.');
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleCancel = () => {
    setFormData(initialState);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.requisition_id) newErrors.requisition_id = 'Requisition ID is required';
    if (!formData.position_title.trim()) newErrors.position_title = 'Position Title is required';
    if (!formData.dept_id) newErrors.dept_id = 'Department is required';
    if (!formData.country_id) newErrors.country_id = 'Country is required';
    if (!formData.state_id) newErrors.state_id = 'State is required';
    if (!formData.city_id) newErrors.city_id = 'City is required';
    if (!formData.location_id) newErrors.location_id = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.roles_responsibilities.trim()) newErrors.roles_responsibilities = 'Roles & Responsibilities are required';
    if (!formData.grade_id) newErrors.grade_id = 'Grade ID is required';
    if (!formData.employment_type) newErrors.employment_type = 'Employment Type is required';
    if (!formData.eligibility_age_min || isNaN(formData.eligibility_age_min) || Number(formData.eligibility_age_min) <= 0) newErrors.eligibility_age_min = 'Min Age is required and must be a positive number';
    if (!formData.eligibility_age_max || isNaN(formData.eligibility_age_max) || Number(formData.eligibility_age_max) <= 0) newErrors.eligibility_age_max = 'Max Age is required and must be a positive number';
    if (!formData.mandatory_qualification) newErrors.mandatory_qualification = 'Mandatory Qualification is required';
    if (!formData.preferred_qualification) newErrors.preferred_qualification = 'Preferred Qualification is required';
    if (!formData.mandatory_experience || isNaN(formData.mandatory_experience) || Number(formData.mandatory_experience) <= 0) newErrors.mandatory_experience = 'Mandatory Experience is required and must be a positive number';
    if (!formData.preferred_experience || isNaN(formData.preferred_experience) || Number(formData.preferred_experience) <= 0) newErrors.preferred_experience = 'Preferred Experience is required and must be a positive number';
    if (!String(formData.probation_period ?? '').trim()) newErrors.probation_period = 'Probation Period is required';
    if (!formData.documents_required.trim()) newErrors.documents_required = 'Documents Required is required';
    if (!String(formData.min_credit_score ?? '').trim()) newErrors.min_credit_score = 'Min Credit Score is required';
    if (!formData.no_of_vacancies || isNaN(formData.no_of_vacancies) || Number(formData.no_of_vacancies) <= 0) newErrors.no_of_vacancies = 'Number of Positions is required and must be a positive number';
    if (!formData.selection_procedure || !formData.selection_procedure.trim()) newErrors.selection_procedure = 'Selection Process is required';
    return newErrors;
  };

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
    console.log("Converting keys to snake case:", dataArray);
    return dataArray.map((item) => ({
      requisition_id: item["Requisition ID"],
      position_title: item["Position Title"],
      dept_id: item["Department"],
      country_id: item["Country"],
      state_id: item["State"],
      city_id: item["City"],
      location_id: item["Location"],
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
      no_of_vacancies: item["Number of Vacancies"],
      selection_procedure: item["Selection Procedure"],
     min_credit_score:item["Min Credit Score"]
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
      toast.error("Please fix validation errors before submitting.");
      return;
    }
    if (!jsonData || jsonData.length === 0) {
      toast.error("No valid data to submit.");
      return;
    }
    try {
      let dataToUpload = jsonData;
      if (selectedReqIndex !== null && selectedReqIndex !== "" && reqs[selectedReqIndex]) {
        const selectedReqId = reqs[selectedReqIndex].requisition_id;
        dataToUpload = jsonData.map(obj => ({ ...obj, requisition_id: selectedReqId }));
      }
      console.log('Posting Excel data:', dataToUpload);
      await apiService.uploadJobExcel(dataToUpload);
      setShowUploadModal(false);
      toast.success("Excel data posted successfully!");
      setFiles([]);
      setJsonData([]);
      // navigate('/job-postings');
    } catch (error) {
      toast.error("Failed to post Excel data.");
      console.error("Error posting Excel data:", error);
    }
  };

  return (
    <Container fluid className="py-2">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <div className="p-1">
            <div className="d-flex justify-content-end mb-2 gap-2 buttons_div">
              <a className='downlaodfile'
                href="/JobCreationTemplate.xlsx"
                style={{
                  border: "1px solid #FF7043",
                  backgroundColor: "transparent",
                  color: "#FF7043",
                  padding: "8px 15px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  minWidth: 0,
                  minHeight: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <FontAwesomeIcon icon={faDownload} style={{ color: "#FF7043", fontSize: "1rem" }} />
                <span> Download Template</span>
              </a>
              <Button className='uploadfile'
                variant="uploadfile outline-primary"
                onClick={() => setShowUploadModal(true)}
                style={{
                  borderColor: "#FF7043",
                  color: "#FF7043",
                  padding: "8px 15px",
                  display: "inline-flex",
                  alignItems: "center",
                  minWidth: 0,
                  minHeight: 0,
                }}
              >
                <FontAwesomeIcon icon={faUpload} style={{ color: "#FF7043", fontSize: "1rem" }} />
             <span> Upload Excel</span>
              </Button>
            </div>
            {selectedOption === 'direct' && (
              <JobCreationForm
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                requisitionIdOptions={masterData.requisitionIdOptions}
                departmentOptions={masterData.departmentOptions}
                countryOptions={masterData.allCountries.map(c => ({ id: c.country_id, name: c.country_name }))}
                stateOptions={filteredStates.map(s => ({ id: s.stateId, name: s.stateName }))}
                cityOptions={filteredCities.map(c => ({ id: c.city_id, name: c.city_name }))}
                locationOptions={filteredLocations.map(l => ({ id: l.location_id, name: l.location_name }))}
                gradeIdOptions={masterData.gradeIdOptions}
                positionTitleOptions={masterData.positionTitleOptions}
                employmentTypeOptions={masterData.employmentTypeOptions}
                mandatoryQualificationOptions={masterData.mandatoryQualificationOptions}
                preferredQualificationOptions={masterData.preferredQualificationOptions}
                requisitionData={reqs}
              />
            )}
          </div>
        </Col>
      </Row>
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className='fonall'>Job Postings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="upload-section fontss">
            <div>
              <Form.Group className="mb-2">
                <Form.Label className="fw-semibold small mb-1 d-flex align-items-center fontss" style={{ gap: '0.4em' }}>
                  Select Requisition
                  {typeof selectedReqIndex === 'number' && reqs[selectedReqIndex] && (
                    <OverlayTrigger
                      trigger="click"
                      placement="right"
                      rootClose
                      overlay={
                        <Popover id="modal-requisition-popover" style={{ minWidth: 250 }}>
                          <Popover.Header as="h3" style={{ fontSize: '1rem' }}>
                            {reqs[selectedReqIndex].requisition_code || reqs[selectedReqIndex].requisition_title || 'Requisition Details'}
                          </Popover.Header>
                          <Popover.Body style={{ fontSize: '0.85rem' }}>
                            <div><strong>Position Title:</strong> {reqs[selectedReqIndex].requisition_title || '-'}</div>
                            <div><strong>Number of positions:</strong> {reqs[selectedReqIndex].no_of_positions || '-'}</div>
                            <div><strong>Start date:</strong> {reqs[selectedReqIndex].registration_start_date || '-'}</div>
                            <div><strong>End date:</strong> {reqs[selectedReqIndex].registration_end_date || '-'}</div>
                            {/* Add more fields as needed */}
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <span style={{ display: 'inline-block', cursor: 'pointer' }}>
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="text-info"
                          style={{ fontSize: '1.1em' }}
                          tabIndex={0}
                        />
                      </span>
                    </OverlayTrigger>
                  )}
                </Form.Label>
                <Form.Select
  size="sm"
  value={selectedReqIndex === null ? "" : selectedReqIndex}
  onChange={(e) => {
    const val = e.target.value;
    setSelectedReqIndex(val === "" ? null : Number(val));
  }}
  style={{ maxWidth: "300px" }}
>
  <option value="">Select Requisition</option>
  {reqs.map((req, index) => (
    <option key={req.requisition_id} value={index}>
      {req.requisition_code + " - " + req.requisition_title}
    </option>
  ))}
</Form.Select>

              </Form.Group>
              {/* {selectedReqIndex !== null && selectedReqIndex !== "" && (
                <Row
                  className="job-row border-bottom py-1 align-items-center text-muted px-3 mx-1 my-3 mt-3 w-75"
                  style={{
                    backgroundColor: "#fff3e0",
                    borderLeft: "4px solid #ff7043",
                    borderRadius: "4px",
                  }}
                >
                  <Col xs={12} md={3} className="d-flex align-items-center">
                    <div className="bullet-columns d-flex me-2">
                      <div className="d-flex flex-column me-1">
                        <span className="job-bullet mb-1"></span>
                        <span className="job-bullet mb-1"></span>
                        <span className="job-bullet mb-1"></span>
                        <span className="job-bullet"></span>
                      </div>
                      <div className="d-flex flex-column">
                        <span className="job-bullet mb-1"></span>
                        <span className="job-bullet mb-1"></span>
                        <span className="job-bullet mb-1"></span>
                        <span className="job-bullet"></span>
                      </div>
                    </div>
                    <div>
                      <div className="fw-semibold text-dark">
                        {reqs[selectedReqIndex].requisition_title}
                      </div>
                      <div className="text-muted small">
                        {reqs[selectedReqIndex].requisition_description}
                      </div>
                    </div>
                  </Col>
                  <Col
                    xs={12}
                    md={3}
                    className="text-end small text-secondary"
                  >
                    <div>
                      <strong>Positions:</strong>{" "}
                      {reqs[selectedReqIndex].no_of_positions}
                    </div>
                  </Col>
                  <Col
                    xs={12}
                    md={3}
                    className="text-end small text-secondary"
                  >
                    <div>
                      <strong>From:</strong>{" "}
                      {reqs[selectedReqIndex].registration_start_date}
                    </div>
                  </Col>
                  <Col
                    xs={12}
                    md={3}
                    className="text-end small text-secondary"
                  >
                    <div>
                      <strong>To:</strong>{" "}
                      {reqs[selectedReqIndex].registration_end_date}
                    </div>
                  </Col>
                </Row>
              )} */}
            </div>
            <div
              className="border rounded p-3 text-center mb-3 mt-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                borderStyle: 'dashed',
                backgroundColor: 'rgb(255, 231, 222)',
                cursor: 'pointer',
                minHeight: '60px',
                height: '90px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 'auto',
                width: '350px'
              }}
            >
              <FontAwesomeIcon icon={faUpload} size="2x" className="mb-2 text-muted" />
              <div style={{ fontWeight: 500, color: '#FF7043', fontSize: '1.05rem' }}>Drag & Drop Excel file here</div>
              <div style={{ color: '#757575', fontSize: '0.95rem' }}>or <span style={{ textDecoration: 'underline', color: '#FF7043', cursor: 'pointer' }}>click to browse</span></div>
            </div>
            <Form.Control type="file" id="file-upload" className="d-none" onChange={handleFileChange} ref={fileInputRef} />
            {errors.file && <small className="error d-block mb-2 text-danger">{errors.file}</small>}
            {files.length > 0 && (
              <div className="mb-3">
                <h6>Selected File:</h6>
                <div className="d-flex align-items-center justify-content-between border rounded p-2" style={{ background: '#f9f9f9' }}>
                  <span><FontAwesomeIcon icon={faFileAlt} className="me-2 text-muted" /> {files[0].name}</span>
                  <button className="btn btn-sm btn-danger ms-2" onClick={() => removeFile(0)}>✕</button>
                </div>
              </div>
            )}
            {Array.isArray(errors) && errors.length > 0 && (
              <div className="alert alert-danger p-2 mb-2" style={{ fontSize: '0.95em', maxHeight: '120px', overflowY: 'auto', color: '#d32f2f' }}>
                <strong>Validation Errors:</strong>
                <ul className="mb-0 ps-3" style={{ listStyle: 'disc', color: '#d32f2f' }}>
                  {errors.map((err, i) => (
                    <li key={i} style={{ marginBottom: 2 }}>
                      Row {err.row}: {err.messages.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className='footspace'>
          <Button
            onClick={handleUploadSubmit}
            className="text-white fw-semibold"
            style={{ backgroundColor: '#FF7043', borderColor: '#FF7043' }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JobCreation;