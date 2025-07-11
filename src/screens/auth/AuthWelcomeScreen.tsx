// src/screens/auth/AuthWelcomeScreen.refactored.tsx
// IRANVERSE Enterprise Authentication Welcome - Revolutionary Visual System v2.0
// Tesla + Grok + Neuralink Fusion - Minimal Yet Powerful Aesthetic
// Built for 90M users - Next-Generation Visual Identity
import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  BackHandler,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

// Enterprise Component Library
import SafeArea from '../../components/ui/SafeArea';
import GradientBackground from '../../components/ui/GradientBackground';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { useTheme, useColors, useSpacing, useAnimations } from '../../components/theme/ThemeProvider';

// Auth Components
import OAuthButton from '../../components/auth/OAuthButton';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthFooter from '../../components/auth/AuthFooter';

// ========================================================================================
// VISUAL SYSTEM CONSTANTS - REVOLUTIONARY DESIGN TOKENS
// ========================================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Atomic Spacing System (Tesla-inspired precision)
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  mega: 64,
  ultra: 96,
} as const;

// Visual Hierarchy Constants
const VISUAL_CONSTANTS = {
  // Logo Section
  LOGO_SCALE_FACTOR: 0.85,
  LOGO_LETTER_SPACING: 6,
  LOGO_SHADOW_RADIUS: 8,
  
  // Content Areas
  CONTENT_MAX_WIDTH: 380,
  BUTTON_HEIGHT: 64,
  BUTTON_BORDER_RADIUS: 20,
  
  // Animation Timing
  ENTRANCE_DELAY: 120,
  STAGGER_DELAY: 180,
  SPRING_TENSION: 280,
  SPRING_FRICTION: 20,
  
  // Visual Depth
  CARD_ELEVATION: 12,
  BUTTON_ELEVATION: 8,
  SHADOW_OPACITY: 0.15,
} as const;

// Enhanced Easing Curves (Grok-inspired smoothness)
const EASING = {
  entrance: { tension: VISUAL_CONSTANTS.SPRING_TENSION, friction: VISUAL_CONSTANTS.SPRING_FRICTION },
  button: { tension: 400, friction: 10 },
  logo: { tension: 300, friction: 12 },
} as const;

// ========================================================================================
// TYPES & INTERFACES
// ========================================================================================

type AuthWelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'AuthWelcome'>;

// ========================================================================================
// REVOLUTIONARY AUTH WELCOME SCREEN - NEXT-GEN VISUAL IDENTITY
// ========================================================================================

const AuthWelcomeScreen: React.FC<AuthWelcomeScreenProps> = ({ navigation }) => {
  // ========================================================================================
  // THEME SYSTEM & VISUAL TOKENS
  // ========================================================================================
  
  const theme = useTheme();
  const colors = useColors();
  const spacing = useSpacing();
  const animations = useAnimations();
  
  // ========================================================================================
  // ANIMATION ORCHESTRATION SYSTEM - TESLA-INSPIRED PRECISION
  // ========================================================================================
  
  // Master Animation Controls
  const masterOpacity = useRef(new Animated.Value(0)).current;
  const masterTransform = useRef(new Animated.Value(1)).current;
  
  // Logo Animation Suite
  const logoScale = useRef(new Animated.Value(VISUAL_CONSTANTS.LOGO_SCALE_FACTOR)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoGlow = useRef(new Animated.Value(0)).current;
  
  // Content Layer Animations
  const contentSlide = useRef(new Animated.Value(SPACING.xxxl)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  // Button Cascade Animation System
  const buttonCascade = useRef([
    new Animated.Value(SPACING.xl),  // Primary button
    new Animated.Value(SPACING.xl),  // Secondary button
    new Animated.Value(SPACING.xl),  // OAuth divider
    new Animated.Value(SPACING.xl),  // OAuth buttons
  ]).current;
  
  const buttonOpacity = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  // ========================================================================================
  // VISUAL INTERPOLATION SYSTEM - NEURALINK-INSPIRED SMOOTHNESS
  // ========================================================================================
  
  const logoAnimatedStyle = useMemo(() => ({
    opacity: logoOpacity,
    transform: [
      { scale: logoScale },
      {
        translateY: logoOpacity.interpolate({
          inputRange: [0, 1],
          outputRange: [SPACING.lg, 0],
        }),
      },
    ],
  }), [logoOpacity, logoScale]);
  
  const contentAnimatedStyle = useMemo(() => ({
    opacity: contentOpacity,
    transform: [{ translateY: contentSlide }],
  }), [contentOpacity, contentSlide]);
  
  const buttonAnimatedStyles = useMemo(() => 
    buttonCascade.map((anim, index) => ({
      opacity: buttonOpacity[index],
      transform: [{ translateY: anim }],
    }))
  , [buttonCascade, buttonOpacity]);
  
  // ========================================================================================
  // REVOLUTIONARY ENTRANCE CHOREOGRAPHY
  // ========================================================================================
  
  useEffect(() => {
    const orchestrateEntrance = () => {
      // Phase 1: Master Container Activation
      Animated.timing(masterOpacity, {
        toValue: 1,
        duration: animations.duration.fast,
        useNativeDriver: true,
      }).start();
      
      // Phase 2: Logo Emergence (Tesla-inspired)
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(logoScale, {
            toValue: 1,
            ...EASING.logo,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: animations.duration.normal,
            useNativeDriver: true,
          }),
        ]).start();
      }, VISUAL_CONSTANTS.ENTRANCE_DELAY);
      
      // Phase 3: Content Layer Slide-In
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(contentSlide, {
            toValue: 0,
            ...EASING.entrance,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: animations.duration.normal,
            useNativeDriver: true,
          }),
        ]).start();
      }, VISUAL_CONSTANTS.ENTRANCE_DELAY * 2);
      
      // Phase 4: Button Cascade (Grok-inspired stagger)
      buttonCascade.forEach((anim, index) => {
        setTimeout(() => {
          Animated.parallel([
            Animated.spring(anim, {
              toValue: 0,
              ...EASING.button,
              useNativeDriver: true,
            }),
            Animated.timing(buttonOpacity[index], {
              toValue: 1,
              duration: animations.duration.normal,
              useNativeDriver: true,
            }),
          ]).start();
        }, VISUAL_CONSTANTS.ENTRANCE_DELAY * 3 + (index * VISUAL_CONSTANTS.STAGGER_DELAY));
      });
    };
    
    // Initialize entrance after mount
    const timer = setTimeout(orchestrateEntrance, 100);
    
    return () => clearTimeout(timer);
  }, [
    masterOpacity,
    logoScale,
    logoOpacity,
    contentSlide,
    contentOpacity,
    buttonCascade,
    buttonOpacity,
    animations.duration,
  ]);
  
  // ========================================================================================
  // ANIMATION CLEANUP SYSTEM
  // ========================================================================================
  
  useEffect(() => {
    return () => {
      // Master cleanup
      [masterOpacity, masterTransform, logoScale, logoOpacity, logoGlow, contentSlide, contentOpacity]
        .forEach(anim => {
          anim.stopAnimation();
          anim.removeAllListeners();
        });
      
      // Button cascade cleanup
      [...buttonCascade, ...buttonOpacity].forEach(anim => {
        anim.stopAnimation();
        anim.removeAllListeners();
      });
    };
  }, []);
  
  // ========================================================================================
  // NAVIGATION ORCHESTRATION - ENTERPRISE FLOW
  // ========================================================================================
  
  const handleLoginPress = () => {
    navigation.navigate('Login', {});
  };
  
  const handleSignupPress = () => {
    navigation.navigate('Signup');
  };
  
  const handleGoogleOAuth = () => {
    // Future OAuth implementation
    console.log('Google OAuth - Revolutionary Authentication Coming Soon');
  };
  
  const handleAppleOAuth = () => {
    // Future OAuth implementation  
    console.log('Apple OAuth - Revolutionary Authentication Coming Soon');
  };
  
  // Android System Integration
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('First');
      return true;
    });
    
    return () => backHandler.remove();
  }, [navigation]);
  
  // ========================================================================================
  // REVOLUTIONARY VISUAL RENDER - NEXT-GENERATION UI
  // ========================================================================================
  
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <SafeArea edges={['top', 'bottom']} style={styles.container}>
        <GradientBackground 
          animated 
          particleField 
          style={styles.background}
        >
          {/* Master Content Container */}
          <Animated.View 
            style={[
              styles.masterContainer,
              { opacity: masterOpacity }
            ]}
          >
            {/* Header Navigation Zone */}
            <View style={styles.headerZone}>
              <AuthHeader 
                showBackButton
                onBackPress={() => navigation.navigate('First')}
                style={styles.authHeader}
              />
            </View>
            
            {/* Logo Identity Zone */}
            <Animated.View style={[styles.logoZone, logoAnimatedStyle]}>
              <View style={styles.logoContainer}>
                <Text
                  variant="display"
                  align="center"
                  style={[styles.logoText, { color: colors.interactive.text }]}
                  accessibilityLabel="IRANVERSE - Revolutionary Digital Platform"
                >
                  IRANVERSE
                </Text>
                
                <View style={styles.logoSubtitleContainer}>
                  <Text
                    variant="h3"
                    align="center"
                    style={[styles.logoSubtitle, { color: colors.interactive.textSecondary }]}
                    persianText={false}
                  >
                    Revolutionary Experience
                  </Text>
                  
                  <Text
                    variant="body"
                    align="center"
                    style={[styles.logoDescription, { color: colors.interactive.textSecondary }]}
                    persianText={false}
                  >
                    Join the future of digital identity
                  </Text>
                </View>
              </View>
            </Animated.View>
            
            {/* Content Action Zone */}
            <Animated.View style={[styles.contentZone, contentAnimatedStyle]}>
              <View style={styles.actionContainer}>
                
                {/* Primary Action Layer */}
                <Animated.View style={[styles.actionLayer, buttonAnimatedStyles[0]]}>
                  <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onPress={handleSignupPress}
                    style={{
                      ...styles.primaryButton,
                      backgroundColor: colors.interactive.primary,
                      shadowColor: colors.interactive.primary,
                    }}
                    accessibilityLabel="Create revolutionary account"
                    testID="signup-button"
                  >
                    Create Account
                  </Button>
                </Animated.View>
                
                {/* Secondary Action Layer */}
                <Animated.View style={[styles.actionLayer, buttonAnimatedStyles[1]]}>
                  <Button
                    variant="ghost"
                    size="large"
                    fullWidth
                    onPress={handleLoginPress}
                    style={{
                      ...styles.secondaryButton,
                      borderColor: colors.interactive.border,
                    }}
                    accessibilityLabel="Access existing account"
                    testID="login-button"
                  >
                    Sign In
                  </Button>
                </Animated.View>
                
                {/* OAuth Divider Layer */}
                <Animated.View style={[styles.dividerLayer, buttonAnimatedStyles[2]]}>
                  <View style={styles.oauthDivider}>
                    <View style={[styles.dividerLine, { backgroundColor: colors.interactive.border }]} />
                    <View style={styles.dividerTextContainer}>
                      <Text
                        variant="caption"
                        style={[styles.dividerText, { color: colors.interactive.textSecondary }]}
                      >
                        or continue with
                      </Text>
                    </View>
                    <View style={[styles.dividerLine, { backgroundColor: colors.interactive.border }]} />
                  </View>
                </Animated.View>
                
                {/* OAuth Provider Layer */}
                <Animated.View style={[styles.oauthLayer, buttonAnimatedStyles[3]]}>
                  <View style={styles.oauthContainer}>
                    <View style={styles.oauthButton}>
                      <OAuthButton
                        provider="google"
                        onPress={handleGoogleOAuth}
                        disabled
                        comingSoon
                        accessibilityLabel="Google authentication - Coming Soon"
                        testID="google-oauth-button"
                      />
                    </View>
                    
                    <View style={styles.oauthButton}>
                      <OAuthButton
                        provider="apple"
                        onPress={handleAppleOAuth}
                        disabled
                        comingSoon
                        accessibilityLabel="Apple authentication - Coming Soon"
                        testID="apple-oauth-button"
                      />
                    </View>
                  </View>
                </Animated.View>
                
              </View>
            </Animated.View>
            
            {/* Footer Zone */}
            <View style={styles.footerZone}>
              <AuthFooter style={styles.authFooter} />
            </View>
            
          </Animated.View>
        </GradientBackground>
      </SafeArea>
    </>
  );
};

// ========================================================================================
// REVOLUTIONARY DESIGN SYSTEM - TESLA + GROK + NEURALINK FUSION
// ========================================================================================

const styles = StyleSheet.create({
  // ========================================================================================
  // CONTAINER ARCHITECTURE
  // ========================================================================================
  
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  background: {
    flex: 1,
  },
  
  masterContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  
  // ========================================================================================
  // ZONE LAYOUT SYSTEM - PERFECT SPATIAL GEOMETRY
  // ========================================================================================
  
  headerZone: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  
  authHeader: {
    marginBottom: 0,
  },
  
  logoZone: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  
  contentZone: {
    flex: 0.5,
    justifyContent: 'center',
    maxWidth: VISUAL_CONSTANTS.CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  
  footerZone: {
    flex: 0.1,
    justifyContent: 'flex-end',
    paddingBottom: SPACING.lg,
  },
  
  authFooter: {
    marginTop: 0,
  },
  
  // ========================================================================================
  // LOGO IDENTITY SYSTEM - REVOLUTIONARY BRANDING
  // ========================================================================================
  
  logoContainer: {
    alignItems: 'center',
  },
  
  logoText: {
    fontSize: Platform.select({
      ios: 52,
      android: 48,
      default: 52,
    }),
    fontWeight: '800',
    letterSpacing: VISUAL_CONSTANTS.LOGO_LETTER_SPACING,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: VISUAL_CONSTANTS.LOGO_SHADOW_RADIUS,
    marginBottom: SPACING.lg,
  },
  
  logoSubtitleContainer: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  
  logoSubtitle: {
    fontWeight: '300',
    letterSpacing: 2,
    opacity: 0.9,
  },
  
  logoDescription: {
    fontSize: 16,
    opacity: 0.7,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  
  // ========================================================================================
  // ACTION SYSTEM - TESLA-INSPIRED BUTTON HIERARCHY
  // ========================================================================================
  
  actionContainer: {
    gap: SPACING.lg,
  },
  
  actionLayer: {
    width: '100%',
  },
  
  primaryButton: {
    height: VISUAL_CONSTANTS.BUTTON_HEIGHT,
    borderRadius: VISUAL_CONSTANTS.BUTTON_BORDER_RADIUS,
    shadowOffset: { width: 0, height: SPACING.sm },
    shadowOpacity: VISUAL_CONSTANTS.SHADOW_OPACITY,
    shadowRadius: VISUAL_CONSTANTS.BUTTON_ELEVATION,
    elevation: VISUAL_CONSTANTS.BUTTON_ELEVATION,
  },
  
  secondaryButton: {
    height: VISUAL_CONSTANTS.BUTTON_HEIGHT,
    borderRadius: VISUAL_CONSTANTS.BUTTON_BORDER_RADIUS,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  
  // ========================================================================================
  // OAUTH SYSTEM - MINIMAL ELEGANT DESIGN
  // ========================================================================================
  
  dividerLayer: {
    paddingVertical: SPACING.md,
  },
  
  oauthDivider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  
  dividerTextContainer: {
    paddingHorizontal: SPACING.lg,
  },
  
  dividerText: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  
  oauthLayer: {
    paddingTop: SPACING.md,
  },
  
  oauthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.lg,
  },
  
  oauthButton: {
    flex: 1,
  },
});

export default AuthWelcomeScreen;