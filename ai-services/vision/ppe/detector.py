from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from vision.common import Detection, YoloModel


PPE_CLASSES = {
    "helmet": {"helmet", "hardhat", "hard_hat", "safety helmet", "safety-helmet"},
    "vest": {"vest", "safety vest", "reflective vest", "hi-vis vest"},
    "gloves": {"glove", "gloves", "safety gloves"},
    "goggles": {"goggle", "goggles", "safety goggles", "glasses"},
}


@dataclass(frozen=True)
class PPEDetectionResult:
    detections: list[Detection]
    compliance: dict[str, bool]
    missing: list[str]
    alert: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "compliance": self.compliance,
            "missing": self.missing,
            "alert": self.alert,
            "detections": [item.to_dict() for item in self.detections],
        }


class PPEDetector:
    def __init__(self, model_path: str | Path = "models/ppe_yolov8.pt", confidence: float = 0.35):
        path = Path(model_path)
        self.model_path = str(path if path.exists() else "yolov8n.pt")
        self.model = YoloModel(self.model_path, confidence=confidence)

    def analyze(self, image: np.ndarray) -> PPEDetectionResult:
        detections = self.model.predict(image)
        labels = {d.label.lower() for d in detections}
        compliance = {
            ppe_name: bool(labels.intersection(aliases))
            for ppe_name, aliases in PPE_CLASSES.items()
        }
        missing = [name for name, present in compliance.items() if not present]
        return PPEDetectionResult(
            detections=detections,
            compliance=compliance,
            missing=missing,
            alert="PPE_VIOLATION" if missing else "COMPLIANT",
        )

    def status(self) -> dict[str, Any]:
        return {
            "service": "ppe_detection",
            "ready": True,
            "model_path": self.model_path,
            "model_loaded": self.model.loaded,
            "required_ppe": sorted(PPE_CLASSES),
        }
