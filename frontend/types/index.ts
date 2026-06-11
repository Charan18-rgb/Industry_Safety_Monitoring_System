// AEGIS-AI Platform Types
// Shared type definitions for the entire platform

export type UserRole = 'admin' | 'safety_officer' | 'plant_manager' | 'operator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  plant?: string;
  lastLogin?: string;
  permissions: Permission[];
}

export type Permission =
  | 'view_dashboard'
  | 'view_incidents'
  | 'manage_incidents'
  | 'view_telemetry'
  | 'manage_alerts'
  | 'view_reports'
  | 'generate_reports'
  | 'manage_settings'
  | 'manage_users'
  | 'emergency_override';

// ─── Incident Types ────────────────────────────────────────────────────────

export type IncidentSeverity = 'emergency' | 'critical' | 'warning' | 'info';
export type IncidentStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';
export type IncidentCategory =
  | 'gas_leak'
  | 'overheating'
  | 'vibration_anomaly'
  | 'ppe_violation'
  | 'helmet_violation'
  | 'emergency_shutdown'
  | 'equipment_failure'
  | 'environmental';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  zone: string;
  equipment?: string;
  assignedTo?: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags: string[];
  notes?: string;
}

// ─── Telemetry Types ────────────────────────────────────────────────────────

export type SensorType = 'gas' | 'temperature' | 'humidity' | 'vibration' | 'pressure' | 'current';
export type SensorStatus = 'normal' | 'warning' | 'critical' | 'offline';

export interface SensorReading {
  sensorId: string;
  sensorName: string;
  type: SensorType;
  value: number;
  unit: string;
  zone: string;
  status: SensorStatus;
  timestamp: string;
  min: number;
  max: number;
  threshold: {
    warning: number;
    critical: number;
  };
}

export interface TelemetryHistory {
  sensorId: string;
  readings: Array<{
    timestamp: string;
    value: number;
    status: SensorStatus;
  }>;
}

// ─── Alert Types ────────────────────────────────────────────────────────────

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  zone: string;
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  incidentId?: string;
}

// ─── Equipment Types ────────────────────────────────────────────────────────

export type EquipmentStatus = 'operational' | 'degraded' | 'critical' | 'offline' | 'maintenance';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  zone: string;
  status: EquipmentStatus;
  healthScore: number;
  lastMaintenance: string;
  nextMaintenance: string;
  sensors: string[];
  alerts: number;
  uptime: number;
}

// ─── Dashboard Types ────────────────────────────────────────────────────────

export interface DashboardMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: number;
  status: 'normal' | 'warning' | 'critical';
  icon?: string;
}

export interface RiskScore {
  overall: number;
  gas: number;
  temperature: number;
  vibration: number;
  ppe: number;
  equipment: number;
  updatedAt: string;
}

// ─── Zone Types ────────────────────────────────────────────────────────────

export type ZoneStatus = 'safe' | 'caution' | 'danger' | 'evacuate';

export interface Zone {
  id: string;
  name: string;
  type: string;
  status: ZoneStatus;
  riskScore: number;
  workerCount: number;
  activeAlerts: number;
  sensors: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Report Types ────────────────────────────────────────────────────────────

export type ReportType = 'compliance' | 'incident_summary' | 'safety' | 'maintenance' | 'telemetry';
export type ReportFormat = 'pdf' | 'csv' | 'excel' | 'json';

export interface ReportRequest {
  type: ReportType;
  dateFrom: string;
  dateTo: string;
  zones?: string[];
  format: ReportFormat;
  includeCharts?: boolean;
}

export interface Report {
  id: string;
  title: string;
  reportType: string;
  generatedAt: string;
  fileSize: string;
  downloadUrl: string | null;
}

// ─── Activity Log Types ──────────────────────────────────────────────────────

export type ActivityCategory = 'simulation' | 'alert' | 'incident' | 'email' | 'whatsapp' | 'report';

export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  category: ActivityCategory;
}

// ─── Settings Types ────────────────────────────────────────────────────────

export interface ThresholdConfig {
  sensorType: SensorType;
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;
}

export interface NotificationConfig {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  severityFilter: AlertSeverity[];
  emailRecipients: string[];
  smsRecipients: string[];
}

export interface SystemConfig {
  plantName: string;
  timezone: string;
  refreshInterval: number;
  retentionDays: number;
  autoAcknowledge: boolean;
  emergencyContacts: string[];
}

// ─── Notification Types ─────────────────────────────────────────────────────

export type DeliveryStatus = 'success' | 'failed' | 'pending' | 'disabled';

export interface NotificationLog {
  id: string;
  alertType: string;
  severity: string;
  emailStatus: DeliveryStatus;
  whatsappStatus: DeliveryStatus;
  timestamp: string;
}
