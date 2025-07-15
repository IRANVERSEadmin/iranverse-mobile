// src/components/ui/SafeArea.tsx
// IRANVERSE Enterprise SafeArea - Revolutionary Layout Foundation
// Tesla-inspired safe boundaries with Agent Identity Protection
// Built for 90M users - Universal Device Compatibility
import React, { useMemo } from 'react';
import {
  View,
  ViewStyle,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// ========================================================================================
// SAFE AREA TYPES & INTERFACES - ENTERPRISE LAYOUT SYSTEM
// ========================================================================================

export type SafeAreaEdges = 'top' | 'bottom' | 'left' | 'right';

export interface SafeAreaProps {
  // Core Props
  children: React.ReactNode;
  
  // Edge Configuration
  edges?: SafeAreaEdges[] | 'all' | 'none';
  
  // Styling
  style?: ViewStyle;
  backgroundColor?: string;
  
  // Advanced Features
  forceInsets?: Partial<Record<SafeAreaEdges, number>>;
  minInsets?: Partial<Record<SafeAreaEdges, number>>;
  
  // Status Bar Integration
  statusBarBackgroundColor?: string;
  statusBarTranslucent?: boolean;
  
  // Accessibility
  testID?: string;
}

// ========================================================================================
// DEVICE DETECTION & SAFE AREA CALCULATION
// ========================================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

// Device-specific safe area insets
const getSafeAreaInsets = () => {
  // Default safe area values
  let top = 0;
  let bottom = 0;
  let left = 0;
  let right = 0;
  
  if (Platform.OS === 'ios') {
    // iOS safe area detection
    const isIPhoneX = SCREEN_HEIGHT >= 812 && SCREEN_WIDTH >= 375;
    const isIPad = SCREEN_WIDTH >= 768;
    
    if (isIPhoneX) {
      // iPhone X series and newer
      top = 44;
      bottom = 34;
    } else if (isIPad) {
      // iPad safe areas
      top = 24;
      bottom = 20;
    } else {
      // Classic iPhone
      top = 20;
      bottom = 0;
    }
  } else if (Platform.OS === 'android') {
    // Android safe area detection
    top = StatusBar.currentHeight || 24;
    
    // Android gesture navigation
    const hasGestureNavigation = SCREEN_HEIGHT > 800;
    bottom = hasGestureNavigation ? 16 : 0;
  } else if (Platform.OS === 'web') {
    // Web environment - minimal safe areas
    top = 0;
    bottom = 0;
  }
  
  return { top, bottom, left, right };
};

// ========================================================================================
// SAFE AREA IMPLEMENTATION - UNIVERSAL COMPATIBILITY
// ========================================================================================

export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  edges = 'all',
  style,
  backgroundColor,
  forceInsets = {},
  minInsets = {},
  statusBarBackgroundColor,
  statusBarTranslucent = true,
  testID,
}) => {
  
  // Theme System
  const theme = useTheme();
  const colors = theme.colors;
  
  // ========================================================================================
  // INSET CALCULATION - ENTERPRISE PRECISION
  // ========================================================================================
  
  const safeAreaInsets = useMemo(() => {
    const deviceInsets = getSafeAreaInsets();
    const activeEdges = edges === 'all' ? ['top', 'bottom', 'left', 'right'] as SafeAreaEdges[] :
                       edges === 'none' ? [] :
                       edges;
    
    const insets = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
    
    // Apply device insets for active edges
    activeEdges.forEach(edge => {
      insets[edge] = deviceInsets[edge];
    });
    
    // Apply forced insets (override device values)
    Object.entries(forceInsets).forEach(([edge, value]) => {
      if (value !== undefined) {
        insets[edge as SafeAreaEdges] = value;
      }
    });
    
    // Apply minimum insets (ensure minimum values)
    Object.entries(minInsets).forEach(([edge, value]) => {
      if (value !== undefined) {
        insets[edge as SafeAreaEdges] = Math.max(insets[edge as SafeAreaEdges], value);
      }
    });
    
    return insets;
  }, [edges, forceInsets, minInsets]);
  
  // ========================================================================================
  // STYLE COMPUTATION - RESPONSIVE LAYOUT
  // ========================================================================================
  
  const containerStyle = useMemo(() => {
    const baseStyle: ViewStyle = {
      flex: 1,
      backgroundColor: backgroundColor || colors.foundation.darker,
      paddingTop: safeAreaInsets.top,
      paddingBottom: safeAreaInsets.bottom,
      paddingLeft: safeAreaInsets.left,
      paddingRight: safeAreaInsets.right,
    };
    
    return baseStyle;
  }, [backgroundColor, colors, safeAreaInsets]);
  
  // Status bar background style (for Android)
  const statusBarStyle = useMemo(() => {
    if (Platform.OS !== 'android' || !statusBarBackgroundColor || statusBarTranslucent) {
      return null;
    }
    
    return {
      height: StatusBar.currentHeight || 24,
      backgroundColor: statusBarBackgroundColor,
    } as ViewStyle;
  }, [statusBarBackgroundColor, statusBarTranslucent]);
  
  // ========================================================================================
  // COMPONENT RENDER - UNIVERSAL SAFE BOUNDARIES
  // ========================================================================================
  
  return (
    <>
      {/* Status Bar Background (Android only) */}
      {statusBarStyle && <View style={statusBarStyle} />}
      
      {/* Safe Area Container */}
      <View
        style={[containerStyle, style]}
        testID={testID}
      >
        {children}
      </View>
    </>
  );
};

// ========================================================================================
// UTILITY HOOKS - SAFE AREA ACCESS
// ========================================================================================

export const useSafeAreaInsets = () => {
  return useMemo(() => getSafeAreaInsets(), []);
};

export const useSafeAreaTop = () => {
  const insets = useSafeAreaInsets();
  return insets.top;
};

export const useSafeAreaBottom = () => {
  const insets = useSafeAreaInsets();
  return insets.bottom;
};

// ========================================================================================
// COMPONENT VARIANTS - CONVENIENT PRESETS
// ========================================================================================

export const SafeAreaTop: React.FC<Omit<SafeAreaProps, 'edges'>> = (props) => (
  <SafeArea {...props} edges={['top']} />
);

export const SafeAreaBottom: React.FC<Omit<SafeAreaProps, 'edges'>> = (props) => (
  <SafeArea {...props} edges={['bottom']} />
);

export const SafeAreaHorizontal: React.FC<Omit<SafeAreaProps, 'edges'>> = (props) => (
  <SafeArea {...props} edges={['left', 'right']} />
);

export const SafeAreaVertical: React.FC<Omit<SafeAreaProps, 'edges'>> = (props) => (
  <SafeArea {...props} edges={['top', 'bottom']} />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default SafeArea;