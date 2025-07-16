// src/components/ui/SmartIcon.tsx
// IRANVERSE Smart Icon Component - Intelligent Icon Switching
// Automatically chooses between 2D SVG icons or text-based icons based on configuration
// Built for seamless migration and consistent user experience

import React, { memo } from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import Text from './Text';
import Icon, { IconName, IconSize, IconProps } from './Icon';
import { ICON_CONFIG, ICON_MIGRATION_MAP, MigrationKey } from './IconConfig';
import { useTheme } from '../../theme/ThemeProvider';

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export interface SmartIconProps {
  // New icon system props
  name?: IconName;
  size?: IconSize | number;
  color?: string;
  style?: ViewStyle;
  strokeWidth?: number;
  testID?: string;
  
  // Legacy text-based icon props
  text?: string;
  textStyle?: TextStyle;
  
  // Smart migration props
  migrationKey?: MigrationKey;
  
  // Override config
  force2D?: boolean;
  forceText?: boolean;
}

// ========================================================================================
// SMART ICON COMPONENT
// ========================================================================================

const SmartIcon: React.FC<SmartIconProps> = memo(({
  name,
  size = ICON_CONFIG.DEFAULT_SIZE,
  color,
  style,
  strokeWidth = ICON_CONFIG.DEFAULT_STROKE_WIDTH,
  testID,
  text,
  textStyle,
  migrationKey,
  force2D = false,
  forceText = false,
}) => {
  const theme = useTheme();
  
  // Determine which icon system to use
  const use2DIcons = force2D || (ICON_CONFIG.USE_2D_ICONS && !forceText);
  
  // Auto-determine icon name from migration key or text
  let iconName = name;
  if (!iconName && migrationKey && ICON_MIGRATION_MAP[migrationKey]) {
    iconName = ICON_MIGRATION_MAP[migrationKey];
  }
  
  // Auto-determine text from migration key
  let iconText = text;
  if (!iconText && migrationKey) {
    iconText = migrationKey;
  }
  
  // Calculate size for text-based icons
  const textSize = typeof size === 'number' ? size : {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  }[size] || 20;
  
  // Determine color
  const iconColor = color || 
    (ICON_CONFIG.RESPECT_THEME_COLORS 
      ? '#FFFFFF'
      : '#000000'
    );
  
  if (use2DIcons && iconName) {
    // Use new 2D SVG icon system
    return (
      <Icon
        name={iconName}
        size={size}
        color={iconColor}
        style={style}
        strokeWidth={strokeWidth}
        testID={testID || `icon-${iconName}`}
      />
    );
  } else if (iconText) {
    // Fallback to text-based icon
    return (
      <Text
        style={[
          {
            fontSize: textSize,
            color: iconColor,
            lineHeight: textSize,
            textAlign: 'center',
          },
          textStyle as any,
          style as any,
        ]}
        testID={testID || `text-icon-${iconText}`}
        accessible={ICON_CONFIG.INCLUDE_ACCESSIBILITY_LABELS}
        accessibilityRole="text"
        accessibilityLabel={`${iconText} icon`}
      >
        {iconText}
      </Text>
    );
  } else {
    // Fallback to info icon
    return (
      <Icon
        name="info"
        size={size}
        color={iconColor}
        style={style}
        strokeWidth={strokeWidth}
        testID={testID || "fallback-icon"}
      />
    );
  }
});

SmartIcon.displayName = 'SmartIcon';

// ========================================================================================
// PRESET SMART ICON COMPONENTS
// ========================================================================================

export const SmartSearchIcon: React.FC<Omit<SmartIconProps, 'migrationKey'>> = (props) => (
  <SmartIcon {...props} migrationKey="🔍" />
);

export const SmartBackIcon: React.FC<Omit<SmartIconProps, 'migrationKey'>> = (props) => (
  <SmartIcon {...props} migrationKey="←" />
);

export const SmartCloseIcon: React.FC<Omit<SmartIconProps, 'migrationKey'>> = (props) => (
  <SmartIcon {...props} migrationKey="✕" />
);

export const SmartCheckIcon: React.FC<Omit<SmartIconProps, 'migrationKey'>> = (props) => (
  <SmartIcon {...props} migrationKey="✓" />
);

export const SmartMailIcon: React.FC<Omit<SmartIconProps, 'migrationKey'>> = (props) => (
  <SmartIcon {...props} migrationKey="📧" />
);

export const SmartPhoneIcon: React.FC<Omit<SmartIconProps, 'migrationKey'>> = (props) => (
  <SmartIcon {...props} migrationKey="📱" />
);

export const SmartEyeIcon: React.FC<Omit<SmartIconProps, 'migrationKey'>> = (props) => (
  <SmartIcon {...props} migrationKey="👁" />
);

export const SmartGoogleIcon: React.FC<Omit<SmartIconProps, 'migrationKey'>> = (props) => (
  <SmartIcon {...props} migrationKey="G" />
);

export const SmartAppleIcon: React.FC<Omit<SmartIconProps, 'migrationKey'>> = (props) => (
  <SmartIcon {...props} migrationKey="" />
);

export const SmartTwitterIcon: React.FC<Omit<SmartIconProps, 'migrationKey'>> = (props) => (
  <SmartIcon {...props} migrationKey="𝕏" />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default SmartIcon;