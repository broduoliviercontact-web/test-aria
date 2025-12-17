// src/components/CharacterName.jsx
import React from "react";
import "./CharacterName.css";

function CharacterName({ name, onNameChange }) {
  const handleChange = (event) => {
    onNameChange(event.target.value);
  };

  return (
    <section className="character-name">
      <label className="character-name-label" htmlFor="character-name-input">
        Nom 
      </label>

      <input
        id="character-name-input"
        className="character-name-input"
        type="text"
        value={name}
        onChange={handleChange}
        placeholder="    de votre héros…"
      />
    </section>
  );
}

export default CharacterName;
