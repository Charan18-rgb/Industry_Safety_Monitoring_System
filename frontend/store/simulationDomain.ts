'use client';

import { create } from 'zustand';
import type {
  ActivityLog,
  Alert,
  AlertSeverity,
  AlertStatus,
  Incident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
  LifecycleAuditEntry,
  NotificationChannel,
  NotificationLog,
  OperationalRole,
  RiskScore,
  SensorReading,
  SensorStatus,
  SensorType,
  TelemetryHistory,
} from '@/types';

export type SimulationScenario = 'gas_leak' | 'high_temperature' | 'machine_fault' | 'ppe_violation';
export type CameraDetectionState = 'active' | 'compliant' | 'violation_detected';

export interface CameraCapture {
  id: string;
  timestamp: string;
  state: CameraDetectionState;
  source: 'camera' | 'simulation';
  imageUrl?: string;
  notes: string;
}

interface SensorDefinition {
  id: string;
  name: string;
  type: SensorType;
  unit: string;
  zone: string;
  min: number;
  max: number;
  baseline: number;
  amplitude: number;
  warning: number;
  critical: number;
  phase: number;
}

interface ScenarioDefinition {
  title: string;
  message: string;
  category: IncidentCategory;
  severity: AlertSeverity;
  zone: string;
  source: string;
  actor: OperationalRole;
  createsIncident: boolean;
}

interface SimulationDomainState {
  telemetry: SensorReading[];
  telemetryHistory: TelemetryHistory[];
  alerts: Alert[];
  incidents: Incident[];
  notifications: NotificationLog[];
  riskMetrics: RiskScore;
  cameraState: CameraDetectionState;
  cameraConnected: boolean;
  captureHistory: CameraCapture[];
  violationHistory: CameraCapture[];
  activeScenario: SimulationScenario | null;
  scenarioStartedAt: string | null;
  activityHistory: ActivityLog[];
  isConnected: boolean;
  lastUpdated: string;
  systemHealth: number;
  tickCount: number;
  tick: () => void;
  startScenario: (scenario: SimulationScenario) => void;
  resetSimulation: () => void;
  transitionAlert: (id: string, status: AlertStatus, actorRole: OperationalRole, notes?: string) => void;
  transitionIncident: (id: string, status: IncidentStatus, actorRole: OperationalRole, notes?: string) => void;
  addAlert: (alert: Alert) => void;
  addIncident: (incident: Incident) => void;
  setConnection: (connected: boolean) => void;
  ingestSensorReading: (reading: SensorReading) => void;
  setCameraState: (state: CameraDetectionState) => void;
  recordCapture: (capture: Omit<CameraCapture, 'id' | 'timestamp'>) => void;
  clearOperationalHistory: () => void;
}

const HISTORY_LIMIT = 120;
const SCENARIO_DURATION_TICKS = 20;

const SENSOR_DEFINITIONS: SensorDefinition[] = [
  {
    id: 'SEN-GAS-ALPHA', name: 'Gas Detector Alpha', type: 'gas', unit: 'ppm',
    zone: 'Zone-A', min: 0, max: 100, baseline: 20, amplitude: 5,
    warning: 40, critical: 80, phase: 1.1,
  },
  {
    id: 'SEN-GAS-BETA', name: 'Gas Detector Beta', type: 'gas', unit: 'ppm',
    zone: 'Zone-B', min: 0, max: 100, baseline: 18, amplitude: 4.5,
    warning: 40, critical: 80, phase: 1.3,
  },
  {
    id: 'SEN-TEMP-T1', name: 'Temperature Sensor T1', type: 'temperature', unit: '°C',
    zone: 'Zone-A', min: 0, max: 100, baseline: 30, amplitude: 2.2,
    warning: 40, critical: 60, phase: 0,
  },
  {
    id: 'SEN-TEMP-T2', name: 'Temperature Sensor T2', type: 'temperature', unit: '°C',
    zone: 'Zone-C', min: 0, max: 100, baseline: 28, amplitude: 2.0,
    warning: 40, critical: 60, phase: 0.5,
  },
  {
    id: 'SEN-HUM-H1', name: 'Humidity Sensor H1', type: 'humidity', unit: '%',
    zone: 'Zone-B', min: 0, max: 100, baseline: 57, amplitude: 8,
    warning: 78, critical: 88, phase: 2.2,
  },
  {
    id: 'SEN-VIB-V1', name: 'Vibration Sensor V1', type: 'vibration', unit: 'mm/s',
    zone: 'Zone-D', min: 0, max: 20, baseline: 3, amplitude: 1.2,
    warning: 6, critical: 8, phase: 1.8,
  },
  {
    id: 'SEN-VIB-V2', name: 'Vibration Sensor V2', type: 'vibration', unit: 'mm/s',
    zone: 'Zone-A', min: 0, max: 20, baseline: 2.8, amplitude: 1.0,
    warning: 6, critical: 8, phase: 1.6,
  },
  {
    id: 'SEN-PRES-P1', name: 'Pressure Sensor P1', type: 'pressure', unit: 'bar',
    zone: 'Zone-C', min: 0, max: 12, baseline: 5, amplitude: 1.1,
    warning: 8, critical: 10, phase: 0.7,
  },
];

const SCENARIOS: Record<SimulationScenario, ScenarioDefinition> = {
  gas_leak: {
    title: 'Gas Leak Detected',
    message: 'Gas concentration exceeded the critical safety threshold in Zone-A.',
    category: 'gas_leak',
    severity: 'critical',
    zone: 'Zone-A',
    source: 'Gas Detector Alpha',
    actor: 'Control Room Operator',
    createsIncident: true,
  },
  high_temperature: {
    title: 'High Temperature Detected',
    message: 'Process temperature exceeded the critical operating threshold.',
    category: 'overheating',
    severity: 'warning',
    zone: 'Zone-A',
    source: 'Temperature Sensor T1',
    actor: 'Shift Supervisor',
    createsIncident: true,
  },
  machine_fault: {
    title: 'Machine Fault Detected',
    message: 'Sustained vibration indicates a possible rotating equipment fault.',
    category: 'vibration_anomaly',
    severity: 'critical',
    zone: 'Zone-D',
    source: 'Vibration Sensor V1',
    actor: 'Maintenance Engineer',
    createsIncident: true,
  },
  ppe_violation: {
    title: 'PPE Violation Detected',
    message: 'Camera simulation identified a worker without the required safety helmet.',
    category: 'ppe_violation',
    severity: 'warning',
    zone: 'Zone-B',
    source: 'Camera Monitoring',
    actor: 'Safety Officer',
    createsIncident: true,
  },
};

const round = (value: number, precision = 1) => Number(value.toFixed(precision));
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function statusFor(value: number, definition: SensorDefinition): SensorStatus {
  if (value >= definition.critical) return 'critical';
  if (value >= definition.warning) return 'warning';
  return 'normal';
}

function scenarioValue(definition: SensorDefinition, scenario: SimulationScenario | null, progress: number) {
  if (!scenario) return null;
  const pulse = Math.sin(Math.min(progress / 8, 1) * Math.PI / 2);
  if (scenario === 'gas_leak' && definition.type === 'gas') return 84 + pulse * 8;
  if (scenario === 'high_temperature' && definition.type === 'temperature') return 63 + pulse * 12;
  if (scenario === 'machine_fault' && definition.type === 'vibration') return 9 + pulse * 4;
  return null;
}

function valueAt(definition: SensorDefinition, tick: number, scenario: SimulationScenario | null, scenarioProgress = 0) {
  const overridden = scenarioValue(definition, scenario, scenarioProgress);
  if (overridden !== null) return round(overridden);
  const primary = Math.sin(tick / 7 + definition.phase) * definition.amplitude;
  const secondary = Math.sin(tick / 17 + definition.phase * 0.5) * definition.amplitude * 0.22;
  return round(clamp(definition.baseline + primary + secondary, definition.min, definition.max));
}

function readingFor(definition: SensorDefinition, tick: number, timestamp: string, scenario: SimulationScenario | null, progress = 0): SensorReading {
  const value = valueAt(definition, tick, scenario, progress);
  return {
    sensorId: definition.id,
    sensorName: definition.name,
    type: definition.type,
    value,
    unit: definition.unit,
    zone: definition.zone,
    status: statusFor(value, definition),
    timestamp,
    min: definition.min,
    max: definition.max,
    threshold: { warning: definition.warning, critical: definition.critical },
  };
}

function initialHistory(): TelemetryHistory[] {
  const now = Date.now();
  return SENSOR_DEFINITIONS.map((definition) => ({
    sensorId: definition.id,
    readings: Array.from({ length: 100 }, (_, index) => {
      const tick = index - 99;
      const timestamp = new Date(now + tick * 1000).toISOString();
      const reading = readingFor(definition, tick, timestamp, null);
      return { timestamp, value: reading.value, status: reading.status };
    }),
  }));
}

function calculateRisk(
  telemetry: SensorReading[],
  alerts: Alert[],
  incidents: Incident[],
  timestamp: string,
): RiskScore {
  const byType = (type: SensorType) => telemetry.find((sensor) => sensor.type === type);
  const riskRatio = (sensor: SensorReading | undefined) => {
    if (!sensor) return 0;
    return clamp(Math.round((sensor.value / sensor.threshold.critical) * 100), 0, 100);
  };
  const gas = riskRatio(byType('gas'));
  const temperature = riskRatio(byType('temperature'));
  const vibration = riskRatio(byType('vibration'));
  const equipment = clamp(100 - vibration, 0, 100);

  const activeAlerts = alerts.filter((a) => a.status !== 'resolved');
  const openIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed');

  const alertRisk = activeAlerts.reduce((sum, alert) => {
    if (alert.severity === 'critical') return sum + 25;
    if (alert.severity === 'warning') return sum + 15;
    if (alert.severity === 'info') return sum + 5;
    return sum;
  }, 0);

  const incidentRisk = openIncidents.length * 10;

  const thresholdViolations = telemetry.filter((s) => s.status === 'critical').length * 15;

  const overall = clamp(
    Math.max(gas, temperature, vibration, alertRisk + incidentRisk + thresholdViolations),
    0,
    100,
  );

  return {
    overall,
    gas,
    temperature,
    vibration,
    ppe: 0,
    equipment,
    updatedAt: timestamp,
  };
}

function auditEntry<TStatus extends string>(
  status: TStatus,
  actorRole: OperationalRole,
  notes: string,
  timestamp = new Date().toISOString(),
): LifecycleAuditEntry<TStatus> {
  return { id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, status, timestamp, actorRole, notes };
}

function activity(message: string, category: ActivityLog['category'], timestamp = new Date().toISOString()): ActivityLog {
  return { id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp, message, category };
}

function notification(
  alertId: string,
  definition: ScenarioDefinition,
  channel: NotificationChannel,
  timestamp: string,
): NotificationLog {
  return {
    id: `NOT-${Date.now()}-${channel.startsWith('Email') ? 'E' : 'M'}`,
    alertId,
    alertType: definition.title,
    severity: definition.severity,
    channel,
    status: 'delivered',
    recipientRole: definition.actor,
    message: `${definition.title}: ${definition.message}`,
    timestamp,
  };
}

const initialTimestamp = new Date().toISOString();
const initialTelemetry = SENSOR_DEFINITIONS.map((definition) => readingFor(definition, 0, initialTimestamp, null));

export const useSimulationDomainStore = create<SimulationDomainState>()((set, get) => ({
  telemetry: initialTelemetry,
  telemetryHistory: initialHistory(),
  alerts: [],
  incidents: [],
  notifications: [],
  riskMetrics: calculateRisk(initialTelemetry, [], [], initialTimestamp),
  cameraState: 'active',
  cameraConnected: true,
  captureHistory: [],
  violationHistory: [],
  activeScenario: null,
  scenarioStartedAt: null,
  activityHistory: [],
  isConnected: true,
  lastUpdated: initialTimestamp,
  systemHealth: 98,
  tickCount: 0,

  tick: () => set((state) => {
    const tickCount = state.tickCount + 1;
    const timestamp = new Date().toISOString();
    const scenarioProgress = state.activeScenario && state.scenarioStartedAt
      ? Math.max(0, Math.round((Date.now() - new Date(state.scenarioStartedAt).getTime()) / 1000))
      : 0;
    const scenarioExpired = scenarioProgress >= SCENARIO_DURATION_TICKS;
    const activeScenario = scenarioExpired ? null : state.activeScenario;
    const telemetry = SENSOR_DEFINITIONS.map((definition) =>
      readingFor(definition, tickCount, timestamp, activeScenario, scenarioProgress),
    );
    const telemetryHistory = state.telemetryHistory.map((series) => {
      const current = telemetry.find((sensor) => sensor.sensorId === series.sensorId);
      if (!current) return series;
      return {
        ...series,
        readings: [...series.readings, { timestamp, value: current.value, status: current.status }].slice(-HISTORY_LIMIT),
      };
    });
    const ppeRisk = activeScenario === 'ppe_violation' ? 85 : 2;
    return {
      tickCount,
      telemetry,
      telemetryHistory,
      riskMetrics: calculateRisk(telemetry, state.alerts, state.incidents, timestamp),
      lastUpdated: timestamp,
      activeScenario,
      scenarioStartedAt: scenarioExpired ? null : state.scenarioStartedAt,
      cameraState: activeScenario === 'ppe_violation' ? 'violation_detected' : state.cameraState === 'violation_detected' ? 'active' : state.cameraState,
      systemHealth: activeScenario ? 72 : 98,
    };
  }),

  startScenario: (scenario) => {
    const state = get();
    if (state.activeScenario === scenario) return;
    const definition = SCENARIOS[scenario];
    const timestamp = new Date().toISOString();
    const alertId = `ALT-${Date.now()}`;
    const incidentId = definition.createsIncident ? `INC-${Date.now()}` : undefined;
    const alert: Alert = {
      id: alertId,
      title: definition.title,
      message: definition.message,
      severity: definition.severity,
      status: 'active',
      source: definition.source,
      zone: definition.zone,
      timestamp,
      incidentId,
      auditHistory: [auditEntry('active', definition.actor, `${definition.title} created by the simulation engine.`, timestamp)],
    };
    const incidentSeverity: IncidentSeverity = definition.severity;
    const incident: Incident | null = incidentId ? {
      id: incidentId,
      title: definition.title,
      description: definition.message,
      category: definition.category,
      severity: incidentSeverity,
      status: 'open',
      zone: definition.zone,
      assignedTo: definition.actor,
      reportedBy: 'Simulation Environment',
      createdAt: timestamp,
      updatedAt: timestamp,
      tags: ['simulation', scenario.replace('_', '-')],
      originatingAlertId: alertId,
      auditHistory: [auditEntry('open', definition.actor, 'Incident created from originating alert.', timestamp)],
    } : null;
    const notifications = [
      notification(alertId, definition, 'Email Simulation', timestamp),
      notification(alertId, definition, 'Message Simulation', timestamp),
      notification(alertId, definition, 'In-App', timestamp),
    ];
    const capture = scenario === 'ppe_violation' ? {
      id: `CAP-${Date.now()}`,
      timestamp,
      state: 'violation_detected' as const,
      source: 'simulation' as const,
      notes: 'PPE violation captured by the camera simulation.',
    } : null;

    set({
      activeScenario: scenario,
      scenarioStartedAt: timestamp,
      alerts: [alert, ...state.alerts],
      incidents: incident ? [incident, ...state.incidents] : state.incidents,
      notifications: [...notifications, ...state.notifications].slice(0, 200),
      cameraState: capture ? 'violation_detected' : state.cameraState,
      captureHistory: capture ? [capture, ...state.captureHistory].slice(0, 100) : state.captureHistory,
      violationHistory: capture ? [capture, ...state.violationHistory].slice(0, 100) : state.violationHistory,
      activityHistory: [
        activity(`${definition.title} scenario started.`, 'simulation', timestamp),
        activity(`Alert ${alertId} created.`, 'alert', timestamp),
        ...(incident ? [activity(`Incident ${incident.id} created.`, 'incident', timestamp)] : []),
        activity('Notification simulation records created.', 'notification', timestamp),
        ...state.activityHistory,
      ].slice(0, 200),
      systemHealth: 72,
    });
    get().tick();
  },

  resetSimulation: () => {
    const timestamp = new Date().toISOString();
    const telemetry = SENSOR_DEFINITIONS.map((definition) => readingFor(definition, get().tickCount + 1, timestamp, null));
    set((state) => ({
      activeScenario: null,
      scenarioStartedAt: null,
      telemetry,
      riskMetrics: calculateRisk(telemetry, state.alerts, state.incidents, timestamp),
      cameraState: 'active',
      lastUpdated: timestamp,
      systemHealth: 98,
      activityHistory: [activity('Simulation environment returned to normal operation.', 'simulation', timestamp), ...state.activityHistory].slice(0, 200),
    }));
  },

  transitionAlert: (id, status, actorRole, notes = '') => set((state) => {
    const allowed: Record<AlertStatus, AlertStatus[]> = {
      active: ['acknowledged', 'escalated', 'resolved'],
      acknowledged: ['escalated', 'resolved'],
      escalated: ['resolved'],
      resolved: [],
    };
    return {
      alerts: state.alerts.map((alert) => {
        if (alert.id !== id || !allowed[alert.status].includes(status)) return alert;
        const timestamp = new Date().toISOString();
        return {
          ...alert,
          status,
          acknowledgedBy: status === 'acknowledged' ? actorRole : alert.acknowledgedBy,
          acknowledgedAt: status === 'acknowledged' ? timestamp : alert.acknowledgedAt,
          auditHistory: [...(alert.auditHistory ?? []), auditEntry(status, actorRole, notes || `Alert moved to ${status}.`, timestamp)],
        };
      }),
      activityHistory: [activity(`Alert ${id} moved to ${status} by ${actorRole}.`, 'alert'), ...state.activityHistory].slice(0, 200),
    };
  }),

  transitionIncident: (id, status, actorRole, notes = '') => set((state) => {
    const allowed: Record<IncidentStatus, IncidentStatus[]> = {
      open: ['investigating', 'resolved'],
      acknowledged: ['investigating', 'resolved'],
      investigating: ['resolved'],
      resolved: ['closed'],
      closed: [],
    };
    return {
      incidents: state.incidents.map((incident) => {
        if (incident.id !== id || !allowed[incident.status].includes(status)) return incident;
        const timestamp = new Date().toISOString();
        return {
          ...incident,
          status,
          assignedTo: actorRole,
          updatedAt: timestamp,
          resolvedAt: status === 'resolved' || status === 'closed' ? incident.resolvedAt ?? timestamp : incident.resolvedAt,
          auditHistory: [...(incident.auditHistory ?? []), auditEntry(status, actorRole, notes || `Incident moved to ${status}.`, timestamp)],
        };
      }),
      activityHistory: [activity(`Incident ${id} moved to ${status} by ${actorRole}.`, 'incident'), ...state.activityHistory].slice(0, 200),
    };
  }),

  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  addIncident: (incident) => set((state) => ({ incidents: [incident, ...state.incidents] })),
  setConnection: (isConnected) => set({ isConnected }),
  ingestSensorReading: (reading) => set((state) => {
    const telemetry = state.telemetry.some((sensor) => sensor.sensorId === reading.sensorId)
      ? state.telemetry.map((sensor) => sensor.sensorId === reading.sensorId ? reading : sensor)
      : [reading, ...state.telemetry];
    const telemetryHistory = state.telemetryHistory.some((series) => series.sensorId === reading.sensorId)
      ? state.telemetryHistory.map((series) => series.sensorId === reading.sensorId
        ? { ...series, readings: [...series.readings, { timestamp: reading.timestamp, value: reading.value, status: reading.status }].slice(-HISTORY_LIMIT) }
        : series)
      : [{ sensorId: reading.sensorId, readings: [{ timestamp: reading.timestamp, value: reading.value, status: reading.status }] }, ...state.telemetryHistory];
    return {
      telemetry,
      telemetryHistory,
      lastUpdated: reading.timestamp,
      riskMetrics: calculateRisk(telemetry, state.alerts, state.incidents, reading.timestamp),
    };
  }),
  setCameraState: (cameraState) => set({ cameraState }),
  recordCapture: (capture) => set((state) => {
    const entry: CameraCapture = { ...capture, id: `CAP-${Date.now()}`, timestamp: new Date().toISOString() };
    return {
      cameraState: entry.state,
      captureHistory: [entry, ...state.captureHistory].slice(0, 100),
      violationHistory: entry.state === 'violation_detected'
        ? [entry, ...state.violationHistory].slice(0, 100)
        : state.violationHistory,
      activityHistory: [activity(`Camera capture recorded: ${entry.state.replaceAll('_', ' ')}.`, 'camera'), ...state.activityHistory].slice(0, 200),
    };
  }),
  clearOperationalHistory: () => set({
    alerts: [],
    incidents: [],
    notifications: [],
    captureHistory: [],
    violationHistory: [],
    activityHistory: [],
  }),
}));

export const simulationDomainSelectors = {
  activeAlerts: (state: SimulationDomainState) => state.alerts.filter((alert) => alert.status !== 'resolved'),
  openIncidents: (state: SimulationDomainState) => state.incidents.filter((incident) => incident.status !== 'resolved' && incident.status !== 'closed'),
  criticalAlerts: (state: SimulationDomainState) => state.alerts.filter(
    (alert) => alert.status !== 'resolved' && (alert.severity === 'critical' || alert.severity === 'emergency'),
  ),
  sensorByType: (type: SensorType) => (state: SimulationDomainState) => state.telemetry.find((sensor) => sensor.type === type),
  historyBySensor: (sensorId: string) => (state: SimulationDomainState) =>
    state.telemetryHistory.find((series) => series.sensorId === sensorId)?.readings ?? [],
};
