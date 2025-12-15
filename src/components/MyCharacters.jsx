// src/components/MyCharacters.jsx
import React, { useEffect, useState } from "react";
import "./MyCharacters.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function MyCharacters({
  user,
  onBackToHome,
  onCreateNew,
  onLoadCharacter,
}) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger la liste des persos du user
  useEffect(() => {
    if (!user) return;

    const fetchCharacters = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/characters`, {
          credentials: "include",
        });

        let data = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!res.ok) {
          throw new Error(
            (data && data.message) ||
              "Erreur en récupérant tes personnages depuis le serveur."
          );
        }

        setCharacters(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Erreur MyCharacters :", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [user]);

  // Suppression d’un perso
  async function handleDelete(id) {
    if (!window.confirm("Tu es sûr de vouloir supprimer ce personnage ?")) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/characters/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(
          (data && data.message) ||
            "Erreur en supprimant le personnage sur le serveur."
        );
      }

      setCharacters((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("❌ Erreur suppression personnage :", err);
      alert(err.message);
    }
  }

  if (!user) {
    return (
      <div className="my-characters-page">
        <div className="app app-my-characters">
          <h1>Mes personnages</h1>
          <p className="my-characters-text">
            Tu dois être connecté pour voir tes personnages sauvegardés.
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={onBackToHome}
          >
            Retour à l’accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-characters-page">
      <div className="app app-my-characters">
        <header className="my-characters-header">
          <h1>Mes personnages</h1>
          <div className="my-characters-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onBackToHome}
            >
              Retour à l’accueil
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={onCreateNew}
            >
              Nouveau personnage
            </button>
          </div>
        </header>

        {loading && (
          <p className="my-characters-text">Chargement de tes personnages...</p>
        )}

        {error && (
          <p className="my-characters-error">
            {error}
          </p>
        )}

        {!loading && !error && characters.length === 0 && (
          <p className="my-characters-text">
            Tu n’as encore aucun personnage sauvegardé.
          </p>
        )}

        <ul className="my-characters-list">
          {characters.map((c) => (
            <li key={c._id} className="my-characters-item">
              <div className="my-characters-main">
                {c.portrait && (
                  <img
                    src={c.portrait}
                    alt={`Portrait de ${c.name || "personnage"}`}
                    className="my-characters-portrait"
                  />
                )}

                <div className="my-characters-title-block">
                  <strong>{c.name || "Sans nom"}</strong>
                  {c.profession && <span> — {c.profession}</span>}
                </div>
              </div>

              <div className="my-characters-meta">
                {c.meta?.status === "validated" && (
                  <span className="badge badge-success">Validé</span>
                )}
                <span className="badge">
                  Créé le{" "}
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "date inconnue"}
                </span>
              </div>

              <div className="my-characters-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onLoadCharacter && onLoadCharacter(c._id)}
                >
                  Charger
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => handleDelete(c._id)}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
