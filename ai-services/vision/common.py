from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import numpy as np


@dataclass(frozen=True)
class Detection:
    label: str
    confidence: float
    bbox: tuple[int, int, int, int]

    def to_dict(self) -> dict[str, Any]:
        return {
            "label": self.label,
            "confidence": round(float(self.confidence), 4),
            "bbox": {
                "x1": self.bbox[0],
                "y1": self.bbox[1],
                "x2": self.bbox[2],
                "y2": self.bbox[3],
            },
        }


class YoloModel:
    """Lazy YOLOv8 wrapper with a predictable integration surface."""

    def __init__(self, model_path: str | Path = "yolov8n.pt", confidence: float = 0.35):
        self.model_path = str(model_path)
        self.confidence = confidence
        self._model: Any | None = None

    @property
    def loaded(self) -> bool:
        return self._model is not None

    def load(self) -> None:
        if self._model is not None:
            return
        try:
            from ultralytics import YOLO
        except ImportError as exc:
            raise RuntimeError("ultralytics is required for YOLO inference") from exc
        self._model = YOLO(self.model_path)

    def predict(self, image: np.ndarray) -> list[Detection]:
        self.load()
        results = self._model.predict(image, conf=self.confidence, verbose=False)
        detections: list[Detection] = []
        for result in results:
            names = result.names
            boxes = getattr(result, "boxes", None)
            if boxes is None:
                continue
            for box in boxes:
                xyxy = box.xyxy[0].detach().cpu().numpy().astype(int).tolist()
                cls_id = int(box.cls[0].detach().cpu().item())
                conf = float(box.conf[0].detach().cpu().item())
                detections.append(Detection(label=str(names.get(cls_id, cls_id)), confidence=conf, bbox=tuple(xyxy)))
        return detections


def decode_image_bytes(data: bytes) -> np.ndarray:
    image_array = np.frombuffer(data, dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode uploaded image")
    return image


def draw_detections(image: np.ndarray, detections: list[Detection], alert_labels: set[str] | None = None) -> np.ndarray:
    alert_labels = alert_labels or set()
    output = image.copy()
    for detection in detections:
        x1, y1, x2, y2 = detection.bbox
        is_alert = detection.label.lower() in alert_labels
        color = (0, 0, 255) if is_alert else (0, 180, 0)
        cv2.rectangle(output, (x1, y1), (x2, y2), color, 2)
        caption = f"{detection.label} {detection.confidence:.2f}"
        cv2.putText(output, caption, (x1, max(20, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)
    return output
