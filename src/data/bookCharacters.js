// src/data/bookCharacters.js

export const bookCharacters = [
  // =========================
  // Niklas Von Trunkel
  // =========================
  {
    id: "book-niklas",
    name: "Niklas Von Trunkel",
    description: "Alchimiste en disgrâce.Niklas doit trouver le «Sceptre Herméneutique», le rapporter à l'université de Kniga et ainsi laver son honneur. Alchimiste étudiant à l'Academie d'alchimie de Kniga, est, selon ses propres dires, l'un des premiers à avoir réussi à transformer du plomb en or. Après quelques célébrations un peu excessives, ses professeurs lui demandent de partir à la recherche d'un sceptre, ce qu'il considère alors comme une ultime épreuve pour affirmer son génie. Il quitte ainsi son pays pour rejoindre le Royaume d'Aria, où il découvrira que son allure et son attitude ne sont pas forcément appréciées des locaux. Il risque de se faire brûler vif alors qu'il fait la rencontre d'Atlan, qui vient à son secours.",
    frontImage: "/cards/600px-Niklas_by_Kayende.jpg",
    backImage: "/cards/niklas-back.png",

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

 phraseGenial: "Un alchimiste brillant, mais instable : ses potions finissent rarement comme prévu.",
  phraseSociete: "Traqué par ses anciens pairs, il se vend au plus offrant pour retrouver sa place.",

    
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
    description: "Gladiatrice mise à prix. Kaitra veut trouver la gloire et la fortune, tout en espérant oublier son passé. Kaitra veut trouver la gloire et la fortune Née d'une famille très pauvre dans la cité d'Ashanul, elle a été vendue par ses parents et devint une esclave destinée à périr dans une arène. Malgré son petit gabarit, elle se découvre un don pour le combat. Elle survit dans l'arène et devient une gladiatrice expérimentée, en témoignent ses cicatrices. Elle voyage alors un peu et se rend à Irem, attirée par la rumeur d'un certain trésor. La chasse au trésor échoue et Kaitra se fait arrêter par les gardes du sultan. Elle réussit néanmoins à s'échapper et après avoir pu quitter le sultanat d'Aqabah, elle finit par rencontrer Atlan, Niklas et Clodomir alors qu'ils se font attaquer par des bandits dans une forêt. Elle les aident à s'en sortir et décide de rejoindre le groupe.",
    frontImage: "/cards/600px-Kaitra_by_Kayende.jpg",
    backImage: "/cards/keitra-back.png",

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


 phraseGenial: "Je suis une gladiatrice très connue...",
  phraseSociete: "Je suis recherchée.",





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
    description: "Noble en exil. Atlan veut découvrir son origine. Né dans une famille noble, il est en fuite depuis 5 ans après que Zlasko, son valet, l'ait averti qu'une organisation voulait attenter à sa vie. Pris de court, il n'a pu emporter avec lui qu'une dague portant un étrange symbole sur la poignée de cette dernière. Il fait la rencontre de Niklas alors que celui ci était acculé par des villageois et sur le point d'être brûlé comme on brûlerait des sorcières. Atlan prend la défense de l'inconnu et lui sauve la vie. Par la suite, ils essaieront tout les deux de vendre les potions confectionnées par Niklas au fil de leurs voyages.",
    frontImage: "/cards/600px-Atlan_by_Kayende.jpg",
    backImage: "/cards/atla-back.png",

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

 phraseGenial: "Je suis un noble beau parleur.",
  phraseSociete: "Je vis en exil à la suite de la perte de mers titres et de mes biens.",


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
    description: "Magicien illicite. Clodomir recherche son maître de magie après avoir fait un voyage initiatique d'un an, et cherche à devenir sorcier à part entière. Clodomir est un jeune homme frêle, peu assuré, avec le teint pâle. Il rencontre Atlan et Niklas lors de son voyage alors qu'ils tentent de vendre des potions pour se faire de l'argent. Il est un apprenti sorcier au début de l'aventure, disciple non officiel de Melanda.",
    frontImage: "/cards/600px-Clodomir_by_Kayende.jpg",
    backImage: "/cards/clodomir-back.png",

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

 phraseGenial: "Je suis un magicien premietteur.",
  phraseSociete: "Je n'ai pas étudié la magie selon les règles.",


    weapons: [{ name: "Bâton", damage: "1d6" }],


  },
];
