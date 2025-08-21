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
import { getJobRequirements, getJobPositions, getCandidatesByPosition, fetchCandidatesByStatus, API_ENDPOINTS } from "../services/getJobRequirements";
import profile from '../assets/profile_icon.png';
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faTrash,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

const CandidateCard = () => {
    const [candidates, setCandidates] = useState([]);
    const [interviewed, setInterviewed] = useState([]);
    const [offered, setOffered] = useState([]);
    const location = useLocation();
    const responseData = location?.state?.responseData || {};
    const [isDescending, setIsDescending] = useState({
        candidates: true,
        interviewed: null,
        offered: null
    });
    const [search, setSearch] = useState("");
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const [jobReqs, setJobReqs] = useState([]);
    const [jobPositions, setJobPositions] = useState([]);
    const [selectedRequisitionCode, setSelectedRequisitionCode] = useState("");
    const [selectedPositionId, setSelectedPositionId] = useState("");
    const [selectedRequisitionId, setSelectedRequisitionId] = useState("");
    const [jobPositionTitle, setJobPositionTitle] = useState("");
    const [selectedPositionTitle, setSelectedPositionTitle] = useState("");

    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [interviewCandidate, setInterviewCandidate] = useState(null);
    const [interviewDate, setInterviewDate] = useState("");
    const [interviewTime, setInterviewTime] = useState("");
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [offerCandidate, setOfferCandidate] = useState(null);
    const [reqId, setReqId] = useState("");
    const [positionId, setPositionId] = useState("");
    const [salary, setSalary] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [offerLetterPath, setOfferLetterPath] = useState('');
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleCandidate, setRescheduleCandidate] = useState(null);
    const [apiLoading, setApiLoading] = useState(false);

    // const showToast = (message, variant) => {
    //     alert(message);
    // };
    const showToast = (message, variant = "info") => {
        switch (variant) {
            case "success":
                toast.success(message);
                break;
            case "error":
                toast.error(message);
                break;
            case "warning":
                toast.warn(message);
                break;
            default:
                toast.info(message);
                break;
        }
    };

    useEffect(() => {
        const fetchJobData = async () => {
            const response = await getJobRequirements();
            const data = response?.data || [];
            setJobReqs(data);
        };
        fetchJobData();
    }, []);

    useEffect(() => {
        const fetchPositions = async () => {
            if (selectedRequisitionId) {
                const positions = await getJobPositions(selectedRequisitionId);
                setJobPositions(positions);
                setSelectedPositionId("");
                setCandidates([]);
            }
        };
        fetchPositions();
    }, [selectedRequisitionId]);

    useEffect(() => {
        const fetchCandidates = async () => {
            setCandidates([]);
            setInterviewed([]);
            setOffered([]);
            console.log("Fetching candidates for position ID:", selectedPositionId);

            if (selectedRequisitionId && selectedPositionId) {
                const fetchedCandidates = await getCandidatesByPosition(selectedPositionId);
                console.log("Fetched candidates for position:", fetchedCandidates);

                // Filter for each column based on application_status
                const shortlistedCandidates = fetchedCandidates.filter(
                    candidate => candidate.application_status === 'Shortlisted'
                );
                const interviewedCandidates = fetchedCandidates.filter(
                    candidate => candidate.application_status === 'Scheduled'
                );
                const offeredCandidates = fetchedCandidates.filter(
                    candidate => candidate.application_status === 'Offered'
                );
                console.log("Interviewed Candidates", interviewedCandidates);
                setCandidates(shortlistedCandidates);
                setInterviewed(interviewedCandidates);
                setOffered(offeredCandidates);
            } else {
                setCandidates([]);
                setInterviewed([]);
                setOffered([]);
            }
        };

        fetchCandidates();
    }, [selectedRequisitionId, selectedPositionId]);



    const calculateRatings = (candidates, skills) => {
        return candidates.map(candidate => {
            if (!candidate || !candidate.skills) {
                return { ...candidate, rating: '0.0', ratingDescription: 'No skills provided.' };
            }
            const skillsLowerCase = candidate.skills.split(',').map(item => item.toLowerCase().trim());
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
        });
    };

    const jdSkillsLowerCase = responseData[0]?.Skills?.map(item => item.toLowerCase()) || [];
    const ratedCandidates = calculateRatings(candidates, jdSkillsLowerCase);
    const ratedOffered = calculateRatings(offered, jdSkillsLowerCase);
    const ratedInterviewed = calculateRatings(interviewed, jdSkillsLowerCase);

    const profile_prictures = [
        "https://wallpapers.com/images/hd/professional-profile-pictures-1080-x-1080-460wjhrkbwdcp1ig.jpg",
        "https://blog-pixomatic.s3.appcnt.com/image/22/01/26/61f166e1377d4/_orig/pixomatic_1572877223091.png",
        "https://img.freepik.com/premium-photo/professional-cv-photo-confident-business-woman-formal-attire_981640-67310.jpg",
    ];

    const handleJobReqChange = (event) => {
        const newRequisitionCode = event.target.value;
        const selectedReq = jobReqs.find(req => req.requisition_code === newRequisitionCode);
        setSelectedRequisitionCode(newRequisitionCode);
        setSelectedRequisitionId(selectedReq ? selectedReq.requisition_id : "");
        setSelectedPositionId("");
        // Set the job position title if a requisition is selected
        setJobPositionTitle(selectedReq ? selectedReq.requisition_title : "");
        setCandidates([]);
        setInterviewed([]);
        setOffered([]);
    };
    const handleJobPositionChange = (event) => {
        // const positionId = event.target.value;
        // setSelectedPositionId(positionId);

        // const selectedPos = jobPositions.find(pos => pos.position_id === positionId);
        // if (selectedPos) {
        //     setJobPositionTitle(selectedPos.position_title);
        // }
        const positionId = event.target.value;
        setSelectedPositionId(positionId);

        const found = jobPositions.find((pos) => pos.position_id === positionId);
        if (found) {
            setSelectedPositionTitle(found.position_title);
        }
    };

    const toggleCandidateSortOrder = () => {
        setIsDescending((prevState) => ({
            ...prevState,
            candidates: !prevState.candidates
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

        if (!destination) {
            return;
        }

        // This part handles reordering within the same list
        if (source.droppableId === destination.droppableId) {
            const listMap = {
                candidates: [candidates, setCandidates],
                interviewed: [interviewed, setInterviewed],
                offered: [offered, setOffered],
            };
            const [list, setList] = listMap[source.droppableId];
            const updatedList = Array.from(list);
            const [movedItem] = updatedList.splice(source.index, 1);
            updatedList.splice(destination.index, 0, movedItem);
            setList(updatedList);
            return;
        }

        // Disallowed moves
        const disallowedMoves = [
            ['offered', 'interviewed'],
            ['offered', 'candidates'],
            ['interviewed', 'candidates'],
            ['candidates', 'offered'] // Prevent direct drag from candidates to offered
        ];
        if (disallowedMoves.some(([src, dest]) => src === source.droppableId && dest === destination.droppableId)) {
            return;
        }

        const listMap = {
            candidates: [candidates, setCandidates],
            interviewed: [interviewed, setInterviewed],
            offered: [offered, setOffered],
        };

        const [sourceList, setSourceList] = listMap[source.droppableId];
        const [destList, setDestList] = listMap[destination.droppableId];

        const newSourceList = Array.from(sourceList);
        const newDestList = Array.from(destList);

        const [movedItem] = newSourceList.splice(source.index, 1);

        // Only move the item to the destination list if it's not the 'offered' list
        if (destination.droppableId !== 'offered') {
            newDestList.splice(destination.index, 0, movedItem);
        }

        setSourceList(newSourceList);

        // We only set the destination list if it's not the 'offered' list.
        // The 'offered' list state will be set by the handleOffer function.
        if (destination.droppableId !== 'offered') {
            setDestList(newDestList);
        }

        if (destination.droppableId === "interviewed") {
            setInterviewCandidate(movedItem);
            setShowInterviewModal(true);
        } else if (destination.droppableId === "offered") {
            setOfferCandidate(movedItem);
            setJobPositionTitle(movedItem.jobTitles);
            setReqId(selectedRequisitionCode);
            setPositionId(selectedPositionId);
            setShowOfferModal(true);
        }
    };

    const handleScheduleInterview = async (interviewData) => {
        // this.setState({ isLoading: true });
        console.log("Scheduling interview with data:", interviewData);
        if (!interviewCandidate || !interviewData.interview_date || !interviewData.interview_time) {
            showToast("Please select both interview date and time.", "warning");
            return;
        }

        const [hour, minute] = interviewTime.split(":").map(Number);

        const interviewPayload = {
            candidate_id: interviewCandidate?.candidate_id,
            date: interviewData.interview_date,
            interview_time: interviewData.interview_time,
            // userId: 3,
            position_id: selectedPositionId,
        };
        setApiLoading(true);

        try {
            const response = await fetch(API_ENDPOINTS.SCHEDULE_INTERVIEW, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(interviewPayload)
            });

            const text = await response.text();
            console.log("Response text:", text);

            if (!response.ok) {
                throw new Error("Failed to schedule interview");
            }

            // Update status locally
            const updatedInterviewed = interviewed.map(candidate =>
                candidate.candidate_id === interviewCandidate.candidate_id
                    ? {
                        ...candidate, application_status: "Scheduled", interview_date: interviewData.interview_date,
                        interview_time: interviewData.interview_time, profileStatus: "Interview Scheduled"
                    }
                    : candidate
            );
            // If the candidate isn't in the list, add them. This handles the initial drag and drop.
            if (!updatedInterviewed.some(c => c.candidate_id === interviewCandidate.candidate_id)) {
                updatedInterviewed.push({
                    ...interviewCandidate,
                    application_status: "Scheduled",
                    interview_date: interviewData.interview_date,
                    interview_time: interviewData.interview_time
                });
            }
            setInterviewed(updatedInterviewed);

            setShowInterviewModal(false);
            setInterviewCandidate(null);
            setInterviewDate("");
            setInterviewTime("");
            showToast("Interview scheduled successfully!");
        } catch (error) {
            console.error("Error scheduling interview:", error);
        } finally {
            setApiLoading(false);
        }
    };


    const handleOffer = async (offerLetterPath) => {
        if (!offerCandidate || !salary || !offerLetterPath) {
            showToast("Please fill in all fields before sending the offer.");
            return;
        }
        setApiLoading(true);
        setLoading(true);
        setError(null);

        try {
            console.log("Offer Letter Path:", offerLetterPath);
            const response = await fetch(API_ENDPOINTS.OFFER, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    candidate_id: offerCandidate?.candidate_id,
                    position_id: positionId,
                    salary: Number(salary),
                    offer_letter_path: offerLetterPath
                })
            });

            console.log("Offer Candidate:", offerCandidate);
            console.log("Salary:", salary);
            console.log("Offer Letter Path:", offerLetterPath);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error sending offer:", errorData);
                throw new Error(errorData.message || `Error: ${response.statusText}`);
            }

            const updatedInterviewed = interviewed.filter(
                (c) => c.candidate_id !== offerCandidate.candidate_id
            );
            setInterviewed(updatedInterviewed);

            const updatedOffered = [
                ...offered,
                { ...offerCandidate, profileStatus: "Selected", rating: offerCandidate.rating || 0 }
            ];
            setOffered(updatedOffered);

            setShowOfferModal(false);
            setOfferCandidate(null);
            setSalary('');
            setReqId('');
            setPositionId('');
            setJobPositionTitle('');

            showToast("Offer sent successfully!", "success");

        } catch (err) {
            console.error("Failed to send offer:", err);
            setError(err.message || 'Failed to send offer');
        } finally {
            setApiLoading(false);
            setLoading(false);
        }
    };

    const handleCancelInterview = () => {
        if (interviewCandidate) {
            const updatedInterviewed = interviewed.filter(candidate => candidate.candidate_id !== interviewCandidate.candidate_id);
            setInterviewed(updatedInterviewed);
            const updatedCandidates = [...candidates, interviewCandidate];
            setCandidates(updatedCandidates);
        }
        setShowInterviewModal(false);
        setInterviewCandidate(null);
        setInterviewDate("");
        setInterviewTime("");
    };

    const handleCancelOffer = () => {
        if (offerCandidate) {
            const updatedOffered = offered.filter(candidate => candidate.candidate_id !== offerCandidate.candidate_id);
            setOffered(updatedOffered);
            const updatedInterviewed = [...interviewed, offerCandidate];
            setInterviewed(updatedInterviewed);
        }
        setShowOfferModal(false);
        setOfferCandidate(null);
        setJobPositionTitle("");
        setReqId("");
        setSalary("");
    };

    const handlePreview = () => {
        // alert(`Offer Preview for ${offerCandidate.full_name}:\nJob Position: ${jobPositionTitle}\nReq ID: ${reqId}\nSalary: ${salary}`);
        showToast(
            `Offer Preview for ${offerCandidate.full_name}: Job Position: ${jobPositionTitle}, Req ID: ${reqId}, Salary: ${salary}`,
            "info"
        );
    };

    const toggleDrawer = (candidate = null) => {
        setIsOpen(!isOpen);
        setSelectedCandidate(candidate);
    };

    // Update handleReschedule to fetch data from the API
    const handleReschedule = async (candidate) => {
        setLoading(true);
        setApiLoading(true);
        setError(null);
        try {
            const payload = {
                candidate_id: candidate.candidate_id,
                position_id: selectedPositionId // Assuming selectedPositionId holds the current position ID
            };
            const response = await axios.post(`https://bobjava.sentrifugo.com:8443/candidate/api/candidates/interviews`, payload);
            if (response.status === 200) {
                const interviewDetails = response.data;
                const scheduleAt = new Date(interviewDetails.schedule_at);
                const date = scheduleAt.toISOString().split('T')[0];
                const time = scheduleAt.toTimeString().split(' ')[0].substring(0, 5);

                const updatedCandidate = {
                    ...candidate,
                    interview_date: date,
                    interview_time: time
                };
                setRescheduleCandidate(updatedCandidate);
            } else {
                setRescheduleCandidate(candidate);
                showToast("Could not retrieve interview details.", "warning");
            }
        } catch (err) {
            console.error("Failed to fetch interview details:", err);
            setRescheduleCandidate(candidate);
            setError('Failed to fetch interview details');
        } finally {
            setLoading(false);
            setApiLoading(false);
            setShowRescheduleModal(true);
        }
    };

    const handleCancelReschedule = () => {
        setShowRescheduleModal(false);
        setRescheduleCandidate(null);
    };

    // Function to handle the actual reschedule interview
    const handleRescheduleInterview = async (interviewData) => {
        if (!interviewData.interview_date || !interviewData.interview_time) {
            showToast("Please select both interview date and time.", "warning");
            return;
        }
        setLoading(true);
        setApiLoading(true);
        setError(null);
        try {
            const payload = {
                candidate_id: rescheduleCandidate.candidate_id,
                date: interviewData.interview_date,
                time: interviewData.interview_time,
                position_id: selectedPositionId,
                status: 'Rescheduled',
            };
            const response = await axios.put('https://bobjava.sentrifugo.com:8443/candidate/api/candidates/update-interview-status', payload);
            if (response.status === 200) {
                showToast("Interview rescheduled successfully!", "success");
                const updatedInterviewed = interviewed.map(c =>
                    c.candidate_id === rescheduleCandidate.candidate_id ? { ...c, ...interviewData } : c
                );
                setInterviewed(updatedInterviewed);

                // Update the rescheduleCandidate state with the new data
                setRescheduleCandidate({ ...rescheduleCandidate, ...interviewData });
            }
        } catch (err) {
            console.error("Failed to reschedule interview:", err);
            setError(err.message || 'Failed to reschedule interview');
        } finally {
            setLoading(false);
            setApiLoading(false);
            setShowRescheduleModal(false);
        }
    };

    // Function to handle the cancellation of an interview
    const handleDeleteInterview = async () => {
        setLoading(true);
        setApiLoading(true);
        setError(null);
        try {
            // Get the date and time from the rescheduleCandidate object
            const payload = {
                candidate_id: rescheduleCandidate.candidate_id,
                date: rescheduleCandidate.interview_date, // 👈 Corrected: Add interview date
                time: rescheduleCandidate.interview_time, // 👈 Corrected: Add interview time
                position_id: selectedPositionId,
                status: 'Cancelled',
            };
            const response = await axios.put('https://bobjava.sentrifugo.com:8443/candidate/api/candidates/update-interview-status', payload);
            if (response.status === 200) {
                showToast("Interview cancelled successfully!", "success");
                // Move candidate to a different column or remove from 'Interviewed'
                const updatedInterviewed = interviewed.filter(c => c.candidate_id !== rescheduleCandidate.candidate_id);
                setInterviewed(updatedInterviewed);
                handleCancelReschedule();
            }
        } catch (err) {
            console.error("Failed to cancel interview:", err);
            setError(err.message || 'Failed to cancel interview');
        } finally {
            setLoading(false);
            setApiLoading(false);
        }
    };

    return (
        <Container fluid className="py-5 foncandidate">
            <div className="top-bar">
                <div className="responsive-breadcrumb-container">


                    {/* // CandidateCard.js */}
                    {/* <BreadcrumbItem> */}
                    <select
                        className="select-drop form-select spaceform"
                        name="jobReqDropdown"
                        value={selectedRequisitionCode}
                        onChange={handleJobReqChange}
                    >
                        <option value="">Select Requisition Code</option>
                        {jobReqs.length > 0 ? (
                            jobReqs.map((req, index) => (
                                <option key={index} value={req.requisition_code}>
                                    {req.requisition_code} - {req.requisition_title}
                                </option>
                            ))
                        ) : (
                            <option value="">No job requests available</option>
                        )}
                    </select>
                    {/* </BreadcrumbItem> */}
                    {selectedRequisitionCode && (
                        // <BreadcrumbItem>
                        <select
                            className="select-drop form-select"
                            name="jobPositionsDropdown"
                            value={selectedPositionId}
                            onChange={handleJobPositionChange}
                        >
                            <option value="">Select Position Title</option>
                            {jobPositions.length > 0 ? (
                                jobPositions.map((pos, index) => (
                                    <option key={index} value={pos.position_id}>
                                        {pos.position_code} - {pos.position_title}
                                    </option>
                                ))
                            ) : (
                                <option value="">No positions available</option>
                            )}
                        </select>
                        // </BreadcrumbItem>
                    )}
                </div>
                <div className="d-flex gap-3 w-50 justify-content-end">
                    <InputGroup className="search-b">
                     <InputGroup.Text style={{ backgroundColor: '#FF7043' }}>
      <FontAwesomeIcon icon={faSearch} style={{ color: '#fff' }} />
    </InputGroup.Text>
                        <Form.Control
                            placeholder="Search"
                            aria-label="Search"
                            className="search-f"
                            onChange={(e) => { setSearch(e.target.value) }}
                        />
                        <i className="bi bi-search search-i"></i>
                    </InputGroup>
                    {/* <button className="advanced-fil">
                        <i className="bi bi-sliders2-vertical"></i>ADVANCED FILTER
                    </button> */}
                </div>
            </div>
            <div className="row px-4 candidate-cards-3">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <div className="col-12 col-md-6 col-lg-3 px-4">
                        <div className="review_columns card">
                            <div className="card-body" style={{ maxHeight: 'auto', backgroundColor: '#fff', borderRadius: '15px', overflowY: 'hidden' }}>
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
                                            <div className="candidates overflow-auto px-2" style={{ minHeight: '100px', maxHeight: '60vh' }} ref={provided.innerRef} {...provided.droppableProps}>
                                                {candidates
                                                    .filter((candidate) => candidate.full_name.toLowerCase().includes(search.toLowerCase()))
                                                    .map((candidate, index) => (
                                                        <Draggable key={candidate.candidate_id} draggableId={candidate.candidate_id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div className="candidate_card_container card my-4" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => toggleDrawer(candidate)}>
                                                                    <div className="candidate_card card-body d-flex gap-3">
                                                                        <div>
                                                                            <img className="candidate_image"
                                                                                src={profile}
                                                                                alt={candidate.full_name} />
                                                                        </div>
                                                                        <div className="w-50 px-1">
                                                                            <h5 className="candidate_text fw-bold">{candidate.full_name}</h5>
                                                                            <h6 className="candidate_sub_text">{candidate.address}</h6>
                                                                            <h6 className="candidate_sub_text">{candidate.phone}</h6>
                                                                        </div>
                                                                        {/* <div className="card-status-label">{candidate.profileStatus}</div> */}
                                                                        {/* <div className="rating_container d-flex align-self-end p-1">
                                                                            <h6 className="rating_text px-1">{candidate.rating}</h6>
                                                                            <i className="bi bi-star-fill" style={{ color: "#f6ca5a" }}></i>
                                                                        </div> */}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                }
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
                            <div className="card-body" style={{ maxHeight: "auto", backgroundColor: '#fff', borderRadius: '15px', overflowY: 'hidden' }}>
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
                                            <div className="candidates overflow-auto px-2" style={{ minHeight: '100px', maxHeight: '60vh' }} ref={provided.innerRef} {...provided.droppableProps}>
                                                {interviewed
                                                    .filter((candidate) => candidate.full_name.toLowerCase().includes(search.toLowerCase()))
                                                    .map((candidate, index) => (
                                                        <Draggable key={candidate.candidate_id} draggableId={candidate.candidate_id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div className="candidate_card_container card my-4" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => toggleDrawer(candidate)}>
                                                                    <div className="candidate_card card-body d-flex gap-3" style={{ cursor: "pointer" }}>
                                                                        <div>
                                                                            <img className="candidate_image"
                                                                                src={profile}
                                                                                alt={candidate.full_name} />
                                                                        </div>
                                                                        <div className="w-50 px-1">
                                                                            <h5 className="candidate_text fw-bold">{candidate.full_name}</h5>
                                                                            <h6 className="candidate_sub_text">{candidate.address}</h6>
                                                                            <h6 className="candidate_sub_text">{candidate.phone}</h6>
                                                                        </div>
                                                                        {/* This is the new "Reschedule" button */}
                                                                        {candidate.application_status === 'Scheduled' && (
                                                                            <button
                                                                                variant="warning"
                                                                                size="sm"
                                                                                className="mt-2 reschedule-btn"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation(); // Prevents the card's onClick from firing
                                                                                    handleReschedule(candidate);
                                                                                }}
                                                                            >
                                                                                Reschedule
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                }
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
                            <div className="card-body" style={{ maxHeight: "auto", backgroundColor: '#fff', borderRadius: '15px', overflowY: 'hidden' }}>
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
                                            <div className="candidates overflow-auto px-2" style={{ minHeight: '100px', maxHeight: '60vh' }} ref={provided.innerRef} {...provided.droppableProps}>
                                                {offered
                                                    .filter((candidate) => candidate.full_name.toLowerCase().includes(search.toLowerCase()))
                                                    .map((candidate, index) => (
                                                        <Draggable key={candidate.candidate_id} draggableId={candidate.candidate_id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div className="candidate_card_container card my-4" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => toggleDrawer(candidate)}>
                                                                    <div className="candidate_card card-body d-flex gap-3" style={{ cursor: "pointer" }}>
                                                                        <div>
                                                                            <img className="candidate_image"
                                                                                // src={profile_prictures[index % profile_prictures.length]}
                                                                                src={profile}
                                                                            />
                                                                        </div>
                                                                        <div className="w-50 px-1">
                                                                            <h5 className="candidate_text fw-bold">{candidate.full_name}</h5>
                                                                            <h6 className="candidate_sub_text">{candidate.address}</h6>
                                                                            <h6 className="candidate_sub_text">{candidate.phone}</h6>
                                                                        </div>
                                                                        {/* <div className="card-status-label">{candidate.profileStatus}</div> */}
                                                                        {/* <div className="rating_container d-flex align-self-end p-1">
                                                                            <h6 className="rating_text px-1">{ratedOffered?.find(c => c?.candidate_id === candidate?.candidate_id)?.rating}</h6>
                                                                            <i className="bi bi-star-fill" style={{ color: "#f6ca5a" }}></i>
                                                                        </div> */}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                }
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
                    ratedCandidates={ratedCandidates}
                />
            )}
            {/* <InterviewModal
                show={showInterviewModal}
                handleClose={handleCancelInterview}
                candidate={interviewCandidate}
                date={interviewDate}
                setDate={setInterviewDate}
                time={interviewTime}
                setTime={setInterviewTime}
                handleSchedule={handleScheduleInterview}
            /> */}
            <InterviewModal
                show={showInterviewModal}
                handleClose={handleCancelInterview}
                handleSave={handleScheduleInterview}
                candidate={interviewCandidate}
                position_id={positionId}
                isReschedule={false}
            />
            <InterviewModal
                show={showRescheduleModal}
                handleClose={handleCancelReschedule}
                handleSave={handleRescheduleInterview}
                handleCancelInterview={handleDeleteInterview}
                candidate={rescheduleCandidate}
                isReschedule={true}
            />
            <OfferModal
                show={showOfferModal}
                handleClose={handleCancelOffer}
                candidate={offerCandidate}
                position_title={selectedPositionTitle}
                reqId={reqId}
                position_id={positionId}
                salary={salary}
                setSalary={setSalary}
                handleOffer={handleOffer}
                loading={loading}
                error={error}
                offerLetterPath={offerLetterPath} // 👈 Pass the state down
                setOfferLetterPath={setOfferLetterPath}
            />
            {apiLoading && (
                <div className="d-flex justify-content-center align-items-center" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(255,255,255,0.5)", zIndex: 9999 }}>
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
        </Container>
    );
};

export default CandidateCard;