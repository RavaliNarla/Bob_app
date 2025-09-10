import axios from 'axios';
import { getCandidatesByPosition } from './getJobRequirements';
import { store } from "../store"; // adjust path if needed
import { clearUser } from "../store/userSlice";

function getToken() {
  const state = store.getState();
  return state.user?.authUser?.token || null;
}

// Use the environment variables with a fallback to the new URLs you provided.
// This is the correct way to handle different API services.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE_URLS = process.env.REACT_APP_API_BASE_URLS;
const NODE_API_URL = process.env.REACT_APP_NODE_API_URL;
const CANDIDATE_API_URL = process.env.REACT_APP_CANDIDATE_API_URL;


// Create a primary axios instance for most API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Create a secondary axios instance for the master data API call
const apis = axios.create({
  baseURL: API_BASE_URLS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Candidate API instance
const candidateApi = axios.create({
  baseURL: CANDIDATE_API_URL,
  headers: { "Content-Type": "application/json" },
});

const nodeApi = axios.create({
  baseURL: NODE_API_URL,
  headers: { "Content-Type": "application/json" },
});
const parseResumeApi = axios.create({
  baseURL: process.env.REACT_APP_PARSE_RESUME_URL,
  headers: { "Content-Type": "multipart/form-data" },
});




// Request interceptor to add auth token for the primary API
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearUser());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// Request interceptor to add auth token for the secondary API
apis.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apis.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearUser());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

nodeApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

nodeApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearUser());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
parseResumeApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

parseResumeApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearUser());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const apiService = {
  // Auth endpoints
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  logout: () => api.post('/auth/logout'),

  // User endpoints
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Data endpoints
  getData: (params = {}) => api.get('/data', { params }),
  getDataItem: (id) => api.get(`/data/${id}`),
  createData: (data) => api.post('/data', data),
  updateData: (id, data) => api.put(`/data/${id}`, data),
  deleteData: (id) => api.delete(`/data/${id}`),


  getReqData: () => api.get('/job-requisitions/all'),
  getPosData: () => api.get('/job-positions/all'),
  getCanByPosition: (position_id) => candidateApi.get(`/candidates/details-by-position/${position_id}`),
  getCanByStatus: (status) => candidateApi.get(`/candidates/get-by-status/${status}`),

  createRequisition: (data) => api.post('/job-requisitions/create', data),
  updateRequisition: (id, data) => api.put(`/job-requisitions/update/${id}`, data),
  deleteRequisition: (id) => api.delete(`/job-requisitions/delete/${id}`),

  jobCreation: (data) => api.post('/job-positions/create', data),
  getMasterData: () => apis.get('/all'),

  uploadJobExcel: (data) => api.post('/job-positions/create-bulk', data), 
  postJobRequisitions: (payload) => api.post("/requisitionpost", payload), // Not using this anywhere
  getByRequisitionId: (requisition_id) => api.get(`job-positions/get-by-requisition/${requisition_id}`), 
  jobpost: (data) => api.post('/job-requisitions/submit-for-approval', data),
  getallLocations: () => apis.get('/location/all'),
  getallCities: () => apis.get('/city/all'),
  addLocation: (data) => apis.post("/location/add", data),
  updateLocation: (id, data) => apis.put(`/location/update/${id}`, data),
  deleteLocation: (id) => apis.delete(`/location/delete/${id}`),
  updateJob: (data) => api.put('/job-positions/update', data),
  getByPositionId: (position_id) => api.get(`job-positions/get/${position_id}`),
  getDashboardQueries: () => api.get('/dashboard/queries'),
  getDashboardMetrics: () => api.get('/dashboard/metrics'),
  getallDepartment: () => apis.get('/departments/all'),
  addDepartment: (data) => apis.post('/departments/add', data),
  updateDepartment: (id, data) => apis.put(`/departments/update/${id}`, data),
  deleteDepartment: (id) => apis.delete(`/departments/delete/${id}`),
  getallSkills: () => apis.get('/skill/all'),
  addSkill: (data) => apis.post('/skill/add', data),
  updateSkill: (id, data) => apis.put(`/skill/update/${id}`, data),
  deleteSkill: (id) => apis.delete(`/skill/delete/${id}`),
  getallJobGrade: () => apis.get('/jobgrade/all'),
  addJobGrade: (data) => apis.post('/jobgrade/add', data),
  updateJobGrade: (id, data) => apis.put(`/jobgrade/update/${id}`, data),
  deleteJobGrade: (id) => apis.delete(`/jobgrade/delete/${id}`),

  // Approvals
  updateApproval: (data) => api.post('/job-requisitions/approve', data), 
  getApprovalstatus: (userid) => api.get(`job-requisitions/approvals/${userid}`),
getWorkflowApprovals:(userid) =>api.get(`job-requisitions/workflow-approvals/${userid}`),
  //Candidate Interview
  createInterview: (data) => candidateApi.post('/candidates/interviews', data),
  updateInterviewStatus: (data) => candidateApi.put('/candidates/schedule-interview', data),
   //getfeedback: (candidate_id,position_id) => candidateApi.get(`/candidates/getfeedback/${candidate_id}/${position_id}`),
   getfeedback: (candidate_id, position_id) =>
  candidateApi.get("/candidates/get-feedback", {
    params: { candidate_id, position_id },
  }),

  postFeedback: (data) => candidateApi.post('/candidates/feedback', data),
  // updateInterviewStatus: (data) => candidateApi.put('/candidates/update-interview-status', data),
  //Payment
  getPayment: () => candidateApi.get('/razorpay/all'),

  // --- Auth (Node API) ---
  forgotPassword: (email) => nodeApi.post('/auth/candidate-forgot-password', { email }),
  // Register
  getRegister: () => nodeApi.get('/getdetails/users/all'),
  registerUser: (data) => nodeApi.post('/auth/recruiter-register', data), // Auth (Node API)


  recruiterLogin: (email, password) => nodeApi.post("/auth/recruiter-login", { email, password }),

  resendVerification: (user_id) => nodeApi.post("/auth/recruiter-resend-verification", { user_id }),

  getRecruiterDetails: (email) => nodeApi.post("/getdetails/users", { email }),

  uploadOfferLetter: (data) => nodeApi.post("/offer-letters/upload", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),

  scheduleInterview: (interviewPayload) =>
    candidateApi.put("/candidates/schedule-interview", interviewPayload),

  sendOffer: (payload) =>
    candidateApi.put("/candidates/offer", payload),

  getInterviewsByDateRange: (startTimestamp, endTimestamp) =>
    candidateApi.get('/candidates/interviews/by-date-range', {
      params: { startTimestamp, endTimestamp },
    }),

  getFreeBusySlots: (email, date, interval = 60, tz = 'Asia/Kolkata') =>
  nodeApi.get('/calendar/free-busy', {
    params: { email, date, interval, tz }
  }),

  getCandidateDetails: (candidate_id) => candidateApi.get(`candidates/get-by-candidate/${candidate_id}`),
updateCandidates: (data) => candidateApi.put('candidates/update_candidate', data),
applyJobs: (data) => candidateApi.post('candidates/apply/job',data),


parseResume: (formData) => parseResumeApi.post("/parse-resume2", formData),

  // Candidate Registration (Node API - bobbe)
  candidateRegister: (data) =>
    nodeApi.post("/auth/candidate-register", data),

  // Resume Upload (Node API - bobbe)
  uploadResume: (formData) =>
    nodeApi.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
   
};

export default apiService;
