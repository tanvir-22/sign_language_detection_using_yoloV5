// A box that shows an image, a spinner, or a placeholder text
export default function ImagePane({ title, imageUrl, placeholder, loading }) {
  let content;

  if (loading) {
    content = <div className="spin"></div>;
  } else if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    content = <img src={imageUrl} alt={title} />;
  } else {
    content = <span className="ph">{placeholder}</span>;
  }

  return (
    <div className="pane">
      <h3>{title}</h3>
      <div className="frame">{content}</div>
    </div>
  );
}
