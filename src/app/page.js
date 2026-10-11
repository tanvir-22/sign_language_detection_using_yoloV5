"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import DropZone from "@/components/DropZone";
import ConfidenceSlider from "@/components/ConfidenceSlider";
import ImagePane from "@/components/ImagePane";
import Results from "@/components/Results";
import { detectImage } from "@/lib/detect";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [confidence, setConfidence] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);

  function selectFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(false);
  }

  // Allow pasting an image with Ctrl+V
  useEffect(() => {
    function handlePaste(event) {
      const pastedFile = event.clipboardData.files[0];
      if (pastedFile) {
        selectFile(pastedFile);
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  async function runDetection() {
    if (!selectedFile) {
      return;
    }
    setLoading(true);
    setError(false);

    try {
      setResult(await detectImage(selectedFile, confidence));
    } catch (err) {
      setError(true);
    }

    setLoading(false);
  }

  return (
    <div className="wrap">
      <Header />

      <div className="card">
        <DropZone onFileSelected={selectFile} />

        <div className="controls">
          <ConfidenceSlider value={confidence} onChange={setConfidence} />
          <button disabled={!selectedFile || loading} onClick={runDetection}>
            Detect
          </button>
        </div>

        <div className="grid">
          <ImagePane
            title="Input"
            imageUrl={previewUrl}
            placeholder="No image yet"
          />
          <ImagePane
            title="Result"
            imageUrl={result ? result.image : null}
            placeholder={error ? "Something went wrong" : "Results appear here"}
            loading={loading}
          />
        </div>

        {result && <Results result={result} />}
      </div>
    </div>
  );
}
