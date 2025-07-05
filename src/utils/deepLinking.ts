// src/utils/deepLinking.ts
/**
 * IRANVERSE Deep Linking Service
 * Handles authentication-related deep links for email verification,
 * password reset, and OAuth callbacks with enterprise security
 */

import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { DeepLinkParams, DeepLinkRoutes } from '../types/auth.types';

// Deep link configuration
const DEEP_LINK_CONFIG = {
  // App scheme for IRANVERSE
  scheme: 'iranverse',
  // Host for app links
  host: 'app',
  // URL patterns
  patterns: {
    emailVerification: 'auth/verify-email',
    passwordReset: 'auth/reset-password',
    oauthCallback: 'auth/oauth-callback',
    login: 'auth/login',
    register: 'auth/register',
  },
  // Security settings
  security: {
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    maxRetries: 3,
    allowedHosts: ['iranverse.com', 'auth.iranverse.com', 'api.iranverse.com'],
  },
} as const;

// Deep link event handler type
type DeepLinkHandler = (url: string, params: DeepLinkParams) => void | Promise<void>;

// Deep link route configuration
interface RouteConfig {
  pattern: string;
  handler: DeepLinkHandler;
  requiresAuth?: boolean;
  security?: 'low' | 'medium' | 'high';
}

class DeepLinkService {
  private handlers: Map<string, DeepLinkHandler> = new Map();
  private routeConfigs: Map<string, RouteConfig> = new Map();
  private isInitialized = false;
  private linkingListener: any = null;

  /**
   * Initialize the deep link service
   */
  public initialize(defaultHandler?: DeepLinkHandler): void {
    if (this.isInitialized) {
      console.warn('DeepLinkService already initialized');
      return;
    }

    // Set up default routes
    this.setupDefaultRoutes();

    // Add default handler if provided
    if (defaultHandler) {
      this.setDefaultHandler(defaultHandler);
    }

    // Set up linking listener
    this.setupLinkingListener();

    // Handle initial URL if app was opened via deep link
    this.handleInitialURL();

    this.isInitialized = true;
  }

  /**
   * Clean up listeners and resources
   */
  public cleanup(): void {
    if (this.linkingListener) {
      this.linkingListener.remove();
      this.linkingListener = null;
    }
    this.handlers.clear();
    this.routeConfigs.clear();
    this.isInitialized = false;
  }

  /**
   * Register a handler for a specific route pattern
   */
  public registerHandler(
    pattern: string,
    handler: DeepLinkHandler,
    config?: Partial<RouteConfig>
  ): void {
    this.handlers.set(pattern, handler);
    this.routeConfigs.set(pattern, {
      pattern,
      handler,
      requiresAuth: config?.requiresAuth || false,
      security: config?.security || 'medium',
    });
  }

  /**
   * Set a default handler for unmatched routes
   */
  public setDefaultHandler(handler: DeepLinkHandler): void {
    this.handlers.set('__default__', handler);
  }

  /**
   * Parse deep link URL and extract parameters
   */
  public parseDeepLink(url: string): DeepLinkParams {
    try {
      const urlObj = new URL(url);
      const params: DeepLinkParams = {};

      // Extract query parameters
      urlObj.searchParams.forEach((value, key) => {
        params[key] = decodeURIComponent(value);
      });

      // Extract path segments as parameters
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        params.action = pathSegments[pathSegments.length - 1];
        params.path = pathSegments.join('/');
      }

      return params;
    } catch (error) {
      console.error('Error parsing deep link:', error);
      return {};
    }
  }

  /**
   * Validate deep link security
   */
  public validateDeepLink(url: string, securityLevel: 'low' | 'medium' | 'high' = 'medium'): boolean {
    try {
      const urlObj = new URL(url);

      // Check scheme
      if (urlObj.protocol !== `${DEEP_LINK_CONFIG.scheme}:`) {
        return false;
      }

      // Check host for high security
      if (securityLevel === 'high') {
        if (!DEEP_LINK_CONFIG.security.allowedHosts.includes(urlObj.hostname as any)) {
          return false;
        }
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /javascript:/i,
        /data:/i,
        /file:/i,
        /<script/i,
        /onload=/i,
        /onerror=/i,
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(url))) {
        return false;
      }

      // Check token expiry if present
      const params = this.parseDeepLink(url);
      if (params.expires) {
        const expiryTime = parseInt(params.expires, 10);
        if (isNaN(expiryTime) || Date.now() > expiryTime) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating deep link:', error);
      return false;
    }
  }

  /**
   * Generate deep link URL
   */
  public generateDeepLink(
    route: keyof typeof DEEP_LINK_CONFIG.patterns,
    params: DeepLinkParams = {}
  ): string {
    const pattern = DEEP_LINK_CONFIG.patterns[route];
    if (!pattern) {
      throw new Error(`Unknown route: ${route}`);
    }

    const url = new URL(`${DEEP_LINK_CONFIG.scheme}://${DEEP_LINK_CONFIG.host}/${pattern}`);

    // Add parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, encodeURIComponent(value));
      }
    });

    // Add security token expiry
    if (!params.expires) {
      const expiry = Date.now() + DEEP_LINK_CONFIG.security.tokenExpiry;
      url.searchParams.set('expires', expiry.toString());
    }

    return url.toString();
  }

  /**
   * Generate email verification deep link
   */
  public generateEmailVerificationLink(email: string, token: string): string {
    return this.generateDeepLink('emailVerification', {
      email,
      token,
      action: 'verify',
    });
  }

  /**
   * Generate password reset deep link
   */
  public generatePasswordResetLink(email: string, token: string): string {
    return this.generateDeepLink('passwordReset', {
      email,
      token,
      action: 'reset',
    });
  }

  /**
   * Generate OAuth callback deep link
   */
  public generateOAuthCallbackLink(provider: string, state: string): string {
    return this.generateDeepLink('oauthCallback', {
      provider,
      state,
      action: 'callback',
    });
  }

  /**
   * Handle deep link URL
   */
  public async handleDeepLink(url: string): Promise<boolean> {
    try {
      console.log('Handling deep link:', url);

      // Validate the URL first
      if (!this.validateDeepLink(url)) {
        console.error('Invalid deep link:', url);
        return false;
      }

      // Parse parameters
      const params = this.parseDeepLink(url);

      // Find matching route
      const route = this.findMatchingRoute(url);
      if (!route) {
        // Try default handler
        const defaultHandler = this.handlers.get('__default__');
        if (defaultHandler) {
          await defaultHandler(url, params);
          return true;
        }
        console.warn('No handler found for deep link:', url);
        return false;
      }

      // Check security requirements
      const config = this.routeConfigs.get(route);
      if (config?.security === 'high' && !this.validateDeepLink(url, 'high')) {
        console.error('High security validation failed for deep link:', url);
        return false;
      }

      // Execute handler
      const handler = this.handlers.get(route);
      if (handler) {
        await handler(url, params);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error handling deep link:', error);
      return false;
    }
  }

  /**
   * Open external URL with fallback
   */
  public async openExternalURL(url: string): Promise<void> {
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to web browser
        await WebBrowser.openBrowserAsync(url, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          showTitle: true,
          enableBarCollapsing: true,
        });
      }
    } catch (error) {
      console.error('Error opening external URL:', error);
      throw new Error('Unable to open URL');
    }
  }

  /**
   * Get the current app's deep link URL
   */
  public getAppURL(): string {
    return `${DEEP_LINK_CONFIG.scheme}://${DEEP_LINK_CONFIG.host}`;
  }

  /**
   * Check if URL is a valid app deep link
   */
  public isAppDeepLink(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === `${DEEP_LINK_CONFIG.scheme}:` &&
             urlObj.hostname === DEEP_LINK_CONFIG.host;
    } catch {
      return false;
    }
  }

  // Private methods

  private setupDefaultRoutes(): void {
    // Email verification route
    this.registerHandler(
      DEEP_LINK_CONFIG.patterns.emailVerification,
      this.handleEmailVerification.bind(this),
      { security: 'high' }
    );

    // Password reset route
    this.registerHandler(
      DEEP_LINK_CONFIG.patterns.passwordReset,
      this.handlePasswordReset.bind(this),
      { security: 'high' }
    );

    // OAuth callback route
    this.registerHandler(
      DEEP_LINK_CONFIG.patterns.oauthCallback,
      this.handleOAuthCallback.bind(this),
      { security: 'medium' }
    );

    // Login route
    this.registerHandler(
      DEEP_LINK_CONFIG.patterns.login,
      this.handleLoginRoute.bind(this),
      { security: 'low' }
    );

    // Register route
    this.registerHandler(
      DEEP_LINK_CONFIG.patterns.register,
      this.handleRegisterRoute.bind(this),
      { security: 'low' }
    );
  }

  private setupLinkingListener(): void {
    this.linkingListener = Linking.addEventListener('url', (event) => {
      this.handleDeepLink(event.url);
    });
  }

  private async handleInitialURL(): Promise<void> {
    try {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        // Delay to ensure app is fully loaded
        setTimeout(() => {
          this.handleDeepLink(initialURL);
        }, 1000);
      }
    } catch (error) {
      console.error('Error handling initial URL:', error);
    }
  }

  private findMatchingRoute(url: string): string | null {
    const urlObj = new URL(url);
    const path = urlObj.pathname.substring(1); // Remove leading slash

    // Check exact matches first
    for (const [route, config] of this.routeConfigs) {
      if (path === config.pattern || path.startsWith(config.pattern + '/')) {
        return route;
      }
    }

    // Check pattern matches
    for (const [route, config] of this.routeConfigs) {
      if (this.matchesPattern(path, config.pattern)) {
        return route;
      }
    }

    return null;
  }

  private matchesPattern(path: string, pattern: string): boolean {
    // Convert pattern to regex (basic implementation)
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\//g, '\\/');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  // Default route handlers

  private async handleEmailVerification(url: string, params: DeepLinkParams): Promise<void> {
    console.log('Handling email verification deep link:', params);
    // This will be handled by the AuthContext or navigation system
    // The handler can dispatch navigation events or call services
  }

  private async handlePasswordReset(url: string, params: DeepLinkParams): Promise<void> {
    console.log('Handling password reset deep link:', params);
    // This will be handled by the AuthContext or navigation system
  }

  private async handleOAuthCallback(url: string, params: DeepLinkParams): Promise<void> {
    console.log('Handling OAuth callback deep link:', params);
    // This will be handled by the OAuth service
  }

  private async handleLoginRoute(url: string, params: DeepLinkParams): Promise<void> {
    console.log('Handling login route deep link:', params);
    // Navigate to login screen
  }

  private async handleRegisterRoute(url: string, params: DeepLinkParams): Promise<void> {
    console.log('Handling register route deep link:', params);
    // Navigate to register screen
  }
}

// Export singleton instance
export const deepLinkService = new DeepLinkService();

// Export utility functions
export const createEmailVerificationLink = (email: string, token: string): string => {
  return deepLinkService.generateEmailVerificationLink(email, token);
};

export const createPasswordResetLink = (email: string, token: string): string => {
  return deepLinkService.generatePasswordResetLink(email, token);
};

export const parseDeepLinkParams = (url: string): DeepLinkParams => {
  return deepLinkService.parseDeepLink(url);
};

export const validateDeepLinkSecurity = (url: string): boolean => {
  return deepLinkService.validateDeepLink(url);
};

// React hook for deep link handling
import { useEffect, useCallback } from 'react';

export const useDeepLinking = (handler?: DeepLinkHandler) => {
  const handleURL = useCallback((url: string, params: DeepLinkParams) => {
    if (handler) {
      handler(url, params);
    } else {
      console.log('Deep link received:', url, params);
    }
  }, [handler]);

  useEffect(() => {
    if (!deepLinkService['isInitialized']) {
      deepLinkService.initialize(handleURL);
    } else if (handler) {
      deepLinkService.setDefaultHandler(handleURL);
    }

    return () => {
      if (deepLinkService['isInitialized']) {
        deepLinkService.cleanup();
      }
    };
  }, [handleURL]);

  return {
    handleDeepLink: deepLinkService.handleDeepLink.bind(deepLinkService),
    generateDeepLink: deepLinkService.generateDeepLink.bind(deepLinkService),
    openExternalURL: deepLinkService.openExternalURL.bind(deepLinkService),
    isAppDeepLink: deepLinkService.isAppDeepLink.bind(deepLinkService),
  };
};

export default deepLinkService;
