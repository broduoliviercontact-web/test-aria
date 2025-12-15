import React, { useEffect, useMemo, useState } from "react";
import "./MagicModal.css";

const SUITS = ["carreau", "trefle", "pique", "coeur"];
const VALUES = [2,3,4,5,6,7,8,9,10,11,12,13,14]; // 11=Valet,12=Dame,13=Roi,14=As

function buildDeck(withJoker = true) {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value });
    }
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
    v === 11 ? "Valet" :
    v === 12 ? "Dame" :
    v === 13 ? "Roi" :
    v === 14 ? "As" : String(v);
  const suit =
    card.suit === "carreau" ? "♦" :
    card.suit === "trefle" ? "♣" :
    card.suit === "pique" ? "♠" : "♥";
  return `${name} ${suit}`;
}

export default function MagicModal({
  isOpen,
  onClose,
  character,
  setCharacter,
}) {
  const isMage = !!character?.magic?.isMage;

  // On initialise le “deck de campagne” si besoin
  useEffect(() => {
    if (!isOpen) return;
    if (!isMage) return;

    setCharacter(prev => {
      const prevMagic = prev.magic || {};
      if (prevMagic.deck?.length) return prev; // déjà prêt

      // règle : 25 cartes random + joker, face cachée
      const full = shuffle(buildDeck(true));
      const picked = full.slice(0, 25);

      // s'assurer que le joker est dedans (règle : + le joker)
      const hasJoker = picked.some(c => c.suit === "joker");
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
  }, [isOpen, isMage, setCharacter]);

  const deckCount = character?.magic?.deck?.length || 0;
  const currentCard = character?.magic?.currentCard || null;

  function drawCard() {
    setCharacter(prev => {
      const m = prev.magic;
      if (!m?.deck?.length || m.currentCard) return prev; // pas de tirage si déjà une carte en main
      const [top, ...rest] = m.deck; // “première carte”
      return { ...prev, magic: { ...m, deck: rest, currentCard: top } };
    });
  }

  function consumeCurrentCard(action) {
    setCharacter(prev => {
      const m = prev.magic;
      if (!m?.currentCard) return prev;
      const used = [...(m.used || []), { ...m.currentCard, action }];
      return { ...prev, magic: { ...m, currentCard: null, used } };
    });
  }

  if (!isOpen) return null;

  return (
    <div className="magic-modal__backdrop" onMouseDown={onClose}>
      <div className="magic-modal__panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="magic-modal__header">
          <h2>Compétence : Magie</h2>
          <button className="magic-modal__close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {!isMage ? (
          <div className="magic-modal__locked">
            <p>Ce personnage n’est pas magicien. (INT 14 minimum)</p>
          </div>
        ) : (
          <>
            <div className="magic-modal__deckrow">
              <div className="magic-modal__deckinfo">
                <div className="magic-modal__deckcount">Cartes restantes : <strong>{deckCount}</strong></div>
                <div className="magic-modal__hint">Le paquet est face cachée. Une carte tirée est perdue à jamais.</div>
              </div>

              <button
                className="magic-modal__btn"
                onClick={drawCard}
                disabled={deckCount === 0 || !!currentCard}
                title={currentCard ? "Tu as déjà une carte révélée" : ""}
              >
                Tirer une carte
              </button>
            </div>

            <div className="magic-modal__cardzone">
              {!currentCard ? (
                <div className="magic-modal__placeholder">
                  Aucune carte tirée.
                </div>
              ) : (
                <div className={`magic-modal__card ${currentCard.suit === "joker" ? "is-joker" : ""}`}>
                  <div className="magic-modal__cardtitle">{cardLabel(currentCard)}</div>
                  <div className="magic-modal__cardmeta">
                    {currentCard.suit === "joker"
                      ? "Tout est possible."
                      : `Famille : ${currentCard.suit}`}
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

            <div className="magic-modal__footer">
              <div className="magic-modal__small">
                Historique : {character?.magic?.used?.length || 0} carte(s) consommée(s)
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
