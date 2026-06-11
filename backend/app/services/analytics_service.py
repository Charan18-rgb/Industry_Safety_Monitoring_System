"""Analytics service."""

from datetime import timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy import select, and_, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.analytics import AnalyticsSnapshot
from app.models.telemetry import TelemetryReading
from app.models.incident import Incident, IncidentStatus, IncidentSeverity
from app.models.alert import Alert, AlertStatus, AlertType
from app.core.time import utc_now
import uuid
import logging

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for analytics calculations and reporting."""
    
    def __init__(self, db: AsyncSession):
        """Initialize analytics service."""
        self.db = db
    
    async def calculate_risk_score(self) -> float:
        """
        Calculate overall risk score based on current metrics.
        
        Returns:
            Risk score (0-100)
        """
        # Get recent telemetry
        recent_time = utc_now() - timedelta(minutes=30)
        
        telemetry_result = await self.db.execute(
            select(
                func.avg(TelemetryReading.gas_ppm).label("avg_gas"),
                func.avg(TelemetryReading.temperature_c).label("avg_temp"),
                func.avg(TelemetryReading.vibration_hz).label("avg_vibration"),
                func.avg(TelemetryReading.machine_health_percent).label("avg_health"),
            )
            .where(TelemetryReading.timestamp >= recent_time)
        )
        
        telemetry_row = telemetry_result.one()
        
        # Get active incidents count
        incident_result = await self.db.execute(
            select(func.count(Incident.id))
            .where(Incident.status == IncidentStatus.OPEN)
        )
        open_incidents = incident_result.scalar() or 0
        
        # Get critical alerts count
        alert_result = await self.db.execute(
            select(func.count(Alert.id))
            .where(
                and_(
                    Alert.status == AlertStatus.ACTIVE,
                    Alert.alert_type == AlertType.CRITICAL
                )
            )
        )
        critical_alerts = alert_result.scalar() or 0
        
        # Calculate risk components
        gas_risk = min(100, (telemetry_row.avg_gas or 0) / 5)
        temp_risk = min(100, max(0, (telemetry_row.avg_temp or 0) - 25) / 0.75)
        vibration_risk = min(100, (telemetry_row.avg_vibration or 0) / 2)
        health_risk = max(0, 100 - (telemetry_row.avg_health or 100))
        incident_risk = min(100, open_incidents * 10)
        alert_risk = min(100, critical_alerts * 15)
        
        # Weighted average
        overall_risk = (
            gas_risk * 0.2 +
            temp_risk * 0.15 +
            vibration_risk * 0.15 +
            health_risk * 0.2 +
            incident_risk * 0.15 +
            alert_risk * 0.15
        )
        
        return round(overall_risk, 2)
    
    async def create_analytics_snapshot(self) -> AnalyticsSnapshot:
        """
        Create a snapshot of current analytics metrics.
        
        Returns:
            Created analytics snapshot
        """
        snapshot_id = f"SNAP-{uuid.uuid4().hex[:8].upper()}"
        timestamp = utc_now()
        
        # Calculate risk scores
        overall_risk = await self.calculate_risk_score()
        
        # Get telemetry averages
        recent_time = timestamp - timedelta(minutes=30)
        telemetry_result = await self.db.execute(
            select(
                func.avg(TelemetryReading.temperature_c).label("avg_temp"),
                func.avg(TelemetryReading.humidity_percent).label("avg_humidity"),
                func.avg(TelemetryReading.gas_ppm).label("avg_gas"),
                func.avg(TelemetryReading.vibration_hz).label("avg_vibration"),
                func.avg(TelemetryReading.machine_health_percent).label("avg_health"),
            )
            .where(TelemetryReading.timestamp >= recent_time)
        )
        telemetry_row = telemetry_result.one()
        
        # Get incident counts
        incident_result = await self.db.execute(
            select(
                func.count(Incident.id).label("total"),
                func.sum(case((Incident.status == IncidentStatus.OPEN, 1), else_=0)).label("open"),
                func.sum(case((Incident.severity == IncidentSeverity.CRITICAL, 1), else_=0)).label("critical")
            )
        )
        incident_row = incident_result.one()
        
        # Get alert counts
        alert_result = await self.db.execute(
            select(
                func.count(Alert.id).label("total"),
                func.sum(case((Alert.status == AlertStatus.ACTIVE, 1), else_=0)).label("active"),
                func.sum(case((Alert.alert_type == AlertType.CRITICAL, 1), else_=0)).label("critical")
            )
        )
        alert_row = alert_result.one()
        
        # Calculate equipment health metrics
        avg_machine_health = telemetry_row.avg_health or 0
        critical_equipment_count = 0
        at_risk_equipment_count = 0
        
        if avg_machine_health < 50:
            critical_equipment_count = 1
        elif avg_machine_health < 70:
            at_risk_equipment_count = 1
        
        snapshot = AnalyticsSnapshot(
            snapshot_id=snapshot_id,
            timestamp=timestamp,
            overall_risk_score=overall_risk,
            environmental_risk_score=round(overall_risk * 0.6, 2),
            equipment_risk_score=round(overall_risk * 0.3, 2),
            safety_risk_score=round(overall_risk * 0.1, 2),
            avg_machine_health=round(avg_machine_health, 2) if avg_machine_health else None,
            critical_equipment_count=critical_equipment_count,
            at_risk_equipment_count=at_risk_equipment_count,
            total_incidents=incident_row.total or 0,
            open_incidents=incident_row.open or 0,
            critical_incidents=incident_row.critical or 0,
            total_alerts=alert_row.total or 0,
            active_alerts=alert_row.active or 0,
            critical_alerts=alert_row.critical or 0,
            avg_temperature=round(telemetry_row.avg_temp, 2) if telemetry_row.avg_temp else None,
            avg_humidity=round(telemetry_row.avg_humidity, 2) if telemetry_row.avg_humidity else None,
            avg_gas_ppm=round(telemetry_row.avg_gas, 2) if telemetry_row.avg_gas else None,
            avg_vibration=round(telemetry_row.avg_vibration, 2) if telemetry_row.avg_vibration else None,
        )
        
        self.db.add(snapshot)
        await self.db.commit()
        await self.db.refresh(snapshot)
        
        logger.info(f"Created analytics snapshot {snapshot_id} with risk score {overall_risk}")
        return snapshot
    
    async def get_latest_snapshot(self) -> Optional[AnalyticsSnapshot]:
        """
        Get the latest analytics snapshot.
        
        Returns:
            Latest snapshot if found
        """
        result = await self.db.execute(
            select(AnalyticsSnapshot)
            .order_by(AnalyticsSnapshot.timestamp.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def get_trend_data(
        self,
        metric: str,
        hours: int = 24
    ) -> List[Dict[str, Any]]:
        """
        Get trend data for a specific metric.
        
        Args:
            metric: Metric name (risk_score, temperature, etc.)
            hours: Number of hours to look back
            
        Returns:
            List of trend data points
        """
        start_time = utc_now() - timedelta(hours=hours)
        
        result = await self.db.execute(
            select(AnalyticsSnapshot)
            .where(AnalyticsSnapshot.timestamp >= start_time)
            .order_by(AnalyticsSnapshot.timestamp.asc())
        )
        
        snapshots = result.scalars().all()
        
        trend_data = []
        for snapshot in snapshots:
            value = None
            if metric == "risk_score":
                value = snapshot.overall_risk_score
            elif metric == "temperature":
                value = snapshot.avg_temperature
            elif metric == "humidity":
                value = snapshot.avg_humidity
            elif metric == "gas_ppm":
                value = snapshot.avg_gas_ppm
            elif metric == "vibration":
                value = snapshot.avg_vibration
            elif metric == "machine_health":
                value = snapshot.avg_machine_health
            
            if value is not None:
                trend_data.append({
                    "timestamp": snapshot.timestamp,
                    "value": value,
                })
        
        return trend_data
    
    async def calculate_kpis(self) -> Dict[str, Any]:
        """
        Calculate current KPIs.
        
        Returns:
            Dictionary of KPIs
        """
        snapshot = await self.get_latest_snapshot()
        
        if not snapshot:
            snapshot = await self.create_analytics_snapshot()
        
        kpis = {
            "overall_risk_score": {
                "value": snapshot.overall_risk_score,
                "unit": "score",
                "target": 20.0,
                "status": "critical" if snapshot.overall_risk_score > 50 else "warning" if snapshot.overall_risk_score > 30 else "good",
            },
            "machine_health": {
                "value": snapshot.avg_machine_health or 0,
                "unit": "%",
                "target": 90.0,
                "status": "critical" if (snapshot.avg_machine_health or 0) < 50 else "warning" if (snapshot.avg_machine_health or 0) < 70 else "good",
            },
            "open_incidents": {
                "value": snapshot.open_incidents,
                "unit": "count",
                "target": 0,
                "status": "critical" if snapshot.open_incidents > 5 else "warning" if snapshot.open_incidents > 2 else "good",
            },
            "active_alerts": {
                "value": snapshot.active_alerts,
                "unit": "count",
                "target": 0,
                "status": "critical" if snapshot.active_alerts > 10 else "warning" if snapshot.active_alerts > 5 else "good",
            },
            "avg_temperature": {
                "value": snapshot.avg_temperature or 0,
                "unit": "°C",
                "target": 35.0,
                "status": "critical" if (snapshot.avg_temperature or 0) > 60 else "warning" if (snapshot.avg_temperature or 0) > 45 else "good",
            },
            "avg_gas_ppm": {
                "value": snapshot.avg_gas_ppm or 0,
                "unit": "ppm",
                "target": 50.0,
                "status": "critical" if (snapshot.avg_gas_ppm or 0) > 150 else "warning" if (snapshot.avg_gas_ppm or 0) > 100 else "good",
            },
        }
        
        return kpis
