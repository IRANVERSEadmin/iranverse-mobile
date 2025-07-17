import React, { useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { 
  View, 
  StyleSheet, 
  PanResponder,
  PanResponderInstance,
  GestureResponderEvent, 
  Dimensions, 
  Text,
  TextInput,
  Animated,
  Vibration,
  Platform,
  BackHandler,
  TouchableOpacity,
  TextInput as TextInputType,
  Alert
} from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { Renderer } from 'expo-three';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import GradientBackground from '../shared/components/layout/GradientBackground';
import IranverseLogo from '../shared/components/ui/IranverseLogo';
import Button from '../shared/components/ui/Button';
import { GoogleLogo, AppleLogo } from '../shared/components/ui/OAuthLogos';
import { H1, Body, Caption } from '../shared/components/ui/Text';
import AuthHeader from '../features/auth/components/AuthHeader';
import AuthFooter from '../features/auth/components/AuthFooter';

type KeyboardState = 'hidden' | 'showing' | 'shown' | 'hiding';
type FirstScreenProps = NativeStackScreenProps<RootStackParamList, 'First'>;


const CONFIG = {
  ANIMATION: {
    ORBIT_DURATION: 240000, // 4 minutes (240 seconds)
    TRANSITION_DURATION: 300, // UI transition duration
    KEYBOARD_SLIDE_DISTANCE: 280, // Keyboard avoidance distance
    INPUT_FOCUS_DURATION: 200, // Input focus animation
    CONTROLS_HIDE_DELAY: 4000, // Auto-hide controls delay
    CONTROLS_FADE_DURATION: 800, // Controls fade animation
  },
  PERFORMANCE: {
    MAX_PARTICLES: 1200, // Premium quantum particle count for dense field
    TARGET_FPS: 60, // Target frame rate
    GRID_DIVISIONS: 38, // Grid line density
    MAX_VELOCITY: 0.1, // Gesture velocity limit
  },
  UI: {
    INPUT_POSITION_BOTTOM: 150, // Input field position
    BUTTON_POSITION_BOTTOM: 60, // Play button position
    TITLE_POSITION_TOP: 190, // Title position
    TITLE_MOVE_DISTANCE: 40, // Title movement during orbit
  },
  SECURITY: {
    MAX_INPUT_LENGTH: 500, // Input character limit
    XSS_FILTER_REGEX: /[<>"'&]/g, // Basic XSS prevention (Persian-safe)
  },
  AUDIO: {
    VOLUME_LEVEL: 0.3, // 30% volume
    FADE_OUT_VOLUME: 0.1, // Fade out volume
    FADE_DELAY: 500, // Fade effect delay
    BPM_DEFAULT: 120, // Default beats per minute
  }
};

const FirstScreen: React.FC<FirstScreenProps> = ({ navigation }) => {
  const easeInOutCubic = (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  
  // Error state for user feedback
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  

  const glViewRef = useRef<any>(null);
  const inputRef = useRef<TextInputType>(null);
  const cameraRadiusRef = useRef(10);
  const animationIdRef = useRef<number | null>(null);
  const lookAngleXRef = useRef(Math.atan2(5, 0));
  const lookAngleYRef = useRef(Math.acos(9.9 / 10));
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoAnimationRef = useRef<any>(null);
  const gestureStateRef = useRef({
    isPanning: false,
    isZooming: false,
    lastPanX: 0,
    lastPanY: 0,
    lastZoomDistance: 0,
    panVelocityX: 0,
    panVelocityY: 0,
    zoomVelocity: 0,
    momentumDecay: 0.95,
    lastTouchTime: 0,
  });
  const targetAngleXRef = useRef(Math.atan2(5, 0));
  const targetAngleYRef = useRef(Math.acos(9.9 / 10));
  const targetRadiusRef = useRef(10);
  const UNIFIED_CAMERA_BOUNDS = {
    minRadius: 3,
    maxRadius: 25,
    zoomSensitivity: 0.02,
    smoothFactor: 0.08,
    maxVelocity: 0.1,
    maxDeltaTime: 100,
    minDeltaTime: 1,
  };
  const cameraTransitionRef = useRef<{
    isTransitioning: boolean;
    startTime: number;
    duration: number;
    startRadius: number;
    startAngleX: number;
    startAngleY: number;
    targetRadius: number;
    targetAngleX: number;
    targetAngleY: number;
    easeFunction: (t: number) => number;
  } | null>(null);
  const parabolicOrbitRef = useRef<{
    isActive: boolean;
    startTime: number;
    duration: number;
    initialRadius: number;
    initialAngleX: number;
    initialAngleY: number;
  } | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isAudioLoadedRef = useRef(false);
  const isAudioPlayingRef = useRef(false);
  const audioAnalysisRef = useRef({
    bpm: 120,
    beatInterval: 500,
    lastBeatTime: 0,
    currentBeatStrength: 0,
    targetBeatStrength: 0,
    beatDecayRate: 0.015,
    beatBuildRate: 0.08,
    quickPulse: 0,
    mediumWave: 0,
    slowResonance: 0,
    isAnalyzing: false
  });
  const beatDetectionRef = useRef<NodeJS.Timeout | null>(null);
  const sceneDataRef = useRef<any>(null);
  const [parabolicOrbit, setParabolicOrbit] = useState(false);
  const [inputText, setInputText] = useState('');
  const [keyboardState, setKeyboardState] = useState<KeyboardState>('hidden');
  const [keyboardLanguage, setKeyboardLanguage] = useState<'english' | 'farsi'>('english');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const keyboardStateRef = useRef<KeyboardState>('hidden');
  const buttonScale = useRef(new Animated.Value(1)).current;
  const nextButtonScale = useRef(new Animated.Value(1)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  const keyboardAnim = useRef(new Animated.Value(0)).current;
  const uiPositionAnim = useRef(new Animated.Value(0)).current;

  const forceResetKeyboard = () => {
    keyboardAnim.stopAnimation();
    uiPositionAnim.stopAnimation();
    inputFocusAnim.stopAnimation();
    keyboardAnim.setValue(0);
    uiPositionAnim.setValue(0);
    inputFocusAnim.setValue(0);
    updateKeyboardState('hidden');
  };

  const updateKeyboardState = (newState: KeyboardState) => {
    keyboardStateRef.current = newState;
    setKeyboardState(newState);
  };

  const titlePosition = useRef(new Animated.Value(0)).current;
  const scenePositionAnim = useRef(new Animated.Value(0)).current; // For moving 3D scene up
  
  // OAuth buttons animation values
  const [showAuthButtons, setShowAuthButtons] = useState(false);
  const authButtonsOpacity = useRef(new Animated.Value(0)).current;
  const authButtonsTranslate = useRef(new Animated.Value(50)).current;
  const googleButtonScale = useRef(new Animated.Value(0.8)).current;
  const appleButtonScale = useRef(new Animated.Value(0.8)).current;
  const signInButtonScale = useRef(new Animated.Value(0.8)).current;
  const createAccountButtonScale = useRef(new Animated.Value(0.8)).current;
  
  // Controls fade out animation
  const controlsRowOpacity = useRef(new Animated.Value(1)).current;
  const controlsRowScale = useRef(new Animated.Value(1)).current;
  const backButtonOpacity = useRef(new Animated.Value(0)).current;
  const backButtonScale = useRef(new Animated.Value(0.8)).current;
  const backButtonGhostOpacity = useRef(new Animated.Value(0.05)).current; // Ghost state
  const backButtonHintOpacity = useRef(new Animated.Value(0)).current; // Hint text
  
  // Auth header/footer animations
  const authHeaderOpacity = useRef(new Animated.Value(0)).current;
  const authHeaderTranslate = useRef(new Animated.Value(-30)).current;
  const authFooterOpacity = useRef(new Animated.Value(0)).current;
  const authFooterTranslate = useRef(new Animated.Value(30)).current;
  
  // Logo animation - moves down to sphere center when Next is tapped
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  
  // Title animation for Next button
  const titleTranslateY = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(1)).current;
  const titleScale = useRef(new Animated.Value(1)).current;
  
  // Farsi typing animation
  const [typingText, setTypingText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const typingOpacity = useRef(new Animated.Value(0)).current;
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const fullText = 'انقلاب، از اینجا شروع میشه';

  useEffect(() => {
    forceResetKeyboard();
    return () => {
      forceResetKeyboard();
    };
  }, []);
  
  // Cursor blinking animation
  useEffect(() => {
    if (showCursor) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.start();
      
      return () => {
        blinkAnimation.stop();
      };
    }
  }, [showCursor]);
  
  // Ghost back button pulse effect
  useEffect(() => {
    // Create subtle pulse animation that runs every 5 seconds
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(backButtonGhostOpacity, {
          toValue: 0.15, // Slightly more visible
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(backButtonGhostOpacity, {
          toValue: 0.05, // Back to almost invisible
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    };
    
    // Start first pulse after 3 seconds
    const initialTimer = setTimeout(pulseAnimation, 3000);
    
    // Then pulse every 5 seconds
    const intervalTimer = setInterval(pulseAnimation, 5000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  useEffect(() => {
    initializeAudioSystem();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (keyboardStateRef.current === 'shown' || keyboardStateRef.current === 'showing') {
        handleInputBlur();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const startHideTimer = () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
        autoHideTimerRef.current = null;
      }
      const timer = setTimeout(() => {
        if (!parabolicOrbitRef.current?.isActive) {
          Animated.timing(controlsOpacity, {
            toValue: 0.1,
            duration: CONFIG.ANIMATION.CONTROLS_FADE_DURATION,
            useNativeDriver: true
          }).start();
        }
      }, CONFIG.ANIMATION.CONTROLS_HIDE_DELAY);
      (autoHideTimerRef.current as any) = timer;
    };

    startHideTimer();
    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
        autoHideTimerRef.current = null;
      }
    };
  }, [parabolicOrbit]);

  const initializeAudioSystem = async (): Promise<void> => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: 1,
        shouldDuckAndroid: false,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {}
  };

  const startAmbientAudio = async (): Promise<void> => {
    try {
      if (isAudioPlayingRef.current || !isAudioLoadedRef.current) {
        if (!isAudioLoadedRef.current) {
          await loadAudioFile();
        }
        if (!isAudioLoadedRef.current) {
          return;
        }
      }

      if (soundRef.current && isAudioLoadedRef.current) {
        const status = await soundRef.current.getStatusAsync();
        
        if (status.isLoaded) {
          await soundRef.current.setIsLoopingAsync(true);
          await soundRef.current.setVolumeAsync(CONFIG.AUDIO.VOLUME_LEVEL);
          await soundRef.current.playAsync();
          
          isAudioPlayingRef.current = true;
          startBeatDetection();
        }
      }
    } catch (error) {}
  };

  const stopAmbientAudio = async (): Promise<void> => {
    try {
      if (soundRef.current && isAudioPlayingRef.current) {
        stopBeatDetection();
        await soundRef.current.setVolumeAsync(CONFIG.AUDIO.FADE_OUT_VOLUME);
        setTimeout(async () => {
          try {
            if (soundRef.current) {
              await soundRef.current.stopAsync();
              await soundRef.current.setPositionAsync(0);
              isAudioPlayingRef.current = false;
            }
          } catch (error) {}
        }, CONFIG.AUDIO.FADE_DELAY);
      }
    } catch (error) {}
  };

  const startBeatDetection = () => {
    if (beatDetectionRef.current) {
      clearInterval(beatDetectionRef.current);
    }
    
    audioAnalysisRef.current.isAnalyzing = true;
    audioAnalysisRef.current.lastBeatTime = Date.now();
    (beatDetectionRef.current as any) = setInterval(() => {
      const now = Date.now();
      const timeSinceLastBeat = now - audioAnalysisRef.current.lastBeatTime;
      const analysis = audioAnalysisRef.current;
      if (timeSinceLastBeat >= analysis.beatInterval * 0.95) {
        triggerSmoothBeatSync();
        analysis.lastBeatTime = now;
      }
      updateSmoothBeatResponse();
    }, 16);
  };

  const triggerSmoothBeatSync = () => {
    const analysis = audioAnalysisRef.current;
    const now = Date.now();
    const beatPhase = (now / 1000) % 8;
    const intensity = 0.4 + Math.sin(beatPhase * Math.PI * 0.25) * 0.6;
    analysis.targetBeatStrength = intensity;
    analysis.quickPulse = intensity;
    analysis.mediumWave = Math.max(analysis.mediumWave, intensity * 0.8);
    analysis.slowResonance = Math.max(analysis.slowResonance, intensity * 0.4);
  };

  const updateSmoothBeatResponse = () => {
    const analysis = audioAnalysisRef.current;
    const deltaTime = 16 / 1000;
    if (analysis.currentBeatStrength < analysis.targetBeatStrength) {
      analysis.currentBeatStrength += analysis.beatBuildRate * deltaTime * 60;
    } else {
      analysis.currentBeatStrength -= analysis.beatDecayRate * deltaTime * 60;
    }
    analysis.currentBeatStrength = Math.max(0, Math.min(1, analysis.currentBeatStrength));
    analysis.quickPulse *= Math.pow(0.85, deltaTime);  // Slower decay for more responsive animation
    analysis.mediumWave *= Math.pow(0.92, deltaTime);  // Keep medium waves longer
    analysis.slowResonance *= Math.pow(0.95, deltaTime);
    analysis.targetBeatStrength *= Math.pow(0.5, deltaTime);
  };

  const stopBeatDetection = () => {
    if (beatDetectionRef.current) {
      clearInterval(beatDetectionRef.current);
      beatDetectionRef.current = null;
    }
    audioAnalysisRef.current.isAnalyzing = false;
    
    audioAnalysisRef.current.currentBeatStrength = 0;
    audioAnalysisRef.current.targetBeatStrength = 0;
    audioAnalysisRef.current.quickPulse = 0;
    audioAnalysisRef.current.mediumWave = 0;
    audioAnalysisRef.current.slowResonance = 0;
  };

  const loadAudioFile = async (): Promise<void> => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/audio/ambient-track.mp3'),
        {
          shouldPlay: false,
          isLooping: true,
          volume: CONFIG.AUDIO.VOLUME_LEVEL,
          isMuted: false,
        }
      );

      soundRef.current = sound;
      isAudioLoadedRef.current = true;
    } catch (error) {
      isAudioLoadedRef.current = false;
      soundRef.current = null;
    }
  };

  const showControlsTemporarily = (): void => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
    
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: CONFIG.ANIMATION.TRANSITION_DURATION,
      useNativeDriver: true
    }).start();

    const timer = setTimeout(() => {
      if (!parabolicOrbitRef.current?.isActive) {
        Animated.timing(controlsOpacity, {
          toValue: 0.1,
          duration: CONFIG.ANIMATION.CONTROLS_FADE_DURATION,
          useNativeDriver: true
        }).start();
      }
    }, 3000);
    
    (autoHideTimerRef.current as any) = timer;
  };

  const calculatePinchDistance = (touches: any[]): number => {
    if (!touches || touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    if (!touch1?.pageX || !touch1?.pageY || !touch2?.pageX || !touch2?.pageY) {
      return 0;
    }
    
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const normalizeAngle = (angle: number): number => {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  };

  const getShortestAngleDiff = (current: number, target: number): number => {
    const diff = normalizeAngle(target - current);
    return diff;
  };

  // Smooth interpolation system for momentum and smoothness
  const updateSmoothCameraInterpolation = (): void => {
    // FIX #1: Only run when no other systems are controlling camera
    if (cameraTransitionRef.current?.isTransitioning || parabolicOrbitRef.current?.isActive) {
      return; // Exit early - other systems have control priority
    }
    
    const smooth = UNIFIED_CAMERA_BOUNDS.smoothFactor;
    const gestureState = gestureStateRef.current;
    
    // Smooth radius interpolation
    const radiusDiff = targetRadiusRef.current - cameraRadiusRef.current;
    if (Math.abs(radiusDiff) > 0.01) {
      cameraRadiusRef.current += radiusDiff * smooth;
    }
    
    // Smooth angle interpolation with momentum
    if (!gestureState.isPanning && !gestureState.isZooming) {
      // FIX #3: Precision momentum handling with complete stop threshold
      const velocityThreshold = 0.0001;
      
      // Clean up tiny velocities to prevent perpetual drift
      if (Math.abs(gestureState.panVelocityX) < velocityThreshold) {
        gestureState.panVelocityX = 0;
      }
      if (Math.abs(gestureState.panVelocityY) < velocityThreshold) {
        gestureState.panVelocityY = 0;
      }
      if (Math.abs(gestureState.zoomVelocity) < velocityThreshold) {
        gestureState.zoomVelocity = 0;
      }
      
      // FIX #2: Clamp velocities to prevent runaway momentum
      gestureState.panVelocityX = Math.max(-UNIFIED_CAMERA_BOUNDS.maxVelocity, 
        Math.min(UNIFIED_CAMERA_BOUNDS.maxVelocity, gestureState.panVelocityX));
      gestureState.panVelocityY = Math.max(-UNIFIED_CAMERA_BOUNDS.maxVelocity, 
        Math.min(UNIFIED_CAMERA_BOUNDS.maxVelocity, gestureState.panVelocityY));
      gestureState.zoomVelocity = Math.max(-UNIFIED_CAMERA_BOUNDS.maxVelocity, 
        Math.min(UNIFIED_CAMERA_BOUNDS.maxVelocity, gestureState.zoomVelocity));
      
      // Apply momentum when not actively gesturing
      if (Math.abs(gestureState.panVelocityX) > 0 || Math.abs(gestureState.panVelocityY) > 0) {
        targetAngleXRef.current += gestureState.panVelocityX;
        targetAngleYRef.current += gestureState.panVelocityY;
        
        // Apply bounds to target angles
        targetAngleYRef.current = Math.max(
          -Math.PI / 2 + 0.1,
          Math.min(Math.PI / 2 - 0.1, targetAngleYRef.current)
        );
        
        // Decay momentum
        gestureState.panVelocityX *= gestureState.momentumDecay;
        gestureState.panVelocityY *= gestureState.momentumDecay;
      }
      
      // Apply zoom momentum
      if (Math.abs(gestureState.zoomVelocity) > 0) {
        targetRadiusRef.current += gestureState.zoomVelocity;
        targetRadiusRef.current = Math.max(
          UNIFIED_CAMERA_BOUNDS.minRadius,
          Math.min(UNIFIED_CAMERA_BOUNDS.maxRadius, targetRadiusRef.current)
        );
        gestureState.zoomVelocity *= gestureState.momentumDecay;
      }
    }
    
    // FIX #4: Smooth interpolation to targets with angle wrapping
    const angleDiffX = getShortestAngleDiff(lookAngleXRef.current, targetAngleXRef.current);
    const angleDiffY = getShortestAngleDiff(lookAngleYRef.current, targetAngleYRef.current);
    
    if (Math.abs(angleDiffX) > 0.001) {
      lookAngleXRef.current += angleDiffX * smooth;
      lookAngleXRef.current = normalizeAngle(lookAngleXRef.current);
    }
    if (Math.abs(angleDiffY) > 0.001) {
      lookAngleYRef.current += angleDiffY * smooth;
      lookAngleYRef.current = normalizeAngle(lookAngleYRef.current);
    }
  };

  const syncCameraTargets = (): void => {
    targetAngleXRef.current = lookAngleXRef.current;
    targetAngleYRef.current = lookAngleYRef.current;
    targetRadiusRef.current = cameraRadiusRef.current;
  };

  const triggerHapticFeedback = (type: 'light' | 'medium') => {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const patterns = {
          light: [0, 50],
          medium: [0, 100]
        };
        Vibration.vibrate(patterns[type]);
      }
    } catch (error) {}
  };

  const animateButtonPress = (pressed: boolean) => {
    const scaleValue = pressed ? 0.92 : 1;
    Animated.spring(buttonScale, {
      toValue: scaleValue,
      useNativeDriver: true,
      tension: 400,
      friction: 12,
    }).start();
  };

  // Next button press animation
  const animateNextButtonPress = (pressed: boolean) => {
    const scaleValue = pressed ? 0.92 : 1;
    
    Animated.spring(nextButtonScale, {
      toValue: scaleValue,
      useNativeDriver: true,
      tension: 400,
      friction: 12,
    }).start();
  };

  // Handle next button press
  const handleNextPress = (): void => {
    try {
      if (isPasswordValid) {
        triggerHapticFeedback('medium');
        
        // Move camera to final position
        startCameraTransition(
          11.03,  // Final X position
          -0.75,  // Final Y position  
          0,      // Final Z position
          11.5,   // Final zoom/radius
          2000    // 2 second transition
        );
        
        // Animate 3D scene upward
        Animated.timing(scenePositionAnim, {
          toValue: -175, // Move up by 175 pixels
          duration: 2000, // Same duration as camera transition
          useNativeDriver: true,
          easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        }).start();
        
        // Animate 2D logo down to sphere center
        // The 3D scene moves up by -175px, so the sphere center is effectively higher
        // Logo starts at top: 60px, needs to reach the adjusted sphere center
        const screenHeight = Dimensions.get('window').height;
        const logoSize = 100; // Logo size from component
        const sceneUpwardMovement = 175; // The scene moves up by this amount
        const sphereCenterY = (screenHeight / 2) - (logoSize / 2) - 60 - sceneUpwardMovement; // Account for scene movement
        
        // Animate logo down
        Animated.timing(logoTranslateY, {
          toValue: sphereCenterY,
          duration: 2800, // Slower animation (increased from 2000ms)
          useNativeDriver: true,
          easing: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 // Gentler easing
        }).start();
        
        // Animate title text to move with logo and disappear
        // Title needs to maintain same distance from logo (130px difference)
        const titleInitialTop = CONFIG.UI.TITLE_POSITION_TOP; // 190px
        const logoInitialTop = 60; // Logo's initial position
        const initialDistance = titleInitialTop - logoInitialTop; // 130px
        
        Animated.parallel([
          // Move title down maintaining same distance from logo
          Animated.timing(titleTranslateY, {
            toValue: sphereCenterY + initialDistance,
            duration: 2800,
            useNativeDriver: true,
            easing: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
          }),
          // Fade out with modern effect
          Animated.timing(titleOpacity, {
            toValue: 0,
            duration: 1000,
            delay: 300, // Start fading much sooner
            useNativeDriver: true,
            easing: (t: number) => t * t * t // Smooth cubic easing
          }),
          // Scale down slightly while fading
          Animated.timing(titleScale, {
            toValue: 0.8,
            duration: 1000,
            delay: 300,
            useNativeDriver: true,
            easing: (t: number) => t * t // Quadratic easing
          })
        ]).start();
        
        // Fade out controls with scale down effect
        Animated.parallel([
          Animated.timing(controlsRowOpacity, {
            toValue: 0,
            duration: 800,
            delay: 500,
            useNativeDriver: true,
            easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
          }),
          Animated.timing(controlsRowScale, {
            toValue: 0.9,
            duration: 800,
            delay: 500,
            useNativeDriver: true,
            easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
          })
        ]).start();
        
        // Show auth buttons after controls fade out
        setTimeout(() => {
          showAuthButtonsAnimation();
          startTypingAnimation(); // Start typing animation when auth buttons appear
        }, 1200);
        
        // Show back button as ghost
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(backButtonOpacity, {
              toValue: 1, // Container is visible but content will be ghosted
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(backButtonScale, {
              toValue: 1,
              tension: 200,
              friction: 10,
              useNativeDriver: true,
            })
          ]).start();
          
          // Show hint briefly
          Animated.sequence([
            Animated.timing(backButtonHintOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(backButtonHintOpacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]).start();
        }, 1500);
      } else {
        triggerHapticFeedback('light');
        // Invalid password - could add visual feedback here
      }
    } catch (error) {
      console.error('Error in handleNextPress:', error);
    }
  };
  
  // Handle back button press
  const handleBackPress = (): void => {
    triggerHapticFeedback('light');
    
    // Hide auth header/footer
    Animated.parallel([
      Animated.timing(authHeaderOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(authFooterOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Reset logo position to top
    Animated.timing(logoTranslateY, {
      toValue: 0,
      duration: 1000, // Slightly slower return animation
      useNativeDriver: true,
      easing: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 // Gentler easing
    }).start();
    
    // Hide auth buttons
    Animated.parallel([
      Animated.timing(authButtonsOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(authButtonsTranslate, {
        toValue: 50,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAuthButtons(false);
    });
    
    // Hide back button
    Animated.parallel([
      Animated.timing(backButtonOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backButtonScale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    // Show controls again
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(controlsRowOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        }),
        Animated.timing(controlsRowScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        })
      ]).start();
    }, 200);
    
    // Move 3D scene back down
    Animated.timing(scenePositionAnim, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
      easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }).start();
    
    // Reset camera position
    startCameraTransition(2.45, -0.97, -2.16, 10, 1500);
    
    // Reset button scales for next animation
    googleButtonScale.setValue(0.8);
    appleButtonScale.setValue(0.8);
    signInButtonScale.setValue(0.8);
    createAccountButtonScale.setValue(0.8);
    
    // Reset header/footer animations
    authHeaderTranslate.setValue(-30);
    authFooterTranslate.setValue(30);
  };
  
  // Start typing animation
  const startTypingAnimation = (): void => {
    // Fade in the typing container
    Animated.timing(typingOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Type each character
    let charIndex = 0;
    const firstWord = 'انقلاب،';
    const pauseAfterIndex = firstWord.length;
    
    const typeNextChar = () => {
      if (charIndex < fullText.length) {
        setTypingText(fullText.slice(0, charIndex + 1));
        charIndex++;
        
        // Check if we just typed the first word
        if (charIndex === pauseAfterIndex) {
          // Show cursor during pause
          setShowCursor(true);
          // Wait 4 seconds before continuing
          setTimeout(() => {
            setShowCursor(false);
            typeNextChar();
          }, 4000);
        } else {
          // Normal typing speed
          setTimeout(typeNextChar, 100);
        }
      } else {
        // Show cursor after typing completes
        setShowCursor(true);
      }
    };
    
    // Start typing after a small delay
    setTimeout(typeNextChar, 300);
  };
  
  // Animate auth buttons appearance
  const showAuthButtonsAnimation = (): void => {
    setShowAuthButtons(true);
    
    // Fade in and slide up animation for buttons
    Animated.parallel([
      Animated.timing(authButtonsOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(authButtonsTranslate, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      }),
    ]).start();
    
    // Animate header appearance
    Animated.parallel([
      Animated.timing(authHeaderOpacity, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(authHeaderTranslate, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      }),
    ]).start();
    
    // Animate footer appearance
    Animated.parallel([
      Animated.timing(authFooterOpacity, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(authFooterTranslate, {
        toValue: 0,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      }),
    ]).start();
    
    // Staggered scale animations for each button
    const staggerDelay = 100;
    
    Animated.timing(googleButtonScale, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    }).start();
    
    setTimeout(() => {
      Animated.timing(appleButtonScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      }).start();
    }, staggerDelay);
    
    setTimeout(() => {
      Animated.timing(signInButtonScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      }).start();
    }, staggerDelay * 2);
    
    setTimeout(() => {
      Animated.timing(createAccountButtonScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      }).start();
    }, staggerDelay * 3);
  };

  // Start camera transition to specific position
  const startCameraTransition = (x: number, y: number, z: number, radius: number, duration: number = 2000): void => {
    // Calculate angles from position
    const targetAngleX = Math.atan2(x, z);
    const distance = Math.sqrt(x * x + z * z);
    const targetAngleY = Math.atan2(y, distance);
    
    // Stop any existing transitions or orbits
    parabolicOrbitRef.current = null;
    setParabolicOrbit(false);
    
    // Set up the camera transition
    cameraTransitionRef.current = {
      isTransitioning: true,
      startTime: Date.now(),
      duration: duration,
      startRadius: cameraRadiusRef.current,
      startAngleX: lookAngleXRef.current,
      startAngleY: lookAngleYRef.current,
      targetRadius: radius,
      targetAngleX: targetAngleX,
      targetAngleY: targetAngleY,
      easeFunction: easeInOutCubic
    };
    
    // Hide keyboard if shown
    if (keyboardStateRef.current !== 'hidden') {
      handleInputBlur();
    }
  };

  // IRANVERSE title animation (smooth vertical movement)
  const animateTitlePosition = (moveUp: boolean) => {
    const targetValue = moveUp ? 1 : 0;
    
    Animated.timing(titlePosition, {
      toValue: targetValue,
      duration: 1200, // 1.2 second smooth transition
      useNativeDriver: true,
    }).start();
  };

  const toggleParabolicOrbit = async (): Promise<void> => {
    if (parabolicOrbitRef.current?.isActive) {
      // Stop parabolic orbit and audio
      triggerHapticFeedback('medium');
      parabolicOrbitRef.current = null;
      setParabolicOrbit(false);
      await stopAmbientAudio();
      
      // FIX #2: Sync targets when orbit ends to prevent camera jumps
      syncCameraTargets();
      
    } else {
      // Start parabolic orbit with background music
      triggerHapticFeedback('light');
      await startAmbientAudio();
      
      // FIX #3: Clear momentum when orbit starts
      const gestureState = gestureStateRef.current;
      gestureState.panVelocityX = 0;
      gestureState.panVelocityY = 0;
      gestureState.zoomVelocity = 0;
      gestureState.isPanning = false;
      gestureState.isZooming = false;
      
      // First transition to default camera smoothly
      const defaultRadius = 10;
      const defaultAngleX = Math.atan2(5, 0);
      const defaultAngleY = Math.acos(9.75 / defaultRadius);
      
      cameraTransitionRef.current = {
        isTransitioning: true,
        startTime: Date.now(),
        duration: 2000,
        startRadius: cameraRadiusRef.current,
        startAngleX: lookAngleXRef.current,
        startAngleY: lookAngleYRef.current,
        targetRadius: defaultRadius,
        targetAngleX: defaultAngleX,
        targetAngleY: defaultAngleY,
        easeFunction: easeInOutCubic
      };
      
      // Start parabolic orbit after transition
      setTimeout(() => {
        parabolicOrbitRef.current = {
          isActive: true,
          startTime: Date.now(),
          duration: 240000, // 4 minutes (240 seconds) of continuous path repetition
          initialRadius: defaultRadius,
          initialAngleX: defaultAngleX,
          initialAngleY: defaultAngleY
        };
        setParabolicOrbit(true);
      }, 2000);
    }
    showControlsTemporarily();
  };


  const handleInputBlur = (): void => {
    keyboardStateRef.current = 'hiding';
    setKeyboardState('hiding');
    
    Animated.timing(inputFocusAnim, {
      toValue: 0,
      duration: CONFIG.ANIMATION.INPUT_FOCUS_DURATION,
      useNativeDriver: false,
    }).start();
    
    Animated.parallel([
      Animated.timing(keyboardAnim, {
        toValue: 0,
        duration: CONFIG.ANIMATION.TRANSITION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(uiPositionAnim, {
        toValue: 0,
        duration: CONFIG.ANIMATION.TRANSITION_DURATION,
        useNativeDriver: true,
      })
    ]).start(() => {
      keyboardStateRef.current = 'hidden';
      setKeyboardState('hidden');
    });
  };

  const handleInputChange = (text: string): void => {
    const sanitizedText = text
      .replace(CONFIG.SECURITY.XSS_FILTER_REGEX, '')
      .substring(0, CONFIG.SECURITY.MAX_INPUT_LENGTH);
    
    setInputText(sanitizedText);
    
    const validPasswords = ['FFZ', 'فرج فاطمه زهرا'];
    setIsPasswordValid(validPasswords.includes(sanitizedText.trim()));
    
    showControlsTemporarily();
  };

  const handleKeyPress = (key: string): void => {
    if (key === 'BACKSPACE') {
      const newText = inputText.slice(0, -1);
      setInputText(newText);
      const validPasswords = ['FFZ', 'فرج فاطمه زهرا'];
      setIsPasswordValid(validPasswords.includes(newText.trim()));
    } else if (key === 'SPACE') {
      const newText = inputText + ' ';
      setInputText(newText);
      const validPasswords = ['FFZ', 'فرج فاطمه زهرا'];
      setIsPasswordValid(validPasswords.includes(newText.trim()));
    } else if (key === 'ENTER') {
      handleInputBlur();
    } else if (key === '123') {
      return;
    } else if (key === 'فا/EN') {
      setKeyboardLanguage(prev => prev === 'english' ? 'farsi' : 'english');
      return;
    } else {
      if (inputText.length < CONFIG.SECURITY.MAX_INPUT_LENGTH) {
        const newText = inputText + key;
        setInputText(newText);
        const validPasswords = ['FFZ', 'فرج فاطمه زهرا'];
        setIsPasswordValid(validPasswords.includes(newText.trim()));
      }
    }
    showControlsTemporarily();
  };

  const activateInput = (): void => {
    try {
      if (keyboardStateRef.current === 'showing' || keyboardStateRef.current === 'shown') {
        return;
      }
      
      keyboardStateRef.current = 'showing';
      setKeyboardState('showing');
      
      Animated.timing(keyboardAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        keyboardStateRef.current = 'shown';
        setKeyboardState('shown');
      });
      
      Animated.timing(uiPositionAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      Animated.timing(inputFocusAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      
      showControlsTemporarily();
    } catch (error) {}
  };

  const renderEnterpriseKeyboard = () => {
    if (keyboardState === 'hidden') return null;

    const keyRows = keyboardLanguage === 'english' ? [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
      ['123', 'SPACE', 'BACKSPACE', 'فا/EN', 'ENTER']
    ] : [
      ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'],
      ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک'],
      ['ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'پ', 'و', 'گ'],
      ['؟', '،', 'SPACE', 'BACKSPACE', 'فا/EN', 'ENTER']
    ];

    return (
      <Animated.View style={[
        styles.keyboardContainer,
        {
          transform: [{
            translateY: keyboardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [400, 0], // Slide up from bottom
            })
          }],
          opacity: keyboardAnim,
        }
      ]}>
        <View style={styles.keyboardHeader}>
          <Text style={styles.keyboardTitle}>
            IRANVERSE TERMINAL - {keyboardLanguage === 'english' ? 'ENGLISH' : 'فارسی'}
          </Text>
          <TouchableOpacity 
            onPress={handleInputBlur} 
            style={styles.keyboardCloseButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close keyboard"
          >
            <Text style={styles.keyboardCloseText}>×</Text>
          </TouchableOpacity>
        </View>
        
        {keyRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyboardRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.keyboardKey,
                  key === 'SPACE' && styles.spaceKey,
                  (key === 'BACKSPACE' || key === 'ENTER' || key === '123' || key === 'فا/EN' || key === '؟' || key === '،') && styles.functionKey
                ]}
                onPress={() => handleKeyPress(key)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Key ${key === 'BACKSPACE' ? 'Backspace' : 
                                          key === 'SPACE' ? 'Space' : 
                                          key === 'ENTER' ? 'Enter' : 
                                          key === 'فا/EN' ? 'Language Toggle' : 
                                          key === '؟' ? 'Persian Question Mark' :
                                          key === '،' ? 'Persian Comma' : key}`}
              >
                <Text style={[
                  styles.keyText,
                  (key === 'BACKSPACE' || key === 'ENTER' || key === '123' || key === 'فا/EN') && styles.functionKeyText
                ]}>
                  {key === 'BACKSPACE' ? '⌫' : 
                   key === 'SPACE' ? 'SPACE' : 
                   key === 'ENTER' ? '↵' : key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </Animated.View>
    );
  };

  const setupScene = async (gl: any): Promise<void> => {
    try {
      if (!gl) {
        throw new Error('GL context not available');
      }
      
      const renderer = new Renderer({ gl });
      (renderer as any).setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      (renderer as any).setClearColor(0x000000, 0); // Transparent background to show GradientBackground

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x000000, 20, 40);

      const camera = new THREE.PerspectiveCamera(
        80, 
        gl.drawingBufferWidth / gl.drawingBufferHeight, 
        0.1, 
        1000
      );
      camera.position.set(5, 9.75, 0);
    

      // Enhanced lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 7.5);
      scene.add(directionalLight);

      // Create realistic Mars shader (inspired by observablehq.com/@mourner/3d-planets-with-three-js)
      const createMarsShader = () => {
      const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      
      const fragmentShader = `
        uniform float uTime;
        uniform vec3 uSunPosition;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        // Enhanced noise functions for realistic Mars terrain
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x = a0.x * x0.x + h.x * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        
        // Fractal Brownian Motion for complex terrain
        float fbm(vec2 p, int octaves) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          for(int i = 0; i < 8; i++) {
            if(i >= octaves) break;
            value += amplitude * snoise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          return value;
        }
        
        // Crater simulation
        float crater(vec2 p, float radius) {
          float d = length(p);
          if(d > radius) return 0.0;
          float rim = smoothstep(radius * 0.8, radius, d);
          float depth = smoothstep(0.0, radius * 0.6, d);
          return rim * 0.3 - depth * 0.5;
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Convert to spherical coordinates for better Mars-like distribution
          float lat = (uv.y - 0.5) * 3.14159;
          float lon = (uv.x - 0.5) * 6.28318;
          
          // Multi-scale terrain generation
          vec2 p1 = vec2(lon, lat) * 2.0;
          vec2 p2 = vec2(lon, lat) * 8.0;
          vec2 p3 = vec2(lon, lat) * 32.0;
          
          // Large scale features (tectonic/geological)
          float continental = fbm(p1 * 0.3, 4) * 0.8;
          
          // Medium scale features (mountains, valleys, large craters)
          float mountains = fbm(p2 * 0.5, 6) * 0.4;
          
          // Small scale surface detail
          float surface = fbm(p3, 4) * 0.15;
          
          // Add some characteristic Mars craters
          float craters = 0.0;
          craters += crater(fract(p2 * 0.7) - 0.5, 0.3) * 0.4;
          craters += crater(fract(p2 * 1.3 + 0.3) - 0.5, 0.2) * 0.3;
          craters += crater(fract(p3 * 0.4 + 0.7) - 0.5, 0.15) * 0.2;
          
          // Combine all elevation data
          float elevation = continental + mountains + surface + craters;
          
          // Mars-accurate color palette (based on NASA imagery)
          vec3 marsBedrock = vec3(0.45, 0.25, 0.15);        // Dark basaltic rock
          vec3 marsRegolith = vec3(0.65, 0.35, 0.20);       // Iron oxide regolith
          vec3 marsDust = vec3(0.75, 0.45, 0.25);          // Fine dust particles
          vec3 marsHighlands = vec3(0.55, 0.40, 0.30);     // Ancient highlands
          vec3 marsPolar = vec3(0.85, 0.80, 0.75);         // Water/CO2 ice
          vec3 marsValles = vec3(0.35, 0.20, 0.12);        // Deep canyon floors
          
          // Color mixing based on elevation and latitude
          vec3 surfaceColor = marsRegolith;
          
          // Low areas (Valles Marineris-like canyons)
          surfaceColor = mix(marsValles, surfaceColor, smoothstep(-0.4, -0.1, elevation));
          
          // Bedrock exposure on steep terrain
          float steepness = length(vec2(
            dFdx(elevation * 100.0),
            dFdy(elevation * 100.0)
          ));
          surfaceColor = mix(surfaceColor, marsBedrock, smoothstep(0.5, 1.5, steepness));
          
          // Dust accumulation in flat areas
          surfaceColor = mix(surfaceColor, marsDust, smoothstep(0.1, 0.3, elevation) * (1.0 - steepness));
          
          // Highland regions
          surfaceColor = mix(surfaceColor, marsHighlands, smoothstep(0.3, 0.6, elevation));
          
          // Polar ice caps (more accurate placement)
          float latitude = abs(lat);
          float polarness = smoothstep(1.3, 1.57, latitude); // ~75-90 degrees
          float seasonalIce = smoothstep(1.1, 1.4, latitude) * sin(uTime * 0.1 + lat * 2.0) * 0.3 + 0.7;
          float iceMask = polarness * seasonalIce;
          surfaceColor = mix(surfaceColor, marsPolar, iceMask);
          
          // Physically-based lighting
          vec3 lightDir = normalize(uSunPosition - vWorldPosition);
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 normal = normalize(vNormal);
          
          // Lambertian diffuse
          float NdotL = max(dot(normal, lightDir), 0.0);
          
          // Atmospheric scattering (Mars has thin CO2 atmosphere)
          float atmosphereDensity = 0.01; // Mars atmosphere is ~1% of Earth's
          vec3 marsAtmosphereColor = vec3(0.8, 0.5, 0.3); // Dusty/reddish atmosphere
          
          // Rayleigh scattering approximation
          float cosTheta = dot(viewDir, lightDir);
          float scattering = 1.0 + cosTheta * cosTheta;
          
          // Enhanced atmospheric rim lighting
          float rimLight = 1.0 - max(dot(viewDir, normal), 0.0);
          rimLight = pow(rimLight, 2.0) * atmosphereDensity * 2.0; // More visible atmosphere
          
          // Final color composition
          vec3 finalColor = surfaceColor * (0.1 + 0.9 * NdotL); // Ambient + diffuse
          finalColor += marsAtmosphereColor * rimLight * scattering * 0.5; // Atmospheric glow
          
          // Subsurface scattering for dust (Mars characteristic)
          float dustScatter = pow(max(0.0, dot(-lightDir, normal)), 2.0) * 0.3;
          finalColor += marsDust * dustScatter;
          
          // Temperature-based color variation (cold = bluer, hot = redder)
          float temperature = NdotL * (1.0 - latitude * 0.3);
          finalColor.r *= 1.0 + temperature * 0.1;
          finalColor.b *= 1.0 - temperature * 0.05;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `;
      
      return new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0.0 },
          uSunPosition: { value: new THREE.Vector3(5, 10, 7.5) }
        }
      });
    };

    // Mars planet setup
    const sphereRadius = 1.1;
    const marsRadius = sphereRadius * 0.25;
    const marsGeometry = new THREE.SphereGeometry(marsRadius, 64, 32);
    const marsMaterial = createMarsShader();
    const mars = new THREE.Mesh(marsGeometry, marsMaterial);
    
    // Position Mars above the main sphere (updated position)
    mars.position.set(0, sphereRadius + marsRadius + 0.5, -2.5);
    scene.add(mars);

    // Square grid system - positioned under the main sphere
    const gridSize = 5.54; // Optimized size with reduced line density
    const gridDivisions = 38; // Reduced by ~15% from 45 to 38 for cleaner look
    const gridY = -sphereRadius - 0.5; // Position under the main sphere

    // Create custom grid geometry without diagonals
    const vertices: number[] = [];
    const indices: number[] = [];
    
    const step = gridSize / gridDivisions;
    const halfSize = gridSize / 2;
    
    // Create vertices
    for (let i = 0; i <= gridDivisions; i++) {
      for (let j = 0; j <= gridDivisions; j++) {
        const x = -halfSize + i * step;
        const z = -halfSize + j * step;
        vertices.push(x, 0, z);
      }
    }
    
    // Create horizontal lines
    for (let i = 0; i <= gridDivisions; i++) {
      for (let j = 0; j < gridDivisions; j++) {
        const current = i * (gridDivisions + 1) + j;
        const next = i * (gridDivisions + 1) + (j + 1);
        indices.push(current, next);
      }
    }
    
    // Create vertical lines
    for (let i = 0; i < gridDivisions; i++) {
      for (let j = 0; j <= gridDivisions; j++) {
        const current = i * (gridDivisions + 1) + j;
        const next = (i + 1) * (gridDivisions + 1) + j;
        indices.push(current, next);
      }
    }

    const gridGeometry = new THREE.BufferGeometry();
    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    gridGeometry.setIndex(indices);
    
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0.9,
      linewidth: 2.0,
      blending: THREE.AdditiveBlending,
    });

    const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
    
    // Position and orient the grid
    grid.position.set(0, gridY, 0);
    scene.add(grid);

    // 2D SIN wave system - emanating from beneath main sphere
    const waveCenter = { x: 0, z: 0 }; // Directly beneath main sphere
    const baseWaveSpeed = 2.5; // Base wave propagation speed - slightly faster
    const baseWaveAmplitude = 0.25; // Base wave height - more pronounced
    const waveFrequency = 3.0; // Wave density/spacing
    const positionAttr = gridGeometry.attributes.position;
    const baseY = Float32Array.from(positionAttr.array);

    // Quantum Field Fluctuations Particle System
    const quantumParticleCount = CONFIG.PERFORMANCE.MAX_PARTICLES;
    const quantumParticles: any[] = [];
    const quantumPositions = new Float32Array(quantumParticleCount * 3);
    const quantumColors = new Float32Array(quantumParticleCount * 3);
    const quantumSizes = new Float32Array(quantumParticleCount);
    const quantumOpacities = new Float32Array(quantumParticleCount);

    // Quantum field parameters
    const vacuumEnergyDensity = 0.15;
    const uncertaintyPrinciple = 0.15; // High uncertainty for dynamic behavior
    const quantumCoherence = 0.45; // Strong coherence for wave-like effects
    const fieldRadius = 2.0; // Expansive quantum field
    const entanglementProbability = 0.25; // Frequent quantum entanglement
    const quantumTunneling = 0.08; // Probability of quantum tunneling
    const superpositionStrength = 0.3; // Quantum superposition visibility

    // Initialize quantum particles with quantum properties
    for (let i = 0; i < quantumParticleCount; i++) {
      // Position particles inside spherical quantum field
      let x: number, y: number, z: number, radius: number;
      do {
        x = (Math.random() - 0.5) * 2;
        y = (Math.random() - 0.5) * 2;
        z = (Math.random() - 0.5) * 2;
        radius = Math.sqrt(x * x + y * y + z * z);
      } while (radius > 1); // Ensure particles are inside unit sphere
      
      // Scale to desired field radius
      const fieldScale = fieldRadius * 0.8;
      x *= fieldScale;
      y *= fieldScale;
      z *= fieldScale;
      
      const basePos = new THREE.Vector3(x, y, z);
      
      const particlePhase = Math.random() * Math.PI * 2;
      const particle = {
        basePosition: basePos.clone(),
        currentPosition: basePos.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.003 * Math.cos(particlePhase),
          (Math.random() - 0.5) * 0.003 * Math.sin(particlePhase),
          (Math.random() - 0.5) * 0.003
        ),
        phase: particlePhase,
        quantumState: Math.random() > 0.7 ? 1 : 0, // 30% real, 70% virtual
        existenceProbability: Math.random() * 0.8 + 0.2,
        entanglementPartner: Math.random() < entanglementProbability ? 
          Math.floor(Math.random() * quantumParticleCount) : null,
        lastInteraction: 0,
        energyLevel: Math.random() * 0.5 + 0.5,
        spinDirection: Math.random() > 0.5 ? 1 : -1,
        // Premium properties
        waveFunction: Math.random() * Math.PI,
        coherenceLength: 0.1 + Math.random() * 0.2,
        quantumMemory: [], // Store previous positions for trail effect
        correlationStrength: Math.random(),
        oscillationPhase: Math.random() * Math.PI * 2
      };
      
      quantumParticles.push(particle);
      
      // Set initial visual properties
      quantumPositions.set([x, y, z], i * 3);
      // Dynamic size based on energy and quantum state
      const baseSize = 0.02 + particle.energyLevel * 0.08;
      const quantumSize = particle.quantumState > 0.5 ? baseSize * 1.5 : baseSize;
      quantumSizes[i] = quantumSize + Math.sin(particle.phase) * 0.02;
      
      // Layered opacity for depth effect
      const coreOpacity = particle.existenceProbability * particle.quantumState;
      const glowOpacity = (1 - particle.quantumState) * 0.5;
      quantumOpacities[i] = (coreOpacity + glowOpacity) * 3.0;
      
      // Premium quantum color with energy-dependent spectrum
      const brightness = particle.energyLevel;
      const quantumPhase = particle.phase / (Math.PI * 2);
      // Subtle color shifts based on quantum state - from deep blue through white to gold
      const colorR = brightness * (0.7 + particle.quantumState * 0.3 + quantumPhase * 0.1);
      const colorG = brightness * (0.8 + particle.quantumState * 0.2);
      const colorB = brightness * (0.9 + (1 - particle.quantumState) * 0.2);
      const grayColor = new THREE.Color(colorR, colorG, colorB);
      quantumColors.set([grayColor.r, grayColor.g, grayColor.b], i * 3);
    }

    // Create quantum particle geometry with custom attributes
    const quantumGeometry = new THREE.BufferGeometry();
    quantumGeometry.setAttribute('position', new THREE.BufferAttribute(quantumPositions, 3));
    quantumGeometry.setAttribute('color', new THREE.BufferAttribute(quantumColors, 3));
    quantumGeometry.setAttribute('size', new THREE.BufferAttribute(quantumSizes, 1));
    quantumGeometry.setAttribute('opacity', new THREE.BufferAttribute(quantumOpacities, 1));

    // Advanced quantum field shader material
    const quantumVertexShader = `
      attribute float size;
      attribute float opacity;
      
      varying vec3 vColor;
      varying float vOpacity;
      varying vec2 vUv;
      
      void main() {
        vColor = color;
        vOpacity = opacity;
        vUv = uv;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const quantumFragmentShader = `
      uniform float time;
      uniform float vacuumFluctuation;
      
      varying vec3 vColor;
      varying float vOpacity;
      varying vec2 vUv;
      
      void main() {
        // Create quantum particle appearance with probability cloud
        vec2 center = gl_PointCoord - vec2(0.5);
        float distance = length(center);
        
        // Multi-layered quantum probability distribution
        float coreProbability = exp(-distance * distance * 8.0); // Sharp core
        float haloProbability = exp(-distance * distance * 2.0); // Soft halo
        float probability = coreProbability + haloProbability * 0.3;
        
        // Quantum field fluctuations with multiple frequencies
        float microFluctuation = sin(time * 50.0 + distance * 100.0) * 0.1;
        float macroFluctuation = sin(time * 5.0 - distance * 20.0) * 0.2;
        float uncertainty = 0.7 + microFluctuation + macroFluctuation;
        
        // Complex wave interference patterns
        float wave1 = sin(distance * 60.0 - time * 8.0) * 0.2;
        float wave2 = cos(distance * 30.0 + time * 4.0) * 0.15;
        float wave3 = sin(distance * 90.0 - time * 12.0 + vUv.x * 50.0) * 0.1;
        float waveFunction = 1.0 + wave1 + wave2 + wave3;
        
        // Quantum entanglement visual effect
        float entanglementGlow = sin(time * 3.0 + vUv.y * 20.0) * 0.2 + 0.8;
        
        // Premium layered transparency
        float finalAlpha = probability * uncertainty * waveFunction * entanglementGlow * vOpacity * 2.5;
        
        // Premium quantum glow with chromatic aberration effect
        float energyPulse = sin(time * 4.0 + vUv.x * 10.0) * 0.3 + 1.0;
        vec3 coreColor = vColor * 2.5 * energyPulse;
        
        // Add subtle chromatic shift for premium effect
        vec3 chromaticShift = vec3(
          sin(time * 2.0) * 0.05,
          cos(time * 2.5) * 0.05,
          sin(time * 3.0) * 0.05
        );
        vec3 glowColor = coreColor + chromaticShift;
        
        gl_FragColor = vec4(glowColor, finalAlpha);
      }
    `;

    const quantumMaterial = new THREE.ShaderMaterial({
      vertexShader: quantumVertexShader,
      fragmentShader: quantumFragmentShader,
      uniforms: {
        time: { value: 0.0 },
        vacuumFluctuation: { value: vacuumEnergyDensity }
      },
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });

    const quantumField = new THREE.Points(quantumGeometry, quantumMaterial);
    scene.add(quantumField);

    // Professional metallic cone
    const coneHeight = 10;
    const coneRadius = 0.15;
    const shinyConeMaterial = new THREE.MeshStandardMaterial({
      color: 0x474747,
      metalness: 0.8,
      roughness: 0.2,
    });

    const shinyCone = new THREE.Mesh(
      new THREE.ConeGeometry(coneRadius, coneHeight, 64),
      shinyConeMaterial
    );
    shinyCone.position.set(0, sphereRadius + coneHeight / 2, 0);
    shinyCone.rotation.x = Math.PI;
    scene.add(shinyCone);

    // Dynamic lighting
    const coneLight = new THREE.PointLight(0xffffff, 100, 100);
    coneLight.position.set(2, 6, 5);
    scene.add(coneLight);

    const clock = new THREE.Clock();

    // ========================================================================================
    // IRANVERSE LOGO BILLBOARD - Always faces camera
    // ========================================================================================
    
    // ========================================================================================
    // IRANVERSE PARTICLE LOGO SYSTEM - Revolutionary 3D Effect
    // ========================================================================================
    
    // Define logo shape points (simplified iN logo representation)
    const createLogoPoints = () => {
      const points = [];
      
      // Scale factor for larger logo
      const scale = 2.0;
      
      // Letter "i" shape points
      // Vertical line
      for (let y = -0.5; y <= 0.3; y += 0.05) {
        points.push(new THREE.Vector3(-0.4 * scale, y * scale, 0));
      }
      // Dot on i
      const dotRadius = 0.08 * scale;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        points.push(new THREE.Vector3(
          -0.4 * scale + Math.cos(angle) * dotRadius,
          0.5 * scale + Math.sin(angle) * dotRadius,
          0
        ));
      }
      
      // Letter "N" shape points
      // Left vertical
      for (let y = -0.5; y <= 0.5; y += 0.05) {
        points.push(new THREE.Vector3(0, y * scale, 0));
      }
      // Diagonal
      for (let t = 0; t <= 1; t += 0.05) {
        points.push(new THREE.Vector3(
          t * 0.4 * scale,
          (0.5 - t) * scale,
          0
        ));
      }
      // Right vertical
      for (let y = -0.5; y <= 0.5; y += 0.05) {
        points.push(new THREE.Vector3(0.4 * scale, y * scale, 0));
      }
      
      return points;
    };
    
    // Create particle system for logo
    const logoPoints = createLogoPoints();
    const particleCount = logoPoints.length * 5; // More particles for visibility
    
    // Particle attributes
    const logoParticlePositions = new Float32Array(particleCount * 3);
    const logoParticleTargets = new Float32Array(particleCount * 3);
    const logoParticleColors = new Float32Array(particleCount * 3);
    const logoParticleSizes = new Float32Array(particleCount);
    const logoParticleRandoms = new Float32Array(particleCount);
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const pointIndex = i % logoPoints.length;
      const targetPoint = logoPoints[pointIndex];
      
      // Random starting positions (scattered in sphere)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = Math.random() * 0.8;
      
      logoParticlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      logoParticlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      logoParticlePositions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Target positions (logo shape)
      logoParticleTargets[i * 3] = targetPoint.x;
      logoParticleTargets[i * 3 + 1] = targetPoint.y;
      logoParticleTargets[i * 3 + 2] = targetPoint.z;
      
      // Orange color with variation
      const colorVariation = 0.8 + Math.random() * 0.2;
      logoParticleColors[i * 3] = 0.925 * colorVariation; // R
      logoParticleColors[i * 3 + 1] = 0.376 * colorVariation; // G
      logoParticleColors[i * 3 + 2] = 0.165 * colorVariation; // B
      
      // Particle sizes - MUCH LARGER
      logoParticleSizes[i] = 0.1 + Math.random() * 0.1; // 5x larger
      
      // Random values for animation
      logoParticleRandoms[i] = Math.random();
    }
    
    // Create geometry and material
    const logoParticleGeometry = new THREE.BufferGeometry();
    logoParticleGeometry.setAttribute('position', new THREE.BufferAttribute(logoParticlePositions, 3));
    logoParticleGeometry.setAttribute('targetPosition', new THREE.BufferAttribute(logoParticleTargets, 3));
    logoParticleGeometry.setAttribute('color', new THREE.BufferAttribute(logoParticleColors, 3));
    logoParticleGeometry.setAttribute('size', new THREE.BufferAttribute(logoParticleSizes, 1));
    logoParticleGeometry.setAttribute('random', new THREE.BufferAttribute(logoParticleRandoms, 1));
    
    // Particle shader material
    const logoParticleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        convergence: { value: 0 }, // 0 = scattered, 1 = formed logo
        glowIntensity: { value: 1.0 }
      },
      vertexShader: `
        attribute vec3 targetPosition;
        attribute float size;
        attribute float random;
        
        uniform float time;
        uniform float convergence;
        
        varying vec3 vColor;
        varying float vRandom;
        
        void main() {
          vColor = color;
          vRandom = random;
          
          // Interpolate between random position and target
          vec3 pos = mix(position, targetPosition, convergence);
          
          // Add floating animation when converged
          float floatOffset = sin(time * 2.0 + random * 6.28) * 0.02 * convergence;
          pos.y += floatOffset;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (600.0 / -mvPosition.z); // Double the size
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float glowIntensity;
        
        varying vec3 vColor;
        varying float vRandom;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float distance = length(center);
          
          // Soft particle with glow
          float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
          alpha *= glowIntensity * (0.8 + 0.2 * vRandom);
          
          // Add core brightness
          float core = 1.0 - smoothstep(0.0, 0.2, distance);
          vec3 finalColor = vColor + vec3(core * 0.5);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });
    
    // Create particle system
    const logoParticleSystem = new THREE.Points(logoParticleGeometry, logoParticleMaterial);
    logoParticleSystem.position.set(0, 0, 0);
    const logoAnimationState = {
      convergence: 0,
      targetConvergence: 0,
      animationSpeed: 0.02
    };
    
    const logoRef = { 
      particleSystem: logoParticleSystem,
      material: logoParticleMaterial,
      animationState: logoAnimationState
    };
    
    logoAnimationRef.current = logoRef;
    
    setTimeout(() => {
      if (logoRef.animationState) {
        logoRef.animationState.targetConvergence = 1;
      }
    }, 2000);
    
    const logoPlaneGeometry = new THREE.PlaneGeometry(2.5, 2.5);
    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load(
      Asset.fromModule(require('../../assets/logo/iranverse-logo-black.png')).uri
    );
    const logo2DMaterial = new THREE.MeshBasicMaterial({
      map: logoTexture,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
      alphaTest: 0.1
    });
    
    const logo2DMesh = new THREE.Mesh(logoPlaneGeometry, logo2DMaterial);
    logo2DMesh.position.set(0, 0, 0);
    scene.add(logo2DMesh);
    const logo2DState = {
      opacity: 0,
      targetOpacity: 0,
      animationPhase: 'hidden' as 'hidden' | 'fadingIn' | 'visible' | 'fadingOut',
      phaseStartTime: 0
    };
    
    setTimeout(() => {
      logo2DState.animationPhase = 'fadingIn';
      logo2DState.targetOpacity = 1;
      logo2DState.phaseStartTime = Date.now();
    }, 3000);
    const logo2DRef = {
      mesh: logo2DMesh,
      material: logo2DMaterial,
      state: logo2DState
    };
    
    const sceneData = {
      scene,
      camera,
      renderer,
      quantumField,
      mars,
      grid,
      quantumParticles,
      logoRef,
      logo2DRef
    };
    
    sceneDataRef.current = sceneData;

    await loadAudioFile();

    const animate = (): void => {
      try {
        if (!sceneDataRef.current || !gl) {
          return;
        }
        
        const elapsed = clock.getElapsedTime();
        
        // Safe uniform updates
        if (marsMaterial?.uniforms?.uTime) {
          marsMaterial.uniforms.uTime.value = elapsed;
        }
        if (marsMaterial?.uniforms?.uSunPosition) {
          marsMaterial.uniforms.uSunPosition.value.set(5, 10, 7.5);
        }

        if (mars) {
          mars.rotation.y = elapsed * 0.05;
        }

          if (cameraTransitionRef.current?.isTransitioning) {
        const now = Date.now();
        const elapsedTime = now - cameraTransitionRef.current.startTime;
        const progress = Math.min(elapsedTime / cameraTransitionRef.current.duration, 1.0);
        
        const easedProgress = cameraTransitionRef.current.easeFunction(progress);
        const radiusDelta = cameraTransitionRef.current.targetRadius - cameraTransitionRef.current.startRadius;
        const angleXDelta = cameraTransitionRef.current.targetAngleX - cameraTransitionRef.current.startAngleX;
        const angleYDelta = cameraTransitionRef.current.targetAngleY - cameraTransitionRef.current.startAngleY;
        
        let adjustedAngleXDelta = angleXDelta;
        if (Math.abs(angleXDelta) > Math.PI) {
          adjustedAngleXDelta = angleXDelta > 0 
            ? angleXDelta - 2 * Math.PI 
            : angleXDelta + 2 * Math.PI;
        }
        cameraRadiusRef.current = cameraTransitionRef.current.startRadius + radiusDelta * easedProgress;
        lookAngleXRef.current = cameraTransitionRef.current.startAngleX + adjustedAngleXDelta * easedProgress;
        lookAngleYRef.current = cameraTransitionRef.current.startAngleY + angleYDelta * easedProgress;
        
        if (progress >= 1.0) {
          cameraTransitionRef.current = null;
          syncCameraTargets();
        }
      }
      
      if (parabolicOrbitRef.current?.isActive && !cameraTransitionRef.current?.isTransitioning) {
        const now = Date.now();
        const elapsed = now - parabolicOrbitRef.current.startTime;
        const progress = elapsed / parabolicOrbitRef.current.duration;
        
        if (progress >= 1.0) {
          parabolicOrbitRef.current = null;
          setParabolicOrbit(false);
          stopAmbientAudio();
          syncCameraTargets();
        } else {
          const segmentCount = 9;
          const continuousSegmentProgress = progress * segmentCount;
          const currentSegmentIndex = Math.floor(continuousSegmentProgress) % segmentCount;
          const segmentProgress = continuousSegmentProgress % 1;
          
          const transitionZone = 0.1;
          
          let targetX: number, targetZ: number, targetRadius: number;
          
          // Current segment calculation
          const calculateSegmentPosition = (segIndex: number, segProg: number) => {
            const normalizedSegIndex = segIndex % segmentCount;
            
            if (normalizedSegIndex === 0) {
              const centerX = 1.5;
              const centerZ = 2;
              const radius = 4;
              const startAngle = -0.3;
              const endAngle = Math.PI * 0.7;
              const angle = startAngle + (endAngle - startAngle) * segProg;
              return {
                x: centerX + radius * Math.cos(angle),
                z: centerZ + radius * Math.sin(angle),
                r: 8 + Math.sin(angle * 2) * 1.5
              };
              
            } else if (normalizedSegIndex === 1) {
              // YELLOW: Circle segment (bottom arc around main sphere)
              const centerX = 0;
              const centerZ = 0;
              const radius = 3;
              const startAngle = Math.PI * 0.4;
              const endAngle = Math.PI * 1.1;
              
              const angle = startAngle + (endAngle - startAngle) * segProg;
              return {
                x: centerX + radius * Math.cos(angle),
                z: centerZ + radius * Math.sin(angle),
                r: 6 + Math.sin(angle * 2) * 1.5
              };
              
            } else if (normalizedSegIndex === 2) {
              // BLUE #1: Ellipse segment (toward Mars area)
              const centerX = -1.5;
              const centerZ = -1.8;
              const aRadius = 3.5; // Semi-major axis
              const bRadius = 2.2; // Semi-minor axis
              const startAngle = Math.PI * 1.1;
              const endAngle = Math.PI * 1.8;
              
              const angle = startAngle + (endAngle - startAngle) * segProg;
              return {
                x: centerX + aRadius * Math.cos(angle),
                z: centerZ + bRadius * Math.sin(angle),
                r: 7 + Math.sin(angle * 1.5) * 2
              };
              
            } else if (normalizedSegIndex === 3) {
              // BLUE #2: Circle segment (around Mars area)
              const centerX = 0;
              const centerZ = -2.5; // Mars Z position
              const radius = 2.5;
              const startAngle = Math.PI * 1.8;
              const endAngle = Math.PI * 2.4;
              
              const angle = startAngle + (endAngle - startAngle) * segProg;
              return {
                x: centerX + radius * Math.cos(angle),
                z: centerZ + radius * Math.sin(angle),
                r: 5 + Math.sin(angle * 3) * 1.5
              };
              
            } else if (normalizedSegIndex === 4) {
              // GREEN #2: Circle segment (right side, moving away from Mars)
              const centerX = 2.5;
              const centerZ = -0.5;
              const radius = 3.5;
              const startAngle = Math.PI * 2.4;
              const endAngle = Math.PI * 3.1;
              
              const angle = startAngle + (endAngle - startAngle) * segProg;
              return {
                x: centerX + radius * Math.cos(angle),
                z: centerZ + radius * Math.sin(angle),
                r: 8 + Math.cos(angle * 2) * 1.5
              };
              
            } else if (normalizedSegIndex === 5) {
              // PURPLE: Circle segment (large outer arc on right side)
              const centerX = 0;
              const centerZ = 0;
              const radius = 7;
              const startAngle = Math.PI * 3.1;
              const endAngle = Math.PI * 3.9;
              
              const angle = startAngle + (endAngle - startAngle) * segProg;
              return {
                x: centerX + radius * Math.cos(angle),
                z: centerZ + radius * Math.sin(angle),
                r: 12 + Math.sin(angle * 1.5) * 2
              };
              
            } else if (normalizedSegIndex === 6) {
              // RED #1: Ellipse segment (complex curve in lower area)
              const centerX = 2;
              const centerZ = 2;
              const aRadius = 3; // Semi-major axis
              const bRadius = 4.5; // Semi-minor axis  
              const startAngle = Math.PI * 3.9;
              const endAngle = Math.PI * 4.7;
              
              const angle = startAngle + (endAngle - startAngle) * segProg;
              return {
                x: centerX + aRadius * Math.cos(angle),
                z: centerZ + bRadius * Math.sin(angle),
                r: 6 + Math.sin(angle * 2) * 2
              };
              
            } else if (normalizedSegIndex === 7) {
              // RED #2: Circle segment (around main sphere area)
              const centerX = 0;
              const centerZ = 0;
              const radius = 4;
              const startAngle = Math.PI * 4.7;
              const endAngle = Math.PI * 5.4;
              
              const angle = startAngle + (endAngle - startAngle) * segProg;
              return {
                x: centerX + radius * Math.cos(angle),
                z: centerZ + radius * Math.sin(angle),
                r: 7 + Math.cos(angle * 2) * 1.8
              };
              
            } else {
              // PINK: Ellipse segment (final curve back toward camera area)
              const centerX = 3.5;
              const centerZ = 1;
              const aRadius = 4; // Semi-major axis
              const bRadius = 2.5; // Semi-minor axis
              const startAngle = Math.PI * 5.4;
              const endAngle = Math.PI * 6.2;
              
              const angle = startAngle + (endAngle - startAngle) * segProg;
              return {
                x: centerX + aRadius * Math.cos(angle),
                z: centerZ + bRadius * Math.sin(angle),
                r: 9 + Math.sin(angle * 1.5) * 1.5
              };
            }
          };
          
          // Calculate current and next segment positions for smooth blending
          const currentPos = calculateSegmentPosition(currentSegmentIndex, segmentProgress);
          const nextPos = calculateSegmentPosition(currentSegmentIndex + 1, 0);
          
          // Ultra-smooth blending between segments
          if (segmentProgress > (1 - transitionZone)) {
            const blendAmount = (segmentProgress - (1 - transitionZone)) / transitionZone;
            targetX = currentPos.x * (1 - blendAmount) + nextPos.x * blendAmount;
            targetZ = currentPos.z * (1 - blendAmount) + nextPos.z * blendAmount;
            targetRadius = currentPos.r * (1 - blendAmount) + nextPos.r * blendAmount;
          } else {
            targetX = currentPos.x;
            targetZ = currentPos.z;
            targetRadius = currentPos.r;
          }
          
          const horizontalAngle = Math.atan2(targetX, targetZ);
          
          // Add subtle vertical motion for dynamic camera work
          const verticalOffset = Math.sin(progress * Math.PI * 6) * 0.15; // Gentle breathing motion
          const verticalAngle = parabolicOrbitRef.current.initialAngleY + verticalOffset;
          
          // ULTRA-SMOOTH interpolation (98% smoothing for seamless motion)
          const ultraSmoothFactor = 0.98;
          const currentHorizontal = lookAngleXRef.current;
          const currentVertical = lookAngleYRef.current;
          const currentRadius = cameraRadiusRef.current;
          
          // Apply calculated camera position with ultra-smooth interpolation
          lookAngleXRef.current = currentHorizontal * ultraSmoothFactor + horizontalAngle * (1 - ultraSmoothFactor);
          lookAngleYRef.current = Math.max(
            -Math.PI / 2 + 0.1, 
            Math.min(Math.PI / 2 - 0.1, 
              currentVertical * ultraSmoothFactor + verticalAngle * (1 - ultraSmoothFactor)
            )
          );
          
          // FIX #1: Use unified bounds in orbit system
          const finalRadius = Math.max(UNIFIED_CAMERA_BOUNDS.minRadius, 
            Math.min(UNIFIED_CAMERA_BOUNDS.maxRadius, targetRadius));
          cameraRadiusRef.current = currentRadius * ultraSmoothFactor + finalRadius * (1 - ultraSmoothFactor);
        }
      }

      // Update smooth camera interpolation and momentum
      try {
        updateSmoothCameraInterpolation();
      } catch (error) {
        console.error('Error updating camera interpolation:', error);
      }

      // Get beat analysis data first
      const analysis = audioAnalysisRef.current;
      const isAnalyzing = analysis.isAnalyzing;
      const smoothBeatStrength = analysis.currentBeatStrength;
      const quickResponse = analysis.quickPulse;
      const mediumResponse = analysis.mediumWave;
      const slowResponse = analysis.slowResonance;

      // 2D SIN wave animation - beat-responsive
      // Update every frame for smooth animation
      {
        // Apply beat modulation to wave parameters
        const waveSpeed = baseWaveSpeed * (1 + mediumResponse * 0.3); // Medium response for smooth flow
        const waveAmplitude = baseWaveAmplitude * (1 + quickResponse * 0.5 + slowResponse * 0.2); // Multi-layer response
        
        for (let i = 0; i < positionAttr.count; i++) {
          const x = positionAttr.getX(i);
          const z = positionAttr.getZ(i);
          const y0 = baseY[i * 3 + 1];
          
          const dx = x - waveCenter.x;
          const dz = z - waveCenter.z;
          const distanceFromCenter = Math.sqrt(dx * dx + dz * dz);
          
          const wavePhase = elapsed * waveSpeed - distanceFromCenter * waveFrequency;
          const waveHeight = Math.sin(wavePhase) * waveAmplitude;
          const fadeDistance = Math.exp(-distanceFromCenter * 0.2);
          const finalWaveHeight = waveHeight * fadeDistance;
          
          positionAttr.setY(i, y0 + finalWaveHeight);
        }
        positionAttr.needsUpdate = true;
      }

      const quantumTime = elapsed * 0.5;
      
      const beatMultiplier = 1 + (
        quickResponse * 1.5 +
        mediumResponse * 0.8 +
        slowResponse * 0.3
      );

      if (quantumMaterial.uniforms.time) {
        quantumMaterial.uniforms.time.value = quantumTime;
      }
      if (quantumMaterial.uniforms.vacuumFluctuation) {
        const baseFluctuation = vacuumEnergyDensity * (1.0 + Math.sin(elapsed * 0.8) * 0.3);
        quantumMaterial.uniforms.vacuumFluctuation.value = baseFluctuation * beatMultiplier;
      }

      const updateParticles = elapsed % 0.016 < 0.008;
      
      if (updateParticles) {
        for (let i = 0; i < quantumParticleCount; i++) {
          const particle = quantumParticles[i];
          
          const uncertaintyFactor = Math.sin(elapsed * 2.0 + particle.phase) * uncertaintyPrinciple;
          let stateTransitionProbability = 0.002 + Math.abs(uncertaintyFactor) * 0.005;
          
          if (isAnalyzing && smoothBeatStrength > 0.1) {
            stateTransitionProbability *= (1 + smoothBeatStrength * 2);
          }
          
          if (Math.random() < stateTransitionProbability) {
          particle.quantumState = 1 - particle.quantumState;
          particle.lastInteraction = elapsed;
          
          const energyBoost = isAnalyzing ? smoothBeatStrength * 0.4 : 0;
          particle.energyLevel = Math.random() * 0.5 + 0.5 + energyBoost;
          const brightness = Math.min(1.0, particle.energyLevel);
          const grayColor = new THREE.Color(brightness * 0.8, brightness * 0.8, brightness * 0.8);
          quantumColors[i * 3] = grayColor.r;
          quantumColors[i * 3 + 1] = grayColor.g;
            quantumColors[i * 3 + 2] = grayColor.b;
          }
          
          let vacuumFluctuation = Math.sin(elapsed * 1.5 + particle.phase * 3) * 0.4 + 0.6;
          
          if (isAnalyzing) {
            vacuumFluctuation *= (1 + mediumResponse * 0.6);
          }
          const coherenceEffect = Math.sin(elapsed * quantumCoherence + particle.phase) * 0.2;
          particle.existenceProbability = Math.max(0.1, 
            Math.min(1.0, particle.existenceProbability + coherenceEffect * 0.01));
          
          if (particle.entanglementPartner !== null && particle.entanglementPartner < quantumParticleCount) {
          const partner = quantumParticles[particle.entanglementPartner];
          
          if (Math.abs(particle.quantumState - partner.quantumState) > 0.5) {
            let entanglementStrength = 0.02;
            
            if (isAnalyzing) {
              entanglementStrength *= (1 + quickResponse * 1.2);
            }
            
            const distance = particle.currentPosition.distanceTo(partner.currentPosition);
            const influence = entanglementStrength / (1 + distance * 0.1);
            
            if (Math.random() < influence) {
              partner.quantumState = particle.quantumState;
                partner.spinDirection = -particle.spinDirection;
              }
            }
          }
          
          let tunnelingProbability = 0.0008;
          if (isAnalyzing && quickResponse > 0.2) {
            tunnelingProbability *= (1 + quickResponse * 2);
          }
          
          if (Math.random() < tunnelingProbability) {
          const tunnelingIntensity = isAnalyzing ? (1 + quickResponse * 0.5) : 1;
          const tunnelDistance = (0.5 + Math.random() * 1.0) * tunnelingIntensity;
          const tunnelDirection = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ).normalize();
          
            particle.currentPosition.add(tunnelDirection.multiplyScalar(tunnelDistance));
            
            // Quantum tunneling burst effect
            particle.energyLevel = Math.min(1.0, particle.energyLevel + 0.3);
            particle.existenceProbability = 1.0; // Full visibility during tunneling
            quantumSizes[i] *= 1.5; // Temporary size boost
          }
          
          let oscillationFrequency = 0.1 + particle.energyLevel * 0.3;
          if (isAnalyzing) {
            oscillationFrequency *= (1 + mediumResponse * 0.4);
          }
          
          // Complex 3D Lissajous quantum oscillation pattern
          const freq1 = oscillationFrequency;
          const freq2 = oscillationFrequency * 1.618; // Golden ratio frequency
          const freq3 = oscillationFrequency * 2.236; // Square root of 5
          
          const quantumOscillation = new THREE.Vector3(
            Math.sin(elapsed * freq1 + particle.phase) * 0.12 +
            Math.sin(elapsed * freq2 * 0.7) * 0.06,
            Math.cos(elapsed * freq2 + particle.phase * 1.2) * 0.12 +
            Math.cos(elapsed * freq3 * 0.5) * 0.06,
            Math.sin(elapsed * freq3 + particle.phase * 0.8) * 0.12 +
            Math.sin(elapsed * freq1 * 1.3) * 0.06
          );
          
          // Premium zero-point energy with quantum foam effect
          const quantumFoam = Math.random() * 0.001;
          let zeroPointIntensity = vacuumEnergyDensity * 0.025 + quantumFoam;
          if (isAnalyzing) {
            zeroPointIntensity *= (1 + slowResponse * 2.0 + quickResponse * 0.5);
          }
          
          const zeroPointMotion = new THREE.Vector3(
          (Math.random() - 0.5) * zeroPointIntensity,
          (Math.random() - 0.5) * zeroPointIntensity,
          (Math.random() - 0.5) * zeroPointIntensity
          );
          
          particle.velocity.add(zeroPointMotion);
          particle.velocity.multiplyScalar(0.98);
          
          // Quantum superposition - particle exists in multiple states
          const superposition1 = particle.basePosition.clone()
            .add(quantumOscillation.clone().multiplyScalar(0.7));
          const superposition2 = particle.basePosition.clone()
            .add(quantumOscillation.clone().multiplyScalar(-0.3))
            .add(particle.velocity.clone().multiplyScalar(1.2));
          
          // Blend between superposition states
          const superpositionBlend = (Math.sin(elapsed * 2.0 + particle.phase) + 1) * 0.5;
          particle.currentPosition.lerpVectors(
            superposition1,
            superposition2,
            superpositionBlend * superpositionStrength
          );
          particle.currentPosition.add(particle.velocity.clone().multiplyScalar(0.3));
          const distanceFromCenter = particle.currentPosition.length();
          const maxRadius = fieldRadius * 0.9;
          if (distanceFromCenter > maxRadius) {
            particle.currentPosition.normalize().multiplyScalar(maxRadius);
            particle.velocity.multiplyScalar(-0.3);
          }
          
          quantumPositions[i * 3] = particle.currentPosition.x;
        quantumPositions[i * 3 + 1] = particle.currentPosition.y;
          quantumPositions[i * 3 + 2] = particle.currentPosition.z;
          
          let stateOpacity = particle.quantumState * 0.8 + 0.4;
          let sizeMultiplier = 1.0;
          
          if (isAnalyzing) {
            stateOpacity *= (1 + smoothBeatStrength * 0.4);
            sizeMultiplier *= (1 + quickResponse * 0.3);
          }
          
          // Premium multi-layered opacity with quantum state mixing
          const baseOpacity = particle.existenceProbability * stateOpacity;
          const quantumMixing = Math.abs(Math.sin(elapsed * 3.0 + particle.phase * 2.0)) * 0.3;
          const depthFade = 1.0 - (particle.currentPosition.z + fieldRadius) / (fieldRadius * 2) * 0.3;
          quantumOpacities[i] = (baseOpacity + quantumMixing) * vacuumFluctuation * depthFade * 2.2;
          
          // Dynamic size with quantum breathing effect
          const breathingEffect = Math.sin(elapsed * 2.0 + particle.phase) * 0.15 + 1.0;
          const sizeFluctuation = (1.0 + uncertaintyFactor * 0.6) * breathingEffect;
          const energySize = 0.03 + particle.energyLevel * 0.07;
          quantumSizes[i] = energySize * sizeFluctuation * sizeMultiplier * (particle.quantumState * 0.5 + 0.5);
        }

        // Update geometry attributes only when particles are updated
        quantumGeometry.attributes.position.needsUpdate = true;
        quantumGeometry.attributes.color.needsUpdate = true;
        quantumGeometry.attributes.size.needsUpdate = true;
        quantumGeometry.attributes.opacity.needsUpdate = true;
      }

      // Oscillate cone light
      const lightY = sphereRadius + Math.abs(Math.sin(elapsed * 0.33)) * coneHeight;
      coneLight.position.y = lightY;

      // Professional camera control system
      const phi = Math.PI / 2 - lookAngleYRef.current;
      const theta = lookAngleXRef.current;
      const currentRadius = cameraRadiusRef.current;
      

      camera.position.set(
        currentRadius * Math.sin(phi) * Math.sin(theta),
        currentRadius * Math.cos(phi),
        currentRadius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      // Update particle logo animation
      if (logoRef.particleSystem && logoRef.material && logoRef.animationState) {
        // Update time uniform
        logoRef.material.uniforms.time.value = elapsed;
        
        // Smooth convergence animation
        const { animationState } = logoRef;
        if (animationState.convergence !== animationState.targetConvergence) {
          const delta = animationState.targetConvergence - animationState.convergence;
          animationState.convergence += delta * animationState.animationSpeed;
          
          // Update shader uniform
          logoRef.material.uniforms.convergence.value = animationState.convergence;
        }
        
        // Rotate the entire particle system slowly
        logoRef.particleSystem.rotation.y = elapsed * 0.1;
      }
      
      // Update 2D logo animation
      if (logo2DRef.mesh && logo2DRef.material && logo2DRef.state) {
        const now = Date.now();
        const state = logo2DRef.state;
        
        // Make logo always face camera
        logo2DRef.mesh.lookAt(camera.position);
        
        // Handle animation phases
        switch (state.animationPhase) {
          case 'fadingIn':
            const fadeInProgress = (now - state.phaseStartTime) / 3000; // 3 seconds fade in
            state.opacity = Math.min(fadeInProgress, 1);
            if (fadeInProgress >= 1) {
              state.animationPhase = 'visible';
              state.phaseStartTime = now;
            }
            break;
            
          case 'visible':
            state.opacity = 1;
            // Stay visible for 3 seconds
            if (now - state.phaseStartTime >= 3000) {
              state.animationPhase = 'fadingOut';
              state.phaseStartTime = now;
            }
            break;
            
          case 'fadingOut':
            const fadeOutProgress = (now - state.phaseStartTime) / 3000; // 3 seconds fade out
            state.opacity = 1 - Math.min(fadeOutProgress, 1);
            if (fadeOutProgress >= 1) {
              state.animationPhase = 'hidden';
              state.phaseStartTime = now;
              // Restart cycle after 2 seconds
              setTimeout(() => {
                state.animationPhase = 'fadingIn';
                state.phaseStartTime = Date.now();
              }, 2000);
            }
            break;
        }
        
        // Apply opacity
        logo2DRef.material.opacity = state.opacity;
      }
      

      
      try {
        if (renderer && scene && camera) {
          (renderer as any).render(scene, camera);
          
        }
        if (gl && gl.endFrameEXP) {
          gl.endFrameEXP();
        }
      } catch (renderError) {
        console.error('Error during render:', renderError);
      }
      
      animationIdRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.error('Error in animation loop:', error);
        setSceneError('Animation error occurred');
        // Stop animation loop on critical error
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }
      }
    };

    animate();
    } catch (error) {
      console.error('Error in setupScene:', error);
      setSceneError('Failed to initialize 3D scene');
    }
  };

  // Enterprise-grade pan responder with 2-finger zoom
  const panResponder: PanResponderInstance = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: (evt: GestureResponderEvent) => {
      // FIX #3: Add touch safety checks
      if (!evt?.nativeEvent?.touches || !Array.isArray(evt.nativeEvent.touches)) {
        return; // Safety exit for malformed events
      }
      
      const touches = evt.nativeEvent.touches;
      const gestureState = gestureStateRef.current;
      
      // SMOOTH RETURN TO DEFAULT when user touches screen during orbit
      if (parabolicOrbitRef.current?.isActive) {
        // Stop orbit and smoothly return to default
        parabolicOrbitRef.current = null;
        setParabolicOrbit(false);
        stopAmbientAudio();
        
        // ANIMATE TITLE BACK DOWN
        animateTitlePosition(false);
        
        // FIX #2 & #3: Clear momentum and sync targets when orbit interrupted
        gestureState.panVelocityX = 0;
        gestureState.panVelocityY = 0;
        gestureState.zoomVelocity = 0;
        syncCameraTargets();
        
        // Start smooth transition back to default camera position
        const defaultRadius = 10;
        const defaultAngleX = Math.atan2(5, 0);
        const defaultAngleY = Math.acos(9.75 / defaultRadius);
        
        cameraTransitionRef.current = {
          isTransitioning: true,
          startTime: Date.now(),
          duration: 2500, // 2.5-second smooth return via gesture
          startRadius: cameraRadiusRef.current,
          startAngleX: lookAngleXRef.current,
          startAngleY: lookAngleYRef.current,
          targetRadius: defaultRadius,
          targetAngleX: defaultAngleX,
          targetAngleY: defaultAngleY,
          easeFunction: easeInOutCubic
        };
      } else {
        // Normal gesture behavior - stop any existing transition
        cameraTransitionRef.current = null;
        
        // FIX #2: Sync targets when starting manual control
        syncCameraTargets();
      }
      
      // Initialize gesture state
      gestureState.lastTouchTime = Date.now();
      gestureState.panVelocityX = 0;
      gestureState.panVelocityY = 0;
      gestureState.zoomVelocity = 0;
      
      if (touches.length === 1) {
        // FIX #1: Handle gesture state transitions properly
        if (gestureState.isZooming) {
          // Transition from zoom to pan mode
          gestureState.isZooming = false;
          gestureState.isPanning = true;
          gestureState.lastZoomDistance = 0;
          gestureState.zoomVelocity = 0;
        }
        
        // Single finger: Initialize or continue pan
        gestureState.isPanning = true;
        gestureState.lastPanX = touches[0].pageX || 0;
        gestureState.lastPanY = touches[0].pageY || 0;
        
      } else if (touches.length === 2) {
        // FIX #1: Handle gesture state transitions properly
        if (gestureState.isPanning) {
          // Transition from pan to zoom mode
          gestureState.isPanning = false;
          gestureState.isZooming = true;
          gestureState.panVelocityX = 0;
          gestureState.panVelocityY = 0;
        }
        
        // Two fingers: Initialize or continue zoom
        gestureState.isZooming = true;
        gestureState.lastZoomDistance = calculatePinchDistance(touches);
        
      } else {
        // More than 2 fingers or no fingers: Reset all gestures
        gestureState.isPanning = false;
        gestureState.isZooming = false;
        gestureState.panVelocityX = 0;
        gestureState.panVelocityY = 0;
        gestureState.zoomVelocity = 0;
      }
      
      // Commented out particle logo dispersal - now using 2D logo
      // if (logoAnimationRef.current?.animationState) {
      //   logoAnimationRef.current.animationState.targetConvergence = 0; // Disperse
      //   
      //   // Clear any existing timeout
      //   if (logoAnimationRef.current.reconvergeTimeout) {
      //     clearTimeout(logoAnimationRef.current.reconvergeTimeout);
      //   }
      //   
      //   // Re-converge after delay
      //   logoAnimationRef.current.reconvergeTimeout = setTimeout(() => {
      //     if (logoAnimationRef.current?.animationState) {
      //       logoAnimationRef.current.animationState.targetConvergence = 1;
      //     }
      //   }, 3000);
      // }
      
      showControlsTemporarily();
    },
    onPanResponderMove: (evt: GestureResponderEvent) => {
      // FIX #3: Add touch safety checks
      if (!evt?.nativeEvent?.touches || !Array.isArray(evt.nativeEvent.touches)) {
        return; // Safety exit for malformed events
      }
      
      const touches = evt.nativeEvent.touches;
      const gestureState = gestureStateRef.current;
      const now = Date.now();
      
      // FIX #4: Clamp delta time to prevent extreme values
      const rawDeltaTime = now - gestureState.lastTouchTime;
      const deltaTime = Math.min(UNIFIED_CAMERA_BOUNDS.maxDeltaTime, 
        Math.max(UNIFIED_CAMERA_BOUNDS.minDeltaTime, rawDeltaTime));
      
      if (touches.length === 1 && gestureState.isPanning) {
        // Single finger: Process pan with momentum calculation
        const touch = touches[0];
        
        // FIX #2: Safe touch property access
        const currentX = touch?.pageX || 0;
        const currentY = touch?.pageY || 0;
        
        // Calculate deltas
        const dx = currentX - gestureState.lastPanX;
        const dy = currentY - gestureState.lastPanY;
        
        // Calculate velocity for momentum (pixels per ms) with clamping
        if (deltaTime > 0) {
          const rawVelX = (dx / deltaTime) * 0.001;
          const rawVelY = (dy / deltaTime) * 0.001;
          
          // FIX #2: Clamp velocities immediately to prevent accumulation
          gestureState.panVelocityX = Math.max(-UNIFIED_CAMERA_BOUNDS.maxVelocity, 
            Math.min(UNIFIED_CAMERA_BOUNDS.maxVelocity, rawVelX));
          gestureState.panVelocityY = Math.max(-UNIFIED_CAMERA_BOUNDS.maxVelocity, 
            Math.min(UNIFIED_CAMERA_BOUNDS.maxVelocity, rawVelY));
        }
        
        // Update camera angles with enhanced sensitivity
        const rotationSensitivity = 0.003;
        const deltaAngleX = dx * rotationSensitivity;
        const deltaAngleY = dy * rotationSensitivity;
        
        targetAngleXRef.current += deltaAngleX;
        targetAngleYRef.current -= deltaAngleY; // Inverted for natural feel
        
        // FIX #4: Normalize target angles
        targetAngleXRef.current = normalizeAngle(targetAngleXRef.current);
        
        // Apply constraints to target angles
        targetAngleYRef.current = Math.max(
          -Math.PI / 2 + 0.1,
          Math.min(Math.PI / 2 - 0.1, targetAngleYRef.current)
        );
        
        // Update last positions
        gestureState.lastPanX = currentX;
        gestureState.lastPanY = currentY;
        
      } else if (touches.length === 2 && gestureState.isZooming) {
        // Two fingers: Process pinch zoom
        const currentDistance = calculatePinchDistance(touches);
        
        if (gestureState.lastZoomDistance > 0 && currentDistance > 0) {
          const distanceDelta = currentDistance - gestureState.lastZoomDistance;
          
          // Calculate zoom velocity for momentum with clamping
          if (deltaTime > 0) {
            const rawZoomVel = (distanceDelta / deltaTime) * -UNIFIED_CAMERA_BOUNDS.zoomSensitivity;
            
            // FIX #2: Clamp zoom velocity immediately
            gestureState.zoomVelocity = Math.max(-UNIFIED_CAMERA_BOUNDS.maxVelocity, 
              Math.min(UNIFIED_CAMERA_BOUNDS.maxVelocity, rawZoomVel));
          }
          
          // Apply zoom with sensitivity and bounds
          const zoomDelta = distanceDelta * -UNIFIED_CAMERA_BOUNDS.zoomSensitivity;
          targetRadiusRef.current += zoomDelta;
          
          // FIX #1: Apply unified zoom bounds
          targetRadiusRef.current = Math.max(
            UNIFIED_CAMERA_BOUNDS.minRadius,
            Math.min(UNIFIED_CAMERA_BOUNDS.maxRadius, targetRadiusRef.current)
          );
        }
        
        gestureState.lastZoomDistance = currentDistance;
        
      } else if (touches.length === 1 && gestureState.isZooming) {
        // FIX #1: Handle transition from zoom to pan during move
        gestureState.isZooming = false;
        gestureState.isPanning = true;
        gestureState.zoomVelocity = 0;
        gestureState.lastZoomDistance = 0;
        
        // Initialize pan tracking
        const touch = touches[0];
        gestureState.lastPanX = touch?.pageX || 0;
        gestureState.lastPanY = touch?.pageY || 0;
        
      } else if (touches.length === 2 && gestureState.isPanning) {
        // FIX #1: Handle transition from pan to zoom during move  
        gestureState.isPanning = false;
        gestureState.isZooming = true;
        gestureState.panVelocityX = 0;
        gestureState.panVelocityY = 0;
        
        // Initialize zoom tracking
        gestureState.lastZoomDistance = calculatePinchDistance(touches);
        
      } else if (touches.length > 2) {
        // More than 2 fingers: Reset gesture state
        gestureState.isPanning = false;
        gestureState.isZooming = false;
        gestureState.panVelocityX = 0;
        gestureState.panVelocityY = 0;
        gestureState.zoomVelocity = 0;
      }
      
      gestureState.lastTouchTime = now;
    },
    onPanResponderRelease: () => {
      // Enable momentum when gesture ends
      const gestureState = gestureStateRef.current;
      gestureState.isPanning = false;
      gestureState.isZooming = false;
      
      // Momentum will be handled by updateSmoothCameraInterpolation
    },
    onPanResponderTerminate: () => {
      // Handle gesture interruption
      const gestureState = gestureStateRef.current;
      gestureState.isPanning = false;
      gestureState.isZooming = false;
      gestureState.panVelocityX = 0;
      gestureState.panVelocityY = 0;
      gestureState.zoomVelocity = 0;
    },
  });

  return (
    <GradientBackground 
      animated={true}
      depthLayers={true}
      particleField={true}
      luminanceShifts={true}
      style={styles.container}
    >
      <View style={styles.content} {...panResponder.panHandlers}>
      {sceneError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{sceneError}</Text>
          {retryCount < maxRetries && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={async () => {
                setSceneError(null);
                setRetryCount(retryCount + 1);
                if (glViewRef.current?.gl) {
                  await setupScene(glViewRef.current.gl);
                }
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <Animated.View 
        style={[
          styles.glViewContainer,
          {
            transform: [{
              translateY: scenePositionAnim
            }]
          }
        ]}
      >
        <GLView
          ref={glViewRef}
          style={styles.glView}
          onContextCreate={async (gl) => {
            try {
              if (!gl) {
                throw new Error('GL context not available');
              }
              glViewRef.current = { gl };
              await setupScene(gl);
            } catch (error) {
              console.error('Error creating GL context:', error);
              setSceneError('Failed to initialize 3D graphics');
            }
          }}
        />
      </Animated.View>
      
      {/* NEW: SVG Logo Overlay - Animated */}
      <Animated.View 
        style={[
          styles.logoOverlay,
          {
            transform: [{
              translateY: logoTranslateY
            }]
          }
        ]} 
        pointerEvents="none"
      >
        <IranverseLogo
          size={100}
          variant="brand"
        />
      </Animated.View>
      
      
      {/* IRANVERSE Title - High-tech minimal design - Moves with logo on Next */}
      <Animated.View style={[
        styles.titleContainer,
        {
          opacity: titleOpacity,
          transform: [{
            translateY: Animated.add(
              titlePosition.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -40], // Move up by 40 pixels when orbit active
              }),
              titleTranslateY // Add downward movement on Next button press
            )
          }, {
            scale: titleScale
          }]
        }
      ]}>
        <H1 style={styles.titleText}>IRANVERSE</H1>
      </Animated.View>
      
      {/* Enterprise Controls Row - Input Field, Play Button, Next Button */}
      <Animated.View style={[
        styles.controlsRowContainer, 
        { 
          opacity: Animated.multiply(controlsOpacity, controlsRowOpacity),
          transform: [{
            translateY: uiPositionAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -CONFIG.ANIMATION.KEYBOARD_SLIDE_DISTANCE],
            })
          }, {
            scale: controlsRowScale
          }]
        }
      ]}>
        {/* Enterprise Text Input Field */}
        <TouchableOpacity 
          onPress={activateInput}
          style={styles.inputTouchArea}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Text input field - tap to open custom keyboard (${keyboardLanguage === 'english' ? 'English' : 'Persian'})`}
          accessibilityHint="Opens enterprise keyboard for text input"
          accessibilityState={{ 
            expanded: keyboardState === 'shown',
            selected: keyboardState !== 'hidden'
          }}
          accessibilityValue={{ 
            text: inputText || (keyboardLanguage === 'english' ? "No text entered" : "متن وارد نشده") 
          }}
          accessibilityLanguage={keyboardLanguage === 'farsi' ? 'fa' : 'en'}
          activeOpacity={0.8}
        >
          <Animated.View style={[
            styles.inputWrapper,
            {
              transform: [{
                scale: inputFocusAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.02], // Subtle scale on focus
                })
              }],
              borderColor: inputFocusAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(80, 80, 80, 0.6)', 'rgba(120, 120, 120, 0.9)'],
              }),
              shadowOpacity: inputFocusAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.4],
              }),
            }
          ]}>
            <TextInput
              ref={inputRef}
              style={[
                styles.textInput,
                keyboardState === 'hidden' && styles.textInputInactive,
                keyboardLanguage === 'farsi' && styles.textInputRTL
              ]}
              value={inputText}
              onChangeText={handleInputChange}
              placeholder={keyboardLanguage === 'english' ? "Insert your code..." : "رمز ورود را وارد کنید..."}
              placeholderTextColor="rgba(140, 140, 140, 0.7)"
              selectionColor="rgba(255, 255, 255, 0.8)"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              showSoftInputOnFocus={false} // Disable native keyboard
              caretHidden={keyboardState === 'hidden'} // Cursor state synchronization
              editable={false} // Prevent native focus - use TouchableOpacity only
              pointerEvents="none" // TouchableOpacity handles all interactions
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Enterprise-Grade Parabolic Orbit Control */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[
              styles.playButton, 
              parabolicOrbit && styles.activePlayButton
            ]}
            onPress={toggleParabolicOrbit}
            onPressIn={() => animateButtonPress(true)}
            onPressOut={() => animateButtonPress(false)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={parabolicOrbit ? "Stop parabolic orbit motion" : "Start parabolic orbit motion"}
            accessibilityHint="Activates cinematic camera motion around the scene"
            accessibilityState={{ selected: parabolicOrbit }}
          >
            <Text style={[
              styles.playButtonIcon,
              parabolicOrbit && styles.activePlayButtonIcon
            ]}>
              {parabolicOrbit ? '⏸︎' : '▶︎'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Next Button - Always visible, enabled/disabled based on password validity */}
        <Animated.View style={{ transform: [{ scale: nextButtonScale }] }}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              isPasswordValid && styles.activeNextButton
            ]}
            onPress={handleNextPress}
            onPressIn={() => animateNextButtonPress(true)}
            onPressOut={() => animateNextButtonPress(false)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isPasswordValid ? "Next - Proceed to Sign up or Login" : "Next - Enter valid password first"}
            accessibilityHint={isPasswordValid ? "Valid password entered, tap to continue" : "Enter FFZ or فرج فاطمه زهرا to enable"}
            accessibilityState={{ disabled: !isPasswordValid }}
          >
            <Text style={[
              styles.nextButtonText,
              isPasswordValid && styles.activeNextButtonText
            ]}>
              NEXT
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Enterprise Custom Keyboard */}
      {renderEnterpriseKeyboard()}
      
      {/* Ghost Back Button */}
      <Animated.View 
        style={[
          styles.backButtonContainer,
          {
            opacity: backButtonOpacity,
            transform: [{ scale: backButtonScale }]
          }
        ]}
      >
        {/* Hint text */}
        <Animated.Text style={[
          styles.backButtonHint,
          { opacity: backButtonHintOpacity }
        ]}>
          Swipe or tap here to go back
        </Animated.Text>
        
        {/* Ghost button with larger hit area */}
        <TouchableOpacity
          style={styles.backButtonHitArea}
          onPress={handleBackPress}
          activeOpacity={1}
          onPressIn={() => {
            // Briefly show button on press
            Animated.parallel([
              Animated.timing(backButtonGhostOpacity, {
                toValue: 0.4,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.spring(backButtonScale, {
                toValue: 1.1,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
              })
            ]).start();
          }}
          onPressOut={() => {
            // Return to ghost state
            Animated.parallel([
              Animated.timing(backButtonGhostOpacity, {
                toValue: 0.05,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.spring(backButtonScale, {
                toValue: 1,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
              })
            ]).start();
          }}
        >
          <View style={styles.backButton}>
            <Animated.Text style={[
              styles.backButtonText,
              { opacity: backButtonGhostOpacity }
            ]}>
              ←
            </Animated.Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Auth Header - Removed per user request */}
      
      {/* Farsi Typing Animation - Below Wavy Grid */}
      <Animated.View 
        style={[
          styles.typingContainer,
          {
            opacity: typingOpacity,
          }
        ]}
      >
        <Text style={styles.typingText}>
          {typingText}
          {showCursor && (
            <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
              _
            </Animated.Text>
          )}
        </Text>
      </Animated.View>
      
      {/* OAuth Authentication Section */}
      {showAuthButtons && (
        <Animated.View 
          style={[
            styles.authContainer,
            {
              opacity: authButtonsOpacity,
              transform: [{ translateY: authButtonsTranslate }]
            }
          ]}
        >
          <View style={styles.authButtonsWrapper}>
            {/* Google OAuth Button */}
            <Animated.View style={[{ transform: [{ scale: googleButtonScale }] }, { marginBottom: -12, marginTop: 0 }]}>
              <Button
                variant="primary"
                onPress={() => {
                  triggerHapticFeedback('light');
                  Alert.alert(
                    'Google OAuth Setup',
                    'To set up Google OAuth:\n\n1. Go to console.cloud.google.com\n2. Create a new project\n3. Enable Google Sign-In API\n4. Create OAuth 2.0 credentials\n5. Add your bundle ID/package name\n6. Download configuration file',
                    [{ text: 'OK' }]
                  );
                }}
                leftIcon={<GoogleLogo size={20} color="#FFFFFF" />}
                fullWidth
                style={styles.authButton}
              >
                Continue with Google
              </Button>
            </Animated.View>
            
            {/* Apple OAuth Button */}
            <Animated.View style={[{ transform: [{ scale: appleButtonScale }] }, { marginBottom: -12, marginTop: -12 }]}>
              <Button
                variant="primary"
                onPress={() => {
                  triggerHapticFeedback('light');
                  Alert.alert(
                    'Apple Sign In Setup',
                    'To set up Apple Sign In:\n\n1. Go to developer.apple.com\n2. Enable Sign In with Apple capability\n3. Create Service ID\n4. Configure domain and redirect URLs\n5. Generate private key\n6. Update app entitlements',
                    [{ text: 'OK' }]
                  );
                }}
                leftIcon={<AppleLogo size={22} color="#FFFFFF" />}
                fullWidth
                style={styles.authButton}
              >
                Continue with Apple
              </Button>
            </Animated.View>
            
            {/* Continue with Email Button */}
            <Animated.View style={[{ transform: [{ scale: signInButtonScale }] }, { marginTop: -12 }]}>
              <Button
                variant="primary"
                onPress={() => {
                  triggerHapticFeedback('light');
                  navigation.navigate('Login', { email: undefined });
                }}
                fullWidth
                style={styles.authButton}
              >
                Continue with Email
              </Button>
            </Animated.View>
          </View>
        </Animated.View>
      )}
      
      {/* Auth Footer */}
      {showAuthButtons && (
        <Animated.View 
          style={[
            styles.authFooterContainer,
            {
              opacity: authFooterOpacity,
              transform: [{ translateY: authFooterTranslate }]
            }
          ]}
        >
          <Caption style={styles.footerText}>
            By continuing, you agree to IRANVERSE's
          </Caption>
          <View style={styles.legalLinksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Terms' as any)}>
              <Caption style={styles.footerLink}>Terms of Service</Caption>
            </TouchableOpacity>
            <Caption style={styles.footerText}> and </Caption>
            <TouchableOpacity onPress={() => navigation.navigate('Privacy' as any)}>
              <Caption style={styles.footerLink}>Privacy Policy</Caption>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  glView: {
    flex: 1,
  },
  glViewContainer: {
    flex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    zIndex: 1000,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleContainer: {
    position: 'absolute',
    top: CONFIG.UI.TITLE_POSITION_TOP, // User selected position
    left: 6,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
  },
  logoOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  titleText: {
    color: '#ffffff', // Changed to white
    fontSize: 32, // Increased from 24 to 32
    fontWeight: 'bold', // Changed from '100' to 'bold'
    letterSpacing: 2, // Increased spacing for better readability
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'SF Pro Display', // Simple system font
      android: 'Roboto', // Simple system font
    }),
    // Enhanced shadow for white text on potentially light backgrounds
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  controlsRowContainer: {
    position: 'absolute',
    bottom: CONFIG.UI.BUTTON_POSITION_BOTTOM,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 15, // Space between elements
  },
  inputTouchArea: {
    flex: 1, // Take available space
    maxWidth: 200, // Limit input width
  },
  inputWrapper: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(18, 18, 18, 0.95)', // Matching play button background
    borderWidth: 1.5,
    borderColor: 'rgba(80, 80, 80, 0.6)', // Default border color
    borderRadius: 12, // Modern rounded corners
    // Shadow effects matching play button
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    // Subtle inner glow effect for focus states
    ...Platform.select({
      ios: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.03,
        shadowRadius: 1,
      }
    })
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff', // White text
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
    fontWeight: '400',
    textAlign: 'left',
    backgroundColor: 'transparent', // Transparent to show wrapper background
  },
  textInputInactive: {
    opacity: 0.8, // Slightly dimmed when keyboard hidden
  },
  textInputRTL: {
    textAlign: 'right', // Right-align text for Persian
    writingDirection: 'rtl', // Right-to-left text direction
    fontFamily: Platform.select({
      ios: 'SF Pro Display', // iOS handles Persian well with system font
      android: 'Roboto', // Android handles Persian well with system font
    }),
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(80, 80, 80, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    // Subtle inner glow effect
    ...Platform.select({
      ios: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      }
    })
  },
  activePlayButton: {
    backgroundColor: 'rgba(12, 12, 12, 0.98)',  // Darker: was rgba(45, 45, 45, 0.98)
    borderColor: 'rgba(60, 60, 60, 0.6)',       // Dimmer border: was rgba(120, 120, 120, 0.8)
    borderWidth: 1.5,                           // Thinner: was 2
    shadowColor: '#000000',                     // Pure black shadow: was '#ffffff'
    shadowOffset: { width: 0, height: 4 },     // Reduced shadow: was { width: 0, height: 0 }
    shadowOpacity: 0.6,                        // Darker shadow: was 0.15
    shadowRadius: 6,                           // Smaller radius: was 8
    elevation: 8,                              // Reduced elevation: was 16
    // Subtle depth without glow
    transform: [{ translateY: 0 }],            // No lift: was translateY: -1
  },
  playButtonIcon: {
    color: 'rgba(220, 220, 220, 0.9)',
    fontSize: 20,
    fontWeight: '200',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
  },
  activePlayButtonIcon: {
    color: 'rgba(160, 160, 160, 0.8)',          // Dimmer text: was rgba(255, 255, 255, 0.95)
    fontWeight: '200',                          // Lighter weight: was '300'
    textShadowColor: 'rgba(0, 0, 0, 0.7)',     // Darker shadow: was rgba(0, 0, 0, 0.5)
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,                       // Smaller radius: was 3
  },
  // Enterprise Custom Keyboard Styles
  keyboardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(12, 12, 12, 0.98)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(80, 80, 80, 0.8)',
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 10,
    zIndex: 2000,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 20,
  },
  keyboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(80, 80, 80, 0.4)',
    marginBottom: 15,
  },
  keyboardTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
  },
  keyboardCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(60, 60, 60, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.6)',
  },
  keyboardCloseText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  keyboardKey: {
    backgroundColor: 'rgba(25, 25, 25, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(70, 70, 70, 0.7)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 3,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  spaceKey: {
    flex: 1,
    maxWidth: 180,
    marginHorizontal: 8,
  },
  functionKey: {
    backgroundColor: 'rgba(40, 40, 40, 0.95)',
    borderColor: 'rgba(90, 90, 90, 0.8)',
    minWidth: 50,
  },
  keyText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
  },
  functionKeyText: {
    color: 'rgba(200, 200, 200, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  // Next Button Styles
  nextButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(18, 18, 18, 0.95)', // Same as play button
    borderWidth: 1.5,
    borderColor: 'rgba(80, 80, 80, 0.6)', // Same as play button
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    // Subtle inner glow effect
    ...Platform.select({
      ios: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      }
    })
  },
  activeNextButton: {
    backgroundColor: 'rgba(12, 12, 12, 0.98)',  // Same as active play button
    borderColor: 'rgba(60, 60, 60, 0.6)',       // Same as active play button
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
    transform: [{ translateY: 0 }],
  },
  nextButtonText: {
    color: 'rgba(220, 220, 220, 0.9)', // Same as play button
    fontSize: 14, // Smaller to fit in circle
    fontWeight: '200',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
    }),
  },
  activeNextButtonText: {
    color: 'rgba(160, 160, 160, 0.8)', // Same as active play button
    fontWeight: '200',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  authContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 999,
  },
  authButtonsWrapper: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  authButton: {
    // marginBottom handled by Animated.View wrapper
    borderRadius: 24,
    paddingVertical: 16,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1000,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.02)', // Almost invisible background
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // Very faint border
    justifyContent: 'center',
    alignItems: 'center',
    // Add subtle shadow for depth hint
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    marginLeft: -2,
  },
  backButtonHint: {
    position: 'absolute',
    top: 55,
    left: 0,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '400',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  backButtonHitArea: {
    padding: 10, // Larger touch area for easier discovery
    borderRadius: 30,
  },
  authHeaderContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 999,
  },
  authHeaderContent: {
    alignItems: 'center',
  },
  authTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  authSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
  },
  authFooterContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 999,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 320,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 16,
    fontSize: 12,
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textDecorationLine: 'underline',
    marginHorizontal: 2,
  },
  footerLinkBold: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
  footerLinkSmall: {
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'underline',
  },
  legalLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  typingContainer: {
    position: 'absolute',
    bottom: 515, // Positioned below the wavy grid
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 998,
  },
  typingText: {
    fontFamily: 'Courier', // Will use system Courier font
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    writingDirection: 'rtl',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cursor: {
    fontFamily: 'Courier',
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default FirstScreen;
