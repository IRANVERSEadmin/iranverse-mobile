// src/components/auth/AuthFooter.tsx
// IRANVERSE Enterprise Auth Footer - Legal Compliance & Terms
// Tesla-inspired legal compliance with Enterprise Standards
// Built for 90M users - GDPR/CCPA Compliant Footer Links
import React, { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Platform,
  Linking,
} from 'react-native';
import Text from '../ui/Text';
import { useTheme, useColors, useTypography, useSpacing } from '../theme/ThemeProvider';

// ========================================================================================
// AUTH FOOTER TYPES & INTERFACES
// ========================================================================================

export interface AuthFooterProps {
  // Layout Props
  variant?: 'default' | 'compact' | 'signup';
  
  // Styling Props
  style?: ViewStyle;
  textStyle?: TextStyle;
  linkStyle?: TextStyle;
  
  // Accessibility Props
  testID?: string;
  
  // Persian/RTL Support
  rtl?: boolean;
  persianText?: boolean;
  
  // Custom Links (for enterprise customization)
  customLinks?: {
    privacy?: string;
    terms?: string;
    support?: string;
  };
}

// ========================================================================================
// LEGAL LINK CONFIGURATION - ENTERPRISE COMPLIANCE
// ========================================================================================

const LEGAL_LINKS = {
  privacy: 'https://iranverse.com/privacy',
  terms: 'https://iranverse.com/terms',
  support: 'https://iranverse.com/support',
  contact: 'mailto:support@iranverse.com',
};

const LEGAL_TEXT = {
  english: {
    default: 'By continuing, you agree to our',
    signup: 'By creating an account, you agree to our',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    and: 'and',
    support: 'Need help?',
    contact: 'Contact Support',
    copyright: '© 2024 IRANVERSE. All rights reserved.',
  },
  persian: {
    default: 'با ادامه، شما با',
    signup: 'با ایجاد حساب کاربری، شما با',
    terms: 'شرایط خدمات',
    privacy: 'سیاست حفظ حریم خصوصی',
    and: 'و',
    support: 'نیاز به کمک دارید؟',
    contact: 'تماس با پشتیبانی',
    copyright: '© ۱۴۰۳ ایرانورس. تمامی حقوق محفوظ است.',
  },
};

// ========================================================================================
// AUTH FOOTER IMPLEMENTATION - ENTERPRISE LEGAL COMPLIANCE
// ========================================================================================

export const AuthFooter: React.FC<AuthFooterProps> = ({
  variant = 'default',
  style,
  textStyle,
  linkStyle,
  testID,
  rtl = false,
  persianText = false,
  customLinks,
}) => {
  
  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  
  // Text Configuration
  const text = persianText ? LEGAL_TEXT.persian : LEGAL_TEXT.english;
  const links = customLinks || LEGAL_LINKS;
  
  // ========================================================================================
  // LINK HANDLERS - ENTERPRISE COMPLIANCE
  // ========================================================================================
  
  const handleLinkPress = useCallback(async (url: string, linkType: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn(`Cannot open ${linkType} link: ${url}`);
      }
    } catch (error) {
      console.error(`Error opening ${linkType} link:`, error);
    }
  }, []);
  
  const handlePrivacyPress = useCallback(() => {
    handleLinkPress(links.privacy || LEGAL_LINKS.privacy, 'Privacy Policy');
  }, [links.privacy, handleLinkPress]);
  
  const handleTermsPress = useCallback(() => {
    handleLinkPress(links.terms || LEGAL_LINKS.terms, 'Terms of Service');
  }, [links.terms, handleLinkPress]);
  
  const handleSupportPress = useCallback(() => {
    handleLinkPress(links.support || LEGAL_LINKS.support, 'Support');
  }, [links.support, handleLinkPress]);
  
  // ========================================================================================
  // RENDER HELPERS - COMPONENT COMPOSITION
  // ========================================================================================
  
  const renderLegalText = () => {
    const baseText = variant === 'signup' ? text.signup : text.default;
    
    return (
      <View style={[styles.legalContainer, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        <Text
          variant="caption"
          style={[
            styles.legalText,
            { color: colors.interactive.textSecondary },
            textStyle || {},
          ]}
          persianText={persianText}
          rtl={rtl}
        >
          {baseText}{' '}
        </Text>
        
        <TouchableOpacity
          onPress={handleTermsPress}
          accessibilityLabel={`Open ${text.terms}`}
          accessibilityRole="link"
          testID="terms-link"
        >
          <Text
            variant="caption"
            style={[
              styles.linkText,
              { color: colors.interactive.text },
              linkStyle || {},
            ]}
            persianText={persianText}
            rtl={rtl}
          >
            {text.terms}
          </Text>
        </TouchableOpacity>
        
        <Text
          variant="caption"
          style={[
            styles.legalText,
            { color: colors.interactive.textSecondary },
            textStyle || {},
          ]}
          persianText={persianText}
          rtl={rtl}
        >
          {' '}{text.and}{' '}
        </Text>
        
        <TouchableOpacity
          onPress={handlePrivacyPress}
          accessibilityLabel={`Open ${text.privacy}`}
          accessibilityRole="link"
          testID="privacy-link"
        >
          <Text
            variant="caption"
            style={[
              styles.linkText,
              { color: colors.interactive.text },
              linkStyle || {},
            ]}
            persianText={persianText}
            rtl={rtl}
          >
            {text.privacy}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderSupportLink = () => {
    return (
      <TouchableOpacity
        onPress={handleSupportPress}
        style={[styles.supportContainer, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}
        accessibilityLabel={text.contact}
        accessibilityRole="link"
        testID="support-link"
      >
        <Text
          variant="caption"
          style={[
            styles.supportText,
            { color: colors.interactive.textSecondary },
            textStyle || {},
          ]}
          persianText={persianText}
          rtl={rtl}
        >
          {text.support}{' '}
        </Text>
        <Text
          variant="caption"
          style={[
            styles.linkText,
            { color: colors.interactive.text },
            linkStyle || {},
          ]}
          persianText={persianText}
          rtl={rtl}
        >
          {text.contact}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderCopyright = () => {
    return (
      <View style={[styles.copyrightContainer, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
        <Text
          variant="caption"
          style={[
            styles.copyrightText,
            { color: colors.interactive.textSecondary },
            textStyle || {},
          ]}
          persianText={persianText}
          rtl={rtl}
        >
          {text.copyright}
        </Text>
      </View>
    );
  };
  
  // ========================================================================================
  // COMPONENT RENDER - ENTERPRISE LEGAL COMPLIANCE
  // ========================================================================================
  
  return (
    <View
      style={[
        styles.container,
        { 
          alignItems: rtl ? 'flex-end' : 'flex-start',
          paddingBottom: Platform.select({
            ios: 8,
            android: 16,
            default: 12,
          }),
        },
        style,
      ]}
      testID={testID}
    >
      {/* Legal Agreement Text */}
      {renderLegalText()}
      
      {/* Support Link */}
      {renderSupportLink()}
      
      {/* Copyright Notice */}
      {renderCopyright()}
    </View>
  );
};

// ========================================================================================
// STYLES - ENTERPRISE DESIGN SYSTEM
// ========================================================================================

const styles = {
  container: {
    width: '100%',
    paddingHorizontal: 0,
  } as ViewStyle,
  
  legalContainer: {
    flexWrap: 'wrap' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
    paddingHorizontal: 16,
  } as ViewStyle,
  
  legalText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'system',
    }),
  } as TextStyle,
  
  linkText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
    textDecorationLine: 'underline' as const,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'system',
    }),
  } as TextStyle,
  
  supportContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
    paddingHorizontal: 16,
  } as ViewStyle,
  
  supportText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'system',
    }),
  } as TextStyle,
  
  copyrightContainer: {
    width: '100%',
    paddingHorizontal: 16,
  } as ViewStyle,
  
  copyrightText: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.6,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'system',
    }),
  } as TextStyle,
};

export default AuthFooter;