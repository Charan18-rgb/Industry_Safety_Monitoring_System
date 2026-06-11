"""Helmet AI integration client."""

import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class HelmetAIClient:
    """Client for integrating with Helmet AI service."""
    
    def __init__(self, base_url: Optional[str] = None):
        """
        Initialize Helmet AI client.
        
        Args:
            base_url: Base URL for the Helmet AI service
        """
        self.base_url = base_url or settings.helmet_ai_url
        self.timeout = 30.0
    
    async def detect_helmet_violation(
        self,
        image_data: bytes,
        camera_id: str
    ) -> Dict[str, Any]:
        """
        Send image to Helmet AI for violation detection.
        
        Args:
            image_data: Image bytes
            camera_id: Camera identifier
            
        Returns:
            Detection result with violation status and confidence
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                files = {"image": ("image.jpg", image_data, "image/jpeg")}
                data = {"camera_id": camera_id}
                
                response = await client.post(
                    f"{self.base_url}/detect",
                    files=files,
                    data=data
                )
                response.raise_for_status()
                
                result = response.json()
                logger.info(f"Helmet AI detection for camera {camera_id}: {result}")
                return result
        
        except httpx.HTTPError as e:
            logger.error(f"Helmet AI HTTP error: {e}")
            return {
                "success": False,
                "error": str(e),
                "violation_detected": False,
                "confidence": 0.0
            }
        except Exception as e:
            logger.error(f"Helmet AI error: {e}")
            return {
                "success": False,
                "error": str(e),
                "violation_detected": False,
                "confidence": 0.0
            }
    
    async def get_camera_status(self, camera_id: str) -> Dict[str, Any]:
        """
        Get status of a camera from Helmet AI service.
        
        Args:
            camera_id: Camera identifier
            
        Returns:
            Camera status information
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/camera/{camera_id}/status"
                )
                response.raise_for_status()
                return response.json()
        
        except httpx.HTTPError as e:
            logger.error(f"Helmet AI camera status error: {e}")
            return {
                "success": False,
                "error": str(e),
                "camera_id": camera_id,
                "status": "unknown"
            }
    
    async def health_check(self) -> bool:
        """
        Check if Helmet AI service is healthy.
        
        Returns:
            True if service is healthy
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Helmet AI health check failed: {e}")
            return False
