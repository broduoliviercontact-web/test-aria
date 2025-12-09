// src/components/CharacterPortrait.jsx
import React from "react";
import "./CharacterPortrait.css"; // si tu veux une CSS séparée

function CharacterPortrait({ imageUrl, onChangeImage }) {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string" && onChangeImage) {
        onChangeImage(result); // data URL
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="portrait-card">
      <h2 className="identity-title">Portrait</h2>

      <div className="portrait-frame">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Portrait du personnage"
            className="portrait-img"
          />
        ) : (
          <div className="portrait-placeholder">
            Aucun portrait
          </div>
        )}
      </div>

      <label className="portrait-upload-btn">
        Choisir une image
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </label>
    </section>
  );
}

export default CharacterPortrait;
