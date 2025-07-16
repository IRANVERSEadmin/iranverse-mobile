import { TouchableOpacity } from 'react-native';
// src/screens/FirstScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { 
  View, 
  StyleSheet, 
  PanResponder, 
  Dimensions, 
  Text,
  TextInput,
  Animated,
  Vibration,
  Platform,
  BackHandler
} from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { Renderer } from 'expo-three';
import { Audio } from 'expo-av';
import type { 
  PanResponderInstance,
  GestureResponderEvent,
  TextInput as TextInputType
} from 'react-native';
import GradientBackground from '../shared/components/layout/GradientBackground';

// Enterprise keyboard state machine type
type KeyboardState = 'hidden' | 'showing' | 'shown' | 'hiding';

const { width, height } = Dimensions.get('window');

// Enterprise Configuration Constants - Production Grade
// Enterprise Navigation Props Interface
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
    MAX_PARTICLES: 640, // Quantum particle count (reduced by 20%)
    TARGET_FPS: 60, // Target frame rate
    GRID_DIVISIONS: 38, // Grid line density
    MAX_VELOCITY: 0.1, // Gesture velocity limit
  },
  UI: {
    INPUT_POSITION_BOTTOM: 150, // Input field position
    BUTTON_POSITION_BOTTOM: 60, // Play button position
    TITLE_POSITION_TOP: 175, // Title position
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
  // Professional easing function (only the one we use)
  const easeInOutCubic = (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // All refs
  const glViewRef = useRef<any>(null);
  const inputRef = useRef<TextInputType>(null);
  const cameraRadiusRef = useRef(10);
  const lookAngleXRef = useRef(Math.atan2(5, 0));
  const lookAngleYRef = useRef(Math.acos(9.9 / 10));
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced gesture state management
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
  
  // Smooth interpolation targets for momentum
  const targetAngleXRef = useRef(Math.atan2(5, 0));
  const targetAngleYRef = useRef(Math.acos(9.9 / 10));
  const targetRadiusRef = useRef(10);
  
  // Unified zoom bounds and constraints (used by all systems)
  const UNIFIED_CAMERA_BOUNDS = {
    minRadius: 3,
    maxRadius: 25,
    zoomSensitivity: 0.02,
    smoothFactor: 0.08,
    maxVelocity: 0.1, // Prevent runaway momentum
    maxDeltaTime: 100, // Clamp delta time for stability
    minDeltaTime: 1,
  };
  
  // Enhanced camera transition state with cinematic easing
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
  
  // Parabolic orbit animation state
  const parabolicOrbitRef = useRef<{
    isActive: boolean;
    startTime: number;
    duration: number;
    initialRadius: number;
    initialAngleX: number;
    initialAngleY: number;
  } | null>(null);
  
  // expo-av Audio System (React Native Compatible) + Beat Detection
  const soundRef = useRef<Audio.Sound | null>(null);
  const isAudioLoadedRef = useRef(false);
  const isAudioPlayingRef = useRef(false);
  
  // Beat detection and sync system - ENHANCED SMOOTH VERSION
  const audioAnalysisRef = useRef({
    bpm: 120, // Default BPM - adjust based on your track
    beatInterval: 500, // 120 BPM = 500ms per beat
    lastBeatTime: 0,
    
    // SMOOTH BEAT RESPONSE SYSTEM
    currentBeatStrength: 0, // Current interpolated beat strength
    targetBeatStrength: 0, // Target beat strength to interpolate toward
    beatDecayRate: 0.015, // How fast beat effects fade (lower = slower decay)
    beatBuildRate: 0.08, // How fast beat effects build up (higher = faster response)
    
    // MULTI-LAYER BEAT EFFECTS for organic response
    quickPulse: 0, // Fast decay (0.5s) - for immediate visual impact
    mediumWave: 0, // Medium decay (2s) - for sustained effects
    slowResonance: 0, // Slow decay (5s) - for ambient background influence
    
    isAnalyzing: false
  });
  
  const beatDetectionRef = useRef<NodeJS.Timeout | null>(null);
  
  // State variables (enterprise minimal - 5 states only)
  const [parabolicOrbit, setParabolicOrbit] = useState(false);
  const [inputText, setInputText] = useState('');
  const [keyboardState, setKeyboardState] = useState<KeyboardState>('hidden');
  const [keyboardLanguage, setKeyboardLanguage] = useState<'english' | 'farsi'>('english');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  
  // Add a ref to track keyboard state for immediate access (avoiding state delays)
  const keyboardStateRef = useRef<KeyboardState>('hidden');
  
  // Enterprise button animation (minimal)
  const buttonScale = useRef(new Animated.Value(1)).current;
  const nextButtonScale = useRef(new Animated.Value(1)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  const keyboardAnim = useRef(new Animated.Value(0)).current;
  const uiPositionAnim = useRef(new Animated.Value(0)).current; // For moving UI elements up
  
  // Helper function to force reset keyboard animations and state
  const forceResetKeyboard = () => {
    // Stop all animations immediately
    keyboardAnim.stopAnimation();
    uiPositionAnim.stopAnimation();
    inputFocusAnim.stopAnimation();
    
    // Reset all animation values
    keyboardAnim.setValue(0);
    uiPositionAnim.setValue(0);
    inputFocusAnim.setValue(0);
    
    // Reset state
    updateKeyboardState('hidden');
  };

  // Helper function to update keyboard state in both state and ref
  const updateKeyboardState = (newState: KeyboardState) => {
    keyboardStateRef.current = newState;
    setKeyboardState(newState);
  };

  // IRANVERSE title animation
  const titlePosition = useRef(new Animated.Value(0)).current; // 0 = normal, 1 = moved up

  // Initialize keyboard state on mount and cleanup
  useEffect(() => {
    // Ensure clean initialization
    forceResetKeyboard();
    
    return () => {
      // Cleanup on unmount
      forceResetKeyboard();
    };
  }, []);

  // Initialize expo-av audio system on component mount
  useEffect(() => {
    initializeAudioSystem();
    
    return () => {
      // Cleanup audio on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {
          // Silent cleanup - audio might already be unloaded
        });
      }
    };
  }, []);

  // Enterprise Android Back Button Handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (keyboardStateRef.current === 'shown' || keyboardStateRef.current === 'showing') {
        handleInputBlur();
        return true; // Prevent default back action
      }
      return false; // Allow default back action
    });
    
    return () => backHandler.remove();
  }, []); // Remove keyboardState dependency since we use ref

  // Auto-hide controls system (minimal)
  useEffect(() => {
    const startHideTimer = () => {
      // Clear any existing timer
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

  // expo-av Audio System Implementation (React Native Compatible)
  const initializeAudioSystem = async (): Promise<void> => {
    try {
      // Set audio mode for ambient background audio (using numeric constants for compatibility)
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: 1, // DoNotMix
        shouldDuckAndroid: false,
        interruptionModeAndroid: 1, // DoNotMix
        playThroughEarpieceAndroid: false,
      });
      
      // Production: Audio system initialized successfully (no console.log)
    } catch (error) {
      // Production: Silent fallback - audio system initialization failed
    }
  };

  const startAmbientAudio = async (): Promise<void> => {
    try {
      // Don't start if already playing
      if (isAudioPlayingRef.current || !isAudioLoadedRef.current) {
        // Try to load audio if not loaded
        if (!isAudioLoadedRef.current) {
          await loadAudioFile();
        }
        if (!isAudioLoadedRef.current) {
          // Production: Audio file not available, continuing without audio (silent)
          return;
        }
      }

      if (soundRef.current && isAudioLoadedRef.current) {
        // Check current status
        const status = await soundRef.current.getStatusAsync();
        
        if (status.isLoaded) {
          // Start playbook
          await soundRef.current.setIsLoopingAsync(true);
          await soundRef.current.setVolumeAsync(CONFIG.AUDIO.VOLUME_LEVEL); // Use config constant
          await soundRef.current.playAsync();
          
          isAudioPlayingRef.current = true;
          
          // START BEAT DETECTION SYSTEM
          startBeatDetection();
          
          // Production: Ambient audio with beat detection started successfully (silent)
        }
      }
    } catch (error) {
      // Production: Silent fallback - failed to start ambient audio
    }
  };

  const stopAmbientAudio = async (): Promise<void> => {
    try {
      if (soundRef.current && isAudioPlayingRef.current) {
        // STOP BEAT DETECTION
        stopBeatDetection();
        
        // Fade out effect by reducing volume first
        await soundRef.current.setVolumeAsync(CONFIG.AUDIO.FADE_OUT_VOLUME);
        
        // Small delay for fade effect
        setTimeout(async () => {
          try {
            if (soundRef.current) {
              await soundRef.current.stopAsync();
              await soundRef.current.setPositionAsync(0); // Reset to beginning
              isAudioPlayingRef.current = false;
              // Production: Ambient audio stopped (silent)
            }
          } catch (error) {
            // Production: Silent fallback - audio stop cleanup failed
          }
        }, CONFIG.AUDIO.FADE_DELAY);
      }
    } catch (error) {
      // Production: Silent fallback - failed to stop ambient audio
    }
  };

  // ENHANCED SMOOTH BEAT DETECTION SYSTEM
  const startBeatDetection = () => {
    if (beatDetectionRef.current) {
      clearInterval(beatDetectionRef.current);
    }
    
    audioAnalysisRef.current.isAnalyzing = true;
    audioAnalysisRef.current.lastBeatTime = Date.now();
    
    // Smooth beat detection with organic response
    (beatDetectionRef.current as any) = setInterval(() => {
      const now = Date.now();
      const timeSinceLastBeat = now - audioAnalysisRef.current.lastBeatTime;
      const analysis = audioAnalysisRef.current;
      
      // Detect beat based on timing pattern
      if (timeSinceLastBeat >= analysis.beatInterval * 0.95) {
        // BEAT DETECTED - Trigger smooth quantum fluctuation enhancement
        triggerSmoothBeatSync();
        analysis.lastBeatTime = now;
      }
      
      // SMOOTH INTERPOLATION SYSTEM - Update every frame for fluid motion
      updateSmoothBeatResponse();
      
    }, 16); // 60fps update rate for smooth interpolation
  };

  const triggerSmoothBeatSync = () => {
    const analysis = audioAnalysisRef.current;
    const now = Date.now();
    
    // Calculate beat intensity based on musical patterns
    const beatPhase = (now / 1000) % 8; // 8-second musical phrase cycle
    const intensity = 0.4 + Math.sin(beatPhase * Math.PI * 0.25) * 0.6; // 0.4 to 1.0 intensity
    
    // Set target strength for smooth interpolation
    analysis.targetBeatStrength = intensity;
    
    // MULTI-LAYER RESPONSE - Different decay rates for organic feel
    analysis.quickPulse = intensity; // Immediate spike
    analysis.mediumWave = Math.max(analysis.mediumWave, intensity * 0.8); // Sustained wave
    analysis.slowResonance = Math.max(analysis.slowResonance, intensity * 0.4); // Background resonance
  };

  const updateSmoothBeatResponse = () => {
    const analysis = audioAnalysisRef.current;
    const deltaTime = 16 / 1000; // ~16ms frame time
    
    // SMOOTH INTERPOLATION to target beat strength
    if (analysis.currentBeatStrength < analysis.targetBeatStrength) {
      // Build up quickly on beat
      analysis.currentBeatStrength += analysis.beatBuildRate * deltaTime * 60; // 60fps normalized
    } else {
      // Decay smoothly after beat
      analysis.currentBeatStrength -= analysis.beatDecayRate * deltaTime * 60;
    }
    
    // Clamp beat strength
    analysis.currentBeatStrength = Math.max(0, Math.min(1, analysis.currentBeatStrength));
    
    // MULTI-LAYER DECAY for organic feel
    analysis.quickPulse *= Math.pow(0.3, deltaTime); // Fast decay (0.7s half-life)
    analysis.mediumWave *= Math.pow(0.7, deltaTime); // Medium decay (2.3s half-life)
    analysis.slowResonance *= Math.pow(0.9, deltaTime); // Slow decay (6.6s half-life)
    
    // Auto-reduce target after peak
    analysis.targetBeatStrength *= Math.pow(0.1, deltaTime); // Quick target decay
  };

  const stopBeatDetection = () => {
    if (beatDetectionRef.current) {
      clearInterval(beatDetectionRef.current);
      beatDetectionRef.current = null;
    }
    audioAnalysisRef.current.isAnalyzing = false;
    
    // Smooth fadeout of all beat effects
    audioAnalysisRef.current.currentBeatStrength = 0;
    audioAnalysisRef.current.targetBeatStrength = 0;
    audioAnalysisRef.current.quickPulse = 0;
    audioAnalysisRef.current.mediumWave = 0;
    audioAnalysisRef.current.slowResonance = 0;
  };

  const loadAudioFile = async (): Promise<void> => {
    try {
      // First unload any existing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Try to load the audio file - Production: This should be replaced with actual audio file
      // For production deployment, ensure ambient-track.mp3 exists in assets/audio/
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
      // Production: Audio file loaded successfully (silent)
    } catch (error) {
      // Production: Silent fallback - audio file not found or failed to load
      // App continues to function without audio - this is acceptable for production
      isAudioLoadedRef.current = false;
      soundRef.current = null;
    }
  };

  // All function definitions (minimal)
  const showControlsTemporarily = (): void => {
    // Clear any existing timer
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

  // Enterprise-grade pinch distance calculation with safety
  const calculatePinchDistance = (touches: any[]): number => {
    if (!touches || touches.length < 2) return 0;
    
    // FIX #2: Safe touch property validation
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    if (!touch1?.pageX || !touch1?.pageY || !touch2?.pageX || !touch2?.pageY) {
      return 0; // Safety exit for malformed touch events
    }
    
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // FIX #4: Angle normalization utilities
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

  // FIX #2: Sync targets when switching control systems
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
    } catch (error) {
      // Silent fail - no console logs in production
    }
  };

  // Enterprise button press animation (minimal)
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
    if (isPasswordValid) {
      triggerHapticFeedback('medium');
      
      // Navigate to sign up screen
      // Navigate to SignUp screen
navigation.navigate('AuthWelcome')
    } else {
      triggerHapticFeedback('light');
      // Invalid password - could add visual feedback here
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

  // Enterprise-grade parabolic orbit toggle (with expo-av audio)
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

  // Enterprise input focus handlers - Simplified and Bulletproof
  const handleInputFocus = (): void => {
    // Set state immediately
    keyboardStateRef.current = 'showing';
    setKeyboardState('showing');
    
    // Input focus animation
    Animated.timing(inputFocusAnim, {
      toValue: 1,
      duration: CONFIG.ANIMATION.INPUT_FOCUS_DURATION,
      useNativeDriver: false,
    }).start();
    
    // Start keyboard animations
    Animated.parallel([
      Animated.timing(keyboardAnim, {
        toValue: 1,
        duration: CONFIG.ANIMATION.TRANSITION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(uiPositionAnim, {
        toValue: 1,
        duration: CONFIG.ANIMATION.TRANSITION_DURATION,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Set to shown when complete
      keyboardStateRef.current = 'shown';
      setKeyboardState('shown');
    });
    
    showControlsTemporarily();
  };

  const handleInputBlur = (): void => {
    // Set state immediately
    keyboardStateRef.current = 'hiding';
    setKeyboardState('hiding');
    
    Animated.timing(inputFocusAnim, {
      toValue: 0,
      duration: CONFIG.ANIMATION.INPUT_FOCUS_DURATION,
      useNativeDriver: false,
    }).start();
    
    // Hide keyboard animations
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
      // Set to hidden when complete
      keyboardStateRef.current = 'hidden';
      setKeyboardState('hidden');
    });
  };

  const handleInputChange = (text: string): void => {
    // Enterprise input validation and sanitization
    const sanitizedText = text
      .replace(CONFIG.SECURITY.XSS_FILTER_REGEX, '') // Basic XSS prevention
      .substring(0, CONFIG.SECURITY.MAX_INPUT_LENGTH); // Length limit for enterprise security
    
    setInputText(sanitizedText);
    
    // Check if password is valid (English: FFZ, Farsi: فرج فاطمه زهرا)
    const validPasswords = ['FFZ', 'فرج فاطمه زهرا'];
    setIsPasswordValid(validPasswords.includes(sanitizedText.trim()));
    
    showControlsTemporarily();
  };

  // Enterprise Keyboard Handlers - Production Grade
  const handleKeyPress = (key: string): void => {
    if (key === 'BACKSPACE') {
      const newText = inputText.slice(0, -1);
      setInputText(newText);
      // Check password validity on backspace
      const validPasswords = ['FFZ', 'فرج فاطمه زهرا'];
      setIsPasswordValid(validPasswords.includes(newText.trim()));
    } else if (key === 'SPACE') {
      const newText = inputText + ' ';
      setInputText(newText);
      // Check password validity on space
      const validPasswords = ['FFZ', 'فرج فاطمه زهرا'];
      setIsPasswordValid(validPasswords.includes(newText.trim()));
    } else if (key === 'ENTER') {
      handleInputBlur();
      // Process input here - add your enterprise logic
    } else if (key === '123') {
      // Numbers mode - implement number keyboard if needed
      return;
    } else if (key === 'فا/EN') {
      // Toggle between Farsi and English keyboards
      setKeyboardLanguage(prev => prev === 'english' ? 'farsi' : 'english');
      return;
    } else {
      // Validate and add character with enterprise length limit
      if (inputText.length < CONFIG.SECURITY.MAX_INPUT_LENGTH) {
        const newText = inputText + key;
        setInputText(newText);
        // Check password validity on new character
        const validPasswords = ['FFZ', 'فرج فاطمه زهرا'];
        setIsPasswordValid(validPasswords.includes(newText.trim()));
      }
    }
    showControlsTemporarily();
  };

  // Production-ready input activation - Force show approach
  const activateInput = (): void => {
    // AGGRESSIVE APPROACH: Always force reset and show
    // This eliminates all state checking issues
    
    // Step 1: Force stop all animations
    keyboardAnim.stopAnimation();
    uiPositionAnim.stopAnimation();
    inputFocusAnim.stopAnimation();
    
    // Step 2: Force reset all values
    keyboardAnim.setValue(0);
    uiPositionAnim.setValue(0);
    inputFocusAnim.setValue(0);
    
    // Step 3: Force state to hidden
    keyboardStateRef.current = 'hidden';
    setKeyboardState('hidden');
    
    // Step 4: Always show keyboard after a tiny delay
    setTimeout(() => {
      handleInputFocus();
    }, 50); // Small delay to ensure state is reset
  };

  const renderEnterpriseKeyboard = () => {
    // Use state for rendering (React needs the state for re-renders)
    if (keyboardState === 'hidden') return null;

    // English keyboard layout
    const englishKeyRows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
      ['123', 'SPACE', 'BACKSPACE', 'فا/EN', 'ENTER']
    ];

    // Farsi keyboard layout (Complete Persian QWERTY)
    const farsiKeyRows = [
      ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'],
      ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک'],
      ['ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'پ', 'و', 'گ'],
      ['؟', '،', 'SPACE', 'BACKSPACE', 'فا/EN', 'ENTER']
    ];

    const keyRows = keyboardLanguage === 'english' ? englishKeyRows : farsiKeyRows;

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
          
          // Atmospheric rim lighting
          float rimLight = 1.0 - max(dot(viewDir, normal), 0.0);
          rimLight = pow(rimLight, 3.0) * atmosphereDensity;
          
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
      color: 0x474747,
      transparent: true,
      opacity: 0.8,
      linewidth: 1.75,
      blending: THREE.AdditiveBlending,
    });

    const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
    
    // Position and orient the grid
    grid.position.set(0, gridY, 0);
    scene.add(grid);

    // 2D SIN wave system - emanating from beneath main sphere
    const waveCenter = { x: 0, z: 0 }; // Directly beneath main sphere
    const waveSpeed = 2.0; // Wave propagation speed
    const waveAmplitude = 0.18; // Wave height
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
    const uncertaintyPrinciple = 0.08;
    const quantumCoherence = 0.25;
    const fieldRadius = 1.25; // Small contained field
    const entanglementProbability = 0.12;

    // Initialize quantum particles with quantum properties
    for (let i = 0; i < quantumParticleCount; i++) {
      // Position particles inside spherical quantum field
      let x: number, y: number, z: number, r: number;
      do {
        x = (Math.random() - 0.5) * 2;
        y = (Math.random() - 0.5) * 2;
        z = (Math.random() - 0.5) * 2;
        r = Math.sqrt(x * x + y * y + z * z);
      } while (r > 1); // Ensure particles are inside unit sphere
      
      // Scale to desired field radius
      const fieldScale = fieldRadius * 0.8;
      x *= fieldScale;
      y *= fieldScale;
      z *= fieldScale;
      
      const basePos = new THREE.Vector3(x, y, z);
      
      const particle = {
        basePosition: basePos.clone(),
        currentPosition: basePos.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.001,  // Very slow motion
          (Math.random() - 0.5) * 0.001,
          (Math.random() - 0.5) * 0.001
        ),
        phase: Math.random() * Math.PI * 2,
        quantumState: Math.random() > 0.7 ? 1 : 0, // 30% real, 70% virtual
        existenceProbability: Math.random() * 0.8 + 0.2,
        entanglementPartner: Math.random() < entanglementProbability ? 
          Math.floor(Math.random() * quantumParticleCount) : null,
        lastInteraction: 0,
        energyLevel: Math.random() * 0.5 + 0.5,
        spinDirection: Math.random() > 0.5 ? 1 : -1
      };
      
      quantumParticles.push(particle);
      
      // Set initial visual properties
      quantumPositions.set([x, y, z], i * 3);
      quantumSizes[i] = 0.04 + Math.random() * 0.06;
      quantumOpacities[i] = (particle.existenceProbability * particle.quantumState) * 2.0;
      
      // Pure grayscale color spectrum
      const brightness = particle.energyLevel;
      const grayColor = new THREE.Color(brightness * 0.8, brightness * 0.8, brightness * 0.8);
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
        
        // Quantum probability distribution (softer falloff for better visibility)
        float probability = exp(-distance * distance * 4.0);
        
        // Add quantum uncertainty flickering (more pronounced)
        float uncertainty = sin(time * 10.0 + distance * 20.0) * 0.5 + 0.8;
        
        // Wave function interference pattern (enhanced)
        float waveFunction = sin(distance * 40.0 - time * 5.0) * 0.3 + 0.9;
        
        // Combine quantum effects with increased brightness
        float finalAlpha = probability * uncertainty * waveFunction * vOpacity * 1.5;
        
        // Add energy level glow (brighter)
        vec3 glowColor = vColor * (1.5 + sin(time * 3.0) * 0.5);
        
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

    // Load audio file after scene setup
    await loadAudioFile();

    const animate = (): void => {
      const elapsed = clock.getElapsedTime();

      // Update Mars shader time and lighting
      if (marsMaterial.uniforms.uTime) {
        marsMaterial.uniforms.uTime.value = elapsed;
      }
      if (marsMaterial.uniforms.uSunPosition) {
        // Fixed sun position for consistent lighting
        marsMaterial.uniforms.uSunPosition.value.set(5, 10, 7.5);
      }

      // Mars rotation around itself only (realistic Mars day = 24.6 hours)
      mars.rotation.y = elapsed * 0.05; // Slow realistic rotation

      // Enhanced Camera Transition System with Cinematic Easing
      if (cameraTransitionRef.current?.isTransitioning) {
        const now = Date.now();
        const elapsedTime = now - cameraTransitionRef.current.startTime;
        const progress = Math.min(elapsedTime / cameraTransitionRef.current.duration, 1.0);
        
        // Apply cinematic easing curve
        const easedProgress = cameraTransitionRef.current.easeFunction(progress);
        
        // Smooth interpolation with velocity control
        const radiusDelta = cameraTransitionRef.current.targetRadius - cameraTransitionRef.current.startRadius;
        const angleXDelta = cameraTransitionRef.current.targetAngleX - cameraTransitionRef.current.startAngleX;
        const angleYDelta = cameraTransitionRef.current.targetAngleY - cameraTransitionRef.current.startAngleY;
        
        // Handle angle wraparound for smooth rotation
        let adjustedAngleXDelta = angleXDelta;
        if (Math.abs(angleXDelta) > Math.PI) {
          adjustedAngleXDelta = angleXDelta > 0 
            ? angleXDelta - 2 * Math.PI 
            : angleXDelta + 2 * Math.PI;
        }
        
        // Apply interpolated values
        cameraRadiusRef.current = cameraTransitionRef.current.startRadius + radiusDelta * easedProgress;
        lookAngleXRef.current = cameraTransitionRef.current.startAngleX + adjustedAngleXDelta * easedProgress;
        lookAngleYRef.current = cameraTransitionRef.current.startAngleY + angleYDelta * easedProgress;
        
        // Complete transition
        if (progress >= 1.0) {
          cameraTransitionRef.current = null;
          
          // FIX #2: Sync targets when transition completes
          syncCameraTargets();
        }
      }
      
      // Handle parabolic orbit motion (only if not transitioning)
      if (parabolicOrbitRef.current?.isActive && !cameraTransitionRef.current?.isTransitioning) {
        const now = Date.now();
        const elapsed = now - parabolicOrbitRef.current.startTime;
        const progress = elapsed / parabolicOrbitRef.current.duration;
        
        // End orbit after one complete loop
        if (progress >= 1.0) {
          parabolicOrbitRef.current = null;
          setParabolicOrbit(false);
          // Stop audio when orbit completes
          stopAmbientAudio();
          
          // FIX #2: Sync targets when orbit ends naturally to prevent camera jumps
          syncCameraTargets();
        } else {
          // CUSTOM HAND-DRAWN PATH - 2 minutes continuous with ULTRA-SMOOTH transitions
          // Camera ALWAYS looks at center (0,0,0) - only position changes
          const segmentCount = 9;
          
          // Use smooth continuous progress for seamless transitions
          const cycleProgress = progress; // 0 to 1 over 2 minutes
          const continuousSegmentProgress = cycleProgress * segmentCount; // 0 to 9
          const currentSegmentIndex = Math.floor(continuousSegmentProgress) % segmentCount;
          const segmentProgress = continuousSegmentProgress % 1; // 0-1 within current segment
          
          // Smooth transition factor - creates seamless blending between segments
          const transitionZone = 0.1; // 10% of each segment for transition
          let blendFactor = 1.0;
          if (segmentProgress < transitionZone) {
            blendFactor = segmentProgress / transitionZone; // Blend in
          } else if (segmentProgress > (1 - transitionZone)) {
            blendFactor = (1 - segmentProgress) / transitionZone; // Blend out
          }
          
          let targetX: number, targetZ: number, targetRadius: number;
          let nextTargetX: number, nextTargetZ: number, nextTargetRadius: number;
          
          // Current segment calculation
          const calculateSegmentPosition = (segIndex: number, segProg: number) => {
            const normalizedSegIndex = segIndex % segmentCount;
            
            if (normalizedSegIndex === 0) {
              // GREEN #1: Circle segment (left side arc) - Starting from camera (5, 0)
              const centerX = 1.5;
              const centerZ = 2;
              const radius = 4;
              const startAngle = -0.3; // Start closer to camera position
              const endAngle = Math.PI * 0.7; // Smooth arc
              
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
          
          // Convert 2D path coordinates to 3D camera angles
          // Camera ALWAYS looks at center (0,0,0)
          const distanceFromCenter = Math.sqrt(targetX * targetX + targetZ * targetZ);
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
      updateSmoothCameraInterpolation();

      // 2D SIN wave animation - emanating from beneath main sphere
      for (let i = 0; i < positionAttr.count; i++) {
        const x = positionAttr.getX(i);
        const z = positionAttr.getZ(i);
        const y0 = baseY[i * 3 + 1];
        
        // Calculate distance from wave center (beneath main sphere)
        const distanceFromCenter = Math.sqrt(
          (x - waveCenter.x) * (x - waveCenter.x) + 
          (z - waveCenter.z) * (z - waveCenter.z)
        );
        
        // Create 2D SIN wave propagating outward
        const wavePhase = elapsed * waveSpeed - distanceFromCenter * waveFrequency;
        const waveHeight = Math.sin(wavePhase) * waveAmplitude;
        
        // Apply exponential fade with distance for natural look
        const fadeDistance = Math.exp(-distanceFromCenter * 0.2);
        const finalWaveHeight = waveHeight * fadeDistance;
        
        positionAttr.setY(i, y0 + finalWaveHeight);
      }
      positionAttr.needsUpdate = true;

      // Quantum Field Animation with Smooth Beat Sync
      const quantumTime = elapsed * 0.5;
      
      // Get smooth beat analysis data
      const analysis = audioAnalysisRef.current;
      const isAnalyzing = analysis.isAnalyzing;
      
      // Smooth beat influence - combines all response layers
      const smoothBeatStrength = analysis.currentBeatStrength;
      const quickResponse = analysis.quickPulse; // Immediate visual impact
      const mediumResponse = analysis.mediumWave; // Sustained effects
      const slowResponse = analysis.slowResonance; // Background ambience
      
      // Composite beat multiplier - organic combination of all layers
      const beatMultiplier = 1 + (
        quickResponse * 1.5 + // Quick spike for immediate response
        mediumResponse * 0.8 + // Medium wave for sustained effect
        slowResponse * 0.3 // Slow background influence
      );

      // Update quantum material uniforms with smooth beat sync
      if (quantumMaterial.uniforms.time) {
        quantumMaterial.uniforms.time.value = quantumTime;
      }
      if (quantumMaterial.uniforms.vacuumFluctuation) {
        const baseFluctuation = vacuumEnergyDensity * (1.0 + Math.sin(elapsed * 0.8) * 0.3);
        // SMOOTH BEAT SYNC: Gradual enhancement based on composite beat strength
        quantumMaterial.uniforms.vacuumFluctuation.value = baseFluctuation * beatMultiplier;
      }

      for (let i = 0; i < quantumParticleCount; i++) {
        const particle = quantumParticles[i];
        
        // SMOOTH Beat-Synced Quantum State Transitions
        const uncertaintyFactor = Math.sin(elapsed * 2.0 + particle.phase) * uncertaintyPrinciple;
        let stateTransitionProbability = 0.002 + Math.abs(uncertaintyFactor) * 0.005;
        
        // SMOOTH BEAT SYNC: Gradual increase based on composite beat strength
        if (isAnalyzing && smoothBeatStrength > 0.1) {
          stateTransitionProbability *= (1 + smoothBeatStrength * 2); // Smooth scaling instead of abrupt
        }
        
        if (Math.random() < stateTransitionProbability) {
          // Quantum state flip (virtual ↔ real)
          particle.quantumState = 1 - particle.quantumState;
          particle.lastInteraction = elapsed;
          
          // SMOOTH BEAT SYNC: Gradual energy enhancement
          const energyBoost = isAnalyzing ? smoothBeatStrength * 0.4 : 0; // Reduced and smoothed
          particle.energyLevel = Math.random() * 0.5 + 0.5 + energyBoost;
          
          // Update color based on new energy level (gray spectrum only)
          const brightness = Math.min(1.0, particle.energyLevel);
          const grayColor = new THREE.Color(brightness * 0.8, brightness * 0.8, brightness * 0.8);
          quantumColors[i * 3] = grayColor.r;
          quantumColors[i * 3 + 1] = grayColor.g;
          quantumColors[i * 3 + 2] = grayColor.b;
        }
        
        // Smooth Vacuum Fluctuations with beat sync
        const timeSinceInteraction = elapsed - particle.lastInteraction;
        let vacuumFluctuation = Math.sin(elapsed * 1.5 + particle.phase * 3) * 0.4 + 0.6;
        
        // SMOOTH BEAT SYNC: Gradual enhancement using medium wave
        if (isAnalyzing) {
          vacuumFluctuation *= (1 + mediumResponse * 0.6); // Smooth, sustained effect
        }
        
        // Update existence probability with quantum coherence effects
        const coherenceEffect = Math.sin(elapsed * quantumCoherence + particle.phase) * 0.2;
        particle.existenceProbability = Math.max(0.1, 
          Math.min(1.0, particle.existenceProbability + coherenceEffect * 0.01));
        
        // Smooth Quantum Entanglement Effects
        if (particle.entanglementPartner !== null && particle.entanglementPartner < quantumParticleCount) {
          const partner = quantumParticles[particle.entanglementPartner];
          
          if (Math.abs(particle.quantumState - partner.quantumState) > 0.5) {
            let entanglementStrength = 0.02;
            
            // SMOOTH BEAT SYNC: Gradual entanglement enhancement
            if (isAnalyzing) {
              entanglementStrength *= (1 + quickResponse * 1.2); // Use quick response for immediate effect
            }
            
            const distance = particle.currentPosition.distanceTo(partner.currentPosition);
            const influence = entanglementStrength / (1 + distance * 0.1);
            
            if (Math.random() < influence) {
              partner.quantumState = particle.quantumState;
              partner.spinDirection = -particle.spinDirection;
            }
          }
        }
        
        // Smooth Quantum Tunneling Effect
        let tunnelingProbability = 0.0008;
        if (isAnalyzing && quickResponse > 0.2) {
          tunnelingProbability *= (1 + quickResponse * 2); // Smooth scaling based on quick response
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
        }
        
        // Smooth Quantum Harmonic Oscillator Motion
        let oscillationFrequency = 0.1 + particle.energyLevel * 0.3;
        if (isAnalyzing) {
          // Use medium wave for sustained oscillation changes
          oscillationFrequency *= (1 + mediumResponse * 0.4);
        }
        
        const quantumOscillation = new THREE.Vector3(
          Math.sin(elapsed * oscillationFrequency + particle.phase) * 0.1,
          Math.sin(elapsed * oscillationFrequency * 0.8 + particle.phase * 1.2) * 0.1,
          Math.sin(elapsed * oscillationFrequency * 1.2 + particle.phase * 0.8) * 0.1
        );
        
        // Smooth Zero-Point Energy Fluctuations
        let zeroPointIntensity = vacuumEnergyDensity * 0.02;
        if (isAnalyzing) {
          // Use slow resonance for background energy enhancement
          zeroPointIntensity *= (1 + slowResponse * 1.5);
        }
        
        const zeroPointMotion = new THREE.Vector3(
          (Math.random() - 0.5) * zeroPointIntensity,
          (Math.random() - 0.5) * zeroPointIntensity,
          (Math.random() - 0.5) * zeroPointIntensity
        );
        
        // Update particle velocity with quantum effects
        particle.velocity.add(zeroPointMotion);
        particle.velocity.multiplyScalar(0.98);
        
        // Update position with quantum oscillation and motion
        particle.currentPosition.copy(particle.basePosition)
          .add(quantumOscillation.multiplyScalar(0.5))
          .add(particle.velocity.clone().multiplyScalar(0.5));
        
        // Quantum Confinement
        const distanceFromCenter = particle.currentPosition.length();
        const maxRadius = fieldRadius * 0.9;
        if (distanceFromCenter > maxRadius) {
          particle.currentPosition.normalize().multiplyScalar(maxRadius);
          particle.velocity.multiplyScalar(-0.3);
        }
        
        // Update visual properties with smooth beat sync
        quantumPositions[i * 3] = particle.currentPosition.x;
        quantumPositions[i * 3 + 1] = particle.currentPosition.y;
        quantumPositions[i * 3 + 2] = particle.currentPosition.z;
        
        // SMOOTH BEAT SYNC: Gradual visual enhancements
        let stateOpacity = particle.quantumState * 0.8 + 0.4;
        let sizeMultiplier = 1.0;
        
        if (isAnalyzing) {
          // Smooth brightness and size changes using composite response
          stateOpacity *= (1 + smoothBeatStrength * 0.4); // Gentle brightness increase
          sizeMultiplier *= (1 + quickResponse * 0.3); // Quick size response for visual impact
        }
        
        quantumOpacities[i] = particle.existenceProbability * stateOpacity * vacuumFluctuation * 1.8;
        
        // Smooth size fluctuation with beat sync
        const sizeFluctuation = 1.0 + uncertaintyFactor * 0.5;
        quantumSizes[i] = (0.04 + particle.energyLevel * 0.06) * sizeFluctuation * sizeMultiplier;
      }

      // Update geometry attributes
      quantumGeometry.attributes.position.needsUpdate = true;
      quantumGeometry.attributes.color.needsUpdate = true;
      quantumGeometry.attributes.size.needsUpdate = true;
      quantumGeometry.attributes.opacity.needsUpdate = true;

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

      (renderer as any).render(scene, camera);
      gl.endFrameEXP();
      requestAnimationFrame(animate);
    };

    animate();
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
      <GLView
        ref={glViewRef}
        style={styles.glView}
        onContextCreate={(gl) => {
          glViewRef.current = { gl };
          setupScene(gl);
        }}
      />
      
      {/* IRANVERSE Title - High-tech minimal design - NEVER MOVES */}
      <Animated.View style={[
        styles.titleContainer,
        {
          transform: [{
            translateY: titlePosition.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -40], // Move up by 40 pixels when orbit active only
            })
          }]
        }
      ]}>
        <Text style={styles.titleText}>IRANVERSE</Text>
      </Animated.View>
      
      {/* Enterprise Controls Row - Input Field, Play Button, Next Button */}
      <Animated.View style={[
        styles.controlsRowContainer, 
        { 
          opacity: controlsOpacity,
          transform: [{
            translateY: uiPositionAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -CONFIG.ANIMATION.KEYBOARD_SLIDE_DISTANCE],
            })
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
              autoCapitalize="sentences"
              autoCorrect={false}
              blurOnSubmit={false}
              showSoftInputOnFocus={false} // Disable native keyboard
              caretHidden={keyboardState === 'hidden'} // Cursor state synchronization
              editable={false} // Prevent native focus - use TouchableOpacity only
              accessible={false} // Hide from accessibility tree
              pointerEvents="none" // TouchableOpacity handles all interactions
              {...Platform.select({
                ios: {
                  keyboardType: 'default',
                  autoComplete: 'off',
                  textContentType: 'none',
                  contextMenuHidden: true
                },
                android: {
                  importantForAutofill: 'no'
                }
              })}
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
  titleContainer: {
    position: 'absolute',
    top: CONFIG.UI.TITLE_POSITION_TOP, // User selected position
    left: 6,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
  },
  titleText: {
    color: '#ffffff', // Changed to white
    fontSize: 32, // Increased from 24 to 32
    fontWeight: 'bold', // Changed from '100' to 'bold'
    letterSpacing: 6, // Slightly reduced for bold font readability
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
});

export default FirstScreen;








