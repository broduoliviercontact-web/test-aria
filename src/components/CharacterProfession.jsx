// src/components/CharacterProfession.jsx
import React from "react";
import "./CharacterProfession.css";

function CharacterProfession({ profession, onProfessionChange }) {
  const handleChange = (event) => {
    onProfessionChange(event.target.value);
  };

  return (
    <section className="character-profession">
      <label
        className="character-profession-label"
        htmlFor="character-profession-input"
      >
        Profession
      </label>

      <input
        id="character-profession-input"
        className="character-profession-input"
        type="text"
        value={profession}
        onChange={handleChange}
        placeholder="Mage, voleur, ménestrel..."
      />
    </section>
  );
}

export default CharacterProfession;
