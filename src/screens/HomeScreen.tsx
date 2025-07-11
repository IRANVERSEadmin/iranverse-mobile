// src/screens/HomeScreen.tsx
// IRANVERSE Enterprise Home Screen - Revolutionary Avatar Experience
// Tesla-inspired home with TalkingHead integration and 3D navigation
// Built for 90M users - Enterprise Performance & Accessibility
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Alert,
  TouchableOpacity,
  Platform,
  Dimensions,
  BackHandler,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IRANVERSE Components
import SafeArea from '../components/ui/SafeArea';
import GradientBackground from '../components/ui/GradientBackground';
import Button from '../components/ui/Button';
import Text from '../components/ui/Text';
import Loader from '../components/ui/Loader';
import Toast, { toast } from '../components/ui/Toast';
import { useTheme, useColors, useSpacing, useAnimations } from '../components/theme/ThemeProvider';

// ========================================================================================
// TYPES & INTERFACES - ENTERPRISE HOME SYSTEM
// ========================================================================================

export interface HomeScreenRouteParams {
  userId: string;
  avatarUrl?: string;
  isNewUser?: boolean;
}

export type RootStackParamList = {
  Home: HomeScreenRouteParams;
  ThreeDScene: { avatarUrl: string };
  UserProfile: undefined;
  Messages: undefined;
  SocialFeed: undefined;
  CreatePost: undefined;
  Notifications: undefined;
  AvatarCreation: {
    userId: string;
    email: string;
    userName: string;
    accessToken: string;
  };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

interface TalkingHeadMessage {
  type: 'AVATAR_READY' | 'AVATAR_ERROR' | 'LOADING_PROGRESS' | 'DEBUG_INFO' | 'SPEAKING_STARTED' | 'SPEAKING_ENDED' | 'SPEAKING_ERROR';
  success?: boolean;
  message?: string;
  progress?: number;
}

interface HomeState {
  avatarUrl: string | null;
  avatarReady: boolean;
  avatarLoaded: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  isSpeaking: boolean;
  webViewKey: number;
  toastVisible: boolean;
  toastMessage: string;
  toastType: 'success' | 'error' | 'warning';
}

// ========================================================================================
// HOME SCREEN - REVOLUTIONARY AVATAR EXPERIENCE
// ========================================================================================

const HomeScreen: React.FC = () => {
  // Navigation & Route
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const { userId, avatarUrl: routeAvatarUrl, isNewUser = false } = route.params;

  // Theme System
  const theme = useTheme();
  const colors = useColors();
  const spacing = useSpacing();
  const animations = useAnimations();

  // Screen Dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Component State
  const [state, setState] = useState<HomeState>({
    avatarUrl: null,
    avatarReady: false,
    avatarLoaded: false,
    isLoading: true,
    hasError: false,
    errorMessage: '',
    isSpeaking: false,
    webViewKey: 1,
    toastVisible: false,
    toastMessage: '',
    toastType: 'success',
  });

  // Animation Values with cleanup
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Refs
  const webViewRef = useRef<WebView>(null);
  const setupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (setupTimeoutRef.current) {
        clearTimeout(setupTimeoutRef.current);
        setupTimeoutRef.current = null;
      }

      pulseAnim.stopAnimation();
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
      pulseAnim.removeAllListeners();
      fadeAnim.removeAllListeners();
      scaleAnim.removeAllListeners();
    };
  }, [pulseAnim, fadeAnim, scaleAnim]);

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
  // AVATAR MANAGEMENT - ENTERPRISE DATA HANDLING
  // ========================================================================================

  const setupAvatar = useCallback(async () => {
    try {
      let finalAvatarUrl: string | null = null;

      // Priority: Route params > AsyncStorage > Default
      if (routeAvatarUrl) {
        console.log('Using avatar URL from navigation:', routeAvatarUrl);
        finalAvatarUrl = routeAvatarUrl;
        await AsyncStorage.setItem('@avatar_url', routeAvatarUrl);
      } else {
        const storedAvatarUrl = await AsyncStorage.getItem('@avatar_url');
        if (storedAvatarUrl) {
          console.log('Using avatar URL from storage:', storedAvatarUrl);
          finalAvatarUrl = storedAvatarUrl;
        }
      }

      if (!finalAvatarUrl) {
        console.log('No avatar URL found, using default');
        finalAvatarUrl = 'https://raw.githubusercontent.com/FreedomThroughSubversion/test-asses/main/default-avatar.glb';
        await AsyncStorage.setItem('@avatar_url', finalAvatarUrl);
      }

      setState(prev => ({ 
        ...prev, 
        avatarUrl: finalAvatarUrl, 
        hasError: false, 
        errorMessage: '' 
      }));

      // Show welcome message for new users
      if (isNewUser) {
        setupTimeoutRef.current = setTimeout(() => {
          showToast('Welcome to IRANVERSE! Your avatar is ready to speak.', 'success');
        }, 2000);
      }

    } catch (error) {
      console.error('Error setting up avatar:', error);
      setState(prev => ({ 
        ...prev, 
        hasError: true, 
        errorMessage: 'Failed to load avatar. Please try again.',
        isLoading: false 
      }));
      
      Alert.alert(
        'Avatar Required',
        'Please create an avatar before using the application.',
        [{ 
          text: 'Create Avatar', 
          onPress: () => navigation.navigate('AvatarCreation', {
            userId,
            email: '', // Would need to be passed or fetched
            userName: '', // Would need to be passed or fetched
            accessToken: '', // Would need to be passed or fetched
          })
        }]
      );
    }
  }, [routeAvatarUrl, isNewUser, navigation, userId, showToast]);

  // ========================================================================================
  // TALKING HEAD INTEGRATION - GOOGLE TTS
  // ========================================================================================

  const googleTextToSpeechApiKey = 'AIzaSyDSVoMEXdDuI9w_DwRqjBjYB5e9cr1v_1Q'; // Production: use secure storage

  const getWebViewHtml = useCallback(() => {
    if (!state.avatarUrl) return '';

    console.log('Generating WebView HTML for avatar:', state.avatarUrl);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>IRANVERSE Talking Head</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <style>
          body, html { 
            width: 100%; 
            height: 100%; 
            margin: 0; 
            padding: 0;
            max-width: 800px; 
            position: relative; 
            background-color: transparent; 
            color: white; 
            overflow: hidden;
          }
          #avatar { 
            display: block; 
            width: 100%; 
            height: 100%; 
            background-color: transparent; 
          }
          #loading { 
            display: block; 
            position: absolute; 
            bottom: 10px; 
            left: 10px; 
            right: 10px; 
            height: 50px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            font-size: 16px; 
            color: rgba(255, 255, 255, 0.8);
            text-align: center;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .error-message {
            color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid rgba(255, 107, 107, 0.3);
          }
        </style>

        <script type="importmap">
        { "imports":
          {
            "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js/+esm",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/",
            "talkinghead": "https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.4/modules/talkinghead.mjs"
          }
        }
        </script>

        <script type="module">
          import { TalkingHead } from "talkinghead";

          let head;
          let isInitialized = false;

          function postMessageToReactNative(msg) {
            try {
              if (window.ReactNativeWebView) {
                const message = typeof msg === 'string' ? msg : JSON.stringify(msg);
                window.ReactNativeWebView.postMessage(message);
              }
            } catch (error) {
              console.error('Failed to post message to React Native:', error);
            }
          }

          document.addEventListener('DOMContentLoaded', async function(e) {
            try {
              postMessageToReactNative({
                type: 'DEBUG_INFO',
                message: "DOMContentLoaded fired"
              });

              const nodeAvatar = document.getElementById('avatar');
              const nodeLoading = document.getElementById('loading');

              if (!nodeAvatar) {
                throw new Error('Avatar container not found');
              }

              // Initialize TalkingHead
              head = new TalkingHead(nodeAvatar, {
                ttsEndpoint: "https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize",
                ttsApikey: "${googleTextToSpeechApiKey}",
                lipsyncModules: ["en", "fi"],
                cameraView: "full",
                cameraNear: 0.01,
                cameraFar: 1000,
                cameraPos: [0, 0.1, 0.25],
                cameraFov: 35
              });

              nodeLoading.textContent = "Loading avatar...";
              
              const avatarUrl = "${state.avatarUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";
              console.log("Loading avatar from URL:", avatarUrl);
              
              postMessageToReactNative({
                type: 'DEBUG_INFO',
                message: "Loading avatar from URL: " + avatarUrl
              });
              
              await head.showAvatar({
                url: avatarUrl,
                body: 'N',
                avatarMood: 'neutral',
                ttsLang: "en-GB",
                ttsVoice: "en-GB-Standard-A",
                lipsyncLang: 'en',
                scale: 2.0 
              }, (ev) => {
                if (ev.lengthComputable) {
                  let val = Math.min(100, Math.round(ev.loaded/ev.total * 100));
                  nodeLoading.textContent = "Loading " + val + "%";
                  
                  postMessageToReactNative({
                    type: 'LOADING_PROGRESS',
                    progress: val
                  });
                }
              });

              nodeLoading.style.display = 'none';
              isInitialized = true;
              
              postMessageToReactNative({
                type: 'AVATAR_READY',
                success: true
              });

              console.log('Avatar loaded successfully');

            } catch (error) {
              console.error('Avatar loading error:', error);
              const nodeLoading = document.getElementById('loading');
              if (nodeLoading) {
                nodeLoading.textContent = 'Error: ' + error.message;
                nodeLoading.className = 'error-message';
              }
              
              postMessageToReactNative({
                type: 'AVATAR_ERROR',
                message: error.message || 'Failed to load avatar'
              });
            }

            // Handle visibility changes
            document.addEventListener("visibilitychange", async function (ev) {
              if (head && isInitialized) {
                if (document.visibilityState === "visible") {
                  head.start();
                } else {
                  head.stop();
                }
              }
            });
          });

          // Test speaking function
          window.testSpeak = function(text = "Hello! Welcome to IRANVERSE. I am your digital avatar, ready to assist you in this revolutionary metaverse experience.") {
            if (head && isInitialized) {
              try {
                postMessageToReactNative({ type: 'SPEAKING_STARTED' });
                
                head.speakText(text).then(() => {
                  postMessageToReactNative({ type: 'SPEAKING_ENDED' });
                }).catch((error) => {
                  console.error('Speaking error:', error);
                  postMessageToReactNative({ 
                    type: 'SPEAKING_ERROR', 
                    message: error.message || 'Speaking failed'
                  });
                });
              } catch (error) {
                console.error('Test speak error:', error);
                postMessageToReactNative({ 
                  type: 'SPEAKING_ERROR', 
                  message: error.message || 'Speaking initialization failed'
                });
              }
            } else {
              console.warn('Avatar not ready for speaking');
              postMessageToReactNative({ 
                type: 'SPEAKING_ERROR', 
                message: 'Avatar not ready'
              });
            }
          };
        </script>
      </head>

      <body>
        <div id="avatar"></div>
        <div id="loading">Initializing avatar...</div>
      </body>
      </html>
    `;
  }, [state.avatarUrl, googleTextToSpeechApiKey]);

  // ========================================================================================
  // WEBVIEW MESSAGE HANDLING - ENTERPRISE COMMUNICATION
  // ========================================================================================

  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const messageData = event.nativeEvent.data;
      console.log('WebView message received:', messageData);

      const message: TalkingHeadMessage = JSON.parse(messageData);
      
      switch (message.type) {
        case 'AVATAR_READY':
          console.log('Avatar is ready');
          setState(prev => ({ 
            ...prev, 
            avatarReady: true, 
            avatarLoaded: true, 
            isLoading: false,
            hasError: false 
          }));
          break;
          
        case 'LOADING_PROGRESS':
          console.log(`Loading progress: ${message.progress}%`);
          break;
          
        case 'AVATAR_ERROR':
          console.error('Avatar error:', message.message);
          setState(prev => ({ 
            ...prev, 
            hasError: true, 
            errorMessage: message.message || 'Avatar loading failed',
            isLoading: false 
          }));
          break;
          
        case 'SPEAKING_STARTED':
          console.log('Speaking started');
          setState(prev => ({ ...prev, isSpeaking: true }));
          break;
          
        case 'SPEAKING_ENDED':
          console.log('Speaking ended');
          setState(prev => ({ ...prev, isSpeaking: false }));
          break;
          
        case 'SPEAKING_ERROR':
          console.error('Speaking error:', message.message);
          setState(prev => ({ ...prev, isSpeaking: false }));
          showToast(message.message || 'Speaking failed', 'error');
          break;

        case 'DEBUG_INFO':
          console.log('Debug:', message.message);
          break;
          
        default:
          console.log('Unhandled message type:', message.type);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  }, [showToast]);

  const handleWebViewError = useCallback((error: any) => {
    console.error('WebView error:', error);
    setState(prev => ({ 
      ...prev, 
      hasError: true, 
      errorMessage: 'WebView failed to load',
      isLoading: false 
    }));
  }, []);

  // ========================================================================================
  // AVATAR ACTIONS - INTERACTIVE FEATURES
  // ========================================================================================

  const resetAvatar = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      avatarReady: false, 
      avatarLoaded: false, 
      hasError: false, 
      errorMessage: '',
      webViewKey: prev.webViewKey + 1 
    }));
  }, []);

  const testAvatarSpeech = useCallback(() => {
    if (webViewRef.current && state.avatarReady) {
      webViewRef.current.injectJavaScript(`
        if (typeof window.testSpeak === 'function') {
          window.testSpeak();
        } else {
          console.error('testSpeak function not available');
        }
        true;
      `);
    } else {
      showToast('Avatar is not ready yet. Please wait.', 'warning');
    }
  }, [state.avatarReady, showToast]);

  // ========================================================================================
  // NAVIGATION HANDLERS - ENTERPRISE FLOW
  // ========================================================================================

  const navigateTo3DScene = useCallback(() => {
    if (state.avatarUrl) {
      // Haptic feedback
      if (Platform.OS !== 'web') {
        try {
          const { Vibration } = require('react-native');
          Vibration.vibrate(50);
        } catch (error) {
          console.warn('Haptic feedback error:', error);
        }
      }

      navigation.navigate('ThreeDScene', { avatarUrl: state.avatarUrl });
    } else {
      Alert.alert(
        "Avatar Required", 
        "Please create an avatar before entering the 3D world.",
        [{ 
          text: 'Create Avatar', 
          onPress: () => navigation.navigate('AvatarCreation', {
            userId,
            email: '', // Would need proper user data
            userName: '',
            accessToken: '',
          })
        }]
      );
    }
  }, [state.avatarUrl, navigation, userId]);

  const navigateToFeature = useCallback((feature: keyof RootStackParamList) => {
    // Placeholder for authenticated features
    Alert.alert(
      "Feature Coming Soon",
      `${feature} will be available in the next update.`,
      [{ text: "OK" }]
    );
  }, []);

  // ========================================================================================
  // LIFECYCLE EFFECTS - ENTERPRISE INITIALIZATION
  // ========================================================================================

  useEffect(() => {
    setupAvatar();
  }, [setupAvatar]);

  // Pulse animation for speaking state
  useEffect(() => {
    if (state.isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [state.isSpeaking, pulseAnim]);

  // Prevent back navigation
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          "Exit IRANVERSE",
          "Are you sure you want to exit?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Exit", onPress: () => BackHandler.exitApp() }
          ]
        );
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  // ========================================================================================
  // RENDER HELPERS - ENTERPRISE UI COMPONENTS
  // ========================================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={() => navigateToFeature('UserProfile')}
        accessibilityLabel="User profile"
      >
        <Text style={styles.headerIcon}>👤</Text>
      </TouchableOpacity>
      
      <Text variant="h3" style={styles.headerTitle}>
        IRANVERSE
      </Text>
      
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={() => navigateToFeature('Messages')}
        accessibilityLabel="Messages"
      >
        <Text style={styles.headerIcon}>💬</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAvatarSection = () => (
    <View style={styles.avatarSection}>
      <Animated.View 
        style={[
          styles.avatarContainer,
          {
            transform: [{ scale: state.isSpeaking ? pulseAnim : scaleAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        {/* Loading Overlay */}
        {state.isLoading && (
          <View style={styles.loadingOverlay}>
            <Loader
              variant="orbital"
              size="large"
              text="Loading Your Avatar..."
              color={colors.interactive.text}
            />
          </View>
        )}
       
        {/* Error Overlay */}
        {state.hasError && !state.avatarReady && (
          <View style={styles.errorOverlay}>
            <Text variant="h3" color="error" style={styles.errorTitle}>
              Avatar Error
            </Text>
            <Text variant="body" color="secondary" style={styles.errorMessage}>
              {state.errorMessage}
            </Text>
            <Button
              variant="secondary"
              onPress={resetAvatar}
              style={styles.retryButton}
            >
              Try Again
            </Button>
          </View>
        )}
        
        {/* Avatar WebView */}
        {state.avatarUrl && (
          <WebView
            key={state.webViewKey}
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: getWebViewHtml() }}
            style={styles.webView}
            onMessage={handleWebViewMessage}
            onError={handleWebViewError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
            mixedContentMode="always"
            startInLoadingState={false}
            renderLoading={() => <></>}
            onShouldStartLoadWithRequest={() => true}
            scrollEnabled={false}
            bounces={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>

      {/* Avatar Controls */}
      {state.avatarReady && (
        <View style={styles.avatarControls}>
          <Button
            variant="primary"
            size="medium"
            onPress={testAvatarSpeech}
            disabled={state.isSpeaking}
            style={styles.speakButton}
            accessibilityLabel="Test avatar speech"
          >
            {state.isSpeaking ? '🗣️ Speaking...' : '🎤 Say Hello'}
          </Button>
        </View>
      )}
    </View>
  );

  const renderBottomNavigation = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigateToFeature('SocialFeed')}
        accessibilityLabel="Social feed"
      >
        <Text style={styles.navIcon}>🏠</Text>
        <Text style={styles.navLabel}>Feed</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={navigateTo3DScene}
        accessibilityLabel="Enter 3D world"
      >
        <Text style={styles.navIcon}>🌍</Text>
        <Text style={styles.navLabel}>3D World</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navButton, styles.createButton]}
        onPress={() => navigateToFeature('CreatePost')}
        accessibilityLabel="Create post"
      >
        <View style={styles.createButtonInner}>
          <Text style={styles.createIcon}>+</Text>
        </View>
        <Text style={styles.navLabel}>Create</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigateToFeature('Notifications')}
        accessibilityLabel="Notifications"
      >
        <Text style={styles.navIcon}>🔔</Text>
        <Text style={styles.navLabel}>Alerts</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigateToFeature('UserProfile')}
        accessibilityLabel="User profile"
      >
        <Text style={styles.navIcon}>👤</Text>
        <Text style={styles.navLabel}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  // ========================================================================================
  // MAIN RENDER - ENTERPRISE LAYOUT
  // ========================================================================================

  return (
    <SafeArea edges={['top', 'bottom']} style={styles.container}>
      <GradientBackground animated={true}>
        {/* Header */}
        {renderHeader()}
        
        {/* Avatar Section */}
        {renderAvatarSection()}
        
        {/* Bottom Navigation */}
        {renderBottomNavigation()}

        {/* Toast Container */}
        <Toast 
          visible={state.toastVisible}
          message={state.toastMessage}
        />
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
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerIcon: {
    fontSize: 20,
  },
  avatarSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: '85%',        
    height: '70%',        
    maxWidth: 400,  
    maxHeight: 500, 
    borderRadius: 20,      
    overflow: 'hidden',
    backgroundColor: 'transparent',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
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
    zIndex: 10,
    borderRadius: 20,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 20,
    borderRadius: 20,
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
  avatarControls: {
    marginTop: 20,
    alignItems: 'center',
  },
  speakButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  createButton: {
    position: 'relative',
  },
  createButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00FF85',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#00FF85',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createIcon: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default HomeScreen;