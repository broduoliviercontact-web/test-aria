import React from "react";
import "./SpecialCompetences.css";
import { useDiceRoll } from "./DiceRollContext";

const MIN_ROWS = 1;

function SpecialCompetences({ specialCompetences, onChange }) {
  const { requestRoll, resultsByKey } = useDiceRoll();

  const realRows = specialCompetences || [];

  const rows = [...realRows];
  while (rows.length < MIN_ROWS) {
    rows.push({
      id: `placeholder-${rows.length}`,
      name: "",
      link: "",
      score: "",
    });
  }

  const handleFieldChange = (index, field, value) => {
    const updated = [...realRows];

    if (!updated[index]) {
      updated[index] = {
        id: `special-${index}`,
        name: "",
        link: "",
        score: "",
      };
    }

    // ✅ si ligne verrouillée, pas d’édition
    if (updated[index]?.locked) return;

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
        id: `special-${realRows.length}`,
        name: "",
        link: "",
        score: "",
      },
    ];
    onChange(updated);
  };

  const handleDeleteRow = (indexToDelete) => {
    // ✅ empêcher de supprimer une ligne verrouillée
    const row = realRows[indexToDelete];
    if (row?.locked) return;

    const updated = realRows.filter((_, i) => i !== indexToDelete);
    onChange(updated);
  };

  const handleTest = (row) => {
    const target = Number(row.score);
    if (!Number.isFinite(target)) return;

    requestRoll({
      mode: "special",
      entityKey: row.id,
      label: row.name || "Compétence spéciale",
      target,
      notation: "d100",
    });
  };

  return (
    <section className="special-competences">
      <div className="special-competences-tititle">
        <img src="/icons/gem.gif" className="gem" alt="Armes" />
        <h2 className="inventory-title">Compétences spéciales</h2>
        <img src="/icons/gem.gif" className="gem" alt="Armes" />
      </div>

      <div className="special-competences-table">
        <div className="special-header row">
          <span className="special-col-name">Compétence</span>
          <span className="col-link">Lien</span>
          <span className="col-score">Score</span>
          <span className="col-delete" />
        </div>

        {rows.map((row, index) => {
          const isReal = index < realRows.length;
          const isLocked = !!row?.locked;
          const last = row?.id ? resultsByKey[row.id] : null;

          return (
            <div
              key={row.id || index}
              className={`special-row row ${isLocked ? "is-locked" : ""}`}
            >
              <input
                type="text"
                className="special-input special-name-input"
                value={row.name}
                placeholder="Nom de la compétence"
                readOnly={isLocked}
                onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                title={isLocked ? "Compétence accordée par le type (verrouillée)" : ""}
              />

              <input
                type="text"
                className="special-input special-link-input"
                value={row.link}
                placeholder="FOR/DEX"
                readOnly={isLocked}
                onChange={(e) => handleFieldChange(index, "link", e.target.value)}
                title={isLocked ? "Compétence accordée par le type (verrouillée)" : ""}
              />

              <div className="score-wrapper">
                <input
                  type="text"
                  className="special-input special-score-input"
                  value={row.score}
                  min={0}
                  max={100}
                  placeholder="0"
                  readOnly={isLocked}
                  onChange={(e) => handleFieldChange(index, "score", e.target.value)}
                  title={isLocked ? "Score imposé par le type (verrouillé)" : ""}
                />
                <span className="score-suffix">%</span>
              </div>

              {/* (optionnel) bouton test sur les compétences spéciales */}
              {/* Tu peux décommenter si tu veux un test:
              <button type="button" onClick={() => handleTest(row)}>🎲</button>
              */}

              {isReal ? (
                isLocked ? (
                  <span className="col-delete" title="Verrouillé">🔒</span>
                ) : (
                  <button
                    type="button"
                    className="delete-special-btn"
                    onClick={() => handleDeleteRow(index)}
                    aria-label="Supprimer cette compétence spéciale"
                  >
                    ✕
                  </button>
                )
              ) : (
                <span className="col-delete" />
              )}
            </div>
          );
        })}
      </div>

      <div className="special-actions">
        <button type="button" className="add-special-btn" onClick={handleAddRow}>
          + Ajouter une compétence spéciale
        </button>
      </div>
    </section>
  );
}

export default SpecialCompetences;
