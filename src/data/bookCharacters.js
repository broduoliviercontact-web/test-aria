// src/data/bookCharacters.js

export const bookCharacters = [
  // =========================
  // Niklas Von Trunkel
  // =========================
  {
    id: "book-niklas",
    name: "Niklas Von Trunkel",
    description: "Niklas Von Trunkel, alchimiste en disgrâce.",
    frontImage: "/cards/600px-Niklas_by_Kayende.jpg",
    backImage: "/aria-background.webp",

    age: 21,
    profession: "Alchimiste en disgrâce",

    hitPoints: 8,
    wounds: 0,
    armor: 1,

    stats: [
      { id: "FOR", value: 9 },
      { id: "DEX", value: 15 },
      { id: "END", value: 8 },
      { id: "INT", value: 13 },
      { id: "CHA", value: 11 },
    ],
isMage: false,

    competenceOverrides: {
      artisanat: 70,
      combat_rapproche: 30,
      combat_distance: 70,
      connaissance_nature: 70,
      connaissance_secrets: 70,
      courir_sauter: 55,
      discretion: 45,
      droit: 60,
      esquiver: 70,
      intimider: 50,
      lire_ecrire: 70,
      mentir_convaincre: 60,
      perception: 60,
      piloter: 55,
      psychologie: 50,
      reflexes: 50,
      serrures_pieges: 65,
      soigner: 60,
      survie: 70,
      voler: 50,
    },

    specialCompetences: [
      { id: "spec-creer-potion", name: "Créer une potion", score: 100 },
      { id: "spec-identifier-substance", name: "Identifier une substance", score: 60 },
      {
        id: "spec-un-jour-sans-fin",
        name: "Un jour sans fin",
        score: null,
        description:
          "Votre personnage a déjà fait la campagne d’ARIA une première fois et en connaît une part des rouages...",
      },
    ],

    isAlchemist: true,

    inventory: [
      { name: "Armure de cuir usée", quantity: 1 },
      { name: "Fiole de potion vide", quantity: 1 },
    ],

    weapons: [{ name: "Poings", damage: "1", iconId: "fist" }],
  },

  // =========================
  // Keitra
  // =========================
  {
    id: "book-kaitra",
    name: "Keitra",
    description: "Keitra, gladiatrice mise à prix.",
    frontImage: "/cards/600px-Kaitra_by_Kayende.jpg",
    backImage: "/aria-background2.webp",

    age: 20,
    profession: "Gladiatrice mise à prix",

    hitPoints: 13,
    wounds: 0,
    armor: 0,

    stats: [
      { id: "FOR", value: 14 },
      { id: "DEX", value: 13 },
      { id: "END", value: 14 },
      { id: "INT", value: 11 },
      { id: "CHA", value: 11 },
    ],

    competenceOverrides: {
      artisanat: 40,
      combat_rapproche: 75,
      combat_distance: 60,
      connaissance_nature: 40,
      connaissance_secrets: 20,
      courir_sauter: 80,
      discretion: 25,
      droit: 20,
      esquiver: 50,
      intimider: 65,
      lire_ecrire: 30,
      mentir_convaincre: 30,
      perception: 40,
      piloter: 60,
      psychologie: 45,
      reflexes: 70,
      serrures_pieges: 70,
      soigner: 60,
      survie: 40,
      voler: 50,
    },
isMage: false,

    specialCompetences: [
      {
        id: "spec-un-jour-sans-fin",
        name: "Un jour sans fin",
        score: null,
        description:
          "Votre personnage a déjà fait la campagne d’ARIA une première fois et en connaît une part des rouages...",
      },
    ],

    inventory: [{ }],

   weapons: [
      { name: "Sabre croisés", damage: "1d6+1" , iconId: "crossed-sabres" },
      { name: "Sabre croisés", damage: "1d6+1" , iconId: "crossed-sabres" },
   ],
  },

  // =========================
  // Atlan Grethen de Quirk
  // =========================
  {
    id: "book-atlan",
    name: "Atlan Grethen de Quirk",
    description: "Noble en exil.",
    frontImage: "/cards/600px-Atlan_by_Kayende.jpg",
    backImage: "/aria-background.webp",

    age: 22,
    profession: "Noble en exil",

    hitPoints: 13,
    wounds: 0,
    armor: 1,

    stats: [
      { id: "FOR", value: 12 },
      { id: "DEX", value: 11 },
      { id: "END", value: 13 },
      { id: "INT", value: 10 },
      { id: "CHA", value: 13 },
    ],
isMage: false,

    competenceOverrides: {
      artisanat: 40,
      combat_rapproche: 55,
      combat_distance: 50,
      connaissance_nature: 50,
      connaissance_secrets: 55,
      courir_sauter: 60,
      discretion: 40,
      droit: 55,
      esquiver: 50,
      intimider: 60,
      lire_ecrire: 65,
      mentir_convaincre: 75,
      perception: 55,
      piloter: 60,
      psychologie: 65,
      reflexes: 50,
      serrures_pieges: 60,
      soigner: 55,
      survie: 50,
      voler: 40,
    },

    specialCompetences: [
      {
        id: "spec-un-jour-sans-fin",
        name: "Un jour sans fin",
        score: null,
        description:
          "Votre personnage a déjà fait la campagne d’ARIA une première fois et en connaît une part des rouages.",
      },
    ],

    inventory: [
      { name: "Veste de cuir", quantity: 1, category: "armures" },
 
    ],

   weapons: [
  { name: "Rapière", damage: "1d6+1", iconId: "curvy-knife" },
  { name: "Dague au blason mystérieux", damage: "1d4", iconId: "dagger-rose" },
    ],
  },

  // =========================
  // Clodomir de Cuivrechamps
  // =========================
  {
    id: "book-clodomir",
    name: "Clodomir de Cuivrechamps",
    description: "Magicien illicite.",
    frontImage: "/cards/600px-Clodomir_by_Kayende.jpg",
    backImage: "/aria-background2.webp",

    age: 24,
    profession: "Magicien illicite",

    hitPoints: 6,
    wounds: 0,
    armor: 0,

    stats: [
      { id: "FOR", value: 8 },
      { id: "DEX", value: 4 },
      { id: "END", value: 6 },
      { id: "INT", value: 15 },
      { id: "CHA", value: 13 },
    ],
    isMage: true,
    competenceOverrides: {
      artisanat: 45,
      combat_rapproche: 40,
      combat_distance: 45,
      connaissance_nature: 45,
      connaissance_secrets: 70,
      courir_sauter: 25,
      discretion: 60,
      droit: 70,
      esquiver: 45,
      intimider: 50,
      lire_ecrire: 70,
      mentir_convaincre: 60,
      perception: 70,
      piloter: 25,
      psychologie: 50,
      reflexes: 45,
      serrures_pieges: 25,
      soigner: 60,
      survie: 55,
      voler: 25,
    },

    specialCompetences: [
      {
        id: "spec-un-jour-sans-fin",
        name: "Un jour sans fin",
        score: null,
        description:
          "Votre personnage a déjà fait la campagne d’ARIA une première fois et en connaît une part des rouages.",
      },
    ],

    inventory: [
   
      { name: "Jeu de cartes complet", quantity: 1, category: "jeux" },
    ],

    weapons: [{ name: "Bâton", damage: "1d6" }],


  },
];
