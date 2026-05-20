export const categorySeeds = [
  {
    name: "Communication",
    slug: "communication",
    description: "Outils pour clarifier les messages, écouter et prévenir les tensions.",
    color: "#0f766e",
  },
  {
    name: "Amis",
    slug: "amis",
    description: "Ressources pour entretenir les amitiés, les réseaux de soutien et les communautés.",
    color: "#0891b2",
  },
  {
    name: "Couple",
    slug: "couple",
    description: "Supports dédiés aux relations de couple, à l'écoute et aux rituels partagés.",
    color: "#be123c",
  },
  {
    name: "Famille",
    slug: "famille",
    description: "Repères pour les relations parents, enfants, fratries et proches familiaux.",
    color: "#7c3aed",
  },
  {
    name: "Intelligence émotionnelle",
    slug: "intelligence-emotionnelle",
    description: "Ressources pour reconnaître, nommer et réguler les émotions.",
    color: "#dc6b49",
  },
  {
    name: "Monde professionnel",
    slug: "monde-professionnel",
    description: "Repères relationnels pour les collègues, managers et collaborateurs.",
    color: "#2563eb",
  },
  {
    name: "Parentalité",
    slug: "parentalite",
    description: "Supports pour accompagner les relations parents, enfants et fratries.",
    color: "#7c3aed",
  },
  {
    name: "Qualité de vie",
    slug: "qualite-de-vie",
    description: "Activités favorisant le lien social, l'entraide et l'équilibre quotidien.",
    color: "#ca8a04",
  },
  {
    name: "Vie affective",
    slug: "vie-affective",
    description: "Contenus pour prendre soin du couple, de l'amitié et des relations proches.",
    color: "#be123c",
  },
];

export const relationTypeSeeds = [
  {
    name: "Soi",
    slug: "soi",
    description: "Relation à soi, émotions, besoins et limites personnelles.",
  },
  {
    name: "Conjoints",
    slug: "conjoints",
    description: "Relations de couple et vie affective partagée.",
  },
  {
    name: "Famille",
    slug: "famille",
    description: "Enfants, parents, fratrie et proches familiaux.",
  },
  {
    name: "Professionnelle",
    slug: "professionnelle",
    description: "Collègues, collaborateurs, managers et collectifs de travail.",
  },
  {
    name: "Amis et communautés",
    slug: "amis-communautes",
    description: "Amitiés, voisinage, associations et communautés.",
  },
  {
    name: "Inconnus",
    slug: "inconnus",
    description: "Interactions ponctuelles dans l'espace public ou numérique.",
  },
];

export const resourceTypeSeeds = [
  {
    name: "Activité / Jeu à réaliser",
    slug: "activite-jeu",
    description: "Ressource active pouvant être menée seul ou à plusieurs.",
    supportsActivity: true,
    supportsMessaging: true,
  },
  {
    name: "Article",
    slug: "article",
    description: "Contenu éditorial à lire, annoter et partager.",
    supportsActivity: false,
    supportsMessaging: false,
  },
  {
    name: "Carte défi",
    slug: "carte-defi",
    description: "Défi relationnel court à expérimenter dans le quotidien.",
    supportsActivity: true,
    supportsMessaging: false,
  },
  {
    name: "Cours au format PDF",
    slug: "cours-pdf",
    description: "Support long ou pédagogique téléchargeable.",
    supportsActivity: false,
    supportsMessaging: false,
  },
  {
    name: "Exercice / Atelier",
    slug: "exercice-atelier",
    description: "Exercice guidé pour travailler une situation concrète.",
    supportsActivity: true,
    supportsMessaging: true,
  },
  {
    name: "Fiche de lecture",
    slug: "fiche-lecture",
    description: "Synthèse exploitable d'un livre, article ou rapport.",
    supportsActivity: false,
    supportsMessaging: false,
  },
  {
    name: "Jeu en ligne",
    slug: "jeu-en-ligne",
    description: "Expérience interactive numérique.",
    supportsActivity: true,
    supportsMessaging: true,
  },
  {
    name: "Vidéo",
    slug: "video",
    description: "Ressource audiovisuelle consultable en ligne.",
    supportsActivity: false,
    supportsMessaging: false,
  },
];

type ResourceSeed = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  categorySlug: string;
  typeSlug: string;
  relationSlugs: string[];
  sourceUrl?: string;
  imageUrl?: string;
  visibility?: string;
  status?: string;
  durationMinutes: number;
  difficulty: string;
};

export const resourceSeeds: ResourceSeed[] = [
  {
    title: "Reconnaître ses émotions",
    slug: "reconnaitre-ses-emotions",
    summary:
      "Un atelier d'une semaine pour identifier les émotions ressenties, leurs déclencheurs et leur intensité.",
    content:
      "Notez plusieurs fois par jour l'émotion présente, son intensité, son caractère agréable ou désagréable et le facteur déclencheur. Après une semaine, relisez vos notes pour repérer les émotions les plus fréquentes, les situations associées et les leviers qui auraient pu modifier votre ressenti.",
    categorySlug: "intelligence-emotionnelle",
    typeSlug: "exercice-atelier",
    relationSlugs: ["soi"],
    durationMinutes: 20,
    difficulty: "accessible",
  },
  {
    title: "Travail, salaire, profit",
    slug: "travail-salaire-profit",
    summary:
      "Une vidéo documentaire pour ouvrir un échange sur les relations professionnelles, la reconnaissance et la valeur du travail.",
    content:
      "Visionnez l'émission puis échangez autour de trois questions : qu'est-ce qui est reconnu dans votre travail, qu'est-ce qui reste invisible, et comment une équipe peut mieux répartir l'information, la décision et la reconnaissance ?",
    categorySlug: "monde-professionnel",
    typeSlug: "video",
    relationSlugs: ["professionnelle"],
    sourceUrl: "https://www.youtube.com/watch?v=Dpzv8H16R-Q",
    durationMinutes: 52,
    difficulty: "intermediaire",
  },
  {
    title: "Le rire au travail et l'éthique",
    slug: "le-rire-au-travail-et-l-ethique",
    summary:
      "Un article de réflexion pour distinguer humour fédérateur, malaise collectif et situations à réguler.",
    content:
      "Le rire peut soutenir le collectif, mais il peut aussi devenir un signal de malaise ou un outil de domination. Utilisez cette ressource pour analyser une situation professionnelle : qui rit, qui ne rit pas, de quoi rit-on, et quel cadre de régulation permet de préserver la dignité de chacun ?",
    categorySlug: "monde-professionnel",
    typeSlug: "article",
    relationSlugs: ["professionnelle"],
    durationMinutes: 35,
    difficulty: "avance",
  },
  {
    title: "Désamorcer un conflit en quatre étapes",
    slug: "desamorcer-un-conflit-en-quatre-etapes",
    summary:
      "Une méthode courte pour clarifier les faits, nommer les besoins et rechercher une demande acceptable.",
    content:
      "Commencez par décrire les faits observables, sans jugement. Nommez ensuite l'émotion ou le besoin concerné. Reformulez le point de vue de l'autre personne, puis proposez une demande concrète, limitée et vérifiable. Cette méthode peut être adaptée à un proche, un collègue ou une interaction avec un inconnu.",
    categorySlug: "communication",
    typeSlug: "carte-defi",
    relationSlugs: ["conjoints", "famille", "professionnelle", "inconnus"],
    durationMinutes: 15,
    difficulty: "accessible",
  },
  {
    title: "Une question vraie par jour",
    slug: "une-question-vraie-par-jour",
    summary:
      "Un rituel de sept jours pour enrichir une relation proche par des questions simples et ouvertes.",
    content:
      "Chaque jour, choisissez une question ouverte et prenez dix minutes pour écouter la réponse sans interrompre : de quoi as-tu besoin en ce moment ? qu'est-ce qui t'a donné de l'énergie aujourd'hui ? qu'aimerais-tu que je comprenne mieux ? Terminez par une reformulation et un remerciement.",
    categorySlug: "couple",
    typeSlug: "activite-jeu",
    relationSlugs: ["conjoints", "famille", "amis-communautes"],
    imageUrl: "/images/relations-hero.png",
    durationMinutes: 10,
    difficulty: "accessible",
  },
  {
    title: "Carnet de dialogue du couple",
    slug: "carnet-de-dialogue-du-couple",
    summary:
      "Une ressource réservée aux comptes connectés pour préparer un échange délicat en couple.",
    content:
      "Préparez l'échange en notant le sujet, ce que vous ressentez, ce que vous demandez et le compromis acceptable. La ressource est restreinte afin d'être utilisée dans un espace personnel connecté.",
    categorySlug: "couple",
    typeSlug: "fiche-lecture",
    relationSlugs: ["conjoints"],
    visibility: "RESTRICTED",
    durationMinutes: 25,
    difficulty: "intermediaire",
  },
  {
    title: "Cartographie de soutien",
    slug: "cartographie-de-soutien",
    summary:
      "Un exercice pour visualiser les personnes, lieux et services mobilisables en cas de besoin.",
    content:
      "Placez-vous au centre d'une feuille, puis ajoutez les proches, professionnels, lieux publics et ressources numériques qui peuvent vous soutenir. Identifiez les liens forts, les liens à renforcer et une action concrète à mener cette semaine pour entretenir ce réseau.",
    categorySlug: "amis",
    typeSlug: "exercice-atelier",
    relationSlugs: ["soi", "famille", "amis-communautes"],
    durationMinutes: 30,
    difficulty: "accessible",
  },
];

export type FixtureResource = (typeof resourceSeeds)[number];
