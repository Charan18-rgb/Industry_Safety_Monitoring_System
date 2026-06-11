"""Incident models."""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.time import utc_now
import enum


class IncidentStatus(str, enum.Enum):
    """Incident status enum."""
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    CLOSED = "closed"


class IncidentCategory(str, enum.Enum):
    """Incident category enum."""
    GAS_LEAK = "gas_leak"
    OVERHEATING = "overheating"
    VIBRATION_ANOMALY = "vibration_anomaly"
    PPE_VIOLATION = "ppe_violation"
    HELMET_VIOLATION = "helmet_violation"
    EMERGENCY_SHUTDOWN = "emergency_shutdown"
    PREDICTIVE_WARNING = "predictive_warning"


class IncidentSeverity(str, enum.Enum):
    """Incident severity enum."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Incident(Base):
    """Incident model."""
    
    __tablename__ = "incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(SQLEnum(IncidentCategory), nullable=False)
    severity = Column(SQLEnum(IncidentSeverity), nullable=False)
    status = Column(SQLEnum(IncidentStatus), default=IncidentStatus.OPEN, nullable=False)
    
    # Location and context
    location = Column(String(100), nullable=True)
    sensor_id = Column(String(50), nullable=True)
    
    # Timestamps
    detected_at = Column(DateTime, default=utc_now, nullable=False)
    acknowledged_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(100), nullable=True)
    closed_at = Column(DateTime, nullable=True)
    
    # Resolution
    resolution_notes = Column(Text, nullable=True)
    
    # Relationships
    audit_logs = relationship("IncidentAudit", back_populates="incident", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("idx_incident_status", "status"),
        Index("idx_incident_category", "category"),
        Index("idx_incident_severity", "severity"),
        Index("idx_detected_at", "detected_at"),
    )


class IncidentAudit(Base):
    """Incident audit log model."""
    
    __tablename__ = "incident_audits"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    action = Column(String(50), nullable=False)  # created, acknowledged, resolved, closed, updated
    previous_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=True)
    notes = Column(Text, nullable=True)
    performed_by = Column(String(100), nullable=True)
    performed_at = Column(DateTime, default=utc_now, nullable=False)
    
    # Relationships
    incident = relationship("Incident", back_populates="audit_logs")
    
    # Indexes
    __table_args__ = (
        Index("idx_audit_incident", "incident_id"),
        Index("idx_audit_performed_at", "performed_at"),
    )
