// src/components/auth/AuthFooter.tsx
// IRANVERSE Enterprise Auth Footer - Revolutionary Legal Compliance System
// Tesla-inspired footer with advanced GDPR/CCPA compliance and analytics
// Built for 90M users - Enterprise-grade footer with comprehensive features

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
  ViewStyle,
  TextStyle,
  Linking,
  Animated,
  Modal,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  LayoutChangeEvent,
} from 'react-native';
import Text from '../ui/Text';
import { useTheme } from '../theme/ThemeProvider';

// ========================================================================================
// CONSTANTS & CONFIGURATION
// ========================================================================================

const AUTH_FOOTER_CONFIG = {
  ANIMATION_DURATION: 300,
  LANGUAGE_MODAL_HEIGHT: 400,
  COOKIE_MODAL_HEIGHT: 500,
  GDPR_CONSENT_TIMEOUT: 30000, // 30 seconds
  ANALYTICS_BATCH_SIZE: 10,
  LINK_PRESS_TIMEOUT: 300,
  HAPTIC_ENABLED: true,
  MAX_COOKIE_PREFERENCES: 5,
  SUPPORT_RESPONSE_TIME: '24 hours',
} as const;

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
] as const;

const COOKIE_CATEGORIES = {
  necessary: { id: 'necessary', name: 'Necessary', required: true },
  analytics: { id: 'analytics', name: 'Analytics', required: false },
  marketing: { id: 'marketing', name: 'Marketing', required: false },
  preferences: { id: 'preferences', name: 'Preferences', required: false },
  performance: { id: 'performance', name: 'Performance', required: false },
} as const;

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export type AuthFooterVariant = 'default' | 'compact' | 'signup' | 'minimal' | 'extended';
export type FooterAlignment = 'left' | 'center' | 'right';
export type ComplianceRegion = 'gdpr' | 'ccpa' | 'lgpd' | 'pipeda' | 'global';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface CookiePreference {
  category: string;
  enabled: boolean;
  description?: string;
}

export interface ComplianceConfig {
  region: ComplianceRegion;
  showCookieBanner?: boolean;
  requireExplicitConsent?: boolean;
  dataRetentionDays?: number;
  allowDataDeletion?: boolean;
}

export interface AuthFooterAnalytics {
  trackLinkClicks?: boolean;
  trackLanguageChange?: boolean;
  trackCookieConsent?: boolean;
  sessionId?: string;
  userId?: string;
}

export interface AuthFooterProps {
  // Core
  variant?: AuthFooterVariant;
  alignment?: FooterAlignment;
  
  // Links
  customLinks?: {
    privacy?: string;
    terms?: string;
    support?: string;
    cookies?: string;
    dataRequest?: string;
    security?: string;
  };
  
  // Language
  showLanguageSelector?: boolean;
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  supportedLanguages?: LanguageOption[];
  
  // Compliance
  compliance?: ComplianceConfig;
  showCookiePreferences?: boolean;
  cookiePreferences?: CookiePreference[];
  onCookiePreferencesChange?: (preferences: CookiePreference[]) => void;
  
  // Content
  showCopyright?: boolean;
  copyrightText?: string;
  showSocialLinks?: boolean;
  socialLinks?: Array<{
    platform: string;
    url: string;
    icon: React.ReactNode;
  }>;
  
  // Styling
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  linkStyle?: TextStyle;
  separatorStyle?: ViewStyle;
  
  // Animations
  animated?: boolean;
  animationDelay?: number;
  fadeInOnMount?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  
  // Persian/RTL
  rtl?: boolean;
  persianText?: boolean;
  
  // Analytics
  analytics?: AuthFooterAnalytics;
  
  // Callbacks
  onLinkPress?: (link: string, type: string) => void;
  onError?: (error: Error, context: string) => void;
}

export interface AuthFooterRef {
  showLanguageSelector: () => void;
  hideLanguageSelector: () => void;
  showCookiePreferences: () => void;
  hideCookiePreferences: () => void;
  animateIn: () => void;
  animateOut: () => void;
  getHeight: () => number;
}

// ========================================================================================
// LEGAL TEXT CONFIGURATION
// ========================================================================================

interface LegalTexts {
  [key: string]: {
    default: string;
    signup: string;
    terms: string;
    privacy: string;
    cookies: string;
    and: string;
    or: string;
    support: string;
    contact: string;
    copyright: string;
    dataRequest: string;
    security: string;
    language: string;
    cookieSettings: string;
    acceptAll: string;
    rejectAll: string;
    savePreferences: string;
    required: string;
    optional: string;
    moreInfo: string;
  };
}

const LEGAL_TEXTS: LegalTexts = {
  en: {
    default: 'By continuing, you agree to our',
    signup: 'By creating an account, you agree to our',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    cookies: 'Cookie Policy',
    and: 'and',
    or: 'or',
    support: 'Need help?',
    contact: 'Contact Support',
    copyright: '© 2024 IRANVERSE. All rights reserved.',
    dataRequest: 'Data Request',
    security: 'Security',
    language: 'Language',
    cookieSettings: 'Cookie Settings',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    savePreferences: 'Save Preferences',
    required: 'Required',
    optional: 'Optional',
    moreInfo: 'Learn more',
  },
  fa: {
    default: 'با ادامه، شما با',
    signup: 'با ایجاد حساب کاربری، شما با',
    terms: 'شرایط خدمات',
    privacy: 'سیاست حفظ حریم خصوصی',
    cookies: 'سیاست کوکی',
    and: 'و',
    or: 'یا',
    support: 'نیاز به کمک دارید؟',
    contact: 'تماس با پشتیبانی',
    copyright: '© ۱۴۰۳ ایرانورس. تمامی حقوق محفوظ است.',
    dataRequest: 'درخواست داده',
    security: 'امنیت',
    language: 'زبان',
    cookieSettings: 'تنظیمات کوکی',
    acceptAll: 'پذیرش همه',
    rejectAll: 'رد همه',
    savePreferences: 'ذخیره تنظیمات',
    required: 'ضروری',
    optional: 'اختیاری',
    moreInfo: 'اطلاعات بیشتر',
  },
};

// ========================================================================================
// ANIMATION HOOKS
// ========================================================================================

const useAuthFooterAnimations = (
  animated: boolean,
  animationDelay: number = 0,
  fadeInOnMount: boolean = true
) => {
  const fadeAnim = useRef(new Animated.Value(animated && fadeInOnMount ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(animated ? 20 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(animated ? 0.95 : 1)).current;
  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  
  const animateIn = useCallback(() => {
    if (!animated) return;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: AUTH_FOOTER_CONFIG.ANIMATION_DURATION,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: AUTH_FOOTER_CONFIG.ANIMATION_DURATION,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: animationDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, animationDelay, fadeAnim, slideAnim, scaleAnim]);
  
  const animateOut = useCallback(() => {
    if (!animated) return;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: AUTH_FOOTER_CONFIG.ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: AUTH_FOOTER_CONFIG.ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, fadeAnim, slideAnim]);
  
  const showModal = useCallback(() => {
    Animated.spring(modalSlideAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [modalSlideAnim]);
  
  const hideModal = useCallback((callback?: () => void) => {
    Animated.timing(modalSlideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      callback?.();
    });
  }, [modalSlideAnim]);
  
  return {
    fadeAnim,
    slideAnim,
    scaleAnim,
    modalSlideAnim,
    animateIn,
    animateOut,
    showModal,
    hideModal,
  };
};

// ========================================================================================
// LANGUAGE SELECTOR MODAL
// ========================================================================================

const LanguageSelectorModal = memo<{
  visible: boolean;
  currentLanguage: string;
  languages: LanguageOption[];
  onSelect: (language: string) => void;
  onClose: () => void;
  theme: any;
  rtl: boolean;
  modalSlideAnim: Animated.Value;
}>(({ visible, currentLanguage, languages, onSelect, onClose, theme, rtl, modalSlideAnim }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={{
            backgroundColor: theme.colors.foundation.darker,
            borderTopLeftRadius: theme.radius.large,
            borderTopRightRadius: theme.radius.large,
            maxHeight: AUTH_FOOTER_CONFIG.LANGUAGE_MODAL_HEIGHT,
            transform: [{ translateY: modalSlideAnim }],
            ...theme.shadows.large,
          }}
        >
          {/* Modal Header */}
          <View style={{
            flexDirection: rtl ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.interactive.border.subtle,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.colors.interactive.text.primary,
            }}>
              Select Language
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{
                fontSize: 24,
                color: theme.colors.interactive.text.secondary,
              }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Language List */}
          <ScrollView style={{ padding: theme.spacing.lg }}>
            {languages.map((language) => {
              const isSelected = language.code === currentLanguage;
              
              return (
                <TouchableOpacity
                  key={language.code}
                  onPress={() => {
                    onSelect(language.code);
                    onClose();
                  }}
                  style={{
                    flexDirection: rtl ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    padding: theme.spacing.md,
                    borderRadius: theme.radius.standard,
                    backgroundColor: isSelected ? theme.colors.glass.subtle : 'transparent',
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: theme.spacing.md }}>
                    {language.flag}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: isSelected ? '600' : '400',
                      color: theme.colors.interactive.text.primary,
                    }}>
                      {language.name}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: theme.colors.interactive.text.secondary,
                    }}>
                      {language.nativeName}
                    </Text>
                  </View>
                  {isSelected && (
                    <Text style={{
                      fontSize: 20,
                      color: theme.colors.accent.success,
                    }}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
});

LanguageSelectorModal.displayName = 'LanguageSelectorModal';

// ========================================================================================
// COOKIE PREFERENCES MODAL
// ========================================================================================

const CookiePreferencesModal = memo<{
  visible: boolean;
  preferences: CookiePreference[];
  onSave: (preferences: CookiePreference[]) => void;
  onClose: () => void;
  theme: any;
  rtl: boolean;
  modalSlideAnim: Animated.Value;
  texts: any;
}>(({ visible, preferences, onSave, onClose, theme, rtl, modalSlideAnim, texts }) => {
  const [localPreferences, setLocalPreferences] = useState(preferences);
  
  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);
  
  const handleToggle = (category: string) => {
    setLocalPreferences(prev =>
      prev.map(pref =>
        pref.category === category
          ? { ...pref, enabled: !pref.enabled }
          : pref
      )
    );
  };
  
  const handleAcceptAll = () => {
    setLocalPreferences(prev =>
      prev.map(pref => ({ ...pref, enabled: true }))
    );
  };
  
  const handleRejectAll = () => {
    setLocalPreferences(prev =>
      prev.map(pref => ({
        ...pref,
        enabled: COOKIE_CATEGORIES[pref.category as keyof typeof COOKIE_CATEGORIES]?.required || false
      }))
    );
  };
  
  const handleSave = () => {
    onSave(localPreferences);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={{
            backgroundColor: theme.colors.foundation.darker,
            borderTopLeftRadius: theme.radius.large,
            borderTopRightRadius: theme.radius.large,
            maxHeight: AUTH_FOOTER_CONFIG.COOKIE_MODAL_HEIGHT,
            transform: [{ translateY: modalSlideAnim }],
            ...theme.shadows.large,
          }}
        >
          {/* Modal Header */}
          <View style={{
            flexDirection: rtl ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.interactive.border.subtle,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.colors.interactive.text.primary,
            }}>
              {texts.cookieSettings}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{
                fontSize: 24,
                color: theme.colors.interactive.text.secondary,
              }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Cookie Categories */}
          <ScrollView style={{ padding: theme.spacing.lg }}>
            {localPreferences.map((pref) => {
              const category = COOKIE_CATEGORIES[pref.category as keyof typeof COOKIE_CATEGORIES];
              const isRequired = category?.required || false;
              
              return (
                <View
                  key={pref.category}
                  style={{
                    marginBottom: theme.spacing.lg,
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.glass.subtle,
                    borderRadius: theme.radius.standard,
                  }}
                >
                  <View style={{
                    flexDirection: rtl ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: theme.spacing.sm,
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme.colors.interactive.text.primary,
                      }}>
                        {category?.name || pref.category}
                      </Text>
                      {isRequired && (
                        <Text style={{
                          fontSize: 12,
                          color: theme.colors.accent.success,
                          marginTop: 2,
                        }}>
                          {texts.required}
                        </Text>
                      )}
                    </View>
                    <Switch
                      value={pref.enabled}
                      onValueChange={() => {
                        if (!isRequired) {
                          handleToggle(pref.category);
                        }
                      }}
                      disabled={isRequired}
                      trackColor={{
                        false: theme.colors.interactive.border.default,
                        true: theme.colors.accent.primary,
                      }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  {pref.description && (
                    <Text style={{
                      fontSize: 14,
                      color: theme.colors.interactive.text.secondary,
                      lineHeight: 20,
                    }}>
                      {pref.description}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
          
          {/* Action Buttons */}
          <View style={{
            flexDirection: rtl ? 'row-reverse' : 'row',
            padding: theme.spacing.lg,
            borderTopWidth: 1,
            borderTopColor: theme.colors.interactive.border.subtle,
          }}>
            <TouchableOpacity
              onPress={handleRejectAll}
              style={{
                flex: 1,
                padding: theme.spacing.md,
                borderRadius: theme.radius.standard,
                borderWidth: 1,
                borderColor: theme.colors.interactive.border.default,
                marginRight: rtl ? 0 : theme.spacing.sm,
                marginLeft: rtl ? theme.spacing.sm : 0,
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '500',
                color: theme.colors.interactive.text.primary,
              }}>
                {texts.rejectAll}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleAcceptAll}
              style={{
                flex: 1,
                padding: theme.spacing.md,
                borderRadius: theme.radius.standard,
                backgroundColor: theme.colors.accent.primary,
                marginRight: rtl ? theme.spacing.sm : 0,
                marginLeft: rtl ? 0 : theme.spacing.sm,
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: '500',
                color: '#FFFFFF',
              }}>
                {texts.acceptAll}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={handleSave}
            style={{
              margin: theme.spacing.lg,
              marginTop: 0,
              padding: theme.spacing.md,
              borderRadius: theme.radius.standard,
              backgroundColor: theme.colors.glass.default,
            }}
          >
            <Text style={{
              textAlign: 'center',
              fontSize: 16,
              fontWeight: '600',
              color: theme.colors.interactive.text.primary,
            }}>
              {texts.savePreferences}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
});

CookiePreferencesModal.displayName = 'CookiePreferencesModal';

// ========================================================================================
// MAIN AUTH FOOTER COMPONENT
// ========================================================================================

export const AuthFooter = memo(forwardRef<AuthFooterRef, AuthFooterProps>((props, ref) => {
  const {
    variant = 'default',
    alignment = 'center',
    customLinks,
    showLanguageSelector = true,
    currentLanguage = 'en',
    onLanguageChange,
    supportedLanguages = [...SUPPORTED_LANGUAGES],
    compliance,
    showCookiePreferences = true,
    cookiePreferences = Object.values(COOKIE_CATEGORIES).map(cat => ({
      category: cat.id,
      enabled: cat.required,
      description: `Manage ${cat.name.toLowerCase()} cookies`,
    })),
    onCookiePreferencesChange,
    showCopyright = true,
    copyrightText,
    showSocialLinks = false,
    socialLinks = [],
    style,
    containerStyle,
    textStyle,
    linkStyle,
    separatorStyle,
    animated = true,
    animationDelay = 0,
    fadeInOnMount = true,
    accessibilityLabel,
    accessibilityHint,
    testID = 'auth-footer',
    rtl = false,
    persianText = false,
    analytics,
    onLinkPress,
    onError,
  } = props;
  
  const theme = useTheme();
  const [footerHeight, setFooterHeight] = useState(0);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  
  // Default links
  const defaultLinks = {
    privacy: 'https://iranverse.com/privacy',
    terms: 'https://iranverse.com/terms',
    support: 'https://iranverse.com/support',
    cookies: 'https://iranverse.com/cookies',
    dataRequest: 'https://iranverse.com/data-request',
    security: 'https://iranverse.com/security',
  };
  
  const links = { ...defaultLinks, ...customLinks };
  const texts = LEGAL_TEXTS[currentLanguage] || LEGAL_TEXTS.en;
  
  // Animations
  const {
    fadeAnim,
    slideAnim,
    scaleAnim,
    modalSlideAnim,
    animateIn,
    animateOut,
    showModal,
    hideModal,
  } = useAuthFooterAnimations(animated, animationDelay, fadeInOnMount);
  
  // Start animation on mount
  useEffect(() => {
    if (animated && fadeInOnMount) {
      animateIn();
    }
  }, [animated, fadeInOnMount, animateIn]);
  
  // Analytics tracking
  const trackEvent = useCallback((event: string, data: any) => {
    if (!analytics) return;
    
    console.log('AuthFooter Analytics:', {
      event,
      sessionId: analytics.sessionId,
      userId: analytics.userId,
      ...data,
    });
  }, [analytics]);
  
  // Link handler with analytics and error handling
  const handleLinkPress = useCallback(async (url: string, linkType: string) => {
    setLoading(linkType);
    
    try {
      // Track analytics
      if (analytics?.trackLinkClicks) {
        trackEvent('footer_link_clicked', {
          linkType,
          url,
          language: currentLanguage,
        });
      }
      
      // Custom callback
      onLinkPress?.(url, linkType);
      
      // Open link
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        throw new Error(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error(`Error opening ${linkType} link:`, error);
      onError?.(error as Error, `opening_${linkType}_link`);
      
      Alert.alert(
        'Error',
        `Unable to open ${linkType} link. Please try again later.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(null);
    }
  }, [analytics, currentLanguage, onLinkPress, onError, trackEvent]);
  
  // Language change handler
  const handleLanguageChange = useCallback((language: string) => {
    if (analytics?.trackLanguageChange) {
      trackEvent('language_changed', {
        from: currentLanguage,
        to: language,
      });
    }
    
    onLanguageChange?.(language);
  }, [analytics, currentLanguage, onLanguageChange, trackEvent]);
  
  // Cookie preferences handler
  const handleCookiePreferencesChange = useCallback((preferences: CookiePreference[]) => {
    if (analytics?.trackCookieConsent) {
      trackEvent('cookie_preferences_updated', {
        preferences: preferences.reduce((acc, pref) => ({
          ...acc,
          [pref.category]: pref.enabled,
        }), {}),
      });
    }
    
    onCookiePreferencesChange?.(preferences);
  }, [analytics, onCookiePreferencesChange, trackEvent]);
  
  // Layout handler
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setFooterHeight(height);
  }, []);
  
  // Imperative API
  useImperativeHandle(ref, () => ({
    showLanguageSelector: () => {
      setShowLanguageModal(true);
      showModal();
    },
    hideLanguageSelector: () => {
      hideModal(() => setShowLanguageModal(false));
    },
    showCookiePreferences: () => {
      setShowCookieModal(true);
      showModal();
    },
    hideCookiePreferences: () => {
      hideModal(() => setShowCookieModal(false));
    },
    animateIn,
    animateOut,
    getHeight: () => footerHeight,
  }), [animateIn, animateOut, footerHeight, showModal, hideModal]);
  
  // Computed styles
  const containerStyles = useMemo((): ViewStyle => {
    const alignmentStyles = {
      left: { alignItems: 'flex-start' as const },
      center: { alignItems: 'center' as const },
      right: { alignItems: 'flex-end' as const },
    };
    
    const variantStyles = {
      default: { paddingVertical: theme.spacing.lg },
      compact: { paddingVertical: theme.spacing.md },
      signup: { paddingVertical: theme.spacing.lg },
      minimal: { paddingVertical: theme.spacing.sm },
      extended: { paddingVertical: theme.spacing.xl },
    };
    
    return {
      width: '100%',
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: 'transparent',
      ...alignmentStyles[alignment],
      ...variantStyles[variant],
    };
  }, [alignment, variant, theme]);
  
  // Render helpers
  const renderLegalLinks = () => {
    const baseText = variant === 'signup' ? texts.signup : texts.default;
    
    return (
      <View style={{
        flexDirection: rtl ? 'row-reverse' : 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
        marginBottom: theme.spacing.md,
      }}>
        <Text
          variant="caption"
          style={[{
            color: theme.colors.interactive.text.secondary,
            opacity: 0.8,
          }, ...(textStyle ? [textStyle] : [])]}
          persianText={persianText}
          rtl={rtl}
        >
          {baseText}{' '}
        </Text>
        
        <TouchableOpacity
          onPress={() => handleLinkPress(links.terms, 'terms')}
          disabled={loading === 'terms'}
        >
          <Text
            variant="caption"
            style={[{
              color: theme.colors.accent.primary,
              fontWeight: '500',
              textDecorationLine: 'underline',
            }, ...(linkStyle ? [linkStyle] : [])]}
            persianText={persianText}
            rtl={rtl}
          >
            {texts.terms}
          </Text>
        </TouchableOpacity>
        
        <Text
          variant="caption"
          style={[{
            color: theme.colors.interactive.text.secondary,
            opacity: 0.8,
            marginHorizontal: theme.spacing.xs,
          }, ...(textStyle ? [textStyle] : [])]}
        >
          {texts.and}
        </Text>
        
        <TouchableOpacity
          onPress={() => handleLinkPress(links.privacy, 'privacy')}
          disabled={loading === 'privacy'}
        >
          <Text
            variant="caption"
            style={[{
              color: theme.colors.accent.primary,
              fontWeight: '500',
              textDecorationLine: 'underline',
            }, ...(linkStyle ? [linkStyle] : [])]}
            persianText={persianText}
            rtl={rtl}
          >
            {texts.privacy}
          </Text>
        </TouchableOpacity>
        
        {compliance?.showCookieBanner && (
          <>
            <Text
              variant="caption"
              style={[{
                color: theme.colors.interactive.text.secondary,
                opacity: 0.8,
                marginHorizontal: theme.spacing.xs,
              }, ...(textStyle ? [textStyle] : [])]}
            >
              {texts.and}
            </Text>
            
            <TouchableOpacity
              onPress={() => handleLinkPress(links.cookies, 'cookies')}
              disabled={loading === 'cookies'}
            >
              <Text
                variant="caption"
                style={[{
                  color: theme.colors.accent.primary,
                  fontWeight: '500',
                  textDecorationLine: 'underline',
                }, ...(linkStyle ? [linkStyle] : [])]}
                persianText={persianText}
                rtl={rtl}
              >
                {texts.cookies}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };
  
  const renderSecondaryLinks = () => {
    return (
      <View style={{
        flexDirection: rtl ? 'row-reverse' : 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
        marginBottom: theme.spacing.md,
      }}>
        {/* Support Link */}
        <TouchableOpacity
          onPress={() => handleLinkPress(links.support, 'support')}
          disabled={loading === 'support'}
          style={{ marginRight: theme.spacing.md }}
        >
          <Text
            variant="caption"
            style={[{
              color: theme.colors.interactive.text.secondary,
            }, ...(textStyle ? [textStyle] : [])]}
            persianText={persianText}
            rtl={rtl}
          >
            {texts.support}{' '}
            <Text style={[{
              color: theme.colors.accent.primary,
              fontWeight: '500',
              textDecorationLine: 'underline',
            }, ...(linkStyle ? [linkStyle] : [])]}>
              {texts.contact}
            </Text>
          </Text>
        </TouchableOpacity>
        
        {/* Separator */}
        <View style={[{
          width: 1,
          height: 12,
          backgroundColor: theme.colors.interactive.border.subtle,
          marginHorizontal: theme.spacing.md,
        }, separatorStyle]} />
        
        {/* Language Selector */}
        {showLanguageSelector && (
          <>
            <TouchableOpacity
              onPress={() => {
                setShowLanguageModal(true);
                showModal();
              }}
              style={{ marginRight: theme.spacing.md }}
            >
              <Text
                variant="caption"
                style={[{
                  color: theme.colors.interactive.text.secondary,
                }, ...(textStyle ? [textStyle] : [])]}
              >
                {texts.language}:{' '}
                <Text style={[{
                  color: theme.colors.accent.primary,
                  fontWeight: '500',
                }, ...(linkStyle ? [linkStyle] : [])]}>
                  {supportedLanguages.find(l => l.code === currentLanguage)?.name || 'English'}
                </Text>
              </Text>
            </TouchableOpacity>
            
            <View style={[{
              width: 1,
              height: 12,
              backgroundColor: theme.colors.interactive.border.subtle,
              marginHorizontal: theme.spacing.md,
            }, separatorStyle]} />
          </>
        )}
        
        {/* Cookie Preferences */}
        {showCookiePreferences && (
          <TouchableOpacity
            onPress={() => {
              setShowCookieModal(true);
              showModal();
            }}
          >
            <Text
              variant="caption"
              style={[{
                color: theme.colors.accent.primary,
                fontWeight: '500',
              }, ...(linkStyle ? [linkStyle] : [])]}
              persianText={persianText}
              rtl={rtl}
            >
              {texts.cookieSettings}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Additional Compliance Links */}
        {compliance?.allowDataDeletion && (
          <>
            <View style={[{
              width: 1,
              height: 12,
              backgroundColor: theme.colors.interactive.border.subtle,
              marginHorizontal: theme.spacing.md,
            }, separatorStyle]} />
            
            <TouchableOpacity
              onPress={() => handleLinkPress(links.dataRequest, 'dataRequest')}
              disabled={loading === 'dataRequest'}
            >
              <Text
                variant="caption"
                style={[{
                  color: theme.colors.accent.primary,
                  fontWeight: '500',
                }, ...(linkStyle ? [linkStyle] : [])]}
                persianText={persianText}
                rtl={rtl}
              >
                {texts.dataRequest}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };
  
  const renderSocialLinks = () => {
    if (!showSocialLinks || socialLinks.length === 0) return null;
    
    return (
      <View style={{
        flexDirection: rtl ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
        marginBottom: theme.spacing.md,
      }}>
        {socialLinks.map((social) => (
          <TouchableOpacity
            key={social.platform}
            onPress={() => handleLinkPress(social.url, `social_${social.platform}`)}
            style={{
              padding: theme.spacing.sm,
              marginHorizontal: theme.spacing.xs,
            }}
          >
            {social.icon}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderCopyright = () => {
    if (!showCopyright) return null;
    
    return (
      <Text
        variant="caption"
        style={[{
          color: theme.colors.interactive.text.tertiary,
          opacity: 0.6,
          marginTop: theme.spacing.sm,
        }, ...(textStyle ? [textStyle] : [])]}
        persianText={persianText}
        rtl={rtl}
      >
        {copyrightText || texts.copyright}
      </Text>
    );
  };
  
  // Animated container style
  const animatedContainerStyle = animated ? {
    opacity: fadeAnim,
    transform: [
      { translateY: slideAnim },
      { scale: scaleAnim },
    ],
  } : {};
  
  return (
    <>
      <Animated.View
        style={[
          containerStyles,
          animatedContainerStyle,
          containerStyle,
          style,
        ]}
        onLayout={handleLayout}
        accessibilityRole="none"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        testID={testID}
      >
        {/* Legal Links */}
        {renderLegalLinks()}
        
        {/* Secondary Links */}
        {renderSecondaryLinks()}
        
        {/* Social Links */}
        {renderSocialLinks()}
        
        {/* Copyright */}
        {renderCopyright()}
        
        {/* Loading Indicators */}
        {loading && (
          <ActivityIndicator
            size="small"
            color={theme.colors.accent.primary}
            style={{
              position: 'absolute',
              top: theme.spacing.md,
              right: theme.spacing.md,
            }}
          />
        )}
      </Animated.View>
      
      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={showLanguageModal}
        currentLanguage={currentLanguage}
        languages={supportedLanguages}
        onSelect={handleLanguageChange}
        onClose={() => hideModal(() => setShowLanguageModal(false))}
        theme={theme}
        rtl={rtl}
        modalSlideAnim={modalSlideAnim}
      />
      
      {/* Cookie Preferences Modal */}
      <CookiePreferencesModal
        visible={showCookieModal}
        preferences={cookiePreferences}
        onSave={handleCookiePreferencesChange}
        onClose={() => hideModal(() => setShowCookieModal(false))}
        theme={theme}
        rtl={rtl}
        modalSlideAnim={modalSlideAnim}
        texts={texts}
      />
    </>
  );
}));

AuthFooter.displayName = 'AuthFooter';

// ========================================================================================
// PRESET COMPONENTS
// ========================================================================================

export const CompactAuthFooter = memo<Omit<AuthFooterProps, 'variant'>>((props) => (
  <AuthFooter {...props} variant="compact" />
));
CompactAuthFooter.displayName = 'CompactAuthFooter';

export const SignupAuthFooter = memo<Omit<AuthFooterProps, 'variant'>>((props) => (
  <AuthFooter {...props} variant="signup" />
));
SignupAuthFooter.displayName = 'SignupAuthFooter';

export const MinimalAuthFooter = memo<Omit<AuthFooterProps, 'variant'>>((props) => (
  <AuthFooter {...props} variant="minimal" />
));
MinimalAuthFooter.displayName = 'MinimalAuthFooter';

export const ExtendedAuthFooter = memo<Omit<AuthFooterProps, 'variant'>>((props) => (
  <AuthFooter {...props} variant="extended" />
));
ExtendedAuthFooter.displayName = 'ExtendedAuthFooter';

export const GDPRAuthFooter = memo<Omit<AuthFooterProps, 'compliance'>>((props) => (
  <AuthFooter
    {...props}
    compliance={{
      region: 'gdpr',
      showCookieBanner: true,
      requireExplicitConsent: true,
      dataRetentionDays: 365,
      allowDataDeletion: true,
    }}
  />
));
GDPRAuthFooter.displayName = 'GDPRAuthFooter';

export const CCPAAuthFooter = memo<Omit<AuthFooterProps, 'compliance'>>((props) => (
  <AuthFooter
    {...props}
    compliance={{
      region: 'ccpa',
      showCookieBanner: true,
      requireExplicitConsent: false,
      allowDataDeletion: true,
    }}
  />
));
CCPAAuthFooter.displayName = 'CCPAAuthFooter';

// ========================================================================================
// EXPORTS
// ========================================================================================

export default AuthFooter;