"""Incident repository."""

from typing import List, Optional
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.incident import Incident, IncidentAudit, IncidentStatus, IncidentCategory, IncidentSeverity
from app.schemas.incident import IncidentCreate
from app.repositories.base import BaseRepository

class IncidentRepository(BaseRepository[Incident, IncidentCreate, None]):
    """Repository for incidents."""
    
    def __init__(self, db: AsyncSession):
        """Initialize incident repository."""
        super().__init__(Incident, db)
    
    async def get_by_incident_id(self, incident_id: str) -> Optional[Incident]:
        """
        Get incident by incident ID.
        
        Args:
            incident_id: Incident identifier
            
        Returns:
            Incident if found
        """
        result = await self.db.execute(
            select(Incident).where(Incident.incident_id == incident_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_status(
        self,
        status: IncidentStatus,
        skip: int = 0,
        limit: int = 100
    ) -> List[Incident]:
        """
        Get incidents by status.
        
        Args:
            status: Incident status
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of incidents
        """
        result = await self.db.execute(
            select(Incident)
            .where(Incident.status == status)
            .order_by(Incident.detected_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_category(
        self,
        category: IncidentCategory,
        skip: int = 0,
        limit: int = 100
    ) -> List[Incident]:
        """
        Get incidents by category.
        
        Args:
            category: Incident category
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of incidents
        """
        result = await self.db.execute(
            select(Incident)
            .where(Incident.category == category)
            .order_by(Incident.detected_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_severity(
        self,
        severity: IncidentSeverity,
        skip: int = 0,
        limit: int = 100
    ) -> List[Incident]:
        """
        Get incidents by severity.
        
        Args:
            severity: Incident severity
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of incidents
        """
        result = await self.db.execute(
            select(Incident)
            .where(Incident.severity == severity)
            .order_by(Incident.detected_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_open_incidents(self, limit: int = 100) -> List[Incident]:
        """
        Get all open incidents.
        
        Args:
            limit: Maximum number of records
            
        Returns:
            List of open incidents
        """
        result = await self.db.execute(
            select(Incident)
            .where(Incident.status == IncidentStatus.OPEN)
            .order_by(Incident.detected_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_critical_incidents(self, limit: int = 100) -> List[Incident]:
        """
        Get all critical incidents.
        
        Args:
            limit: Maximum number of records
            
        Returns:
            List of critical incidents
        """
        result = await self.db.execute(
            select(Incident)
            .where(
                and_(
                    Incident.severity == IncidentSeverity.CRITICAL,
                    Incident.status != IncidentStatus.CLOSED
                )
            )
            .order_by(Incident.detected_at.desc())
            .limit(limit)
        )
        return result.scalars().all()


class IncidentAuditRepository:
    """Repository for incident audit logs."""
    
    def __init__(self, db: AsyncSession):
        """Initialize incident audit repository."""
        self.db = db
    
    async def get_by_incident_id(
        self,
        incident_db_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[IncidentAudit]:
        """
        Get audit logs for an incident.
        
        Args:
            incident_db_id: Incident database ID
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of audit logs
        """
        result = await self.db.execute(
            select(IncidentAudit)
            .where(IncidentAudit.incident_id == incident_db_id)
            .order_by(IncidentAudit.performed_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def create(
        self,
        incident_db_id: int,
        action: str,
        previous_status: Optional[str],
        new_status: Optional[str],
        notes: Optional[str],
        performed_by: str
    ) -> IncidentAudit:
        """
        Create an audit log entry.
        
        Args:
            incident_db_id: Incident database ID
            action: Action performed
            previous_status: Previous status
            new_status: New status
            notes: Optional notes
            performed_by: User who performed the action
            
        Returns:
            Created audit log
        """
        audit_log = IncidentAudit(
            incident_id=incident_db_id,
            action=action,
            previous_status=previous_status,
            new_status=new_status,
            notes=notes,
            performed_by=performed_by
        )
        
        self.db.add(audit_log)
        await self.db.commit()
        await self.db.refresh(audit_log)
        
        return audit_log
