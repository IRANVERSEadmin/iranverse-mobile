// src/components/ui/Icon.tsx
// IRANVERSE Enterprise Icon System - 2D Black & White Icons
// Minimalist approach with SVG-based icons for consistent branding
// Built for 90M users - Scalable and theme-aware icon system

import React, { memo } from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Line, Polyline, Polygon, Rect } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export type IconName = 
  // Navigation
  | 'arrow-left' | 'arrow-right' | 'arrow-up' | 'arrow-down'
  | 'chevron-left' | 'chevron-right' | 'chevron-up' | 'chevron-down'
  | 'home' | 'menu' | 'close' | 'back'
  
  // Actions
  | 'search' | 'filter' | 'sort' | 'refresh' | 'share' | 'download'
  | 'upload' | 'edit' | 'delete' | 'add' | 'remove' | 'save'
  | 'copy' | 'paste' | 'cut' | 'undo' | 'redo'
  
  // Communication
  | 'mail' | 'phone' | 'message' | 'notification' | 'chat'
  | 'video-call' | 'microphone' | 'speaker'
  
  // User & Profile
  | 'user' | 'users' | 'profile' | 'avatar' | 'account'
  | 'login' | 'logout' | 'register' | 'settings'
  
  // Status & Feedback
  | 'check' | 'checkmark' | 'error' | 'warning' | 'info'
  | 'success' | 'fail' | 'loading' | 'star' | 'heart'
  
  // Content
  | 'image' | 'video' | 'audio' | 'file' | 'folder'
  | 'document' | 'pdf' | 'link' | 'attachment'
  
  // Interface
  | 'eye' | 'eye-off' | 'calendar' | 'clock' | 'location'
  | 'bookmark' | 'tag' | 'flag' | 'lock' | 'unlock'
  
  // Media
  | 'play' | 'pause' | 'stop' | 'skip-forward' | 'skip-backward'
  | 'volume' | 'volume-off' | 'camera' | 'gallery'
  
  // Social & Auth
  | 'google' | 'apple' | 'twitter' | 'facebook' | 'github'
  | 'linkedin' | 'instagram' | 'youtube';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: string;
  style?: ViewStyle;
  strokeWidth?: number;
  testID?: string;
}

// ========================================================================================
// SIZE MAPPING
// ========================================================================================

const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

// ========================================================================================
// ICON DEFINITIONS
// ========================================================================================

const IconPaths: Record<IconName, React.ReactNode> = {
  // Navigation Icons
  'arrow-left': <Path d="M19 12H5M12 19l-7-7 7-7" />,
  'arrow-right': <Path d="M5 12h14M12 5l7 7-7 7" />,
  'arrow-up': <Path d="M12 19V5M5 12l7-7 7 7" />,
  'arrow-down': <Path d="M12 5v14M19 12l-7 7-7-7" />,
  
  'chevron-left': <Path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  'chevron-right': <Path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  'chevron-up': <Path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  'chevron-down': <Path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  
  'home': <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  'menu': <><Path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'close': <Path d="M18 6L6 18M6 6l12 12" />,
  'back': <Path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  
  // Action Icons
  'search': <><Circle cx="11" cy="11" r="8" /><Path d="M21 21l-4.35-4.35" /></>,
  'filter': <Polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>,
  'sort': <Path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>,
  'refresh': <Polyline points="23,4 23,10 17,10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  'share': <><Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Polyline points="16,6 12,2 8,6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  
  'add': <Path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>,
  'remove': <Path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>,
  'edit': <><Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'delete': <><Polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><Path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'save': <><Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  
  // Communication Icons
  'mail': <><Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><Polyline points="22,6 12,13 2,6" /></>,
  'phone': <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />,
  'message': <><Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  
  // User Icons
  'user': <><Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  'users': <><Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/><Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'profile': <><Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  'settings': <><Circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  
  // Status Icons
  'check': <Polyline points="20,6 9,17 4,12" />,
  'checkmark': <Polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  'error': <><Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><Line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'warning': <><Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'info': <><Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><Line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'star': <Polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>,
  'heart': <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>,
  
  // Interface Icons
  'eye': <><Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><Circle cx="12" cy="12" r="3" /></>,
  'eye-off': <><Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><Line x1="1" y1="1" x2="23" y2="23" /></>,
  'calendar': <><Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/><Line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'clock': <><Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><Polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
  'location': <><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none"/><Circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  'lock': <><Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/><Path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  'unlock': <><Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/><Path d="M7 11V7a5 5 0 019.9-.8" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  
  // Media Icons
  'play': <Polygon points="5,3 19,12 5,21" stroke="currentColor" strokeWidth="2" fill="currentColor"/>,
  'pause': <><Rect x="6" y="4" width="4" height="16" stroke="currentColor" strokeWidth="2" fill="currentColor"/><Rect x="14" y="4" width="4" height="16" stroke="currentColor" strokeWidth="2" fill="currentColor"/></>,
  'camera': <><Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" fill="none"/><Circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  
  // Social Auth Icons (simplified)
  'google': <Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>,
  'apple': <><Path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  'twitter': <Path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
  
  // Default fallback
  'notification': <><Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><Line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'chat': <><Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'video-call': <><Polygon points="23,7 16,12 23,17" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/><Rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  'microphone': <><Path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="2" fill="none"/><Path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
  'speaker': <><Rect x="1" y="3" width="6" height="18" rx="1" ry="1" stroke="currentColor" strokeWidth="2" fill="none"/><Path d="M7 12h14l-4-5v10z" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  'account': <><Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  'login': <><Path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'logout': <><Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'register': <><Path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 108 0 4 4 0 00-8 0M22 11l-3-3-3 3M19 8v8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'success': <><Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><Polyline points="16,8 10,14 8,12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'fail': <><Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><Line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'loading': <><Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><Path d="M14 12a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  'image': <><Rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/><Circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" fill="none"/><Polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/></>,
  'video': <><Polygon points="23,7 16,12 23,17" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/><Rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  'audio': <><Polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/><Path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
  'file': <><Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'folder': <><Path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'document': <><Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
  'pdf': <><Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Line x1="9" y1="15" x2="10" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Line x1="9" y1="18" x2="10" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'link': <><Path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'attachment': <><Path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 16.2a2 2 0 01-2.83-2.83l8.49-8.49" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'bookmark': <><Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'tag': <><Path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'flag': <><Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'stop': <><Rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="currentColor"/></>,
  'skip-forward': <><Polygon points="5,4 15,12 5,20" stroke="currentColor" strokeWidth="2" fill="currentColor"/><Line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'skip-backward': <><Polygon points="19,20 9,12 19,4" stroke="currentColor" strokeWidth="2" fill="currentColor"/><Line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'volume': <><Polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/><Path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
  'volume-off': <><Polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/><Line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'gallery': <><Rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/><Circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" fill="none"/><Polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/></>,
  'facebook': <><Path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'github': <><Path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'linkedin': <><Path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  'instagram': <><Rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2" fill="none"/><Path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" stroke="currentColor" strokeWidth="2" fill="none"/><Line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'youtube': <><Path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" stroke="currentColor" strokeWidth="2" fill="none"/><Polygon points="9.75,15.02 15.5,11.75 9.75,8.48" stroke="currentColor" strokeWidth="2" fill="currentColor"/></>,
  'download': <><Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'upload': <><Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'copy': <><Rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/><Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'paste': <><Path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2" fill="none"/></>,
  'cut': <><Circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><Circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none"/><Line x1="20" y1="4" x2="8.12" y2="15.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Line x1="14.47" y1="14.48" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><Line x1="8.12" y1="8.12" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  'undo': <><Polyline points="1,4 1,10 7,10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Path d="M3.51 15a9 9 0 1017.74-3.07" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'redo': <><Polyline points="23,4 23,10 17,10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Path d="M20.49 15a9 9 0 11-17.74-3.07" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  'avatar': <><Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><Circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/></>,
};

// ========================================================================================
// MAIN ICON COMPONENT
// ========================================================================================

const Icon: React.FC<IconProps> = memo(({
  name,
  size = 'md',
  color,
  style,
  strokeWidth = 2,
  testID,
}) => {
  // Calculate size
  const iconSize = typeof size === 'number' ? size : ICON_SIZES[size];
  
  // Determine color - default to theme-aware black/white
  const iconColor = color || '#FFFFFF';
  
  // Get icon path
  const iconPath = IconPaths[name] || IconPaths['info']; // Fallback to info icon
  
  return (
    <View
      style={[
        {
          width: iconSize,
          height: iconSize,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${name} icon`}
    >
      <Svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        stroke={iconColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {iconPath}
      </Svg>
    </View>
  );
});

Icon.displayName = 'Icon';

// ========================================================================================
// PRESET ICON COMPONENTS
// ========================================================================================

export const SearchIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon {...props} name="search" />
);

export const BackIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon {...props} name="back" />
);

export const CloseIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon {...props} name="close" />
);

export const CheckIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon {...props} name="check" />
);

export const UserIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon {...props} name="user" />
);

export const MailIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon {...props} name="mail" />
);

export const PhoneIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon {...props} name="phone" />
);

export const EyeIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon {...props} name="eye" />
);

export const EyeOffIcon: React.FC<Omit<IconProps, 'name'>> = (props) => (
  <Icon {...props} name="eye-off" />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Icon;