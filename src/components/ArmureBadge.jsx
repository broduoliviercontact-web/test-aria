// src/components/ArmureBadge.jsx
import React, { useState } from "react";
import "./ArmureBadge.css";

function ArmureBadge({ value, onChange, size = 120 }) {
  const [isEditing, setIsEditing] = useState(false);
  const clampedValue = Math.max(0, value ?? 0);

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const changeBy = (delta) => {
    if (!onChange) return;
    let next = clampedValue + delta;
    if (next < 0) next = 0;
    onChange(next);
  };

  const handleInputChange = (e) => {
    if (!onChange) return;
    const raw = e.target.value;

    if (raw === "") {
      onChange(0);
      return;
    }

    let next = parseInt(raw, 10);
    if (Number.isNaN(next)) return;
    if (next < 0) next = 0;
    onChange(next);
  };

  return (
    <div className="armure-badge-wrapper">
      <button
        type="button"
        className="armure-badge"
        style={{ width: size, height: size }}
        onClick={toggleEdit}
      >
        <img
          src="/armure-icon.svg"
          alt="Armure"
          className="armure-badge-icon"
        />
        <div className="armure-badge-value">
          {clampedValue}
        </div>
      </button>

      {isEditing && (
        <div className="armure-badge-editor">
          <button
            type="button"
            className="armure-editor-btn"
            onClick={() => changeBy(-1)}
          >
            −1
          </button>

          <input
            type="number"
            className="armure-editor-input"
            value={clampedValue}
            min={0}
            onChange={handleInputChange}
          />

          <button
            type="button"
            className="armure-editor-btn"
            onClick={() => changeBy(+1)}
          >
            +1
          </button>
        </div>
      )}

      <div className="armure-badge-label">Armure</div>
    </div>
  );
}

export default ArmureBadge;
