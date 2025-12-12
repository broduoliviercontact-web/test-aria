// src/App.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
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
import ArmureBadge from "./components/ArmureBadge";
import WeaponList from "./components/WeaponList";
import PhraseDeSynthese from "./components/PhraseDeSynthese";
import EquipmentKitModal from "./components/EquipmentKitModal";
import AlchemyPotions from "./components/AlchemyPotions";
import StartingGoldRoller from "./components/StartingGoldRoller";

// ✅ pour choisir une icône d'arme par défaut quand le kit Aventurier ajoute une arme
import { weaponIcons } from "./bladeIcons";

// PDF
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// 🔐 Auth
import { useAuth } from "./components/AuthContext";

// 💾 Mes personnages
import MyCharacters from "./components/MyCharacters";

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

// Règles de point-buy (60 points au total) (chez toi c’est 84 total - 4*6 = 60)
const STAT_TOTAL_POINTS = 84;
const STAT_MIN = 4;
const STAT_MAX = 18;

/* ===========================
   PANEL D'AUTH SUR LA HOME
   =========================== */

function HomeAuthPanel({
  user,
  loading,
  error,
  onLogin,
  onRegister,
  onLogout,
  clearError,
  onGoToMyCharacters,
}) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) clearError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (mode === "login") {
        await onLogin({
          email: form.email,
          password: form.password,
        });
      } else {
        await onRegister({
          email: form.email,
          password: form.password,
          displayName: form.displayName,
        });
      }
    } catch (err) {
      console.error("Erreur auth :", err);
    }
  }

  return (
    <section className="home-section">
      <h3>Connexion & sauvegarde</h3>
      <p className="home-section-text">
        Tu peux créer autant de personnages que tu veux sans compte.
        <br />
        Si tu crées un compte, tu pourras en plus les{" "}
        <strong>sauvegarder sur le serveur</strong>.
      </p>

      {loading ? (
        <p className="auth-loading-text">Vérification de ta connexion...</p>
      ) : user ? (
        <div className="auth-connected-panel">
          <p className="auth-connected-text">
            Connecté en tant que{" "}
            <strong>{user.displayName || user.email}</strong>.
          </p>
          <p className="auth-connected-subtext">
            Tes personnages pourront être sauvegardés sur ton compte.
          </p>
          <div className="auth-connected-actions">
            <button type="button" className="btn-secondary" onClick={onLogout}>
              Se déconnecter
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={onGoToMyCharacters}
            >
              Mes personnages
            </button>
          </div>
        </div>
      ) : (
        <div className="auth-anonymous-panel">
          <div className="auth-mode-switch">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={
                mode === "login"
                  ? "btn-primary auth-mode-btn"
                  : "btn-secondary auth-mode-btn"
              }
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={
                mode === "register"
                  ? "btn-primary auth-mode-btn"
                  : "btn-secondary auth-mode-btn"
              }
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-inline">
            {mode === "register" && (
              <div className="auth-field">
                <label className="auth-field-label">Pseudo (nom affiché)</label>
                <input
                  type="text"
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  className="auth-field-input"
                />
              </div>
            )}

            <div className="auth-field">
              <label className="auth-field-label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="auth-field-input"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-field-label">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="auth-field-input"
                required
              />
            </div>

            {error && <div className="auth-error-banner">{error}</div>}

            <button type="submit" className="btn-primary">
              {mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

/* ===========================
   PAGE D’ACCUEIL
   =========================== */

function Home({ onStart, onGoToMyCharacters, auth }) {
  const { user, loading, error, login, register, logout, setError } = auth;

  return (
    <div className="home-page app-home">
      <div className="home-root">
        <header className="home-header">
          <img src="/Aria_logo.webp" alt="Logo Aria" className="home-logo-img" />
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
                <button type="button" className="btn-primary" onClick={onStart}>
                  Créer un personnage
                </button>
                {user && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={onGoToMyCharacters}
                  >
                    Mes personnages
                  </button>
                )}
              </div>
            </div>
          </section>

          <HomeAuthPanel
            user={user}
            loading={loading}
            error={error}
            onLogin={login}
            onRegister={register}
            onLogout={logout}
            clearError={setError}
            onGoToMyCharacters={onGoToMyCharacters}
          />

          <section className="home-section">
            <h3>Comment ça marche ?</h3>
            <ul className="home-steps">
              <li>
                Tu peux créer des personnages <strong>sans compte</strong>.
              </li>
              <li>
                Si tu te connectes, tu peux <strong>les sauvegarder</strong> en
                base.
              </li>
              <li>
                Choisis les modes de création (compétences & caractéristiques).
              </li>
              <li>
                En mode <strong>3d6</strong> : tu choisis un jet et ensuite la
                zone de dés disparaît.
              </li>
              <li>
                Choisis ton <strong>kit d’équipement</strong> (une seule fois).
              </li>
              <li>Gère ton inventaire et exporte ta fiche en PDF.</li>
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
   APP PRINCIPALE
   =========================== */

function App() {
  const auth = useAuth();
  const { user } = auth;

  const [page, setPage] = useState("home"); // "home" | "character" | "my-characters"

  const [stats, setStats] = useState(INITIAL_STATS);
  const [characterName, setCharacterName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [age, setAge] = useState("");
  const [xp, setXp] = useState(0);

  const [phraseGenial, setPhraseGenial] = useState("");
  const [phraseSociete, setPhraseSociete] = useState("");

  const [portraitDataUrl, setPortraitDataUrl] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("aria-portrait-url") || "";
    } catch {
      return "";
    }
  });

  const [showCreationModal, setShowCreationModal] = useState(true);

  const [skillMode, setSkillMode] = useState("ready"); // "ready" | "custom"
  const [statMode, setStatMode] = useState("3d6"); // "3d6" | "point-buy"
  const [statPointsPool, setStatPointsPool] = useState(0);

  // 🔁 id du perso courant (pour PUT au lieu de POST)
  const [currentCharacterId, setCurrentCharacterId] = useState(null);

  // ✅ one-shot: dés (3d6) → disparaît dès qu’on applique un jet
  const [statsRolled, setStatsRolled] = useState(false);

  const [competences, setCompetences] = useState([]);
  const [specialCompetences, setSpecialCompetences] = useState([]);
  const [profession, setProfession] = useState("");
  const [inventory, setInventory] = useState([]);
  const [weapons, setWeapons] = useState([]);

  const [wounds, setWounds] = useState(0);
  const [armor, setArmor] = useState(0);
  const [hitPoints, setHitPoints] = useState(20);
  const [maxHitPoints] = useState(24);

  const [isKitModalOpen, setIsKitModalOpen] = useState(false);
  const [selectedKit, setSelectedKit] = useState(null); // si non-null → le bouton kit disparaît

  const [isAlchemist, setIsAlchemist] = useState(false);
  const [alchemyPotions, setAlchemyPotions] = useState([]);

  const [purseFer, setPurseFer] = useState(0);

  const screenSheetRef = useRef(null);
  const pdfSheetRef = useRef(null);

  const isStatsLockedForUi = statMode === "3d6"; // en 3d6: pas de +/- sur les stats

  // ✅ helper: choisir une icône "arme 1 main" (sinon fallback = première icône)
  const getDefaultOneHandWeaponIcon = useCallback(() => {
    const list = Array.isArray(weaponIcons) ? weaponIcons : [];
    if (list.length === 0) return "";

    const preferred = list.find((icon) =>
      /épée|epee|dague|rapiere|rapiere|sabre|arme/i.test(icon.label || "")
    );

    return preferred?.url || list[0]?.url || "";
  }, []);

  // Alchimie: ajoute compétences/potions de base quand activée
  useEffect(() => {
    if (!isAlchemist) return;

    setSpecialCompetences((prev) => {
      const alreadyHasIdentify = prev.some(
        (c) => c.name === "Identifier une substance"
      );
      const alreadyHasCreate = prev.some((c) => c.name === "Créer une potion");

      const updated = [...prev];

      if (!alreadyHasIdentify) {
        updated.push({
          id: "alch-identify",
          name: "Identifier une substance",
          score: 40,
          locked: true,
        });
      }

      if (!alreadyHasCreate) {
        updated.push({
          id: "alch-create",
          name: "Créer une potion",
          score: 60,
          locked: true,
        });
      }

      return updated;
    });

    setAlchemyPotions((prev) => {
      const updated = [...prev];

      const ensurePotion = (name, effectText) => {
        const existingIndex = updated.findIndex((p) => p.name === name);

        if (existingIndex === -1) {
          updated.push({
            id: name.toLowerCase().replace(/\s+/g, "-"),
            name,
            effect: effectText,
            difficulty: "",
            quantity: 0,
          });
        } else if (!updated[existingIndex].effect) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            effect: effectText,
          };
        }
      };

      ensurePotion(
        "Essence du feu d’Ingramus",
        "Bien secouer avant utilisation. Lancer la potion dans un endroit éloigné et être prêt pour une grosse explosion."
      );

      ensurePotion("Passe-Muraille de Karloff", "Dissout tout, sauf le verre.");

      return updated;
    });
  }, [isAlchemist]);

  // PV = Endurance (cap 14) — logique existante chez toi
  useEffect(() => {
    const enduranceStat = stats.find((s) => s.id === "endurance");
    if (!enduranceStat) return;
    const newHP = Math.min(enduranceStat.value, 14);
    setHitPoints(newHP);
  }, [stats]);

  const handleCompetencesChange = useCallback((next) => {
    setCompetences(next);
  }, []);

  const handleChangePortrait = useCallback((value) => {
    const finalValue = value || "";
    setPortraitDataUrl(finalValue);
    try {
      if (finalValue) {
        localStorage.setItem("aria-portrait-url", finalValue);
      } else {
        localStorage.removeItem("aria-portrait-url");
      }
    } catch (e) {
      console.warn("Impossible de stocker le portrait dans localStorage", e);
    }
  }, []);

  const parseKitItem = (rawLabel) => {
    const [firstChoice] = rawLabel.split(" ou ");
    const regex = /\((x?\d+)\)/i;
    const match = firstChoice.match(regex);

    let quantity = 1;
    let name = firstChoice.trim();

    if (match) {
      const raw = match[1];
      if (raw.toLowerCase().startsWith("x")) quantity = parseInt(raw.slice(1), 10);
      else quantity = parseInt(raw, 10);
      name = firstChoice.replace(match[0], "").trim();
    }

    return { name, quantity };
  };

  const handleKitConfirm = (kit, options = {}) => {
    if (!kit) return;

    setSelectedKit(kit);
    setIsKitModalOpen(false);

    // ✅ INVENTAIRE : tous les kits sauf "arme à une main" du combattant (géré en weapons)
    setInventory((prev) => {
      const cleaned = prev.filter((item) => !item.fromKit);
      let updated = [...cleaned];
      const now = Date.now();

      kit.content.forEach((label) => {
        // combattant : on ne met pas "Arme à une main" dans l’inventaire
        if (kit.id === "combattant" && label.includes("Arme à une main")) {
          return;
        }

        // érudit : choix Fioles (x5) OU Sablier
        if (kit.id === "erudit" && label.includes("Fioles (x5) ou Sablier")) {
          let name;
          let quantity;

          if (options.eruditChoice === "fioles") {
            name = "Fioles";
            quantity = 5;
          } else if (options.eruditChoice === "sablier") {
            name = "Sablier";
            quantity = 1;
          } else {
            return;
          }

          const existingIndex = updated.findIndex(
            (item) => item.fromKit && item.name === name
          );

          if (existingIndex !== -1) {
            const existing = updated[existingIndex];
            updated[existingIndex] = {
              ...existing,
              quantity: (existing.quantity || 0) + quantity,
            };
          } else {
            updated.push({
              id: `kit-${kit.id}-${name}-${now}-${Math.random()
                .toString(16)
                .slice(2)}`,
              name,
              quantity,
              fromKit: true,
            });
          }
          return;
        }

        const { name, quantity } = parseKitItem(label);

        const existingIndex = updated.findIndex(
          (item) => item.fromKit && item.name === name
        );

        if (existingIndex !== -1) {
          const existing = updated[existingIndex];
          updated[existingIndex] = {
            ...existing,
            quantity: (existing.quantity || 0) + quantity,
          };
        } else {
          updated.push({
            id: `kit-${kit.id}-${name}-${now}-${Math.random()
              .toString(16)
              .slice(2)}`,
            name,
            quantity,
            fromKit: true,
          });
        }
      });

      return updated;
    });

    // ✅ WEAPONS : aventurier → ajoute 1 arme à une main directement dans weapon-list
    if (kit.id === "aventurier") {
      const defaultIcon = getDefaultOneHandWeaponIcon();
      setWeapons((prevWeapons) => [
        ...prevWeapons,
        { icon: defaultIcon, name: "Arme à une main", damage: "", validated: false },
      ]);
    }

    // ✅ WEAPONS : combattant → choix 2 armes 1 main OU 1 arme 2 mains
    if (kit.id === "combattant" && options.combattantWeaponChoice) {
      setWeapons((prevWeapons) => {
        const baseWeapon = { icon: "", name: "", damage: "", validated: false };

        if (options.combattantWeaponChoice === "twoOneHand") {
          return [
            ...prevWeapons,
            { ...baseWeapon, name: "Arme à une main" },
            { ...baseWeapon, name: "Arme à une main" },
          ];
        }

        if (options.combattantWeaponChoice === "twoHand") {
          return [...prevWeapons, { ...baseWeapon, name: "Arme à deux mains" }];
        }

        return prevWeapons;
      });
    }
  };

  const handleChangeSkillMode = (mode) => setSkillMode(mode);

  const handleChangeStatMode = (mode) => {
    setStatMode(mode);

    // important : si on repasse en 3d6, on veut revoir le roller
    setStatsRolled(false);

    if (mode === "point-buy") {
      const count = INITIAL_STATS.length;
      const base = STAT_MIN;
      const used = base * count;
      const pool = STAT_TOTAL_POINTS - used;

      setStats(() =>
        INITIAL_STATS.map((stat) => ({
          ...stat,
          value: base,
          min: STAT_MIN,
          max: STAT_MAX,
        }))
      );
      setStatPointsPool(pool);
    } else {
      setStats(() =>
        INITIAL_STATS.map((stat) => ({
          ...stat,
          value: 10,
          min: 0,
          max: 20,
        }))
      );
      setStatPointsPool(0);
    }
  };

  const handleChangeStat = (id, delta) => {
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

    // mode 3d6 : on ne modifie pas à la main
    return;
  };

  const handleDeleteCharacter = () => {
    setStats(INITIAL_STATS);
    setCharacterName("");
    setPlayerName("");
    setAge("");
    setXp(0);
    setCompetences([]);
    setSpecialCompetences([]);
    setProfession("");
    setInventory([]);
    setWeapons([]);
    setPurseFer(0);
    setSkillMode("ready");
    setStatMode("3d6");
    setStatPointsPool(0);
    setShowCreationModal(true);
    setPhraseGenial("");
    setPhraseSociete("");
    setHitPoints(20);
    setWounds(0);
    setArmor(0);
    setIsAlchemist(false);
    setAlchemyPotions([]);

    // reset kit + id
    setSelectedKit(null);
    setIsKitModalOpen(false);
    setCurrentCharacterId(null);

    // reset dés
    setStatsRolled(false);

    // portrait
    setPortraitDataUrl("");
    try {
      localStorage.removeItem("aria-portrait-url");
    } catch {
      // ignore
    }
  };

  const characterPayload = {
    meta: {
      status: "draft",
    },
    player: playerName,
    name: characterName,
    age: age === "" ? null : Number(age),
    profession,
    stats,
    statMode,
    statPointsPool,
    skillMode,
    isAlchemist,
    alchemyPotions,
    xp,
    inventory,
    weapons,
    purseFer,
    competences,
    specialCompetences,
    phraseGenial,
    phraseSociete,
    portrait: portraitDataUrl,
  };

  const handleSaveToBackend = async (redirectToMyCharacters = false) => {
    if (!user) {
      alert(
        "Pour sauvegarder ce personnage sur le serveur, il faut te connecter ou créer un compte (formulaire sur la page d'accueil)."
      );
      return;
    }

    if (!characterName.trim()) {
      alert("Tu dois donner un nom à ton personnage avant de l'enregistrer 🙂");
      return;
    }

    const payloadForBackend = { ...characterPayload };

    try {
      let res;
      let data = null;

      if (currentCharacterId) {
        res = await fetch(`${API_URL}/characters/${currentCharacterId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payloadForBackend),
        });
      } else {
        res = await fetch(`${API_URL}/characters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payloadForBackend),
        });
      }

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        console.error("❌ Erreur API /characters :", data);
        alert(
          (data && data.message) ||
            "Erreur lors de la sauvegarde du personnage sur le serveur."
        );
        return;
      }

      // après POST : on garde l'id pour les futures updates
      if (!currentCharacterId && data && (data._id || data.id)) {
        setCurrentCharacterId(data._id || data.id);
      }

      if (redirectToMyCharacters) {
        setPage("my-characters");
      } else {
        alert("Personnage sauvegardé sur le serveur !");
      }
    } catch (err) {
      console.error("❌ Erreur réseau /characters :", err);
      alert("Erreur réseau lors de la sauvegarde du personnage.");
    }
  };

  const handleLoadCharacterFromBackend = async (id) => {
    if (!user) {
      alert(
        "Il faut être connecté pour charger un personnage sauvegardé sur le serveur."
      );
      return;
    }

    try {
      const res = await fetch(`${API_URL}/characters/${id}`, {
        credentials: "include",
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        console.error("❌ Erreur API GET /characters/:id :", data);
        alert(
          (data && data.message) ||
            "Erreur en récupérant le personnage depuis le serveur."
        );
        return;
      }

      const ch = data || {};

      setCurrentCharacterId(ch._id || ch.id || null);

      setCharacterName(ch.name || "");
      setPlayerName(ch.player || "");
      setAge(
        typeof ch.age === "number" && !Number.isNaN(ch.age) ? String(ch.age) : ""
      );
      setProfession(ch.profession || "");

      setStats(
        Array.isArray(ch.stats) && ch.stats.length > 0 ? ch.stats : INITIAL_STATS
      );

      setStatMode(ch.statMode || "3d6");
      setStatPointsPool(
        typeof ch.statPointsPool === "number" ? ch.statPointsPool : 0
      );
      setSkillMode(ch.skillMode || "ready");

      setXp(typeof ch.xp === "number" ? ch.xp : 0);

      setInventory(Array.isArray(ch.inventory) ? ch.inventory : []);
      setWeapons(Array.isArray(ch.weapons) ? ch.weapons : []);
      setPurseFer(typeof ch.purseFer === "number" ? ch.purseFer : 0);

      // ✅ kit : si inventaire contient fromKit → bouton kit reste caché
      const hasKitItems =
        Array.isArray(ch.inventory) &&
        ch.inventory.some((item) => item && item.fromKit);

      if (hasKitItems) setSelectedKit(ch.kit || { id: "loaded-kit" });
      else setSelectedKit(null);

      // ✅ dés : si perso chargé en 3d6 → on cache le roller
      setStatsRolled((ch.statMode || "3d6") === "3d6");

      setCompetences(Array.isArray(ch.competences) ? ch.competences : []);
      setSpecialCompetences(
        Array.isArray(ch.specialCompetences) ? ch.specialCompetences : []
      );

      setPhraseGenial(ch.phraseGenial || "");
      setPhraseSociete(ch.phraseSociete || ch.phraseSocieter || "");

      const portraitFromBackend = ch.portrait || "";
      setPortraitDataUrl(portraitFromBackend);
      try {
        if (portraitFromBackend) {
          localStorage.setItem("aria-portrait-url", portraitFromBackend);
        } else {
          localStorage.removeItem("aria-portrait-url");
        }
      } catch {
        // ignore
      }

      if (ch.alchemy) {
        setIsAlchemist(!!ch.alchemy.enabled);
        setAlchemyPotions(Array.isArray(ch.alchemy.potions) ? ch.alchemy.potions : []);
      } else {
        setIsAlchemist(!!ch.isAlchemist);
        setAlchemyPotions(
          Array.isArray(ch.alchemyPotions) ? ch.alchemyPotions : []
        );
      }

      setShowCreationModal(false);
      setPage("character");
    } catch (err) {
      console.error("❌ Erreur réseau load character :", err);
      alert("Erreur réseau en chargeant le personnage depuis le serveur.");
    }
  };

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

      const imgProps = { width: canvas.width, height: canvas.height };
      const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
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
     NAVIGATION
     =========================== */

  if (page === "home") {
    return (
      <Home
        onStart={() => setPage("character")}
        onGoToMyCharacters={() => setPage("my-characters")}
        auth={auth}
      />
    );
  }

  if (page === "my-characters") {
    return (
      <MyCharacters
        user={user}
        onBackToHome={() => setPage("home")}
        onCreateNew={() => {
          handleDeleteCharacter();
          setPage("character");
        }}
        onLoadCharacter={handleLoadCharacterFromBackend}
      />
    );
  }

  // page === "character"
  return (
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
              onClick={() => setPage("my-characters")}
            >
              Mes personnages
            </button>
          </header>
        )}

        {showCreationModal && (
          <CreationModal
            skillMode={skillMode}
            onChangeSkillMode={handleChangeSkillMode}
            statMode={statMode}
            onChangeStatMode={handleChangeStatMode}
            onClose={() => setShowCreationModal(false)}
            isAlchemist={isAlchemist}
            onChangeIsAlchemist={setIsAlchemist}
          />
        )}

        {/* FICHE INTERACTIVE ÉCRAN */}
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
                <GoldPouch
                  totalFer={purseFer}
                  onChangeTotalFer={setPurseFer}
                  showStartingGold={!showCreationModal}
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
                onChangeImage={handleChangePortrait}
              />

              <div className="top-stats-card">
                <CharacterStats
                  stats={stats}
                  onChangeStat={handleChangeStat}
                  isLocked={isStatsLockedForUi}
                />
                {statMode === "point-buy" && (
                  <p className="stat-points-info">
                    Points à répartir restants : <strong>{statPointsPool}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Dice roller : uniquement au début en 3d6, puis disparaît après application */}
          {statMode === "3d6" && !statsRolled && (
            <StatsDiceRoller
              stats={stats}
              onApplyStats={(newStats) => {
                setStats(newStats);
                setStatsRolled(true); // ✅ disparaît après choix
              }}
            />
          )}

          {!showCreationModal && statsRolled && purseFer === 0 && (
            <StartingGoldRoller
              onConfirm={(couronnes) => setPurseFer(couronnes * 1000)}
            />
          )}

          {/* Sceptre qui flotte */}
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

                {/* ✅ kit : visible une seule fois */}
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
                  onCompetencesChange={handleCompetencesChange}
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

          {/* SECTION PHRASE DE SYNTHÈSE */}
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

          {/* XP + Nom du joueur */}
          <div className="xp-player-section">
            <CharacterXP xp={xp} onChangeXp={setXp} />
            <CharacterPlayer
              playerName={playerName}
              onPlayerNameChange={setPlayerName}
            />
          </div>

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
              weapons={weapons}
              portraitUrl={portraitDataUrl}
              hitPoints={hitPoints}
              wounds={wounds}
              armor={armor}
              phraseGenial={phraseGenial}
              phraseSociete={phraseSociete}
            />
          </div>

          {/* Boutons hors fiche */}
          <div className="export-actions" style={{ marginTop: "1rem" }}>
            <button type="button" className="btn-primary" onClick={handleExportPdf}>
              Exporter la fiche en PDF
            </button>
          </div>

          {/* ✅ Actions: seulement sauvegarder + supprimer */}
          <div className="creation-validate">
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleSaveToBackend(false)}
            >
              Sauvegarder le personnage
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleSaveToBackend(true)}
            >
              Sauvegarder et aller à “Mes personnages”
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleDeleteCharacter}
            >
              Supprimer le personnage
            </button>
          </div>

          <button type="button" className="btn-back" onClick={() => setPage("home")}>
            ← Retour à l&apos;accueil
          </button>

          <EquipmentKitModal
            isOpen={isKitModalOpen}
            onClose={() => setIsKitModalOpen(false)}
            onConfirm={handleKitConfirm}
            initialKitId={selectedKit ? selectedKit.id : null}
          />

          {/* Debug JSON */}
          {/* <pre className="debug-json">{JSON.stringify(characterPayload, null, 2)}</pre> */}
        </div>
      </div>
    </div>
  );
}

export default App;
