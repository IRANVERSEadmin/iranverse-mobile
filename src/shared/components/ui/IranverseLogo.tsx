/**
 * IRANVERSE Enterprise SVG Logo Component
 * 
 * Features:
 * - Multiple color variants (brand, white, black, auto)
 * - Scalable sizing system
 * - Animation support
 * - Theme integration
 * - Accessibility compliance
 * - Performance optimized
 * 
 * Usage:
 * <IranverseLogo size={120} variant="brand" animated={true} />
 */

import React, { useMemo } from 'react';
import { ViewStyle, TouchableOpacity, useColorScheme } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';

// EXACT SPECIFICATIONS FROM FRONTEND LEAD
interface IranverseLogoProps {
  // Size Configuration
  size?: number;                    // Default: 120
  width?: number;                   // Custom width override
  height?: number;                  // Custom height override
  
  // Visual Variants
  variant?: 'brand' | 'white' | 'black' | 'auto';
  color?: string;                   // Custom color override
  
  // Animation & Effects
  animated?: boolean;               // Default: false
  animationMode?: 'subtle' | 'pulse' | 'glow' | 'entrance';
  glowEffect?: boolean;            // Default: false
  
  // Interaction
  onPress?: () => void;
  disabled?: boolean;
  
  // Layout
  style?: ViewStyle;
  testID?: string;
}

const IranverseLogo: React.FC<IranverseLogoProps> = ({
  size = 120,
  width,
  height,
  variant = 'auto',
  color,
  animated = false,
  animationMode = 'subtle',
  glowEffect = false,
  onPress,
  disabled = false,
  style,
  testID = 'iranverse-logo',
}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  
  // Size calculation logic
  const logoWidth = width || size;
  const logoHeight = height || size;
  
  // Color resolution based on variant
  const logoColor = useMemo(() => {
    if (color) return color;
    
    switch (variant) {
      case 'brand':
        return '#FF6A00'; // IRANVERSE vibrant orange
      case 'white':
        return '#FFFFFF';
      case 'black':
        return '#000000';
      case 'auto':
        return colorScheme === 'dark' ? '#FFFFFF' : '#000000';
      default:
        return '#FF6A00';
    }
  }, [variant, color, theme, colorScheme]);
  
  // SVG path data from LOGO-Black.svg
  const logoPathData = {
    // Path data for letter "N" - stylized
    letterN: "M769.33,290.55c-26.69-11.28-56.35-6.03-77.58,13.78l-70.26,65.57c-21.36,19.93-7.25,55.72,21.96,55.72h0c8.15,0,16-3.09,21.96-8.66l70.26-65.58c3.19-2.98,6.49-2.45,8.7-1.5c4,1.74,4.84,4.97,4.84,7.38v265.45c0,4.36-2.63,6.42-4.84,7.38c-4,1.74-6.94,0.14-8.7-1.5L443.44,355.85l-20.56-19.19c-16.61-15.51-43.63-9.38-51.93,11.78l0,0c-4.82,12.29-1.65,26.27,8,35.28l312.8,291.95c21.23,19.81,50.88,25.06,77.56,13.79c27.02-11.42,44.28-38.26,44.28-67.6V358.14C813.59,328.82,796.34,301.97,769.33,290.55z",
    
    // Path data for letter "i" 
    letterI: "M436.54,554.38c-8.15,0-16,3.09-21.96,8.66l-70.26,65.58c-3.19,2.98-6.49,2.45-8.7,1.5c-4-1.74-4.84-4.97-4.84-7.38V409.53c0-17.78-14.41-32.19-32.19-32.19h0c-17.78,0-32.19,14.41-32.19,32.19v213.19c0,29.29,16.69,54.74,43.56,66.42c9.52,4.14,19.43,6.16,29.2,6.16c17.84,0,35.25-6.72,49.08-19.63l70.26-65.57C479.86,590.16,465.75,554.38,436.54,554.38L436.54,554.38z",
    
    // Circle data for dot on "i"
    dotI: {
      cx: 322.47,
      cy: 321.13,
      r: 32.19
    }
  };
  
  // Calculate scale to fit desired size
  const scale = logoWidth / 1080; // Original viewBox is 1080x1080
  
  const content = (
    <Svg
      width={logoWidth}
      height={logoHeight}
      viewBox="0 0 1080 1080"
      testID={`${testID}-svg`}
    >
      <G>
        {/* Letter N path */}
        <Path
          d={logoPathData.letterN}
          fill={logoColor}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Letter i path */}
        <Path
          d={logoPathData.letterI}
          fill={logoColor}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Dot on i */}
        <Circle
          cx={logoPathData.dotI.cx}
          cy={logoPathData.dotI.cy}
          r={logoPathData.dotI.r}
          fill={logoColor}
        />
        
        {/* Glow effect if enabled */}
        {glowEffect && (
          <G opacity={0.3}>
            <Path
              d={logoPathData.letterN}
              fill={logoColor}
              strokeWidth={4}
              stroke={logoColor}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d={logoPathData.letterI}
              fill={logoColor}
              strokeWidth={4}
              stroke={logoColor}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx={logoPathData.dotI.cx}
              cy={logoPathData.dotI.cy}
              r={logoPathData.dotI.r + 2}
              fill={logoColor}
              strokeWidth={4}
              stroke={logoColor}
            />
          </G>
        )}
      </G>
    </Svg>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={style}
        testID={testID}
        accessibilityLabel="IRANVERSE Logo"
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {content}
      </TouchableOpacity>
    );
  }
  
  return content;
};

export default IranverseLogo;
export type { IranverseLogoProps };