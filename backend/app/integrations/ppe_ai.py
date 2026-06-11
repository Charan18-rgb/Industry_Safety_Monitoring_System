"""PPE AI integration client."""

import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class PPEAIClient:
    """Client for integrating with PPE AI service."""
    
    def __init__(self, base_url: Optional[str] = None):
        """
        Initialize PPE AI client.
        
        Args:
            base_url: Base URL for the PPE AI service
        """
        self.base_url = base_url or settings.ppe_ai_url
        self.timeout = 30.0
    
    async def detect_ppe_violation(
        self,
        image_data: bytes,
        camera_id: str,
        required_ppe: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Send image to PPE AI for violation detection.
        
        Args:
            image_data: Image bytes
            camera_id: Camera identifier
            required_ppe: List of required PPE items
            
        Returns:
            Detection result with violation status and missing PPE
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                files = {"image": ("image.jpg", image_data, "image/jpeg")}
                data = {
                    "camera_id": camera_id,
                    "required_ppe": required_ppe or ["helmet", "vest", "gloves"]
                }
                
                response = await client.post(
                    f"{self.base_url}/detect",
                    files=files,
                    data=data
                )
                response.raise_for_status()
                
                result = response.json()
                logger.info(f"PPE AI detection for camera {camera_id}: {result}")
                return result
        
        except httpx.HTTPError as e:
            logger.error(f"PPE AI HTTP error: {e}")
            return {
                "success": False,
                "error": str(e),
                "violation_detected": False,
                "missing_ppe": [],
                "confidence": 0.0
            }
        except Exception as e:
            logger.error(f"PPE AI error: {e}")
            return {
                "success": False,
                "error": str(e),
                "violation_detected": False,
                "missing_ppe": [],
                "confidence": 0.0
            }
    
    async def get_detection_history(
        self,
        camera_id: str,
        hours: int = 24
    ) -> Dict[str, Any]:
        """
        Get detection history for a camera.
        
        Args:
            camera_id: Camera identifier
            hours: Hours of history to retrieve
            
        Returns:
            Detection history
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/camera/{camera_id}/history",
                    params={"hours": hours}
                )
                response.raise_for_status()
                return response.json()
        
        except httpx.HTTPError as e:
            logger.error(f"PPE AI history error: {e}")
            return {
                "success": False,
                "error": str(e),
                "camera_id": camera_id,
                "detections": []
            }
    
    async def health_check(self) -> bool:
        """
        Check if PPE AI service is healthy.
        
        Returns:
            True if service is healthy
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception as e:
            logger.error(f"PPE AI health check failed: {e}")
            return False
