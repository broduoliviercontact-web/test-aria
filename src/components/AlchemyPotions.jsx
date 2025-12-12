// src/components/AlchemyPotions.jsx
import React from "react";
import "./AlchemyPotions.css";

const MIN_ROWS = 1;

function AlchemyPotions({ potions, onChange }) {
  const realRows = potions || [];
  const rows = [...realRows];

  while (rows.length < MIN_ROWS) {
    rows.push({
      id: `placeholder-${rows.length}`,
      name: "",
      effect: "",
      difficulty: "",
      quantity: "",
    });
  }

  const handleFieldChange = (index, field, value) => {
    const updated = [...realRows];

    if (!updated[index]) {
      updated[index] = {
        id: `potion-${index}`,
        name: "",
        effect: "",
        difficulty: "",
        quantity: "",
      };
    }

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    onChange(updated);
  };

  const handleAddRow = () => {
    const updated = [
      ...realRows,
      {
        id: `potion-${realRows.length}`,
        name: "",
        effect: "",
        difficulty: "",
        quantity: "",
      },
    ];
    onChange(updated);
  };

  const handleDeleteRow = (indexToDelete) => {
    const updated = realRows.filter((_, i) => i !== indexToDelete);
    onChange(updated);
  };

  return (
    <section className="alchemy-card">
      {/* ✅ Titre + logo potion (design only) */}
      <div className="alchemy-titleRow">
        

        <h2 className="alchemy-title">Alchimie – Potions</h2>
        <div className="alchemy-titleLogo" aria-hidden="true">
          <div className="potion-container potion-container--mini">
            <div className="potion-top">
              <div className="potion-top-line" />
            </div>
            <div className="potion-neck" />
            <div className="potion-body">
              <div className="potion-content">
                <div className="blob-container">
                  <div className="blob blob-one" />
                  <div className="blob blob-two" />
                  <div className="blob blob-three" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="alchemy-table">
        <div className="alchemy-header row">
          <span className="alchemy-col-name">Potion</span>
          <span className="alchemy-col-effect">Effet</span>
          <span className="alchemy-col-difficulty">Diff.</span>
          <span className="alchemy-col-qty">Qté</span>
          <span className="alchemy-col-delete" />
        </div>

        {rows.map((row, index) => {
          const isReal = index < realRows.length;

          return (
            <div key={row.id || index} className="alchemy-row row">
              {/* Nom */}
              <input
                type="text"
                className="alchemy-input name-input"
                value={row.name}
                placeholder="Nom de la potion"
                onChange={(e) => handleFieldChange(index, "name", e.target.value)}
              />

              {/* Effet */}
              <textarea
                className="alchemy-input effect-input"
                value={row.effect}
                placeholder="Effet principal"
                rows={2}
                onChange={(e) =>
                  handleFieldChange(index, "effect", e.target.value)
                }
              />

              {/* Difficulté */}
              <div className="difficulty-wrapper">
                <input
                  type="text"
                  className="alchemy-input difficulty-input"
                  value={row.difficulty}
                  min={0}
                  max={100}
                  placeholder="0"
                  onChange={(e) =>
                    handleFieldChange(index, "difficulty", e.target.value)
                  }
                />
                <span className="difficulty-suffix">%</span>
              </div>

              {/* Quantité */}
              <input
                type="text"
                className="alchemy-input qty-input"
                value={row.quantity}
                min={0}
                placeholder="0"
                onChange={(e) =>
                  handleFieldChange(index, "quantity", e.target.value)
                }
              />

              {/* Delete */}
              {isReal ? (
                <button
                  type="button"
                  className="delete-potion-btn"
                  onClick={() => handleDeleteRow(index)}
                  aria-label="Supprimer cette potion"
                >
                  ✕
                </button>
              ) : (
                <span className="col-delete" />
              )}
            </div>
          );
        })}
      </div>

      <div className="alchemy-actions">
        <button
          type="button"
          className="ui-checkbox-btn add-potion-btn"
          onClick={handleAddRow}
        >
          + Ajouter une potion
        </button>
      </div>
    </section>
  );
}

export default AlchemyPotions;
