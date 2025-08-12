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
import { getJobRequirements, getJobPositions, getCandidatesByPosition, fetchCandidatesByStatus } from "../services/getJobRequirements";

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

    const showToast = (message, variant) => {
        alert(message);
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
        setJobPositionTitle("");
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

    const handleScheduleInterview = async () => {
        if (!interviewCandidate || !interviewDate || !interviewTime) {
            console.error("Missing required interview information.");
            return;
        }

        const [hour, minute] = interviewTime.split(":").map(Number);

        const interviewPayload = {
            candidate_id: interviewCandidate.candidate_id,
            date: interviewDate,
            interview_time: interviewTime,
            userId: 3, // Replace with actual user ID if needed
            position_id: selectedPositionId
        };

        try {
            const response = await fetch("http://192.168.20.115:8081/api/candidates/schedule-interview", {
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
                    ? { ...candidate, profileStatus: "Interview Scheduled" }
                    : candidate
            );
            setInterviewed(updatedInterviewed);

            setShowInterviewModal(false);
            setInterviewCandidate(null);
            setInterviewDate("");
            setInterviewTime("");
            showToast("Interview scheduled successfully!");
        } catch (error) {
            console.error("Error scheduling interview:", error);
        }
    };



    const handleOffer = async () => {
        if (!offerCandidate || !salary) {
            console.error("Missing candidate or salary details.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const offerLetterPath = "C:\\Users\\sumanth.sangam\\Downloads\\Academic_CV_Template.pdf";

            const response = await fetch('http://192.168.20.115:8081/api/candidates/offer', {
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.statusText}`);
            }

            // If API call is successful, then update local state
            const updatedInterviewed = interviewed.filter(
                (c) => c.candidate_id !== offerCandidate.candidate_id
            );
            setInterviewed(updatedInterviewed);

            const updatedOffered = [
                ...offered,
                { ...offerCandidate, profileStatus: "Selected", rating: offerCandidate.rating || 0 }
            ];
            setOffered(updatedOffered);

            // Clean up after successful offer
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
        alert(`Offer Preview for ${offerCandidate.full_name}:\nJob Position: ${jobPositionTitle}\nReq ID: ${reqId}\nSalary: ${salary}`);
    };

    const toggleDrawer = (candidate = null) => {
        setIsOpen(!isOpen);
        setSelectedCandidate(candidate);
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
                                <option value="">Select Requisition Code</option>
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
                        {selectedRequisitionCode && (
                            <BreadcrumbItem>
                                <select
                                    className="select-drop"
                                    name="jobPositionsDropdown"
                                    value={selectedPositionId}
                                    onChange={handleJobPositionChange}
                                >
                                    <option value="">Select Position Title</option>
                                    {jobPositions.length > 0 ? (
                                        jobPositions.map((pos, index) => (
                                            <option key={index} value={pos.position_id}>
                                                {pos.position_title}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">No positions available</option>
                                    )}
                                </select>
                            </BreadcrumbItem>
                        )}
                    </Breadcrumb>
                </div>
                <div className="d-flex gap-3 w-50 justify-content-end">
                    <InputGroup className="search-b">
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
                            <div className="card-body" style={{ maxHeight: '82vh', backgroundColor: '#fff', borderRadius: '15px', overflowY: 'hidden' }}>
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
                                                {candidates
                                                    .filter((candidate) => candidate.full_name.toLowerCase().includes(search.toLowerCase()))
                                                    .map((candidate, index) => (
                                                        <Draggable key={candidate.candidate_id} draggableId={candidate.candidate_id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div className="candidate_card_container card my-4" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => toggleDrawer(candidate)}>
                                                                    <div className="candidate_card card-body d-flex justify-content-between">
                                                                        <div>
                                                                            <img className="candidate_image" src={candidate.avatar || profile_prictures[index % profile_prictures.length]} alt={candidate.full_name} />
                                                                        </div>
                                                                        <div className="w-50 px-1">
                                                                            <h5 className="candidate_text fw-bold">{candidate.full_name}</h5>
                                                                            <h6 className="candidate_sub_text">{candidate.address}</h6>
                                                                            <h6 className="candidate_sub_text">{candidate.phone}</h6>
                                                                        </div>
                                                                        <div className="card-status-label">{candidate.profileStatus}</div>
                                                                        <div className="rating_container d-flex align-self-end p-1">
                                                                            <h6 className="rating_text px-1">{candidate.rating}</h6>
                                                                            <i className="bi bi-star-fill" style={{ color: "#f6ca5a" }}></i>
                                                                        </div>
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
                            <div className="card-body" style={{ maxHeight: "82vh", backgroundColor: '#fff', borderRadius: '15px', overflowY: 'hidden' }}>
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
                                                {interviewed
                                                    .filter((candidate) => candidate.full_name.toLowerCase().includes(search.toLowerCase()))
                                                    .map((candidate, index) => (
                                                        <Draggable key={candidate.candidate_id} draggableId={candidate.candidate_id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div className="candidate_card_container card my-4" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => toggleDrawer(candidate)}>
                                                                    <div className="candidate_card card-body d-flex justify-content-between" style={{ cursor: "pointer" }}>
                                                                        <div>
                                                                            <img className="candidate_image" src={profile_prictures[index % profile_prictures.length]} />
                                                                        </div>
                                                                        <div className="w-50 px-1">
                                                                            <h5 className="candidate_text fw-bold">{candidate.full_name}</h5>
                                                                            <h6 className="candidate_sub_text">{candidate.address}</h6>
                                                                            <h6 className="candidate_sub_text">{candidate.phone}</h6>
                                                                        </div>
                                                                        <div className="card-status-label">{candidate.profileStatus}</div>
                                                                        <div className="rating_container d-flex align-self-end p-1">
                                                                            <h6 className="rating_text px-1">{ratedInterviewed?.find(c => c?.candidate_id === candidate?.candidate_id)?.rating}</h6>
                                                                            <i className="bi bi-star-fill" style={{ color: "#f6ca5a" }}></i>
                                                                        </div>
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
                            <div className="card-body" style={{ maxHeight: "82vh", backgroundColor: '#fff', borderRadius: '15px', overflowY: 'hidden' }}>
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
                                                {offered
                                                    .filter((candidate) => candidate.full_name.toLowerCase().includes(search.toLowerCase()))
                                                    .map((candidate, index) => (
                                                        <Draggable key={candidate.candidate_id} draggableId={candidate.candidate_id.toString()} index={index}>
                                                            {(provided) => (
                                                                <div className="candidate_card_container card my-4" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => toggleDrawer(candidate)}>
                                                                    <div className="candidate_card card-body d-flex justify-content-between" style={{ cursor: "pointer" }}>
                                                                        <div>
                                                                            <img className="candidate_image" src={profile_prictures[index % profile_prictures.length]} />
                                                                        </div>
                                                                        <div className="w-50 px-1">
                                                                            <h5 className="candidate_text fw-bold">{candidate.full_name}</h5>
                                                                            <h6 className="candidate_sub_text">{candidate.address}</h6>
                                                                            <h6 className="candidate_sub_text">{candidate.phone}</h6>
                                                                        </div>
                                                                        <div className="card-status-label">{candidate.profileStatus}</div>
                                                                        <div className="rating_container d-flex align-self-end p-1">
                                                                            <h6 className="rating_text px-1">{ratedOffered?.find(c => c?.candidate_id === candidate?.candidate_id)?.rating}</h6>
                                                                            <i className="bi bi-star-fill" style={{ color: "#f6ca5a" }}></i>
                                                                        </div>
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
                position_title={selectedPositionTitle}
                reqId={reqId}
                position_id={positionId}
                salary={salary}
                setSalary={setSalary}
                handleOffer={handleOffer}
                loading={loading}
                error={error}
            />
        </Container>
    );
};

export default CandidateCard;