"""Main FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
from app.core.config import settings
from app.core.database import init_db
from app.websocket.manager import manager
from app.sensor_provider import sensor_provider, sensor_loop
from app.api import (
    telemetry_router,
    simulation_router,
    incidents_router,
    alerts_router,
    reports_router,
    analytics_router,
    websocket_router,
    helmet_router,
)
from app.utils.logging import setup_logging
import logging

logger = logging.getLogger(__name__)

# Global scheduler for background tasks
scheduler = AsyncIOScheduler()
sensor_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting AEGIS-AI Backend...")
    setup_logging()
    
    # Initialize database
    await init_db()
    logger.info("Database initialized")
    
    # Start scheduler
    scheduler.start()
    logger.info("Scheduler started")
    
    # Start Tinkercad simulation loop
    global sensor_task
    sensor_task = asyncio.create_task(sensor_loop())
    logger.info("Sensor simulator loop started")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AEGIS-AI Backend...")
    if sensor_task:
        sensor_task.cancel()
    scheduler.shutdown()
    logger.info("Scheduler stopped")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Autonomous Enterprise Grade Industrial Safety Intelligence System Backend",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routers
app.include_router(telemetry_router, prefix=settings.api_prefix)
app.include_router(simulation_router, prefix=settings.api_prefix)
app.include_router(incidents_router, prefix=settings.api_prefix)
app.include_router(alerts_router, prefix=settings.api_prefix)
app.include_router(reports_router, prefix=settings.api_prefix)
app.include_router(analytics_router, prefix=settings.api_prefix)
app.include_router(websocket_router)
app.include_router(helmet_router, prefix=settings.api_prefix)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "environment": settings.environment,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.app_version,
    }


@app.get("/sensor-data")
async def get_sensor_data():
    """Get latest simulated Tinkercad sensor values."""
    return sensor_provider.generate_readings()


@app.websocket("/ws")
async def websocket_tinkercad(websocket: WebSocket):
    """
    WebSocket endpoint for Tinkercad sensor updates.
    Sends updates every second.
    """
    await manager.connect(websocket, "frontend-client")
    try:
        while True:
            # Just keep connection alive.
            # The broadcast is handled by sensor_loop running in the background.
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
    )
