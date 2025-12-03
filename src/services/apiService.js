import axios from 'axios';
import { getCandidatesByPosition } from './getJobRequirements';
import { store } from "../store"; // adjust path if needed
import { clearUser } from "../store/userSlice";

// --- JWT Decoder helper ---
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1]; // payload part
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload;
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
}


function getToken() {
  const state = store.getState();
  const token = state.user?.authUser?.access_token || null;

  if (token) {
    const decoded = decodeJWT(token);
    if (decoded?.exp) {
      const expiry = new Date(decoded.exp * 1000);
      // console.log("🔑 Token will expire at:", expiry.toLocaleString());

      const timeLeft = expiry.getTime() - Date.now();
      // console.log("⏳ Time left (ms):", timeLeft, "≈", Math.round(timeLeft / 60000), "minutes");

      if (timeLeft < 3 * 60 * 1000) {
        console.warn("⚠️ Token expiring soon! Refresh flow will trigger soon.");
      }
    }
  }

  return token;
}

// Use the environment variables with a fallback to the new URLs you provided.
// This is the correct way to handle different API services.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_BASE_URLS = process.env.REACT_APP_API_BASE_URLS;
const NODE_API_URL = process.env.REACT_APP_NODE_API_URL;
const CANDIDATE_API_URL = process.env.REACT_APP_CANDIDATE_API_URL;
// const API_BASE_URL = 'https://bobjava.sentrifugo.com:8443/jobcreation/api/v1'
// const API_BASE_URLS = 'https://bobjava.sentrifugo.com:8443/master/api'
// const NODE_API_URL = 'https://bobbe.sentrifugo.com/api';
// const NODE_API_URL = 'http://localhost:5000/api';
// //const CANDIDATE_API_URL = process.env.REACT_APP_CANDIDATE_API_URL;
// const CANDIDATE_API_URL = 'https://bobjava.sentrifugo.com:8443/candidate/api/v1'

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};


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
  withCredentials: true,
});

const templateApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "multipart/form-data" },
  withCredentials: true,
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

// api.interceptors.response.use(
//   (response) => response.data,
//   (error) => {
//     if (error.response?.status === 401) {
//       store.dispatch(clearUser());
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // 🔄 Handle expired session
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("⚠️ Java API session expired (api). Trying refresh...");
      originalRequest._retry = true;

      try {
        await nodeApi.post("/recruiter-auth/recruiter-refresh-token", null, { withCredentials: true });

        // console.log("✅ Token refreshed (api). Retrying:", originalRequest.url);
        return api(originalRequest); // retry original request on api
      } catch (err) {
        console.error("⛔ Refresh failed (api). Redirecting to login");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    // ✅ Handle 400–499 gracefully (don’t throw, return backend JSON)
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      return error.response.data;
    }

    // ❌ fallback for network errors / 500+
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

// apis.interceptors.response.use(
//   (response) => response.data,
//   (error) => {
//     if (error.response?.status === 401) {
//       store.dispatch(clearUser());
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

apis.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("⚠️ Java API session expired (apis). Trying refresh...");
      originalRequest._retry = true;

      try {
        await nodeApi.post("/recruiter-auth/recruiter-refresh-token", null, { withCredentials: true });

        // console.log("✅ Token refreshed (apis). Retrying:", originalRequest.url);
        return apis(originalRequest); // retry original request on apis
      } catch (err) {
        console.error("⛔ Refresh failed (apis). Redirecting to login");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Request interceptor to add auth token for the secondary API
candidateApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// apis.interceptors.response.use(
//   (response) => response.data,
//   (error) => {
//     if (error.response?.status === 401) {
//       store.dispatch(clearUser());
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

candidateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("⚠️ Java API session expired (apis). Trying refresh...");
      originalRequest._retry = true;

      try {
        await nodeApi.post("/recruiter-auth/recruiter-refresh-token", null, { withCredentials: true });

        // console.log("✅ Token refreshed (apis). Retrying:", originalRequest.url);
        return apis(originalRequest); // retry original request on apis
      } catch (err) {
        console.error("⛔ Refresh failed (apis). Redirecting to login");
        window.location.href = "/login";
        return Promise.reject(err);
      }
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
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized occurs, the cookie has likely expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try refreshing token automatically; backend reads refresh cookie
        await nodeApi.post("/recruiter-auth/recruiter-refresh-token", null, { withCredentials: true });

        // console.log("Token refreshed and original request retried", originalRequest);
        // Retry the original request; cookies are sent automatically
        // console.log("🔄 Token refresh successful, retrying original request");
        return nodeApi(originalRequest);
      } catch (err) {
        // Refresh failed → clear user and redirect to login
        window.location.href = "/login";
        return Promise.reject(err);
      }
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
templateApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
templateApi.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await nodeApi.post("/recruiter-auth/recruiter-refresh-token", null, {
          withCredentials: true,
        });

        return templateApi(originalRequest);
      } catch (err) {
        window.location.href = "/login";
        return Promise.reject(err);
      }
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

  // --- Approval trail for a requisition (username, useremail, status) ---
  getApprovalTrail: (requisition_id) => api.get(`job-requisitions/workflow-approvals-details/${requisition_id}`),


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
  getWorkflowApprovals: (userid) => api.get(`job-requisitions/workflow-approvals/${userid}`),
  //Candidate Interview
  createInterview: (applicationId) =>
    candidateApi.get(`/candidates/interviews/${applicationId}`),
  updateInterviewStatus: (data) => candidateApi.put('/candidates/schedule-interview', data),
  getPanelSlots: (panelId, date) =>
    candidateApi.get('/candidates/panel-free-slots', { params: { panelId, date } }),
  //getfeedback: (candidate_id,position_id) => candidateApi.get(`/candidates/getfeedback/${candidate_id}/${position_id}`),
  getfeedback: (application_id) =>
    candidateApi.get(`/candidates/get-feedback/${application_id}`),

  postFeedback: (data) => candidateApi.post('/candidates/feedback', data),
  // updateInterviewStatus: (data) => candidateApi.put('/candidates/update-interview-status', data),
  //Payment
  getPayment: () => candidateApi.get('/razorpay/all'),

  // --- Auth (Node API) ---
  forgotPassword: (email) =>
    nodeApi.post(`/candidate-auth/candidate-forgot-password?email=${email}`),




  // Register
  getRegister: (token) =>
    nodeApi.get('/getdetails/users/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  registerUser: (data) => nodeApi.post('/recruiter-auth/recruiter-register', data), // Auth (Node API)


  recruiterLogin: (email, password) => nodeApi.post("/recruiter-auth/recruiter-login", { email, password }),

  resendVerification: (user_id) => nodeApi.post("/recruiter-auth/recruiter-resend-verification", { user_id }),

  // getRecruiterDetails: (email) => nodeApi.post("/getdetails/users", email,
  //   {
  //     headers: {
  //       "Content-Type": "text/plain",
  //     },

  //   }),
  getRecruiterDetails: (email, token) =>
    nodeApi.post(
      `/getdetails/users?email=${email}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),


  uploadOfferLetter: (data) => api.post("/offer-templates/upload_offer_letter", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),

  scheduleInterview: (interviewPayload) =>
    candidateApi.put("/candidates/schedule-interview", interviewPayload),

  sendOffer: (payload) =>
    candidateApi.put("/candidates/offer", payload),

  sendBulkOffer: (payload) =>
    candidateApi.post("/candidates/sendOfferLetterBulk", payload),

  getInterviewsByDateRange: (startTimestamp, endTimestamp) =>
    candidateApi.get('/candidates/interviews/by-date-range', {
      params: { startTimestamp, endTimestamp },
    }),

  getFreeBusySlots: (email, date, interval = 60, tz = 'Asia/Kolkata') =>
    api.get('/calendar/free-busy', {
      params: { email, date, interval, tz }
    }),

  getCandidateDetails: (candidate_id) => candidateApi.get(`candidates/get-by-candidate/${candidate_id}`),
  updateCandidates: (data) => candidateApi.put('candidates/update_candidate', data),
  applyJobs: (data) => candidateApi.post('candidates/apply/job', data),


  parseResume: (formData) => parseResumeApi.post("/parseresume", formData),

  // Candidate Registration (Node API - bobbe)
  candidateRegister: (data) =>
    nodeApi.post("/candidate-auth/candidate-register", data),

  // Resume Upload (Node API - bobbe)
  uploadResume: (formData) =>
    candidateApi.post("/resume/upload-resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // refreshToken: (refresh_token) =>
  // nodeApi.post("/auth/recruiter-refresh-token", { refresh_token }),
  refreshToken: () =>
    nodeApi.post("/recruiter-auth/recruiter-refresh-token", null, { withCredentials: true }),

  uploadTemplate: (data) => templateApi.post('/offer-templates/upload', data),
  getTemplates: () => templateApi.get('/offer-templates'),
  getTemplateContent: (id) => templateApi.get(`/offer-templates/${encodeURIComponent(id)}/content`, {
    responseType: 'text',
  }),
  getAllPositions: () => apis.get("/master-positions/all"),
  addPosition: (data) => apis.post("/master-positions/add", data),
  updatePosition: (id, data) => apis.put(`/master-positions/update/${id}`, data),
  deletePosition: (id) => apis.delete(`/master-positions/delete/${id}`),

  getAllSpecialCategories: () => apis.get('/special-categories/all'),
  addSpecialCategory: (data) => apis.post('/special-categories/add', data),
  updateSpecialCategory: (id, data) => apis.put(`/special-categories/update/${id}`, data),
  deleteSpecialCategory: (id) => apis.delete(`/special-categories/delete/${id}`),

  getAllCategories: () => apis.get('/categories/all'),
  addCategory: (data) => apis.post('/categories/add', data),
  updateCategory: (id, data) => apis.put(`/categories/update/${id}`, data),
  deleteCategory: (id) => apis.delete(`/categories/delete/${id}`),

  getAllRelaxationType: () => apis.get('/relaxation-type/all'),
  addRelaxationType: (data) => apis.post('/relaxation-type/add', data),
  updateRelaxationType: (id, data) => apis.put(`/relaxation-type/update/${id}`, data),
  deleteRelaxationType: (id) => apis.delete(`/relaxation-type/delete/${id}`),
  //documents
  getAllDocuments: () => apis.get("/document-types/all"),
  addDocument: (data) => apis.post("/document-types/add", data),
  updateDocument: (id, data) => apis.put(`/document-types/update/${id}`, data),
  deleteDocument: (id) => apis.delete(`/document-types/delete/${id}`),

  //Relaxation
  saveRelaxation: (data) => api.post('/job-relaxation-policy/add', data),
  getRelaxations: () => api.get('/job-relaxation-policy/all'),
  updateRelaxation: (id, data) => api.put(`/job-relaxation-policy/update/${id}`, data),

  processResumesJC: () => api.post("/resume/start-batch-process", {}),

  getbulkcandidatesJC: () => api.get("/bulkresumes/all"),

  deleteResumeJC: (resumeId) =>
    api.delete(`/resume/delete-resume/${encodeURIComponent(resumeId)}`),

  // Fetch bulk-uploaded candidates who have NOT applied for the selected position
  getNotAppliedBulkUploadCandidates: (position_id) =>
    candidateApi.get(`/candidates/not-applied-bulk-upload/${position_id}`),


  // Assign (bulk shortlist) selected candidates to a position
  bulkShortlistCandidates: (positionId, candidateIds) =>
    candidateApi.post("/candidates/bulk-shortlist", {
      positionId,
      candidateIds,
    }),

  uploadResumeJC: (file) => {
    const form = new FormData();
    form.append("file", file, file?.name || "resume");

    return api.post("/resume/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getAllResumesJC: (params) => {
    return api.get("/resume/all", { params });
  },

  // INTERVIEW PANELS
  getInterviewPanels: () => apis.get('/interview-panels/all'),
  addInterviewPanel: (data) => apis.post('/interview-panels/add', data),
  updateInterviewPanel: (id, data) => apis.put(`/interview-panels/update/${id}`, data),
  deleteInterviewPanel: (id) => apis.delete(`/interview-panels/delete/${id}`),
  getInterviewers: () => api.get('/interviewer/all'),
  activeMembers: () => apis.get('/interview-panels/active-members'),
    //bulk Schedules
  applyAutoSchedule:(data)=>api.post('interviewer/getBulkInterviewSchedules',data),
};


export default apiService;
