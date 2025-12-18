import React, { useEffect, useMemo, useState } from "react";
import "./MagicModal.css";

/* ===========================
   Images (deck visuel)
   =========================== */

function getCardImageSrc(card, { back = false } = {}) {
  if (back) return "/cards/back.png";
  if (!card) return null;

  const suit = card.family ?? card.suit;

  // Joker
  if (suit === "joker" || card.value === "joker") {
    return "/cards/joker.png";
  }

  // Valeur -> fichier
  const v = Number(card.value);
  const valueMap = {
    1: "A",
    11: "J",
    12: "Q",
    13: "K",
    14: "A",
  };
  const file = valueMap[v] ?? String(v);

  return `/cards/${suit}/${file}.png`;
}


function CardBack({ size = "large" }) {
  const [imgOk, setImgOk] = useState(true);
  const src = "/cards/back.png";

  if (imgOk) {
    return (
      <img
        src={src}
        alt="Dos de carte"
        className={`magic-card-img ${size === "small" ? "is-small" : "is-large"}`}
        draggable="false"
        onError={() => setImgOk(false)}
      />
    );
  }

  // fallback si back.png absent
  return <div className={`magic-card-back-fallback ${size}`}>BACK</div>;
}
/**
 * CardFace
 * Affiche une image si dispo, sinon fallback sur PlayingCard (CSS playing cards)
 */
function CardFace({ card, size = "large" }) {
  const [imgOk, setImgOk] = useState(true);
  const src = useMemo(() => getCardImageSrc(card), [card]);

  useEffect(() => setImgOk(true), [src]);

  if (!card) return null;

  if (src && imgOk) {
    return (
      <img
        src={src}
        alt={cardLabel(card)}
        className={`magic-card-img ${size === "small" ? "is-small" : "is-large"}`}
        draggable="false"
        onError={() => setImgOk(false)}
      />
    );
  }

  // fallback CSS si image manquante
  return <PlayingCard card={card} />;
}

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
      : c.value === 1
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

  // ✅ validation du type
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
    if (typeof onConfirmMageType !== "function") return;
    onConfirmMageType();
  };

  if (!isOpen) return null;

  const currentSuit = currentCard ? (currentCard.family ?? currentCard.suit) : null;

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
              <div className="magic-modal__locked magic-modal__infoBox">
                <strong>Jouer un magicien</strong>

                <div className="magic-modal__infoText">
                  <p className="magic-modal__pFirst">
                    <span className="magic-tooltip">
                      <span className="magic-tooltip__label" tabIndex={0}>
                        • Disciple étranger à l’académie
                      </span>
                      <span className="magic-tooltip__bubble">
                        Aucun apprentissage des principes de la noble magie (ni de l’éthique),
                        mais un potentiel magique immense.
                      </span>
                    </span>
                    <br />
                    Pas formé à l’académie : gros potentiel magique, aucune compétence magique acquise par défaut.
                  </p>

                  <p>
                    <span className="magic-tooltip">
                      <span className="magic-tooltip__label" tabIndex={0}>
                        • Magicien de la couronne / disciple de l’académie
                      </span>
                      <span className="magic-tooltip__bubble">
                        Bonne capacité à modéliser la magie, mais moins de potentiel que les autres types.
                        Reconnu publiquement : accès à de nombreux lieux. Doit suivre un code moral
                        et obéir à la couronne.
                      </span>
                    </span>
                    <br />
                    Reconnu publiquement : plus de portes ouvertes, mais potentiel magique moindre. Suit un code moral strict.
                  </p>

                  <p className="magic-modal__pLast">
                    <span className="magic-tooltip">
                      <span className="magic-tooltip__label" tabIndex={0}>
                        • Miséricordieux
                      </span>
                      <span className="magic-tooltip__bubble">
                        Corps d’élite chargé de traquer ceux qui approchent de la fin.
                        Mage très talentueux et combattant. Quand le paquet s’épuise,
                        les pouvoirs deviennent incontrôlables.
                      </span>
                    </span>
                    <br />
                    Corps d’élite : mage très talentueux et combattant. Pouvoirs dangereux quand le paquet s’épuise.
                  </p>
                </div>

                <button
                  className="magic-modal__btn magic-modal__btnTop"
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
                  <div className="magic-modal__locked magic-modal__sectionBox">
                    <strong>Type</strong>

                    <div className="magic-modal__typeLine">
                      {mageTypeLabel(mageType)} <span title="Type verrouillé">🔒</span>
                    </div>

                    {hasEverDrawn && (
                      <div className="magic-modal__subtleLine">
                        Une carte a déjà été tirée : le type est verrouillé.
                      </div>
                    )}

                    {typeConfirmed && !hasEverDrawn && (
                      <div className="magic-modal__subtleLine">
                        Type validé : tu peux maintenant utiliser la magie.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="magic-modal__locked magic-modal__sectionBox">
                    <strong>Type de magicien</strong>

                    <select
                      value={mageType || "outsider"}
                      onChange={(e) => onChangeMageType?.(e.target.value)}
                      className="magic-modal__select"
                    >
                      <option value="outsider">Disciple étranger (52 + Joker)</option>
                      <option value="academy">Couronne / Académie (25 + Joker)</option>
                      <option value="misericordieux">Miséricordieux (10 + Joker)</option>
                    </select>

                    <button
                      className="magic-modal__btn magic-modal__btnFull"
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

                    <div className="magic-modal__note">
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
  <div className="magic-modal__placeholder">
    <CardBack size="large" />
  </div>
              ) : (
                <div className="magic-modal__card">
                  <div className="magic-modal__cardHeader">
                    <div
                      className={`magic-modal__cardTitle ${
                        ["coeur", "carreau"].includes(currentSuit) ? "is-red" : "is-black"
                      }`}
                    >
                      {cardLabel(currentCard)}
                    </div>
                  </div>

                  {/* ✅ ICI : affichage image (fallback PlayingCard si manquante) */}
                  <div className="magic-modal__cardPreviewImage">
                    <CardFace card={currentCard} size="large" />
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

              <div className="magic-used__grid">
                {(!usedCards || usedCards.length === 0) && (
                  <div className="magic-used__empty">Aucune carte consommée.</div>
                )}

                {usedCards?.slice().reverse().map((c, i) => (
                  <div key={i} className="magic-used__item">
                    <CardFace card={c} size="small" />
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
