"""Report schemas."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from app.models.report import ReportType, ReportStatus


class ReportBase(BaseModel):
    """Base report schema."""
    title: str = Field(..., description="Report title")
    description: Optional[str] = Field(None, description="Report description")
    report_type: ReportType
    start_date: Optional[datetime] = Field(None, description="Report start date")
    end_date: Optional[datetime] = Field(None, description="Report end date")
    filters: Optional[str] = Field(None, description="JSON filters")


class ReportCreate(ReportBase):
    """Schema for creating a report."""
    pass


class ReportResponse(ReportBase):
    """Schema for report response."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    report_id: str
    status: ReportStatus
    file_path: Optional[str]
    file_size_bytes: Optional[int]
    created_at: datetime
    generated_at: Optional[datetime]
    error_message: Optional[str]
    generated_by: Optional[str]


class ReportListResponse(BaseModel):
    """Schema for report list response."""
    total: int
    reports: List[ReportResponse]
