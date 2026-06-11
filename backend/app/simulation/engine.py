"""Telemetry simulation engine."""

import random
import numpy as np
from typing import Dict, Optional, List
from app.simulation.scenarios import SimulationScenario, ScenarioType
from app.schemas.telemetry import TelemetryReadingCreate
from app.core.time import utc_now


class TelemetrySimulationEngine:
    """Realistic industrial telemetry simulation engine."""
    
    # Base values for different sensor types
    BASE_VALUES = {
        "gas": {
            "gas_ppm": 50.0,
            "temperature_c": 25.0,
            "humidity_percent": 45.0,
            "vibration_hz": 10.0,
            "machine_health_percent": 95.0,
            "environmental_risk_score": 10.0,
            "safety_score": 90.0,
        },
        "temperature": {
            "gas_ppm": 30.0,
            "temperature_c": 35.0,
            "humidity_percent": 50.0,
            "vibration_hz": 5.0,
            "machine_health_percent": 92.0,
            "environmental_risk_score": 15.0,
            "safety_score": 88.0,
        },
        "humidity": {
            "gas_ppm": 25.0,
            "temperature_c": 28.0,
            "humidity_percent": 60.0,
            "vibration_hz": 3.0,
            "machine_health_percent": 94.0,
            "environmental_risk_score": 12.0,
            "safety_score": 89.0,
        },
        "vibration": {
            "gas_ppm": 20.0,
            "temperature_c": 30.0,
            "humidity_percent": 40.0,
            "vibration_hz": 50.0,
            "machine_health_percent": 85.0,
            "environmental_risk_score": 20.0,
            "safety_score": 85.0,
        },
    }
    
    # Noise levels for realistic simulation
    NOISE_LEVELS = {
        "gas_ppm": 5.0,
        "temperature_c": 2.0,
        "humidity_percent": 3.0,
        "vibration_hz": 2.0,
        "machine_health_percent": 1.0,
        "environmental_risk_score": 2.0,
        "safety_score": 1.0,
    }
    
    def __init__(self):
        """Initialize telemetry simulation engine."""
        self.scenario = SimulationScenario()
        self.sensor_states: Dict[str, Dict] = {}
        self.running = False
    
    def initialize_sensor(self, sensor_id: str, sensor_type: str) -> None:
        """
        Initialize a sensor for simulation.
        
        Args:
            sensor_id: Sensor identifier
            sensor_type: Sensor type (gas, temperature, humidity, vibration)
        """
        base_values = self.BASE_VALUES.get(sensor_type, self.BASE_VALUES["gas"])
        self.sensor_states[sensor_id] = {
            "sensor_type": sensor_type,
            "base_values": base_values.copy(),
            "current_values": base_values.copy(),
            "last_update": utc_now(),
        }
    
    def generate_reading(self, sensor_id: str) -> TelemetryReadingCreate:
        """
        Generate a realistic telemetry reading for a sensor.
        
        Args:
            sensor_id: Sensor identifier
            
        Returns:
            Telemetry reading
        """
        if sensor_id not in self.sensor_states:
            raise ValueError(f"Sensor {sensor_id} not initialized")
        
        state = self.sensor_states[sensor_id]
        sensor_type = state["sensor_type"]
        base_values = state["base_values"]
        
        # Check if scenario expired
        if self.scenario.is_scenario_expired():
            self.scenario.set_scenario(ScenarioType.NORMAL)
        
        # Generate values with noise and scenario effects
        reading = {
            "sensor_id": sensor_id,
            "gas_ppm": self._generate_value(base_values["gas_ppm"], "gas_ppm", sensor_type),
            "temperature_c": self._generate_value(base_values["temperature_c"], "temperature_c", sensor_type),
            "humidity_percent": self._generate_value(base_values["humidity_percent"], "humidity_percent", sensor_type),
            "vibration_hz": self._generate_value(base_values["vibration_hz"], "vibration_hz", sensor_type),
            "machine_health_percent": self._generate_value(
                base_values["machine_health_percent"], "machine_health_percent", sensor_type
            ),
            "environmental_risk_score": self._generate_value(
                base_values["environmental_risk_score"], "environmental_risk_score", sensor_type
            ),
            "safety_score": self._generate_value(base_values["safety_score"], "safety_score", sensor_type),
        }
        
        # Detect anomalies
        anomaly_detected, anomaly_type = self._detect_anomaly(reading)
        reading["anomaly_detected"] = 1 if anomaly_detected else 0
        reading["anomaly_type"] = anomaly_type if anomaly_detected else None
        
        # Update state
        state["current_values"] = reading.copy()
        state["last_update"] = utc_now()
        
        return TelemetryReadingCreate(**reading)
    
    def _generate_value(self, base_value: float, metric: str, sensor_type: str) -> float:
        """
        Generate a realistic value with noise and scenario effects.
        
        Args:
            base_value: Base value for the metric
            metric: Metric name
            sensor_type: Sensor type
            
        Returns:
            Generated value
        """
        # Add random noise
        noise = random.gauss(0, self.NOISE_LEVELS.get(metric, 1.0))
        value = base_value + noise
        
        # Apply scenario multiplier
        multiplier = self.scenario.get_scenario_multiplier(metric)
        value = value * multiplier
        
        # Clamp values to realistic ranges
        if metric == "gas_ppm":
            value = max(0, min(value, 500))
        elif metric == "temperature_c":
            value = max(-20, min(value, 100))
        elif metric == "humidity_percent":
            value = max(0, min(value, 100))
        elif metric == "vibration_hz":
            value = max(0, min(value, 200))
        elif metric == "machine_health_percent":
            value = max(0, min(value, 100))
        elif metric == "environmental_risk_score":
            value = max(0, min(value, 100))
        elif metric == "safety_score":
            value = max(0, min(value, 100))
        
        return round(value, 2)
    
    def _detect_anomaly(self, reading: Dict) -> tuple[bool, Optional[str]]:
        """
        Detect anomalies in telemetry reading.
        
        Args:
            reading: Telemetry reading dictionary
            
        Returns:
            Tuple of (anomaly_detected, anomaly_type)
        """
        anomaly_thresholds = {
            "gas_ppm": 150,
            "temperature_c": 60,
            "vibration_hz": 100,
            "machine_health_percent": 50,
            "safety_score": 50,
        }
        
        for metric, threshold in anomaly_thresholds.items():
            value = reading.get(metric)
            if value is not None:
                if metric in ["machine_health_percent", "safety_score"]:
                    if value < threshold:
                        return True, f"{metric}_low"
                else:
                    if value > threshold:
                        return True, f"{metric}_high"
        
        return False, None
    
    def set_scenario(
        self,
        scenario: str,
        duration_seconds: Optional[int] = None,
        intensity: float = 1.0
    ) -> None:
        """
        Set simulation scenario.
        
        Args:
            scenario: Scenario name
            duration_seconds: Duration in seconds
            intensity: Scenario intensity
        """
        scenario_type = ScenarioType(scenario)
        self.scenario.set_scenario(scenario_type, duration_seconds, intensity)
    
    def get_scenario_status(self) -> Dict:
        """
        Get current scenario status.
        
        Returns:
            Scenario status dictionary
        """
        remaining = None
        if self.scenario.duration_seconds and self.scenario.scenario_start_time:
            elapsed = (utc_now() - self.scenario.scenario_start_time).total_seconds()
            remaining = max(0, self.scenario.duration_seconds - int(elapsed))
        
        return {
            "current_scenario": self.scenario.current_scenario.value,
            "remaining_seconds": remaining,
            "intensity": self.scenario.intensity,
        }
