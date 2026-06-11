# AEGIS-AI Master Platform Architecture

## Overview
AEGIS-AI (Autonomous Enterprise Grade Industrial Safety Intelligence System) is a distributed multi-AI engineering pipeline designed for enterprise industrial safety. This repository (`AEGIS-ANTI-GRAVITY-MASTER`) contains the **MASTER PRODUCT SHELL** and **CORE APPLICATION FRAMEWORK**.

This system is modular, API-first, and designed to orchestrate services built by other specialized AI agents (e.g., CV models, predictive ML models).

## Architectural Principles
1. **API-First Microservices:** Frontend connects to the backend shell via REST/WebSockets. The backend shell acts as an API gateway for future external microservices.
2. **Pluggable AI Modules:** Computer vision, predictive intelligence, and telemetry inference are kept as external services to prevent bloating the core shell.
3. **Real-time First:** Relies on WebSockets for real-time telemetry and immediate alert propagation.
4. **State Management:** Utilizes `zustand` for predictable, fast client-side state across telemetry, alerts, and incident tracking.
5. **Component-Driven UI:** Built using standard enterprise design tokens, `Tailwind CSS`, and `framer-motion` for a fluid command center UX.

## Tech Stack
### Frontend
- **Framework:** Next.js (App Router) + React
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS Variables (AEGIS cyber-industrial theme)
- **Animation:** Framer Motion
- **Charting:** Recharts
- **State Management:** Zustand, TanStack React Query
- **Data Fetching:** Axios

### Backend Shell
- **Framework:** FastAPI (Python 3.11+)
- **Transport:** HTTP REST + WebSockets
- **Database:** SQLite (Demo mode, SQLAlchemy/Alembic ready for PostgreSQL migration)

## Directory Structure
```
AEGIS-ANTI-GRAVITY-MASTER/
├── frontend/                 # Next.js Application
│   ├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── components/           # Reusable UI Components
│   ├── hooks/                # Custom React Hooks (e.g., useTelemetrySocket)
│   ├── lib/                  # Utilities, API client, Mock Data
│   ├── store/                # Zustand global state
│   └── types/                # TypeScript Interfaces
├── backend-shell/            # FastAPI Backend Gateway
│   └── main.py               # Application entrypoint & WebSocket manager
├── docs/                     # Architectural Documentation
├── shared/                   # Shared schema/contracts across microservices
└── (others)                  # API services, configs, utilities
```

## Module Definitions

### 1. Authentication & RBAC
Roles supported: `admin`, `safety_officer`, `plant_manager`, `operator`. Controls access to specific dashboard panels and incident mutation capabilities.

### 2. Main Command Center
Aggregates live telemetry, active incidents, and compliance metrics into a single unified dashboard using Recharts for visualization and Framer Motion for entrance animations.

### 3. Incident Management
A robust tracking system for localized hazards. Supports creation, acknowledgment, investigation, and resolution states. Includes a detail-slideout panel.

### 4. Telemetry Monitoring
High-frequency sensor data visualization. Designed to connect via WebSockets to `backend-shell` to render sparklines and live gauges.

### 5. Digital Twin Operations View
A spatial 2D interactive map of the industrial zones, overlaying active sensor readings, risk scores, and worker counts.

### 6. Alert Orchestration
A tiered alerting system (`info`, `warning`, `critical`, `emergency`). Includes a global alert banner and an emergency takeover modal for critical shutdowns.

### 7. Settings & Configuration
Management of global thresholds, notification channels, and system retention rules.

### 8. Reporting Engine
Frontend scaffolding for requesting and downloading compliance, maintenance, and incident summaries.

## Integration Contract (API Hooks)
The backend shell exposes the following REST endpoints to bridge with upcoming external agents:
- `GET /api/helmet/status`, `POST /api/helmet/analyze` (AEGIS-CODEX-AI)
- `GET /api/ppe/status` (AEGIS-CODEX-AI)
- `GET /api/predictive/risk`, `GET /api/predictive/failure` (AEGIS-WINDSURF-RAPID)

*(Full API surface documented in `/api/docs` via Swagger UI when backend is running).*
