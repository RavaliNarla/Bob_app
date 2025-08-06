import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Dropdown, Spinner, Alert } from 'react-bootstrap';
import '../css/JobPosting.css';
import { apiService } from '../services/apiService';

// Inline SVG for ellipsis
const EllipsisIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 128 512"
    fill="currentColor"
    className="text-muted"
    style={{ verticalAlign: 'middle' }}
  >
    <path d="M64 144a56 56 0 1 1 0-112 56 56 0 1 1 0 112zm0 224c30.9 0 56 25.1 56 56s-25.1 56-56 56-56-25.1-56-56 25.1-56 56-56zm56-112c0 30.9-25.1 56-56 56s-56-25.1-56-56 25.1-56 56-56 56 25.1 56 56z" />
  </svg>
);

const JobPosting = () => {
  const [approvalStatus, setApprovalStatus] = useState('');
  const [jobBoards, setJobBoards] = useState({
    linkedin: false,
    careerPage: false,
    naukri: false,
    glassDoor: false,
    indeed: false,
    foundit: false,
    freshersWorld: false,
  });

  const [jobPostings, setJobPostings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
  useEffect(() => {
      const fetchJobPostings = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log('Attempting to fetch job postings...');
          const responseData = await apiService.getJobPost(); 
          
          console.log('API Response Data:', responseData);
          
          // Ensure the response has a `data` property that is an array
          if (responseData && Array.isArray(responseData.data)) {
            console.log('Successfully received job postings:', responseData.data.length);
            setJobPostings(responseData.data);
          } else {
            // This block will catch unexpected response formats
            console.error('API response format is incorrect:', responseData);
            setError('Failed to fetch job postings: Unexpected data format.');
          }
  
        } catch (err) {
          // This is the most crucial part to debug
          console.error("Caught an error during API call:", err);
          
          // Log the details of the error object
          if (err.response) {
            // Server responded with a status other than 2xx
            console.error("Error Response Status:", err.response.status);
            console.error("Error Response Data:", err.response.data);
            setError(`Failed to fetch job postings: Server Error ${err.response.status}`);
          } else if (err.request) {
            // Request was made but no response was received
            console.error("Error Request:", err.request);
            setError('Failed to fetch job postings: No response from server.');
          } else {
            // Something else happened in setting up the request
            console.error("Error Message:", err.message);
            setError(`Failed to fetch job postings: ${err.message}`);
          }
        } finally {
          setLoading(false);
        }
      };
  
      fetchJobPostings();
    }, []);
  

  const handleCheckboxChange = (e) => {
    setJobBoards({
      ...jobBoards,
      [e.target.name]: e.target.checked,
    });
  };

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');

  // Filter job postings based on search term
 const filteredJobPostings = jobPostings.filter(job => 
    (job.job_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.job_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <Container fluid className="p-4">
      {/* Title and Search Bar Row */}
      <div className="d-flex align-items-center justify-content-center mb-3">
        <h5 className="fw-bold me-3" style={{ marginBottom: '0.25rem' }}>All Requisites</h5>
        <div className="search-container" style={{ width: '100%', maxWidth: '400px' }}>
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search requisitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <Spinner animation="border" variant="primary" />
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
      <Card className="border-0 mb-4">
  {filteredJobPostings.map((job, index) => (
   <Row key={index} className="job-row border-bottom py-2 align-items-center text-muted">
   {/* Title + Bullets + Checkbox */}
   <Col xs={12} md={6} className="d-flex align-items-center">
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
     <Form.Check type="checkbox" className="form-check-orange me-2" />
     <span className="job-title fw-semibold text-dark">{job.job_title}</span>
   </Col>
 
   {/* Job Code */}
   <Col xs={6} md={2} className="job-detail">
     Job Code: {job.job_code}
   </Col>
 
   {/* Experience */}
   <Col xs={6} md={1} className="job-detail">
     Exp: {job.work_experience}
   </Col>
 
   {/* Positions */}
   <Col xs={6} md={1} className="job-detail">
     Positions: {job.no_of_positions}
   </Col>
 
   {/* Location + Actions */}
   <Col xs={6} md={2} className="d-flex justify-content-end align-items-center">
     <div className="location-cell me-3" title={`Location: ${job.location}`}>Location: {job.location}</div>
     <Dropdown align="end">
       <Dropdown.Toggle variant="light" size="sm" className="border-0 bg-transparent p-0 custom-dropdown">
         <EllipsisIcon />
       </Dropdown.Toggle>
       <Dropdown.Menu>
         <Dropdown.Item>View Details</Dropdown.Item>
         <Dropdown.Item>Edit</Dropdown.Item>
         <Dropdown.Divider />
         <Dropdown.Item className="text-danger">Delete</Dropdown.Item>
       </Dropdown.Menu>
     </Dropdown>
   </Col>
 </Row>
 
 
  ))}
</Card>

  )}
      {/* Job Posting Channels - Left Aligned */}
      <div className="mt-5 mb-4">
        <Row className="align-items-start">
          <Col xs={12} sm={12} md={8}>
            <div className="d-flex flex-wrap align-items-center">
              <Form.Label className="fw-bold me-3 mb-0" style={{ minWidth: '100px', alignSelf: 'flex-start', paddingTop: '4px' }}>
                Job Postings:
              </Form.Label>
              <div className="d-flex flex-wrap checkbtnspost" style={{ flex: 1 }}>
                {Object.entries(jobBoards).map(([key, value], idx) => (
                  <div key={idx} className="me-4 mb-2">
                    <Form.Check
                      type="checkbox"
                      label={key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())}
                      name={key}
                      checked={value}
                      onChange={handleCheckboxChange}
                      className="d-inline-block"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </div>



      {/* Approval Status */}
      <div className="d-flex align-items-center mb-4">
        <span className="fw-bold me-3">Approved Status</span>
        <Form.Select
          value={approvalStatus}
          onChange={(e) => setApprovalStatus(e.target.value)}
          style={{ width: 'auto', minWidth: '200px' }}
          className="ms-2"
        >
          <option value="">Select Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </Form.Select>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-3">
        <Button variant="outline-secondary">Cancel</Button>
        <Button
          style={{ backgroundColor: '#FF7043', borderColor: '#FF7043' }}
          className="text-white"
        >
          Save
        </Button>
      </div>
    </Container>
  );
};

export default JobPosting;
