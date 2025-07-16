// src/features/auth/screens/AuthWelcomeScreen.tsx
// IRANVERSE Enterprise Authentication Gateway
// Clean integration with GradientBackground
// Built for 90M users - Production launch ready

import React, { useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../App';

// IRANVERSE Components
import GradientBackground from '../../../shared/components/layout/GradientBackground';
import SafeArea from '../../../shared/components/layout/SafeArea';
import IranverseLogo from '../../../shared/components/ui/IranverseLogo';
import AnimatedIranverseLogo from '../../../shared/components/ui/AnimatedIranverseLogo';
import Button from '../../../shared/components/ui/Button';
import {
  XAuthButton,
  GoogleAuthButton,
  AppleAuthButton,
} from '../../../shared/components/ui/AuthButtons';
import Text from '../../../shared/components/ui/Text';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { useErrorHandler } from '../../../core/hooks/useErrorHandler';

// ========================================================================================
// CONFIGURATION - ENTERPRISE STANDARDS
// ========================================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animation choreography coordinated with FirstScreen fade-out (Solution 1)
const ANIMATION_CONFIG = {
  logoEntrance: {
    delay: 100, // Start immediately after navigation begins
    duration: 400,
    translateY: 20,
  },
  authButtons: {
    delay: 300, // Coordinated with logo entrance
    stagger: 150, // Slightly longer stagger for premium feel
    duration: 300,
    translateY: 30,
  },
  actionButtons: {
    delay: 750, // After all auth buttons
    duration: 250,
  },
  footer: {
    delay: 900, // Final element entrance
    duration: 200,
  },
} as const;

// Layout configuration - Tesla minimalism
const LAYOUT_CONFIG = {
  maxWidth: 380,
  padding: 24,
  buttonSpacing: 12,
  sectionSpacing: 32,
} as const;

// Navigation props
type AuthWelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'AuthWelcome'>;

// ========================================================================================
// CUSTOM HOOKS - ANIMATION MANAGEMENT
// ========================================================================================

const useAuthAnimations = () => {
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(ANIMATION_CONFIG.logoEntrance.translateY)).current;
  
  // Button animations
  const xButtonOpacity = useRef(new Animated.Value(0)).current;
  const xButtonTranslateY = useRef(new Animated.Value(ANIMATION_CONFIG.authButtons.translateY)).current;
  const googleButtonOpacity = useRef(new Animated.Value(0)).current;
  const googleButtonTranslateY = useRef(new Animated.Value(ANIMATION_CONFIG.authButtons.translateY)).current;
  const appleButtonOpacity = useRef(new Animated.Value(0)).current;
  const appleButtonTranslateY = useRef(new Animated.Value(ANIMATION_CONFIG.authButtons.translateY)).current;
  const emailButtonOpacity = useRef(new Animated.Value(0)).current;
  const emailButtonTranslateY = useRef(new Animated.Value(ANIMATION_CONFIG.authButtons.translateY)).current;
  
  // Footer animation
  const footerOpacity = useRef(new Animated.Value(0)).current;

  // Trigger entrance animations
  const triggerAnimations = useCallback(() => {

    // Logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: ANIMATION_CONFIG.logoEntrance.duration,
        delay: ANIMATION_CONFIG.logoEntrance.delay,
        useNativeDriver: true,
      }),
      Animated.spring(logoTranslateY, {
        toValue: 0,
        damping: 15,
        mass: 1,
        delay: ANIMATION_CONFIG.logoEntrance.delay,
        useNativeDriver: true,
      }),
    ]).start();

    // Auth buttons staggered entrance
    const authDelay = ANIMATION_CONFIG.authButtons.delay;
    const stagger = ANIMATION_CONFIG.authButtons.stagger;
    
    // X Button
    Animated.parallel([
      Animated.timing(xButtonOpacity, {
        toValue: 1,
        duration: ANIMATION_CONFIG.authButtons.duration,
        delay: authDelay,
        useNativeDriver: true,
      }),
      Animated.spring(xButtonTranslateY, {
        toValue: 0,
        damping: 15,
        mass: 1,
        delay: authDelay,
        useNativeDriver: true,
      }),
    ]).start();

    // Google Button
    Animated.parallel([
      Animated.timing(googleButtonOpacity, {
        toValue: 1,
        duration: ANIMATION_CONFIG.authButtons.duration,
        delay: authDelay + stagger,
        useNativeDriver: true,
      }),
      Animated.spring(googleButtonTranslateY, {
        toValue: 0,
        damping: 15,
        mass: 1,
        delay: authDelay + stagger,
        useNativeDriver: true,
      }),
    ]).start();

    // Apple Button
    Animated.parallel([
      Animated.timing(appleButtonOpacity, {
        toValue: 1,
        duration: ANIMATION_CONFIG.authButtons.duration,
        delay: authDelay + stagger * 2,
        useNativeDriver: true,
      }),
      Animated.spring(appleButtonTranslateY, {
        toValue: 0,
        damping: 15,
        mass: 1,
        delay: authDelay + stagger * 2,
        useNativeDriver: true,
      }),
    ]).start();

    // Email Button
    Animated.parallel([
      Animated.timing(emailButtonOpacity, {
        toValue: 1,
        duration: ANIMATION_CONFIG.authButtons.duration,
        delay: authDelay + stagger * 3,
        useNativeDriver: true,
      }),
      Animated.spring(emailButtonTranslateY, {
        toValue: 0,
        damping: 15,
        mass: 1,
        delay: authDelay + stagger * 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Footer
    Animated.timing(footerOpacity, {
      toValue: 1,
      duration: ANIMATION_CONFIG.footer.duration,
      delay: ANIMATION_CONFIG.footer.delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return {
    animations: {
      logo: { opacity: logoOpacity, translateY: logoTranslateY },
      xButton: { opacity: xButtonOpacity, translateY: xButtonTranslateY },
      googleButton: { opacity: googleButtonOpacity, translateY: googleButtonTranslateY },
      appleButton: { opacity: appleButtonOpacity, translateY: appleButtonTranslateY },
      emailButton: { opacity: emailButtonOpacity, translateY: emailButtonTranslateY },
      footer: { opacity: footerOpacity },
    },
    triggerAnimations,
  };
};

// ========================================================================================
// MAIN COMPONENT - ENTERPRISE IMPLEMENTATION
// ========================================================================================

const AuthWelcomeScreen: React.FC<AuthWelcomeScreenProps> = ({ navigation }) => {
  // Theme and error handling
  const theme = useTheme();
  const { captureError } = useErrorHandler({
    context: { screen: 'AuthWelcome' },
  });

  // Animation management
  const { animations, triggerAnimations } = useAuthAnimations();
  
  // Accessibility state
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // ========================================================================================
  // LIFECYCLE & ACCESSIBILITY
  // ========================================================================================

  useEffect(() => {
    // Check accessibility settings
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);

    // Trigger entrance animations
    if (!reducedMotion) {
      triggerAnimations();
    }
  }, [triggerAnimations, reducedMotion]);

  // ========================================================================================
  // EVENT HANDLERS - OAUTH & NAVIGATION
  // ========================================================================================

  const handleOAuthPress = useCallback((provider: 'x' | 'google' | 'apple') => {
    try {
      // TODO: Implement OAuth flow
      navigation.navigate('Login', { email: undefined });
    } catch (error) {
      captureError(error as Error, 'high');
    }
  }, [navigation, captureError]);

  const handleEmailPress = useCallback(() => {
    navigation.navigate('Login', { email: undefined });
  }, [navigation]);

  const handleTermsPress = useCallback(() => {
    // TODO: Navigate to terms
  }, []);

  const handlePrivacyPress = useCallback(() => {
    // TODO: Navigate to privacy
  }, []);

  // ========================================================================================
  // RENDER - ENTERPRISE UI
  // ========================================================================================

  return (
    <GradientBackground 
      animated={true}
      depthLayers={true}
      particleField={true}
      luminanceShifts={true}
      style={styles.container}
    >
      {/* Main Content */}
      <SafeArea style={styles.safeArea} edges={['bottom']} backgroundColor="transparent">
        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoSection,
              {
                opacity: animations.logo.opacity,
                transform: [{ translateY: animations.logo.translateY }],
              },
            ]}
          >
            <AnimatedIranverseLogo
              size={140}
              variant="brand"
              animationMode="entrance"
              autoStart={true}
              onAnimationComplete={() => {
                // Optional: trigger next animation
              }}
            />
          </Animated.View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Auth Buttons Section */}
          <View style={styles.authSection}>
            {/* X Button */}
            <Animated.View
              style={{
                opacity: animations.xButton.opacity,
                transform: [{ translateY: animations.xButton.translateY }],
              }}
            >
              <XAuthButton
                onPress={() => handleOAuthPress('x')}
                fullWidth
                style={styles.authButton}
              >
                Continue with X
              </XAuthButton>
            </Animated.View>

            {/* Google Button */}
            <Animated.View
              style={{
                opacity: animations.googleButton.opacity,
                transform: [{ translateY: animations.googleButton.translateY }],
              }}
            >
              <GoogleAuthButton
                onPress={() => handleOAuthPress('google')}
                fullWidth
                style={styles.authButton}
              >
                Continue with Google
              </GoogleAuthButton>
            </Animated.View>

            {/* Apple Button */}
            <Animated.View
              style={{
                opacity: animations.appleButton.opacity,
                transform: [{ translateY: animations.appleButton.translateY }],
              }}
            >
              <AppleAuthButton
                onPress={() => handleOAuthPress('apple')}
                fullWidth
                style={styles.authButton}
              >
                Continue with Apple
              </AppleAuthButton>
            </Animated.View>

            {/* Email Button */}
            <Animated.View
              style={{
                opacity: animations.emailButton.opacity,
                transform: [{ translateY: animations.emailButton.translateY }],
              }}
            >
              <Button
                variant="grok-auth"
                onPress={handleEmailPress}
                fullWidth
                style={styles.authButton}
              >
                Continue with Email
              </Button>
            </Animated.View>
          </View>

          {/* Footer Section */}
          <Animated.View
            style={[
              styles.footer,
              { opacity: animations.footer.opacity },
            ]}
          >
            <Text variant="caption" style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text 
                variant="caption" 
                style={styles.footerLink}
                onPress={handleTermsPress}
              >
                Terms of Service
              </Text>
              {' and '}
              <Text 
                variant="caption" 
                style={styles.footerLink}
                onPress={handlePrivacyPress}
              >
                Privacy Policy
              </Text>
            </Text>
          </Animated.View>
        </View>
      </SafeArea>
    </GradientBackground>
  );
};

// ========================================================================================
// STYLES - TESLA MINIMALISM WITH GROK AESTHETIC
// ========================================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: LAYOUT_CONFIG.padding,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.12,
  },
  spacer: {
    flex: 1,
  },
  authSection: {
    width: '100%',
    maxWidth: LAYOUT_CONFIG.maxWidth,
    alignSelf: 'center',
  },
  authButton: {
    marginBottom: LAYOUT_CONFIG.buttonSpacing,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: LAYOUT_CONFIG.sectionSpacing,
    paddingHorizontal: LAYOUT_CONFIG.padding,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'underline',
  },
});

export default memo(AuthWelcomeScreen);