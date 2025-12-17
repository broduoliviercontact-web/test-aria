import React, { useEffect, useMemo, useState } from "react";
import "./MagicModal.css";

/* ===========================
   Helpers cartes (CSS Playing Cards)
   =========================== */

function suitToCss(suit) {
  if (suit === "pique") return "spades";
  if (suit === "coeur") return "hearts";
  if (suit === "trefle") return "clubs";
  if (suit === "carreau") return "diams";
  return "";
}

function suitToEntity(suit) {
  if (suit === "carreau") return "&diams;";
  if (suit === "coeur") return "&hearts;";
  if (suit === "trefle") return "&clubs;";
  if (suit === "pique") return "&spades;";
  return "";
}

function valueToRank(value) {
  if (value === 14) return "a";
  if (value === 13) return "k";
  if (value === 12) return "q";
  if (value === 11) return "j";
  return String(value);
}

function normalizeCard(card) {
  if (!card) return null;
  const suit = card.family ?? card.suit;
  const value = card.value;

  if (suit === "joker") return { suit: "joker", value: "joker" };
  return { suit, value };
}

function cardLabel(card) {
  const c = normalizeCard(card);
  if (!c) return "";
  if (c.suit === "joker") return "Joker";

  const name =
    c.value === 11
      ? "Valet"
      : c.value === 12
      ? "Dame"
      : c.value === 13
      ? "Roi"
      : c.value === 14
      ? "As"
      : String(c.value);

  const suit =
    c.suit === "carreau"
      ? "♦"
      : c.suit === "trefle"
      ? "♣"
      : c.suit === "pique"
      ? "♠"
      : "♥";

  return `${name} ${suit}`;
}

function PlayingCard({ card }) {
  const c = normalizeCard(card);
  if (!c) return null;

  if (c.suit === "joker") {
    return (
      <div className="aria-joker-card">
        <div className="aria-joker-card__inner">JOKER</div>
      </div>
    );
  }

  const rank = valueToRank(c.value);
  const suitClass = suitToCss(c.suit);
  const suitEntity = suitToEntity(c.suit);

  return (
    <div className={`card rank-${rank} ${suitClass}`}>
      <span className="rank">{rank.toUpperCase()}</span>
      <span className="suit" dangerouslySetInnerHTML={{ __html: suitEntity }} />
    </div>
  );
}

function mageTypeLabel(type) {
  if (type === "academy") return "Couronne / Académie";
  if (type === "misericordieux") return "Miséricordieux";
  return "Disciple étranger";
}

/* ===========================
   MagicModal
   =========================== */

export default function MagicModal({
  isOpen,
  onClose,

  // magie
  isMage,
  intValue,
  magicEnabled,

  mageType,
  onChangeMageType,

  // ✅ NEW: validation du type
  typeConfirmed = false,
  onConfirmMageType,

  deckSize,
  remaining,

  currentCard,
  usedCards,

  onDraw,
  onReset,
  onUseCurrent,
  onDiscardCurrent,
}) {
  const [showMageInfo, setShowMageInfo] = useState(false);

  const meetsInt = Number(intValue) >= 14;

  // 🔒 déjà tiré au moins une carte ?
  const hasEverDrawn =
    !!currentCard ||
    (Array.isArray(usedCards) && usedCards.length > 0) ||
    (Number.isFinite(deckSize) &&
      Number.isFinite(remaining) &&
      remaining < deckSize);

  // ✅ on cache le menu dès que:
  // - type validé, ou
  // - une carte a été tirée
  const hideTypeUI = typeConfirmed || hasEverDrawn;

  // Affiche l'écran d'info seulement au "premier open"
  useEffect(() => {
    if (!isOpen) return;
    if (!magicEnabled) return;

    // si le type est déjà validé, pas besoin
    if (hideTypeUI) {
      setShowMageInfo(false);
      return;
    }

    // 1ère fois : on le montre
    setShowMageInfo(true);
  }, [isOpen, magicEnabled, hideTypeUI]);

  const helpText = useMemo(() => {
    if (!magicEnabled) return "Magie désactivée lors de la création.";
    if (!meetsInt) return "INT 14 minimum pour tirer une carte.";
    return "Tire une carte : elle est consommée, utilisée ou jetée.";
  }, [magicEnabled, meetsInt]);

  const canDraw = isMage && meetsInt && remaining !== 0 && !currentCard;

  const confirmType = () => {
    // On ne valide pas si on n'a pas la callback
    if (typeof onConfirmMageType !== "function") return;
    onConfirmMageType();
  };

  if (!isOpen) return null;

  return (
    <div className="magic-modal__backdrop" onMouseDown={onClose}>
      <div
        className="magic-modal__panel"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="magic-modal__header">
          <h2>Magie</h2>
          <button className="magic-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Status */}
        <div className="magic-modal__sub">
          <div className="magic-modal__status">
            <span className={`magic-pill ${magicEnabled ? "on" : "off"}`}>
              {magicEnabled ? "Magie activée" : "Magie inactive"}
            </span>
            <span className={`magic-pill ${meetsInt ? "on" : "off"}`}>
              INT : {intValue} {meetsInt ? "✓" : "✕"}
            </span>
          </div>
          <div className="magic-modal__hint">{helpText}</div>
        </div>

        {!magicEnabled ? (
          <div className="magic-modal__locked">
            Active la magie dans la création de personnage.
          </div>
        ) : (
          <>
            {/* ===========================
                INFO (première ouverture)
                =========================== */}
            {showMageInfo && (
              <div className="magic-modal__locked" style={{ marginBottom: 12 }}>
                <strong>Jouer un magicien</strong>
                <div style={{ marginTop: 8, lineHeight: 1.35, fontSize: 13 }}>
                  <p style={{ marginTop: 0 }}>
                    <span style={{ fontWeight: 700 }}>
                      Disciple étranger à l’académie
                    </span>
                    <br />
                    Pas formé à l’académie : gros potentiel magique, aucune
                    compétence magique acquise par défaut.
                  </p>

                  <p>
                    <span style={{ fontWeight: 700 }}>
                      Magicien de la couronne / disciple de l’académie
                    </span>
                    <br />
                    Reconnu publiquement : plus de portes ouvertes, mais potentiel
                    magique moindre. Suit un code moral strict.
                  </p>

                  <p style={{ marginBottom: 0 }}>
                    <span style={{ fontWeight: 700 }}>Miséricordieux</span>
                    <br />
                    Corps d’élite : mage très talentueux et combattant. Pouvoirs
                    dangereux quand le paquet s’épuise.
                  </p>
                </div>

                <button
                  className="magic-modal__btn"
                  style={{_toggle: undefined, marginTop: 10 }}
                  onClick={() => setShowMageInfo(false)}
                >
                  OK, je choisis mon type
                </button>
              </div>
            )}

            {/* ===========================
                TYPE DE MAGICIEN
                =========================== */}
            {!showMageInfo && (
              <>
                {hideTypeUI ? (
                  <div className="magic-modal__locked" style={{ marginBottom: 12 }}>
                    <strong>Type</strong>
                    <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>
                      {mageTypeLabel(mageType)}{" "}
                      <span title="Type verrouillé">🔒</span>
                    </div>
                    {hasEverDrawn && (
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                        Une carte a déjà été tirée : le type est verrouillé.
                      </div>
                    )}
                    {typeConfirmed && !hasEverDrawn && (
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                        Type validé : tu peux maintenant utiliser la magie.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="magic-modal__locked" style={{ marginBottom: 12 }}>
                    <strong>Type de magicien</strong>

                    <select
                      value={mageType || "outsider"}
                      onChange={(e) => onChangeMageType?.(e.target.value)}
                      style={{
                        width: "100%",
                        marginTop: 8,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(111,77,45,.8)",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <option value="outsider">
                        Disciple étranger (52 + Joker)
                      </option>
                      <option value="academy">Couronne / Académie (25 + Joker)</option>
                      <option value="misericordieux">Miséricordieux (10 + Joker)</option>
                    </select>

                    <button
                      className="magic-modal__btn"
                      style={{ marginTop: 10, width: "100%" }}
                      onClick={confirmType}
                      disabled={typeof onConfirmMageType !== "function"}
                      title={
                        typeof onConfirmMageType !== "function"
                          ? "Brancher onConfirmMageType côté CharacterPage"
                          : "Valider le type"
                      }
                    >
                      Valider le type
                    </button>

                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                      Le type sera verrouillé dès qu’une carte est tirée.
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ===========================
                DECK
                =========================== */}
            <div className="magic-modal__deckrow">
              <div className="magic-modal__deckinfo">
                <div className="magic-modal__deckcount">
                  Cartes restantes : <strong>{remaining}</strong>
                </div>
              </div>

              <div className="magic-modal__deckactions">
                <button
                  className="magic-modal__btn"
                  onClick={onDraw}
                  disabled={!canDraw}
                  title={
                    !isMage
                      ? "Magie inactive ou INT insuffisante"
                      : !meetsInt
                      ? "INT 14 minimum"
                      : currentCard
                      ? "Une carte est déjà révélée"
                      : remaining === 0
                      ? "Plus de cartes"
                      : "Tirer une carte"
                  }
                >
                  Tirer une carte
                </button>

                <button
                  className="magic-modal__btn ghost"
                  onClick={onReset}
                  disabled={
                    remaining === deckSize &&
                    !currentCard &&
                    (!usedCards || usedCards.length === 0)
                  }
                  title="Reset deck / historique (ne change pas le type)"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* ===========================
                CARTE COURANTE
                =========================== */}
            <div className="magic-modal__cardzone">
              {!currentCard ? (
                <div className="magic-modal__placeholder">Aucune carte tirée.</div>
              ) : (
                <div className="magic-modal__card">
                  <div className="magic-modal__cardHeader">
                    <div className="magic-modal__cardTitle">
                      {cardLabel(currentCard)}
                    </div>
                  </div>

                  <div className="playingCards magic-modal__cardPreview">
                    <div className="magic-modal__cardPreviewInner">
                      <PlayingCard card={currentCard} />
                    </div>
                  </div>

                  <div className="magic-modal__actions">
                    <button className="magic-modal__btn" onClick={onUseCurrent}>
                      Utiliser
                    </button>
                    <button className="magic-modal__btn ghost" onClick={onDiscardCurrent}>
                      Jeter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ===========================
                CARTES UTILISÉES
                =========================== */}
            <div className="magic-used">
              <div className="magic-used__header">
                <h3>Cartes utilisées</h3>
                <div className="magic-used__count">{usedCards?.length || 0}</div>
              </div>

              <div className="playingCards magic-used__grid">
                {(!usedCards || usedCards.length === 0) && (
                  <div className="magic-used__empty">Aucune carte consommée.</div>
                )}

                {usedCards?.slice().reverse().map((c, i) => (
                  <div key={i} className="magic-used__item">
                    <PlayingCard card={c} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
