// src/components/PdfCharacterSheet.jsx
import React from "react";
import "./PdfCharacterSheet.css";

const FER_PER_COPPER = 10;
const FER_PER_SILVER = 100;
const FER_PER_GOLD = 1000;

function breakdownPurse(totalFer) {
  const gold = Math.floor(totalFer / FER_PER_GOLD);
  const restG = totalFer % FER_PER_GOLD;

  const silver = Math.floor(restG / FER_PER_SILVER);
  const restS = restG % FER_PER_SILVER;

  const copper = Math.floor(restS / FER_PER_COPPER);
  const iron = restS % FER_PER_COPPER;

  return { gold, silver, copper, iron };
}

export default function PdfCharacterSheet({
  characterName,
  age,
  profession,
  stats,
  competences,
  specialCompetences,
  xp,
  playerName,
  purseFer,
  inventory = [],
  weapons = [],
  portraitUrl,
  hitPoints,
  wounds,
  armor,
}) {
  const { gold, silver, copper, iron } = breakdownPurse(purseFer || 0);

  const baseCompetences = competences || [];
  const special = specialCompetences || [];

  const safeWeapons = (weapons || []).filter(
    (w) => w && (w.name || w.damage)
  );
  const safeInventory = (inventory || []).filter(
    (item) => item && (item.name || item.quantity)
  );

  return (
    <div className="pdf-sheet">
      {/* Titre */}
      <header className="pdf-header">
        <h1 className="pdf-title">"{characterName}"</h1>
      </header>

      {/* Bandeau haut : identité / caractéristiques / portrait */}
      <section className="pdf-top-row">
        {/* Identité */}
        <div className="pdf-card pdf-identity">
          <h2 className="pdf-card-title">Identité</h2>
          <div className="pdf-identity-line">
            <span>Nom</span>
            <span className="pdf-identity-value">
              {characterName || "—"}
            </span>
          </div>
          <div className="pdf-identity-line">
            <span>Âge</span>
            <span className="pdf-identity-value">
              {age || "—"}
            </span>
          </div>
          <div className="pdf-identity-line">
            <span>Profession</span>
            <span className="pdf-identity-value">
              {profession || "—"}
            </span>
          </div>
        </div>

        {/* Caractéristiques */}
        <div className="pdf-card pdf-stats">
          <h2 className="pdf-card-title">Caractéristiques</h2>
          <div className="pdf-stats-grid">
            {stats?.map((stat) => (
              <div key={stat.id} className="pdf-stat-row">
                <span>{stat.label}</span>
                <span className="pdf-stat-value">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Portrait */}
        <div className="pdf-card pdf-portrait">
          {portraitUrl && (
            <img
              src={portraitUrl}
              alt="Portrait du personnage"
              className="pdf-portrait-img"
            />
          )}
        </div>
      </section>

      {/* Santé : PV / Blessures / Armure */}
      <section className="pdf-health-row">
        <div className="pdf-card pdf-health-card">
          <h3 className="pdf-card-subtitle">Points de vie</h3>
          <div className="pdf-health-body">
            <img
              src="/pdv-icon.svg"
              alt="Points de vie"
              className="pdf-health-icon"
            />
            <span className="pdf-health-value">
              {hitPoints ?? 0}
            </span>
          </div>
        </div>

        <div className="pdf-card pdf-health-card">
          <h3 className="pdf-card-subtitle">Blessures</h3>
          <div className="pdf-health-body">
            <img
              src="/blessur-icon.svg"
              alt="Blessures"
              className="pdf-health-icon"
            />
            <span className="pdf-health-value">
              {wounds ?? 0}
            </span>
          </div>
        </div>

        <div className="pdf-card pdf-health-card">
          <h3 className="pdf-card-subtitle">Armure</h3>
          <div className="pdf-health-body">
            <img
              src="/armure-icon.svg"
              alt="Armure"
              className="pdf-health-icon"
            />
            <span className="pdf-health-value">
              {armor ?? 0}
            </span>
          </div>
        </div>
      </section>

      {/* ZONE CENTRALE : 
          - Colonne gauche = Armes / Inventaire / Compétences spéciales
          - Colonne droite = Compétences
      */}
      <section className="pdf-main-row">
        {/* Colonne GAUCHE : Armes / Inventaire / Compétences spéciales */}
        <div className="pdf-right-column">
          {/* Armes */}
          <div className="pdf-card pdf-weapons-card">
            <h2 className="pdf-card-title">Armes</h2>
            {safeWeapons.length === 0 ? (
              <p className="pdf-empty-text">Aucune arme.</p>
            ) : (
              <table className="pdf-weapons-table">
                <thead>
                  <tr>
                    <th>Arme</th>
                    <th>Dégâts</th>
                  </tr>
                </thead>
                <tbody>
                  {safeWeapons.map((w, idx) => (
                    <tr key={idx}>
                      <td>{w.name || "—"}</td>
                      <td>{w.damage || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Inventaire */}
          <div className="pdf-card pdf-inventory-card">
            <h2 className="pdf-card-title">Inventaire</h2>
            {safeInventory.length === 0 ? (
              <p className="pdf-empty-text">Aucun objet.</p>
            ) : (
              <table className="pdf-inventory-table">
                <thead>
                  <tr>
                    <th>Objet</th>
                    <th>Qté</th>
                  </tr>
                </thead>
                <tbody>
                  {safeInventory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name || "—"}</td>
                      <td>{item.quantity ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Compétences spéciales */}
          <div className="pdf-card pdf-special-competences-card">
            <h2 className="pdf-card-title">Compétences spéciales</h2>
            {special.length === 0 ? (
              <p className="pdf-empty-text">
                Aucune compétence spéciale.
              </p>
            ) : (
              <table className="pdf-special-competences-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {special.map((sc) => (
                    <tr key={sc.id || sc.name}>
                      <td>{sc.name || "—"}</td>
                      <td>
                        {sc.score != null ? `${sc.score}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Colonne DROITE : Compétences */}
        <div className="pdf-card pdf-competences">
          <h2 className="pdf-card-title">Compétences</h2>
          <table className="pdf-competence-table">
            <thead>
              <tr>
                <th>Compétence</th>
                <th>Type</th>
                <th>Lien</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {baseCompetences.map((c) => (
                <tr key={c.id || c.name}>
                  <td>{c.name}</td>
                  <td>{c.type || ""}</td>
                  <td>{c.link || ""}</td>
                  <td>{c.score != null ? `${c.score}%` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bas de page : XP / Bourse / Joueur */}
      <section className="pdf-bottom-row">
        {/* XP + Bourse */}
        <div className="pdf-bottom-left">
          <div className="pdf-card pdf-xp-card">
            <div className="pdf-xp-row">
              <span>XP</span>
              <span className="pdf-xp-value">{xp || 0} XP</span>
            </div>
          </div>

          <div className="pdf-card pdf-purse-card">
            <h3 className="pdf-card-subtitle">Bourse</h3>
            <div className="pdf-purse-row">
              <span>Or</span>
              <span>{String(gold).padStart(2, "0")}</span>
            </div>
            <div className="pdf-purse-row">
              <span>Argent</span>
              <span>{String(silver).padStart(2, "0")}</span>
            </div>
            <div className="pdf-purse-row">
              <span>Cuivre</span>
              <span>{String(copper).padStart(2, "0")}</span>
            </div>
            <div className="pdf-purse-row">
              <span>Fer</span>
              <span>{String(iron).padStart(2, "0")}</span>
            </div>
          </div>
        </div>

        {/* Joueur */}
        <div className="pdf-card pdf-player-card">
          <span>Joueur</span>
          <span className="pdf-player-name">
            {playerName || " "}
          </span>
        </div>
      </section>
    </div>
  );
}
