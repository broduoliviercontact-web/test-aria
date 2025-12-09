import React, { useState } from "react";
import "./BlessureBadge.css";

function BlessureBadge({ value, onChange, size = 120 }) {
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
    <div className="blessure-badge-wrapper">
      <button
        type="button"
        className="blessure-badge"
        style={{ width: size, height: size }}
        onClick={toggleEdit}
      >
        <img
          src="/blessur-icon.svg"
          alt="Blessures"
          className="blessure-badge-icon"
        />
        <div className="blessure-badge-value">
          {clampedValue}
        </div>
      </button>

      {isEditing && (
        <div className="blessure-badge-editor">
          <button
            type="button"
            className="blessure-editor-btn"
            onClick={() => changeBy(-1)}
          >
            −1
          </button>

          <input
            type="number"
            className="blessure-editor-input"
            value={clampedValue}
            min={0}
            onChange={handleInputChange}
          />

          <button
            type="button"
            className="blessure-editor-btn"
            onClick={() => changeBy(+1)}
          >
            +1
          </button>
        </div>
      )}

      <div className="blessure-badge-label">Blessures</div>
    </div>
  );
}

export default BlessureBadge;
