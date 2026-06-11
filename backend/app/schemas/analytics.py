"""Analytics schemas."""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class AnalyticsResponse(BaseModel):
    """Schema for analytics response."""
    snapshot_id: str
    timestamp: datetime
    
    # Risk metrics
    overall_risk_score: float
    environmental_risk_score: Optional[float]
    equipment_risk_score: Optional[float]
    safety_risk_score: Optional[float]
    
    # Equipment health
    avg_machine_health: Optional[float]
    critical_equipment_count: int
    at_risk_equipment_count: int
    
    # Incident metrics
    total_incidents: int
    open_incidents: int
    critical_incidents: int
    
    # Alert metrics
    total_alerts: int
    active_alerts: int
    critical_alerts: int
    
    # Telemetry summaries
    avg_temperature: Optional[float]
    avg_humidity: Optional[float]
    avg_gas_ppm: Optional[float]
    avg_vibration: Optional[float]
    
    # Additional metrics
    additional_metrics: Optional[Dict[str, Any]] = None


class TrendDataPoint(BaseModel):
    """Schema for trend data point."""
    timestamp: datetime
    value: float
    label: Optional[str] = None


class TrendResponse(BaseModel):
    """Schema for trend analytics response."""
    metric_name: str
    trend: List[TrendDataPoint]
    trend_direction: str  # increasing, decreasing, stable
    change_percentage: Optional[float] = None


class KPIResponse(BaseModel):
    """Schema for KPI response."""
    kpi_name: str
    value: float
    unit: Optional[str] = None
    target: Optional[float] = None
    status: str  # good, warning, critical
    trend: str  # up, down, stable
    change_percentage: Optional[float] = None


class KPIDashboardResponse(BaseModel):
    """Schema for KPI dashboard response."""
    timestamp: datetime
    kpis: List[KPIResponse]
