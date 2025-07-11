import { TouchableOpacity } from 'react-native';
// src/components/ui/Header.tsx
// IRANVERSE Enterprise Header - Revolutionary Navigation Architecture
// Tesla-inspired navigation with Agent Identity Empowerment
// Built for 90M users - Enterprise Performance & Accessibility
import React, { useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
  StatusBar,
  GestureResponderEvent,
} from 'react-native';
import { useTheme, useColors, useTypography, useSpacing, useRadius, useShadows, useAnimations } from '../theme/ThemeProvider';

// ========================================================================================
// HEADER VARIANTS & TYPES - ENTERPRISE NAVIGATION SYSTEM
// ========================================================================================

export type HeaderVariant = 
  | 'default'      // Standard header
  | 'glass'        // Glassmorphism header - matches FirstScreen.tsx
  | 'minimal'      // Clean minimal header
  | 'floating';    // Elevated floating header

export type HeaderSize = 'compact' | 'standard' | 'large';

export type HeaderAlignment = 'left' | 'center' | 'right';

export interface HeaderAction {
  icon?: React.ReactNode;
  text?: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export interface HeaderProps {
  // Core Content
  title?: string;
  subtitle?: string;
  
  // Navigation
  showBackButton?: boolean;
  backButtonIcon?: React.ReactNode;
  onBackPress?: (event: GestureResponderEvent) => void;
  
  // Actions
  leftActions?: HeaderAction[];
  rightActions?: HeaderAction[];
  
  // Design Variants
  variant?: HeaderVariant;
  size?: HeaderSize;
  alignment?: HeaderAlignment;
  
  // Styling
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  
  // Status Bar Integration
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  statusBarBackgroundColor?: string;
  statusBarTranslucent?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  testID?: string;
  
  // Persian/RTL Support
  rtl?: boolean;
  persianText?: boolean;
  
  // Advanced Features
  animated?: boolean;
  scrollOffset?: Animated.Value;
  hideOnScroll?: boolean;
  safeAreaTop?: boolean;
  
  // Glass Effect Customization
  glassOpacity?: number;
  glassBlur?: number;
}

// ========================================================================================
// HEADER IMPLEMENTATION - REVOLUTIONARY NAVIGATION
// ========================================================================================

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backButtonIcon,
  onBackPress,
  leftActions = [],
  rightActions = [],
  variant = 'default',
  size = 'standard',
  alignment = 'center',
  style,
  titleStyle,
  subtitleStyle,
  statusBarStyle = 'light-content',
  statusBarBackgroundColor = 'transparent',
  statusBarTranslucent = true,
  accessibilityLabel,
  testID,
  rtl = false,
  persianText = false,
  animated = false,
  scrollOffset,
  hideOnScroll = false,
  safeAreaTop = true,
  glassOpacity = 0.95,
  glassBlur = 20,
}) => {
  
  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  const radius = useRadius();
  const shadows = useShadows();
  const animations = useAnimations();
  
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // ========================================================================================
  // STYLE COMPUTATION - ENTERPRISE DESIGN SYSTEM
  // ========================================================================================
  
  const headerStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      paddingHorizontal: spacing.lg,
    };
    
    // Size-based styles with guaranteed height values
    const sizeStyles: Record<HeaderSize, ViewStyle & { height: number }> = {
      compact: {
        height: 56,
        paddingVertical: spacing.sm,
      },
      standard: {
        height: 64,
        paddingVertical: spacing.md,
      },
      large: {
        height: 80,
        paddingVertical: spacing.lg,
      },
    };
    
    // Safe area adjustment
    const safeAreaStyle: ViewStyle = safeAreaTop ? {
      paddingTop: Platform.select({
        ios: 44, // Standard iOS safe area
        android: StatusBar.currentHeight || 24,
        default: 24,
      }),
    } : {};
    
    // Variant-based styles
    const variantStyles: Record<HeaderVariant, ViewStyle> = {
      default: {
        backgroundColor: colors.interactive.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.interactive.border,
        ...shadows.subtle,
      },
      glass: {
        backgroundColor: `rgba(0, 0, 0, ${glassOpacity})`,
        borderBottomWidth: 1,
        borderBottomColor: colors.glass.border,
        ...shadows.glass,
        // Glass blur effect (platform specific)
        ...Platform.select({
          ios: {
            backdropFilter: `blur(${glassBlur}px)`,
          },
          android: {
            elevation: 8,
            shadowColor: colors.glass.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          },
          web: {
            backdropFilter: `blur(${glassBlur}px)`,
            WebkitBackdropFilter: `blur(${glassBlur}px)`,
          },
        }),
      },
      minimal: {
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
      },
      floating: {
        backgroundColor: colors.interactive.surface,
        borderRadius: radius.lg,
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        ...shadows.medium,
        elevation: 6,
      },
    };
    
    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...safeAreaStyle,
      ...variantStyles[variant],
    };
  }, [
    variant,
    size,
    rtl,
    safeAreaTop,
    glassOpacity,
    glassBlur,
    colors,
    spacing,
    radius,
    shadows,
  ]);
  
  const titleStyles = useMemo(() => {
    const baseStyle: TextStyle = {
      fontFamily: persianText ? typography.families.persian : typography.families.primary,
      color: colors.interactive.text,
      textAlign: alignment === 'center' ? 'center' : rtl ? 'right' : 'left',
      flex: alignment === 'center' ? 1 : 0,
    };
    
    // Size-based title styles
    const sizeTitleStyles: Record<HeaderSize, TextStyle> = {
      compact: {
        ...typography.scale.body,
        fontWeight: '600',
      },
      standard: {
        ...typography.scale.h3,
        fontWeight: '600',
      },
      large: {
        ...typography.scale.h2,
        fontWeight: '600',
      },
    };
    
    // RTL text styles
    const rtlStyle: TextStyle = rtl ? {
      ...typography.rtl.persian,
    } : {};
    
    return {
      ...baseStyle,
      ...sizeTitleStyles[size],
      ...rtlStyle,
    };
  }, [size, alignment, rtl, persianText, colors, typography]);
  
  const subtitleStyles = useMemo(() => {
    return {
      ...typography.scale.bodySmall,
      fontFamily: persianText ? typography.families.persian : typography.families.primary,
      color: colors.interactive.textSecondary,
      textAlign: alignment === 'center' ? 'center' : rtl ? 'right' : 'left',
      marginTop: spacing.xs / 2,
      ...(rtl ? typography.rtl.persian : {}),
    } as TextStyle;
  }, [alignment, rtl, persianText, colors, typography, spacing]);
  
  // ========================================================================================
  // SCROLL ANIMATION - HIDE ON SCROLL
  // ========================================================================================
  
  React.useEffect(() => {
    if (hideOnScroll && scrollOffset) {
      const listener = scrollOffset.addListener(({ value }) => {
        const shouldHide = value > 50; // Hide after 50px scroll
        
        // Get header height safely - guaranteed to exist from sizeStyles
        const headerHeight = (() => {
          switch (size) {
            case 'compact': return 56;
            case 'standard': return 64;
            case 'large': return 80;
            default: return 64;
          }
        })();
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: shouldHide ? 0 : 1,
            duration: animations.duration.fast,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: shouldHide ? -headerHeight : 0,
            duration: animations.duration.fast,
            useNativeDriver: true,
          }),
        ]).start();
      });
      
      return () => scrollOffset.removeListener(listener);
    }
    
    // Enterprise-grade cleanup: Always return a cleanup function
    return () => {
      // No-op cleanup for cases where hideOnScroll or scrollOffset are not provided
    };
  }, [hideOnScroll, scrollOffset, animations, fadeAnim, slideAnim, size]);
  
  // ========================================================================================
  // INTERACTION HANDLERS - ENTERPRISE NAVIGATION
  // ========================================================================================
  
  const handleBackPress = useCallback((event: GestureResponderEvent) => {
    if (onBackPress) {
      onBackPress(event);
    } else {
      // Default back behavior - could integrate with navigation
      console.warn('Header: Back button pressed but no onBackPress handler provided');
    }
  }, [onBackPress]);
  
  // ========================================================================================
  // RENDER HELPERS - COMPONENT COMPOSITION
  // ========================================================================================
  
  const renderBackButton = () => {
    if (!showBackButton) return null;
    
    const defaultBackIcon = (
      <Text style={{
        fontSize: 24,
        color: colors.interactive.text,
        transform: [{ scaleX: rtl ? -1 : 1 }],
      }}>
        ←
      </Text>
    );
    
    return (
      <TouchableOpacity
        onPress={handleBackPress}
        style={{
          padding: spacing.sm,
          marginLeft: rtl ? spacing.sm : -spacing.sm,
          marginRight: rtl ? -spacing.sm : spacing.sm,
          borderRadius: radius.sm,
        }}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        testID="header-back-button"
      >
        {backButtonIcon || defaultBackIcon}
      </TouchableOpacity>
    );
  };
  
  const renderActions = (actions: HeaderAction[], side: 'left' | 'right') => {
    if (!actions.length) return null;
    
    return (
      <View style={{
        flexDirection: rtl ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: spacing.sm,
      }}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={action.onPress}
            disabled={action.disabled}
            style={{
              padding: spacing.sm,
              borderRadius: radius.sm,
              opacity: action.disabled ? 0.5 : 1,
            }}
            accessibilityLabel={action.accessibilityLabel}
            accessibilityRole="button"
            testID={action.testID}
          >
            {action.icon || (
              <Text style={{
                ...typography.scale.button,
                color: colors.interactive.text,
                fontFamily: persianText ? typography.families.persian : typography.families.primary,
              }}>
                {action.text}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderTitle = () => {
    if (!title) return null;
    
    return (
      <View style={{
        flex: alignment === 'center' ? 1 : 0,
        alignItems: alignment === 'center' ? 'center' : rtl ? 'flex-end' : 'flex-start',
        marginHorizontal: spacing.md,
      }}>
        <Text
          style={[titleStyles, titleStyle]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[subtitleStyles, subtitleStyle]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  };
  
  const renderLeftSection = () => {
    const hasBackButton = showBackButton;
    const hasLeftActions = leftActions.length > 0;
    
    if (!hasBackButton && !hasLeftActions) {
      return <View style={{ flex: alignment === 'center' ? 0.2 : 0 }} />;
    }
    
    return (
      <View style={{
        flexDirection: rtl ? 'row-reverse' : 'row',
        alignItems: 'center',
        flex: alignment === 'center' ? 0.2 : 0,
      }}>
        {renderBackButton()}
        {renderActions(leftActions, 'left')}
      </View>
    );
  };
  
  const renderRightSection = () => {
    if (!rightActions.length) {
      return <View style={{ flex: alignment === 'center' ? 0.2 : 0 }} />;
    }
    
    return (
      <View style={{
        flex: alignment === 'center' ? 0.2 : 0,
        alignItems: rtl ? 'flex-start' : 'flex-end',
      }}>
        {renderActions(rightActions, 'right')}
      </View>
    );
  };
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE ACCESSIBILITY
  // ========================================================================================
  
  const animatedStyle = animated ? {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  } : {};
  
  return (
    <>
      {/* Status Bar Configuration */}
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBackgroundColor}
        translucent={statusBarTranslucent}
      />
      
      {/* Header Container */}
      <Animated.View
        style={[headerStyles, animatedStyle, style]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="header"
        testID={testID}
      >
        {renderLeftSection()}
        {renderTitle()}
        {renderRightSection()}
      </Animated.View>
    </>
  );
};

// ========================================================================================
// COMPONENT VARIANTS - CONVENIENT PRESETS
// ========================================================================================

export const GlassHeader: React.FC<Omit<HeaderProps, 'variant'>> = (props) => (
  <Header {...props} variant="glass" />
);

export const MinimalHeader: React.FC<Omit<HeaderProps, 'variant'>> = (props) => (
  <Header {...props} variant="minimal" />
);

export const FloatingHeader: React.FC<Omit<HeaderProps, 'variant'>> = (props) => (
  <Header {...props} variant="floating" />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Header;
