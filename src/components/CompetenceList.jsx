import React, { useEffect, useState } from "react";
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
      "Tirer, viser, utiliser des armes à distance (arc, arbalète, projectiles, etc.).",
  },
  {
    id: "connaissance_nature",
    name: "Connaissance de la nature",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description:
      "Reconnaître plantes, animaux, pistes, milieux naturels. Comprendre l’environnement.",
  },
  {
    id: "connaissance_secrets",
    name: "Connaissance des secrets",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description:
      "Histoire, mystères, traditions, rumeurs, ésotérisme, informations cachées.",
  },
  {
    id: "courir_sauter",
    name: "Courir, sauter",
    link: "DEX/END",
    keyAttributes: ["dexterite", "endurance"],
    description:
      "Athlétisme : course, saut, escalade rapide, déplacements physiques intenses.",
  },
  {
    id: "discretion",
    name: "Discrétion",
    link: "DEX/CHA",
    keyAttributes: ["dexterite", "charisme"],
    description:
      "Se faufiler, se cacher, éviter l’attention, agir sans être remarqué.",
  },
  {
    id: "droit",
    name: "Droit",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description:
      "Comprendre les lois, procédures, contrats, règles d’une cité ou d’un royaume.",
  },
  {
    id: "esquiver",
    name: "Esquiver",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description:
      "Éviter un coup, une attaque, un piège, un danger soudain. Réactivité défensive.",
  },
  {
    id: "intimider",
    name: "Intimider",
    link: "FOR/CHA",
    keyAttributes: ["force", "charisme"],
    description:
      "Faire pression, menacer, imposer sa présence ou sa force psychologique.",
  },
  {
    id: "lire_ecrire",
    name: "Lire, écrire",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description:
      "Lire, écrire, comprendre des textes, rédiger, décrypter des messages.",
  },
  {
    id: "mentir_convaincre",
    name: "Mentir, convaincre",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description:
      "Persuader, baratiner, manipuler, mentir de façon crédible, négocier.",
  },
  {
    id: "perception",
    name: "Perception",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description:
      "Repérer des détails, être attentif, sentir un danger, observer finement.",
  },
  {
    id: "piloter",
    name: "Piloter",
    link: "DEX/END",
    keyAttributes: ["dexterite", "endurance"],
    description:
      "Conduire, manœuvrer, piloter un véhicule, une monture ou une embarcation.",
  },
  {
    id: "psychologie",
    name: "Psychologie",
    link: "END/INT",
    keyAttributes: ["endurance", "intelligence"],
    description:
      "Comprendre les émotions, intentions, comportements. Résister au stress mental.",
  },
  {
    id: "reflexes",
    name: "Réflexes",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description:
      "Réagir vite, attraper au vol, agir sous pression, réponses immédiates.",
  },
  {
    id: "serrures_pieges",
    name: "Serrures et pièges",
    link: "DEX/END",
    keyAttributes: ["dexterite", "endurance"],
    description:
      "Crocheter une serrure, détecter/désamorcer un piège, manipulations délicates.",
  },
  {
    id: "soigner",
    name: "Soigner",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description:
      "Premiers soins, diagnostic simple, bandages, traitements de base.",
  },
  {
    id: "survie",
    name: "Survie",
    link: "END/INT",
    keyAttributes: ["endurance", "intelligence"],
    description:
      "Tenir dans la nature, trouver eau/nourriture, s’orienter, improviser un camp.",
  },
  {
    id: "voler",
    name: "Voler",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description:
      "Pickpocket, larcin, subtiliser sans être vu, se servir discrètement.",
  },
];

/* ===========================
   HELPERS
   =========================== */
function getStatValue(stats, statId) {
  const found = stats?.find((s) => s.id === statId);
  return found?.value ?? 0;
}

// Méthode “prêt à jouer” : moyenne(carac1, carac2) × 5
function computeReadyScore(stats, competence) {
  const [a, b] = competence.keyAttributes;
  const v1 = getStatValue(stats, a);
  const v2 = getStatValue(stats, b);
  return Math.round(((v1 + v2) / 2) * 5);
}

// Méthode “personnalisation” : (carac1 + carac2) × 2
function computeCustomScore(stats, competence) {
  const [a, b] = competence.keyAttributes;
  const v1 = getStatValue(stats, a);
  const v2 = getStatValue(stats, b);
  return (v1 + v2) * 2;
}

/**
 * Props
 * - stats : [{ id: "force", value: 12 }, ...]
 * - mode  : "ready" | "custom"
 * - onCompetencesChange : (liste) => void
 * - isLocked : boolean
 */
export default function CompetenceList({
  stats,
  mode,
  onCompetencesChange,
  isLocked = false,
}) {
  const effectiveMode = mode || "ready";
  const { requestRoll, resultsByKey } = useDiceRoll();

  const [openId, setOpenId] = useState(null);
  const [bonusById, setBonusById] = useState({});
  const [remainingPoints, setRemainingPoints] = useState(50);

  // ✅ NEW : validation du pool custom
  const [isCustomConfirmed, setIsCustomConfirmed] = useState(false);

// Verrou effectif :
// - ready => toujours verrouillé (compétences 100% auto)
// - custom => verrouillé après validation
// - ou lock global si besoin
const effectiveLocked =
  !!isLocked ||
  effectiveMode === "ready" ||
  (effectiveMode === "custom" && isCustomConfirmed);

  // Reset quand stats/mode changent
  useEffect(() => {
    setBonusById({});
    setRemainingPoints(50);
    setOpenId(null);
    setIsCustomConfirmed(false);
  }, [effectiveMode, stats]);

  // ✅ remainingPoints dérivé de bonusById (évite les désync)
  useEffect(() => {
    if (effectiveMode !== "custom") return;
    const spent = Object.values(bonusById).reduce(
      (sum, v) => sum + (Number(v) || 0),
      0
    );
    setRemainingPoints(50 - spent);
  }, [bonusById, effectiveMode]);

  // Sync vers parent
  useEffect(() => {
    if (!onCompetencesChange) return;

    const snapshot = COMPETENCES.map((comp) => {
      const baseScore =
        effectiveMode === "custom"
          ? computeCustomScore(stats, comp)
          : computeReadyScore(stats, comp);

      const bonus = bonusById[comp.id] ?? 0;
      const totalScore = baseScore + bonus;

      return {
        id: comp.id,
        name: comp.name,
        link: comp.link,
        keyAttributes: comp.keyAttributes,
        baseScore,
        bonus,
        score: totalScore,
      };
    });

    onCompetencesChange(snapshot);
  }, [stats, bonusById, effectiveMode, onCompetencesChange]);

  const handleToggleRow = (id) => {
    setOpenId((current) => (current === id ? null : id));
  };

  // ✅ Pool 50 points : bloque l’augmentation quand plus de points
const changeScore = (id, baseScore, delta) => {
  if (effectiveMode !== "custom") return;

  setBonusById((prev) => {
    const currentBonus = prev[id] ?? 0;
    const currentTotal = baseScore + currentBonus;

    let newTotal = currentTotal + delta;

    // 🚫 interdit de descendre sous le score de base
    if (newTotal < baseScore) newTotal = baseScore;

    // max 90
    if (newTotal > 90) newTotal = 90;

    const actualDelta = newTotal - currentTotal;

    // 🚫 si on ajoute mais plus de points dispos → on refuse
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

  const runTest = (comp, totalScore) => {
    requestRoll({
      mode: "competence",
      entityKey: comp.id,
      label: comp.name,
      target: totalScore,
      notation: "d100",
    });
  };

  return (
    <section className="competence-section">
      {/* ✅ header custom compact + bouton valider */}
      <div className="com-tititle">
            <img src="/icons/competence.gif" className="arme"alt="Armes" />
          <h2 className="inventory-title">Competences</h2>
              <img src="/icons/competence.gif" className="arme"alt="Armes" />
          </div>
      {effectiveMode === "custom" && !effectiveLocked && (
        <div className="custom-points-header">
          <button
            type="button"
            className="btn-validate-points"
            onClick={() => setIsCustomConfirmed(true)}
            title="Valider la répartition (verrouille les points)"
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
          <span className="col-test" aria-hidden="true" />
        </div>

        {COMPETENCES.map((comp) => {
          const baseScore =
            effectiveMode === "custom"
              ? computeCustomScore(stats, comp)
              : computeReadyScore(stats, comp);

          const bonus = bonusById[comp.id] ?? 0;
          const totalScore = baseScore + bonus;
          const isOpen = openId === comp.id;

          const lastResult = resultsByKey[comp.id];

          return (
            <div key={comp.id} className="competence-row">
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
                          onClick={(e) => {
                            e.stopPropagation();
                            changeScore(comp.id, baseScore, -1);
                          }}
                        >
                          −
                        </button>

                        <span className="score-value">{totalScore}%</span>

                        <button
                          type="button"
                          className="score-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            changeScore(comp.id, baseScore, +1);
                          }}
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
