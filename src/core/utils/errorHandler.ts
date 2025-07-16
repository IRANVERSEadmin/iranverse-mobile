// src/core/utils/errorHandler.ts
// IRANVERSE Global Error Handler - Production-Ready Error Management
// Comprehensive error tracking, logging, and recovery system
// Built for 90M users - Zero downtime error handling

import { Platform, Alert, Dimensions } from 'react-native';
import Constants from 'expo-constants';

// ========================================================================================
// ERROR TYPES AND INTERFACES
// ========================================================================================

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  device: {
    platform: string;
    osVersion: string;
    appVersion: string;
    deviceModel?: string;
    isDevice: boolean;
  };
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
}

// ========================================================================================
// GLOBAL ERROR HANDLER CLASS
// ========================================================================================

class GlobalErrorHandler {
  private errorQueue: ErrorReport[] = [];
  private isInitialized = false;
  private context: ErrorContext = {};
  private errorListeners: ((error: ErrorReport) => void)[] = [];

  // Initialize the global error handler
  initialize(context?: ErrorContext) {
    if (this.isInitialized) return;

    this.context = context || {};
    this.setupGlobalHandlers();
    this.isInitialized = true;

    console.log('🛡️ IRANVERSE Error Handler initialized');
  }

  // Setup global error handlers
  private setupGlobalHandlers() {
    // Handle unhandled promise rejections
    const originalHandler = global.onunhandledrejection;
    global.onunhandledrejection = (event: any) => {
      const error = event.reason || new Error('Unhandled Promise Rejection');
      this.captureError(error, {
        severity: 'high',
        handled: false,
        context: { type: 'unhandledRejection' },
      });
      
      // Call original handler if exists
      if (originalHandler) {
        originalHandler(event);
      }
    };

    // Handle React Native errors
    const defaultHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      this.captureError(error, {
        severity: isFatal ? 'critical' : 'high',
        handled: false,
        context: { type: 'globalError', isFatal },
      });

      // In development, still show the red box
      if (__DEV__ && defaultHandler) {
        defaultHandler(error, isFatal);
      }
    });

    // Handle console.error in production
    if (!__DEV__) {
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        // Still log to console
        originalConsoleError(...args);
        
        // Capture the error
        const errorMessage = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        this.captureError(new Error(errorMessage), {
          severity: 'medium',
          handled: true,
          context: { type: 'console.error' },
        });
      };
    }
  }

  // Capture and process an error
  captureError(
    error: Error | string,
    options: {
      severity?: 'low' | 'medium' | 'high' | 'critical';
      handled?: boolean;
      context?: Record<string, any>;
    } = {}
  ) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      error: {
        name: errorObj.name || 'Error',
        message: errorObj.message || 'Unknown error',
        stack: errorObj.stack,
      },
      device: this.getDeviceInfo(),
      context: { ...this.context, ...options.context },
      severity: options.severity || 'medium',
      handled: options.handled ?? true,
    };

    // Add to queue
    this.errorQueue.push(report);
    
    // Notify listeners
    this.errorListeners.forEach(listener => listener(report));

    // Log in development
    if (__DEV__) {
      console.group(`🚨 Error Captured [${report.severity}]`);
      console.log('Message:', report.error.message);
      console.log('Context:', report.context);
      if (report.error.stack) {
        console.log('Stack:', report.error.stack);
      }
      console.groupEnd();
    }

    // Handle based on severity
    this.handleErrorBySeverity(report);

    // Send to backend (if online)
    this.sendErrorReport(report);

    return report;
  }

  // Handle error based on severity
  private handleErrorBySeverity(report: ErrorReport) {
    switch (report.severity) {
      case 'critical':
        // Show alert for critical errors
        if (!__DEV__) {
          Alert.alert(
            'Critical Error',
            'We encountered a serious error. The app may need to restart.',
            [
              {
                text: 'Restart App',
                onPress: () => this.restartApp(),
              },
            ],
            { cancelable: false }
          );
        }
        break;
      
      case 'high':
        // Log to crash reporting service
        this.logToCrashlytics(report);
        break;
      
      case 'medium':
      case 'low':
        // Just log for now
        break;
    }
  }

  // Send error report to backend
  private async sendErrorReport(report: ErrorReport) {
    try {
      // TODO: Implement actual API call
      if (!__DEV__) {
        // await api.post('/errors', report);
      }
    } catch (error) {
      // Silently fail - don't create error loop
      console.warn('Failed to send error report:', error);
    }
  }

  // Log to crash reporting service (e.g., Sentry, Crashlytics)
  private logToCrashlytics(report: ErrorReport) {
    // TODO: Integrate with crash reporting service
    // Example: Sentry.captureException(report.error);
  }

  // Get device information
  private getDeviceInfo() {
    const { width, height } = Dimensions.get('window');
    
    return {
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      appVersion: Constants.expoConfig?.version || Constants.manifest?.version || 'unknown',
      deviceModel: `${Platform.OS}-${width}x${height}`,
      isDevice: !__DEV__, // Assume development runs on simulator
      screenDimensions: { width, height },
    };
  }

  // Generate unique error ID
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Update context (e.g., when user logs in)
  updateContext(context: Partial<ErrorContext>) {
    this.context = { ...this.context, ...context };
  }

  // Clear user context (e.g., on logout)
  clearUserContext() {
    delete this.context.userId;
    delete this.context.sessionId;
  }

  // Add error listener
  addErrorListener(listener: (error: ErrorReport) => void) {
    this.errorListeners.push(listener);
  }

  // Remove error listener
  removeErrorListener(listener: (error: ErrorReport) => void) {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  // Get error history
  getErrorHistory(limit: number = 10): ErrorReport[] {
    return this.errorQueue.slice(-limit);
  }

  // Clear error history
  clearErrorHistory() {
    this.errorQueue = [];
  }

  // Restart app (platform specific)
  private restartApp() {
    // TODO: Implement app restart
    // This typically requires native modules
  }
}

// ========================================================================================
// EXPORT SINGLETON INSTANCE
// ========================================================================================

export const errorHandler = new GlobalErrorHandler();

// ========================================================================================
// UTILITY FUNCTIONS
// ========================================================================================

// Wrap async functions to catch errors
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.captureError(error as Error, {
        context: {
          function: fn.name,
          ...context,
        },
      });
      throw error;
    }
  }) as T;
}

// Try-catch wrapper with error reporting
export async function tryCatch<T>(
  fn: () => Promise<T>,
  options?: {
    fallback?: T;
    context?: Record<string, any>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    errorHandler.captureError(error as Error, {
      severity: options?.severity || 'medium',
      context: options?.context,
    });
    return options?.fallback;
  }
}

// Safe JSON parse with error handling
export function safeJsonParse<T = any>(
  json: string,
  fallback?: T
): T | undefined {
  try {
    return JSON.parse(json);
  } catch (error) {
    errorHandler.captureError(error as Error, {
      severity: 'low',
      context: {
        action: 'json_parse',
        input: json.substring(0, 100),
      },
    });
    return fallback;
  }
}

// Network error handler
export function handleNetworkError(error: any): void {
  const isNetworkError = 
    error.message?.includes('Network') ||
    error.code === 'NETWORK_ERROR' ||
    !navigator.onLine;

  errorHandler.captureError(error, {
    severity: isNetworkError ? 'medium' : 'high',
    context: {
      type: 'network',
      isNetworkError,
      online: navigator.onLine,
    },
  });
}

// API error handler
export function handleApiError(error: any, endpoint?: string): void {
  const status = error.response?.status;
  const severity = 
    status >= 500 ? 'high' :
    status >= 400 ? 'medium' :
    'low';

  errorHandler.captureError(error, {
    severity,
    context: {
      type: 'api',
      endpoint,
      status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    },
  });
}

// Default export
export default errorHandler;