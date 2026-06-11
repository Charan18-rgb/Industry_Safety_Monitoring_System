"""Alert models."""

from sqlalchemy import Column, Integer, String, DateTime, Text, Enum as SQLEnum, Boolean, Index
from app.core.database import Base
from app.core.time import utc_now
import enum


class AlertType(str, enum.Enum):
    """Alert type enum."""
    CRITICAL = "critical"
    WARNING = "warning"
    EMERGENCY = "emergency"
    INFO = "info"


class AlertStatus(str, enum.Enum):
    """Alert status enum."""
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    ESCALATED = "escalated"
    RESOLVED = "resolved"


class Alert(Base):
    """Alert model."""
    
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    alert_type = Column(SQLEnum(AlertType), nullable=False)
    status = Column(SQLEnum(AlertStatus), default=AlertStatus.ACTIVE, nullable=False)
    
    # Context
    source = Column(String(100), nullable=True)  # sensor, ai, system
    source_id = Column(String(100), nullable=True)
    incident_id = Column(String(50), nullable=True)
    
    # Escalation
    escalation_level = Column(Integer, default=0)
    escalated_at = Column(DateTime, nullable=True)
    auto_resolve_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=utc_now, nullable=False)
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    # Resolution
    resolution_notes = Column(Text, nullable=True)
    
    # Notification tracking
    notification_sent = Column(Boolean, default=False)
    notification_channels = Column(String(200), nullable=True)  # comma-separated
    
    # Indexes
    __table_args__ = (
        Index("idx_alert_status", "status"),
        Index("idx_alert_type", "alert_type"),
        Index("idx_alert_created_at", "created_at"),
        Index("idx_alert_source", "source"),
    )
