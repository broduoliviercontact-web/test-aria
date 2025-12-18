import React, { useEffect, useMemo, useRef, useState } from "react";
import "./MagicModal.css";

/* ===========================
   Images (deck visuel)
   =========================== */

function normalizeSuit(raw) {
  if (!raw) return null;
  const s = String(raw).toLowerCase();

  if (s === "trèfle" || s === "trèfles" || s === "clubs") return "trefle";
  if (s === "spades") return "pique";
  if (s === "hearts") return "coeur";
  if (s === "diamonds" || s === "diams") return "carreau";

  return s;
}

function getCardImageSrc(card, { back = false } = {}) {
  if (back) return "/cards/back.png";
  if (!card) return null;

  const suit = normalizeSuit(card.family ?? card.suit);

  // Joker (si ton modèle varie)
  if (suit === "joker" || card.value === "joker" || card.rank === "joker") {
    return "/cards/joker.png";
  }

  const v = Number(card.value);
  const valueMap = { 1: "A", 11: "J", 12: "Q", 13: "K", 14: "A" };
  const file = valueMap[v] ?? String(v);

  return `/cards/${suit}/${file}.png`;
}

/* ===========================
   Puissance (tiers)
   2 / 3-6 / 7-8 / 9-10 / J / Q-K / A / Joker
   =========================== */

function cardTier(card) {
  if (!card) return 1;
  const suit = normalizeSuit(card.family ?? card.suit);

  if (suit === "joker" || card.value === "joker") return 8;

  const v = Number(card.value);
  // As possible 1 ou 14
  if (v === 1 || v === 14) return 7;
  if (v === 13 || v === 12) return 6; // K/Q
  if (v === 11) return 5; // J
  if (v >= 9 && v <= 10) return 4;
  if (v >= 7 && v <= 8) return 3;
  if (v >= 3 && v <= 6) return 2;
  return 1; // 2 et reste
}

/* ===========================
   Labels
   =========================== */

function cardLabel(card) {
  const suit = normalizeSuit(card?.family ?? card?.suit);
  if (!card) return "";
  if (suit === "joker" || card.value === "joker") return "Joker";

  const v = Number(card.value);
  const name =
    v === 11 ? "Valet" :
    v === 12 ? "Dame" :
    v === 13 ? "Roi" :
    v === 14 || v === 1 ? "As" :
    String(v);

  const suitChar =
    suit === "carreau" ? "♦" :
    suit === "trefle" ? "♣" :
    suit === "pique" ? "♠" :
    "♥";

  return `${name} ${suitChar}`;
}

/* ===========================
   Tilt (inspiré pokemon-cards-css)
   - RAF pour fluidité
   - Pas de transition pendant move
   - Transition douce au leave
   =========================== */

function MagicTilt({ suit, tier, children }) {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const lastRef = useRef({ x: 0, y: 0 });

  const apply = () => {
    rafRef.current = 0;
    const el = ref.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const px = (lastRef.current.x - r.left) / r.width;  // 0..1
    const py = (lastRef.current.y - r.top) / r.height;  // 0..1

    const x = Math.max(0, Math.min(1, px));
    const y = Math.max(0, Math.min(1, py));

    const rotY = (x - 0.5) * 18;
    const rotX = (0.5 - y) * 18;

    el.style.setProperty("--rx", `${rotX}deg`);
    el.style.setProperty("--ry", `${rotY}deg`);
    el.style.setProperty("--px", `${x * 100}%`);
    el.style.setProperty("--py", `${y * 100}%`);
  };

  const onMove = (e) => {
    lastRef.current = { x: e.clientX, y: e.clientY };
    if (!rafRef.current) rafRef.current = requestAnimationFrame(apply);
  };

  const onEnter = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("is-resting");
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;

    el.classList.add("is-resting");
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
    el.style.setProperty("--px", `50%`);
    el.style.setProperty("--py", `35%`);
  };

  return (
    <div className="magic-tilt-scene">
      <div
        ref={ref}
        className="magic-tilt-card is-resting"
        data-suit={suit || "unknown"}
        data-tier={tier}
        onMouseEnter={onEnter}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
     <div className="magic-tilt-media">
  {children}
</div>
      </div>
    </div>
  );
}

/* ===========================
   Face / Back
   =========================== */

function CardBack({ size = "large" }) {
  const [ok, setOk] = useState(true);
  const src = "/cards/back.png";

  if (ok) {
    return (
      <img
        src={src}
        alt="Dos de carte"
        className={`magic-card-img ${size === "small" ? "is-small" : "is-large"}`}
        draggable="false"
        onError={() => setOk(false)}
      />
    );
  }

  return <div className={`magic-card-back-fallback ${size}`}>BACK</div>;
}

function CardFace({ card, size = "large" }) {
  const [ok, setOk] = useState(true);
  const src = useMemo(() => getCardImageSrc(card), [card]);

  useEffect(() => setOk(true), [src]);

  if (!card) return null;

  const suit = normalizeSuit(card.family ?? card.suit);
  const tier = cardTier(card);

  if (src && ok) {
    const img = (
      <img
        src={src}
        alt={cardLabel(card)}
        className={`magic-card-img ${size === "small" ? "is-small" : "is-large"}`}
        draggable="false"
        onError={() => setOk(false)}
      />
    );

    // Small = pas d’effet (perf + lisibilité)
    if (size === "small") return img;

    return (
      <MagicTilt suit={suit} tier={tier}>
        {img}
      </MagicTilt>
    );
  }

  // Fallback minimal si une image manque
  return (
    <div className="magic-fallback-card">
      {cardLabel(card)}
    </div>
  );
}

/* ===========================
   MagicModal (UI)
   =========================== */

function mageTypeLabel(type) {
  if (type === "academy") return "Couronne / Académie";
  if (type === "misericordieux") return "Miséricordieux";
  return "Disciple étranger";
}

export default function MagicModal({
  isOpen,
  onClose,

  isMage,
  intValue,
  magicEnabled,

  mageType,
  onChangeMageType,

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

  const hasEverDrawn =
    !!currentCard ||
    (Array.isArray(usedCards) && usedCards.length > 0) ||
    (Number.isFinite(deckSize) &&
      Number.isFinite(remaining) &&
      remaining < deckSize);

  const hideTypeUI = typeConfirmed || hasEverDrawn;

  useEffect(() => {
    if (!isOpen) return;
    if (!magicEnabled) return;
    if (hideTypeUI) {
      setShowMageInfo(false);
      return;
    }
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

  const suit = currentCard ? normalizeSuit(currentCard.family ?? currentCard.suit) : null;

  return (
    <div className="magic-modal__backdrop" onMouseDown={onClose}>
      <div
        className="magic-modal__panel"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="magic-modal__header">
          <h2>Magie</h2>
          <button className="magic-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

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
            {showMageInfo && (
              <div className="magic-modal__locked magic-modal__infoBox">
                <strong>Jouer un magicien</strong>
                <div className="magic-modal__infoText">
                  <p className="magic-modal__pFirst">
                    <strong>• Disciple étranger</strong><br />
                    Gros potentiel magique, peu de compétences acquises par défaut.
                  </p>
                  <p>
                    <strong>• Couronne / Académie</strong><br />
                    Accès/Reconnaissance, mais potentiel moindre et code moral strict.
                  </p>
                  <p className="magic-modal__pLast">
                    <strong>• Miséricordieux</strong><br />
                    Corps d’élite : puissant et combattant. Risque d’instabilité en fin de paquet.
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
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="magic-modal__cardzone">
              {!currentCard ? (
              <div className="magic-modal__placeholder">
  <MagicTilt suit="back" tier={2}>
    <CardBack size="large" />
  </MagicTilt>
</div>

              ) : (
                <div className="magic-modal__card">
                  <div className="magic-modal__cardHeader">
                    <div
                      className={`magic-modal__cardTitle ${
                        suit === "coeur" || suit === "carreau" ? "is-red" : "is-black"
                      }`}
                    >
                      {cardLabel(currentCard)}
                    </div>
                  </div>

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
