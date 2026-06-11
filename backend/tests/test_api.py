"""Test API endpoints."""

from fastapi.testclient import TestClient


def test_root_endpoint(test_client: TestClient):
    """Test root endpoint."""
    response = test_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "AEGIS-AI Backend"
    assert data["status"] == "running"


def test_health_check(test_client: TestClient):
    """Test health check endpoint."""
    response = test_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_get_sensor_status(test_client: TestClient):
    """Test getting sensor status."""
    response = test_client.get("/api/sensors/status")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_simulation_status(test_client: TestClient):
    """Test getting simulation status."""
    response = test_client.get("/api/simulation/status")
    assert response.status_code == 200
    data = response.json()
    assert "running" in data
    assert "current_scenario" in data


def test_list_incidents(test_client: TestClient):
    """Test listing incidents."""
    response = test_client.get("/api/incidents")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "incidents" in data


def test_get_active_alerts(test_client: TestClient):
    """Test getting active alerts."""
    response = test_client.get("/api/alerts/active")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "alerts" in data


def test_get_risk_analytics(test_client: TestClient):
    """Test getting risk analytics."""
    response = test_client.get("/api/analytics/risk")
    assert response.status_code == 200
    data = response.json()
    assert "overall_risk_score" in data
    assert "timestamp" in data


def test_list_reports(test_client: TestClient):
    """Test listing reports."""
    response = test_client.get("/api/reports")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "reports" in data
