// src/components/ui/Header.tsx
// IRANVERSE Enterprise Header - Revolutionary Navigation System
// Tesla-inspired navigation with search, animations, and enterprise features
// Built for 90M users - Advanced navigation architecture

import React, {
  memo,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useEffect,
  useState,
} from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
  StatusBar,
  ScrollView,
  LayoutChangeEvent,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Text from './Text';
import { useTheme } from '../theme/ThemeProvider';
import SmartIcon, { SmartSearchIcon, SmartBackIcon, SmartCloseIcon } from './SmartIcon';

// ========================================================================================
// CONSTANTS & CONFIGURATION
// ========================================================================================

const HEADER_CONFIG = {
  HEIGHTS: {
    compact: 56,
    standard: 64,
    large: 88,
    extended: 120,
  },
  SAFE_AREA: {
    ios: 44,
    android: StatusBar.currentHeight || 24,
    default: 24,
  },
  ANIMATION_DURATION: 300,
  SCROLL_THRESHOLD: 50,
  SEARCH_DEBOUNCE: 300,
  BADGE_MAX_COUNT: 99,
  HAPTIC_ENABLED: true,
} as const;

const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 1,
  MAX_RECENT_SEARCHES: 5,
  AUTOCOMPLETE_DELAY: 150,
  HIGHLIGHT_COLOR: '#EC602A',
} as const;

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export type HeaderVariant = 
  | 'default'      // Standard header
  | 'glass'        // Glassmorphism effect
  | 'minimal'      // Clean minimal design
  | 'floating'     // Elevated floating header
  | 'immersive';   // Full immersive with background

export type HeaderSize = 'compact' | 'standard' | 'large' | 'extended';
export type HeaderAlignment = 'left' | 'center' | 'right' | 'split';

export interface HeaderAction {
  id?: string;
  icon?: React.ReactNode;
  text?: string;
  badge?: number | string;
  badgeColor?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export interface HeaderSearchConfig {
  enabled?: boolean;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  onClear?: () => void;
  autoFocus?: boolean;
  showSuggestions?: boolean;
  suggestions?: string[];
  recentSearches?: string[];
  onSuggestionPress?: (suggestion: string) => void;
  searchIcon?: React.ReactNode;
  clearIcon?: React.ReactNode;
  loading?: boolean;
}

export interface HeaderTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

export interface HeaderProps {
  // Core
  title?: string;
  subtitle?: string;
  logo?: React.ReactNode;
  
  // Navigation
  showBackButton?: boolean;
  backButtonIcon?: React.ReactNode;
  onBackPress?: () => void;
  
  // Actions
  leftActions?: HeaderAction[];
  rightActions?: HeaderAction[];
  
  // Search
  search?: HeaderSearchConfig;
  
  // Tabs
  tabs?: HeaderTab[];
  activeTab?: string;
  onTabPress?: (tabId: string) => void;
  
  // Design
  variant?: HeaderVariant;
  size?: HeaderSize;
  alignment?: HeaderAlignment;
  
  // Styling
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  backgroundColor?: string;
  backgroundImage?: React.ReactNode;
  
  // Animations
  animated?: boolean;
  scrollOffset?: Animated.Value;
  hideOnScroll?: boolean;
  parallaxEffect?: boolean;
  
  // Status Bar
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  statusBarBackgroundColor?: string;
  statusBarTranslucent?: boolean;
  
  // Safe Area
  safeAreaTop?: boolean;
  safeAreaBottom?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  
  // Enterprise
  analytics?: {
    headerName?: string;
    trackInteractions?: boolean;
  };
  
  // Persian/RTL
  rtl?: boolean;
  persianText?: boolean;
}

export interface HeaderRef {
  focus: () => void;
  blur: () => void;
  showSearch: () => void;
  hideSearch: () => void;
  clearSearch: () => void;
  animateIn: () => void;
  animateOut: () => void;
  getHeight: () => number;
}

// ========================================================================================
// ANIMATION HOOKS
// ========================================================================================

const useHeaderAnimations = (
  animated: boolean,
  hideOnScroll: boolean,
  scrollOffset?: Animated.Value
) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const searchWidth = useRef(new Animated.Value(0)).current;
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // Scroll-based animations
  useEffect(() => {
    if (hideOnScroll && scrollOffset) {
      const listener = scrollOffset.addListener(({ value }) => {
        const shouldHide = value > HEADER_CONFIG.SCROLL_THRESHOLD;
        
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: shouldHide ? -100 : 0,
            duration: HEADER_CONFIG.ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: shouldHide ? 0 : 1,
            duration: HEADER_CONFIG.ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ]).start();
      });
      
      return () => {
        scrollOffset.removeListener(listener);
      };
    }
  }, [hideOnScroll, scrollOffset, translateY, opacity]);
  
  const animateIn = useCallback(() => {
    if (!animated) return;
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: HEADER_CONFIG.ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: HEADER_CONFIG.ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, translateY, opacity, scale]);
  
  const animateOut = useCallback(() => {
    if (!animated) return;
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: HEADER_CONFIG.ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: HEADER_CONFIG.ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, translateY, opacity]);
  
  const showSearch = useCallback(() => {
    setIsSearchVisible(true);
    Animated.spring(searchWidth, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [searchWidth]);
  
  const hideSearch = useCallback(() => {
    Animated.timing(searchWidth, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setIsSearchVisible(false);
    });
  }, [searchWidth]);
  
  return {
    translateY,
    opacity,
    scale,
    searchWidth,
    isSearchVisible,
    animateIn,
    animateOut,
    showSearch,
    hideSearch,
  };
};

// ========================================================================================
// SEARCH COMPONENT
// ========================================================================================

const HeaderSearch = memo<{
  config: HeaderSearchConfig;
  theme: any;
  rtl: boolean;
  onHide: () => void;
}>(({ config, theme, rtl, onHide }) => {
  const [query, setQuery] = useState(config.value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  
  useEffect(() => {
    if (config.autoFocus) {
      inputRef.current?.focus();
    }
  }, [config.autoFocus]);
  
  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      config.onChangeText?.(text);
      setShowSuggestions(text.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH);
    }, SEARCH_CONFIG.AUTOCOMPLETE_DELAY);
  }, [config]);
  
  const handleSubmit = useCallback(() => {
    if (query.trim()) {
      config.onSubmit?.(query);
      setShowSuggestions(false);
      Keyboard.dismiss();
    }
  }, [query, config]);
  
  const handleClear = useCallback(() => {
    setQuery('');
    config.onClear?.();
    config.onChangeText?.('');
    setShowSuggestions(false);
  }, [config]);
  
  const handleSuggestionPress = useCallback((suggestion: string) => {
    setQuery(suggestion);
    config.onSuggestionPress?.(suggestion);
    setShowSuggestions(false);
    Keyboard.dismiss();
  }, [config]);
  
  const searchIcon = config.searchIcon || (
    <SmartSearchIcon size={20} color={theme.colors.interactive.text.secondary} />
  );
  
  const clearIcon = config.clearIcon || (
    <SmartCloseIcon size={16} color={theme.colors.interactive.text.secondary} />
  );
  
  return (
    <View style={{ flex: 1 }}>
      <View style={{
        flexDirection: rtl ? 'row-reverse' : 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.glass.subtle,
        borderRadius: theme.radius.standard,
        paddingHorizontal: theme.spacing.md,
        height: 40,
      }}>
        <TouchableOpacity onPress={handleSubmit} style={{ marginRight: theme.spacing.sm }}>
          {searchIcon}
        </TouchableOpacity>
        
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          placeholder={config.placeholder || 'Search...'}
          placeholderTextColor={theme.colors.interactive.text.tertiary}
          style={{
            flex: 1,
            fontSize: 16,
            fontFamily: theme.typography.families.primary,
            color: theme.colors.interactive.text.primary,
            textAlign: rtl ? 'right' : 'left',
          }}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        
        {config.loading && (
          <ActivityIndicator size="small" color={theme.colors.accent.primary} />
        )}
        
        {query.length > 0 && !config.loading && (
          <TouchableOpacity onPress={handleClear} style={{ marginLeft: theme.spacing.sm }}>
            {clearIcon}
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={onHide} style={{ marginLeft: theme.spacing.sm }}>
          <Text style={{ color: theme.colors.accent.primary }}>Cancel</Text>
        </TouchableOpacity>
      </View>
      
      {showSuggestions && (config.suggestions?.length || config.recentSearches?.length) ? (
        <ScrollView
          style={{
            position: 'absolute',
            top: 44,
            left: 0,
            right: 0,
            maxHeight: 200,
            backgroundColor: theme.colors.foundation.darker,
            borderRadius: theme.radius.standard,
            ...theme.shadows.medium,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {config.recentSearches && config.recentSearches.length > 0 && (
            <>
              <Text style={{
                padding: theme.spacing.sm,
                fontSize: 12,
                color: theme.colors.interactive.text.secondary,
                fontWeight: '600',
              }}>
                Recent Searches
              </Text>
              {config.recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSuggestionPress(search)}
                  style={{
                    padding: theme.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.interactive.border.subtle,
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.interactive.text.primary,
                  }}>
                    {search}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
          
          {config.suggestions && config.suggestions.length > 0 && (
            <>
              <Text style={{
                padding: theme.spacing.sm,
                fontSize: 12,
                color: theme.colors.interactive.text.secondary,
                fontWeight: '600',
              }}>
                Suggestions
              </Text>
              {config.suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSuggestionPress(suggestion)}
                  style={{
                    padding: theme.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.interactive.border.subtle,
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.interactive.text.primary,
                  }}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
});

HeaderSearch.displayName = 'HeaderSearch';

// ========================================================================================
// MAIN HEADER COMPONENT
// ========================================================================================

export const Header = memo(forwardRef<HeaderRef, HeaderProps>((props, ref) => {
  const {
    title,
    subtitle,
    logo,
    showBackButton = false,
    backButtonIcon,
    onBackPress,
    leftActions = [],
    rightActions = [],
    search,
    tabs,
    activeTab,
    onTabPress,
    variant = 'default',
    size = 'standard',
    alignment = 'center',
    style,
    containerStyle,
    titleStyle,
    subtitleStyle,
    backgroundColor,
    backgroundImage,
    animated = false,
    scrollOffset,
    hideOnScroll = false,
    statusBarStyle = 'light-content',
    statusBarBackgroundColor,
    statusBarTranslucent = true,
    safeAreaTop = true,
    safeAreaBottom = false,
    accessibilityLabel,
    accessibilityHint,
    testID = 'header',
    analytics,
    rtl = false,
    persianText = false,
  } = props;
  
  const theme = useTheme();
  const [headerHeight, setHeaderHeight] = useState<number>(HEADER_CONFIG.HEIGHTS[size]);
  const searchInputRef = useRef<TextInput>(null);
  
  // Animations
  const {
    translateY,
    opacity,
    scale,
    searchWidth,
    isSearchVisible,
    animateIn,
    animateOut,
    showSearch,
    hideSearch,
  } = useHeaderAnimations(animated, hideOnScroll, scrollOffset);
  
  // Safe area padding
  const safeAreaTopPadding = safeAreaTop ? Platform.select({
    ios: HEADER_CONFIG.SAFE_AREA.ios,
    android: HEADER_CONFIG.SAFE_AREA.android,
    default: HEADER_CONFIG.SAFE_AREA.default,
  }) : 0;
  
  const safeAreaBottomPadding = safeAreaBottom ? Platform.select({
    ios: 20,
    android: 10,
    default: 10,
  }) : 0;
  
  // Variant styles
  const getVariantStyles = useCallback((): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: backgroundColor || theme.colors.foundation.darker,
    };
    
    switch (variant) {
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || 'rgba(0, 0, 0, 0.85)',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.glass.border,
          ...Platform.select({
            ios: { backdropFilter: 'blur(20px)' },
            web: { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
          }),
        };
      
      case 'minimal':
        return {
          backgroundColor: 'transparent',
          borderBottomWidth: 0,
        };
      
      case 'floating':
        return {
          ...baseStyle,
          borderRadius: theme.radius.large,
          marginHorizontal: theme.spacing.md,
          marginTop: theme.spacing.sm,
          ...theme.shadows.medium,
        };
      
      case 'immersive':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        };
      
      default:
        return {
          ...baseStyle,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.interactive.border.subtle,
          ...theme.shadows.subtle,
        };
    }
  }, [variant, backgroundColor, theme]);
  
  // Container styles
  const containerStyles = useMemo((): ViewStyle => {
    return {
      ...getVariantStyles(),
      paddingTop: safeAreaTopPadding,
      paddingBottom: safeAreaBottomPadding,
      minHeight: HEADER_CONFIG.HEIGHTS[size] + safeAreaTopPadding + safeAreaBottomPadding,
    };
  }, [getVariantStyles, size, safeAreaTopPadding, safeAreaBottomPadding]);
  
  // Content styles
  const contentStyles = useMemo((): ViewStyle => {
    return {
      flexDirection: rtl ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: alignment === 'split' ? 'space-between' : 'center',
      paddingHorizontal: theme.spacing.lg,
      height: HEADER_CONFIG.HEIGHTS[size],
    };
  }, [rtl, alignment, size, theme]);
  
  // Title styles
  const computedTitleStyle = useMemo((): TextStyle => {
    const sizeStyles = {
      compact: theme.typography.scale.body,
      standard: theme.typography.scale.h2,
      large: theme.typography.scale.h2,
      extended: theme.typography.scale.h1,
    };
    
    return {
      ...sizeStyles[size],
      fontWeight: '600',
      color: theme.colors.interactive.text.primary,
      textAlign: alignment === 'center' ? 'center' : rtl ? 'right' : 'left',
      fontFamily: persianText ? theme.typography.families.primary : theme.typography.families.primary,
    };
  }, [size, alignment, rtl, persianText, theme]);
  
  // Handlers
  const handleBackPress = useCallback(() => {
    if (analytics?.trackInteractions) {
      console.log('Header back button pressed:', analytics.headerName);
    }
    onBackPress?.();
  }, [onBackPress, analytics]);
  
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  }, []);
  
  // Imperative API
  useImperativeHandle(ref, () => ({
    focus: () => {
      searchInputRef.current?.focus();
    },
    blur: () => {
      searchInputRef.current?.blur();
    },
    showSearch: () => {
      if (search?.enabled) {
        showSearch();
      }
    },
    hideSearch: () => {
      hideSearch();
    },
    clearSearch: () => {
      // Clear search logic
    },
    animateIn,
    animateOut,
    getHeight: () => headerHeight,
  }), [showSearch, hideSearch, animateIn, animateOut, headerHeight, search]);
  
  // Render helpers
  const renderBackButton = () => {
    if (!showBackButton) return null;
    
    const defaultIcon = (
      <SmartBackIcon 
        size={24} 
        color={theme.colors.interactive.text.primary}
        style={{ transform: [{ scaleX: rtl ? -1 : 1 }] }}
      />
    );
    
    return (
      <TouchableOpacity
        onPress={handleBackPress}
        style={{
          padding: theme.spacing.sm,
          marginRight: theme.spacing.sm,
        }}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        testID="header-back-button"
      >
        {backButtonIcon || defaultIcon}
      </TouchableOpacity>
    );
  };
  
  const renderActions = (actions: HeaderAction[]) => {
    if (!actions.length) return null;
    
    return (
      <View style={{
        flexDirection: rtl ? 'row-reverse' : 'row',
        alignItems: 'center',
      }}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.id || index}
            onPress={action.onPress}
            disabled={action.disabled || action.loading}
            style={{
              padding: theme.spacing.sm,
              opacity: action.disabled ? 0.5 : 1,
              position: 'relative',
            }}
            accessibilityLabel={action.accessibilityLabel}
            accessibilityRole="button"
            testID={action.testID}
          >
            {action.loading ? (
              <ActivityIndicator size="small" color={theme.colors.accent.primary} />
            ) : (
              <>
                {action.icon || (
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.interactive.text.primary,
                    fontWeight: '500',
                  }}>
                    {action.text}
                  </Text>
                )}
                {action.badge !== undefined && (
                  <View style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: action.badgeColor || theme.colors.accent.critical,
                    borderRadius: 10,
                    minWidth: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                  }}>
                    <Text style={{
                      fontSize: 10,
                      color: '#FFFFFF',
                      fontWeight: '600',
                    }}>
                      {typeof action.badge === 'number' && action.badge > HEADER_CONFIG.BADGE_MAX_COUNT
                        ? `${HEADER_CONFIG.BADGE_MAX_COUNT}+`
                        : action.badge}
                    </Text>
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderTitle = () => {
    if (isSearchVisible && search?.enabled) {
      return (
        <Animated.View style={{
          flex: 1,
          width: searchWidth.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }}>
          <HeaderSearch
            config={search}
            theme={theme}
            rtl={rtl}
            onHide={hideSearch}
          />
        </Animated.View>
      );
    }
    
    if (logo) {
      return <View style={{ alignItems: 'center' }}>{logo}</View>;
    }
    
    if (!title) return null;
    
    return (
      <View style={{
        flex: alignment === 'center' ? 1 : 0,
        alignItems: alignment === 'center' ? 'center' : rtl ? 'flex-end' : 'flex-start',
      }}>
        <Text
          style={[computedTitleStyle, titleStyle]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              {
                ...theme.typography.scale.caption,
                color: theme.colors.interactive.text.secondary,
                marginTop: 2,
              },
              subtitleStyle,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  };
  
  const renderTabs = () => {
    if (!tabs || tabs.length === 0) return null;
    
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          marginTop: theme.spacing.sm,
        }}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabPress?.(tab.id)}
            disabled={tab.disabled}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              marginRight: theme.spacing.sm,
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.id ? theme.colors.accent.primary : 'transparent',
              opacity: tab.disabled ? 0.5 : 1,
            }}
          >
            {tab.icon && <View style={{ marginRight: theme.spacing.xs }}>{tab.icon}</View>}
            <Text style={{
              fontSize: 14,
              fontWeight: activeTab === tab.id ? '600' : '400',
              color: activeTab === tab.id ? theme.colors.accent.primary : theme.colors.interactive.text.primary,
            }}>
              {tab.label}
            </Text>
            {tab.badge !== undefined && (
              <View style={{
                marginLeft: theme.spacing.xs,
                backgroundColor: theme.colors.accent.critical,
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
              }}>
                <Text style={{
                  fontSize: 10,
                  color: '#FFFFFF',
                  fontWeight: '600',
                }}>
                  {tab.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  // Animated container
  const animatedContainerStyle = animated ? {
    transform: [
      { translateY },
      { scale },
    ],
    opacity,
  } : {};
  
  // Start animation on mount
  useEffect(() => {
    if (animated) {
      animateIn();
    }
  }, [animated, animateIn]);
  
  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBackgroundColor || backgroundColor || 'transparent'}
        translucent={statusBarTranslucent}
      />
      
      <Animated.View
        style={[containerStyles, animatedContainerStyle, containerStyle]}
        onLayout={handleLayout}
        accessibilityRole="header"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        testID={testID}
      >
        {backgroundImage && (
          <View style={StyleSheet.absoluteFillObject}>
            {backgroundImage}
          </View>
        )}
        
        <View style={[contentStyles, style]}>
          <View style={{
            flexDirection: rtl ? 'row-reverse' : 'row',
            alignItems: 'center',
            flex: alignment === 'center' ? 1 : 0,
          }}>
            {renderBackButton()}
            {renderActions(leftActions)}
          </View>
          
          {renderTitle()}
          
          <View style={{
            flexDirection: rtl ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: rtl ? 'flex-start' : 'flex-end',
            flex: alignment === 'center' ? 1 : 0,
          }}>
            {search?.enabled && !isSearchVisible && (
              <TouchableOpacity
                onPress={showSearch}
                style={{ padding: theme.spacing.sm }}
                accessibilityLabel="Search"
                accessibilityRole="button"
              >
                {search.searchIcon || (
                  <SmartSearchIcon size={20} color={theme.colors.interactive.text.primary} />
                )}
              </TouchableOpacity>
            )}
            {renderActions(rightActions)}
          </View>
        </View>
        
        {renderTabs()}
      </Animated.View>
    </>
  );
}));

Header.displayName = 'Header';

// ========================================================================================
// PRESET COMPONENTS
// ========================================================================================

export const GlassHeader = memo<Omit<HeaderProps, 'variant'>>((props) => (
  <Header {...props} variant="glass" />
));
GlassHeader.displayName = 'GlassHeader';

export const MinimalHeader = memo<Omit<HeaderProps, 'variant'>>((props) => (
  <Header {...props} variant="minimal" />
));
MinimalHeader.displayName = 'MinimalHeader';

export const FloatingHeader = memo<Omit<HeaderProps, 'variant'>>((props) => (
  <Header {...props} variant="floating" />
));
FloatingHeader.displayName = 'FloatingHeader';

export const ImmersiveHeader = memo<Omit<HeaderProps, 'variant'>>((props) => (
  <Header {...props} variant="immersive" />
));
ImmersiveHeader.displayName = 'ImmersiveHeader';

export const SearchHeader = memo<HeaderProps>((props) => (
  <Header
    {...props}
    search={{
      enabled: true,
      placeholder: 'Search...',
      ...props.search,
    }}
  />
));
SearchHeader.displayName = 'SearchHeader';

export const TabHeader = memo<HeaderProps & { defaultTab?: string }>((props) => {
  const [activeTab, setActiveTab] = useState(props.defaultTab || props.tabs?.[0]?.id || '');
  
  return (
    <Header
      {...props}
      activeTab={props.activeTab || activeTab}
      onTabPress={props.onTabPress || setActiveTab}
    />
  );
});
TabHeader.displayName = 'TabHeader';

// ========================================================================================
// EXPORTS
// ========================================================================================

export default Header;