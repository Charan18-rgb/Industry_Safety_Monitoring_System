from __future__ import annotations

import argparse

import cv2

from vision.common import draw_detections
from vision.helmet import HelmetDetector


def run_helmet_webcam(camera_index: int = 0, model_path: str = "models/helmet_yolov8.pt") -> None:
    detector = HelmetDetector(model_path=model_path)
    capture = cv2.VideoCapture(camera_index)
    if not capture.isOpened():
        raise RuntimeError(f"Could not open webcam index {camera_index}")

    try:
        while True:
            ok, frame = capture.read()
            if not ok:
                break
            result = detector.analyze(frame)
            annotated = draw_detections(frame, result.detections, {"person"} if result.violation else set())
            if result.violation:
                cv2.putText(annotated, "HELMET VIOLATION", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 3)
            cv2.imshow("AEGIS Helmet Detection", annotated)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        capture.release()
        cv2.destroyAllWindows()


def main() -> None:
    parser = argparse.ArgumentParser(description="Run AEGIS-AI real-time helmet detection.")
    parser.add_argument("--camera", type=int, default=0)
    parser.add_argument("--model", default="models/helmet_yolov8.pt")
    args = parser.parse_args()
    run_helmet_webcam(camera_index=args.camera, model_path=args.model)


if __name__ == "__main__":
    main()
