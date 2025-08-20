import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Badge,
  Row,
  Col,
  Offcanvas,
  Tab,
  Nav,
} from "react-bootstrap";
import "../css/Drawer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import InterviewList from './InterviewList';
// import axios from "axios";
// import "../styles/ScheduleInterview.css";
// import ScheduleInterview from "./ScheduleInterview";
import {
  faXmark,         // close icon alternative for IoMdClose
  faArrowLeft,
  faArrowRight,
  faMarker,
} from "@fortawesome/free-solid-svg-icons";
// import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons";
import profile from '../assets/profile_icon.png';

function Drawer({ isOpen, toggleDrawer, candidate, handleShortlist, ratedCandidates }) {
  console.log('candidate', candidate);
  const handleCloseIconClick = () => {
    toggleDrawer();
  };
  const [meetingType, setMeetingType] = useState("online");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingLink, setMeetingLink] = useState(
    "https://meet.google.com/jgn-bxng-zpp"
  );
  const [attendees, setAttendees] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const skills = candidate?.skills?.split(",");
  const [isInterviewListOpen, setIsInterviewListOpen] = useState(false);
  const handleEditClick = () => { };
  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log({
    //   date,
    //   startTime,
    //   endTime,
    //   meetingType,
    //   meetingLink,
    //   attendees,
    //   message,
    // });

    const interviewData = {
      date,
      startTime,
      endTime,
      meetingType,
      meetingLink,
      attendees,
      message,
    };

    // Retrieve existing interviews from localStorage
    const existingInterviews = JSON.parse(localStorage.getItem('interviewData')) || [];

    // Combine existing interviews with the static interviews
    const finalInterviews = [
      ...existingInterviews,
      {
        ...interviewData,
        round: 'Technical Round - 1',
        scheduledBy: 'Dheemanth',
        interviewer: 'Sachin',
      },
      // {
      //   ...interviewData,
      //   round: 'Technical Round - 2',
      //   interviewer: 'Dheemanth',
      // },
    ];
    localStorage.setItem('interviewData', JSON.stringify(finalInterviews));
    setIsInterviewListOpen(true);
  };

  const [inputValue, setInputValue] = useState("");

  const addAttendee = (event) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      event.preventDefault();
      setAttendees([...attendees, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeAttendee = (indexToRemove) => {
    const updatedAttendees = attendees.filter(
      (_, index) => index !== indexToRemove
    );
    setAttendees(updatedAttendees);
  };

  const shortlistFunction = () => {
    handleShortlist(candidate);
  };

  // const handleClick=()=>{
  //   axios.get("http://localhost:4000/sendMail")
  //   .then(response => response.data) // Get response data
  //   .then(data => {
  //       console.log("mail send successfully")
  //   //   handleSuccessToast("Job Req has been submitted successfully");
  //   //   console.log(jobPostings)
  //   //   nav('/review', { state: { responseData } }); // Redirect to the review page
  //   //   setSelectedFiles([]); // Optional: Clear the selected files
  //   })
  //   .catch(error => {
  //   //   handleErrorToast("Error submitting job description");
  //     console.error("Submission error:", error);
  //   });
  // }


  const sendMail = () => {
    // Parse startTime and endTime as Date objects
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    // Calculate duration in minutes
    const durationInMinutes = (end - start) / 1000 / 60;
    let reqBody = {
      candidate: candidate?.firstname + ' ' + candidate?.lastname,
      date: date,
      startTime: startTime,
      duration: `${durationInMinutes} minutes`,
      endTime: endTime,
      attendees: attendees[0],
      message: message,
      meetingType: meetingType

    }


      // axios.post("http://localhost:4000/sendMail", reqBody)
      .then(response => response.data) // Get response data
      .then(data => {
        console.log("mail send successfully")
        //   handleSuccessToast("Job Req has been submitted successfully");
        //   console.log(jobPostings)
        //   nav('/review', { state: { responseData } }); // Redirect to the review page
        //   setSelectedFiles([]); // Optional: Clear the selected files
      })
      .catch(error => {
        //   handleErrorToast("Error submitting job description");
        console.error("Submission error:", error);
      });
  }

  return (
    <>
      <Offcanvas
        show={isOpen}
        onHide={toggleDrawer}
        placement="end"
        // style={{ width: "1200px" }}
        className="drawer-slide custom-offcanvas"
      >
        <Offcanvas.Body className="p-0">
          <Card style={{ borderRadius: "10px", height: "100vh" }} className="fontdraw">
            <div className="drawer_main">
              {/* <IoMdClose
                className="close_icon"
                onClick={handleCloseIconClick}
              /> */}

              <FontAwesomeIcon icon={faXmark} className="close_icon" onClick={handleCloseIconClick} />
              <div className="d-flex gap-4">
                <div>
                  {/* <img
                    src={candidate.profile_image}
                    alt="Profile"
                    className="rect-Profile"
                    style={{ width: "70px", height: "70px" }}
                  /> */}
                  <img src={profile} alt={candidate.full_name} className="candidate_image me-3" />
                </div>
                <div>
                  <h5 className="mb-0">
                    {candidate?.full_name} {candidate?.lastname}
                  </h5>
                  <p className="text-muted mb-0 py-1">
                    {candidate?.address}
                  </p>
                  <p className="text-muted mb-0">{candidate?.phone}</p>
                </div>
                <div className="px-3">
                  <Badge className="Active_round_pill">Active</Badge>
                </div>
              </div>
              <div>
                {/* <Row>
                  <Col>
                    <div className="d-flex justify-content-between mt-3 align-items-center">
                      <div className="d-flex align-items-center">
                        <img
                          //   src={require("../Assets/Warranty.png")}
                          style={{ height: "20px" }}
                        />
                        <p className="insight_text_14px px-1">
                          {ratedCandidates?.find(ratedCandidate => candidate?.applicant_id === ratedCandidate?.applicant_id)?.ratingDescription}
                        </p>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="button-container mx-2">
                          {candidate?.profileStatus === "shortlisted" ? (
                            <>
                              {" "}
                              <Button className="custom_btn shortlisted_button">
                                <FaRegHeart
                                  style={{
                                    marginTop: "-3px",
                                    marginRight: "3px",
                                  }}
                                />{" "}
                                <FontAwesomeIcon icon={faRegularHeart} />
                                Shortlisted
                              </Button>
                            </>
                          ) : (
                            <>
                              {" "}
                              <Button
                                className="custom_btn reject_button"
                                onClick={() => {
                                  shortlistFunction();
                                }}
                              >
                                <FontAwesomeIcon icon={faRegularHeart} />
                                <FaRegHeart
                                  style={{
                                    marginTop: "-3px",
                                    marginRight: "3px",
                                  }}
                                />{" "}
                                Shortlist
                              </Button>
                            </>
                          )}

                          <Button className="custom_btn reject_button">
                            <FontAwesomeIcon icon={faMarker} />
                            <FaMarker
                              style={{ marginTop: "-3px", marginRight: "3px" }}
                            />{" "}
                            Rejected
                          </Button>
                        </div>
                        <div className="d-flex gap-2">
                          <FontAwesomeIcon icon={faArrowLeft} />
                          <FaArrowLeft
                            className="arrow_icon"
                            style={{
                              marginRight: "10px",
                              width: "40px",
                              height: "40px",
                              padding: "8px",
                              color: "black",
                            }}
                          />
                          <FontAwesomeIcon icon={faArrowRight} />
                          <FaArrowRight
                            className="arrow_icon"
                            style={{
                              width: "40px",
                              height: "40px",
                              padding: "8px",
                              color: "black",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row> */}
              </div>
            </div>
            {/* Navigation Links */}
            <Card>
              <Tab.Container
                activeKey={activeTab}
                onSelect={(selectedKey) => setActiveTab(selectedKey)}
              >
                <Nav variant="tabs" className="drawer-nav">
                  <Nav.Item>
                    <Nav.Link eventKey="details">Details</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="resume">Resume</Nav.Link>
                  </Nav.Item>
                  {/* <Nav.Item>
                    <Nav.Link eventKey="schedule">Schedule Interview</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="evaluation">Evaluation</Nav.Link>
                  </Nav.Item> */}
                </Nav>
                <CardBody>
                  <Tab.Content>
                    <Tab.Pane eventKey="details">
                      <Row className="mt-3">
                        <Col md={6}>
                          {/* Basic Information Card */}
                          <div className="info-card">
                            <div className="info-header d-flex justify-content-between align-items-center">
                              <h6 style={{ color: '#FF7043' }}>Basic Information</h6>
                            </div>
                            <Row>
                              <Col md={12}>
                                <div className="head-section">NAME:</div>
                                <p className="sum-data">
                                  {candidate?.full_name}
                                </p>
                              </Col>
                              <Col md={12}>
                                <div className="head-section">EMAIL:</div>
                                <p className="sum-data"> {candidate?.email}</p>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={12}>
                                <div className="head-section">LOCATION:</div>
                                <p className="sum-data">
                                  {" "}
                                  {candidate?.location}
                                </p>
                              </Col>
                              <Col md={12}>
                                <div className="head-section">CONTACT INFO:</div>
                                <p className="sum-data">
                                  {" "}
                                  {candidate?.phone}
                                </p>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={12}>
                                <div className="head-section">ADDRESS:</div>
                                <p> {candidate?.address}</p>
                              </Col>
                            </Row>
                          </div>

                          {/* Education Information Card */}
                          <div className="info-card mt-3">
                            <div className="info-header d-flex justify-content-between align-items-center">
                              <h6 style={{ color: '#FF7043' }}>Education Information</h6>
                            </div>
                            <div className="info-body">
                              <Row>
                                <Col md={12}>
                                  <div className="head-section">
                                    POST GRADUATION:
                                  </div>
                                  <p className="sum-data">
                                    {" "}
                                    {candidate?.postGraduation}
                                  </p>
                                </Col>
                                <Col md={12}>
                                  <div className="head-section">UNIVERSITY:</div>
                                  <p className="sum-data">
                                    {" "}
                                    {candidate?.postGraduationUniversity}
                                  </p>
                                </Col>
                              </Row>
                              <Row>
                                <Col md={12}>
                                  <div className="head-section">
                                    GRADE/SCORE:
                                  </div>
                                  <p className="sum-data">
                                    {candidate?.postGraduationGrade}{" "}
                                  </p>
                                </Col>
                                <Col md={12}>
                                  <div className="head-section">
                                    YEAR OF PASSING:
                                  </div>
                                  <p className="sum-data">
                                    {" "}
                                    {candidate?.postGraduationYear}
                                  </p>
                                </Col>
                              </Row>
                              <div
                                style={{ borderTop: "1px dashed #ccc", margin: "1.5rem 0 0 0" }}
                              />
                              <div
                                style={{ borderTop: "1px dashed #ccc", margin: "0.25rem 0 1.5rem 0" }}
                              />
                              <Row>
                                <Col md={12}>
                                  <div className="head-section">GRADUATION:</div>
                                  <p className="sum-data">
                                    {" "}
                                    {candidate?.graduation}
                                  </p>
                                </Col>
                                <Col md={12}>
                                  <div className="head-section">UNIVERSITY:</div>
                                  <p className="sum-data">
                                    {candidate?.graduationUniversity}
                                  </p>
                                </Col>
                              </Row>
                              <Row>
                                <Col md={12}>
                                  <div className="head-section">
                                    GRADE/SCORE:
                                  </div>
                                  <p className="sum-data">{candidate?.graduationGrade}</p>
                                </Col>
                                <Col md={12}>
                                  <div className="head-section">
                                    YEAR OF PASSING:
                                  </div>
                                  <p className="sum-data">
                                    {candidate?.graduationYear}
                                  </p>
                                </Col>
                              </Row>
                            </div>
                          </div>
                        </Col>

                        {/* Right Column: Professional Information */}
                        <Col md={6}>
                          <div className="pro-info-card">
                            <div className="info-header d-flex justify-content-between align-items-center">
                              <h6 style={{ color: '#FF7043' }}>Professional Information</h6>
                            </div>
                            <div className="info-body">
                              <Row>
                                <Col md={12}>
                                  <div className="head-section">
                                    CURRENT JOB TITTLE:
                                  </div>
                                  <p className="sum-data">
                                    {candidate?.requisition_title}
                                  </p>
                                </Col>
                                <Col md={12}>
                                  <div className="head-section">
                                    TOTAL EXPERIENCE:
                                  </div>
                                  <p className="sum-data">
                                    {candidate?.total_experience}{" "}
                                  </p>
                                </Col>
                              </Row>
                              <Row>
                                <Col md={12}>
                                  <div className="head-section">
                                    CURRENT CTC:
                                  </div>
                                  <p className="sum-data">
                                    {candidate?.currentCTC}
                                  </p>
                                </Col>
                                <Col md={12}>
                                  <div className="head-section">
                                    EXPECTED CTC:
                                  </div>
                                  <p className="sum-data">
                                    {candidate?.expectedCTC}
                                  </p>
                                </Col>
                              </Row>
                              <Row>
                                <Col md={12}>
                                  <div className="head-section">
                                    CURRENT COMPANY:
                                  </div>
                                  <p className="sum-data">
                                    {candidate?.currentCompany}
                                  </p>
                                </Col>
                                <Col md={12}>
                                  <div className="head-section">
                                    COMPANY LOCATION:
                                  </div>
                                  <p className="sum-data">
                                    {candidate?.companyLocation}
                                  </p>
                                </Col>
                              </Row>
                              <Row>
                                <Col md={12}>
                                  <div className="head-section">SKILL SET:</div>
                                  <div className="d-flex flex-wrap">
                                    {skills?.map((skill, index) => (
                                      <span
                                        style={{ backgroundColor: "#f2f4fc" }}
                                        key={index}
                                        className="skill-pill"
                                      >
                                        {skill.trim()}
                                      </span>
                                    ))}
                                  </div>
                                </Col>
                              </Row>
                              <Row>
                                <Col md={12}>
                                  <div className="head-section">Additional Info:</div>
                                  <div className="d-flex flex-wrap">
                                    Highly knowledgeable about the company's application
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          </div>
                        </Col>
                      </Row>
                      <Row></Row>
                    </Tab.Pane>
                    <Tab.Pane eventKey="resume">
                      <h6>Resume</h6>
                      {candidate?.fileInfo && candidate.fileInfo.length > 0 ? (
                        <div>
                          <p>Click the link below to view or download the resume:</p>
                          <a
                            href={candidate.fileInfo[0].file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {candidate.fileInfo[0].file_name || "View Resume"}
                          </a>

                          <iframe
                            src={candidate.fileInfo[0].file_url}
                            width="100%"
                            height="500px"
                            style={{ border: "none", marginTop: "10px" }}
                            title="Resume Viewer"
                          />
                        </div>
                      ) : (
                        <p>No resume available.</p>
                      )}
                    </Tab.Pane>
                    {/* <Tab.Pane eventKey="schedule">
                      {isInterviewListOpen ? (
                            <InterviewList setIsInterviewListOpen={setIsInterviewListOpen} />
                        ):(
                            <div className="schedule-interview-container">
                            <div
                              className="card schedule-card"
                              style={{ display: "flex", justifyContent: "center" }}
                            >
                              <div className="card-header">
                                <h5>Interviews List</h5>
                                <span className="add">
                                  <GrAddCircle
                                    style={{
                                      marginBottom: "3px",
                                      marginRight: "6px",
                                      fontSize: "18px",
                                    }}
                                  />
                                  Add/Schedule Interview
                                </span>
                              </div>
                              <div
                                className="card-body"
                                style={{
                                  width: "100%",
                                  maxWidth: "600px",
                                  margin: "auto",
                                }}
                              >
                                <form onSubmit={handleSubmit}>
                                  <div className="form-group inline-inputs">
                                    <div className="inline-date">
                                      <label className="drawer_labels">Date</label>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="inline-time">
                                      <input
                                        className="date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        // required
                                      />
                                      <label className="start drawer_labels">from</label>
                                      <input
                                        className="startTime"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) =>
                                          setStartTime(e.target.value)
                                        }
                                        // required
                                      />
                                      <label className="end drawer_labels">to</label>
                                      <input
                                        className="endTime"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        // required
                                      />
                                    </div>
                                  </div>
    
                                  <div className="form-group">
                                    <label className="drawer_labels">Meeting Type</label>
                                    <div className="meeting-type">
                                      <button
                                        type="button"
                                        className={`meeting-btn ${
                                          meetingType === "online" ? "selected" : ""
                                        }`}
                                        onClick={() => setMeetingType("online")}
                                      >
                                        <RiVideoOnLine
                                          style={{ marginBottom: "2px" }}
                                        />{" "}
                                        Online Meeting
                                      </button>
                                      <button
                                        type="button"
                                        className={`meeting-btn ${
                                          meetingType === "in-person"
                                            ? "selected"
                                            : ""
                                        }`}
                                        onClick={() => setMeetingType("in-person")}
                                      >
                                        <BsUniversalAccessCircle
                                          style={{
                                            marginBottom: "2px",
                                            marginRight: "6px",
                                          }}
                                        />
                                        In-person Meeting
                                      </button>
                                    </div>
                                  </div>
                                  {meetingType === "online" && (
                                    <div className="form-group meeting-link-group">
                                      <input
                                        type="url"
                                        value={meetingLink}
                                        onChange={(e) =>
                                          setMeetingLink(e.target.value)
                                        }
                                        // required
                                        placeholder="Meeting Link"
                                        className="meeting-link-input"
                                      />
                                      <img
                                        className="icon googleMeet-icon"
                                        // src={require("../Assets/googleMeet.png")}
                                        alt="Google Meet"
                                      />
                                      <img
                                        className="icon video-icon"
                                        // src={require("../Assets/video.png")}
                                        alt="Video"
                                      />
                                      <img
                                        className="icon teams-icon"
                                        // src={require("../Assets/teams.png")}
                                        alt="Teams"
                                      />
                                    </div>
                                  )}
                                  <div className="form-group">
                                    <label className="drawer_labels">Attendees</label>
                                    <div className="chips-container">
                                      {attendees.map((attendee, index) => (
                                        <div key={index} className="chip">
                                          {attendee}
                                          <button
                                            type="button"
                                            className="close-btn"
                                            onClick={() => removeAttendee(index)}
                                          >
                                            &times;
                                          </button>
                                        </div>
                                      ))}
                                      <input
                                        type="text"
                                        className="chip-input"
                                        value={inputValue}
                                        onChange={(e) =>
                                          setInputValue(e.target.value)
                                        }
                                        onKeyDown={addAttendee}
                                      />
                                    </div>
                                  </div>
                                  <div className="form-group">
                                    <label className="drawer_labels">Message</label>
                                    <textarea
                                      style={{ height: "4rem" }}
                                      value={message}
                                      onChange={(e) => setMessage(e.target.value)}
                                      rows="4"
                                    />
                                  </div>
                                  <button type="submit" className="schedule-btn" onClick={sendMail}>
                                    Schedule Interview
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        )}
                    </Tab.Pane> */}
                    {/* <Tab.Pane eventKey="evaluation">
                      <h6>Evaluation</h6>
                      <p>Display evaluation details here.</p>
                    </Tab.Pane> */}
                  </Tab.Content>
                </CardBody>
              </Tab.Container>
            </Card>
          </Card>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Drawer;