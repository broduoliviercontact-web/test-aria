import React, { useState } from "react";
import "./GoldPouch.css";   // ⬅⬅⬅ ajouter ça
import Dice3D from "./Dice3D";

const FER_PER_COPPER = 10;
const FER_PER_SILVER = 100;
const FER_PER_GOLD = 1000;

function breakdown(totalFer) {
  const gold = Math.floor(totalFer / FER_PER_GOLD);
  const restG = totalFer % FER_PER_GOLD;

  const silver = Math.floor(restG / FER_PER_SILVER);
  const restS = restG % FER_PER_SILVER;

  const copper = Math.floor(restS / FER_PER_COPPER);
  const iron = restS % FER_PER_COPPER;

  return { gold, silver, copper, iron };
}

export default function GoldPouch({ totalFer, onChangeTotalFer,showStartingGold = false }) {
  const { gold, silver, copper, iron } = breakdown(totalFer);
  const [activeField, setActiveField] = useState(null);
  const [highlight, setHighlight] = useState(null); // {label, type: "plus"|"minus"}

  const modify = (amountFer) => {
    onChangeTotalFer((prev) => Math.max(0, prev + amountFer));
  };

  const handleModify = (label, ferDelta) => {
    setHighlight({
      label,
      type: ferDelta > 0 ? "plus" : "minus",
    });
    modify(ferDelta);
  };

  const rows = [
    { label: "Couronne", icon: "gold", value: gold, ferValue: FER_PER_GOLD },
    { label: "Orbes", icon: "silver", value: silver, ferValue: FER_PER_SILVER },
    { label: "Sceptres", icon: "copper", value: copper, ferValue: FER_PER_COPPER },
    { label: "Rois", icon: "iron", value: iron, ferValue: 1 },
  ];

  return (
    <section className="goldpouch-card">
      <h2 className="goldpouch-title">Bourse</h2>
  {/* Jet déplacé ailleurs (zone jets) */}

      {rows.map((row) => {
        const isHighlighted = highlight?.label === row.label;
        const highlightClass = isHighlighted
          ? highlight.type === "plus"
            ? "pouch-value--plus"
            : "pouch-value--minus"
          : "";

        return (
          <div key={row.label} className="pouch-row">
            <span className="pouch-label">
              <span className={`pouch-icon pouch-icon-${row.icon}`} />
              {row.label} :
            </span>

            <div
              className="pouch-value-container"
              onClick={() =>
                setActiveField((prev) =>
                  prev === row.label ? null : row.label
                )
              }
            >
              <span className={`pouch-value ${highlightClass}`}>
                {String(row.value).padStart(2, "0")}
              </span>

              {activeField === row.label && (
                <div className="pouch-popup">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModify(row.label, row.ferValue);
                    }}
                  >
                    ＋
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModify(row.label, -row.ferValue);
                    }}
                  >
                    −
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function StartingGoldBlock({ onConfirm }) {
  const [use3D, setUse3D] = useState(false);
  const [rolls, setRolls] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const addClassic = () => {
    const v = Math.floor(Math.random() * 10) + 1; // d10
    const id = (rolls[rolls.length - 1]?.id || 0) + 1;
    const r = { id, value: v };
    setRolls((p) => [...p, r]);
    setSelectedId(id);
  };

  const handle3DRoll = ({ total, rolls: arr }) => {
    const v =
      typeof total === "number"
        ? total
        : Array.isArray(arr) && arr.length
        ? arr.reduce((s, x) => s + x, 0)
        : 1;
    const id = (rolls[rolls.length - 1]?.id || 0) + 1;
    const r = { id, value: v };
    setRolls((p) => [...p, r]);
    setSelectedId(id);
  };

  const selected = rolls.find((r) => r.id === selectedId) || null;

  return (
    <div className="goldpouch-starting">
      <div className="goldpouch-starting__top">
        <label className="goldpouch-starting__switch">
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
          title={!selected ? "Fais un jet puis sélectionne-le." : ""}
        >
          Confirmer {selected ? `(${selected.value} couronnes)` : ""}
        </button>
      </div>

      <p className="goldpouch-starting__hint">
        Bourse de départ : <strong>1d10 Couronnes</strong>
      </p>

      {!use3D ? (
        <button type="button" className="btn-secondary" onClick={addClassic}>
          Lancer 1d10
        </button>
      ) : (
        <div className="goldpouch-starting__dice3d">
          <Dice3D notation="d10" height={200} onRoll={handle3DRoll} />
        </div>
      )}

      {rolls.length > 0 && (
        <div className="goldpouch-starting__list">
          {rolls.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={
                "goldpouch-starting__roll" +
                (r.id === selectedId ? " is-selected" : "")
              }
              onClick={() => setSelectedId(r.id)}
            >
              Jet {i + 1} : <strong>{r.value}</strong>
            </button>
          ))}
        </div>
      )}
    </div>
  );
function StartingGoldBlock({ onConfirm }) {
  const [use3D, setUse3D] = useState(false);
  const [rolls, setRolls] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const addClassic = () => {
    const v = Math.floor(Math.random() * 10) + 1; // d10
    const id = (rolls[rolls.length - 1]?.id || 0) + 1;
    const r = { id, value: v };
    setRolls((p) => [...p, r]);
    setSelectedId(id);
  };

  const handle3DRoll = ({ total, rolls: arr }) => {
    const v =
      typeof total === "number"
        ? total
        : Array.isArray(arr) && arr.length
        ? arr.reduce((s, x) => s + x, 0)
        : 1;

    const id = (rolls[rolls.length - 1]?.id || 0) + 1;
    const r = { id, value: v };
    setRolls((p) => [...p, r]);
    setSelectedId(id);
  };

  const selected = rolls.find((r) => r.id === selectedId) || null;

  return (
    <div className="goldpouch-starting">
      <div className="goldpouch-starting__top">
        <label className="goldpouch-starting__switch">
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
          title={!selected ? "Fais un jet puis sélectionne-le." : ""}
        >
          Confirmer {selected ? `(${selected.value} couronnes)` : ""}
        </button>
      </div>

      <p className="goldpouch-starting__hint">
        Bourse de départ : <strong>1d10 Couronnes</strong>
      </p>

      {!use3D ? (
        <button type="button" className="btn-secondary" onClick={addClassic}>
          Lancer 1d10
        </button>
      ) : (
        <div className="goldpouch-starting__dice3d">
          <Dice3D notation="d10" height={200} onRoll={handle3DRoll} />
        </div>
      )}

      {rolls.length > 0 && (
        <div className="goldpouch-starting__list">
          {rolls.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={
                "goldpouch-starting__roll" +
                (r.id === selectedId ? " is-selected" : "")
              }
              onClick={() => setSelectedId(r.id)}
            >
              Jet {i + 1} : <strong>{r.value}</strong>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
}
