/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, ChangeEvent, useMemo } from 'react';
// @ts-ignore
import nmsFontUrl from './assets/fonts/NMS-Glyphs-Mono.ttf?inline';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  MapPin, 
  RotateCw, 
  Copy, 
  BookOpen, 
  Info, 
  TrendingUp, 
  Compass, 
  Check, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  Layers,
  Settings,
  Volume2,
  VolumeX,
  X,
  Trash2,
  ShieldAlert,
  Bug,
  Star,
  Edit2
} from 'lucide-react';
import { 
  DatabaseState, 
  SupportedLanguage, 
  SyncProgress, 
  RegionInfo 
} from './types';
import { translations, languageNames, glyphTranslations } from './translations';
import { 
  VALID_PORTAL_KEYS, 
  GLYPH_METADATA_LIST, 
  randomGlyph, 
  validateGlyphInput, 
  coords2Glyphs, 
  glyphs2Coords,
  generateGlyphs 
} from './utils';
import { GalaxyVisualizer3D } from './components/GalaxyVisualizer3D';

const CIVILIZATIONS_CACHE_KEY = 'nms_civilizations_cache';
const LANGUAGE_CACHE_KEY = 'i18nextLng';
const FANDOM_API_PATH = 'https://nomanssky.fandom.com/api.php';

interface FavoriteSequence {
  id: string;
  sequence: string;
  galaxy?: string;
  civilization?: string;
  region?: string;
  coordinates?: string;
  createdAt: string;
}

const favoritesTranslations: Record<SupportedLanguage, {
  title: string;
  clearAll: string;
  noFavorites: string;
  deleteTooltip: string;
  loadTooltip: string;
  saveTooltip: string;
  savedLabel: string;
  galaxy: string;
  civ: string;
  region: string;
  coords: string;
}> = {
  en: {
    title: "Favorites",
    clearAll: "Clear All Favorites",
    noFavorites: "No saved sequences found.",
    deleteTooltip: "Delete favorite",
    loadTooltip: "Load sequence",
    saveTooltip: "Save sequence",
    savedLabel: "SAVED",
    galaxy: "Galaxy",
    civ: "Civ",
    region: "Region",
    coords: "Coords"
  },
  es: {
    title: "Favoritos",
    clearAll: "Borrar Todos los Favoritos",
    noFavorites: "No se encontraron secuencias guardadas.",
    deleteTooltip: "Eliminar favorito",
    loadTooltip: "Cargar secuencia",
    saveTooltip: "Guardar secuencia",
    savedLabel: "GUARDADO",
    galaxy: "Galaxia",
    civ: "Civ",
    region: "Región",
    coords: "Coords"
  },
  fr: {
    title: "Favoris",
    clearAll: "Effacer tous les favoris",
    noFavorites: "Aucune séquence enregistrée trouvée.",
    deleteTooltip: "Supprimer le favori",
    loadTooltip: "Charger la séquence",
    saveTooltip: "Enregistrer la séquence",
    savedLabel: "ENREGISTRÉ",
    galaxy: "Galaxie",
    civ: "Civ",
    region: "Région",
    coords: "Coords"
  },
  de: {
    title: "Favoriten",
    clearAll: "Alle Favoriten löschen",
    noFavorites: "Keine gespeicherten Sequenzen gefunden.",
    deleteTooltip: "Favorit löschen",
    loadTooltip: "Sequenz laden",
    saveTooltip: "Sequenz speichern",
    savedLabel: "GESPEICHERT",
    galaxy: "Galaxie",
    civ: "Ziv",
    region: "Region",
    coords: "Koord"
  },
  pt: {
    title: "Favoritos",
    clearAll: "Limpar Todos os Favoritos",
    noFavorites: "Nenhuma sequência salva encontrada.",
    deleteTooltip: "Excluir favorito",
    loadTooltip: "Carregar sequência",
    saveTooltip: "Salvar sequência",
    savedLabel: "SALVO",
    galaxy: "Galáxia",
    civ: "Civ",
    region: "Região",
    coords: "Coords"
  },
  ja: {
    title: "お気に入り",
    clearAll: "すべてのお気に入りをクリア",
    noFavorites: "保存されたシーケンスはありません。",
    deleteTooltip: "お気に入りを削除",
    loadTooltip: "シーケンスを読み込む",
    saveTooltip: "シーケンスを保存",
    savedLabel: "保存済み",
    galaxy: "銀河",
    civ: "文明",
    region: "領域",
    coords: "座標"
  },
  zh: {
    title: "收藏夹",
    clearAll: "清除所有收藏",
    noFavorites: "没有找到已保存的序列。",
    deleteTooltip: "删除收藏",
    loadTooltip: "加载序列",
    saveTooltip: "保存序列",
    savedLabel: "已保存",
    galaxy: "星系",
    civ: "文明",
    region: "区域",
    coords: "坐标"
  },
  it: {
    title: "Preferiti",
    clearAll: "Cancella Tutti i Preferiti",
    noFavorites: "Nessuna sequenza salvata trovata.",
    deleteTooltip: "Elimina preferito",
    loadTooltip: "Carica sequenza",
    saveTooltip: "Salva sequenza",
    savedLabel: "SALVATO",
    galaxy: "Galassia",
    civ: "Civ",
    region: "Regione",
    coords: "Coord"
  },
  th: {
    title: "รายการโปรด",
    clearAll: "ล้างรายการโปรดทั้งหมด",
    noFavorites: "ไม่พบลำดับที่บันทึกไว้",
    deleteTooltip: "ลบรายการโปรด",
    loadTooltip: "โหลดลำดับ",
    saveTooltip: "บันทึกลำดับ",
    savedLabel: "บันทึกแล้ว",
    galaxy: "กาแล็กซี",
    civ: "อารยธรรม",
    region: "ภูมิภาค",
    coords: "พิกัด"
  },
  hi: {
    title: "पसंदीदा",
    clearAll: "सभी पसंदीदा साफ़ करें",
    noFavorites: "कोई सहेजा गया अनुक्रम नहीं मिला।",
    deleteTooltip: "पसंदीदा हटाएं",
    loadTooltip: "अनुक्रम लोड करें",
    saveTooltip: "अनुक्रम सहेजें",
    savedLabel: "सहेजा गया",
    galaxy: "आकाशगंगा",
    civ: "सभ्यता",
    region: "क्षेत्र",
    coords: "निर्देशांक"
  }
};

const claimTranslations: Record<SupportedLanguage, {
  title: string;
  regionName: string;
  placeholder: string;
  checkBtn: string;
  galaxy: string;
  region: string;
  civilization: string;
  sectorCoords: string;
  unclaimed: string;
  generateGlyphs: (r: string) => string;
  inquireTitle: string;
  inquireMessage: string;
  statusTitle: string;
  statusUnclaimedMessage: string;
  statusClaimedMessage: (civ: string) => string;
}> = {
  en: {
    title: "Check Region Claim",
    regionName: "Region Name",
    placeholder: "Enter region name to inspect...",
    checkBtn: "Check",
    galaxy: "GALAXY:",
    region: "REGION:",
    civilization: "CIVILIZATION:",
    sectorCoords: "SECTOR COORDS:",
    unclaimed: "Unclaimed",
    generateGlyphs: (r) => `Generate Glyphs for ${r}`,
    inquireTitle: "Region Inquire",
    inquireMessage: "Region is not in the database and is likely unclaimed.",
    statusTitle: "Claim Status",
    statusUnclaimedMessage: "This region is recorded as currently unclaimed",
    statusClaimedMessage: (civ) => `This region is claimed by ${civ}`
  },
  es: {
    title: "Cotejar Reclamación",
    regionName: "Nombre de la Región",
    placeholder: "Introduce el nombre de la región...",
    checkBtn: "Comprobar",
    galaxy: "GALAXIA:",
    region: "REGIÓN:",
    civilization: "CIVILIZACIÓN:",
    sectorCoords: "COORDENADAS DE SECTOR:",
    unclaimed: "No reclamada",
    generateGlyphs: (r) => `Generar Glifos para ${r}`,
    inquireTitle: "Consulta de Región",
    inquireMessage: "La región no está en la base de datos y es probable que no esté reclamada.",
    statusTitle: "Estado de Reclamación",
    statusUnclaimedMessage: "Esta región está registrada como actualmente no reclamada",
    statusClaimedMessage: (civ) => `Esta región está reclamada por ${civ}`
  },
  fr: {
    title: "Vérifier la Revendication",
    regionName: "Nom de la Région",
    placeholder: "Saisir le nom de la région...",
    checkBtn: "Vérifier",
    galaxy: "GALAXIE:",
    region: "RÉGION:",
    civilization: "CIVILISATION:",
    sectorCoords: "COORDONNÉES DU SECTEUR:",
    unclaimed: "Non revendiquée",
    generateGlyphs: (r) => `Générer des glyphes pour ${r}`,
    inquireTitle: "Enquête de Région",
    inquireMessage: "La région n'est pas dans la base de données et est probablement non revendiquée.",
    statusTitle: "Statut de Revendication",
    statusUnclaimedMessage: "Cette région est enregistrée comme actuellement non revendiquée",
    statusClaimedMessage: (civ) => `Cette région est revendiquée par ${civ}`
  },
  de: {
    title: "Anspruch prüfen",
    regionName: "Region Name",
    placeholder: "Regionsnamen eingeben...",
    checkBtn: "Prüfen",
    galaxy: "GALAXIE:",
    region: "REGION:",
    civilization: "ZIVILISATION:",
    sectorCoords: "SEKTOR-KOORDINATEN:",
    unclaimed: "Unbeansprucht",
    generateGlyphs: (r) => `Glyphen für ${r} generieren`,
    inquireTitle: "Regionsabfrage",
    inquireMessage: "Region ist nicht in der Datenbank und wahrscheinlich unbeansprucht.",
    statusTitle: "Anspruchsstatus",
    statusUnclaimedMessage: "Diese Region ist derzeit als unbeansprucht registriert",
    statusClaimedMessage: (civ) => `Diese Region wird von ${civ} beansprucht`
  },
  pt: {
    title: "Verificar Reivindicação",
    regionName: "Nome da Região",
    placeholder: "Insira o nome da região...",
    checkBtn: "Verificar",
    galaxy: "GALÁXIA:",
    region: "REGIÃO:",
    civilization: "CIVILIZAÇÃO:",
    sectorCoords: "COORDENADAS DO SETOR:",
    unclaimed: "Não reivindicada",
    generateGlyphs: (r) => `Gerar Glifos para ${r}`,
    inquireTitle: "Consulta de Região",
    inquireMessage: "A região não está no banco de dados e provavelmente não está reivindicada.",
    statusTitle: "Status da Reivindicação",
    statusUnclaimedMessage: "Esta região está registrada como atualmente não reivindicada",
    statusClaimedMessage: (civ) => `Esta região é reivindicada por ${civ}`
  },
  it: {
    title: "Verifica Rivendicazione",
    regionName: "Nome della Regione",
    placeholder: "Inserisci il nome...",
    checkBtn: "Verifica",
    galaxy: "GALASSIA:",
    region: "REGIONE:",
    civilization: "CIVILTÀ:",
    sectorCoords: "COORDINATE DEL SETTORE:",
    unclaimed: "Non rivendicata",
    generateGlyphs: (r) => `Genera Glifi per ${r}`,
    inquireTitle: "Richiesta Regione",
    inquireMessage: "La regione non è nel database ed è probabilmente non rivendicata.",
    statusTitle: "Stato della Rivendicazione",
    statusUnclaimedMessage: "Questa regione risulta attualmente non rivendicata",
    statusClaimedMessage: (civ) => `Questa regione è rivendicata da ${civ}`
  },
  th: {
    title: "ตรวจสอบการอ้างสิทธิ์ของภูมิภาค",
    regionName: "ชื่อภูมิภาค",
    placeholder: "ป้อนชื่อภูมิภาคเพื่อตรวจสอบ...",
    checkBtn: "ตรวจสอบ",
    galaxy: "กาแล็กซี:",
    region: "ภูมิภาค:",
    civilization: "อารยธรรม:",
    sectorCoords: "พิกัดเซกเตอร์:",
    unclaimed: "ยังไม่มีการอ้างสิทธิ์",
    generateGlyphs: (r) => `สร้างกลิฟสำหรับ ${r}`,
    inquireTitle: "สอบถามภูมิภาค",
    inquireMessage: "ไม่พบภูมิภาคในฐานข้อมูล และน่าจะยังไม่มีการอ้างสิทธิ์",
    statusTitle: "สถานะการอ้างสิทธิ์",
    statusUnclaimedMessage: "ภูมิภาคนี้ได้รับการบันทึกว่ายังไม่มีการอ้างสิทธิ์ในขณะนี้",
    statusClaimedMessage: (civ) => `ภูมิภาคนี้ถูกอ้างสิทธิ์โดย ${civ}`
  },
  hi: {
    title: "क्षेत्र के दावे की जाँच करें",
    regionName: "क्षेत्र का नाम",
    placeholder: "निरीक्षण के लिए क्षेत्र का नाम दर्ज करें...",
    checkBtn: "जाँच करें",
    galaxy: "आकाशगंगा:",
    region: "क्षेत्र:",
    civilization: "सभ्यता:",
    sectorCoords: "सेक्टर निर्देशांक:",
    unclaimed: "अदावाकृत",
    generateGlyphs: (r) => `${r} के लिए ग्लिफ जेनरेट करें`,
    inquireTitle: "क्षेत्र पूछताछ",
    inquireMessage: "क्षेत्र डेटाबेस में नहीं है, और संभवतः अदावाकृत है।",
    statusTitle: "दावे की स्थिति",
    statusUnclaimedMessage: "यह क्षेत्र वर्तमान में अदावाकृत दर्ज है",
    statusClaimedMessage: (civ) => `इस क्षेत्र पर ${civ} द्वारा दावा किया गया है`
  },
  zh: {
    title: "检查区域声明",
    regionName: "区域名称",
    placeholder: "输入区域名称进行检查...",
    checkBtn: "检查",
    galaxy: "星系:",
    region: "区域:",
    civilization: "文明:",
    sectorCoords: "扇区坐标:",
    unclaimed: "未声明",
    generateGlyphs: (r) => `为 ${r} 生成符文`,
    inquireTitle: "区域查询",
    inquireMessage: "区域不在线，可能未被声明。",
    statusTitle: "声明状态",
    statusUnclaimedMessage: "该区域目前记录为未声明",
    statusClaimedMessage: (civ) => `该区域被 ${civ} 声明`
  },
  ja: {
    title: "リージョン要求の確認",
    regionName: "リージョン名",
    placeholder: "確認するリージョン名を入力してください...",
    checkBtn: "確認",
    galaxy: "銀河:",
    region: "リージョン:",
    civilization: "文明:",
    sectorCoords: "セクター座標:",
    unclaimed: "未請求",
    generateGlyphs: (r) => `${r} のグリフを生成`,
    inquireTitle: "リージョン照会",
    inquireMessage: "リージョンはデータベースになく、おそらく未請求です。",
    statusTitle: "請求ステータス",
    statusUnclaimedMessage: "このリージョンは現在未請求として記録されています",
    statusClaimedMessage: (civ) => `このリージョンは ${civ} によって請求されています`
  }
};

const getStatusColor = (rawDateStr: string | null): string => {
  if (!rawDateStr) return '#FFB451';
  try {
    const updatedTime = new Date(rawDateStr).getTime();
    if (isNaN(updatedTime)) return '#FFB451';
    const diffDays = (Date.now() - updatedTime) / (1000 * 60 * 60 * 24);
    if (diffDays < 14) {
      return '#22C55E'; // Green
    } else if (diffDays <= 60) {
      return '#EAB308'; // Yellow
    } else {
      return '#EF4444'; // Red
    }
  } catch (e) {
    return '#FFB451';
  }
};

export default function App() {
  // Translate / language settings
  const [lang, setLang] = useState<SupportedLanguage>(() => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('agt_lang='));
    if (cookie) {
      const val = cookie.split('=')[1] as SupportedLanguage;
      if (val && translations[val]) return val;
    }
    const cached = localStorage.getItem(LANGUAGE_CACHE_KEY) as SupportedLanguage;
    if (cached && translations[cached]) return cached;
    const nav = navigator.language.split('-')[0] as SupportedLanguage;
    if (nav && translations[nav]) return nav;
    return 'en';
  });

  const t = translations[lang];

  // Settings menu visual state
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settingsRotation, setSettingsRotation] = useState<number>(0);
  const [showFavoritesModal, setShowFavoritesModal] = useState<boolean>(false);
  const [editingFavId, setEditingFavId] = useState<string | null>(null);
  const [tempFavName, setTempFavName] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Desktop text scaling state
  const [desktopTextScale, setDesktopTextScale] = useState<string>(() => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('agt_desktop_text_scale='));
    if (cookie) {
      const val = cookie.split('=')[1];
      if (val) return val;
    }
    return localStorage.getItem('desktop_text_scale') || '1x';
  });

  const handleTextScaleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDesktopTextScale(value);
    localStorage.setItem('desktop_text_scale', value);
    
    // Set cookie (active for 365 days / 1 year)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `agt_desktop_text_scale=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  };

  // Render a dynamic stylesheet for desktop scaling
  const scaleStyleStyle = useMemo(() => {
    if (desktopTextScale === '1x') return null;
    const factor = desktopTextScale === '1.5x' ? 1.5 :
                   desktopTextScale === '2x' ? 2 :
                   desktopTextScale === '2.5x' ? 2.5 :
                   desktopTextScale === '3x' ? 3 : 1;
    return (
      <style>{`
        @media (min-width: 768px) {
          #scaled-content-wrapper {
            font-size: ${factor}rem;
          }
          #scaled-content-wrapper .text-xs { font-size: ${0.75 * factor}rem; line-height: ${1 * factor}rem; }
          #scaled-content-wrapper .text-sm { font-size: ${0.875 * factor}rem; line-height: ${1.25 * factor}rem; }
          #scaled-content-wrapper .text-md { font-size: ${1 * factor}rem; line-height: ${1.5 * factor}rem; }
          #scaled-content-wrapper .text-base { font-size: ${1 * factor}rem; line-height: ${1.5 * factor}rem; }
          #scaled-content-wrapper .text-lg { font-size: ${1.125 * factor}rem; line-height: ${1.75 * factor}rem; }
          #scaled-content-wrapper .text-xl { font-size: ${1.25 * factor}rem; line-height: ${1.75 * factor}rem; }
          #scaled-content-wrapper .text-2xl { font-size: ${1.5 * factor}rem; line-height: ${2 * factor}rem; }
          #scaled-content-wrapper .text-3xl { font-size: ${1.875 * factor}rem; line-height: ${2.25 * factor}rem; }
          #scaled-content-wrapper .text-4xl { font-size: ${2.25 * factor}rem; line-height: ${2.5 * factor}rem; }
          #scaled-content-wrapper .text-5xl { font-size: ${3 * factor}rem; line-height: 1; }
          #scaled-content-wrapper div.font-glyphs { 
            gap: ${0.375 * factor}rem !important;
          }
          #scaled-content-wrapper span.font-glyphs.inline-block { 
            width: ${2.5 * factor}rem !important; 
            height: ${3 * factor}rem !important; 
            line-height: ${3 * factor}rem !important;
            font-size: ${3 * factor}rem !important; 
          }
        }
      `}</style>
    );
  }, [desktopTextScale]);

  // Audio setup and toggle
  const [muted, setMuted] = useState<boolean>(() => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('agt_muted='));
    return cookie ? cookie.split('=')[1] === 'true' : true;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and load background audio loop
  useEffect(() => {
    const audio = new Audio('/AGT Anthem (Instrumental).mp3');
    audio.loop = true;
    audio.volume = 0.45;
    audio.muted = muted;
    audioRef.current = audio;

    const tryPlay = () => {
      if (!muted) {
        audio.play().catch(e => {
          console.log('Autoplay blocked. Background audio will play upon first user interaction.');
        });
      }
    };

    tryPlay();

    const unlockAudio = () => {
      if (audioRef.current && audioRef.current.paused && !audioRef.current.muted) {
        audioRef.current.play().catch(e => console.log('Audio playback unlocked error:', e));
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      audio.pause();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);

    // Persist as a cookie (active for 365 days / 1 year)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `agt_muted=${nextMuted}; expires=${expires.toUTCString()}; path=/`;

    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
      if (!nextMuted && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.log('Toggle play audio error:', e));
      }
    }
  };

  // Core Database and Dropdowns State
  const [database, setDatabase] = useState<DatabaseState | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);
  const [dbLastUpdated, setDbLastUpdated] = useState<string | null>(null);
  const [dbLastUpdatedRaw, setDbLastUpdatedRaw] = useState<string | null>(null);
  
  const [selectedGalaxy, setSelectedGalaxy] = useState<string>('');
  const [selectedCivilization, setSelectedCivilization] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>(''); // Holds coordinates or blank
  const [regionSectionFolded, setRegionSectionFolded] = useState<boolean>(true);
  
  // Custom manual coordinates input vs manual glyph inputs
  const [manualCoordinates, setManualCoordinates] = useState<string>('');
  const [glyphInput, setGlyphInput] = useState<string>('');

  // Autocomplete state variables
  const [galaxySearchInput, setGalaxySearchInput] = useState<string>('');
  const [civSearchInput, setCivSearchInput] = useState<string>('');
  const [showGalaxySuggestions, setShowGalaxySuggestions] = useState<boolean>(false);
  const [showCivSuggestions, setShowCivSuggestions] = useState<boolean>(false);

  // Regional claim checker state
  const [claimRegionInput, setClaimRegionInput] = useState<string>('');
  const [showClaimSuggestions, setShowClaimSuggestions] = useState<boolean>(false);
  const [showClaimPopup, setShowClaimPopup] = useState<boolean>(false);
  const [claimPopupTitle, setClaimPopupTitle] = useState<string>('');
  const [claimPopupMessage, setClaimPopupMessage] = useState<string>('');
  const [matchingCivValue, setMatchingCivValue] = useState<string | null>(null);
  const [matchingCoordsValue, setMatchingCoordsValue] = useState<string | null>(null);
  const [matchingRegionObj, setMatchingRegionObj] = useState<RegionInfo | null>(null);
  const [matchingGalaxyValue, setMatchingGalaxyValue] = useState<string | null>(null);
  const [hasClaimPopupBeenClosed, setHasClaimPopupBeenClosed] = useState<boolean>(false);
  const [claimSectionFolded, setClaimSectionFolded] = useState<boolean>(true);
  const [conversionSectionFolded, setConversionSectionFolded] = useState<boolean>(true);

  // Keep autocomplete inputs synchronized with external selections (like random region picks or preset changes)
  useEffect(() => {
    setGalaxySearchInput(selectedGalaxy || '');
  }, [selectedGalaxy]);

  useEffect(() => {
    setCivSearchInput(selectedCivilization || '');
  }, [selectedCivilization]);

  // Extract unique region names from core database for autocomplete suggestions
  const allRegionNames = useMemo<string[]>(() => {
    if (!database || !database.data) return [];
    const namesSet = new Set<string>();
    for (const galaxyName of Object.keys(database.data)) {
      const galaxyData = database.data[galaxyName];
      if (galaxyData && galaxyData.regions) {
        for (const civName of Object.keys(galaxyData.regions)) {
          const regionsList = galaxyData.regions[civName];
          if (regionsList) {
            regionsList.forEach(r => {
              if (r.name) {
                namesSet.add(r.name);
              }
            });
          }
        }
      }
    }
    return Array.from(namesSet).sort();
  }, [database]);

  // Filter claim check region list based on user input
  const filteredClaimRegions = useMemo<string[]>(() => {
    if (!claimRegionInput.trim()) return [];
    const searchLower = claimRegionInput.toLowerCase();
    return allRegionNames
      .filter(name => name.toLowerCase().includes(searchLower))
      .slice(0, 10);
  }, [claimRegionInput, allRegionNames]);

  // Global database search to find a region and retrieve its info
  const searchRegionInDb = (searchName: string) => {
    if (!database || !database.data) return null;
    const normalizedSearch = searchName.trim().toLowerCase();
    
    for (const galaxyName of Object.keys(database.data)) {
      const galaxyData = database.data[galaxyName];
      if (galaxyData && galaxyData.regions) {
        for (const civName of Object.keys(galaxyData.regions)) {
          const regionsList = galaxyData.regions[civName];
          if (regionsList) {
            const foundRegion = regionsList.find(
              r => r.name.trim().toLowerCase() === normalizedSearch
            );
            if (foundRegion) {
              return {
                region: foundRegion,
                civilization: civName,
                galaxy: galaxyName
              };
            }
          }
        }
      }
    }
    return null;
  };

  const handleCheckClaim = () => {
    setHasClaimPopupBeenClosed(false);
    const searchName = claimRegionInput.trim();
    if (!searchName) return;

    const result = searchRegionInDb(searchName);
    const ct = claimTranslations[lang] || claimTranslations.en;
    if (!result) {
      setMatchingCivValue(null);
      setMatchingCoordsValue(null);
      setMatchingRegionObj(null);
      setMatchingGalaxyValue(null);
      setClaimPopupTitle(ct.inquireTitle);
      setClaimPopupMessage(ct.inquireMessage);
      setShowClaimPopup(true);
    } else {
      const civ = result.civilization;
      const coords = result.region.coordinates;
      setMatchingCivValue(civ);
      setMatchingCoordsValue(coords);
      setMatchingRegionObj(result.region);
      setMatchingGalaxyValue(result.galaxy);
      
      const isBlank = !civ || civ.trim() === '' || civ.trim().toLowerCase() === 'null' || civ.trim().toLowerCase() === 'unclaimed' || civ.trim().toLowerCase() === 'uncharted';
      if (isBlank) {
        setClaimPopupTitle(ct.statusTitle);
        setClaimPopupMessage(ct.statusUnclaimedMessage);
      } else {
        setClaimPopupTitle(ct.statusTitle);
        setClaimPopupMessage(ct.statusClaimedMessage(civ));
      }
      setShowClaimPopup(true);
    }
  };

  const handleCloseClaimPopup = () => {
    setShowClaimPopup(false);
    setHasClaimPopupBeenClosed(true);
  };

  // Randomized code display values
  const [generatedCode, setGeneratedCode] = useState<string>('000000000000');
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rollSymbols, setRollSymbols] = useState<string[]>(Array(12).fill('0'));
  const [revealedCount, setRevealedCount] = useState<number>(12); // initially fully shown

  // Favorites persistence
  const [favorites, setFavorites] = useState<FavoriteSequence[]>(() => {
    try {
      const saved = localStorage.getItem('agt_nms_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('agt_nms_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Error persisting favorites:', e);
    }
  }, [favorites]);

  const currentSequence = useMemo(() => {
    return rollSymbols.join('').toUpperCase();
  }, [rollSymbols]);

  const isFavorite = useMemo(() => {
    return favorites.some(fav => fav.sequence === currentSequence);
  }, [favorites, currentSequence]);

  const toggleFavorite = () => {
    if (isRolling) return;
    const seq = currentSequence;
    if (favorites.some(fav => fav.sequence === seq)) {
      setFavorites(prev => prev.filter(fav => fav.sequence !== seq));
    } else {
      const activeCoords = manualCoordinates.trim().toUpperCase();
      const activeGalaxy = selectedGalaxy || undefined;
      const activeCiv = selectedCivilization || undefined;
      const activeRegion = selectedRegion ? (currentRegionsList.find(r => r.coordinates === selectedRegion)?.name || undefined) : undefined;

      const favItem: FavoriteSequence = {
        id: Date.now().toString(),
        sequence: seq,
        galaxy: activeGalaxy || matchingGalaxyValue || undefined,
        civilization: activeCiv || matchingCivValue || undefined,
        region: activeRegion || (matchingRegionObj ? matchingRegionObj.name : undefined),
        coordinates: activeCoords || matchingCoordsValue || undefined,
        createdAt: new Date().toISOString()
      };
      setFavorites(prev => [...prev, favItem]);
    }
  };

  const deleteFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  };

  const clearAllFavorites = () => {
    setFavorites([]);
  };

  const updateFavoriteName = (id: string, name: string) => {
    setFavorites(prev => prev.map(fav => {
      if (fav.id === id) {
        return { ...fav, name: name.trim().slice(0, 42) };
      }
      return fav;
    }));
    setEditingFavId(null);
  };

  const handleCopy = (id: string, seq: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(seq);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const loadFavorite = (fav: FavoriteSequence) => {
    if (isRolling) return;
    setRollSymbols(fav.sequence.split(''));
    setGeneratedCode(fav.sequence);
    setRevealedCount(12);

    if (fav.coordinates) {
      setManualCoordinates(fav.coordinates);
      setGlyphInput(fav.sequence);
    }
    if (fav.galaxy) {
      setSelectedGalaxy(fav.galaxy);
      setGalaxySearchInput(fav.galaxy);
    }
    if (fav.civilization) {
      setSelectedCivilization(fav.civilization);
      setCivSearchInput(fav.civilization);
    }
    if (fav.region && fav.coordinates) {
      setSelectedRegion(fav.coordinates);
    } else {
      setSelectedRegion('');
    }
    setShowSettings(false);
  };

  // Active glyph details panel
  const [hoveredGlyph, setHoveredGlyph] = useState<string | null>(null);
  const [clipboardFeedback, setClipboardFeedback] = useState<boolean>(false);

  // Background Wiki Sync Progress state
  const [syncStatus, setSyncStatus] = useState<SyncProgress>({
    active: false,
    offset: 0,
    total: 7500,
    processed: 0,
    timeEstimate: '',
    statusText: t.syncStatusIdle
  });
  const [syncResult, setSyncResult] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [syncErrorMsg, setSyncErrorMsg] = useState<string>('');

  // Track scheduled sync timeouts
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Robustly inject the custom NMS Glyphs font as an inline Base64 data URI stylesheet
  useEffect(() => {
    if (!nmsFontUrl) return;
    
    const styleId = 'nms-glyphs-dynamic-font';
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @font-face {
          font-family: 'NMS-Glyphs';
          src: url("${nmsFontUrl}") format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: block;
        }
        @font-face {
          font-family: 'NMS-Glyphs-Mono';
          src: url("${nmsFontUrl}") format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: block;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Load database on start
  useEffect(() => {
    async function initDb() {
      try {
        setLoadingDb(true);
        // Check for cached databases first
        const cacheTime = localStorage.getItem(CIVILIZATIONS_CACHE_KEY + '_updated_at');
        const cacheTimeRaw = localStorage.getItem(CIVILIZATIONS_CACHE_KEY + '_updated_at_raw');
        const cached = localStorage.getItem(CIVILIZATIONS_CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.data && parsed.galaxies) {
              setDatabase(parsed);
              if (cacheTime) {
                setDbLastUpdated(cacheTime);
                setDbLastUpdatedRaw(cacheTimeRaw || '2026-06-15T12:00:00.000Z');
              } else {
                const defTimeRaw = '2026-06-15T12:00:00.000Z';
                const defTime = new Date(defTimeRaw).toLocaleString();
                setDbLastUpdated(defTime);
                setDbLastUpdatedRaw(defTimeRaw);
                localStorage.setItem(CIVILIZATIONS_CACHE_KEY + '_updated_at', defTime);
                localStorage.setItem(CIVILIZATIONS_CACHE_KEY + '_updated_at_raw', defTimeRaw);
              }
              setLoadingDb(false);
              return;
            }
          } catch (e) {
            console.error('Failed to parse cached DB, fallback to file', e);
          }
        }

        // Load static backend files
        let response = await fetch('/assets/defaultData/defaultData.json');
        if (!response.ok) {
          response = await fetch('/public/assets/defaultData/defaultData.json');
        }
        if (!response.ok) throw new Error('Could not fetch defaultData.json');
        
        const data = await response.json();
        setDatabase(data);
        const defaultTimeRaw = '2026-06-15T12:00:00.000Z';
        const defaultTime = new Date(defaultTimeRaw).toLocaleString();
        setDbLastUpdated(defaultTime);
        setDbLastUpdatedRaw(defaultTimeRaw);
        localStorage.setItem(CIVILIZATIONS_CACHE_KEY + '_updated_at', defaultTime);
        localStorage.setItem(CIVILIZATIONS_CACHE_KEY + '_updated_at_raw', defaultTimeRaw);
      } catch (err) {
        console.error('Error initializing database:', err);
      } finally {
        setLoadingDb(false);
      }
    }
    initDb();
  }, []);

  // Update dropdown selection filters
  const onGalaxyChange = (galaxy: string) => {
    setSelectedGalaxy(galaxy);
    setSelectedCivilization('');
    setSelectedRegion('');
    // Clear converted inputs
    setGlyphInput('');
  };

  const onCivChange = (civ: string) => {
    setSelectedCivilization(civ);
    setSelectedRegion('');
    // Clear converted inputs
    setGlyphInput('');
  };

  const onRegionChange = (coordinates: string) => {
    setSelectedRegion(coordinates);
    if (coordinates) {
      setManualCoordinates(coordinates);
      const converted = coords2Glyphs(coordinates);
      setGlyphInput(converted);
    } else {
      setGlyphInput('');
    }
  };

  // Convert custom coordinates input to glyph seed
  const handleCoordsManualInput = (e: ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setManualCoordinates(rawVal);
    
    // Automatically convert if it matches standard NMS format 0C4F:007F:0D54:007A
    const formatted = rawVal.trim().toUpperCase();
    if (formatted.split(':').length === 4) {
      const converted = coords2Glyphs(formatted);
      if (converted) {
        setGlyphInput(converted);
      }
    }
  };

  // Handle manual 12-digit portal code typed in
  const handleGlyphTextInput = (e: ChangeEvent<HTMLInputElement>) => {
    const validated = validateGlyphInput(e.target.value);
    setGlyphInput(validated);
    if (validated.length === 12) {
      const reversedCoords = glyphs2Coords(validated);
      if (reversedCoords) {
        setManualCoordinates(reversedCoords);
      }
    }
  };

  // Handle click on quick selector glyph buttons to insert into the 12-character glyph field
  const handleGlyphButtonClick = (char: string) => {
    if (isRolling) return;
    if (glyphInput.length >= 12) return;
    
    const nextVal = glyphInput + char.toUpperCase();
    const validated = validateGlyphInput(nextVal);
    setGlyphInput(validated);
    if (validated.length === 12) {
      const reversedCoords = glyphs2Coords(validated);
      if (reversedCoords) {
        setManualCoordinates(reversedCoords);
      }
    }
  };

  // Generate glyphs matching exact input entered in either Galactic sector coordinates or manual seed sequence
  const triggerManualSeedGeneration = () => {
    if (isRolling) return;

    let targetCode = '';

    // Try manual coordinates first if populated
    const cleanCoords = manualCoordinates.trim().toUpperCase();
    if (cleanCoords) {
      const converted = coords2Glyphs(cleanCoords);
      if (converted && converted.length === 12) {
        targetCode = converted;
      }
    }

    // fallback to typed in manual glyphInput if coordinates did not yield code
    if (!targetCode && glyphInput) {
      let cleanGlyphs = glyphInput.toUpperCase().replace(/[^0-9A-F]/g, '');
      while (cleanGlyphs.length < 12) {
        cleanGlyphs += '0';
      }
      targetCode = cleanGlyphs.slice(0, 12);
    }

    if (!targetCode) {
      alert("Please enter valid Galactic sector coordinates or a Hex seed first.");
      return;
    }

    setIsRolling(true);
    setGeneratedCode(targetCode);
    setRevealedCount(0);
    setRollSymbols(Array(12).fill('0'));

    const slotDuration = 800; // Duration each slot spins
    const staggerDelay = 100; // Delay before starting next slot
    
    const intervals: NodeJS.Timeout[] = [];

    for (let index = 0; index < 12; index++) {
      setTimeout(() => {
        const intervalId = setInterval(() => {
          setRollSymbols(prev => {
            const next = [...prev];
            next[index] = randomGlyph();
            return next;
          });
        }, 80);
        intervals[index] = intervalId;

        // End slot spin and reveal target character
        setTimeout(() => {
          clearInterval(intervals[index]);
          setRollSymbols(prev => {
            const next = [...prev];
            next[index] = targetCode[index];
            return next;
          });
          setRevealedCount(prev => prev + 1);
          
          if (index === 11) {
            setIsRolling(false);
          }
        }, slotDuration);

      }, index * staggerDelay);
    }
  };

  // Staggered roll trigger
  const triggerGlyphGeneration = () => {
    if (isRolling) return;
    
    // Compute targeted 12-digit code
    const targetCode = generateGlyphs(glyphInput);
    if (!targetCode) {
      alert(t.fullportalcode);
      return;
    }

    setIsRolling(true);
    setGeneratedCode(targetCode);
    setRevealedCount(0);
    setRollSymbols(Array(12).fill('0'));

    // Interval timers for each slot
    const slotDuration = 800; // Duration each slot spins
    const staggerDelay = 100; // Delay before starting next slot
    
    // An array of interval handles so we can cancel them
    const intervals: NodeJS.Timeout[] = [];

    for (let index = 0; index < 12; index++) {
      // Start slot spin
      setTimeout(() => {
        const intervalId = setInterval(() => {
          setRollSymbols(prev => {
            const next = [...prev];
            next[index] = randomGlyph();
            return next;
          });
        }, 80);
        intervals[index] = intervalId;

        // End slot spin and reveal target character
        setTimeout(() => {
          clearInterval(intervals[index]);
          setRollSymbols(prev => {
            const next = [...prev];
            next[index] = targetCode[index];
            return next;
          });
          setRevealedCount(prev => prev + 1);
          
          if (index === 11) {
            setIsRolling(false);
          }
        }, slotDuration);

      }, index * staggerDelay);
    }
  };

  // Handle clipboard copy
  const copyCodeToClipboard = () => {
    const code = generatedCode || '000000000000';
    navigator.clipboard.writeText(code).then(
      () => {
        setClipboardFeedback(true);
        setTimeout(() => setClipboardFeedback(false), 2000);
      },
      () => {
        alert(t.copiedFail);
      }
    );
  };

  // Sync Fandom Cargo Engine recursive loop
  const triggerOnlineSync = async () => {
    if (syncStatus.active) return;

    setSyncResult('running');
    setSyncErrorMsg('');
    setSyncStatus(prev => ({
      ...prev,
      active: true,
      processed: 0,
      offset: 0,
      statusText: t.syncStatusRunning,
      timeEstimate: ''
    }));

    let allItems: any[] = [];
    let currentOffset = 0;
    const limit = 500;
    const startTime = Date.now();

    const fetchPage = async () => {
      try {
        const params = new URLSearchParams();
        params.append('action', 'cargoquery');
        params.append('tables', 'Regions');
        params.append('fields', 'Regions.Civilized=civilizeD,Regions.Galaxy=galaxyY,Regions.Coordinates=coordinateS,_pageName=pageName');
        params.append('group_by', '_pageName');
        params.append('order_by', '_pageName');
        params.append('limit', String(limit));
        params.append('offset', String(currentOffset));
        params.append('format', 'json');
        params.append('origin', '*');
        params.append('where', 'Civilized IS NOT NULL AND Civilized <> "Uncharted" AND Coordinates IS NOT NULL AND Galaxy IS NOT NULL');

        const url = `${FANDOM_API_PATH}?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        
        const json = await res.json();
        const cargoQuery = json.cargoquery || [];
        
        // Filter elements
        const validPageItems = cargoQuery.filter((item: any) => 
          item.title &&
          item.title.civilizeD &&
          item.title.civilizeD !== 'Uncharted' &&
          item.title.coordinateS &&
          item.title.galaxyY &&
          item.title.pageName
        );

        allItems = allItems.concat(validPageItems);
        currentOffset += limit;

        // Estimate remain time
        const elapsed = Date.now() - startTime;
        const totalItemsEstimate = 7500;
        const percent = Math.min(Math.round((currentOffset / totalItemsEstimate) * 100), 99);

        let timeText = '';
        if (currentOffset > 0 && currentOffset < totalItemsEstimate) {
          const avgPerItem = elapsed / currentOffset;
          const remainingItems = totalItemsEstimate - currentOffset;
          const remainSec = (avgPerItem * remainingItems) / 1000;
          const mins = Math.floor(remainSec / 60);
          const secs = Math.round(remainSec % 60);
          
          timeText = mins > 0 
            ? t.estimatedTime.replace('{{minutes}}', String(mins)).replace('{{seconds}}', String(secs))
            : t.estimatedTimeSeconds.replace('{{seconds}}', String(secs));
        }

        // Update react sync state
        setSyncStatus(prev => ({
          ...prev,
          offset: currentOffset,
          processed: allItems.length,
          timeEstimate: timeText,
          statusText: `Fetched batch ${currentOffset / 500}. Items accumulated: ${allItems.length}`
        }));

        // Stop condition or schedule next
        if (cargoQuery.length < 50) {
          // Finished syncing
          finishSync(allItems);
        } else {
          // Wiki API throttling is critical (35s interval specified in original code)
          console.log(`Waiting 35 seconds to avoid wiki API abuse...`);
          syncTimeoutRef.current = setTimeout(fetchPage, 35000);
        }

      } catch (err) {
        console.error('Wiki sync error:', err);
        setSyncResult('error');
        setSyncErrorMsg(err instanceof Error ? err.message : String(err));
        setSyncStatus(prev => ({
          ...prev,
          active: false,
          statusText: `${t.fetchError}: ${err instanceof Error ? err.message : String(err)}`
        }));
      }
    };

    fetchPage();
  };

  const finishSync = (items: any[]) => {
    // Rebuild database state from raw fetched items
    const galaxiesObj = new Set<string>();
    items.forEach(item => {
      if (item.title && item.title.galaxyY) {
        galaxiesObj.add(item.title.galaxyY);
      }
    });

    const listGalaxies = Array.from(galaxiesObj).filter(Boolean).sort();
    const dataObj: any = {};

    listGalaxies.forEach(gal => {
      dataObj[gal] = {
        civilizations: [],
        regions: {}
      };

      const galaxyItems = items.filter(i => i.title.galaxyY === gal);
      const uniqueCivs = Array.from(new Set(galaxyItems.map(i => i.title.civilizeD))).sort();
      dataObj[gal].civilizations = uniqueCivs;

      uniqueCivs.forEach(civ => {
        dataObj[gal].regions[civ] = galaxyItems
          .filter(i => i.title.civilizeD === civ)
          .map(i => ({
            name: i.title.pageName,
            coordinates: i.title.coordinateS
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      });
    });

    const newDb: DatabaseState = {
      galaxies: listGalaxies,
      data: dataObj
    };

    setDatabase(newDb);
    localStorage.setItem(CIVILIZATIONS_CACHE_KEY, JSON.stringify(newDb));

    const nowIso = new Date().toISOString();
    const nowStr = new Date(nowIso).toLocaleString();
    setDbLastUpdated(nowStr);
    setDbLastUpdatedRaw(nowIso);
    localStorage.setItem(CIVILIZATIONS_CACHE_KEY + '_updated_at', nowStr);
    localStorage.setItem(CIVILIZATIONS_CACHE_KEY + '_updated_at_raw', nowIso);

    setSyncResult('success');
    setSyncStatus(prev => ({
      ...prev,
      active: false,
      processed: items.length,
      timeEstimate: '',
      statusText: t.updatingFinish
    }));
  };

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  // Update localStorage and cookie language
  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as SupportedLanguage;
    setLang(selected);
    localStorage.setItem(LANGUAGE_CACHE_KEY, selected);

    // Save as cookie (active for 365 days / 1 year)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `agt_lang=${selected}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  };

  // Coordinate breakdown calculation visual guide
  const getCoordinatesMathGuide = () => {
    if (!manualCoordinates || manualCoordinates.split(':').length !== 4) return null;
    const parts = manualCoordinates.split(':');
    const x = parseInt(parts[0], 16);
    const y = parseInt(parts[1], 16);
    const z = parseInt(parts[2], 16);
    return { x, y, z };
  };

  const mathGuide = getCoordinatesMathGuide();

  // Selected values from dropdown regions
  const currentGalaxiesList = database?.galaxies || [];
  const currentCivsListRaw = selectedGalaxy && database?.data[selectedGalaxy]?.civilizations || [];
  const currentCivsList = useMemo(() => {
    if (!currentCivsListRaw || currentCivsListRaw.length === 0) return [];
    
    const sorted = [...currentCivsListRaw];
    const agt = "Alliance of Galactic Travellers";
    
    const hasAgt = sorted.includes(agt);
    const foundationMatch = sorted.find(c => {
      if (!selectedGalaxy) return false;
      const target = `${selectedGalaxy} Travellers Foundation`.toLowerCase().replace(/\s+/g, ' ');
      return c.toLowerCase().replace(/\s+/g, ' ') === target;
    });
    
    const remaining = sorted.filter(c => c !== agt && c !== foundationMatch);
    
    const result: string[] = [];
    if (hasAgt) {
      result.push(agt);
    }
    if (foundationMatch) {
      result.push(foundationMatch);
    }
    result.push(...remaining);
    
    return result;
  }, [currentCivsListRaw, selectedGalaxy]);
  const currentRegionsList = selectedGalaxy && selectedCivilization && database?.data[selectedGalaxy]?.regions[selectedCivilization] || [];

  const filteredGalaxies = useMemo(() => {
    const term = galaxySearchInput.toLowerCase().trim();
    if (!term) return currentGalaxiesList;
    return currentGalaxiesList.filter(g => g.toLowerCase().includes(term));
  }, [galaxySearchInput, currentGalaxiesList]);

  const filteredCivs = useMemo(() => {
    const term = civSearchInput.toLowerCase().trim();
    if (!term) return currentCivsList;
    return currentCivsList.filter(c => c.toLowerCase().includes(term));
  }, [civSearchInput, currentCivsList]);

  return (
    <div className="min-h-screen font-sans bg-[#050505] selection:bg-green-500/30 selection:text-green-400">
      {scaleStyleStyle}
      <div id="scaled-content-wrapper">
        {/* Dynamic scrolling space ambient decoration */}
        <div className="absolute inset-x-0 top-0 h-[500px] pointer-events-none bg-radial-gradient from-green-950/20 to-transparent z-0 opacity-40" />

        {/* Main Header Container bar */}
        <header className="relative z-20 border-b border-[#FF0500]/50 bg-zinc-950/90 backdrop-blur-md px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <img 
                id="agtLogo" 
                src="/AGTIcon.png" 
                alt="AGT Logo" 
                className="h-12 w-12 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-extrabold tracking-wider text-[#FFB451] uppercase">
                  <span className="block md:hidden">AGT</span>
                  <span className="hidden md:block">Alliance of Galactic Travellers</span>
                </span>
                <span className="text-xs text-[#FFB451] opacity-90 font-semibold uppercase tracking-wider font-mono">
                  <span className="block md:hidden">Glyph Tool</span>
                  <span className="hidden md:block">AGT {t.glyphGenerator}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              
              {/* Display the date and time stamp of when the Region Database cache was last updated */}
              {dbLastUpdated && (
                <>
                  {/* Desktop view: colored labels */}
                  <div 
                    id="db-last-updated-timestamp" 
                    className="hidden md:flex flex-col items-end text-right font-mono text-[9px] sm:text-[10px]"
                    style={{ color: getStatusColor(dbLastUpdatedRaw) }}
                  >
                    <span className="uppercase text-[8px] tracking-wider font-bold leading-tight">
                      Database Last Updated
                    </span>
                    <span className="opacity-90 font-medium whitespace-nowrap">
                      {dbLastUpdated}
                    </span>
                  </div>

                  {/* Mobile view: status-colored dot */}
                  <button 
                    id="db-last-updated-mobile-dot"
                    onClick={() => setShowSettings(true)}
                    className="flex md:hidden p-2 -m-2 cursor-pointer items-center justify-center shrink-0"
                    title="Database Status (Click to open settings)"
                    aria-label="Database Status"
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full animate-pulse block shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                      style={{ backgroundColor: getStatusColor(dbLastUpdatedRaw) }}
                    />
                  </button>
                </>
              )}
              
              {/* Bug/Support icon in the top right - opens support url and spins on hover */}
              <motion.a
                id="supportBugButton"
                href="https://www.nms-agt.com/support"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="transition-colors cursor-pointer p-2 flex items-center justify-center text-[#FF0500] hover:opacity-80"
                title="Support"
                aria-label="Support"
                style={{ color: '#FF0500' }}
              >
                <Bug className="w-7 h-7 text-[#FF0500]" style={{ color: '#FF0500' }} />
              </motion.a>

              {/* Settings icon in the top right - icon only and spins on hover */}
              <motion.div
                id="settingsButton"
                onClick={() => setShowSettings(true)}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="transition-colors cursor-pointer p-2 flex items-center justify-center text-[#FF0500] hover:text-[#FF0500]"
                title="Settings"
                aria-label="Settings"
              >
                <Settings className="w-7 h-7 text-[#FF0500]" style={{ color: '#FF0500' }} />
              </motion.div>

            </div>
          </div>
        </header>

      {/* Main Container body */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 mt-8 pb-12">
        
        {/* Upper right hand of the display, after the header - small button "Favorites" */}
        <div className="flex justify-end mb-4">
          <button
            id="favorites-modal-trigger"
            onClick={() => {
              setEditingFavId(null);
              setShowFavoritesModal(true);
            }}
            className="flex items-center gap-1.5 bg-[#E25530] hover:bg-[#E25530]/90 border border-[#E25530] text-white text-xs font-bold py-1 px-3 rounded-md transition-all cursor-pointer font-mono uppercase tracking-wider shadow-[0_0_10px_rgba(226,85,48,0.2)]"
          >
            <Star className="w-3.5 h-3.5 text-white fill-current" />
            <span>Favorites</span>
          </button>
        </div>
        
        {/* Animated Headline */}
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-extrabold tracking-wider text-[#FFB451] mb-2 uppercase"
          >
            <span className="block md:hidden">Glyph Generator</span>
            <span className="hidden md:block">AGT NMS {t.glyphGenerator}</span>
          </motion.h1>
        </div>

        {database ? (
          <div className="space-y-6 w-full">
            
            {/* Top row - Input sections (Coordinate/Glyph Conversion & Select a Civ Region) */}
            <div className="grid grid-cols-1 gap-6 items-start w-full">
              
              {/* Seed manual variables card inputs */}
              <div className="bg-zinc-950/80 border border-[#FF0500] rounded-xl p-6 shadow-xl text-[#FFB451] flex flex-col justify-between" style={{ fontFamily: '"geonms-font", sans-serif' }}>
                <div>
                  <div 
                    onClick={() => setConversionSectionFolded(!conversionSectionFolded)}
                    className="flex items-center justify-between border-b border-[#FF0500] pb-3 text-[#FFB451] cursor-pointer select-none group/hdr"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#FFB451] group-hover/hdr:scale-110 transition-transform" />
                      <h2 className="text-sm font-bold uppercase tracking-widest text-[#FFB451]">
                        {t.exactLocationTitle}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      {(manualCoordinates || glyphInput) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setManualCoordinates('');
                            setGlyphInput('');
                          }}
                          className="text-xs bg-[#E25530]/10 hover:bg-[#E25530]/20 border border-[#FF0500]/40 hover:border-[#FFB451] px-2.5 py-1 rounded text-[#FFB451] transition-all flex items-center gap-1 cursor-pointer active:scale-95 text-[10px] font-mono tracking-wider font-semibold"
                          title={t.clearFields}
                        >
                          <Trash2 className="w-3 h-3 text-[#FFB451]" />
                          <span>{t.clearFields.toUpperCase()}</span>
                        </button>
                      )}
                      <div>
                        {conversionSectionFolded ? (
                          <ChevronRight className="w-5 h-5 text-[#E25530] animate-pulse" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#FFB451]" />
                        )}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {!conversionSectionFolded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 space-y-4">
                          {/* Coordinates manual text entry */}
                          <div className="space-y-1.5">
                            <label className="text-xs block text-[#FFB451] uppercase tracking-wider">
                              {t.galacticCoordinatesLabel}
                            </label>
                            <input 
                              type="text"
                              value={manualCoordinates}
                              onChange={handleCoordsManualInput}
                              placeholder="e.g. 0C4F:007F:0D54:007A"
                              className="w-full bg-zinc-900 border border-[#FF0500] rounded-lg p-3 text-sm tracking-wider focus:border-[#FF0500] focus:outline-none focus:ring-1 focus:ring-[#FF0500]/25 uppercase text-left text-[#FFB451] placeholder-[#FFB451]/35"
                            />
                          </div>

                          {/* Glyph 12-char fallback string */}
                          <div className="space-y-1.5">
                            <label className="text-xs block text-[#FFB451] uppercase tracking-wider">
                              {t.glyphs12CharsLabel}
                            </label>
                            <input 
                              type="text"
                              maxLength={12}
                              value={glyphInput}
                              onChange={handleGlyphTextInput}
                              placeholder="0123456789AB"
                              className="w-full bg-zinc-900 border border-[#FF0500] rounded-lg p-3 text-center text-xl tracking-widest focus:border-[#FF0500] focus:outline-none focus:ring-1 focus:ring-[#FF0500]/25 uppercase text-[#FFB451] placeholder-[#FFB451]/35 font-glyphs"
                              style={{ fontFamily: '"NMS-Glyphs-Mono", monospace' }}
                            />
                            <div className="flex justify-between text-[10px] text-[#FFB451]/75">
                              <span>{t.lengthLabel}: {glyphInput.length} / 12</span>
                              <span>{t.validKeysLabel}</span>
                            </div>
                          </div>

                          {/* Quickglyph selection row */}
                          <div className="space-y-1.5 pt-2 border-t border-zinc-900/50">
                            <label className="text-[10px] block text-[#FFB451]/70 uppercase tracking-widest font-mono">
                              {lang === 'es' ? 'Teclado de Glifos Rápido' : lang === 'fr' ? 'Clavier rapide de glyphes' : lang === 'de' ? 'Glyphen-Schnellwahltasten' : lang === 'pt' ? 'Teclado de Glifos Rápido' : 'Quick Glyph Input Keys'}
                            </label>
                            <div 
                              className="grid gap-1 p-1 bg-zinc-900/35 rounded-lg border border-[#FF0500]/20 grid-cols-8 md:grid-cols-[repeat(16,minmax(0,1fr))]"
                            >
                              {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'].map((char) => (
                                <button
                                  key={char}
                                  type="button"
                                  onClick={() => handleGlyphButtonClick(char)}
                                  title={glyphTranslations[lang]?.[char]?.name || char}
                                  className="bg-zinc-950/70 border border-[#FF0500]/30 hover:border-[#FFB451] hover:bg-[#E25530]/20 text-center py-1.5 px-0.5 md:px-1 text-base font-glyphs rounded cursor-pointer transition-all text-[#FFB451] flex flex-col items-center justify-center relative group active:scale-95"
                                >
                                  <span className="font-glyphs select-none text-[18px]">{char}</span>
                                  <span className="text-[8px] font-mono leading-none text-[#FFB451]/40 group-hover:text-[#FFB451] mt-0.5 select-none">{char}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* New generate button for manual seed coordinates / sequences */}
                        <div className="pt-4 mt-4 border-t border-zinc-900">
                          <button
                            id="generateManualButton"
                            onClick={triggerManualSeedGeneration}
                            disabled={isRolling || (!manualCoordinates.trim() && !glyphInput.trim())}
                            className="w-full bg-[#E25530] text-black border border-[#FF0500] font-bold uppercase text-sm tracking-wider py-4 px-6 rounded-lg shadow-lg hover:bg-[#E25530]/90 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <RotateCw className={`w-4 h-4 text-black ${isRolling ? 'animate-spin' : ''}`} />
                            <span>{t.generateGlyphsBtn}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Regional selection control panel */}
              <div id="controls-panel" className="bg-zinc-950/80 border border-[#FF0500] rounded-xl p-6 shadow-xl relative overflow-visible text-[#FFB451] flex flex-col justify-between">
                <div>
                  <div 
                    onClick={() => setRegionSectionFolded(!regionSectionFolded)}
                    className="flex items-center justify-between gap-2 border-b border-[#FF0500] pb-3 text-[#FFB451] cursor-pointer select-none group/hdr"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-[#FFB451] group-hover/hdr:scale-110 transition-transform" />
                      <h2 className="text-md font-bold uppercase tracking-widest font-mono text-[#FFB451]">
                        {t.regionSelection}
                      </h2>
                    </div>
                    <div>
                      {regionSectionFolded ? (
                        <ChevronRight className="w-5 h-5 text-[#E25530] animate-pulse" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#FFB451]" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {!regionSectionFolded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 space-y-4 text-[#FFB451]">
                          
                          {/* Galaxy Autocomplete Select field */}
                          <div className="space-y-1.5" id="galaxy-field">
                            <label className="text-xs font-semibold uppercase tracking-wider block text-[#FFB451]">
                              {t.galaxy}
                            </label>
                            <div className="relative" id="galaxyAutocompleteContainer">
                              <input
                                id="galaxySelect"
                                type="text"
                                placeholder={`-- ${t.selectGalaxy} --`}
                                value={galaxySearchInput}
                                onChange={(e) => {
                                  setGalaxySearchInput(e.target.value);
                                  setShowGalaxySuggestions(true);
                                }}
                                onFocus={() => setShowGalaxySuggestions(true)}
                                onBlur={() => setTimeout(() => setShowGalaxySuggestions(false), 250)}
                                className="w-full bg-zinc-900 border border-[#FF0500] rounded-lg p-3 pr-10 text-sm text-[#FFB451] focus:border-[#FF0500] focus:ring-1 focus:ring-[#FF0500]/30 focus:outline-none transition-all placeholder-[#FFB451]/30 font-semibold"
                              />
                              {galaxySearchInput && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onGalaxyChange('');
                                    setGalaxySearchInput('');
                                  }}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FFB451]/50 hover:text-[#FFB451] cursor-pointer hover:scale-110 active:scale-95 transition-all p-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {showGalaxySuggestions && (
                                <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-zinc-950 border border-[#FF0500] rounded-lg shadow-2xl">
                                  {filteredGalaxies.length > 0 ? (
                                    filteredGalaxies.map(g => (
                                      <div
                                        key={g}
                                        onMouseDown={() => {
                                          onGalaxyChange(g);
                                          setShowGalaxySuggestions(false);
                                        }}
                                        className={`p-2.5 text-sm text-[#FFB451] hover:bg-[#E25530] hover:text-black font-semibold cursor-pointer transition-colors ${
                                          selectedGalaxy === g ? 'bg-zinc-900 text-[#FFB451] border-l-2 border-[#FF0500]' : ''
                                        }`}
                                      >
                                        {g}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-2.5 text-xs text-zinc-500 font-mono italic">
                                      {t.noRegionsFound}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Civilization Autocomplete Select field */}
                          <div className="space-y-1.5" id="civ-field">
                            <label className="text-xs font-semibold uppercase tracking-wider block text-[#FFB451]">
                              {t.civilization}
                            </label>
                            <div className="relative" id="civAutocompleteContainer">
                              <input
                                id="civilizationSelect"
                                type="text"
                                placeholder={!selectedGalaxy ? `-- ${t.selectGalaxyFirst} --` : `-- ${t.selectCivilization} --`}
                                value={civSearchInput}
                                disabled={!selectedGalaxy}
                                onChange={(e) => {
                                  setCivSearchInput(e.target.value);
                                  setShowCivSuggestions(true);
                                }}
                                onFocus={() => setShowCivSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowCivSuggestions(false), 250)}
                                className="w-full bg-zinc-900 border border-[#FF0500] rounded-lg p-3 pr-10 text-sm text-[#FFB451] focus:border-[#FF0500] focus:ring-1 focus:ring-[#FF0500]/30 focus:outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed placeholder-[#FFB451]/30 font-semibold"
                              />
                              {civSearchInput && selectedGalaxy && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onCivChange('');
                                    setCivSearchInput('');
                                  }}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FFB451]/50 hover:text-[#FFB451] cursor-pointer hover:scale-110 active:scale-95 transition-all p-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {showCivSuggestions && selectedGalaxy && (
                                <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-zinc-950 border border-[#FF0500] rounded-lg shadow-2xl">
                                  {filteredCivs.length > 0 ? (
                                    filteredCivs.map(c => (
                                      <div
                                        key={c}
                                        onMouseDown={() => {
                                          onCivChange(c);
                                          setShowCivSuggestions(false);
                                        }}
                                        className={`p-2.5 text-sm text-[#FFB451] hover:bg-[#E25530] hover:text-black font-semibold cursor-pointer transition-colors ${
                                          selectedCivilization === c ? 'bg-zinc-900 text-[#FFB451] border-l-2 border-[#FF0500]' : ''
                                        }`}
                                      >
                                        {c}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-2.5 text-xs text-zinc-500 font-mono italic">
                                      {t.noRegionsFound}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Region Select dropdown */}
                          <div className="space-y-1.5" id="region-field">
                            <label className="text-xs font-semibold uppercase tracking-wider block text-[#FFB451]">
                              {t.region}
                            </label>
                            <select 
                              id="regionSelect"
                              value={selectedRegion}
                              onChange={(e) => onRegionChange(e.target.value)}
                              disabled={!selectedCivilization}
                              className="w-full bg-zinc-900 border border-[#FF0500] rounded-lg p-3 text-sm text-[#FFB451] focus:border-[#FF0500] focus:ring-1 focus:ring-[#FF0500]/30 focus:outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <option value="" className="bg-zinc-950 text-[#FFB451]">
                                {!selectedCivilization ? `-- ${t.selectCivilizationFirst} --` : `-- ${t.selectRegion} --`}
                              </option>
                              {currentRegionsList.length === 0 && selectedCivilization ? (
                                <option value="" disabled className="bg-zinc-950 text-[#FFB451]">{t.noRegionsFound}</option>
                              ) : (
                                currentRegionsList.map((r: RegionInfo) => (
                                  <option key={r.name} value={r.coordinates} className="bg-zinc-950 text-[#FFB451]">
                                    {r.name} ({r.coordinates})
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                        </div>

                        {/* Moved Generate button for region selection */}
                        <div className="pt-4 mt-4 border-t border-zinc-900">
                          <button
                            id="generateRegionButton"
                            onClick={triggerGlyphGeneration}
                            disabled={isRolling}
                            className="w-full bg-[#E25530] text-black border border-[#FF0500] font-bold uppercase text-sm tracking-wider py-4 px-6 rounded-lg shadow-lg hover:bg-[#E25530]/90 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <RotateCw className={`w-4 h-4 text-black ${isRolling ? 'animate-spin' : ''}`} />
                            <span>{t.generalRandomRegionGlyphsBtn}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Check Region Claim separate section */}
              {(() => {
                const ct = claimTranslations[lang] || claimTranslations.en;
                return (
                  <div id="check-claim-panel" className="bg-zinc-950/80 border border-[#FF0500] rounded-xl p-6 shadow-xl relative overflow-visible text-[#FFB451] flex flex-col justify-between animate-fade-in" style={{ fontFamily: '"geonms-font", sans-serif' }}>
                    <div>
                      <div 
                        onClick={() => setClaimSectionFolded(!claimSectionFolded)}
                        className="flex items-center justify-between gap-2 border-b border-[#FF0500] pb-3 text-[#FFB451] cursor-pointer select-none group/hdr"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-[#FF0500] group-hover/hdr:scale-110 transition-transform" />
                          <h2 className="text-md font-bold uppercase tracking-widest font-mono text-[#FFB451]">
                            {ct.title}
                          </h2>
                        </div>
                        <div>
                          {claimSectionFolded ? (
                            <ChevronRight className="w-5 h-5 text-[#E25530] animate-pulse" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#FFB451]" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {!claimSectionFolded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 space-y-4" id="check-region-claim-section">
                              <div className="space-y-1.5 relative">
                                <label className="text-xs font-semibold uppercase tracking-wider block text-[#FFB451]">
                                  {ct.regionName}
                                </label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1" id="claimRegionAutocompleteContainer">
                                    <input
                                      id="claimRegionInput"
                                      type="text"
                                      placeholder={ct.placeholder}
                                      value={claimRegionInput}
                                      onChange={(e) => {
                                        setClaimRegionInput(e.target.value);
                                        setShowClaimSuggestions(true);
                                      }}
                                      onFocus={() => setShowClaimSuggestions(true)}
                                      onBlur={() => setTimeout(() => setShowClaimSuggestions(false), 250)}
                                      className="w-full bg-zinc-900 border border-[#FF0500] rounded-lg p-3 text-sm text-[#FFB451] focus:border-[#FF0500] focus:ring-1 focus:ring-[#FF0500]/30 focus:outline-none transition-all placeholder-[#FFB451]/30 font-semibold"
                                    />
                                    {showClaimSuggestions && filteredClaimRegions.length > 0 && (
                                      <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-zinc-950 border border-[#FF0500] rounded-lg shadow-2xl">
                                        {filteredClaimRegions.map(name => (
                                          <div
                                            key={name}
                                            onMouseDown={() => {
                                              setClaimRegionInput(name);
                                              setShowClaimSuggestions(false);
                                            }}
                                            className="p-2.5 text-sm text-[#FFB451] hover:bg-[#E25530] hover:text-black font-semibold cursor-pointer transition-colors"
                                          >
                                            {name}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    id="checkRegionClaimBtn"
                                    type="button"
                                    onClick={handleCheckClaim}
                                    className="bg-[#E25530] text-black border border-[#FF0500] font-bold uppercase text-xs tracking-wider px-5 rounded-lg shadow-md hover:bg-[#E25530]/90 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                                  >
                                    {ct.checkBtn}
                                  </button>
                                </div>
                              </div>

                              {/* Display the matching Civilized field in the UI if region is found */}
                              {matchingRegionObj && (
                                <div className="p-3 bg-zinc-900/60 border border-[#FF0500]/20 rounded-lg space-y-1 font-mono text-xs">
                                  {matchingGalaxyValue && (
                                    <div className="flex justify-between">
                                      <span className="text-[#FFB451]/60 font-semibold">{ct.galaxy}</span>
                                      <span className="text-[#FFB451] font-bold uppercase">{matchingGalaxyValue}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-[#FFB451]/60 font-semibold">{ct.region}</span>
                                    <span className="text-[#FFB451] font-bold">{matchingRegionObj.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[#FFB451]/60 font-semibold">{ct.civilization}</span>
                                    <span className="text-[#E25530] font-bold">
                                      {matchingCivValue && matchingCivValue.toLowerCase() !== 'uncharted' && matchingCivValue.toLowerCase() !== 'unclaimed' ? matchingCivValue : ct.unclaimed}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[#FFB451]/60 font-semibold text-xs py-0.5">{ct.sectorCoords}</span>
                                    <span className="text-[#FFB451] font-bold">{matchingCoordsValue}</span>
                                  </div>
                                </div>
                              )}

                              {/* Generate random glyph sequence for the claim-searched region after popup is closed */}
                              {hasClaimPopupBeenClosed && matchingCoordsValue && matchingRegionObj && (
                                <div className="pt-2">
                                  <button
                                    id="generateClaimedRegionGlyphsButton"
                                    type="button"
                                    onClick={() => {
                                      setManualCoordinates(matchingCoordsValue);
                                      const glyphs = coords2Glyphs(matchingCoordsValue);
                                      setGlyphInput(glyphs || '');
                                      if (matchingGalaxyValue) {
                                        setSelectedGalaxy(matchingGalaxyValue);
                                      }
                                      
                                      // Trigger roll directly
                                      const targetCode = generateGlyphs(glyphs || '');
                                      if (targetCode) {
                                        setIsRolling(true);
                                        setGeneratedCode(targetCode);
                                        setRevealedCount(0);
                                        setRollSymbols(Array(12).fill('0'));

                                        const slotDuration = 800;
                                        const staggerDelay = 100;
                                        const intervals: NodeJS.Timeout[] = [];

                                        for (let index = 0; index < 12; index++) {
                                          setTimeout(() => {
                                            const intervalId = setInterval(() => {
                                              setRollSymbols(prev => {
                                                const next = [...prev];
                                                next[index] = randomGlyph();
                                                return next;
                                              });
                                            }, 80);
                                            intervals[index] = intervalId;

                                            setTimeout(() => {
                                              clearInterval(intervals[index]);
                                              setRollSymbols(prev => {
                                                const next = [...prev];
                                                next[index] = targetCode[index];
                                                return next;
                                              });
                                              setRevealedCount(prev => prev + 1);
                                              
                                              if (index === 11) {
                                                setIsRolling(false);
                                              }
                                            }, slotDuration);
                                          }, index * staggerDelay);
                                        }
                                      }
                                    }}
                                    className="w-full bg-[#E25530]/20 hover:bg-[#E25530]/35 text-[#FFB451] border border-[#FF0500] font-bold uppercase text-xs tracking-wider py-3 px-4 rounded-lg shadow-lg active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
                                  >
                                    <RotateCw className={`w-4 h-4 text-[#FFB451] ${isRolling ? 'animate-spin' : ''}`} />
                                    <span>{ct.generateGlyphs(matchingRegionObj.name)}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Results sections inside a single full-width vertical stack */}
            <div className="space-y-6 w-full">

              {/* Portal output show display screen */}
              <div 
                id="portalResultsBox"
                className="w-full bg-zinc-950/80 border border-[#E25530] rounded-xl p-6 shadow-xl flex flex-col items-center animate-fade-in"
                style={{ fontFamily: '"NMS-Glyphs-Mono", monospace' }}
              >
                
                <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest mb-4">
                  {t.portalSignalSpectrumTitle}
                </h3>

                {/* Simulated Portal glyph ring board */}
                <div className="w-full bg-zinc-900/40 border border-zinc-900 rounded-lg p-4 flex flex-col items-center gap-4 relative overflow-hidden">
                  
                  {/* Decorative glowing scanline */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-green-500/20 shadow-[0_0_12px_#22c55e] animate-bounce pointer-events-none" />

                  {/* Icon Glyphs rendered in the special loaded TTF font */}
                  <div className="grid grid-cols-6 gap-1.5 md:flex md:flex-wrap md:justify-center py-6 font-glyphs text-4xl md:text-5xl text-green-500 justify-items-center">
                    {rollSymbols.map((sym, index) => {
                      const isSlotSpinning = isRolling && revealedCount <= index;
                      return (
                        <motion.span 
                          key={index}
                          animate={isSlotSpinning ? { 
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6],
                            rotateY: [0, 180, 360] 
                          } : {
                            scale: 1,
                            opacity: 1,
                            rotateY: 0
                          }}
                          whileHover={!isSlotSpinning ? {
                            scale: 1.12,
                            boxShadow: '0 0 15px rgba(34, 197, 94, 0.45)',
                            borderColor: 'rgba(34, 197, 94, 0.7)'
                          } : undefined}
                          transition={isSlotSpinning ? { 
                            repeat: Infinity, 
                            duration: 0.8, 
                            delay: index * 0.05 
                          } : {
                            type: 'spring',
                            stiffness: 300,
                            damping: 20
                          }}
                          onMouseEnter={() => setHoveredGlyph(sym)}
                          className={`font-glyphs inline-block w-10 h-12 text-center select-none bg-zinc-950/60 border border-zinc-900 rounded-md shadow-inner transition-colors hover:border-green-400 hover:text-green-400 cursor-pointer ${isSlotSpinning ? 'text-green-500/50' : 'text-green-400'}`}
                          style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.4)' }}
                        >
                          {sym.toUpperCase()}
                        </motion.span>
                      );
                    })}
                  </div>

                  {/* Text code and copy key display */}
                  <div className="w-full bg-zinc-950/80 rounded-md border border-zinc-900 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="font-mono text-xs">
                      <span className="text-zinc-500 uppercase tracking-widest block text-[9px]">
                        {t.portalCode}
                      </span>
                      <span className="text-sm tracking-widest text-zinc-200 font-bold font-mono">
                        {rollSymbols.join('').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        id="favoriteToggleBtn"
                        onClick={toggleFavorite}
                        disabled={isRolling}
                        className="bg-[#E25530] hover:bg-[#E25530]/90 border border-[#E25530] text-white text-xs font-bold py-1.5 px-3 rounded-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-mono uppercase tracking-wider h-8 shrink-0"
                        title={isFavorite ? (favoritesTranslations[lang]?.deleteTooltip || "Remove from Favorites") : (favoritesTranslations[lang]?.saveTooltip || "Save to Favorites")}
                      >
                        <Star className={`w-3.5 h-3.5 text-white ${isFavorite ? 'fill-white text-white' : 'text-white'}`} />
                        <span className="text-[10px] font-bold font-mono uppercase tracking-wider hidden sm:inline">
                          {isFavorite ? (favoritesTranslations[lang]?.savedLabel || 'Saved') : (favoritesTranslations[lang]?.saveTooltip ? 'Save' : 'Save')}
                        </span>
                      </button>

                      <button 
                        id="copyButton"
                        onClick={copyCodeToClipboard}
                        disabled={isRolling}
                        className="bg-[#E25530] hover:bg-[#E25530]/90 border border-[#E25530] text-white rounded-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed h-8 w-8 shrink-0"
                        title={clipboardFeedback ? "Copied" : "Copy code"}
                      >
                        {clipboardFeedback ? (
                          <Check className="w-4 h-4 text-white font-bold" />
                        ) : (
                          <Copy className="w-4 h-4 text-white font-bold" />
                        )}
                      </button>

                      <button
                        id="resetButton"
                        onClick={() => {
                          setRollSymbols(Array(12).fill('0'));
                          setRevealedCount(12);
                          setGlyphInput('');
                          setManualCoordinates('');
                          setGeneratedCode('000000000000');
                        }}
                        disabled={isRolling}
                        className="bg-[#E25530] hover:bg-[#E25530]/90 border border-[#E25530] text-white rounded-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed h-8 w-8 shrink-0"
                        title="Reset"
                      >
                        <RefreshCw className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Glyph Explanation Box - Fully standalone full-screen width display card */}
              <div className="w-full bg-zinc-950/80 border border-[#FF0500] rounded-xl p-6 shadow-xl text-[#FFB451]" style={{ fontFamily: '"geonms-font", sans-serif' }}>
                <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-900 pb-2.5">
                  {t.glyphTranslationMythosTitle}
                </h3>
                {hoveredGlyph && glyphTranslations[lang] && glyphTranslations[lang][hoveredGlyph] ? (
                  <motion.div 
                    key={hoveredGlyph}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/30 p-4 rounded-lg border border-zinc-800"
                  >
                    <div className="flex items-center justify-between font-bold mb-2 border-b border-zinc-800 pb-2">
                      <span className="text-[#FFB451] uppercase tracking-wider text-xs font-extrabold font-mono">
                        GLYPH #{hoveredGlyph} : {glyphTranslations[lang][hoveredGlyph].name}
                      </span>
                      <span className="font-glyphs text-lg text-[#FFB451]">{hoveredGlyph.toUpperCase()}</span>
                    </div>
                    <p className="text-[#FFB451] text-[15px] leading-relaxed font-sans">
                      {glyphTranslations[lang][hoveredGlyph].desc}
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-[#FFB451] text-[15px] text-center p-6 bg-zinc-900/10 rounded-lg border border border-zinc-900/50 font-mono leading-relaxed">
                    {t.glyphHoverInstructions}
                  </div>
                )}
              </div>

              {/* AGT MINI MAP REGION LOCATOR box (Mini map locator box) */}
              {mathGuide && (
                <GalaxyVisualizer3D coordinates={mathGuide} galaxyName={selectedGalaxy} lang={lang} />
              )}

              {/* Portal decoupling calculations box */}
              {mathGuide && (
                <div className="w-full bg-zinc-950/80 border border-[#FF0500] rounded-xl p-4 shadow-xl text-[#FFB451]">
                  <div className="flex items-center gap-2 mb-2 text-[#FFB451]">
                    <Info className="w-4 h-4 text-[#FFB451]" />
                    <span className="text-xs font-bold tracking-widest font-mono uppercase">
                      {t.portalDecouplingCalculationsTitle}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono mt-3">
                    <div className="bg-zinc-900/50 p-2 rounded border border-[#FF0500] text-[#E25530]">
                      <span className="text-[#E25530]/80 block text-[9px] uppercase tracking-wider">{t.xGridOffset}</span>
                      <span className="text-[#E25530] block font-bold mt-1 text-xs font-mono">
                        {mathGuide.x.toString(16).toUpperCase()} ({mathGuide.x})
                      </span>
                    </div>
                    <div className="bg-[#E25530]/10 p-2 rounded border border-[#FF0500] text-[#E25530]">
                      <span className="text-[#E25530]/80 block text-[9px] uppercase tracking-wider">{t.yOffset}</span>
                      <span className="text-[#E25530] block font-bold mt-1 text-xs font-mono">
                        {mathGuide.y.toString(16).toUpperCase()} ({mathGuide.y})
                      </span>
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-[#FF0500] text-[#E25530]">
                      <span className="text-[#E25530]/80 block text-[9px] uppercase tracking-wider">{t.zGridOffset}</span>
                      <span className="text-[#E25530] block font-bold mt-1 text-xs font-mono">
                        {mathGuide.z.toString(16).toUpperCase()} ({mathGuide.z})
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-green-500 animate-spin mb-4" />
            <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest">
              {t.loadingData}
            </p>
          </div>
        )}

        {/* Centered NMS CD badge links right before the footer */}
        <div className="flex justify-center mt-12 mb-2 relative z-10">
          <a 
            href="https://nmscd.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="opacity-70 hover:opacity-100 transition-opacity flex items-center transition-transform hover:scale-[1.02]"
          >
            <img 
              id="nmslogo" 
              src="https://wiki.nmscd.com/assets/images/webp/shared/nmscdbannerwhite.webp" 
              alt="Logo NMS" 
              className="h-12 md:h-[60px] w-auto object-contain"
            />
          </a>
        </div>

      </main>

      <footer 
        className="w-full bg-[#FFB451] mt-16 py-8 px-4 text-center text-[13px] tracking-wider relative z-10 text-black border-t border-[#FF0500]/20"
        style={{ fontFamily: '"geonms-font", sans-serif' }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-x-3 gap-y-2 select-none h-auto">
          <a href="https://www.nms-agt.com/" target="_blank" rel="noopener noreferrer" className="text-black font-bold hover:underline transition-all">Home</a>
          <span className="text-black font-bold">|</span>
          <a href="https://www.nms-agt.com/about-the-agt" target="_blank" rel="noopener noreferrer" className="text-black font-bold hover:underline transition-all">About</a>
          <span className="text-black font-bold">|</span>
          <a href="https://www.nms-agt.com/team" target="_blank" rel="noopener noreferrer" className="text-black font-bold hover:underline transition-all">Team</a>
          <span className="text-black font-bold">|</span>
          <a href="https://www.nms-agt.com/contribute" target="_blank" rel="noopener noreferrer" className="text-black font-bold hover:underline transition-all">Contribute</a>
          <span className="text-black font-bold">|</span>
          <a href="https://www.nms-agt.com/agt-galactic-archives" target="_blank" rel="noopener noreferrer" className="text-black font-bold hover:underline transition-all">Galactic Archives</a>
          <span className="text-black font-bold">|</span>
          <a href="https://www.nms-agt.com/engage" target="_blank" rel="noopener noreferrer" className="text-black font-bold hover:underline transition-all">Engage</a>
          <span className="text-black font-bold">|</span>
          <a href="https://www.nms-agt.com/agt-navi" target="_blank" rel="noopener noreferrer" className="text-black font-bold hover:underline transition-all">AGT NAVI</a>
          <span className="text-black font-bold">|</span>
          <a href="https://www.nms-agt.com/terms" target="_blank" rel="noopener noreferrer" className="text-black font-bold hover:underline transition-all">Terms</a>
          <span className="text-black font-bold">|</span>
          <a href="https://www.nms-agt.com/support" target="_blank" rel="noopener noreferrer" className="text-black font-bold hover:underline transition-all">Support</a>
          <span className="text-black font-bold">|</span>
          <a href="https://www.nms-agt.com/terms/copyright" target="_blank" rel="noopener noreferrer" className="text-black font-bold hover:underline transition-all">Copyright</a>
        </div>
      </footer>

      </div>

      {/* Settings Modal overlay with exact FFB451 text color, FF0500 borders and outcomes, E25530 button backgrounds, and black text inside buttons */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-zinc-950 border border-[#FF0500] rounded-xl p-6 shadow-2xl relative space-y-6 overflow-y-auto max-h-[85vh] text-[#FFB451]"
            >
              {/* Header section with closing buttons */}
              <div className="flex items-center justify-between border-b border-[#FF0500] pb-3 text-[#FFB451]">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#FF0500]" style={{ color: '#FF0500' }} />
                  <span className="text-sm font-extrabold uppercase font-mono tracking-widest text-[#FFB451]">
                    {t.settingsTitle}
                  </span>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 border border-[#FF0500] bg-[#E25530] text-black rounded hover:bg-[#E25530]/80 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-black font-bold" />
                </button>
              </div>

              {/* Language pull-down selection */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider block text-[#FFB451]">
                  {t.settingsLanguageLabel}
                </label>
                <div className="relative">
                  <select 
                    id="settings-lang-select"
                    value={lang} 
                    onChange={handleLanguageChange}
                    className="w-full bg-zinc-900 border border-[#FF0500] rounded-lg p-2.5 text-sm font-bold text-[#FFB451] focus:outline-none cursor-pointer"
                  >
                    {Object.keys(translations).map((l) => (
                      <option key={l} value={l} className="bg-zinc-950 text-[#FFB451]">
                        {languageNames[l as SupportedLanguage]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Desktop Text Scale settings */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider block text-[#FFB451]">
                  {t.settingsTextScaleLabel}
                </label>
                <div className="relative">
                  <select 
                    id="settings-scale-select"
                    value={desktopTextScale} 
                    onChange={handleTextScaleChange}
                    className="w-full bg-zinc-900 border border-[#FF0500] rounded-lg p-2.5 text-sm font-bold text-[#FFB451] focus:outline-none cursor-pointer"
                  >
                    <option value="1x" className="bg-zinc-950 text-[#FFB451]">{t.settingsScaleDefault}</option>
                    <option value="1.5x" className="bg-zinc-950 text-[#FFB451]">1.5x</option>
                    <option value="2x" className="bg-zinc-950 text-[#FFB451]">2x</option>
                    <option value="2.5x" className="bg-zinc-950 text-[#FFB451]">2.5x</option>
                    <option value="3x" className="bg-zinc-950 text-[#FFB451]">3x</option>
                  </select>
                </div>
              </div>

              {/* Audio mute settings toggle */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider block text-[#FFB451]">
                  {t.settingsAgtAnthemLabel}
                </label>
                <button
                  onClick={toggleMute}
                  className="w-full bg-[#E25530] text-black border border-[#FF0500] font-bold uppercase text-xs font-mono py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  {muted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-black" />
                      <span>{t.settingsUnmuteBtn}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-black" />
                      <span>{t.settingsMuteBtn}</span>
                    </>
                  )
                  }
                </button>
              </div>

              {/* Moved Sync Updates block */}
              <div className="border-t border-[#FF0500]/50 pt-4 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#FFB451]">
                    <TrendingUp className="w-4 h-4 text-[#FFB451]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-[#FFB451]">
                      {t.settingsSyncDbTitle}
                    </h4>
                  </div>
                  <p className="text-[#FFB451] text-[10px] font-mono leading-none pt-1">
                    {t.settingsSyncDbNote}
                  </p>
                </div>

                 <div className="pt-2">
                  <button
                    onClick={triggerOnlineSync}
                    disabled={syncStatus.active}
                    className="w-full bg-[#E25530] text-black font-extrabold font-mono border border-[#FF0500] uppercase text-xs tracking-wider py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.active ? 'animate-spin text-black' : ''}`} />
                    <span>{t.syncDataBtn}</span>
                  </button>
                </div>

                {dbLastUpdated && (
                  <div 
                    className="text-center font-mono text-[10px] mt-2 select-none flex flex-col items-center justify-center leading-normal"
                    style={{ color: getStatusColor(dbLastUpdatedRaw) }}
                  >
                    <span className="uppercase font-bold tracking-wider">
                      Database Last Updated
                    </span>
                    <span className="opacity-95 font-semibold">
                      {dbLastUpdated}
                    </span>
                  </div>
                )}

                {/* Progress bar and statistics logs */}
                {syncStatus.active && (
                  <div className="mt-3 space-y-2 border border-[#FF0500] p-3 rounded bg-zinc-900/45">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#FFB451]">
                      <span className="flex items-center gap-1.5 font-bold animate-pulse">
                        <span className="w-1.5 h-1.5 bg-[#FF0500] rounded-full" />
                        {syncStatus.statusText}
                      </span>
                      <span className="font-bold">
                        {Math.min(Math.round((syncStatus.offset / syncStatus.total) * 100), 100)}%
                      </span>
                    </div>

                    <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-[#FF0500] p-[1px]">
                      <div 
                        className="bg-[#E25530] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((syncStatus.offset / syncStatus.total) * 100, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-[#FFB451]/75 font-mono">
                      <span>PROCESSED SEEDS: {syncStatus.processed.toLocaleString()} ITEMS</span>
                      {syncStatus.timeEstimate && (
                        <span className="text-[#FFB451]">
                          {syncStatus.timeEstimate}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!syncStatus.active && syncResult === 'success' && (
                  <div className="mt-3 text-center bg-zinc-900 border border-green-500/50 p-3 rounded text-xs font-mono text-[#FFB451]">
                    ✓ {t.updatingFinish} ({syncStatus.processed.toLocaleString()} {lang === 'pt' ? 'registros carregados' : lang === 'es' ? 'registros cargados' : lang === 'fr' ? 'enregistrements chargés' : lang === 'de' ? 'Einträge geladen' : lang === 'ja' ? '件のレコードをロードしました' : lang === 'zh' ? '条记录已加载' : 'records loaded'})
                  </div>
                )}

                {!syncStatus.active && syncResult === 'error' && (
                  <div className="mt-3 text-center bg-zinc-900 border border-red-500/50 p-3 rounded text-xs font-mono text-[#FFB451]">
                    ⚠ {t.fetchError}: {syncErrorMsg}
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Region Claim Checker Popup Dialog Modal */}
      <AnimatePresence>
        {showClaimPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md bg-zinc-950 border-2 border-[#FF0500] rounded-xl p-6 shadow-[0_0_50px_rgba(255,5,0,0.3)] space-y-5 text-[#FFB451]"
            >
              {/* Header section with icon and title */}
              <div className="flex items-center gap-3 border-b border-[#FF0500] pb-3 text-[#FFB451]">
                <ShieldAlert className="w-5 h-5 text-[#FF0500]" />
                <span className="text-sm font-extrabold uppercase font-mono tracking-widest text-[#FF0500]">
                  {claimPopupTitle.toUpperCase()}
                </span>
              </div>

              {/* Message Content */}
              <div className="py-2">
                <p className="text-sm font-bold tracking-wide leading-relaxed text-[#FFB451] whitespace-pre-line">
                  {claimPopupMessage}
                </p>
              </div>

              {/* Accept/Close action button */}
              <div className="flex justify-end pt-3 border-t border-zinc-900">
                <button
                  id="closeClaimPopupBtn"
                  onClick={handleCloseClaimPopup}
                  className="bg-[#E25530] text-black border border-[#FF0500] font-extrabold uppercase text-xs tracking-wider px-6 py-2.5 rounded-lg hover:bg-[#E25530]/90 active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center"
                >
                  {lang === 'es' ? 'ACEPTAR' : lang === 'fr' ? 'FERMER' : lang === 'de' ? 'SCHLIESSEN' : lang === 'pt' ? 'FECHAR' : 'CLOSE'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Saved Sequences (Favorites) Pop-up Dialog Modal */}
      <AnimatePresence>
        {showFavoritesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-xl bg-zinc-950 border-2 border-[#FF0500] rounded-xl p-6 shadow-[0_0_50px_rgba(255,5,0,0.3)] space-y-4 text-[#FFB451] flex flex-col max-h-[90vh]"
            >
              {/* Header section with icon, title, and close */}
              <div className="flex items-center justify-between border-b border-[#FF0500] pb-3 text-[#FFB451] shrink-0">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-extrabold uppercase font-mono tracking-widest text-[#FFB451]">
                    {(favoritesTranslations[lang] || favoritesTranslations.en).title}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setEditingFavId(null);
                    setShowFavoritesModal(false);
                  }}
                  className="p-1.5 rounded hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Favorites List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0 py-2">
                {favorites.length === 0 ? (
                  <p className="text-zinc-500 text-xs font-mono text-center py-8 select-none">
                    {(favoritesTranslations[lang] || favoritesTranslations.en).noFavorites}
                  </p>
                ) : (
                  favorites.map((fav) => {
                    const isEditingThis = editingFavId === fav.id;
                    const favT = favoritesTranslations[lang] || favoritesTranslations.en;
                    return (
                      <div
                        key={fav.id}
                        onClick={() => {
                          if (!isEditingThis) {
                            loadFavorite(fav);
                            setShowFavoritesModal(false);
                          }
                        }}
                        className="group bg-zinc-900/40 hover:bg-[#E25530]/10 border border-[#FF0500]/25 hover:border-[#FF0500]/60 rounded-lg p-3 cursor-pointer transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left relative overflow-hidden"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          {/* Top row: Name display/input & edit icon */}
                          <div className="flex items-center gap-2 flex-wrap min-h-6">
                            {isEditingThis ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  maxLength={42}
                                  value={tempFavName}
                                  onChange={(e) => setTempFavName(e.target.value)}
                                  className="bg-zinc-900 border border-[#FF0500] text-[#FFB451] text-xs px-2 py-0.5 rounded w-48 sm:w-64 focus:outline-none font-mono font-medium focus:ring-1 focus:ring-[#FF0500]"
                                  placeholder="Enter name (max 42 chars)"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.stopPropagation();
                                      updateFavoriteName(fav.id, tempFavName);
                                    } else if (e.key === 'Escape') {
                                      e.stopPropagation();
                                      setEditingFavId(null);
                                    }
                                  }}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateFavoriteName(fav.id, tempFavName);
                                  }}
                                  className="p-1 bg-green-950/80 border border-green-500/40 hover:border-green-400 rounded text-green-400 hover:text-green-300 cursor-pointer transition-colors"
                                  title="Save Name"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingFavId(null);
                                  }}
                                  className="p-1 bg-zinc-900/80 border border-zinc-700/50 hover:border-zinc-500 rounded text-zinc-400 hover:text-white cursor-pointer transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 max-w-full">
                                {fav.name ? (
                                  <span className="text-xs font-extrabold uppercase tracking-wide text-yellow-400/90 truncate max-w-[200px] sm:max-w-xs">
                                    {fav.name}
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-mono text-zinc-500 italic uppercase">
                                    {lang === 'es' ? 'SIN NOMBRE' : lang === 'fr' ? 'SANS NOM' : lang === 'de' ? 'UNBENANNT' : lang === 'pt' ? 'SEM NOME' : 'UNNAMED SEQUENCE'}
                                  </span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingFavId(fav.id);
                                    setTempFavName(fav.name || '');
                                  }}
                                  className="p-1 rounded text-zinc-500 hover:text-[#FFB451] hover:bg-zinc-900/40 cursor-pointer transition-colors"
                                  title="Name Favorite (max 42 characters)"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Visual Glyph rendering */}
                          <div className="flex gap-0.5 font-glyphs text-xl text-green-500 overflow-x-auto whitespace-nowrap scrollbar-none">
                            {fav.sequence.split('').map((char, index) => (
                              <span key={index} className="font-glyphs select-none">{char}</span>
                            ))}
                          </div>

                          {/* Monospace code sequence */}
                          <div className="font-mono text-[11px] font-bold tracking-widest text-[#FFB451]/95">
                            {fav.sequence}
                          </div>

                          {/* Metadata labels if present */}
                          {(fav.galaxy || fav.civilization || fav.region || fav.coordinates) && (
                            <div className="space-y-0.5 text-[10px] font-mono text-zinc-400 leading-tight">
                              {fav.galaxy && (
                                <div>
                                  <span className="text-zinc-500 uppercase font-bold mr-1">{favT.galaxy}:</span>
                                  <span className="text-zinc-300">{fav.galaxy}</span>
                                </div>
                              )}
                              {fav.civilization && (
                                <div>
                                  <span className="text-zinc-500 uppercase font-bold mr-1">{favT.civ}:</span>
                                  <span className="text-zinc-300">{fav.civilization}</span>
                                </div>
                              )}
                              {fav.region && (
                                <div className="truncate">
                                  <span className="text-zinc-500 uppercase font-bold mr-1">{favT.region}:</span>
                                  <span className="text-zinc-300">{fav.region}</span>
                                </div>
                              )}
                              {fav.coordinates && (
                                <div>
                                  <span className="text-zinc-500 uppercase font-bold mr-1">{favT.coords}:</span>
                                  <span className="text-[#E25530] font-bold">{fav.coordinates}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons (Copy, Delete) */}
                        <div className="flex sm:flex-col items-center gap-2 self-end sm:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleCopy(fav.id, fav.sequence, e)}
                            className="p-1.5 rounded bg-zinc-950/80 border border-zinc-900 text-zinc-400 hover:text-green-400 hover:border-green-500/30 cursor-pointer transition-all relative"
                            title="Copy"
                          >
                            {copiedId === fav.id ? (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          
                          <button
                            onClick={(e) => deleteFavorite(fav.id, e)}
                            className="p-1.5 rounded bg-zinc-950/80 text-zinc-500 hover:text-red-500 border border-zinc-900 hover:border-red-500/40 cursor-pointer transition-colors"
                            title={favT.deleteTooltip || "Delete"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer section with clear all option */}
              <div className="border-t border-zinc-900 pt-3 flex items-center justify-between shrink-0">
                {favorites.length > 0 ? (
                  <button
                    onClick={clearAllFavorites}
                    className="text-[10px] font-bold font-mono text-red-500 hover:text-red-400 underline uppercase tracking-widest cursor-pointer"
                  >
                    {(favoritesTranslations[lang] || favoritesTranslations.en).clearAll}
                  </button>
                ) : (
                  <span />
                )}
                <button
                  onClick={() => {
                    setEditingFavId(null);
                    setShowFavoritesModal(false);
                  }}
                  className="bg-[#E25530] text-black border border-[#FF0500] font-extrabold uppercase text-[10px] tracking-wider px-4 py-1.5 rounded hover:bg-[#E25530]/90 transition-all duration-150 cursor-pointer"
                >
                  {lang === 'es' ? 'CERRAR' : lang === 'fr' ? 'FERMER' : lang === 'de' ? 'SCHLIESSEN' : lang === 'pt' ? 'FECHAR' : 'CLOSE'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
