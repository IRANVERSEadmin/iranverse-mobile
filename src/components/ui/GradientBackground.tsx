// src/components/ui/GradientBackground.tsx
// IRANVERSE Mobile Platform - Simplified Monochrome Gradient System
// Fixed Configuration: obsidian + organic + subtle + moderato + premium
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

// Fixed Configuration
const CONFIG = {
  ANIMATION: {
    PRIMARY_CYCLE: 12000,      // moderato tempo
    SECONDARY_CYCLE: 8000,
    TERTIARY_CYCLE: 5000,
    PARTICLE_CYCLE: 15000,
    TRANSITION_DURATION: 600,
    STAGGER_DELAY: 150,
  },
  VISUAL: {
    DEPTH_LAYERS: 4,
    PARTICLE_DENSITY: 12,      // premium mode
    PARTICLE_SIZE: 2.5,
  },
  INTENSITY: {
    OPACITY: 0.2,              // subtle intensity
    AMPLITUDE: 0.3,
    FREQUENCY: 0.4,
  }
};

// Simplified Props Interface
export interface GradientBackgroundProps {
  // Animation Control
  animated?: boolean;
  
  // Features (all enabled by default for premium experience)
  depthLayers?: boolean;
  particleField?: boolean;
  luminanceShifts?: boolean;
  
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

// Fixed Obsidian Gradient Configuration
const OBSIDIAN_GRADIENT = {
  colors: [
    '#000000', '#030303', '#060606', '#090909', '#0c0c0c',
    '#0f0f0f', '#121212', '#151515', '#181818', '#1b1b1b',
    '#181818', '#151515', '#121212', '#0f0f0f', '#0c0c0c',
    '#090909', '#060606', '#030303', '#000000',
  ],
  stops: [0, 0.055, 0.11, 0.165, 0.22, 0.275, 0.33, 0.385, 0.44, 0.5, 0.56, 0.615, 0.67, 0.725, 0.78, 0.835, 0.89, 0.945, 1],
  direction: { start: { x: 0, y: 0.3 }, end: { x: 1, y: 0.7 } },
};

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  animated = true,
  depthLayers = true,
  particleField = true,
  luminanceShifts = true,
  style,
  children,
  debugVisualization = false,
  accessibilityOptimized = true,
  testID = 'gradient-background',
}) => {

  // State Management
  const [isActive, setIsActive] = useState(animated);
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

  // Particle System Creation
  const createParticleSystem = useCallback(() => {
    return Array.from({ length: CONFIG.VISUAL.PARTICLE_DENSITY }, (_, index) => ({
      id: `particle-${particleSystemKey}-${index}`,
      positionX: new Animated.Value(Math.random()),
      positionY: new Animated.Value(Math.random()),
      lifecycle: new Animated.Value(Math.random() * 0.5 + 0.3),
      intensity: new Animated.Value(Math.random() * 0.6 + 0.4),
      size: new Animated.Value(Math.random() * 0.8 + 0.6),
      rotation: new Animated.Value(Math.random() * 360),
    }));
  }, [particleSystemKey]);

  // Particle System State
  const particleSystem = useMemo(() => 
    particleField ? createParticleSystem() : []
  , [particleField, createParticleSystem]);

  // Update Active State
  useEffect(() => {
    setIsActive(animated);
    
    if (particleField) {
      setParticleSystemKey(prev => prev + 1);
      setParticleSystemReady(false);
    }
  }, [animated, particleField]);

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

  // Main Animation System (Organic Archetype)
  useEffect(() => {
    if (!isActive) {
      cleanupAnimations();
      return;
    }

    cleanupAnimations();

    const animations: Animated.CompositeAnimation[] = [];

    // Primary Animation Layer
    const primaryAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animationState.primary, {
          toValue: 1,
          duration: CONFIG.ANIMATION.PRIMARY_CYCLE,
          useNativeDriver: true,
        }),
        Animated.timing(animationState.primary, {
          toValue: 0,
          duration: CONFIG.ANIMATION.PRIMARY_CYCLE,
          useNativeDriver: true,
        }),
      ])
    );
    animations.push(primaryAnimation);

    // Tertiary Animation Layer (Organic characteristic)
    const tertiaryAnimation = Animated.loop(
      Animated.timing(animationState.tertiary, {
        toValue: 1,
        duration: CONFIG.ANIMATION.TERTIARY_CYCLE,
        useNativeDriver: true,
      })
    );
    animations.push(tertiaryAnimation);

    // Depth Phase Animation
    if (depthLayers) {
      const depthAnimation = Animated.loop(
        Animated.timing(animationState.depthPhase, {
          toValue: 1,
          duration: CONFIG.ANIMATION.PRIMARY_CYCLE * 1.618,
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
            toValue: CONFIG.INTENSITY.OPACITY,
            duration: CONFIG.ANIMATION.PRIMARY_CYCLE * 0.618,
            useNativeDriver: true,
          }),
          Animated.timing(animationState.luminanceShift, {
            toValue: 0,
            duration: CONFIG.ANIMATION.PRIMARY_CYCLE * 0.618,
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
  }, [isActive, depthLayers, luminanceShifts, cleanupAnimations]);

  // Particle Animation System
  const createParticleAnimations = useCallback((particles: ParticleData[]) => {
    const animations: Animated.CompositeAnimation[] = [];
    
    particles.forEach((particle, index) => {
      const delay = index * CONFIG.ANIMATION.STAGGER_DELAY;
      const baseDuration = CONFIG.ANIMATION.PARTICLE_CYCLE;
      const adjustedDuration = baseDuration / Math.max(CONFIG.INTENSITY.FREQUENCY, 0.2);
      
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
              toValue: (0.8 + Math.random() * 0.2) * CONFIG.INTENSITY.OPACITY,
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
              toValue: (0.3 + Math.random() * 0.4) * CONFIG.INTENSITY.OPACITY,
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
            toValue: (0.8 + Math.random() * 0.6) * CONFIG.INTENSITY.AMPLITUDE,
            duration: 4000 + (index % 3) * 1000,
            useNativeDriver: false,
          }),
          Animated.timing(particle.size, {
            toValue: (0.4 + Math.random() * 0.4) * CONFIG.INTENSITY.AMPLITUDE,
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
      
      particleTimeoutRefs.current.push(timeoutId as any);
      animations.push(floatingAnimation, sizeAnimation);
    });

    return animations;
  }, []);

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
                      opacityFactor * CONFIG.INTENSITY.OPACITY * 0.1,
                      opacityFactor * CONFIG.INTENSITY.OPACITY * 0.25,
                      opacityFactor * CONFIG.INTENSITY.OPACITY * 0.1,
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
                colors={OBSIDIAN_GRADIENT.colors.map((color, index) => {
                  const factor = 1 - (depthRatio * 0.2);
                  const hex = color.replace('#', '');
                  const r = Math.round(parseInt(hex.substr(0, 2), 16) * factor);
                  const g = Math.round(parseInt(hex.substr(2, 2), 16) * factor);
                  const b = Math.round(parseInt(hex.substr(4, 2), 16) * factor);
                  
                  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                }) as [string, string, ...string[]]}
                locations={OBSIDIAN_GRADIENT.stops as [number, number, ...number[]]}
                style={styles.depthGradient}
                start={OBSIDIAN_GRADIENT.direction.start}
                end={OBSIDIAN_GRADIENT.direction.end}
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
              outputRange: [0, CONFIG.INTENSITY.OPACITY * 0.2, 0],
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
            OBSIDIAN_GRADIENT.colors[Math.floor(OBSIDIAN_GRADIENT.colors.length * 0.3)] || '#333333',
            OBSIDIAN_GRADIENT.colors[Math.floor(OBSIDIAN_GRADIENT.colors.length * 0.7)] || '#666666',
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
      {/* Primary Obsidian Gradient Foundation */}
      <LinearGradient
        colors={OBSIDIAN_GRADIENT.colors as [string, string, ...string[]]}
        locations={OBSIDIAN_GRADIENT.stops as [number, number, ...number[]]}
        style={styles.primaryGradient}
        start={OBSIDIAN_GRADIENT.direction.start}
        end={OBSIDIAN_GRADIENT.direction.end}
      />

      {/* Organic Flow Overlay */}
      {isActive && (
        <Animated.View
          style={[
            styles.flowOverlay,
            {
              opacity: animationState.primary.interpolate({
                inputRange: [0, 0.3, 0.7, 1],
                outputRange: [
                  0.05 * CONFIG.INTENSITY.OPACITY,
                  0.15 * CONFIG.INTENSITY.OPACITY,
                  0.15 * CONFIG.INTENSITY.OPACITY,
                  0.05 * CONFIG.INTENSITY.OPACITY
                ],
              }),
              transform: [
                {
                  translateX: animationState.primary.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      -SCREEN_WIDTH * 0.5 * CONFIG.INTENSITY.AMPLITUDE,
                      SCREEN_WIDTH * 0.5 * CONFIG.INTENSITY.AMPLITUDE
                    ],
                  }),
                },
                {
                  skewX: animationState.secondary.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${8 * CONFIG.INTENSITY.AMPLITUDE}deg`],
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
              OBSIDIAN_GRADIENT.colors[Math.floor(OBSIDIAN_GRADIENT.colors.length * 0.4)] || '#444444',
              OBSIDIAN_GRADIENT.colors[Math.floor(OBSIDIAN_GRADIENT.colors.length * 0.6)] || '#666666',
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
            Configuration: obsidian + organic + subtle + moderato + premium
          </RNText>
          <RNText style={styles.debugText}>
            Active: {isActive ? 'Yes' : 'No'} | Particles: {particleSystem.length}
          </RNText>
          <RNText style={styles.debugText}>
            Opacity: {CONFIG.INTENSITY.OPACITY} | Amplitude: {CONFIG.INTENSITY.AMPLITUDE}
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

export default GradientBackground;
