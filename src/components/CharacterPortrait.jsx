// src/components/CharacterPortrait.jsx
import React, { useState } from "react";
import "./CharacterPortrait.css";

function CharacterPortrait({ imageUrl, onChangeImage }) {
  const [urlInput, setUrlInput] = useState("");

  const applyUrl = () => {
    if (!urlInput) return;
    onChangeImage(urlInput.trim());
    setUrlInput("");
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
            Aucun portrait<br />
            Colle une URL Google Drive / Imgur / Web
          </div>
        )}
      </div>

      {/* Champ URL */}
      <input
        type="text"
        className="portrait-url-input"
        placeholder="https://lien-vers-votre-image..."
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
      />

      <button
        type="button"
        className="portrait-upload-btn"
        onClick={applyUrl}
      >
        Charger depuis une URL
      </button>
    </section>
  );
}

export default CharacterPortrait;
