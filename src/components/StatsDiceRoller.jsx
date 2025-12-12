import React, { useMemo, useState } from "react";
import "./StatsDiceRoller.css";
import Dice3D from "./Dice3D";

const DICE_SYMBOLS = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const MAX_DICE_SERIES = 5;

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

export default function StatsDiceRoller({ stats, onApplyStats }) {
  const [diceSeries, setDiceSeries] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState(null);

  // ✅ Toggle 3D
  const [use3D, setUse3D] = useState(false);

  // ✅ Flow 3D : on remplit une série progressivement (stat par stat)
  const [rolling3D, setRolling3D] = useState(false);
  const [rollingSeriesId, setRollingSeriesId] = useState(null);
  const [rollingStatIndex, setRollingStatIndex] = useState(0);
  const [rollingRollsByStat, setRollingRollsByStat] = useState({});

  const nextSeriesId = useMemo(() => {
    return (diceSeries[diceSeries.length - 1]?.id || 0) + 1;
  }, [diceSeries]);

  const buildStatsFromSeries = (series) => {
    return stats.map((stat) => {
      const rolls = series.rollsByStat?.[stat.id];
      if (!rolls || rolls.length === 0) return stat;

      const total = rolls.reduce((sum, v) => sum + v, 0);
      return { ...stat, value: total };
    });
  };

  const handleConfirmSelectedSeries = () => {
    if (!selectedSeriesId) return;
    const series = diceSeries.find((s) => s.id === selectedSeriesId);
    if (!series) return;

    const newStats = buildStatsFromSeries(series);
    onApplyStats(newStats); // ✅ seulement ici on applique (et donc le roller disparaît côté App)
  };

  /* ===========================
     MODE CLASSIQUE (2D)
     =========================== */
  const handleRollNewSeriesClassic = () => {
    if (diceSeries.length >= MAX_DICE_SERIES) return;

    const rollsByStat = {};
    stats.forEach((stat) => {
      rollsByStat[stat.id] = [rollD6(), rollD6(), rollD6()];
    });

    const newSeries = { id: nextSeriesId, rollsByStat };

    setDiceSeries((prev) => [...prev, newSeries]);
    setSelectedSeriesId(newSeries.id); // ✅ sélection automatique, mais pas appliqué
  };

  /* ===========================
     MODE 3D - construction d’une série stat par stat
     =========================== */
  const handleStart3DSeries = () => {
    if (diceSeries.length >= MAX_DICE_SERIES) return;
    if (rolling3D) return;

    setRolling3D(true);
    setRollingSeriesId(nextSeriesId);
    setRollingStatIndex(0);
    setRollingRollsByStat({});
    setSelectedSeriesId(nextSeriesId); // sélection “virtuel” pendant le build
  };

  const handle3DRoll = ({ total, rolls }) => {
    if (!rolling3D) return;

    const stat = stats[rollingStatIndex];
    if (!stat) return;

    const normalized =
      Array.isArray(rolls) && rolls.length > 0 ? rolls : [total];

    const nextRollsByStat = {
      ...rollingRollsByStat,
      [stat.id]: normalized,
    };

    setRollingRollsByStat(nextRollsByStat);

    const nextIndex = rollingStatIndex + 1;

    if (nextIndex >= stats.length) {
      // ✅ Série complète → on l’ajoute à l’historique
      const completed = {
        id: rollingSeriesId,
        rollsByStat: nextRollsByStat,
      };

      setDiceSeries((prev) => [...prev, completed]);

      // fin du build
      setRolling3D(false);
      setRollingSeriesId(null);
      setRollingStatIndex(0);
      setRollingRollsByStat({});

      // sélection automatique de la série finie
      setSelectedSeriesId(completed.id);
      return;
    }

    setRollingStatIndex(nextIndex);
  };

  const activeSeries =
    diceSeries.find((s) => s.id === selectedSeriesId) || null;

  // Si on est en train de construire une série 3D, on montre un aperçu “virtuel”
  const shownRollsByStat = rolling3D
    ? rollingRollsByStat
    : activeSeries?.rollsByStat || {};

  const canConfirm = !!activeSeries && !rolling3D;

  return (
    <section className="stats-dice-roller">
      {/* Switch 3D */}
      <div
        style={{
          marginBottom: "0.75rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={use3D}
            onChange={(e) => {
              const checked = e.target.checked;
              setUse3D(checked);

              // Si on coupe le 3D pendant une série en cours → on annule le build
              if (!checked && rolling3D) {
                setRolling3D(false);
                setRollingSeriesId(null);
                setRollingStatIndex(0);
                setRollingRollsByStat({});
              }
            }}
          />
          Utiliser les dés 3D
        </label>

        {/* ✅ Bouton de confirmation global */}
        <button
          type="button"
          className="btn-primary"
          onClick={handleConfirmSelectedSeries}
          disabled={!canConfirm}
          title={
            rolling3D
              ? "Termine la série 3D avant de confirmer."
              : !activeSeries
              ? "Sélectionne un jet avant de confirmer."
              : ""
          }
        >
          Confirmer ce jet
        </button>
      </div>

      {/* Bouton principal (lancer) */}
      {!use3D ? (
        <>
          <button
            type="button"
            className="dice-button"
            onClick={handleRollNewSeriesClassic}
            disabled={diceSeries.length >= MAX_DICE_SERIES}
          >
            {diceSeries.length >= MAX_DICE_SERIES
              ? "Nombre maximal de séries (5) atteint"
              : diceSeries.length === 0
              ? "Lancer une première série de 3d6"
              : "Lancer une nouvelle série de 3d6"}
          </button>

          <p className="dice-hint">
            Tu peux lancer jusqu&apos;à 5 séries complètes, en sélectionner une,
            puis confirmer ton choix.
          </p>
        </>
      ) : (
        <>
          <button
            type="button"
            className="dice-button"
            onClick={handleStart3DSeries}
            disabled={diceSeries.length >= MAX_DICE_SERIES || rolling3D}
          >
            {diceSeries.length >= MAX_DICE_SERIES
              ? "Nombre maximal de séries (5) atteint"
              : rolling3D
              ? "Série 3D en cours…"
              : diceSeries.length === 0
              ? "Démarrer une première série 3D (3d6 par stat)"
              : "Démarrer une nouvelle série 3D (3d6 par stat)"}
          </button>

          <p className="dice-hint">
            En mode 3D, on lance les dés <strong>stat par stat</strong>. À la
            fin, tu sélectionnes la série et tu confirmes.
          </p>

          {rolling3D && (
            <div style={{ marginTop: "0.75rem" }}>
              <div
                style={{
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                  opacity: 0.9,
                }}
              >
                Stat en cours : <strong>{stats[rollingStatIndex]?.label}</strong>
              </div>
              <Dice3D notation="3d6" height={240} onRoll={handle3DRoll} />
            </div>
          )}
        </>
      )}

      {/* Liste des séries */}
      <div className="dice-series-list">
        {diceSeries.map((series, index) => {
          const perStat = stats.map((stat) => {
            const rolls = series.rollsByStat?.[stat.id];
            const total = rolls ? rolls.reduce((sum, v) => sum + v, 0) : null;
            return { label: stat.label, total };
          });

          const grandTotal = perStat.reduce(
            (sum, s) => sum + (s.total ?? 0),
            0
          );

          const isSelected = selectedSeriesId === series.id;

          return (
            <div
              key={series.id}
              className={"dice-series" + (isSelected ? " dice-series--active" : "")}
            >
              <div className="dice-series-header">
                <span className="dice-series-title">Jet {index + 1}</span>
                <span className="dice-series-total">Total : {grandTotal}</span>
              </div>

              <div className="dice-series-stats-line">
                {perStat.map((s) => (
                  <span key={s.label} className="dice-series-stat">
                    {s.label}: {s.total ?? "—"}
                  </span>
                ))}
              </div>

              {/* ✅ Sélection uniquement (ne déclenche PAS l’application) */}
              <button
                type="button"
                className="dice-series-choose"
                onClick={() => setSelectedSeriesId(series.id)}
                disabled={isSelected}
              >
                {isSelected ? "Jet sélectionné" : "Sélectionner ce jet"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Détails de la série sélectionnée (ou preview 3D en cours) */}
      {(activeSeries || rolling3D) && (
        <div className="dice-results">
          {stats.map((stat) => {
            const rolls = shownRollsByStat?.[stat.id];
            if (!rolls) return null;

            const total = rolls.reduce((sum, v) => sum + v, 0);

            const showSymbols =
              rolls.length === 3 &&
              rolls.every((n) => typeof n === "number" && n >= 1 && n <= 6);

            return (
              <div key={stat.id} className="dice-row">
                <span className="dice-stat-label">{stat.label}</span>

                <span className="dice-symbols">
                  {showSymbols
                    ? `${DICE_SYMBOLS[rolls[0]]} ${DICE_SYMBOLS[rolls[1]]} ${DICE_SYMBOLS[rolls[2]]}`
                    : "🎲"}
                </span>

                <span className="dice-total">= {total}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
