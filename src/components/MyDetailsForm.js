import React, { useState, useEffect } from 'react';

const MyDetailsForm = ({ setActiveTab }) => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    email: '',
    skills: '',
    totalExperience: '',
    currentDesignation: '',
    currentEmployer: '',
    address: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('formData');
    if (stored) {
      const parsed = JSON.parse(stored);
      setFormData({
        name: parsed.name || parsed.Name || '',
        dob: parsed.dob || parsed.DateOfBirth || '',
        email: parsed.email || parsed.Email || '',
        skills: parsed.skills || '',
        totalExperience: parsed.totalExperience || '',
        currentDesignation: parsed.currentDesignation || '',
        currentEmployer: parsed.currentEmployer || '',
        address: parsed.address || ''
      });
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      Name: formData.name,
      DateOfBirth: formData.dob,
      Email: formData.email,
      skills: formData.skills,
      currentEmployer: formData.currentEmployer,
      currentDesignation: formData.currentDesignation,
      totalExperience: formData.totalExperience,
      address: formData.address
    };

    localStorage.setItem('formData', JSON.stringify(payload));
    setActiveTab('details');
  };

  return (
    <div className="form-content-section text-start p-4 spaceform">
      <form className="row g-4" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <label htmlFor="name" className="form-label">Name *</label>
          <input type="text" className="form-control" id="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="col-md-4">
          <label htmlFor="dob" className="form-label">Date of Birth *</label>
          <input type="date" className="form-control" id="dob" value={formData.dob} onChange={handleChange} required />
        </div>
        <div className="col-md-4">
          <label htmlFor="email" className="form-label">Email *</label>
          <input type="email" className="form-control" id="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="col-md-4">
          <label htmlFor="skills" className="form-label">Skills</label>
          <textarea className="form-control" id="skills" rows="3" value={formData.skills} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label htmlFor="totalExperience" className="form-label">Total Experience</label>
          <input type="text" className="form-control" id="totalExperience" value={formData.totalExperience} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label htmlFor="currentDesignation" className="form-label">Current Designation</label>
          <input type="text" className="form-control" id="currentDesignation" value={formData.currentDesignation} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label htmlFor="currentEmployer" className="form-label">Current Employer</label>
          <input type="text" className="form-control" id="currentEmployer" value={formData.currentEmployer} onChange={handleChange} />
        </div>
        <div className="col-md-4">
          <label htmlFor="address" className="form-label">Address</label>
          <textarea className="form-control" id="address" rows="3" value={formData.address} onChange={handleChange} />
        </div>
        <div className="col-md-12">
          <button className="btn btn-primary btncolor" type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default MyDetailsForm;
