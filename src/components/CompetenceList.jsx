// src/components/CompetenceList.jsx
import React, { useState, useEffect } from "react";
import "./CompetenceList.css";

// Liste des compétences d'Aria (version simplifiée)
const COMPETENCES = [
  {
    id: "artisanat",
    name: "Artisanat, construire",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description:
      "Fabriquer, réparer ou bricoler des objets, bâtiments simples, machines, etc.",
  },
  {
    id: "combat_rapproche",
    name: "Combat rapproché",
    link: "FOR/DEX",
    keyAttributes: ["force", "dexterite"],
    description:
      "Se battre au corps-à-corps avec armes blanches ou à mains nues.",
  },
  {
    id: "combat_distance",
    name: "Combat à distance",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description:
      "Utiliser des armes de jet ou de tir : arcs, arbalètes, armes de jet, etc.",
  },
  {
    id: "connaissance_nature",
    name: "Connaissance de la nature",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description:
      "Reconnaître plantes, animaux, terrains, lire les signes de la nature.",
  },
  {
    id: "connaissance_secrets",
    name: "Connaissance des secrets",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description:
      "Légendes, occultisme, rumeurs, savoirs cachés et histoires mystérieuses.",
  },
  {
    id: "courir_sauter",
    name: "Courir, sauter",
    link: "DEX/END",
    keyAttributes: ["dexterite", "endurance"],
    description:
      "Efforts physiques explosifs : course, bonds, efforts rapides soutenus.",
  },
  {
    id: "discretion",
    name: "Discrétion",
    link: "DEX/CHA",
    keyAttributes: ["dexterite", "charisme"],
    description:
      "Se faire oublier, se déplacer en silence, se fondre dans la foule.",
  },
  {
    id: "droit",
    name: "Droit",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description:
      "Lois, coutumes, règles, savoir tirer profit des textes officiels.",
  },
  {
    id: "esquiver",
    name: "Esquiver",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description:
      "Éviter les coups, les projectiles, se mettre à couvert au bon moment.",
  },
  {
    id: "intimider",
    name: "Intimider",
    link: "FOR/CHA",
    keyAttributes: ["force", "charisme"],
    description:
      "Faire peur, imposer le respect, obtenir quelque chose par la menace.",
  },
  {
    id: "lire_ecrire",
    name: "Lire, écrire",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description:
      "Lire, écrire, comprendre des textes, lettres, manuscrits ou symboles.",
  },
  {
    id: "mentir_convaincre",
    name: "Mentir, convaincre",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description:
      "Négocier, baratiner, manipuler ou persuader dans une discussion.",
  },
  {
    id: "perception",
    name: "Perception",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description:
      "Remarquer les détails, repérer un danger, sentir qu’on vous ment.",
  },
  {
    id: "piloter",
    name: "Piloter",
    link: "DEX/END",
    keyAttributes: ["dexterite", "endurance"],
    description:
      "Conduire un véhicule, une monture ou un engin dans des conditions difficiles.",
  },
  {
    id: "psychologie",
    name: "Psychologie",
    link: "END/INT",
    keyAttributes: ["endurance", "intelligence"],
    description:
      "Comprendre les émotions, motivations, mensonges et fragilités des autres.",
  },
  {
    id: "reflexes",
    name: "Réflexes",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description:
      "Réagir vite à l’imprévu, réussir un geste instinctif en urgence.",
  },
  {
    id: "serrures_pieges",
    name: "Serrures et pièges",
    link: "DEX/END",
    keyAttributes: ["dexterite", "endurance"],
    description:
      "Crocheter, poser ou désamorcer des serrures, mécanismes et pièges.",
  },
  {
    id: "soigner",
    name: "Soigner",
    link: "INT/CHA",
    keyAttributes: ["intelligence", "charisme"],
    description:
      "Premiers secours, médecine, soins prolongés, rassurer un blessé.",
  },
  {
    id: "survie",
    name: "Survie",
    link: "END/INT",
    keyAttributes: ["endurance", "intelligence"],
    description:
      "Trouver de l’eau, de la nourriture, un abri, survivre en milieu hostile.",
  },
  {
    id: "voler",
    name: "Voler",
    link: "DEX/INT",
    keyAttributes: ["dexterite", "intelligence"],
    description:
      "Fouiller discrètement, pickpocket, subtiliser ou manipuler des objets.",
  },
];

function getStatValue(stats, id) {
  return stats.find((s) => s.id === id)?.value ?? 0;
}

// Méthode “calculs prêts à jouer” : moyenne arrondie × 5
function computeReadyScore(stats, competence) {
  const [a, b] = competence.keyAttributes;
  const v1 = getStatValue(stats, a);
  const v2 = getStatValue(stats, b);
  const average = Math.floor((v1 + v2) / 2);
  return average * 5;
}

// Méthode “personnalisation de personnage” : (carac1 + carac2) × 2
function computeCustomScore(stats, competence) {
  const [a, b] = competence.keyAttributes;
  const v1 = getStatValue(stats, a);
  const v2 = getStatValue(stats, b);
  return (v1 + v2) * 2;
}

/**
 * props :
 * - stats : [{ id: "force", value: 12 }, ...]
 * - mode  : "ready" ou "custom"
 * - onCompetencesChange : (liste) => void  // pour le JSON du back
 */
function CompetenceList({ stats, mode, onCompetencesChange, isLocked }) {

  const effectiveMode = mode || "ready";

  const [openId, setOpenId] = useState(null); // description ouverte
  const [bonusById, setBonusById] = useState({}); // ajustements manuels
  const [remainingPoints, setRemainingPoints] = useState(50); // pour le mode custom

  // Quand le mode ou les stats changent → reset des bonus & points
  useEffect(() => {
    setBonusById({});
    setRemainingPoints(50);
    setOpenId(null);
  }, [effectiveMode, stats]);

  // 🔁 À chaque changement, on renvoie les valeurs au parent (App)
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

  const changeScore = (id, baseScore, delta) => {
    setBonusById((prev) => {
      const currentBonus = prev[id] ?? 0;
      const currentTotal = baseScore + currentBonus;
      let newTotal = currentTotal + delta;

      // minimum 0
      if (newTotal < 0) newTotal = 0;
      // maximum 90% uniquement en “custom”
      if (effectiveMode === "custom" && newTotal > 90) newTotal = 90;

      let actualDelta = newTotal - currentTotal;

      // Gestion des 50 points uniquement en mode “custom”
// Gestion des 50 points uniquement en mode “custom” (indicatif)
if (effectiveMode === "custom") {
  if (actualDelta !== 0) {
    setRemainingPoints((pts) => pts - actualDelta);
  }
}


      const newBonus = currentBonus + actualDelta;
      return { ...prev, [id]: newBonus };
    });
  };

  return (
    <section className="competence-section">
  

   {effectiveMode === "custom" && !isLocked && (
  <p className="points-remaining">
    Points de personnalisation restants :{" "}
    <strong>{remainingPoints}</strong>
  </p>
)}

      <div className="competence-table">
        <div className="competence-header row">
          <span className="col-name">Compétence</span>
          <span className="col-link">Lien</span>
          <span className="col-score">Score</span>
        </div>

        {COMPETENCES.map((comp) => {
          const baseScore =
            effectiveMode === "custom"
              ? computeCustomScore(stats, comp)
              : computeReadyScore(stats, comp);

          const bonus = bonusById[comp.id] ?? 0;
          const totalScore = baseScore + bonus;
          const isOpen = openId === comp.id;

          return (
            <div key={comp.id} className="competence-row">
              {/* ligne cliquable pour ouvrir la description */}
              <div
                className={`row competence-row-main ${
                  isOpen ? "is-open" : ""
                }`}
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

                {/* Score en lecture seule dans le tableau */}
                <span className="col-score">{totalScore}%</span>
              </div>

              {isOpen && (
                <div className="competence-tooltip">
                  <h3>{comp.name}</h3>
                  <p className="link-hint">
                    Caractéristiques liées : {comp.link}
                  </p>
                  <p>{comp.description}</p>

<div className="score-editor">
  <span className="score-label">Score :</span>

  {!isLocked && (
    <>
      <button
        type="button"
        className="score-btn"
        onClick={() => changeScore(comp.id, baseScore, -1)}
      >
        −
      </button>
      <span className="score-value">{totalScore}%</span>
      <button
        type="button"
        className="score-btn"
        onClick={() => changeScore(comp.id, baseScore, +1)}
      >
        +
      </button>
    </>
  )}

  {isLocked && (
    <span className="score-value">{totalScore}%</span>
  )}
</div>



                  {effectiveMode === "custom" ? (
                    <p className="rules-hint">
                      Méthode : <strong>personnalisation</strong>. Score initial
                      = (carac1 + carac2) × 2 + points à répartir.
                      <br />
                      Score actuel : <strong>{totalScore}%</strong> (limité à
                      90%).
                    </p>
                  ) : (
                    <p className="rules-hint">
                      Méthode : <strong>prêts à jouer</strong>. Score de base =
                      moyenne arrondie × 5.
                      <br />
                      Score actuel : <strong>{totalScore}%</strong>.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CompetenceList;
