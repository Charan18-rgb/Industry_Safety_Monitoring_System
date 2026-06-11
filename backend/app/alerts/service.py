"""Alert service with escalation logic."""

from datetime import timedelta
from typing import List, Optional
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.alert import Alert, AlertType, AlertStatus
from app.schemas.alert import AlertCreate, AlertResponse
from app.core.config import settings
from app.core.time import utc_now
import uuid
import logging

logger = logging.getLogger(__name__)


class AlertService:
    """Service for managing alerts with escalation logic."""
    
    def __init__(self, db: AsyncSession):
        """Initialize alert service."""
        self.db = db
    
    async def create_alert(self, alert_data: AlertCreate) -> Alert:
        """
        Create a new alert.
        
        Args:
            alert_data: Alert creation data
            
        Returns:
            Created alert
        """
        alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
        
        # Set auto-resolve time based on alert type
        auto_resolve_hours = settings.alert_auto_resolve_hours
        if alert_data.alert_type == AlertType.EMERGENCY:
            auto_resolve_hours = 1
        elif alert_data.alert_type == AlertType.CRITICAL:
            auto_resolve_hours = 4
        elif alert_data.alert_type == AlertType.WARNING:
            auto_resolve_hours = 12
        
        auto_resolve_at = utc_now() + timedelta(hours=auto_resolve_hours)
        
        alert = Alert(
            alert_id=alert_id,
            title=alert_data.title,
            message=alert_data.message,
            alert_type=alert_data.alert_type,
            status=AlertStatus.ACTIVE,
            source=alert_data.source,
            source_id=alert_data.source_id,
            incident_id=alert_data.incident_id,
            auto_resolve_at=auto_resolve_at,
            escalation_level=0,
        )
        
        self.db.add(alert)
        await self.db.commit()
        await self.db.refresh(alert)
        
        logger.info(f"Created alert {alert_id} of type {alert_data.alert_type}")
        return alert
    
    async def get_alert_by_id(self, alert_id: str) -> Optional[Alert]:
        """
        Get alert by ID.
        
        Args:
            alert_id: Alert identifier
            
        Returns:
            Alert if found
        """
        result = await self.db.execute(
            select(Alert).where(Alert.alert_id == alert_id)
        )
        return result.scalar_one_or_none()
    
    async def get_active_alerts(self, limit: int = 100) -> List[Alert]:
        """
        Get all active alerts.
        
        Args:
            limit: Maximum number of alerts to return
            
        Returns:
            List of active alerts
        """
        result = await self.db.execute(
            select(Alert)
            .where(Alert.status == AlertStatus.ACTIVE)
            .order_by(Alert.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_alerts_by_type(
        self,
        alert_type: AlertType,
        status: Optional[AlertStatus] = None,
        limit: int = 100
    ) -> List[Alert]:
        """
        Get alerts by type.
        
        Args:
            alert_type: Alert type filter
            status: Optional status filter
            limit: Maximum number of alerts
            
        Returns:
            List of alerts
        """
        query = select(Alert).where(Alert.alert_type == alert_type)
        
        if status:
            query = query.where(Alert.status == status)
        
        query = query.order_by(Alert.created_at.desc()).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def acknowledge_alert(
        self,
        alert_id: str,
        acknowledged_by: str
    ) -> Optional[Alert]:
        """
        Acknowledge an alert.
        
        Args:
            alert_id: Alert identifier
            acknowledged_by: User acknowledging the alert
            
        Returns:
            Updated alert if found
        """
        alert = await self.get_alert_by_id(alert_id)
        if not alert:
            return None
        
        alert.status = AlertStatus.ACKNOWLEDGED
        alert.acknowledged_at = utc_now()
        alert.acknowledged_by = acknowledged_by
        
        await self.db.commit()
        await self.db.refresh(alert)
        
        logger.info(f"Alert {alert_id} acknowledged by {acknowledged_by}")
        return alert
    
    async def resolve_alert(
        self,
        alert_id: str,
        resolved_by: str,
        resolution_notes: Optional[str] = None
    ) -> Optional[Alert]:
        """
        Resolve an alert.
        
        Args:
            alert_id: Alert identifier
            resolved_by: User resolving the alert
            resolution_notes: Optional resolution notes
            
        Returns:
            Updated alert if found
        """
        alert = await self.get_alert_by_id(alert_id)
        if not alert:
            return None
        
        alert.status = AlertStatus.RESOLVED
        alert.resolved_at = utc_now()
        alert.resolved_by = resolved_by
        alert.resolution_notes = resolution_notes
        
        await self.db.commit()
        await self.db.refresh(alert)
        
        logger.info(f"Alert {alert_id} resolved by {resolved_by}")
        return alert
    
    async def escalate_alert(self, alert_id: str) -> Optional[Alert]:
        """
        Escalate an alert to the next level.
        
        Args:
            alert_id: Alert identifier
            
        Returns:
            Updated alert if found
        """
        alert = await self.get_alert_by_id(alert_id)
        if not alert or alert.status != AlertStatus.ACTIVE:
            return None
        
        # Increment escalation level
        alert.escalation_level += 1
        alert.escalated_at = utc_now()
        alert.status = AlertStatus.ESCALATED
        
        await self.db.commit()
        await self.db.refresh(alert)
        
        logger.warning(f"Alert {alert_id} escalated to level {alert.escalation_level}")
        return alert
    
    async def check_auto_resolve(self) -> List[Alert]:
        """
        Check for alerts that should be auto-resolved.
        
        Returns:
            List of auto-resolved alerts
        """
        now = utc_now()
        result = await self.db.execute(
            select(Alert)
            .where(
                and_(
                    Alert.status == AlertStatus.ACTIVE,
                    Alert.auto_resolve_at <= now
                )
            )
        )
        alerts = result.scalars().all()
        
        resolved_alerts = []
        for alert in alerts:
            alert.status = AlertStatus.RESOLVED
            alert.resolved_at = now
            alert.resolved_by = "system"
            alert.resolution_notes = "Auto-resolved after timeout"
            resolved_alerts.append(alert)
        
        if resolved_alerts:
            await self.db.commit()
            logger.info(f"Auto-resolved {len(resolved_alerts)} alerts")
        
        return resolved_alerts
    
    async def check_escalation(self) -> List[Alert]:
        """
        Check for alerts that should be escalated.
        
        Returns:
            List of escalated alerts
        """
        escalation_threshold = utc_now() - timedelta(
            minutes=settings.alert_escalation_minutes
        )
        
        result = await self.db.execute(
            select(Alert)
            .where(
                and_(
                    Alert.status == AlertStatus.ACTIVE,
                    Alert.created_at <= escalation_threshold,
                    Alert.escalation_level < 3
                )
            )
        )
        alerts = result.scalars().all()
        
        escalated_alerts = []
        for alert in alerts:
            await self.escalate_alert(alert.alert_id)
            escalated_alerts.append(alert)
        
        return escalated_alerts
    
    async def mark_notification_sent(
        self,
        alert_id: str,
        channels: str
    ) -> Optional[Alert]:
        """
        Mark alert as having notification sent.
        
        Args:
            alert_id: Alert identifier
            channels: Comma-separated notification channels
            
        Returns:
            Updated alert if found
        """
        alert = await self.get_alert_by_id(alert_id)
        if not alert:
            return None
        
        alert.notification_sent = True
        alert.notification_channels = channels
        
        await self.db.commit()
        await self.db.refresh(alert)
        
        return alert
