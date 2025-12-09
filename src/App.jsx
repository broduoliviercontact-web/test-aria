// src/App.jsx
import React, { useState, useRef, useCallback } from "react";
import "./App.css";

import CharacterStats from "./components/CharacterStats";
import CharacterName from "./components/CharacterName";
import CharacterPlayer from "./components/CharacterPlayer";
import CompetenceList from "./components/CompetenceList";
import StatsDiceRoller from "./components/StatsDiceRoller";
import CharacterXP from "./components/CharacterXP";
import SpecialCompetences from "./components/SpecialCompetences";
import CharacterAge from "./components/CharacterAge";
import CharacterPortrait from "./components/CharacterPortrait";
import CharacterProfession from "./components/CharacterProfession";
import PdfCharacterSheet from "./components/PdfCharacterSheet";
import Inventory from "./components/Inventory";
import GoldPouch from "./components/GoldPouch";
import HitPointsBadge from "./components/HitPointsBadge";
import BlessureBadge from "./components/BlessureBadge";
import ArmureBadge from "./components/ArmureBadge"; // 👈 ajoute ça
import WeaponList from "./components/WeaponList";

// PDF
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Caractéristiques de départ
const INITIAL_STATS = [
  { id: "force", label: "Force", value: 10, min: 0, max: 20 },
  { id: "dexterite", label: "Dextérité", value: 10, min: 0, max: 20 },
  { id: "endurance", label: "Endurance", value: 10, min: 0, max: 20 },
  { id: "intelligence", label: "Intelligence", value: 10, min: 0, max: 20 },
  { id: "agilite", label: "Agilité", value: 10, min: 0, max: 20 },
  { id: "charisme", label: "Charisme", value: 10, min: 0, max: 20 },
];

// Règles de point-buy
const STAT_TOTAL_POINTS = 60;
const STAT_MIN = 4;
const STAT_MAX = 18;

/* ===========================
   PAGE D’ACCUEIL
   =========================== */

function Home({ onStart }) {
  return (
    <div className="home-page">
      <div className="home-root">
        <header className="home-header">
          <img
            src="/Aria_logo.webp"
            alt="Logo Aria"
            className="home-logo-img"
          />
          <div className="home-logo">Fiche de personnage Aria</div>
          <p className="home-subtitle">
            Crée, gère et imprime ta fiche de personnage comme sur la fiche
            officielle, mais en numérique.
          </p>
        </header>

        <main className="home-main">
          <section className="hero-parchment">
            <div className="hero-inner">
              <h2 className="hero-title">Préparation de la campagne</h2>
              <p className="hero-text">
                Cette application te permet de créer un personnage pour Aria,
                ajuster ses caractéristiques, ses compétences, son inventaire et
                exporter une fiche PDF prête à être imprimée.
              </p>

              <div className="hero-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={onStart}
                >
                  Créer un personnage
                </button>
              </div>
            </div>
          </section>

          <section className="home-section">
            <h3>Comment ça marche ?</h3>
            <ul className="home-steps">
              <li>
                Choisis les modes de création (compétences & caractéristiques).
              </li>
              <li>Lance les dés ou répartis tes points.</li>
              <li>
                Valide ton personnage pour verrouiller les caracs & compétences.
              </li>
              <li>
                Gère ton inventaire, ta bourse, l’XP et exporte la fiche en PDF.
              </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ===========================
   MODALE DE CREATION
   =========================== */

function CreationModal({
  skillMode,
  onChangeSkillMode,
  statMode,
  onChangeStatMode,
  onClose,
}) {
  const isCustomSkills = skillMode === "custom";
  const isPointBuy = statMode === "point-buy";

  const handleToggleSkillMode = (event) => {
    const checked = event.target.checked;
    onChangeSkillMode(checked ? "custom" : "ready");
  };

  const handleToggleStatMode = (event) => {
    const checked = event.target.checked;
    onChangeStatMode(checked ? "point-buy" : "3d6");
  };

return (
    <div className="creation-modal-backdrop">
      <div className="creation-modal">
        <h2>Création de personnage</h2>
        <p>Bienvenue dans la fiche de personnage d&apos;Aria&nbsp;!</p>

        <ol>
          <li>
            Choisissez comment générer vos <strong>caractéristiques</strong>.
          </li>
          <li>
            Choisissez le mode de calcul des <strong>compétences</strong>.
          </li>
          <li>
            Lancez ou répartissez vos caractéristiques, puis personnalisez vos
            compétences.
          </li>
          <li>
            Quand tout est bon, cliquez sur{" "}
            <strong>“Valider la création du personnage”</strong>. Les jets de
            dés seront alors figés pour cette fiche.
          </li>
        </ol>
        <button type="button" className="modal-primary-btn" onClick={onClose}>
          Commencer la création
        </button>
        <h3>Méthode de génération des caractéristiques</h3>

        <div className="mode-switch stat-mode-switch">
          <span className={`mode-label ${!isPointBuy ? "active" : ""}`}>
            3d6 par caractéristique
          </span>

          <label className="switch">
            <input
              className="toggle"
              type="checkbox"
              checked={isPointBuy}
              onChange={handleToggleStatMode}
            />
            
            <span className="slider" />
            <span className="card-side" />
          </label>

          <span className={`mode-label ${isPointBuy ? "active" : ""}`}>
            Répartition 60 points
          </span>
        </div>

        <p className="stat-mode-hint">
          <strong>3d6 :</strong> lancez 3 dés à 6 faces pour chaque
          caractéristique et additionnez le résultat.
          <br />
          <strong>Répartition :</strong> commencez avec 4 dans chaque
          caractéristique et dépensez un total de 60 points sans dépasser 18.
        </p>

        <h3>Mode de calcul des compétences</h3>

        <div className="mode-switch">
          <span className={`mode-label ${!isCustomSkills ? "active" : ""}`}>
            Calculs prêts à jouer
          </span>

          <label className="switch">
            <input
              className="toggle"
              type="checkbox"
              checked={isCustomSkills}
              onChange={handleToggleSkillMode}
            />
            <span className="slider" />
            <span className="card-side" />
          </label>

          <span className={`mode-label ${isCustomSkills ? "active" : ""}`}>
            Personnalisation
          </span>
        </div>

        <p className="mode-switch-hint">
          <strong>Prêts à jouer :</strong> compétences calculées automatiquement
          (moyenne des caracs × 5).<br />
          <strong>Personnalisation :</strong> compétences basées sur les caracs,
          puis points à répartir à la main.
        </p>


      </div>
    </div>
  );
}
/* ===========================
   APP PRINCIPALE
   =========================== */

function App() {
  const [page, setPage] = useState("home"); // "home" | "character"

  const [stats, setStats] = useState(INITIAL_STATS);
  const [characterName, setCharacterName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [age, setAge] = useState("");
  const [xp, setXp] = useState(0);

  // Portrait en data URL (stocké en localStorage uniquement côté front)
  const [portraitDataUrl, setPortraitDataUrl] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("aria-portrait") || null;
    } catch {
      return null;
    }
  });

  // Mode de vie de la fiche : création, personnage validé, ou édition
  const [sheetMode, setSheetMode] = useState("create"); // "create" | "validated" | "edit"
  const isLocked = sheetMode === "validated";
  const canEditStatsAndSkills = sheetMode !== "validated";
  const canValidate = sheetMode !== "validated";

  const [showCreationModal, setShowCreationModal] = useState(true);
  const [isCreationDone, setIsCreationDone] = useState(false);

  const [skillMode, setSkillMode] = useState("ready"); // "ready" | "custom"
  const [statMode, setStatMode] = useState("3d6"); // "3d6" | "point-buy"
  const [statPointsPool, setStatPointsPool] = useState(0);

  const [competences, setCompetences] = useState([]);
  const [specialCompetences, setSpecialCompetences] = useState([]);
  const [profession, setProfession] = useState("");
  const [inventory, setInventory] = useState([]);


const [wounds, setWounds] = useState(0);

  const [armor, setArmor] = useState(0);

  // bourse (en pièces de fer)
  const [purseFer, setPurseFer] = useState(0);

  // refs écran + PDF
  const screenSheetRef = useRef(null);
  const pdfSheetRef = useRef(null);

// hit points
  const [hitPoints, setHitPoints] = useState(20);
const [maxHitPoints, setMaxHitPoints] = useState(24);


const [weapons, setWeapons] = useState([]);

  const handleCompetencesChange = useCallback(
    (next) => {
      if (!canEditStatsAndSkills) return;
      setCompetences(next);
    },
    [canEditStatsAndSkills]
  );


  /* ---------- Portrait : upload front-only ---------- */

  const handleChangePortrait = useCallback((dataUrl) => {
    setPortraitDataUrl(dataUrl);
    try {
      localStorage.setItem("aria-portrait", dataUrl);
    } catch (e) {
      console.warn("Impossible de stocker le portrait dans localStorage", e);
    }
  }, []);

  /* ---------- Changement de modes ---------- */

  const handleChangeSkillMode = (mode) => {
    setSkillMode(mode);
  };

  const handleChangeStatMode = (mode) => {
    setStatMode(mode);
    setIsCreationDone(false);

    if (mode === "point-buy") {
      const count = INITIAL_STATS.length;
      const base = STAT_MIN;
      const used = base * count;
      const pool = STAT_TOTAL_POINTS - used;

      setStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          value: base,
          min: STAT_MIN,
          max: STAT_MAX,
        }))
      );
      setStatPointsPool(pool);
    } else {
      // Retour au mode 3d6 : reset "propre"
      setStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          value: 10,
          min: 0,
          max: 20,
        }))
      );
      setStatPointsPool(0);
    }
  };

  /* ---------- Changement de caracs ---------- */

  const handleChangeStat = (id, delta) => {
    if (!canEditStatsAndSkills) return;

    if (statMode === "point-buy") {
      setStats((prevStats) => {
        const index = prevStats.findIndex((s) => s.id === id);
        if (index === -1) return prevStats;

        const stat = prevStats[index];

        let desired = stat.value + delta;
        if (desired < STAT_MIN) desired = STAT_MIN;
        if (desired > STAT_MAX) desired = STAT_MAX;

        let effectiveDelta = desired - stat.value;
        if (effectiveDelta === 0) return prevStats;

        // Si on veut monter mais qu'on n'a plus assez de points
        if (effectiveDelta > 0 && effectiveDelta > statPointsPool) {
          effectiveDelta = statPointsPool;
          desired = stat.value + effectiveDelta;
        }

        const updatedStats = prevStats.map((s) =>
          s.id === id ? { ...s, value: desired } : s
        );

        setStatPointsPool((pool) => pool - effectiveDelta);
        return updatedStats;
      });

      return;
    }

    // Mode 3d6 : simple clamp entre min / max
    setStats((prevStats) =>
      prevStats.map((stat) => {
        if (stat.id !== id) return stat;
        const min = stat.min ?? 0;
        const max = stat.max ?? 20;
        const newValue = stat.value + delta;
        const clampedValue = Math.max(min, Math.min(max, newValue));
        return { ...stat, value: clampedValue };
      })
    );
  };

  /* ---------- Validation / Edition / Suppression ---------- */

  const handleValidateCreation = () => {
    setIsCreationDone(true);
    setSheetMode("validated");
  };

  const handleEnterEditMode = () => {
    setSheetMode("edit");
  };

  const handleDeleteCharacter = () => {
    // Reset complet de la fiche
    setStats(INITIAL_STATS);
    setCharacterName("");
    setPlayerName("");
    setAge("");
    setXp(0);
    setCompetences([]);
    setSpecialCompetences([]);
    setProfession("");
    setInventory([]);
    setPurseFer(0);
    setSkillMode("ready");
    setStatMode("3d6");
    setStatPointsPool(0);
    setIsCreationDone(false);
    setSheetMode("create");
    setShowCreationModal(true);

    setPortraitDataUrl(null);
    try {
      localStorage.removeItem("aria-portrait");
    } catch {
      // ignore
    }
  };

  /* ---------- Payload pour le back ---------- */

  const characterPayload = {
    meta: {
      status:
        sheetMode === "validated"
          ? "validated"
          : sheetMode === "edit"
          ? "editing"
          : "draft",
      sheetMode,
    },
    player: playerName,
    name: characterName,
    age: age === "" ? null : Number(age),
    profession,
    stats,
    statMode,
    statPointsPool,
    skillMode,
    isCreationDone,
    xp,
    inventory,
    purseFer,
    competences,
    specialCompetences,
    // on NE met PAS portraitDataUrl ici pour ne pas stocker l'image dans le back
  };

  const handleSaveToBackend = async () => {
    try {
      const response = await fetch(`${API_URL}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(characterPayload),
      });

      const data = await response.json();
      console.log("✅ Réponse du back :", data);
      alert("Personnage envoyé au back-end !");
    } catch (error) {
      console.error("❌ Erreur en envoyant au back :", error);
      alert("Erreur en envoyant le personnage au back-end");
    }
  };

  /* ---------- Export PDF ---------- */

  const handleExportPdf = async () => {
    if (!pdfSheetRef.current) return;

    try {
      const element = pdfSheetRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = {
        width: canvas.width,
        height: canvas.height,
      };
      const ratio = Math.min(
        pdfWidth / imgProps.width,
        pdfHeight / imgProps.height
      );
      const imgWidth = imgProps.width * ratio;
      const imgHeight = imgProps.height * ratio;

      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save("fiche-personnage-aria.pdf");
    } catch (error) {
      console.error("Erreur pendant la génération du PDF :", error);
      alert("Erreur pendant la génération du PDF");
    }
  };

  /* ===========================
     RENDER
     =========================== */

  if (page === "home") {
    return <Home onStart={() => setPage("character")} />;
  }

  return (
    <div className="character-page">
      <div className="app app-character">
        <button
          type="button"
          className="btn-back"
          onClick={() => setPage("home")}
        >
          ← Retour à l&apos;accueil
        </button>

        {showCreationModal && (
          <CreationModal
            skillMode={skillMode}
            onChangeSkillMode={handleChangeSkillMode}
            statMode={statMode}
            onChangeStatMode={handleChangeStatMode}
            onClose={() => setShowCreationModal(false)}
          />
        )}

        {/* FICHE INTERACTIVE ÉCRAN */}
        <div ref={screenSheetRef}>
          <h1>Fiche de personnage Aria - Pré-prod</h1>

          {/* Identité + Caracs + Portrait */}
          <div className="identity-area">
            {/* Colonne 1 : Identité */}
            <section className="identity-card">
              <h2 className="identity-title">Identité</h2>
              <div className="identity-grid">
                <div className="identity-field">
                  <CharacterName
                    name={characterName}
                    onNameChange={setCharacterName}
                  />
                </div>
                <div className="identity-field">
                  <CharacterAge age={age} onAgeChange={setAge} />
                </div>
                <div className="identity-field">
                  <CharacterProfession
                    profession={profession}
                    onProfessionChange={setProfession}
                  />
                </div>
              </div>
            </section>

            {/* Colonne 2 : Caractéristiques */}
            <section className="identity-stats-column">
              <CharacterStats
                stats={stats}
                onChangeStat={handleChangeStat}
                isLocked={isLocked}
              />
            </section>

            {/* Colonne 3 : Portrait */}
            <CharacterPortrait
              imageUrl={portraitDataUrl}
              onChangeImage={handleChangePortrait}
            />
          </div>
<div className="hp-section">
  <HitPointsBadge
    value={hitPoints}
    onChange={setHitPoints}
    size={120}
  />

  <BlessureBadge
    value={wounds}
    onChange={setWounds}
    size={120}
  />

  <ArmureBadge
    value={armor}
    onChange={setArmor}
    size={120}
  />
</div>
          {/* Dice roller seulement en mode création + 3d6 */}
          {sheetMode === "create" && statMode === "3d6" && (
            <StatsDiceRoller
              stats={stats}
              onApplyStats={(newStats) => setStats(newStats)}
            />
          )}

          {/* Inventaire + Bourse / Compétences */}
          <div className="stats-competences-layout">
            {/* Colonne gauche : Inventaire + Bourse */}
            <div className="stats-column">
              <Inventory items={inventory} onChange={setInventory} />
<WeaponList weapons={weapons} onChange={setWeapons} />

              <GoldPouch
                totalFer={purseFer}
                onChangeTotalFer={setPurseFer}
              />
            </div>

            {/* Colonne droite : Compétences */}
            <div className="competences-column">
              <CompetenceList
                stats={stats}
                mode={skillMode}
                isLocked={isLocked}
                onCompetencesChange={handleCompetencesChange}
              />
              <SpecialCompetences
                specialCompetences={specialCompetences}
                onChange={(next) => {
                  if (!canEditStatsAndSkills) return;
                  setSpecialCompetences(next);
                }}
              />
            </div>
          </div>




          <CharacterXP xp={xp} onChangeXp={setXp} />

          <CharacterPlayer
            playerName={playerName}
            onPlayerNameChange={setPlayerName}
          />

          {/* Fiche PDF cachée */}
          <div
            ref={pdfSheetRef}
            style={{
              position: "absolute",
              left: "-9999px",
              top: 0,
            }}
          >
            <PdfCharacterSheet
              characterName={characterName}
              playerName={playerName}
              age={age}
              profession={profession}
              stats={stats}
              competences={competences}
              specialCompetences={specialCompetences}
              xp={xp}
              purseFer={purseFer}
              inventory={inventory}
              portraitUrl={portraitDataUrl}
                hitPoints={hitPoints}
  wounds={wounds}
  armor={armor}
            />
          </div>

          {/* Boutons hors fiche */}
          <div className="export-actions" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleExportPdf}
            >
              Exporter la fiche en PDF
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleSaveToBackend}
            >
              Envoyer au back-end
            </button>
          </div>

          {/* Validation / Edition / Suppression */}
          <div className="creation-validate">
            {sheetMode !== "validated" && (
              <>
                <button
                  type="button"
                  className="validate-btn"
                  onClick={handleValidateCreation}
                  disabled={!canValidate}
                >
                  Valider le personnage
                </button>
                <p className="creation-validate-hint">
                  Une fois validé, les caractéristiques et compétences seront
                  verrouillées. Vous pourrez toujours gérer l&apos;inventaire
                  et la bourse.
                </p>
              </>
            )}

            {sheetMode === "validated" && (
              <>
                <button
                  type="button"
                  className="validate-btn"
                  onClick={handleEnterEditMode}
                >
                  Passer en mode modification
                </button>
                <p className="creation-validate-hint">
                  Le personnage est verrouillé. Utilisez le mode modification
                  pour réautoriser les changements de caractéristiques et de
                  compétences.
                </p>
              </>
            )}

            <button
              type="button"
              className="btn-secondary"
              onClick={handleDeleteCharacter}
            >
              Supprimer le personnage
            </button>
          </div>

          {/* Debug JSON */}
          <pre className="debug-json">
            {JSON.stringify(characterPayload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
