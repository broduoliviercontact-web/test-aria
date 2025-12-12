import React, { useMemo, useState } from "react";
import Dice3D from "./Dice3D";
import "./StartingGoldRoller.css";

const MAX_ROLLS = 1;

function rollD10() {
  return Math.floor(Math.random() * 10) + 1;
}

export default function StartingGoldRoller({ onConfirm }) {
  const [use3D, setUse3D] = useState(false);
  const [rolls, setRolls] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const nextId = useMemo(
    () => (rolls[rolls.length - 1]?.id || 0) + 1,
    [rolls]
  );

  const selected = rolls.find((r) => r.id === selectedId) || null;
  const hasRolled = rolls.length >= MAX_ROLLS;

  const addClassic = () => {
    if (hasRolled) return;
    const r = { id: nextId, value: rollD10() };
    setRolls([r]);
    setSelectedId(r.id);
  };

  const handle3DRoll = ({ total }) => {
    if (hasRolled) return;
    const v = typeof total === "number" ? total : 1;
    const r = { id: nextId, value: v };
    setRolls([r]);
    setSelectedId(r.id);
  };

  return (
    <section className="starting-gold-roller">
      {/* Switch 2D / 3D */}
      <div className="starting-gold-roller__switchRow">
        <label className="ui-checkbox starting-gold-roller__switch">
          <input
            className="ui-checkbox__input"
            type="checkbox"
            checked={use3D}
            onChange={(e) => setUse3D(e.target.checked)}
            disabled={hasRolled}
          />

          <span className="ui-checkbox__box" aria-hidden="true">
            <svg className="ui-checkbox__tick" viewBox="0 0 24 24">
              <path
                d="M20 6L9 17l-5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span className="ui-checkbox__label">Utiliser les dés 3D</span>
        </label>
      </div>

      {/* Jet */}
      {!use3D ? (
        <button
          type="button"
          className="dice-button"
          onClick={addClassic}
          disabled={hasRolled}
        >
          {hasRolled ? "Jet effectué" : "Lancer 1d10"}
        </button>
      ) : hasRolled ? (
        <p className="starting-gold-roller__locked">
          Jet 3D effectué. Confirme pour valider.
        </p>
      ) : (
        <div className="starting-gold-roller__dice3d">
          <Dice3D notation="d10" height={320} onRoll={handle3DRoll} />
        </div>
      )}

      <p className="starting-gold-roller__hint">
        Bourse de départ : <strong>1d10 Couronnes</strong>
      </p>

      {/* Résultat */}
      {selected && (
        <div className="starting-gold-roller__list">
          <div className="starting-gold-roller__roll is-selected">
            Résultat : <strong>{selected.value} couronnes</strong>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => onConfirm(selected.value)}
          >
            Confirmer la bourse
          </button>
        </div>
      )}
    </section>
  );
}
