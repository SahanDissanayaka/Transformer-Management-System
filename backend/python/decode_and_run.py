#!/usr/bin/env python3
"""
Decode a base64 image from a file or stdin and run anomaly_detection.py on it.
Preserves the temp file on failure and prints stdout/stderr from the detector.

Usage examples:
  python decode_and_run.py --b64-file image_b64.txt
  type image_b64.txt | python decode_and_run.py --b64-stdin
  python decode_and_run.py --b64-str "<BASE64>"

"""
import sys
import os
import argparse
import base64
import tempfile
import subprocess
import shutil

HERE = os.path.dirname(os.path.abspath(__file__))
ANOMALY_SCRIPT = os.path.join(HERE, "anomaly_detection.py")


def decode_to_file(b64data, out_path):
    with open(out_path, "wb") as f:
        f.write(base64.b64decode(b64data))


def main():
    parser = argparse.ArgumentParser(description="Decode base64 image and run anomaly_detection.py")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--b64-file", help="Path to a file that contains base64 image data")
    group.add_argument("--b64-stdin", action="store_true", help="Read base64 from stdin")
    group.add_argument("--b64-str", help="Pass the base64 string directly (may be large; be careful with shell quoting)")
    parser.add_argument("--keep-on-fail", action="store_true", help="Keep temp image if detection fails (default: True)")
    args = parser.parse_args()

    if args.b64_file:
        with open(args.b64_file, "r", encoding="utf-8") as f:
            b64data = f.read().strip()
    elif args.b64_stdin:
        b64data = sys.stdin.read().strip()
    else:
        b64data = args.b64_str.strip()

    tmp_dir = tempfile.mkdtemp(prefix="yolo-run-")
    img_path = os.path.join(tmp_dir, "input.jpg")
    try:
        decode_to_file(b64data, img_path)
    except Exception as e:
        print("Failed to decode base64:", e, file=sys.stderr)
        shutil.rmtree(tmp_dir, ignore_errors=True)
        sys.exit(2)

    # Run the detection script using the same python interpreter
    cmd = [sys.executable, ANOMALY_SCRIPT, img_path]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    print("=== STDOUT (JSON) ===")
    print(proc.stdout.strip())
    print("=== STDERR (errors/logs) ===")
    print(proc.stderr.strip())

    if proc.returncode != 0:
        print(f"anomaly_detection.py exited with code {proc.returncode}", file=sys.stderr)
        print("Preserved temp image at:", img_path, file=sys.stderr)
        # leave temp dir so you can inspect it
        sys.exit(proc.returncode)
    else:
        # cleanup temp dir on success
        shutil.rmtree(tmp_dir, ignore_errors=True)
        sys.exit(0)


if __name__ == "__main__":
    main()
