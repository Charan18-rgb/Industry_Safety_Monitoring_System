"""Telemetry repository."""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.telemetry import TelemetryReading, Sensor
from app.schemas.telemetry import TelemetryReadingCreate, SensorCreate
from app.repositories.base import BaseRepository

class TelemetryRepository(BaseRepository[TelemetryReading, TelemetryReadingCreate, None]):
    """Repository for telemetry readings."""
    
    def __init__(self, db: AsyncSession):
        """Initialize telemetry repository."""
        super().__init__(TelemetryReading, db)
    
    async def get_by_sensor_id(
        self,
        sensor_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[TelemetryReading]:
        """
        Get readings by sensor ID.
        
        Args:
            sensor_id: Sensor identifier
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of telemetry readings
        """
        result = await self.db.execute(
            select(TelemetryReading)
            .where(TelemetryReading.sensor_id == sensor_id)
            .order_by(TelemetryReading.timestamp.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_by_date_range(
        self,
        sensor_id: str,
        start_time: datetime,
        end_time: datetime,
        limit: int = 1000
    ) -> List[TelemetryReading]:
        """
        Get readings by date range.
        
        Args:
            sensor_id: Sensor identifier
            start_time: Start datetime
            end_time: End datetime
            limit: Maximum number of records
            
        Returns:
            List of telemetry readings
        """
        result = await self.db.execute(
            select(TelemetryReading)
            .where(
                and_(
                    TelemetryReading.sensor_id == sensor_id,
                    TelemetryReading.timestamp >= start_time,
                    TelemetryReading.timestamp <= end_time
                )
            )
            .order_by(TelemetryReading.timestamp.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_latest_by_sensor(self, sensor_id: str) -> Optional[TelemetryReading]:
        """
        Get latest reading for a sensor.
        
        Args:
            sensor_id: Sensor identifier
            
        Returns:
            Latest reading if found
        """
        result = await self.db.execute(
            select(TelemetryReading)
            .where(TelemetryReading.sensor_id == sensor_id)
            .order_by(TelemetryReading.timestamp.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def get_anomalies(
        self,
        start_time: Optional[datetime] = None,
        limit: int = 100
    ) -> List[TelemetryReading]:
        """
        Get readings with anomalies.
        
        Args:
            start_time: Optional start time
            limit: Maximum number of records
            
        Returns:
            List of anomaly readings
        """
        query = select(TelemetryReading).where(TelemetryReading.anomaly_detected == 1)
        
        if start_time:
            query = query.where(TelemetryReading.timestamp >= start_time)
        
        query = query.order_by(TelemetryReading.timestamp.desc()).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()


class SensorRepository(BaseRepository[Sensor, SensorCreate, None]):
    """Repository for sensors."""
    
    def __init__(self, db: AsyncSession):
        """Initialize sensor repository."""
        super().__init__(Sensor, db)
    
    async def get_by_sensor_id(self, sensor_id: str) -> Optional[Sensor]:
        """
        Get sensor by sensor ID.
        
        Args:
            sensor_id: Sensor identifier
            
        Returns:
            Sensor if found
        """
        result = await self.db.execute(
            select(Sensor).where(Sensor.sensor_id == sensor_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_type(self, sensor_type: str) -> List[Sensor]:
        """
        Get sensors by type.
        
        Args:
            sensor_type: Sensor type
            
        Returns:
            List of sensors
        """
        result = await self.db.execute(
            select(Sensor).where(Sensor.sensor_type == sensor_type)
        )
        return result.scalars().all()
    
    async def get_active_sensors(self) -> List[Sensor]:
        """
        Get all active sensors.
        
        Returns:
            List of active sensors
        """
        result = await self.db.execute(
            select(Sensor).where(Sensor.status == "active")
        )
        return result.scalars().all()
