// src/screens/HomeScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Animated,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

// Import enterprise components
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../hooks/useLanguage';

// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
  route?: {
    params?: {
      avatarUrl?: string;
    };
  };
}

interface WebViewMessage {
  type: string;
  message?: string;
  progress?: number;
  success?: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  // Get auth context with null safety
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language, toggleLanguage, isRTL } = useLanguage();
  
  // States for avatar and speech
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);
  const [webViewKey, setWebViewKey] = useState(1); // For forcing WebView refresh
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(''); 
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  
  // Animation ref for subtle pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // WebView ref
  const webViewRef = useRef<WebView>(null);
  
  // Google API key - in a real app this would be securely stored
  const googleTextToSpeechApiKey = 'AIzaSyDSVoMEXdDuI9w_DwRqjBjYB5e9cr1v_1Q';
  
  // Start pulse animation for avatar container
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.97,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [pulseAnim]);
  
  // Set up the avatar URL from navigation params or storage
  useEffect(() => {
    const setupAvatar = async () => {
      try {
        // First check if we have an avatar URL from navigation params
        const routeAvatarUrl = route?.params?.avatarUrl;
        
        if (routeAvatarUrl) {
          console.log('Using avatar URL from navigation:', routeAvatarUrl);
          setAvatarUrl(routeAvatarUrl);
          // Store the avatar URL for future use
          await AsyncStorage.setItem('@avatar_url', routeAvatarUrl);
          // Clear any previous errors
          setAvatarError(null);
          return;
        } 
        
        // If not from navigation, try to get from storage
        const storedAvatarUrl = await AsyncStorage.getItem('@avatar_url');
        if (storedAvatarUrl) {
          console.log('Using avatar URL from storage:', storedAvatarUrl);
          setAvatarUrl(storedAvatarUrl);
          setAvatarError(null);
          return;
        }
        
        // If we get here, we don't have an avatar URL
        console.error('No avatar URL found');
        setAvatarError('No avatar URL was provided. Please create an avatar first.');
        setIsLoading(false);
        
        // Alert user that they need to create an avatar first
        Alert.alert(
          t('avatar.required') || 'Avatar Required', 
          t('avatar.description') || 'Please create an avatar before using the application.',
          [{ 
            text: t('avatar.title') || 'Create Avatar', 
            onPress: () => navigation.navigate('AvatarCreation') 
          }]
        );
      } catch (error) {
        console.error('Error setting up avatar:', error);
        setAvatarError('Error: ' + (error as Error).message);
        setIsLoading(false);
      }
    };
    
    setupAvatar();
  }, [route?.params?.avatarUrl, navigation, t]);
  
  // WebView HTML content
  const getWebViewHtml = useCallback(() => {
    console.log('Using avatar URL in WebView:', avatarUrl);
    
    return `
    <!DOCTYPE html>
    <html lang="${language === 'farsi' ? 'fa' : 'en'}">
    <head>
      <title>Talking Head - IRANVERSE</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">

      <style>
        body, html { 
          width:100%; 
          height:100%; 
          max-width: 800px; 
          margin: auto; 
          position: relative; 
          background: linear-gradient(135deg, #0a0a0a, #1a1a1a); 
          color: white; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        }
        #avatar { 
          display: block; 
          width:100%; 
          height:100%; 
          background-color: transparent; 
        }
        #loading { 
          display: block; 
          position: absolute; 
          bottom: 10px; 
          left: 10px; 
          right: 10px; 
          height: 50px; 
          font-size: 18px; 
          font-weight: 600;
          color: #00ff88;
          text-align: center;
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

        document.addEventListener('DOMContentLoaded', async function(e) {
          // Notify React Native that the HTML has loaded
          try {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'DEBUG_INFO',
              message: "DOMContentLoaded fired"
            }));
          } catch (error) {
            console.error("Failed to send debug info:", error);
          }

          // Instantiate the class
          const nodeAvatar = document.getElementById('avatar');
          head = new TalkingHead( nodeAvatar, {
            ttsEndpoint: "https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize",
            ttsApikey: "${googleTextToSpeechApiKey}",
            lipsyncModules: ["en", "fi"],
            cameraView: "full",
            cameraNear: 0.01,
            cameraFar: 1000,
            cameraPos: [0, 0.1, 0.25],
            cameraFov: 35
          });

          // Load and show the avatar
          const nodeLoading = document.getElementById('loading');
          try {
            nodeLoading.textContent = "${t('common.loading') || 'Loading...'}";
            
            // Use the exact avatar URL from React Native
            const avatarUrl = "${avatarUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";
            console.log("Avatar URL in WebView:", avatarUrl);
            
            // Notify React Native about which URL we're trying to load
            try {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'DEBUG_INFO',
                message: "Loading avatar from URL: " + avatarUrl
              }));
            } catch (error) {
              console.error("Failed to send debug info:", error);
            }
            
            await head.showAvatar({
              url: avatarUrl,
              body: 'N', // Just head and shoulders
              avatarMood: 'neutral',
              ttsLang: "${language === 'farsi' ? 'fa-IR' : 'en-GB'}",
              ttsVoice: "${language === 'farsi' ? 'fa-IR-Standard-A' : 'en-GB-Standard-A'}",
              lipsyncLang: '${language === 'farsi' ? 'fa' : 'en'}',
              scale: 2.0 
            }, (ev) => {
              if (ev.lengthComputable) {
                let val = Math.min(100, Math.round(ev.loaded/ev.total * 100));
                nodeLoading.textContent = "${t('common.loading') || 'Loading'} " + val + "%";
                
                // Notify React Native of progress
                try {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'LOADING_PROGRESS',
                    progress: val
                  }));
                } catch (error) {
                  console.error("Failed to send progress to React Native:", error);
                }
              }
            });
            nodeLoading.style.display = 'none';
            
            // Notify React Native that avatar is ready
            try {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'AVATAR_READY',
                success: true
              }));
            } catch (error) {
              console.error("Failed to notify React Native of avatar ready:", error);
            }
          } catch (error) {
            console.log(error);
            nodeLoading.textContent = error.toString();
            
            // Notify React Native of error
            try {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'AVATAR_ERROR',
                message: error.toString()
              }));
            } catch (error) {
              console.error("Failed to send error to React Native:", error);
            }
          }

          // Pause animation when document is not visible
          document.addEventListener("visibilitychange", async function (ev) {
            if (document.visibilityState === "visible") {
              head.start();
            } else {
              head.stop();
            }
          });

        });
      </script>
    </head>

    <body>
      <div id="avatar"></div>
      <div id="loading"></div>
    </body>

    </html>
    `;
  }, [avatarUrl, googleTextToSpeechApiKey, language, t]);

  // Handle WebView messages with enhanced error logging
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message: WebViewMessage = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'AVATAR_READY':
          console.log('Avatar is ready');
          setAvatarReady(true);
          setIsLoading(false);
          setAvatarLoaded(true);
          // Explicitly clear any errors when avatar is ready
          setAvatarError(null);
          break;
          
        case 'LOADING_PROGRESS':
          console.log(`Loading progress: ${message.progress}%`);
          break;
          
        case 'AVATAR_ERROR':
          console.error('Avatar error:', message.message);
          setAvatarError(message.message || 'Unknown error');
          setIsLoading(false);
          break;
          
        case 'SPEAKING_STARTED':
          console.log('Speaking started');
          setIsSpeaking(true);
          break;
          
        case 'SPEAKING_ENDED':
          console.log('Speaking ended');
          setIsSpeaking(false);
          break;
          
        case 'SPEAKING_ERROR':
          console.error('Speaking error:', message.message);
          setIsSpeaking(false);
          Alert.alert(
            t('common.error') || "Speech Error",
            message.message || "An error occurred during speech.",
            [{ text: t('common.ok') || "OK" }]
          );
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  }, [t]);

  // WebView error handler
  const handleWebViewError = useCallback((error: any) => {
    console.error('WebView error:', error);
    setAvatarError('WebView error: ' + error.description);
    setIsLoading(false);
  }, [route?.params?.avatarUrl, navigation, t]);

  // Reset WebView to reload the avatar
  const resetAvatar = useCallback(() => {
    setIsLoading(true);
    setAvatarReady(false);
    setAvatarError(null);
    setWebViewKey(prevKey => prevKey + 1);
  }, [route?.params?.avatarUrl, navigation, t]);

  // Handle navigation to authenticated features
  const navigateToAuthFeature = useCallback((screenName: string, params: any = {}) => {
    if (!isAuthenticated) {
      Alert.alert(
        t('auth.login') || "Sign In Required",
        t('auth.loginRequired') || "Please sign in to access this feature",
        [
          { text: t('common.cancel') || "Cancel", style: "cancel" },
          { 
            text: t('auth.login') || "Sign In", 
            onPress: () => navigation.navigate('Login', {
              returnTo: { screen: screenName, params }
            })
          }
        ]
      );
      return false;
    }
    
    // If authenticated, navigate to the requested screen
    navigation.navigate(screenName, params);
    return true;
  }, [isAuthenticated, navigation, t]);

  // Navigate to 3D scene
  const navigateTo3DScene = useCallback(() => {
    if (avatarUrl) {
      navigation.navigate('ThreeDScene', { avatarUrl });
    } else {
      Alert.alert(
        t('avatar.required') || "Avatar Required", 
        t('avatar.description') || "Please create an avatar before entering the 3D world.",
        [{ 
          text: t('avatar.title') || 'Create Avatar', 
          onPress: () => navigation.navigate('AvatarCreation') 
        }]
      );
    }
  }, [avatarUrl, navigation, t]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get a default username
  const getUserName = () => {
    if (!user) return t('common.guestUser') || "Guest User";
    return `${user.first_name} ${user.last_name}` || user.email || "User";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']}
        style={styles.gradient}
      >
        {/* Header with User Profile Button */}
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => { navigateToAuthFeature('UserProfile'); }}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>IRANVERSE</Text>
          
          <TouchableOpacity
            onPress={toggleLanguage}
            style={styles.languageButton}
          >
            <Text style={styles.languageText}>
              {language === 'english' ? 'فا' : 'EN'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* User Welcome */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            {t('common.welcome')} {getUserName()}
          </Text>
        </View>
        
        {/* Avatar WebView Container */}
        <View style={styles.avatarSection}>
          <Animated.View 
            style={[
              styles.avatarContainer,
              { transform: [{ scale: isSpeaking ? pulseAnim : 1 }] }
            ]}
          >
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#00ff88" />
                <Text style={styles.loadingText}>
                  {t('avatar.creating') || 'Loading Your Avatar...'}
                </Text>
              </View>
            )}
           
            {avatarError && !avatarReady && (
              <View style={styles.errorOverlay}>
                <Text style={styles.errorText}>
                  {t('avatar.error') || 'Avatar Error'}
                </Text>
                <Text style={styles.errorMessage}>{avatarError}</Text>
                <TouchableOpacity style={styles.tryAgainButton} onPress={resetAvatar}>
                  <Text style={styles.tryAgainButtonText}>
                    {t('common.retry') || 'Try Again'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {avatarUrl && (
              <WebView
                key={webViewKey}
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: getWebViewHtml() }}
                style={styles.webView}
                onMessage={handleWebViewMessage}
                onError={handleWebViewError}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                
                
                
                
                
                
                
              />
            )}
          </Animated.View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title={t('avatar.title') || 'Create Avatar'}
            onPress={() => navigation.navigate('AvatarCreation')}
            variant="primary"
            size="medium"
            glowEffect={true}
            style={styles.actionButton}
          />

          <Button
            title={t('nav.profile') || 'Profile'}
            onPress={() => { navigateToAuthFeature('UserProfile'); }}
            variant="secondary"
            size="medium"
            style={styles.actionButton}
          />

          <Button
            title={t('auth.logout') || 'Sign Out'}
            onPress={handleLogout}
            variant="danger"
            size="medium"
            style={styles.actionButton}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00ff88',
    letterSpacing: 2,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  avatarSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00ff88',
    marginBottom: 4,
  },
  userText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  languageButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 60,
    paddingVertical: 40,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#00ff88',
    letterSpacing: 3,
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  actionSection: {
    gap: 20,
  },
  actionButton: {
    marginBottom: 8,
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
  },
  loadingText: {
    color: '#00ff88',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(40, 10, 10, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 16,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  tryAgainButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  tryAgainButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },

});

export default HomeScreen;
