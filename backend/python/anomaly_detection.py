import sys
import json
from ultralytics import YOLO
import cv2
import numpy as np

# Load YOLO model once
model = YOLO("model/best.pt")

def detect(image_path):
    image = cv2.imread(image_path)
    if image is None:
        return []

    image_height, image_width = image.shape[:2]

    results = model.predict(source=image_path, conf=0.25)
    detections = []

    for r in results:
        boxes = r.boxes.xyxy.cpu().numpy()
        labels = r.boxes.cls.cpu().numpy()
        scores = r.boxes.conf.cpu().numpy()

        # Normalize coordinates
        boxes = boxes / np.array([image_width, image_height, image_width, image_height])

        for box, label, score in zip(boxes, labels, scores):
            detections.append({
                "class": model.names[int(label)],
                "confidence": float(f"{score:.2f}"),
                "box": box.tolist()
            })

    return detections

if __name__ == "__main__":
    image_path = sys.argv[1]  # image path as argument
    output = detect(image_path)
    print(json.dumps(output))
