// src/components/AlchemyToggleButton.jsx
import React from "react";
import "./AlchemyToggleButton.css";

function AlchemyToggleButton({ active, onToggle }) {
  return (
    <button
      type="button"
      className={`potion-toggle-button ${active ? "is-active" : ""}`}
      onClick={onToggle}
      aria-pressed={active}
    >
      <div className="potion-container">
        <div className="potion-top">
          <div className="potion-top-line" />
        </div>
        <div className="potion-neck" />
        <div className="potion-body">
          <div className="potion-content">
            <div className="blob-container">
              <div className="blob blob-one" />
              <div className="blob blob-two" />
              <div className="blob blob-three" />
            </div>
          </div>
        </div>
      </div>

      <span className="potion-toggle-label">
        {active ? "Alchimiste ✔" : "Choisir l’alchimie"}
      </span>
    </button>
  );
}

export default AlchemyToggleButton;
