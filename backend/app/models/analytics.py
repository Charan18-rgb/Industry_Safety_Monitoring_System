"""Analytics models."""

from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, Index
from app.core.database import Base
from app.core.time import utc_now


class AnalyticsSnapshot(Base):
    """Analytics snapshot model for storing calculated metrics."""
    
    __tablename__ = "analytics_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    snapshot_id = Column(String(50), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=utc_now, nullable=False, index=True)
    
    # Risk metrics
    overall_risk_score = Column(Float, nullable=False)
    environmental_risk_score = Column(Float, nullable=True)
    equipment_risk_score = Column(Float, nullable=True)
    safety_risk_score = Column(Float, nullable=True)
    
    # Equipment health
    avg_machine_health = Column(Float, nullable=True)
    critical_equipment_count = Column(Integer, default=0)
    at_risk_equipment_count = Column(Integer, default=0)
    
    # Incident metrics
    total_incidents = Column(Integer, default=0)
    open_incidents = Column(Integer, default=0)
    critical_incidents = Column(Integer, default=0)
    
    # Alert metrics
    total_alerts = Column(Integer, default=0)
    active_alerts = Column(Integer, default=0)
    critical_alerts = Column(Integer, default=0)
    
    # Telemetry summaries
    avg_temperature = Column(Float, nullable=True)
    avg_humidity = Column(Float, nullable=True)
    avg_gas_ppm = Column(Float, nullable=True)
    avg_vibration = Column(Float, nullable=True)
    
    # Additional metrics as JSON
    additional_metrics = Column(JSON, nullable=True)
    
    # Indexes
    __table_args__ = (
        Index("idx_analytics_timestamp", "timestamp"),
        Index("idx_analytics_risk", "overall_risk_score"),
    )
