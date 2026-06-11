from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import numpy as np


FEATURE_RANGES = {
    "temperature": (20.0, 120.0),
    "gas": (0.0, 1000.0),
    "vibration": (0.0, 50.0),
}


@dataclass(frozen=True)
class TelemetryInput:
    temperature: float
    gas: float
    vibration: float
    telemetry_history: list[dict[str, float]] = field(default_factory=list)

    @classmethod
    def from_mapping(cls, payload: dict[str, Any]) -> "TelemetryInput":
        return cls(
            temperature=float(payload.get("temperature", 0.0)),
            gas=float(payload.get("gas", 0.0)),
            vibration=float(payload.get("vibration", 0.0)),
            telemetry_history=list(payload.get("telemetry_history", [])),
        )


class PredictiveMaintenanceEngine:
    """Deterministic risk forecaster for integration-ready safety intelligence."""

    def _normalize(self, name: str, value: float) -> float:
        low, high = FEATURE_RANGES[name]
        return float(np.clip((value - low) / (high - low), 0.0, 1.0))

    def _trend_pressure(self, telemetry: TelemetryInput) -> float:
        history = telemetry.telemetry_history[-12:]
        if len(history) < 3:
            return 0.0
        pressures = []
        for key in FEATURE_RANGES:
            series = np.array([float(point.get(key, 0.0)) for point in history] + [getattr(telemetry, key)], dtype=float)
            x = np.arange(len(series), dtype=float)
            slope = np.polyfit(x, series, 1)[0]
            _, high = FEATURE_RANGES[key]
            pressures.append(max(0.0, slope / max(high * 0.03, 1.0)))
        return float(np.clip(np.mean(pressures), 0.0, 1.0))

    def risk_score(self, payload: dict[str, Any]) -> dict[str, Any]:
        telemetry = TelemetryInput.from_mapping(payload)
        temp = self._normalize("temperature", telemetry.temperature)
        gas = self._normalize("gas", telemetry.gas)
        vibration = self._normalize("vibration", telemetry.vibration)
        trend = self._trend_pressure(telemetry)
        score = 100.0 * float(np.clip((0.33 * temp) + (0.27 * gas) + (0.3 * vibration) + (0.1 * trend), 0.0, 1.0))
        return {
            "risk_score": round(score, 2),
            "risk_level": self._risk_level(score),
            "drivers": {
                "temperature": round(temp, 3),
                "gas": round(gas, 3),
                "vibration": round(vibration, 3),
                "trend": round(trend, 3),
            },
        }

    def failure_probability(self, payload: dict[str, Any]) -> dict[str, Any]:
        risk = self.risk_score(payload)
        probability = 1.0 / (1.0 + np.exp(-0.085 * (risk["risk_score"] - 55.0)))
        hours_to_failure = max(1.0, 240.0 * (1.0 - probability))
        return {
            "failure_probability": round(float(probability), 4),
            "estimated_hours_to_failure": round(float(hours_to_failure), 1),
            "risk_level": risk["risk_level"],
            "risk_score": risk["risk_score"],
        }

    def health_score(self, payload: dict[str, Any]) -> dict[str, Any]:
        risk = self.risk_score(payload)
        return {
            "health_score": round(100.0 - risk["risk_score"], 2),
            "risk_score": risk["risk_score"],
            "risk_level": risk["risk_level"],
        }

    def _risk_level(self, score: float) -> str:
        if score >= 80:
            return "critical"
        if score >= 60:
            return "high"
        if score >= 35:
            return "moderate"
        return "low"
