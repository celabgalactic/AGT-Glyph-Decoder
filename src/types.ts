/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RegionInfo {
  name: string;
  coordinates: string;
}

export interface GalaxyData {
  civilizations: string[];
  regions: {
    [civilizationName: string]: RegionInfo[];
  };
}

export interface DatabaseState {
  galaxies: string[];
  data: {
    [galaxyName: string]: GalaxyData;
  };
}

export interface CargoItem {
  title: {
    civilizeD: string;
    galaxyY: string;
    coordinateS: string;
    pageName: string;
  };
}

export interface SyncProgress {
  active: boolean;
  offset: number;
  total: number;
  processed: number;
  timeEstimate: string;
  statusText: string;
}

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'th' | 'hi' | 'zh' | 'ja';

export interface GlyphMetadata {
  char: string;
  nameEn: string;
  nameEs: string;
  desc: string;
}
