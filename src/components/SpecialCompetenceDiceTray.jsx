import React, { useEffect, useMemo, useRef, useState } from "react";
import Dice3D from "./Dice3D";
import { useDiceRoll } from "./DiceRollContext";
import "./StatsDiceRoller.css";

/**
 * Props:
 * - competences: tableau produit par CompetenceList via onCompetencesChange
 * - specialCompetences: tableau de SpecialCompetences
 *
 * State 100% ici (sélection + affichage résultat)
 */
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

  const handleTest = () => {
    if (!canRoll) return;

    requestRoll({
      mode: selected.mode, // "competence" | "special"
      entityKey: selected.entityKey,
      label: selected.label,
      target: selected.target,
      notation: "d100",
    });
  };

  // ✅ reçoit une requête globale (si un autre composant en envoie une)
  useEffect(() => {
    if (!rollRequest) return;
    if (rollRequest.mode !== "special" && rollRequest.mode !== "competence") return;
    setActive(rollRequest);
  }, [rollRequest?.id]);

  // ✅ auto-roll quand active change
  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let tries = 0;

    const tick = () => {
      if (cancelled) return;
      tries += 1;

      const isReady = dice3DRef.current?.isReady?.();
      if (isReady) {
        dice3DRef.current?.roll?.();
        return;
      }

      if (tries < 20) setTimeout(tick, 200);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [active?.id]);

  const handleRoll = ({ total, rolls }) => {
    if (!active) return;

    const target = Number(active.target) || 0;

    // si la lib renvoie un tableau, total peut être la somme / ou juste 1 valeur
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
      label: active.label || "Test",
      at: Date.now(),
    };

    setRollResult(active.entityKey, outcome);
  };

  return (
    <section className="stats-dice-roller" style={{ marginTop: "0.75rem" }}>
      <div className="stats-dice-roller__header">
        <div style={{ width: "100%" }}>
          <div
            style={{
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            Test de compétence 
          </div>

          <div
            style={{
              marginTop: "0.5rem",
              display: "flex",
              gap: "0.6rem",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              style={{
                minWidth: 260,
                maxWidth: 520,
                width: "min(520px, 100%)",
                padding: "0.45rem 0.55rem",
                borderRadius: 10,
                border: "1px solid rgba(140, 105, 70, 0.7)",
                background: "rgba(255,255,255,0.65)",
                color: "#2f2115",
              }}
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
              className="modal-primary-btn"
              style={{ padding: "0.5rem 1rem", borderRadius: 999 }}
              title={
                !canRoll
                  ? "Choisis une compétence avec un score > 0"
                  : "Lancer un d100"
              }
            >
              🎲 Tester
            </button>
          </div>

          <div style={{ marginTop: "0.45rem", textAlign: "center" }}>
            {selected ? (
              <div style={{ fontSize: "0.95rem" }}>
                <strong>{selected.label}</strong> — objectif :{" "}
                <strong>{selected.target}%</strong>
              </div>
            ) : (
              <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>
                Sélectionne une compétence dans la liste.
              </div>
            )}

            {last ? (
              <div style={{ marginTop: "0.25rem", fontSize: "1rem" }}>
                Dernier jet :{" "}
                <strong>
                  {last.total}/{last.target}
                </strong>{" "}
                {last.success ? "✅" : "❌"}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Dice3D
        ref={dice3DRef}
        notation={active?.notation || "d100"}
        height={280}
        onRoll={handleRoll}
        hideToolbar={true}
      />
    </section>
  );
}
