import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./Dice3D.css";

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

// 🎨 Couleurs harmonieuses : palette analogue autour d’une teinte
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

// ✅ IMPORTANT : on remplace le material (car la couleur est baked dans la texture)
function applyColorsToDice(dices, mode) {
  if (!Array.isArray(dices) || dices.length === 0) return;
  if (!window.DICE?.make_material_for_type) return;

  const baseHue = randomBaseHue();

  if (mode === "gradient") {
    const palette = makeAnalogPalette(dices.length, baseHue);
    dices.forEach((dice, idx) => {
      const color = palette[idx];
      dice.material = window.DICE.make_material_for_type(
        dice.dice_type,
        color,
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

const Dice3D = forwardRef(function Dice3D(
  {
    notation = "3d6",
    height = 240,
    onRoll,
    hideToolbar = false,
    colorMode: controlledColorMode, // optionnel (contrôlé par parent)
    onChangeColorMode, // optionnel
  },
  ref
) {
  const containerRef = useRef(null);
  const boxRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  // si non contrôlé, on garde un state interne
  const [localColorMode, setLocalColorMode] = useState("solid");
  const colorMode = controlledColorMode ?? localColorMode;

  const setColorMode = (mode) => {
    if (onChangeColorMode) onChangeColorMode(mode);
    else setLocalColorMode(mode);
  };

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
      if (!window.DICE || typeof window.DICE.dice_box !== "function") {
        setError("DICE non disponible (dice.js n'a pas chargé correctement).");
        return;
      }
      boxRef.current = new window.DICE.dice_box(containerRef.current);
    } catch (e) {
      console.error(e);
      setError("Impossible d'initialiser la dice box");
    }
  }, [ready]);

  const roll = () => {
    const box = boxRef.current;
    if (!box) return;

    try {
      box.setDice(notation);

      box.start_throw(null, (notationObj) => {
        const rolls = Array.isArray(notationObj?.result)
          ? notationObj.result
          : [];
        const total =
          typeof notationObj?.resultTotal === "number"
            ? notationObj.resultTotal
            : rolls.reduce((a, b) => a + b, 0);

        onRoll?.({ total, rolls });
      });

      // ✅ après start_throw, box.dices existe
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

      {/* Si toolbar cachée, on garde quand même l’erreur visible (sous le canvas) */}
      {hideToolbar && error ? (
        <div className="dice3d__error dice3d__error--below">{error}</div>
      ) : null}
    </div>
  );
});

export default Dice3D;
