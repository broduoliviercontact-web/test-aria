import { useEffect, useRef, useState } from "react";

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
  const light = 28 + (i % 2 === 0 ? 4 : 0);
colors.push(makeHsl(hue, 55, light));
  }
  return colors;
}

// ✅ IMPORTANT : on remplace le material du dé (texture regenerée)
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
    const color = makeHsl(baseHue, 85, 55);
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

export default function Dice3D({ notation = "3d6", height = 240, onRoll }) {
  const containerRef = useRef(null);
  const boxRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [colorMode, setColorMode] = useState("solid"); // "solid" | "gradient"

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

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height,
          borderRadius: "12px",
          background: "rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.2)",
          overflow: "hidden",
        }}
      />

      <div
        style={{
          marginTop: "0.5rem",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button type="button" className="btn-primary" onClick={roll} disabled={!ready}>
          {ready ? `🎲 Lancer ${notation} (3D)` : "Chargement des dés 3D…"}
        </button>

        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", opacity: 0.85 }}>Couleur :</span>
          <button
            type="button"
            className={colorMode === "solid" ? "btn-primary" : "btn-secondary"}
            onClick={() => setColorMode("solid")}
          >
            Harmonieux
          </button>
          <button
            type="button"
            className={colorMode === "gradient" ? "btn-primary" : "btn-secondary"}
            onClick={() => setColorMode("gradient")}
          >
            Dégradé
          </button>
        </div>

        {error ? (
          <div style={{ color: "#ffb4b4", fontSize: "0.9rem" }}>{error}</div>
        ) : null}
      </div>
    </div>
  );
}
