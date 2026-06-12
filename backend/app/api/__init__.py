"""API routes."""

from app.api.telemetry import router as telemetry_router
from app.api.simulation import router as simulation_router
from app.api.incidents import router as incidents_router
from app.api.alerts import router as alerts_router
from app.api.reports import router as reports_router
from app.api.analytics import router as analytics_router
from app.api.websocket import router as websocket_router
from app.api.helmet import router as helmet_router

__all__ = [
    "telemetry_router",
    "simulation_router",
    "incidents_router",
    "alerts_router",
    "reports_router",
    "analytics_router",
    "websocket_router",
    "helmet_router",
]
