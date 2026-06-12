// AEGIS-AI Global State Store (Zustand)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Alert, Incident, SensorReading, RiskScore } from '@/types';
import { mockSensorReadingsNominal, mockRiskScoreNominal } from '@/lib/mockData';
import { sendGasLeakAlert, sendHighTempAlert, sendMachineFaultAlert } from '@/lib/email';

// ─── Auth Store ──────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setLoading: (v) => set({ isLoading: v }),
    }),
    { name: 'aegis-auth' }
  )
);

// ─── Alert Store ─────────────────────────────────────────────────────────────

interface AlertState {
  alerts: Alert[];
  activeCount: number;
  criticalCount: number;
  hasEmergency: boolean;
  emergencyAlert: Alert | null;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id: string, by: string) => void;
  resolveAlert: (id: string) => void;
  dismissEmergency: () => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertState>()((set, get) => ({
  alerts: [],
  activeCount: 0,
  criticalCount: 0,
  hasEmergency: false,
  emergencyAlert: null,
  setAlerts: (alerts) => {
    const active = alerts.filter((a) => a.status === 'active');
    const critical = active.filter((a) => a.severity === 'critical' || a.severity === 'emergency');
    const emergency = active.find((a) => a.severity === 'emergency') ?? null;
    set({ alerts, activeCount: active.length, criticalCount: critical.length, hasEmergency: !!emergency, emergencyAlert: emergency });
  },
  addAlert: (alert) => {
    const alerts = [alert, ...get().alerts];
    get().setAlerts(alerts);
  },
  acknowledgeAlert: (id, by) => {
    const alerts = get().alerts.map((a) =>
      a.id === id ? { ...a, status: 'acknowledged' as const, acknowledgedBy: by, acknowledgedAt: new Date().toISOString() } : a
    );
    get().setAlerts(alerts);
  },
  resolveAlert: (id) => {
    const alerts = get().alerts.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a));
    get().setAlerts(alerts);
  },
  dismissEmergency: () => set({ hasEmergency: false, emergencyAlert: null }),
  clearAlerts: () => get().setAlerts([]),
}));

// ─── Telemetry Store ─────────────────────────────────────────────────────────

interface TelemetryState {
  sensors: SensorReading[];
  riskScore: RiskScore | null;
  isConnected: boolean;
  lastUpdated: string | null;
  setSensors: (sensors: SensorReading[]) => void;
  updateSensor: (reading: SensorReading) => void;
  setRiskScore: (score: RiskScore) => void;
  setConnected: (v: boolean) => void;
}

export const useTelemetryStore = create<TelemetryState>()((set, get) => ({
  sensors: mockSensorReadingsNominal,
  riskScore: mockRiskScoreNominal,
  isConnected: false,
  lastUpdated: null,
  setSensors: (sensors) => set({ sensors, lastUpdated: new Date().toISOString() }),
  updateSensor: (reading) => {
    const existing = get().sensors;
    const found = existing.some((s) => s.sensorId === reading.sensorId);
    const sensors = found
      ? existing.map((s) => (s.sensorId === reading.sensorId ? reading : s))
      : [reading, ...existing];
    set({ sensors, lastUpdated: new Date().toISOString() });
  },
  setRiskScore: (riskScore) => set({ riskScore }),
  setConnected: (isConnected) => set({ isConnected }),
}));

// ─── Incident Store ──────────────────────────────────────────────────────────

interface IncidentState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  filters: {
    severity: string[];
    status: string[];
    category: string[];
    zone: string[];
    search: string;
  };
  setIncidents: (incidents: Incident[]) => void;
  setSelected: (incident: Incident | null) => void;
  updateIncident: (id: string, data: Partial<Incident>) => void;
  setFilters: (filters: Partial<IncidentState['filters']>) => void;
  resetFilters: () => void;
  addIncident: (incident: Incident) => void;
  clearIncidents: () => void;
}

const defaultFilters = { severity: [], status: [], category: [], zone: [], search: '' };

export const useIncidentStore = create<IncidentState>()((set, get) => ({
  incidents: [],
  selectedIncident: null,
  filters: defaultFilters,
  setIncidents: (incidents) => set({ incidents }),
  addIncident: (incident) => set({ incidents: [incident, ...get().incidents] }),
  clearIncidents: () => set({ incidents: [], selectedIncident: null }),
  setSelected: (incident) => set({ selectedIncident: incident }),
  updateIncident: (id, data) => {
    const incidents = get().incidents.map((i) => (i.id === id ? { ...i, ...data } : i));
    set({ incidents });
  },
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  resetFilters: () => set({ filters: defaultFilters }),
}));

// ─── UI Store ────────────────────────────────────────────────────────────────

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'darker';
  activeModal: string | null;
  notifications: Array<{ id: string; message: string; type: string; timestamp: string }>;
  toggleSidebar: () => void;
  setModal: (id: string | null) => void;
  addNotification: (msg: string, type?: string) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: 'dark',
      activeModal: null,
      notifications: [],
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setModal: (id) => set({ activeModal: id }),
      addNotification: (message, type = 'info') => {
        const id = Math.random().toString(36).slice(2);
        const notif = { id, message, type, timestamp: new Date().toISOString() };
        set({ notifications: [notif, ...get().notifications.slice(0, 9)] });
        setTimeout(() => get().removeNotification(id), 5000);
      },
      removeNotification: (id) =>
        set({ notifications: get().notifications.filter((n) => n.id !== id) }),
    }),
    { name: 'aegis-ui', partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, theme: s.theme }) }
  )
);

// ─── Simulation Store ────────────────────────────────────────────────────────

export type SimulationScenario = 'gas_leak' | 'high_temperature' | 'machine_fault' | null;

interface SimulationState {
  activeScenario: SimulationScenario;
  simulateGasLeak: () => void;
  simulateHighTemperature: () => void;
  simulateMachineFault: () => void;
  resetSystem: () => void;
}

export const useSimulationStore = create<SimulationState>()((set) => ({
  activeScenario: null,
  simulateGasLeak: () => {
    set({ activeScenario: 'gas_leak' });
    const alertId = `ALT-SIM-${Date.now()}`;
    const incidentId = `INC-SIM-${Date.now()}`;
    
    useAlertStore.getState().addAlert({
      id: alertId,
      title: 'CRITICAL: Gas Leak Detected',
      message: 'Methane concentration at 85.0 ppm in Hazard Zone. Evacuation protocol pending.',
      severity: 'critical',
      status: 'active',
      source: 'Gas Detector Alpha',
      zone: 'Hazard Zone',
      timestamp: new Date().toISOString(),
      incidentId: incidentId,
    });
    
    useIncidentStore.getState().addIncident({
      id: incidentId,
      title: 'Elevated Gas Concentration in Hazard Zone',
      description: 'Simulated gas leak triggered.',
      category: 'gas_leak',
      severity: 'critical',
      status: 'open',
      zone: 'Hazard Zone',
      reportedBy: 'Simulation Engine',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['gas', 'simulation'],
    } as Incident);
    
    useTelemetryStore.getState().setRiskScore({ ...mockRiskScoreNominal, overall: 85, gas: 95 });
    
    // Send notification
    sendGasLeakAlert(85.0, 'ppm', 'Hazard Zone').then(r => {
      if (r.emailStatus === 'success' || r.whatsappStatus === 'success') console.log('[Simulation] Gas leak notification sent:', r);
      else console.warn('[Simulation] Gas leak notification failed:', r);
    });

    useActivityStore.getState().addActivity({ message: 'Gas Leak Simulation Triggered', category: 'simulation' });
    useActivityStore.getState().addActivity({ message: 'Critical Alert Generated', category: 'alert' });
    useActivityStore.getState().addActivity({ message: 'Incident Created', category: 'incident' });
  },
  simulateHighTemperature: () => {
    set({ activeScenario: 'high_temperature' });
    const alertId = `ALT-SIM-${Date.now()}`;
    const incidentId = `INC-SIM-${Date.now()}`;
    
    useAlertStore.getState().addAlert({
      id: alertId,
      title: 'WARNING: High Temperature',
      message: 'Temperature sensor in Machine A exceeded warning threshold at 82.5°C.',
      severity: 'warning',
      status: 'active',
      source: 'Temp Sensor T1',
      zone: 'Machine A',
      timestamp: new Date().toISOString(),
      incidentId: incidentId,
    });
    
    useIncidentStore.getState().addIncident({
      id: incidentId,
      title: 'High Temperature Warning - Machine A',
      description: 'Simulated high temperature triggered.',
      category: 'overheating',
      severity: 'warning',
      status: 'open',
      zone: 'Machine A',
      reportedBy: 'Simulation Engine',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['temperature', 'simulation'],
    } as Incident);
    
    useTelemetryStore.getState().setRiskScore({ ...mockRiskScoreNominal, overall: 45, temperature: 80 });
    
    // Send notification
    sendHighTempAlert(82.5, 'Machine A').then(r => {
      if (r.emailStatus === 'success' || r.whatsappStatus === 'success') console.log('[Simulation] High temp notification sent:', r);
      else console.warn('[Simulation] High temp notification failed:', r);
    });

    useActivityStore.getState().addActivity({ message: 'High Temperature Simulation Triggered', category: 'simulation' });
    useActivityStore.getState().addActivity({ message: 'Warning Alert Generated', category: 'alert' });
    useActivityStore.getState().addActivity({ message: 'Incident Created', category: 'incident' });
  },
  simulateMachineFault: () => {
    set({ activeScenario: 'machine_fault' });
    const alertId = `ALT-SIM-${Date.now()}`;
    const incidentId = `INC-SIM-${Date.now()}`;
    
    useAlertStore.getState().addAlert({
      id: alertId,
      title: 'CRITICAL: Machine Fault',
      message: 'Severe vibration detected in Machine B. Possible bearing failure.',
      severity: 'critical',
      status: 'active',
      source: 'Vib Sensor V2',
      zone: 'Machine B',
      timestamp: new Date().toISOString(),
      incidentId: incidentId,
    });
    
    useIncidentStore.getState().addIncident({
      id: incidentId,
      title: 'Critical Machine Fault - Machine B',
      description: 'Simulated machine fault triggered.',
      category: 'vibration_anomaly',
      severity: 'critical',
      status: 'open',
      zone: 'Machine B',
      reportedBy: 'Simulation Engine',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['vibration', 'simulation', 'fault'],
    } as Incident);
    
    useTelemetryStore.getState().setRiskScore({ ...mockRiskScoreNominal, overall: 90, vibration: 95, equipment: 30 });
    
    // Send notification
    sendMachineFaultAlert('Machine B', 'Severe Vibration - Bearing Failure').then(r => {
      if (r.emailStatus === 'success' || r.whatsappStatus === 'success') console.log('[Simulation] Machine fault notification sent:', r);
      else console.warn('[Simulation] Machine fault notification failed:', r);
    });

    useActivityStore.getState().addActivity({ message: 'Machine Fault Simulation Triggered', category: 'simulation' });
    useActivityStore.getState().addActivity({ message: 'Critical Alert Generated', category: 'alert' });
    useActivityStore.getState().addActivity({ message: 'Incident Created', category: 'incident' });
  },
  resetSystem: () => {
    set({ activeScenario: null });
    useAlertStore.getState().clearAlerts();
    useIncidentStore.getState().clearIncidents();
    useTelemetryStore.getState().setSensors(mockSensorReadingsNominal);
    useTelemetryStore.getState().setRiskScore(mockRiskScoreNominal);
  },
}));

// ─── Demo Statistics Store ───────────────────────────────────────────────────

type DemoStatKey = 'totalSimulations' | 'totalAlerts' | 'totalIncidents' | 'totalReports' | 'totalNotifications';

interface DemoState {
  totalSimulations: number;
  totalAlerts: number;
  totalIncidents: number;
  totalReports: number;
  totalNotifications: number;
  incrementStat: (key: DemoStatKey) => void;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      totalSimulations: 0,
      totalAlerts: 0,
      totalIncidents: 0,
      totalReports: 0,
      totalNotifications: 0,
      incrementStat: (key) => set({ [key]: get()[key] + 1 }),
    }),
    { name: 'aegis-demo-stats' }
  )
);

// ─── Notification Store ──────────────────────────────────────────────────────

import type { NotificationLog, DeliveryStatus } from '@/types';

interface NotificationState {
  logs: NotificationLog[];
  emailsSent: number;
  whatsappSent: number;
  totalNotifications: number;
  addLog: (log: NotificationLog) => void;
  updateLogStatus: (id: string, updates: { emailStatus?: DeliveryStatus; whatsappStatus?: DeliveryStatus }) => void;
  clearLogs: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      logs: [],
      emailsSent: 0,
      whatsappSent: 0,
      totalNotifications: 0,
      addLog: (log) => set((state) => ({
        logs: [log, ...state.logs].slice(0, 100), // Keep last 100
        emailsSent: state.emailsSent + (log.emailStatus === 'success' ? 1 : 0),
        whatsappSent: state.whatsappSent + (log.whatsappStatus === 'success' ? 1 : 0),
        totalNotifications: state.totalNotifications + 1,
      })),
      updateLogStatus: (id, updates) => set((state) => {
        let newEmailSuccess = 0;
        let newWhatsappSuccess = 0;
        
        const newLogs = state.logs.map(log => {
          if (log.id !== id) return log;
          
          if (updates.emailStatus === 'success' && log.emailStatus !== 'success') newEmailSuccess = 1;
          if (updates.whatsappStatus === 'success' && log.whatsappStatus !== 'success') newWhatsappSuccess = 1;
          
          return { ...log, ...updates };
        });
        
        return {
          logs: newLogs,
          emailsSent: state.emailsSent + newEmailSuccess,
          whatsappSent: state.whatsappSent + newWhatsappSuccess,
        };
      }),
      clearLogs: () => set({ logs: [], emailsSent: 0, whatsappSent: 0, totalNotifications: 0 }),
    }),
    { name: 'aegis-notifications' }
  )
);

// ─── Report Store ────────────────────────────────────────────────────────────

import type { Report, ActivityLog } from '@/types';

interface ReportState {
  reports: Report[];
  addReport: (report: Report) => void;
  clearReports: () => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      reports: [],
      addReport: (report) => set((state) => ({ reports: [report, ...state.reports] })),
      clearReports: () => set({ reports: [] }),
    }),
    { name: 'aegis-reports' }
  )
);

// ─── Activity Timeline Store ──────────────────────────────────────────────────

interface ActivityState {
  activities: ActivityLog[];
  addActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      activities: [],
      addActivity: (activity) => {
        const newLog: ActivityLog = {
          ...activity,
          id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ activities: [newLog, ...state.activities].slice(0, 200) }));
      },
      clearActivities: () => set({ activities: [] }),
    }),
    { name: 'aegis-activity-log' }
  )
);

// ─── Live Sensor Store (Tinkercad Integration) ──────────────────────────────

export interface LiveSensorData {
  temperature: number;
  gasLevel: number;
  machineFault: boolean;
  source: 'simulation' | 'tinkercad_sync';
  scenario: string;
  connected: boolean;
  timestamp: string;
}

export interface SensorEvent {
  id: string;
  type: 'Alert' | 'Incident' | 'Email' | 'WhatsApp';
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

interface LiveSensorState {
  data: LiveSensorData | null;
  history: LiveSensorData[];
  events: SensorEvent[];
  isConnected: boolean;
  lastAlertTime: Record<string, number>;
  setConnection: (status: boolean) => void;
  updateData: (data: LiveSensorData) => void;
  addEvent: (event: Omit<SensorEvent, 'id'>) => void;
}

export const useLiveSensorStore = create<LiveSensorState>()((set, get) => ({
  data: null,
  history: [],
  events: [],
  isConnected: false,
  lastAlertTime: { temp: 0, gas: 0, fault: 0 },
  setConnection: (status) => set({ isConnected: status }),
  addEvent: (event) => set((state) => ({
    events: [...state.events, { ...event, id: Math.random().toString(36).substr(2, 9) }].slice(-100)
  })),
  updateData: (data) => {
    set((state) => ({
      data,
      history: [...state.history, data].slice(-100)
    }));

    // Update individual sensors in useTelemetryStore
    useTelemetryStore.getState().updateSensor({
      sensorId: 'SEN-TEMP-001',
      sensorName: 'Temperature Sensor T1',
      type: 'temperature',
      value: data.temperature,
      unit: '°C',
      zone: 'Zone-A',
      status: data.temperature > 100 ? 'critical' : data.temperature > 75 ? 'warning' : 'normal',
      timestamp: data.timestamp,
      min: 0,
      max: 150,
      threshold: { warning: 75, critical: 100 }
    });

    useTelemetryStore.getState().updateSensor({
      sensorId: 'SEN-GAS-001',
      sensorName: 'Gas Detector Alpha',
      type: 'gas',
      value: data.gasLevel,
      unit: 'ppm',
      zone: 'Zone-A',
      status: data.gasLevel > 70 ? 'critical' : data.gasLevel > 35 ? 'warning' : 'normal',
      timestamp: data.timestamp,
      min: 0,
      max: 100,
      threshold: { warning: 35, critical: 70 }
    });

    useTelemetryStore.getState().updateSensor({
      sensorId: 'SEN-VIB-001',
      sensorName: 'Vibration Sensor V1',
      type: 'vibration',
      value: data.machineFault ? 15.0 : 3.2,
      unit: 'mm/s',
      zone: 'Zone-D',
      status: data.machineFault ? 'critical' : 'normal',
      timestamp: data.timestamp,
      min: 0,
      max: 20,
      threshold: { warning: 6, critical: 8 }
    });

    // Update risk score to dynamically match overriden values
    const tempRisk = Math.round((data.temperature / 100) * 100);
    const gasRisk = Math.round((data.gasLevel / 200) * 100);
    const vibRisk = data.machineFault ? 95 : 10;
    const overallRisk = Math.max(tempRisk, gasRisk, vibRisk);
    useTelemetryStore.getState().setRiskScore({
      overall: overallRisk,
      gas: gasRisk,
      temperature: tempRisk,
      vibration: vibRisk,
      ppe: 98,
      equipment: data.machineFault ? 30 : 92,
      updatedAt: data.timestamp
    });
    
    // Threshold Engine
    const now = Date.now();
    const COOLDOWN = 30000; // 30 seconds cooldown between alerts of the same type to prevent spam
    
    const state = get();
    const lastAlert = state.lastAlertTime;
    
    const triggerEvents = (severity: 'critical' | 'warning', message: string) => {
      const ts = new Date().toISOString();
      get().addEvent({ type: 'Alert', timestamp: ts, severity, message: `Alert: ${message}` });
      get().addEvent({ type: 'Incident', timestamp: ts, severity, message: `Incident Created: ${message}` });
      get().addEvent({ type: 'Email', timestamp: ts, severity, message: `Email Dispatch: ${message}` });
      get().addEvent({ type: 'WhatsApp', timestamp: ts, severity, message: `WhatsApp Dispatch: ${message}` });
    };
    
    // Temperature check (> 60)
    if (data.temperature > 60 && now - lastAlert.temp > COOLDOWN) {
      set({ lastAlertTime: { ...get().lastAlertTime, temp: now } });
      useSimulationStore.getState().simulateHighTemperature();
      triggerEvents('critical', 'High Temperature Detected');
    }
    // Gas check (> 80)
    if (data.gasLevel > 80 && now - lastAlert.gas > COOLDOWN) {
      set({ lastAlertTime: { ...get().lastAlertTime, gas: now } });
      useSimulationStore.getState().simulateGasLeak();
      triggerEvents('critical', 'Gas Leak Detected');
    }
    // Machine fault check (True)
    if (data.machineFault && now - lastAlert.fault > COOLDOWN) {
      set({ lastAlertTime: { ...get().lastAlertTime, fault: now } });
      useSimulationStore.getState().simulateMachineFault();
      triggerEvents('critical', 'Machine Fault Detected');
    }
  }
}));
