export default function ConfidenceSlider({ value, onChange }) {
  return (
    <label>
      Confidence
      <input
        type="range"
        min="0.05"
        max="0.9"
        step="0.05"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span id="confv">{value.toFixed(2)}</span>
    </label>
  );
}
