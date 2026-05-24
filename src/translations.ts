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
    syncStatusRunning: "Updating database from Fandom NMS Wiki..."
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
    syncStatusRunning: "Actualizando base de datos desde la Wiki NMS..."
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
    syncStatusRunning: "Mise à jour de la base de données à partir de FND Wiki..."
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
    syncStatusRunning: "Aktualisiere Datenbank vom No Man's Sky Wiki..."
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
    syncStatusRunning: "Atualizando banco de dados através da NMS Wiki da Fandom..."
  }
};

export const languageNames: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português (Brasil)"
};
