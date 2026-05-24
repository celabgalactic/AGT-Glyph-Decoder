/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GlyphMetadata } from './types';

export const VALID_PORTAL_KEYS = "0123456789ABCDEF";

export const GLYPH_METADATA_LIST: Record<string, GlyphMetadata> = {
  '0': {
    char: '0',
    nameEn: 'Sunset',
    nameEs: 'Atardecer',
    desc: 'The Sunset glyph, representing the traveler\'s beginning and warmth.'
  },
  '1': {
    char: '1',
    nameEn: 'Bird',
    nameEs: 'Pájaro',
    desc: 'The Bird glyph, symbolizes flight, freedom, and sky exploration.'
  },
  '2': {
    char: '2',
    nameEn: 'Face',
    nameEs: 'Cara',
    desc: 'The Face glyph, also referred to as the Pilgrim or mask.'
  },
  '3': {
    char: '3',
    nameEn: 'Diplo',
    nameEs: 'Diplo',
    desc: 'The dinosaur/diplo glyph, symbolizing prehistoric giant fauna.'
  },
  '4': {
    char: '4',
    nameEn: 'Eclipse',
    nameEs: 'Eclipse',
    desc: 'The Eclipse glyph, visualizing overlapping celestial spheres.'
  },
  '5': {
    char: '5',
    nameEn: 'Balloon',
    nameEs: 'Globo',
    desc: 'The Balloon or Anomaly glyph, representing light gas-filled structures.'
  },
  '6': {
    char: '6',
    nameEn: 'Boat',
    nameEs: 'Barco',
    desc: 'The Boat key, symbolizing oceanic travel and naval navigation.'
  },
  '7': {
    char: '7',
    nameEn: 'Dragonfly',
    nameEs: 'Libélula',
    desc: 'The Dragonfly or insect glyph, represents lightweight micro-flight.'
  },
  '8': {
    char: '8',
    nameEn: 'Beetle',
    nameEs: 'Escarabajo',
    desc: 'The Beetle key, representing hard-shelled lifeforms.'
  },
  '9': {
    char: '9',
    nameEn: 'Galaxy',
    nameEs: 'Galaxia',
    desc: 'The Galaxy or Spiral spiral, representing sprawling stellar systems.'
  },
  'A': {
    char: 'A',
    nameEn: 'Voxel',
    nameEs: 'Vóxel',
    desc: 'The Voxel or Cube key, denoting digital creation and physical materials.'
  },
  'B': {
    char: 'B',
    nameEn: 'Whale',
    nameEs: 'Ballena',
    desc: 'The Whale key, symbolizing cosmic behemoths drifting across nebulas.'
  },
  'C': {
    char: 'C',
    nameEn: 'Tent',
    nameEs: 'Tienda',
    desc: 'The Tent or camp glyph, denotes survival shelters and basic settlements.'
  },
  'D': {
    char: 'D',
    nameEn: 'Shield',
    nameEs: 'Escudo',
    desc: 'The Shield or buckle, symbolizing protection and defensive hardware.'
  },
  'E': {
    char: 'E',
    nameEn: 'Tree',
    nameEs: 'Árbol',
    desc: 'The Tree glyph, representing organic roots, life and flora growth.'
  },
  'F': {
    char: 'F',
    nameEn: 'Atlas',
    nameEs: 'Atlas',
    desc: 'The Atlas diamond glyph, representing the core intelligence of the simulation.'
  }
};

export function randomGlyph(): string {
  return VALID_PORTAL_KEYS[Math.floor(Math.random() * VALID_PORTAL_KEYS.length)];
}

export function validateGlyphInput(glyphString: string): string {
  const formatted = glyphString
    .toUpperCase()
    .split('')
    .filter(char => VALID_PORTAL_KEYS.includes(char))
    .join('');
  return formatted.slice(0, 12);
}

export function coords2Glyphs(coordinates: string): string {
  if (!coordinates || typeof coordinates !== 'string') return '';
  const parts = coordinates.trim().split(':');
  if (parts.length !== 4) return '';
  const [xStr, yStr, zStr, sStr] = parts;
  const coords_x = parseInt(xStr, 16);
  const coords_y = parseInt(yStr, 16);
  const coords_z = parseInt(zStr, 16);
  if (isNaN(coords_x) || isNaN(coords_y) || isNaN(coords_z)) return '';
  
  const X_Z_POS_SHIFT = 2049;
  const X_Z_NEG_SHIFT = 2047;
  const Y_POS_SHIFT = 129;
  const Y_NEG_SHIFT = 127;

  const x_glyph = coords_x <= 2046 ? coords_x + X_Z_POS_SHIFT : coords_x - X_Z_NEG_SHIFT;
  const z_glyph = coords_z <= 2046 ? coords_z + X_Z_POS_SHIFT : coords_z - X_Z_NEG_SHIFT;
  const y_glyph = coords_y <= 126 ? coords_y + Y_POS_SHIFT : coords_y - Y_NEG_SHIFT;

  const xGlyphHex = (x_glyph & 0xFFF).toString(16).toUpperCase().padStart(3, '0');
  const yGlyphHex = (y_glyph & 0xFF).toString(16).toUpperCase().padStart(2, '0');
  const zGlyphHex = (z_glyph & 0xFFF).toString(16).toUpperCase().padStart(3, '0');

  const system_hex = sStr ? sStr.toUpperCase().padStart(4, '0') : '0000';
  return system_hex + yGlyphHex + zGlyphHex + xGlyphHex;
}

export function glyphs2Coords(glyphs: string): string {
  if (!glyphs || typeof glyphs !== 'string') return '';
  const cleanGlyphs = glyphs.trim().toUpperCase().replace(/[^0-9A-F]/g, '');
  if (cleanGlyphs.length !== 12) return '';

  const sStr = cleanGlyphs.slice(0, 4);
  const yStr = cleanGlyphs.slice(4, 6);
  const zStr = cleanGlyphs.slice(6, 9);
  const xStr = cleanGlyphs.slice(9, 12);

  const y_glyph = parseInt(yStr, 16);
  const z_glyph = parseInt(zStr, 16);
  const x_glyph = parseInt(xStr, 16);

  if (isNaN(y_glyph) || isNaN(z_glyph) || isNaN(x_glyph)) return '';

  const X_Z_POS_SHIFT = 2049;
  const X_Z_NEG_SHIFT = 2047;
  const Y_POS_SHIFT = 129;
  const Y_NEG_SHIFT = 127;

  // Reverse Y
  let coords_y = 0;
  if (y_glyph >= Y_POS_SHIFT) {
    coords_y = y_glyph - Y_POS_SHIFT;
  } else {
    coords_y = y_glyph + Y_NEG_SHIFT;
  }

  // Reverse Z
  let coords_z = 0;
  if (z_glyph >= X_Z_POS_SHIFT) {
    coords_z = z_glyph - X_Z_POS_SHIFT;
  } else {
    coords_z = (z_glyph + X_Z_NEG_SHIFT) & 0xFFF;
  }

  // Reverse X
  let coords_x = 0;
  if (x_glyph >= X_Z_POS_SHIFT) {
    coords_x = x_glyph - X_Z_POS_SHIFT;
  } else {
    coords_x = (x_glyph + X_Z_NEG_SHIFT) & 0xFFF;
  }

  const xHex = coords_x.toString(16).toUpperCase().padStart(4, '0');
  const yHex = coords_y.toString(16).toUpperCase().padStart(4, '0');
  const zHex = coords_z.toString(16).toUpperCase().padStart(4, '0');
  const sHex = sStr.toUpperCase().padStart(4, '0');

  return `${xHex}:${yHex}:${zHex}:${sHex}`;
}

export function generateGlyphs(regionInput: string): string {
  const cleanInput = regionInput.trim().toUpperCase();
  let glyphs = "0";

  for (let i = 1; i <= 3; i++) {
    glyphs += randomGlyph();
  }

  if (cleanInput.length >= 12) {
    for (let i = 4; i < 12; i++) {
      if (VALID_PORTAL_KEYS.includes(cleanInput[i])) {
        glyphs += cleanInput[i];
      } else {
        return "";
      }
    }
  } else {
    for (let i = 0; i < 8; i++) {
      glyphs += randomGlyph();
    }
  }

  // Double-padded safe-check
  while (glyphs.length < 12) {
    glyphs += randomGlyph();
  }

  return glyphs.slice(0, 12);
}
