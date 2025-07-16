// src/shared/components/ui/AuthButtons.tsx
// IRANVERSE Authentication Buttons - Grok Design System
// Enterprise-grade OAuth buttons with premium aesthetics
// Built for 90M users - Production ready

import React, { memo } from 'react';
import { ViewStyle } from 'react-native';
import Button, { ButtonProps } from './Button';
import SmartIcon from './SmartIcon';

// ========================================================================================
// OAUTH BUTTON COMPONENTS
// ========================================================================================

interface AuthButtonProps extends Omit<ButtonProps, 'leftIcon' | 'variant'> {
  style?: ViewStyle;
}

// X (Twitter) Authentication Button
export const XAuthButton = memo<AuthButtonProps>(({ children, ...props }) => (
  <Button
    variant="primary"
    leftIcon={<SmartIcon name="twitter" size={20} color="#FFFFFF" />}
    {...props}
  >
    {children}
  </Button>
));

XAuthButton.displayName = 'XAuthButton';

// Google Authentication Button
export const GoogleAuthButton = memo<AuthButtonProps>(({ children, ...props }) => (
  <Button
    variant="grok-auth"
    leftIcon={<SmartIcon name="google" size={20} color="#FFFFFF" />}
    {...props}
  >
    {children}
  </Button>
));

GoogleAuthButton.displayName = 'GoogleAuthButton';

// Apple Authentication Button
export const AppleAuthButton = memo<AuthButtonProps>(({ children, ...props }) => (
  <Button
    variant="grok-auth"
    leftIcon={<SmartIcon name="apple" size={20} color="#FFFFFF" />}
    {...props}
  >
    {children}
  </Button>
));

AppleAuthButton.displayName = 'AppleAuthButton';

// Export all auth buttons
export default {
  XAuthButton,
  GoogleAuthButton,
  AppleAuthButton,
};