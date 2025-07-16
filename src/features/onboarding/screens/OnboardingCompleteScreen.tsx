// src/screens/onboarding/OnboardingCompleteScreen.tsx
// IRANVERSE Enterprise Onboarding Complete - Revolutionary Welcome Experience
// Tesla-inspired success celebration with Agent Identity Confirmation
// Built for 90M users - Enterprise Performance & Accessibility
import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  BackHandler,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IRANVERSE Components
import SafeArea from '../../../shared/components/layout/SafeArea';
import GradientBackground from '../../../shared/components/layout/GradientBackground';
import Button from '../../../shared/components/ui/Button';
import Text from '../../../shared/components/ui/Text';
import Card from '../../../shared/components/ui/Card';
import Loader from '../../../shared/components/ui/Loader';
import ToastProvider, { useToast } from '../../../shared/components/ui/Toast';
import { useTheme } from '../../../shared/theme/ThemeProvider';

// ========================================================================================
// TYPES & INTERFACES - ENTERPRISE ONBOARDING SYSTEM
// ========================================================================================

export interface OnboardingCompleteRouteParams {
  userId: string;
  email: string;
  userName: string;
  accessToken: string;
  avatarUrl: string;
}

export type RootStackParamList = {
  OnboardingComplete: OnboardingCompleteRouteParams;
  Home: {
    userId: string;
    avatarUrl: string;
    isNewUser: boolean;
  };
};

type OnboardingCompleteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingComplete'>;
type OnboardingCompleteScreenRouteProp = RouteProp<RootStackParamList, 'OnboardingComplete'>;

interface OnboardingState {
  isReady: boolean;
  isNavigating: boolean;
  setupComplete: boolean;
  hasError: boolean;
  errorMessage: string;
  toastVisible: boolean;
  toastMessage: string;
  toastType: 'success' | 'error' | 'warning';
}

// ========================================================================================
// ONBOARDING COMPLETE SCREEN - REVOLUTIONARY WELCOME
// ========================================================================================

const OnboardingCompleteScreenContent: React.FC = () => {
  // Navigation & Route
  const navigation = useNavigation<OnboardingCompleteScreenNavigationProp>();
  const route = useRoute<OnboardingCompleteScreenRouteProp>();
  const { userId, email, userName, accessToken, avatarUrl } = route.params;

  // Theme System
  const theme = useTheme();
  const { colors, spacing, animations } = theme;

  // Screen Dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Component State
  const [state, setState] = useState<OnboardingState>({
    isReady: false,
    isNavigating: false,
    setupComplete: false,
    hasError: false,
    errorMessage: '',
    toastVisible: false,
    toastMessage: '',
    toastType: 'success',
  });

  // Animation Values with cleanup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  // Timer refs for cleanup
  const setupTimer = useRef<NodeJS.Timeout | null>(null);
  const navigationTimer = useRef<NodeJS.Timeout | null>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear timers
      if (setupTimer.current) {
        clearTimeout(setupTimer.current);
        setupTimer.current = null;
      }
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
        navigationTimer.current = null;
      }

      // Cleanup animations
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
      slideAnim.stopAnimation();
      progressAnim.stopAnimation();
      celebrationAnim.stopAnimation();
      fadeAnim.removeAllListeners();
      scaleAnim.removeAllListeners();
      slideAnim.removeAllListeners();
      progressAnim.removeAllListeners();
      celebrationAnim.removeAllListeners();
    };
  }, [fadeAnim, scaleAnim, slideAnim, progressAnim, celebrationAnim]);

  // ========================================================================================
  // TOAST MANAGEMENT - ENTERPRISE MESSAGING
  // ========================================================================================

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setState(prev => ({
      ...prev,
      toastVisible: true,
      toastMessage: message,
      toastType: type,
    }));

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        toastVisible: false,
      }));
    }, 3000);
  }, []);

  // ========================================================================================
  // ONBOARDING SETUP - ENTERPRISE DATA PERSISTENCE
  // ========================================================================================

  const completeUserSetup = useCallback(async (): Promise<void> => {
    try {
      // Store user data to AsyncStorage
      const userData = {
        userId,
        email,
        userName,
        avatarUrl,
        accessToken,
        setupComplete: true,
        onboardingDate: new Date().toISOString(),
      };

      await Promise.all([
        AsyncStorage.setItem('@user_data', JSON.stringify(userData)),
        AsyncStorage.setItem('@avatar_url', avatarUrl),
        AsyncStorage.setItem('@user_id', userId),
        AsyncStorage.setItem('@onboarding_complete', 'true'),
      ]);

      console.log('User setup completed successfully');
      
      setState(prev => ({ ...prev, setupComplete: true }));
      
      // Start celebration animation
      Animated.sequence([
        Animated.timing(celebrationAnim, {
          toValue: 1,
          duration: animations.duration.slow,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationAnim, {
          toValue: 0,
          duration: animations.duration.medium,
          useNativeDriver: true,
        }),
      ]).start();

    } catch (error) {
      console.error('Failed to complete user setup:', error);
      setState(prev => ({ 
        ...prev, 
        hasError: true, 
        errorMessage: 'Failed to complete setup. Please try again.' 
      }));
      showToast('Setup failed. Please try again.', 'error');
    }
  }, [userId, email, userName, avatarUrl, accessToken, animations, celebrationAnim, showToast]);

  const syncUserToBackend = useCallback(async (): Promise<void> => {
    try {
      // Optional backend sync - don't block onboarding if it fails
      const response = await fetch('/users/me/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId,
          avatarUrl,
          onboardingComplete: true,
          completedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log('User onboarding synced to backend');
      } else {
        console.warn('Backend sync failed, continuing offline');
      }
    } catch (error) {
      console.warn('Backend sync error (non-blocking):', error);
      // Don't throw - allow offline completion
    }
  }, [accessToken, userId, avatarUrl]);

  // ========================================================================================
  // NAVIGATION HANDLERS - ENTERPRISE FLOW CONTROL
  // ========================================================================================

  const handleContinueToApp = useCallback(() => {
    if (state.isNavigating) return;

    setState(prev => ({ ...prev, isNavigating: true }));

    // Haptic feedback
    if (Platform.OS !== 'web') {
      try {
        const { Vibration } = require('react-native');
        Vibration.vibrate([0, 50, 100, 50]);
      } catch (error) {
        console.warn('Haptic feedback error:', error);
      }
    }

    // Animate out and navigate
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: animations.duration.medium,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: animations.duration.medium,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('Home', {
        userId,
        avatarUrl,
        isNewUser: true,
      });
    });
  }, [state.isNavigating, navigation, userId, avatarUrl, animations, fadeAnim, scaleAnim]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Prevent back navigation during setup
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (state.setupComplete) {
          handleGoBack();
        }
        return true; // Always prevent default back during onboarding
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [state.setupComplete, handleGoBack])
  );

  // ========================================================================================
  // LIFECYCLE EFFECTS - ENTERPRISE INITIALIZATION
  // ========================================================================================

  // Entrance animation
  useEffect(() => {
    const startEntranceAnimation = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animations.duration.slow,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 400,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animations.duration.slow,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setState(prev => ({ ...prev, isReady: true }));
      });
    };

    startEntranceAnimation();
  }, [animations, fadeAnim, scaleAnim, slideAnim]);

  // Setup process
  useEffect(() => {
    if (!state.isReady) return;

    const runSetup = async () => {
      // Progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: animations.duration.slow,
        useNativeDriver: false,
      }).start();

      // Staggered setup process
      setupTimer.current = setTimeout(async () => {
        await completeUserSetup();
        await syncUserToBackend();
        setupTimer.current = null;
      }, 1500); // Allow progress animation to show
    };

    runSetup();
  }, [state.isReady, animations, progressAnim, completeUserSetup, syncUserToBackend]);

  // ========================================================================================
  // RENDER HELPERS - ENTERPRISE UI COMPONENTS
  // ========================================================================================

  const renderWelcomeCard = () => (
    <Animated.View
      style={[
        styles.welcomeCardContainer,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim },
          ],
        },
      ]}
    >
      <Card
        variant="glass"
        size="large"
        style={styles.welcomeCard}
      >
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.successIcon,
            {
              transform: [
                { 
                  scale: celebrationAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.3, 1],
                  })
                },
                {
                  rotate: celebrationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }
              ],
            },
          ]}
        >
          <Text style={styles.successEmoji}>🎉</Text>
        </Animated.View>

        {/* Welcome Content */}
        <Text variant="h1" style={styles.welcomeTitle}>
          Welcome to IRANVERSE!
        </Text>
        
        <Text variant="body" color="secondary" style={styles.welcomeSubtitle}>
          Your digital identity has been created successfully.
        </Text>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text variant="bodySmall" color="secondary" style={styles.userLabel}>
            Welcome, {userName}
          </Text>
          <Text variant="caption" color="secondary" style={styles.userEmail}>
            {email}
          </Text>
        </View>

        {/* Setup Progress */}
        {!state.setupComplete && (
          <View style={styles.progressContainer}>
            <Text variant="bodySmall" color="secondary" style={styles.progressLabel}>
              Finalizing your setup...
            </Text>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Continue Button */}
        {state.setupComplete && (
          <Animated.View
            style={[
              styles.continueButtonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Button
              variant="primary"
              size="large"
              onPress={handleContinueToApp}
              disabled={state.isNavigating}
              loading={state.isNavigating}
              style={styles.continueButton}
              accessibilityLabel="Continue to IRANVERSE"
            >
              {state.isNavigating ? 'Loading...' : 'Enter IRANVERSE'}
            </Button>
          </Animated.View>
        )}
      </Card>
    </Animated.View>
  );

  const renderError = () => (
    <Card variant="glass" style={styles.errorCard}>
      <Text variant="h3" color="error" style={styles.errorTitle}>
        Setup Failed
      </Text>
      <Text variant="body" color="secondary" style={styles.errorMessage}>
        {state.errorMessage}
      </Text>
      <Button
        variant="secondary"
        onPress={() => window.location?.reload?.()}
        style={styles.retryButton}
      >
        Retry Setup
      </Button>
    </Card>
  );

  const renderFeatureHighlights = () => (
    <Animated.View
      style={[
        styles.featuresContainer,
        {
          opacity: fadeAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
          }),
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 30],
              }),
            },
          ],
        },
      ]}
    >
      <Text variant="h3" style={styles.featuresTitle}>
        What's Next?
      </Text>
      
      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🗣️</Text>
          <Text variant="bodySmall" style={styles.featureText}>
            Your avatar can speak and express emotions
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🌍</Text>
          <Text variant="bodySmall" style={styles.featureText}>
            Explore immersive 3D environments
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>👥</Text>
          <Text variant="bodySmall" style={styles.featureText}>
            Connect with others in the metaverse
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  // ========================================================================================
  // MAIN RENDER - ENTERPRISE LAYOUT
  // ========================================================================================

  return (
    <SafeArea edges={['top', 'bottom']} style={styles.container}>
      <GradientBackground animated={true}>
        <View style={styles.content}>
          {/* Main Content */}
          <View style={styles.mainContent}>
            {state.hasError ? renderError() : renderWelcomeCard()}
          </View>

          {/* Feature Highlights */}
          {state.setupComplete && !state.hasError && (
            <View style={styles.bottomContent}>
              {renderFeatureHighlights()}
            </View>
          )}
        </View>

        {/* Loading Overlay */}
        {!state.isReady && (
          <View style={styles.loadingOverlay}>
            <Loader
              variant="quantum"
              size="large"
              text="Preparing Your Experience..."
              color={colors.interactive.text.primary}
            />
          </View>
        )}

      </GradientBackground>
    </SafeArea>
  );
};

// ========================================================================================
// STYLES - TESLA-INSPIRED DESIGN
// ========================================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContent: {
    paddingBottom: 40,
  },
  welcomeCardContainer: {
    width: '100%',
    maxWidth: 400,
  },
  welcomeCard: {
    padding: 32,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 64,
    textAlign: 'center',
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#FFFFFF',
  },
  welcomeSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  userLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressLabel: {
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF85',
    borderRadius: 2,
  },
  continueButtonContainer: {
    width: '100%',
  },
  continueButton: {
    width: '100%',
  },
  featuresContainer: {
    marginTop: 40,
  },
  featuresTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  errorCard: {
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    minWidth: 120,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

// Main OnboardingCompleteScreen component wrapped with ToastProvider
const OnboardingCompleteScreen: React.FC = () => {
  return (
    <ToastProvider>
      <OnboardingCompleteScreenContent />
    </ToastProvider>
  );
};

export default OnboardingCompleteScreen;