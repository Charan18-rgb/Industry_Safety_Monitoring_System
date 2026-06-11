"""Telemetry API routes."""

from datetime import timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.time import utc_now
from app.services.telemetry_service import TelemetryService
from app.schemas.telemetry import SensorResponse, TelemetryReadingResponse, LiveTelemetryResponse

from pydantic import BaseModel

class TelemetryOverrideRequest(BaseModel):
    temperature: float
    gasLevel: float
    machineFault: bool
    scenario: str = "Manual Override"

router = APIRouter(prefix="/sensors", tags=["telemetry"])

@router.post("/override")
async def override_telemetry(data: TelemetryOverrideRequest):
    """Override live sensor data (Tinkercad Sync Layer)."""
    from app.sensor_provider import sensor_provider
    sensor_provider.set_override(
        temperature=data.temperature,
        gas_level=data.gasLevel,
        machine_fault=data.machineFault,
        scenario=data.scenario
    )
    return {"status": "success", "message": f"Overridden with scenario: {data.scenario}"}


@router.get("/live", response_model=List[LiveTelemetryResponse])
async def get_live_telemetry(
    sensor_id: Optional[str] = Query(None, description="Filter by sensor ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get live telemetry data from all sensors or a specific sensor.
    """
    service = TelemetryService(db)
    
    if sensor_id:
        sensor = await service.get_sensor_by_id(sensor_id)
        if not sensor:
            raise HTTPException(status_code=404, detail="Sensor not found")
        
        reading = await service.get_latest_reading(sensor_id)
        if not reading:
            raise HTTPException(status_code=404, detail="No readings found for sensor")
        
        return [{
            "timestamp": reading.timestamp,
            "sensor_id": reading.sensor_id,
            "sensor_name": sensor.name,
            "sensor_type": sensor.sensor_type,
            "location": sensor.location,
            "gas_ppm": reading.gas_ppm,
            "temperature_c": reading.temperature_c,
            "humidity_percent": reading.humidity_percent,
            "vibration_hz": reading.vibration_hz,
            "machine_health_percent": reading.machine_health_percent,
            "environmental_risk_score": reading.environmental_risk_score,
            "safety_score": reading.safety_score,
            "anomaly_detected": reading.anomaly_detected,
            "anomaly_type": reading.anomaly_type,
        }]
    else:
        sensors = await service.get_all_sensors()
        live_data = []
        
        for sensor in sensors:
            reading = await service.get_latest_reading(sensor.sensor_id)
            if reading:
                live_data.append({
                    "timestamp": reading.timestamp,
                    "sensor_id": reading.sensor_id,
                    "sensor_name": sensor.name,
                    "sensor_type": sensor.sensor_type,
                    "location": sensor.location,
                    "gas_ppm": reading.gas_ppm,
                    "temperature_c": reading.temperature_c,
                    "humidity_percent": reading.humidity_percent,
                    "vibration_hz": reading.vibration_hz,
                    "machine_health_percent": reading.machine_health_percent,
                    "environmental_risk_score": reading.environmental_risk_score,
                    "safety_score": reading.safety_score,
                    "anomaly_detected": reading.anomaly_detected,
                    "anomaly_type": reading.anomaly_type,
                })
        
        return live_data


@router.get("/history", response_model=List[TelemetryReadingResponse])
async def get_sensor_history(
    sensor_id: str = Query(..., description="Sensor ID"),
    hours: int = Query(24, description="Hours of history to retrieve"),
    limit: int = Query(1000, description="Maximum number of readings"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get historical telemetry data for a sensor.
    """
    service = TelemetryService(db)
    
    start_time = utc_now() - timedelta(hours=hours)
    readings = await service.get_sensor_history(
        sensor_id=sensor_id,
        start_time=start_time,
        limit=limit
    )
    
    return readings


@router.get("/status", response_model=List[SensorResponse])
async def get_sensor_status(
    sensor_type: Optional[str] = Query(None, description="Filter by sensor type"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get status of all sensors.
    """
    service = TelemetryService(db)
    sensors = await service.get_all_sensors()
    
    if sensor_type:
        sensors = [s for s in sensors if s.sensor_type == sensor_type]
    
    return sensors
