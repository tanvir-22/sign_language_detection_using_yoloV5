// One detection: label | confidence bar | percent
export default function DetectionRow({ detection }) {
  const percent = detection.confidence * 100;

  return (
    <div className="row">
      <span>{detection.class}</span>
      <div className="bar">
        <i style={{ width: percent + "%" }}></i>
      </div>
      <em>{percent.toFixed(0)}%</em>
    </div>
  );
}
