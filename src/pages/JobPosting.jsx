import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Dropdown } from 'react-bootstrap';
import '../css/JobPosting.css';

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

  const jobPostings = [
    {
      id: 1,
      title: 'Java Developer with Kafka',
      code: 'JAVA0019',
      experience: '3-5 Yrs',
      positions: 5,
      location: 'Hyderabad',
    },
    {
      id: 2,
      title: 'Dot Net Programmer with ...',
      code: 'DNI0026',
      experience: '3 Yrs',
      positions: 2,
      location: 'Chennai',
    },
    {
      id: 3,
      title: 'WordPress Developer',
      code: 'WP0028',
      experience: '1 Yr',
      positions: 1,
      location: 'Chennai',
    },
    {
      id: 4,
      title: 'User Experience Designer',
      code: 'UXI0019',
      experience: '5-7 Yrs',
      positions: 1,
      location: 'Bangalore',
    },
    {
      id: 5,
      title: 'User Interface Designer',
      code: 'UI4274',
      experience: '1-2 Yrs',
      positions: 3,
      location: 'Pune',
    },
  ];

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
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
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
     <span className="job-title fw-semibold text-dark">{job.title}</span>
   </Col>
 
   {/* Job Code */}
   <Col xs={6} md={2} className="job-detail">
     Job Code: {job.code}
   </Col>
 
   {/* Experience */}
   <Col xs={6} md={1} className="job-detail">
     Exp: {job.experience}
   </Col>
 
   {/* Positions */}
   <Col xs={6} md={1} className="job-detail">
     Positions: {job.positions}
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


      {/* Job Posting Channels */}
      <div className="mt-5 mb-4">
        <Row className="align-items-center">
          <Col xs={12} sm="auto" className="mb-2 mb-sm-0">
            <h6 className="fw-bold mb-0">Job Postings</h6>
          </Col>
          <Col>
            <div className="d-flex flex-wrap align-items-center checklinks">
              {Object.entries(jobBoards).map(([key, value], idx) => (
                <div key={idx} className="me-4 mb-1">
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
          </Col>
        </Row>
      </div>


      {/* Approval Status */}
      <Form.Group controlId="approvalStatus" className="mb-4">
        <Form.Label className="fw-bold">Approval Status</Form.Label>
        <Form.Select
          value={approvalStatus}
          onChange={(e) => setApprovalStatus(e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </Form.Select>
      </Form.Group>

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
