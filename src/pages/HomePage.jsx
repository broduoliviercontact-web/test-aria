// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import BookCharacterGallery from "../components/BookCharacterGallery";
import { bookCharacters } from "../data/bookCharacters";

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
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", displayName: "" });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) clearError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === "login") {
      await onLogin({ email: form.email, password: form.password });
    } else {
      await onRegister({
        email: form.email,
        password: form.password,
        displayName: form.displayName,
      });
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
            Connecté en tant que <strong>{user.displayName || user.email}</strong>.
          </p>

          <div className="auth-connected-actions">
            <button type="button" className="btn-secondary" onClick={onLogout}>
              Se déconnecter
            </button>
            <button type="button" className="btn-primary" onClick={onGoToMyCharacters}>
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

          <div className="auth-submit-row">
  <button type="submit" className="btn-primary-1">Se connecter</button>
</div>

          </form>
        </div>
      )}
    </section>
  );
}

export default function HomePage({ onStart, onGoToMyCharacters, auth }) {
  const { user, loading, error, login, register, logout, setError } = auth;

  const [myChars, setMyChars] = useState([]);
  const [myCharsLoading, setMyCharsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setMyChars([]);
      setMyCharsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setMyCharsLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/characters`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("fetch /characters failed");

        const data = await res.json();
        if (!cancelled) setMyChars(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn("Impossible de charger mes personnages:", e);
        if (!cancelled) setMyChars([]);
      } finally {
        if (!cancelled) setMyCharsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const myCharsForGallery = useMemo(() => {
    return (myChars || []).map((ch) => {
      // map competences array -> overrides {id: score}
      const competenceOverrides = {};
      (ch.competences || []).forEach((c) => {
        if (c?.id && typeof c?.score === "number") competenceOverrides[c.id] = c.score;
      });

      const portrait =
        ch.portraitDataUrl ||
        ch.portraitUrl ||
        ch.portrait ||
        "/aria-background.webp";

      return {
        // ✅ important: on garde l’id serveur pour l’édition réelle
        id: ch._id,

        name: ch.name || "Sans nom",
        description: ch.profession || "",
        frontImage: portrait,
        backImage: "/aria-background2.webp",

        age: typeof ch.age === "number" ? ch.age : undefined,
        profession: ch.profession || "",

        stats: Array.isArray(ch.stats) ? ch.stats : [],
        competenceOverrides,

        specialCompetences: Array.isArray(ch.specialCompetences)
          ? ch.specialCompetences
          : [],

        inventory: Array.isArray(ch.inventory) ? ch.inventory : [],
        weapons: Array.isArray(ch.weapons) ? ch.weapons : [],

        isAlchemist: !!ch.isAlchemist,

        // magie (selon ton modèle)
        isMage: !!(ch.magic?.isMage || ch.isMage),
        mageType: ch.magic?.mageType || "outsider",

        phraseGenial: ch.phraseGenial || "",
        phraseSociete: ch.phraseSociete || "",
      };
    });
  }, [myChars]);

  const handleOpenInEditor = (template) => {
    try {
      localStorage.setItem("aria_prefill_character", JSON.stringify(template));

      // ✅ édition réelle : si c’est un perso “serveur”, on marque l’id à éditer
      if (user && template?.id) {
        localStorage.setItem("aria_edit_character_id", String(template.id));
      } else {
        localStorage.removeItem("aria_edit_character_id");
      }
    } catch (e) {
      console.warn("Impossible d'écrire dans localStorage:", e);
    }

    onStart(); // ouvre l’éditeur (CharacterPage)
  };

  const galleryTitle = user ? "Mes personnages" : "Personnages du livre";
  const gallerySubtitle = user
    ? myCharsLoading
      ? "Chargement de tes personnages..."
      : "Survole pour retourner la carte. Clique pour ouvrir dans l’éditeur."
    : "Survole pour retourner la carte. Clique pour ouvrir la fiche stylée.";

  const galleryCharacters = user ? myCharsForGallery : bookCharacters;

  return (
    <div className="home-page app-home">
      <div className="home-root">
        <header className="home-header">
          <img src="/Aria_logo.webp" alt="Logo Aria" className="home-logo-img" />
          <div className="home-logo">Fiche de personnage Aria</div>
          <p className="home-subtitle">
            Crée, gère et imprime ta fiche de personnage comme sur la fiche officielle, mais en numérique.
          </p>
        </header>

        <main className="home-main">
          <section className="hero-parchment">
            <div className="hero-inner">
              <h2 className="hero-title">Hòla Mon Brave</h2>
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
              <li>Tu peux créer des personnages <strong>sans compte</strong>.</li>
              <li>Si tu te connectes, tu peux <strong>les sauvegarder</strong> en base.</li>
              <li>Choisis les modes de création (compétences & caractéristiques).</li>
              <li>En mode <strong>3d6</strong> : tu choisis un jet et ensuite la zone de dés disparaît.</li>
              <li>Choisis ton <strong>kit d’équipement</strong> (une seule fois).</li>
              <li>Gère ton inventaire et exporte ta fiche en PDF.</li>
            </ul>
          </section>
              {/* ✅ Galerie : livre (anon) OU mes persos (logué) */}
          <BookCharacterGallery
            title={galleryTitle}
            subtitle={gallerySubtitle}
            characters={galleryCharacters}
            onOpenInEditor={handleOpenInEditor}
          />
        </main>
      </div>
    </div>
  );
}
