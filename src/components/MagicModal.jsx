import React, { useMemo } from "react";
import "./MagicModal.css";

export default function MagicModal({
  isOpen,
  onClose,
  isMage = true,
  intValue = 15,
  magicEnabled = true,
  remaining = 24,
  currentCard = null, // <-- pas de carte fantôme, on attend un vrai tirage
  usedCards = [],
  onDraw,
  onReset,
  onUseCurrent,
  onDiscardCurrent,
}) {
  const safeCall = (fn, ...args) => {
    if (typeof fn === "function") fn(...args);
  };

  const suitClassMap = useMemo(
    () => ({
      carreau: "diamonds",
      coeur: "hearts",
      pique: "spades",
      trefle: "clubs",
    }),
    []
  );

  const suitLabelMap = useMemo(
    () => ({
      carreau: "carreau",
      coeur: "cœur",
      pique: "pique",
      trefle: "trèfle",
    }),
    []
  );

  const suitSymbolMap = useMemo(
    () => ({
      carreau: "♦",
      coeur: "♥",
      pique: "♠",
      trefle: "♣",
    }),
    []
  );

  const getRankLabel = (value) => {
    const v = Number(value);
    if (v === 1) return "A";
    if (v === 11) return "J";
    if (v === 12) return "Q";
    if (v === 13) return "K";
    return String(v);
  };

  const getPipLayout = (value) => {
    const v = Number(value);
    const layouts = {
      1: ["center"],
      2: ["top-center", "bottom-center"],
      3: ["top-center", "center", "bottom-center"],
      4: ["top-left", "top-right", "bottom-left", "bottom-right"],
      5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
      6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"],
      7: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right", "top-center"],
      8: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right", "top-center", "bottom-center"],
      9: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right", "top-center", "center", "bottom-center"],
      10: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right", "top-center", "bottom-center", "upper-middle", "lower-middle"],
    };
    return layouts[v] || [];
  };

  const canDraw = isMage && magicEnabled && Number(remaining) > 0;

  if (!isOpen) return null;

  const family = currentCard?.family;
  const value = currentCard?.value != null ? Number(currentCard.value) : null;

  const suitClass = family ? suitClassMap[family] : "";
  const rankLabel = value ? getRankLabel(value) : "";
  const familyLabel = family ? suitLabelMap[family] : "";
  const familySymbol = family ? suitSymbolMap[family] : "";

  const pipPositions = value && value <= 10 ? getPipLayout(value) : [];

  return (
    <div className="magic-modal__backdrop" role="dialog" aria-modal="true">
      <div className="magic-modal">
        <button
          className="magic-modal__close"
          type="button"
          onClick={() => safeCall(onClose)}
          aria-label="Fermer"
        >
          ×
        </button>

        <div className="magic-modal__header">
          <h2 className="magic-modal__title">Compétence : Magie</h2>

          <div className="magic-modal__topline">
            <span className={`magic-pill ${magicEnabled ? "is-on" : "is-off"}`}>
              Magie {magicEnabled ? "activée" : "désactivée"}
            </span>

            <span className="magic-pill">
              INT : <strong>{intValue}</strong> {isMage ? "✓" : "✗"}
            </span>
          </div>

          <p className="magic-modal__hint">Tire une carte : elle est consommée, utilisée ou jetée.</p>

          <div className="magic-modal__controls">
            <span className="magic-pill">
              Cartes restantes : <strong>{remaining}</strong>
            </span>

            <div className="magic-modal__controlsRight">
              <button
                type="button"
                className="magic-btn"
                onClick={() => safeCall(onDraw)}
                disabled={!canDraw}
                title={
                  !isMage
                    ? "INT 14 minimum"
                    : !magicEnabled
                      ? "Magie désactivée"
                      : Number(remaining) <= 0
                        ? "Plus de cartes"
                        : "Tirer une carte"
                }
              >
                Tirer une carte
              </button>

              <button type="button" className="magic-btn magic-btn--ghost" onClick={() => safeCall(onReset)}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="magic-modal__main">
          <div className="magic-panel">
            <div className="magic-panel__top">
              <div className="magic-panel__leftTag">
                {value ? (
                  <span className="magic-miniCard">
                    <strong>{rankLabel}</strong> <span>{familySymbol}</span>
                  </span>
                ) : (
                  <span className="magic-miniCard is-empty">—</span>
                )}
              </div>

              <div className="magic-panel__rightTag">
                <span className="magic-tag">
                  Famille : <span className="magic-tag__pill">{familyLabel || "—"}</span>
                </span>
              </div>
            </div>

            <div className="magic-panel__cardArea">
              <div className={`playing-card ${suitClass} ${value ? `rank-${value}` : ""}`}>
                {value ? (
                  <>
                    <div className="corner top">
                      <div className="rank">{rankLabel}</div>
                      <div className="suit">{familySymbol}</div>
                    </div>

                    <div className="corner bottom">
                      <div className="rank">{rankLabel}</div>
                      <div className="suit">{familySymbol}</div>
                    </div>

                    {value <= 10 && (
                      <div className="pips">
                        {pipPositions.map((pos, idx) => (
                          <span key={idx} className={`pip ${pos}`} aria-hidden="true" />
                        ))}
                      </div>
                    )}

                    {value > 10 && (
                      <div className="face">
                        <div className="face__big">{rankLabel}</div>
                        <div className="face__suit">{familySymbol}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="card-empty">Aucune carte</div>
                )}
              </div>

              <div className="magic-panel__desc">
                <div className="magic-desc__title">
                  <strong>Famille</strong> : {familyLabel || "—"}
                </div>

                <div className="magic-desc__text">
                  {family === "carreau" && "Carreaux : manipuler la matière existante."}
                  {family === "coeur" && "Cœurs : influencer le vivant, l'émotion, la guérison."}
                  {family === "pique" && "Piques : puissance brute, agressif, rupture, impact."}
                  {family === "trefle" && "Trèfles : chance, ruse, illusion, détours."}
                  {!family && "Tire une carte pour révéler un effet."}
                </div>

                <div className="magic-panel__actions">
                  <button type="button" className="magic-btn" onClick={() => safeCall(onUseCurrent)} disabled={!currentCard}>
                    Utiliser
                  </button>
                  <button type="button" className="magic-btn magic-btn--ghost" onClick={() => safeCall(onDiscardCurrent)} disabled={!currentCard}>
                    Jeter
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="magic-used">
            <div className="magic-used__header">
              <h3>Cartes utilisées</h3>
              <span className="magic-used__count">{usedCards.length}</span>
            </div>

            {usedCards.length === 0 ? (
              <div className="magic-used__empty">
                <div className="magic-used__emptyBox">Aucune carte consommée.</div>
              </div>
            ) : (
              <div className="magic-used__grid">
                {usedCards.map((c, i) => (
                  <div key={`${c.family}-${c.value}-${i}`} className={`used-card ${suitClassMap[c.family]}`}>
                    <span className="used-card__rank">{getRankLabel(c.value)}</span>
                    <span className="used-card__suit">{suitSymbolMap[c.family]}</span>
                    <span className="used-card__family">{suitLabelMap[c.family]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
