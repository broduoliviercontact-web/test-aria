import React, { useState } from "react";
import "./Inventory.css";

/* ===========================
   ICONES PAR CATEGORIE
   =========================== */

// Packs principaux
import ecritureIcon from "./assets/inventory/ecriture-connaissance.svg";
import nourritureIcon from "./assets/inventory/nourriture-rations.svg";
import alchimieIcon from "./assets/inventory/alchimie-potions.svg";
import contenantsIcon from "./assets/inventory/contenants-bagagerie.svg";
import armuresIcon from "./assets/inventory/armures-protection.svg";
import materielIcon from "./assets/inventory/materiel-divers.svg";
import magiquesIcon from "./assets/inventory/objets-magiques-religieux.svg";
import vetementsIcon from "./assets/inventory/vetements-deguisements.svg";
import survieIcon from "./assets/inventory/survie-aventure.svg";
import valeurIcon from "./assets/inventory/valeur-commerce.svg";
import outilsIcon from "./assets/inventory/outils-artisanat.svg";

// Nouvelles catégories
import clesIcon from "./assets/inventory/cles-serrures.svg";
import cartesIcon from "./assets/inventory/cartes-navigation.svg";
import musicIcon from "./assets/inventory/music.svg";
import artisanatIcon from "./assets/inventory/artisanat-metiers.svg";
import tropheesIcon from "./assets/inventory/trophees-souvenirs.svg";
import animauxIcon from "./assets/inventory/animaux-montures.svg";
import poisonsIcon from "./assets/inventory/poisons-substancesdangereuses.svg";
import rituelsIcon from "./assets/inventory/rituels-occulte.svg";

// Dernier pack ajouté
import factionsIcon from "./assets/inventory/factions-organisations.svg";
import minesIcon from "./assets/inventory/mines.svg";
import forgeIcon from "./assets/inventory/forge.svg";
import machineIcon from "./assets/inventory/machine.svg";
import natureIcon from "./assets/inventory/nature-plantes.svg";

/* ===========================
   TABLE DE MAPPING ICONS
   =========================== */

const INVENTORY_CATEGORY_ICONS = {
  ecriture: ecritureIcon,
  nourriture: nourritureIcon,
  alchimie: alchimieIcon,
  contenants: contenantsIcon,
  armures: armuresIcon,
  materiel: materielIcon,
  magiques: magiquesIcon,
  vetements: vetementsIcon,
  survie: survieIcon,
  valeur: valeurIcon,
  outils: outilsIcon,

  cles: clesIcon,
  cartes: cartesIcon,
  musique: musicIcon,
  artisanat: artisanatIcon,
  trophees: tropheesIcon,
  animaux: animauxIcon,
  poisons: poisonsIcon,
  rituels: rituelsIcon,

  factions: factionsIcon,
  mines: minesIcon,
  forge: forgeIcon,
  machine: machineIcon,
  nature: natureIcon,
};

/* ===========================
   LABELS POUR LE MENU
   =========================== */

const INVENTORY_CATEGORY_LABELS = {
  ecriture: "Écriture & Connaissance",
  nourriture: "Nourriture & Rations",
  alchimie: "Alchimie & Potions",
  contenants: "Contenants & Bagagerie",
  armures: "Armures & Protection",
  materiel: "Matériel divers",
  magiques: "Objets magiques / religieux",
  vetements: "Vêtements & Déguisements",
  survie: "Survie & Aventure",
  valeur: "Valeur & Commerce",
  outils: "Outils & Artisanat",

  cles: "Clés & Serrures",
  cartes: "Cartes & Navigation",
  musique: "Musique / Jeux",
  artisanat: "Artisanat & Métiers",
  trophees: "Trophées & Souvenirs",
  animaux: "Animaux & Montures",
  poisons: "Poisons & Substances",
  rituels: "Rituels & Occulte",

  factions: "Factions & Organisations",
  mines: "Mines & Minéraux",
  forge: "Forge & Métallurgie",
  machine: "Machines & Ingénierie",
  nature: "Nature & Plantes",
};

/* ===========================
   DETECTION AUTOMATIQUE
   =========================== */

function getCategoryFromName(name) {
  if (!name) return null;
  const n = name.toLowerCase();

  // --- Nouvelles catégories ---
  if (n.match(/clé|cle|serrure|cadenas|verrou|crochetage|passe-partout/)) return "cles";

  if (n.match(/carte|plan|navigation|itinéraire|itineraire|boussole/)) return "cartes";

  if (n.match(/luth|fl[uû]te|tambour|instrument|musique|dés|des|jeu/)) return "musique";

  if (n.match(/forge|forgeron|acier|métallurgie|lingot|tenaille|enclume/)) return "forge";

  if (n.match(/mines?|minerai|roche|pierre|gemme|cristal|charbon/)) return "mines";

  if (n.match(/machine|engin|m[ée]canisme|rouage|engrenage|automate/)) return "machine";

  if (n.match(/trophée|trophee|souvenir|dent|griffe|peau|os/)) return "trophees";

  if (n.match(/herbe|plante|fleur|champignon|racine|[ée]corce|feuille/)) return "nature";

  if (n.match(/poison|toxine|venin|fumigène|fumigene|dangereux/)) return "poisons";

  if (n.match(/rituel|cercle magique|encens|bougie|pentacle/)) return "rituels";

  if (n.match(/insigne|blason|emblème|guilde|ordre|famille|noble/)) return "factions";

  // --- Catégories existantes ---
  if (n.match(/ration|pain|viande|nourriture|bouteille|vin|gourde|épice|epice/)) return "nourriture";

  if (n.match(/potion|fiole|fioles|cataplasme|herbe|eau-de-vie|eau de vie/)) return "alchimie";

  if (n.match(/parchemin|papier|feuille|livre|grimoire|plume|encre|journal|notes/)) return "ecriture";

  if (n.match(/sac|sacoche|malle|bourse|gibecière|gibeciere|escarcelle|timbale|écuelle|ecuelle/))
    return "contenants";

  if (n.match(/armure|bouclier|casque|plastron|cotte de mailles/)) return "armures";

  if (n.match(/icône|icone|relique|amulette|talisman|divin|prière|priere/)) return "magiques";

  if (n.match(/d[ée]guisement|foulard|cape|robe|manteau|costume/)) return "vetements";

  if (n.match(/tente|couverture|lanterne|torche|corde|hamac|couchage/)) return "survie";

  if (n.match(/bijou|bijoux|or|pi[eè]ce|verroterie|gemme|joyau/)) return "valeur";

  return "materiel";
}

/* ===========================
   FACTORY D’OBJET
   =========================== */

function createEmptyItem() {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    name: "",
    quantity: 1,
    category: null,
  };
}

/* ===========================
   COMPONENT
   =========================== */

export default function Inventory({ items, onChange }) {
  const [openIconPickerId, setOpenIconPickerId] = useState(null);

  const handleItemChange = (id, field, value) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newItems);
  };

  const handleCategoryChange = (id, categoryKey) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, category: categoryKey } : item
    );
    onChange(newItems);
  };

  const handleAddItem = () => onChange([...items, createEmptyItem()]);

  const handleRemoveItem = (id) => onChange(items.filter((i) => i.id !== id));

  const toggleIconPicker = (id) =>
    setOpenIconPickerId((open) => (open === id ? null : id));

  return (
    <section className="inventory-card">
      <h2 className="inventory-title">Inventaire</h2>

      {items.length === 0 && (
        <p className="inventory-empty">Aucun objet pour l’instant.</p>
      )}

      {items.map((item) => {
        const auto = getCategoryFromName(item.name);
        const category = item.category || auto;
        const icon = INVENTORY_CATEGORY_ICONS[category];
        const isOpen = openIconPickerId === item.id;

        return (
          <div key={item.id} className="inventory-row">
            {/* Icône cliquable */}
            <div className="inventory-icon-cell">
              <button
                type="button"
                className="inventory-icon-button"
                onClick={() => toggleIconPicker(item.id)}
              >
                {icon ? (
                  <img src={icon} alt="icon" className="inventory-item-icon" />
                ) : (
                  <span className="inventory-icon-placeholder">?</span>
                )}
              </button>

              {/* Menu déroulant */}
              {isOpen && (
                <div className="inventory-icon-menu">
                  {Object.entries(INVENTORY_CATEGORY_ICONS).map(
                    ([key, src]) => (
                      <button
                        key={key}
                        type="button"
                        className="inventory-icon-menu-item"
                        onClick={() => {
                          handleCategoryChange(item.id, key);
                          setOpenIconPickerId(null);
                        }}
                      >
                        <img
                          src={src}
                          alt={key}
                          className="inventory-icon-menu-image"
                        />
                        <span className="inventory-icon-menu-label">
                          {INVENTORY_CATEGORY_LABELS[key]}
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Nom */}
            <input
              className="inventory-name"
              type="text"
              value={item.name}
              placeholder="Nom de l’objet"
              onChange={(e) =>
                handleItemChange(item.id, "name", e.target.value)
              }
            />

            {/* Quantité */}
            <input
              className="inventory-qty"
              type="number"
              min="0"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(item.id, "quantity", Number(e.target.value))
              }
            />

            {/* Supprimer */}
            <button
              type="button"
              className="inventory-delete"
              onClick={() => handleRemoveItem(item.id)}
            >
              ✕
            </button>
          </div>
        );
      })}

      {/* Ajouter */}
      <button type="button" className="inventory-add" onClick={handleAddItem}>
        + Ajouter un objet
      </button>
    </section>
  );
}
