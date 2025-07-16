// src/screens/auth/VerificationErrorScreen.tsx
// IRANVERSE Enterprise Verification Error - Revolutionary Error Recovery
// Tesla-inspired error handling with Agent Identity Recovery Flow
// Built for 90M users - Comprehensive Error Recovery & User Guidance
import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  BackHandler,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../App';

// Enterprise Component Library
import SafeArea from '../../../shared/components/layout/SafeArea';
import GradientBackground from '../../../shared/components/layout/GradientBackground';
import Text from '../../../shared/components/ui/Text';
import Button from '../../../shared/components/ui/Button';
import { useTheme } from '../../../shared/theme/ThemeProvider';

// Auth Components
import AuthHeader from '../components/AuthHeader';

// ========================================================================================
// TYPES & INTERFACES - ENTERPRISE ERROR HANDLING
// ========================================================================================

type VerificationErrorScreenProps = NativeStackScreenProps<RootStackParamList, 'VerificationError'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ========================================================================================
// ERROR CONFIGURATION - ENTERPRISE ERROR TAXONOMY
// ========================================================================================

const ERROR_CONFIG = {
  VERIFICATION_FAILED: {
    title: 'Verification Failed',
    description: 'The verification link has expired or is invalid.',
    canRetry: true,
    primaryAction: 'Try Again',
    icon: '⚠️',
  },
  TOKEN_EXPIRED: {
    title: 'Link Expired',
    description: 'This verification link has expired. Please request a new one.',
    canRetry: true,
    primaryAction: 'Get New Link',
    icon: '⏰',
  },
  NETWORK_ERROR: {
    title: 'Connection Error',
    description: 'Unable to verify your email. Please check your internet connection.',
    canRetry: true,
    primaryAction: 'Retry',
    icon: '📡',
  },
  TIMEOUT: {
    title: 'Request Timeout',
    description: 'Verification took too long. Please try again.',
    canRetry: true,
    primaryAction: 'Try Again',
    icon: '⏱️',
  },
  INVALID_LINK: {
    title: 'Invalid Link',
    description: 'This verification link is not valid or has been used already.',
    canRetry: false,
    primaryAction: 'Sign Up Again',
    icon: '🔗',
  },
  UNKNOWN: {
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again.',
    canRetry: true,
    primaryAction: 'Try Again',
    icon: '❌',
  },
} as const;

// ========================================================================================
// VERIFICATION ERROR SCREEN IMPLEMENTATION - REVOLUTIONARY ERROR RECOVERY
// ========================================================================================

const VerificationErrorScreen: React.FC<VerificationErrorScreenProps> = ({ navigation, route }) => {
  const { error, email, canRetry = true } = route.params;
  
  // Theme System
  const theme = useTheme();
  const { colors, spacing, animations } = theme;
  
  // Animation Values with cleanup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const errorIconAnim = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Cleanup animations
  useEffect(() => {
    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      errorIconAnim.stopAnimation();
      shakeAnim.stopAnimation();
      fadeAnim.removeAllListeners();
      slideAnim.removeAllListeners();
      errorIconAnim.removeAllListeners();
      shakeAnim.removeAllListeners();
    };
  }, [fadeAnim, slideAnim, errorIconAnim, shakeAnim]);
  
  // ========================================================================================
  // ERROR CONFIGURATION RESOLUTION - ENTERPRISE ERROR MAPPING
  // ========================================================================================
  
  const getErrorConfig = useCallback(() => {
    // Try to match specific error messages to error types
    const errorMessage = error.toLowerCase();
    
    if (errorMessage.includes('expired')) {
      return ERROR_CONFIG.TOKEN_EXPIRED;
    } else if (errorMessage.includes('timeout')) {
      return ERROR_CONFIG.TIMEOUT;
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return ERROR_CONFIG.NETWORK_ERROR;
    } else if (errorMessage.includes('invalid') || errorMessage.includes('used')) {
      return ERROR_CONFIG.INVALID_LINK;
    } else if (errorMessage.includes('verification')) {
      return ERROR_CONFIG.VERIFICATION_FAILED;
    } else {
      return ERROR_CONFIG.UNKNOWN;
    }
  }, [error]);
  
  const errorConfig = getErrorConfig();
  
  // ========================================================================================
  // ENTRANCE ANIMATION SYSTEM - TESLA-INSPIRED ERROR FEEDBACK
  // ========================================================================================
  
  useEffect(() => {
    const startEntranceAnimation = () => {
      // Error icon animation with shake effect
      Animated.sequence([
        Animated.spring(errorIconAnim, {
          toValue: 1,
          tension: 400,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]),
      ]).start();
      
      // Content fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animations.duration.medium,
        useNativeDriver: true,
      }).start();
      
      // Content slide up
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 300,
        friction: 12,
        useNativeDriver: true,
      }).start();
    };
    
    const timer = setTimeout(startEntranceAnimation, 100);
    return () => clearTimeout(timer);
  }, [animations, fadeAnim, slideAnim, errorIconAnim, shakeAnim]);
  
  // ========================================================================================
  // NAVIGATION HANDLERS - ENTERPRISE ERROR RECOVERY
  // ========================================================================================
  
  const handlePrimaryAction = useCallback(() => {
    if (canRetry && errorConfig.canRetry) {
      if (email) {
        // Go back to email sent screen to retry
        navigation.reset({
          index: 0,
          routes: [{ name: 'EmailSent', params: { email, tempUserId: '' } }],
        });
      } else {
        // Go back to signup to start over
        navigation.reset({
          index: 0,
          routes: [{ name: 'Signup' }],
        });
      }
    } else {
      // Start signup process again
      navigation.reset({
        index: 0,
        routes: [{ name: 'Signup' }],
      });
    }
  }, [navigation, canRetry, errorConfig.canRetry, email]);
  
  const handleBackToLogin = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);
  
  const handleBackToWelcome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'AuthWelcome' }],
    });
  }, [navigation]);
  
  // Android back button handling
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackToWelcome();
      return true;
    });
    
    return () => backHandler.remove();
  }, [handleBackToWelcome]);
  
  // ========================================================================================
  // COMPONENT RENDER - REVOLUTIONARY ERROR RECOVERY EXPERIENCE
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
            onBackPress={handleBackToWelcome}
            style={{ marginBottom: spacing.xl }}
          />
          
          {/* Error Icon Section */}
          <Animated.View 
            style={[
              styles.iconSection,
              {
                transform: [
                  { scale: errorIconAnim },
                  { translateX: shakeAnim },
                ],
              }
            ]}
          >
            <View style={[styles.errorIcon, { backgroundColor: colors.accent.critical + '20' }]}>
              <Text style={[styles.errorIconText, { color: colors.accent.critical }]}>
                {errorConfig.icon}
              </Text>
            </View>
          </Animated.View>
          
          {/* Error Information Section */}
          <View style={styles.errorSection}>
            <Text
              variant="h2"
              align="center"
              style={[styles.errorTitle, { color: colors.interactive.text.primary }]}
            >
              {errorConfig.title}
            </Text>
            
            <Text
              variant="body"
              align="center"
              style={[styles.errorDescription, { color: colors.interactive.text.secondary }]}
            >
              {errorConfig.description}
            </Text>
            
            {/* Show specific error details if available */}
            {error && error !== errorConfig.description && (
              <View style={[styles.errorDetailsContainer, { backgroundColor: colors.accent.critical + '10' }]}>
                <Text
                  variant="caption"
                  align="center"
                  style={[styles.errorDetails, { color: colors.accent.critical }]}
                >
                  Error: {error}
                </Text>
              </View>
            )}
            
            {/* Show email if available */}
            {email && (
              <Text
                variant="bodySmall"
                align="center"
                style={[styles.emailText, { color: colors.interactive.text.secondary }]}
              >
                Email: {email}
              </Text>
            )}
          </View>
          
          {/* Action Buttons Section */}
          <View style={styles.actionsSection}>
            <Button
              variant="primary"
              size="large"
              fullWidth
              onPress={handlePrimaryAction}
              style={styles.primaryButton}
              accessibilityLabel={errorConfig.primaryAction}
              testID="error-primary-action-button"
            >
              {errorConfig.primaryAction}
            </Button>
            
            <Button
              variant="ghost"
              size="large"
              fullWidth
              onPress={handleBackToLogin}
              style={styles.secondaryButton}
              accessibilityLabel="Go to sign in"
              testID="back-to-login-button"
            >
              Sign In Instead
            </Button>
          </View>
          
          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text
              variant="caption"
              align="center"
              style={[styles.helpText, { color: colors.interactive.text.secondary }]}
            >
              Still having trouble? Contact our support team for assistance.
            </Text>
            
            <Button
              variant="ghost"
              size="medium"
              fullWidth
              onPress={() => {
                // TODO: Implement support contact
                console.log('Contact support');
              }}
              style={styles.supportButton}
              accessibilityLabel="Contact support"
              testID="contact-support-button"
            >
              Contact Support
            </Button>
          </View>
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
  iconSection: {
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.05,
  },
  errorIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorIconText: {
    fontSize: 48,
    lineHeight: 56,
  },
  errorSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  errorDescription: {
    marginBottom: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  errorDetailsContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  errorDetails: {
    textAlign: 'center',
    lineHeight: 18,
  },
  emailText: {
    opacity: 0.8,
    fontStyle: 'italic',
  },
  actionsSection: {
    gap: 16,
    marginTop: 32,
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
  helpSection: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 16,
  },
  helpText: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  supportButton: {
    height: 44,
  },
});

export default VerificationErrorScreen;