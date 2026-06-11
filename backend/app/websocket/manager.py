"""WebSocket connection manager for real-time telemetry streaming."""

import json
import asyncio
from typing import Dict, Set, Optional
from fastapi import WebSocket, WebSocketDisconnect
from app.core.time import utc_now
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """WebSocket connection manager for broadcasting telemetry to multiple clients."""
    
    def __init__(self):
        """Initialize connection manager."""
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.client_metadata: Dict[WebSocket, Dict] = {}
        self.heartbeat_interval = 30
    
    async def connect(self, websocket: WebSocket, client_id: str) -> None:
        """
        Connect a new WebSocket client.
        
        Args:
            websocket: WebSocket connection
            client_id: Unique client identifier
        """
        await websocket.accept()
        
        if client_id not in self.active_connections:
            self.active_connections[client_id] = set()
        
        self.active_connections[client_id].add(websocket)
        self.client_metadata[websocket] = {
            "client_id": client_id,
            "connected_at": utc_now(),
            "last_heartbeat": utc_now(),
        }
        
        logger.info(f"Client {client_id} connected. Total connections: {self.get_connection_count()}")
        
        # Send welcome message
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "client_id": client_id,
            "timestamp": utc_now().isoformat(),
        })
    
    async def disconnect(self, websocket: WebSocket) -> None:
        """
        Disconnect a WebSocket client.
        
        Args:
            websocket: WebSocket connection
        """
        if websocket in self.client_metadata:
            client_id = self.client_metadata[websocket]["client_id"]
            
            if client_id in self.active_connections:
                self.active_connections[client_id].discard(websocket)
                if not self.active_connections[client_id]:
                    del self.active_connections[client_id]
            
            del self.client_metadata[websocket]
            logger.info(f"Client {client_id} disconnected. Total connections: {self.get_connection_count()}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket) -> None:
        """
        Send a message to a specific client.
        
        Args:
            message: Message dictionary
            websocket: WebSocket connection
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message to client: {e}")
            await self.disconnect(websocket)
    
    async def broadcast(self, message: dict, client_id: Optional[str] = None) -> None:
        """
        Broadcast a message to all connected clients or a specific client.
        
        Args:
            message: Message dictionary
            client_id: Optional specific client ID to send to
        """
        if client_id:
            # Send to specific client
            if client_id in self.active_connections:
                disconnected = []
                for connection in self.active_connections[client_id]:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                        logger.error(f"Error broadcasting to client {client_id}: {e}")
                        disconnected.append(connection)
                
                # Clean up disconnected clients
                for connection in disconnected:
                    await self.disconnect(connection)
        else:
            # Broadcast to all clients
            disconnected = []
            for client_connections in self.active_connections.values():
                for connection in client_connections:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                        logger.error(f"Error broadcasting: {e}")
                        disconnected.append(connection)
            
            # Clean up disconnected clients
            for connection in disconnected:
                await self.disconnect(connection)
    
    async def broadcast_telemetry(self, telemetry_data: dict) -> None:
        """
        Broadcast telemetry data to all connected clients.
        
        Args:
            telemetry_data: Telemetry data dictionary
        """
        message = {
            "type": "telemetry",
            "data": telemetry_data,
            "timestamp": utc_now().isoformat(),
        }
        await self.broadcast(message)
    
    async def broadcast_alert(self, alert_data: dict) -> None:
        """
        Broadcast alert to all connected clients.
        
        Args:
            alert_data: Alert data dictionary
        """
        message = {
            "type": "alert",
            "data": alert_data,
            "timestamp": utc_now().isoformat(),
        }
        await self.broadcast(message)
    
    async def broadcast_incident(self, incident_data: dict) -> None:
        """
        Broadcast incident to all connected clients.
        
        Args:
            incident_data: Incident data dictionary
        """
        message = {
            "type": "incident",
            "data": incident_data,
            "timestamp": utc_now().isoformat(),
        }
        await self.broadcast(message)
    
    async def start_heartbeat(self) -> None:
        """Start heartbeat task to check for stale connections."""
        while True:
            await asyncio.sleep(self.heartbeat_interval)
            await self.check_stale_connections()
    
    async def check_stale_connections(self) -> None:
        """Check and remove stale connections."""
        now = utc_now()
        stale_threshold = self.heartbeat_interval * 2
        
        stale_connections = []
        for websocket, metadata in self.client_metadata.items():
            last_heartbeat = metadata["last_heartbeat"]
            if (now - last_heartbeat).total_seconds() > stale_threshold:
                stale_connections.append(websocket)
        
        for connection in stale_connections:
            logger.warning(f"Removing stale connection for client {self.client_metadata[connection]['client_id']}")
            await self.disconnect(connection)
    
    def get_connection_count(self) -> int:
        """
        Get total number of active connections.
        
        Returns:
            Total connection count
        """
        return sum(len(connections) for connections in self.active_connections.values())
    
    def get_connected_clients(self) -> list:
        """
        Get list of connected client IDs.
        
        Returns:
            List of client IDs
        """
        return list(self.active_connections.keys())


# Global connection manager instance
manager = ConnectionManager()
