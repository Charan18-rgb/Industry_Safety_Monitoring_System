"""Pytest configuration and fixtures."""

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.database import Base, get_db
from app.main import app


# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def test_engine():
    """Create test database engine."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def test_session(test_engine):
    """Create test database session."""
    async_session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
    async with async_session() as session:
        yield session


@pytest.fixture
def test_client(test_session):
    """Create test client with database override."""
    from fastapi.testclient import TestClient
    
    async def override_get_db():
        yield test_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as client:
        yield client
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_sensor_data():
    """Sample sensor data for testing."""
    return {
        "sensor_id": "TEST-001",
        "name": "Test Sensor",
        "sensor_type": "gas",
        "location": "Test Location",
    }


@pytest.fixture
def sample_incident_data():
    """Sample incident data for testing."""
    from app.models.incident import IncidentCategory, IncidentSeverity
    return {
        "title": "Test Incident",
        "description": "Test incident description",
        "category": IncidentCategory.GAS_LEAK,
        "severity": IncidentSeverity.HIGH,
        "location": "Test Location",
    }


@pytest.fixture
def sample_alert_data():
    """Sample alert data for testing."""
    from app.models.alert import AlertType
    return {
        "title": "Test Alert",
        "message": "Test alert message",
        "alert_type": AlertType.WARNING,
        "source": "test",
        "source_id": "TEST-001",
    }
