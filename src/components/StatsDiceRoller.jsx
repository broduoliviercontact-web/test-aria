import React, { useState } from "react";
import "./StatsDiceRoller.css";


const DICE_SYMBOLS = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const MAX_DICE_SERIES = 5;

function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

export default function StatsDiceRoller({ stats, onApplyStats }) {
  const [diceSeries, setDiceSeries] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState(null);

  const handleRollNewSeries = () => {
    if (diceSeries.length >= MAX_DICE_SERIES) return;

    const rollsByStat = {};
    stats.forEach((stat) => {
      const d1 = rollD6();
      const d2 = rollD6();
      const d3 = rollD6();
      rollsByStat[stat.id] = [d1, d2, d3];
    });

    const newSeries = {
      id: (diceSeries[diceSeries.length - 1]?.id || 0) + 1,
      rollsByStat,
    };

    setDiceSeries((prev) => [...prev, newSeries]);
    setSelectedSeriesId(newSeries.id);
  };

  const handleChooseSeries = (seriesId) => {
    const series = diceSeries.find((s) => s.id === seriesId);
    if (!series) return;

    const newStats = stats.map((stat) => {
      const rolls = series.rollsByStat[stat.id];
      if (!rolls) return stat;
      const total = rolls.reduce((sum, v) => sum + v, 0);
      return { ...stat, value: total };
    });

    setSelectedSeriesId(seriesId);
    onApplyStats(newStats);
  };

  const activeSeries =
    diceSeries.find((s) => s.id === selectedSeriesId) || diceSeries[0] || null;
  const activeRollsByStat = activeSeries?.rollsByStat || {};

  return (
    <section className="stats-dice-roller">
      <button
        type="button"
        className="dice-button"
        onClick={handleRollNewSeries}
        disabled={diceSeries.length >= MAX_DICE_SERIES}
      >
        {diceSeries.length >= MAX_DICE_SERIES
          ? "Nombre maximal de séries (5) atteint"
          : diceSeries.length === 0
          ? "Lancer une première série de 3d6"
          : "Lancer une nouvelle série de 3d6"}
      </button>

      <p className="dice-hint">
        Vous pouvez lancer jusqu&apos;à 5 séries complètes de 3d6 pour vos
        caractéristiques, puis choisir laquelle appliquer à votre personnage.
      </p>

      {/* Liste des séries */}
      <div className="dice-series-list">
        {diceSeries.map((series, index) => {
          const perStat = stats.map((stat) => {
            const rolls = series.rollsByStat[stat.id];
            const total = rolls
              ? rolls.reduce((sum, v) => sum + v, 0)
              : null;
            return { label: stat.label, total };
          });

          const grandTotal = perStat.reduce(
            (sum, s) => sum + (s.total ?? 0),
            0
          );

          const isActive = selectedSeriesId === series.id;

          return (
            <div
              key={series.id}
              className={
                "dice-series" + (isActive ? " dice-series--active" : "")
              }
            >
              <div className="dice-series-header">
                <span className="dice-series-title">
                  Jet {index + 1}
                </span>
                <span className="dice-series-total">
                  Total : {grandTotal}
                </span>
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
                onClick={() => handleChooseSeries(series.id)}
                disabled={isActive}
              >
                {isActive ? "Jet sélectionné" : "Utiliser ce jet"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Détails des dés pour la série active */}
      {activeSeries && (
        <div className="dice-results">
          {stats.map((stat) => {
            const rolls = activeRollsByStat[stat.id];
            if (!rolls) return null;
            const [d1, d2, d3] = rolls;
            const total = d1 + d2 + d3;

            return (
              <div key={stat.id} className="dice-row">
                <span className="dice-stat-label">{stat.label}</span>
                <span className="dice-symbols">
                  {DICE_SYMBOLS[d1]} {DICE_SYMBOLS[d2]} {DICE_SYMBOLS[d3]}
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
