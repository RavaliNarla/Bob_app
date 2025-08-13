const BASE_URL = "http://192.168.20.115:8081";

export const API_ENDPOINTS = {
  SCHEDULE_INTERVIEW: `${BASE_URL}/api/candidates/schedule-interview`,
  OFFER: `${BASE_URL}/api/candidates/offer`,
};

export const getJobRequirements = async () => {
    try {
        const response = await fetch('http://192.168.20.111:8081/api/getreq');
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
        const response = await fetch(`http://192.168.20.111:8081/api/getpos`);
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
        const response = await fetch(`http://192.168.20.115:8081/api/candidates/details-by-position/${position_id}`);
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
        const response = await fetch(`http://192.168.20.115:8081/api/candidates/get-candidates/${status}`);
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