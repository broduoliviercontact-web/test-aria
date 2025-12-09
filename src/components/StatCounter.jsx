// src/StatCounter.jsx
import React from "react";
import "./StatCounter.css"; // <-- on importe le CSS ici

function StatCounter({ label, value, onIncrement, onDecrement, min = 0, max = 20 }) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className="stat-counter">
      <span className="stat-label">{label}</span>

      <button
        className="stat-button"
        onClick={onDecrement}
        disabled={!canDecrement}
      >
        -
      </button>

      <span className="stat-value">{value}</span>

      <button
        className="stat-button"
        onClick={onIncrement}
        disabled={!canIncrement}
      >
        +
      </button>
    </div>
  );
}

export default StatCounter;
