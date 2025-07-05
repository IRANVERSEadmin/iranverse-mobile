// src/screens/AvatarCreationScreen.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';

// Import enterprise components and types
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../hooks/useLanguage';

interface AvatarCreationScreenProps {
  navigation: any;
}

interface WebViewMessage {
  type: string;
  url?: string;
  data?: {
    url?: string;
  };
}

const AvatarCreationScreen: React.FC<AvatarCreationScreenProps> = ({ navigation }) => {
  // Hooks
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // State
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const [webViewKey, setWebViewKey] = useState(1);
  
  // Partner subdomain for Ready Player Me
  const RPM_SUBDOMAIN = 'demo';

  // Handle Android back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = (): boolean => {
        // Show alert to confirm exiting avatar creation
        Alert.alert(
          t('avatar.exitTitle') || "Exit Avatar Creation",
          t('avatar.exitMessage') || "Are you sure you want to exit? Your avatar progress will be lost.",
          [
            { 
              text: t('common.cancel') || "Cancel", 
              style: "cancel" 
            },
            { 
              text: t('common.confirm') || "Exit", 
              onPress: () => navigation.goBack() 
            }
          ]
        );
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation, t])
  );

  // Process avatar URL and add necessary parameters
  const processAvatarUrl = useCallback((url: string): string | null => {
    if (!url) return null;
    
    console.log("Processing avatar URL:", url);
    
    // Make sure the URL has the necessary parameters for the talking head
    let finalUrl = url;
    if (!finalUrl.includes('morphTargets')) {
      if (finalUrl.includes('?')) {
        finalUrl += '&morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png';
      } else {
        finalUrl += '?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png';
      }
    }
    
    console.log("Final avatar URL with parameters:", finalUrl);
    return finalUrl;
  }, []);
  
  // Navigate to Home with the avatar URL
  const navigateWithAvatar = useCallback((avatarUrl: string) => {
    const finalAvatarUrl = processAvatarUrl(avatarUrl);
    
    if (!finalAvatarUrl) {
      Alert.alert(
        t('common.error') || "Error", 
        t('avatar.error') || "Failed to get a valid avatar URL."
      );
      return;
    }
    
    // Show success message before navigating
    Alert.alert(
      t('avatar.created') || "Avatar Created",
      t('avatar.successMessage') || "Your avatar has been successfully created! Proceeding to home screen.",
      [
        {
          text: t('common.ok') || "OK",
          onPress: () => {
            // Navigate to Home screen with the avatar URL
            navigation.navigate("Home", { avatarUrl: finalAvatarUrl });
          }
        }
      ]
    );
  }, [navigation, processAvatarUrl, t]);

  // HTML content for WebView
  const rpmHtml = `
    <!DOCTYPE html>
    <html lang="${language === 'farsi' ? 'fa' : 'en'}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <title>Ready Player Me - IRANVERSE</title>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
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
          background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          color: white;
        }
        .loading-text {
          margin-top: 20px;
          font-size: 18px;
          font-weight: 600;
          color: #00ff88;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 255, 136, 0.3);
          border-radius: 50%;
          border-top-color: #00ff88;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div id="loading" class="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">${t('avatar.creating') || 'Loading Ready Player Me...'}</div>
      </div>
      
      <iframe 
        id="rpm-iframe" 
        allow="camera *; microphone *" 
        src="https://${RPM_SUBDOMAIN}.readyplayer.me/avatar?frameApi&clearCache" 
      ></iframe>
      
      <script>
        // Function to communicate with parent React Native app
        function postMessageToReactNative(msg) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
          }
        }
        
        // Wait for iframe to load
        const iframe = document.getElementById('rpm-iframe');
        const loading = document.getElementById('loading');
        
        // Hide loading when iframe loads
        iframe.onload = function() {
          loading.style.display = 'none';
          postMessageToReactNative({ type: 'iframe_loaded' });
        };
        
        // Listen for messages from iframe
        window.addEventListener('message', function(event) {
          // Forward all messages to React Native
          postMessageToReactNative(event.data);
          
          // Special handling for avatar data
          if (event.data && typeof event.data === 'object') {
            // Handle structured data
            if (event.data.type === 'avatar' && event.data.data && event.data.data.url) {
              postMessageToReactNative({
                type: 'avatar_url',
                url: event.data.data.url
              });
            }
            // Handle other Ready Player Me formats
            else if (event.data.url && event.data.url.includes('readyplayer.me') && event.data.url.includes('.glb')) {
              postMessageToReactNative({
                type: 'avatar_url',
                url: event.data.url
              });
            }
          } 
          // Handle direct string URLs
          else if (typeof event.data === 'string' && event.data.includes('readyplayer.me') && event.data.includes('.glb')) {
            postMessageToReactNative({
              type: 'raw_avatar_url',
              url: event.data
            });
          }
        });
        
        // Let React Native know the page is loaded
        postMessageToReactNative({ type: 'page_loaded' });
      </script>
    </body>
    </html>
  `;

  // This function handles messages from the WebView
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = event.nativeEvent.data;
      console.log("Message received from WebView:", message);
      
      // First check if message is a direct URL string (simple check)
      if (typeof message === 'string' && message.includes('readyplayer.me') && message.includes('.glb')) {
        console.log("Direct URL detected:", message);
        navigateWithAvatar(message);
        return;
      }
      
      // Otherwise try to parse as JSON
      let jsonData: WebViewMessage;
      try {
        jsonData = JSON.parse(message);
      } catch (e) {
        console.error("Failed to parse message as JSON:", e);
        console.log("Raw message:", message);
        return;
      }
      
      // Handle avatar URL messages
      if (jsonData?.type === 'avatar' && jsonData?.data?.url) {
        navigateWithAvatar(jsonData.data.url);
      } else if (jsonData?.type === 'avatar_url' && jsonData?.url) {
        navigateWithAvatar(jsonData.url);
      } else if (jsonData?.type === 'raw_avatar_url' && jsonData?.url) {
        navigateWithAvatar(jsonData.url);
      } else if (jsonData?.url && jsonData.url.includes('readyplayer.me') && jsonData.url.includes('.glb')) {
        // Handle any message with a URL property that looks like a Ready Player Me URL
        navigateWithAvatar(jsonData.url);
      }
    } catch (error) {
      console.error('Error in WebView message handler:', error);
      Alert.alert(
        t('common.error') || "Error",
        t('avatar.processError') || "There was a problem processing the avatar. Please try again.",
        [{ text: t('common.ok') || "OK" }]
      );
    }
  }, [navigateWithAvatar, t]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.container}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ff88" />
            <Text style={styles.loadingText}>
              {t('avatar.creating') || 'Creating your avatar...'}
            </Text>
          </View>
        )}
        
        <WebView
          key={webViewKey}
          ref={webViewRef}
          source={{ html: rpmHtml }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          bounces={false}
          scrollEnabled={true}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    color: '#00ff88',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AvatarCreationScreen;
