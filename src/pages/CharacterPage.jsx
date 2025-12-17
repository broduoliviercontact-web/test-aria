import React, { useMemo, useRef, useState } from "react";

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
import ArmureBadge from "../components/BlessureBadge"; // (je laisse comme ton fichier actuel)
import WeaponList from "../components/WeaponList";
import PhraseDeSynthese from "../components/PhraseDeSynthese";
import EquipmentKitModal from "../components/EquipmentKitModal";
import AlchemyPotions from "../components/AlchemyPotions";
import StartingGoldRoller from "../components/StartingGoldRoller";
import SpecialCompetenceDiceTray from "../components/SpecialCompetenceDiceTray";
import MagicModal from "../components/MagicModal";

// PDF
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function getStatValue(stats, statId) {
  const found = stats?.find((s) => s.id === statId);
  return found?.value ?? 0;
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

  // alchimie
  isAlchemist,
  onChangeIsAlchemist,

  // magie
  isMageEnabled,
  onChangeIsMageEnabled,
}) {
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
            Ensuite, <strong>vous sauvegardez</strong>.
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
          <span className={`mode-label ${skillMode !== "custom" ? "active" : ""}`}>
            Calculs prêts à jouer
          </span>

          <label className="switch">
            <input
              className="toggle"
              type="checkbox"
              checked={skillMode === "custom"}
              onChange={handleToggleSkillMode}
            />
            <span className="slider" />
            <span className="card-side" />
          </label>

          <span className={`mode-label ${skillMode === "custom" ? "active" : ""}`}>
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

        <h3>Magie</h3>
        <p>Ce personnage possède-t-il le don de magie (cartes) ?</p>
        <label style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
          <input
            type="checkbox"
            checked={isMageEnabled}
            onChange={(e) => onChangeIsMageEnabled(e.target.checked)}
            style={{ marginRight: "0.4rem" }}
          />
          Activer la magie (nécessite INT ≥ 14 pour lancer des sorts)
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

  // ✅ validation point-buy (réversible)
  isPointBuyValidated,
  setIsPointBuyValidated,

  // ✅ validation compétences custom (pilotée par parent)
  isCustomSkillsValidated,
  setIsCustomSkillsValidated,

  // dés (3d6)
  statsRolled,
  setStatsRolled,

  // stats + handler point-buy
  stats,
  onChangeStat,

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

  // magie
  magic,
  setMagic,

  // XP
  xp,
  setXp,

  // backend
  onSave,
  onSaveAndGoMyCharacters,
  onDeleteCharacter,
}) {
  // refs internes
  const screenSheetRef = useRef(null);
  const pdfSheetRef = useRef(null);

  // ===========================
  // MAGIE (modal + state)
  // ===========================
  const [isMagicOpen, setIsMagicOpen] = useState(false);

  // INT : on couvre plusieurs id possibles
  const intValue =
    getStatValue(stats, "INT") ||
    getStatValue(stats, "intelligence") ||
    getStatValue(stats, "int") ||
    0;

  // Mage effectif = option magie activée + INT >= 14
  const isMage = !!magic.isMage && intValue >= 14;
const minScoreById = useMemo(() => {
  const type = magic?.mageType || "outsider";

  // outsider: pas de plancher
  if (type === "outsider") return {};

  // academy: Connaissance des secrets 60, Lire/écrire 80
  if (type === "academy") {
    return {
      connaissance_secrets: 60,
      lire_ecrire: 80,
    };
  }

  // misericordieux: Modélisation gérée en special skill (pas ici),
  // mais planchers demandés :
  // Connaissance des secrets 60, Lire/écrire 80, Voler 30, Combat rapproché 60
  if (type === "misericordieux") {
    return {
      connaissance_secrets: 60,
      lire_ecrire: 80,
      voler: 30,
      combat_rapproche: 60,
    };
  }

  return {};
}, [magic?.mageType]);

  function openMagic() {
    if (!isMage) return;
    setIsMagicOpen(true);
  }

  // ====== MAGIE : logique deck / tirage ======
function createDeck(deckSize = 24, includeJoker = true) {
  const families = ["carreau", "coeur", "pique", "trefle"];
  const full = [];

  families.forEach((family) => {
    for (let value = 1; value <= 13; value++) {
      full.push({ family, value });
    }
  });

  if (includeJoker) {
    full.push({ family: "joker", value: "joker" });
  }

  // shuffle Fisher–Yates (plus propre que sort random)
  for (let i = full.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [full[i], full[j]] = [full[j], full[i]];
  }

  const size = Math.max(1, Math.min(full.length, Number(deckSize) || 24));
  return full.slice(0, size);
}

  function drawMagicCard() {
    setMagic((prev) => {
      if (prev.currentCard) return prev;

      const deck = prev.deck.length ? [...prev.deck] : createDeck(prev.deckSize);
      const card = deck.shift();
      if (!card) return prev;

      return {
        ...prev,
        deck,
        currentCard: card,
      };
    });
  }

  function resetMagic() {
    setMagic((prev) => ({
      ...prev,
      deck: [],
      currentCard: null,
      used: [],
    }));
  }

  function useCurrentCard() {
    setMagic((prev) => {
      if (!prev.currentCard) return prev;
      return {
        ...prev,
        currentCard: null,
        used: [...prev.used, prev.currentCard],
      };
    });
  }

  function discardCurrentCard() {
    setMagic((prev) => {
      if (!prev.currentCard) return prev;
      return {
        ...prev,
        currentCard: null,
      };
    });
  }

  const remainingCards = useMemo(() => {
    const total = Number(magic.deckSize) || 24;
    const used = magic.used.length;
    const inHand = magic.currentCard ? 1 : 0;
    const deckKnown = magic.deck.length;

    if (used === 0 && inHand === 0 && deckKnown === 0) return total;
    return deckKnown;
  }, [magic.deckSize, magic.used.length, magic.currentCard, magic.deck.length]);

  // ✅ Save handlers : on valide automatiquement (caracs + compétences custom)
  function handleSave() {
    if (statMode === "point-buy") setIsPointBuyValidated(true);
    if (skillMode === "custom") setIsCustomSkillsValidated(true);
    onSave();
  }

  function handleSaveAndGo() {
    if (statMode === "point-buy") setIsPointBuyValidated(true);
    if (skillMode === "custom") setIsCustomSkillsValidated(true);
    onSaveAndGoMyCharacters();
  }

  const handleExportPdf = async () => {
    if (!pdfSheetRef.current) return;

    document.body.classList.add("pdf-exporting");

    try {
      const element = pdfSheetRef.current;

      const imgs = Array.from(element.querySelectorAll("img"));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise((resolve) => {
              if (!img || img.complete) return resolve();
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            })
        )
      );

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#f6ebd3",
        imageTimeout: 15000,
        logging: false,
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("Canvas vide (0x0) — élément PDF non rendu ou caché.");
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;

      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save("fiche-personnage-aria.pdf");
    } catch (error) {
      console.error("Erreur pendant la génération du PDF :", error);
      alert("Erreur pendant la génération du PDF");
    } finally {
      document.body.classList.remove("pdf-exporting");
    }
  };

  const showGlobalUnlock =
    (statMode === "point-buy" && isPointBuyValidated) ||
    (skillMode === "custom" && isCustomSkillsValidated);

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
              isMageEnabled={magic.isMage}
              onChangeIsMageEnabled={(checked) => {
                setMagic((prev) => ({
                  ...prev,
                  isMage: checked,
                  ...(checked ? {} : { deck: [], currentCard: null, used: [] }),
                }));
              }}
            />
          )}

          {/* FICHE INTERACTIVE */}
          <div ref={screenSheetRef} className="character-sheet-container">
            {/* En-tête */}
            <div className="sheet-header">
              <h1 className="sheet-header-title">
                {characterName || "Nom du personnage"}
              </h1>
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
                  <GoldPouch
                    totalFer={purseFer}
                    onChangeTotalFer={setPurseFer}
                  />
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
                    onChangeStat={onChangeStat}
                    isLocked={
                      isStatsLockedForUi ||
                      (statMode === "point-buy" && isPointBuyValidated)
                    }
                  />

                  {/* ✅ point-buy : Valider en haut, seulement quand pas validé */}
                  {statMode === "point-buy" && !isPointBuyValidated && (
                    <div
                      className="stat-points-info"
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        Points à répartir restants :{" "}
                        <strong>{statPointsPool}</strong>
                      </p>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setIsPointBuyValidated(true)}
                        disabled={statPointsPool !== 0}
                        title={
                          statPointsPool !== 0
                            ? "Il faut dépenser tous les points (0 restants) pour valider"
                            : "Valider la répartition"
                        }
                      >
                        Valider
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Roller 3d6 (one-shot) */}
            {statMode === "3d6" && !statsRolled && (
              <StatsDiceRoller
                stats={stats}
                onApplyStats={(newStats) => {
                  setStats(newStats);
                  setStatsRolled(true);
                }}
              />
            )}

            {/* Starting gold */}
            {!showCreationModal &&
              (statsRolled || statMode === "point-buy") &&
              purseFer === 0 && (
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

                  <div className="magic-btn-wrapper">
                    {magic.isMage && (
                      <button
                        type="button"
                        className="magic-btn"
                        onClick={openMagic}
                        disabled={!isMage}
                        title={!isMage ? "INT 14 minimum" : "Ouvrir la magie"}
                        aria-label="Ouvrir la magie"
                      >
                        <img
                          src="/icons/satanic.gif"
                          alt=""
                          className="magic-btn__img"
                        />
                      </button>
                    )}
                  </div>
                </div>

                <div className="competences-column">
                  <CompetenceList
                    stats={stats}
                    mode={skillMode}
                    isLocked={false}
                    onCompetencesChange={setCompetences}
                    initialCompetences={competences}
                    isCustomValidated={isCustomSkillsValidated}
                    setIsCustomValidated={setIsCustomSkillsValidated}
                statMode={statMode} 
               minScoreById={minScoreById}       
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
                isAlchemist={isAlchemist}
                alchemyPotions={alchemyPotions}
                phraseGenial={phraseGenial}
                phraseSociete={phraseSociete}
              />
            </div>

            {/* Export PDF */}
            <div className="export-actions" style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleExportPdf}
              >
                Exporter la fiche en PDF
              </button>
            </div>

            {/* Actions backend */}
            <div className="creation-validate">
              <button type="button" className="btn-primary" onClick={handleSave}>
                Sauvegarder le personnage
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleSaveAndGo}
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

              {/* ✅ Déverrouillage global (caracs + compétences) */}
              {showGlobalUnlock && (
                <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                  <div style={{ marginBottom: "0.35rem" }}>
                    Répartitions validées ✅
                  </div>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setIsPointBuyValidated(false);
                      setIsCustomSkillsValidated(false);
                      // En 3d6 : on ne ré-affiche plus le roller après validation
                      // donc on ne remet pas statsRolled à false ici.
                    }}
                  >
                    Déverrouiller
                  </button>
                </div>
              )}
            </div>

            {/* Retour accueil */}
            <button type="button" className="btn-back" onClick={onBackHome}>
              ← Retour à l&apos;accueil
            </button>

            {/* MagicModal */}
            <MagicModal
              isOpen={isMagicOpen}
              onClose={() => setIsMagicOpen(false)}
              isMage={isMage}
              intValue={intValue}
              
              magicEnabled={magic.isMage}
              remaining={remainingCards}
              currentCard={magic.currentCard}
              usedCards={magic.used}
              onDraw={drawMagicCard}
              onReset={resetMagic}
              onUseCurrent={useCurrentCard}
              onDiscardCurrent={discardCurrentCard}
            />

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