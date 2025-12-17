// src/components/CharacterStats.jsx
import React from "react";
import Counter from "./Counter";
import "./CharacterStats.css";

function CharacterStats({ stats, onChangeStat, isLocked = false }) {
  return (
    <section className="character-stats">
      <h2>Caractéristiques</h2>

      <div className="stats-list">
        {stats.map((stat) => (
          <Counter
            key={stat.id || stat.label}
            label={stat.label}
            value={stat.value}
            min={stat.min}
            max={stat.max}
            onDecrement={() => onChangeStat(stat.id, -1)}
            onIncrement={() => onChangeStat(stat.id, +1)}
            isLocked={isLocked}
          />
        ))}
      </div>
    </section>
  );
}


export default CharacterStats;
