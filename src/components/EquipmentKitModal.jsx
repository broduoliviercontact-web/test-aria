// src/components/EquipmentKitModal.jsx
import React, { useState } from "react";
import { EQUIPMENT_KITS } from "../data/equipmentKits";
import "./equipmentKitModal.css";

const EquipmentKitModal = ({ isOpen, onClose, onConfirm, initialKitId }) => {
  const [selectedKitId, setSelectedKitId] = useState(initialKitId || null);
  const [combattantWeaponChoice, setCombattantWeaponChoice] = useState(null); // "twoOneHand" | "twoHand"
  const [eruditChoice, setEruditChoice] = useState(null); // "fioles" | "sablier"

  if (!isOpen) return null;

  const handleConfirm = () => {
    const kit = EQUIPMENT_KITS.find((k) => k.id === selectedKitId);
    if (!kit) return;

    onConfirm(kit, {
      combattantWeaponChoice,
      eruditChoice,
    });
  };

  const isCombattantSelected = selectedKitId === "combattant";
  const isEruditSelected = selectedKitId === "erudit";

  const isConfirmDisabled =
    !selectedKitId ||
    (isCombattantSelected && !combattantWeaponChoice) ||
    (isEruditSelected && !eruditChoice);

  return (
    <div className="kit-modal-backdrop">
      <div className="kit-modal">
        <div className="kit-modal-header">
          <h2 className="kit-modal-title">Choisir un kit d&apos;équipement</h2>
          <button className="kit-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="kit-modal-body">
          <div className="kit-list">
            {EQUIPMENT_KITS.map((kit) => {
  const isSelected = kit.id === selectedKitId;
  const isCombattantKit = kit.id === "combattant";
  const isEruditKit = kit.id === "erudit";

  return (
    <div
      key={kit.id}
      className={
        "kit-card" + (isSelected ? " kit-card--selected" : "")
      }
      onClick={() => setSelectedKitId(kit.id)}
    >
      {/* 🔹 4 coins décoratifs */}
      <span className="kit-card-corner kit-card-corner--tl">•</span>
      <span className="kit-card-corner kit-card-corner--tr">•</span>
      <span className="kit-card-corner kit-card-corner--bl">•</span>
      <span className="kit-card-corner kit-card-corner--br">•</span>

      <div className="kit-card-inner">
        <div className="kit-card-header">
          <div className="kit-card-title">{kit.name}</div>
          <div className="kit-card-cost">{kit.cost} or</div>
        </div>

        <div className="kit-card-body">
          <ul className="kit-card-items">
            {kit.content.map((item, index) => (
              <li key={index} className="kit-card-item">
                {item}
              </li>
            ))}
          </ul>

          {/* tes options spéciales (combattant / érudit) ici */}
          {isCombattantKit && (
            <div
              className="kit-card-options"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="kit-card-options-label">
                Configuration des armes :
              </p>
              <div className="kit-switch-row">
                <span className="kit-switch-label">2 armes à une main</span>
                <button
                  type="button"
                  className={
                    "kit-mode-switch" +
                    (combattantWeaponChoice === "twoHand"
                      ? " kit-mode-switch--right"
                      : " kit-mode-switch--left")
                  }
                  onClick={() => {
                    setSelectedKitId("combattant");
                    setCombattantWeaponChoice((prev) =>
                      prev === "twoHand" ? "twoOneHand" : "twoHand"
                    );
                  }}
                >
                  <span className="kit-mode-switch-thumb" />
                </button>
                <span className="kit-switch-label">1 arme à deux mains</span>
              </div>
            </div>
          )}

          {isEruditKit && (
            <div
              className="kit-card-options"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="kit-card-options-label">
                Choix de l&apos;objet :
              </p>
              <div className="kit-switch-row">
                <span className="kit-switch-label">Fioles (x5)</span>
                <button
                  type="button"
                  className={
                    "kit-mode-switch" +
                    (eruditChoice === "sablier"
                      ? " kit-mode-switch--right"
                      : " kit-mode-switch--left")
                  }
                  onClick={() => {
                    setSelectedKitId("erudit");
                    setEruditChoice((prev) =>
                      prev === "sablier" ? "fioles" : "sablier"
                    );
                  }}
                >
                  <span className="kit-mode-switch-thumb" />
                </button>
                <span className="kit-switch-label">Sablier</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
})}


          </div>
        </div>

        <div className="kit-modal-footer">
          <button className="kit-secondary-btn" onClick={onClose}>
            Annuler
          </button>
          <button
            className="kit-primary-btn"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            Valider ce kit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentKitModal;
