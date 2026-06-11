# AEGIS-AI Backend

**Autonomous Enterprise Grade Industrial Safety Intelligence System**

A production-grade backend platform for industrial safety intelligence, providing live telemetry, incident management, alerts, reporting, analytics, and AI integration endpoints.

## Features

- **Telemetry Simulation Engine**: Realistic industrial telemetry simulation with multiple scenarios
- **Real-time Streaming**: WebSocket-based telemetry push to multiple clients
- **Incident Management**: Complete CRUD operations with audit trail
- **Alert Engine**: Escalation logic with auto-resolution
- **Reporting Engine**: PDF report generation for incidents, telemetry, and compliance
- **Analytics Engine**: Risk scores, trend analysis, and KPI dashboards
- **AI Integration**: Middleware clients for Helmet AI, PPE AI, and Predictive AI

## Tech Stack

- Python 3.11+
- FastAPI
- SQLite with SQLAlchemy (async)
- Pydantic
- WebSockets
- APScheduler
- Pandas & NumPy
- ReportLab
- pytest
- httpx

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd AEGIS-WINDSURF-BACKEND

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

```bash
# Development mode
python -m app.main

# Or using uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Access API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
AEGIS-WINDSURF-BACKEND/
├── app/
│   ├── api/              # API routes
│   ├── core/             # Configuration and database
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── websocket/        # WebSocket manager
│   ├── simulation/       # Telemetry simulation
│   ├── integrations/     # AI integration clients
│   ├── alerts/           # Alert engine
│   ├── reports/          # Report generation
│   ├── analytics/        # Analytics engine
│   ├── utils/            # Utilities
│   └── main.py           # Application entry point
├── tests/                # Test suite
├── docs/                 # Documentation
├── requirements.txt      # Dependencies
└── .env.example         # Environment template
```

## API Endpoints

### Telemetry
- `GET /api/sensors/live` - Get live telemetry
- `GET /api/sensors/history` - Get sensor history
- `GET /api/sensors/status` - Get sensor status

### Simulation
- `POST /api/simulation/start` - Start simulation
- `POST /api/simulation/stop` - Stop simulation
- `POST /api/simulation/scenario` - Set scenario
- `GET /api/simulation/status` - Get status

### Incidents
- `GET /api/incidents` - List incidents
- `POST /api/incidents` - Create incident
- `PATCH /api/incidents/{id}/acknowledge` - Acknowledge
- `PATCH /api/incidents/{id}/resolve` - Resolve

### Alerts
- `POST /api/alerts/create` - Create alert
- `GET /api/alerts/active` - Get active alerts
- `POST /api/alerts/{id}/acknowledge` - Acknowledge
- `POST /api/alerts/{id}/resolve` - Resolve

### Reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports` - List reports
- `GET /api/reports/{id}/download` - Download PDF

### Analytics
- `GET /api/analytics/risk` - Get risk analytics
- `GET /api/analytics/trends` - Get trends
- `GET /api/analytics/kpis` - Get KPIs

### WebSocket
- `WS /api/ws/telemetry` - Real-time telemetry
- `WS /api/ws/alerts` - Real-time alerts
- `WS /api/ws/incidents` - Real-time incidents

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api.py
```

## Documentation

See the [docs](docs/) directory for detailed documentation:
- [README](docs/README.md) - Full documentation
- [API Reference](docs/API.md) - Complete API documentation

## License

[Your License Here]
