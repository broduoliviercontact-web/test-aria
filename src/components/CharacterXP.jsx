// src/components/CharacterXP.jsx
import React from "react";
import "./CharacterXP.css";

function CharacterXP({ xp, onChangeXp }) {
  const updateXp = (delta) => {
    const next = Math.max(0, xp + delta); // jamais d'XP négative
    onChangeXp(next);
  };

  const handleInputChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (Number.isNaN(value)) {
      onChangeXp(0);
    } else {
      onChangeXp(Math.max(0, value));
    }
  };

  return (
    <section className="character-xp">
      <h2>Expérience</h2>

      <div className="xp-row">
        <button
          type="button"
          className="xp-btn"
          onClick={() => updateXp(-10)}
        >
          −10
        </button>
        <button
          type="button"
          className="xp-btn"
          onClick={() => updateXp(-1)}
        >
          −1
        </button>

        <div className="xp-value-wrapper">
          <input
            type="number"
            className="xp-input"
            value={xp}
            onChange={handleInputChange}
            min={0}
          />
          <span className="xp-suffix">XP</span>
        </div>

        <button
          type="button"
          className="xp-btn"
          onClick={() => updateXp(1)}
        >
          +1
        </button>
        <button
          type="button"
          className="xp-btn"
          onClick={() => updateXp(10)}
        >
          +10
        </button>
      </div>

      <p className="xp-hint">
        Utilisez ce champ pour suivre l’évolution du personnage pendant la campagne.
      </p>
    </section>
  );
}

export default CharacterXP;
