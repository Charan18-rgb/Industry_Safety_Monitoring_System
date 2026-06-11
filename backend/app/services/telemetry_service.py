"""Telemetry service."""

from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.telemetry import TelemetryReading, Sensor
from app.schemas.telemetry import TelemetryReadingCreate
from app.core.time import utc_now
import logging

logger = logging.getLogger(__name__)


class TelemetryService:
    """Service for managing telemetry data."""
    
    def __init__(self, db: AsyncSession):
        """Initialize telemetry service."""
        self.db = db
    
    async def create_reading(self, reading_data: TelemetryReadingCreate) -> TelemetryReading:
        """
        Create a telemetry reading.
        
        Args:
            reading_data: Telemetry reading data
            
        Returns:
            Created reading
        """
        reading = TelemetryReading(**reading_data.model_dump())
        self.db.add(reading)
        await self.db.commit()
        await self.db.refresh(reading)
        return reading
    
    async def get_latest_reading(self, sensor_id: str) -> Optional[TelemetryReading]:
        """
        Get the latest reading for a sensor.
        
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
    
    async def get_sensor_history(
        self,
        sensor_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 1000
    ) -> List[TelemetryReading]:
        """
        Get historical readings for a sensor.
        
        Args:
            sensor_id: Sensor identifier
            start_time: Optional start time
            end_time: Optional end time
            limit: Maximum number of readings
            
        Returns:
            List of readings
        """
        query = select(TelemetryReading).where(TelemetryReading.sensor_id == sensor_id)
        
        if start_time:
            query = query.where(TelemetryReading.timestamp >= start_time)
        if end_time:
            query = query.where(TelemetryReading.timestamp <= end_time)
        
        query = query.order_by(TelemetryReading.timestamp.desc()).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_all_sensors(self) -> List[Sensor]:
        """
        Get all sensors.
        
        Returns:
            List of sensors
        """
        result = await self.db.execute(select(Sensor))
        return result.scalars().all()
    
    async def get_sensor_by_id(self, sensor_id: str) -> Optional[Sensor]:
        """
        Get sensor by ID.
        
        Args:
            sensor_id: Sensor identifier
            
        Returns:
            Sensor if found
        """
        result = await self.db.execute(
            select(Sensor).where(Sensor.sensor_id == sensor_id)
        )
        return result.scalar_one_or_none()
    
    async def create_sensor(
        self,
        sensor_id: str,
        name: str,
        sensor_type: str,
        location: Optional[str] = None
    ) -> Sensor:
        """
        Create a new sensor.
        
        Args:
            sensor_id: Sensor identifier
            name: Sensor name
            sensor_type: Sensor type
            location: Optional location
            
        Returns:
            Created sensor
        """
        sensor = Sensor(
            sensor_id=sensor_id,
            name=name,
            sensor_type=sensor_type,
            location=location,
            status="active"
        )
        self.db.add(sensor)
        await self.db.commit()
        await self.db.refresh(sensor)
        return sensor
    
    async def get_anomaly_readings(
        self,
        start_time: Optional[datetime] = None,
        limit: int = 100
    ) -> List[TelemetryReading]:
        """
        Get readings with anomalies detected.
        
        Args:
            start_time: Optional start time
            limit: Maximum number of readings
            
        Returns:
            List of anomaly readings
        """
        if not start_time:
            start_time = utc_now() - timedelta(hours=24)
        
        result = await self.db.execute(
            select(TelemetryReading)
            .where(
                and_(
                    TelemetryReading.anomaly_detected == 1,
                    TelemetryReading.timestamp >= start_time
                )
            )
            .order_by(TelemetryReading.timestamp.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_telemetry_summary(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> dict:
        """
        Get telemetry summary statistics.
        
        Args:
            start_time: Optional start time
            end_time: Optional end time
            
        Returns:
            Summary statistics dictionary
        """
        if not start_time:
            start_time = utc_now() - timedelta(hours=1)
        if not end_time:
            end_time = utc_now()
        
        result = await self.db.execute(
            select(
                func.avg(TelemetryReading.temperature_c).label("avg_temp"),
                func.avg(TelemetryReading.humidity_percent).label("avg_humidity"),
                func.avg(TelemetryReading.gas_ppm).label("avg_gas"),
                func.avg(TelemetryReading.vibration_hz).label("avg_vibration"),
                func.avg(TelemetryReading.machine_health_percent).label("avg_health"),
                func.count(TelemetryReading.id).label("total_readings"),
                func.sum(
                    func.case(
                        (TelemetryReading.anomaly_detected == 1, 1),
                        else_=0
                    )
                ).label("anomaly_count")
            )
            .where(
                and_(
                    TelemetryReading.timestamp >= start_time,
                    TelemetryReading.timestamp <= end_time
                )
            )
        )
        
        row = result.one()
        
        return {
            "avg_temperature": float(row.avg_temp) if row.avg_temp else None,
            "avg_humidity": float(row.avg_humidity) if row.avg_humidity else None,
            "avg_gas_ppm": float(row.avg_gas) if row.avg_gas else None,
            "avg_vibration": float(row.avg_vibration) if row.avg_vibration else None,
            "avg_machine_health": float(row.avg_health) if row.avg_health else None,
            "total_readings": row.total_readings or 0,
            "anomaly_count": row.anomaly_count or 0,
            "start_time": start_time,
            "end_time": end_time,
        }
