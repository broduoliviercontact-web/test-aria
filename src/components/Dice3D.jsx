import { useEffect, useRef, useState } from "react";

function loadOnce(id, src) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      if (existing.dataset.loaded === "true") return resolve();
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed: ${src}`)), { once: true });
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

export default function Dice3D({ notation = "3d6", height = 240, onRoll }) {
  const containerRef = useRef(null);
  const boxRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setError("");

        const base = import.meta.env.BASE_URL || "/";
        const url = (p) => `${base.replace(/\/$/, "/")}${p.replace(/^\//, "")}`;

        // IMPORTANT : ordre
        await loadOnce("three-js", url("dice/libs/three.min.js"));
        await loadOnce("cannon-js", url("dice/libs/cannon.min.js"));
        await loadOnce("teal-js", url("dice/libs/teal.js"));
        await loadOnce("dice-js", url("dice/dice.js"));

        if (!window.DICE) throw new Error("window.DICE introuvable après chargement.");

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

    box.setDice(notation);
    box.start_throw(null, (notationObj) => {
      const rolls = Array.isArray(notationObj?.result) ? notationObj.result : [];
      const total =
        typeof notationObj?.resultTotal === "number"
          ? notationObj.resultTotal
          : rolls.reduce((a, b) => a + b, 0);

      onRoll?.({ total, rolls });
    });
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
      <div style={{ marginTop: "0.5rem" }}>
        <button type="button" className="btn-primary" onClick={roll} disabled={!ready}>
          {ready ? `🎲 Lancer ${notation} (3D)` : "Chargement des dés 3D…"}
        </button>
        {error ? (
          <div style={{ color: "#ffb4b4", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
