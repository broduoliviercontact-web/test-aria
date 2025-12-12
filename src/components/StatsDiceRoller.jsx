import React, { useMemo, useRef, useState } from "react";
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

  const [use3D, setUse3D] = useState(false);

  // 3D build
  const [rolling3D, setRolling3D] = useState(false);
  const [rollingSeriesId, setRollingSeriesId] = useState(null);
  const [rollingStatIndex, setRollingStatIndex] = useState(0);
  const [rollingRollsByStat, setRollingRollsByStat] = useState({});

  // toolbar Dice3D déplacée dans le header
  const dice3DRef = useRef(null);
  const [diceColorMode, setDiceColorMode] = useState("solid"); // solid | gradient

  const nextSeriesId = useMemo(
    () => (diceSeries[diceSeries.length - 1]?.id || 0) + 1,
    [diceSeries]
  );

  const buildStatsFromSeries = (series) =>
    stats.map((stat) => {
      const rolls = series.rollsByStat?.[stat.id];
      if (!rolls) return stat;
      return { ...stat, value: rolls.reduce((s, v) => s + v, 0) };
    });

  const handleConfirmSelectedSeries = () => {
    const series = diceSeries.find((s) => s.id === selectedSeriesId);
    if (!series) return;
    onApplyStats(buildStatsFromSeries(series));
  };

  // 2D
  const handleRollNewSeriesClassic = () => {
    if (diceSeries.length >= MAX_DICE_SERIES) return;
    const rollsByStat = {};
    stats.forEach((s) => (rollsByStat[s.id] = [rollD6(), rollD6(), rollD6()]));
    const series = { id: nextSeriesId, rollsByStat };
    setDiceSeries((p) => [...p, series]);
    setSelectedSeriesId(series.id);
  };

  // 3D
  const handleStart3DSeries = () => {
    if (rolling3D || diceSeries.length >= MAX_DICE_SERIES) return;
    setRolling3D(true);
    setRollingSeriesId(nextSeriesId);
    setRollingStatIndex(0);
    setRollingRollsByStat({});
    setSelectedSeriesId(nextSeriesId);
  };

  const handle3DRoll = ({ total, rolls }) => {
    if (!rolling3D) return;

    const stat = stats[rollingStatIndex];
    const values = Array.isArray(rolls) && rolls.length ? rolls : [total];

    const next = { ...rollingRollsByStat, [stat.id]: values };
    setRollingRollsByStat(next);

    if (rollingStatIndex + 1 >= stats.length) {
      const completed = { id: rollingSeriesId, rollsByStat: next };
      setDiceSeries((p) => [...p, completed]);

      setRolling3D(false);
      setRollingStatIndex(0);
      setRollingRollsByStat({});
      setSelectedSeriesId(completed.id);
      return;
    }

    setRollingStatIndex((i) => i + 1);
  };

  const activeSeries = diceSeries.find((s) => s.id === selectedSeriesId);
  const shownRollsByStat = rolling3D
    ? rollingRollsByStat
    : activeSeries?.rollsByStat || {};

  const onLaunch3D = () => {
    dice3DRef.current?.roll?.();
  };

  return (
    <section className="stats-dice-roller">
      {/* ✅ Header unique */}
 <div className="stats-dice-roller__header">
  <button
    type="button"
    className="btn-primary"
    disabled={!activeSeries || rolling3D}
    onClick={handleConfirmSelectedSeries}
  >
    Confirmer ce jet
  </button>

  {use3D && rolling3D ? (
    <div className="stats-dice-roller__diceToolbar">
      <button type="button" className="btn-primary" onClick={onLaunch3D}>
        🎲 Lancer 3d6 (3D)
      </button>


    </div>
  ) : null}

  {/* ✅ ligne du switch en dessous */}
  <div className="stats-dice-roller__switchRow">
    <label className="ui-checkbox">
      <input
        className="ui-checkbox__input"
        type="checkbox"
        checked={use3D}
        onChange={(e) => {
          const checked = e.target.checked;
          setUse3D(checked);

          if (!checked && rolling3D) {
            setRolling3D(false);
            setRollingSeriesId(null);
            setRollingStatIndex(0);
            setRollingRollsByStat({});
          }
        }}
      />

      <span className="ui-checkbox__box" aria-hidden="true">
        <svg className="ui-checkbox__tick" viewBox="0 0 24 24">
          <path
            d="M20 6L9 17l-5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span className="ui-checkbox__label">Utiliser les dés 3D</span>
    </label>
  </div>
</div>




      {/* 2D */}
      {!use3D ? (
        <>
          <button className="dice-button" onClick={handleRollNewSeriesClassic}>
            Lancer une série de 3d6
          </button>
          <p className="dice-hint">
            Lance jusqu’à 5 séries, choisis-en une, puis confirme.
          </p>
        </>
      ) : (
        <>
          {/* ✅ Le bouton “démarrer” disparaît une fois rolling3D === true */}
          {!rolling3D ? (
            <button className="dice-button" onClick={handleStart3DSeries}>
              Démarrer une série 3D
            </button>
          ) : (
            <div className="stats-dice-roller__threeDPanel">
              <div className="stats-dice-roller__currentStat">
                Stat en cours : <strong>{stats[rollingStatIndex]?.label}</strong>
              </div>

              {/* ✅ canvas only, toolbar déplacée dans le header */}
              <Dice3D
                ref={dice3DRef}
                notation="3d6"
                height={340}
                onRoll={handle3DRoll}
                hideToolbar={true}
                colorMode={diceColorMode}
                onChangeColorMode={setDiceColorMode}
              />
            </div>
          )}
        </>
      )}

      {/* ✅ Séries + résultats */}
      <div className="dice-series-list">
        {diceSeries.map((series, index) => {
          const perStat = stats.map((stat) => {
            const rolls = series.rollsByStat?.[stat.id];
            const total = rolls ? rolls.reduce((sum, v) => sum + v, 0) : null;
            return { label: stat.label, total };
          });

          const grandTotal = perStat.reduce((sum, s) => sum + (s.total ?? 0), 0);
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

      {/* Détails de la série sélectionnée */}
      {(activeSeries || rolling3D) && (
        <div className="dice-results">
          {stats.map((stat) => {
            const rolls = shownRollsByStat[stat.id];
            if (!rolls) return null;

            const total = rolls.reduce((a, b) => a + b, 0);

            const showSymbols =
              rolls.length === 3 &&
              rolls.every((n) => typeof n === "number" && n >= 1 && n <= 6);

            return (
              <div key={stat.id} className="dice-row">
                <span className="dice-stat-label">{stat.label}</span>
                <span className="dice-symbols">
                  {showSymbols ? rolls.map((r) => DICE_SYMBOLS[r]).join(" ") : "🎲"}
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
