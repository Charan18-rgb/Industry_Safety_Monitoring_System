"""Analytics API routes."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import AnalyticsResponse, TrendResponse, KPIDashboardResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/risk", response_model=AnalyticsResponse)
async def get_risk_analytics(
    db: AsyncSession = Depends(get_db)
):
    """
    Get current risk analytics.
    """
    service = AnalyticsService(db)
    
    # Create or get latest snapshot
    snapshot = await service.get_latest_snapshot()
    if not snapshot:
        snapshot = await service.create_analytics_snapshot()
    
    return AnalyticsResponse(
        snapshot_id=snapshot.snapshot_id,
        timestamp=snapshot.timestamp,
        overall_risk_score=snapshot.overall_risk_score,
        environmental_risk_score=snapshot.environmental_risk_score,
        equipment_risk_score=snapshot.equipment_risk_score,
        safety_risk_score=snapshot.safety_risk_score,
        avg_machine_health=snapshot.avg_machine_health,
        critical_equipment_count=snapshot.critical_equipment_count,
        at_risk_equipment_count=snapshot.at_risk_equipment_count,
        total_incidents=snapshot.total_incidents,
        open_incidents=snapshot.open_incidents,
        critical_incidents=snapshot.critical_incidents,
        total_alerts=snapshot.total_alerts,
        active_alerts=snapshot.active_alerts,
        critical_alerts=snapshot.critical_alerts,
        avg_temperature=snapshot.avg_temperature,
        avg_humidity=snapshot.avg_humidity,
        avg_gas_ppm=snapshot.avg_gas_ppm,
        avg_vibration=snapshot.avg_vibration,
        additional_metrics=snapshot.additional_metrics
    )


@router.get("/trends", response_model=list[TrendResponse])
async def get_trend_analytics(
    metric: str = Query(..., description="Metric name (risk_score, temperature, humidity, gas_ppm, vibration, machine_health)"),
    hours: int = Query(24, ge=1, le=168, description="Hours of trend data"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get trend analytics for a specific metric.
    """
    service = AnalyticsService(db)
    
    valid_metrics = ["risk_score", "temperature", "humidity", "gas_ppm", "vibration", "machine_health"]
    if metric not in valid_metrics:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid metric. Valid metrics are: {', '.join(valid_metrics)}"
        )
    
    trend_data = await service.get_trend_data(metric, hours)
    
    # Calculate trend direction
    if len(trend_data) >= 2:
        first_value = trend_data[0]["value"]
        last_value = trend_data[-1]["value"]
        change_percent = ((last_value - first_value) / first_value) * 100 if first_value != 0 else 0
        
        if change_percent > 5:
            trend_direction = "increasing"
        elif change_percent < -5:
            trend_direction = "decreasing"
        else:
            trend_direction = "stable"
    else:
        trend_direction = "stable"
        change_percent = 0
    
    return [TrendResponse(
        metric_name=metric,
        trend=trend_data,
        trend_direction=trend_direction,
        change_percentage=round(change_percent, 2) if change_percent else None
    )]


@router.get("/kpis", response_model=KPIDashboardResponse)
async def get_kpi_dashboard(
    db: AsyncSession = Depends(get_db)
):
    """
    Get KPI dashboard data.
    """
    service = AnalyticsService(db)
    kpis = await service.calculate_kpis()
    
    kpi_list = []
    for kpi_name, kpi_data in kpis.items():
        kpi_list.append({
            "kpi_name": kpi_name,
            "value": kpi_data["value"],
            "unit": kpi_data.get("unit"),
            "target": kpi_data.get("target"),
            "status": kpi_data["status"],
            "trend": "stable",  # Would need historical data for actual trend
            "change_percentage": None
        })
    
    return KPIDashboardResponse(
        timestamp=service.db.bind.url if hasattr(service.db, 'bind') else None,
        kpis=kpi_list
    )
