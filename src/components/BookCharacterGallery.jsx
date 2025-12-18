// src/components/BookCharacterGallery.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./BookCharacterGallery.css";
import { bookCharacters } from "../data/bookCharacters";

export default function BookCharacterGallery({
  onOpenInEditor,
  onDeleteCharacter,                // ✅ NEW
  canDeleteCharacter = () => false, // ✅ NEW (fonction: (char) => boolean)
  characters: charactersProp,
  title = "Personnages du livre",
  subtitle = "Survole pour retourner la carte. Clique pour ouvrir la fiche stylée.",
  itemsPerPage = 4,
}) {
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const topRef = useRef(null);

  const characters = useMemo(() => {
    if (Array.isArray(charactersProp)) return charactersProp;
    return bookCharacters || [];
  }, [charactersProp]);

  const totalPages = useMemo(() => {
    const per = Math.max(1, Number(itemsPerPage) || 4);
    return Math.max(1, Math.ceil(characters.length / per));
  }, [characters.length, itemsPerPage]);

  useEffect(() => setPage(0), [characters]);
  useEffect(() => setPage((p) => Math.min(Math.max(0, p), totalPages - 1)), [totalPages]);

  const pagedCharacters = useMemo(() => {
    const per = Math.max(1, Number(itemsPerPage) || 4);
    const start = page * per;
    return characters.slice(start, start + per);
  }, [characters, page, itemsPerPage]);

  const goToPage = (nextPage) => {
    setSelected(null);
    setPage(() => Math.min(Math.max(0, nextPage), totalPages - 1));
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

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

  const handleDeleteClick = async () => {
    if (!selected) return;
    const ok = window.confirm(
      `Supprimer définitivement “${selected.name}” ?\n\nCette action est irréversible.`
    );
    if (!ok) return;

    await onDeleteCharacter?.(selected);
    setSelected(null);
  };

  // ============================
  // ✅ AJOUT: synthèse book chars
  // ============================
  const toLines = (v) => {
    if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
    if (typeof v === "string" && v.trim()) {
      return v
        .split(/\r?\n|•|;|—/g)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const buildSynthese = (c) => {
    // 1) si tu as déjà mis un champ synthèse dans bookCharacters.js, on le respecte
    const existing =
      toLines(c?.summaryLines) ||
      toLines(c?.summary) ||
      toLines(c?.synthese) ||
      toLines(c?.syntheses);

    const keep = Array.isArray(existing) ? existing : [];
    if (keep.length) return keep;

    // 2) sinon, on génère des phrases simples à partir des champs existants
    const lines = [];

    if (c?.description?.trim()) lines.push(c.description.trim());
    if (c?.profession?.trim()) lines.push(`Profession : ${c.profession.trim()}`);
    if (Number.isFinite(c?.age)) lines.push(`Âge : ${c.age} ans`);
    if (Number.isFinite(c?.armor)) lines.push(`Armure : ${c.armor}`);
    if (c?.isMage === true) lines.push("Type : Magicien");
    if (c?.isMage === false) lines.push("Type : Non-magicien");
    if (c?.isAlchemist) lines.push("Trait : Alchimiste");

    // Option: petit fallback si rien
    if (!lines.length) lines.push("Personnage du livre.");

    return lines;
  };

  const withSynthese = (c) => {
    const syntheseLines = buildSynthese(c);
    return {
      ...c,
      // deux noms pour être compatible avec ce que tu affiches ailleurs
      synthese: syntheseLines,
      summaryLines: syntheseLines,
    };
  };

  return (
    <section className="book-gallery" ref={topRef}>
      <h3 className="book-gallery__title">{title}</h3>
      <p className="book-gallery__subtitle">{subtitle}</p>

      {totalPages > 1 && (
        <div className="gallery-pagination">
          <button
            type="button"
            className="btn-secondary gallery-pagination__btn"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 0}
          >
            ← Précédent
          </button>

          <div className="gallery-pagination__info">
            Page <strong>{page + 1}</strong> / <strong>{totalPages}</strong>
          </div>

          <button
            type="button"
            className="btn-secondary gallery-pagination__btn"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            Suivant →
          </button>
        </div>
      )}

      <div className="book-gallery__grid">
        {pagedCharacters.map((c) => (
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
                <div className="flip-face flip-front">
                  <div className="pokemon-card pokemon-card--small">
                    <div className="pokemon-card-inner">
                      <img className="pokemon-card-img" src={c.frontImage} alt={c.name} draggable="false" />
                    </div>
                  </div>
                </div>

                <div className="flip-face flip-back">
                  <div className="pokemon-card pokemon-card--small pokemon-card--back">
                    <div className="pokemon-card-inner">
                      <img className="pokemon-card-img" src={c.backImage} alt={`Dos de carte ${c.name}`} draggable="false" />

                      <div className="card-back-overlay">
                        <div className="card-back-title">{c.name}</div>
                        {c.description && <div className="card-back-desc">{c.description}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="card-title">{c.name}</h4>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="gallery-pagination gallery-pagination--bottom">
          <button
            type="button"
            className="btn-secondary gallery-pagination__btn"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 0}
          >
            ← Précédent
          </button>

          <div className="gallery-pagination__dots" aria-label="Pagination">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={idx === page ? "gallery-dot gallery-dot--active" : "gallery-dot"}
                onClick={() => goToPage(idx)}
                aria-label={`Aller à la page ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="btn-secondary gallery-pagination__btn"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            Suivant →
          </button>
        </div>
      )}

      {selected && (
        <div className="detail-overlay" onClick={closeDetail}>
          <div className="detail-overlay-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="detail-close" onClick={closeDetail} aria-label="Fermer la fiche">
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
                      <img className="pokemon-card-img" src={selected.frontImage} alt={selected.name} draggable="false" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-content">
                <h2 className="detail-title">{selected.name}</h2>
                {selected.description?.trim() && <p className="detail-desc">{selected.description}</p>}

                <div className="detail-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => onOpenInEditor?.(withSynthese(selected))}  // ✅ ICI: on injecte la synthèse
                  >
                    Ouvrir dans l’éditeur
                  </button>

                  {canDeleteCharacter?.(selected) && (
                    <button
                      type="button"
                      className="btn-secondary book-delete-btn"
                      onClick={handleDeleteClick}
                      title="Supprimer ce personnage"
                    >
                      Supprimer le personnage
                    </button>
                  )}
                </div>

                <div className="detail-hint">Astuce : tu peux ensuite modifier la fiche comme un personnage normal.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
