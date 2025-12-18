// src/components/CharacterStats.jsx
import React from "react";
import Counter from "./Counter";
import "./CharacterStats.css";

const LABEL_BY_ID = {
  // formats “long”
  force: "FOR",
  dexterite: "DEX",
  endurance: "END",
  intelligence: "INT",
  charisme: "CHA",

  // formats “court”
  FOR: "FOR",
  DEX: "DEX",
  END: "END",
  INT: "INT",
  CHA: "CHA",
};

function CharacterStats({ stats, onChangeStat, isLocked = false }) {
  return (
    <section className="character-stats">
      <h2>Caractéristiques</h2>

      <div className="stats-list">
        {stats.map((stat) => {
          const id = stat.id || stat.label || "";
          const label =
            stat.label ||
            LABEL_BY_ID[id] ||
            String(id).toUpperCase();

          return (
            <Counter
              key={id}
              label={label}
              value={stat.value}
              min={stat.min}
              max={stat.max}
              onDecrement={() => onChangeStat?.(stat.id, -1)}
              onIncrement={() => onChangeStat?.(stat.id, +1)}
              isLocked={isLocked}
            />
          );
        })}
      </div>
    </section>
  );
}

export default CharacterStats;
