"""Helmet Detection API — serves YOLO inference directly on port 8000.

No separate AI service (port 8001) required.
Model: ai-services/models/helmet_yolov8.pt
"""

from __future__ import annotations

import io
import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/helmet", tags=["Helmet Detection"])

# ─── Model loader ────────────────────────────────────────────────────────────

_model = None          # cached YOLO model instance
_model_ready = False   # True once loaded successfully
_model_error: str = "" # last load error, for status endpoint

# Candidate paths to search for the weights file
_MODEL_CANDIDATES = [
    Path(__file__).resolve().parents[4] / "ai-services" / "models" / "helmet_yolov8.pt",
    Path(__file__).resolve().parents[3] / "ai-services" / "models" / "helmet_yolov8.pt",
    Path("ai-services") / "models" / "helmet_yolov8.pt",
    Path("models") / "helmet_yolov8.pt",
]


def _load_model():
    global _model, _model_ready, _model_error
    if _model_ready:
        return

    # Find the weights file
    weights_path: Path | None = None
    for candidate in _MODEL_CANDIDATES:
        if candidate.exists():
            weights_path = candidate
            break

    if weights_path is None:
        _model_error = f"Model file not found. Searched: {[str(p) for p in _MODEL_CANDIDATES]}"
        logger.warning(f"[HelmetAPI] {_model_error} — using mock responses.")
        return

    try:
        from ultralytics import YOLO  # type: ignore
        logger.info(f"[HelmetAPI] Loading YOLO model from {weights_path} …")
        _model = YOLO(str(weights_path))
        _model_ready = True
        logger.info("[HelmetAPI] ✅ Model loaded successfully.")
    except Exception as exc:
        _model_error = str(exc)
        logger.error(f"[HelmetAPI] Failed to load model: {exc}")


# Attempt load at import time (non-blocking — errors are caught)
_load_model()


# ─── Label normaliser ────────────────────────────────────────────────────────

def _normalise_label(raw: str) -> str:
    """Map raw YOLO class names to standard Hardhat / NO-Hardhat labels."""
    lower = raw.lower()
    if any(k in lower for k in ("no", "without", "violation", "missing", "none")):
        return "NO-Hardhat"
    if any(k in lower for k in ("hard", "hat", "helmet", "ppe", "head", "compliant", "safety")):
        return "Hardhat"
    return raw.title()


# ─── Mock fallback ───────────────────────────────────────────────────────────

def _mock_response(filename: str) -> Dict[str, Any]:
    """Return a deterministic simulated detection when the real model is unavailable."""
    import hashlib
    seed = int(hashlib.md5(filename.encode()).hexdigest()[:8], 16)
    is_violation = (seed % 3) == 0   # ~33 % chance of violation for demo variety
    conf = 0.72 + (seed % 20) / 100
    label = "NO-Hardhat" if is_violation else "Hardhat"
    return {
        "success": True,
        "mocked": True,
        "violation": is_violation,
        "detections": [
            {
                "label": label,
                "confidence": round(conf, 3),
                "bbox": {"x1": 120, "y1": 60, "x2": 360, "y2": 280},
            }
        ],
        "model": "mock",
        "note": "Real model unavailable — mock response returned.",
    }


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/status")
async def helmet_status():
    """Return model readiness status."""
    return {
        "ready": _model_ready,
        "model": "helmet_yolov8.pt" if _model_ready else None,
        "error": _model_error if not _model_ready else None,
        "mock_mode": not _model_ready,
    }


@router.post("/analyze")
async def helmet_analyze(file: UploadFile = File(...)):
    """
    Accept a JPEG/PNG frame, run helmet detection, return bounding boxes.

    Response shape:
    {
        "success": true,
        "violation": false,
        "detections": [{"label": "Hardhat", "confidence": 0.93, "bbox": {...}}],
        "model": "helmet_yolov8.pt"
    }
    """
    start = time.perf_counter()

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    # ── Real YOLO inference ──────────────────────────────────────────────────
    if _model_ready and _model is not None:
        try:
            import numpy as np  # type: ignore
            from PIL import Image  # type: ignore

            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            img_np = np.array(img)

            results = _model.predict(
                source=img_np,
                conf=0.35,
                iou=0.45,
                verbose=False,
                stream=False,
            )

            detections: List[Dict[str, Any]] = []
            violation = False

            for result in results:
                if result.boxes is None:
                    continue
                for box in result.boxes:
                    cls_idx = int(box.cls[0].item())
                    raw_label = result.names[cls_idx]
                    label = _normalise_label(raw_label)
                    conf = float(box.conf[0].item())
                    x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]

                    if label == "NO-Hardhat":
                        violation = True

                    detections.append({
                        "label": label,
                        "confidence": round(conf, 3),
                        "bbox": {
                            "x1": round(x1, 1),
                            "y1": round(y1, 1),
                            "x2": round(x2, 1),
                            "y2": round(y2, 1),
                        },
                    })

            elapsed_ms = round((time.perf_counter() - start) * 1000)
            logger.debug(f"[HelmetAPI] Inference: {elapsed_ms}ms, {len(detections)} detections, violation={violation}")

            return JSONResponse({
                "success": True,
                "violation": violation,
                "detections": detections,
                "inference_ms": elapsed_ms,
                "model": "helmet_yolov8.pt",
            })

        except Exception as exc:
            logger.error(f"[HelmetAPI] Inference error: {exc}")
            # Fall through to mock on error so the frontend never breaks
            return JSONResponse(_mock_response(file.filename or "frame.jpg"))

    # ── Mock fallback ────────────────────────────────────────────────────────
    logger.debug("[HelmetAPI] Using mock response (model not ready).")
    return JSONResponse(_mock_response(file.filename or "frame.jpg"))
