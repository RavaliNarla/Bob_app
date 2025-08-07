import React from 'react';
import { Button } from 'react-bootstrap';

const JobRequisitionForm = ({
  formData,
  errors,
  handleInputChange,
  handleSubmit,
  handleCancel,
  // Dropdown options passed as props
  requisitionIdOptions = [],
  departmentOptions = [],
  countryOptions = [],
  stateOptions = [],
  cityOptions = [],
  locationOptions = [],
  gradeIdOptions = [],
  employmentTypeOptions = [],
  mandatoryQualificationOptions = [],
  preferredQualificationOptions = [],
}) => {
  return (
    <div className="form-section p-3 rounded-3" style={{
      backgroundColor: '#fff',
      maxWidth: '1400px',
      margin: '0 auto',
      boxShadow: '0 0 15px rgba(0,0,0,0.1)',
      fontSize: '0.9rem'
    }}>
      <h4 className="text-center mb-3" style={{ fontSize: '1.25rem', color: '#FF7043' }}>
        Job Requisition Form
      </h4>
      <form className="job-form row gx-3" onSubmit={handleSubmit} style={{ fontSize: '0.9rem' }}>
        <div className="col-md-3">
          {/* Requisition ID */}
          <div className="col-md-10 mb-2">
            <label htmlFor="requisition_id" className="form-label">Requisition ID <span className="required-asterisk">*</span></label>
            <select
              id="requisition_id"
              name="requisition_id"
              className="form-select"
              value={formData.requisition_id}
              onChange={handleInputChange}
            >
              <option value="">Select Requisition ID</option>
              {requisitionIdOptions.map(option => (
                <option key={option.id} value={option.name}>{option.name}</option>
              ))}
            </select>
            {errors.requisition_id && <small className="error">{errors.requisition_id}</small>}
          </div>
          {/* Position Title */}
          <div className="col-md-10 mb-2">
            <label htmlFor="position_title" className="form-label">Position Title <span className="required-asterisk">*</span></label>
            <input type="text" className="form-control" id="position_title" name="position_title" value={formData.position_title} onChange={handleInputChange} />
            {errors.position_title && <small className="error">{errors.position_title}</small>}
          </div>
          {/* Department */}
          <div className="col-md-10 mb-2">
            <label htmlFor="department" className="form-label">Department <span className="required-asterisk">*</span></label>
            <select
              id="department"
              name="department"
              className="form-select"
              value={formData.department}
              onChange={handleInputChange}
            >
              <option value="">Select Department</option>
              {departmentOptions.map(option => (
                <option key={option.department_id} value={option.department_name}>{option.department_name}</option>
              ))}
            </select>
            {errors.department && <small className="error">{errors.department}</small>}
          </div>
          {/* Country */}
          <div className="col-md-10 mb-2">
            <label htmlFor="country" className="form-label">Country <span className="required-asterisk">*</span></label>
            <select
              id="country"
              name="country"
              className="form-select"
              value={formData.country}
              onChange={handleInputChange}
            >
              <option value="">Select Country</option>
              {countryOptions.map(option => (
                <option key={option.country_id} value={option.country_name}>{option.country_name}</option>
              ))}
            </select>
            {errors.country && <small className="error">{errors.country}</small>}
          </div>
          {/* State */}
          <div className="col-md-10 mb-2">
            <label htmlFor="state" className="form-label">State <span className="required-asterisk">*</span></label>
            <select
              id="state"
              name="state"
              className="form-select"
              value={formData.state}
              onChange={handleInputChange}
            >
              <option value="">Select State</option>
              {stateOptions.map(option => (
                <option key={option.state_id} value={option.state_name}>{option.state_name}</option>
              ))}
            </select>
            {errors.state && <small className="error">{errors.state}</small>}
          </div>
        </div>
        <div className="col-md-3">
          {/* City */}
          <div className="col-md-10 mb-2">
            <label htmlFor="city" className="form-label">City <span className="required-asterisk">*</span></label>
            <select id="city" name="city" className="form-select" value={formData.city} onChange={handleInputChange}>
              <option value="">Select City</option>
              {cityOptions.map(option => (
                <option key={option.city_id} value={option.city_name}>{option.city_name}</option>
              ))}
            </select>
            {errors.city && <small className="error">{errors.city}</small>}
          </div>
          {/* Location */}
          <div className="col-md-10 mb-2">
            <label htmlFor="location" className="form-label">Location <span className="required-asterisk">*</span></label>
            <select
              id="location"
              name="location"
              className="form-select"
              value={formData.location}
              onChange={handleInputChange}
            >
              <option value="">Select Location</option>
              {locationOptions.map(option => (
                <option key={option.location_id} value={option.location_name}>{option.location_name}</option>
              ))}
            </select>
            {errors.location && <small className="error">{errors.location}</small>}
          </div>
          {/* Description */}
          <div className="col-md-10 mb-2">
            <label htmlFor="description" className="form-label">Description <span className="required-asterisk">*</span></label>
            <textarea className="form-control" id="description" name="description" value={formData.description} onChange={handleInputChange} />
            {errors.description && <small className="error">{errors.description}</small>}
          </div>
          {/* Roles & Responsibilities */}
          <div className="col-md-10 mb-2">
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
          {/* Grade ID */}
          <div className="col-md-10 mb-2">
            <label htmlFor="grade_id" className="form-label">Grade ID <span className="required-asterisk">*</span></label>
            <select
              id="grade_id"
              name="grade_id"
              className="form-select"
              value={formData.grade_id}
              onChange={handleInputChange}
            >
              <option value="">Select Grade ID</option>
              {gradeIdOptions.map(option => (
                <option key={option.id} value={option.name}>{option.name}</option>
              ))}
            </select>
            {errors.grade_id && <small className="error">{errors.grade_id}</small>}
          </div>
        </div>
        <div className="col-md-3">
          {/* Employment Type */}
          <div className="col-md-10 mb-2">
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
                <option key={option.id} value={option.name}>{option.name}</option>
              ))}
            </select>
            {errors.employment_type && <small className="error">{errors.employment_type}</small>}
          </div>
          {/* Eligibility Age Min */}
          <div className="col-md-10 mb-2">
            <label htmlFor="eligibility_age_min" className="form-label">Eligibility Age Min <span className="required-asterisk">*</span></label>
            <input type="number" className="form-control" id="eligibility_age_min" name="eligibility_age_min" value={formData.eligibility_age_min} onChange={handleInputChange} />
            {errors.eligibility_age_min && <small className="error">{errors.eligibility_age_min}</small>}
          </div>
          {/* Eligibility Age Max */}
          <div className="col-md-10 mb-2">
            <label htmlFor="eligibility_age_max" className="form-label">Eligibility Age Max <span className="required-asterisk">*</span></label>
            <input type="number" className="form-control" id="eligibility_age_max" name="eligibility_age_max" value={formData.eligibility_age_max} onChange={handleInputChange} />
            {errors.eligibility_age_max && <small className="error">{errors.eligibility_age_max}</small>}
          </div>
          {/* Mandatory Qualification */}
          <div className="col-md-10 mb-2">
            <label htmlFor="mandatory_qualification" className="form-label">Mandatory Qualification <span className="required-asterisk">*</span></label>
            <select
              id="mandatory_qualification"
              name="mandatory_qualification"
              className="form-select"
              value={formData.mandatory_qualification}
              onChange={handleInputChange}
            >
              <option value="">Select Qualification</option>
              {mandatoryQualificationOptions.map(option => (
                <option key={option.id} value={option.name}>{option.name}</option>
              ))}
            </select>
            {errors.mandatory_qualification && <small className="error">{errors.mandatory_qualification}</small>}
          </div>
          {/* Preferred Qualification */}
          <div className="col-md-10 mb-2">
            <label htmlFor="preferred_qualification" className="form-label">Preferred Qualification <span className="required-asterisk">*</span></label>
            <select
              id="preferred_qualification"
              name="preferred_qualification"
              className="form-select"
              value={formData.preferred_qualification}
              onChange={handleInputChange}
            >
              <option value="">Select Qualification</option>
              {preferredQualificationOptions.map(option => (
                <option key={option.id} value={option.name}>{option.name}</option>
              ))}
            </select>
            {errors.preferred_qualification && <small className="error">{errors.preferred_qualification}</small>}
          </div>
        </div>
        <div className="col-md-3">
          {/* Mandatory Experience */}
          <div className="col-md-10 mb-2">
            <label htmlFor="mandatory_experience" className="form-label">Mandatory Experience <span className="required-asterisk">*</span></label>
            <input type="number" className="form-control" id="mandatory_experience" name="mandatory_experience" value={formData.mandatory_experience} onChange={handleInputChange} />
            {errors.mandatory_experience && <small className="error">{errors.mandatory_experience}</small>}
          </div>
          {/* Preferred Experience */}
          <div className="col-md-10 mb-2">
            <label htmlFor="preferred_experience" className="form-label">Preferred Experience <span className="required-asterisk">*</span></label>
            <input type="number" className="form-control" id="preferred_experience" name="preferred_experience" value={formData.preferred_experience} onChange={handleInputChange} />
            {errors.preferred_experience && <small className="error">{errors.preferred_experience}</small>}
          </div>
          {/* Probation Period */}
          <div className="col-md-10 mb-2">
            <label htmlFor="probation_period" className="form-label">Probation Period <span className="required-asterisk">*</span></label>
            <input type="text" className="form-control" id="probation_period" name="probation_period" value={formData.probation_period} onChange={handleInputChange} />
            {errors.probation_period && <small className="error">{errors.probation_period}</small>}
          </div>
          {/* Documents Required */}
          <div className="col-md-10 mb-2">
            <label htmlFor="documents_required" className="form-label">Documents Required <span className="required-asterisk">*</span></label>
            <textarea className="form-control" id="documents_required" name="documents_required" value={formData.documents_required} onChange={handleInputChange} />
            {errors.documents_required && <small className="error">{errors.documents_required}</small>}
          </div>
          {/* Min Credit Score */}
          <div className="col-md-10 mb-2">
            <label htmlFor="min_credit_score" className="form-label">Min Credit Score <span className="required-asterisk">*</span></label>
            <input type="text" className="form-control" id="min_credit_score" name="min_credit_score" value={formData.min_credit_score} onChange={handleInputChange} />
            {errors.min_credit_score && <small className="error">{errors.min_credit_score}</small>}
          </div>
        </div>
        <div className="d-flex justify-content-end mt-4 gap-3" style={{ fontSize: '0.9rem' }}>
          <Button variant="outline-secondary" onClick={handleCancel}>Cancel</Button>
          <Button type="submit" className="text-white" style={{ backgroundColor: '#FF7043', borderColor: '#FF7043' }}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobRequisitionForm;