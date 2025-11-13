import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileAlt, faCheck, faDownload, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import JobCreationForm from './../components/JobCreationForm';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { jobSchema } from './../components/validationSchema';
import '../css/JobCreation.css';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";


const JobCreation = ({ editRequisitionId, showModal, onClose, editPositionId, onUpdateSuccess, readOnly: readOnlyProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const requisitionId = location.state?.requisitionId || "";
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
  const [relaxationPolicies, setRelaxationPolicies] = useState([]);
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
    probation_period: 0,
    documents_required: '',
    min_credit_score: '',
    no_of_vacancies: '',
    selection_procedure: '',
    max_salary: '',
    min_salary: '',
    // special_cat_id: '0',
    // reservation_cat_id:'0',
    // position_status:'submitted'
    job_relaxation_policy_id: ''
  };
  const headers = [
    "Requisition ID",
    "Position Title",
    "Department",
    "Country",
    "State",
    "City",
    "Location",
    "Description",
    "Roles & Responsibilities",
    "Grade ID",
    "Employment Type",
    "Eligibility Age min",
    "Eligibility Age Max",
    "Mandatory Qualification",
    "Preferred Qualification",
    "Mandatory Experience",
    "Preferred Experience",
    "Probation Period",
    "Documents Required",
    "Min Credit Score",
  ];
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
  const [readOnly, setReadOnly] = useState(readOnlyProp ?? false);
  const [masterPositions, setMasterPositions] = useState([]);

useEffect(() => {
  const fetchMasterData = async () => {
    try {
      const res = await apiService.getMasterData();
      if (res?.masterPositionsList) {
        // Map API data to the structure your form expects
        setMasterPositions(
          res.masterPositionsList.map(pos => ({
            position_title: pos.positionName,   // form expects this
            position_code: pos.positionCode,
            dept_id: pos.jobGradeId,
            description: pos.positionDescription,
            ...pos, // keep all original fields too
          }))
        );
      }
      // console.log("Fetched master positions:", res.masterPositionsList);
    } catch (error) {
      console.error("Error fetching master positions:", error);
    }
  };
  const fetchRelaxations = async () => {
    try {
     const res = await apiService.getRelaxations();
      if (res.success) {
        setRelaxationPolicies(res.data);
      }
      // console.log("Fetched relaxations:", res.data);
    } catch (error) {
      console.error("Error fetching relaxations:", error);
    }
  }
  fetchMasterData();
  fetchRelaxations();
}, []);

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
          // console.log('Updating job with form data:', formData);
          response = await apiService.updateJob(formData);
          onClose();
          if (onUpdateSuccess) onUpdateSuccess(); // 🔥 notify parent
        }
        // console.log('✅ Valid form data:', formData);
        // console.log('✅ API response:', response);
        setFormData(initialState);
        setErrors({});

        toast.success(showModal ? 'Job updated successfully!' : 'Job created successfully!');
        //setFormData(initialState);
        navigate('/job-postings');
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
useEffect(() => {
  const fetchMasterData = async () => {
    try {
      const res = await apiService.getMasterData();
      if (res?.masterPositionsList) {
        // Map API data to the structure your form expects
        setMasterPositions(
          res.masterPositionsList.map(pos => ({
            position_title: pos.positionName,   // form expects this
            position_code: pos.positionCode,
            dept_id: pos.jobGradeId,
            description: pos.positionDescription,
            ...pos, // keep all original fields too
          }))
        );
      }
      // console.log("Fetched master positions:", res.masterPositionsList);
    } catch (error) {
      // console.error("Error fetching master positions:", error);
    }
  };

  fetchMasterData();
}, []);



  useEffect(() => {
    if (requisitionId) {
      setFormData((prev) => ({
        ...prev,
        requisition_id: requisitionId
      }));
    }
  }, [requisitionId]);

  useEffect(() => {
    // If no modal is passed, assume direct navigation → editable
    if (!showModal) {
      setReadOnly(false);
    } else {
      setReadOnly(readOnlyProp ?? false);
    }
  }, [showModal, readOnlyProp]);

  useEffect(() => {
    const fetchAllMasterData = async () => {
      setLoading(true);
      setDataError(null);
      try {
        const [masterDataRes, requisitionDataRes] = await Promise.all([
          apiService.getMasterData(),
          apiService.getReqData()
        ]);

        // console.log('Master Data Response:', masterDataRes);
      //  console.log('Requisition Data Response:', requisitionDataRes);
        // const staticJobGrades = [
        //   { job_grade_id: 1, job_scale: "S1","min_salary":20000, "max_salary": 30000 },
        //   { job_grade_id: 2, job_scale: "S2" ,"min_salary":20000, "max_salary": 30000}
        // ];
        const jobGrades = masterDataRes.job_grade_data;

        setMasterData({
          requisitionIdOptions: (requisitionDataRes.data || [])
          .filter(req => {
            if (readOnly) return true;
            return req.requisition_status === "New";
          })
          .map(req => ({
            id: req.requisition_id,
            name: req.requisition_code
          })),
          //positionTitleOptions: (masterDataRes.position_title || []).map(name => ({ id: name, name })),
          positionTitleOptions: (masterDataRes.masterPositionsList || []).map(pos => ({
            id: pos.masterPositionId,   // numeric ID
            name: pos.positionName      // display text
          })),
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
          allGrades: jobGrades,
          
          employmentTypeOptions: ((masterDataRes.employment_type && masterDataRes.employment_type.length > 0)
            ? masterDataRes.employment_type
            : ["Full-Time", "Part-Time", "Contract"]
          ).map(type => ({ id: type, name: type })),
          mandatoryQualificationOptions: (masterDataRes.mandatory_qualification || []).map(q => ({ id: q, name: q })),
          preferredQualificationOptions: (masterDataRes.preferred_qualification || []).map(q => ({ id: q, name: q })),
        });
        setReqs(requisitionDataRes.data.filter(req => {
            if (readOnly) return true;
            return req.requisition_status === "New";
          }) || []);
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
      // console.log('Selected Position:', selectedPosition);

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
            grade_id: selectedPosition.grade_id.toLocaleString() || '',
            employment_type: selectedPosition.employment_type || '',
            eligibility_age_min: selectedPosition.eligibility_age_min || '',
            eligibility_age_max: selectedPosition.eligibility_age_max || '',
            mandatory_qualification: selectedPosition.mandatory_qualification || '',
            preferred_qualification: selectedPosition.preferred_qualification || '',
            mandatory_experience: selectedPosition.mandatory_experience || '',
            preferred_experience: selectedPosition.preferred_experience || '',
            probation_period: selectedPosition.probation_period || 0,
            documents_required: selectedPosition.documents_required || '',
            min_credit_score: selectedPosition.min_credit_score || '',
            no_of_vacancies: selectedPosition.no_of_vacancies || '',
            selection_procedure: selectedPosition.selection_procedure || '',
            min_salary: selectedPosition.min_salary || '',
            max_salary: selectedPosition.max_salary || '',
            job_relaxation_policy_id: selectedPosition.job_relaxation_policy_id || '',
            // job_application_fee_id: selectedPosition.job_application_fee_id || '',

          });
          const states = masterData.allStates.filter(
    (s) => s.country_id === Number(selectedPosition.country_id)
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
//  console.log('Input change:', name, value);
  setFormData((prev) => ({ ...prev, [name]: value }));
 // ✅ Clear error for this field when it's valid
  setErrors((prev) => ({
    ...prev,
    [name]: value ? "" : prev[name]
  }));
  if (name === "grade_id" && value !== '0') {
     setFormData((prev) => ({
        ...prev,
        min_salary: "",
        max_salary: ""
      }));
  }
  if (name === "job_relaxation_policy_id") {
    const selectedPolicy = relaxationPolicies.find(p => p.job_relaxation_policy_id === value);
    
    // Clear errors first
    const newErrors = {
      ...errors,
      job_relaxation_policy_id: "",
      no_of_vacancies: ""
    };

    if (selectedPolicy) {
      const allocated = selectedPolicy.relaxation?.allocatedVacancies || 0;
      const vacancies = Number(formData.no_of_vacancies) || 0;
      // console.log('Allocated:', allocated, 'Vacancies:', vacancies);
      if (allocated > 0 && vacancies <= allocated) {
        newErrors.no_of_vacancies = `Selected relaxation allows maximum ${allocated} vacancies.`;
      }
    }

    setErrors(newErrors);
  }

  if (name === "no_of_vacancies") {
    const vacancies = Number(value) || 0;
    const newErrors = { ...errors, no_of_vacancies: "" };

    if (formData.job_relaxation_policy_id) {
      const selectedPolicy = relaxationPolicies.find(
        p => p.job_relaxation_policy_id === formData.job_relaxation_policy_id
      );

      if (selectedPolicy) {
        const allocated = selectedPolicy.relaxation?.allocatedVacancies || 0;
        
        if (allocated > 0 && vacancies < allocated) {
          newErrors.no_of_vacancies = `Selected relaxation allows maximum ${allocated} vacancies.`;
        }
      }
    }

    setErrors(newErrors);
  }
  
  if (name === "country_id") {
    // Convert the value to a number since IDs are numbers
    const countryId = Number(value); 
    // console.log('Selected country ID:', countryId);
    if (countryId) {
      // Filter states based on the countryId
      // console.log('All states:', masterData.allStates);
      const states = masterData.allStates.filter(
        (s) => s.country_id === countryId
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
  

  const validateForm = () => {
    const newErrors = {};
    if (!formData.requisition_id) newErrors.requisition_id = 'Requisition ID is required';
    if (!formData.position_title.trim()) newErrors.position_title = 'Position Title is required';
    if (!formData.dept_id) newErrors.dept_id = 'Department is required';
   // if (!formData.country_id) newErrors.country_id = 'Country is required';
   // if (!formData.state_id) newErrors.state_id = 'State is required';
   // if (!formData.city_id) newErrors.city_id = 'City is required';
   // if (!formData.location_id) newErrors.location_id = 'Location is required';
    //if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.roles_responsibilities.trim()) newErrors.roles_responsibilities = 'Roles & Responsibilities are required';
    if (!formData.grade_id) newErrors.grade_id = 'Grade ID is required';
    if (!formData.employment_type) newErrors.employment_type = 'Employment Type is required';
    if (!formData.eligibility_age_min || isNaN(formData.eligibility_age_min) || Number(formData.eligibility_age_min) <= 0) newErrors.eligibility_age_min = 'Min Age is required and must be a positive number';
    if (!formData.eligibility_age_max || isNaN(formData.eligibility_age_max) || Number(formData.eligibility_age_max) <= 0) newErrors.eligibility_age_max = 'Max Age is required and must be a positive number';
    if (!formData.job_relaxation_policy_id) newErrors.job_relaxation_policy_id = 'Relaxation Policy is required';
    //  if (!formData.min_salary || isNaN(formData.min_salary) || Number(formData.min_salary) <= 0) newErrors.min_salary = 'Min Age is required and must be a positive number';
    // if (!formData.max_salary || isNaN(formData.max_salary) || Number(formData.max_salary) <= 0) newErrors.max_salary = 'Max Age is required and must be a positive number';

    if (!formData.mandatory_qualification) newErrors.mandatory_qualification = 'Mandatory Qualification is required';
    //if (!formData.preferred_qualification) newErrors.preferred_qualification = 'Preferred Qualification is required';
    if (!formData.mandatory_experience || isNaN(formData.mandatory_experience) || Number(formData.mandatory_experience) <= 0) newErrors.mandatory_experience = 'Mandatory Experience is required and must be a positive number';
    //if (!formData.preferred_experience || isNaN(formData.preferred_experience) || Number(formData.preferred_experience) <= 0) newErrors.preferred_experience = 'Preferred Experience is required and must be a positive number';
    //if (!formData.probation_period || isNaN(formData.probation_period) || Number(formData.probation_period) <= 0) {newErrors.probation_period = 'Probation Period is required and must be a positive number';}
    if (!formData.documents_required.trim()) newErrors.documents_required = 'Documents Required is required';
    //if (!String(formData.min_credit_score ?? '').trim()) newErrors.min_credit_score = 'Min Credit Score is required';
    if (!formData.no_of_vacancies || isNaN(formData.no_of_vacancies) || Number(formData.no_of_vacancies) <= 0) newErrors.no_of_vacancies = 'Number of Positions is required and must be a positive number';
    //if (!formData.selection_procedure || !formData.selection_procedure.trim()) newErrors.selection_procedure = 'Selection Process is required';
     if (
    formData.preferred_experience !== '' &&
    formData.preferred_experience !== null &&
    formData.preferred_experience !== undefined &&
    (isNaN(formData.preferred_experience) || Number(formData.preferred_experience) <= 0)
  ) {
    newErrors.preferred_experience = 'Preferred Experience must be a positive number';
  }
  if (
    formData.probation_period !== '' &&
    formData.probation_period !== null &&
    formData.probation_period !== undefined &&
    (isNaN(formData.probation_period) || Number(formData.probation_period) < 0)
  ) {
    newErrors.probation_period = 'Probation Period must be a positive number';
  }
  if (
    formData.min_credit_score !== '' &&
    formData.min_credit_score !== null &&
    formData.min_credit_score !== undefined &&
    isNaN(formData.min_credit_score)
  ) {
    newErrors.min_credit_score = 'Min Credit Score must be a number';
  }
  if (formData.grade_id === '0') {
    // Validate min_salary when grade is 'Others'
    if (!formData.min_salary || isNaN(formData.min_salary) || Number(formData.min_salary) <= 0) {
      newErrors.min_salary = 'Minimum salary is required and must be a positive number';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.min_salary)) {
      newErrors.min_salary = 'Please enter a valid salary amount (e.g., 25000 or 25000.50)';
    }

    // Validate max_salary when grade is 'Others'
    if (!formData.max_salary || isNaN(formData.max_salary) || Number(formData.max_salary) <= 0) {
      newErrors.max_salary = 'Maximum salary is required and must be a positive number';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.max_salary)) {
      newErrors.max_salary = 'Please enter a valid salary amount (e.g., 50000 or 50000.50)';
    }

    // Additional validation to ensure max_salary is not less than min_salary
    if (formData.min_salary && formData.max_salary && 
        Number(formData.max_salary) < Number(formData.min_salary)) {
      newErrors.max_salary = 'Maximum salary cannot be less than minimum salary';
    }
  }
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

const convertKeysToSnakeCase = (rows, masterData) => {
  // console.log("Converting masterData:", masterData);
  // console.log("Using masterData:",  masterData?.positionTitleOptions);
  const asNumberOrZero = (v) =>
    v === "" || v == null ? 0 : Number(v);

    const findId = (list, nameKey, idKey, value) => {
      if (!Array.isArray(list) || !value) return null;

      const normalize = (v) =>
        String(v || "").toLowerCase().trim().replace(/\s+/g, " "); // remove extra spaces/newlines

      const item = list.find(
        (obj) => obj && normalize(obj[nameKey]) === normalize(value)
      );
    // console.log("Item found for",value,item)
      return item ? item[idKey] : null;
    };

  return rows.map((item) => {

   // console.log("GradeId",item["Grade ID"])
    // 🟢 Grade ID lookup
    const gradeIdNum =
      Number(
        findId(
          masterData?.allGrades,
          "job_scale",       // display column in hidden sheet
          "job_grade_id",    // actual id
          item["Grade ID"]   // value from Excel
        )
      ) || 0;

    const minSalary =
      gradeIdNum === 0 ? asNumberOrZero(item["Min Salary"]) : null;

    const maxSalary =
      gradeIdNum === 0 ? asNumberOrZero(item["Max Salary"]) : null;

    return {
      requisition_id: item["Requisition ID"] ?? null,
      //position_title: item["Position Title"] ?? null,
      position_title: findId(
        masterData.positionTitleOptions,
        "name",
        "id",
        item["Position Title"]
      ),
      dept_id: findId(masterData.departmentOptions, "department_name", "department_id", item["Department"]),
      country_id: findId(masterData.allCountries, "country_name", "country_id", item["Country"]),
      state_id: findId(masterData.allStates, "state_name", "state_id", item["State"]),
      city_id: findId(masterData.allCities, "city_name", "city_id", item["City"]),
      location_id: findId(masterData.allLocations, "location_name", "location_id", item["Location"]),
      description: item["Description"] ?? null,
      roles_responsibilities: item["Roles & Responsibilities"] ?? null,
      grade_id: gradeIdNum || null,   // ✅ fixed
      employment_type: item["Employment Type"] ?? null,
      eligibility_age_min: item["Eligibility Age Min"] ?? null,
      eligibility_age_max: item["Eligibility Age Max"] ?? null,
      mandatory_qualification: item["Mandatory Qualification"]?.trim() || null,
      preferred_qualification: item["Preferred Qualification"]?.trim() || null,
      mandatory_experience: item["Mandatory Experience"] ?? null,
      preferred_experience: item["Preferred Experience"] ?? null,
      probation_period: item["Probation Period"] ?? null,
      documents_required: item["Documents Required"] ?? null,
      min_credit_score: item["Min Credit Score"] ?? null,
      no_of_vacancies: item["Number of Vacancies"] ?? null,
      selection_procedure: item["Selection Procedure"] ?? null,
      min_salary: minSalary,
      max_salary: maxSalary,
    };
  });
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
        // Validate each row with your Yup schema
        const validated = await jobSchema.validate(rows[i], { abortEarly: false });
        validRows.push(validated);
      } catch (err) {
        errorList.push({ row: i + 2, messages: err.errors });
      }
    }

    setErrors(errorList);

    if (validRows.length > 0) {
      // Convert human-readable Excel values to IDs
      // console.log("masterdata111",masterData)
      // console.log("validRows",validRows)
      const formattedData = convertKeysToSnakeCase(validRows, masterData);
      setJsonData(formattedData);
      // console.log("Formatted Excel Data:", formattedData);
      //return false;
    }
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
    let dataToUpload = [...jsonData];

    // Attach selected requisition ID if a requisition is selected
    if (selectedReqIndex !== null && reqs[selectedReqIndex]) {
      const selectedReqId = reqs[selectedReqIndex].requisition_id;
      dataToUpload = dataToUpload.map(obj => ({ ...obj, requisition_id: selectedReqId }));
    }

    // Map position codes from your static positions list
    // dataToUpload = dataToUpload.map(obj => {
    //   const matchedPosition = masterPositions.find(pos => pos.position_title === obj.position_title);
    //   return {
    //     ...obj,
    //     position_code: matchedPosition ? matchedPosition.position_code : null, // fallback if not found
    //   };
    // });

    // console.log("Uploading Excel Data:", dataToUpload);
    await apiService.uploadJobExcel(dataToUpload);
    setShowUploadModal(false);
    toast.success("Excel data posted successfully!");
    setFiles([]);
    setJsonData([]);
    navigate('/job-postings');
  } catch (error) {
    console.error("Failed to upload Excel data:", error);
    toast.error("Failed to post Excel data.");
  }
};

const handleDownloadTemplate = async () => {
  try {
    // Fetch master data
    const masterData = await apiService.getMasterData();
    // console.log("Master Data for Template:", masterData);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Template");
    const hiddenSheet = workbook.addWorksheet("MasterData");
    hiddenSheet.state = ""; // keep mappings hidden

    // ----------------------------
    // Headers for Template
    // ----------------------------
    const headers = [
      "Position Title",
      "Department",
      "Country",
      "State",
      "City",
      "Location",
      "Description",
      "Roles & Responsibilities",
      "Grade ID",
      "Employment Type",
      "Eligibility Age Min",
      "Eligibility Age Max",
      "Mandatory Qualification",
      "Preferred Qualification",
      "Mandatory Experience",
      "Preferred Experience",
      "Probation Period",
      "Documents Required",
      "Number of Vacancies",
      "Selection Procedure",
      "Min Credit Score",
      "Min Salary",
      "Max Salary",
    ];
    sheet.addRow(headers);

    // ----------------------------
    // Utility to write dropdown source into hidden sheet
    // ----------------------------
    let col = 1;
    const addMapping = (list, nameKey, idKey) => {
      if (!Array.isArray(list) || list.length === 0) return null;
      const startRow = 2;
      list.forEach((item, i) => {
        if (item && item[nameKey] && item[idKey] != null) {
          hiddenSheet.getCell(startRow + i, col).value = String(item[nameKey]).trim();
          hiddenSheet.getCell(startRow + i, col + 1).value = item[idKey];
        }
      });
      const startColLetter = hiddenSheet.getColumn(col).letter;
      const endColLetter = hiddenSheet.getColumn(col).letter;
      const endRow = startRow + list.length - 1;

      const range = `MasterData!$${startColLetter}$${startRow}:$${endColLetter}$${endRow}`;
      col += 2;
      return range;
    };
// console.log("positionslist222",masterData.masterPositionsList)
    // ----------------------------
    // Populate hidden sheet with lists
    // ----------------------------
    const positionRange = addMapping(masterData.masterPositionsList, "positionName", "masterPositionId");
    const deptRange = addMapping(masterData.departments, "department_name", "department_id");
    const countryRange = addMapping(masterData.countries, "country_name", "country_id");
    const stateRange = addMapping(masterData.states, "state_name", "state_id");
    const cityRange = addMapping(masterData.cities, "city_name", "city_id");
    const locationRange = addMapping(masterData.locations, "location_name", "location_id");
    const gradeRange = addMapping(
      masterData.job_grade_data.map((g) => ({
        job_scale: g.job_scale?.trim(),
        job_grade_id: g.job_grade_id,
      })),
      "job_scale",
      "job_grade_id"
    );

    // ----------------------------
    // Static Employment Type dropdown
    // ----------------------------
    const employmentTypeOptions = ["Full-Time", "Part-Time", "Contract"];
    const employmentHiddenCol = col;
    employmentTypeOptions.forEach((item, i) => {
      hiddenSheet.getCell(i + 2, employmentHiddenCol).value = item;
    });
    const employmentColLetter = hiddenSheet.getColumn(employmentHiddenCol).letter;
    const employmentRange = `MasterData!$${employmentColLetter}$2:$${employmentColLetter}$${employmentTypeOptions.length + 1}`;
    col++;

    // ----------------------------
    // Add dropdown validations
    // ----------------------------
    const lastRow = 500;

    const applyDropdown = (sheetColIndex, range) => {
      if (!range) return;
      const colLetter = sheet.getColumn(sheetColIndex).letter;
      sheet.dataValidations.add(`${colLetter}2:${colLetter}${lastRow}`, {
        type: "list",
        allowBlank: true,
        formulae: [range],
      });
    };

    // Position Title (col 1)
    applyDropdown(1, positionRange);
    // Department (col 2)
    applyDropdown(2, deptRange);
    // Country (col 3)
    applyDropdown(3, countryRange);
    // State (col 4)
    applyDropdown(4, stateRange);
    // City (col 5)
    applyDropdown(5, cityRange);
    // Location (col 6)
    applyDropdown(6, locationRange);
    // Grade ID (col 9)
    applyDropdown(9, gradeRange);
    // Employment Type (col 10)
    applyDropdown(10, employmentRange);

    // ----------------------------
    // Download the workbook
    // ----------------------------
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "Job_Requisition_Template.xlsx");

  } catch (error) {
    console.error("Error downloading template:", error);
  }
};



  return (
    <Container fluid className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
         {editPositionId == null && (
            <div className="d-flex justify-content-between align-items-center mb-3 mx-2 buttons_div">
              <Button
                variant="outline-secondary"
                onClick={() => navigate("/job-postings")}
                style={{
                  padding: "6px 15px",
                  fontSize: "13px",
                  fontWeight: "400",
                  borderRadius: "6px"
                }}
              >
                ← Back
              </Button>
              <div>
                <h5 className='px-2' style={{ fontFamily: 'Noto Sans', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>Job Creation</h5>
              </div>
              <div className='d-flex gap-3'>
                <a className='downlaodfile'
                  
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownloadTemplate();
                  }}
                  style={{
                    border: "1px solid #FF7043",
                    backgroundColor: "transparent",
                    color: "#FF7043",
                    padding: "8px 15px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    minWidth: 0,
                    minHeight: 0,
                    whiteSpace: "nowrap",
                    fontSize: "13px",
                    fontWeight: "400",
                    right: "10px",
                    position: "relative",
                  }}
                >
                  <FontAwesomeIcon icon={faDownload} style={{ color: "#FF7043", fontSize: "1rem" }} />&nbsp;
                  <span> Download Bulk Template</span>
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
                    fontSize: "13px",
                    fontWeight: "400",
                    right: "10px",
                    position: "relative",
                  }}
                >
                  <FontAwesomeIcon icon={faUpload} style={{ color: "#FF7043", fontSize: "1rem" }} /> &nbsp;
              <span> Upload Bulk Jobs</span>
                </Button>
              </div>
            </div>
            )}
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
                stateOptions={filteredStates.map(s => ({ id: s.state_id, name: s.state_name }))}
                cityOptions={filteredCities.map(c => ({ id: c.city_id, name: c.city_name }))}
                locationOptions={filteredLocations.map(l => ({ id: l.location_id, name: l.location_name }))}
                gradeIdOptions={masterData.gradeIdOptions}
                positionTitleOptions={masterData.positionTitleOptions}
                employmentTypeOptions={masterData.employmentTypeOptions}
                mandatoryQualificationOptions={masterData.mandatoryQualificationOptions}
                preferredQualificationOptions={masterData.preferredQualificationOptions}
                requisitionData={reqs}
                gradeMeta={masterData.allGrades}
                readOnly={readOnly}
               positionList={masterPositions}
               relaxationPolicies={relaxationPolicies}
              />
            )}
          
        </Col>
      </Row>
      <Modal className='fontss' show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className='fonall'>Bulk Job Creation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="upload-section fontss">
            <div className="popform">
              <Form.Group className="mb-2 job-form">
                <Form.Label className="small mb-1 d-flex align-items-center fontss" style={{ gap: '0.4em' }}>
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
                  className='fw-300'
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
              className="rounded p-3 text-center mb-3 mt-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                cursor: 'pointer',
                minHeight: '60px',
                height: '90px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 'auto',
                width: '350px',
                border:'1px dashed #FF7043',
                backgroundColor: '#f5f5f5',
                borderStyle: 'dashed',
              }}
            >
              <FontAwesomeIcon icon={faUpload} size="1x" className="mb-2 text-muted" />
              <div style={{ color: '#757575', fontSize: '0.95rem' }}><span style={{ textDecoration: 'underline', color: '#FF7043', cursor: 'pointer' }}>click to browse</span></div>
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
