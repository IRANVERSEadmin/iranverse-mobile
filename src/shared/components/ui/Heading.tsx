// src/components/ui/Heading.tsx
// IRANVERSE Enterprise Heading - Revolutionary Hierarchical Typography
// Tesla-inspired headings with Agent Identity Hierarchy
// Built for 90M users - Semantic Structure & Accessibility Excellence
import React, { useMemo, forwardRef, useEffect } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import Text, { TextProps } from './Text';
import { useTheme } from '../../theme/ThemeProvider';

// ========================================================================================
// HEADING VARIANTS & TYPES - ENTERPRISE HIERARCHY SYSTEM
// ========================================================================================

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingVariant = 
  | 'display'      // Hero display heading
  | 'section'      // Section headings
  | 'page'         // Page title headings
  | 'card'         // Card title headings
  | 'inline'       // Inline headings
  | 'accent';      // Accent/highlight headings

export type HeadingDecoration = 
  | 'none'         // No decoration
  | 'underline'    // Underline decoration
  | 'overline'     // Overline decoration
  | 'border'       // Left/right border
  | 'background'   // Background highlight
  | 'gradient';    // Gradient background

export interface HeadingProps extends Omit<TextProps, 'variant' | 'decoration'> {
  // Hierarchy
  level?: HeadingLevel;
  
  // Design Variants
  variant?: HeadingVariant;
  decoration?: HeadingDecoration;
  
  // Spacing
  spacing?: 'tight' | 'normal' | 'loose' | 'none';
  marginTop?: number;
  marginBottom?: number;
  
  // Visual Enhancement
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  badge?: string | number;
  badgeColor?: string;
  
  // Layout
  centered?: boolean;
  fullWidth?: boolean;
  
  // Styling
  containerStyle?: ViewStyle;
  decorationStyle?: ViewStyle;
  iconStyle?: ViewStyle;
  badgeStyle?: ViewStyle;
  
  // Animation
  animated?: boolean;
  animationDelay?: number;
  
  // Accessibility Enhancement
  semanticLevel?: HeadingLevel; // For screen readers when visual != semantic
  landmark?: boolean;
  
  // Advanced Features
  sticky?: boolean;
  collapsible?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

// ========================================================================================
// HEADING IMPLEMENTATION - REVOLUTIONARY HIERARCHY
// ========================================================================================

export const Heading = forwardRef<View, HeadingProps>(({
  level = 1,
  variant = 'page',
  decoration = 'none',
  spacing = 'normal',
  marginTop,
  marginBottom,
  icon,
  iconPosition = 'left',
  badge,
  badgeColor,
  centered = false,
  fullWidth = false,
  containerStyle,
  decorationStyle,
  iconStyle,
  badgeStyle,
  animated = false,
  animationDelay = 0,
  semanticLevel,
  landmark = false,
  sticky = false,
  collapsible = false,
  onToggle,
  children,
  style,
  rtl = false,
  persianText = false,
  ...textProps
}, ref) => {
  
  // Theme System
  const theme = useTheme();
  const colors = theme.colors;
  const typography = theme.typography;
  const spacing_tokens = theme.spacing;
  const radius = theme.radius;
  
  // Animation Values with cleanup
  const fadeAnim = React.useRef(new Animated.Value(animated ? 0 : 1)).current;
  const slideAnim = React.useRef(new Animated.Value(animated ? -20 : 0)).current;
  
  // Cleanup animations
  useEffect(() => {
    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      fadeAnim.removeAllListeners();
      slideAnim.removeAllListeners();
    };
  }, [fadeAnim, slideAnim]);
  
  // Collapsible State
  const [collapsed, setCollapsed] = React.useState(false);
  
  // ========================================================================================
  // STYLE COMPUTATION - HIERARCHICAL DESIGN SYSTEM
  // ========================================================================================
  
  const levelConfig = useMemo(() => {
    const configs: Record<HeadingLevel, { 
      textVariant: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall';
      weight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
      spacing: number;
    }> = {
      1: { textVariant: 'display', weight: '700', spacing: spacing_tokens.xl },
      2: { textVariant: 'h1', weight: '600', spacing: spacing_tokens.lg },
      3: { textVariant: 'h2', weight: '600', spacing: spacing_tokens.lg },
      4: { textVariant: 'h3', weight: '500', spacing: spacing_tokens.md },
      5: { textVariant: 'body', weight: '500', spacing: spacing_tokens.md },
      6: { textVariant: 'bodySmall', weight: '500', spacing: spacing_tokens.sm },
    };
    
    return configs[level];
  }, [level, spacing_tokens]);
  
  const variantConfig = useMemo(() => {
    const configs: Record<HeadingVariant, {
      colorKey: keyof typeof colors.interactive;
      letterSpacing: number;
      transform?: TextStyle['textTransform'];
    }> = {
      display: { 
        colorKey: 'text', 
        letterSpacing: -1.5,
        transform: 'none',
      },
      section: { 
        colorKey: 'text', 
        letterSpacing: -0.5,
        transform: 'none',
      },
      page: { 
        colorKey: 'text', 
        letterSpacing: -0.25,
        transform: 'none',
      },
      card: { 
        colorKey: 'text', 
        letterSpacing: 0,
        transform: 'none',
      },
      inline: { 
        colorKey: 'text', 
        letterSpacing: 0,
        transform: 'none',
      },
      accent: { 
        colorKey: 'text', 
        letterSpacing: 0.5,
        transform: 'uppercase',
      },
    };
    
    return configs[variant];
  }, [variant, colors]);
  
  const spacingConfig = useMemo(() => {
    const configs = {
      none: { top: 0, bottom: 0 },
      tight: { 
        top: levelConfig.spacing * 0.5, 
        bottom: levelConfig.spacing * 0.3 
      },
      normal: { 
        top: levelConfig.spacing, 
        bottom: levelConfig.spacing * 0.6 
      },
      loose: { 
        top: levelConfig.spacing * 1.5, 
        bottom: levelConfig.spacing 
      },
    };
    
    return configs[spacing];
  }, [spacing, levelConfig.spacing]);
  
  const containerStyles = useMemo(() => {
    const baseStyle: ViewStyle = {
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: centered ? 'center' : rtl ? 'flex-end' : 'flex-start',
      width: fullWidth ? '100%' : undefined,
      marginTop: marginTop !== undefined ? marginTop : spacingConfig.top,
      marginBottom: marginBottom !== undefined ? marginBottom : spacingConfig.bottom,
    };
    
    // Sticky positioning
    if (sticky) {
      Object.assign(baseStyle, {
        position: 'sticky' as any,
        top: 0,
        zIndex: 100,
        backgroundColor: colors.interactive.background,
      });
    }
    
    return baseStyle;
  }, [
    rtl,
    centered,
    fullWidth,
    marginTop,
    marginBottom,
    spacingConfig,
    sticky,
    colors,
  ]);
  
  const textStyles = useMemo(() => {
    const baseStyle: TextStyle = {
      fontWeight: levelConfig.weight,
      letterSpacing: variantConfig.letterSpacing,
      textTransform: variantConfig.transform,
      color: colors.interactive.text.primary,
    };
    
    return baseStyle;
  }, [levelConfig, variantConfig, colors]);

  const finalTextStyle = useMemo(() => {
    if (style) {
      return { ...textStyles, ...(style as TextStyle) };
    }
    return textStyles;
  }, [textStyles, style]);
  
  // ========================================================================================
  // DECORATION RENDERING - VISUAL ENHANCEMENT
  // ========================================================================================
  
  const renderDecoration = () => {
    if (decoration === 'none') return null;
    
    const decorationColor = colors.interactive.border;
    const accentColor = colors.accent.critical; // Vibrant orange for accents
    
    switch (decoration) {
      case 'underline':
        return (
          <View
            style={[
              {
                position: 'absolute',
                bottom: -4,
                left: centered ? '25%' : 0,
                right: centered ? '25%' : undefined,
                width: centered ? '50%' : '100%',
                height: 2,
                backgroundColor: accentColor,
                borderRadius: 1,
              },
              decorationStyle,
            ]}
          />
        );
        
      case 'overline':
        return (
          <View
            style={[
              {
                position: 'absolute',
                top: -4,
                left: centered ? '25%' : 0,
                right: centered ? '25%' : undefined,
                width: centered ? '50%' : '100%',
                height: 2,
                backgroundColor: accentColor,
                borderRadius: 1,
              },
              decorationStyle,
            ]}
          />
        );
        
      case 'border':
        return (
          <View
            style={[
              {
                position: 'absolute',
                left: rtl ? undefined : -spacing_tokens.md,
                right: rtl ? -spacing_tokens.md : undefined,
                top: 0,
                bottom: 0,
                width: 3,
                backgroundColor: accentColor,
                borderRadius: 1.5,
              },
              decorationStyle,
            ]}
          />
        );
        
      case 'background':
        return (
          <View
            style={[
              {
                position: 'absolute',
                top: -spacing_tokens.xs,
                bottom: -spacing_tokens.xs,
                left: -spacing_tokens.sm,
                right: -spacing_tokens.sm,
                backgroundColor: `${accentColor}15`,
                borderRadius: radius.sm,
                zIndex: -1,
              },
              decorationStyle,
            ]}
          />
        );
        
      case 'gradient':
        return (
          <View
            style={[
              {
                position: 'absolute',
                top: -spacing_tokens.xs,
                bottom: -spacing_tokens.xs,
                left: -spacing_tokens.sm,
                right: -spacing_tokens.sm,
                borderRadius: radius.sm,
                zIndex: -1,
                // Gradient simulation with multiple layers
                backgroundColor: `${accentColor}20`,
              },
              decorationStyle,
            ]}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: `${accentColor}10`,
                borderRadius: radius.sm,
              }}
            />
          </View>
        );
        
      default:
        return null;
    }
  };
  
  // ========================================================================================
  // CONTENT RENDERING - HIERARCHICAL COMPOSITION
  // ========================================================================================
  
  const renderIcon = () => {
    if (!icon) return null;
    
    const iconSize = level <= 2 ? 24 : level <= 4 ? 20 : 16;
    
    // Simple icon rendering without cloneElement to avoid prop conflicts
    const iconStyle = {
      width: iconSize,
      height: iconSize,
      color: colors.interactive.text,
    };
    
    const marginStyle = iconPosition === 'left' ? 
      (rtl ? { marginLeft: spacing_tokens.sm } : { marginRight: spacing_tokens.sm }) :
      (rtl ? { marginRight: spacing_tokens.sm } : { marginLeft: spacing_tokens.sm });
    
    return (
      <View style={marginStyle}>
        <View style={iconStyle}>
          {icon}
        </View>
      </View>
    );
  };
  
  const renderBadge = () => {
    if (!badge) return null;
    
    return (
      <View
        style={[
          {
            backgroundColor: badgeColor || colors.accent.critical,
            borderRadius: radius.full,
            paddingHorizontal: spacing_tokens.xs,
            paddingVertical: spacing_tokens.xs / 2,
            marginLeft: rtl ? 0 : spacing_tokens.sm,
            marginRight: rtl ? spacing_tokens.sm : 0,
            minWidth: 20,
            alignItems: 'center',
            justifyContent: 'center',
          },
          badgeStyle,
        ]}
      >
        <Text
          variant="caption"
          weight="600"
          color={colors.foundation.white}
          style={{ fontSize: 10, lineHeight: 12 }}
        >
          {badge}
        </Text>
      </View>
    );
  };
  
  const renderCollapseButton = () => {
    if (!collapsible) return null;
    
    return (
      <Text
        onPress={() => {
          setCollapsed(!collapsed);
          onToggle?.(!collapsed);
        }}
        style={{
          marginLeft: rtl ? 0 : spacing_tokens.sm,
          marginRight: rtl ? spacing_tokens.sm : 0,
          color: colors.interactive.text.secondary,
          fontSize: level <= 2 ? 16 : 14,
        }}
        accessibilityRole="button"
        accessibilityLabel={collapsed ? 'Expand section' : 'Collapse section'}
      >
        {collapsed ? '▶' : '▼'}
      </Text>
    );
  };
  
  const renderContent = () => (
    <View style={{ flex: 1, position: 'relative' }}>
      {renderDecoration()}
      
      <View style={{
        flexDirection: rtl ? 'row-reverse' : 'row',
        alignItems: 'center',
        flex: 1,
      }}>
        {iconPosition === 'left' && renderIcon()}
        
        <Text
          variant={levelConfig.textVariant}
          weight={levelConfig.weight}
          style={finalTextStyle}
          rtl={rtl}
          persianText={persianText}
          accessibilityRole="header"
          {...textProps}
        >
          {children}
        </Text>
        
        {iconPosition === 'right' && renderIcon()}
        {renderBadge()}
        {renderCollapseButton()}
      </View>
    </View>
  );
  
  // ANIMATION SYSTEM - ENTERPRISE ENTRANCE with cleanup
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    
    if (animated) {
      timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 400,
            friction: 12,
            useNativeDriver: true,
          }),
        ]).start();
      }, animationDelay);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [animated, animationDelay, fadeAnim, slideAnim]);
  
  // ========================================================================================
  // DYNAMIC STYLES - ANIMATION INTEGRATION
  // ========================================================================================
  
  const animatedStyles = useMemo(() => {
    if (!animated) return {};
    
    return {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    };
  }, [animated, fadeAnim, slideAnim]);
  
  // ========================================================================================
  // ACCESSIBILITY ENHANCEMENT - SEMANTIC STRUCTURE
  // ========================================================================================
  
  const accessibilityProps = useMemo(() => {
    const props: any = {
      accessibilityRole: 'header',
      accessible: true,
    };
    
    // Landmark for major headings
    if (landmark || level <= 2) {
      props.accessibilityTraits = ['header'];
    }
    
    // Language hint for Persian text
    if (persianText) {
      props.accessibilityLanguage = 'fa';
    }
    
    // Collapsible state
    if (collapsible) {
      props.accessibilityState = { expanded: !collapsed };
    }
    
    // Add semantic level information to accessibility label if different from visual
    if (semanticLevel && semanticLevel !== level) {
      const currentLabel = textProps.accessibilityLabel || '';
      props.accessibilityLabel = `${currentLabel} Heading level ${semanticLevel}`.trim();
    }
    
    return props;
  }, [semanticLevel, level, landmark, persianText, collapsible, collapsed, textProps.accessibilityLabel]);
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE HIERARCHY
  // ========================================================================================
  
  const Container = animated ? Animated.View : View;
  
  return (
    <Container
      ref={ref}
      style={[containerStyles, animatedStyles, containerStyle]}
      {...accessibilityProps}
    >
      {renderContent()}
    </Container>
  );
});

Heading.displayName = 'Heading';

// ========================================================================================
// HEADING VARIANTS - CONVENIENT PRESETS
// ========================================================================================

export const DisplayHeading: React.FC<Omit<HeadingProps, 'level' | 'variant'>> = (props) => (
  <Heading {...props} level={1} variant="display" />
);

export const PageHeading: React.FC<Omit<HeadingProps, 'variant'>> = (props) => (
  <Heading {...props} variant="page" />
);

export const SectionHeading: React.FC<Omit<HeadingProps, 'variant'>> = (props) => (
  <Heading {...props} variant="section" />
);

export const CardHeading: React.FC<Omit<HeadingProps, 'variant'>> = (props) => (
  <Heading {...props} variant="card" />
);

export const InlineHeading: React.FC<Omit<HeadingProps, 'variant'>> = (props) => (
  <Heading {...props} variant="inline" />
);

export const AccentHeading: React.FC<Omit<HeadingProps, 'variant'>> = (props) => (
  <Heading {...props} variant="accent" />
);

// Level-specific variants
export const H1: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading {...props} level={1} />
);

export const H2: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading {...props} level={2} />
);

export const H3: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading {...props} level={3} />
);

export const H4: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading {...props} level={4} />
);

export const H5: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading {...props} level={5} />
);

export const H6: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading {...props} level={6} />
);

// Persian variants
export const PersianHeading: React.FC<Omit<HeadingProps, 'persianText' | 'rtl'>> = (props) => (
  <Heading {...props} persianText rtl />
);

export const PersianDisplayHeading: React.FC<Omit<HeadingProps, 'level' | 'variant' | 'persianText' | 'rtl'>> = (props) => (
  <Heading {...props} level={1} variant="display" persianText rtl />
);

export const PersianPageHeading: React.FC<Omit<HeadingProps, 'variant' | 'persianText' | 'rtl'>> = (props) => (
  <Heading {...props} variant="page" persianText rtl />
);

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Heading;
