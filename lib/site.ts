// Contenus éditoriaux et réglages du site. Tout le texte modifiable sans toucher aux composants.

export const site = {
  name: "Augustave Paris",
  baseline: "Bijoux d'Auteur",
  description:
    "Augustave Paris, bijoux d'auteur façonnés à la main à Paris. Colliers, sautoirs, bracelets et boucles d'oreilles en petites séries, et créations sur-mesure.",
  instagram: "https://www.instagram.com/augustave.paris/",
  instagramHandle: "@augustave.paris",
  email: "contact@augustave.paris", // à confirmer
  freeShippingFrom: 80, // € — seuil de livraison offerte (à confirmer)
  returnsDays: 14,
  // -10 % sur la première commande : code de réduction Shopify appliqué automatiquement au paiement
  // (Shopify vérifie que c'est bien la première commande de la cliente)
  welcome: { code: "BIENVENUE10", percent: 10 },
  // Google Analytics 4 : identifiant de mesure « G-… » (vide = aucune mesure, aucun bandeau cookies)
  // (public, sans risque dans le code ; NEXT_PUBLIC_GA_ID ou GA_ID le remplacent)
  // ("off" désactive, ex. pour l'aperçu Claude)
  gaId: ((typeof process !== "undefined" && (process.env.NEXT_PUBLIC_GA_ID || process.env.GA_ID)) || "G-G0K628L9D8").replace(/^off$/, ""),
  announcements: [
    "−10 % sur votre première commande",
    "Fait main à Paris, perle après perle",
    "Livraison offerte dès 80 €",
    "Édition Votre Histoire : votre collier sur-mesure",
  ],
};

export const nav = [
  { href: "/maison", label: "L'histoire" },
  { href: "/boutique", label: "Boutique", mega: "boutique" },
  { href: "/collections", label: "Collections", mega: "collections" },
  { href: "/sur-mesure", label: "Sur-mesure" },
  { href: "/atelier", label: "L'atelier" },
];

// Diapositives du héros de l'accueil. Déposer une photo dans public/images/accueil/
// (ex. hero-1.jpg) : elle remplace automatiquement l'illustration.
export const heroSlides = [
  { image: "accueil/hero-1", collection: "la-nacree", label: "La Nacrée" },
  { image: "accueil/hero-2", collection: "bronze", label: "Bronze" },
  { image: "accueil/hero-3", collection: "rouge-love", label: "Rouge Love" },
];

export const promises = [
  { icon: "hand", title: "Fait main à Paris", text: "Chaque bijou est imaginé, monté et contrôlé à la main dans notre atelier." },
  { icon: "spark", title: "Petites séries", text: "Des éditions courtes et des pièces uniques, pour des bijoux qui vous ressemblent." },
  { icon: "box", title: "Écrin offert", text: "Livraison soignée dans un écrin Augustave, offerte dès 80 € d'achat." },
  { icon: "return", title: "Retours 14 jours", text: "Changement d'avis ? Vous disposez de 14 jours pour nous retourner votre bijou." },
];

export const bespokeSteps = [
  { title: "Racontez-nous", text: "Une date, un prénom, une couleur, un souvenir : partagez l'histoire à raconter." },
  { title: "Imaginons ensemble", text: "Nous vous proposons perles, longueurs et pendentifs, avec un croquis." },
  { title: "Façonné pour vous", text: "Votre collier est monté à la main puis livré dans son écrin." },
];

export const infoPages: Record<string, { title: string; intro: string; sections: { h: string; p: string[] }[] }> = {
  "livraison-retours": {
    title: "Livraison & retours",
    intro: "Vos bijoux voyagent avec soin, dans un écrin Augustave.",
    sections: [
      { h: "Délais", p: ["Les pièces en stock sont expédiées sous 2 à 3 jours ouvrés. Les créations sur-mesure sont façonnées sous 2 à 3 semaines."] },
      { h: "Tarifs", p: ["Livraison en France métropolitaine : 4,90 €, offerte dès 80 € d'achat. Europe : 9,90 €."] },
      { h: "Retours", p: ["Vous disposez de 14 jours après réception pour nous retourner un bijou non porté, dans son écrin d'origine. Les créations sur-mesure ne sont ni reprises ni échangées."] },
    ],
  },
  entretien: {
    title: "Entretien de vos bijoux",
    intro: "Quelques gestes simples pour que vos bijoux gardent leur éclat.",
    sections: [
      { h: "Au quotidien", p: ["Retirez vos bijoux avant la douche, la baignade ou le sport. Évitez le contact avec le parfum et les crèmes."] },
      { h: "Rangement", p: ["Rangez chaque pièce séparément, dans son écrin ou sa pochette, à l'abri de la lumière et de l'humidité."] },
      { h: "Nettoyage", p: ["Essuyez délicatement avec un chiffon doux et sec. N'utilisez jamais de produit abrasif."] },
    ],
  },
  cgv: {
    title: "Conditions générales de vente",
    intro: "Texte à compléter avant l'ouverture de la boutique.",
    sections: [{ h: "À rédiger", p: ["Ce contenu provisoire doit être remplacé par les conditions générales de vente définitives (identité du vendeur, prix, paiement, livraison, droit de rétractation, garanties)."] }],
  },
  "mentions-legales": {
    title: "Mentions légales",
    intro: "Texte à compléter avant la mise en ligne.",
    sections: [{ h: "À rédiger", p: ["Éditeur du site, numéro SIRET, hébergeur, directeur de la publication : à renseigner."] }],
  },
  confidentialite: {
    title: "Politique de confidentialité",
    intro: "Texte à compléter avant la mise en ligne.",
    sections: [{ h: "À rédiger", p: ["Données collectées, finalités, durée de conservation, droits des personnes et cookies : à renseigner."] }],
  },
};

// ---------------------------------------------------------------------------
// Histoire de la marque et de la créatrice.
// Textes écrits à partir des publications Instagram : à relire et compléter
// (prénom, parcours) avec la créatrice. Les images se trouvent dans public/images/maison/.

export const story = {
  manifesto:
    "Augustave est née d'un geste simple : enfiler une perle, puis une autre, jusqu'à ce qu'un bijou raconte quelque chose. Des plages de Bretagne aux grands espaces de l'Ouest, chaque pièce garde la trace d'un lieu, d'une lumière, d'un lien. Parce que la nature ne crée jamais deux fois la même chose, nos bijoux non plus.",
  chapters: [
    {
      n: "I",
      kicker: "L'étincelle",
      title: "Le coup de foudre",
      text: "Tout commence toujours par un coup de cœur. Une perle couleur bronze, une nacre qui accroche la lumière, une couleur qui ne me quitte plus. Je ne dessine pas d'abord : j'assemble au fil de l'inspiration, jusqu'à ce que le bijou trouve sa forme.",
      image: "maison/coup-de-foudre",
      collection: "bronze",
    },
    {
      n: "II",
      kicker: "L'océan",
      title: "Les plages de Bretagne",
      text: "Mon premier atelier, c'est la mer. J'y cueille des coquillages polis par les marées, jamais deux fois les mêmes. Grey Shades et Le cœur de l'Océan sont nés là, entre l'écume et le granit : porter l'un d'eux, c'est porter un morceau d'océan.",
      image: "maison/ocean",
      collection: "grey-shades",
    },
    {
      n: "III",
      kicker: "La lumière",
      title: "La nacre et l'or",
      text: "Une perle logée au creux d'un coquillage, un dégradé de perles scintillantes, une chaîne dorée qui réchauffe la peau. Je cherche ce qui capte la lumière naturelle et illumine le visage. La Nacrée en est née.",
      image: "maison/lumiere",
      collection: "la-nacree",
    },
    {
      n: "IV",
      kicker: "Les grands espaces",
      title: "L'esprit de l'Ouest",
      text: "Les terres rouges, les pierres brutes, l'esprit libre des voyageuses. Texas Stones marie la fraîcheur des pierres vertes à l'éclat du doré, et se porte de quatre façons, comme on change de route.",
      image: "maison/grands-espaces",
      collection: "texas-stones",
    },
    {
      n: "V",
      kicker: "Les liens",
      title: "Ce qui nous attache",
      text: "Une clé, une serrure en forme de cœur, une perle sur un cordon rouge. Certains bijoux racontent un mystère, un attachement, une promesse. Rouge Love est né de cette envie de porter un symbole tout près de soi.",
      image: "maison/liens",
      collection: "rouge-love",
    },
  ],
  creator: {
    kicker: "La créatrice",
    title: "Derrière chaque bijou, deux mains",
    paragraphs: [
      "Derrière Augustave, il y a une femme qui a toujours rapporté de ses voyages des perles, des coquillages et des pierres glanés au bord de l'eau ou au fond d'une boutique. Un jour, elle a commencé à les assembler pour elle, puis pour ses proches.",
      "Aujourd'hui, chaque bijou est pensé, assemblé et façonné à la main avec minutie, dans son atelier parisien. Pas de grande série : des éditions courtes, des pièces uniques, et le plaisir de créer pour sublimer une tenue, un visage, une histoire.",
    ],
    quote: "Parce que la nature ne crée jamais deux fois la même chose, il n'existera jamais un second bijou identique au vôtre.",
    signature: "La créatrice d'Augustave",
  },
  gesture: [
    { title: "Chiner", text: "Perles de verre massives, nacre naturelle, coquillages cueillis en Bretagne, pierres vertes : chaque matière est choisie une à une." },
    { title: "Composer", text: "Pas de croquis figé. Les perles se rencontrent sur la table, au fil de l'inspiration, jusqu'à l'équilibre juste." },
    { title: "Façonner", text: "Montage à la main, perle après perle, sur fil invisible, cordon ou chaîne dorée. Chaque finition est contrôlée." },
    { title: "Mettre en scène", text: "Chaque bijou est photographié puis porté par des modèles imaginés grâce à l'intelligence artificielle, pour vous aider à vous projeter." },
  ],
  signatures: [
    { title: "Pièces uniques", text: "La plupart des créations n'existent qu'en un seul exemplaire." },
    { title: "Un collier, plusieurs vies", text: "Certains bijoux se portent court, long, en bandoulière ou en sautoir." },
    { title: "Fait main à Paris", text: "Imaginés et montés à la main, de la première perle au fermoir." },
    { title: "Votre histoire", text: "Avec l'Édition Votre Histoire, on crée ensemble votre collier sur-mesure." },
  ],
};
