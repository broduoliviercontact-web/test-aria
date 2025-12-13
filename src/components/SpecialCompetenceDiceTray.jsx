import React, { useEffect, useMemo, useRef, useState } from "react";
import Dice3D from "./Dice3D";
import { useDiceRoll } from "./DiceRollContext";
import "./SpecialCompetenceDiceTray.css";

export default function SpecialCompetenceDiceTray({
  competences,
  specialCompetences,
}) {
  const { rollRequest, setRollResult, resultsByKey, requestRoll } = useDiceRoll();
  const dice3DRef = useRef(null);

  const [selectedKey, setSelectedKey] = useState("");
  const [active, setActive] = useState(null);

  const options = useMemo(() => {
    const normal = Array.isArray(competences) ? competences : [];
    const special = Array.isArray(specialCompetences) ? specialCompetences : [];

    const normalOpts = normal
      .filter((c) => c && c.id)
      .map((c) => ({
        key: `c:${c.id}`,
        mode: "competence",
        entityKey: c.id,
        label: c.name || c.id,
        target: Number(c.score) || 0,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "fr"));

    const specialOpts = special
      .filter((s) => s && s.id && (s.name || s.score !== undefined))
      .map((s) => ({
        key: `s:${s.id}`,
        mode: "special",
        entityKey: s.id,
        label: s.name || "Compétence spéciale",
        target: Number(s.score) || 0,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "fr"));

    return { normalOpts, specialOpts };
  }, [competences, specialCompetences]);

  const selected = useMemo(() => {
    const all = [...options.normalOpts, ...options.specialOpts];
    return all.find((o) => o.key === selectedKey) || null;
  }, [options, selectedKey]);

  const last = selected ? resultsByKey[selected.entityKey] : null;

  const canRoll =
    !!selected && Number.isFinite(selected.target) && selected.target > 0;

  // micro-optim : attente propre
  const rollWhenReady = (attempt = 0) => {
    const maxAttempts = 90;
    if (dice3DRef.current?.isReady?.()) {
      dice3DRef.current?.roll?.();
      return;
    }
    if (attempt >= maxAttempts) return;
    requestAnimationFrame(() => rollWhenReady(attempt + 1));
  };

  const buildReqFromSelection = () => {
    if (!selected) return null;
    return {
      id: `local-${Date.now()}`,
      mode: selected.mode,
      entityKey: selected.entityKey,
      label: selected.label,
      target: selected.target,
      notation: "d100",
    };
  };

  const storeOutcome = (req, { total, rolls }) => {
    if (!req) return;

    const target = Number(req.target) || 0;
    const finalTotal =
      typeof total === "number"
        ? total
        : Array.isArray(rolls) && rolls.length
        ? Number(rolls[0]) || 0
        : 0;

    const outcome = {
      total: finalTotal,
      rolls: Array.isArray(rolls) && rolls.length ? rolls : [finalTotal],
      target,
      success: finalTotal <= target,
      label: req.label || "Test",
      at: Date.now(),
    };

    setRollResult(req.entityKey, outcome);
  };

  const handleTest = () => {
    if (!canRoll) return;

    const req = buildReqFromSelection();
    if (!req) return;

    requestRoll(req);
    setActive(req);
    rollWhenReady();
  };

  useEffect(() => {
    if (!rollRequest) return;
    if (rollRequest.mode !== "special" && rollRequest.mode !== "competence") return;

    setActive(rollRequest);
    rollWhenReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollRequest?.id]);

  return (
    <section className="scdt">
      <div className="scdt__header">
        <div className="scdt__title">Test de compétence (d100)</div>

        <div className="scdt__controls">
          <select
            className="scdt__select"
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
            onClick={handleTest}
            disabled={!canRoll}
            className="modal-primary-btn scdt__btn"
            title={
              !canRoll
                ? "Choisis une compétence avec un score > 0"
                : "Lancer un d100"
            }
          >
            🎲 Tester
          </button>
        </div>

        <div className="scdt__status">
          {selected ? (
            <div className="scdt__meta">
              <span className="scdt__strong">{selected.label}</span> — objectif :{" "}
              <span className="scdt__strong">{selected.target}%</span>
            </div>
          ) : (
            <div className="scdt__hint">
              Sélectionne une compétence, puis{" "}
              <span className="scdt__strong">glisse</span> dans la zone de dés
              pour lancer.
            </div>
          )}

          {last ? (
            <div className="scdt__result">
              Dernier jet :{" "}
              <span className="scdt__strong">
                {last.total}/{last.target}
              </span>{" "}
              {last.success ? "✅" : "❌"}
            </div>
          ) : null}
        </div>
      </div>

      <div className="scdt__threeDPanel">
        <Dice3D
          ref={dice3DRef}
          notation={active?.notation || "d100"}
          height={280}
          hideToolbar={true}
          onRoll={(payload) => {
            // IMPORTANT : on ne dépend pas d’un state async.
            const req = active || buildReqFromSelection();
            if (!req) return;

            if (!active) setActive(req); // pour "coller" au choix actuel
            storeOutcome(req, payload);
          }}
        />
      </div>
    </section>
  );
}
