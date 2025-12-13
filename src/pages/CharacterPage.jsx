// src/pages/CharacterPage.jsx
import React, { useRef } from "react";

// Context dés
import { DiceRollProvider } from "../components/DiceRollContext";

// Components
import CharacterStats from "../components/CharacterStats";
import CharacterName from "../components/CharacterName";
import CharacterPlayer from "../components/CharacterPlayer";
import CompetenceList from "../components/CompetenceList";
import StatsDiceRoller from "../components/StatsDiceRoller";
import CharacterXP from "../components/CharacterXP";
import SpecialCompetences from "../components/SpecialCompetences";
import CharacterAge from "../components/CharacterAge";
import CharacterPortrait from "../components/CharacterPortrait";
import CharacterProfession from "../components/CharacterProfession";
import PdfCharacterSheet from "../components/PdfCharacterSheet";
import Inventory from "../components/Inventory";
import GoldPouch from "../components/GoldPouch";
import HitPointsBadge from "../components/HitPointsBadge";
import BlessureBadge from "../components/BlessureBadge";
import ArmureBadge from "../components/ArmureBadge";
import WeaponList from "../components/WeaponList";
import PhraseDeSynthese from "../components/PhraseDeSynthese";
import EquipmentKitModal from "../components/EquipmentKitModal";
import AlchemyPotions from "../components/AlchemyPotions";
import StartingGoldRoller from "../components/StartingGoldRoller";
import SpecialCompetenceDiceTray from "../components/SpecialCompetenceDiceTray";

// PDF
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ===========================
   MODALE DE CREATION
   =========================== */
function CreationModal({
  skillMode,
  onChangeSkillMode,
  statMode,
  onChangeStatMode,
  onClose,
  isAlchemist,
  onChangeIsAlchemist,
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
            Ensuite, <strong>vous sauvegardez</strong> (pas besoin de valider).
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

        <h3>Alchimie</h3>
        <p>Ce personnage pratique-t-il l&apos;alchimie (création de potions) ?</p>
        <label style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
          <input
            type="checkbox"
            checked={isAlchemist}
            onChange={(e) => onChangeIsAlchemist(e.target.checked)}
            style={{ marginRight: "0.4rem" }}
          />
          Activer la carte d&apos;alchimie (gestion des potions)
        </label>
      </div>
    </div>
  );
}

/* ===========================
   PAGE PERSONNAGE
   =========================== */
export default function CharacterPage({
  // nav
  user,
  onGoToMyCharacters,
  onBackHome,


    setStats,    

  // UI
  showCreationModal,
  setShowCreationModal,

  // modes
  skillMode,
  onChangeSkillMode,
  statMode,
  onChangeStatMode,
  isStatsLockedForUi,
  statPointsPool,

  // dés (3d6)
  statsRolled,
  setStatsRolled,

  // stats + handler point-buy
  stats,
  onChangeStat, // ✅ IMPORTANT : handler venant de App.jsx

  // identité
  characterName,
  setCharacterName,
  playerName,
  setPlayerName,
  age,
  setAge,
  profession,
  setProfession,
  portraitDataUrl,
  onChangePortrait,

  // PV / blessures / armure
  hitPoints,
  wounds,
  setWounds,
  armor,
  setArmor,

  // inventaire / armes / bourse
  inventory,
  setInventory,
  weapons,
  setWeapons,
  purseFer,
  setPurseFer,

  // kit
  selectedKit,
  isKitModalOpen,
  setIsKitModalOpen,
  onKitConfirm,

  // competences
  competences,
  setCompetences,
  specialCompetences,
  setSpecialCompetences,

  // phrases
  phraseGenial,
  setPhraseGenial,
  phraseSociete,
  setPhraseSociete,

  // alchimie
  isAlchemist,
  setIsAlchemist,
  alchemyPotions,
  setAlchemyPotions,

  // XP
  xp,
  setXp,

  // backend
  onSave,
  onSaveAndGoMyCharacters,
  onDeleteCharacter,
}) {
  // refs internes (tu peux aussi passer des refs depuis App si tu veux)
  const screenSheetRef = useRef(null);
  const pdfSheetRef = useRef(null);

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

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidthPx, pdfHeight / imgHeightPx);
      const imgWidth = imgWidthPx * ratio;
      const imgHeight = imgHeightPx * ratio;

      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save("fiche-personnage-aria.pdf");
    } catch (error) {
      console.error("Erreur pendant la génération du PDF :", error);
      alert("Erreur pendant la génération du PDF");
    }
  };

  return (
    <DiceRollProvider>
      <div className="character-page">
        <div className="app app-character">
          {user && (
            <header
              style={{
                width: "100%",
                marginBottom: "0.75rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#f5f0e6",
              }}
            >
              <span>
                Connecté en tant que{" "}
                <strong>{user.displayName || user.email}</strong>
              </span>
              <button
                type="button"
                className="btn-secondary"
                onClick={onGoToMyCharacters}
              >
                Mes personnages
              </button>
            </header>
          )}

          {showCreationModal && (
            <CreationModal
              skillMode={skillMode}
              onChangeSkillMode={onChangeSkillMode}
              statMode={statMode}
              onChangeStatMode={onChangeStatMode}
              onClose={() => setShowCreationModal(false)}
              isAlchemist={isAlchemist}
              onChangeIsAlchemist={setIsAlchemist}
            />
          )}

          {/* FICHE INTERACTIVE */}
          <div ref={screenSheetRef} className="character-sheet-container">
            {/* En-tête */}
            <div className="sheet-header">
              <div className="sheet-header-line" />
              <h1 className="sheet-header-title">
                {characterName || "Nom du personnage"}
              </h1>
              <div className="sheet-header-line" />
            </div>

            <div className="sheet-header-ornament">
              <img
                src="/crown-logo.svg"
                alt="Ornement de couronne"
                className="sheet-header-icon"
              />
            </div>

            {/* ZONE HAUTE */}
            <div className="top-grid">
              <div className="top-left">
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

                <div className="top-purse">
                  <GoldPouch totalFer={purseFer} onChangeTotalFer={setPurseFer} />
                </div>
              </div>

              <div className="top-center">
                <HitPointsBadge value={hitPoints} onChange={undefined} size={120} />
                <BlessureBadge value={wounds} onChange={setWounds} size={120} />
                <ArmureBadge value={armor} onChange={setArmor} size={120} />
              </div>

              <div className="top-right">
                <CharacterPortrait
                  imageUrl={portraitDataUrl}
                  onChangeImage={onChangePortrait}
                />

                <div className="top-stats-card">
                  <CharacterStats
                    stats={stats}
                    onChangeStat={onChangeStat} // ✅ FIX : point-buy fonctionne
                    isLocked={isStatsLockedForUi}
                  />

                  {statMode === "point-buy" && (
                    <p className="stat-points-info">
                      Points à répartir restants :{" "}
                      <strong>{statPointsPool}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Roller 3d6 (one-shot) */}
         {statMode === "3d6" && !statsRolled && (
  <StatsDiceRoller
    stats={stats}
    onApplyStats={(newStats) => {
      setStats(newStats);      // ✅ applique les caracs
      setStatsRolled(true);    // ✅ cache le roller
    }}
  />
)}


            {/* Starting gold (si tu l’utilises) */}
            {!showCreationModal && statsRolled && purseFer === 0 && (
              <StartingGoldRoller
                onConfirm={(couronnes) => setPurseFer(couronnes * 1000)}
              />
            )}

            {/* Layout stats/compétences */}
            <div className="stats-competences-wrapper">
              <div className="stats-separator-floating">
                <img
                  src="/septre-logo.svg"
                  alt="Ornement vertical"
                  className="stats-separator-floating-icon"
                />
              </div>

              <div className="stats-competences-layout">
                <div className="stats-column">
                  <Inventory items={inventory} onChange={setInventory} />

                  {!selectedKit && (
                    <button
                      type="button"
                      className="modal-primary-btn"
                      onClick={() => setIsKitModalOpen(true)}
                    >
                      Choisir un kit d’équipement
                    </button>
                  )}

                  <WeaponList weapons={weapons} onChange={setWeapons} />
                </div>

                <div className="competences-column">
                  <CompetenceList
                    stats={stats}
                    mode={skillMode}
                    isLocked={false}
                    onCompetencesChange={setCompetences}
                  />

                  <SpecialCompetences
                    specialCompetences={specialCompetences}
                    onChange={setSpecialCompetences}
                  />

                  {isAlchemist && (
                    <AlchemyPotions
                      potions={alchemyPotions}
                      onChange={setAlchemyPotions}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Phrase de synthèse */}
            <div className="phrase-section">
              <PhraseDeSynthese
                phraseGenial={phraseGenial}
                setPhraseGenial={setPhraseGenial}
                phraseSociete={phraseSociete}
                setPhraseSociete={setPhraseSociete}
              />
              <div className="phrase-ornament">
                <img
                  src="/couronne-logo.svg"
                  alt="Ornement de couronne"
                  className="phrase-ornament-icon"
                />
              </div>
            </div>

            {/* XP + Joueur */}
            <div className="xp-player-section">
              <CharacterXP xp={xp} onChangeXp={setXp} />
              <CharacterPlayer
                playerName={playerName}
                onPlayerNameChange={setPlayerName}
              />
            </div>

            {/* Dice tray bottom */}
            <SpecialCompetenceDiceTray
              competences={competences}
              specialCompetences={specialCompetences}
            />

            {/* Fiche PDF cachée */}
            <div
              ref={pdfSheetRef}
              style={{ position: "absolute", left: "-9999px", top: 0 }}
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
                weapons={weapons}
                portraitUrl={portraitDataUrl}
                hitPoints={hitPoints}
                wounds={wounds}
                armor={armor}
                phraseGenial={phraseGenial}
                phraseSociete={phraseSociete}
              />
            </div>

            {/* Export PDF */}
            <div className="export-actions" style={{ marginTop: "1rem" }}>
              <button type="button" className="btn-primary" onClick={handleExportPdf}>
                Exporter la fiche en PDF
              </button>
            </div>

            {/* Actions backend */}
            <div className="creation-validate">
              <button type="button" className="btn-primary" onClick={onSave}>
                Sauvegarder le personnage
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={onSaveAndGoMyCharacters}
              >
                Sauvegarder et aller à “Mes personnages”
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={onDeleteCharacter}
              >
                Supprimer le personnage
              </button>
            </div>

            {/* Retour accueil */}
            <button type="button" className="btn-back" onClick={onBackHome}>
              ← Retour à l&apos;accueil
            </button>

            {/* Modal kit */}
            <EquipmentKitModal
              isOpen={isKitModalOpen}
              onClose={() => setIsKitModalOpen(false)}
              onConfirm={onKitConfirm}
              initialKitId={selectedKit ? selectedKit.id : null}
            />
          </div>
        </div>
      </div>
    </DiceRollProvider>
  );
}
