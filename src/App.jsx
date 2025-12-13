// src/App.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import "./App.css";

import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import CharacterPage from "./pages/CharacterPage";
import MyCharactersPage from "./pages/CharactersPage";

// 🔐 Auth
import { useAuth } from "./components/AuthContext";

// ✅ pour choisir une icône d'arme par défaut quand le kit Aventurier ajoute une arme
import { weaponIcons } from "./bladeIcons";

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

// Règles point-buy (84 total - 4*6 = 60 points à répartir)
const STAT_TOTAL_POINTS = 84;
const STAT_MIN = 4;
const STAT_MAX = 18;

function AppRoutes() {
  const navigate = useNavigate();

  const auth = useAuth();
  const { user } = auth;

  // =========================
  // STATE GLOBAL (inchangé)
  // =========================
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

  const [isKitModalOpen, setIsKitModalOpen] = useState(false);
  const [selectedKit, setSelectedKit] = useState(null);

  const [isAlchemist, setIsAlchemist] = useState(false);
  const [alchemyPotions, setAlchemyPotions] = useState([]);

  const [purseFer, setPurseFer] = useState(0);

  // (refs gardés si tu en as encore besoin plus tard)
  const screenSheetRef = useRef(null);
  const pdfSheetRef = useRef(null);

  const isStatsLockedForUi = statMode === "3d6"; // en 3d6: pas de +/- sur les stats

  // =========================
  // HELPERS
  // =========================
  const getDefaultOneHandWeaponIcon = useCallback(() => {
    const list = Array.isArray(weaponIcons) ? weaponIcons : [];
    if (list.length === 0) return "";

    const preferred = list.find((icon) =>
      /épée|epee|dague|rapiere|sabre|arme/i.test(icon.label || "")
    );

    return preferred?.url || list[0]?.url || "";
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

  const handleCompetencesChange = useCallback((next) => {
    setCompetences(next);
  }, []);

  // =========================
  // ALCHEMIE AUTO-SETUP
  // =========================
  useEffect(() => {
    if (!isAlchemist) return;

    setSpecialCompetences((prev) => {
      const alreadyHasIdentify = prev.some((c) => c.name === "Identifier une substance");
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
          updated[existingIndex] = { ...updated[existingIndex], effect: effectText };
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

  // =========================
  // PV = Endurance (cap 14)
  // =========================
  useEffect(() => {
    const enduranceStat = stats.find((s) => s.id === "endurance");
    if (!enduranceStat) return;
    const newHP = Math.min(enduranceStat.value, 14);
    setHitPoints(newHP);
  }, [stats]);

  // =========================
  // MODES (skill / stat)
  // =========================
  const handleChangeSkillMode = (mode) => setSkillMode(mode);

  const handleChangeStatMode = (mode) => {
    setStatMode(mode);

    // si on repasse en 3d6, on veut revoir le roller
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

    // mode 3d6 : pas de modif manuelle
  };

  // =========================
  // KIT
  // =========================
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

    // INVENTAIRE
    setInventory((prev) => {
      const cleaned = prev.filter((item) => !item.fromKit);
      let updated = [...cleaned];
      const now = Date.now();

      kit.content.forEach((label) => {
        // combattant : on ne met pas "Arme à une main" dans l’inventaire
        if (kit.id === "combattant" && label.includes("Arme à une main")) return;

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
              id: `kit-${kit.id}-${name}-${now}-${Math.random().toString(16).slice(2)}`,
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
            id: `kit-${kit.id}-${name}-${now}-${Math.random().toString(16).slice(2)}`,
            name,
            quantity,
            fromKit: true,
          });
        }
      });

      return updated;
    });

    // WEAPONS : aventurier → ajoute 1 arme à une main
    if (kit.id === "aventurier") {
      const defaultIcon = getDefaultOneHandWeaponIcon();
      setWeapons((prevWeapons) => [
        ...prevWeapons,
        { icon: defaultIcon, name: "Arme à une main", damage: "", validated: false },
      ]);
    }

    // WEAPONS : combattant → choix 2 armes 1 main OU 1 arme 2 mains
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

  // =========================
  // RESET / DELETE LOCAL
  // =========================
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

    setSelectedKit(null);
    setIsKitModalOpen(false);
    setCurrentCharacterId(null);

    setStatsRolled(false);

    setPortraitDataUrl("");
    try {
      localStorage.removeItem("aria-portrait-url");
    } catch {
      // ignore
    }
  };

  // =========================
  // BACKEND SAVE / LOAD
  // =========================
  const characterPayload = {
    meta: { status: "draft" },
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

      if (!currentCharacterId && data && (data._id || data.id)) {
        setCurrentCharacterId(data._id || data.id);
      }

      if (redirectToMyCharacters) {
        navigate("/my-characters");
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
      alert("Il faut être connecté pour charger un personnage sauvegardé sur le serveur.");
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
      setAge(typeof ch.age === "number" && !Number.isNaN(ch.age) ? String(ch.age) : "");
      setProfession(ch.profession || "");

      setStats(Array.isArray(ch.stats) && ch.stats.length > 0 ? ch.stats : INITIAL_STATS);

      setStatMode(ch.statMode || "3d6");
      setStatPointsPool(typeof ch.statPointsPool === "number" ? ch.statPointsPool : 0);
      setSkillMode(ch.skillMode || "ready");

      setXp(typeof ch.xp === "number" ? ch.xp : 0);
      setInventory(Array.isArray(ch.inventory) ? ch.inventory : []);
      setWeapons(Array.isArray(ch.weapons) ? ch.weapons : []);
      setPurseFer(typeof ch.purseFer === "number" ? ch.purseFer : 0);

      const hasKitItems =
        Array.isArray(ch.inventory) && ch.inventory.some((item) => item && item.fromKit);

      if (hasKitItems) setSelectedKit(ch.kit || { id: "loaded-kit" });
      else setSelectedKit(null);

      // si perso chargé en 3d6 → on cache le roller
      setStatsRolled((ch.statMode || "3d6") === "3d6");

      setCompetences(Array.isArray(ch.competences) ? ch.competences : []);
      setSpecialCompetences(Array.isArray(ch.specialCompetences) ? ch.specialCompetences : []);

      setPhraseGenial(ch.phraseGenial || "");
      setPhraseSociete(ch.phraseSociete || ch.phraseSocieter || "");

      const portraitFromBackend = ch.portrait || "";
      setPortraitDataUrl(portraitFromBackend);
      try {
        if (portraitFromBackend) localStorage.setItem("aria-portrait-url", portraitFromBackend);
        else localStorage.removeItem("aria-portrait-url");
      } catch {
        // ignore
      }

      if (ch.alchemy) {
        setIsAlchemist(!!ch.alchemy.enabled);
        setAlchemyPotions(Array.isArray(ch.alchemy.potions) ? ch.alchemy.potions : []);
      } else {
        setIsAlchemist(!!ch.isAlchemist);
        setAlchemyPotions(Array.isArray(ch.alchemyPotions) ? ch.alchemyPotions : []);
      }

      setShowCreationModal(false);
      navigate("/character");
    } catch (err) {
      console.error("❌ Erreur réseau load character :", err);
      alert("Erreur réseau en chargeant le personnage depuis le serveur.");
    }
  };

  // =========================
  // ROUTES
  // =========================
  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            auth={auth}
            onStart={() => navigate("/character")}
            onGoToMyCharacters={() => navigate("/my-characters")}
          />
        }
      />

      <Route
        path="/my-characters"
        element={
          <MyCharactersPage
            user={user}
            onBackToHome={() => navigate("/")}
            onCreateNew={() => {
              handleDeleteCharacter();
              navigate("/character");
            }}
            onLoadCharacter={handleLoadCharacterFromBackend}
          />
        }
      />

      <Route
        path="/character"
        element={
          <CharacterPage
            user={user}
            onGoToMyCharacters={() => navigate("/my-characters")}
            onBackHome={() => navigate("/")}

            // UI
            showCreationModal={showCreationModal}
            setShowCreationModal={setShowCreationModal}

            // modes
            skillMode={skillMode}
            onChangeSkillMode={handleChangeSkillMode}
            statMode={statMode}
            onChangeStatMode={handleChangeStatMode}
            isStatsLockedForUi={isStatsLockedForUi}
            statPointsPool={statPointsPool}

            // dés
            statsRolled={statsRolled}
            setStatsRolled={setStatsRolled}

            // data fiche
            stats={stats}
            
            setStats={setStats}
            characterName={characterName}
            setCharacterName={setCharacterName}
            playerName={playerName}
            setPlayerName={setPlayerName}
            age={age}
            setAge={setAge}
            profession={profession}
            setProfession={setProfession}
            portraitDataUrl={portraitDataUrl}
            onChangePortrait={handleChangePortrait}

            // PV / blessures / armure
            hitPoints={hitPoints}
            wounds={wounds}
            setWounds={setWounds}
            armor={armor}
            setArmor={setArmor}

            // inventaire / armes / bourse
            inventory={inventory}
            setInventory={setInventory}
            weapons={weapons}
            setWeapons={setWeapons}
            purseFer={purseFer}
            setPurseFer={setPurseFer}

            // kit
            selectedKit={selectedKit}
            isKitModalOpen={isKitModalOpen}
            setIsKitModalOpen={setIsKitModalOpen}
            onKitConfirm={handleKitConfirm}

            // competences
            competences={competences}
            setCompetences={handleCompetencesChange}
            specialCompetences={specialCompetences}
            setSpecialCompetences={setSpecialCompetences}

            // phrases
            phraseGenial={phraseGenial}
            setPhraseGenial={setPhraseGenial}
            phraseSociete={phraseSociete}
            setPhraseSociete={setPhraseSociete}

            // alchimie
            isAlchemist={isAlchemist}
            setIsAlchemist={setIsAlchemist}
            alchemyPotions={alchemyPotions}
            setAlchemyPotions={setAlchemyPotions}

            // XP
            xp={xp}
            setXp={setXp}

            // backend actions
            onSave={() => handleSaveToBackend(false)}
            onSaveAndGoMyCharacters={() => handleSaveToBackend(true)}
            onDeleteCharacter={handleDeleteCharacter}

            // 👇 IMPORTANT : ton CharacterPage actuel ne l’utilise pas encore,
            // mais on le passe pour corriger le point-buy facilement (voir note en dessous)
            onChangeStat={handleChangeStat}

            // refs (si un jour tu veux les exploiter côté page)
            screenSheetRef={screenSheetRef}
            pdfSheetRef={pdfSheetRef}
          />
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
