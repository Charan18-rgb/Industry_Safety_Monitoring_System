# AEGIS-AI Intelligence Platform

AEGIS-AI provides computer vision and predictive intelligence modules for industrial safety systems.

## Structure

- `vision/helmet`: real-time helmet detection with YOLOv8.
- `vision/ppe`: PPE detection for helmet, vest, gloves, and goggles.
- `vision/webcam`: live webcam runner for helmet compliance.
- `vision/api`: FastAPI integration layer.
- `ml/predictive`: equipment risk and failure forecasting.
- `ml/anomaly`: spike and unsafe telemetry detection.
- `ml/scoring`: 0-100 industrial safety score.
- `ml/recommendations`: operator, emergency, and maintenance actions.
- `models`: place production model weights here.

## Install

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run API

```bash
python run_api.py
```

Open `http://localhost:8000/docs` for interactive API documentation.

## Run Helmet Webcam

```bash
python -m vision.webcam.helmet_webcam --camera 0
```

Press `q` to exit the webcam window.

## Model Weights

Production deployments should place custom YOLOv8 weights in:

- `models/helmet_yolov8.pt`
- `models/ppe_yolov8.pt`

If those files are absent, the platform falls back to `yolov8n.pt` so the pipeline remains runnable. The fallback model detects generic objects and people; custom PPE weights are required for high-quality helmet, vest, glove, and goggle compliance.

## API Endpoints

- `GET /api/helmet/status`
- `POST /api/helmet/analyze`
- `GET /api/ppe/status`
- `POST /api/ppe/analyze`
- `GET /api/predictive/risk`
- `GET /api/predictive/failure`
- `POST /api/predictive/risk`
- `POST /api/predictive/failure`
- `POST /api/anomaly/detect`
- `POST /api/risk/index`
- `POST /api/recommendations`

## Example Telemetry Payload

```json
{
  "temperature": 82.0,
  "gas": 420.0,
  "vibration": 18.5,
  "telemetry_history": [
    {"temperature": 70.0, "gas": 300.0, "vibration": 12.0},
    {"temperature": 74.0, "gas": 340.0, "vibration": 14.0}
  ],
  "helmet_violation": false,
  "ppe_violations": 1
}
```

## Tests

```bash
pytest
```
