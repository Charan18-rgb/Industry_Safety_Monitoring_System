from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from vision.common import Detection, YoloModel


HELMET_LABELS = {"helmet", "hardhat", "hard_hat", "safety helmet", "safety-helmet"}
PERSON_LABELS = {"person", "worker"}


@dataclass(frozen=True)
class HelmetDetectionResult:
    detections: list[Detection]
    persons_detected: int
    helmets_detected: int
    violation: bool
    alert: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "persons_detected": self.persons_detected,
            "helmets_detected": self.helmets_detected,
            "violation": self.violation,
            "alert": self.alert,
            "detections": [item.to_dict() for item in self.detections],
        }


class HelmetDetector:
    """Real-time helmet compliance detector.

    For production, place a custom helmet model in models/helmet_yolov8.pt and
    pass that path. The default YOLOv8 model still makes the pipeline runnable,
    but custom PPE labels produce the strongest compliance decisions.
    """

    def __init__(self, model_path: str | Path = "models/helmet_yolov8.pt", confidence: float = 0.35):
        path = Path(model_path)
        self.model_path = str(path if path.exists() else "yolov8n.pt")
        self.model = YoloModel(self.model_path, confidence=confidence)

    def analyze(self, image: np.ndarray) -> HelmetDetectionResult:
        detections = self.model.predict(image)
        
        # Check if custom helmet model is active
        is_custom = "helmet_yolov8.pt" in self.model_path.lower()
        
        if is_custom:
            hardhats = [d for d in detections if d.label.lower() == "hardhat"]
            no_hardhats = [d for d in detections if d.label.lower() == "no-hardhat"]
            
            persons_count = len(hardhats) + len(no_hardhats)
            helmets_count = len(hardhats)
            violation = len(no_hardhats) > 0
        else:
            persons = [d for d in detections if d.label.lower() in PERSON_LABELS]
            helmets = [d for d in detections if d.label.lower() in HELMET_LABELS]
            persons_count = len(persons)
            helmets_count = len(helmets)
            if helmets:
                violation = persons_count > helmets_count if persons_count else False
            else:
                violation = persons_count > 0

        alert = "HELMET_VIOLATION" if violation else "COMPLIANT"
        return HelmetDetectionResult(
            detections=detections,
            persons_detected=persons_count,
            helmets_detected=helmets_count,
            violation=violation,
            alert=alert,
        )

    def status(self) -> dict[str, Any]:
        labels = ["Hardhat", "NO-Hardhat"] if "helmet_yolov8.pt" in self.model_path.lower() else sorted(HELMET_LABELS)
        return {
            "service": "helmet_detection",
            "ready": True,
            "model_path": self.model_path,
            "model_loaded": self.model.loaded,
            "labels": labels,
        }
