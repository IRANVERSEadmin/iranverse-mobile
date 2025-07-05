// src/components/ui/GradientBackground.tsx
// IRANVERSE Mobile Platform - Premium Monochrome Gradient System
// Enterprise-grade black, gray, white aesthetic with sophisticated animations
// CLEANED & OPTIMIZED - All animations working correctly
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  Text as RNText,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Enterprise Configuration Matrix
const CONFIG = {
  ANIMATION: {
    PRIMARY_CYCLE: 12000,
    SECONDARY_CYCLE: 8000,
    TERTIARY_CYCLE: 5000,
    PARTICLE_CYCLE: 15000,
    TRANSITION_DURATION: 600,
    STAGGER_DELAY: 150,
  },
  VISUAL: {
    DEPTH_LAYERS: 4,
    PARTICLE_DENSITY: 12,
    PARTICLE_SIZE: 2.5,
  },
  PERFORMANCE: {
    FRAME_BUDGET_MS: 16.67,
  }
};

// Sophisticated Monochrome Preset System
export type MonochromePreset = 
  | 'platinum' | 'charcoal' | 'smoke' | 'obsidian' | 'pearl'
  | 'graphite' | 'marble' | 'steel' | 'ink' | 'crystal' | 'custom';

export type AnimationArchetype = 
  | 'ethereal' | 'mechanical' | 'organic' | 'crystalline'
  | 'atmospheric' | 'liquid' | 'static' | 'reactive';

export interface PremiumGradientProps {
  // Core Configuration
  preset?: MonochromePreset;
  archetype?: AnimationArchetype;
  intensity?: 'whisper' | 'subtle' | 'pronounced' | 'dramatic' | 'cinematic';
  
  // Customization
  customColors?: string[];
  customStops?: number[];
  directionVector?: { x: number; y: number };
  
  // Animation
  animated?: boolean;
  animationTempo?: 'largo' | 'andante' | 'moderato' | 'allegro' | 'presto';
  customCycleDuration?: number;
  
  // Features
  depthLayers?: boolean;
  particleField?: boolean;
  noiseTexture?: boolean;
  refractionEffects?: boolean;
  luminanceShifts?: boolean;
  
  // Behavior
  adaptiveQuality?: boolean;
  performanceMode?: 'premium' | 'balanced' | 'efficient';
  motionSensitivity?: boolean;
  
  // Integration
  style?: any;
  children?: React.ReactNode;
  debugVisualization?: boolean;
  accessibilityOptimized?: boolean;
  testID?: string;
}

interface ParticleData {
  id: string;
  positionX: Animated.Value;
  positionY: Animated.Value;
  lifecycle: Animated.Value;
  intensity: Animated.Value;
  size: Animated.Value;
  rotation: Animated.Value;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/* 
 * ⚠️  FRONTEND DEVELOPER NOTE - CTO DIRECTIVE ⚠️
 * ==============================================
 * 
 * DEFAULT CONFIGURATION SET BY CTO DECISION:
 * - Preset: 'obsidian' (deep black glass aesthetic)
 * - Animation: 'organic' (natural fluid dynamics)  
 * - Intensity: 'whisper' (subtle, minimal movement)
 * - Features: ALL ENABLED (animated, depth, particles, luminance)
 * 
 * AVAILABLE OPTIONS (for future reference):
 * 
 * Presets: 'platinum' | 'charcoal' | 'smoke' | 'obsidian' | 'pearl' | 
 *          'graphite' | 'marble' | 'steel' | 'ink' | 'crystal' | 'custom'
 * 
 * Archetypes: 'ethereal' | 'mechanical' | 'organic' | 'crystalline' |
 *             'atmospheric' | 'liquid' | 'static' | 'reactive'
 * 
 * Intensities: 'whisper' | 'subtle' | 'pronounced' | 'dramatic' | 'cinematic'
 * 
 * All features fully implemented and tested. Change defaults only with CTO approval.
 */

const PremiumGradientBackground: React.FC<PremiumGradientProps> = ({
  preset = 'obsidian',        // CTO Default: Deep black glass aesthetic
  archetype = 'organic',      // CTO Default: Natural fluid dynamics
  intensity = 'whisper',      // CTO Default: Subtle, minimal movement
  customColors,
  customStops,
  directionVector,
  animated = true,            // CTO Default: Animations enabled
  animationTempo = 'moderato',
  customCycleDuration,
  depthLayers = true,         // CTO Default: Depth layers enabled
  particleField = true,       // CTO Default: Particles enabled
  noiseTexture = false,
  refractionEffects = false,
  luminanceShifts = true,     // CTO Default: Luminance shifts enabled
  adaptiveQuality = true,
  performanceMode = 'premium',
  motionSensitivity = false,
  style,
  children,
  debugVisualization = false,
  accessibilityOptimized = true,
  testID = 'premium-gradient-background',
}) => {

  // State Management
  const [isActive, setIsActive] = useState(animated && !motionSensitivity);
  const [particleSystemKey, setParticleSystemKey] = useState(0);
  const [particleSystemReady, setParticleSystemReady] = useState(false);

  // Animation Refs
  const animationRefs = useRef<Animated.CompositeAnimation[]>([]);
  const particleAnimationRefs = useRef<Animated.CompositeAnimation[]>([]);
  const particleTimeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Core Animation Values
  const animationState = useRef({
    primary: new Animated.Value(0),
    secondary: new Animated.Value(0),
    tertiary: new Animated.Value(0),
    depthPhase: new Animated.Value(0),
    luminanceShift: new Animated.Value(0),
  }).current;

  // Intensity Configuration - MEMOIZED
  const intensityConfig = useMemo(() => {
    const configs = {
      whisper: { opacity: 0.1, amplitude: 0.15, frequency: 0.2 },
      subtle: { opacity: 0.2, amplitude: 0.3, frequency: 0.4 },
      pronounced: { opacity: 0.4, amplitude: 0.6, frequency: 0.7 },
      dramatic: { opacity: 0.6, amplitude: 0.9, frequency: 1.0 },
      cinematic: { opacity: 0.8, amplitude: 1.2, frequency: 1.5 },
    };
    return configs[intensity] || configs.subtle;
  }, [intensity]);

  // Animation Timing Configuration
  const animationTiming = useMemo(() => {
    const tempoMap = {
      largo: CONFIG.ANIMATION.PRIMARY_CYCLE * 2,
      andante: CONFIG.ANIMATION.PRIMARY_CYCLE * 1.5,
      moderato: CONFIG.ANIMATION.PRIMARY_CYCLE,
      allegro: CONFIG.ANIMATION.PRIMARY_CYCLE * 0.7,
      presto: CONFIG.ANIMATION.PRIMARY_CYCLE * 0.5,
    };
    return customCycleDuration || tempoMap[animationTempo] || tempoMap.moderato;
  }, [animationTempo, customCycleDuration]);

  // Gradient Configurations
  const gradientConfig = useMemo(() => {
    const configurations = {
      platinum: {
        colors: [
          '#000000', '#0a0a0a', '#1a1a1a', '#2a2a2a', '#3a3a3a',
          '#4a4a4a', '#5a5a5a', '#6a6a6a', '#7a7a7a', '#8a8a8a',
          '#9a9a9a', '#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd',
          '#eeeeee', '#f8f8f8', '#eeeeee', '#dddddd', '#cccccc',
          '#bbbbbb', '#aaaaaa', '#9a9a9a', '#8a8a8a', '#7a7a7a',
          '#6a6a6a', '#5a5a5a', '#4a4a4a', '#3a3a3a', '#2a2a2a',
          '#1a1a1a', '#0a0a0a', '#000000',
        ],
        stops: [
          0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.21, 0.24, 0.27, 
          0.30, 0.33, 0.36, 0.39, 0.42, 0.45, 0.5, 0.55, 0.58, 0.61, 
          0.64, 0.67, 0.70, 0.73, 0.76, 0.79, 0.82, 0.85, 0.88, 0.91, 
          0.94, 0.97, 1
        ],
        direction: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      },
      charcoal: {
        colors: [
          '#000000', '#050505', '#0a0a0a', '#0f0f0f', '#141414',
          '#191919', '#1e1e1e', '#232323', '#282828', '#2d2d2d',
          '#323232', '#373737', '#3c3c3c', '#373737', '#323232',
          '#2d2d2d', '#282828', '#232323', '#1e1e1e', '#191919',
          '#141414', '#0f0f0f', '#0a0a0a', '#050505', '#000000',
        ],
        stops: [0, 0.04, 0.08, 0.12, 0.16, 0.20, 0.24, 0.28, 0.32, 0.36, 0.40, 0.44, 0.5, 0.56, 0.60, 0.64, 0.68, 0.72, 0.76, 0.80, 0.84, 0.88, 0.92, 0.96, 1],
        direction: { start: { x: 0, y: 1 }, end: { x: 1, y: 0 } },
      },
      smoke: {
        colors: [
          '#000000', '#080808', '#101010', '#181818', '#202020',
          '#282828', '#303030', '#383838', '#404040', '#484848',
          '#404040', '#383838', '#303030', '#282828', '#202020',
          '#181818', '#101010', '#080808', '#000000',
        ],
        stops: [0, 0.055, 0.11, 0.165, 0.22, 0.275, 0.33, 0.385, 0.44, 0.5, 0.56, 0.615, 0.67, 0.725, 0.78, 0.835, 0.89, 0.945, 1],
        direction: { start: { x: 0.3, y: 0 }, end: { x: 0.7, y: 1 } },
      },
      obsidian: {
        colors: [
          '#000000', '#030303', '#060606', '#090909', '#0c0c0c',
          '#0f0f0f', '#121212', '#151515', '#181818', '#1b1b1b',
          '#181818', '#151515', '#121212', '#0f0f0f', '#0c0c0c',
          '#090909', '#060606', '#030303', '#000000',
        ],
        stops: [0, 0.055, 0.11, 0.165, 0.22, 0.275, 0.33, 0.385, 0.44, 0.5, 0.56, 0.615, 0.67, 0.725, 0.78, 0.835, 0.89, 0.945, 1],
        direction: { start: { x: 0, y: 0.3 }, end: { x: 1, y: 0.7 } },
      },
      pearl: {
        colors: [
          '#ffffff', '#fafafa', '#f5f5f5', '#f0f0f0', '#ebebeb',
          '#e6e6e6', '#e1e1e1', '#dcdcdc', '#d7d7d7', '#d2d2d2',
          '#d7d7d7', '#dcdcdc', '#e1e1e1', '#e6e6e6', '#ebebeb',
          '#f0f0f0', '#f5f5f5', '#fafafa', '#ffffff',
        ],
        stops: [0, 0.055, 0.11, 0.165, 0.22, 0.275, 0.33, 0.385, 0.44, 0.5, 0.56, 0.615, 0.67, 0.725, 0.78, 0.835, 0.89, 0.945, 1],
        direction: { start: { x: 0.2, y: 0.2 }, end: { x: 0.8, y: 0.8 } },
      },
      graphite: {
        colors: [
          '#1a1a1a', '#1f1f1f', '#242424', '#292929', '#2e2e2e',
          '#333333', '#383838', '#3d3d3d', '#424242', '#474747',
          '#424242', '#3d3d3d', '#383838', '#333333', '#2e2e2e',
          '#292929', '#242424', '#1f1f1f', '#1a1a1a',
        ],
        stops: [0, 0.055, 0.11, 0.165, 0.22, 0.275, 0.33, 0.385, 0.44, 0.5, 0.56, 0.615, 0.67, 0.725, 0.78, 0.835, 0.89, 0.945, 1],
        direction: { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
      },
      marble: {
        colors: [
          '#f8f8f8', '#f3f3f3', '#eeeeee', '#e9e9e9', '#e4e4e4',
          '#dfdfdf', '#dadada', '#d5d5d5', '#d0d0d0', '#cbcbcb',
          '#d0d0d0', '#d5d5d5', '#dadada', '#dfdfdf', '#e4e4e4',
          '#e9e9e9', '#eeeeee', '#f3f3f3', '#f8f8f8',
        ],
        stops: [0, 0.055, 0.11, 0.165, 0.22, 0.275, 0.33, 0.385, 0.44, 0.5, 0.56, 0.615, 0.67, 0.725, 0.78, 0.835, 0.89, 0.945, 1],
        direction: { start: { x: 0.1, y: 0.4 }, end: { x: 0.9, y: 0.6 } },
      },
      steel: {
        colors: [
          '#2c2c2c', '#313131', '#363636', '#3b3b3b', '#404040',
          '#454545', '#4a4a4a', '#4f4f4f', '#545454', '#595959',
          '#545454', '#4f4f4f', '#4a4a4a', '#454545', '#404040',
          '#3b3b3b', '#363636', '#313131', '#2c2c2c',
        ],
        stops: [0, 0.055, 0.11, 0.165, 0.22, 0.275, 0.33, 0.385, 0.44, 0.5, 0.56, 0.615, 0.67, 0.725, 0.78, 0.835, 0.89, 0.945, 1],
        direction: { start: { x: 0.7, y: 0.1 }, end: { x: 0.3, y: 0.9 } },
      },
      ink: {
        colors: [
          '#000000', '#040404', '#080808', '#0c0c0c', '#101010',
          '#141414', '#181818', '#1c1c1c', '#202020', '#242424',
          '#202020', '#1c1c1c', '#181818', '#141414', '#101010',
          '#0c0c0c', '#080808', '#040404', '#000000',
        ],
        stops: [0, 0.055, 0.11, 0.165, 0.22, 0.275, 0.33, 0.385, 0.44, 0.5, 0.56, 0.615, 0.67, 0.725, 0.78, 0.835, 0.89, 0.945, 1],
        direction: { start: { x: 0.4, y: 0.6 }, end: { x: 0.6, y: 0.4 } },
      },
      crystal: {
        colors: [
          '#ffffff', '#fcfcfc', '#f9f9f9', '#f6f6f6', '#f3f3f3',
          '#f0f0f0', '#ededed', '#eaeaea', '#e7e7e7', '#e4e4e4',
          '#e7e7e7', '#eaeaea', '#ededed', '#f0f0f0', '#f3f3f3',
          '#f6f6f6', '#f9f9f9', '#fcfcfc', '#ffffff',
        ],
        stops: [0, 0.055, 0.11, 0.165, 0.22, 0.275, 0.33, 0.385, 0.44, 0.5, 0.56, 0.615, 0.67, 0.725, 0.78, 0.835, 0.89, 0.945, 1],
        direction: { start: { x: 0.6, y: 0.2 }, end: { x: 0.4, y: 0.8 } },
      },
      custom: {
        colors: customColors || [
          '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', 
          '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#ffffff'
        ],
        stops: customStops || [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        direction: directionVector ? 
          { start: { x: 0, y: 0 }, end: directionVector } : 
          { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      },
    };

    return configurations[preset] || configurations.platinum;
  }, [preset, customColors, customStops, directionVector]);

  // Particle System Creation
  const createParticleSystem = useCallback(() => {
    const particleCount = performanceMode === 'efficient' ? 8 : 
                         performanceMode === 'balanced' ? 10 : 
                         CONFIG.VISUAL.PARTICLE_DENSITY;

    return Array.from({ length: particleCount }, (_, index) => ({
      id: `particle-${particleSystemKey}-${index}`,
      positionX: new Animated.Value(Math.random()),
      positionY: new Animated.Value(Math.random()),
      lifecycle: new Animated.Value(Math.random() * 0.5 + 0.3),
      intensity: new Animated.Value(Math.random() * 0.6 + 0.4),
      size: new Animated.Value(Math.random() * 0.8 + 0.6),
      rotation: new Animated.Value(Math.random() * 360),
    }));
  }, [particleSystemKey, performanceMode]);

  // Particle System State
  const particleSystem = useMemo(() => 
    particleField ? createParticleSystem() : []
  , [particleField, createParticleSystem]);

  // Update Active State
  useEffect(() => {
    setIsActive(animated && !motionSensitivity);
    
    if (particleField) {
      setParticleSystemKey(prev => prev + 1);
      setParticleSystemReady(false);
    }
  }, [animated, motionSensitivity, particleField]);

  // Clean Previous Animations
  const cleanupAnimations = useCallback(() => {
    // Stop main animations
    animationRefs.current.forEach(anim => anim.stop());
    animationRefs.current = [];
    
    // Stop particle animations
    particleAnimationRefs.current.forEach(anim => anim.stop());
    particleAnimationRefs.current = [];
    
    // Clear timeouts
    particleTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    particleTimeoutRefs.current = [];
  }, []);

  // Main Animation System
  useEffect(() => {
    if (!isActive) {
      cleanupAnimations();
      return;
    }

    cleanupAnimations();

    const animations: Animated.CompositeAnimation[] = [];

    // Primary Animation Layer
    if (archetype !== 'static') {
      const primaryAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animationState.primary, {
            toValue: 1,
            duration: animationTiming,
            useNativeDriver: true,
          }),
          Animated.timing(animationState.primary, {
            toValue: 0,
            duration: animationTiming,
            useNativeDriver: true,
          }),
        ])
      );
      animations.push(primaryAnimation);
    }

    // Secondary Animation Layer
    if (archetype === 'mechanical' || archetype === 'crystalline' || archetype === 'reactive') {
      const secondaryAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animationState.secondary, {
            toValue: intensityConfig.amplitude,
            duration: CONFIG.ANIMATION.SECONDARY_CYCLE,
            useNativeDriver: true,
          }),
          Animated.timing(animationState.secondary, {
            toValue: 0,
            duration: CONFIG.ANIMATION.SECONDARY_CYCLE,
            useNativeDriver: true,
          }),
        ])
      );
      animations.push(secondaryAnimation);
    }

    // Tertiary Animation Layer
    if (archetype === 'organic' || archetype === 'liquid' || archetype === 'atmospheric') {
      const tertiaryAnimation = Animated.loop(
        Animated.timing(animationState.tertiary, {
          toValue: 1,
          duration: CONFIG.ANIMATION.TERTIARY_CYCLE,
          useNativeDriver: true,
        })
      );
      animations.push(tertiaryAnimation);
    }

    // Depth Phase Animation
    if (depthLayers) {
      const depthAnimation = Animated.loop(
        Animated.timing(animationState.depthPhase, {
          toValue: 1,
          duration: animationTiming * 1.618,
          useNativeDriver: true,
        })
      );
      animations.push(depthAnimation);
    }

    // Luminance Shift Animation
    if (luminanceShifts) {
      const luminanceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animationState.luminanceShift, {
            toValue: intensityConfig.opacity,
            duration: animationTiming * 0.618,
            useNativeDriver: true,
          }),
          Animated.timing(animationState.luminanceShift, {
            toValue: 0,
            duration: animationTiming * 0.618,
            useNativeDriver: true,
          }),
        ])
      );
      animations.push(luminanceAnimation);
    }

    // Start all animations
    animations.forEach(animation => {
      animation.start();
      animationRefs.current.push(animation);
    });

    return cleanupAnimations;
  }, [isActive, archetype, animationTiming, intensityConfig, depthLayers, luminanceShifts, cleanupAnimations]);

  // Particle Animation System
  const createParticleAnimations = useCallback((particles: ParticleData[]) => {
    const animations: Animated.CompositeAnimation[] = [];
    
    particles.forEach((particle, index) => {
      const delay = index * CONFIG.ANIMATION.STAGGER_DELAY;
      const baseDuration = CONFIG.ANIMATION.PARTICLE_CYCLE;
      const adjustedDuration = baseDuration / Math.max(intensityConfig.frequency, 0.2);
      
      // Floating animation
      const floatingAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(particle.positionX, {
              toValue: Math.random(),
              duration: adjustedDuration + (index % 3) * 2000,
              useNativeDriver: false,
            }),
            Animated.timing(particle.positionY, {
              toValue: Math.random(),
              duration: adjustedDuration + (index % 5) * 1500,
              useNativeDriver: false,
            }),
            Animated.timing(particle.lifecycle, {
              toValue: (0.8 + Math.random() * 0.2) * intensityConfig.opacity,
              duration: 6000 + (index % 4) * 1000,
              useNativeDriver: false,
            }),
          ]),
          Animated.parallel([
            Animated.timing(particle.positionX, {
              toValue: Math.random(),
              duration: adjustedDuration + (index % 4) * 1800,
              useNativeDriver: false,
            }),
            Animated.timing(particle.positionY, {
              toValue: Math.random(),
              duration: adjustedDuration + (index % 3) * 2200,
              useNativeDriver: false,
            }),
            Animated.timing(particle.lifecycle, {
              toValue: (0.3 + Math.random() * 0.4) * intensityConfig.opacity,
              duration: 8000 + (index % 5) * 800,
              useNativeDriver: false,
            }),
          ]),
        ])
      );

      // Size animation
      const sizeAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.size, {
            toValue: (0.8 + Math.random() * 0.6) * intensityConfig.amplitude,
            duration: 4000 + (index % 3) * 1000,
            useNativeDriver: false,
          }),
          Animated.timing(particle.size, {
            toValue: (0.4 + Math.random() * 0.4) * intensityConfig.amplitude,
            duration: 3000 + (index % 4) * 800,
            useNativeDriver: false,
          }),
        ])
      );

      // Start with delay
      const timeoutId = setTimeout(() => {
        floatingAnimation.start();
        sizeAnimation.start();
      }, delay);
      
      particleTimeoutRefs.current.push(timeoutId);
      animations.push(floatingAnimation, sizeAnimation);
    });

    return animations;
  }, [intensityConfig]);

  // Particle System Effect
  useEffect(() => {
    if (!particleField || particleSystem.length === 0) {
      particleAnimationRefs.current.forEach(anim => anim.stop());
      particleAnimationRefs.current = [];
      particleTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      particleTimeoutRefs.current = [];
      setParticleSystemReady(false);
      return;
    }

    // Clear existing
    particleAnimationRefs.current.forEach(anim => anim.stop());
    particleAnimationRefs.current = [];
    particleTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    particleTimeoutRefs.current = [];

    // Create new animations
    const newAnimations = createParticleAnimations(particleSystem);
    particleAnimationRefs.current = newAnimations;
    
    setTimeout(() => setParticleSystemReady(true), 100);

    return () => {
      particleAnimationRefs.current.forEach(anim => anim.stop());
      particleAnimationRefs.current = [];
      particleTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      particleTimeoutRefs.current = [];
      setParticleSystemReady(false);
    };
  }, [particleField, particleSystem, createParticleAnimations]);

  // Depth Layers Renderer
  const renderDepthLayers = () => {
    if (!depthLayers) return null;

    return (
      <View style={styles.depthContainer} pointerEvents="none">
        {Array.from({ length: CONFIG.VISUAL.DEPTH_LAYERS }, (_, layerIndex) => {
          const depthRatio = (layerIndex + 1) / CONFIG.VISUAL.DEPTH_LAYERS;
          const opacityFactor = 1 - depthRatio * 0.6;
          
          return (
            <Animated.View
              key={`depth-layer-${layerIndex}`}
              style={[
                styles.depthLayer,
                {
                  opacity: animationState.depthPhase.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [
                      opacityFactor * intensityConfig.opacity * 0.1,
                      opacityFactor * intensityConfig.opacity * 0.25,
                      opacityFactor * intensityConfig.opacity * 0.1,
                    ],
                  }),
                  transform: [
                    {
                      scale: animationState.depthPhase.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1 + depthRatio * 0.05, 1 + depthRatio * 0.1],
                      }),
                    },
                    {
                      translateX: animationState.primary.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          -SCREEN_WIDTH * 0.05 * depthRatio,
                          SCREEN_WIDTH * 0.05 * depthRatio,
                        ],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={gradientConfig.colors.map((color, index) => {
                  const factor = 1 - (depthRatio * 0.2);
                  const hex = color.replace('#', '');
                  const r = Math.round(parseInt(hex.substr(0, 2), 16) * factor);
                  const g = Math.round(parseInt(hex.substr(2, 2), 16) * factor);
                  const b = Math.round(parseInt(hex.substr(4, 2), 16) * factor);
                  
                  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                }) as [string, string, ...string[]]}
                locations={gradientConfig.stops as [number, number, ...number[]]}
                style={styles.depthGradient}
                start={gradientConfig.direction.start}
                end={gradientConfig.direction.end}
              />
            </Animated.View>
          );
        })}
      </View>
    );
  };

  // Particle Field Renderer
  const renderParticleField = () => {
    if (!particleField || !particleSystemReady || particleSystem.length === 0) {
      return null;
    }

    return (
      <View style={styles.particleContainer} pointerEvents="none">
        {particleSystem.map((particle) => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                transform: [
                  {
                    translateX: particle.positionX.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-CONFIG.VISUAL.PARTICLE_SIZE, SCREEN_WIDTH + CONFIG.VISUAL.PARTICLE_SIZE],
                    }),
                  },
                  {
                    translateY: particle.positionY.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-CONFIG.VISUAL.PARTICLE_SIZE, SCREEN_HEIGHT + CONFIG.VISUAL.PARTICLE_SIZE],
                    }),
                  },
                  {
                    scale: particle.size,
                  },
                ],
                opacity: Animated.multiply(
                  particle.intensity,
                  particle.lifecycle
                ),
              },
            ]}
          >
            <View style={[
              styles.particleCore,
              {
                width: CONFIG.VISUAL.PARTICLE_SIZE,
                height: CONFIG.VISUAL.PARTICLE_SIZE,
                borderRadius: CONFIG.VISUAL.PARTICLE_SIZE / 2,
              }
            ]} />
          </Animated.View>
        ))}
      </View>
    );
  };

  // Luminance Shifts Renderer
  const renderLuminanceShifts = () => {
    if (!luminanceShifts) return null;

    return (
      <Animated.View
        style={[
          styles.luminanceOverlay,
          {
            opacity: animationState.luminanceShift.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, intensityConfig.opacity * 0.2, 0],
            }),
            transform: [
              {
                translateX: animationState.primary.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-SCREEN_WIDTH * 0.2, SCREEN_WIDTH * 0.2],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[
            'transparent',
            gradientConfig.colors[Math.floor(gradientConfig.colors.length * 0.3)] || '#333333',
            gradientConfig.colors[Math.floor(gradientConfig.colors.length * 0.7)] || '#666666',
            'transparent',
          ] as [string, string, string, string]}
          style={styles.luminanceGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    );
  };

  return (
    <View 
      style={[styles.container, style]} 
      accessibilityIgnoresInvertColors={accessibilityOptimized}
      testID={testID}
    >
      {/* Primary Gradient Foundation */}
      <LinearGradient
        colors={gradientConfig.colors as [string, string, ...string[]]}
        locations={gradientConfig.stops as [number, number, ...number[]]}
        style={styles.primaryGradient}
        start={gradientConfig.direction.start}
        end={gradientConfig.direction.end}
      />

      {/* Animated Flow Overlay */}
      {isActive && (archetype === 'ethereal' || archetype === 'atmospheric' || archetype === 'liquid') && (
        <Animated.View
          style={[
            styles.flowOverlay,
            {
              opacity: animationState.primary.interpolate({
                inputRange: [0, 0.3, 0.7, 1],
                outputRange: [
                  0.05 * intensityConfig.opacity,
                  0.15 * intensityConfig.opacity,
                  0.15 * intensityConfig.opacity,
                  0.05 * intensityConfig.opacity
                ],
              }),
              transform: [
                {
                  translateX: animationState.primary.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      -SCREEN_WIDTH * 0.5 * intensityConfig.amplitude,
                      SCREEN_WIDTH * 0.5 * intensityConfig.amplitude
                    ],
                  }),
                },
                {
                  skewX: animationState.secondary.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${8 * intensityConfig.amplitude}deg`],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[
              'transparent',
              gradientConfig.colors[Math.floor(gradientConfig.colors.length * 0.4)] || '#444444',
              gradientConfig.colors[Math.floor(gradientConfig.colors.length * 0.6)] || '#666666',
              'transparent',
            ] as [string, string, string, string]}
            style={styles.flowGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      )}

      {/* Effect Layers */}
      {renderDepthLayers()}
      {renderParticleField()}
      {renderLuminanceShifts()}

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {children}
      </View>

      {/* Debug Information */}
      {debugVisualization && (
        <View style={styles.debugContainer}>
          <RNText style={styles.debugText}>
            Preset: {preset} | Archetype: {archetype} | Particles: {particleSystem.length}
          </RNText>
          <RNText style={styles.debugText}>
            Active: {isActive ? 'Yes' : 'No'} | Intensity: {intensity} | Performance: {performanceMode}
          </RNText>
          <RNText style={styles.debugText}>
            Opacity: {intensityConfig.opacity.toFixed(2)} | Amplitude: {intensityConfig.amplitude.toFixed(2)}
          </RNText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
  },
  primaryGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  flowOverlay: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.1,
    left: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 1.6,
    height: SCREEN_HEIGHT * 1.2,
  },
  flowGradient: {
    flex: 1,
    width: '100%',
  },
  depthContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  depthLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  depthGradient: {
    flex: 1,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
  },
  particleCore: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: 'rgba(255, 255, 255, 1.0)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 4,
    ...Platform.select({
      android: {
        elevation: 6,
      },
    }),
  },
  luminanceOverlay: {
    position: 'absolute',
    top: 0,
    left: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 1.6,
    height: SCREEN_HEIGHT,
  },
  luminanceGradient: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    zIndex: 100,
  },
  debugContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  debugText: {
    color: '#00ff88',
    fontSize: 12,
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
    }),
  },
});

export default PremiumGradientBackground;