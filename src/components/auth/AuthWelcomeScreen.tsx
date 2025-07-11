// src/screens/auth/AuthWelcomeScreen.tsx
// IRANVERSE Enterprise Authentication Welcome - Revolutionary Entry Point
// Tesla-inspired authentication with Agent Identity Empowerment
// Built for 90M users - Enterprise Performance & Accessibility
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  BackHandler,
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
// TYPES & INTERFACES - ENTERPRISE AUTHENTICATION
// ========================================================================================

type AuthWelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'AuthWelcome'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ========================================================================================
// AUTH WELCOME SCREEN IMPLEMENTATION - REVOLUTIONARY ENTRY
// ========================================================================================

const AuthWelcomeScreen: React.FC<AuthWelcomeScreenProps> = ({ navigation }) => {
  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const spacing = useSpacing();
  const animations = useAnimations();
  
  // Animation Values with cleanup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonStaggerAnim = useRef([
    new Animated.Value(30),
    new Animated.Value(30),
    new Animated.Value(30),
    new Animated.Value(30),
  ]).current;
  
  // Cleanup animations
  useEffect(() => {
    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      logoScaleAnim.stopAnimation();
      buttonStaggerAnim.forEach(anim => {
        anim.stopAnimation();
        anim.removeAllListeners();
      });
      fadeAnim.removeAllListeners();
      slideAnim.removeAllListeners();
      logoScaleAnim.removeAllListeners();
    };
  }, [fadeAnim, slideAnim, logoScaleAnim, buttonStaggerAnim]);
  
  // ========================================================================================
  // ENTRANCE ANIMATION SYSTEM - TESLA-INSPIRED SEQUENCES
  // ========================================================================================
  
  useEffect(() => {
    // Tesla-inspired staggered entrance animation
    const startEntranceAnimation = () => {
      // Logo animation
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 400,
        friction: 8,
        useNativeDriver: true,
      }).start();
      
      // Main content fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animations.duration.normal,
        useNativeDriver: true,
      }).start();
      
      // Content slide up
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 300,
        friction: 12,
        useNativeDriver: true,
      }).start();
      
      // Staggered button animations
      const buttonAnimations = buttonStaggerAnim.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: animations.duration.normal,
          delay: index * 150, // 150ms stagger
          useNativeDriver: true,
        })
      );
      
      Animated.stagger(150, buttonAnimations).start();
    };
    
    // Start animation after mount
    const timer = setTimeout(startEntranceAnimation, 100);
    
    return () => clearTimeout(timer);
  }, [animations, fadeAnim, slideAnim, logoScaleAnim, buttonStaggerAnim]);
  
  // ========================================================================================
  // NAVIGATION HANDLERS - ENTERPRISE FLOW CONTROL
  // ========================================================================================
  
  const handleLoginPress = () => {
    navigation.navigate('Login', {});
  };
  
  const handleSignupPress = () => {
    navigation.navigate('Signup');
  };
  
  const handleGoogleOAuth = () => {
    // Future implementation - placeholder for now
    console.log('Google OAuth - Coming Soon...');
  };
  
  const handleAppleOAuth = () => {
    // Future implementation - placeholder for now
    console.log('Apple OAuth - Coming Soon...');
  };
  
  // Android back button handling
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Navigate back to FirstScreen - Standard React Navigation
      navigation.navigate('First');
      return true;
    });
    
    return () => backHandler.remove();
  }, [navigation]);
  
  // ========================================================================================
  // COMPONENT RENDER - REVOLUTIONARY WELCOME EXPERIENCE
  // ========================================================================================
  
  return (
    <SafeArea edges={['top', 'bottom']} style={styles.container}>
      <GradientBackground 
        animated 
        particleField 
        style={styles.background}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Header Section */}
          <AuthHeader 
            showBackButton
            onBackPress={() => navigation.navigate('First')}
            style={{ marginBottom: spacing.xl }}
          />
          
          {/* Logo and Welcome Section */}
          <Animated.View 
            style={[
              styles.logoSection,
              {
                transform: [{ scale: logoScaleAnim }],
              }
            ]}
          >
            <Text
              variant="display"
              align="center"
              style={[styles.logoText, { color: colors.interactive.text }]}
              accessibilityLabel="IRANVERSE - Welcome to the future"
            >
              IRANVERSE
            </Text>
            
            <Text
              variant="h3"
              align="center"
              style={[styles.welcomeText, { color: colors.interactive.textSecondary }]}
              persianText={false}
            >
              Welcome to the Future
            </Text>
            
            <Text
              variant="body"
              align="center"
              style={[styles.subtitleText, { color: colors.interactive.textSecondary }]}
              persianText={false}
            >
              Join the revolutionary digital experience
            </Text>
          </Animated.View>
          
          {/* Action Buttons Section */}
          <View style={styles.actionsSection}>
            {/* Primary Action Buttons */}
            <Animated.View 
              style={[
                styles.buttonContainer,
                { transform: [{ translateY: buttonStaggerAnim[0] }] }
              ]}
            >
              <Button
                variant="primary"
                size="large"
                fullWidth
                onPress={handleSignupPress}
                style={styles.primaryButton}
                accessibilityLabel="Create new account"
                testID="signup-button"
              >
                Create Account
              </Button>
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.buttonContainer,
                { transform: [{ translateY: buttonStaggerAnim[1] }] }
              ]}
            >
              <Button
                variant="ghost"
                size="large"
                fullWidth
                onPress={handleLoginPress}
                style={styles.secondaryButton}
                accessibilityLabel="Sign in to existing account"
                testID="login-button"
              >
                Sign In
              </Button>
            </Animated.View>
            
            {/* OAuth Section */}
            <View style={styles.oauthSection}>
              <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, { backgroundColor: colors.interactive.border }]} />
                <Text
                  variant="caption"
                  style={[styles.dividerText, { color: colors.interactive.textSecondary }]}
                >
                  or continue with
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.interactive.border }]} />
              </View>
              
              <View style={styles.oauthButtons}>
                <Animated.View 
                  style={[
                    styles.oauthButtonContainer,
                    { transform: [{ translateY: buttonStaggerAnim[2] }] }
                  ]}
                >
                  <OAuthButton
                    provider="google"
                    onPress={handleGoogleOAuth}
                    disabled
                    comingSoon
                    accessibilityLabel="Sign in with Google - Coming Soon"
                    testID="google-oauth-button"
                  />
                </Animated.View>
                
                <Animated.View 
                  style={[
                    styles.oauthButtonContainer,
                    { transform: [{ translateY: buttonStaggerAnim[3] }] }
                  ]}
                >
                  <OAuthButton
                    provider="apple"
                    onPress={handleAppleOAuth}
                    disabled
                    comingSoon
                    accessibilityLabel="Sign in with Apple - Coming Soon"
                    testID="apple-oauth-button"
                  />
                </Animated.View>
              </View>
            </View>
          </View>
          
          {/* Footer Section */}
          <AuthFooter style={{ marginTop: spacing.xl }} />
        </Animated.View>
      </GradientBackground>
    </SafeArea>
  );
};

// ========================================================================================
// STYLES - ENTERPRISE DESIGN SYSTEM
// ========================================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.1,
    marginBottom: SCREEN_HEIGHT * 0.05,
  },
  logoText: {
    fontSize: Platform.select({
      ios: 48,
      android: 44,
      default: 48,
    }),
    fontWeight: '700',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 16,
  },
  welcomeText: {
    marginBottom: 8,
    fontWeight: '300',
    letterSpacing: 1,
  },
  subtitleText: {
    opacity: 0.8,
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  actionsSection: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  oauthSection: {
    marginTop: 32,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.7,
  },
  oauthButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  oauthButtonContainer: {
    flex: 1,
  },
});

export default AuthWelcomeScreen;