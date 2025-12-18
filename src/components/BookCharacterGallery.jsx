// src/components/BookCharacterGallery.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./BookCharacterGallery.css";
import { bookCharacters } from "../data/bookCharacters";

export default function BookCharacterGallery({ onOpenInEditor }) {
  const [selected, setSelected] = useState(null);

  const characters = useMemo(() => bookCharacters || [], []);

  // Shine + tilt pour la version holo (overlay)
  const handleCardMouseMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    card.style.setProperty("--shine-x", `${x * 100}%`);
    card.style.setProperty("--shine-y", `${y * 100}%`);

    const tiltX = (0.5 - y) * 18;
    const tiltY = (x - 0.5) * 18;
    card.style.setProperty("--tilt-x", `${tiltX}deg`);
    card.style.setProperty("--tilt-y", `${tiltY}deg`);
  };

  const handleCardMouseLeave = (event) => {
    const card = event.currentTarget;
    card.style.setProperty("--shine-x", "50%");
    card.style.setProperty("--shine-y", "0%");
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  };

  const closeDetail = () => setSelected(null);

  useEffect(() => {
    if (!selected) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeDetail();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  return (
    <section className="book-gallery">
      <h3 className="book-gallery__title">Personnages du livre</h3>
      <p className="book-gallery__subtitle">
        Survole pour retourner la carte. Clique pour ouvrir la fiche stylée.
      </p>

      <div className="book-gallery__grid">
        {characters.map((c) => (
          <article key={c.id} className="book-card">
            <div
              className="flip-card"
              onClick={() => setSelected(c)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelected(c);
              }}
              aria-label={`Ouvrir la fiche de ${c.name}`}
              title="Cliquer pour ouvrir"
            >
              <div className="flip-card-inner">
                {/* FRONT */}
                <div className="flip-face flip-front">
                  <div className="pokemon-card pokemon-card--small">
                    <div className="pokemon-card-inner">
                      <img
                        className="pokemon-card-img"
                        src={c.frontImage}
                        alt={c.name}
                        draggable="false"
                      />
                    </div>
                  </div>
                </div>

                {/* BACK */}
                <div className="flip-face flip-back">
                  <div className="pokemon-card pokemon-card--small pokemon-card--back">
                    <div className="pokemon-card-inner">
                      <img
                        className="pokemon-card-img"
                        src={c.backImage}
                        alt={`Dos de carte ${c.name}`}
                        draggable="false"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="card-title">{c.name}</h4>
          </article>
        ))}
      </div>

      {/* OVERLAY */}
      {selected && (
        <div className="detail-overlay" onClick={closeDetail}>
          <div className="detail-overlay-inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="detail-close"
              onClick={closeDetail}
              aria-label="Fermer la fiche"
            >
              ×
            </button>

            <div className="detail-layout">
              <div className="detail-media">
                <div className="pokemon-card-wrapper">
                  <div
                    className="pokemon-card pokemon-card--holo"
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                  >
                    <div className="pokemon-card-inner">
                      <img
                        className="pokemon-card-img"
                        src={selected.frontImage}
                        alt={selected.name}
                        draggable="false"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-content">
                <h2 className="detail-title">{selected.name}</h2>
                {selected.description?.trim() && (
                  <p className="detail-desc">{selected.description}</p>
                )}

                <div className="detail-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => onOpenInEditor?.(selected)}
                  >
                    Ouvrir dans l’éditeur
                  </button>
                </div>

           
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
