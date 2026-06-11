"""Simulation scenarios for telemetry generation."""

import random
import numpy as np
from typing import Literal, Optional
from enum import Enum
from app.core.time import utc_now


class ScenarioType(str, Enum):
    """Simulation scenario types."""
    NORMAL = "normal"
    DRIFT = "drift"
    SPIKE = "spike"
    ANOMALY = "anomaly"
    CRITICAL = "critical"


class SimulationScenario:
    """Simulation scenario manager."""
    
    def __init__(self):
        """Initialize simulation scenario."""
        self.current_scenario = ScenarioType.NORMAL
        self.scenario_start_time = None
        self.duration_seconds = None
        self.intensity = 1.0
        self.drift_offset = 0.0
        self.spike_active = False
        self.spike_duration = 0
        self.spike_counter = 0
    
    def set_scenario(
        self,
        scenario: ScenarioType,
        duration_seconds: Optional[int] = None,
        intensity: float = 1.0
    ) -> None:
        """
        Set the current simulation scenario.
        
        Args:
            scenario: Scenario type
            duration_seconds: Duration in seconds (None for indefinite)
            intensity: Scenario intensity (0.0 to 2.0)
        """
        self.current_scenario = scenario
        self.scenario_start_time = utc_now()
        self.duration_seconds = duration_seconds
        self.intensity = max(0.0, min(2.0, intensity))
        
        # Reset scenario-specific state
        self.drift_offset = 0.0
        self.spike_active = False
        self.spike_duration = 0
        self.spike_counter = 0
        
        if scenario == ScenarioType.SPIKE:
            self.spike_active = True
            self.spike_duration = random.randint(5, 15)
    
    def is_scenario_expired(self) -> bool:
        """Check if current scenario has expired."""
        if self.duration_seconds is None:
            return False
        
        if self.scenario_start_time is None:
            return True
        
        elapsed = (utc_now() - self.scenario_start_time).total_seconds()
        return elapsed >= self.duration_seconds
    
    def get_scenario_multiplier(self, metric: str) -> float:
        """
        Get scenario multiplier for a specific metric.
        
        Args:
            metric: Metric name
            
        Returns:
            Multiplier value
        """
        if self.current_scenario == ScenarioType.NORMAL:
            return 1.0
        
        elif self.current_scenario == ScenarioType.DRIFT:
            # Gradual drift over time
            elapsed = (utc_now() - self.scenario_start_time).total_seconds() if self.scenario_start_time else 0
            self.drift_offset = min(0.5, elapsed / 60.0) * self.intensity
            
            if metric in ["gas_ppm", "temperature_c", "vibration_hz"]:
                return 1.0 + self.drift_offset
            elif metric in ["machine_health_percent", "safety_score"]:
                return 1.0 - self.drift_offset
            return 1.0
        
        elif self.current_scenario == ScenarioType.SPIKE:
            # Sudden spike
            if self.spike_active and self.spike_counter < self.spike_duration:
                self.spike_counter += 1
                if metric in ["gas_ppm", "temperature_c", "vibration_hz"]:
                    return 1.0 + (random.uniform(0.5, 1.5) * self.intensity)
                elif metric in ["machine_health_percent", "safety_score"]:
                    return 1.0 - (random.uniform(0.3, 0.7) * self.intensity)
            else:
                self.spike_active = False
            return 1.0
        
        elif self.current_scenario == ScenarioType.ANOMALY:
            # Random anomalies
            if random.random() < 0.3 * self.intensity:
                if metric in ["gas_ppm", "temperature_c", "vibration_hz"]:
                    return 1.0 + random.uniform(0.2, 0.8) * self.intensity
                elif metric in ["machine_health_percent", "safety_score"]:
                    return 1.0 - random.uniform(0.1, 0.4) * self.intensity
            return 1.0
        
        elif self.current_scenario == ScenarioType.CRITICAL:
            # Critical hazard event
            if metric in ["gas_ppm", "temperature_c", "vibration_hz"]:
                return 1.0 + (random.uniform(1.0, 2.0) * self.intensity)
            elif metric in ["machine_health_percent", "safety_score"]:
                return max(0.1, 1.0 - (random.uniform(0.5, 0.8) * self.intensity))
            return 1.0
        
        return 1.0
