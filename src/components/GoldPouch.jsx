import React, { useState } from "react";
import "./GoldPouch.css";   // ⬅⬅⬅ ajouter ça

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

export default function GoldPouch({ totalFer, onChangeTotalFer }) {
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
    { label: "or", icon: "gold", value: gold, ferValue: FER_PER_GOLD },
    { label: "argent", icon: "silver", value: silver, ferValue: FER_PER_SILVER },
    { label: "cuivre", icon: "copper", value: copper, ferValue: FER_PER_COPPER },
    { label: "fer", icon: "iron", value: iron, ferValue: 1 },
  ];

  return (
    <section className="goldpouch-card">
      <h2 className="goldpouch-title">Bourse</h2>

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
