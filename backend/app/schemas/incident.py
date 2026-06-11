"""Incident schemas."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from app.models.incident import IncidentStatus, IncidentCategory, IncidentSeverity


class IncidentBase(BaseModel):
    """Base incident schema."""
    title: str = Field(..., description="Incident title")
    description: Optional[str] = Field(None, description="Incident description")
    category: IncidentCategory
    severity: IncidentSeverity
    location: Optional[str] = Field(None, description="Incident location")
    sensor_id: Optional[str] = Field(None, description="Related sensor ID")


class IncidentCreate(IncidentBase):
    """Schema for creating an incident."""
    pass


class IncidentUpdate(BaseModel):
    """Schema for updating an incident."""
    status: Optional[IncidentStatus] = None
    resolution_notes: Optional[str] = None
    acknowledged_by: Optional[str] = None
    resolved_by: Optional[str] = None


class IncidentResponse(IncidentBase):
    """Schema for incident response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    incident_id: str
    status: IncidentStatus
    detected_at: datetime
    acknowledged_at: Optional[datetime]
    acknowledged_by: Optional[str]
    resolved_at: Optional[datetime]
    resolved_by: Optional[str]
    closed_at: Optional[datetime]
    resolution_notes: Optional[str]


class IncidentListResponse(BaseModel):
    """Schema for incident list response."""
    total: int
    incidents: List[IncidentResponse]
    page: int
    page_size: int


class IncidentAuditResponse(BaseModel):
    """Schema for incident audit response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    incident_id: int
    action: str
    previous_status: Optional[str]
    new_status: Optional[str]
    notes: Optional[str]
    performed_by: Optional[str]
    performed_at: datetime
