// src/components/CharacterPlayer.jsx
import React from "react";
import "./CharacterPlayer.css";

function CharacterPlayer({ playerName, onPlayerNameChange }) {
  const handleChange = (event) => {
    onPlayerNameChange(event.target.value);
  };

  return (
    <section className="character-player">
      <label
        className="character-player-label"
        htmlFor="character-player-input"
      >
        Nom du joueur
      </label>

      <input
        id="character-player-input"
        className="character-player-input"
        type="text"
        value={playerName}
        onChange={handleChange}
        placeholder="Qui incarne ce personnage ?"
      />
    </section>
  );
}

export default CharacterPlayer;
