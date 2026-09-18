import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getDemoPersonas: () => api.get('/auth/demo-personas'),
};

export const orgAPI = {
  getCurrent: () => api.get('/organizations/current'),
  updateCurrent: (data) => api.put('/organizations/current', data),
  getDepartments: () => api.get('/organizations/departments'),
  createDepartment: (data) => api.post('/organizations/departments', data),
  getRoles: () => api.get('/organizations/roles'),
  getSkills: () => api.get('/organizations/skills'),
  createSkill: (data) => api.post('/organizations/skills', data),
};

export const userAPI = {
  getUsers: (params) => api.get('/users/', { params }),
  getTeam: () => api.get('/users/team'),
  getProfile: () => api.get('/users/profile'),
  updateAvailability: (data) => api.post('/users/availability', data),
};

export const taskAPI = {
  getTasks: (params) => api.get('/tasks/', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks/', data),
  updateStatus: (id, data) => api.post(`/tasks/${id}/status`, data),
};

export const scheduleAPI = {
  generateSchedule: (taskId) => api.post(`/schedules/generate?task_id=${taskId}`),
  approveSchedule: (data) => api.post('/schedules/approve', data),
  reassignTask: (data) => api.post('/schedules/reassign', data),
  getCalendar: (params) => api.get('/schedules/calendar', { params }),
};

export const escalationAPI = {
  getEscalations: () => api.get('/escalations/'),
  createEscalation: (data) => api.post('/escalations/', data),
  resolveEscalation: (id) => api.post(`/escalations/${id}/resolve`),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications/'),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export const analyticsAPI = {
  getDashboardMetrics: () => api.get('/analytics/dashboard'),
};

export const auditAPI = {
  getAuditLogs: (params) => api.get('/audit/audit-logs', { params }),
  getAIActivities: (params) => api.get('/audit/ai-activity', { params }),
};

export const simulationAPI = {
  simulateLeave: (data) => api.post('/simulation/simulate-leave', null, { params: data }),
  simulateDelay: (data) => api.post('/simulation/simulate-delay', null, { params: data }),
  simulateOverload: (data) => api.post('/simulation/simulate-overload', null, { params: data }),
};

export default api;
