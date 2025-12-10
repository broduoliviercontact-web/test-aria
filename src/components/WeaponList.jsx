// src/components/WeaponList.jsx
import React, { useState } from "react";
import "./WeaponList.css";
import { weaponIcons } from "../bladeIcons";

export default function WeaponList({ weapons, onChange }) {
  // Tri alphabétique FR
  const sortedWeaponIcons = [...weaponIcons].sort((a, b) =>
    a.label.localeCompare(b.label, "fr", { sensitivity: "base" })
  );

  const defaultIcon = sortedWeaponIcons[0]?.url ?? "";
  const [openPickerIndex, setOpenPickerIndex] = useState(null);

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

  const toggleIconPicker = (index) => {
    setOpenPickerIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="weapon-section">
      <h2 className="weapon-title">Armes</h2>

      {weapons.map((weapon, index) => {
        const currentIcon = weapon.icon || defaultIcon;
        const isValidated = !!weapon.validated;
        const isPickerOpen = openPickerIndex === index;

        return (
          <div
            key={index}
            className={`weapon-row ${
              isValidated ? "weapon-row--validated" : ""
            }`}
          >
            {/* Bloc icône = médaillon + menu déroulant personnalisé */}
            <div className="weapon-icon-block">
              <button
                type="button"
                className="weapon-icon-button"
                onClick={() => !isValidated && toggleIconPicker(index)}
              >
                <div className="weapon-icon-frame">
                  <img
                    src={currentIcon}
                    alt="Icône d'arme"
                    className="weapon-icon-preview"
                  />
                </div>
              </button>

              {!isValidated && isPickerOpen && (
                <div className="weapon-icon-picker">
                  {sortedWeaponIcons.map((icon) => {
  const isSelected = icon.url === (weapon.icon || defaultIcon);

  return (
    <button
      key={icon.id}
      type="button"
      className={
        "weapon-icon-picker-item" +
        (isSelected ? " weapon-icon-picker-item--selected" : "")
      }
      onClick={() => {
        updateWeapon(index, "icon", icon.url);
        setOpenPickerIndex(null);
      }}
    >
      <img
        src={icon.url}
        alt={icon.label}
        className="weapon-icon-picker-image"
      />
      <span className="weapon-icon-picker-label">
        {icon.label}
      </span>
    </button>
  );
})}

                </div>
              )}
            </div>

            {/* Bloc principal : nom + dégâts */}
            <div className="weapon-main">
              <input
                type="text"
                placeholder="Nom de l'arme"
                value={weapon.name || ""}
                onChange={(e) => updateWeapon(index, "name", e.target.value)}
                className="weapon-input weapon-name-input"
              />

              <input
                type="text"
                placeholder="Dégâts (ex : 1D6)"
                value={weapon.damage || ""}
                onChange={(e) => updateWeapon(index, "damage", e.target.value)}
                className="weapon-input weapon-damage-input"
              />
            </div>

            {/* Boutons à droite */}
            <div className="weapon-actions">
              {!isValidated && (
                <button
                  type="button"
                  className="weapon-validate"
                  onClick={() => validateWeapon(index)}
                >
                  ✓
                </button>
              )}

              <button
                type="button"
                className="weapon-delete"
                onClick={() => removeWeapon(index)}
              >
                ✖
              </button>
            </div>
          </div>
        );
      })}

      <button className="weapon-add" onClick={addWeapon}>
        + Ajouter une arme
      </button>
    </section>
  );
}
