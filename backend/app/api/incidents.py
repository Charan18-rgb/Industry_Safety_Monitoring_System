"""Incidents API routes."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.incident_service import IncidentService
from app.schemas.incident import (
    IncidentCreate,
    IncidentUpdate,
    IncidentResponse,
    IncidentListResponse,
    IncidentAuditResponse
)
from app.models.incident import IncidentStatus, IncidentCategory, IncidentSeverity

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("", response_model=IncidentListResponse)
async def list_incidents(
    status: Optional[IncidentStatus] = Query(None, description="Filter by status"),
    category: Optional[IncidentCategory] = Query(None, description="Filter by category"),
    severity: Optional[IncidentSeverity] = Query(None, description="Filter by severity"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Page size"),
    db: AsyncSession = Depends(get_db)
):
    """
    List incidents with optional filters.
    """
    service = IncidentService(db)
    skip = (page - 1) * page_size
    
    incidents, total = await service.list_incidents(
        status=status,
        category=category,
        severity=severity,
        skip=skip,
        limit=page_size
    )
    
    return IncidentListResponse(
        total=total,
        incidents=incidents,
        page=page,
        page_size=page_size
    )


@router.post("", response_model=IncidentResponse)
async def create_incident(
    incident_data: IncidentCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new incident.
    """
    service = IncidentService(db)
    incident = await service.create_incident(incident_data)
    return incident


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific incident by ID.
    """
    service = IncidentService(db)
    incident = await service.get_incident_by_id(incident_id)
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return incident


@router.patch("/{incident_id}/acknowledge", response_model=IncidentResponse)
async def acknowledge_incident(
    incident_id: str,
    acknowledged_by: str = Query(..., description="User acknowledging the incident"),
    db: AsyncSession = Depends(get_db)
):
    """
    Acknowledge an incident.
    """
    service = IncidentService(db)
    incident = await service.acknowledge_incident(incident_id, acknowledged_by)
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return incident


@router.patch("/{incident_id}/resolve", response_model=IncidentResponse)
async def resolve_incident(
    incident_id: str,
    update_data: IncidentUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Resolve an incident.
    """
    service = IncidentService(db)
    incident = await service.resolve_incident(
        incident_id,
        update_data.resolved_by or "system",
        update_data.resolution_notes
    )
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return incident


@router.get("/{incident_id}/audit", response_model=list[IncidentAuditResponse])
async def get_incident_audit_log(
    incident_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get audit log for an incident.
    """
    service = IncidentService(db)
    
    # Check if incident exists
    incident = await service.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    audit_log = await service.get_incident_audit_log(incident_id)
    return audit_log
