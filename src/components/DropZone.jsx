"use client";

import { useRef, useState } from "react";

export default function DropZone({ onFileSelected }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    onFileSelected(event.dataTransfer.files[0]);
  }

  return (
    <div
      id="drop"
      className={isDragging ? "over" : ""}
      onClick={() => fileInputRef.current.click()}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="ico">📷</div>
      <b>Drop an image here or click to browse</b>
      <span>PNG, JPG, WEBP</span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => onFileSelected(event.target.files[0])}
      />
    </div>
  );
}
