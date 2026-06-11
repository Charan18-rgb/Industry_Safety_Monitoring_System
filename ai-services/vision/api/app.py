from __future__ import annotations

from typing import Any

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ml.anomaly import AnomalyDetector
from ml.predictive import PredictiveMaintenanceEngine
from ml.recommendations import RecommendationEngine
from ml.scoring import RiskIndexEngine
from vision.common import decode_image_bytes
from vision.helmet import HelmetDetector
from vision.ppe import PPEDetector


class TelemetryPayload(BaseModel):
    temperature: float = Field(..., description="Equipment temperature")
    gas: float = Field(..., description="Gas concentration")
    vibration: float = Field(..., description="Vibration reading")
    telemetry_history: list[dict[str, float]] = Field(default_factory=list)
    helmet_violation: bool = False
    ppe_violations: int = 0


helmet_detector = HelmetDetector()
ppe_detector = PPEDetector()
predictive_engine = PredictiveMaintenanceEngine()
anomaly_detector = AnomalyDetector()
risk_engine = RiskIndexEngine()
recommendation_engine = RecommendationEngine()


def create_app() -> FastAPI:
    api = FastAPI(
        title="AEGIS-AI Intelligence Platform",
        version="1.0.0",
        description="Computer vision and predictive intelligence for industrial safety.",
    )

    api.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @api.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "aegis-ai"}

    @api.get("/api/helmet/status")
    def helmet_status() -> dict[str, Any]:
        return helmet_detector.status()

    @api.post("/api/helmet/analyze")
    async def helmet_analyze(file: UploadFile = File(...)) -> dict[str, Any]:
        try:
            image = decode_image_bytes(await file.read())
            return helmet_detector.analyze(image).to_dict()
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @api.get("/api/ppe/status")
    def ppe_status() -> dict[str, Any]:
        return ppe_detector.status()

    @api.post("/api/ppe/analyze")
    async def ppe_analyze(file: UploadFile = File(...)) -> dict[str, Any]:
        try:
            image = decode_image_bytes(await file.read())
            return ppe_detector.analyze(image).to_dict()
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @api.get("/api/predictive/risk")
    def predictive_risk(
        temperature: float = Query(...),
        gas: float = Query(...),
        vibration: float = Query(...),
    ) -> dict[str, Any]:
        return predictive_engine.risk_score({
            "temperature": temperature,
            "gas": gas,
            "vibration": vibration,
            "telemetry_history": [],
        })

    @api.get("/api/predictive/failure")
    def predictive_failure(
        temperature: float = Query(...),
        gas: float = Query(...),
        vibration: float = Query(...),
    ) -> dict[str, Any]:
        return predictive_engine.failure_probability({
            "temperature": temperature,
            "gas": gas,
            "vibration": vibration,
            "telemetry_history": [],
        })

    @api.post("/api/predictive/risk")
    def predictive_risk_post(payload: TelemetryPayload) -> dict[str, Any]:
        return predictive_engine.risk_score(payload.model_dump())

    @api.post("/api/predictive/failure")
    def predictive_failure_post(payload: TelemetryPayload) -> dict[str, Any]:
        return predictive_engine.failure_probability(payload.model_dump())

    @api.post("/api/anomaly/detect")
    def detect_anomaly(payload: TelemetryPayload) -> dict[str, Any]:
        return anomaly_detector.detect(payload.model_dump())

    @api.post("/api/risk/index")
    def risk_index(payload: TelemetryPayload) -> dict[str, Any]:
        return risk_engine.compute(payload.model_dump())

    @api.post("/api/recommendations")
    def recommendations(payload: TelemetryPayload) -> dict[str, Any]:
        return recommendation_engine.generate(payload.model_dump())

    return api


app = create_app()
