import React from "react";
import "./Inventory.css";   // ⬅⬅⬅ ajouter cette ligne

function createEmptyItem() {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    name: "",
    quantity: 1,
  };
}

export default function Inventory({ items, onChange }) {
  const handleItemChange = (id, field, value) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newItems);
  };

  const handleAddItem = () => {
    onChange([...items, createEmptyItem()]);
  };

  const handleRemoveItem = (id) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <section className="inventory-card">
      <h2 className="inventory-title">Inventaire</h2>

      {items.length === 0 && (
        <p className="inventory-empty">Aucun objet pour l’instant.</p>
      )}

      {items.map((item) => (
        <div key={item.id} className="inventory-row">
          <input
            className="inventory-name"
            type="text"
            placeholder="Nom de l’objet"
            value={item.name}
            onChange={(e) =>
              handleItemChange(item.id, "name", e.target.value)
            }
          />
          <input
            className="inventory-qty"
            type="number"
            min="0"
            value={item.quantity}
            onChange={(e) =>
              handleItemChange(item.id, "quantity", Number(e.target.value))
            }
          />
          <button
            type="button"
            className="inventory-delete"
            onClick={() => handleRemoveItem(item.id)}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        className="inventory-add"
        onClick={handleAddItem}
      >
        + Ajouter un objet
      </button>
    </section>
  );
}
