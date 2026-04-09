import { useRef } from "react";

export default function PlayerAvatar({ image, setImage }) {
  const inputRef = useRef();

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  }

  return (
    <div className="avatar-container">
      <div
        className="avatar"
        onClick={() => inputRef.current.click()}
      >
        {image ? (
          <img src={image} alt="avatar" />
        ) : (
          <span>+</span>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImage}
        hidden
      />
    </div>
  );
}