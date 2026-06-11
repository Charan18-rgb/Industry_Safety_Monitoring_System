"""Report models."""

from sqlalchemy import Column, Integer, String, DateTime, Text, Enum as SQLEnum, Index
from app.core.database import Base
from app.core.time import utc_now
import enum


class ReportType(str, enum.Enum):
    """Report type enum."""
    INCIDENT = "incident"
    TELEMETRY = "telemetry"
    COMPLIANCE = "compliance"
    MAINTENANCE = "maintenance"
    ANALYTICS = "analytics"


class ReportStatus(str, enum.Enum):
    """Report status enum."""
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class Report(Base):
    """Report model."""
    
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    report_type = Column(SQLEnum(ReportType), nullable=False)
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.PENDING, nullable=False)
    
    # Parameters
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    filters = Column(Text, nullable=True)  # JSON string
    
    # Output
    file_path = Column(String(500), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=utc_now, nullable=False)
    generated_at = Column(DateTime, nullable=True)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    
    # Metadata
    generated_by = Column(String(100), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index("idx_report_status", "status"),
        Index("idx_report_type", "report_type"),
        Index("idx_report_created_at", "created_at"),
    )
