import React, { useMemo, useState } from "react";
import { useDiceRoll } from "./DiceRollContext";
import "./SkillTestPanel.css";

export default function SkillTestPanel({ competences, specialCompetences }) {
  const { requestRoll, resultsByKey } = useDiceRoll();

  const [selectedKey, setSelectedKey] = useState("");

  const options = useMemo(() => {
    const normal = Array.isArray(competences) ? competences : [];
    const special = Array.isArray(specialCompetences) ? specialCompetences : [];

    const normalOpts = normal
      .filter((c) => c && c.id)
      .map((c) => ({
        key: `c:${c.id}`,
        label: c.name || c.id,
        target: Number(c.score) || 0,
        entityKey: c.id,
        mode: "competence",
      }));

    const specialOpts = special
      .filter((s) => s && s.id && (s.name || s.score))
      .map((s) => ({
        key: `s:${s.id}`,
        label: s.name || "Compétence spéciale",
        target: Number(s.score) || 0,
        entityKey: s.id,
        mode: "special",
      }));

    return { normalOpts, specialOpts };
  }, [competences, specialCompetences]);

  const selected = useMemo(() => {
    const all = [...options.normalOpts, ...options.specialOpts];
    return all.find((o) => o.key === selectedKey) || null;
  }, [options, selectedKey]);

  const last = selected ? resultsByKey[selected.entityKey] : null;

  const canRoll = selected && Number.isFinite(selected.target) && selected.target > 0;

  const handleRoll = () => {
    if (!canRoll) return;
    requestRoll({
      mode: selected.mode,          // "competence" | "special"
      entityKey: selected.entityKey,
      label: selected.label,
      target: selected.target,
      notation: "d100",
    });
  };

  return (
    <section className="skill-test-panel">
      <div className="skill-test-panel__title">Test de compétence</div>

      <div className="skill-test-panel__row">
        <select
          className="skill-test-panel__select"
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
        >
          <option value="">— Choisir une compétence —</option>

          {options.normalOpts.length > 0 && (
            <optgroup label="Compétences">
              {options.normalOpts.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label} ({o.target}%)
                </option>
              ))}
            </optgroup>
          )}

          {options.specialOpts.length > 0 && (
            <optgroup label="Compétences spéciales">
              {options.specialOpts.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label} ({o.target}%)
                </option>
              ))}
            </optgroup>
          )}
        </select>

        <button
          type="button"
          className="skill-test-panel__btn"
          onClick={handleRoll}
          disabled={!canRoll}
          title={!canRoll ? "Sélectionne une compétence avec un score > 0" : "Lancer un d100"}
        >
          🎲 Tester
        </button>
      </div>

      {selected && (
        <div className="skill-test-panel__meta">
          <span>
            Objectif : <strong>{selected.target}%</strong>
          </span>

          {last && (
            <span className={"skill-test-panel__result " + (last.success ? "ok" : "ko")}>
              Dernier jet : <strong>{last.total}/{last.target}</strong> {last.success ? "✅" : "❌"}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
