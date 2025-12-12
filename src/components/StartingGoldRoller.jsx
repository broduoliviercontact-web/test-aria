import React, { useMemo, useState } from "react";
import Dice3D from "./Dice3D";
import "./StartingGoldRoller.css";

const MAX_ROLLS = 5;

function rollD10() {
  return Math.floor(Math.random() * 10) + 1;
}

export default function StartingGoldRoller({ onConfirm }) {
  const [use3D, setUse3D] = useState(false);
  const [rolls, setRolls] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const nextId = useMemo(() => (rolls[rolls.length - 1]?.id || 0) + 1, [rolls]);
  const selected = rolls.find(r => r.id === selectedId) || null;

  const addClassic = () => {
    if (rolls.length >= MAX_ROLLS) return;
    const r = { id: nextId, value: rollD10() };
    setRolls(p => [...p, r]);
    setSelectedId(r.id);
  };

  const handle3DRoll = ({ total }) => {
    if (rolls.length >= MAX_ROLLS) return;
    const v = typeof total === "number" ? total : 1;
    const r = { id: nextId, value: v };
    setRolls(p => [...p, r]);
    setSelectedId(r.id);
  };

  return (
    <section className="starting-gold-roller">
      <div className="starting-gold-roller__top">
        <label className="starting-gold-roller__switch">
          <input
            type="checkbox"
            checked={use3D}
            onChange={(e) => setUse3D(e.target.checked)}
          />
          Dés 3D
        </label>

        <button
          type="button"
          className="btn-primary"
          disabled={!selected}
          onClick={() => onConfirm(selected.value)}
        >
          Confirmer {selected ? `(${selected.value} couronnes)` : ""}
        </button>
      </div>

      <p className="starting-gold-roller__hint">
        Bourse de départ : <strong>1d10 Couronnes</strong>
      </p>

      {!use3D ? (
        <button type="button" className="dice-button" onClick={addClassic}>
          Lancer 1d10
        </button>
      ) : (
        <div className="starting-gold-roller__dice3d">
          {/* ✅ plus grand que dans le top grid */}
          <Dice3D notation="d10" height={320} onRoll={handle3DRoll} />
        </div>
      )}

      {rolls.length > 0 && (
        <div className="starting-gold-roller__list">
          {rolls.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={
                "starting-gold-roller__roll" + (r.id === selectedId ? " is-selected" : "")
              }
              onClick={() => setSelectedId(r.id)}
            >
              Jet {i + 1} : <strong>{r.value}</strong>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
