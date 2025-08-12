import axios from 'axios';

// Use the environment variables with a fallback to the new URLs you provided.
// This is the correct way to handle different API services.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.20.111:8081/api';
const API_BASE_URLS = process.env.REACT_APP_API_URLS || 'http://192.168.20.115:8080/api';

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
    createRequisition: (data) => api.post('/create_requisitions', data),

    jobCreation: (data) => api.post('/create_positions',data),
    getMasterData: () => apis.get('/all'),

    uploadJobExcel: (data) => api.post('/create_Bulk_positions', data), // Dummy POST endpoint
    postJobRequisitions :(payload) => api.post("/requisitionpost", payload),
   
    updateJob: (data) => api.put('/update_positions', data),
    getByRequisitionId: (requisition_id) => api.get(`getbyreq/${requisition_id}`),
    getByPositionId: (position_id) => api.get(`getByPositionId/${position_id}`),
    
    //getJobPost: () => api.get('/activejobs'),
    //createJobPost: (data) => api.post('/jobcreation', data),
     // uploadJobExcel: (file) => {
  //   const formData = new FormData();
  //   formData.append('file', file); // backend expects 'file' key
  //   console.log(formData)
  //   return api.post('/jobposts/upload-excel', formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' }
  //   });
  // },
    // uploadJobExcel: (data) => api.post('/jobcreationbulk', data),
  // postJobRequisitions :(payload) => api.post("/requisitionpost", payload),
  //getMasterData: () => api.get('/getmasterdata'),
   // getByRequisitionId: (requisition_id) =>
    // axios.get(`http://192.168.20.111:8081/api/getbyreq/${requisition_id}`, {
    //   params: { requistion_id: requisition_id },
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    //   },
    // }),
};

export default apiService;
