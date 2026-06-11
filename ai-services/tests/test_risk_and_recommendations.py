from ml.recommendations import RecommendationEngine
from ml.scoring import RiskIndexEngine


def test_risk_index_returns_zero_to_100_score() -> None:
    engine = RiskIndexEngine()
    result = engine.compute({
        "temperature": 60,
        "gas": 250,
        "vibration": 10,
        "ppe_violations": 1,
        "helmet_violation": True,
    })

    assert 0 <= result["safety_score"] <= 100
    assert 0 <= result["risk_index"] <= 100


def test_recommendations_include_ppe_actions() -> None:
    engine = RecommendationEngine()
    result = engine.generate({
        "temperature": 70,
        "gas": 300,
        "vibration": 12,
        "ppe_violations": 2,
        "helmet_violation": True,
    })

    text = " ".join(result["operator_recommendations"])
    assert "helmet" in text.lower()
    assert result["emergency_actions"]
