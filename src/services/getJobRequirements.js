import apiService from "./apiService";
// const BASE_URL = "https://bobjava.sentrifugo.com:8443/candidate";

export const API_ENDPOINTS = {
//   SCHEDULE_INTERVIEW: `${BASE_URL}/api/candidates/schedule-interview`,
//   OFFER: `${BASE_URL}/api/candidates/offer`,
//    GET_INTERVIEW_DETAILS: `${BASE_URL}/api/candidates/interviews`, // New endpoint for getting interview details
//   UPDATE_INTERVIEW_STATUS: `${BASE_URL}/api/candidates/update-interview-status`,
};

export const getJobRequirements = async () => {
  try {
    const data = await apiService.getReqData(); // ✅ Call the apiService instead of fetch
    return data;
  } catch (error) {
    console.error("Failed to fetch job requirements:", error);
    return { data: [] }; // Keep fallback for safety
  }
};

export const getJobPositions = async (requisition_id) => {
  try {
     const data = await apiService.getByRequisitionId(requisition_id);
     return  data?.data || [];
  } catch (error) {
    console.error("Failed to fetch job positions:", error);
    return [];
  }
};


export const getCandidatesByPosition = async (position_id) => {
  try {
    // Corrected to use apiService
    const data = await apiService.getCanByPosition(position_id);
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch candidates:", error);
    return [];
  }
};

export const fetchCandidatesByStatus = async (status) => {
  try {
    return await apiService.getCanByStatus(status);
  } catch (error) {
    console.error(`Failed to fetch candidates with status ${status}:`, error);
    return [];
  }
};