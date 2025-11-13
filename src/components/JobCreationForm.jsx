import React, { useState, useRef, useEffect } from 'react';
import { Button, OverlayTrigger, Popover, Overlay, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import RelaxationPolicyDetails from './RelaxationPolicyDetails';
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
  readOnly = false,
  positionList = [],
  showNextButton = false,
  relaxationPolicies = []
}) => {
  // Remove modal state, use popover instead

  const [showGradeInfo, setShowGradeInfo] = useState(false);
const gradeInfoRef = useRef(null);
const [showRelaxationModal, setShowRelaxationModal] = useState(false);
// Close popover whenever the selected grade changes or gets cleared
useEffect(() => {
  setShowGradeInfo(false);
}, [formData.grade_id]);
// console.log("Position List:", positionList);
  // Find the selected requisition's details (handle both string and number id)
  const selectedRequisition = requisitionData.find(
    (req) => String(req.requisition_id) === String(formData.requisition_id)
  );
  // Debug: log the selected requisition to help diagnose issues
  // console.log('Selected Requisition:', selectedRequisition);

  // Find the selected relaxation policy
  const selectedRelaxationPolicy = relaxationPolicies.find(
    (p) => String(p.job_relaxation_policy_id) === String(formData.job_relaxation_policy_id)
  );

  return (
    <div className="form-section p-4 mx-2 rounded-3" style={{ backgroundColor: '#fff', boxShadow: '0 10px 30px #1a2c7133' }}>
      {/* <h4 className="text-center mb-4 fonall">
        Job Posting
      </h4> */}
      <form className="job-form row gx-2" onSubmit={handleSubmit} style={{ fontSize: '0.9rem' }}>
        {/* Requisition ID */}
        
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          
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
            className="form-select custom-placeholder"
            value={formData.requisition_id || ""}   // bind to formData
            onChange={handleInputChange}
            disabled={!!formData.requisition_id}    // lock if preselected
          >
            <option value="">Select Requisition ID</option>
            {requisitionIdOptions.map((option) => {
              const reqDetails = requisitionData.find(
                (req) => String(req.requisition_id) === String(option.id)
              );
              return (
                <option key={option.id} value={option.id}>
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
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
  <label htmlFor="position_title" className="form-label">
    Position Title <span className="required-asterisk">*</span>
  </label>
  <select
    id="position_title"
    name="position_title"
    className="form-select"
    value={formData.position_title || ""}
    onChange={(e) => {
      const selectedTitle = e.target.value;

      // Save selected position title
      handleInputChange({ target: { name: "position_title", value: selectedTitle } });

      // Find the full object from positionList
      const selectedPosition = (positionList || []).find(
        
        (pos) => pos.position_title === selectedTitle
      );

      if (selectedPosition) {
        handleInputChange({
          target: { name: "description", value: selectedPosition.description ?? "" },
        });
      
        handleInputChange({
          target: { name: "grade_id", value: String(selectedPosition.jobGradeId ?? "") },
        });
      
        handleInputChange({
          target: { name: "position_code", value: selectedPosition.position_code ?? "" },
        });
      
        // If grade_id is not 0 → reset salary
        if (selectedPosition.jobGradeId && selectedPosition.jobGradeId !== 0) {
          handleInputChange({ target: { name: "min_salary", value: "" } });
          handleInputChange({ target: { name: "max_salary", value: "" } });
        }
        handleInputChange({
          target: { name: "dept_id", value: selectedPosition.deptId ?? "" },
        });
      }
    }}
    disabled={readOnly}
  >
    <option value="">Select Position Title</option>
    {(positionList || []).map((pos, idx) => (
      <option key={idx} value={pos.position_title}>
        {pos.position_title}
      </option>
    ))}
  </select>
  {errors.position_title && <small className="error">{errors.position_title}</small>}
</div>


        {/* Department */}
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="department" className="form-label">Department <span className="required-asterisk">*</span></label>
          <select
            id="department"
            name="dept_id"
            className="form-select"
            value={formData.dept_id}
            onChange={handleInputChange}
            disabled={readOnly}
          >
            <option value="">Select Department</option>
            {departmentOptions.map(option => (
              <option key={option.department_id || option.department_name} value={option.department_id}>{option.department_name}</option>
            ))}
          </select>
          {errors.dept_id && <small className="error">{errors.dept_id}</small>}
        </div>

        {/* Country */}
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="country" className="form-label">Country</label>
          <select
            id="country"
            name="country_id"
            className="form-select"
            value={formData.country_id}
            onChange={handleInputChange}
            disabled={readOnly}
          >
            <option value="">Select Country</option>
            {countryOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          {errors.country_id && <small className="error">{errors.country_id}</small>}
        </div>

        {/* State */}
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="state" className="form-label">State</label>
          <select
            id="state"
            name="state_id"
            className="form-select"
            value={formData.state_id}
            onChange={handleInputChange}
            disabled={readOnly}
          >
            <option value="">Select State</option>
            {stateOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          {errors.state_id && <small className="error">{errors.state_id}</small>}
        </div>

        {/* City */}
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="city" className="form-label">City</label>
          <select id="city" name="city_id" className="form-select" value={formData.city_id} disabled={readOnly} onChange={handleInputChange}>
            <option value="">Select City</option>
            {cityOptions.map(option => (
              <option key={option.id || option.name} value={option.id}>{option.name}</option>
            ))}
          </select>
          {errors.city_id && <small className="error">{errors.city_id}</small>}
        </div>

        {/* Location */}
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="location" className="form-label">Location</label>
          <select
            id="location"
            name="location_id"
            className="form-select"
            value={formData.location_id}
            onChange={handleInputChange}
            disabled={readOnly}
          >
            <option value="">Select Location</option>
            {locationOptions.map(option => (
              <option key={option.id || option.name} value={option.id}>{option.name}</option>
            ))}
          </select>
          {errors.location_id && <small className="error">{errors.location_id}</small>}
        </div>

        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="no_of_vacancies" className="form-label">Vacancies <span className="required-asterisk">*</span></label>
          <input
            type="number"
            className="form-control"
            id="no_of_vacancies"
            name="no_of_vacancies"
            value={formData.no_of_vacancies}
            onChange={handleInputChange}
            min="1"
            disabled={readOnly}
          />
          {errors.no_of_vacancies && <small className="error">{errors.no_of_vacancies}</small>}
        </div>

        {/* Grade ID */}
  <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
  
    <label htmlFor="grade_id" className="form-label">
      Grade/Scale <span className="required-asterisk">*</span>
    </label>


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

  <select
    id="grade_id"
    name="grade_id"
    className="form-select"
    value={formData.grade_id}
    onChange={handleInputChange}
    disabled={readOnly}
  >
    <option value="">Select Grade ID</option>
    {gradeIdOptions.map(option => (
      <option key={option.id || option.name} value={option.id}>{option.name}</option>
    ))}
  </select>
  {errors.grade_id && <small className="error">{errors.grade_id}</small>}
</div>


    <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
      <label htmlFor="min_salary" className="form-label">
        Min Salary <span className="required-asterisk">*</span>
      </label>
      <input
        type="text"
        id="min_salary"
        name="min_salary"
        className="form-control"
        value={
          formData.min_salary
            ? Number(formData.min_salary).toLocaleString("en-IN") // Indian format commas
            : ""
        }
        onChange={(e) => {
          // remove commas before storing in state
          const rawValue = e.target.value.replace(/,/g, "");
          if (!isNaN(rawValue)) {
            handleInputChange({
              target: { name: "min_salary", value: rawValue },
            });
          }
        }}
        disabled={!(formData.grade_id === "0" && !readOnly)}
      />
      {errors.min_salary && <div className="error">{errors.min_salary}</div>}
    </div>

    <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
      <label htmlFor="max_salary" className="form-label">
        Max Salary <span className="required-asterisk">*</span>
      </label>
      <input
        type="text"
        id="max_salary"
        name="max_salary"
        className="form-control"
        value={
          formData.max_salary
            ? Number(formData.max_salary).toLocaleString("en-IN") // comma formatting
            : ""
        }
        onChange={(e) => {
          // remove commas before storing
          const rawValue = e.target.value.replace(/,/g, "");
          if (!isNaN(rawValue)) {
            handleInputChange({
              target: { name: "max_salary", value: rawValue },
            });
          }
        }}
        disabled={!(formData.grade_id === "0" && !readOnly)}
      />
      {errors.max_salary && <div className="error">{errors.max_salary}</div>}
    </div>



        {/* Employment Type */}
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="employment_type" className="form-label">Employment Type <span className="required-asterisk">*</span></label>
          <select
            id="employment_type"
            name="employment_type"
            className="form-select"
            value={formData.employment_type}
            onChange={handleInputChange}
            disabled={readOnly}
          >
            <option value="">Select Employment Type</option>
            {employmentTypeOptions.map(option => (
              <option key={option.id || option.name} value={option.name}>{option.name}</option>
            ))}
          </select>
          {errors.employment_type && <small className="error">{errors.employment_type}</small>}
        </div>

        {/* Eligibility Age Min */}
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="eligibility_age_min" className="form-label">Eligibility Age Min <span className="required-asterisk">*</span></label>
          <input type="number" className="form-control" id="eligibility_age_min" disabled={readOnly} name="eligibility_age_min" value={formData.eligibility_age_min} onChange={handleInputChange} min="1" />
          {errors.eligibility_age_min && <small className="error">{errors.eligibility_age_min}</small>}
        </div>

        {/* Eligibility Age Max */}
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="eligibility_age_max" className="form-label">Eligibility Age Max <span className="required-asterisk">*</span></label>
          <input type="number" className="form-control" id="eligibility_age_max" disabled={readOnly} name="eligibility_age_max" value={formData.eligibility_age_max} onChange={handleInputChange} min="1" />
          {errors.eligibility_age_max && <small className="error">{errors.eligibility_age_max}</small>}
        </div>

        {/* Mandatory Experience */}
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="mandatory_experience" className="form-label">Mandatory Experience(Years) <span className="required-asterisk">*</span></label>
          <input type="number" className="form-control" disabled={readOnly} id="mandatory_experience" name="mandatory_experience" value={formData.mandatory_experience} onChange={handleInputChange} min="1" step="any"/>
          {errors.mandatory_experience && <small className="error">{errors.mandatory_experience}</small>}
        </div>

        {/* Preferred Experience */}
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="preferred_experience" className="form-label">Preferred Experience(Years)<span className="required-asterisk"></span></label>
          <input type="number" className="form-control" disabled={readOnly} id="preferred_experience" name="preferred_experience" value={formData.preferred_experience} onChange={handleInputChange} min="1" step="any"/>
          {errors.preferred_experience && <small className="error">{errors.preferred_experience}</small>}
        </div>

        {/* Probation Period */}
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="probation_period" className="form-label">Probation Period(Months) <span className="required-asterisk"></span></label>
          <input type="text" className="form-control" disabled={readOnly} id="probation_period" name="probation_period" value={formData.probation_period} onChange={handleInputChange} />
          {errors.probation_period && <small className="error">{errors.probation_period}</small>}
        </div>

        {/* Min Credit Score */}
        <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
          <label htmlFor="min_credit_score" className="form-label">Min Credit Score <span className="required-asterisk"></span></label>
          <input type="text" className="form-control" disabled={readOnly} id="min_credit_score" name="min_credit_score" value={formData.min_credit_score} onChange={handleInputChange} />
          {errors.min_credit_score && <small className="error">{errors.min_credit_score}</small>}
        </div>
        {/* <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
        <label htmlFor="job_relaxation_policy_id" className="form-label">
          Relaxation Policy <span className="required-asterisk">*</span>
        </label>
        <select
          id="job_relaxation_policy_id"
          name="job_relaxation_policy_id"
          className="form-select"
          value={formData.job_relaxation_policy_id || ""}
          onChange={handleInputChange}
          disabled={readOnly}
        >
          <option value="">Select Relaxation Policy</option>
          {relaxationPolicies.map((policy) => (
            <option
              key={policy.job_relaxation_policy_id}
              value={policy.job_relaxation_policy_id}
            >
              {policy.relaxation_policy_number}
            </option>
          ))}
        </select>
        {errors.job_relaxation_policy_id && (
          <small className="error">{errors.job_relaxation_policy_id}</small>
        )}
      </div> */}
    {/* Relaxation Policy */}
<div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
  <label htmlFor="job_relaxation_policy_id" className="form-label d-flex align-items-center">
    Relaxation Policy <span className="required-asterisk">*</span>

    {formData.job_relaxation_policy_id && (
      <button
        type="button"
        className="btn btn-link p-0 ms-2 d-inline-flex align-items-center"
        onClick={() => setShowRelaxationModal(true)}
        aria-label="Show Relaxation Policy details"
      >
        <FontAwesomeIcon icon={faInfoCircle} className="text-info" style={{ fontSize: '1.2rem' }} />
      </button>
    )}
  </label>

  <select
    id="job_relaxation_policy_id"
    name="job_relaxation_policy_id"
    className={`form-select ${errors.job_relaxation_policy_id ? "is-invalid" : ""}`}
    value={formData.job_relaxation_policy_id || ""}
    onChange={handleInputChange}
    disabled={readOnly}
  >
    <option value="">Select Relaxation Policy</option>
    {relaxationPolicies.map((policy) => (
      <option key={policy.job_relaxation_policy_id} value={policy.job_relaxation_policy_id}>
        {policy.relaxation_policy_number}
      </option>
    ))}
  </select>

  {errors.job_relaxation_policy_id && (
    <div className="invalid-feedback">{errors.job_relaxation_policy_id}</div>
  )}
</div>

      {/* Relaxation Policy Modal */}
      <Modal 
        show={showRelaxationModal} 
        onHide={() => setShowRelaxationModal(false)}
        size="lg"
        aria-labelledby="relaxation-policy-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="relaxation-policy-modal">
            Relaxation Policy Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <RelaxationPolicyDetails policy={selectedRelaxationPolicy} />
        
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRelaxationModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

        <div className='row p-0'>
          {/* Description */}
          <div className="col-12 col-md-6 col-lg-6 mb-4 formSpace">
            <label htmlFor="description" className="form-label">Description <span className="required-asterisk"></span></label>
            <textarea className="form-control" rows={6} id="description" name="description" disabled={readOnly} value={formData.description} onChange={handleInputChange} />
            {errors.description && <small className="error">{errors.description}</small>}
          </div>

          {/* Roles & Responsibilities */}
          <div className="col-12 col-md-6 col-lg-6 mb-4 formSpace">
            <label htmlFor="roles_responsibilities" className="form-label">Roles & Responsibilities <span className="required-asterisk">*</span></label>
            <textarea
              id="roles_responsibilities"
              name="roles_responsibilities"
              className="form-control"
              value={formData.roles_responsibilities}
              onChange={handleInputChange}
              disabled={readOnly}
              rows={6}
            />
            {errors.roles_responsibilities && <small className="error">{errors.roles_responsibilities}</small>}
          </div>
        </div>

        {/* Documents Required */}
        <div className="col-12 col-md-6 col-lg-6 mb-4 formSpace">
          <label htmlFor="documents_required" className="form-label">Documents Required <span className="required-asterisk">*</span></label>
          <textarea className="form-control" rows={6} disabled={readOnly} id="documents_required" name="documents_required" value={formData.documents_required} onChange={handleInputChange} />
          {errors.documents_required && <small className="error">{errors.documents_required}</small>}
        </div>

        {/* Selection Process */}
        <div className="col-12 col-md-6 col-lg-6 mb-4 formSpace">
          <label htmlFor="selection_procedure" className="form-label">Selection Process <span className="required-asterisk"></span></label>
          <textarea
            id="selection_procedure"
            name="selection_procedure"
            className="form-control"
            value={formData.selection_procedure}
            onChange={handleInputChange}
            disabled={readOnly}
            rows={6}
          />
          {errors.selection_procedure && <small className="error">{errors.selection_procedure}</small>}
        </div>
       
        {/* Mandatory Qualification */}
        <div className="col-12 col-md-6 col-lg-6 mb-4 formSpace">
          <label htmlFor="mandatory_qualification" className="form-label">Mandatory Qualification <span className="required-asterisk">*</span></label>
          <textarea
            id="mandatory_qualification"
            name="mandatory_qualification"
            className="form-control"
            value={formData.mandatory_qualification}
            onChange={handleInputChange}
            disabled={readOnly}
            rows={6}
          />
          {errors.mandatory_qualification && <small className="error">{errors.mandatory_qualification}</small>}
        </div>

        {/* Preferred Qualification */}
        <div className="col-12 col-md-6 col-lg-6 mb-4 formSpace">
          <label htmlFor="preferred_qualification" className="form-label">Preferred Qualification <span className="required-asterisk"></span></label>
          <textarea
            id="preferred_qualification"
            name="preferred_qualification"
            className="form-control"
            value={formData.preferred_qualification}
            onChange={handleInputChange}
            disabled={readOnly}
            rows={6}
          />
          {errors.preferred_qualification && <small className="error">{errors.preferred_qualification}</small>}
        </div>

        {!readOnly 
          // <div className="d-flex justify-content-end mt-1 gap-2 col-12" style={{ fontSize: '0.9rem' }}>
          //   {/* <Button variant="outline-secondary" onClick={handleCancel}>Clear</Button> */}
          //   <Button type="submit" className="text-white" style={{ backgroundColor: '#FF7043', borderColor: '#FF7043' }}>
          // { formData.position_id ? 'Update' : 'Save' }
          //   </Button>
          // </div>
        }

        {!readOnly && (
          <div className="d-flex justify-content-between mt-4">
            <Button 
              variant="secondary" 
              onClick={handleCancel}
              className="px-4"
            >
              Cancel
            </Button>
            
            <div>
              {showNextButton ? (
                <Button 
                  type="submit" 
                  className="text-white" 
                  style={{ backgroundColor: '#FF7043', borderColor: '#FF7043' }}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="text-white" 
                  style={{ backgroundColor: '#FF7043', borderColor: '#FF7043' }}
                >
                  {formData.position_id ? 'Update' : 'Save'}
                </Button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default JobCreationForm;