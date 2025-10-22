# anomaly_detection.py
import argparse
import json
import cv2
import numpy as np
from ultralytics import YOLO

def detect_anomalies(image_path):
    model = YOLO("model/best.pt")

    results = model.predict(source=image_path, conf=0.25, save=False, verbose=False)
    img = cv2.imread(image_path)
    image_height, image_width = img.shape[:2]

    anomalies = []

    for r in results:
        boxes = r.boxes.xyxy.cpu().numpy()
        labels = r.boxes.cls.cpu().numpy()
        scores = r.boxes.conf.cpu().numpy()
        boxes = boxes / np.array([image_width, image_height, image_width, image_height])

        for box, label, score in zip(boxes, labels, scores):
            anomalies.append({
                "class": r.names[int(label)],
                "confidence": float(f"{score:.2f}"),
                "box": box.tolist()
            })

    return anomalies


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True, help="Path to image file")
    args = parser.parse_args()

    try:
        detections = detect_anomalies(args.image)
        print(json.dumps({"anomalies": detections}))
    except Exception as e:
        # Print errors to stderr so Java can capture them
        import sys
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
