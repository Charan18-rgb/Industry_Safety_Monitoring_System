"""Alert schemas."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from app.models.alert import AlertType, AlertStatus


class AlertBase(BaseModel):
    """Base alert schema."""
    title: str = Field(..., description="Alert title")
    message: str = Field(..., description="Alert message")
    alert_type: AlertType
    source: Optional[str] = Field(None, description="Alert source: sensor, ai, system")
    source_id: Optional[str] = Field(None, description="Source identifier")
    incident_id: Optional[str] = Field(None, description="Related incident ID")


class AlertCreate(AlertBase):
    """Schema for creating an alert."""
    pass


class AlertResponse(AlertBase):
    """Schema for alert response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    alert_id: str
    status: AlertStatus
    escalation_level: int
    escalated_at: Optional[datetime]
    auto_resolve_at: Optional[datetime]
    created_at: datetime
    acknowledged_at: Optional[datetime]
    acknowledged_by: Optional[str]
    resolved_at: Optional[datetime]
    resolution_notes: Optional[str]
    notification_sent: bool
    notification_channels: Optional[str]


class AlertListResponse(BaseModel):
    """Schema for alert list response."""
    total: int
    alerts: List[AlertResponse]
