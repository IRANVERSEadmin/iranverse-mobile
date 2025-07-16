import React, { useEffect, useState } from 'react';
import SimpleLogo, { SimpleLogoProps } from './SimpleLogo';
import AnimatedLogo, { AnimatedLogoProps } from './AnimatedLogo';
import { logoFeatureFlags, LogoFeatureFlags } from '../../../core/config/logoFeatureFlags';

export interface AdaptiveLogoProps extends SimpleLogoProps {
  animationMode?: AnimatedLogoProps['animation'];
  enableAnimations?: boolean;
  forceSimple?: boolean;
  onFallback?: (reason: 'feature_flag' | 'performance' | 'error') => void;
}

const AdaptiveLogo: React.FC<AdaptiveLogoProps> = ({
  animationMode = 'entrance',
  enableAnimations,
  forceSimple = false,
  onFallback,
  ...logoProps
}) => {
  const [flags, setFlags] = useState<LogoFeatureFlags | null>(null);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);

  useEffect(() => {
    const loadFlags = async () => {
      try {
        const loadedFlags = await logoFeatureFlags.loadFlags();
        setFlags(loadedFlags);
      } catch (error) {
        console.warn('Failed to load logo feature flags, using simple logo');
        setFallbackReason('error');
        onFallback?.('error');
      }
    };

    loadFlags();
  }, [onFallback]);

  const shouldUseSimpleLogo = () => {
    if (forceSimple) {
      setFallbackReason('forced');
      return true;
    }

    if (!flags) {
      return true; // Default to simple while loading
    }

    if (flags.useSimpleLogo) {
      setFallbackReason('feature_flag');
      onFallback?.('feature_flag');
      return true;
    }

    if (enableAnimations === false || !flags.enableAnimations) {
      setFallbackReason('performance');
      onFallback?.('performance');
      return true;
    }

    return false;
  };

  if (shouldUseSimpleLogo()) {
    return <SimpleLogo {...logoProps} />;
  }

  // Use AnimatedLogo with fallback to SimpleLogo on error
  try {
    return (
      <AnimatedLogo
        animation={animationMode}
        quality={flags?.performanceMode === 'high' ? 'high' : 'medium'}
        performanceMode={
          flags?.performanceMode === 'high' ? 'enterprise' : 
          flags?.performanceMode === 'low' ? 'power-save' : 'optimized'
        }
        enablePerformanceTracking={flags?.performanceMode === 'high'}
        respectReducedMotion={true}
        onAnimationError={() => {
          console.warn('AnimatedLogo error, falling back to SimpleLogo');
          setFallbackReason('error');
          onFallback?.('error');
        }}
        {...logoProps}
      />
    );
  } catch (error) {
    console.error('AnimatedLogo failed to render, using SimpleLogo:', error);
    return <SimpleLogo {...logoProps} />;
  }
};

export default AdaptiveLogo;