import React, { useState, useEffect } from "react";
import "../css/CandidateCard.css";
import { useLocation } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Form,
    InputGroup,
    Breadcrumb,
    BreadcrumbItem,
    Container,
} from "react-bootstrap";
import Drawer from "./Drawer";
import InterviewModal from "./InterviewModal";
import OfferModal from "./OfferModal";
import { getJobRequirements } from "../services/getJobRequirements";

const staticCandidates = [
    {
        applicant_id: 1,
        firstname: "Kunal Rampal",
        location: "Hyderabad, India",
        mobile_number: "97548 96215",
        rating: "5.0",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        skillsMatched: 10,
        totalSkills: 13,
        description: "10 out of 13 skills matched. This profile may be a Best fit.",
        skills: "AWS, Java, Kafka, Spring Boot, Microservices, Docker, Kubernetes, SQL, REST, Git",
        jobTitles: "Software Developer Recruitment",
        email: "kunalrampal@gmail.com",
        address: "H.No. 38-57/1/J2, Neredmet, Hyderabad, India - 5000 057",
        currentJobTitle: "Full-Stack Developer",
        totalExperience: "5.2 Years",
        currentCTC: "15 Lakh PA",
        expectedCTC: "20 Lakh PA",
        currentCompany: "Sagarsift India Ltd",
        companyLocation: "Hyderabad, India",
        postGraduation: "MCA",
        postGraduationUniversity: "Andhra University",
        postGraduationGrade: "9.0",
        postGraduationYear: "2024-25",
        graduation: "B.Sc - Computers",
        graduationUniversity: "Osmania University",
        graduationGrade: "7.5",
        graduationYear: "2017-20",
        profileStatus: "Shortlisted",
    },
    {
        applicant_id: 2,
        firstname: "Akhil kumar",
        location: "Chennai, India",
        mobile_number: "88978 21546",
        rating: "5.0",
        avatar: "https://randomuser.me/api/portraits/men/33.jpg",
        skillsMatched: 10,
        totalSkills: 13,
        description: "10 out of 13 skills matched. This profile may be a Best fit.",
        skills: "AWS, Java, Kafka, Spring Boot, Microservices, Docker, Kubernetes, SQL, REST, Git",
        jobTitles: "Software Developer Recruitment",
        email: "akhilkumar@gmail.com",
        address: "123, Anna Salai, Chennai, India - 600001",
        currentJobTitle: "Software Engineer",
        totalExperience: "3.5 Years",
        currentCTC: "12 Lakh PA",
        expectedCTC: "18 Lakh PA",
        currentCompany: "Tech Solutions Pvt. Ltd.",
        companyLocation: "Chennai, India",
        postGraduation: "M.Tech - Computer Science",
        postGraduationUniversity: "IIT Madras",
        postGraduationGrade: "8.5",
        postGraduationYear: "2022-23",
        graduation: "B.E. - Information Technology",
        graduationUniversity: "Anna University",
        graduationGrade: "8.2",
        graduationYear: "2018-22",
        profileStatus: "Shortlisted",
    },
    {
        applicant_id: 3,
        firstname: "Tamil Selvan",
        location: "Mumbai, India",
        mobile_number: "99785 12768",
        rating: "4.9",
        avatar: "https://randomuser.me/api/portraits/men/34.jpg",
        skillsMatched: 9,
        totalSkills: 13,
        description: "9 out of 13 skills matched. This profile may be a good fit.",
        skills: "Java, Kafka, Spring Boot, Microservices, Docker, Kubernetes, SQL, REST, Git",
        jobTitles: "Machine Learning Engineer",
        email: "tamils@gmail.com",
        address: "45, Marine Drive, Mumbai, India - 400002",
        currentJobTitle: "Lead Developer",
        totalExperience: "8 Years",
        currentCTC: "20 Lakh PA",
        expectedCTC: "25 Lakh PA",
        currentCompany: "Mumbai Enterprises",
        companyLocation: "Mumbai, India",
        postGraduation: "M.Sc - Software Engineering",
        postGraduationUniversity: "University of Mumbai",
        postGraduationGrade: "9.1",
        postGraduationYear: "2015-17",
        graduation: "B.Tech - Computer Engineering",
        graduationUniversity: "University of Mumbai",
        graduationGrade: "8.8",
        graduationYear: "2011-15",
        profileStatus: "Shortlisted",
    },
    {
        applicant_id: 4,
        firstname: "Piyush Mishra",
        location: "Pune, India",
        mobile_number: "81978 24758",
        rating: "4.8",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        skillsMatched: 9,
        totalSkills: 13,
        description: "9 out of 13 skills matched. This profile may be a good fit.",
        skills: "Java, Kafka, Spring Boot, Microservices, Docker, Kubernetes, SQL, REST",
        jobTitles: "Software Developer Recruitment",
        email: "piyushm@gmail.com",
        address: "78, Koregaon Park, Pune, India - 411001",
        currentJobTitle: "Sr. Software Engineer",
        totalExperience: "6.5 Years",
        currentCTC: "18 Lakh PA",
        expectedCTC: "22 Lakh PA",
        currentCompany: "Pune Innovations",
        companyLocation: "Pune, India",
        postGraduation: "M.E. - Information Technology",
        postGraduationUniversity: "Pune University",
        postGraduationGrade: "8.7",
        postGraduationYear: "2018-20",
        graduation: "B.E. - Computer Science",
        graduationUniversity: "Pune University",
        graduationGrade: "8.5",
        graduationYear: "2014-18",
        profileStatus: "Shortlisted",
    },
    {
        applicant_id: 5,
        firstname: "Nitesh Jha",
        location: "Bangalore, India",
        mobile_number: "77319 45578",
        rating: "4.7",
        avatar: "https://randomuser.me/api/portraits/men/35.jpg",
        skillsMatched: 8,
        totalSkills: 13,
        description: "8 out of 13 skills matched. This profile may be a good fit.",
        skills: "Java, Kafka, Spring Boot, Microservices, Docker, Kubernetes, SQL",
        jobTitles: "UI/UX Designer",
        email: "niteshjha@gmail.com",
        address: "10, Koramangala, Bangalore, India - 560034",
        currentJobTitle: "Software Developer",
        totalExperience: "4 Years",
        currentCTC: "14 Lakh PA",
        expectedCTC: "19 Lakh PA",
        currentCompany: "Bangalore Tech Hub",
        companyLocation: "Bangalore, India",
        postGraduation: "M.Tech - AI & ML",
        postGraduationUniversity: "Indian Institute of Science",
        postGraduationGrade: "9.2",
        postGraduationYear: "2021-22",
        graduation: "B.Tech - Electronics and Communication",
        graduationUniversity: "Visvesvaraya Technological University",
        graduationGrade: "8.9",
        graduationYear: "2017-21",
        profileStatus: "Shortlisted",
    },
];

const CandidateCard = () => {
    const [candidates, setCandidates] = useState([]);
    const [resumeEndorsed, setResumeEndorsed] = useState([]);
    const [interviewed, setInterviewed] = useState([]);
    const [offered, setOffered] = useState([]);
    const location = useLocation();
    const responseData = location?.state?.responseData || {};
    const [isDescending, setIsDescending] = useState({
        candidates: true,
        resumeEndorsed: null,
        interviewed: null,
        offered: null
    });
    const [search, setSearch] = useState();
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const [jobReqs, setJobReqs] = useState([]);
    const [selectedRequisitionCode, setSelectedRequisitionCode] = useState("Select All");
    const [selectedRequisitionTitle, setSelectedRequisitionTitle] = useState(""); // Change to an empty string

    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [interviewCandidate, setInterviewCandidate] = useState(null);
    const [interviewDate, setInterviewDate] = useState("");
    const [interviewTime, setInterviewTime] = useState("");
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [offerCandidate, setOfferCandidate] = useState(null);
    const [jobPosition, setJobPosition] = useState("");
    const [reqId, setReqId] = useState("");
    const [salary, setSalary] = useState("");

    useEffect(() => {
        const fetchJobData = async () => {
            const response = await getJobRequirements();
            const data = response?.data || [];
            if (data && data.length > 0) {
                // Add "Select All" to job requisitions
                const allJobReqs = [{ requisition_code: "Select All", requisition_title: "Select All" }, ...data];
                setJobReqs(allJobReqs);
                setSelectedRequisitionCode(allJobReqs[0].requisition_code);
                // No need to set the title here, let the user select it
            }
        };
        fetchJobData();
    }, []);

    useEffect(() => {
        // Only filter candidates if a specific requisition title is selected
        if (selectedRequisitionTitle && selectedRequisitionTitle !== "Select All") {
            const filteredCandidates = staticCandidates.filter(candidate => candidate.jobTitles === selectedRequisitionTitle);
            setCandidates(filteredCandidates);
        } else {
            // If "Select All" is selected in either dropdown, show no candidates
            setCandidates([]);
        }
    }, [selectedRequisitionTitle]);

    const calculateRatings = (candidates, skills) => {
        return (
            candidates.map(candidate => {
                const skillsLowerCase = candidate?.skills.split(',').map(item => item.toLowerCase());
                const matchedSkills = skills.filter(skill => skillsLowerCase.includes(skill));
                let rating, ratingDescription;

                switch (true) {
                    case matchedSkills.length > 5:
                        rating = '5.0';
                        ratingDescription = `${matchedSkills.length} out of ${skillsLowerCase.length} skills matched. This profile may be the best fit.`;
                        break;
                    case matchedSkills.length === 4:
                        rating = '4.0';
                        ratingDescription = `${matchedSkills.length} out of ${skillsLowerCase.length} skills matched. This profile may be a good fit.`;
                        break;
                    case matchedSkills.length === 3:
                        rating = '3.0';
                        ratingDescription = `${matchedSkills.length} out of ${skillsLowerCase.length} skills matched. This profile may be an average fit.`;
                        break;
                    case matchedSkills.length === 2:
                        rating = '2.0';
                        ratingDescription = `${matchedSkills.length} out of ${skillsLowerCase.length} skills matched. This profile may be a below average fit.`;
                        break;
                    case matchedSkills.length === 1:
                        rating = '1.0';
                        ratingDescription = `${matchedSkills.length} out of ${skillsLowerCase.length} skills matched. This profile may be a bad fit.`;
                        break;
                    default:
                        rating = '0.0';
                        ratingDescription = `${matchedSkills.length} out of ${skillsLowerCase.length} skills matched. This profile may be a very bad fit.`;
                        break;
                }

                return { ...candidate, rating, ratingDescription };
            }));
    };

    const jdSkillsLowerCase = responseData[0]?.Skills.map(item => item.toLowerCase()) || [];
    const ratedCandidates = calculateRatings(candidates, jdSkillsLowerCase);
    const ratedResumeEndorsed = calculateRatings(resumeEndorsed, jdSkillsLowerCase);
    const ratedOffered = calculateRatings(offered, jdSkillsLowerCase);
    const ratedInterviewed = calculateRatings(interviewed, jdSkillsLowerCase);

    const profile_prictures = [
        "https://wallpapers.com/images/hd/professional-profile-pictures-1080-x-1080-460wjhrkbwdcp1ig.jpg",
        "https://blog-pixomatic.s3.appcnt.com/image/22/01/26/61f166e1377d4/_orig/pixomatic_1572877223091.png",
        "https://img.freepik.com/premium-photo/professional-cv-photo-confident-business-woman-formal-attire_981640-67310.jpg",
    ];

    const handleJobReqChange = (event) => {
        const newRequisitionCode = event.target.value;
        setSelectedRequisitionCode(newRequisitionCode);
        
        // Reset the second dropdown's value to "Select All" when the first one changes
        setSelectedRequisitionTitle("Select All");
    };

    const handleJobPositionChange = (event) => {
        const newRequisitionTitle = event.target.value;
        setSelectedRequisitionTitle(newRequisitionTitle);
    };

    const toggleCandidateSortOrder = () => {
        setIsDescending((prevState) => ({
            ...prevState,
            candidates: !prevState.candidates
        }));
    };

    const toggleResumeEndorsedSortOrder = () => {
        setIsDescending((prevState) => ({
            ...prevState,
            resumeEndorsed: prevState.resumeEndorsed === null ? true : !prevState.resumeEndorsed,
        }));
    };

    const toggleInterviewedSortOrder = () => {
        setIsDescending((prevState) => ({
            ...prevState,
            interviewed: prevState.interviewed === null ? true : !prevState.interviewed,
        }));
    };

    const toggleOfferedSortOrder = () => {
        setIsDescending((prevState) => ({
            ...prevState,
            offered: prevState.offered === null ? true : !prevState.offered,
        }));
    };

    const handleOnDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const listMap = {
            candidates: [candidates, setCandidates],
            "resume-endorsed": [resumeEndorsed, setResumeEndorsed],
            interviewed: [interviewed, setInterviewed],
            offered: [offered, setOffered],
        };

        const [sourceList, setSourceList] = listMap[source.droppableId];
        const updatedSource = Array.from(sourceList);
        const [movedItem] = updatedSource.splice(source.index, 1);
        setSourceList(updatedSource);

        if (destination.droppableId === "interviewed") {
            setInterviewCandidate(movedItem);
            setShowInterviewModal(true);
        } else if (destination.droppableId === "offered") {
            setOfferCandidate(movedItem);
            setJobPosition(movedItem.jobTitles);
            setReqId(selectedRequisitionCode);
            setShowOfferModal(true);
        } else {
            const [destList, setDestList] = listMap[destination.droppableId];
            const updatedDest = Array.from(destList);
            updatedDest.splice(destination.index, 0, movedItem);
            setDestList(updatedDest);

            let newStatus = "";
            if (destination.droppableId === "resume-endorsed") {
                newStatus = "Shortlisted";
            } else if (destination.droppableId === "candidates") {
                newStatus = "Shortlisted";
            }
            movedItem.profileStatus = newStatus;
        }
    };

    const handleScheduleInterview = () => {
        if (interviewCandidate) {
            const interviewPayload = {
                id: interviewCandidate.applicant_id,
                name: interviewCandidate.firstname,
                date: interviewDate,
                time: interviewTime,
                reqId: selectedRequisitionCode,
                jobPosition: selectedRequisitionTitle,
            };

            console.log("Interview Payload:", interviewPayload);

            const updatedInterviewed = [...interviewed, { ...interviewCandidate, profileStatus: "Interview Scheduled" }];
            setInterviewed(updatedInterviewed);
        }
        setShowInterviewModal(false);
        setInterviewCandidate(null);
        setInterviewDate("");
        setInterviewTime("");
    };

    const handleCancelInterview = () => {
        if (interviewCandidate) {
            const updatedCandidates = [...candidates, interviewCandidate];
            setCandidates(updatedCandidates);
        }
        setShowInterviewModal(false);
        setInterviewCandidate(null);
        setInterviewDate("");
        setInterviewTime("");
    };

    const handleOffer = () => {
        if (offerCandidate) {
            const updatedOffered = [...offered, { ...offerCandidate, profileStatus: "Selected" }];
            setOffered(updatedOffered);
        }
        setShowOfferModal(false);
        setOfferCandidate(null);
        setJobPosition("");
        setReqId("");
        setSalary("");
    };

    const handleCancelOffer = () => {
        if (offerCandidate) {
            const updatedInterviewed = [...interviewed, offerCandidate];
            setInterviewed(updatedInterviewed);
        }
        setShowOfferModal(false);
        setOfferCandidate(null);
        setJobPosition("");
        setReqId("");
        setSalary("");
    };

    const handlePreview = () => {
        alert(`Offer Preview for ${offerCandidate.firstname}:\nJob Position: ${jobPosition}\nReq ID: ${reqId}\nSalary: ${salary}`);
    };

    const toggleDrawer = (candidate = null) => {
        setIsOpen(!isOpen);
        setSelectedCandidate(candidate);
    };

    const handleShortlist = (obj) => {
        let updatedCandidates = candidates.filter(candidate => obj.firstname !== candidate.firstname);
        setCandidates(updatedCandidates);
        obj.profileStatus = "Shortlisted";
        setResumeEndorsed([...resumeEndorsed, obj]);
    };

    return (
        <Container fluid className="py-5">
            <div className="top-bar">
                <div>
                    <Breadcrumb>
                        <BreadcrumbItem active>Jobs</BreadcrumbItem>
                        <BreadcrumbItem>
                            <select
                                className="select-drop"
                                name="jobReqDropdown"
                                value={selectedRequisitionCode}
                                onChange={handleJobReqChange}
                            >
                                {jobReqs.length > 0 ? (
                                    jobReqs.map((req, index) => (
                                        <option key={index} value={req.requisition_code}>
                                            {req.requisition_code}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No job requests available</option>
                                )}
                            </select>
                        </BreadcrumbItem>
                        {selectedRequisitionCode !== "Select All" && (
                            <BreadcrumbItem>
                                <select
                                    className="select-drop"
                                    name="jobPositionsDropdown"
                                    value={selectedRequisitionTitle}
                                    onChange={handleJobPositionChange}
                                >
                                    <option value="Select All">Select All</option>
                                    {/* The selected option's title is now dynamically added to the list */}
                                    <option value={selectedRequisitionTitle} disabled hidden>
                                        {selectedRequisitionTitle}
                                    </option>
                                    {jobReqs.filter(req => req.requisition_code === selectedRequisitionCode).map(req => (
                                        <option key={req.requisition_code} value={req.requisition_title}>
                                            {req.requisition_title}
                                        </option>
                                    ))}
                                </select>
                            </BreadcrumbItem>
                        )}
                    </Breadcrumb>
                </div>
                <div className="d-flex gap-3 w-50 justify-content-end">
                    <InputGroup className="mb-3 search-b">
                        <Form.Control
                            placeholder="Search"
                            aria-label="Search"
                            className="search-f"
                            onChange={(e) => { setSearch(e.target.value) }}
                        />
                        <i className="bi bi-search search-i"></i>
                    </InputGroup>
                    <button className="advanced-fil">
                        <i className="bi bi-sliders2-vertical"></i>ADVANCED FILTER
                    </button>
                </div>
            </div>
            <div className="row px-4 candidate-cards-3">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <div className="col-12 col-md-6 col-lg-3 px-4">
                        <div className="review_columns card">
                            <div className="card-body" style={{ maxHeight: '82vh', backgroundColor: '#fff', borderRadius: '15px' }}>
                                <div className="pb-1">
                                    <div className="d-flex justify-content-between align-items-baseline py-2">
                                        <h5 className="color_grey card-title">Candidates</h5>
                                        {isDescending.candidates ?
                                            <i className="bi bi-sort-down sort_icon" onClick={toggleCandidateSortOrder}></i> :
                                            <i className="bi bi-sort-up sort_icon" onClick={toggleCandidateSortOrder}></i>
                                        }
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div className="d-flex gap-1">
                                            <h5 className="fs-20 px-1">0</h5>
                                            <h6 className="color_light_grey align-content-center">
                                                REJECTED
                                            </h6>
                                        </div>
                                        <div className="d-flex gap-1">
                                            <h5 className="fs-20 px-1">{candidates?.length}</h5>
                                            <h6 className="color_light_grey align-content-center">
                                                TOTAL
                                            </h6>
                                        </div>
                                    </div>
                                    <div className="colored_line_blue my-2"></div>
                                    <Droppable droppableId="candidates">
                                        {(provided) => (
                                            <div className="candidates overflow-auto px-2" style={{ minHeight: '100px', maxHeight: '66vh' }} ref={provided.innerRef} {...provided.droppableProps}>
                                                {(selectedRequisitionTitle === "" || selectedRequisitionTitle === "Select All") ? (
                                                    <div className="no-candidates-message text-center mt-5">
                                                        <p>Please select a Job Position to view candidates.</p>
                                                    </div>
                                                ) : candidates.length === 0 ? (
                                                    <div className="no-candidates-message text-center mt-5">
                                                        <p>No candidates available for this position.</p>
                                                    </div>
                                                ) : (
                                                    candidates.map((candidate, index) => (
                                                        <Draggable key={candidate.applicant_id} draggableId={candidate.applicant_id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div className="candidate_card_container card my-4" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => toggleDrawer(candidate)}>
                                                                    <div className="candidate_card card-body d-flex justify-content-between">
                                                                        <div>
                                                                            <img className="candidate_image" src={candidate.avatar} alt={candidate.firstname} />
                                                                        </div>
                                                                        <div className="w-50 px-1">
                                                                            <h5 className="candidate_text fw-bold">{candidate.firstname}</h5>
                                                                            <h6 className="candidate_sub_text">{candidate.location}</h6>
                                                                            <h6 className="candidate_sub_text">{candidate.mobile_number}</h6>
                                                                        </div>
                                                                        <div className="card-status-label">{candidate.profileStatus}</div>
                                                                        <div className="rating_container d-flex align-self-end p-1">
                                                                            <h6 className="rating_text px-1">{candidate.rating}</h6>
                                                                            <i className="bi bi-star-fill" style={{ color: "#f6ca5a" }}></i>
                                                                        </div>
                                                                    </div>
                                                                    {/* <div className="insight_text_container pb-2 d-flex px-1">
                                                                        <span role="img" aria-label="info" style={{ fontSize: "18px", marginRight: "4px" }}>💡</span>
                                                                        <p className="insight_text px-1">{candidate.description}</p>
                                                                    </div> */}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3 px-4">
                        <div className="review_columns card">
                            <div className="card-body" style={{ maxHeight: "82vh", backgroundColor: '#fff', borderRadius: '15px' }}>
                                <div>
                                    <div className="d-flex justify-content-between align-items-baseline py-2">
                                        <h5 className="color_grey card-title">Interviewed</h5>
                                        {isDescending.interviewed !== null ? (
                                            <i className="bi bi-sort-down sort_icon" onClick={toggleInterviewedSortOrder}></i>
                                        ) : (
                                            <i className="bi bi-sort-up sort_icon" onClick={toggleInterviewedSortOrder}></i>
                                        )}
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div className="d-flex gap-1">
                                            <h5 className="fs-20 px-1">0</h5>
                                            <h6 className="color_light_grey align-content-center">
                                                REJECTED
                                            </h6>
                                        </div>
                                        <div className="d-flex gap-1">
                                            <h5 className="fs-20 px-1">{interviewed?.length}</h5>
                                            <h6 className="color_light_grey align-content-center">
                                                TOTAL
                                            </h6>
                                        </div>
                                    </div>
                                    <div className="colored_line_red my-2"></div>
                                    <Droppable droppableId="interviewed">
                                        {(provided) => (
                                            <div className="candidates overflow-auto px-2" style={{ minHeight: '100px', maxHeight: '71vh' }} ref={provided.innerRef} {...provided.droppableProps}>
                                                {interviewed.map((candidate, index) => (
                                                    <Draggable key={candidate.applicant_id} draggableId={candidate.applicant_id.toString()} index={index}>
                                                        {(provided) => (
                                                            <div className="candidate_card_container card my-4" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                <div className="candidate_card card-body d-flex justify-content-between" style={{ cursor: "pointer" }}>
                                                                    <div>
                                                                        <img className="candidate_image" src={profile_prictures[index % profile_prictures.length]} />
                                                                    </div>
                                                                    <div className="w-50 px-1">
                                                                        <h5 className="candidate_text fw-bold">{candidate.firstname}</h5>
                                                                        <h6 className="candidate_sub_text">{candidate.location}{(candidate.city ? candidate.city + ", " : "") + (candidate.country ? candidate.country : "")}</h6>
                                                                        <h6 className="candidate_sub_text">{candidate.mobile_number}</h6>
                                                                    </div>
                                                                    <div className="card-status-label">{candidate.profileStatus}</div>
                                                                    <div className="rating_container d-flex align-self-end p-1">
                                                                        <h6 className="rating_text px-1">{ratedInterviewed?.find(c => c?.applicant_id === candidate?.applicant_id)?.rating}</h6>
                                                                        <i className="bi bi-star-fill" style={{ color: "#f6ca5a" }}></i>
                                                                    </div>
                                                                </div>
                                                                {/* <div className="insight_text_container pb-2 d-flex px-1">
                                                                    <img style={{ height: "20px" }} />
                                                                    <p className="insight_text px-1">
                                                                        {ratedInterviewed?.find(c => c?.applicant_id === candidate?.applicant_id)?.ratingDescription}
                                                                    </p>
                                                                </div> */}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3 px-4">
                        <div className="review_columns card">
                            <div className="card-body" style={{ maxHeight: "82vh", backgroundColor: '#fff', borderRadius: '15px' }}>
                                <div>
                                    <div className="d-flex justify-content-between align-items-baseline py-2">
                                        <h5 className="color_grey card-title">Offered</h5>
                                        {isDescending.offered !== null ? (
                                            <i className="bi bi-sort-down sort_icon" onClick={toggleOfferedSortOrder}></i>
                                        ) : (
                                            <i className="bi bi-sort-up sort_icon" onClick={toggleOfferedSortOrder}></i>
                                        )}
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div className="d-flex gap-1">
                                            <h5 className="fs-20 px-1">0</h5>
                                            <h6 className="color_light_grey align-content-center">
                                                REJECTED
                                            </h6>
                                        </div>
                                        <div className="d-flex gap-1">
                                            <h5 className="fs-20 px-1">{offered?.length}</h5>
                                            <h6 className="color_light_grey align-content-center">
                                                TOTAL
                                            </h6>
                                        </div>
                                    </div>
                                    <div className="colored_line_yellow my-2"></div>
                                    <Droppable droppableId="offered">
                                        {(provided) => (
                                            <div className="candidates overflow-auto px-2" style={{ minHeight: '100px', maxHeight: '71vh' }} ref={provided.innerRef} {...provided.droppableProps}>
                                                {offered.map((candidate, index) => (
                                                    <Draggable key={candidate.applicant_id} draggableId={candidate.applicant_id.toString()} index={index}>
                                                        {(provided) => (
                                                            <div className="candidate_card_container card my-4" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                <div className="candidate_card card-body d-flex justify-content-between" style={{ cursor: "pointer" }}>
                                                                    <div>
                                                                        <img className="candidate_image" src={profile_prictures[index % profile_prictures.length]} />
                                                                    </div>
                                                                    <div className="w-50 px-1">
                                                                        <h5 className="candidate_text fw-bold">{candidate.firstname}</h5>
                                                                        <h6 className="candidate_sub_text">{candidate.location}{(candidate.city ? candidate.city + ", " : "") + (candidate.country ? candidate.country : "")}</h6>
                                                                        <h6 className="candidate_sub_text">{candidate.mobile_number}</h6>
                                                                    </div>
                                                                    <div className="card-status-label">{candidate.profileStatus}</div>
                                                                    <div className="rating_container d-flex align-self-end p-1">
                                                                        <h6 className="rating_text px-1">{ratedOffered?.find(c => c?.applicant_id === candidate?.applicant_id)?.rating}</h6>
                                                                        <i className="bi bi-star-fill" style={{ color: "#f6ca5a" }}></i>
                                                                    </div>
                                                                </div>
                                                                {/* <div className="insight_text_container pb-2 d-flex px-1">
                                                                    <img style={{ height: "20px" }} />
                                                                    <p className="insight_text px-1">
                                                                        {ratedOffered?.find(c => c?.applicant_id === candidate?.applicant_id)?.ratingDescription}
                                                                    </p>
                                                                </div> */}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </div>
                        </div>
                    </div>
                </DragDropContext >
            </div>
            {selectedCandidate && (
                <Drawer
                    isOpen={isOpen}
                    toggleDrawer={toggleDrawer}
                    candidate={selectedCandidate}
                    handleShortlist={handleShortlist}
                    ratedCandidates={ratedCandidates}
                />
            )}
            <InterviewModal
                show={showInterviewModal}
                handleClose={handleCancelInterview}
                candidate={interviewCandidate}
                date={interviewDate}
                setDate={setInterviewDate}
                time={interviewTime}
                setTime={setInterviewTime}
                handleSchedule={handleScheduleInterview}
            />
            <OfferModal
                show={showOfferModal}
                handleClose={handleCancelOffer}
                candidate={offerCandidate}
                jobPosition={jobPosition}
                reqId={reqId}
                salary={salary}
                setSalary={setSalary}
                handlePreview={handlePreview}
                handleOffer={handleOffer}
            />
        </Container>
    );
};

export default CandidateCard;