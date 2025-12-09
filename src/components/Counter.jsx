// src/components/Counter.jsx
import React from "react";
import "./Counter.css";

function Counter({
  label,
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max = 20,
  step = 1,
  isLocked = false, // 👈 prop pour verrouiller l’affichage des boutons
}) {
  const canDecrement = value - step >= min;
  const canIncrement = value + step <= max;

  const isMin = value <= min;
  const isMax = value >= max;

  const valueClasses = ["counter-value"];
  if (isMin) valueClasses.push("dim");
  if (isMax) valueClasses.push("max");

  return (
    <div className="counter">
      {label && <span className="counter-label">{label}</span>}

      {/* Bouton - uniquement si non verrouillé */}
      {!isLocked && (
        <button
          className="counter-button minus"
          onClick={onDecrement}
          disabled={!canDecrement}
          aria-label="Diminuer"
          type="button"
        >
          <span className="btn-inner">
            <i className="icon-minus" aria-hidden="true" />
            <p></p>
          </span>
        </button>
      )}

      <span className={valueClasses.join(" ")}>
        {isMax ? `${value}+` : value}
      </span>

      {/* Bouton + uniquement si non verrouillé */}
      {!isLocked && (
        <button
          className={`counter-button plus ${isMax ? "maxed" : ""}`}
          onClick={onIncrement}
          disabled={!canIncrement}
          aria-label="Augmenter"
          type="button"
        >
          <span className="btn-inner">
            <i className="icon-plus" aria-hidden="true" />
            <p></p>
          </span>
        </button>
      )}
    </div>
  );
}

export default Counter;
