# AEGIS-AI Backend Documentation

## Overview

AEGIS-AI (Autonomous Enterprise Grade Industrial Safety Intelligence System) is a production-grade backend platform for industrial safety intelligence, providing live telemetry, incident management, alerts, reporting, analytics, and AI integration endpoints.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Modules](#modules)
- [Testing](#testing)

## Installation

### Prerequisites

- Python 3.11+
- pip

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd AEGIS-WINDSURF-BACKEND
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Configuration

The application uses environment variables for configuration. Key settings:

- `DATABASE_URL`: SQLite database connection string
- `API_HOST`: API server host (default: 0.0.0.0)
- `API_PORT`: API server port (default: 8000)
- `SIMULATION_ENABLED`: Enable/disable telemetry simulation
- `ALERT_ESCALATION_MINUTES`: Alert escalation timeout
- `AI_ENDPOINTS`: URLs for AI integration services

See `.env.example` for all available configuration options.

## Running the Application

### Development Mode

```bash
python -m app.main
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once the application is running, access the interactive API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### API Endpoints

#### Telemetry
- `GET /api/sensors/live` - Get live telemetry data
- `GET /api/sensors/history` - Get sensor history
- `GET /api/sensors/status` - Get sensor status

#### Simulation
- `POST /api/simulation/start` - Start telemetry simulation
- `POST /api/simulation/stop` - Stop telemetry simulation
- `POST /api/simulation/scenario` - Set simulation scenario
- `GET /api/simulation/status` - Get simulation status

#### Incidents
- `GET /api/incidents` - List incidents
- `POST /api/incidents` - Create incident
- `GET /api/incidents/{id}` - Get incident details
- `PATCH /api/incidents/{id}/acknowledge` - Acknowledge incident
- `PATCH /api/incidents/{id}/resolve` - Resolve incident
- `GET /api/incidents/{id}/audit` - Get incident audit log

#### Alerts
- `POST /api/alerts/create` - Create alert
- `GET /api/alerts/active` - Get active alerts
- `GET /api/alerts/{id}` - Get alert details
- `POST /api/alerts/{id}/acknowledge` - Acknowledge alert
- `POST /api/alerts/{id}/resolve` - Resolve alert

#### Reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports` - List reports
- `GET /api/reports/{id}` - Get report details
- `GET /api/reports/{id}/download` - Download report PDF

#### Analytics
- `GET /api/analytics/risk` - Get risk analytics
- `GET /api/analytics/trends` - Get trend analytics
- `GET /api/analytics/kpis` - Get KPI dashboard

#### WebSocket
- `WS /api/ws/telemetry` - Real-time telemetry updates
- `WS /api/ws/alerts` - Real-time alert updates
- `WS /api/ws/incidents` - Real-time incident updates

## Architecture

### Project Structure

```
AEGIS-WINDSURF-BACKEND/
├── app/
│   ├── api/              # API routes
│   ├── core/             # Core configuration and database
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic services
│   ├── repositories/     # Data access layer
│   ├── websocket/        # WebSocket manager
│   ├── simulation/       # Telemetry simulation engine
│   ├── integrations/     # AI integration clients
│   ├── alerts/           # Alert engine
│   ├── reports/          # Report generation
│   ├── analytics/        # Analytics engine
│   ├── utils/            # Utility functions
│   └── main.py           # Application entry point
├── tests/                # Test suite
├── docs/                 # Documentation
├── requirements.txt      # Python dependencies
└── .env.example         # Environment variables template
```

### Technology Stack

- **Framework**: FastAPI
- **Database**: SQLite with SQLAlchemy (async)
- **Validation**: Pydantic
- **Real-time**: WebSockets
- **Scheduling**: APScheduler
- **Data Processing**: Pandas, NumPy
- **Report Generation**: ReportLab
- **Testing**: pytest
- **HTTP Client**: httpx

## Modules

### Telemetry Simulation Engine

Realistic industrial telemetry simulation supporting:
- Gas ppm, temperature, humidity, vibration
- Machine health percentage
- Environmental risk and safety scores
- Multiple scenarios: normal, drift, spike, anomaly, critical

### Real-time Streaming

WebSocket-based telemetry push engine with:
- Multi-client support
- Automatic reconnection
- Broadcasting capabilities
- Heartbeat monitoring

### Incident Engine

Complete incident management with:
- CRUD operations
- Status tracking (open, acknowledged, resolved, closed)
- Category and severity classification
- Full audit history

### Alert Engine

Alert management with:
- Critical, warning, emergency, and info alerts
- Escalation logic with configurable timeouts
- Auto-resolution after timeout
- Notification workflow tracking

### Reporting Engine

PDF report generation for:
- Incident reports
- Telemetry reports
- Compliance reports
- Maintenance summaries

### Analytics Engine

Advanced analytics including:
- Risk score calculations
- Trend analysis
- Equipment health metrics
- KPI dashboards

### AI Integration

Middleware clients for:
- Helmet AI (helmet violation detection)
- PPE AI (PPE compliance monitoring)
- Predictive AI (equipment failure prediction)

## Testing

Run the test suite:

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=app --cov-report=html
```

Run specific test file:

```bash
pytest tests/test_api.py
```

## License

[Your License Here]
