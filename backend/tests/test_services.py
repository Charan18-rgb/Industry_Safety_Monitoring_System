"""Test service layer."""

import pytest
from datetime import datetime
from app.services.telemetry_service import TelemetryService
from app.services.incident_service import IncidentService
from app.services.analytics_service import AnalyticsService
from app.schemas.telemetry import TelemetryReadingCreate
from app.schemas.incident import IncidentCreate
from app.models.incident import IncidentCategory, IncidentSeverity


@pytest.mark.asyncio
async def test_create_telemetry_reading(test_session):
    """Test creating a telemetry reading."""
    service = TelemetryService(test_session)
    
    # Create a sensor first
    await service.create_sensor(
        sensor_id="TEST-001",
        name="Test Sensor",
        sensor_type="gas",
        location="Test Location"
    )
    
    # Create a reading
    reading_data = TelemetryReadingCreate(
        sensor_id="TEST-001",
        gas_ppm=50.0,
        temperature_c=25.0,
        humidity_percent=45.0,
        vibration_hz=10.0,
        machine_health_percent=95.0,
        environmental_risk_score=10.0,
        safety_score=90.0,
    )
    
    reading = await service.create_reading(reading_data)
    assert reading.sensor_id == "TEST-001"
    assert reading.gas_ppm == 50.0


@pytest.mark.asyncio
async def test_get_latest_reading(test_session):
    """Test getting latest reading for a sensor."""
    service = TelemetryService(test_session)
    
    # Create sensor and reading
    await service.create_sensor(
        sensor_id="TEST-002",
        name="Test Sensor 2",
        sensor_type="temperature",
        location="Test Location 2"
    )
    
    reading_data = TelemetryReadingCreate(
        sensor_id="TEST-002",
        temperature_c=30.0,
        humidity_percent=50.0,
    )
    
    await service.create_reading(reading_data)
    
    # Get latest reading
    latest = await service.get_latest_reading("TEST-002")
    assert latest is not None
    assert latest.sensor_id == "TEST-002"


@pytest.mark.asyncio
async def test_create_incident(test_session):
    """Test creating an incident."""
    service = IncidentService(test_session)
    
    incident_data = IncidentCreate(
        title="Test Incident",
        description="Test incident description",
        category=IncidentCategory.GAS_LEAK,
        severity=IncidentSeverity.HIGH,
        location="Test Location",
    )
    
    incident = await service.create_incident(incident_data)
    assert incident.title == "Test Incident"
    assert incident.category == IncidentCategory.GAS_LEAK
    assert incident.status.value == "open"


@pytest.mark.asyncio
async def test_acknowledge_incident(test_session):
    """Test acknowledging an incident."""
    service = IncidentService(test_session)
    
    # Create incident
    incident_data = IncidentCreate(
        title="Test Incident",
        category=IncidentCategory.OVERHEATING,
        severity=IncidentSeverity.MEDIUM,
    )
    
    incident = await service.create_incident(incident_data)
    
    # Acknowledge incident
    acknowledged = await service.acknowledge_incident(
        incident.incident_id,
        acknowledged_by="test_user"
    )
    
    assert acknowledged is not None
    assert acknowledged.status.value == "acknowledged"
    assert acknowledged.acknowledged_by == "test_user"


@pytest.mark.asyncio
async def test_resolve_incident(test_session):
    """Test resolving an incident."""
    service = IncidentService(test_session)
    
    # Create incident
    incident_data = IncidentCreate(
        title="Test Incident",
        category=IncidentCategory.VIBRATION_ANOMALY,
        severity=IncidentSeverity.LOW,
    )
    
    incident = await service.create_incident(incident_data)
    
    # Resolve incident
    resolved = await service.resolve_incident(
        incident.incident_id,
        resolved_by="test_user",
        resolution_notes="Issue resolved"
    )
    
    assert resolved is not None
    assert resolved.status.value == "resolved"
    assert resolved.resolution_notes == "Issue resolved"


@pytest.mark.asyncio
async def test_calculate_risk_score(test_session):
    """Test calculating risk score."""
    service = AnalyticsService(test_session)
    
    risk_score = await service.calculate_risk_score()
    assert isinstance(risk_score, float)
    assert 0 <= risk_score <= 100


@pytest.mark.asyncio
async def test_create_analytics_snapshot(test_session):
    """Test creating analytics snapshot."""
    service = AnalyticsService(test_session)
    
    snapshot = await service.create_analytics_snapshot()
    assert snapshot is not None
    assert snapshot.snapshot_id is not None
    assert snapshot.overall_risk_score >= 0
    assert snapshot.overall_risk_score <= 100


@pytest.mark.asyncio
async def test_get_latest_snapshot(test_session):
    """Test getting latest analytics snapshot."""
    service = AnalyticsService(test_session)
    
    # Create snapshot
    await service.create_analytics_snapshot()
    
    # Get latest
    latest = await service.get_latest_snapshot()
    assert latest is not None
    assert latest.snapshot_id is not None


@pytest.mark.asyncio
async def test_calculate_kpis(test_session):
    """Test calculating KPIs."""
    service = AnalyticsService(test_session)
    
    kpis = await service.calculate_kpis()
    assert isinstance(kpis, dict)
    assert len(kpis) > 0
