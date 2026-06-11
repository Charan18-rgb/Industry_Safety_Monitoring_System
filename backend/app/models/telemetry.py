"""Telemetry models."""

from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.time import utc_now


class Sensor(Base):
    """Sensor model."""
    
    __tablename__ = "sensors"
    
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    sensor_type = Column(String(50), nullable=False)  # gas, temperature, humidity, vibration
    location = Column(String(100))
    status = Column(String(20), default="active")  # active, inactive, maintenance
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    # Relationships
    readings = relationship("TelemetryReading", back_populates="sensor", cascade="all, delete-orphan")


class TelemetryReading(Base):
    """Telemetry reading model."""
    
    __tablename__ = "telemetry_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), ForeignKey("sensors.sensor_id"), nullable=False)
    timestamp = Column(DateTime, default=utc_now, index=True)
    
    # Sensor values
    gas_ppm = Column(Float, nullable=True)
    temperature_c = Column(Float, nullable=True)
    humidity_percent = Column(Float, nullable=True)
    vibration_hz = Column(Float, nullable=True)
    machine_health_percent = Column(Float, nullable=True)
    environmental_risk_score = Column(Float, nullable=True)
    safety_score = Column(Float, nullable=True)
    
    # Metadata
    anomaly_detected = Column(Integer, default=0)  # 0 = normal, 1 = anomaly
    anomaly_type = Column(String(50), nullable=True)
    
    # Relationships
    sensor = relationship("Sensor", back_populates="readings")
    
    # Indexes for performance
    __table_args__ = (
        Index("idx_sensor_timestamp", "sensor_id", "timestamp"),
        Index("idx_timestamp", "timestamp"),
    )
