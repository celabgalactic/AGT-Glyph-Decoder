/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SupportedLanguage } from './types';

export interface TranslationSet {
  title: string;
  header: string;
  button: string;
  portalCode: string;
  copyButton: string;
  copiedSuccess: string;
  copiedFail: string;
  glyphinput: string;
  fullportalcode: string;
  selectGalaxy: string;
  selectCivilization: string;
  selectRegion: string;
  loadingGalaxies: string;
  loadingCivilizations: string;
  loadingRegions: string;
  selectGalaxyFirst: string;
  selectCivilizationFirst: string;
  noRegionsFound: string;
  loadError: string;
  fetchError: string;
  regionSelection: string;
  galaxy: string;
  civilization: string;
  region: string;
  loadingData: string;
  estimatedTime: string;
  estimatedTimeSeconds: string;
  complete: string;
  updatingFinish: string;
  updatingInfo: string;
  syncDataBtn: string;
  syncTitle: string;
  syncIntro: string;
  forceSyncNote: string;
  syncStatusIdle: string;
  syncStatusRunning: string;

  // New keys requested for translation
  exactLocationTitle: string;
  galacticCoordinatesLabel: string;
  glyphs12CharsLabel: string;
  lengthLabel: string;
  validKeysLabel: string;
  generateGlyphsBtn: string;
  generalRandomRegionGlyphsBtn: string;
  portalSignalSpectrumTitle: string;
  glyphTranslationMythosTitle: string;
  glyphHoverInstructions: string;
  miniNaviRegionLocatorTitle: string;
  activeTargetLock: string;
  dragToRotateLabel: string;
  signalTarget: string;
  signalLockLocation: string;
  sectorRegister: string;
  galaxyLabel: string;
  portalDecouplingCalculationsTitle: string;
  xGridOffset: string;
  yOffset: string;
  zGridOffset: string;
  coreLabel: string;
  glyphGenerator: string;
}

export const translations: Record<SupportedLanguage, TranslationSet> = {
  en: {
    title: "NMS Glyph Generator",
    header: "NMS Glyph Generator",
    button: "Generate Glyphs",
    portalCode: "Portal Code:",
    copyButton: "Copy Code",
    copiedSuccess: "Code copied to clipboard!",
    copiedFail: "Error copying the code.",
    glyphinput: "Enter glyphs (12): Optional",
    fullportalcode: "You need to insert the full portal code!",
    selectGalaxy: "Select Galaxy",
    selectCivilization: "Select Civilization",
    selectRegion: "Select Region",
    loadingGalaxies: "Loading galaxies...",
    loadingCivilizations: "Loading civilizations...",
    loadingRegions: "Loading regions...",
    selectGalaxyFirst: "Select a galaxy first",
    selectCivilizationFirst: "Select a civilization first",
    noRegionsFound: "No regions found",
    loadError: "Error loading data",
    fetchError: "Error fetching data",
    regionSelection: "Region Selection",
    galaxy: "Galaxy",
    civilization: "Civilization",
    region: "Region",
    loadingData: "Loading data...",
    estimatedTime: "{{minutes}}m {{seconds}}s remaining",
    estimatedTimeSeconds: "{{seconds}}s remaining",
    complete: "Complete!",
    updatingFinish: "The regions update is complete.",
    updatingInfo: "The region update may take more than 5 minutes, please be patient.",
    syncDataBtn: "Fetch Online Updates",
    syncTitle: "Fandom wiki cargo synchronization",
    syncIntro: "Retrieves the latest civilized galaxies, hubs, and coordinates database directly from Fandom cargo tables recursively.",
    forceSyncNote: "Runs a throttling process with 35s intervals to protect Wiki APIs from rate-limits.",
    syncStatusIdle: "Database is updated with static presets. Perform online sync if needed.",
    syncStatusRunning: "Updating database from Fandom NMS Wiki...",

    exactLocationTitle: "Exact Location",
    galacticCoordinatesLabel: "GALACTIC COORDINATES (XXXX:YYYY:ZZZZ:SSSS)",
    glyphs12CharsLabel: "Glyphs (12 Characters)",
    lengthLabel: "LENGTH",
    validKeysLabel: "VALID KEYS: 0-9, A-F",
    generateGlyphsBtn: "Generate Glyphs",
    generalRandomRegionGlyphsBtn: "General random region glyphs",
    portalSignalSpectrumTitle: "PORTAL SIGNAL SPECTRUM",
    glyphTranslationMythosTitle: "Glyph Translation & Mythos",
    glyphHoverInstructions: "// Hover or touch any glyph in the spectrum above to translate system mythos details.",
    miniNaviRegionLocatorTitle: "AGT Mini Navi Region Locator",
    activeTargetLock: "ACTIVE TARGET LOCK",
    dragToRotateLabel: "DRAG TO ROTATE // WHEEL OR SCROLL TO ZOOM",
    signalTarget: "SIGNAL TARGET",
    signalLockLocation: "SIGNAL LOCK LOCATION",
    sectorRegister: "Sector Register",
    galaxyLabel: "Galaxy",
    portalDecouplingCalculationsTitle: "Portal Decoupling Calculations",
    xGridOffset: "X GRID OFFSET",
    yOffset: "Y OFFSET",
    zGridOffset: "Z GRID OFFSET",
    coreLabel: "CORE",
    glyphGenerator: "Glyph Generator"
  },
  es: {
    title: "Generador de Glifos NMS",
    header: "Generador de Glifos NMS",
    button: "Generar Glifos",
    portalCode: "Código del Portal:",
    copyButton: "Copiar Código",
    copiedSuccess: "¡Código copiado al portapapeles!",
    copiedFail: "Error al copiar el código.",
    glyphinput: "Introduce glifos (12): Opcional",
    fullportalcode: "¡Es necesario insertar el código completo del portal!",
    selectGalaxy: "Seleccionar Galaxia",
    selectCivilization: "Seleccionar Civilización",
    selectRegion: "Seleccionar Región",
    loadingGalaxies: "Cargando galaxias...",
    loadingCivilizations: "Cargando civilizaciones...",
    loadingRegions: "Cargando regiones...",
    selectGalaxyFirst: "Selecciona una galaxia primero",
    selectCivilizationFirst: "Selecciona una civilización primero",
    noRegionsFound: "No se encontraron regiones",
    loadError: "Error cargando datos",
    fetchError: "Error obteniendo datos",
    regionSelection: "Selección de Región",
    galaxy: "Galaxia",
    civilization: "Civilización",
    region: "Región",
    loadingData: "Cargando datos...",
    estimatedTime: "{{minutes}}m {{seconds}}s restantes",
    estimatedTimeSeconds: "{{seconds}}s restantes",
    complete: "¡Completado!",
    updatingFinish: "Se ha terminado de actualizar las regiones.",
    updatingInfo: "La actualización de regiones puede tardar más de 5 minutos, sea paciente por favor.",
    syncDataBtn: "Buscar Actualizaciones Online",
    syncTitle: "Sincronización Cargo de Fandom",
    syncIntro: "Recupera de forma recursiva la base de datos de galaxias, centros y coordenadas civilizados más reciente desde Fandom.",
    forceSyncNote: "Ejecuta un proceso regulado con intervalos de 35s para proteger las API de Wiki de límites de velocidad.",
    syncStatusIdle: "Base de datos precargada con datos estáticos. Puede refrescarla con el servidor si lo desea.",
    syncStatusRunning: "Actualizando base de datos desde la Wiki NMS...",

    exactLocationTitle: "Ubicación Exacta",
    galacticCoordinatesLabel: "COORDENADAS GALÁCTICAS (XXXX:YYYY:ZZZZ:SSSS)",
    glyphs12CharsLabel: "Glifos (12 Caracteres)",
    lengthLabel: "LONGITUD",
    validKeysLabel: "TECLAS VÁLIDAS: 0-9, A-F",
    generateGlyphsBtn: "Generar Glifos",
    generalRandomRegionGlyphsBtn: "Glifos de región aleatorios generales",
    portalSignalSpectrumTitle: "ESPECTRO DE SEÑAL DEL PORTAL",
    glyphTranslationMythosTitle: "Traducción de Glifos y Mito",
    glyphHoverInstructions: "// Pasa el cursor o toca cualquier glifo en el espectro de arriba para traducir los detalles del mito del sistema.",
    miniNaviRegionLocatorTitle: "Localizador de Región AGT Mini Navi",
    activeTargetLock: "BLOQUEO DE OBJETIVO ACTIVO",
    dragToRotateLabel: "ARRASTRAR PARA ROTAR // RUEDA O DESPLAZAR PARA ZOOM",
    signalTarget: "OBJETIVO DE SEÑAL",
    signalLockLocation: "UBICACIÓN DE BLOQUEO DE SEÑAL",
    sectorRegister: "Registro de Sector",
    galaxyLabel: "Galaxia",
    portalDecouplingCalculationsTitle: "Cálculos de Desacoplamiento del Portal",
    xGridOffset: "DOBLE DESPLAZAMIENTO X",
    yOffset: "DESPLAZAMIENTO Y",
    zGridOffset: "DOBLE DESPLAZAMIENTO Z",
    coreLabel: "NÚCLEO",
    glyphGenerator: "Generador de Glifos"
  },
  fr: {
    title: "Générateur de glyphes NMS",
    header: "Générateur de glyphes NMS",
    button: "Générer des glyphes",
    portalCode: "Code du portail:",
    copyButton: "Copier le code",
    copiedSuccess: "Code copié dans le presse-papiers!",
    copiedFail: "Erreur lors de la copie du code.",
    glyphinput: "Entrez les glyphes (12): Optionnel",
    fullportalcode: "Vous devez insérer le code complet du portail!",
    selectGalaxy: "Sélectionner la Galaxie",
    selectCivilization: "Sélectionner la Civilisation",
    selectRegion: "Sélectionner la Région",
    loadingGalaxies: "Chargement des galaxies...",
    loadingCivilizations: "Chargement des civilisations...",
    loadingRegions: "Chargement des régions...",
    selectGalaxyFirst: "Sélectionnez d'abord une galaxie",
    selectCivilizationFirst: "Sélectionnez d'abord une civilisation",
    noRegionsFound: "Aucune région trouvée",
    loadError: "Erreur de chargement des données",
    fetchError: "Erreur de récupération des données",
    regionSelection: "Sélection de Région",
    galaxy: "Galaxie",
    civilization: "Civilisation",
    region: "Région",
    loadingData: "Chargement des données...",
    estimatedTime: "environ {{minutes}}m {{seconds}}s restantes",
    estimatedTimeSeconds: "environ {{seconds}}s restantes",
    complete: "Terminé!",
    updatingFinish: "La mise à jour des régions est terminée.",
    updatingInfo: "La mise à jour de la région peut prendre plus de 5 minutes. Veuillez patienter.",
    syncDataBtn: "Rechercher des Mises à jour",
    syncTitle: "Synchronisation Fandom Wiki Cargo",
    syncIntro: "Récupère de manière récursive la base de données des galaxies, hubs et coordonnées civilisées directement depuis Fandom.",
    forceSyncNote: "Exécute un processus à intervalle de 35s pour protéger les API du Wiki contre les limites de débit.",
    syncStatusIdle: "La base de données contient des préréglages statiques de secours. Vous pouvez synchroniser si nécessaire.",
    syncStatusRunning: "Mise à jour de la base de données à partir de FND Wiki...",

    exactLocationTitle: "Emplacement Exact",
    galacticCoordinatesLabel: "COORDONNÉES GALACTIQUES (XXXX:YYYY:ZZZZ:SSSS)",
    glyphs12CharsLabel: "Glyphes (12 Caractères)",
    lengthLabel: "LONGUEUR",
    validKeysLabel: "TOUCHES VALIDES: 0-9, A-F",
    generateGlyphsBtn: "Générer les glyphes",
    generalRandomRegionGlyphsBtn: "Générer glyphes de région aléatoires",
    portalSignalSpectrumTitle: "SPECTRE DE SIGNAL DU PORTAIL",
    glyphTranslationMythosTitle: "Traduction des glyphes et mythes",
    glyphHoverInstructions: "// Survolez ou touchez un glyphe dans le spectre ci-dessus pour traduire les détails du mythe du système.",
    miniNaviRegionLocatorTitle: "Localisateur de région AGT Mini Navi",
    activeTargetLock: "VERROUILLAGE DE CIBLE ACTIF",
    dragToRotateLabel: "GLISSER POUR PIVOTER // MOLETTE OU DÉFILER POUR ZOOM",
    signalTarget: "CIBLE DU SIGNAL",
    signalLockLocation: "EMPLACEMENT DE VERROUILLAGE DU SIGNAL",
    sectorRegister: "Registre de Secteur",
    galaxyLabel: "Galaxie",
    portalDecouplingCalculationsTitle: "Calculs de découplage du portail",
    xGridOffset: "DÉCALAGE DE GRILLE X",
    yOffset: "DÉCALAGE Y",
    zGridOffset: "DÉCALAGE DE GRILLE Z",
    coreLabel: "CŒUR",
    glyphGenerator: "Générateur de glyphes"
  },
  de: {
    title: "NMS Glyphen-Generator",
    header: "NMS Glyphen-Generator",
    button: "Glyphen generieren",
    portalCode: "Portal-Code:",
    copyButton: "Code kopieren",
    copiedSuccess: "Code in die Zwischenablage kopiert!",
    copiedFail: "Fehler beim Kopieren des Codes.",
    glyphinput: "Glyphen eingeben (12): Optional",
    fullportalcode: "Sie müssen den vollständigen Portalcode eingeben!",
    selectGalaxy: "Galaxie auswählen",
    selectCivilization: "Zivilisation auswählen",
    selectRegion: "Region auswählen",
    loadingGalaxies: "Lade Galaxien...",
    loadingCivilizations: "Lade Zivilisationen...",
    loadingRegions: "Lade Regionen...",
    selectGalaxyFirst: "Wählen Sie zuerst eine Galaxie",
    selectCivilizationFirst: "Wählen Sie zuerst eine Zivilisation",
    noRegionsFound: "Keine Regionen gefunden",
    loadError: "Fehler beim Laden der Daten",
    fetchError: "Fehler beim Abrufen der Daten",
    regionSelection: "Regionenauswahl",
    galaxy: "Galaxie",
    civilization: "Zivilisation",
    region: "Region",
    loadingData: "Daten werden geladen...",
    estimatedTime: "Noch {{minutes}}m {{seconds}}s verbleibend",
    estimatedTimeSeconds: "Noch {{seconds}}s verbleibend",
    complete: "Fertig!",
    updatingFinish: "Die Aktualisierung der Regionen ist abgeschlossen.",
    updatingInfo: "Die Aktualisierung der Regionen kann länger als 5 Minuten dauern, bitte haben Sie Geduld.",
    syncDataBtn: "Online-Daten abrufen",
    syncTitle: "Fandom Wiki Cargo-Synchronisierung",
    syncIntro: "Ruft die Zivilisationen, Hubs und Koordinaten rekursiv von Fandom-Cargo-Tabellen ab.",
    forceSyncNote: "Läuft mit einem 35-Sekunden-Intervall zum Schutz der Wiki-API-Ratenlimits.",
    syncStatusIdle: "Die Datenbank ist mit statischen Presets geladen. Starten Sie ein Online-Sync falls gewünscht.",
    syncStatusRunning: "Aktualisiere Datenbank vom No Man's Sky Wiki...",

    exactLocationTitle: "Exakter Standort",
    galacticCoordinatesLabel: "GALAKTISCHE KOORDINATEN (XXXX:YYYY:ZZZZ:SSSS)",
    glyphs12CharsLabel: "Glyphen (12 Zeichen)",
    lengthLabel: "LÄNGE",
    validKeysLabel: "GÜLTIGE TASTEN: 0-9, A-F",
    generateGlyphsBtn: "Glyphen generieren",
    generalRandomRegionGlyphsBtn: "Generelle zufällige Regionsglyphen",
    portalSignalSpectrumTitle: "PORTALSIGNALSPEKTRUM",
    glyphTranslationMythosTitle: "Glyphen-Übersetzung & Mythos",
    glyphHoverInstructions: "// Bewegen Sie den Mauszeiger über eine Glyphe im obigen Spektrum oder berühren Sie sie, um Details zum Systemmythos zu übersetzen.",
    miniNaviRegionLocatorTitle: "AGT Mini Navi Regionensucher",
    activeTargetLock: "AKTIVER ZIELSPERRE",
    dragToRotateLabel: "ZIEHEN ZUM DREHEN // MAUSRAD ODER SCROLLEN ZUM ZOOMEN",
    signalTarget: "SIGNALZIEL",
    signalLockLocation: "SIGNAL-SPERRORT",
    sectorRegister: "Sektor-Register",
    galaxyLabel: "Galaxie",
    portalDecouplingCalculationsTitle: "Portal-Entkopplungsberechnungen",
    xGridOffset: "X-GITTER-VERSATZ",
    yOffset: "Y-VERSATZ",
    zGridOffset: "Z-GITTER-VERSATZ",
    coreLabel: "KERN",
    glyphGenerator: "Glyphen-Generator"
  },
  pt: {
    title: "Gerador de Glifos NMS",
    header: "Gerador de Glifos NMS",
    button: "Gerar Glifos",
    portalCode: "Código do Portal:",
    copyButton: "Copiar Código",
    copiedSuccess: "Código copiado para a área de transferência!",
    copiedFail: "Erro ao copiar o código.",
    glyphinput: "Inserir glifos (12): Opcional",
    fullportalcode: "Você precisa inserir o código do portal completo!",
    selectGalaxy: "Selecionar Galáxia",
    selectCivilization: "Selecionar Civilização",
    selectRegion: "Selecionar Região",
    loadingGalaxies: "Carregando galáxias...",
    loadingCivilizations: "Carregando civilizações...",
    loadingRegions: "Carregando regiões...",
    selectGalaxyFirst: "Selecione uma galáxia primeiro",
    selectCivilizationFirst: "Selecione uma civilização primeiro",
    noRegionsFound: "Nenhuma região encontrada",
    loadError: "Erro ao carregar dados",
    fetchError: "Erro ao buscar dados",
    regionSelection: "Seleção de Região",
    galaxy: "Galáxia",
    civilization: "Civilização",
    region: "Região",
    loadingData: "Carregando dados...",
    estimatedTime: "~{{minutes}}m {{seconds}}s restantes",
    estimatedTimeSeconds: "~{{seconds}}s restantes",
    complete: "Concluído!",
    updatingFinish: "A atualização das regiões está completa.",
    updatingInfo: "A atualização das regiões pode levar mais de 5 minutos, por favor seja paciente.",
    syncDataBtn: "Buscar Atualizações Online",
    syncTitle: "Sincronização de Cargo da Fandom Wiki",
    syncIntro: "Recupera o banco de dados mais recente de galáxias civilizadas, hubs e coordenadas diretamente das tabelas de cargo da Fandom recursivamente.",
    forceSyncNote: "Executa um processo de limitação com intervalos de 35s para proteger as APIs da Wiki de limites de taxa.",
    syncStatusIdle: "O banco de dados está atualizado com predefinições estáticas. Realize a sincronização online se necessário.",
    syncStatusRunning: "Atualizando banco de dados através da NMS Wiki da Fandom...",

    exactLocationTitle: "Localização Exata",
    galacticCoordinatesLabel: "COORDENADAS GALÁCTICAS (XXXX:YYYY:ZZZZ:SSSS)",
    glyphs12CharsLabel: "Glifos (12 Caracteres)",
    lengthLabel: "COMPRIMENTO",
    validKeysLabel: "TECLAS VÁLIDAS: 0-9, A-F",
    generateGlyphsBtn: "Gerar Glifos",
    generalRandomRegionGlyphsBtn: "Gerar glifos de região aleatórios gerais",
    portalSignalSpectrumTitle: "ESPECTRO DE SINAL DO PORTAL",
    glyphTranslationMythosTitle: "Tradução de Glifos e Mitos",
    glyphHoverInstructions: "// Passe o mouse ou toque em qualquer glifo no espectro acima para traduzir detalhes do mito do sistema.",
    miniNaviRegionLocatorTitle: "Localizador de Região AGT Mini Navi",
    activeTargetLock: "BLOQUEIO DE ALVO ATIVO",
    dragToRotateLabel: "ARRASTE PARA ROTACIONAR // RODA OU ROLAGEM PARA ZOOM",
    signalTarget: "ALVO DO SINAL",
    signalLockLocation: "LOCALIZAÇÃO DO BLOQUEIO DE SINAL",
    sectorRegister: "Registro do Setor",
    galaxyLabel: "Galáxia",
    portalDecouplingCalculationsTitle: "Cálculos de Desacoplamento do Portal",
    xGridOffset: "DESLOCAMENTO DE GRADE X",
    yOffset: "DESLOCAMENTO Y",
    zGridOffset: "DESLOCAMENTO DE GRADE Z",
    coreLabel: "NÚCLEO",
    glyphGenerator: "Gerador de Glifos"
  }
};

export const languageNames: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português (Brasil)"
};

export interface LocalizedGlyph {
  name: string;
  desc: string;
}

export const glyphTranslations: Record<SupportedLanguage, Record<string, LocalizedGlyph>> = {
  en: {
    '0': { name: 'Sunset', desc: "The Sunset glyph, representing the traveler's beginning and warmth." },
    '1': { name: 'Bird', desc: 'The Bird glyph, symbolizes flight, freedom, and sky exploration.' },
    '2': { name: 'Face', desc: 'The Face glyph, also referred to as the Pilgrim or mask.' },
    '3': { name: 'Diplo', desc: 'The dinosaur/diplo glyph, symbolizing prehistoric giant fauna.' },
    '4': { name: 'Eclipse', desc: 'The Eclipse glyph, visualizing overlapping celestial spheres.' },
    '5': { name: 'Balloon', desc: 'The Balloon or Anomaly glyph, representing light gas-filled structures.' },
    '6': { name: 'Boat', desc: 'The Boat key, symbolizing oceanic travel and naval navigation.' },
    '7': { name: 'Dragonfly', desc: 'The Dragonfly or insect glyph, represents lightweight micro-flight.' },
    '8': { name: 'Beetle', desc: 'The Beetle key, representing hard-shelled lifeforms.' },
    '9': { name: 'Galaxy', desc: 'The Galaxy or Spiral spiral, representing sprawling stellar systems.' },
    'A': { name: 'Voxel', desc: 'The Voxel or Cube key, denoting digital creation and physical materials.' },
    'B': { name: 'Whale', desc: 'The Whale key, symbolizing cosmic behemoths drifting across nebulas.' },
    'C': { name: 'Tent', desc: 'The Tent or camp glyph, denotes survival shelters and basic settlements.' },
    'D': { name: 'Shield', desc: 'The Shield or buckle, symbolizing protection and defensive hardware.' },
    'E': { name: 'Tree', desc: 'The Tree glyph, representing organic roots, life and flora growth.' },
    'F': { name: 'Atlas', desc: 'The Atlas diamond glyph, representing the core intelligence of the simulation.' }
  },
  es: {
    '0': { name: 'Atardecer', desc: "El glifo del Atardecer, que representa el comienzo y la calidez del viajero." },
    '1': { name: 'Pájaro', desc: "El glifo del Pájaro, que simboliza el vuelo, la libertad y la exploración del cielo." },
    '2': { name: 'Cara', desc: "El glifo de la Cara, también conocido como el Peregrino o máscara." },
    '3': { name: 'Diplo', desc: "El glifo del dinosaurio/diplo, que simboliza la fauna gigante prehistórica." },
    '4': { name: 'Eclipse', desc: "El glifo del Eclipse, que visualiza esferas celestes superpuestas." },
    '5': { name: 'Globo', desc: "El glifo del Globo o Anomalía, que representa estructuras ligeras llenas de gas." },
    '6': { name: 'Barco', desc: "La tecla del Barco, que simboliza los viajes oceánicos y la navegación naval." },
    '7': { name: 'Libélula', desc: "El glifo de la Libélula o insecto, que representa el microvuelo ligero." },
    '8': { name: 'Escarabajo', desc: "La tecla del Escarabajo, que representa formas de vida con caparazón duro." },
    '9': { name: 'Galaxia', desc: "El glifo de la Galaxia o Espiral, que representa extensos sistemas estelares." },
    'A': { name: 'Vóxel', desc: "La tecla de Vóxel o Cubo, que denota creación digital y materiales físicos." },
    'B': { name: 'Ballena', desc: "La tecla de la Ballena, que simboliza gigantes cósmicos a la deriva por nebulosas." },
    'C': { name: 'Tienda', desc: "El glifo de la Tienda de campaña, que denota refugios de supervivencia y asentamientos básicos." },
    'D': { name: 'Escudo', desc: "El glifo del Escudo o hebilla, que simboliza protección y equipo de defensa." },
    'E': { name: 'Árbol', desc: "El glifo del Árbol, que representa raíces orgánicas, vida y crecimiento de la flora." },
    'F': { name: 'Atlas', desc: "El glifo de diamante del Atlas, que representa la inteligencia central de la simulación." }
  },
  fr: {
    '0': { name: 'Coucher de soleil', desc: "Le glyphe du Coucher de soleil, représentant le commencement et la chaleur du voyageur." },
    '1': { name: 'Oiseau', desc: "Le glyphe de l'Oiseau, symbolisant le vol, la liberté et l'exploration du ciel." },
    '2': { name: 'Visage', desc: "Le glyphe du Visage, également appelé le Pèlerin ou le masque." },
    '3': { name: 'Diplo', desc: "Le glyphe du dinosaure/diplo, symbolisant la faune géante préhistorique." },
    '4': { name: 'Éclipse', desc: "Le glyphe de l'Éclipse, visualisant le chevauchement de sphères célestes." },
    '5': { name: 'Ballon', desc: "Le glyphe du Ballon ou de l'Anomalie, représentant des structures légères remplies de gaz." },
    '6': { name: 'Bateau', desc: "La clé du Bateau, symbolisant le voyage océanique et la navigation navale." },
    '7': { name: 'Libellule', desc: "Le glyphe de la Libellule ou de l'insecte, représentant un vol léger." },
    '8': { name: 'Scarabée', desc: "La clé du Scarabée, représentant des formes de vie à carapace dure." },
    '9': { name: 'Galaxie', desc: "Le glyphe de la Galaxie ou de la Spirale, représentant de vastes systèmes stellaires." },
    'A': { name: 'Voxel', desc: "La clé du Voxel ou du Cube, indiquant la création numérique et les matériaux physiques." },
    'B': { name: 'Baleine', desc: "La clé de l'Orque/Baleine, symbolisant les géants cosmiques dérivant à travers les nébuleuses." },
    'C': { name: 'Tente', desc: "Le glyphe de la Tente, indiquant des abris de survie et des colonies de base." },
    'D': { name: 'Bouclier', desc: "Le glyphe du Bouclier, symbolisant la protection et l'équipement de défense." },
    'E': { name: 'Arbre', desc: "Le glyphe de l'Arbre, représentant les racines organiques, la vie et la croissance de la flore." },
    'F': { name: 'Atlas', desc: "Le glyphe de diamant d'Atlas, représentant l'intelligence centrale de la simulation." }
  },
  de: {
    '0': { name: 'Sonnenuntergang', desc: "Die Sonnenuntergangs-Glyphe, die den Anfang und die Wärme des Reisenden symbolisiert." },
    '1': { name: 'Vogel', desc: "Die Vogel-Glyphe symbolisiert Flug, Freiheit und die Erkundung des Himmels." },
    '2': { name: 'Gesicht', desc: "Die Gesichts-Glyphe, auch bekannt als der Pilger oder die Maske." },
    '3': { name: 'Diplo', desc: "Die Saurier/Diplo-Glyphe symbolisiert prähistorische Riesentiere." },
    '4': { name: 'Finsternis', desc: "Die Finsternis-Glyphe visualisiert überlappende Himmelskörper." },
    '5': { name: 'Ballon', desc: "Die Ballon- oder Anomalie-Glyphe, die leichte, gasgefüllte Strukturen darstellt." },
    '6': { name: 'Boot', desc: "Das Boot symbolisiert Seereisen und die Schifffahrt." },
    '7': { name: 'Libelle', desc: "Die Libellen- oder Insekten-Glyphe repräsentiert leichten Mikroflug." },
    '8': { name: 'Käfer', desc: "Die Käfer-Glyphe symbolisiert hartschalige Lebensformen." },
    '9': { name: 'Galaxie', desc: "Die Galaxie- oder Spiralglyphe, die weite Sternensysteme darstellt." },
    'A': { name: 'Voxel', desc: "Die Voxel- oder Würfel-Glyphe steht für digitale Schöpfung und physische Materie." },
    'B': { name: 'Wal', desc: "Die Wal-Glyphe symbolisiert kosmische Riesen, die durch Nebel treiben." },
    'C': { name: 'Zelt', desc: "Die Zelt- oder Lager-Glyphe steht für Überlebensunterkünfte und einfache Siedlungen." },
    'D': { name: 'Schild', desc: "Die Schild-Glyphe symbolisiert Schutz und defensive Ausrüstung." },
    'E': { name: 'Baum', desc: "Die Baum-Glyphe repräsentiert organische Wurzeln, Leben und das Wachstum der Pflanzenwelt." },
    'F': { name: 'Atlas', desc: "Die Atlas-Diamant-Glyphe, die die zentrale Intelligenz der Simulation darstellt." }
  },
  pt: {
    '0': { name: 'Pôr do sol', desc: "O glifo do Pôr do sol, representando o início e o calor do viajante." },
    '1': { name: 'Pássaro', desc: "O glifo do Pássaro, simboliza voo, liberdade e exploração espacial." },
    '2': { name: 'Rosto', desc: "O glifo do Rosto, também chamado de Peregrino ou máscara." },
    '3': { name: 'Diplo', desc: "O glifo do dinossauro/diplo, simbolizando a fauna gigante pré-histórica." },
    '4': { name: 'Eclipse', desc: "O glifo do Eclipse, visualizando a sobreposição de esferas celestes." },
    '5': { name: 'Balão', desc: "O glifo do Balão ou da Anomalia, representando estruturas leves cheias de gás." },
    '6': { name: 'Barco', desc: "O símbolo do Barco, correspondente a viagens oceânicas e navegação naval." },
    '7': { name: 'Libélula', desc: "O glifo da Libélula ou inseto, representa voos leves de escala reduzida." },
    '8': { name: 'Besouro', desc: "O símbolo do Besouro, representando formas de vida com carapaça dura." },
    '9': { name: 'Galáxia', desc: "O glifo da Galáxia ou Espiral, representando vastos sistemas estelares." },
    'A': { name: 'Voxel', desc: "O símbolo de Voxel ou Cubo, indicando desenvolvimento digital e matéria física." },
    'B': { name: 'Baleia', desc: "O símbolo da Baleia, representando gigantes cósmicos flutuando através de nebulosas." },
    'C': { name: 'Tenda', desc: "O glifo de Tenda ou acampamento, indicando abrigos de sobrevivência e colônias básicas." },
    'D': { name: 'Escudo', desc: "O glifo do Escudo, simbolizando proteção e equipamento defensivo." },
    'E': { name: 'Árvore', desc: "O glifo da Árvore, representando raízes orgânicas, vida e crescimento da flora." },
    'F': { name: 'Atlas', desc: "O glifo de diamante Atlas, representando a inteligência central da simulação." }
  }
};
