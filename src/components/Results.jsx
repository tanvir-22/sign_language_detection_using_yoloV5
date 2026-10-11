import DetectionRow from "./DetectionRow";

export default function Results({ result }) {
  const { detections, ms } = result;

  return (
    <div id="res">
      <div className="meta">
        <h3>Detections</h3>
        <span className="pill">
          {detections.length} found · {ms} ms
        </span>
      </div>

      <div className="det">
        {detections.length === 0 ? (
          <div className="empty">
            Nothing detected. Try lowering the confidence slider.
          </div>
        ) : (
          detections.map((detection, index) => (
            <DetectionRow key={index} detection={detection} />
          ))
        )}
      </div>
    </div>
  );
}
