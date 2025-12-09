// src/components/WeaponList.jsx
import React from "react";
import "./WeaponList.css";
import { weaponIcons } from "../bladeIcons"; // ⬅️ on importe la liste complète

export default function WeaponList({ weapons, onChange }) {
  // On crée une copie triée par label (ordre alphabétique FR)
  const sortedWeaponIcons = [...weaponIcons].sort((a, b) =>
    a.label.localeCompare(b.label, "fr", { sensitivity: "base" })
  );

  const defaultIcon = sortedWeaponIcons[0]?.url ?? "";

  const updateWeapon = (index, key, value) => {
    const copy = [...weapons];
    copy[index] = { ...copy[index], [key]: value };
    onChange(copy);
  };

  const addWeapon = () => {
    onChange([
      ...weapons,
      {
        icon: defaultIcon,
        name: "",
        damage: "",
        validated: false,
      },
    ]);
  };

  const removeWeapon = (index) => {
    const copy = weapons.filter((_, i) => i !== index);
    onChange(copy);
  };

  const validateWeapon = (index) => {
    const copy = [...weapons];
    copy[index] = { ...copy[index], validated: true };
    onChange(copy);
  };

  return (
    <section className="weapon-section">
      <h2 className="weapon-title">Armes</h2>

      {weapons.map((weapon, index) => {
        const currentIcon = weapon.icon || defaultIcon;
        const isValidated = !!weapon.validated;

        return (
          <div
            key={index}
            className={`weapon-row ${
              isValidated ? "weapon-row--validated" : ""
            }`}
          >
            {/* Select d'icône : toujours rendu, caché en CSS quand validé */}
            <select
              value={currentIcon}
              onChange={(e) => updateWeapon(index, "icon", e.target.value)}
              className="weapon-icon-select"
            >
              {sortedWeaponIcons.map((icon) => (
                <option key={icon.id} value={icon.url}>
                  {icon.label}
                </option>
              ))}
            </select>

            {/* Aperçu icône */}
            <img
              src={currentIcon}
              alt="Icône d'arme"
              className="weapon-icon-preview"
            />

            {/* Nom */}
            <input
              type="text"
              placeholder="Nom de l'arme"
              value={weapon.name || ""}
              onChange={(e) => updateWeapon(index, "name", e.target.value)}
              className="weapon-input"
            />

            {/* Dégâts */}
            <input
              type="text"
              placeholder="Dégâts (ex: 1D6)"
              value={weapon.damage || ""}
              onChange={(e) => updateWeapon(index, "damage", e.target.value)}
              className="weapon-input small"
            />

            {/* Bouton Valider */}
            {!isValidated && (
              <button
                type="button"
                className="weapon-validate"
                onClick={() => validateWeapon(index)}
              >
                ✓
              </button>
            )}

            {/* Supprimer */}
            <button
              type="button"
              className="weapon-delete"
              onClick={() => removeWeapon(index)}
            >
              ✖
            </button>
          </div>
        );
      })}

      <button className="weapon-add" onClick={addWeapon}>
        + Ajouter une arme
      </button>
    </section>
  );
}
