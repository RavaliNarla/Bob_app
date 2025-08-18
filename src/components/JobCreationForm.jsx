import React, { useState,useRef,useEffect } from 'react';
import { Button, OverlayTrigger, Popover,Overlay} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const JobCreationForm = ({
  formData,
  errors,
  handleInputChange,
  handleSubmit,
  handleCancel,
  requisitionIdOptions = [],
  positionTitleOptions = [],
  departmentOptions = [],
  countryOptions = [],
  stateOptions = [],
  cityOptions = [],
  locationOptions = [],
  gradeIdOptions = [],
  employmentTypeOptions = [],
  gradeMeta = [],
  // New prop to receive full requisition data
  requisitionData = [],
}) => {
  // Remove modal state, use popover instead

  const [showGradeInfo, setShowGradeInfo] = useState(false);
const gradeInfoRef = useRef(null);

// Close popover whenever the selected grade changes or gets cleared
useEffect(() => {
  setShowGradeInfo(false);
}, [formData.grade_id]);

  // Find the selected requisition's details (handle both string and number id)
  const selectedRequisition = requisitionData.find(
    (req) => String(req.requisition_id) === String(formData.requisition_id)
  );
  // Debug: log the selected requisition to help diagnose issues
  // console.log('Selected Requisition:', selectedRequisition);

  return (
    <div className="form-section p-4 rounded-3" style={{ backgroundColor: '#fff' }}>
      <h4 className="text-center mb-4 fonall">
        Job Posting
      </h4>
      <form className="job-form row gx-2" onSubmit={handleSubmit} style={{ fontSize: '0.9rem' }}>
        {/* Requisition ID */}
        
        <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
          
            <label htmlFor="requisition_id" className="form-label">
              Requisition ID <span className="required-asterisk">*</span>
            </label>
            {formData.requisition_id && selectedRequisition && (
              <OverlayTrigger
                trigger="click"
                placement="right"
                rootClose
                overlay={
                  <Popover id="requisition-popover" style={{ minWidth: 250 }}>
                    <Popover.Header as="h3" style={{ fontSize: '1rem' }}>
                      {selectedRequisition.requisition_code || selectedRequisition.requisition_title || 'Requisition Details'}
                    </Popover.Header>
                    <Popover.Body style={{ fontSize: '0.85rem' }}>
                      <div><strong>Position Title:</strong> {selectedRequisition.requisition_title || selectedRequisition.requisition_title || '-'}</div>
                       <div><strong>Number of positions:</strong> {selectedRequisition.no_of_positions || selectedRequisition.no_of_positions || '-'}</div>
                      <div><strong>Start date:</strong> {selectedRequisition.registration_start_date || selectedRequisition.registration_start_date || '-'}</div>
                      <div><strong>End date:</strong> {selectedRequisition.registration_end_date || selectedRequisition.registration_end_date || '-'}</div>
                      

                      {/* <div><strong>Location:</strong> {selectedRequisition.city || selectedRequisition.city_name || '-'}, {selectedRequisition.state || selectedRequisition.state_name || '-'}, {selectedRequisition.country || selectedRequisition.country_name || '-'}</div>
                      <div><strong>Description:</strong> {selectedRequisition.description || '-'}</div>
                      <div><strong>Roles & Responsibilities:</strong> {selectedRequisition.roles_responsibilities || '-'}</div> */}
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
          
          <select
                id="requisition_id"
                name="requisition_id"
                className="form-select"
                value={formData.requisition_id}
                onChange={handleInputChange}
              >
                <option value="">Select Requisition ID</option>
                {requisitionIdOptions.map((option) => {
                  // Find matching requisition details for title
                  const reqDetails = requisitionData.find(
                    (req) => String(req.requisition_id) === String(option.id)
                  );
                  return (
                    <option key={option.name} value={option.id}>
                      {option.name} 
                      {reqDetails?.requisition_title ? ` - ${reqDetails.requisition_title}` : ""}
                    </option>
                  );
                })}
          </select>
          {errors.requisition_id  && <small className="error">{errors.requisition_id}</small>}
        </div>
        {/* The rest of your form fields go here */}
        
        {/* Position Title */}
        <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
          <label htmlFor="position_title" className="form-label">Position Title <span className="required-asterisk">*</span></label>
          <input
            type="text"
            id="position_title"
            name="position_title"
            className="form-control"
            value={formData.position_title}
            onChange={handleInputChange}
            placeholder="Enter Position Title"
          />
          {errors.position_title && <small className="error">{errors.position_title}</small>}
        </div>

        {/* Department */}
        <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
          <label htmlFor="department" className="form-label">Department <span className="required-asterisk">*</span></label>
          <select
            id="department"
            name="dept_id"
            className="form-select"
            value={formData.dept_id}
            onChange={handleInputChange}
          >
            <option value="">Select Department</option>
            {departmentOptions.map(option => (
              <option key={option.department_id || option.department_name} value={option.department_id}>{option.department_name}</option>
            ))}
          </select>
          {errors.dept_id && <small className="error">{errors.dept_id}</small>}
        </div>

        {/* Country */}
        <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
          <label htmlFor="country" className="form-label">Country <span className="required-asterisk">*</span></label>
          <select
            id="country"
            name="country_id"
            className="form-select"
            value={formData.country_id}
            onChange={handleInputChange}
          >
            <option value="">Select Country</option>
            {countryOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          {errors.country_id && <small className="error">{errors.country_id}</small>}
        </div>

        {/* State */}
        <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
          <label htmlFor="state" className="form-label">State <span className="required-asterisk">*</span></label>
          <select
            id="state"
            name="state_id"
            className="form-select"
            value={formData.state_id}
            onChange={handleInputChange}
          >
            <option value="">Select State</option>
            {stateOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          {errors.state_id && <small className="error">{errors.state_id}</small>}
        </div>

        {/* City */}
        <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
          <label htmlFor="city" className="form-label">City <span className="required-asterisk">*</span></label>
          <select id="city" name="city_id" className="form-select" value={formData.city_id} onChange={handleInputChange}>
            <option value="">Select City</option>
            {cityOptions.map(option => (
              <option key={option.id || option.name} value={option.id}>{option.name}</option>
            ))}
          </select>
          {errors.city_id && <small className="error">{errors.city_id}</small>}
        </div>

        {/* Location */}
        <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
          <label htmlFor="location" className="form-label">Location <span className="required-asterisk">*</span></label>
          <select
            id="location"
            name="location_id"
            className="form-select"
            value={formData.location_id}
            onChange={handleInputChange}
          >
            <option value="">Select Location</option>
            {locationOptions.map(option => (
              <option key={option.id || option.name} value={option.id}>{option.name}</option>
            ))}
          </select>
          {errors.location_id && <small className="error">{errors.location_id}</small>}
        </div>

        {/* Description */}
        <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
          <label htmlFor="description" className="form-label">Description <span className="required-asterisk"></span></label>
          <textarea className="form-control" id="description" name="description" value={formData.description} onChange={handleInputChange} />
          {errors.description && <small className="error">{errors.description}</small>}
        </div>

        {/* Roles & Responsibilities */}
        <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
          <label htmlFor="roles_responsibilities" className="form-label">Roles & Responsibilities <span className="required-asterisk">*</span></label>
          <textarea
            id="roles_responsibilities"
            name="roles_responsibilities"
            className="form-control"
            value={formData.roles_responsibilities}
            onChange={handleInputChange}
          />
          {errors.roles_responsibilities && <small className="error">{errors.roles_responsibilities}</small>}
        </div>

        <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
          <label htmlFor="no_of_vacancies" className="form-label">Number of Positions <span className="required-asterisk">*</span></label>
          <input
            type="number"
            className="form-control"
            id="no_of_vacancies"
            name="no_of_vacancies"
            value={formData.no_of_vacancies}
            onChange={handleInputChange}
            min="1"
          />
          {errors.no_of_vacancies && <small className="error">{errors.no_of_vacancies}</small>}
        </div>

        {/* Selection Process */}
        <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
          <label htmlFor="selection_procedure" className="form-label">Selection Process <span className="required-asterisk"></span></label>
          <textarea
            id="selection_procedure"
            name="selection_procedure"
            className="form-control"
            value={formData.selection_procedure}
            onChange={handleInputChange}
          />
          {errors.selection_procedure && <small className="error">{errors.selection_procedure}</small>}
        </div>

        {/* Grade ID */}
  <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
  <div className="d-flex align-items-center" style={{ gap: '0.4em' }}>
    <label htmlFor="grade_id" className="form-label m-0">
      Grade/Scale <span className="required-asterisk">*</span>
    </label>

    {formData.grade_id && (
      <>
        <button
          type="button"
          ref={gradeInfoRef}
          className="btn btn-link p-0 d-inline-flex align-items-center"
          onClick={(e) => {
            e.stopPropagation();          // don't bubble up
            setShowGradeInfo(v => !v);    // manual toggle
          }}
          aria-label="Show grade details"
        >
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="text-info"
            style={{ fontSize: '1.1em' }}
          />
        </button>

        <Overlay
          target={gradeInfoRef.current}
          show={showGradeInfo}
          placement="right"
          rootClose
          onHide={() => setShowGradeInfo(false)}
          transition={false}
          container={typeof document !== 'undefined' ? document.body : undefined}
          popperConfig={{
            strategy: 'fixed',
            modifiers: [
              { name: 'flip', enabled: false },
              { name: 'preventOverflow', options: { altAxis: true } },
            ],
          }}
        >
          <Popover id="grade-popover" style={{ minWidth: 220 }}>
            <Popover.Header as="h3" style={{ fontSize: '1rem' }}>
              Grade Details
            </Popover.Header>
            <Popover.Body style={{ fontSize: '0.85rem' }}>
              {(() => {
                const g = (gradeMeta || []).find(
                  x => String(x.job_grade_id) === String(formData.grade_id)
                );
                if (!g) return <div>No details available</div>;
                return (
                  <>
                    <div><strong>Scale:</strong> {g.job_scale ?? '-'}</div>
                    <div><strong>Min Salary:</strong> {g.min_salary ?? '-'}</div>
                    <div><strong>Max Salary:</strong> {g.max_salary ?? '-'}</div>
                  </>
                );
              })()}
            </Popover.Body>
          </Popover>
        </Overlay>
      </>
    )}
  </div>

  <select
    id="grade_id"
    name="grade_id"
    className="form-select"
    value={formData.grade_id}
    onChange={handleInputChange}
  >
    <option value="">Select Grade ID</option>
    {gradeIdOptions.map(option => (
      <option key={option.id || option.name} value={option.id}>{option.name}</option>
    ))}
  </select>
  {errors.grade_id && <small className="error">{errors.grade_id}</small>}
</div>




        {/* Employment Type */}
        <div className="col-12 col-md-6 col-lg-3 mb-2 formSpace">
          <label htmlFor="employment_type" className="form-label">Employment Type <span className="required-asterisk">*</span></label>
          <select
            id="employment_type"
            name="employment_type"
            className="form-select"
            value={formData.employment_type}
            onChange={handleInputChange}
          >
            <option value="">Select Employment Type</option>
            {employmentTypeOptions.map(option => (
              <option key={option.id || option.name} value={option.name}>{option.name}</option>
            ))}
          </select>
          {errors.employment_type && <small className="error">{errors.employment_type}</small>}
        </div>

        {/* Eligibility Age Min */}
        <div className="col-12 col-md-6 col-lg-3 mb-3 formSpace">
          <label htmlFor="eligibility_age_min" className="form-label">Eligibility Age Min <span className="required-asterisk">*</span></label>
          <input type="number" className="form-control" id="eligibility_age_min" name="eligibility_age_min" value={formData.eligibility_age_min} onChange={handleInputChange} min="1" />
          {errors.eligibility_age_min && <small className="error">{errors.eligibility_age_min}</small>}
        </div>

        {/* Eligibility Age Max */}
        <div className="col-12 col-md-6 col-lg-3 mb-3 formSpace">
          <label htmlFor="eligibility_age_max" className="form-label">Eligibility Age Max <span className="required-asterisk">*</span></label>
          <input type="number" className="form-control" id="eligibility_age_max" name="eligibility_age_max" value={formData.eligibility_age_max} onChange={handleInputChange} min="1" />
          {errors.eligibility_age_max && <small className="error">{errors.eligibility_age_max}</small>}
        </div>

        {/* Mandatory Qualification */}
        <div className="col-12 col-md-6 col-lg-3 mb-3 formSpace">
          <label htmlFor="mandatory_qualification" className="form-label">Mandatory Qualification <span className="required-asterisk">*</span></label>
          <textarea
            id="mandatory_qualification"
            name="mandatory_qualification"
            className="form-control"
            value={formData.mandatory_qualification}
            onChange={handleInputChange}
          />
          {errors.mandatory_qualification && <small className="error">{errors.mandatory_qualification}</small>}
        </div>

        {/* Preferred Qualification */}
        <div className="col-12 col-md-6 col-lg-3 mb-3 formSpace">
          <label htmlFor="preferred_qualification" className="form-label">Preferred Qualification <span className="required-asterisk"></span></label>
          <textarea
            id="preferred_qualification"
            name="preferred_qualification"
            className="form-control"
            value={formData.preferred_qualification}
            onChange={handleInputChange}
          />
          {errors.preferred_qualification && <small className="error">{errors.preferred_qualification}</small>}
        </div>

        {/* Mandatory Experience */}
        <div className="col-12 col-md-6 col-lg-3 mb-3 formSpace">
          <label htmlFor="mandatory_experience" className="form-label">Mandatory Experience(Years) <span className="required-asterisk">*</span></label>
          <input type="number" className="form-control" id="mandatory_experience" name="mandatory_experience" value={formData.mandatory_experience} onChange={handleInputChange} min="1" step="any"/>
          {errors.mandatory_experience && <small className="error">{errors.mandatory_experience}</small>}
        </div>

        {/* Preferred Experience */}
        <div className="col-12 col-md-6 col-lg-3 mb-3 formSpace">
          <label htmlFor="preferred_experience" className="form-label">Preferred Experience(Years)<span className="required-asterisk"></span></label>
          <input type="number" className="form-control" id="preferred_experience" name="preferred_experience" value={formData.preferred_experience} onChange={handleInputChange} min="1" step="any"/>
          {errors.preferred_experience && <small className="error">{errors.preferred_experience}</small>}
        </div>

        {/* Probation Period */}
        <div className="col-12 col-md-6 col-lg-3 mb-3 formSpace">
          <label htmlFor="probation_period" className="form-label">Probation Period(Months) <span className="required-asterisk"></span></label>
          <input type="text" className="form-control" id="probation_period" name="probation_period" value={formData.probation_period} onChange={handleInputChange} />
          {errors.probation_period && <small className="error">{errors.probation_period}</small>}
        </div>

        {/* Documents Required */}
        <div className="col-12 col-md-6 col-lg-3 mb-3 formSpace">
          <label htmlFor="documents_required" className="form-label">Documents Required <span className="required-asterisk">*</span></label>
          <textarea className="form-control" id="documents_required" name="documents_required" value={formData.documents_required} onChange={handleInputChange} />
          {errors.documents_required && <small className="error">{errors.documents_required}</small>}
        </div>

        {/* Min Credit Score */}
        <div className="col-12 col-md-6 col-lg-3 mb-3 formSpace">
          <label htmlFor="min_credit_score" className="form-label">Min Credit Score <span className="required-asterisk"></span></label>
          <input type="text" className="form-control" id="min_credit_score" name="min_credit_score" value={formData.min_credit_score} onChange={handleInputChange} />
          {errors.min_credit_score && <small className="error">{errors.min_credit_score}</small>}
        </div>

        <div className="d-flex justify-content-end mt-1 gap-2 col-12" style={{ fontSize: '0.9rem' }}>
          <Button variant="outline-secondary" onClick={handleCancel}>Clear</Button>
          <Button type="submit" className="text-white" style={{ backgroundColor: '#FF7043', borderColor: '#FF7043' }}>
         { formData.position_id ? 'Update' : 'Save' }
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobCreationForm;