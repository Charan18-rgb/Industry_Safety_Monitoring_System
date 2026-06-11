"""Telemetry schemas."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class SensorBase(BaseModel):
    """Base sensor schema."""
    sensor_id: str = Field(..., description="Unique sensor identifier")
    name: str = Field(..., description="Sensor name")
    sensor_type: str = Field(..., description="Sensor type: gas, temperature, humidity, vibration")
    location: Optional[str] = Field(None, description="Sensor location")
    status: str = Field(default="active", description="Sensor status: active, inactive, maintenance")


class SensorCreate(SensorBase):
    """Schema for creating a sensor."""
    pass


class SensorResponse(SensorBase):
    """Schema for sensor response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class TelemetryReadingBase(BaseModel):
    """Base telemetry reading schema."""
    sensor_id: str
    gas_ppm: Optional[float] = None
    temperature_c: Optional[float] = None
    humidity_percent: Optional[float] = None
    vibration_hz: Optional[float] = None
    machine_health_percent: Optional[float] = None
    environmental_risk_score: Optional[float] = None
    safety_score: Optional[float] = None
    anomaly_detected: int = Field(default=0, description="0 = normal, 1 = anomaly")
    anomaly_type: Optional[str] = None


class TelemetryReadingCreate(TelemetryReadingBase):
    """Schema for creating a telemetry reading."""
    pass


class TelemetryReadingResponse(TelemetryReadingBase):
    """Schema for telemetry reading response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime


class LiveTelemetryResponse(BaseModel):
    """Schema for live telemetry response."""
    timestamp: datetime
    sensor_id: str
    sensor_name: str
    sensor_type: str
    location: Optional[str]
    gas_ppm: Optional[float]
    temperature_c: Optional[float]
    humidity_percent: Optional[float]
    vibration_hz: Optional[float]
    machine_health_percent: Optional[float]
    environmental_risk_score: Optional[float]
    safety_score: Optional[float]
    anomaly_detected: int
    anomaly_type: Optional[str]
