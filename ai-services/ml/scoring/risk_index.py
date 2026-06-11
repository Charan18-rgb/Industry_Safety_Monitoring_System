from __future__ import annotations

from typing import Any

from ml.anomaly import AnomalyDetector
from ml.predictive import PredictiveMaintenanceEngine


class RiskIndexEngine:
    def __init__(self) -> None:
        self.predictive = PredictiveMaintenanceEngine()
        self.anomaly = AnomalyDetector()

    def compute(self, payload: dict[str, Any]) -> dict[str, Any]:
        predictive = self.predictive.risk_score(payload)
        anomaly = self.anomaly.detect(payload)
        ppe_penalty = float(payload.get("ppe_violations", 0)) * 12.0
        helmet_penalty = 15.0 if bool(payload.get("helmet_violation", False)) else 0.0
        anomaly_penalty = 10.0 if anomaly["anomaly"] else 0.0
        score = max(0.0, 100.0 - predictive["risk_score"] - ppe_penalty - helmet_penalty - anomaly_penalty)
        return {
            "safety_score": round(score, 2),
            "risk_index": round(100.0 - score, 2),
            "risk_level": self._level(100.0 - score),
            "components": {
                "predictive_risk": predictive["risk_score"],
                "ppe_penalty": ppe_penalty,
                "helmet_penalty": helmet_penalty,
                "anomaly_penalty": anomaly_penalty,
            },
        }

    def _level(self, risk_index: float) -> str:
        if risk_index >= 80:
            return "critical"
        if risk_index >= 60:
            return "high"
        if risk_index >= 35:
            return "moderate"
        return "low"
