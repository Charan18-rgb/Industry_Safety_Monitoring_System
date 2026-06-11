// AEGIS-AI API Service Client
// API-first integration architecture — all endpoints map to future microservices

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const AI_API_BASE = process.env.NEXT_PUBLIC_AI_API_URL ?? 'http://localhost:8001';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const aiApiClient = axios.create({
  baseURL: AI_API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('aegis_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle errors globally
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aegis_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ───────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),
  logout: () => apiClient.post('/api/auth/logout'),
  me: () => apiClient.get('/api/auth/me'),
  refreshToken: () => apiClient.post('/api/auth/refresh'),
  forgotPassword: (email: string) =>
    apiClient.post('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    apiClient.post('/api/auth/reset-password', { token, password }),
};

// ─── Sensor / Telemetry API ─────────────────────────────────────────────────

export const sensorApi = {
  getLive: () => apiClient.get('/api/sensors/live'),
  getHistory: (sensorId: string, from?: string, to?: string) =>
    apiClient.get(`/api/sensors/history`, { params: { sensorId, from, to } }),
  getSensorById: (id: string) => apiClient.get(`/api/sensors/${id}`),
  getAllSensors: () => apiClient.get('/api/sensors'),
};

// ─── Alert API ──────────────────────────────────────────────────────────────

export const alertApi = {
  getActive: () => apiClient.get('/api/alerts/active'),
  getAll: (params?: Record<string, unknown>) => apiClient.get('/api/alerts', { params }),
  createAlert: (data: Record<string, unknown>) => apiClient.post('/api/alerts/create', data),
  acknowledge: (id: string) => apiClient.post(`/api/alerts/${id}/acknowledge`),
  resolve: (id: string) => apiClient.post(`/api/alerts/${id}/resolve`),
};

// ─── Incident API ────────────────────────────────────────────────────────────

export const incidentApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get('/api/incidents', { params }),
  getById: (id: string) => apiClient.get(`/api/incidents/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post('/api/incidents', data),
  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/api/incidents/${id}`, data),
  acknowledge: (id: string) => apiClient.post(`/api/incidents/${id}/acknowledge`),
  resolve: (id: string, notes?: string) =>
    apiClient.post(`/api/incidents/${id}/resolve`, { notes }),
  export: (format: string, ids?: string[]) =>
    apiClient.post('/api/incidents/export', { format, ids }, { responseType: 'blob' }),
};

// ─── Helmet AI API ──────────────────────────────────────────────────────────

export const helmetApi = {
  getStatus: () => aiApiClient.get('/api/helmet/status'),
  analyze: (formData: FormData) => aiApiClient.post('/api/helmet/analyze', formData),
};

// ─── PPE AI API ─────────────────────────────────────────────────────────────

export const ppeApi = {
  getStatus: () => aiApiClient.get('/api/ppe/status'),
  analyze: (formData: FormData) => aiApiClient.post('/api/ppe/analyze', formData),
};

// ─── Predictive AI API ──────────────────────────────────────────────────────

export const predictiveApi = {
  getRiskScore: () => aiApiClient.get('/api/predictive/risk'),
  getFailurePredictions: () => aiApiClient.get('/api/predictive/failure'),
  getEquipmentHealth: (equipmentId?: string) =>
    aiApiClient.get('/api/predictive/health', { params: { equipmentId } }),
};

// ─── Dashboard API ──────────────────────────────────────────────────────────

export const dashboardApi = {
  getMetrics: () => apiClient.get('/api/dashboard/metrics'),
  getRiskScore: () => apiClient.get('/api/dashboard/risk'),
  getActivityFeed: () => apiClient.get('/api/dashboard/activity'),
  getComplianceSummary: () => apiClient.get('/api/dashboard/compliance'),
};

// ─── Report API ─────────────────────────────────────────────────────────────

export const reportApi = {
  generate: (request: Record<string, unknown>) =>
    apiClient.post('/api/reports/generate', request, { responseType: 'blob' }),
  getList: () => apiClient.get('/api/reports'),
  download: (reportId: string) =>
    apiClient.get(`/api/reports/${reportId}/download`, { responseType: 'blob' }),
};

// ─── Settings API ────────────────────────────────────────────────────────────

export const settingsApi = {
  getThresholds: () => apiClient.get('/api/settings/thresholds'),
  updateThresholds: (data: unknown) => apiClient.put('/api/settings/thresholds', data),
  getNotifications: () => apiClient.get('/api/settings/notifications'),
  updateNotifications: (data: unknown) => apiClient.put('/api/settings/notifications', data),
  getSystem: () => apiClient.get('/api/settings/system'),
  updateSystem: (data: unknown) => apiClient.put('/api/settings/system', data),
};
