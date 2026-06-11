"""Alerts API routes."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.alerts.service import AlertService
from app.schemas.alert import AlertCreate, AlertResponse, AlertListResponse
from app.models.alert import AlertType, AlertStatus

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.post("/create", response_model=AlertResponse)
async def create_alert(
    alert_data: AlertCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new alert.
    """
    service = AlertService(db)
    alert = await service.create_alert(alert_data)
    return alert


@router.get("/active", response_model=AlertListResponse)
async def get_active_alerts(
    limit: int = Query(100, ge=1, le=500, description="Maximum number of alerts"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all active alerts.
    """
    service = AlertService(db)
    alerts = await service.get_active_alerts(limit=limit)
    
    return AlertListResponse(
        total=len(alerts),
        alerts=alerts
    )


@router.get("/type/{alert_type}", response_model=AlertListResponse)
async def get_alerts_by_type(
    alert_type: AlertType,
    status: Optional[AlertStatus] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of alerts"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get alerts by type.
    """
    service = AlertService(db)
    alerts = await service.get_alerts_by_type(alert_type, status, limit)
    
    return AlertListResponse(
        total=len(alerts),
        alerts=alerts
    )


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific alert by ID.
    """
    service = AlertService(db)
    alert = await service.get_alert_by_id(alert_id)
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return alert


@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: str,
    acknowledged_by: str = Query(..., description="User acknowledging the alert"),
    db: AsyncSession = Depends(get_db)
):
    """
    Acknowledge an alert.
    """
    service = AlertService(db)
    alert = await service.acknowledge_alert(alert_id, acknowledged_by)
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return alert


@router.post("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: str,
    resolved_by: str = Query(..., description="User resolving the alert"),
    resolution_notes: Optional[str] = Query(None, description="Resolution notes"),
    db: AsyncSession = Depends(get_db)
):
    """
    Resolve an alert.
    """
    service = AlertService(db)
    alert = await service.resolve_alert(alert_id, resolved_by, resolution_notes)
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return alert
