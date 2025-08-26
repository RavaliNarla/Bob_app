import axios from 'axios';
import { getCandidatesByPosition } from './getJobRequirements';

// Use the environment variables with a fallback to the new URLs you provided.
// This is the correct way to handle different API services.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.20.111:8081/api';
const API_BASE_URLS = process.env.REACT_APP_API_BASE_URLS || 'http://192.168.20.115:8080/api';
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


// Request interceptor to add auth token for the primary API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling on the primary API
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token for the secondary API
apis.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling on the secondary API
apis.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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


  getReqData: () => api.get('/getreq'),
  getPosData: () => api.get('/getpos'),
  getCanByPosition: (position_id) => candidateApi.get(`/candidates/details-by-position/${position_id}`),
  getCanByStatus: (status) => candidateApi.get(`/candidates/get-candidates/${status}`),

  createRequisition: (data) => api.post('/create_requisitions', data),
  updateRequisition: (data) => api.put('/update_requisitions', data),
  deleteRequisition: (id) => api.delete(`/delete_requisitions/${id}`),

  jobCreation: (data) => api.post('/create_positions', data),
  getMasterData: () => apis.get('/all'),

  uploadJobExcel: (data) => api.post('/create_bulk_positions', data), // Dummy POST endpoint
  postJobRequisitions: (payload) => api.post("/requisitionpost", payload),
  getallLocations: () => apis.get('/location/all'),
  getallCities: () => apis.get('/city/all'),
  addLocation: (data) => apis.post("/location/add", data),
  updateLocation: (id, data) => apis.put(`/location/update/${id}`, data),
  deleteLocation: (id) => apis.delete(`/location/delete/${id}`),
  updateJob: (data) => api.put('/update_positions', data),
  getByRequisitionId: (requisition_id) => api.get(`getbyreq/${requisition_id}`),
  getByPositionId: (position_id) => api.get(`getByPositionId/${position_id}`),
  jobpost: (data) => api.post('/job_postings', data),
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
  updateApproval: (data) => api.put('/approve_job_postings', data),
  getApprovalstatus: (role) => api.get(`/need_approval/${role}`),

  //Candidate Interview
  createInterview: (data) => candidateApi.post('/candidates/interviews', data),
  updateInterviewStatus: (data) => candidateApi.put('/candidates/update-interview-status', data),
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
  candidateApi.get('/calendar/free-busy', {
    params: { email, date, interval, tz }
  }),
   
};

export default apiService;
