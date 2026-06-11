"""Predictive AI integration client."""

import httpx
from typing import Dict, Any, Optional, List
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class PredictiveAIClient:
    """Client for integrating with Predictive AI service."""
    
    def __init__(self, base_url: Optional[str] = None):
        """
        Initialize Predictive AI client.
        
        Args:
            base_url: Base URL for the Predictive AI service
        """
        self.base_url = base_url or settings.predictive_ai_url
        self.timeout = 30.0
    
    async def predict_equipment_failure(
        self,
        equipment_id: str,
        telemetry_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Send telemetry data to Predictive AI for failure prediction.
        
        Args:
            equipment_id: Equipment identifier
            telemetry_data: Dictionary of telemetry metrics
            
        Returns:
            Prediction result with failure probability and timeline
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                payload = {
                    "equipment_id": equipment_id,
                    "telemetry_data": telemetry_data
                }
                
                response = await client.post(
                    f"{self.base_url}/predict/failure",
                    json=payload
                )
                response.raise_for_status()
                
                result = response.json()
                logger.info(f"Predictive AI prediction for equipment {equipment_id}: {result}")
                return result
        
        except httpx.HTTPError as e:
            logger.error(f"Predictive AI HTTP error: {e}")
            return {
                "success": False,
                "error": str(e),
                "failure_probability": 0.0,
                "predicted_failure_days": None,
                "confidence": 0.0
            }
        except Exception as e:
            logger.error(f"Predictive AI error: {e}")
            return {
                "success": False,
                "error": str(e),
                "failure_probability": 0.0,
                "predicted_failure_days": None,
                "confidence": 0.0
            }
    
    async def predict_maintenance_schedule(
        self,
        equipment_ids: List[str]
    ) -> Dict[str, Any]:
        """
        Get predicted maintenance schedule for multiple equipment.
        
        Args:
            equipment_ids: List of equipment identifiers
            
        Returns:
            Maintenance schedule predictions
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                payload = {"equipment_ids": equipment_ids}
                
                response = await client.post(
                    f"{self.base_url}/predict/maintenance",
                    json=payload
                )
                response.raise_for_status()
                
                result = response.json()
                logger.info(f"Predictive AI maintenance schedule for {len(equipment_ids)} equipment")
                return result
        
        except httpx.HTTPError as e:
            logger.error(f"Predictive AI maintenance error: {e}")
            return {
                "success": False,
                "error": str(e),
                "schedule": []
            }
        except Exception as e:
            logger.error(f"Predictive AI error: {e}")
            return {
                "success": False,
                "error": str(e),
                "schedule": []
            }
    
    async def get_anomaly_detection(
        self,
        sensor_id: str,
        time_window_hours: int = 24
    ) -> Dict[str, Any]:
        """
        Get anomaly detection results for a sensor.
        
        Args:
            sensor_id: Sensor identifier
            time_window_hours: Time window in hours
            
        Returns:
            Anomaly detection results
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/anomaly/{sensor_id}",
                    params={"time_window_hours": time_window_hours}
                )
                response.raise_for_status()
                return response.json()
        
        except httpx.HTTPError as e:
            logger.error(f"Predictive AI anomaly detection error: {e}")
            return {
                "success": False,
                "error": str(e),
                "sensor_id": sensor_id,
                "anomalies": []
            }
    
    async def health_check(self) -> bool:
        """
        Check if Predictive AI service is healthy.
        
        Returns:
            True if service is healthy
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Predictive AI health check failed: {e}")
            return False
