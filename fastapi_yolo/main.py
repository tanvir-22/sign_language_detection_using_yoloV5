import base64
import io
import pathlib
import platform
import time

import numpy as np
import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# PyTorch 2.6+ defaults to weights_only=True, which breaks YOLOv5 checkpoints.
# Safe here because best.pt is your own trained model.
_orig_torch_load = torch.load


def _torch_load(*args, **kwargs):
    kwargs["weights_only"] = False
    return _orig_torch_load(*args, **kwargs)


torch.load = _torch_load

import yolov5  # noqa: E402


# ---------- App ----------
app = FastAPI(title="YOLOv5 Image Detector")

# Only needed if the Next.js app calls FastAPI directly (without the /api proxy)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Load the model ----------
# best.pt was saved on Linux and contains PosixPath objects; map them to
# WindowsPath only while loading on Windows.
_patched = []
if platform.system() == "Windows":
    # Python 3.13 keeps the class in pathlib._local; older versions in pathlib.
    for _mod in (pathlib, getattr(pathlib, "_local", None)):
        if _mod is not None and hasattr(_mod, "PosixPath"):
            _patched.append((_mod, _mod.PosixPath))
            _mod.PosixPath = pathlib.WindowsPath
try:
    model = yolov5.load("best.pt")
finally:
    for _mod, _orig in _patched:
        _mod.PosixPath = _orig

model.conf = 0.25  # default confidence threshold


# ---------- Helpers ----------
async def read_image(file: UploadFile) -> np.ndarray:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Please upload an image file")
    # np.array() makes a writable copy, which OpenCV needs to draw boxes
    return np.array(Image.open(io.BytesIO(await file.read())).convert("RGB"))


def get_detections(results):
    detections = []
    for x1, y1, x2, y2, conf, cls in results.pred[0].tolist():
        detections.append({
            "class": model.names[int(cls)],
            "confidence": round(conf, 3),
            "box": [round(v, 1) for v in (x1, y1, x2, y2)],
        })
    return sorted(detections, key=lambda d: -d["confidence"])


# ---------- Routes ----------
@app.post("/detect")
async def detect(file: UploadFile = File(...), conf: float = Form(0.25)):
    """Returns the annotated image (base64) and the list of detections."""
    img = await read_image(file)
    model.conf = conf

    start = time.time()
    results = model(img)
    detections = get_detections(results)
    rendered = results.render()[0]  # image with boxes drawn
    elapsed_ms = int((time.time() - start) * 1000)

    buffer = io.BytesIO()
    Image.fromarray(rendered).save(buffer, format="JPEG", quality=92)
    image_b64 = base64.b64encode(buffer.getvalue()).decode()

    return {
        "image": "data:image/jpeg;base64," + image_b64,
        "detections": detections,
        "ms": elapsed_ms,
    }


@app.post("/predict-json")
async def predict_json(file: UploadFile = File(...), conf: float = Form(0.25)):
    """Returns only the detections, no image."""
    img = await read_image(file)
    model.conf = conf
    return get_detections(model(img))