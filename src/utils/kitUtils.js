// src/utils/kitUtils.js

// Parse "Collets (3)" ou "Cataplasmes (x5)" => { name: "Collets", quantity: 3 }
export function parseKitLine(line) {
  const regex = /\((x?\d+)\)/i; // capture "3", "x5", "X10", etc.
  const match = line.match(regex);

  let quantity = 1;
  let name = line.trim();

  if (match) {
    const raw = match[1]; // "3" ou "x5"
    if (raw.toLowerCase().startsWith("x")) {
      quantity = parseInt(raw.slice(1), 10); // x5 -> 5
    } else {
      quantity = parseInt(raw, 10); // 3 -> 3
    }

    // on enlève le "(3)" ou "(x5)" du nom
    name = line.replace(match[0], "").trim();
  }

  return { name, quantity };
}

// Idem que dans Inventory.jsx, mais réutilisable
export function createInventoryItem(name, quantity = 1) {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(16).slice(2),
    name,
    quantity,
  };
}

// Ajouter ou incrémenter un objet dans l'inventaire
export function addToInventory(inventory, name, quantity) {
  const existing = inventory.find((item) => item.name === name);

  if (existing) {
    return inventory.map((item) =>
      item.id === existing.id
        ? { ...item, quantity: (item.quantity || 0) + quantity }
        : item
    );
  }

  return [...inventory, createInventoryItem(name, quantity)];
}

// Crée un "slot d'arme" pour WeaponList
export function createWeaponSlot(defaultName = "") {
  return {
    icon: "",       // WeaponList mettra l'icône par défaut si c'est vide
    name: defaultName,
    damage: "",
    validated: false,
  };
}

/**
 * Applique un kit à l'inventaire + aux armes
 * @param {object} kit  Un objet de EQUIPMENT_KITS
 * @param {Array} currentInventory  inventaire actuel
 * @param {Array} currentWeapons    armes actuelles
 * @returns {{inventory: Array, weapons: Array}}
 */
export function applyEquipmentKit(kit, currentInventory, currentWeapons) {
  let inventory = [...currentInventory];
  let weapons = [...currentWeapons];

  kit.content.forEach((line) => {
    // Cas spécial : malle du combattant → choix d'armes
    if (kit.id === "combattant" && line.includes("Arme à une main")) {
      const wantsTwoOneHand = window.confirm(
        "Pour la Malle du combattant :\n\n" +
          "OK = 2 armes à une main\n" +
          "Annuler = 1 arme à deux mains"
      );

      if (wantsTwoOneHand) {
        // 2 armes à une main
        weapons.push(createWeaponSlot("Arme à une main"));
        weapons.push(createWeaponSlot("Arme à une main"));
      } else {
        // 1 arme à deux mains
        weapons.push(createWeaponSlot("Arme à deux mains"));
      }

      // On ne met PAS cette ligne dans l'inventaire
      return;
    }

    // Tous les autres items => inventaire
    const { name, quantity } = parseKitLine(line);
    inventory = addToInventory(inventory, name, quantity);
  });

  return { inventory, weapons };
}
