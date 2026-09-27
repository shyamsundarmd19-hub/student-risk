import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('student_perf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('student_perf_token');
      localStorage.removeItem('student_perf_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service Methods
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const academicService = {
  createRecord: (recordData) => api.post('/academic-records', recordData),
  getRecordsByStudentId: (studentId) => api.get(`/academic-records/${studentId}`),
};

export const predictionService = {
  predictPerformance: (payload) => api.post('/predict', payload),
  runWhatIf: (payload) => api.post('/what-if', payload),
  getModelInfo: () => api.get('/model-info'),
};

export const dashboardService = {
  getStudentDashboard: (studentId = 1) => api.get(`/student/dashboard/${studentId}`),
  getFacultyDashboard: () => api.get('/faculty/dashboard'),
};

export default api;
