from __future__ import annotations

from typing import Any

from ml.anomaly import AnomalyDetector
from ml.predictive import PredictiveMaintenanceEngine
from ml.scoring import RiskIndexEngine


class RecommendationEngine:
    def __init__(self) -> None:
        self.predictive = PredictiveMaintenanceEngine()
        self.anomaly = AnomalyDetector()
        self.risk_index = RiskIndexEngine()

    def generate(self, payload: dict[str, Any]) -> dict[str, Any]:
        failure = self.predictive.failure_probability(payload)
        anomalies = self.anomaly.detect(payload)
        safety = self.risk_index.compute(payload)
        recommendations: list[str] = []
        emergency_actions: list[str] = []
        maintenance: list[str] = []

        if bool(payload.get("helmet_violation", False)):
            recommendations.append("Stop task and require helmet compliance before work resumes.")
            emergency_actions.append("Notify floor supervisor of helmet violation.")
        if int(payload.get("ppe_violations", 0)) > 0:
            recommendations.append("Perform PPE checkpoint for helmet, vest, gloves, and goggles.")
        if failure["failure_probability"] >= 0.65:
            maintenance.append("Schedule immediate inspection of high-risk equipment.")
            emergency_actions.append("Prepare controlled shutdown if telemetry continues to deteriorate.")
        elif failure["failure_probability"] >= 0.35:
            maintenance.append("Increase inspection frequency and review lubrication, bearings, and load patterns.")
        if anomalies["anomaly"]:
            recommendations.append("Investigate abnormal telemetry and compare against recent maintenance logs.")
        if not recommendations and not maintenance:
            recommendations.append("Continue normal operations with standard telemetry monitoring.")

        return {
            "safety_score": safety["safety_score"],
            "risk_level": safety["risk_level"],
            "operator_recommendations": recommendations,
            "emergency_actions": emergency_actions,
            "maintenance_suggestions": maintenance,
        }
