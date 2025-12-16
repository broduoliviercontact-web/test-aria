import React, { useEffect, useMemo, useRef, useState } from "react";
import "./CompetenceList.css";
import { useDiceRoll } from "./DiceRollContext";

/* ===========================
   LISTE DES COMPÉTENCES
   =========================== */
const COMPETENCES = [
  {
    id: "artisanat",
    name: "Artisanat, construire",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description:
      "Fabriquer, réparer, bricoler, construire. Tout ce qui relève de la technique et du savoir-faire manuel.",
  },
  {
    id: "combat_rapproche",
    name: "Combat rapproché",
    link: "FOR/DEX",
    keyAttributes: ["force", "dexterite"],
    description:
      "Se battre au corps-à-corps : armes de mêlée, bagarre, techniques de combat rapproché.",
  },
  {
    id: "combat_distance",
    name: "Combat à distance",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description:
      "Tirer, viser, utiliser des armes à distance (arc, arbalète, projectiles).",
  },
  {
    id: "connaissance_nature",
    name: "Connaissance de la nature",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description: "Reconnaître plantes, animaux, pistes, milieux naturels.",
  },
  {
    id: "connaissance_secrets",
    name: "Connaissance des secrets",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description: "Histoire, mystères, traditions, rumeurs, ésotérisme.",
  },
  {
    id: "courir_sauter",
    name: "Courir, sauter",
    link: "DEX/END",
    keyAttributes: ["dexterite", "endurance"],
    description: "Athlétisme : course, saut, escalade rapide.",
  },
  {
    id: "discretion",
    name: "Discrétion",
    link: "DEX/CHA",
    keyAttributes: ["dexterite", "charisme"],
    description: "Se faufiler, se cacher, agir sans être remarqué.",
  },
  {
    id: "droit",
    name: "Droit",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description: "Comprendre lois, procédures et contrats.",
  },
  {
    id: "esquiver",
    name: "Esquiver",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description: "Éviter un coup, une attaque, un piège.",
  },
  {
    id: "intimider",
    name: "Intimider",
    link: "FOR/CHA",
    keyAttributes: ["force", "charisme"],
    description: "Faire pression ou menacer.",
  },
  {
    id: "lire_ecrire",
    name: "Lire, écrire",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description: "Lire, écrire et comprendre des textes.",
  },
  {
    id: "mentir_convaincre",
    name: "Mentir, convaincre",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description: "Persuader, baratiner, négocier.",
  },
  {
    id: "perception",
    name: "Perception",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description: "Repérer des détails, sentir un danger.",
  },
  {
    id: "piloter",
    name: "Piloter",
    link: "DEX/END",
    keyAttributes: ["dexterite", "endurance"],
    description: "Conduire, manœuvrer, piloter.",
  },
  {
    id: "psychologie",
    name: "Psychologie",
    link: "END/INT",
    keyAttributes: ["endurance", "intelligence"],
    description: "Comprendre les comportements humains.",
  },
  {
    id: "reflexes",
    name: "Réflexes",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description: "Réagir vite, agir sous pression.",
  },
  {
    id: "serrures_pieges",
    name: "Serrures et pièges",
    link: "DEX/END",
    keyAttributes: ["dexterite", "endurance"],
    description: "Crocheter, détecter, désamorcer.",
  },
  {
    id: "soigner",
    name: "Soigner",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description: "Premiers soins et traitements.",
  },
  {
    id: "survie",
    name: "Survie",
    link: "END/INT",
    keyAttributes: ["endurance", "intelligence"],
    description: "Tenir dans la nature.",
  },
  {
    id: "voler",
    name: "Voler",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description: "Pickpocket et larcin.",
  },
];

/* ===========================
   HELPERS
   =========================== */
function getStatValue(stats, statId) {
  const found = stats?.find((s) => s.id === statId);
  return found?.value ?? 0;
}

function computeReadyScore(stats, comp) {
  const [a, b] = comp.keyAttributes;
  return Math.round(((getStatValue(stats, a) + getStatValue(stats, b)) / 2) * 5);
}

function computeCustomScore(stats, comp) {
  const [a, b] = comp.keyAttributes;
  return (getStatValue(stats, a) + getStatValue(stats, b)) * 2;
}

/**
 * Props:
 * - initialCompetences : snapshot backend (pour hydrater bonus en custom)
 * - isCustomValidated / setIsCustomValidated : lock global piloté par parent
 */
export default function CompetenceList({
  stats,
  mode,
  onCompetencesChange,
  isLocked = false,

  initialCompetences = [],
  isCustomValidated = false,
  setIsCustomValidated,
}) {
  const effectiveMode = mode || "ready";
  const { requestRoll, resultsByKey } = useDiceRoll();

  const [openId, setOpenId] = useState(null);
  const [bonusById, setBonusById] = useState({});
  const [remainingPoints, setRemainingPoints] = useState(50);

  const didInitCustomRef = useRef(false);

  // ✅ pour éviter boucle : on n'appelle onCompetencesChange que si les scores ont changé
  const lastSentKeyRef = useRef("");

  const effectiveLocked =
    !!isLocked ||
    effectiveMode === "ready" ||
    (effectiveMode === "custom" && !!isCustomValidated);

  /* ===== inferred bonus depuis backend (custom) ===== */
  const inferredBonusById = useMemo(() => {
    if (effectiveMode !== "custom") return {};
    if (!Array.isArray(initialCompetences) || initialCompetences.length === 0)
      return {};

    const map = {};
    for (const comp of COMPETENCES) {
      const saved = initialCompetences.find((c) => c?.id === comp.id);
      if (!saved) continue;

      const base = computeCustomScore(stats, comp);
      const savedScore = Number(saved.score);
      if (Number.isNaN(savedScore)) continue;

      const rawBonus = savedScore - base;
      const clamped = Math.max(0, Math.min(90 - base, rawBonus));
      if (clamped !== 0) map[comp.id] = clamped;
    }
    return map;
  }, [effectiveMode, initialCompetences, stats]);

  /* ===== reset quand on change de mode ===== */
  useEffect(() => {
    if (effectiveMode !== "custom") {
      didInitCustomRef.current = false;
      if (Object.keys(bonusById).length) setBonusById({});
      if (remainingPoints !== 50) setRemainingPoints(50);
      return;
    }
  }, [effectiveMode]); // ✅ IMPORTANT: pas de deps qui changent tout le temps

  /* ===== hydrate 1 fois en entrant en custom ===== */
  useEffect(() => {
    if (effectiveMode !== "custom") return;

    if (didInitCustomRef.current) return;
    didInitCustomRef.current = true;

    if (Array.isArray(initialCompetences) && initialCompetences.length > 0) {
      setBonusById(inferredBonusById);
    } else {
      setBonusById({});
    }
  }, [effectiveMode, initialCompetences, inferredBonusById]);

  /* ===== remaining points ===== */
  useEffect(() => {
    if (effectiveMode !== "custom") return;
    const spent = Object.values(bonusById).reduce(
      (sum, v) => sum + (Number(v) || 0),
      0
    );
    setRemainingPoints(50 - spent);
  }, [bonusById, effectiveMode]);

  /* ===== + / - ===== */
  const changeScore = (id, baseScore, delta) => {
    if (effectiveMode !== "custom") return;
    if (effectiveLocked) return;

    setBonusById((prev) => {
      const currentBonus = prev[id] ?? 0;
      const currentTotal = baseScore + currentBonus;

      let newTotal = currentTotal + delta;

      // pas sous la base
      if (newTotal < baseScore) newTotal = baseScore;

      // max 90
      if (newTotal > 90) newTotal = 90;

      const actualDelta = newTotal - currentTotal;
      if (actualDelta === 0) return prev;

      // si on augmente: respecter le pool (50)
      if (actualDelta > 0) {
        const spent = Object.values(prev).reduce(
          (sum, v) => sum + (Number(v) || 0),
          0
        );
        const remaining = 50 - spent;
        if (actualDelta > remaining) return prev;
      }

      const newBonus = currentBonus + actualDelta;
      return { ...prev, [id]: newBonus };
    });
  };

  /* ===== sync vers parent (anti-boucle) ===== */
  useEffect(() => {
    if (!onCompetencesChange) return;

    const snapshot = COMPETENCES.map((comp) => {
      const base =
        effectiveMode === "custom"
          ? computeCustomScore(stats, comp)
          : computeReadyScore(stats, comp);

      const bonus = bonusById[comp.id] ?? 0;
      const score = base + bonus;

      return {
        id: comp.id,
        name: comp.name,
        link: comp.link,
        score,
      };
    });

    // 🔒 clé stable: "id:score|id:score..."
    const key = snapshot.map((c) => `${c.id}:${c.score}`).join("|");
    if (key === lastSentKeyRef.current) return;
    lastSentKeyRef.current = key;

    onCompetencesChange(snapshot);
  }, [stats, bonusById, effectiveMode, onCompetencesChange]);

  return (
    <section className="competence-section">
      <div className="com-tititle">
        <img src="/icons/books.gif" className="arme" alt="" />
        <h2 className="inventory-title">Competences</h2>
        <img src="/icons/books.gif" className="arme" alt="" />
      </div>

      {effectiveMode === "custom" && !effectiveLocked && (
        <div className="custom-points-header">
          <button
            type="button"
            className="btn-validate-points"
            disabled={remainingPoints !== 0}
            onClick={() => setIsCustomValidated?.(true)}
            title={
              remainingPoints !== 0
                ? "Dépense tous les points (0 restants) pour valider"
                : "Valider la répartition (verrouille les points)"
            }
          >
            Valider
          </button>

          <p className="points-remaining">
            Points de personnalisation restants :{" "}
            <strong>{remainingPoints}</strong>
          </p>
        </div>
      )}

      <div className="competence-table">
        <div className="competence-header row">
          <span className="col-name">Compétence</span>
          <span className="col-link">Lien</span>
          <span className="col-score">Score</span>
          <span className="col-test" />
        </div>

        {COMPETENCES.map((comp) => {
          const base =
            effectiveMode === "custom"
              ? computeCustomScore(stats, comp)
              : computeReadyScore(stats, comp);

          const bonus = bonusById[comp.id] ?? 0;
          const total = base + bonus;

          const isOpen = openId === comp.id;
          const last = resultsByKey[comp.id];

          return (
            <div key={comp.id} className="competence-row">
              <div
                className={`row competence-row-main ${isOpen ? "is-open" : ""}`}
                onClick={() => setOpenId((v) => (v === comp.id ? null : comp.id))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpenId((v) => (v === comp.id ? null : comp.id));
                  }
                }}
                aria-expanded={isOpen}
              >
                <span className="col-name">{comp.name}</span>
                <span className="col-link">{comp.link}</span>
                <span className="col-score">{total}%</span>
                <span className="col-test" />
              </div>

              {isOpen && (
                <div className="competence-tooltip">
                  <h3>{comp.name}</h3>
                  <p className="link-hint">Caractéristiques liées : {comp.link}</p>
                  <p>{comp.description}</p>

                  <div className="competence-tooltip-actions">
                    <button
                      type="button"
                      className="competence-test-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        requestRoll({
                          mode: "competence",
                          entityKey: comp.id,
                          label: comp.name,
                          target: total,
                          notation: "d100",
                        });
                      }}
                      title={
                        last
                          ? `Dernier jet : ${last.total}/${last.target}`
                          : "Tester la compétence"
                      }
                      aria-label={`Tester ${comp.name} au d100`}
                    >
                      🎲 Tester
                      {last && (
                        <span
                          className={`competence-test-result ${
                            last.success ? "ok" : "ko"
                          }`}
                        >
                          {last.total}/{last.target}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="score-editor">
                    <span className="score-label">Score :</span>

                    {!effectiveLocked && (
                      <>
                        <button
                          type="button"
                          className="score-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            changeScore(comp.id, base, -1);
                          }}
                        >
                          −
                        </button>

                        <span className="score-value">{total}%</span>

                        <button
                          type="button"
                          className="score-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            changeScore(comp.id, base, +1);
                          }}
                        >
                          +
                        </button>
                      </>
                    )}

                    {effectiveLocked && (
                      <span className="score-value">{total}%</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
