const BASE_URL = "https://bobjava.sentrifugo.com:8443/candidate";

export const API_ENDPOINTS = {
  SCHEDULE_INTERVIEW: `${BASE_URL}/api/candidates/schedule-interview`,
  OFFER: `${BASE_URL}/api/candidates/offer`,
   GET_INTERVIEW_DETAILS: `${BASE_URL}/api/candidates/interviews`, // New endpoint for getting interview details
  UPDATE_INTERVIEW_STATUS: `${BASE_URL}/api/candidates/update-interview-status`,
};

export const getJobRequirements = async () => {
    try {
        const response = await fetch('https://bobjava.sentrifugo.com:8443/jobcreation/api/getreq');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch job requirements:", error);
        return { data: [] }; // Return an object with an empty data array
    }
};

export const getJobPositions = async (requisition_id) => {
    try {
        const response = await fetch(`https://bobjava.sentrifugo.com:8443/jobcreation/api/getpos`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Assuming the API returns a list of positions, we filter by requisition_id
        const filteredData = data.filter(pos => pos.requisition_id === requisition_id);
        return filteredData;
    } catch (error) {
        console.error("Failed to fetch job positions:", error);
        return [];
    }
};

export const getCandidatesByPosition = async (position_id) => {
    try {
        const response = await fetch(`https://bobjava.sentrifugo.com:8443/candidate/api/candidates/details-by-position/${position_id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data || []; // Corrected: This line now returns the array inside the 'data' key
    } catch (error) {
        console.error("Failed to fetch candidates:", error);
        return [];
    }
};

export const fetchCandidatesByStatus = async (status) => {
    try {
        const response = await fetch(`https://bobjava.sentrifugo.com:8443/candidate/api/candidates/get-candidates/${status}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data; // Assuming the API returns an array of candidates
    } catch (error) {
        console.error(`Failed to fetch candidates with status ${status}:`, error);
        return [];
    }
};