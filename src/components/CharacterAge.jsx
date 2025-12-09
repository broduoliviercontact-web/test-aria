// src/components/CharacterAge.jsx
import React from "react";
import "./CharacterAge.css";

function CharacterAge({ age, onAgeChange }) {
  const handleChange = (event) => {
    onAgeChange(event.target.value);
  };

  return (
    <section className="character-age">
      <label className="character-age-label" htmlFor="character-age-input">
        Âge 
      </label>

      <input
        id="character-age-input"
        className="character-age-input"
        type="text"
        value={age}
        onChange={handleChange}
        placeholder="Âge"
      />
    </section>
  );
}

export default CharacterAge;
