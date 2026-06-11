from __future__ import annotations

from typing import Any

import numpy as np


class AnomalyDetector:
    def detect(self, payload: dict[str, Any]) -> dict[str, Any]:
        history = list(payload.get("telemetry_history", []))
        current = {
            "temperature": float(payload.get("temperature", 0.0)),
            "gas": float(payload.get("gas", 0.0)),
            "vibration": float(payload.get("vibration", 0.0)),
        }
        anomalies: list[dict[str, Any]] = []
        unsafe_conditions: list[str] = []

        hard_limits = {
            "temperature": 90.0,
            "gas": 650.0,
            "vibration": 28.0,
        }
        for key, limit in hard_limits.items():
            if current[key] >= limit:
                unsafe_conditions.append(f"{key}_above_safe_limit")

        for key, value in current.items():
            series = np.array([float(point.get(key, value)) for point in history[-30:]], dtype=float)
            if len(series) < 5:
                continue
            mean = float(np.mean(series))
            std = float(np.std(series)) or 1.0
            z_score = (value - mean) / std
            if abs(z_score) >= 3.0:
                anomalies.append({
                    "signal": key,
                    "type": "spike" if z_score > 0 else "drop",
                    "value": value,
                    "baseline_mean": round(mean, 3),
                    "z_score": round(float(z_score), 3),
                })

        return {
            "anomaly": bool(anomalies or unsafe_conditions),
            "anomalies": anomalies,
            "unsafe_conditions": unsafe_conditions,
        }
