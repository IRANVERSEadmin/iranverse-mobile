// src/screens/onboarding/AvatarCreationScreen.tsx
// IRANVERSE Enterprise Avatar Creation - Revolutionary Identity Formation
// Tesla-inspired avatar creation with Ready Player Me integration
// Built for 90M users - Enterprise Performance & Security
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  BackHandler,
  Platform,
  Dimensions,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IRANVERSE Components
import SafeArea from '../../../shared/components/layout/SafeArea';
import GradientBackground from '../../../shared/components/layout/GradientBackground';
import Loader from '../../../shared/components/ui/Loader';
import Button from '../../../shared/components/ui/Button';
import Text from '../../../shared/components/ui/Text';
import ToastProvider, { useToast } from '../../../shared/components/ui/Toast';
import { useTheme } from '../../../shared/theme/ThemeProvider';

// ========================================================================================
// TYPES & INTERFACES - ENTERPRISE AVATAR SYSTEM
// ========================================================================================

export interface AvatarCreationRouteParams {
  userId: string;
  email: string;
  userName: string;
  accessToken: string;
}

export type RootStackParamList = {
  AvatarCreation: AvatarCreationRouteParams;
  OnboardingComplete: {
    userId: string;
    email: string;
    userName: string;
    accessToken: string;
    avatarUrl: string;
  };
};

type AvatarCreationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AvatarCreation'>;
type AvatarCreationScreenRouteProp = RouteProp<RootStackParamList, 'AvatarCreation'>;

interface ReadyPlayerMeMessage {
  type: 'avatar' | 'close' | 'error' | 'iframe_loaded' | 'user_authorized' | 'user_updated';
  data?: {
    url?: string;
    userId?: string;
    [key: string]: any;
  };
  url?: string;
  message?: string;
}

interface AvatarCreationState {
  isLoading: boolean;
  webViewKey: number;
  rpmReady: boolean;
  hasError: boolean;
  errorMessage: string;
  avatarUrl: string | null;
  isProcessing: boolean;
  toastVisible: boolean;
  toastMessage: string;
  toastType: 'success' | 'error' | 'warning';
}

// ========================================================================================
// AVATAR CREATION SCREEN - REVOLUTIONARY IDENTITY FORMATION
// ========================================================================================

const AvatarCreationScreenContent: React.FC = () => {
  // Navigation & Route
  const navigation = useNavigation<AvatarCreationScreenNavigationProp>();
  const route = useRoute<AvatarCreationScreenRouteProp>();
  const { userId, email, userName, accessToken } = route.params;

  // Theme System
  const theme = useTheme();
  const { colors, spacing, animations } = theme;

  // Screen Dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Component State
  const [state, setState] = useState<AvatarCreationState>({
    isLoading: true,
    webViewKey: 1,
    rpmReady: false,
    hasError: false,
    errorMessage: '',
    avatarUrl: null,
    isProcessing: false,
    toastVisible: false,
    toastMessage: '',
    toastType: 'success',
  });

  // Refs
  const webViewRef = useRef<WebView>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  // READY PLAYER ME CONFIGURATION - ENTERPRISE INTEGRATION
  // ========================================================================================

  const RPM_SUBDOMAIN = 'demo'; // Production: replace with enterprise subdomain
  const RPM_TIMEOUT = 30000; // 30 seconds timeout

  const rpmConfig = useMemo(() => ({
    clearCache: true,
    bodyType: 'halfbody',
    quickStart: false,
    language: 'en',
    theme: 'dark', // Match IRANVERSE theme
  }), []);

  // ========================================================================================
  // AVATAR PROCESSING - ENTERPRISE BACKEND SYNC
  // ========================================================================================

  const processAvatarUrl = useCallback((url: string): string => {
    if (!url) return '';
    
    console.log('Processing avatar URL:', url);
    
    // Add required morphTargets for talking head functionality
    let finalUrl = url;
    if (!finalUrl.includes('morphTargets')) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl += `${separator}morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png`;
    }
    
    console.log('Processed avatar URL:', finalUrl);
    return finalUrl;
  }, []);

  const saveAvatarToStorage = useCallback(async (avatarUrl: string): Promise<void> => {
    try {
      await AsyncStorage.setItem('@avatar_url', avatarUrl);
      console.log('Avatar URL saved to storage:', avatarUrl);
    } catch (error) {
      console.error('Failed to save avatar URL to storage:', error);
      throw new Error('Failed to save avatar data locally');
    }
  }, []);

  const syncAvatarToBackend = useCallback(async (avatarUrl: string): Promise<void> => {
    try {
      const response = await fetch('/users/me/avatar/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          rpmUrl: avatarUrl,
          configuration: rpmConfig,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to sync avatar`);
      }

      const result = await response.json();
      console.log('Avatar synced to backend:', result);
    } catch (error) {
      console.error('Backend sync failed:', error);
      // Don't throw - allow offline functionality
      showToast('Avatar saved locally. Will sync when connection is available.', 'warning');
    }
  }, [accessToken, rpmConfig, showToast]);

  // ========================================================================================
  // WEBVIEW MESSAGE HANDLING - ENTERPRISE SECURITY
  // ========================================================================================

  const handleWebViewMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      const messageData = event.nativeEvent.data;
      console.log('WebView message received:', messageData);

      // Parse message safely
      let message: ReadyPlayerMeMessage;
      try {
        message = JSON.parse(messageData);
      } catch (parseError) {
        // Handle direct URL strings (fallback)
        if (typeof messageData === 'string' && messageData.includes('readyplayer.me') && messageData.includes('.glb')) {
          message = { type: 'avatar', url: messageData };
        } else {
          console.warn('Invalid message format:', messageData);
          return;
        }
      }

      // Handle different message types
      switch (message.type) {
        case 'iframe_loaded':
          setState(prev => ({ ...prev, rpmReady: true, isLoading: false }));
          showToast('Avatar creation ready!', 'success');
          break;

        case 'avatar':
          if (message.data?.url || message.url) {
            const rawUrl = message.data?.url || message.url || '';
            await handleAvatarCreated(rawUrl);
          }
          break;

        case 'close':
          handleGoBack();
          break;

        case 'error':
          const errorMsg = message.message || 'Avatar creation failed';
          setState(prev => ({ 
            ...prev, 
            hasError: true, 
            errorMessage: errorMsg, 
            isLoading: false 
          }));
          showToast(errorMsg, 'error');
          break;

        default:
          console.log('Unhandled message type:', message.type);
          break;
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
      setState(prev => ({ 
        ...prev, 
        hasError: true, 
        errorMessage: 'Communication error with avatar creator',
        isLoading: false 
      }));
    }
  }, []);

  const handleAvatarCreated = useCallback(async (rawUrl: string) => {
    if (state.isProcessing) return;

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const processedUrl = processAvatarUrl(rawUrl);
      
      if (!processedUrl) {
        throw new Error('Invalid avatar URL received');
      }

      // Save to local storage first
      await saveAvatarToStorage(processedUrl);
      
      // Sync to backend (non-blocking)
      await syncAvatarToBackend(processedUrl);

      setState(prev => ({ 
        ...prev, 
        avatarUrl: processedUrl, 
        isProcessing: false 
      }));

      // Show success and navigate
      showToast('Avatar created successfully!', 'success');
      
      setTimeout(() => {
        navigation.navigate('OnboardingComplete', {
          userId,
          email,
          userName,
          accessToken,
          avatarUrl: processedUrl,
        });
      }, 1000);

    } catch (error) {
      console.error('Error processing avatar:', error);
      setState(prev => ({ 
        ...prev, 
        hasError: true, 
        errorMessage: error instanceof Error ? error.message : 'Failed to process avatar',
        isProcessing: false 
      }));
      showToast('Failed to save avatar. Please try again.', 'error');
    }
  }, [state.isProcessing, processAvatarUrl, saveAvatarToStorage, syncAvatarToBackend, navigation, userId, email, userName, accessToken, showToast]);

  // ========================================================================================
  // NAVIGATION & LIFECYCLE - ENTERPRISE PATTERNS
  // ========================================================================================

  const handleGoBack = useCallback(() => {
    Alert.alert(
      "Exit Avatar Creation",
      "Are you sure you want to exit? Your avatar progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Exit", 
          style: "destructive",
          onPress: () => {
            // Clear any timeouts
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            navigation.goBack();
          }
        }
      ]
    );
  }, [navigation]);

  const handleRetry = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      hasError: false, 
      errorMessage: '', 
      webViewKey: prev.webViewKey + 1 
    }));
  }, []);

  const handleSkip = useCallback(async () => {
    Alert.alert(
      "Skip Avatar Creation",
      "You can create your avatar later in settings. Continue with a default avatar?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Continue", 
          onPress: async () => {
            try {
              // Use default avatar
              const defaultAvatarUrl = 'https://raw.githubusercontent.com/FreedomThroughSubversion/test-asses/main/default-avatar.glb';
              const processedUrl = processAvatarUrl(defaultAvatarUrl);
              
              await saveAvatarToStorage(processedUrl);
              
              navigation.navigate('OnboardingComplete', {
                userId,
                email,
                userName,
                accessToken,
                avatarUrl: processedUrl,
              });
            } catch (error) {
              showToast('Failed to set default avatar', 'error');
            }
          }
        }
      ]
    );
  }, [navigation, userId, email, userName, accessToken, processAvatarUrl, saveAvatarToStorage, showToast]);

  // Android back button handling
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [handleGoBack])
  );

  // Timeout handling for WebView loading
  useEffect(() => {
    if (state.isLoading && !state.rpmReady) {
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          hasError: true, 
          errorMessage: 'Avatar creator is taking too long to load. Please check your connection.',
          isLoading: false 
        }));
      }, RPM_TIMEOUT);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [state.isLoading, state.rpmReady]);

  // ========================================================================================
  // WEBVIEW HTML CONTENT - READY PLAYER ME INTEGRATION
  // ========================================================================================

  const rpmHtml = useMemo(() => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <title>IRANVERSE Avatar Creator</title>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #000000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
          overflow: hidden;
        }
        .loading {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000000;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          color: white;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-text {
          margin-top: 16px;
          font-size: 16px;
          opacity: 0.8;
        }
      </style>
    </head>
    <body>
      <div id="loading" class="loading">
        <div class="spinner"></div>
        <div class="loading-text">Initializing Avatar Creator...</div>
      </div>
      
      <iframe 
        id="rpm-iframe" 
        allow="camera *; microphone *; clipboard-write" 
        src="https://${RPM_SUBDOMAIN}.readyplayer.me/avatar?frameApi&clearCache=${rpmConfig.clearCache}&bodyType=${rpmConfig.bodyType}&quickStart=${rpmConfig.quickStart}&language=${rpmConfig.language}"
        style="display: none;"
      ></iframe>
      
      <script>
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
        
        const iframe = document.getElementById('rpm-iframe');
        const loading = document.getElementById('loading');
        
        // Handle iframe load
        iframe.onload = function() {
          console.log('RPM iframe loaded');
          loading.style.display = 'none';
          iframe.style.display = 'block';
          postMessageToReactNative({ type: 'iframe_loaded' });
        };
        
        iframe.onerror = function(error) {
          console.error('RPM iframe error:', error);
          postMessageToReactNative({ 
            type: 'error', 
            message: 'Failed to load avatar creator. Please check your connection.' 
          });
        };
        
        // Listen for Ready Player Me messages
        window.addEventListener('message', function(event) {
          console.log('RPM message received:', event.data);
          
          // Forward all messages to React Native for processing
          postMessageToReactNative(event.data);
        });
        
        // Timeout fallback
        setTimeout(() => {
          if (loading.style.display !== 'none') {
            postMessageToReactNative({ 
              type: 'error', 
              message: 'Avatar creator failed to load within timeout period.' 
            });
          }
        }, 25000);
        
        // Initial ready signal
        postMessageToReactNative({ type: 'page_loaded' });
      </script>
    </body>
    </html>
  `, [RPM_SUBDOMAIN, rpmConfig]);

  // ========================================================================================
  // RENDER HELPERS - ENTERPRISE UI COMPONENTS
  // ========================================================================================

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text variant="h2" color="error" style={styles.errorTitle}>
        Avatar Creation Failed
      </Text>
      <Text variant="body" color="secondary" style={styles.errorMessage}>
        {state.errorMessage}
      </Text>
      <View style={styles.errorActions}>
        <Button
          variant="secondary"
          onPress={handleRetry}
          style={styles.retryButton}
        >
          Try Again
        </Button>
        <Button
          variant="ghost"
          onPress={handleSkip}
          style={styles.skipButton}
        >
          Skip for Now
        </Button>
      </View>
    </View>
  );

  const renderWebView = () => (
    <WebView
      key={state.webViewKey}
      ref={webViewRef}
      source={{ html: rpmHtml }}
      style={styles.webView}
      onMessage={handleWebViewMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      bounces={false}
      scrollEnabled={false}
      originWhitelist={['*']}
      mixedContentMode="always"
      onError={(error) => {
        console.error('WebView error:', error);
        setState(prev => ({ 
          ...prev, 
          hasError: true, 
          errorMessage: 'WebView failed to load',
          isLoading: false 
        }));
      }}
      onHttpError={(error) => {
        console.error('WebView HTTP error:', error);
        setState(prev => ({ 
          ...prev, 
          hasError: true, 
          errorMessage: `Network error: ${error.nativeEvent.statusCode}`,
          isLoading: false 
        }));
      }}
    />
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Loader
        variant="quantum"
        size="large"
        text="Creating Your Avatar..."
        color={colors.interactive.text.primary}
      />
    </View>
  );

  const renderProcessing = () => (
    <View style={styles.processingOverlay}>
      <Loader
        variant="quantum"
        size="large"
        text="Processing Avatar..."
        color={colors.accent.success}
      />
    </View>
  );

  // ========================================================================================
  // MAIN RENDER - ENTERPRISE LAYOUT
  // ========================================================================================

  return (
    <SafeArea edges={['top', 'bottom']} style={styles.container}>
      <GradientBackground>
        {/* Header */}
        <View style={styles.header}>
          <Button
            variant="ghost"
            onPress={handleGoBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            ←
          </Button>
          <Text variant="h3" style={styles.headerTitle}>
            Create Your Avatar
          </Text>
          <Button
            variant="ghost"
            onPress={handleSkip}
            style={styles.skipHeaderButton}
            accessibilityLabel="Skip avatar creation"
          >
            Skip
          </Button>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {state.hasError ? renderError() : renderWebView()}
          
          {/* Loading Overlay */}
          {state.isLoading && renderLoading()}
          
          {/* Processing Overlay */}
          {state.isProcessing && renderProcessing()}
        </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
  },
  backButton: {
    minWidth: 60,
    justifyContent: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  skipHeaderButton: {
    minWidth: 60,
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
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
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 16,
  },
  retryButton: {
    minWidth: 120,
  },
  skipButton: {
    minWidth: 120,
  },
});

// Main AvatarCreationScreen component wrapped with ToastProvider
const AvatarCreationScreen: React.FC = () => {
  return (
    <ToastProvider>
      <AvatarCreationScreenContent />
    </ToastProvider>
  );
};

export default AvatarCreationScreen;