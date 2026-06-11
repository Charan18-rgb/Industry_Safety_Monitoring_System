"""Alert repository."""

from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.alert import Alert, AlertType, AlertStatus
from app.schemas.alert import AlertCreate
from app.repositories.base import BaseRepository

class AlertRepository(BaseRepository[Alert, AlertCreate, None]):
    """Repository for alerts."""
    
    def __init__(self, db: AsyncSession):
        """Initialize alert repository."""
        super().__init__(Alert, db)
    
    async def get_by_alert_id(self, alert_id: str) -> Optional[Alert]:
        """
        Get alert by alert ID.
        
        Args:
            alert_id: Alert identifier
            
        Returns:
            Alert if found
        """
        result = await self.db.execute(
            select(Alert).where(Alert.alert_id == alert_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_status(
        self,
        status: AlertStatus,
        skip: int = 0,
        limit: int = 100
    ) -> List[Alert]:
        """
        Get alerts by status.
        
        Args:
            status: Alert status
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of alerts
        """
        result = await self.db.execute(
            select(Alert)
            .where(Alert.status == status)
            .order_by(Alert.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_type(
        self,
        alert_type: AlertType,
        status: Optional[AlertStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Alert]:
        """
        Get alerts by type.
        
        Args:
            alert_type: Alert type
            status: Optional status filter
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of alerts
        """
        query = select(Alert).where(Alert.alert_type == alert_type)
        
        if status:
            query = query.where(Alert.status == status)
        
        query = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_active_alerts(self, limit: int = 100) -> List[Alert]:
        """
        Get all active alerts.
        
        Args:
            limit: Maximum number of records
            
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
    
    async def get_critical_alerts(self, limit: int = 100) -> List[Alert]:
        """
        Get all critical alerts.
        
        Args:
            limit: Maximum number of records
            
        Returns:
            List of critical alerts
        """
        result = await self.db.execute(
            select(Alert)
            .where(
                and_(
                    Alert.alert_type == AlertType.CRITICAL,
                    Alert.status == AlertStatus.ACTIVE
                )
            )
            .order_by(Alert.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_escalated_alerts(self, limit: int = 100) -> List[Alert]:
        """
        Get all escalated alerts.
        
        Args:
            limit: Maximum number of records
            
        Returns:
            List of escalated alerts
        """
        result = await self.db.execute(
            select(Alert)
            .where(Alert.status == AlertStatus.ESCALATED)
            .order_by(Alert.escalated_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_incident_id(self, incident_id: str) -> List[Alert]:
        """
        Get alerts by incident ID.
        
        Args:
            incident_id: Incident identifier
            
        Returns:
            List of alerts
        """
        result = await self.db.execute(
            select(Alert)
            .where(Alert.incident_id == incident_id)
            .order_by(Alert.created_at.desc())
        )
        return result.scalars().all()
