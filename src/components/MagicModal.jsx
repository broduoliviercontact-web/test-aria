import React, { useEffect, useMemo } from "react";
import "./MagicModal.css";

/**
 * ✅ Compatible 2 APIs :
 *
 * A) Nouvelle API (state interne character)
 *    <MagicModal isOpen onClose character setCharacter />
 *
 * B) Ancienne API (celle de CharacterPage)
 *    <MagicModal
 *      isOpen onClose
 *      isMage intValue magicEnabled
 *      remaining currentCard usedCards
 *      onDraw onReset onUseCurrent onDiscardCurrent
 *    />
 */

/* ===========================
   CSS-PLAYING-CARDS mapping
   =========================== */
function suitToCss(suit) {
  if (suit === "pique") return "spades";
  if (suit === "coeur") return "hearts";
  if (suit === "trefle") return "clubs";
  if (suit === "carreau") return "diams"; // cards.css utilise "diams"
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
function rankToCornerText(rank) {
  return rank.toUpperCase();
}

function normalizeCard(card) {
  if (!card) return null;

  // ✅ support {family,value} (CharacterPage) et {suit,value} (MagicModal)
  const suit = card.suit ?? card.family ?? card.famille ?? card.symbol ?? card.type;
  const value = card.value;

  if (suit === "joker") return { suit: "joker", value: "joker" };
  return { suit, value };
}

function cardLabel(raw) {
  const card = normalizeCard(raw);
  if (!card) return "";
  if (card.suit === "joker") return "Joker";

  const v = card.value;
  const name =
    v === 11
      ? "Valet"
      : v === 12
      ? "Dame"
      : v === 13
      ? "Roi"
      : v === 14
      ? "As"
      : String(v);

  const suit =
    card.suit === "carreau"
      ? "♦"
      : card.suit === "trefle"
      ? "♣"
      : card.suit === "pique"
      ? "♠"
      : "♥";

  return `${name} ${suit}`;
}

function PlayingCard({ card: raw }) {
  const card = normalizeCard(raw);
  if (!card) return null;

  if (card.suit === "joker") {
    return (
      <div className="aria-joker-card" title="Joker">
        <div className="aria-joker-card__inner">JOKER</div>
      </div>
    );
  }

  const suitClass = suitToCss(card.suit);
  const rank = valueToRank(card.value);
  const suitEntity = suitToEntity(card.suit);

  return (
    <div className={`card rank-${rank} ${suitClass}`} title={cardLabel(card)}>
      <span className="rank">{rankToCornerText(rank)}</span>
      <span className="suit" dangerouslySetInnerHTML={{ __html: suitEntity }} />
    </div>
  );
}

function suitExplain(suit) {
  switch (suit) {
    case "carreau":
      return "Carreaux : manipuler la matière existante.";
    case "trefle":
      return "Trèfles : matérialiser un élément ex nihilo.";
    case "pique":
      return "Piques : affecter le monde spirituel.";
    case "coeur":
      return "Cœurs : affecter les sentiments / êtres vivants.";
    default:
      return "";
  }
}

export default function MagicModal(props) {
  const {
    isOpen,
    onClose,

    // Nouvelle API
    character,
    setCharacter,

    // Ancienne API (CharacterPage)
    isMage: isMageProp,
    intValue: intValueProp,
    magicEnabled: magicEnabledProp,
    remaining,
    currentCard: currentCardProp,
    usedCards: usedCardsProp,
    onDraw,
    onReset,
    onUseCurrent,
    onDiscardCurrent,
  } = props;

  // ✅ On détecte le mode
  const usingCharacterApi = !!character && typeof setCharacter === "function";

  // ===== lecture de l'état magie =====
  const magic = usingCharacterApi ? character?.magic || {} : null;

  const enabledByCreation = usingCharacterApi
    ? !!magic?.isMage
    : !!magicEnabledProp;

  const intValue = usingCharacterApi ? character?.intelligence ?? 0 : intValueProp ?? 0;
  const meetsInt = intValue >= 14;

  const isMage = usingCharacterApi
    ? enabledByCreation && meetsInt
    : !!isMageProp;

  const deckCount = usingCharacterApi
    ? magic?.deck?.length || 0
    : Number(remaining ?? 0);

  const currentCard = usingCharacterApi ? magic?.currentCard || null : currentCardProp || null;
  const usedCards = usingCharacterApi ? magic?.used || [] : usedCardsProp || [];

  // ===== init deck (uniquement pour la nouvelle API) =====
  useEffect(() => {
    if (!usingCharacterApi) return;
    if (!isOpen) return;
    if (!enabledByCreation) return;

    // si deck déjà présent => rien
    setCharacter((prev) => {
      const prevMagic = prev.magic || {};
      if (prevMagic.deck?.length || prevMagic.currentCard) return prev;

      // si tu veux un init deck ici, fais-le.
      // Mais comme ton CharacterPage gère déjà deck+deckSize,
      // on laisse vide pour éviter d'écraser.
      return prev;
    });
  }, [usingCharacterApi, isOpen, enabledByCreation, setCharacter]);

  // ===== actions =====
  const draw = () => {
    if (usingCharacterApi) {
      // en mode character API : on tire depuis prev.magic.deck
      setCharacter((prev) => {
        const m = prev.magic || {};
        if (!m.deck?.length) return prev;
        if (m.currentCard) return prev;

        const [top, ...rest] = m.deck;
        return { ...prev, magic: { ...m, deck: rest, currentCard: top } };
      });
    } else if (typeof onDraw === "function") {
      onDraw();
    }
  };

  const reset = () => {
    if (usingCharacterApi) {
      setCharacter((prev) => {
        const m = prev.magic || {};
        return { ...prev, magic: { ...m, deck: [], currentCard: null, used: [] } };
      });
    } else if (typeof onReset === "function") {
      onReset();
    }
  };

  const useCard = () => {
    if (usingCharacterApi) {
      setCharacter((prev) => {
        const m = prev.magic || {};
        if (!m.currentCard) return prev;
        const used = [...(m.used || []), { ...normalizeCard(m.currentCard), action: "use" }];
        return { ...prev, magic: { ...m, currentCard: null, used } };
      });
    } else if (typeof onUseCurrent === "function") {
      onUseCurrent();
    }
  };

  const discardCard = () => {
    if (usingCharacterApi) {
      setCharacter((prev) => {
        const m = prev.magic || {};
        if (!m.currentCard) return prev;
        const used = [...(m.used || []), { ...normalizeCard(m.currentCard), action: "discard" }];
        return { ...prev, magic: { ...m, currentCard: null, used } };
      });
    } else if (typeof onDiscardCurrent === "function") {
      onDiscardCurrent();
    }
  };

  const helpText = useMemo(() => {
    if (!enabledByCreation) return "Magie désactivée (active-la dans la création).";
    if (!meetsInt) return "INT 14 minimum pour être magicien.";
    return "Tire une carte : elle est consommée, utilisée ou jetée.";
  }, [enabledByCreation, meetsInt]);

  if (!isOpen) return null;

  return (
    <div className="magic-modal__backdrop" onMouseDown={onClose}>
      <div
        className="magic-modal__panel"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="magic-modal__header">
          <h2>Compétence : Magie</h2>
          <button className="magic-modal__close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="magic-modal__sub">
          <div className="magic-modal__status">
            <span className={`magic-pill ${enabledByCreation ? "on" : "off"}`}>
              {enabledByCreation ? "Magie activée" : "Magie désactivée"}
            </span>
            <span className={`magic-pill ${meetsInt ? "on" : "off"}`}>
              INT : {intValue} {meetsInt ? "✓" : "✕"}
            </span>
          </div>
          <div className="magic-modal__hint">{helpText}</div>
        </div>

        {!enabledByCreation ? (
          <div className="magic-modal__locked">
            <p>Active la magie dans la création de personnage pour utiliser ce panneau.</p>
          </div>
        ) : (
          <>
            <div className="magic-modal__deckrow">
              <div className="magic-modal__deckinfo">
                <div className="magic-modal__deckcount">
                  Cartes restantes : <strong>{deckCount}</strong>
                </div>
                <div className="magic-modal__tiny">
                  Le paquet est face cachée. Une carte révélée est perdue à jamais.
                </div>
              </div>

              <div className="magic-modal__deckactions">
                <button
                  className="magic-modal__btn"
                  onClick={draw}
                  disabled={!isMage || deckCount === 0 || !!currentCard}
                  title={
                    !isMage
                      ? "INT 14 minimum"
                      : currentCard
                      ? "Une carte est déjà révélée"
                      : deckCount === 0
                      ? "Plus de cartes"
                      : "Tirer une carte"
                  }
                >
                  Tirer une carte
                </button>

                <button
                  className="magic-modal__btn ghost"
                  onClick={reset}
                  disabled={deckCount === 0 && !currentCard && usedCards.length === 0}
                  title="Réinitialiser deck / historique"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="magic-modal__cardzone">
              {!currentCard ? (
                <div className="magic-modal__placeholder">Aucune carte tirée.</div>
              ) : (
                <div
                  className={`magic-modal__card ${
                    normalizeCard(currentCard)?.suit === "joker" ? "is-joker" : ""
                  }`}
                >
                  <div className="magic-modal__cardHeader">
                    <div className="magic-modal__cardTitle">{cardLabel(currentCard)}</div>
                    <div className="magic-modal__cardTag">
                      {normalizeCard(currentCard)?.suit === "joker"
                        ? "Tout est possible"
                        : `Famille : ${normalizeCard(currentCard)?.suit}`}
                    </div>
                  </div>

                  <div className="playingCards magic-modal__cardPreview">
                    <div className="magic-modal__cardPreviewInner">
                      <PlayingCard card={currentCard} />
                    </div>
                  </div>

                  <div className="magic-modal__cardmeta">
                    {normalizeCard(currentCard)?.suit === "joker" ? (
                      <span className="magic-modal__jokerline">Tout est possible.</span>
                    ) : (
                      <>
                        <div className="magic-modal__familyline">
                          <strong>Famille :</strong> {normalizeCard(currentCard)?.suit}
                        </div>
                        <div className="magic-modal__explain">
                          {suitExplain(normalizeCard(currentCard)?.suit)}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="magic-modal__actions">
                    <button className="magic-modal__btn" onClick={useCard}>
                      Utiliser
                    </button>
                    <button className="magic-modal__btn ghost" onClick={discardCard}>
                      Jeter
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="magic-used">
              <div className="magic-used__header">
                <h3>Cartes utilisées</h3>
                <div className="magic-used__count">{usedCards.length}</div>
              </div>

              <div className="playingCards magic-used__grid">
                {usedCards.length === 0 ? (
                  <div className="magic-used__empty">Aucune carte consommée.</div>
                ) : (
                  usedCards
                    .slice()
                    .reverse()
                    .map((c, idx) => (
                      <div
                        key={`${normalizeCard(c)?.suit}-${normalizeCard(c)?.value}-${idx}`}
                        className="magic-used__item"
                      >
                        <PlayingCard card={c} />
                        <div className="magic-used__meta">
                          {c.action === "use" ? "Utilisée" : "Jetée"}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
