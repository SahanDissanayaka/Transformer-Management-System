# backend/python/anomaly_detection.py
import sys
import os
import json
import logging

# -------- Logging (stderr only) --------
logging.basicConfig(
    level=os.environ.get("LOGLEVEL", "INFO"),
    format='[anomaly_detection] %(levelname)s: %(message)s',
    stream=sys.stderr
)

# -------- Imports --------
try:
    from ultralytics import YOLO
    import cv2
    import numpy as np
except Exception as e:
    logging.error(f"IMPORT_ERROR: {e}")
    sys.exit(2)

# -------- Model path resolution --------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def resolve_model_path() -> str:
    env_model = os.environ.get("MODEL_PATH")
    candidates = []
    if env_model:
        candidates.append(env_model)

    # Prefer backend/model/best.pt (one directory up from python/)
    candidates.append(os.path.abspath(os.path.join(SCRIPT_DIR, "..", "model", "best.pt")))
    # Fallback: backend/python/model/best.pt
    candidates.append(os.path.join(SCRIPT_DIR, "model", "best.pt"))

    for p in candidates:
        if os.path.exists(p):
            return p

    raise FileNotFoundError(
        "best.pt not found. Checked:\n  " + "\n  ".join(candidates)
    )

try:
    MODEL_PATH = resolve_model_path()
    logging.info(f"Loading model from {MODEL_PATH}")
    model = YOLO(MODEL_PATH)  # Uses CPU/GPU automatically depending on your env
except Exception as e:
    logging.error(f"MODEL_LOAD_ERROR: {e}")
    sys.exit(3)

# -------- Helpers --------
def _normalize_box_xyxy(box_xyxy: np.ndarray, w: int, h: int):
    """
    Convert absolute [x1,y1,x2,y2] pixel coords → normalized [0..1].
    Ensure x1<x2, y1<y2 and clamp to [0,1].
    """
    x1, y1, x2, y2 = map(float, box_xyxy.tolist())
    # Ensure order
    if x2 < x1: x1, x2 = x2, x1
    if y2 < y1: y1, y2 = y2, y1
    # Normalize
    nx1, ny1 = x1 / w, y1 / h
    nx2, ny2 = x2 / w, y2 / h
    # Clamp
    nx1 = max(0.0, min(1.0, nx1))
    ny1 = max(0.0, min(1.0, ny1))
    nx2 = max(0.0, min(1.0, nx2))
    ny2 = max(0.0, min(1.0, ny2))
    return [nx1, ny1, nx2, ny2]

def _read_image_from_stdin() -> np.ndarray:
    """
    Read raw image bytes from stdin and decode with OpenCV.
    """
    buf = sys.stdin.buffer.read()
    if not buf:
        return None
    arr = np.frombuffer(buf, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return img

# -------- Core detection --------
def detect_on_image(img_bgr: np.ndarray, conf_thresh: float = 0.25):
    """
    Run YOLO on a BGR image (OpenCV) and return anomalies list with normalized boxes.
    """
    if img_bgr is None:
        logging.error("detect_on_image: received None image")
        return []

    h, w = img_bgr.shape[:2]
    # Ultralytics can take numpy array directly
    # results is a list of 'Results' objects (one per image)
    results = model.predict(source=img_bgr, conf=conf_thresh, verbose=False)

    out = []
    for r in results:
        # r.boxes.xyxy: tensor [N, 4]
        # r.boxes.cls: class indices
        # r.boxes.conf: confidence scores
        if r.boxes is None:
            continue

        # Move to CPU and numpy
        xyxy = r.boxes.xyxy
        cls = r.boxes.cls
        conf = r.boxes.conf

        # Handle both torch.Tensor or numpy
        xyxy = xyxy.cpu().numpy() if hasattr(xyxy, "cpu") else np.asarray(xyxy)
        cls = cls.cpu().numpy() if hasattr(cls, "cpu") else np.asarray(cls)
        conf = conf.cpu().numpy() if hasattr(conf, "cpu") else np.asarray(conf)

        for b, c, s in zip(xyxy, cls, conf):
            # Normalize & clamp
            nbox = _normalize_box_xyxy(b, w, h)

            # Class name lookup
            try:
                cname = model.names[int(c)]
            except Exception:
                cname = str(int(c))

            # Confidence in [0,1]
            try:
                cval = float(s)
                if cval > 1.0:  # some models return 0..100
                    cval = cval / 100.0
                cval = max(0.0, min(1.0, cval))
            except Exception:
                cval = 0.0

            out.append({
                "class": cname,
                "confidence": cval,
                "box": nbox
            })
    return out

# -------- CLI --------
def main():
    """
    Usage:
      python anomaly_detection.py --image "path/to/thermal.png" [--conf 0.25]
      python anomaly_detection.py --stdin [--conf 0.25]   < image_bytes
    Prints ONE compact JSON line to stdout: {"anomalies":[...]}
    All logs go to stderr.
    """
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--image", type=str, help="Path to thermal image")
    ap.add_argument("--stdin", action="store_true", help="Read image bytes from stdin")
    ap.add_argument("--conf", type=float, default=float(os.environ.get("CONF_THRESH", 0.25)),
                    help="Confidence threshold (default: 0.25)")
    args = ap.parse_args()

    img = None
    if args.stdin:
        img = _read_image_from_stdin()
        if img is None:
            logging.error("Failed to decode image from stdin")
            print(json.dumps({"anomalies": []}), end="")
            sys.exit(1)
    elif args.image:
        img = cv2.imread(args.image)
        if img is None:
            logging.error(f"Failed to read image: {args.image}")
            print(json.dumps({"anomalies": []}), end="")
            sys.exit(1)
    else:
        logging.error("No input provided. Use --image <path> or --stdin")
        print(json.dumps({"anomalies": []}), end="")
        sys.exit(1)

    try:
        detections = detect_on_image(img, conf_thresh=args.conf)
        # stdout must be ONLY the JSON
        print(json.dumps({"anomalies": detections}, separators=(",", ":")), end="")
    except Exception as e:
        logging.error(f"RUNTIME_ERROR: {e}", exc_info=True)
        print(json.dumps({"anomalies": []}), end="")
        sys.exit(4)

if __name__ == "__main__":
    main()
