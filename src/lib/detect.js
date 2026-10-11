// Sends an image to the FastAPI backend (proxied through /api in next.config.mjs)
export async function detectImage(file, confidence) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("conf", confidence);

  const response = await fetch("/api/detect", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Server error");
  }
  return response.json(); // { image, detections, ms }
}
