/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent, useMemo } from 'react';
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
  Layers,
  Settings,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { 
  DatabaseState, 
  SupportedLanguage, 
  SyncProgress, 
  RegionInfo 
} from './types';
import { translations, languageNames } from './translations';
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

export default function App() {
  // Translate / language settings
  const [lang, setLang] = useState<SupportedLanguage>(() => {
    const cached = localStorage.getItem(LANGUAGE_CACHE_KEY) as SupportedLanguage;
    if (cached && translations[cached]) return cached;
    const nav = navigator.language.split('-')[0] as SupportedLanguage;
    if (nav && translations[nav]) return nav;
    return 'en';
  });

  const t = translations[lang];

  // Settings menu visual state
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Audio setup and toggle
  const [muted, setMuted] = useState<boolean>(() => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('agt_muted='));
    return cookie ? cookie.split('=')[1] === 'true' : false;
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
  
  const [selectedGalaxy, setSelectedGalaxy] = useState<string>('');
  const [selectedCivilization, setSelectedCivilization] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>(''); // Holds coordinates or blank
  
  // Custom manual coordinates input vs manual glyph inputs
  const [manualCoordinates, setManualCoordinates] = useState<string>('');
  const [glyphInput, setGlyphInput] = useState<string>('');

  // Randomized code display values
  const [generatedCode, setGeneratedCode] = useState<string>('000000000000');
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rollSymbols, setRollSymbols] = useState<string[]>(Array(12).fill('0'));
  const [revealedCount, setRevealedCount] = useState<number>(12); // initially fully shown

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
        const cached = localStorage.getItem(CIVILIZATIONS_CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.data && parsed.galaxies) {
              setDatabase(parsed);
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

  // Update localStorage language
  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as SupportedLanguage;
    setLang(selected);
    localStorage.setItem(LANGUAGE_CACHE_KEY, selected);
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

  return (
    <div className="min-h-screen font-sans bg-[#050505] selection:bg-green-500/30 selection:text-green-400">
      
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
                Alliance of Galactic Travellers
              </span>
              <span className="text-xs text-[#FFB451] opacity-90 font-semibold uppercase tracking-wider font-mono">
                AGT Glyph Generator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Settings button in the top right */}
            <button 
              id="settingsButton"
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 border border-[#FF0500] bg-[#E25530] text-black font-extrabold font-mono rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md text-xs uppercase cursor-pointer"
            >
              <Settings className="w-4 h-4 text-black" />
              <span>Settings</span>
            </button>

          </div>
        </div>
      </header>

      {/* Main Container body */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 mt-8 pb-12">
        
        {/* Animated Headline */}
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#FFB451] mb-2 uppercase"
          >
            AGT NMS Glyph Generator
          </motion.h1>
        </div>

        {database ? (
          <div className="space-y-6 w-full">
            
            {/* Top row - Input sections (Region Selection & Manual Seed) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Regional selection control panel */}
              <div id="controls-panel" className="bg-zinc-950/80 border border-[#FF0500] rounded-xl p-6 shadow-xl relative overflow-visible text-[#FFB451] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-6 border-b border-[#FF0500] pb-3 text-[#FFB451]">
                    <Compass className="w-5 h-5 text-[#FFB451]" />
                    <h2 className="text-md font-bold uppercase tracking-widest font-mono text-[#FFB451]">
                      {t.regionSelection}
                    </h2>
                  </div>

                  <div className="space-y-4 text-[#FFB451]">
                    
                    {/* Galaxy Select dropdown */}
                    <div className="space-y-1.5" id="galaxy-field">
                      <label className="text-xs font-semibold uppercase tracking-wider block text-[#FFB451]">
                        {t.galaxy}
                      </label>
                      <div className="relative">
                        <select 
                          id="galaxySelect"
                          value={selectedGalaxy}
                          onChange={(e) => onGalaxyChange(e.target.value)}
                          className="w-full bg-zinc-900 border border-[#FF0500] rounded-lg p-3 text-sm text-[#FFB451] focus:border-[#FF0500] focus:ring-1 focus:ring-[#FF0500]/30 focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="">-- {t.selectGalaxy} --</option>
                          {currentGalaxiesList.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Civilization Select dropdown */}
                    <div className="space-y-1.5" id="civ-field">
                      <label className="text-xs font-semibold uppercase tracking-wider block text-[#FFB451]">
                        {t.civilization}
                      </label>
                      <select 
                        id="civilizationSelect"
                        value={selectedCivilization}
                        onChange={(e) => onCivChange(e.target.value)}
                        disabled={!selectedGalaxy}
                        className="w-full bg-zinc-900 border border-[#FF0500] rounded-lg p-3 text-sm text-[#FFB451] focus:border-[#FF0500] focus:ring-1 focus:ring-[#FF0500]/30 focus:outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <option value="" className="bg-zinc-950 text-[#FFB451]">
                          {!selectedGalaxy ? `-- ${t.selectGalaxyFirst} --` : `-- ${t.selectCivilization} --`}
                        </option>
                        {currentCivsList.map(c => (
                          <option key={c} value={c} className="bg-zinc-950 text-[#FFB451]">{c}</option>
                        ))}
                      </select>
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
                    <span>General random region glyphs</span>
                  </button>
                </div>

              </div>

              {/* Seed manual variables card inputs */}
              <div className="bg-zinc-950/80 border border-[#FF0500] rounded-xl p-6 shadow-xl text-[#FFB451] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-6 border-b border-[#FF0500] pb-3 text-[#FFB451]">
                    <Layers className="w-5 h-5 text-[#FFB451]" />
                    <h2 className="text-sm font-bold uppercase tracking-widest font-mono text-[#FFB451]">
                      Manual Seeds
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Coordinates manual text entry */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono block text-[#FFB451]">
                        GALACTIC SECTOR COORDINATES (XXXX:YYYY:ZZZZ:SSSS)
                      </label>
                      <input 
                        type="text"
                        value={manualCoordinates}
                        onChange={handleCoordsManualInput}
                        placeholder="e.g. 0C4F:007F:0D54:007A"
                        className="w-full bg-zinc-900 border border-[#FF0500] rounded-lg p-3 text-sm font-mono tracking-wider focus:border-[#FF0500] focus:outline-none focus:ring-1 focus:ring-[#FF0500]/25 uppercase text-left text-[#FFB451] placeholder-[#FFB451]/35"
                      />
                    </div>

                    {/* Glyph 12-char fallback string */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono block text-[#FFB451]">
                        {t.glyphinput} (HEX SEED 12-CHARS)
                      </label>
                      <input 
                        type="text"
                        maxLength={12}
                        value={glyphInput}
                        onChange={handleGlyphTextInput}
                        placeholder="0123456789AB"
                        className="w-full bg-zinc-900 border border-[#FF0500] rounded-lg p-3 text-center text-md font-mono tracking-widest focus:border-[#FF0500] focus:outline-none focus:ring-1 focus:ring-[#FF0500]/25 uppercase text-[#FFB451] placeholder-[#FFB451]/35"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-[#FFB451]/75">
                        <span>LENGTH: {glyphInput.length} / 12</span>
                        <span>VALID KEYS: 0-9, A-F</span>
                      </div>
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
                    <span>Generate exact manual glyphs</span>
                  </button>
                </div>
              </div>

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
                  PORTAL SIGNAL SPECTRUM
                </h3>

                {/* Simulated Portal glyph ring board */}
                <div className="w-full bg-zinc-900/40 border border-zinc-900 rounded-lg p-4 flex flex-col items-center gap-4 relative overflow-hidden">
                  
                  {/* Decorative glowing scanline */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-green-500/20 shadow-[0_0_12px_#22c55e] animate-bounce pointer-events-none" />

                  {/* Icon Glyphs rendered in the special loaded TTF font */}
                  <div className="flex flex-wrap justify-center gap-1.5 py-6 font-glyphs text-4xl md:text-5xl text-green-500">
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
                          {sym.toLowerCase()}
                        </motion.span>
                      );
                    })}
                  </div>

                  {/* Text code and copy key display */}
                  <div className="w-full bg-zinc-950/80 rounded-md border border-zinc-900 p-3 flex items-center justify-between gap-2">
                    <div className="font-mono text-xs">
                      <span className="text-zinc-500 uppercase tracking-widest block text-[9px]">
                        {t.portalCode}
                      </span>
                      <span className="text-sm tracking-widest text-zinc-200 font-bold font-mono">
                        {rollSymbols.join('')}
                      </span>
                    </div>

                    <button 
                      id="copyButton"
                      onClick={copyCodeToClipboard}
                      disabled={isRolling}
                      className="bg-[#E25530] hover:bg-[#E25530]/90 border border-[#FF0500] text-xs font-bold py-1.5 px-3 rounded-md text-black transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-mono uppercase tracking-wider"
                    >
                      {clipboardFeedback ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-black font-bold" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-black font-bold" />
                          <span>{t.copyButton}</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>

              {/* Glyph Explanation Box - Fully standalone full-screen width display card */}
              <div className="w-full bg-zinc-950/80 border border-[#FF0500] rounded-xl p-6 shadow-xl text-[#FFB451]" style={{ fontFamily: '"geonms-font", sans-serif' }}>
                <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-900 pb-2.5">
                  Glyph Translation & Mythos
                </h3>
                {hoveredGlyph && GLYPH_METADATA_LIST[hoveredGlyph] ? (
                  <motion.div 
                    key={hoveredGlyph}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/30 p-4 rounded-lg border border-zinc-800"
                  >
                    <div className="flex items-center justify-between font-bold mb-2 border-b border-zinc-800 pb-2">
                      <span className="text-[#FFB451] uppercase tracking-wider text-xs font-extrabold font-mono">
                        GLYPH #{hoveredGlyph} : {lang === 'es' ? GLYPH_METADATA_LIST[hoveredGlyph].nameEs : GLYPH_METADATA_LIST[hoveredGlyph].nameEn}
                      </span>
                      <span className="font-glyphs text-lg text-[#FFB451]">{hoveredGlyph.toLowerCase()}</span>
                    </div>
                    <p className="text-[#FFB451] text-[15px] leading-relaxed font-sans">
                      {GLYPH_METADATA_LIST[hoveredGlyph].desc}
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-[#FFB451] text-[15px] text-center p-6 bg-zinc-900/10 rounded-lg border border border-zinc-900/50 font-mono leading-relaxed">
                    // Hover or touch any glyph in the spectrum above to translate system mythos details.
                  </div>
                )}
              </div>

              {/* AGT MINI MAP REGION LOCATOR box (Mini map locator box) */}
              {mathGuide && (
                <GalaxyVisualizer3D coordinates={mathGuide} galaxyName={selectedGalaxy} />
              )}

              {/* Portal decoupling calculations box */}
              {mathGuide && (
                <div className="w-full bg-zinc-950/80 border border-[#FF0500] rounded-xl p-4 shadow-xl text-[#FFB451]">
                  <div className="flex items-center gap-2 mb-2 text-[#FFB451]">
                    <Info className="w-4 h-4 text-[#FFB451]" />
                    <span className="text-xs font-bold tracking-widest font-mono uppercase">
                      Portal Decoupling Calculations
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono mt-3">
                    <div className="bg-zinc-900/50 p-2 rounded border border-[#FF0500] text-[#E25530]">
                      <span className="text-[#E25530]/80 block text-[9px] uppercase tracking-wider">X GRID OFFSET</span>
                      <span className="text-[#E25530] block font-bold mt-1 text-xs font-mono">
                        {mathGuide.x.toString(16).toUpperCase()} ({mathGuide.x})
                      </span>
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-[#FF0500] text-[#E25530]">
                      <span className="text-[#E25530]/80 block text-[9px] uppercase tracking-wider">Y OFFSET</span>
                      <span className="text-[#E25530] block font-bold mt-1 text-xs font-mono">
                        {mathGuide.y.toString(16).toUpperCase()} ({mathGuide.y})
                      </span>
                    </div>
                    <div className="bg-zinc-900/50 p-2 rounded border border-[#FF0500] text-[#E25530]">
                      <span className="text-[#E25530]/80 block text-[9px] uppercase tracking-wider">Z GRID OFFSET</span>
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
                  <Settings className="w-5 h-5 text-[#FFB451]" />
                  <span className="text-sm font-extrabold uppercase font-mono tracking-widest text-[#FFB451]">
                    Settings
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
                  Language Selection / Idioma / Langue:
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

              {/* Audio mute settings toggle */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider block text-[#FFB451]">
                  Background Audio
                </label>
                <button
                  onClick={toggleMute}
                  className="w-full bg-[#E25530] text-black border border-[#FF0500] font-bold uppercase text-xs font-mono py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  {muted ? (
                    <>
                      <VolumeX className="w-4 h-4 text-black" />
                      <span>Unmute Background</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-black" />
                      <span>Mute Background</span>
                    </>
                  )}
                </button>
              </div>

              {/* Moved Sync Updates block */}
              <div className="border-t border-[#FF0500]/50 pt-4 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#FFB451]">
                    <TrendingUp className="w-4 h-4 text-[#FFB451]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-[#FFB451]">
                      Fandom wiki cargo synchronization
                    </h4>
                  </div>
                  <p className="text-[#FFB451] text-[11px] leading-relaxed">
                    * Retrieves the latest civilized galaxies, hubs, and coordinates database directly from Fandom cargo tables recursively.
                  </p>
                  <p className="text-[#FFB451] text-[11px] leading-relaxed">
                    * Runs a throttling process with 35s intervals to protect Wiki APIs from rate-limits.
                  </p>
                  <p className="text-[#FFB451] text-[10px] font-mono leading-none pt-1">
                    * Sync refresh may take up to 5 minutes to complete
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

                {!syncStatus.active && syncStatus.processed > 0 && (
                  <div className="mt-3 text-center bg-zinc-900 border border-[#FF0500] p-2 rounded text-xs font-mono text-[#FFB451]">
                    ✓ Sincronização Concluída ({syncStatus.processed.toLocaleString()} registros colocados em cache)
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
