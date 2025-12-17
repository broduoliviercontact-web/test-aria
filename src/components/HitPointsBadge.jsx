// src/components/HitPointsBadge.jsx
import React, { useState } from "react";
import "./HitPointsBadge.css";

function HitPointsBadge({ value, onChange, size = 120 }) {
  const [isEditing, setIsEditing] = useState(false);

  const clampedValue = Math.max(0, value ?? 0);

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

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
  <div className="hp-badge-wrapper">
    <button
      type="button"
      className="hp-badge"
      style={{ width: size, height: size }}
      onClick={toggleEdit}
    >
      <img
        src="/pdv-icon.svg"
        alt="Points de vie"
        className="hp-badge-icon"
      />
      <div className="hp-badge-value">
        {clampedValue}
      </div>
    </button>

    {isEditing && (
      <div className="hp-badge-editor">
        <button
          type="button"
          className="hp-editor-btn"
          onClick={() => changeBy(-1)}
        >
          −1
        </button>

        <input
          type="number"
          className="hp-editor-input"
          value={clampedValue}
          min={0}
          onChange={handleInputChange}
        />

        <button
          type="button"
          className="hp-editor-btn"
          onClick={() => changeBy(+1)}
        >
          +1
        </button>
      </div>
    )}

    {/* ➕ Label sous l’icône */}
    <div className="hp-badge-label">Points de vie</div>
  </div>
);

}

export default HitPointsBadge;
