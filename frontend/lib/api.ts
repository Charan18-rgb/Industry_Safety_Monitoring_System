import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const telemetryApi = {
  getLive: () => apiClient.get('/api/telemetry/live'),
  getHistory: (params?: { sensor_id?: string; limit?: number }) =>
    apiClient.get('/api/telemetry/history', { params }),
  getStatus: () => apiClient.get('/api/telemetry/status'),
};

export const alertApi = {
  create: (data: Record<string, unknown>) => apiClient.post('/api/alerts/create', data),
  getActive: () => apiClient.get('/api/alerts/active'),
  getById: (id: string) => apiClient.get(`/api/alerts/${id}`),
  acknowledge: (id: string) => apiClient.post(`/api/alerts/${id}/acknowledge`),
  resolve: (id: string) => apiClient.post(`/api/alerts/${id}/resolve`),
};

export const incidentApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get('/api/incidents', { params }),
  getById: (id: string) => apiClient.get(`/api/incidents/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post('/api/incidents', data),
  acknowledge: (id: string) => apiClient.patch(`/api/incidents/${id}/acknowledge`),
  resolve: (id: string, notes?: string) => apiClient.patch(`/api/incidents/${id}/resolve`, { resolution_notes: notes }),
  getAudit: (id: string) => apiClient.get(`/api/incidents/${id}/audit`),
};

export const simulationApi = {
  start: () => apiClient.post('/api/simulation/start'),
  stop: () => apiClient.post('/api/simulation/stop'),
  runScenario: (scenario: string) => apiClient.post('/api/simulation/scenario', { scenario }),
  getStatus: () => apiClient.get('/api/simulation/status'),
};

export const analyticsApi = {
  getRisk: () => apiClient.get('/api/analytics/risk'),
  getTrends: () => apiClient.get('/api/analytics/trends'),
  getKpis: () => apiClient.get('/api/analytics/kpis'),
};

export const reportApi = {
  generate: (request: Record<string, unknown>) => apiClient.post('/api/reports/generate', request),
  getList: () => apiClient.get('/api/reports'),
  getById: (reportId: string) => apiClient.get(`/api/reports/${reportId}`),
  download: (reportId: string) => apiClient.get(`/api/reports/${reportId}/download`, { responseType: 'blob' }),
};

export const helmetApi = {
  getStatus: () => apiClient.get('/api/helmet/status'),
  analyze: (formData: FormData) =>
    apiClient.post('/api/helmet/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
