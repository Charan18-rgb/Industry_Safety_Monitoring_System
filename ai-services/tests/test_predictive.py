from ml.predictive import PredictiveMaintenanceEngine


def test_risk_score_increases_for_unsafe_telemetry() -> None:
    engine = PredictiveMaintenanceEngine()
    low = engine.risk_score({"temperature": 35, "gas": 50, "vibration": 2})
    high = engine.risk_score({"temperature": 105, "gas": 850, "vibration": 40})

    assert low["risk_score"] < high["risk_score"]
    assert high["risk_level"] in {"high", "critical"}


def test_failure_probability_shape() -> None:
    engine = PredictiveMaintenanceEngine()
    result = engine.failure_probability({"temperature": 90, "gas": 500, "vibration": 25})

    assert 0 <= result["failure_probability"] <= 1
    assert result["estimated_hours_to_failure"] >= 1
