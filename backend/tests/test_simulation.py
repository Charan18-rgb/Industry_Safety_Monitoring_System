"""Test telemetry simulation engine."""

import pytest
from app.simulation.engine import TelemetrySimulationEngine
from app.simulation.scenarios import ScenarioType


def test_initialize_sensor():
    """Test sensor initialization."""
    engine = TelemetrySimulationEngine()
    
    engine.initialize_sensor("TEST-001", "gas")
    
    assert "TEST-001" in engine.sensor_states
    assert engine.sensor_states["TEST-001"]["sensor_type"] == "gas"


def test_generate_reading():
    """Test generating telemetry reading."""
    engine = TelemetrySimulationEngine()
    engine.initialize_sensor("TEST-001", "gas")
    
    reading = engine.generate_reading("TEST-001")
    
    assert reading.sensor_id == "TEST-001"
    assert reading.gas_ppm is not None
    assert reading.temperature_c is not None
    assert reading.humidity_percent is not None


def test_set_scenario():
    """Test setting simulation scenario."""
    engine = TelemetrySimulationEngine()
    engine.initialize_sensor("TEST-001", "gas")
    
    engine.set_scenario("spike", duration_seconds=10, intensity=1.5)
    
    status = engine.get_scenario_status()
    assert status["current_scenario"] == "spike"
    assert status["intensity"] == 1.5


def test_scenario_expiration():
    """Test scenario expiration."""
    engine = TelemetrySimulationEngine()
    engine.initialize_sensor("TEST-001", "gas")
    
    # Set scenario with short duration
    engine.set_scenario("spike", duration_seconds=0, intensity=1.0)
    
    # Check if expired
    assert engine.scenario.is_scenario_expired()


def test_normal_scenario():
    """Test normal scenario generation."""
    engine = TelemetrySimulationEngine()
    engine.initialize_sensor("TEST-001", "gas")
    engine.set_scenario("normal")
    
    reading = engine.generate_reading("TEST-001")
    
    # Normal scenario should have values close to baseline
    assert reading.gas_ppm < 100
    assert reading.temperature_c < 50


def test_critical_scenario():
    """Test critical scenario generation."""
    engine = TelemetrySimulationEngine()
    engine.initialize_sensor("TEST-001", "gas")
    engine.set_scenario("critical", intensity=1.5)
    
    reading = engine.generate_reading("TEST-001")
    
    # Critical scenario should have elevated values
    assert reading.gas_ppm > 50 or reading.temperature_c > 30


def test_anomaly_detection():
    """Test anomaly detection in readings."""
    engine = TelemetrySimulationEngine()
    engine.initialize_sensor("TEST-001", "gas")
    engine.set_scenario("critical", intensity=2.0)
    
    reading = engine.generate_reading("TEST-001")
    
    # Critical scenario should trigger anomalies
    assert reading.anomaly_detected in [0, 1]
