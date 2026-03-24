export type Locale = 'fr' | 'en' | 'ar';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
};

export interface Translations {
  // ─── Navigation
  nav: {
    dashboard: string;
    products: string;
    storage: string;
    movements: string;
    alerts: string;
    suppliers: string;
    clients: string;
    users: string;
    license: string;
    settings: string;
    allSites: string;
    logout: string;
  };
  // ─── Login
  login: {
    tagline: string;
    email: string;
    password: string;
    submit: string;
    loading: string;
    welcome: string;
    invalidCredentials: string;
  };
  // ─── Dashboard
  dashboard: {
    title: string;
    activeProducts: string;
    recentMovements: string;
    activeAlerts: string;
    totalOps: string;
    quickActions: string;
    lastMovements: string;
    noMovements: string;
    stockIn: string;
    stockOut: string;
    transfer: string;
    adjustment: string;
  };
  // ─── Products
  products: {
    title: string;
    import: string;
    importing: string;
    export: string;
    newProduct: string;
    searchPlaceholder: string;
    sku: string;
    name: string;
    category: string;
    unit: string;
    barcode: string;
    status: string;
    active: string;
    inactive: string;
    loading: string;
    noProducts: string;
    page: string;
    previous: string;
    next: string;
    importSuccess: string;
    exportSuccess: string;
    exportError: string;
  };
  // ─── Movements
  movements: {
    title: string;
    entry: string;
    exit: string;
    transfer: string;
    ref: string;
    type: string;
    product: string;
    quantity: string;
    by: string;
    date: string;
    loading: string;
    noMovements: string;
    typeLabels: { IN: string; OUT: string; TRANSFER: string; ADJUSTMENT: string };
    exitVoucher: string;
    supplier: string;
    client: string;
  };
  // ─── Voucher
  voucher: {
    title: string;
    date: string;
    voucherNumber: string;
    sku: string;
    product: string;
    quantity: string;
    unit: string;
    sourceLocation: string;
    reason: string;
    ref: string;
    preparedBy: string;
    approvedBy: string;
    receivedBy: string;
    signature: string;
    print: string;
    close: string;
    noExits: string;
    page: string;
    of: string;
    generatedOn: string;
    totalItems: string;
    totalQuantity: string;
  };
  // ─── Alerts
  alerts: {
    title: string;
    statusLabels: { TRIGGERED: string; ACKNOWLEDGED: string; RESOLVED: string };
    stock: string;
    minThreshold: string;
    safety: string;
    site: string;
    loading: string;
    noAlerts: string;
  };
  // ─── Storage
  storage: {
    title: string;
    newSite: string;
    loading: string;
    noSites: string;
    createSite: string;
    siteName: string;
    siteCode: string;
    siteType: string;
    siteAddress: string;
    typeWarehouse: string;
    typeStore: string;
    typeOther: string;
    cancel: string;
    save: string;
    saving: string;
    success: string;
    error: string;
    editSite: string;
    updateSuccess: string;
    updateError: string;
    deleteSite: string;
    deleteConfirm: string;
    deleteSuccess: string;
    deleteError: string;
    confirm: string;
    zones: string;
    // Zone fields
    viewZones: string;
    newZone: string;
    noZones: string;
    createZone: string;
    editZone: string;
    deleteZone: string;
    zoneName: string;
    zoneCode: string;
    zoneType: string;
    typeAisle: string;
    typeShelf: string;
    typeArea: string;
    typeZoneOther: string;
    zoneSuccess: string;
    zoneError: string;
    zoneUpdateSuccess: string;
    zoneUpdateError: string;
    zoneDeleteSuccess: string;
    zoneDeleteError: string;
    zoneDeleteConfirm: string;
    locations: string;
    // Location fields
    viewLocations: string;
    newLocation: string;
    noLocations: string;
    createLocation: string;
    editLocation: string;
    deleteLocation: string;
    locationCode: string;
    locationLabel: string;
    locationCapacity: string;
    locationSuccess: string;
    locationError: string;
    locationUpdateSuccess: string;
    locationUpdateError: string;
    locationDeleteSuccess: string;
    locationDeleteError: string;
    locationDeleteConfirm: string;
    // Breadcrumb
    backToSites: string;
    backToZones: string;
  };
  // ─── Create Product Modal
  createProduct: {
    title: string;
    sku: string;
    barcode: string;
    productName: string;
    category: string;
    unitOfMeasure: string;
    noneOption: string;
    cancel: string;
    create: string;
    creating: string;
    success: string;
    error: string;
  };
  // ─── Create Movement Modal
  createMovement: {
    title: string;
    movementType: string;
    typeLabels: { IN: string; OUT: string; TRANSFER: string; ADJUSTMENT: string };
    product: string;
    selectOption: string;
    sourceLocation: string;
    destLocation: string;
    quantity: string;
    reason: string;
    reasonPlaceholder: string;
    cancel: string;
    save: string;
    saving: string;
    success: string;
    error: string;
    supplier: string;
    client: string;
  };
  // ─── Settings
  settings: {
    title: string;
    appearance: string;
    appearanceDesc: string;
    customizeBtn: string;
    users: string;
    usersDesc: string;
    manageUsersBtn: string;
    customFields: string;
    customFieldsDesc: string;
    configureFieldsBtn: string;
    thresholds: string;
    thresholdsDesc: string;
    manageThresholdsBtn: string;
    categories: string;
    categoriesDesc: string;
    manageCategoriesBtn: string;
    language: string;
    languageDesc: string;
  };
  // ─── Suppliers
  suppliers: {
    title: string;
    newSupplier: string;
    searchPlaceholder: string;
    code: string;
    name: string;
    contact: string;
    email: string;
    phone: string;
    address: string;
    nif: string;
    status: string;
    active: string;
    inactive: string;
    productsCount: string;
    linkedProducts: string;
    noLinkedProducts: string;
    loading: string;
    noSuppliers: string;
    page: string;
    previous: string;
    next: string;
    createTitle: string;
    create: string;
    creating: string;
    createSuccess: string;
    createError: string;
    deleteSuccess: string;
    deleteError: string;
    confirmDelete: string;
    export: string;
  };
  // ─── Clients
  clients: {
    title: string;
    newClient: string;
    searchPlaceholder: string;
    code: string;
    name: string;
    type: string;
    typeLabels: { COMPANY: string; INDIVIDUAL: string; GOVERNMENT: string; OTHER: string };
    contact: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    nif: string;
    status: string;
    active: string;
    inactive: string;
    movementsCount: string;
    loading: string;
    noClients: string;
    page: string;
    previous: string;
    next: string;
    createTitle: string;
    create: string;
    creating: string;
    createSuccess: string;
    createError: string;
    deleteSuccess: string;
    deleteError: string;
    confirmDelete: string;
    export: string;
  };
  // ─── Common
  common: {
    loading: string;
    cancel: string;
    save: string;
    add: string;
    adding: string;
    delete: string;
    close: string;
    reset: string;
    required: string;
  };
  // ─── Search
  search: {
    placeholder: string;
    searching: string;
    noResults: string;
    categories: string;
    locations: string;
    resultsFound: string;
    navigate: string;
    select: string;
    closeHint: string;
    voiceStart: string;
    voiceStop: string;
    voiceListening: string;
    voiceUnsupported: string;
    voiceDenied: string;
    voiceNoSpeech: string;
  };
  // ─── Barcode Scanner
  scanner: {
    title: string;
    instructions: string;
    scanButton: string;
    cancel: string;
    noCamera: string;
    permissionDenied: string;
    productFound: string;
    productNotFound: string;
  };
}

export const translations: Record<Locale, Translations> = {
  // ═══════════════ FRANÇAIS ═══════════════
  fr: {
    nav: {
      dashboard: 'Tableau de bord',
      products: 'Produits',
      storage: 'Stockage',
      movements: 'Mouvements',
      alerts: 'Alertes',
      suppliers: 'Fournisseurs',
      clients: 'Clients',
      users: 'Utilisateurs',
      license: 'Licence',
      settings: 'Paramètres',
      allSites: 'Tous les sites',
      logout: 'Déconnexion',
    },
    login: {
      tagline: 'Gestion de Stock Intelligente',
      email: 'Email',
      password: 'Mot de passe',
      submit: 'Se connecter',
      loading: 'Connexion...',
      welcome: 'Bienvenue !',
      invalidCredentials: 'Identifiants invalides',
    },
    dashboard: {
      title: 'Tableau de bord',
      activeProducts: 'Produits actifs',
      recentMovements: 'Mouvements récents',
      activeAlerts: 'Alertes actives',
      totalOps: 'Opérations (total)',
      quickActions: 'Actions rapides',
      lastMovements: 'Derniers mouvements',
      noMovements: 'Aucun mouvement enregistré.',
      stockIn: '+ Entrée de stock',
      stockOut: '+ Sortie de stock',
      transfer: '↔ Transfert',
      adjustment: '± Ajustement',
    },
    products: {
      title: 'Produits',
      import: 'Importer',
      importing: 'Import...',
      export: 'Exporter',
      newProduct: 'Nouveau produit',
      searchPlaceholder: 'Rechercher par SKU, nom ou code-barres...',
      sku: 'SKU',
      name: 'Nom',
      category: 'Catégorie',
      unit: 'Unité',
      barcode: 'Code-barres',
      status: 'Statut',
      active: 'Actif',
      inactive: 'Inactif',
      loading: 'Chargement...',
      noProducts: 'Aucun produit trouvé',
      page: 'Page',
      previous: 'Précédent',
      next: 'Suivant',
      importSuccess: 'Import terminé',
      exportSuccess: 'Export téléchargé',
      exportError: "Erreur lors de l'export",
    },
    movements: {
      title: 'Mouvements de stock',
      entry: '+ Entrée',
      exit: '+ Sortie',
      transfer: '↔ Transfert',
      ref: 'Réf.',
      type: 'Type',
      product: 'Produit',
      quantity: 'Quantité',
      by: 'Par',
      date: 'Date',
      loading: 'Chargement...',
      noMovements: 'Aucun mouvement',
      typeLabels: { IN: 'Entrée', OUT: 'Sortie', TRANSFER: 'Transfert', ADJUSTMENT: 'Ajustement' },
      exitVoucher: 'Bordereau de sortie',
      supplier: 'Fournisseur',
      client: 'Client',
    },
    voucher: {
      title: 'BORDEREAU DE SORTIE DE STOCK',
      date: 'Date',
      voucherNumber: 'N° Bordereau',
      sku: 'Réf.',
      product: 'Désignation',
      quantity: 'Quantité',
      unit: 'Unité',
      sourceLocation: 'Emplacement',
      reason: 'Motif',
      ref: 'Réf. mouvement',
      preparedBy: 'Préparé par',
      approvedBy: 'Approuvé par',
      receivedBy: 'Reçu par',
      signature: 'Signature',
      print: 'Imprimer',
      close: 'Fermer',
      noExits: 'Aucune sortie de stock à afficher.',
      page: 'Page',
      of: 'sur',
      generatedOn: 'Généré le',
      totalItems: 'Total articles',
      totalQuantity: 'Quantité totale',
    },
    alerts: {
      title: 'Alertes',
      statusLabels: { TRIGGERED: 'Active', ACKNOWLEDGED: 'Acquittée', RESOLVED: 'Résolue' },
      stock: 'Stock :',
      minThreshold: 'Seuil min :',
      safety: 'Sécurité :',
      site: 'Site :',
      loading: 'Chargement...',
      noAlerts: 'Aucune alerte active. Tout va bien !',
    },
    storage: {
      title: 'Hiérarchie de stockage',
      newSite: 'Nouveau site',
      loading: 'Chargement...',
      noSites: 'Aucun site configuré. Créez votre premier site.',
      createSite: 'Nouveau site',
      siteName: 'Nom du site',
      siteCode: 'Code',
      siteType: 'Type',
      siteAddress: 'Adresse',
      typeWarehouse: 'Entrepôt',
      typeStore: 'Magasin',
      typeOther: 'Autre',
      cancel: 'Annuler',
      save: 'Créer le site',
      saving: 'Création...',
      success: 'Site créé avec succès',
      error: 'Erreur lors de la création du site',
      editSite: 'Modifier le site',
      updateSuccess: 'Site modifié avec succès',
      updateError: 'Erreur lors de la modification',
      deleteSite: 'Supprimer le site',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce site ?',
      deleteSuccess: 'Site supprimé avec succès',
      deleteError: 'Erreur lors de la suppression',
      confirm: 'Confirmer',
      zones: 'zones',
      // Zone
      viewZones: 'Voir les zones',
      newZone: 'Nouvelle zone',
      noZones: 'Aucune zone. Créez votre première zone.',
      editZone: 'Modifier la zone',
      deleteZone: 'Supprimer la zone',
      zoneName: 'Nom de la zone',
      zoneCode: 'Code',
      zoneType: 'Type',
      typeAisle: 'Allée',
      typeShelf: 'Étagère',
      typeArea: 'Zone',
      typeZoneOther: 'Autre',
      createZone: 'Créer la zone',
      zoneSuccess: 'Zone créée avec succès',
      zoneError: 'Erreur lors de la création de la zone',
      zoneUpdateSuccess: 'Zone modifiée avec succès',
      zoneUpdateError: 'Erreur lors de la modification',
      zoneDeleteSuccess: 'Zone supprimée avec succès',
      zoneDeleteError: 'Erreur lors de la suppression',
      zoneDeleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette zone ?',
      locations: 'emplacements',
      // Location
      viewLocations: 'Voir les emplacements',
      newLocation: 'Nouvel emplacement',
      noLocations: 'Aucun emplacement. Créez votre premier emplacement.',
      createLocation: 'Nouvel emplacement',
      editLocation: 'Modifier l\'emplacement',
      deleteLocation: 'Supprimer l\'emplacement',
      locationCode: 'Code',
      locationLabel: 'Libellé',
      locationCapacity: 'Capacité max',
      locationSuccess: 'Emplacement créé avec succès',
      locationError: 'Erreur lors de la création',
      locationUpdateSuccess: 'Emplacement modifié avec succès',
      locationUpdateError: 'Erreur lors de la modification',
      locationDeleteSuccess: 'Emplacement supprimé avec succès',
      locationDeleteError: 'Erreur lors de la suppression',
      locationDeleteConfirm: 'Êtes-vous sûr de vouloir supprimer cet emplacement ?',
      // Breadcrumb
      backToSites: 'Retour aux sites',
      backToZones: 'Retour aux zones',
    },
    createProduct: {
      title: 'Nouveau produit',
      sku: 'SKU',
      barcode: 'Code-barres',
      productName: 'Nom du produit',
      category: 'Catégorie',
      unitOfMeasure: 'Unité de mesure',
      noneOption: '— Aucune —',
      cancel: 'Annuler',
      create: 'Créer le produit',
      creating: 'Création...',
      success: 'Produit créé avec succès',
      error: 'Erreur lors de la création',
    },
    createMovement: {
      title: 'Nouveau mouvement',
      movementType: 'Type de mouvement',
      typeLabels: { IN: 'Entrée de stock', OUT: 'Sortie de stock', TRANSFER: 'Transfert', ADJUSTMENT: 'Ajustement' },
      product: 'Produit',
      selectOption: '— Sélectionner —',
      sourceLocation: 'Emplacement source',
      destLocation: 'Emplacement destination',
      quantity: 'Quantité',
      reason: 'Motif',
      reasonPlaceholder: 'Réception fournisseur...',
      cancel: 'Annuler',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      success: 'Mouvement enregistré',
      error: "Erreur lors de l'enregistrement",
      supplier: 'Fournisseur',
      client: 'Client',
    },
    settings: {
      title: 'Paramètres',
      appearance: 'Apparence & Marque',
      appearanceDesc: "Personnaliser le nom, logo, couleurs et style de l'interface pour chaque client.",
      customizeBtn: "Personnaliser l'interface",
      users: 'Gestion des utilisateurs',
      usersDesc: 'Gérer les comptes, rôles et accès aux sites.',
      manageUsersBtn: 'Gérer les utilisateurs',
      customFields: 'Champs personnalisés',
      customFieldsDesc: 'Définir les attributs dynamiques par catégorie (taille, couleur, date de péremption...).',
      configureFieldsBtn: 'Configurer les champs',
      thresholds: 'Seuils & Alertes',
      thresholdsDesc: 'Paramétrer les stocks minimum, de sécurité et points de commande.',
      manageThresholdsBtn: 'Gérer les seuils',
      categories: 'Catégories',
      categoriesDesc: 'Organiser les produits en arborescence de catégories.',
      manageCategoriesBtn: 'Gérer les catégories',
      language: 'Langue',
      languageDesc: "Choisir la langue d'affichage de l'application.",
    },
    suppliers: {
      title: 'Fournisseurs',
      newSupplier: 'Nouveau fournisseur',
      searchPlaceholder: 'Rechercher par code, nom, contact...',
      code: 'Code',
      name: 'Nom',
      contact: 'Contact',
      email: 'Email',
      phone: 'Téléphone',
      address: 'Adresse',
      nif: 'NIF',
      status: 'Statut',
      active: 'Actif',
      inactive: 'Inactif',
      productsCount: 'Produits',
      linkedProducts: 'Produits associés',
      noLinkedProducts: 'Aucun produit associé',
      loading: 'Chargement...',
      noSuppliers: 'Aucun fournisseur trouvé',
      page: 'Page',
      previous: 'Précédent',
      next: 'Suivant',
      createTitle: 'Nouveau fournisseur',
      create: 'Créer le fournisseur',
      creating: 'Création...',
      createSuccess: 'Fournisseur créé avec succès',
      createError: 'Erreur lors de la création',
      deleteSuccess: 'Fournisseur supprimé',
      deleteError: 'Erreur lors de la suppression',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce fournisseur ?',
      export: 'Exporter',
    },
    clients: {
      title: 'Clients',
      newClient: 'Nouveau client',
      searchPlaceholder: 'Rechercher par code, nom, NIF...',
      code: 'Code',
      name: 'Nom',
      type: 'Type',
      typeLabels: { COMPANY: 'Entreprise', INDIVIDUAL: 'Particulier', GOVERNMENT: 'Administration', OTHER: 'Autre' },
      contact: 'Contact',
      email: 'Email',
      phone: 'Téléphone',
      address: 'Adresse',
      taxId: 'NIF',
      nif: 'NIF',
      status: 'Statut',
      active: 'Actif',
      inactive: 'Inactif',
      movementsCount: 'Mouvements',
      loading: 'Chargement...',
      noClients: 'Aucun client trouvé',
      page: 'Page',
      previous: 'Précédent',
      next: 'Suivant',
      createTitle: 'Nouveau client',
      create: 'Créer le client',
      creating: 'Création...',
      createSuccess: 'Client créé avec succès',
      createError: 'Erreur lors de la création',
      deleteSuccess: 'Client supprimé',
      deleteError: 'Erreur lors de la suppression',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce client ?',
      export: 'Exporter',
    },
    common: {
      loading: 'Chargement...',
      cancel: 'Annuler',
      save: 'Enregistrer',
      add: 'Ajouter',
      adding: 'Ajout...',
      delete: 'Supprimer',
      close: 'Fermer',
      reset: 'Réinitialiser par défaut',
      required: '*',
    },
    search: {
      placeholder: 'Rechercher produits, mouvements, emplacements… (Ctrl+K)',
      searching: 'Recherche en cours...',
      noResults: 'Aucun résultat trouvé.',
      categories: 'Catégories',
      locations: 'Emplacements',
      resultsFound: 'résultats trouvés',
      navigate: 'naviguer',
      select: 'ouvrir',
      closeHint: 'fermer',
      voiceStart: 'Recherche vocale',
      voiceStop: 'Arrêter l\'écoute',
      voiceListening: '🎤 Parlez maintenant…',
      voiceUnsupported: 'Recherche vocale non supportée par ce navigateur',
      voiceDenied: 'Accès au micro refusé',
      voiceNoSpeech: 'Aucune voix détectée, réessayez',
    },
    scanner: {
      title: 'Scanner un code',
      instructions: 'Placez le code-barres ou QR code devant la caméra.',
      scanButton: 'Scanner',
      cancel: 'Annuler',
      noCamera: 'Aucune caméra détectée sur cet appareil.',
      permissionDenied: 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres du navigateur.',
      productFound: 'Produit trouvé',
      productNotFound: 'Aucun produit ne correspond au code',
    },
  },

  // ═══════════════ ENGLISH ═══════════════
  en: {
    nav: {
      dashboard: 'Dashboard',
      products: 'Products',
      storage: 'Storage',
      movements: 'Movements',
      alerts: 'Alerts',
      suppliers: 'Suppliers',
      clients: 'Clients',
      users: 'Users',
      license: 'License',
      settings: 'Settings',
      allSites: 'All sites',
      logout: 'Log out',
    },
    login: {
      tagline: 'Intelligent Stock Management',
      email: 'Email',
      password: 'Password',
      submit: 'Sign in',
      loading: 'Signing in...',
      welcome: 'Welcome!',
      invalidCredentials: 'Invalid credentials',
    },
    dashboard: {
      title: 'Dashboard',
      activeProducts: 'Active products',
      recentMovements: 'Recent movements',
      activeAlerts: 'Active alerts',
      totalOps: 'Operations (total)',
      quickActions: 'Quick actions',
      lastMovements: 'Recent movements',
      noMovements: 'No movements recorded.',
      stockIn: '+ Stock in',
      stockOut: '+ Stock out',
      transfer: '↔ Transfer',
      adjustment: '± Adjustment',
    },
    products: {
      title: 'Products',
      import: 'Import',
      importing: 'Importing...',
      export: 'Export',
      newProduct: 'New product',
      searchPlaceholder: 'Search by SKU, name or barcode...',
      sku: 'SKU',
      name: 'Name',
      category: 'Category',
      unit: 'Unit',
      barcode: 'Barcode',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      loading: 'Loading...',
      noProducts: 'No products found',
      page: 'Page',
      previous: 'Previous',
      next: 'Next',
      importSuccess: 'Import complete',
      exportSuccess: 'Export downloaded',
      exportError: 'Export error',
    },
    movements: {
      title: 'Stock movements',
      entry: '+ Entry',
      exit: '+ Exit',
      transfer: '↔ Transfer',
      ref: 'Ref.',
      type: 'Type',
      product: 'Product',
      quantity: 'Qty',
      by: 'By',
      date: 'Date',
      loading: 'Loading...',
      noMovements: 'No movements',
      typeLabels: { IN: 'Entry', OUT: 'Exit', TRANSFER: 'Transfer', ADJUSTMENT: 'Adjustment' },
      exitVoucher: 'Exit voucher',
      supplier: 'Supplier',
      client: 'Client',
    },
    voucher: {
      title: 'STOCK EXIT VOUCHER',
      date: 'Date',
      voucherNumber: 'Voucher No.',
      sku: 'Ref.',
      product: 'Description',
      quantity: 'Quantity',
      unit: 'Unit',
      sourceLocation: 'Location',
      reason: 'Reason',
      ref: 'Movement ref.',
      preparedBy: 'Prepared by',
      approvedBy: 'Approved by',
      receivedBy: 'Received by',
      signature: 'Signature',
      print: 'Print',
      close: 'Close',
      noExits: 'No stock exits to display.',
      page: 'Page',
      of: 'of',
      generatedOn: 'Generated on',
      totalItems: 'Total items',
      totalQuantity: 'Total quantity',
    },
    alerts: {
      title: 'Alerts',
      statusLabels: { TRIGGERED: 'Active', ACKNOWLEDGED: 'Acknowledged', RESOLVED: 'Resolved' },
      stock: 'Stock:',
      minThreshold: 'Min threshold:',
      safety: 'Safety:',
      site: 'Site:',
      loading: 'Loading...',
      noAlerts: 'No active alerts. All good!',
    },
    storage: {
      title: 'Storage hierarchy',
      newSite: 'New site',
      loading: 'Loading...',
      noSites: 'No sites configured. Create your first site.',
      createSite: 'New site',
      siteName: 'Site name',
      siteCode: 'Code',
      siteType: 'Type',
      siteAddress: 'Address',
      typeWarehouse: 'Warehouse',
      typeStore: 'Store',
      typeOther: 'Other',
      cancel: 'Cancel',
      save: 'Create site',
      saving: 'Creating...',
      success: 'Site created successfully',
      error: 'Error creating site',
      editSite: 'Edit site',
      updateSuccess: 'Site updated successfully',
      updateError: 'Error updating site',
      deleteSite: 'Delete site',
      deleteConfirm: 'Are you sure you want to delete this site?',
      deleteSuccess: 'Site deleted successfully',
      deleteError: 'Error deleting site',
      confirm: 'Confirm',
      zones: 'zones',
      // Zone
      viewZones: 'View zones',
      newZone: 'New zone',
      noZones: 'No zones. Create your first zone.',
      createZone: 'Create zone',
      editZone: 'Edit zone',
      deleteZone: 'Delete zone',
      zoneName: 'Zone name',
      zoneCode: 'Code',
      zoneType: 'Type',
      typeAisle: 'Aisle',
      typeShelf: 'Shelf',
      typeArea: 'Area',
      typeZoneOther: 'Other',
      zoneSuccess: 'Zone created successfully',
      zoneError: 'Error creating zone',
      zoneUpdateSuccess: 'Zone updated successfully',
      zoneUpdateError: 'Error updating zone',
      zoneDeleteSuccess: 'Zone deleted successfully',
      zoneDeleteError: 'Error deleting zone',
      zoneDeleteConfirm: 'Are you sure you want to delete this zone?',
      locations: 'locations',
      // Location
      viewLocations: 'View locations',
      newLocation: 'New location',
      noLocations: 'No locations. Create your first location.',
      createLocation: 'New location',
      editLocation: 'Edit location',
      deleteLocation: 'Delete location',
      locationCode: 'Code',
      locationLabel: 'Label',
      locationCapacity: 'Max capacity',
      locationSuccess: 'Location created successfully',
      locationError: 'Error creating location',
      locationUpdateSuccess: 'Location updated successfully',
      locationUpdateError: 'Error updating location',
      locationDeleteSuccess: 'Location deleted successfully',
      locationDeleteError: 'Error deleting location',
      locationDeleteConfirm: 'Are you sure you want to delete this location?',
      // Breadcrumb
      backToSites: 'Back to sites',
      backToZones: 'Back to zones',
    },
    createProduct: {
      title: 'New product',
      sku: 'SKU',
      barcode: 'Barcode',
      productName: 'Product name',
      category: 'Category',
      unitOfMeasure: 'Unit of measure',
      noneOption: '— None —',
      cancel: 'Cancel',
      create: 'Create product',
      creating: 'Creating...',
      success: 'Product created successfully',
      error: 'Error creating product',
    },
    createMovement: {
      title: 'New movement',
      movementType: 'Movement type',
      typeLabels: { IN: 'Stock in', OUT: 'Stock out', TRANSFER: 'Transfer', ADJUSTMENT: 'Adjustment' },
      product: 'Product',
      selectOption: '— Select —',
      sourceLocation: 'Source location',
      destLocation: 'Destination location',
      quantity: 'Quantity',
      reason: 'Reason',
      reasonPlaceholder: 'Supplier delivery...',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      success: 'Movement recorded',
      error: 'Error recording movement',
      supplier: 'Supplier',
      client: 'Client',
    },
    settings: {
      title: 'Settings',
      appearance: 'Appearance & Branding',
      appearanceDesc: 'Customize the name, logo, colors and interface style for each client.',
      customizeBtn: 'Customize interface',
      users: 'User management',
      usersDesc: 'Manage accounts, roles and site access.',
      manageUsersBtn: 'Manage users',
      customFields: 'Custom fields',
      customFieldsDesc: 'Define dynamic attributes per category (size, color, expiry date...).',
      configureFieldsBtn: 'Configure fields',
      thresholds: 'Thresholds & Alerts',
      thresholdsDesc: 'Set minimum stock, safety stock and reorder points.',
      manageThresholdsBtn: 'Manage thresholds',
      categories: 'Categories',
      categoriesDesc: 'Organize products in a category tree.',
      manageCategoriesBtn: 'Manage categories',
      language: 'Language',
      languageDesc: 'Choose the application display language.',
    },
    suppliers: {
      title: 'Suppliers',
      newSupplier: 'New supplier',
      searchPlaceholder: 'Search by code, name, contact...',
      code: 'Code',
      name: 'Name',
      contact: 'Contact',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      nif: 'Tax ID (NIF)',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      productsCount: 'Products',
      linkedProducts: 'Linked products',
      noLinkedProducts: 'No linked products',
      loading: 'Loading...',
      noSuppliers: 'No suppliers found',
      page: 'Page',
      previous: 'Previous',
      next: 'Next',
      createTitle: 'New supplier',
      create: 'Create supplier',
      creating: 'Creating...',
      createSuccess: 'Supplier created successfully',
      createError: 'Error creating supplier',
      deleteSuccess: 'Supplier deleted',
      deleteError: 'Error deleting supplier',
      confirmDelete: 'Are you sure you want to delete this supplier?',
      export: 'Export',
    },
    clients: {
      title: 'Clients',
      newClient: 'New client',
      searchPlaceholder: 'Search by code, name, tax ID...',
      code: 'Code',
      name: 'Name',
      type: 'Type',
      typeLabels: { COMPANY: 'Company', INDIVIDUAL: 'Individual', GOVERNMENT: 'Government', OTHER: 'Other' },
      contact: 'Contact',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      taxId: 'Tax ID',
      nif: 'Tax ID (NIF)',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      movementsCount: 'Movements',
      loading: 'Loading...',
      noClients: 'No clients found',
      page: 'Page',
      previous: 'Previous',
      next: 'Next',
      createTitle: 'New client',
      create: 'Create client',
      creating: 'Creating...',
      createSuccess: 'Client created successfully',
      createError: 'Error creating client',
      deleteSuccess: 'Client deleted',
      deleteError: 'Error deleting client',
      confirmDelete: 'Are you sure you want to delete this client?',
      export: 'Export',
    },
    common: {
      loading: 'Loading...',
      cancel: 'Cancel',
      save: 'Save',
      add: 'Add',
      adding: 'Adding...',
      delete: 'Delete',
      close: 'Close',
      reset: 'Reset to default',
      required: '*',
    },
    search: {
      placeholder: 'Search products, movements, locations… (Ctrl+K)',
      searching: 'Searching...',
      noResults: 'No results found.',
      categories: 'Categories',
      locations: 'Locations',
      resultsFound: 'results found',
      navigate: 'navigate',
      select: 'open',
      closeHint: 'close',
      voiceStart: 'Voice search',
      voiceStop: 'Stop listening',
      voiceListening: '🎤 Speak now…',
      voiceUnsupported: 'Voice search not supported in this browser',
      voiceDenied: 'Microphone access denied',
      voiceNoSpeech: 'No speech detected, try again',
    },
    scanner: {
      title: 'Scan a code',
      instructions: 'Place the barcode or QR code in front of the camera.',
      scanButton: 'Scan',
      cancel: 'Cancel',
      noCamera: 'No camera detected on this device.',
      permissionDenied: 'Camera access denied. Please allow access in your browser settings.',
      productFound: 'Product found',
      productNotFound: 'No product matches the code',
    },
  },

  // ═══════════════ العربية ═══════════════
  ar: {
    nav: {
      dashboard: 'لوحة التحكم',
      products: 'المنتجات',
      storage: 'التخزين',
      movements: 'الحركات',
      alerts: 'التنبيهات',
      suppliers: 'الموردون',
      clients: 'العملاء',
      users: 'المستخدمون',
      license: 'الترخيص',
      settings: 'الإعدادات',
      allSites: 'جميع المواقع',
      logout: 'تسجيل الخروج',
    },
    login: {
      tagline: 'إدارة المخزون الذكية',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      submit: 'تسجيل الدخول',
      loading: 'جاري الاتصال...',
      welcome: 'مرحبا !',
      invalidCredentials: 'بيانات الدخول غير صحيحة',
    },
    dashboard: {
      title: 'لوحة التحكم',
      activeProducts: 'المنتجات النشطة',
      recentMovements: 'الحركات الأخيرة',
      activeAlerts: 'التنبيهات النشطة',
      totalOps: 'العمليات (الإجمالي)',
      quickActions: 'إجراءات سريعة',
      lastMovements: 'آخر الحركات',
      noMovements: 'لا توجد حركات مسجلة.',
      stockIn: '+ إدخال مخزون',
      stockOut: '+ إخراج مخزون',
      transfer: '↔ تحويل',
      adjustment: '± تعديل',
    },
    products: {
      title: 'المنتجات',
      import: 'استيراد',
      importing: 'جاري الاستيراد...',
      export: 'تصدير',
      newProduct: 'منتج جديد',
      searchPlaceholder: 'البحث بالرمز أو الاسم أو الباركود...',
      sku: 'الرمز',
      name: 'الاسم',
      category: 'التصنيف',
      unit: 'الوحدة',
      barcode: 'الباركود',
      status: 'الحالة',
      active: 'نشط',
      inactive: 'غير نشط',
      loading: 'جاري التحميل...',
      noProducts: 'لم يتم العثور على منتجات',
      page: 'صفحة',
      previous: 'السابق',
      next: 'التالي',
      importSuccess: 'تم الاستيراد',
      exportSuccess: 'تم تحميل التصدير',
      exportError: 'خطأ في التصدير',
    },
    movements: {
      title: 'حركات المخزون',
      entry: '+ إدخال',
      exit: '+ إخراج',
      transfer: '↔ تحويل',
      ref: 'المرجع',
      type: 'النوع',
      product: 'المنتج',
      quantity: 'الكمية',
      by: 'بواسطة',
      date: 'التاريخ',
      loading: 'جاري التحميل...',
      noMovements: 'لا توجد حركات',
      typeLabels: { IN: 'إدخال', OUT: 'إخراج', TRANSFER: 'تحويل', ADJUSTMENT: 'تعديل' },
      exitVoucher: 'بطاقة إخراج',
      supplier: 'المورد',
      client: 'العميل',
    },
    voucher: {
      title: 'بطاقة إخراج من المخزون',
      date: 'التاريخ',
      voucherNumber: 'رقم البطاقة',
      sku: 'المرجع',
      product: 'التعيين',
      quantity: 'الكمية',
      unit: 'الوحدة',
      sourceLocation: 'الموقع',
      reason: 'السبب',
      ref: 'مرجع الحركة',
      preparedBy: 'أعدّ من طرف',
      approvedBy: 'صادق عليه',
      receivedBy: 'استلم من طرف',
      signature: 'التوقيع',
      print: 'طباعة',
      close: 'إغلاق',
      noExits: 'لا توجد عمليات إخراج للعرض.',
      page: 'صفحة',
      of: 'من',
      generatedOn: 'أُنشئ في',
      totalItems: 'مجموع الأصناف',
      totalQuantity: 'الكمية الإجمالية',
    },
    alerts: {
      title: 'التنبيهات',
      statusLabels: { TRIGGERED: 'نشط', ACKNOWLEDGED: 'تم الإقرار', RESOLVED: 'تم الحل' },
      stock: 'المخزون:',
      minThreshold: 'الحد الأدنى:',
      safety: 'مخزون الأمان:',
      site: 'الموقع:',
      loading: 'جاري التحميل...',
      noAlerts: 'لا توجد تنبيهات نشطة. كل شيء على ما يرام!',
    },
    storage: {
      title: 'هيكل التخزين',
      newSite: 'موقع جديد',
      loading: 'جاري التحميل...',
      noSites: 'لا توجد مواقع. أنشئ موقعك الأول.',
      createSite: 'موقع جديد',
      siteName: 'اسم الموقع',
      siteCode: 'الرمز',
      siteType: 'النوع',
      siteAddress: 'العنوان',
      typeWarehouse: 'مستودع',
      typeStore: 'متجر',
      typeOther: 'آخر',
      cancel: 'إلغاء',
      save: 'إنشاء الموقع',
      saving: 'جاري الإنشاء...',
      success: 'تم إنشاء الموقع بنجاح',
      error: 'خطأ في إنشاء الموقع',
      editSite: 'تعديل الموقع',
      updateSuccess: 'تم تعديل الموقع بنجاح',
      updateError: 'خطأ في تعديل الموقع',
      deleteSite: 'حذف الموقع',
      deleteConfirm: 'هل أنت متأكد من حذف هذا الموقع؟',
      deleteSuccess: 'تم حذف الموقع بنجاح',
      deleteError: 'خطأ في حذف الموقع',
      confirm: 'تأكيد',
      zones: 'مناطق',
      // Zone
      viewZones: 'عرض المناطق',
      newZone: 'منطقة جديدة',
      noZones: 'لا توجد مناطق. أنشئ منطقتك الأولى.',
      createZone: 'إنشاء منطقة',
      editZone: 'تعديل المنطقة',
      deleteZone: 'حذف المنطقة',
      zoneName: 'اسم المنطقة',
      zoneCode: 'الرمز',
      zoneType: 'النوع',
      typeAisle: 'ممر',
      typeShelf: 'رف',
      typeArea: 'منطقة',
      typeZoneOther: 'آخر',
      zoneSuccess: 'تم إنشاء المنطقة بنجاح',
      zoneError: 'خطأ في إنشاء المنطقة',
      zoneUpdateSuccess: 'تم تعديل المنطقة بنجاح',
      zoneUpdateError: 'خطأ في تعديل المنطقة',
      zoneDeleteSuccess: 'تم حذف المنطقة بنجاح',
      zoneDeleteError: 'خطأ في حذف المنطقة',
      zoneDeleteConfirm: 'هل أنت متأكد من حذف هذه المنطقة؟',
      locations: 'مواقع',
      // Location
      viewLocations: 'عرض المواقع',
      newLocation: 'موقع جديد',
      noLocations: 'لا توجد مواقع. أنشئ موقعك الأول.',
      createLocation: 'موقع جديد',
      editLocation: 'تعديل الموقع',
      deleteLocation: 'حذف الموقع',
      locationCode: 'الرمز',
      locationLabel: 'التسمية',
      locationCapacity: 'السعة القصوى',
      locationSuccess: 'تم إنشاء الموقع بنجاح',
      locationError: 'خطأ في إنشاء الموقع',
      locationUpdateSuccess: 'تم تعديل الموقع بنجاح',
      locationUpdateError: 'خطأ في تعديل الموقع',
      locationDeleteSuccess: 'تم حذف الموقع بنجاح',
      locationDeleteError: 'خطأ في حذف الموقع',
      locationDeleteConfirm: 'هل أنت متأكد من حذف هذا الموقع؟',
      // Breadcrumb
      backToSites: 'العودة إلى المواقع',
      backToZones: 'العودة إلى المناطق',
    },
    createProduct: {
      title: 'منتج جديد',
      sku: 'الرمز',
      barcode: 'الباركود',
      productName: 'اسم المنتج',
      category: 'التصنيف',
      unitOfMeasure: 'وحدة القياس',
      noneOption: '— بدون —',
      cancel: 'إلغاء',
      create: 'إنشاء المنتج',
      creating: 'جاري الإنشاء...',
      success: 'تم إنشاء المنتج بنجاح',
      error: 'خطأ في إنشاء المنتج',
    },
    createMovement: {
      title: 'حركة جديدة',
      movementType: 'نوع الحركة',
      typeLabels: { IN: 'إدخال مخزون', OUT: 'إخراج مخزون', TRANSFER: 'تحويل', ADJUSTMENT: 'تعديل' },
      product: 'المنتج',
      selectOption: '— اختيار —',
      sourceLocation: 'موقع المصدر',
      destLocation: 'موقع الوجهة',
      quantity: 'الكمية',
      reason: 'السبب',
      reasonPlaceholder: 'استلام من المورد...',
      cancel: 'إلغاء',
      save: 'حفظ',
      saving: 'جاري الحفظ...',
      success: 'تم تسجيل الحركة',
      error: 'خطأ في تسجيل الحركة',
      supplier: 'المورد',
      client: 'العميل',
    },
    settings: {
      title: 'الإعدادات',
      appearance: 'المظهر والعلامة التجارية',
      appearanceDesc: 'تخصيص الاسم والشعار والألوان ونمط الواجهة لكل عميل.',
      customizeBtn: 'تخصيص الواجهة',
      users: 'إدارة المستخدمين',
      usersDesc: 'إدارة الحسابات والأدوار والوصول للمواقع.',
      manageUsersBtn: 'إدارة المستخدمين',
      customFields: 'الحقول المخصصة',
      customFieldsDesc: 'تحديد السمات الديناميكية حسب التصنيف (الحجم، اللون، تاريخ انتهاء الصلاحية...).',
      configureFieldsBtn: 'تكوين الحقول',
      thresholds: 'الحدود والتنبيهات',
      thresholdsDesc: 'تعيين الحد الأدنى للمخزون ومخزون الأمان ونقاط إعادة الطلب.',
      manageThresholdsBtn: 'إدارة الحدود',
      categories: 'التصنيفات',
      categoriesDesc: 'تنظيم المنتجات في شجرة تصنيفات.',
      manageCategoriesBtn: 'إدارة التصنيفات',
      language: 'اللغة',
      languageDesc: 'اختيار لغة عرض التطبيق.',
    },
    suppliers: {
      title: 'الموردون',
      newSupplier: 'مورد جديد',
      searchPlaceholder: 'بحث بالرمز أو الاسم أو جهة الاتصال...',
      code: 'الرمز',
      name: 'الاسم',
      contact: 'جهة الاتصال',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      address: 'العنوان',
      nif: 'رقم التعريف الجبائي',
      status: 'الحالة',
      active: 'نشط',
      inactive: 'غير نشط',
      productsCount: 'المنتجات',
      linkedProducts: 'المنتجات المرتبطة',
      noLinkedProducts: 'لا توجد منتجات مرتبطة',
      loading: 'جاري التحميل...',
      noSuppliers: 'لم يتم العثور على موردين',
      page: 'صفحة',
      previous: 'السابق',
      next: 'التالي',
      createTitle: 'مورد جديد',
      create: 'إنشاء المورد',
      creating: 'جاري الإنشاء...',
      createSuccess: 'تم إنشاء المورد بنجاح',
      createError: 'خطأ في إنشاء المورد',
      deleteSuccess: 'تم حذف المورد',
      deleteError: 'خطأ في حذف المورد',
      confirmDelete: 'هل أنت متأكد من حذف هذا المورد؟',
      export: 'تصدير',
    },
    clients: {
      title: 'العملاء',
      newClient: 'عميل جديد',
      searchPlaceholder: 'بحث بالرمز أو الاسم أو الرقم الضريبي...',
      code: 'الرمز',
      name: 'الاسم',
      type: 'النوع',
      typeLabels: { COMPANY: 'شركة', INDIVIDUAL: 'فرد', GOVERNMENT: 'إدارة حكومية', OTHER: 'أخرى' },
      contact: 'جهة الاتصال',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      address: 'العنوان',
      taxId: 'الرقم الضريبي',
      nif: 'رقم التعريف الجبائي',
      status: 'الحالة',
      active: 'نشط',
      inactive: 'غير نشط',
      movementsCount: 'الحركات',
      loading: 'جاري التحميل...',
      noClients: 'لم يتم العثور على عملاء',
      page: 'صفحة',
      previous: 'السابق',
      next: 'التالي',
      createTitle: 'عميل جديد',
      create: 'إنشاء العميل',
      creating: 'جاري الإنشاء...',
      createSuccess: 'تم إنشاء العميل بنجاح',
      createError: 'خطأ في إنشاء العميل',
      deleteSuccess: 'تم حذف العميل',
      deleteError: 'خطأ في حذف العميل',
      confirmDelete: 'هل أنت متأكد من حذف هذا العميل؟',
      export: 'تصدير',
    },
    common: {
      loading: 'جاري التحميل...',
      cancel: 'إلغاء',
      save: 'حفظ',
      add: 'إضافة',
      adding: 'جاري الإضافة...',
      delete: 'حذف',
      close: 'إغلاق',
      reset: 'إعادة التعيين',
      required: '*',
    },
    search: {
      placeholder: 'بحث في المنتجات، الحركات، المواقع… (Ctrl+K)',
      searching: 'جاري البحث...',
      noResults: 'لم يتم العثور على نتائج.',
      categories: 'التصنيفات',
      locations: 'المواقع',
      resultsFound: 'نتائج',
      navigate: 'تنقل',
      select: 'فتح',
      closeHint: 'إغلاق',
      voiceStart: 'البحث الصوتي',
      voiceStop: 'إيقاف الاستماع',
      voiceListening: '🎤 تحدث الآن…',
      voiceUnsupported: 'البحث الصوتي غير مدعوم في هذا المتصفح',
      voiceDenied: 'تم رفض الوصول إلى الميكروفون',
      voiceNoSpeech: 'لم يتم اكتشاف صوت، حاول مرة أخرى',
    },
    scanner: {
      title: 'مسح الرمز',
      instructions: 'ضع الباركود أو رمز QR أمام الكاميرا.',
      scanButton: 'مسح',
      cancel: 'إلغاء',
      noCamera: 'لم يتم اكتشاف كاميرا على هذا الجهاز.',
      permissionDenied: 'تم رفض الوصول إلى الكاميرا. يرجى السماح بالوصول في إعدادات المتصفح.',
      productFound: 'تم العثور على المنتج',
      productNotFound: 'لا يوجد منتج يطابق الرمز',
    },
  },
};
