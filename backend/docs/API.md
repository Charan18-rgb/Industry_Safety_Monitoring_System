# AEGIS-AI API Reference

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently, the API does not require authentication. This will be added in future versions.

## Response Format

All API responses follow JSON format:

```json
{
  "data": { ... },
  "error": null
}
```

Error responses:

```json
{
  "detail": "Error message"
}
```

## Telemetry Endpoints

### Get Live Telemetry

```http
GET /api/sensors/live
```

**Query Parameters:**
- `sensor_id` (optional): Filter by specific sensor ID

**Response:**
```json
[
  {
    "timestamp": "2024-01-01T00:00:00",
    "sensor_id": "GAS-001",
    "sensor_name": "Gas Sensor 1",
    "sensor_type": "gas",
    "location": "Zone A",
    "gas_ppm": 50.5,
    "temperature_c": 25.3,
    "humidity_percent": 45.2,
    "vibration_hz": 10.1,
    "machine_health_percent": 95.0,
    "environmental_risk_score": 10.0,
    "safety_score": 90.0,
    "anomaly_detected": 0,
    "anomaly_type": null
  }
]
```

### Get Sensor History

```http
GET /api/sensors/history
```

**Query Parameters:**
- `sensor_id` (required): Sensor ID
- `hours` (optional): Hours of history (default: 24)
- `limit` (optional): Maximum readings (default: 1000)

### Get Sensor Status

```http
GET /api/sensors/status
```

**Query Parameters:**
- `sensor_type` (optional): Filter by sensor type

## Simulation Endpoints

### Start Simulation

```http
POST /api/simulation/start
```

**Request Body:**
```json
{
  "interval": 1.0,
  "scenario": "normal"
}
```

**Response:**
```json
{
  "status": "started",
  "interval": 1.0,
  "scenario": "normal",
  "sensors_initialized": 7
}
```

### Stop Simulation

```http
POST /api/simulation/stop
```

### Set Scenario

```http
POST /api/simulation/scenario
```

**Request Body:**
```json
{
  "scenario": "critical",
  "duration_seconds": 60,
  "intensity": 1.5
}
```

**Scenarios:**
- `normal`: Normal operation
- `drift`: Gradual parameter drift
- `spike`: Sudden value spikes
- `anomaly`: Random anomalies
- `critical`: Critical hazard events

### Get Simulation Status

```http
GET /api/simulation/status
```

## Incident Endpoints

### List Incidents

```http
GET /api/incidents
```

**Query Parameters:**
- `status` (optional): Filter by status (open, acknowledged, resolved, closed)
- `category` (optional): Filter by category
- `severity` (optional): Filter by severity (low, medium, high, critical)
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Page size (default: 50, max: 100)

**Response:**
```json
{
  "total": 100,
  "incidents": [...],
  "page": 1,
  "page_size": 50
}
```

### Create Incident

```http
POST /api/incidents
```

**Request Body:**
```json
{
  "title": "Gas Leak Detected",
  "description": "Gas sensor detected elevated levels",
  "category": "gas_leak",
  "severity": "high",
  "location": "Zone A",
  "sensor_id": "GAS-001"
}
```

**Categories:**
- `gas_leak`
- `overheating`
- `vibration_anomaly`
- `ppe_violation`
- `helmet_violation`
- `emergency_shutdown`
- `predictive_warning`

### Get Incident

```http
GET /api/incidents/{incident_id}
```

### Acknowledge Incident

```http
PATCH /api/incidents/{incident_id}/acknowledge
```

**Query Parameters:**
- `acknowledged_by` (required): User acknowledging the incident

### Resolve Incident

```http
PATCH /api/incidents/{incident_id}/resolve
```

**Request Body:**
```json
{
  "resolved_by": "user123",
  "resolution_notes": "Issue fixed"
}
```

### Get Incident Audit Log

```http
GET /api/incidents/{incident_id}/audit
```

## Alert Endpoints

### Create Alert

```http
POST /api/alerts/create
```

**Request Body:**
```json
{
  "title": "Critical Alert",
  "message": "Gas levels exceeded threshold",
  "alert_type": "critical",
  "source": "sensor",
  "source_id": "GAS-001",
  "incident_id": "INC-12345678"
}
```

**Alert Types:**
- `critical`
- `warning`
- `emergency`
- `info`

### Get Active Alerts

```http
GET /api/alerts/active
```

**Query Parameters:**
- `limit` (optional): Maximum alerts (default: 100, max: 500)

### Get Alert by Type

```http
GET /api/alerts/type/{alert_type}
```

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (optional): Maximum alerts

### Acknowledge Alert

```http
POST /api/alerts/{alert_id}/acknowledge
```

**Query Parameters:**
- `acknowledged_by` (required): User acknowledging the alert

### Resolve Alert

```http
POST /api/alerts/{alert_id}/resolve
```

**Query Parameters:**
- `resolved_by` (required): User resolving the alert
- `resolution_notes` (optional): Resolution notes

## Report Endpoints

### Generate Report

```http
POST /api/reports/generate
```

**Request Body:**
```json
{
  "title": "Monthly Incident Report",
  "description": "Incident summary for January 2024",
  "report_type": "incident",
  "start_date": "2024-01-01T00:00:00",
  "end_date": "2024-01-31T23:59:59",
  "filters": "{}"
}
```

**Report Types:**
- `incident`
- `telemetry`
- `compliance`
- `maintenance`
- `analytics`

### List Reports

```http
GET /api/reports
```

**Query Parameters:**
- `report_type` (optional): Filter by type
- `status` (optional): Filter by status (pending, generating, completed, failed)
- `page` (optional): Page number
- `page_size` (optional): Page size

### Get Report

```http
GET /api/reports/{report_id}
```

### Download Report

```http
GET /api/reports/{report_id}/download
```

Returns PDF file.

## Analytics Endpoints

### Get Risk Analytics

```http
GET /api/analytics/risk
```

**Response:**
```json
{
  "snapshot_id": "SNAP-12345678",
  "timestamp": "2024-01-01T00:00:00",
  "overall_risk_score": 25.5,
  "environmental_risk_score": 15.3,
  "equipment_risk_score": 7.7,
  "safety_risk_score": 2.5,
  "avg_machine_health": 92.5,
  "critical_equipment_count": 0,
  "at_risk_equipment_count": 1,
  "total_incidents": 5,
  "open_incidents": 2,
  "critical_incidents": 0,
  "total_alerts": 15,
  "active_alerts": 3,
  "critical_alerts": 1,
  "avg_temperature": 28.5,
  "avg_humidity": 52.3,
  "avg_gas_ppm": 45.2,
  "avg_vibration": 12.1
}
```

### Get Trend Analytics

```http
GET /api/analytics/trends
```

**Query Parameters:**
- `metric` (required): Metric name (risk_score, temperature, humidity, gas_ppm, vibration, machine_health)
- `hours` (optional): Hours of trend data (default: 24, max: 168)

**Response:**
```json
[
  {
    "metric_name": "temperature",
    "trend": [
      {
        "timestamp": "2024-01-01T00:00:00",
        "value": 25.5
      }
    ],
    "trend_direction": "increasing",
    "change_percentage": 5.2
  }
]
```

### Get KPI Dashboard

```http
GET /api/analytics/kpis
```

**Response:**
```json
{
  "timestamp": "2024-01-01T00:00:00",
  "kpis": [
    {
      "kpi_name": "overall_risk_score",
      "value": 25.5,
      "unit": "score",
      "target": 20.0,
      "status": "warning",
      "trend": "stable",
      "change_percentage": null
    }
  ]
}
```

## WebSocket Endpoints

### Telemetry WebSocket

```
WS /api/ws/telemetry?client_id={client_id}
```

### Alerts WebSocket

```
WS /api/ws/alerts?client_id={client_id}
```

### Incidents WebSocket

```
WS /api/ws/incidents?client_id={client_id}
```

**WebSocket Message Format:**

```json
{
  "type": "telemetry|alert|incident",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00"
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |
