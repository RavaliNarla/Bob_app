import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
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

  // Health check
  healthCheck: () => api.get('/health'),



  createJobPost: (data) => api.post('/jobcreation', data), // Dummy POST endpoint
  getReqData: () => api.get('/getreq'),
  getMasterData: () => api.get('/getmasterdata'),
  getJobPost: () => api.get('/activejobs'), // Dummy GET endpoint
   createRequisition: (data) => api.post('/create_requisitions', data),
  // uploadJobExcel: (file) => {
  //   const formData = new FormData();
  //   formData.append('file', file); // backend expects 'file' key
  //   console.log(formData)
  //   return api.post('/jobposts/upload-excel', formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' }
  //   });
  // },
  uploadJobExcel: (data) => api.post('/jobcreationbulk', data), // Dummy POST endpoint
  postJobRequisitions :(payload) => api.post("/requisitionpost", payload),
  getByRequisitionId: (requisition_id) =>
    axios.get(`http://192.168.20.111:8081/api/getbyreq/${requisition_id}`, {
      params: { requistion_id: requisition_id },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    }),

};

export default apiService;