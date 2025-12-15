import React, { useEffect, useMemo } from "react";
import "./MagicModal.css";

/**
 * Attend :
 * character = { intelligence: number, magic: { isMage, deck, currentCard, used } }
 * setCharacter = (updaterFn) => void
 */

const SUITS = ["carreau", "trefle", "pique", "coeur"];
const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 11=Valet,12=Dame,13=Roi,14=As

function buildDeck(withJoker = true) {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) deck.push({ suit, value });
  }
  if (withJoker) deck.push({ suit: "joker", value: "joker" });
  return deck;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cardLabel(card) {
  if (!card) return "";
  if (card.suit === "joker") return "Joker";
  const v = card.value;
  const name =
    v === 11 ? "Valet" : v === 12 ? "Dame" : v === 13 ? "Roi" : v === 14 ? "As" : String(v);
  const suit =
    card.suit === "carreau" ? "♦" : card.suit === "trefle" ? "♣" : card.suit === "pique" ? "♠" : "♥";
  return `${name} ${suit}`;
}

/* ===========================
   CSS-PLAYING-CARDS mapping
   =========================== */
function suitToCss(suit) {
  if (suit === "pique") return "spades";
  if (suit === "coeur") return "hearts";
  if (suit === "trefle") return "clubs";
  // cards.css utilise la classe "diams"
  if (suit === "carreau") return "diams";
  return "";
}
// Entités HTML EXACTES utilisées dans les exemples du repo
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
  // Les exemples affichent A,K,Q,J ou chiffre
  return rank.toUpperCase();
}

function PlayingCard({ card }) {
  if (!card) return null;

  // Joker : fallback custom (le pack ne le gère pas toujours)
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

  // ✅ HTML conforme au pack : .card.rank-x.suit + span.rank + span.suit (avec entité)
  return (
    <div className={`card rank-${rank} ${suitClass}`} title={cardLabel(card)}>
      <span className="rank">{rankToCornerText(rank)}</span>
      <span
        className="suit"
        dangerouslySetInnerHTML={{ __html: suitEntity }}
      />
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

export default function MagicModal({ isOpen, onClose, character, setCharacter }) {
  const magic = character?.magic || {};
  const intValue = character?.intelligence ?? 0;

  const enabledByCreation = !!magic?.isMage;
  const meetsInt = intValue >= 14;
  const isMage = enabledByCreation && meetsInt;

  const deckCount = magic?.deck?.length || 0;
  const currentCard = magic?.currentCard || null;
  const usedCards = magic?.used || [];

  // Init deck au 1er open (si magie activée)
  useEffect(() => {
    if (!isOpen) return;
    if (!enabledByCreation) return;

    setCharacter((prev) => {
      const prevMagic = prev.magic || {};
      if (prevMagic.deck?.length || prevMagic.currentCard) return prev;

      // règle : 25 cartes au hasard + Joker garanti
      const full = shuffle(buildDeck(true));
      const picked = full.slice(0, 25);
      const hasJoker = picked.some((c) => c.suit === "joker");
      const deck = hasJoker ? picked : [...picked.slice(0, 24), { suit: "joker", value: "joker" }];

      return {
        ...prev,
        magic: {
          ...prevMagic,
          isMage: true,
          deck,
          currentCard: null,
          used: prevMagic.used || [],
        },
      };
    });
  }, [isOpen, enabledByCreation, setCharacter]);

  function drawCard() {
    setCharacter((prev) => {
      const m = prev.magic || {};
      if (!m.deck?.length) return prev;
      if (m.currentCard) return prev; // déjà une carte en main

      const [top, ...rest] = m.deck;
      return { ...prev, magic: { ...m, deck: rest, currentCard: top } };
    });
  }

  function consumeCurrentCard(action) {
    setCharacter((prev) => {
      const m = prev.magic || {};
      if (!m.currentCard) return prev;

      const used = [...(m.used || []), { ...m.currentCard, action }];
      return { ...prev, magic: { ...m, currentCard: null, used } };
    });
  }

  function resetMagic() {
    setCharacter((prev) => {
      const m = prev.magic || {};
      return { ...prev, magic: { ...m, deck: [], currentCard: null, used: [] } };
    });
  }

  const helpText = useMemo(() => {
    if (!enabledByCreation) return "Magie désactivée (active-la dans la création).";
    if (!meetsInt) return "INT 14 minimum pour être magicien.";
    return "Tire une carte : elle est consommée, utilisée ou jetée.";
  }, [enabledByCreation, meetsInt]);

  if (!isOpen) return null;

  return (
    <div className="magic-modal__backdrop" onMouseDown={onClose}>
      <div className="magic-modal__panel" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
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
                  onClick={drawCard}
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
                  onClick={resetMagic}
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
                <div className={`magic-modal__card ${currentCard.suit === "joker" ? "is-joker" : ""}`}>
                  <div className="magic-modal__cardHeader">
                    <div className="magic-modal__cardTitle">{cardLabel(currentCard)}</div>
                    <div className="magic-modal__cardTag">
                      {currentCard.suit === "joker" ? "Tout est possible" : `Famille : ${currentCard.suit}`}
                    </div>
                  </div>

                  {/* ✅ Carte principale en CSS-Playing-Cards (entités HTML) */}
                  <div className="playingCards magic-modal__cardPreview">
                    <div className="magic-modal__cardPreviewInner">
                      <PlayingCard card={currentCard} />
                    </div>
                  </div>

                  <div className="magic-modal__cardmeta">
                    {currentCard.suit === "joker" ? (
                      <span className="magic-modal__jokerline">Tout est possible.</span>
                    ) : (
                      <>
                        <div className="magic-modal__familyline">
                          <strong>Famille :</strong> {currentCard.suit}
                        </div>
                        <div className="magic-modal__explain">{suitExplain(currentCard.suit)}</div>
                      </>
                    )}
                  </div>

                  <div className="magic-modal__actions">
                    <button className="magic-modal__btn" onClick={() => consumeCurrentCard("use")}>
                      Utiliser
                    </button>
                    <button className="magic-modal__btn ghost" onClick={() => consumeCurrentCard("discard")}>
                      Jeter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cimetière */}
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
                      <div key={`${c.suit}-${c.value}-${idx}`} className="magic-used__item">
                        <PlayingCard card={c} />
                        <div className="magic-used__meta">{c.action === "use" ? "Utilisée" : "Jetée"}</div>
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
