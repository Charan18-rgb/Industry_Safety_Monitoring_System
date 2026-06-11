"""WebSocket API routes."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.websocket.manager import manager

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/telemetry")
async def websocket_telemetry(
    websocket: WebSocket,
    client_id: str = Query(..., description="Unique client identifier")
):
    """
    WebSocket endpoint for real-time telemetry updates.
    """
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            # Keep connection alive and wait for messages
            data = await websocket.receive_text()
            
            # Echo back or handle client messages
            await manager.send_personal_message(
                {"type": "echo", "message": data},
                websocket
            )
    
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await manager.disconnect(websocket)


@router.websocket("/alerts")
async def websocket_alerts(
    websocket: WebSocket,
    client_id: str = Query(..., description="Unique client identifier")
):
    """
    WebSocket endpoint for real-time alert updates.
    """
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(
                {"type": "echo", "message": data},
                websocket
            )
    
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await manager.disconnect(websocket)


@router.websocket("/incidents")
async def websocket_incidents(
    websocket: WebSocket,
    client_id: str = Query(..., description="Unique client identifier")
):
    """
    WebSocket endpoint for real-time incident updates.
    """
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(
                {"type": "echo", "message": data},
                websocket
            )
    
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await manager.disconnect(websocket)
