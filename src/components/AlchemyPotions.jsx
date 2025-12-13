import React from "react";
import "./AlchemyPotions.css";

const MIN_ROWS = 1;

export default function AlchemyPotions({ potions, onChange }) {
  const realRows = potions || [];
  const rows = [...realRows];

  while (rows.length < MIN_ROWS) {
    rows.push({
      id: `placeholder-${rows.length}`,
      name: "",
      components: "",
      effect: "",
      difficulty: "",
      quantity: "",
    });
  }

  const ensureRow = (row, index) => ({
    id: row?.id || `potion-${index}`,
    name: row?.name || "",
    components: row?.components || "",
    effect: row?.effect || "",
    difficulty: row?.difficulty || "",
    quantity: row?.quantity || "",
  });

  const handleChange = (index, field, value) => {
    const updated = [...realRows];
    updated[index] = { ...ensureRow(updated[index], index), [field]: value };
    onChange(updated);
  };

  const handleAddRow = () => {
    onChange([
      ...realRows,
      {
        id: `potion-${realRows.length}`,
        name: "",
        components: "",
        effect: "",
        difficulty: "",
        quantity: "",
      },
    ]);
  };

  const handleDeleteRow = (index) => {
    onChange(realRows.filter((_, i) => i !== index));
  };

  return (
    <section className="alchemy-card">
      <div className="alchemy-titleRow">
        <h2 className="alchemy-title">Alchimie – Potions</h2>
        <div className="alchemy-titleLogo" aria-hidden="true" />
      </div>

      <div className="alchemy-table">
<div className="alchemy-header">
  <span className="alchemy-col-name">Potion</span>
  <span className="alchemy-col-components">Composants</span>
  <span className="alchemy-col-difficulty">Diff.</span>
  <span className="alchemy-col-qty">Qté</span>
  <span className="alchemy-col-delete" aria-hidden="true" />
</div>

        {rows.map((row, index) => {
          const isReal = index < realRows.length;

          return (
            <div key={row.id || index} className="alchemy-row">
              {/* LIGNE 1 */}
              <input
                className="alchemy-input name-input"
                placeholder="Nom de la potion"
                value={row.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
              />

              <input
                className="alchemy-input components-input"
                placeholder="Soufre, racine…"
                value={row.components}
                onChange={(e) => handleChange(index, "components", e.target.value)}
              />

              <div className="difficulty-wrapper">
                <input
                  className="alchemy-input difficulty-input"
                  placeholder="0"
                  value={row.difficulty}
                  onChange={(e) =>
                    handleChange(index, "difficulty", e.target.value)
                  }
                />
                <span className="difficulty-suffix">%</span>
              </div>

              <input
                className="alchemy-input qty-input"
                placeholder="0"
                value={row.quantity}
                onChange={(e) => handleChange(index, "quantity", e.target.value)}
              />

              {isReal ? (
                <button
                  className="delete-potion-btn"
                  onClick={() => handleDeleteRow(index)}
                  aria-label="Supprimer cette potion"
                >
                  ✕
                </button>
              ) : (
                <span className="delete-potion-spacer" />
              )}

              {/* LIGNE 2 */}
              <h3 className="alchemy-subtitle effect-title">EFFET</h3>

              {/* LIGNE 3 */}
              <textarea
                className="alchemy-input effect-input"
                placeholder="Effet principal"
                value={row.effect}
                onChange={(e) => handleChange(index, "effect", e.target.value)}
                rows={3}
              />
            </div>
          );
        })}
      </div>

      <div className="alchemy-actions">
        <button type="button" className="ui-checkbox-btn" onClick={handleAddRow}>
          + Ajouter une potion
        </button>
      </div>
    </section>
  );
}
