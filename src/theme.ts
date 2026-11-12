import { ThemeKey } from './types';

export interface ThemePalette {
  key: ThemeKey;
  name: string;
  desc: string;
  accent: string;
  accentGlow: string;
  accentTint: string;
  accentMuted: string;
  bg: string;
  bgCard: string;
  bgCardSolid: string;
  bgCardElevated: string;
  bgInput: string;
  border: string;
  borderActive: string;
  text: string;
  textDim: string;
  textMuted: string;
  secondary: string;
  yellow: string;
  emerald: string;
  crimson: string;
}

export const THEME_PALETTES: Record<ThemeKey, ThemePalette> = {
  amber_gold: {
    key: 'amber_gold',
    name: 'Obsidian × Amber Gold',
    desc: 'Luxury high-performance gold (Default)',
    accent: '#E5A93C',
    accentGlow: '#F5B842',
    accentTint: 'rgba(229, 169, 60, 0.12)',
    accentMuted: 'rgba(229, 169, 60, 0.25)',
    bg: '#08080B',
    bgCard: '#121217',
    bgCardSolid: '#15151B',
    bgCardElevated: '#1A1A24',
    bgInput: '#0D0D12',
    border: 'rgba(229, 169, 60, 0.18)',
    borderActive: '#E5A93C',
    text: '#FFFFFF',
    textDim: '#D1D5DB',
    textMuted: '#9CA3AF',
    secondary: '#A3907C',
    yellow: '#F5B842',
    emerald: '#10B981',
    crimson: '#EF4444',
  },
  acid_lime: {
    key: 'acid_lime',
    name: 'Midnight × Acid Lime',
    desc: 'Sporty military tactical neon',
    accent: '#D7F45B',
    accentGlow: '#E5FF7A',
    accentTint: 'rgba(215, 244, 91, 0.12)',
    accentMuted: 'rgba(215, 244, 91, 0.25)',
    bg: '#080A08',
    bgCard: '#111611',
    bgCardSolid: '#141C14',
    bgCardElevated: '#182418',
    bgInput: '#0B0F0B',
    border: 'rgba(215, 244, 91, 0.20)',
    borderActive: '#D7F45B',
    text: '#FFFFFF',
    textDim: '#D1D5DB',
    textMuted: '#9CA3AF',
    secondary: '#8E9C78',
    yellow: '#F5B842',
    emerald: '#10B981',
    crimson: '#EF4444',
  },
  electric_blue: {
    key: 'electric_blue',
    name: 'Electric Blue',
    desc: 'Focus-inducing sapphire glow',
    accent: '#3B82F6',
    accentGlow: '#60A5FA',
    accentTint: 'rgba(59, 130, 246, 0.12)',
    accentMuted: 'rgba(59, 130, 246, 0.25)',
    bg: '#070912',
    bgCard: '#0F1524',
    bgCardSolid: '#131B2E',
    bgCardElevated: '#17223B',
    bgInput: '#0A0E1A',
    border: 'rgba(59, 130, 246, 0.22)',
    borderActive: '#3B82F6',
    text: '#FFFFFF',
    textDim: '#D1D5DB',
    textMuted: '#9CA3AF',
    secondary: '#7A8CA3',
    yellow: '#F5B842',
    emerald: '#10B981',
    crimson: '#EF4444',
  },
  cyber_cyan: {
    key: 'cyber_cyan',
    name: 'Cyber Cyan',
    desc: 'High-tech terminal aesthetic',
    accent: '#06B6D4',
    accentGlow: '#22D3EE',
    accentTint: 'rgba(6, 182, 212, 0.12)',
    accentMuted: 'rgba(6, 182, 212, 0.25)',
    bg: '#060B0E',
    bgCard: '#0E171C',
    bgCardSolid: '#111E24',
    bgCardElevated: '#15262E',
    bgInput: '#091114',
    border: 'rgba(6, 182, 212, 0.22)',
    borderActive: '#06B6D4',
    text: '#FFFFFF',
    textDim: '#D1D5DB',
    textMuted: '#9CA3AF',
    secondary: '#76949C',
    yellow: '#F5B842',
    emerald: '#10B981',
    crimson: '#EF4444',
  },
  crimson_fury: {
    key: 'crimson_fury',
    name: 'Crimson Fury',
    desc: 'High-alert intensity and grit',
    accent: '#EF4444',
    accentGlow: '#F87171',
    accentTint: 'rgba(239, 68, 68, 0.12)',
    accentMuted: 'rgba(239, 68, 68, 0.25)',
    bg: '#0C0707',
    bgCard: '#1A0F0F',
    bgCardSolid: '#221414',
    bgCardElevated: '#2A1818',
    bgInput: '#120A0A',
    border: 'rgba(239, 68, 68, 0.22)',
    borderActive: '#EF4444',
    text: '#FFFFFF',
    textDim: '#D1D5DB',
    textMuted: '#9CA3AF',
    secondary: '#9C7A7A',
    yellow: '#F5B842',
    emerald: '#10B981',
    crimson: '#EF4444',
  },
  monochrome: {
    key: 'monochrome',
    name: 'Stealth Monochrome',
    desc: 'Zero distraction pure minimalist',
    accent: '#FFFFFF',
    accentGlow: '#E5E7EB',
    accentTint: 'rgba(255, 255, 255, 0.10)',
    accentMuted: 'rgba(255, 255, 255, 0.20)',
    bg: '#080808',
    bgCard: '#141414',
    bgCardSolid: '#181818',
    bgCardElevated: '#202020',
    bgInput: '#0D0D0D',
    border: 'rgba(255, 255, 255, 0.18)',
    borderActive: '#FFFFFF',
    text: '#FFFFFF',
    textDim: '#D1D5DB',
    textMuted: '#9CA3AF',
    secondary: '#888888',
    yellow: '#F5B842',
    emerald: '#10B981',
    crimson: '#EF4444',
  },
};

let currentThemeKey: ThemeKey = 'amber_gold';

export function getAppTheme(key?: ThemeKey): ThemePalette {
  const k = key || currentThemeKey;
  return THEME_PALETTES[k] || THEME_PALETTES.amber_gold;
}

export const COLORS = {
  // Deep Obsidian & Dark Charcoal Canvas
  bg: '#08080B',
  bgCard: '#121217',
  bgCardSolid: '#15151B',
  bgCardElevated: '#1A1A24',
  bgInput: '#0D0D12',
  border: 'rgba(229, 169, 60, 0.18)',
  borderActive: '#E5A93C',

  // Radiant Amber Gold & Warm Bronze Accents (GRIDLOCK Luxury Theme)
  primary: '#E5A93C',
  primaryText: '#08080B',
  accent: '#E5A93C',
  accentGlow: '#F5B842',
  gold: '#E5A93C',
  goldLight: '#FBD57D',
  goldMuted: 'rgba(229, 169, 60, 0.15)',
  secondary: '#A3907C',
  bronzeMuted: '#5C5447',

  // Status Accents
  yellow: '#F5B842',
  emerald: '#10B981',
  crimson: '#EF4444',
  purple: '#C084FC',

  // Typography
  text: '#FFFFFF',
  textDim: '#D1D5DB',
  textMuted: '#9CA3AF',
};

export const FONTS = {
  mono: 'Courier',
};

export function applyTheme(themeKey: ThemeKey) {
  currentThemeKey = themeKey;
  const palette = THEME_PALETTES[themeKey] || THEME_PALETTES.amber_gold;
  COLORS.bg = palette.bg;
  COLORS.bgCard = palette.bgCard;
  COLORS.bgCardSolid = palette.bgCardSolid;
  COLORS.bgCardElevated = palette.bgCardElevated;
  COLORS.bgInput = palette.bgInput;
  COLORS.border = palette.border;
  COLORS.borderActive = palette.borderActive;
  COLORS.primary = palette.accent;
  COLORS.accent = palette.accent;
  COLORS.accentGlow = palette.accentGlow;
  COLORS.gold = palette.accent;
  COLORS.goldLight = palette.accentGlow;
  COLORS.goldMuted = palette.accentTint;
  COLORS.secondary = palette.secondary;
}
