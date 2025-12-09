// src/components/EquipmentKitModal.jsx
import React, { useState } from "react";
import { EQUIPMENT_KITS } from "../data/equipmentKits";
import "./equipmentKitModal.css";

const EquipmentKitModal = ({ isOpen, onClose, onConfirm, initialKitId }) => {
  const [selectedKitId, setSelectedKitId] = useState(initialKitId || null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const kit = EQUIPMENT_KITS.find((k) => k.id === selectedKitId);
    if (kit) {
      onConfirm(kit);
    }
  };

  return (
    <div className="kit-modal-backdrop">
      <div className="kit-modal">
        <div className="kit-modal-header">
          <h2>Choisir un kit d’équipement</h2>
          <button className="kit-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="kit-modal-body">
          <div className="kit-list">
            {EQUIPMENT_KITS.map((kit) => (
              <div
                key={kit.id}
                className={
                  "kit-card" +
                  (kit.id === selectedKitId ? " kit-card-selected" : "")
                }
                onClick={() => setSelectedKitId(kit.id)}
              >
                <div className="kit-card-header">
                  <h3>{kit.name}</h3>
                  <span className="kit-cost">{kit.cost} orbes</span>
                </div>
                <p className="kit-content-title">Contenu :</p>
                <ul className="kit-content-list">
                  {kit.content.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="kit-modal-footer">
          <button className="kit-secondary-btn" onClick={onClose}>
            Annuler
          </button>
          <button
            className="kit-primary-btn"
            onClick={handleConfirm}
            disabled={!selectedKitId}
          >
            Valider ce kit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentKitModal;
