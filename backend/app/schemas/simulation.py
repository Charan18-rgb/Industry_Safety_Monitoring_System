"""Simulation schemas."""

from pydantic import BaseModel, Field
from typing import Optional, Literal


class SimulationStartRequest(BaseModel):
    """Schema for starting simulation."""
    interval: float = Field(default=1.0, description="Simulation interval in seconds")
    scenario: Optional[str] = Field(None, description="Simulation scenario: normal, drift, spike, anomaly, critical")


class SimulationStopRequest(BaseModel):
    """Schema for stopping simulation."""
    pass


class SimulationScenarioRequest(BaseModel):
    """Schema for setting simulation scenario."""
    scenario: Literal["normal", "drift", "spike", "anomaly", "critical"] = Field(..., description="Simulation scenario")
    duration_seconds: Optional[int] = Field(None, description="Duration in seconds")
    intensity: float = Field(default=1.0, description="Scenario intensity (0.0 to 2.0)")


class SimulationStatusResponse(BaseModel):
    """Schema for simulation status response."""
    running: bool
    interval: float
    current_scenario: Optional[str]
    scenario_remaining_seconds: Optional[int]
