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

// Autres catégories
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

// ✅ Ajouts
import bijouIcon from "./assets/inventory/bijou.svg";
import soinIcon from "./assets/inventory/soin-medecin.svg";
import piegeSurvieIcon from "./assets/inventory/piege-survie.svg";

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

  // ✅ nouveaux
  bijou: bijouIcon,
  soin: soinIcon,
  pieges: piegeSurvieIcon,
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

  // ✅ nouveaux
  bijou: "Bijoux & Pierres précieuses",
  soin: "Médicaments & Soins",
  pieges: "Pièges & Survie",
};

/* ===========================
   DETECTION AUTOMATIQUE
   =========================== */

function getCategoryFromName(name) {
  if (!name) return null;
  const n = name.toLowerCase();

  // 🎭 Déguisement
  if (n.match(/d[ée]guisement|postiche|costume/)) return "vetements";

  // 🎟️ Laisser-passer
  if (n.match(/laisser[- ]?passer|laissez[- ]?passer|pass[- ]?pass|autorisation|permis/))
    return "factions";

  // 💎 Bijoux
  if (n.match(/bijou|bijoux|bague|anneau|collier|pendentif|bracelet|broche|gemme|joyau/))
    return "bijou";

  // 🩹 Soins / Médicaments
  if (
    n.match(
      /soin|m[ée]dicament|medicament|m[ée]decin|medecin|bandage|pansement|compresse|onguent|baume|pommade|antiseptique|cataplasme|cataplasmes|trousse|pharmacie|kit de soin|premiers secours/
    )
  )
    return "soin";

  // 🪤 Pièges / survie
  if (n.match(/pi[eè]ge|pi[eè]ges|piege|collet|collets|trappe|lacet|lacets|fil de fer|hame[cç]on|app[aâ]t/))
    return "pieges";

  // Clés / crochetage
  if (n.match(/clé|cle|serrure|cadenas|verrou|crochetage|outils de crochetage|passe-partout/))
    return "cles";

  // Cartes / navigation
  if (n.match(/carte|plan|navigation|itinéraire|itineraire|boussole/)) return "cartes";

  // Musique / jeux
  if (n.match(/luth|fl[uû]te|tambour|instrument|musique|dés|des|jeu/)) return "musique";

  // Forge / mines / machine
  if (n.match(/forge|forgeron|acier|métallurgie|metal|métal|lingot|tenaille|enclume/)) return "forge";
  if (n.match(/mines?|minerai|roche|pierre|cristal|charbon/)) return "mines";
  if (n.match(/machine|engin|m[ée]canisme|rouage|engrenage|automate/)) return "machine";

  // Trophées / nature / poisons / rituels / factions
  if (n.match(/trophée|trophee|souvenir|dent|griffe|peau|os/)) return "trophees";
  if (n.match(/herbe|plante|fleur|champignon|racine|[ée]corce|feuille/)) return "nature";
  if (n.match(/poison|toxine|venin|fumigène|fumigene|dangereux/)) return "poisons";
  if (n.match(/rituel|cercle magique|encens|bougie|pentacle/)) return "rituels";
  if (n.match(/insigne|blason|emblème|embleme|guilde|ordre|famille|noble/)) return "factions";

  // Nourriture / cuisine
  if (n.match(/ration|rations|pain|viande|nourriture|bouteille|vin|gourde|épice|epice|aromate|couverts?|marmite|écuelle|ecuelle|timbale/))
    return "nourriture";

  // Survie (campement)
  if (n.match(/tente|couverture|lanterne|torche|corde|hamac|couchage|sac de couchage|briquet/))
    return "survie";

  // Alchimie
  if (n.match(/potion|fiole|fioles|eau-de-vie|eau de vie/)) return "alchimie";

  // Écriture / papeterie
  if (n.match(/cire [àa] cacheter|cachet|sceau|feuille|feuilles|papier|parchemin|plume|plume d['’]oie|encre|pot d['’]encre|journal|notes/))
    return "ecriture";

  // Contenants / bagagerie
  if (n.match(/sac|sacoche|malle|bourse|gibecière|gibeciere|escarcelle|coffret|bo[îi]te|etui|étui/))
    return "contenants";

  // Armures
  if (n.match(/armure|bouclier|casque|plastron|cotte de mailles/)) return "armures";

  // Magique / religieux
  if (n.match(/icône|icone|relique|amulette|talisman|divin|divine|prière|priere|statuette|pieuse|anneau de prière/))
    return "magiques";

  // Vêtements
  if (n.match(/foulard|cape|robe|manteau/)) return "vetements";

  // Outils / artisanat
  if (n.match(/pierre [àa] aiguiser|aiguiser|outil|outils/)) return "outils";

  // Valeur
  if (n.match(/or|pi[eè]ce|verroterie/)) return "valeur";

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

  // ✅ seulement ces catégories sont "forcées" par l’auto-détection
  const FORCE_AUTO_FOR = new Set(["vetements", "factions"]);

  return (
    <section className="inventory-card">

      <div className="inventory-tititle">

         <img src="/icons/backpack.gif" className="arme1"alt="Armes" />
          <h2 className="inventory-title">Inventaire</h2>
           <img src="/icons/backpack.gif" className="arme1"alt="Armes" />
          </div>
  

      {items.length === 0 && (
        <p className="inventory-empty">Aucun objet pour l’instant.</p>
      )}

      {items.map((item) => {
        const autoCategory = getCategoryFromName(item.name);

        // ✅ Fix: on force uniquement certaines catégories,
        // sinon l'utilisateur peut override via item.category.
        const category =
          autoCategory && FORCE_AUTO_FOR.has(autoCategory)
            ? autoCategory
            : item.category || autoCategory;

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
                  {Object.entries(INVENTORY_CATEGORY_ICONS).map(([key, src]) => (
                    <button
                      key={key}
                      type="button"
                      className="inventory-icon-menu-item"
                      onClick={() => {
                        handleCategoryChange(item.id, key);
                        setOpenIconPickerId(null);
                      }}
                    >
                      <img src={src} alt={key} className="inventory-icon-menu-image" />
                      <span className="inventory-icon-menu-label">
                        {INVENTORY_CATEGORY_LABELS[key]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nom */}
            <input
              className="inventory-name"
              type="text"
              value={item.name}
              placeholder="Nom de l’objet"
              onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
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
