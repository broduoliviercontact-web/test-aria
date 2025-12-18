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
    description: "Fabriquer, réparer, bricoler, construire.",
  },
  {
    id: "combat_rapproche",
    name: "Combat rapproché",
    link: "FOR/DEX",
    keyAttributes: ["force", "dexterite"],
    description: "Combat au corps-à-corps.",
  },
  {
    id: "combat_distance",
    name: "Combat à distance",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description: "Tirer, viser, utiliser des armes à distance.",
  },
  {
    id: "connaissance_nature",
    name: "Connaissance de la nature",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description: "Plantes, animaux, milieux naturels.",
  },
  {
    id: "connaissance_secrets",
    name: "Connaissance des secrets",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description: "Mystères, traditions, ésotérisme.",
  },
  {
    id: "courir_sauter",
    name: "Courir, sauter",
    link: "DEX/END",
    keyAttributes: ["dexterite", "endurance"],
    description: "Athlétisme et déplacements.",
  },
  {
    id: "discretion",
    name: "Discrétion",
    link: "DEX/CHA",
    keyAttributes: ["dexterite", "charisme"],
    description: "Se cacher, agir sans être vu.",
  },
  {
    id: "droit",
    name: "Droit",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description: "Lois et procédures.",
  },
  {
    id: "esquiver",
    name: "Esquiver",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description: "Éviter attaques et dangers.",
  },
  {
    id: "intimider",
    name: "Intimider",
    link: "FOR/CHA",
    keyAttributes: ["force", "charisme"],
    description: "Menacer et imposer.",
  },
  {
    id: "lire_ecrire",
    name: "Lire, écrire",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description: "Lecture et écriture.",
  },
  {
    id: "mentir_convaincre",
    name: "Mentir, convaincre",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description: "Négociation et persuasion.",
  },
  {
    id: "perception",
    name: "Perception",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description: "Observer et détecter.",
  },
  {
    id: "piloter",
    name: "Piloter",
    link: "DEX/END",
    keyAttributes: ["dexterite", "endurance"],
    description: "Conduite et manœuvre.",
  },
  {
    id: "psychologie",
    name: "Psychologie",
    link: "END/INT",
    keyAttributes: ["endurance", "intelligence"],
    description: "Comprendre les comportements.",
  },
  {
    id: "reflexes",
    name: "Réflexes",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description: "Réactions rapides.",
  },
  {
    id: "serrures_pieges",
    name: "Serrures et pièges",
    link: "DEX/END",
    keyAttributes: ["dexterite", "endurance"],
    description: "Crochetage et pièges.",
  },
  {
    id: "soigner",
    name: "Soigner",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description: "Soins et traitements.",
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
const getStatValue = (stats, id) => stats.find((s) => s.id === id)?.value ?? 0;

const computeReadyScore = (stats, comp) =>
  Math.round(
    ((getStatValue(stats, comp.keyAttributes[0]) +
      getStatValue(stats, comp.keyAttributes[1])) /
      2) *
      5
  );

const computeCustomScore = (stats, comp) =>
  (getStatValue(stats, comp.keyAttributes[0]) +
    getStatValue(stats, comp.keyAttributes[1])) *
  2;

const shallowEqualObj = (a, b) => {
  const ak = Object.keys(a || {});
  const bk = Object.keys(b || {});
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
};

/* ===========================
   COMPONENT
   =========================== */
export default function CompetenceList({
  stats,
  mode,
  onCompetencesChange,
  isLocked = false,
  initialCompetences = [],
  isCustomValidated = false,
  setIsCustomValidated,

  // ✅ plancher par compétence { id: min% }
  minScoreById = {},

  // ✅ NEW : override total (bookCharacter) { id: score% }
  fixedScoresById = {},

  statMode = "point-buy",
}) {
  const effectiveMode = mode || "ready";
  const { requestRoll, resultsByKey } = useDiceRoll();

  const [openId, setOpenId] = useState(null);
  const [bonusById, setBonusById] = useState({});
  const [remainingPoints, setRemainingPoints] = useState(50);

  const didInitRef = useRef(false);
  const lastSnapshotSigRef = useRef("");

  const hasFixedScores = useMemo(
    () => fixedScoresById && Object.keys(fixedScoresById).length > 0,
    [fixedScoresById]
  );

  const effectiveLocked =
    hasFixedScores ||
    isLocked ||
    effectiveMode === "ready" ||
    (effectiveMode === "custom" && isCustomValidated);

  const handleToggleRow = (id) => {
    setOpenId((current) => (current === id ? null : id));
  };

  const runTest = (comp, target) => {
    requestRoll({
      mode: "competence",
      entityKey: comp.id,
      label: comp.name,
      target,
      notation: "d100",
    });
  };

  /* ===== hydrate depuis backend (1 fois) ===== */
  const inferredBonusById = useMemo(() => {
    if (effectiveMode !== "custom") return {};
    const map = {};
    for (const comp of COMPETENCES) {
      const saved = initialCompetences.find((c) => c?.id === comp.id);
      if (!saved) continue;
      const base = computeCustomScore(stats, comp);
      const bonus = Number(saved.score) - base;
      if (bonus > 0) map[comp.id] = Math.min(bonus, 90 - base);
    }
    return map;
  }, [effectiveMode, initialCompetences, stats]);

  useEffect(() => {
    if (effectiveMode !== "custom") {
      didInitRef.current = false;
      setBonusById({});
      setRemainingPoints(50);
      return;
    }
    if (didInitRef.current) return;
    didInitRef.current = true;

    if (initialCompetences.length > 0) {
      setBonusById((prev) =>
        shallowEqualObj(prev, inferredBonusById) ? prev : inferredBonusById
      );
    }
  }, [effectiveMode, inferredBonusById, initialCompetences]);

  /* ===== pool ===== */
  useEffect(() => {
    if (effectiveMode !== "custom") return;
    const spent = Object.values(bonusById).reduce((s, v) => s + v, 0);
    setRemainingPoints(50 - spent);
  }, [bonusById, effectiveMode]);

  /* ===== sync parent ===== */
  useEffect(() => {
    const snapshot = COMPETENCES.map((comp) => {
      // ✅ bookCharacter : override total
      const fixed = fixedScoresById?.[comp.id];
      if (typeof fixed === "number") {
        return { id: comp.id, name: comp.name, link: comp.link, score: fixed };
      }

      const base =
        effectiveMode === "custom"
          ? computeCustomScore(stats, comp)
          : computeReadyScore(stats, comp);

      const bonus = bonusById[comp.id] ?? 0;
      const raw = base + bonus;

      // ✅ plancher
      const min = Number(minScoreById?.[comp.id] ?? 0);
      const score = Math.max(raw, min);

      return { id: comp.id, name: comp.name, link: comp.link, score };
    });

    const sig = snapshot.map((c) => `${c.id}:${c.score}`).join(",");
    if (sig === lastSnapshotSigRef.current) return;
    lastSnapshotSigRef.current = sig;

    onCompetencesChange(snapshot);
  }, [
    stats,
    bonusById,
    effectiveMode,
    onCompetencesChange,
    minScoreById,
    fixedScoresById,
  ]);

  /* ===== edit ===== */
  const changeScore = (id, base, min, delta) => {
    if (effectiveLocked || effectiveMode !== "custom") return;

    setBonusById((prev) => {
      const current = prev[id] ?? 0;

      // total "réel" basé sur bonus stocké
      const currentRawTotal = base + current;
      const floor = Number(min ?? 0);

      // si déjà au plancher et on veut baisser => no-op
      if (delta < 0 && currentRawTotal <= floor) return prev;

      // nextTotal clampé : au moins base, au moins floor, max 90
      const desired = currentRawTotal + delta;
      const nextTotal = Math.min(90, Math.max(Math.max(base, floor), desired));

      const deltaReal = nextTotal - currentRawTotal;
      if (deltaReal === 0) return prev;

      // coût en points uniquement pour les augmentations
      if (deltaReal > 0) {
        const spent = Object.values(prev).reduce((s, v) => s + v, 0);
        if (deltaReal > 50 - spent) return prev;
      }

      const nextBonus = current + deltaReal;

      // si bonus <= 0 on supprime la clé (on garde le floor via minScoreById)
      if (nextBonus <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }

      return { ...prev, [id]: nextBonus };
    });
  };

  /* ===== render ===== */
  // On cache TOUTE la rules-hint si statMode === "3d6"
  const showCustomHint =
    effectiveMode === "custom" && !isCustomValidated && statMode !== "3d6";
  const showReadyHint = effectiveMode !== "custom" && statMode !== "3d6";

  return (
    <section className="competence-section">
      <div className="com-tititle">
        <img src="/icons/books.gif" className="arme" alt="" />
        <h2 className="inventory-title">Compétences</h2>
        <img src="/icons/books.gif" className="arme" alt="" />
      </div>

      {effectiveMode === "custom" && !effectiveLocked && (
        <div className="custom-points-header">
          <button
            className="btn-validate-points"
            disabled={remainingPoints !== 0}
            onClick={() => setIsCustomValidated(true)}
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
          const fixed = fixedScoresById?.[comp.id];

          const totalScore =
            typeof fixed === "number"
              ? fixed
              : (() => {
                  const baseScore =
                    effectiveMode === "custom"
                      ? computeCustomScore(stats, comp)
                      : computeReadyScore(stats, comp);

                  const bonus = bonusById[comp.id] ?? 0;
                  const rawTotal = baseScore + bonus;

                  const min = Number(minScoreById?.[comp.id] ?? 0);
                  return Math.max(rawTotal, min);
                })();

          const baseScore =
            effectiveMode === "custom"
              ? computeCustomScore(stats, comp)
              : computeReadyScore(stats, comp);

          const min = Number(minScoreById?.[comp.id] ?? 0);

          const isOpen = openId === comp.id;
          const lastResult = resultsByKey[comp.id];

          return (
            <div key={comp.id} className="competence-row">
              {/* ligne cliquable pour ouvrir la description */}
              <div
                className={`row competence-row-main ${isOpen ? "is-open" : ""}`}
                onClick={() => handleToggleRow(comp.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggleRow(comp.id);
                  }
                }}
                aria-expanded={isOpen}
              >
                <span className="col-name">{comp.name}</span>
                <span className="col-link">{comp.link}</span>
                <span className="col-score">{totalScore}%</span>
                <span className="col-test" aria-hidden="true" />
              </div>

              {isOpen && (
                <div className="competence-tooltip">
                  <h3>{comp.name}</h3>
                  <p className="link-hint">
                    Caractéristiques liées : {comp.link}
                  </p>
                  <p>{comp.description}</p>

                  {/* ✅ Bouton test DANS la partie déroulante */}
                  <div className="competence-tooltip-actions">
                    <button
                      type="button"
                      className="competence-test-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        runTest(comp, totalScore);
                      }}
                      title={
                        lastResult
                          ? `Dernier jet : ${lastResult.total}/${lastResult.target}`
                          : "Tester la compétence"
                      }
                      aria-label={`Tester ${comp.name} au d100`}
                    >
                      🎲 Tester
                      {lastResult && (
                        <span
                          className={
                            "competence-test-result " +
                            (lastResult.success ? "ok" : "ko")
                          }
                        >
                          {lastResult.total}/{lastResult.target}
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
                          onClick={() =>
                            changeScore(comp.id, baseScore, min, -1)
                          }
                        >
                          −
                        </button>
                        <span className="score-value">{totalScore}%</span>
                        <button
                          type="button"
                          className="score-btn"
                          onClick={() =>
                            changeScore(comp.id, baseScore, min, +1)
                          }
                        >
                          +
                        </button>
                      </>
                    )}

                    {effectiveLocked && (
                      <span className="score-value">{totalScore}%</span>
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
