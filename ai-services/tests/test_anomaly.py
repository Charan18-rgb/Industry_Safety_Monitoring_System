from ml.anomaly import AnomalyDetector


def test_anomaly_detector_flags_spikes() -> None:
    detector = AnomalyDetector()
    payload = {
        "temperature": 100,
        "gas": 100,
        "vibration": 5,
        "telemetry_history": [
            {"temperature": 40, "gas": 100, "vibration": 5},
            {"temperature": 41, "gas": 101, "vibration": 5},
            {"temperature": 39, "gas": 99, "vibration": 5},
            {"temperature": 40, "gas": 100, "vibration": 6},
            {"temperature": 41, "gas": 98, "vibration": 5},
        ],
    }

    result = detector.detect(payload)

    assert result["anomaly"] is True
    assert result["unsafe_conditions"]
