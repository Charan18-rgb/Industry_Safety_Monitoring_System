// AEGIS-AI Mock Data - Realistic Industrial Telemetry
import type {
  Incident, SensorReading, Alert, Equipment, Zone, RiskScore, TelemetryHistory
} from '@/types';

// --- Sensor Readings ---------------------------------------------------------

export const mockSensorReadings: SensorReading[] = [
  {
    sensorId: 'SEN-GAS-001',
    sensorName: 'Gas Detector Alpha',
    type: 'gas',
    value: 42.7,
    unit: 'ppm',
    zone: 'Zone-A',
    status: 'warning',
    timestamp: new Date().toISOString(),
    min: 0,
    max: 100,
    threshold: { warning: 35, critical: 70 },
  },
  {
    sensorId: 'SEN-GAS-002',
    sensorName: 'Gas Detector Beta',
    type: 'gas',
    value: 12.3,
    unit: 'ppm',
    zone: 'Zone-B',
    status: 'normal',
    timestamp: new Date().toISOString(),
    min: 0,
    max: 100,
    threshold: { warning: 35, critical: 70 },
  },
  {
    sensorId: 'SEN-TEMP-001',
    sensorName: 'Temperature Sensor T1',
    type: 'temperature',
    value: 78.4,
    unit: '°C',
    zone: 'Zone-A',
    status: 'warning',
    timestamp: new Date().toISOString(),
    min: 0,
    max: 150,
    threshold: { warning: 75, critical: 100 },
  },
  {
    sensorId: 'SEN-TEMP-002',
    sensorName: 'Temperature Sensor T2',
    type: 'temperature',
    value: 52.1,
    unit: '°C',
    zone: 'Zone-C',
    status: 'normal',
    timestamp: new Date().toISOString(),
    min: 0,
    max: 150,
    threshold: { warning: 75, critical: 100 },
  },
  {
    sensorId: 'SEN-HUM-001',
    sensorName: 'Humidity Sensor H1',
    type: 'humidity',
    value: 68.2,
    unit: '%RH',
    zone: 'Zone-B',
    status: 'normal',
    timestamp: new Date().toISOString(),
    min: 0,
    max: 100,
    threshold: { warning: 75, critical: 90 },
  },
  {
    sensorId: 'SEN-VIB-001',
    sensorName: 'Vibration Sensor V1',
    type: 'vibration',
    value: 8.9,
    unit: 'mm/s',
    zone: 'Zone-D',
    status: 'critical',
    timestamp: new Date().toISOString(),
    min: 0,
    max: 20,
    threshold: { warning: 6, critical: 8 },
  },
  {
    sensorId: 'SEN-VIB-002',
    sensorName: 'Vibration Sensor V2',
    type: 'vibration',
    value: 3.2,
    unit: 'mm/s',
    zone: 'Zone-A',
    status: 'normal',
    timestamp: new Date().toISOString(),
    min: 0,
    max: 20,
    threshold: { warning: 6, critical: 8 },
  },
  {
    sensorId: 'SEN-PRES-001',
    sensorName: 'Pressure Sensor P1',
    type: 'pressure',
    value: 4.2,
    unit: 'bar',
    zone: 'Zone-C',
    status: 'normal',
    timestamp: new Date().toISOString(),
    min: 0,
    max: 10,
    threshold: { warning: 7, critical: 9 },
  },
];

// --- Risk Score --------------------------------------------------------------

export const mockRiskScore: RiskScore = {
  overall: 64,
  gas: 58,
  temperature: 72,
  vibration: 89,
  ppe: 45,
  equipment: 62,
  updatedAt: new Date().toISOString(),
};

// --- Incidents ---------------------------------------------------------------

export const mockIncidents: Incident[] = [
  {
    id: 'INC-2024-0841',
    title: 'Elevated Gas Concentration in Zone-A',
    description: 'Methane levels exceeded warning threshold of 35 ppm. Auto-ventilation initiated. Workers notified to evacuate non-essential personnel.',
    category: 'gas_leak',
    severity: 'critical',
    status: 'investigating',
    zone: 'Zone-A',
    equipment: 'Gas Line G-12',
    assignedTo: 'Safety Officer',
    reportedBy: 'Automated Sensor',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    tags: ['gas', 'methane', 'ventilation', 'auto-response'],
    notes: 'Ventilation systems engaged. Investigating source of leak.',
  },
  {
    id: 'INC-2024-0840',
    title: 'Compressor Vibration Anomaly Detected',
    description: 'Vibration sensor V1 in Zone-D recorded 8.9 mm/s, exceeding critical threshold. Possible bearing wear detected.',
    category: 'vibration_anomaly',
    severity: 'critical',
    status: 'acknowledged',
    zone: 'Zone-D',
    equipment: 'Compressor Unit CU-7',
    assignedTo: 'Maintenance Team',
    reportedBy: 'Predictive AI System',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    tags: ['vibration', 'compressor', 'bearing', 'maintenance'],
  },
  {
    id: 'INC-2024-0839',
    title: 'PPE Non-Compliance - Worker W-47',
    description: 'Worker detected without mandatory safety goggles in chemical processing area. Access has been logged. Supervisor notified.',
    category: 'ppe_violation',
    severity: 'warning',
    status: 'open',
    zone: 'Zone-B',
    reportedBy: 'PPE AI Vision System',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    tags: ['ppe', 'goggles', 'compliance', 'worker-47'],
  },
  {
    id: 'INC-2024-0838',
    title: 'Overtemperature Alert - Heat Exchanger HX-3',
    description: 'Temperature sensor T1 recorded 78.4°C near Heat Exchanger HX-3, approaching warning threshold.',
    category: 'overheating',
    severity: 'warning',
    status: 'acknowledged',
    zone: 'Zone-A',
    equipment: 'Heat Exchanger HX-3',
    assignedTo: 'Plant Supervisor',
    reportedBy: 'Automated Sensor',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    tags: ['temperature', 'heat-exchanger', 'thermal'],
  },
  {
    id: 'INC-2024-0837',
    title: 'Helmet Violation Detected - Maintenance Bay',
    description: 'AI vision system detected worker without hard hat in active maintenance area during scheduled equipment inspection.',
    category: 'helmet_violation',
    severity: 'warning',
    status: 'resolved',
    zone: 'Zone-D',
    assignedTo: 'Operations Manager',
    reportedBy: 'Helmet AI Vision System',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    tags: ['helmet', 'ppe', 'maintenance', 'resolved'],
  },
  {
    id: 'INC-2024-0836',
    title: 'Emergency Shutdown - Reactor Loop B',
    description: 'Automated safety system triggered emergency shutdown of Reactor Loop B due to cascading pressure anomalies.',
    category: 'emergency_shutdown',
    severity: 'emergency',
    status: 'closed',
    zone: 'Zone-C',
    equipment: 'Reactor Loop B',
    assignedTo: 'System Administrator',
    reportedBy: 'SCADA Safety System',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
    tags: ['emergency', 'shutdown', 'reactor', 'pressure', 'scada'],
  },
];

// --- Alerts ------------------------------------------------------------------

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    title: 'CRITICAL: Gas Leak Detected',
    message: 'Methane concentration at 42.7 ppm in Zone-A. Evacuation protocol pending.',
    severity: 'critical',
    status: 'active',
    source: 'Gas Detector Alpha',
    zone: 'Zone-A',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    incidentId: 'INC-2024-0841',
  },
  {
    id: 'ALT-002',
    title: 'CRITICAL: Compressor Vibration',
    message: 'Vibration threshold exceeded on CU-7. Immediate inspection required.',
    severity: 'critical',
    status: 'acknowledged',
    source: 'Vibration Sensor V1',
    zone: 'Zone-D',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    acknowledgedBy: 'Maintenance Team',
    acknowledgedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    incidentId: 'INC-2024-0840',
  },
  {
    id: 'ALT-003',
    title: 'WARNING: Temperature Rising',
    message: 'Temperature Sensor T1 at 78.4°C. 1.6°C from critical threshold.',
    severity: 'warning',
    status: 'active',
    source: 'Temperature Sensor T1',
    zone: 'Zone-A',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    incidentId: 'INC-2024-0838',
  },
  {
    id: 'ALT-004',
    title: 'WARNING: PPE Non-Compliance',
    message: 'Worker W-47 detected without safety goggles in Zone-B.',
    severity: 'warning',
    status: 'active',
    source: 'PPE AI Vision',
    zone: 'Zone-B',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    incidentId: 'INC-2024-0839',
  },
  {
    id: 'ALT-005',
    title: 'INFO: Sensor Calibration Due',
    message: 'Humidity Sensor H1 calibration due in 3 days.',
    severity: 'info',
    status: 'active',
    source: 'System',
    zone: 'Zone-B',
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
];

// --- Equipment ---------------------------------------------------------------

export const mockEquipment: Equipment[] = [
  {
    id: 'EQ-001',
    name: 'Compressor Unit CU-7',
    type: 'Rotary Compressor',
    zone: 'Zone-D',
    status: 'critical',
    healthScore: 23,
    lastMaintenance: new Date(Date.now() - 30 * 86400000).toISOString(),
    nextMaintenance: new Date(Date.now() + 2 * 86400000).toISOString(),
    sensors: ['SEN-VIB-001', 'SEN-TEMP-003'],
    alerts: 2,
    uptime: 72.4,
  },
  {
    id: 'EQ-002',
    name: 'Heat Exchanger HX-3',
    type: 'Shell & Tube HEX',
    zone: 'Zone-A',
    status: 'degraded',
    healthScore: 61,
    lastMaintenance: new Date(Date.now() - 15 * 86400000).toISOString(),
    nextMaintenance: new Date(Date.now() + 15 * 86400000).toISOString(),
    sensors: ['SEN-TEMP-001', 'SEN-PRES-001'],
    alerts: 1,
    uptime: 94.1,
  },
  {
    id: 'EQ-003',
    name: 'Reactor Loop B',
    type: 'Continuous Flow Reactor',
    zone: 'Zone-C',
    status: 'maintenance',
    healthScore: 45,
    lastMaintenance: new Date(Date.now() - 1 * 86400000).toISOString(),
    nextMaintenance: new Date(Date.now() + 7 * 86400000).toISOString(),
    sensors: ['SEN-TEMP-002', 'SEN-PRES-001'],
    alerts: 0,
    uptime: 68.9,
  },
  {
    id: 'EQ-004',
    name: 'Pump Station PS-2',
    type: 'Centrifugal Pump',
    zone: 'Zone-B',
    status: 'operational',
    healthScore: 88,
    lastMaintenance: new Date(Date.now() - 7 * 86400000).toISOString(),
    nextMaintenance: new Date(Date.now() + 23 * 86400000).toISOString(),
    sensors: ['SEN-VIB-002', 'SEN-PRES-002'],
    alerts: 0,
    uptime: 99.2,
  },
  {
    id: 'EQ-005',
    name: 'Filtration Unit FU-1',
    type: 'Multi-Stage Filter',
    zone: 'Zone-A',
    status: 'operational',
    healthScore: 92,
    lastMaintenance: new Date(Date.now() - 5 * 86400000).toISOString(),
    nextMaintenance: new Date(Date.now() + 25 * 86400000).toISOString(),
    sensors: ['SEN-HUM-001'],
    alerts: 0,
    uptime: 99.8,
  },
];

// --- Industrial Zones --------------------------------------------------------

export const mockZones: Zone[] = [
  { id: 'Zone-A', name: 'Zone Alpha - Processing', type: 'Chemical Processing', status: 'danger', riskScore: 74, workerCount: 12, activeAlerts: 3, sensors: 8, x: 10, y: 10, width: 35, height: 40 },
  { id: 'Zone-B', name: 'Zone Beta - Utility', type: 'Utility Systems', status: 'caution', riskScore: 48, workerCount: 6, activeAlerts: 1, sensors: 5, x: 55, y: 10, width: 35, height: 40 },
  { id: 'Zone-C', name: 'Zone Gamma - Reactor', type: 'Reactor Operations', status: 'caution', riskScore: 52, workerCount: 4, activeAlerts: 1, sensors: 6, x: 10, y: 58, width: 35, height: 32 },
  { id: 'Zone-D', name: 'Zone Delta - Mechanical', type: 'Mechanical Systems', status: 'danger', riskScore: 82, workerCount: 8, activeAlerts: 2, sensors: 7, x: 55, y: 58, width: 35, height: 32 },
];

// --- Telemetry History (sparkline data) -------------------------------------

export function generateTelemetryHistory(
  baseValue: number,
  variance: number,
  points: number = 24
): Array<{ timestamp: string; value: number; status: 'normal' | 'warning' | 'critical' }> {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => {
    const value = Math.max(0, baseValue + (Math.random() - 0.5) * variance * 2);
    return {
      timestamp: new Date(now - (points - i) * 3600000).toISOString(),
      value: Math.round(value * 10) / 10,
      status: value > baseValue + variance ? 'warning' : 'normal',
    };
  });
}

export const mockTelemetryHistory: TelemetryHistory[] = [
  { sensorId: 'SEN-GAS-001', readings: generateTelemetryHistory(30, 15, 24) },
  { sensorId: 'SEN-TEMP-001', readings: generateTelemetryHistory(65, 20, 24) },
  { sensorId: 'SEN-HUM-001', readings: generateTelemetryHistory(65, 10, 24) },
  { sensorId: 'SEN-VIB-001', readings: generateTelemetryHistory(5, 5, 24) },
];

// --- Activity Feed -----------------------------------------------------------

export interface ActivityItem {
  id: string;
  type: 'incident' | 'alert' | 'system' | 'user' | 'ai';
  message: string;
  detail: string;
  timestamp: string;
  severity?: string;
}

export const mockActivityFeed: ActivityItem[] = [
  { id: '1', type: 'alert', message: 'Gas alert triggered', detail: 'Zone-A sensor SEN-GAS-001 exceeded warning threshold', timestamp: new Date(Date.now() - 3 * 60000).toISOString(), severity: 'critical' },
  { id: '2', type: 'ai', message: 'AI Risk Assessment Updated', detail: 'Overall risk score increased to 64 - vibration anomaly driver', timestamp: new Date(Date.now() - 8 * 60000).toISOString(), severity: 'warning' },
  { id: '3', type: 'user', message: 'Incident INC-2024-0840 Acknowledged', detail: 'Maintenance Team acknowledged compressor vibration incident', timestamp: new Date(Date.now() - 25 * 60000).toISOString() },
  { id: '4', type: 'system', message: 'WebSocket Connection Established', detail: 'Real-time telemetry feed active - all sensors nominal', timestamp: new Date(Date.now() - 40 * 60000).toISOString() },
  { id: '5', type: 'incident', message: 'New Incident Created', detail: 'INC-2024-0841: Elevated gas concentration reported in Zone-A', timestamp: new Date(Date.now() - 25 * 60000).toISOString(), severity: 'critical' },
  { id: '6', type: 'ai', message: 'Predictive Maintenance Alert', detail: 'Compressor CU-7 bearing failure probability: 87% within 72 hours', timestamp: new Date(Date.now() - 1.5 * 3600000).toISOString(), severity: 'warning' },
  { id: '7', type: 'user', message: 'System Calibration Initiated', detail: 'Admin initiated sensor calibration cycle for Zone-B sensors', timestamp: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: '8', type: 'system', message: 'Daily Report Generated', detail: 'Compliance summary for 2024-01-15 archived to reports store', timestamp: new Date(Date.now() - 6 * 3600000).toISOString() },
];

// --- PPE & Helmet Compliance -------------------------------------------------

export const mockComplianceData = {
  ppe: { compliant: 34, nonCompliant: 4, total: 38, percentage: 89.5 },
  helmet: { compliant: 36, nonCompliant: 2, total: 38, percentage: 94.7 },
  zones: [
    { zone: 'Zone-A', ppe: 92, helmet: 96 },
    { zone: 'Zone-B', ppe: 85, helmet: 100 },
    { zone: 'Zone-C', ppe: 100, helmet: 100 },
    { zone: 'Zone-D', ppe: 80, helmet: 80 },
  ],
};

// --- Nominal (Safe) versions for initial clean state -------------------------

export const mockSensorReadingsNominal: SensorReading[] = mockSensorReadings.map(s => ({
  ...s,
  value: s.type === 'gas' ? 12.3 : s.type === 'temperature' ? 52.1 : s.type === 'vibration' ? 3.2 : s.type === 'pressure' ? 4.2 : s.value,
  status: 'normal'
}));

export const mockRiskScoreNominal: RiskScore = {
  overall: 12,
  gas: 15,
  temperature: 22,
  vibration: 10,
  ppe: 98,
  equipment: 92,
  updatedAt: new Date().toISOString()
};

export const mockIncidentsNominal: Incident[] = mockIncidents.map(i => ({
  ...i,
  status: 'resolved',
  resolvedAt: i.resolvedAt || new Date().toISOString()
}));

export const mockAlertsNominal: Alert[] = [];

export const mockComplianceDataNominal = {
  ppe: { compliant: 38, nonCompliant: 0, total: 38, percentage: 100 },
  helmet: { compliant: 38, nonCompliant: 0, total: 38, percentage: 100 },
  zones: [
    { zone: 'Zone-A', ppe: 100, helmet: 100 },
    { zone: 'Zone-B', ppe: 100, helmet: 100 },
    { zone: 'Zone-C', ppe: 100, helmet: 100 },
    { zone: 'Zone-D', ppe: 100, helmet: 100 },
  ],
};

export const mockActivityFeedNominal: ActivityItem[] = [
  { id: '1', type: 'system', message: 'All Systems Operational', detail: 'No active safety alerts or warnings detected across plant zones.', timestamp: new Date().toISOString() },
  { id: '2', type: 'system', message: 'WebSocket Connection Active', detail: 'Real-time telemetry feed monitoring all active sensors.', timestamp: new Date(Date.now() - 5 * 60000).toISOString() }
];


