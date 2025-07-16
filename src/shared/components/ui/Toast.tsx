// src/components/ui/Toast.tsx
// IRANVERSE Enterprise Toast - Global Notification System
// Tesla-inspired glassmorphism with queue management and enterprise features
// Built for 90M users - Revolutionary notification experience

import React, {
  memo,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import {
  View,
  Text,
  Animated,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Platform,
  Vibration,
  PanResponder,
  AccessibilityInfo,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import SmartIcon, { SmartCheckIcon, SmartCloseIcon } from './SmartIcon';

// ========================================================================================
// CONSTANTS & CONFIGURATION
// ========================================================================================

const TOAST_CONFIG = {
  MAX_TOASTS: 3,
  DEFAULT_DURATION: 4000,
  ANIMATION_DURATION: 300,
  SWIPE_THRESHOLD: 50,
  VERTICAL_OFFSET: {
    TOP: Platform.select({ ios: 50, android: 30, default: 30 }),
    BOTTOM: Platform.select({ ios: 100, android: 80, default: 80 }),
  },
  HAPTIC_PATTERNS: {
    SUCCESS: Platform.OS === 'ios' ? 10 : 30,
    ERROR: Platform.OS === 'ios' ? 20 : 50,
    WARNING: Platform.OS === 'ios' ? 15 : 40,
    INFO: Platform.OS === 'ios' ? 10 : 30,
  },
  PROGRESS_UPDATE_INTERVAL: 100,
  QUEUE_PROCESS_DELAY: 50,
} as const;

const TOAST_ANIMATIONS = {
  entrance: {
    duration: 300,
    tension: 40,
    friction: 8,
  },
  exit: {
    duration: 250,
    tension: 40,
    friction: 8,
  },
  swipe: {
    duration: 200,
    threshold: 100,
  },
  progress: {
    duration: 100,
  },
} as const;

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top' | 'bottom' | 'center';
export type ToastPriority = 'low' | 'normal' | 'high';

export interface ToastAction {
  label: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'primary';
}

export interface ToastOptions {
  id?: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
  progress?: number;
  persistent?: boolean;
  onDismiss?: () => void;
  priority?: ToastPriority;
  icon?: string;
  haptic?: boolean;
  analytics?: {
    category?: string;
    action?: string;
  };
}

export interface ToastRef {
  show: (options: ToastOptions) => string;
  hide: (id: string) => void;
  hideAll: () => void;
  update: (id: string, updates: Partial<ToastOptions>) => void;
}

export interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  position?: ToastPosition;
  offset?: number;
  swipeToDismiss?: boolean;
  hapticFeedback?: boolean;
  rtl?: boolean;
  testID?: string;
}

interface ToastInstance extends ToastOptions {
  id: string;
  timestamp: number;
  animationValue: Animated.Value;
  translateX: Animated.Value;
  progressValue: Animated.Value;
}

interface ToastContextValue {
  show: (options: ToastOptions) => string;
  hide: (id: string) => void;
  hideAll: () => void;
  update: (id: string, updates: Partial<ToastOptions>) => void;
}

// ========================================================================================
// TOAST CONTEXT
// ========================================================================================

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ========================================================================================
// TOAST ICONS
// ========================================================================================

const getToastIcon = (type: ToastType, customIcon?: React.ReactNode): React.ReactNode => {
  if (customIcon) return customIcon;
  
  const icons = {
    success: <SmartCheckIcon size={16} color="#FFFFFF" />,
    error: <SmartCloseIcon size={16} color="#FFFFFF" />,
    warning: <SmartIcon name="warning" size={16} color="#FFFFFF" />,
    info: <SmartIcon name="info" size={16} color="#FFFFFF" />,
    loading: <ActivityIndicator size="small" color="#FFFFFF" />,
  };
  
  return icons[type];
};

// ========================================================================================
// TOAST COMPONENT
// ========================================================================================

const ToastComponent = memo<{
  toast: ToastInstance;
  position: ToastPosition;
  onDismiss: (id: string) => void;
  swipeToDismiss: boolean;
  rtl: boolean;
}>(({ toast, position, onDismiss, swipeToDismiss, rtl }) => {
  const theme = useTheme();
  const [isInteracting, setIsInteracting] = useState(false);
  const dismissTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Pan responder for swipe to dismiss
  const panResponder = useMemo(() => {
    if (!swipeToDismiss) return { panHandlers: {} };
    
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        setIsInteracting(true);
        if (dismissTimer.current) {
          clearTimeout(dismissTimer.current);
        }
      },
      onPanResponderMove: Animated.event(
        [null, { dx: toast.translateX }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        setIsInteracting(false);
        
        if (Math.abs(gestureState.dx) > TOAST_CONFIG.SWIPE_THRESHOLD) {
          // Dismiss toast
          Animated.timing(toast.translateX, {
            toValue: gestureState.dx > 0 ? 500 : -500,
            duration: TOAST_ANIMATIONS.swipe.duration,
            useNativeDriver: true,
          }).start(() => {
            onDismiss(toast.id);
          });
        } else {
          // Snap back
          Animated.spring(toast.translateX, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
          
          // Resume auto-dismiss
          if (!toast.persistent && toast.duration) {
            const remainingTime = toast.duration - (Date.now() - toast.timestamp);
            if (remainingTime > 0) {
              dismissTimer.current = setTimeout(() => {
                onDismiss(toast.id);
              }, remainingTime);
            }
          }
        }
      },
    });
  }, [swipeToDismiss, toast, onDismiss]);
  
  // Auto dismiss
  useEffect(() => {
    if (!toast.persistent && toast.duration && !isInteracting) {
      dismissTimer.current = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);
    }
    
    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, [toast.id, toast.duration, toast.persistent, onDismiss, isInteracting]);
  
  // Progress animation
  useEffect(() => {
    if (toast.type === 'loading' && toast.progress !== undefined) {
      Animated.timing(toast.progressValue, {
        toValue: toast.progress,
        duration: TOAST_ANIMATIONS.progress.duration,
        useNativeDriver: false,
      }).start();
    }
  }, [toast.progress, toast.progressValue, toast.type]);
  
  // Announce to screen readers
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const announcement = `${toast.type} notification: ${toast.title}${toast.message ? `. ${toast.message}` : ''}`;
      AccessibilityInfo.announceForAccessibility(announcement);
    }
  }, [toast.type, toast.title, toast.message]);
  
  // Styles
  const getTypeStyles = useCallback(() => {
    const typeColors = {
      success: theme.colors.accent.success,
      error: theme.colors.accent.critical,
      warning: theme.colors.accent.warning,
      info: theme.colors.accent.primary,
      loading: theme.colors.accent.secondary,
    };
    
    return {
      borderColor: typeColors[toast.type],
      iconColor: typeColors[toast.type],
    };
  }, [toast.type, theme]);
  
  const containerStyle = useMemo((): any => {
    const typeStyles = getTypeStyles();
    
    return {
      position: 'absolute',
      left: theme.spacing.md,
      right: theme.spacing.md,
      maxWidth: 400,
      alignSelf: 'center',
      backgroundColor: 'rgba(10, 10, 10, 0.95)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: typeStyles.borderColor,
      ...theme.shadows.strong,
      backdropFilter: 'blur(20px)',
      overflow: 'hidden',
      opacity: toast.animationValue,
      transform: [
        {
          translateY: toast.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: position === 'top' ? [-100, 0] : position === 'bottom' ? [100, 0] : [0, 0],
          }),
        },
        {
          translateX: toast.translateX,
        },
        {
          scale: toast.animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
          }),
        },
      ],
    };
  }, [getTypeStyles, theme, toast.animationValue, toast.translateX, position]);
  
  const contentStyle = useMemo((): ViewStyle => ({
    padding: theme.spacing.md,
    flexDirection: rtl ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
  }), [theme, rtl]);
  
  const iconContainerStyle = useMemo((): ViewStyle => {
    const typeStyles = getTypeStyles();
    
    return {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: `${typeStyles.iconColor}20`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: rtl ? 0 : theme.spacing.sm,
      marginLeft: rtl ? theme.spacing.sm : 0,
    };
  }, [getTypeStyles, theme, rtl]);
  
  const textContainerStyle = useMemo((): ViewStyle => ({
    flex: 1,
    marginRight: toast.action ? theme.spacing.sm : 0,
  }), [toast.action, theme]);
  
  const titleStyle = useMemo((): TextStyle => ({
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.typography.families.primary,
    color: theme.colors.interactive.text.primary,
    marginBottom: toast.message ? 4 : 0,
    textAlign: rtl ? 'right' : 'left',
  }), [theme, toast.message, rtl]);
  
  const messageStyle = useMemo((): TextStyle => ({
    fontSize: 14,
    fontWeight: '400',
    fontFamily: theme.typography.families.primary,
    color: theme.colors.interactive.text.secondary,
    lineHeight: 20,
    textAlign: rtl ? 'right' : 'left',
  }), [theme, rtl]);
  
  const renderAction = useMemo(() => {
    if (!toast.action) return null;
    
    const actionColors = {
      default: theme.colors.interactive.text.secondary,
      primary: theme.colors.accent.primary,
      destructive: theme.colors.accent.critical,
    };
    
    return (
      <TouchableOpacity
        onPress={toast.action.onPress}
        style={{
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          borderRadius: 6,
          backgroundColor: toast.action.style === 'primary' ? `${theme.colors.accent.primary}20` : 'transparent',
        }}
        accessibilityRole="button"
        accessibilityLabel={toast.action.label}
      >
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          fontFamily: theme.typography.families.primary,
          color: actionColors[toast.action.style || 'default'],
        }}>
          {toast.action.label}
        </Text>
      </TouchableOpacity>
    );
  }, [toast.action, theme]);
  
  const renderProgress = useMemo(() => {
    if (toast.type !== 'loading' || toast.progress === undefined) return null;
    
    return (
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }}>
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: theme.colors.accent.secondary,
            width: toast.progressValue.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>
    );
  }, [toast.type, toast.progress, toast.progressValue, theme]);
  
  const typeStyles = getTypeStyles();
  
  return (
    <Animated.View
      style={containerStyle}
      {...panResponder.panHandlers}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={contentStyle}>
        <View style={iconContainerStyle}>
          {toast.type === 'loading' ? (
            <ActivityIndicator size="small" color={typeStyles.iconColor} />
          ) : (
            <Text style={{
              fontSize: 18,
              color: typeStyles.iconColor,
              fontWeight: '600',
            }}>
              {getToastIcon(toast.type, toast.icon)}
            </Text>
          )}
        </View>
        
        <View style={textContainerStyle}>
          <Text style={titleStyle}>{toast.title}</Text>
          {toast.message && <Text style={messageStyle}>{toast.message}</Text>}
        </View>
        
        {renderAction}
      </View>
      
      {renderProgress}
    </Animated.View>
  );
});

ToastComponent.displayName = 'ToastComponent';

// ========================================================================================
// TOAST PROVIDER
// ========================================================================================

export const ToastProvider = memo<ToastProviderProps>(({
  children,
  maxToasts = TOAST_CONFIG.MAX_TOASTS,
  position = 'top',
  offset,
  swipeToDismiss = true,
  hapticFeedback = true,
  rtl = false,
  testID = 'toast-provider',
}) => {
  const theme = useTheme();
  const [toasts, setToasts] = useState<ToastInstance[]>([]);
  const toastQueue = useRef<ToastInstance[]>([]);
  const isProcessingQueue = useRef(false);
  
  // Generate unique ID
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);
  
  // Process queue - declared with let to fix circular reference
  let processQueue: () => void;
  
  processQueue = useCallback(() => {
    if (isProcessingQueue.current || toastQueue.current.length === 0) return;
    
    isProcessingQueue.current = true;
    
    setTimeout(() => {
      setToasts(currentToasts => {
        if (currentToasts.length >= maxToasts) {
          isProcessingQueue.current = false;
          return currentToasts;
        }
        
        const nextToast = toastQueue.current.shift();
        if (!nextToast) {
          isProcessingQueue.current = false;
          return currentToasts;
        }
        
        // Trigger haptic feedback
        if (hapticFeedback && nextToast.haptic !== false) {
          Vibration.vibrate(TOAST_CONFIG.HAPTIC_PATTERNS[nextToast.type.toUpperCase() as keyof typeof TOAST_CONFIG.HAPTIC_PATTERNS]);
        }
        
        // Start entrance animation
        requestAnimationFrame(() => {
          Animated.spring(nextToast.animationValue, {
            toValue: 1,
            ...TOAST_ANIMATIONS.entrance,
            useNativeDriver: true,
          }).start();
        });
        
        isProcessingQueue.current = false;
        
        // Process next in queue
        if (toastQueue.current.length > 0) {
          processQueue();
        }
        
        return [...currentToasts, nextToast];
      });
    }, TOAST_CONFIG.QUEUE_PROCESS_DELAY);
  }, [maxToasts, hapticFeedback]);
  
  // Show toast
  const show = useCallback((options: ToastOptions): string => {
    const id = options.id || generateId();
    const duration = options.duration ?? TOAST_CONFIG.DEFAULT_DURATION;
    
    const newToast: ToastInstance = {
      ...options,
      id,
      duration,
      timestamp: Date.now(),
      animationValue: new Animated.Value(0),
      translateX: new Animated.Value(0),
      progressValue: new Animated.Value(options.progress || 0),
    };
    
    // Handle priority
    if (options.priority === 'high') {
      toastQueue.current.unshift(newToast);
    } else {
      toastQueue.current.push(newToast);
    }
    
    // Analytics
    if (options.analytics) {
      console.log('Toast shown:', {
        type: options.type,
        category: options.analytics.category,
        action: options.analytics.action,
      });
    }
    
    processQueue();
    
    return id;
  }, [generateId, processQueue]);
  
  // Hide toast
  const hide = useCallback((id: string) => {
    setToasts(currentToasts => {
      const toast = currentToasts.find(t => t.id === id);
      if (!toast) return currentToasts;
      
      Animated.timing(toast.animationValue, {
        toValue: 0,
        duration: TOAST_ANIMATIONS.exit.duration,
        useNativeDriver: true,
      }).start(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
        toast.onDismiss?.();
        
        // Process queue after dismissal
        processQueue();
      });
      
      return currentToasts;
    });
  }, [processQueue]);
  
  // Hide all toasts
  const hideAll = useCallback(() => {
    toasts.forEach(toast => {
      Animated.timing(toast.animationValue, {
        toValue: 0,
        duration: TOAST_ANIMATIONS.exit.duration,
        useNativeDriver: true,
      }).start();
    });
    
    setTimeout(() => {
      setToasts([]);
      toastQueue.current = [];
    }, TOAST_ANIMATIONS.exit.duration);
  }, [toasts]);
  
  // Update toast
  const update = useCallback((id: string, updates: Partial<ToastOptions>) => {
    setToasts(currentToasts =>
      currentToasts.map(toast =>
        toast.id === id
          ? {
              ...toast,
              ...updates,
              progressValue: updates.progress !== undefined
                ? (() => {
                    const newValue = new Animated.Value(toast.progress || 0);
                    Animated.timing(newValue, {
                      toValue: updates.progress,
                      duration: TOAST_ANIMATIONS.progress.duration,
                      useNativeDriver: false,
                    }).start();
                    return newValue;
                  })()
                : toast.progressValue,
            }
          : toast
      )
    );
  }, []);
  
  // Context value
  const contextValue = useMemo(() => ({
    show,
    hide,
    hideAll,
    update,
  }), [show, hide, hideAll, update]);
  
  // Container style
  const containerStyle = useMemo((): ViewStyle => {
    const baseOffset = offset ?? (position === 'top' ? TOAST_CONFIG.VERTICAL_OFFSET.TOP : TOAST_CONFIG.VERTICAL_OFFSET.BOTTOM);
    
    return {
      position: 'absolute',
      left: 0,
      right: 0,
      ...(position === 'top' && { top: baseOffset }),
      ...(position === 'bottom' && { bottom: baseOffset }),
      ...(position === 'center' && { top: '50%', transform: [{ translateY: -50 }] }),
      pointerEvents: 'box-none',
      zIndex: 9999,
    };
  }, [position, offset]);
  
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View style={containerStyle} testID={testID} pointerEvents="box-none">
        {toasts.map((toast, index) => (
          <View
            key={toast.id}
            style={{
              marginBottom: position === 'top' ? theme.spacing.sm : 0,
              marginTop: position === 'bottom' ? theme.spacing.sm : 0,
              zIndex: toasts.length - index,
            }}
            pointerEvents="box-none"
          >
            <ToastComponent
              toast={toast}
              position={position}
              onDismiss={hide}
              swipeToDismiss={swipeToDismiss}
              rtl={rtl}
            />
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
});

ToastProvider.displayName = 'ToastProvider';

// ========================================================================================
// TOAST IMPERATIVE API
// ========================================================================================

const ToastManager = forwardRef<ToastRef, {}>((_, ref) => {
  const toast = useToast();
  
  useImperativeHandle(ref, () => ({
    show: toast.show,
    hide: toast.hide,
    hideAll: toast.hideAll,
    update: toast.update,
  }), [toast]);
  
  return null;
});

ToastManager.displayName = 'ToastManager';

// ========================================================================================
// PRESET TOAST FUNCTIONS
// ========================================================================================

// Note: These are example implementations that would need to be used within a component
// that has access to the ToastContext via useToast hook
export const createToastPresets = (toast: ToastContextValue) => ({
  success: (title: string, options?: Partial<ToastOptions>) => {
    return toast.show({ ...options, type: 'success', title });
  },
  
  error: (title: string, options?: Partial<ToastOptions>) => {
    return toast.show({ ...options, type: 'error', title });
  },
  
  warning: (title: string, options?: Partial<ToastOptions>) => {
    return toast.show({ ...options, type: 'warning', title });
  },
  
  info: (title: string, options?: Partial<ToastOptions>) => {
    return toast.show({ ...options, type: 'info', title });
  },
  
  loading: (title: string, options?: Partial<ToastOptions>) => {
    return toast.show({ ...options, type: 'loading', title, persistent: true });
  },
  
  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: Partial<ToastOptions>
  ): Promise<T> => {
    const id = toast.show({ ...options, type: 'loading', title: messages.loading, persistent: true });
    
    try {
      const result = await promise;
      toast.hide(id);
      toast.show({
        ...options,
        type: 'success',
        title: typeof messages.success === 'function' ? messages.success(result) : messages.success,
      });
      return result;
    } catch (error) {
      toast.hide(id);
      toast.show({
        ...options,
        type: 'error',
        title: typeof messages.error === 'function' ? messages.error(error) : messages.error,
      });
      throw error;
    }
  },
});

// Hook to use toast with presets
export const useToastWithPresets = () => {
  const toast = useToast();
  return useMemo(() => ({
    ...toast,
    ...createToastPresets(toast),
  }), [toast]);
};

// ========================================================================================
// EXPORTS
// ========================================================================================

export { ToastManager };
export default ToastProvider;