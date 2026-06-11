"""Incident service with audit logging."""

from typing import List, Optional
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.incident import Incident, IncidentAudit, IncidentStatus, IncidentCategory, IncidentSeverity
from app.schemas.incident import IncidentCreate, IncidentUpdate
from app.core.time import utc_now
import uuid
import logging

logger = logging.getLogger(__name__)


class IncidentService:
    """Service for managing incidents with audit trail."""
    
    def __init__(self, db: AsyncSession):
        """Initialize incident service."""
        self.db = db
    
    async def create_incident(self, incident_data: IncidentCreate) -> Incident:
        """
        Create a new incident.
        
        Args:
            incident_data: Incident creation data
            
        Returns:
            Created incident
        """
        incident_id = f"INC-{uuid.uuid4().hex[:8].upper()}"
        
        incident = Incident(
            incident_id=incident_id,
            title=incident_data.title,
            description=incident_data.description,
            category=incident_data.category,
            severity=incident_data.severity,
            status=IncidentStatus.OPEN,
            location=incident_data.location,
            sensor_id=incident_data.sensor_id,
            detected_at=utc_now(),
        )
        
        self.db.add(incident)
        await self.db.commit()
        await self.db.refresh(incident)
        
        # Create audit log
        await self._create_audit_log(
            incident.id,
            "created",
            None,
            IncidentStatus.OPEN.value,
            "Incident created",
            "system"
        )
        
        logger.info(f"Created incident {incident_id} of category {incident_data.category}")
        return incident
    
    async def get_incident_by_id(self, incident_id: str) -> Optional[Incident]:
        """
        Get incident by ID.
        
        Args:
            incident_id: Incident identifier
            
        Returns:
            Incident if found
        """
        result = await self.db.execute(
            select(Incident).where(Incident.incident_id == incident_id)
        )
        return result.scalar_one_or_none()
    
    async def list_incidents(
        self,
        status: Optional[IncidentStatus] = None,
        category: Optional[IncidentCategory] = None,
        severity: Optional[IncidentSeverity] = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[Incident], int]:
        """
        List incidents with filters.
        
        Args:
            status: Optional status filter
            category: Optional category filter
            severity: Optional severity filter
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            Tuple of (incidents, total count)
        """
        query = select(Incident)
        
        filters = []
        if status:
            filters.append(Incident.status == status)
        if category:
            filters.append(Incident.category == category)
        if severity:
            filters.append(Incident.severity == severity)
        
        if filters:
            query = query.where(and_(*filters))
        
        # Get total count
        count_query = select(Incident.__table__.c.id)
        if filters:
            count_query = count_query.where(and_(*filters))
        
        count_result = await self.db.execute(count_query)
        total = len(count_result.all())
        
        # Get paginated results
        query = query.order_by(Incident.detected_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        incidents = result.scalars().all()
        
        return incidents, total
    
    async def acknowledge_incident(
        self,
        incident_id: str,
        acknowledged_by: str
    ) -> Optional[Incident]:
        """
        Acknowledge an incident.
        
        Args:
            incident_id: Incident identifier
            acknowledged_by: User acknowledging the incident
            
        Returns:
            Updated incident if found
        """
        incident = await self.get_incident_by_id(incident_id)
        if not incident:
            return None
        
        previous_status = incident.status
        
        incident.status = IncidentStatus.ACKNOWLEDGED
        incident.acknowledged_at = utc_now()
        incident.acknowledged_by = acknowledged_by
        
        await self.db.commit()
        await self.db.refresh(incident)
        
        # Create audit log
        await self._create_audit_log(
            incident.id,
            "acknowledged",
            previous_status.value,
            IncidentStatus.ACKNOWLEDGED.value,
            f"Incident acknowledged by {acknowledged_by}",
            acknowledged_by
        )
        
        logger.info(f"Incident {incident_id} acknowledged by {acknowledged_by}")
        return incident
    
    async def resolve_incident(
        self,
        incident_id: str,
        resolved_by: str,
        resolution_notes: Optional[str] = None
    ) -> Optional[Incident]:
        """
        Resolve an incident.
        
        Args:
            incident_id: Incident identifier
            resolved_by: User resolving the incident
            resolution_notes: Optional resolution notes
            
        Returns:
            Updated incident if found
        """
        incident = await self.get_incident_by_id(incident_id)
        if not incident:
            return None
        
        previous_status = incident.status
        
        incident.status = IncidentStatus.RESOLVED
        incident.resolved_at = utc_now()
        incident.resolved_by = resolved_by
        incident.resolution_notes = resolution_notes
        
        await self.db.commit()
        await self.db.refresh(incident)
        
        # Create audit log
        await self._create_audit_log(
            incident.id,
            "resolved",
            previous_status.value,
            IncidentStatus.RESOLVED.value,
            resolution_notes or "Incident resolved",
            resolved_by
        )
        
        logger.info(f"Incident {incident_id} resolved by {resolved_by}")
        return incident
    
    async def close_incident(
        self,
        incident_id: str,
        closed_by: str
    ) -> Optional[Incident]:
        """
        Close an incident.
        
        Args:
            incident_id: Incident identifier
            closed_by: User closing the incident
            
        Returns:
            Updated incident if found
        """
        incident = await self.get_incident_by_id(incident_id)
        if not incident:
            return None
        
        previous_status = incident.status
        
        incident.status = IncidentStatus.CLOSED
        incident.closed_at = utc_now()
        
        await self.db.commit()
        await self.db.refresh(incident)
        
        # Create audit log
        await self._create_audit_log(
            incident.id,
            "closed",
            previous_status.value,
            IncidentStatus.CLOSED.value,
            f"Incident closed by {closed_by}",
            closed_by
        )
        
        logger.info(f"Incident {incident_id} closed by {closed_by}")
        return incident
    
    async def get_incident_audit_log(self, incident_id: str) -> List[IncidentAudit]:
        """
        Get audit log for an incident.
        
        Args:
            incident_id: Incident identifier
            
        Returns:
            List of audit log entries
        """
        incident = await self.get_incident_by_id(incident_id)
        if not incident:
            return []
        
        result = await self.db.execute(
            select(IncidentAudit)
            .where(IncidentAudit.incident_id == incident.id)
            .order_by(IncidentAudit.performed_at.desc())
        )
        return result.scalars().all()
    
    async def _create_audit_log(
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
            Created audit log entry
        """
        audit_log = IncidentAudit(
            incident_id=incident_db_id,
            action=action,
            previous_status=previous_status,
            new_status=new_status,
            notes=notes,
            performed_by=performed_by,
            performed_at=utc_now(),
        )
        
        self.db.add(audit_log)
        await self.db.commit()
        await self.db.refresh(audit_log)
        
        return audit_log
