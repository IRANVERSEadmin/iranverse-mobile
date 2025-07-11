// src/screens/ThreeDSceneScreen.tsx
// IRANVERSE Enterprise 3D Scene - Revolutionary Metaverse Experience
// Tesla-inspired 3D environment with Three.js and avatar movement
// Built for 90M users - Enterprise Performance & Immersive Experience
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  BackHandler,
  PanResponderGestureState,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IRANVERSE Components
import SafeArea from '../components/ui/SafeArea';
import Text from '../components/ui/Text';
import Loader from '../components/ui/Loader';
import Toast, { toast } from '../components/ui/Toast';
import { useTheme, useColors } from '../components/theme/ThemeProvider';

// ========================================================================================
// JOYSTICK COMPONENT - ENTERPRISE CONTROLS
// ========================================================================================

interface JoystickMovement {
  x: number; // -1 to 1
  y: number; // -1 to 1
  angle: number; // in radians
  speed: number; // 0 to 1
}

interface JoystickProps {
  onMove: (movement: JoystickMovement) => void;
  onRelease: () => void;
  initialPosition: { x: number; y: number };
}

const Joystick: React.FC<JoystickProps> = ({ onMove, onRelease, initialPosition }) => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handlePanResponder = React.useMemo(() => {
    const maxDistance = 50;
    
    return {
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsActive(true);
      },
      onPanResponderMove: (_: any, gestureState: PanResponderGestureState) => {
        const { dx, dy } = gestureState;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const limitedDistance = Math.min(distance, maxDistance);
        
        const angle = Math.atan2(dy, dx);
        const x = Math.cos(angle) * limitedDistance;
        const y = Math.sin(angle) * limitedDistance;
        
        setPosition({ x, y });
        
        const normalizedX = x / maxDistance;
        const normalizedY = y / maxDistance;
        const speed = limitedDistance / maxDistance;
        
        onMove({
          x: normalizedX,
          y: normalizedY,
          angle,
          speed,
        });
      },
      onPanResponderRelease: () => {
        setIsActive(false);
        setPosition({ x: 0, y: 0 });
        onRelease();
      },
    };
  }, [onMove, onRelease]);

  return (
    <View
      style={[
        styles.joystickContainer,
        {
          left: initialPosition.x - 60,
          top: initialPosition.y - 60,
        }
      ]}
      {...handlePanResponder}
    >
      <View style={[styles.joystickBase, isActive && styles.joystickBaseActive]}>
        <View
          style={[
            styles.joystickKnob,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
              ],
            },
            isActive && styles.joystickKnobActive,
          ]}
        />
      </View>
    </View>
  );
};

// ========================================================================================
// TYPES & INTERFACES - ENTERPRISE 3D SYSTEM
// ========================================================================================

export interface ThreeDSceneRouteParams {
  avatarUrl: string;
}

export type RootStackParamList = {
  ThreeDScene: ThreeDSceneRouteParams;
  Home: {
    userId: string;
    avatarUrl?: string;
    isNewUser?: boolean;
  };
};

type ThreeDSceneScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ThreeDScene'>;
type ThreeDSceneScreenRouteProp = RouteProp<RootStackParamList, 'ThreeDScene'>;

interface ThreeDMessage {
  type: 'log' | 'error' | 'modelStatus' | 'modelLoaded' | 'modelError' | 'avatarLoaded' | 'avatarError' | 'requestAvatarUrl';
  message?: string;
}

interface ThreeDState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  modelStatus: string;
  avatarUrl: string | null;
  joystickEnabled: boolean;
  sceneReady: boolean;
  toastVisible: boolean;
  toastMessage: string;
  toastType: 'success' | 'error' | 'warning';
}

// ========================================================================================
// 3D SCENE SCREEN - REVOLUTIONARY METAVERSE
// ========================================================================================

const ThreeDSceneScreen: React.FC = () => {
  // Navigation & Route
  const navigation = useNavigation<ThreeDSceneScreenNavigationProp>();
  const route = useRoute<ThreeDSceneScreenRouteProp>();
  const { avatarUrl: routeAvatarUrl } = route.params;

  // Theme System
  const theme = useTheme();
  const colors = useColors();

  // Component State
  const [state, setState] = useState<ThreeDState>({
    isLoading: true,
    hasError: false,
    errorMessage: '',
    modelStatus: 'Initializing 3D Environment...',
    avatarUrl: null,
    joystickEnabled: false,
    sceneReady: false,
    toastVisible: false,
    toastMessage: '',
    toastType: 'success',
  });

  // Refs
  const webViewRef = useRef<WebView>(null);

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
  // AVATAR URL MANAGEMENT - ENTERPRISE DATA HANDLING
  // ========================================================================================

  useEffect(() => {
    const initializeAvatarUrl = async () => {
      try {
        let finalAvatarUrl: string;

        if (routeAvatarUrl) {
          console.log('Using avatar URL from route:', routeAvatarUrl);
          finalAvatarUrl = routeAvatarUrl;
        } else {
          const storedAvatarUrl = await AsyncStorage.getItem('@avatar_url');
          if (storedAvatarUrl) {
            console.log('Using avatar URL from storage:', storedAvatarUrl);
            finalAvatarUrl = storedAvatarUrl;
          } else {
            console.log('No avatar URL found, using default');
            finalAvatarUrl = 'https://raw.githubusercontent.com/FreedomThroughSubversion/test-asses/main/default-avatar.glb';
          }
        }

        setState(prev => ({ ...prev, avatarUrl: finalAvatarUrl }));
      } catch (error) {
        console.error('Error initializing avatar URL:', error);
        setState(prev => ({ 
          ...prev, 
          hasError: true, 
          errorMessage: 'Failed to load avatar data',
          isLoading: false 
        }));
      }
    };

    initializeAvatarUrl();
  }, [routeAvatarUrl]);

  // ========================================================================================
  // WEBVIEW MESSAGE HANDLING - ENTERPRISE COMMUNICATION
  // ========================================================================================

  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const messageData = event.nativeEvent.data;
      
      // Handle both JSON and string messages
      let parsedData: ThreeDMessage;
      try {
        parsedData = JSON.parse(messageData);
      } catch {
        // Handle plain string messages
        console.log('3D Scene message:', messageData);
        return;
      }

      console.log('3D Scene structured message:', parsedData);

      switch (parsedData.type) {
        case 'log':
          console.log('3D Scene:', parsedData.message);
          break;
          
        case 'error':
          console.error('3D Scene Error:', parsedData.message);
          break;
          
        case 'modelStatus':
          setState(prev => ({ ...prev, modelStatus: parsedData.message || 'Loading...' }));
          break;
          
        case 'modelLoaded':
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            joystickEnabled: true, 
            sceneReady: true 
          }));
          showToast('3D environment loaded successfully!', 'success');
          break;
          
        case 'modelError':
          setState(prev => ({ 
            ...prev, 
            hasError: true, 
            errorMessage: parsedData.message || '3D scene failed to load',
            isLoading: false 
          }));
          showToast('Failed to load 3D environment', 'error');
          break;
          
        case 'avatarLoaded':
          console.log('Avatar loaded in 3D scene');
          break;
          
        case 'avatarError':
          console.error('Avatar loading error in 3D scene:', parsedData.message);
          showToast('Avatar failed to load, using fallback', 'warning');
          break;
          
        case 'requestAvatarUrl':
          // Send avatar URL to WebView
          if (state.avatarUrl && webViewRef.current) {
            const message = JSON.stringify({ 
              type: 'avatarUrl', 
              url: state.avatarUrl 
            });
            webViewRef.current.injectJavaScript(`
              if (typeof window.handleAvatarUrl === 'function') {
                window.handleAvatarUrl(${JSON.stringify(message)});
              }
              true;
            `);
          }
          break;
      }
    } catch (error) {
      console.error('Error handling 3D scene message:', error);
    }
  }, [state.avatarUrl, showToast]);

  // ========================================================================================
  // JOYSTICK CONTROL - ENTERPRISE INTERACTION
  // ========================================================================================

  const handleJoystickMove = useCallback((movement: JoystickMovement) => {
    if (!webViewRef.current || !state.joystickEnabled) return;
    
    const message = JSON.stringify({
      type: 'joystickMove',
      x: movement.x,
      y: movement.y,
      angle: movement.angle,
      speed: movement.speed,
    });
    
    webViewRef.current.injectJavaScript(`
      if (typeof window.handleJoystickInput === 'function') {
        window.handleJoystickInput(${JSON.stringify(message)});
      }
      true;
    `);
  }, [state.joystickEnabled]);

  const handleJoystickRelease = useCallback(() => {
    if (!webViewRef.current) return;
    
    console.log("Joystick released - sending stop command");
    
    webViewRef.current.injectJavaScript(`
      joystickActive = false;
      joystickMovement = {
        x: 0,
        y: 0,
        angle: 0,
        speed: 0
      };
      
      if (avatarMixer && animations['Idle']) {
        avatarMixer.stopAllAction();
        animations['Idle'].reset();
        animations['Idle'].play();
        currentAnimation = 'Idle';
      }
      
      if (typeof window.handleJoystickInput === 'function') {
        window.handleJoystickInput(${JSON.stringify({ 
          type: 'joystickRelease',
          forceStop: true 
        })});
      }
      true;
    `);
  }, []);

  // ========================================================================================
  // NAVIGATION HANDLERS - ENTERPRISE FLOW
  // ========================================================================================

  const handleGoBack = useCallback(() => {
    Alert.alert(
      "Exit 3D World",
      "Are you sure you want to return to the main screen?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Exit", 
          onPress: () => navigation.goBack()
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
      sceneReady: false,
      joystickEnabled: false 
    }));
    
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

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

  // ========================================================================================
  // THREE.JS HTML CONTENT - ENTERPRISE 3D ENVIRONMENT
  // ========================================================================================

  const threeDHtml = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>IRANVERSE 3D Environment</title>
      <style>
        body {
          margin: 0;
          overflow: hidden;
          width: 100vw;
          height: 100vh;
          background-color: #000;
          touch-action: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          text-align: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .controls-help {
          position: absolute;
          bottom: 10px;
          left: 10px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          pointer-events: none;
          background: rgba(0, 0, 0, 0.6);
          padding: 8px 12px;
          border-radius: 8px;
        }
        .camera-hint {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          pointer-events: none;
          opacity: 0.8;
          transition: opacity 1s ease-in-out;
        }
      </style>
    </head>
    <body>
      <div id="loading" class="loading">Initializing 3D Environment...</div>
      <div class="controls-help">Use joystick to move • Swipe to look around</div>
      <div class="camera-hint">Swipe left/right to rotate • Swipe up/down to tilt</div>
      
      <!-- Three.js CDN -->
      <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/GLTFLoader.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/DRACOLoader.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/FBXLoader.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/libs/fflate.min.js"></script>
      
      <script>
        // Global variables
        let scene, camera, renderer;
        let sceneModel, avatarModel;
        let avatarMixer, animations = {};
        let skeletonHelper;
        let clock = new THREE.Clock();
        let moveSpeed = 0.05;
        
        // Track if joystick is currently being touched
        let joystickActive = false;
        
        // Analog joystick movement values
        let joystickMovement = {
          x: 0,      // -1 to 1 (left to right)
          y: 0,      // -1 to 1 (forward to backward)
          angle: 0,  // in radians
          speed: 0   // 0 to 1
        };
        
        // Camera orbit variables
        let cameraOrbitAngle = 0;
        let cameraTiltAngle = 0;
        let isSwiping = false;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let cameraHintTimer = null;
        
        // Animation state tracking
        let currentAnimation = '';
        const fadeDuration = 0.3;
        
        // Camera parameters for 3rd person camera
        const cameraParams = {
          distance: 2,
          height: 0.7,
          smoothness: 0.1,
          lookAtHeight: 0.95,
          minDistance: 1,
          maxDistance: 6
        };
        
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
        
        // Function to receive avatar URL from React Native
        window.handleAvatarUrl = function(messageStr) {
          const message = JSON.parse(messageStr);
          if (message.type === 'avatarUrl') {
            loadAvatar(message.url);
          }
        };
        
        // Function to handle joystick input from React Native
        window.handleJoystickInput = function(messageStr) {
          const message = JSON.parse(messageStr);
          
          if (message.type === 'joystickMove') {
            joystickActive = true;
            joystickMovement.x = message.x;
            joystickMovement.y = message.y;
            joystickMovement.angle = message.angle;
            joystickMovement.speed = message.speed;
          } 
          else if (message.type === 'joystickRelease') {
            console.log("Joystick release received - stopping avatar");
            joystickActive = false;
            joystickMovement.x = 0;
            joystickMovement.y = 0;
            joystickMovement.angle = 0;
            joystickMovement.speed = 0;
            
            if (animations['Idle'] && avatarMixer) {
              console.log("Forcing switch to Idle animation");
              avatarMixer.stopAllAction();
              animations['Idle'].reset();
              animations['Idle'].play();
              currentAnimation = 'Idle';
            }
          }
        };
        
        // Initialize the 3D environment
        function init() {
          console.log('Initializing 3D environment');
          updateStatus('Setting up 3D environment...');
          
          // Create scene
          scene = new THREE.Scene();
          scene.background = new THREE.Color(0x001f3f);
          
          // Create camera
          camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
          camera.position.set(0, cameraParams.height, cameraParams.distance);
          camera.lookAt(0, 0, 0);
          
          // Create renderer
          renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          });
          renderer.setSize(window.innerWidth, window.innerHeight);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          renderer.outputEncoding = THREE.sRGBEncoding;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1;
          document.body.appendChild(renderer.domElement);
          
          // Enhanced lighting
          setupLighting();
          
          // Initialize clock
          clock = new THREE.Clock();
          
          // Load scene and avatar
          loadScene();
          
          // Request avatar URL from React Native
          postMessageToReactNative({ type: 'requestAvatarUrl' });
          
          // Handle window resize
          window.addEventListener('resize', onWindowResize);
          
          // Setup controls
          setupKeyboardControls();
          setupTouchControls();
          
          // Start animation loop
          animate();
          
          // Setup camera hint
          setupCameraHint();
        }
        
        function setupCameraHint() {
          const cameraHint = document.querySelector('.camera-hint');
          cameraHint.style.opacity = '0.9';
          cameraHint.style.transition = 'opacity 1s ease-in-out';
          
          cameraHintTimer = setTimeout(() => {
            cameraHint.style.opacity = '0';
            setTimeout(() => {
              cameraHint.style.display = 'none';
            }, 1000);
          }, 5000);
        }
        
        function setupTouchControls() {
          document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && e.touches[0].clientY < window.innerHeight / 2) {
              isSwiping = true;
              lastTouchX = e.touches[0].clientX;
              lastTouchY = e.touches[0].clientY;
              
              const cameraHint = document.querySelector('.camera-hint');
              if (cameraHint.style.display === 'none') {
                cameraHint.style.display = 'block';
                cameraHint.style.opacity = '0.9';
                
                if (cameraHintTimer) {
                  clearTimeout(cameraHintTimer);
                }
                
                cameraHintTimer = setTimeout(() => {
                  cameraHint.style.opacity = '0';
                  setTimeout(() => {
                    cameraHint.style.display = 'none';
                  }, 1000);
                }, 2000);
              }
            }
          });
          
          document.addEventListener('touchmove', (e) => {
            if (isSwiping && e.touches.length === 1) {
              const currentX = e.touches[0].clientX;
              const currentY = e.touches[0].clientY;
              const deltaX = currentX - lastTouchX;
              const deltaY = currentY - lastTouchY;
              
              cameraOrbitAngle -= deltaX * 0.01;
              cameraTiltAngle -= deltaY * 0.01;
              
              cameraTiltAngle = Math.max(-Math.PI/2, Math.min(Math.PI/8, cameraTiltAngle));
              cameraOrbitAngle = cameraOrbitAngle % (Math.PI * 2);
              if (cameraOrbitAngle < 0) cameraOrbitAngle += Math.PI * 2;
              
              lastTouchX = currentX;
              lastTouchY = currentY;
              
              e.preventDefault();
            }
          });
          
          document.addEventListener('touchend', () => {
            isSwiping = false;
          });
        }
        
        function setupKeyboardControls() {
          document.addEventListener('keydown', (e) => {
            switch(e.code) {
              case 'KeyW': 
                joystickMovement.y = -1;
                joystickMovement.speed = 1;
                break;
              case 'KeyS': 
                joystickMovement.y = 1;
                joystickMovement.speed = 1;
                break;
              case 'KeyA': 
                joystickMovement.x = -1;
                joystickMovement.speed = 1;
                break;
              case 'KeyD': 
                joystickMovement.x = 1;
                joystickMovement.speed = 1;
                break;
            }
          });
          
          document.addEventListener('keyup', (e) => {
            switch(e.code) {
              case 'KeyW':
                if (joystickMovement.y < 0) joystickMovement.y = 0;
                break;
              case 'KeyS':
                if (joystickMovement.y > 0) joystickMovement.y = 0;
                break;
              case 'KeyA':
                if (joystickMovement.x < 0) joystickMovement.x = 0;
                break;
              case 'KeyD':
                if (joystickMovement.x > 0) joystickMovement.x = 0;
                break;
            }
            
            if (joystickMovement.x === 0 && joystickMovement.y === 0) {
              joystickMovement.speed = 0;
            }
          });
        }
        
        function setupLighting() {
          scene.children.forEach(child => {
            if (child.isLight) scene.remove(child);
          });
          
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
          scene.add(ambientLight);
          
          const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
          mainLight.position.set(5, 10, 5);
          mainLight.castShadow = true;
          mainLight.shadow.mapSize.width = 1024;
          mainLight.shadow.mapSize.height = 1024;
          mainLight.shadow.camera.near = 0.5;
          mainLight.shadow.camera.far = 50;
          mainLight.shadow.camera.left = -15;
          mainLight.shadow.camera.right = 15;
          mainLight.shadow.camera.top = 15;
          mainLight.shadow.camera.bottom = -15;
          mainLight.shadow.bias = -0.001;
          scene.add(mainLight);
          
          const fillLight = new THREE.DirectionalLight(0x8A5CF6, 0.4);
          fillLight.position.set(-7, 4, -6);
          scene.add(fillLight);
          
          const rimLight = new THREE.DirectionalLight(0x00FF85, 0.3);
          rimLight.position.set(0, 5, -10);
          scene.add(rimLight);
          
          const groundLight = new THREE.HemisphereLight(0xffffcc, 0x080820, 0.3);
          scene.add(groundLight);
          
          console.log('Enhanced lighting setup complete');
        }
        
        function loadScene() {
          updateStatus('Loading scene model...');
          
          const loader = new THREE.GLTFLoader();
          const dracoLoader = new THREE.DRACOLoader();
          dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
          loader.setDRACOLoader(dracoLoader);
          
          const modelPath = 'https://raw.githubusercontent.com/FreedomThroughSubversion/test-asses/main/Scene.glb';
          
          loader.load(
            modelPath,
            function(gltf) {
              console.log('Scene model loaded successfully');
              updateStatus('Processing scene model...');
              
              sceneModel = gltf.scene;
              scene.add(sceneModel);
              
              sceneModel.traverse(function(node) {
                if (node.isMesh) {
                  node.castShadow = true;
                  node.receiveShadow = true;
                  
                  if (node.material) {
                    node.material = node.material.clone();
                    node.material.shininess = 100;
                    
                    if (node.material.metalness !== undefined) {
                      node.material.metalness = Math.min(node.material.metalness + 0.2, 1.0);
                      node.material.roughness = Math.max(node.material.roughness - 0.2, 0.1);
                      node.material.envMapIntensity = 1.5;
                    }
                    
                    node.material.emissive = new THREE.Color(0x010101);
                    
                    if (node.material.specular) {
                      node.material.specular.set(0xffffff);
                    }
                  }
                }
              });
              
              const box = new THREE.Box3().setFromObject(sceneModel);
              const center = box.getCenter(new THREE.Vector3());
              sceneModel.position.x -= center.x;
              sceneModel.position.z -= center.z;
              
              updateStatus('Scene loaded, waiting for avatar...');
            },
            function(xhr) {
              if (xhr.total > 0) {
                const percent = Math.round(xhr.loaded / xhr.total * 100);
                updateStatus("Loading scene: " + percent + "%");
              }
            },
            function(error) {
              console.error('Error loading scene model:', error);
              updateStatus('Error loading scene. Trying to continue...');
            }
          );
        }
        
        function loadAvatar(avatarUrl) {
          updateStatus('Loading avatar model...');
          console.log('Loading avatar from URL:', avatarUrl);
          
          if (!avatarUrl || avatarUrl === 'undefined') {
            console.log('No valid avatar URL provided, using default');
            avatarUrl = 'https://raw.githubusercontent.com/FreedomThroughSubversion/test-asses/main/default-avatar.glb';
          }
          
          const loader = new THREE.GLTFLoader();
          
          loader.load(
            avatarUrl,
            function(gltf) {
              console.log('Avatar model loaded successfully');
              updateStatus('Processing avatar model...');
              
              avatarModel = gltf.scene;
              scene.add(avatarModel);
              
              avatarModel.scale.set(0.5, 0.5, 0.5);
              avatarModel.position.set(3.5, 0, 20);
              avatarModel.rotation.y = Math.PI;

              avatarModel.traverse(function(node) {
                if (node.isMesh) {
                  node.castShadow = true;
                  node.receiveShadow = true;
                  
                  if (node.material) {
                    node.material = node.material.clone();
                    
                    if (node.material.color) {
                      const color = node.material.color.clone();
                      color.r = Math.min(color.r * 1.0, 1.0);
                      color.g = Math.min(color.g * 1.0, 1.0);
                      color.b = Math.min(color.b * 1.0, 1.0);
                      node.material.color = color;
                    }
                    
                    node.material.emissive = new THREE.Color(0x000000);
                  }
                }
              });
              
              avatarMixer = new THREE.AnimationMixer(avatarModel);
              loadFbxAnimations();
              
              if (avatarModel.children[0] && avatarModel.children[0].skeleton) {
                skeletonHelper = new THREE.SkeletonHelper(avatarModel);
                skeletonHelper.visible = false;
                scene.add(skeletonHelper);
              }
              
              updateCameraPosition(true);
              
              postMessageToReactNative({
                type: 'avatarLoaded'
              });
            },
            function(xhr) {
              if (xhr.total > 0) {
                const percent = Math.round(xhr.loaded / xhr.total * 100);
                updateStatus("Loading avatar: " + percent + "%");
              }
            },
            function(error) {
              console.error('Error loading avatar model:', error);
              postMessageToReactNative({
                type: 'avatarError',
                message: error.message
              });
              
              createPlaceholderAvatar();
            }
          );
        }
        
        function loadFbxAnimations() {
          updateStatus('Loading animations...');
          console.log('Starting to load animations');
          
          const fbxLoader = new THREE.FBXLoader();
          
          const animationFiles = [
            { name: 'Walk', url: 'https://raw.githubusercontent.com/FreedomThroughSubversion/test-asses/main/walk.fbx' },
            { name: 'Idle', url: 'https://raw.githubusercontent.com/FreedomThroughSubversion/test-asses/main/midle.fbx' }
          ];
          
          let loadedCount = 0;
          let loadedNames = [];
          
          animationFiles.forEach(anim => {
            console.log('Loading animation:', anim.name, 'from URL:', anim.url);
            
            fbxLoader.load(
              anim.url,
              function(fbx) {
                console.log('Successfully loaded ' + anim.name + ' animation');
                
                if (fbx.animations && fbx.animations.length > 0) {
                  console.log('Found ' + fbx.animations.length + ' animations in the FBX file');
                  
                  const animClip = fbx.animations[0];
                  animClip.name = anim.name;
                  
                  const action = avatarMixer.clipAction(animClip);
                  action.loop = THREE.LoopRepeat;
                  action.clampWhenFinished = true;
                  
                  animations[anim.name] = action;
                  loadedNames.push(anim.name);
                  
                  console.log('Added ' + anim.name + ' to available animations');
                  
                  if (anim.name === 'Idle' && currentAnimation === '') {
                    console.log('Starting Idle animation');
                    action.play();
                    currentAnimation = 'Idle';
                  }
                } else {
                  console.warn('FBX file for ' + anim.name + ' doesn\'t contain any animations');
                }
                
                loadedCount++;
                checkAnimationsLoaded(loadedCount, animationFiles.length);
              },
              function(xhr) {
                if (xhr.total > 0) {
                  const percent = Math.round(xhr.loaded / xhr.total * 100);
                  updateStatus('Loading ' + anim.name + ' animation: ' + percent + '%');
                }
              },
              function(error) {
                console.error('Error loading ' + anim.name + ' animation:', error);
                loadedCount++;
                checkAnimationsLoaded(loadedCount, animationFiles.length);
              }
            );
          });
          
          function checkAnimationsLoaded(loaded, total) {
            if (loaded === total) {
              console.log('All animations loaded');
              
              if (currentAnimation === '' && animations['Idle']) {
                console.log('Starting Idle animation after all animations loaded');
                animations['Idle'].play();
                currentAnimation = 'Idle';
              }
              
              document.getElementById('loading').style.display = 'none';
              postMessageToReactNative({
                type: 'modelLoaded'
              });
            }
          }
        }
        
        function createPlaceholderAvatar() {
          console.log('Creating placeholder avatar');
          
          const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
          const material = new THREE.MeshStandardMaterial({
            color: 0x8A5CF6,
            emissive: 0x000000,
            metalness: 0.3,
            roughness: 0.5
          });
          
          avatarModel = new THREE.Mesh(geometry, material);
          avatarModel.position.set(0, 0, 0);
          avatarModel.castShadow = true;
          avatarModel.receiveShadow = true;
          scene.add(avatarModel);
          
          avatarMixer = new THREE.AnimationMixer(avatarModel);
          loadFbxAnimations();
          
          document.getElementById('loading').style.display = 'none';
          postMessageToReactNative({
            type: 'modelLoaded'
          });
        }
        
        function updateAvatarPosition() {
          if (!avatarModel) return;
          
          if (joystickActive && joystickMovement.speed > 0) {
            let dirX = joystickMovement.x;
            let dirZ = joystickMovement.y;
            
            let targetRotation = Math.atan2(dirX, dirZ);
            avatarModel.rotation.y = targetRotation;
            
            const speed = moveSpeed * joystickMovement.speed;
            avatarModel.position.x += speed * dirX;
            avatarModel.position.z += speed * dirZ;
            
            if (animations['Walk'] && currentAnimation !== 'Walk') {
              if (currentAnimation !== '') {
                avatarMixer.stopAllAction();
              }
              
              animations['Walk'].reset();
              animations['Walk'].play();
              currentAnimation = 'Walk';
            }
          } else {
            if (!joystickActive && animations['Idle'] && currentAnimation !== 'Idle') {
              if (currentAnimation !== '') {
                avatarMixer.stopAllAction();
              }
              
              animations['Idle'].reset();
              animations['Idle'].play();
              currentAnimation = 'Idle';
            }
          }
          
          updateCameraPosition();
        }
        
        function updateCameraPosition(instant = false) {
          if (!avatarModel) return;
          
          const totalAngle = avatarModel.rotation.y + cameraOrbitAngle;
          const horizontalDistance = cameraParams.distance * Math.cos(cameraTiltAngle);
          const verticalDistance = cameraParams.distance * Math.sin(-cameraTiltAngle);
          
          const offsetX = -Math.sin(totalAngle) * horizontalDistance;
          const offsetY = verticalDistance;
          const offsetZ = -Math.cos(totalAngle) * horizontalDistance;
          
          const idealPosition = new THREE.Vector3(
            avatarModel.position.x + offsetX,
            avatarModel.position.y + cameraParams.height + offsetY,
            avatarModel.position.z + offsetZ
          );
          
          if (instant) {
            camera.position.copy(idealPosition);
          } else {
            camera.position.lerp(idealPosition, cameraParams.smoothness);
          }
          
          const lookAtPosition = new THREE.Vector3(
            avatarModel.position.x,
            avatarModel.position.y + cameraParams.lookAtHeight,
            avatarModel.position.z
          );
          
          camera.lookAt(lookAtPosition);
        }
        
        function onWindowResize() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        function animate() {
          requestAnimationFrame(animate);
          
          const delta = clock.getDelta();
          
          updateAvatarPosition();
          
          if (avatarMixer) {
            avatarMixer.update(delta);
          }
          
          renderer.render(scene, camera);
        }
        
        function updateStatus(message) {
          document.getElementById('loading').textContent = message;
          postMessageToReactNative({
            type: 'modelStatus',
            message: message
          });
          console.log('Status:', message);
        }
        
        // Start initialization when page loads
        window.onload = init;
      </script>
    </body>
    </html>
  `, []);

  // ========================================================================================
  // RENDER HELPERS - ENTERPRISE UI COMPONENTS
  // ========================================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleGoBack}
        accessibilityLabel="Go back"
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      
      <Text variant="h3" style={styles.title}>
        3D WORLD
      </Text>
      
      <View style={styles.placeholder} />
    </View>
  );

  const renderJoystick = () => {
    if (!state.joystickEnabled) return null;
    
    return (
      <View style={styles.joystickArea} pointerEvents="box-none">
        <Joystick 
          onMove={handleJoystickMove}
          onRelease={handleJoystickRelease}
          initialPosition={{ x: 100, y: 500 }}
        />
      </View>
    );
  };

  const renderLoading = () => (
    <View style={styles.loadingOverlay}>
      <Loader
        variant="orbital"
        size="large"
        text={state.modelStatus}
        color={colors.interactive.text}
      />
    </View>
  );

  const renderError = () => (
    <View style={styles.errorOverlay}>
      <Text variant="h3" color="error" style={styles.errorTitle}>
        3D Environment Error
      </Text>
      <Text variant="body" color="secondary" style={styles.errorMessage}>
        {state.errorMessage}
      </Text>
      <Text variant="bodySmall" color="secondary" style={styles.errorHelp}>
        Please check your internet connection and try again.
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={handleRetry}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // ========================================================================================
  // MAIN RENDER - ENTERPRISE LAYOUT
  // ========================================================================================

  return (
    <SafeArea edges={['top']} style={styles.container}>
      {/* Header */}
      {renderHeader()}
      
      {/* WebView Container */}
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: threeDHtml }}
          style={styles.webview}
          onLoadEnd={() => console.log('WebView loaded')}
          onError={(e) => {
            console.error('WebView error:', e);
            setState(prev => ({ 
              ...prev, 
              hasError: true, 
              errorMessage: 'WebView error: ' + e.nativeEvent.description,
              isLoading: false 
            }));
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={handleWebViewMessage}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          startInLoadingState={false}
          renderLoading={() => <></>}
          onShouldStartLoadWithRequest={() => true}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
        
        {/* Joystick Controls */}
        {renderJoystick()}
        
        {/* Loading Overlay */}
        {state.isLoading && renderLoading()}
        
        {/* Error Overlay */}
        {state.hasError && renderError()}
      </View>

      {/* Toast Container */}
      <Toast 
        visible={state.toastVisible}
        message={state.toastMessage}
      />
    </SafeArea>
  );
};

// ========================================================================================
// STYLES - TESLA-INSPIRED DESIGN
// ========================================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 44,
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  placeholder: {
    width: 44,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  joystickArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: 5,
    pointerEvents: 'box-none',
  },
  joystickContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickBase: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  joystickBaseActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  joystickKnob: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  joystickKnobActive: {
    backgroundColor: '#00FF85',
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 10,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  errorHelp: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  retryButton: {
    backgroundColor: '#8A5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#8A5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ThreeDSceneScreen;