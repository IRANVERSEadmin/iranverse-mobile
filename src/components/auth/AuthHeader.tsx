// src/components/auth/AuthHeader.tsx
// IRANVERSE Enterprise Auth Header - Revolutionary Navigation Consistency
// Tesla-inspired auth navigation with Agent Identity Flow
// Built for 90M users - Consistent Header Across Auth Screens
import React, { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Platform,
  GestureResponderEvent,
} from 'react-native';
import Text from '../ui/Text';
import { useTheme, useColors, useTypography, useSpacing } from '../theme/ThemeProvider';

// ========================================================================================
// AUTH HEADER TYPES & INTERFACES
// ========================================================================================

export interface AuthHeaderProps {
  // Navigation Props
  showBackButton?: boolean;
  onBackPress?: (event: GestureResponderEvent) => void;
  
  // Content Props
  title?: string;
  subtitle?: string;
  
  // Styling Props
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  
  // Accessibility Props
  accessibilityLabel?: string;
  testID?: string;
  
  // Persian/RTL Support
  rtl?: boolean;
  persianText?: boolean;
}

// ========================================================================================
// AUTH HEADER IMPLEMENTATION - ENTERPRISE CONSISTENCY
// ========================================================================================

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  showBackButton = false,
  onBackPress,
  title,
  subtitle,
  style,
  titleStyle,
  subtitleStyle,
  accessibilityLabel,
  testID,
  rtl = false,
  persianText = false,
}) => {
  
  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  
  // ========================================================================================
  // INTERACTION HANDLERS - ENTERPRISE NAVIGATION
  // ========================================================================================
  
  const handleBackPress = useCallback((event: GestureResponderEvent) => {
    if (onBackPress) {
      onBackPress(event);
    }
  }, [onBackPress]);
  
  // ========================================================================================
  // RENDER HELPERS - COMPONENT COMPOSITION
  // ========================================================================================
  
  const renderBackButton = () => {
    if (!showBackButton) return null;
    
    return (
      <TouchableOpacity
        onPress={handleBackPress}
        style={[
          styles.backButton,
          { 
            marginRight: rtl ? 0 : spacing.md,
            marginLeft: rtl ? spacing.md : 0,
          }
        ]}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        accessibilityHint="Navigate to previous screen"
        testID="auth-header-back-button"
      >
        <Text
          style={[
            styles.backButtonText,
            { 
              color: colors.interactive.text,
              transform: [{ scaleX: rtl ? -1 : 1 }],
            }
          ]}
        >
          ←
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderTitle = () => {
    if (!title) return null;
    
    return (
      <Text
        variant="h2"
        weight="600"
        align={rtl ? 'right' : 'left'}
        style={[
          {
            color: colors.interactive.text,
            marginBottom: subtitle ? spacing.xs : 0,
          },
          titleStyle || {},
        ]}
        persianText={persianText}
        rtl={rtl}
      >
        {title}
      </Text>
    );
  };
  
  const renderSubtitle = () => {
    if (!subtitle) return null;
    
    return (
      <Text
        variant="body"
        align={rtl ? 'right' : 'left'}
        style={[
          {
            color: colors.interactive.textSecondary,
            opacity: 0.8,
            lineHeight: 24,
          },
          subtitleStyle || {},
        ]}
        persianText={persianText}
        rtl={rtl}
      >
        {subtitle}
      </Text>
    );
  };
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE CONSISTENCY
  // ========================================================================================
  
  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: rtl ? 'row-reverse' : 'row',
          paddingTop: Platform.select({
            ios: 8,
            android: 16,
            default: 12,
          }),
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {/* Back Button Section */}
      <View style={styles.backButtonSection}>
        {renderBackButton()}
      </View>
      
      {/* Content Section */}
      <View style={[styles.contentSection, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
        {renderTitle()}
        {renderSubtitle()}
      </View>
    </View>
  );
};

// ========================================================================================
// STYLES - ENTERPRISE DESIGN SYSTEM
// ========================================================================================

const styles = {
  container: {
    alignItems: 'flex-start' as const,
    paddingHorizontal: 0,
    paddingBottom: 16,
  } as ViewStyle,
  
  backButtonSection: {
    minWidth: 44,
    alignItems: 'flex-start' as const,
    justifyContent: 'flex-start' as const,
  } as ViewStyle,
  
  contentSection: {
    flex: 1,
    justifyContent: 'flex-start' as const,
  } as ViewStyle,
  
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  } as ViewStyle,
  
  backButtonText: {
    fontSize: 24,
    fontWeight: '300' as const,
    lineHeight: 28,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'system',
    }),
  } as TextStyle,
};

export default AuthHeader;