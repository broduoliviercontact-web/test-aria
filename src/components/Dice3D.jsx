import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./Dice3D.css";

/* ===========================
   Chargement des scripts
   =========================== */

function loadOnce(id, src) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      if (existing.dataset.loaded === "true") return resolve();
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed: ${src}`)),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = false; // ordre garanti
    script.dataset.loaded = "false";

    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed: ${src}`));

    document.body.appendChild(script);
  });
}

/* ===========================
   Couleurs
   =========================== */

function makeHsl(h, s = 55, l = 32) {
  const hh = ((h % 360) + 360) % 360;
  return `hsl(${hh} ${s}% ${l}%)`;
}

function randomBaseHue() {
  return Math.floor(Math.random() * 360);
}

function makeAnalogPalette(count, baseHue) {
  if (count <= 1) return [makeHsl(baseHue)];
  const spread = 28;
  const step = (spread * 2) / (count - 1);
  const colors = [];

  for (let i = 0; i < count; i++) {
    const hue = baseHue - spread + step * i;
    const light = 26 + (i % 2 === 0 ? 4 : 0);
    colors.push(makeHsl(hue, 55, light));
  }
  return colors;
}

function applyColorsToDice(dices, mode) {
  if (!Array.isArray(dices) || dices.length === 0) return;
  if (!window.DICE?.make_material_for_type) return;

  const baseHue = randomBaseHue();

  if (mode === "gradient") {
    const palette = makeAnalogPalette(dices.length, baseHue);
    dices.forEach((dice, idx) => {
      dice.material = window.DICE.make_material_for_type(
        dice.dice_type,
        palette[idx],
        "#f5f0e6"
      );
      dice.material.needsUpdate = true;
    });
  } else {
    const color = makeHsl(baseHue, 55, 32);
    dices.forEach((dice) => {
      dice.material = window.DICE.make_material_for_type(
        dice.dice_type,
        color,
        "#f5f0e6"
      );
      dice.material.needsUpdate = true;
    });
  }
}

/* ✅ d100 : 2 couleurs “cousines” (teintes proches) */
function applyCousinPercentileColors(dices) {
  if (!Array.isArray(dices) || dices.length < 2) return;
  if (!window.DICE?.make_material_for_type) return;

  const baseHue = randomBaseHue();

  // ⭐ VARIABLE À MODIFIER POUR AUGMENTER / RÉDUIRE L’ÉCART
  // cousines = ~18–28 ; plus marqué = ~35–55 ; contraste = 70+
  const delta = 18 + Math.floor(Math.random() * 10); // 18–28°

  const tensColor = makeHsl(baseHue, 55, 32);
  const onesColor = makeHsl(baseHue + delta, 55, 32);

  const tensDie = dices[0];
  const onesDie = dices[1];

  tensDie.material = window.DICE.make_material_for_type(
    tensDie.dice_type,
    tensColor,
    "#f5f0e6"
  );
  tensDie.material.needsUpdate = true;

  onesDie.material = window.DICE.make_material_for_type(
    onesDie.dice_type,
    onesColor,
    "#f5f0e6"
  );
  onesDie.material.needsUpdate = true;
}

/* ===========================
   Helpers d100
   =========================== */

function isD100Notation(raw) {
  const r = String(raw || "").trim().toLowerCase();
  return r === "d100" || r === "1d100" || r === "1d100+0" || r === "d100+0";
}

function toPercentileFromResults(tensRaw, onesRaw) {
  let tens =
    tensRaw >= 0 && tensRaw <= 90 && tensRaw % 10 === 0
      ? tensRaw
      : (tensRaw === 10 ? 0 : tensRaw) * 10;

  let ones =
    onesRaw >= 0 && onesRaw <= 9 ? onesRaw : onesRaw === 10 ? 0 : onesRaw;

  if (!Number.isFinite(tens)) tens = 0;
  if (!Number.isFinite(ones)) ones = 0;

  return tens + ones === 0 ? 100 : tens + ones;
}

/* ===========================
   Composant
   =========================== */

const Dice3D = forwardRef(function Dice3D(
  {
    notation = "3d6",
    height = 240,
    onRoll,
    hideToolbar = false,
    colorMode: controlledColorMode,
    onChangeColorMode,
  },
  ref
) {
  const containerRef = useRef(null);
  const boxRef = useRef(null);
  const effectiveNotationRef = useRef("3d6");

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const [localColorMode, setLocalColorMode] = useState("solid");
  const colorMode = controlledColorMode ?? localColorMode;

  const setColorMode = (mode) => {
    if (onChangeColorMode) onChangeColorMode(mode);
    else setLocalColorMode(mode);
  };

  // ✅ refs anti-stale-closure (fix swipe)
  const onRollRef = useRef(onRoll);
  const notationRef = useRef(notation);
  const colorModeRef = useRef(colorMode);

  useEffect(() => {
    onRollRef.current = onRoll;
  }, [onRoll]);

  useEffect(() => {
    notationRef.current = notation;
  }, [notation]);

  useEffect(() => {
    colorModeRef.current = colorMode;
  }, [colorMode]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setError("");

        const base = import.meta.env.BASE_URL || "/";
        const url = (p) =>
          `${base.replace(/\/$/, "/")}${p.replace(/^\//, "")}`;

        await loadOnce("three-js", url("dice/libs/three.min.js"));
        await loadOnce("cannon-js", url("dice/libs/cannon.min.js"));
        await loadOnce("teal-js", url("dice/libs/teal.js"));
        await loadOnce("dice-js", url("dice/dice.js"));

        if (!window.DICE)
          throw new Error("window.DICE introuvable après chargement.");

        if (!cancelled) setReady(true);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e.message || "Erreur chargement dés 3D");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || boxRef.current) return;

    try {
      const box = new window.DICE.dice_box(containerRef.current);
      boxRef.current = box;

      // ✅ click+slide / swipe to roll
      try {
        const el = containerRef.current;

        box.bind_swipe(
          el,
          // before_roll
          () => {
            const raw = String(notationRef.current || "1d6")
              .trim()
              .toLowerCase();
            const effective = isD100Notation(raw) ? "1d100+1d10" : raw;

            effectiveNotationRef.current = effective;
            box.setDice(effective);
            return null; // random
          },
          // after_roll
          (notationObj) => {
            const rolls = Array.isArray(notationObj?.result)
              ? notationObj.result
              : [];
            const effective = effectiveNotationRef.current;

            if (effective === "1d100+1d10") {
              const tensRaw = Number(rolls?.[0] ?? 0);
              const onesRaw = Number(rolls?.[1] ?? 0);
              const pct = toPercentileFromResults(tensRaw, onesRaw);

              onRollRef.current?.({ total: pct, rolls: [tensRaw, onesRaw] });
              applyCousinPercentileColors(box.dices);
              return;
            }

            const total =
              typeof notationObj?.resultTotal === "number"
                ? notationObj.resultTotal
                : rolls.reduce((a, b) => a + b, 0);

            onRollRef.current?.({ total, rolls });
            applyColorsToDice(box.dices, colorModeRef.current);
          }
        );
      } catch (e) {
        console.warn("bind_swipe a échoué :", e);
      }
    } catch (e) {
      console.error(e);
      setError("Impossible d'initialiser la dice box");
    }
  }, [ready]);

  const roll = () => {
    const box = boxRef.current;
    if (!box) return;

    try {
      const raw = String(notation || "1d6").trim().toLowerCase();
      const isD100 = isD100Notation(raw);

      if (isD100) {
        const effective = "1d100+1d10";
        effectiveNotationRef.current = effective;

        box.setDice(effective);

        box.start_throw(null, (notationObj) => {
          const rolls = Array.isArray(notationObj?.result)
            ? notationObj.result
            : [];

          const tensRaw = Number(rolls?.[0] ?? 0);
          const onesRaw = Number(rolls?.[1] ?? 0);
          const pct = toPercentileFromResults(tensRaw, onesRaw);

          onRoll?.({ total: pct, rolls: [tensRaw, onesRaw] });
        });

        applyCousinPercentileColors(box.dices);
        return;
      }

      // cas normal
      effectiveNotationRef.current = raw;
      box.setDice(notation);

      box.start_throw(null, (notationObj) => {
        const rolls = Array.isArray(notationObj?.result) ? notationObj.result : [];
        const total =
          typeof notationObj?.resultTotal === "number"
            ? notationObj.resultTotal
            : rolls.reduce((a, b) => a + b, 0);

        onRoll?.({ total, rolls });
      });

      applyColorsToDice(box.dices, colorMode);
    } catch (e) {
      console.error(e);
      setError("Erreur pendant le lancer 3D.");
    }
  };

  useImperativeHandle(ref, () => ({
    roll,
    isReady: () => ready,
  }));

  return (
    <div className="dice3d">
      {!hideToolbar && (
        <div className="dice3d__toolbar">
          <button
            type="button"
            className="btn-primary"
            onClick={roll}
            disabled={!ready}
          >
            {ready ? `🎲 Lancer ${notation} (3D)` : "Chargement des dés 3D…"}
          </button>

          {error ? <div className="dice3d__error">{error}</div> : null}
        </div>
      )}

      <div ref={containerRef} className="dice3d__canvas" style={{ height }} />

      {hideToolbar && error ? (
        <div className="dice3d__error dice3d__error--below">{error}</div>
      ) : null}
    </div>
  );
});

export default Dice3D;
