// src/components/ui/IconConfig.ts
// IRANVERSE Icon System Configuration
// Centralized configuration for switching between icon systems

export const ICON_CONFIG = {
  // Set to true to use 2D black & white SVG icons
  // Set to false to use existing text-based icons (emoji/unicode)
  USE_2D_ICONS: true,
  
  // Default icon settings
  DEFAULT_SIZE: 'md' as const,
  DEFAULT_STROKE_WIDTH: 2,
  
  // Theme integration
  RESPECT_THEME_COLORS: true,
  
  // Accessibility
  INCLUDE_ACCESSIBILITY_LABELS: true,
} as const;

// Icon mapping from current text-based to new icon names
export const ICON_MIGRATION_MAP = {
  // Current emoji/text -> New icon name
  '🔍': 'search',
  '←': 'arrow-left',
  '✓': 'check',
  '✕': 'close',
  '📮': 'mail',
  '📧': 'mail',
  '📱': 'phone',
  '👁': 'eye',
  '👁‍🗨': 'eye-off',
  '🎲': 'refresh',
  'G': 'google',
  '𝕏': 'twitter',
  '': 'apple',
  '🇮🇷': 'flag',
} as const;

export type MigrationKey = keyof typeof ICON_MIGRATION_MAP;