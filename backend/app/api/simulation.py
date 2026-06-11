"""Simulation API routes."""

from typing import Optional
from fastapi import APIRouter, HTTPException
from app.simulation.engine import TelemetrySimulationEngine
from app.schemas.simulation import (
    SimulationStartRequest,
    SimulationStopRequest,
    SimulationScenarioRequest,
    SimulationStatusResponse
)

router = APIRouter(prefix="/simulation", tags=["simulation"])

# Global simulation engine instance
simulation_engine = TelemetrySimulationEngine()


@router.post("/start")
async def start_simulation(request: SimulationStartRequest):
    """
    Start the telemetry simulation.
    """
    global simulation_engine
    
    if simulation_engine.running:
        raise HTTPException(status_code=400, detail="Simulation is already running")
    
    simulation_engine.running = True
    
    # Initialize default sensors if not already initialized
    default_sensors = [
        ("GAS-001", "Gas Sensor 1", "gas"),
        ("GAS-002", "Gas Sensor 2", "gas"),
        ("TEMP-001", "Temperature Sensor 1", "temperature"),
        ("TEMP-002", "Temperature Sensor 2", "temperature"),
        ("HUM-001", "Humidity Sensor 1", "humidity"),
        ("VIB-001", "Vibration Sensor 1", "vibration"),
        ("VIB-002", "Vibration Sensor 2", "vibration"),
    ]
    
    for sensor_id, name, sensor_type in default_sensors:
        if sensor_id not in simulation_engine.sensor_states:
            simulation_engine.initialize_sensor(sensor_id, sensor_type)
    
    # Set scenario if provided
    if request.scenario:
        simulation_engine.set_scenario(request.scenario, intensity=1.0)
    
    return {
        "status": "started",
        "interval": request.interval,
        "scenario": request.scenario,
        "sensors_initialized": len(simulation_engine.sensor_states)
    }


@router.post("/stop")
async def stop_simulation(request: SimulationStopRequest):
    """
    Stop the telemetry simulation.
    """
    global simulation_engine
    
    if not simulation_engine.running:
        raise HTTPException(status_code=400, detail="Simulation is not running")
    
    simulation_engine.running = False
    
    return {
        "status": "stopped",
        "sensors": len(simulation_engine.sensor_states)
    }


@router.post("/scenario")
async def set_simulation_scenario(request: SimulationScenarioRequest):
    """
    Set the simulation scenario.
    """
    global simulation_engine
    
    simulation_engine.set_scenario(
        scenario=request.scenario,
        duration_seconds=request.duration_seconds,
        intensity=request.intensity
    )
    
    return {
        "status": "scenario_set",
        "scenario": request.scenario,
        "duration_seconds": request.duration_seconds,
        "intensity": request.intensity
    }


@router.get("/status", response_model=SimulationStatusResponse)
async def get_simulation_status():
    """
    Get current simulation status.
    """
    global simulation_engine
    
    scenario_status = simulation_engine.get_scenario_status()
    
    return SimulationStatusResponse(
        running=simulation_engine.running,
        interval=1.0,
        current_scenario=scenario_status["current_scenario"],
        scenario_remaining_seconds=scenario_status["remaining_seconds"]
    )
