// src/components/SpecialCompetences.jsx
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
      <h2>Compétences spéciales</h2>

      <div className="special-competences-table">
        <div className="special-header row">
          <span className="special-col-name">Compétence</span>
          <span className="col-link">Lien</span>
          <span className="col-score">Score</span>
          <span className="col-test">Test</span>
          <span className="col-delete" />
        </div>

        {rows.map((row, index) => {
          const isReal = index < realRows.length;
          const last = row?.id ? resultsByKey[row.id] : null;

          return (
            <div key={row.id || index} className="special-row row">
              <input
                type="text"
                className="special-input special-name-input"
                value={row.name}
                placeholder="Nom de la compétence"
                onChange={(e) => handleFieldChange(index, "name", e.target.value)}
              />

              <input
                type="text"
                className="special-input special-link-input"
                value={row.link}
                placeholder="FOR/DEX"
                onChange={(e) => handleFieldChange(index, "link", e.target.value)}
              />

              <div className="score-wrapper">
                <input
                  type="text"
                  className="special-input special-score-input"
                  value={row.score}
                  min={0}
                  max={100}
                  placeholder="0"
                  onChange={(e) => handleFieldChange(index, "score", e.target.value)}
                />
                <span className="score-suffix">%</span>
              </div>

              {isReal ? (
                <button
                  type="button"
                  className="special-test-btn"
                  onClick={() => handleTest(row)}
                  disabled={!row.score || Number.isNaN(Number(row.score))}
                  title={last ? `Dernier : ${last.total}/${last.target}` : "Lancer un d100"}
                  aria-label={`Tester ${row.name || "la compétence"} au d100`}
                >
                  🎲
                  {last ? (
                    <span className={"special-test-result" + (last.success ? " ok" : " ko")}>
                      {last.total}/{last.target}
                    </span>
                  ) : null}
                </button>
              ) : (
                <span className="col-test" />
              )}

              {isReal ? (
                <button
                  type="button"
                  className="delete-special-btn"
                  onClick={() => handleDeleteRow(index)}
                  aria-label="Supprimer cette compétence spéciale"
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

      <div className="special-actions">
        <button type="button" className="add-special-btn" onClick={handleAddRow}>
          + Ajouter une compétence spéciale
        </button>
      </div>
    </section>
  );
}

export default SpecialCompetences;
