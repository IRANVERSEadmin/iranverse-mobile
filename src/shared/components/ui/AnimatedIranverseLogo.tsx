/**
 * Advanced Animated IRANVERSE Logo
 * 
 * Features:
 * - Entrance animations (draw-on effect)
 * - Pulse/breathing animations  
 * - Glow effects
 * - Interactive feedback
 * - Performance optimized
 */

import React, { useEffect } from 'react';
import { ViewStyle, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path, Circle, G, Defs, Filter, FeGaussianBlur } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface AnimatedIranverseLogoProps {
  size?: number;
  color?: string;
  variant?: 'brand' | 'white' | 'black' | 'auto';
  animationMode: 'entrance' | 'pulse' | 'glow' | 'interactive';
  autoStart?: boolean;
  onAnimationComplete?: () => void;
  style?: ViewStyle;
  testID?: string;
}

const AnimatedIranverseLogo: React.FC<AnimatedIranverseLogoProps> = ({
  size = 120,
  color,
  variant = 'brand',
  animationMode,
  autoStart = true,
  onAnimationComplete,
  style,
  testID = 'animated-iranverse-logo',
}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(animationMode === 'entrance' ? 0 : 1);
  const strokeDashoffset = useSharedValue(1000);
  const glowIntensity = useSharedValue(0);
  const rotation = useSharedValue(0);
  
  // Resolve color based on variant
  const logoColor = React.useMemo(() => {
    if (color) return color;
    
    switch (variant) {
      case 'brand':
        return '#EC602A';
      case 'white':
        return '#FFFFFF';
      case 'black':
        return '#000000';
      case 'auto':
        return colorScheme === 'dark' ? '#FFFFFF' : '#000000';
      default:
        return '#EC602A';
    }
  }, [variant, color, theme, colorScheme]);
  
  // Path data from original SVG
  const paths = {
    letterN: "M769.33,290.55c-26.69-11.28-56.35-6.03-77.58,13.78l-70.26,65.57c-21.36,19.93-7.25,55.72,21.96,55.72h0c8.15,0,16-3.09,21.96-8.66l70.26-65.58c3.19-2.98,6.49-2.45,8.7-1.5c4,1.74,4.84,4.97,4.84,7.38v265.45c0,4.36-2.63,6.42-4.84,7.38c-4,1.74-6.94,0.14-8.7-1.5L443.44,355.85l-20.56-19.19c-16.61-15.51-43.63-9.38-51.93,11.78l0,0c-4.82,12.29-1.65,26.27,8,35.28l312.8,291.95c21.23,19.81,50.88,25.06,77.56,13.79c27.02-11.42,44.28-38.26,44.28-67.6V358.14C813.59,328.82,796.34,301.97,769.33,290.55z",
    letterI: "M436.54,554.38c-8.15,0-16,3.09-21.96,8.66l-70.26,65.58c-3.19,2.98-6.49,2.45-8.7,1.5c-4-1.74-4.84-4.97-4.84-7.38V409.53c0-17.78-14.41-32.19-32.19-32.19h0c-17.78,0-32.19,14.41-32.19,32.19v213.19c0,29.29,16.69,54.74,43.56,66.42c9.52,4.14,19.43,6.16,29.2,6.16c17.84,0,35.25-6.72,49.08-19.63l70.26-65.57C479.86,590.16,465.75,554.38,436.54,554.38L436.54,554.38z",
    dotI: { cx: 322.47, cy: 321.13, r: 32.19 }
  };
  
  // Animation logic based on mode
  useEffect(() => {
    if (!autoStart) return;
    
    switch (animationMode) {
      case 'entrance':
        // Fade in and scale up
        opacity.value = withTiming(1, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        });
        scale.value = withSpring(1, {
          damping: 12,
          stiffness: 180,
          mass: 1,
        }, (finished) => {
          if (finished && onAnimationComplete) {
            onAnimationComplete();
          }
        });
        // Draw-on effect
        strokeDashoffset.value = withTiming(0, {
          duration: 1500,
          easing: Easing.inOut(Easing.cubic),
        });
        break;
        
      case 'pulse':
        // Breathing effect
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
            withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        );
        break;
        
      case 'glow':
        // Glow pulsing
        glowIntensity.value = withRepeat(
          withSequence(
            withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.2, { duration: 800, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        );
        break;
        
      case 'interactive':
        // Subtle rotation
        rotation.value = withRepeat(
          withSequence(
            withTiming(2, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
            withTiming(-2, { duration: 2000, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        break;
    }
  }, [animationMode, autoStart]);
  
  // Animated props for main group
  const animatedGroupProps = useAnimatedProps(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));
  
  // Animated props for glow
  const animatedGlowProps = useAnimatedProps(() => ({
    opacity: interpolate(glowIntensity.value, [0, 1], [0, 0.6]),
  }));
  
  return (
    <Animated.View style={[style, animatedGroupProps]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 1080 1080"
        testID={testID}
      >
        <Defs>
          <Filter id="glow">
            <FeGaussianBlur stdDeviation="8" />
          </Filter>
        </Defs>
        
        {/* Glow layer */}
        {animationMode === 'glow' && (
          <AnimatedG {...animatedGlowProps}>
            <Path
              d={paths.letterN}
              fill={logoColor}
              filter="url(#glow)"
              opacity={0.5}
            />
            <Path
              d={paths.letterI}
              fill={logoColor}
              filter="url(#glow)"
              opacity={0.5}
            />
            <Circle
              cx={paths.dotI.cx}
              cy={paths.dotI.cy}
              r={paths.dotI.r + 4}
              fill={logoColor}
              filter="url(#glow)"
              opacity={0.5}
            />
          </AnimatedG>
        )}
        
        {/* Main logo paths */}
        <G>
          <Path
            d={paths.letterN}
            fill={logoColor}
            strokeDasharray={animationMode === 'entrance' ? "1000" : "0"}
            strokeDashoffset={animationMode === 'entrance' ? "0" : "0"}
            stroke={animationMode === 'entrance' ? logoColor : 'none'}
            strokeWidth={animationMode === 'entrance' ? 2 : 0}
          />
          
          <Path
            d={paths.letterI}
            fill={logoColor}
            strokeDasharray={animationMode === 'entrance' ? "1000" : "0"}
            strokeDashoffset={animationMode === 'entrance' ? "0" : "0"}
            stroke={animationMode === 'entrance' ? logoColor : 'none'}
            strokeWidth={animationMode === 'entrance' ? 2 : 0}
          />
          
          <Circle
            cx={paths.dotI.cx}
            cy={paths.dotI.cy}
            r={paths.dotI.r}
            fill={logoColor}
          />
        </G>
      </Svg>
    </Animated.View>
  );
};

export default AnimatedIranverseLogo;
export type { AnimatedIranverseLogoProps };