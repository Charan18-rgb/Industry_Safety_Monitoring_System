'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ActivityLog,
  Alert,
  DeliveryStatus,
  Incident,
  NotificationLog,
  Report,
  RiskScore,
  SensorReading,
  User,
} from '@/types';
import {
  useSimulationDomainStore,
  type SimulationScenario,
} from '@/store/simulationDomain';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (value: boolean) => void;
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
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'aegis-auth' },
  ),
);

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'darker';
  activeModal: string | null;
  notifications: Array<{ id: string; message: string; type: string; timestamp: string }>;
  toggleSidebar: () => void;
  setModal: (id: string | null) => void;
  addNotification: (message: string, type?: string) => void;
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
      setModal: (activeModal) => set({ activeModal }),
      addNotification: (message, type = 'info') => {
        const id = Math.random().toString(36).slice(2);
        set({ notifications: [{ id, message, type, timestamp: new Date().toISOString() }, ...get().notifications.slice(0, 9)] });
        window.setTimeout(() => get().removeNotification(id), 5000);
      },
      removeNotification: (id) => set({ notifications: get().notifications.filter((item) => item.id !== id) }),
    }),
    {
      name: 'aegis-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed, theme: state.theme }),
    },
  ),
);

interface AlertView {
  alerts: Alert[];
  activeCount: number;
  criticalCount: number;
  hasEmergency: boolean;
  emergencyAlert: Alert | null;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id: string, by: string) => void;
  escalateAlert: (id: string, by?: string, notes?: string) => void;
  resolveAlert: (id: string, by?: string, notes?: string) => void;
  dismissEmergency: () => void;
  clearAlerts: () => void;
}

const alertActions = {
  setAlerts: (alerts: Alert[]) => useSimulationDomainStore.setState({ alerts }),
  addAlert: (alert: Alert) => useSimulationDomainStore.getState().addAlert(alert),
  acknowledgeAlert: (id: string, by: string) =>
    useSimulationDomainStore.getState().transitionAlert(id, 'acknowledged', 'Safety Officer', `Acknowledged by ${by}.`),
  escalateAlert: (id: string, by = 'Shift Supervisor', notes = '') =>
    useSimulationDomainStore.getState().transitionAlert(id, 'escalated', 'Shift Supervisor', notes || `Escalated by ${by}.`),
  resolveAlert: (id: string, by = 'Safety Officer', notes = '') =>
    useSimulationDomainStore.getState().transitionAlert(id, 'resolved', 'Safety Officer', notes || `Resolved by ${by}.`),
  dismissEmergency: () => undefined,
  clearAlerts: () => useSimulationDomainStore.setState({ alerts: [] }),
};

function alertView(state = useSimulationDomainStore.getState()): AlertView {
  const active = state.alerts.filter((alert) => alert.status !== 'resolved');
  const critical = active.filter((alert) => alert.severity === 'critical' || alert.severity === 'emergency');
  const emergencyAlert = active.find((alert) => alert.severity === 'emergency') ?? null;
  return {
    alerts: state.alerts,
    activeCount: active.length,
    criticalCount: critical.length,
    hasEmergency: Boolean(emergencyAlert),
    emergencyAlert,
    ...alertActions,
  };
}

export const useAlertStore = Object.assign(
  () => {
    const alerts = useSimulationDomainStore((state) => state.alerts);
    return alertView({ ...useSimulationDomainStore.getState(), alerts });
  },
  { getState: () => alertView() },
);

interface TelemetryView {
  sensors: SensorReading[];
  riskScore: RiskScore;
  isConnected: boolean;
  lastUpdated: string;
  setSensors: (sensors: SensorReading[]) => void;
  updateSensor: (reading: SensorReading) => void;
  setRiskScore: (score: RiskScore) => void;
  setConnected: (connected: boolean) => void;
}

const telemetryActions = {
  setSensors: (telemetry: SensorReading[]) => useSimulationDomainStore.setState({
    telemetry,
    lastUpdated: new Date().toISOString(),
  }),
  updateSensor: (reading: SensorReading) => useSimulationDomainStore.getState().ingestSensorReading(reading),
  setRiskScore: (riskMetrics: RiskScore) => useSimulationDomainStore.setState({ riskMetrics }),
  setConnected: (isConnected: boolean) => useSimulationDomainStore.getState().setConnection(isConnected),
};

function telemetryView(state = useSimulationDomainStore.getState()): TelemetryView {
  return {
    sensors: state.telemetry,
    riskScore: state.riskMetrics,
    isConnected: state.isConnected,
    lastUpdated: state.lastUpdated,
    ...telemetryActions,
  };
}

export const useTelemetryStore = Object.assign(
  () => {
    const sensors = useSimulationDomainStore((state) => state.telemetry);
    const riskScore = useSimulationDomainStore((state) => state.riskMetrics);
    const isConnected = useSimulationDomainStore((state) => state.isConnected);
    const lastUpdated = useSimulationDomainStore((state) => state.lastUpdated);
    return { sensors, riskScore, isConnected, lastUpdated, ...telemetryActions };
  },
  { getState: () => telemetryView() },
);

interface IncidentView {
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
  setFilters: (filters: Partial<IncidentView['filters']>) => void;
  resetFilters: () => void;
  addIncident: (incident: Incident) => void;
  clearIncidents: () => void;
}

const defaultFilters = { severity: [], status: [], category: [], zone: [], search: '' };

const useIncidentUIStore = create<Pick<IncidentView, 'selectedIncident' | 'filters' | 'setSelected' | 'setFilters' | 'resetFilters'>>()((set) => ({
  selectedIncident: null,
  filters: defaultFilters,
  setSelected: (selectedIncident) => set({ selectedIncident }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));

const incidentActions = {
  setIncidents: (incidents: Incident[]) => useSimulationDomainStore.setState({ incidents }),
  updateIncident: (id: string, data: Partial<Incident>) => useSimulationDomainStore.setState((state) => ({
    incidents: state.incidents.map((incident) => incident.id === id ? { ...incident, ...data } : incident),
  })),
  addIncident: (incident: Incident) => useSimulationDomainStore.getState().addIncident(incident),
  clearIncidents: () => useSimulationDomainStore.setState({ incidents: [] }),
};

export const useIncidentStore = Object.assign(
  () => {
    const incidents = useSimulationDomainStore((state) => state.incidents);
    const ui = useIncidentUIStore();
    return { incidents, ...ui, ...incidentActions };
  },
  {
    getState: () => ({
      incidents: useSimulationDomainStore.getState().incidents,
      ...useIncidentUIStore.getState(),
      ...incidentActions,
    }),
  },
);

interface SimulationView {
  activeScenario: SimulationScenario | null;
  simulateGasLeak: () => void;
  simulateHighTemperature: () => void;
  simulateMachineFault: () => void;
  simulatePPEViolation: () => void;
  resetSystem: () => void;
}

const simulationActions = {
  simulateGasLeak: () => useSimulationDomainStore.getState().startScenario('gas_leak'),
  simulateHighTemperature: () => useSimulationDomainStore.getState().startScenario('high_temperature'),
  simulateMachineFault: () => useSimulationDomainStore.getState().startScenario('machine_fault'),
  simulatePPEViolation: () => useSimulationDomainStore.getState().startScenario('ppe_violation'),
  resetSystem: () => useSimulationDomainStore.getState().resetSimulation(),
};

export const useSimulationStore = Object.assign(
  () => {
    const activeScenario = useSimulationDomainStore((state) => state.activeScenario);
    return { activeScenario, ...simulationActions };
  },
  { getState: () => ({ activeScenario: useSimulationDomainStore.getState().activeScenario, ...simulationActions }) },
);

interface NotificationView {
  logs: NotificationLog[];
  emailsSent: number;
  whatsappSent: number;
  totalNotifications: number;
  addLog: (log: NotificationLog) => void;
  updateLogStatus: (id: string, updates: { emailStatus?: DeliveryStatus; whatsappStatus?: DeliveryStatus }) => void;
  clearLogs: () => void;
}

const notificationActions = {
  addLog: (log: NotificationLog) => useSimulationDomainStore.setState((state) => ({
    notifications: [log, ...state.notifications].slice(0, 200),
  })),
  updateLogStatus: (id: string, updates: { emailStatus?: DeliveryStatus; whatsappStatus?: DeliveryStatus }) =>
    useSimulationDomainStore.setState((state) => ({
      notifications: state.notifications.map((log) => log.id === id ? { ...log, ...updates } : log),
    })),
  clearLogs: () => useSimulationDomainStore.setState({ notifications: [] }),
};

function notificationView(logs: NotificationLog[]): NotificationView {
  return {
    logs,
    emailsSent: logs.filter((log) => log.channel === 'Email Simulation' || log.emailStatus === 'success').length,
    whatsappSent: logs.filter((log) => log.channel === 'Message Simulation' || log.whatsappStatus === 'success').length,
    totalNotifications: logs.length,
    ...notificationActions,
  };
}

export const useNotificationStore = Object.assign(
  () => notificationView(useSimulationDomainStore((state) => state.notifications)),
  { getState: () => notificationView(useSimulationDomainStore.getState().notifications) },
);

interface ActivityView {
  activities: ActivityLog[];
  addActivity: (entry: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
}

const activityActions = {
  addActivity: (entry: Omit<ActivityLog, 'id' | 'timestamp'>) => useSimulationDomainStore.setState((state) => ({
    activityHistory: [{
      ...entry,
      id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    }, ...state.activityHistory].slice(0, 200),
  })),
  clearActivities: () => useSimulationDomainStore.setState({ activityHistory: [] }),
};

export const useActivityStore = Object.assign(
  () => {
    const activities = useSimulationDomainStore((state) => state.activityHistory);
    return { activities, ...activityActions };
  },
  { getState: () => ({ activities: useSimulationDomainStore.getState().activityHistory, ...activityActions }) },
);

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

function liveDataFromTelemetry(): LiveSensorData {
  const state = useSimulationDomainStore.getState();
  return {
    temperature: state.telemetry.find((sensor) => sensor.type === 'temperature')?.value ?? 30,
    gasLevel: state.telemetry.find((sensor) => sensor.type === 'gas')?.value ?? 20,
    machineFault: state.activeScenario === 'machine_fault',
    source: 'simulation',
    scenario: state.activeScenario ?? 'normal_operation',
    connected: state.isConnected,
    timestamp: state.lastUpdated,
  };
}

function liveHistory() {
  const state = useSimulationDomainStore.getState();
  const temperature = state.telemetryHistory.find((series) => series.sensorId === 'SEN-TEMP-001')?.readings ?? [];
  const gas = state.telemetryHistory.find((series) => series.sensorId === 'SEN-GAS-001')?.readings ?? [];
  return temperature.map((reading, index) => ({
    temperature: reading.value,
    gasLevel: gas[index]?.value ?? 20,
    machineFault: state.activeScenario === 'machine_fault',
    source: 'simulation' as const,
    scenario: state.activeScenario ?? 'normal_operation',
    connected: state.isConnected,
    timestamp: reading.timestamp,
  }));
}

const liveActions = {
  setConnection: (connected: boolean) => useSimulationDomainStore.getState().setConnection(connected),
  updateData: (data: LiveSensorData) => {
    const timestamp = data.timestamp || new Date().toISOString();
    const definitions = [
      { id: 'SEN-TEMP-001', name: 'Temperature Sensor T1', type: 'temperature' as const, value: data.temperature, unit: '°C', zone: 'Processing Zone', max: 100, warning: 40, critical: 60 },
      { id: 'SEN-GAS-001', name: 'Gas Detector G1', type: 'gas' as const, value: data.gasLevel, unit: 'ppm', zone: 'Hazard Zone', max: 100, warning: 40, critical: 80 },
      { id: 'SEN-VIB-001', name: 'Vibration Sensor V1', type: 'vibration' as const, value: data.machineFault ? 11 : 3, unit: 'mm/s', zone: 'Machine Zone', max: 20, warning: 6, critical: 8 },
    ];
    definitions.forEach((definition) => {
      useSimulationDomainStore.getState().ingestSensorReading({
        sensorId: definition.id,
        sensorName: definition.name,
        type: definition.type,
        value: definition.value,
        unit: definition.unit,
        zone: definition.zone,
        status: definition.value >= definition.critical ? 'critical' : definition.value >= definition.warning ? 'warning' : 'normal',
        timestamp,
        min: 0,
        max: definition.max,
        threshold: { warning: definition.warning, critical: definition.critical },
      });
    });
  },
  addEvent: (event: Omit<SensorEvent, 'id'>) => activityActions.addActivity({
    message: event.message,
    category: event.type === 'Alert' ? 'alert' : event.type === 'Incident' ? 'incident' : 'notification',
  }),
};

function liveView() {
  const state = useSimulationDomainStore.getState();
  const events: SensorEvent[] = state.activityHistory.map((entry) => ({
    id: entry.id,
    type: entry.category === 'alert' ? 'Alert' : entry.category === 'incident' ? 'Incident' : 'Email',
    timestamp: entry.timestamp,
    severity: entry.message.toLowerCase().includes('critical') ? 'critical' : 'info',
    message: entry.message,
  }));
  return {
    data: liveDataFromTelemetry(),
    history: liveHistory(),
    events,
    isConnected: state.isConnected,
    lastAlertTime: { temp: 0, gas: 0, fault: 0 },
    ...liveActions,
  };
}

export const useLiveSensorStore = Object.assign(
  () => {
    useSimulationDomainStore((state) => state.lastUpdated);
    useSimulationDomainStore((state) => state.activityHistory);
    return liveView();
  },
  { getState: () => liveView() },
);

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
    { name: 'aegis-reports' },
  ),
);

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
    { name: 'aegis-demo-stats' },
  ),
);
