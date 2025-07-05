// src/context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';

// Services and Types
import { authService } from '../services/authService';
import { deepLinkService } from '../utils/deepLinking';
import { User, LoginDto, RegisterDto, ApiErrorResponse } from '../types/auth.types';

// Token Storage Keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'iranverse_access_token',
  REFRESH_TOKEN: 'iranverse_refresh_token',
  USER_DATA: 'iranverse_user_data',
  DEVICE_ID: 'iranverse_device_id',
  LAST_LOGIN: 'iranverse_last_login',
} as const;

// Auth State Interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  hasHydrated: boolean;
  sessionExpiry: number | null;
  deviceId: string | null;
  lastLoginTime: number | null;
  networkStatus: 'online' | 'offline' | 'unknown';
  pendingActions: Array<() => Promise<void>>;
}

// Auth Actions
type AuthAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS'; payload: { user: User | null; deviceId: string } }
  | { type: 'INITIALIZE_ERROR' }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; sessionExpiry: number } }
  | { type: 'LOGIN_ERROR' }
  | { type: 'LOGOUT_START' }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { user: User; sessionExpiry: number } }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_NETWORK_STATUS'; payload: 'online' | 'offline' | 'unknown' }
  | { type: 'ADD_PENDING_ACTION'; payload: () => Promise<void> }
  | { type: 'CLEAR_PENDING_ACTIONS' }
  | { type: 'SESSION_EXPIRED' };

// Auth Context Interface
interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  hasHydrated: boolean;
  networkStatus: 'online' | 'offline' | 'unknown';
  
  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: (fromAllDevices?: boolean) => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  
  // Session Management
  checkSessionValidity: () => boolean;
  getSessionTimeRemaining: () => number;
  
  // Offline Support
  executeWhenOnline: (action: () => Promise<void>) => void;
  
  // Security
  verifyDeviceIntegrity: () => Promise<boolean>;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  hasHydrated: false,
  sessionExpiry: null,
  deviceId: null,
  lastLoginTime: null,
  networkStatus: 'unknown',
  pendingActions: [],
};

// Auth Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INITIALIZE_START':
      return {
        ...state,
        isInitializing: true,
        isLoading: true,
      };

    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        deviceId: action.payload.deviceId,
        isInitializing: false,
        isLoading: false,
        hasHydrated: true,
      };

    case 'INITIALIZE_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isInitializing: false,
        isLoading: false,
        hasHydrated: true,
      };

    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        sessionExpiry: action.payload.sessionExpiry,
        lastLoginTime: Date.now(),
      };

    case 'LOGIN_ERROR':
      return {
        ...state,
        isLoading: false,
      };

    case 'LOGOUT_START':
      return {
        ...state,
        isLoading: true,
      };

    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionExpiry: null,
        lastLoginTime: null,
        pendingActions: [],
      };

    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        sessionExpiry: action.payload.sessionExpiry,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'SET_NETWORK_STATUS':
      return {
        ...state,
        networkStatus: action.payload,
      };

    case 'ADD_PENDING_ACTION':
      return {
        ...state,
        pendingActions: [...state.pendingActions, action.payload],
      };

    case 'CLEAR_PENDING_ACTIONS':
      return {
        ...state,
        pendingActions: [],
      };

    case 'SESSION_EXPIRED':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        sessionExpiry: null,
        lastLoginTime: null,
      };

    default:
      return state;
  }
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Generate or retrieve device ID
  const getOrCreateDeviceId = useCallback(async (): Promise<string> => {
    try {
      let deviceId = await SecureStore.getItemAsync(TOKEN_KEYS.DEVICE_ID);
      
      if (!deviceId) {
        // Generate new device ID
        deviceId = `iranverse_${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await SecureStore.setItemAsync(TOKEN_KEYS.DEVICE_ID, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Error getting/creating device ID:', error);
      // Fallback to in-memory device ID
      return `iranverse_${Platform.OS}_${Date.now()}_fallback`;
    }
  }, []);

  // Network Status Monitor
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch({
        type: 'SET_NETWORK_STATUS',
        payload: state.isConnected === true ? 'online' : 
                state.isConnected === false ? 'offline' : 'unknown'
      });
    });

    return () => unsubscribe();
  }, []);

  // Execute Pending Actions When Online
  useEffect(() => {
    if (state.networkStatus === 'online' && state.pendingActions.length > 0) {
      const executePendingActions = async () => {
        for (const action of state.pendingActions) {
          try {
            await action();
          } catch (error) {
            console.error('Error executing pending action:', error);
          }
        }
        dispatch({ type: 'CLEAR_PENDING_ACTIONS' });
      };

      executePendingActions();
    }
  }, [state.networkStatus, state.pendingActions]);

  // Session Expiry Monitor
  useEffect(() => {
    if (!state.sessionExpiry || !state.isAuthenticated) return;

    const checkSessionExpiry = () => {
      const now = Date.now();
      const timeUntilExpiry = state.sessionExpiry! - now;
      
      if (timeUntilExpiry <= 0) {
        // Session expired
        dispatch({ type: 'SESSION_EXPIRED' });
        clearStoredTokens();
        
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => {} }]
        );
      } else if (timeUntilExpiry <= 5 * 60 * 1000) {
        // 5 minutes until expiry - attempt refresh
        refreshToken();
      }
    };

    // Check immediately
    checkSessionExpiry();

    // Set up interval to check every minute
    const interval = setInterval(checkSessionExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [state.sessionExpiry, state.isAuthenticated]);

  // Clear Stored Tokens
  const clearStoredTokens = useCallback(async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(TOKEN_KEYS.USER_DATA),
        SecureStore.deleteItemAsync(TOKEN_KEYS.LAST_LOGIN),
      ]);
    } catch (error) {
      console.error('Error clearing stored tokens:', error);
    }
  }, []);

  // Store Tokens Securely
  const storeTokens = useCallback(async (accessToken: string, refreshToken: string, user: User) => {
    try {
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refreshToken),
        SecureStore.setItemAsync(TOKEN_KEYS.USER_DATA, JSON.stringify(user)),
        SecureStore.setItemAsync(TOKEN_KEYS.LAST_LOGIN, Date.now().toString()),
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication data securely');
    }
  }, []);

  // Initialize Authentication State
  const initializeAuth = useCallback(async () => {
    dispatch({ type: 'INITIALIZE_START' });

    try {
      const deviceId = await getOrCreateDeviceId();
      
      const [accessToken, userData, lastLoginStr] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(TOKEN_KEYS.USER_DATA),
        SecureStore.getItemAsync(TOKEN_KEYS.LAST_LOGIN),
      ]);

      if (accessToken && userData) {
        const user = JSON.parse(userData) as User;
        const lastLogin = lastLoginStr ? parseInt(lastLoginStr) : null;
        
        // Verify token is still valid
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.user) {
            // Calculate session expiry (assuming 24 hour sessions)
            const sessionExpiry = lastLogin ? lastLogin + (24 * 60 * 60 * 1000) : Date.now() + (24 * 60 * 60 * 1000);
            
            dispatch({
              type: 'INITIALIZE_SUCCESS',
              payload: { user: response.user || null, deviceId }
            });
            
            dispatch({
              type: 'REFRESH_TOKEN_SUCCESS',
              payload: { user: response.user || null, sessionExpiry }
            });
          } else {
            throw new Error('Token validation failed');
          }
        } catch (error) {
          // Token invalid, clear stored data
          await clearStoredTokens();
          dispatch({
            type: 'INITIALIZE_SUCCESS',
            payload: { user: null, deviceId }
          });
        }
      } else {
        dispatch({
          type: 'INITIALIZE_SUCCESS',
          payload: { user: null, deviceId }
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      dispatch({ type: 'INITIALIZE_ERROR' });
    }
  }, [getOrCreateDeviceId, clearStoredTokens]);

  // Login Function
  const login = useCallback(async (credentials: LoginDto) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const loginData = {
        ...credentials,
        device_fingerprint: state.deviceId || await getOrCreateDeviceId(),
      };

      const response = await authService.login(loginData);

      if (response.success && response.user && response.tokens) {
        // Store tokens securely
        await storeTokens(
          response.tokens.access_token,
          response.tokens.refresh_token,
          response.user
        );

        // Calculate session expiry
        const sessionExpiry = Date.now() + (response.tokens.expires_in * 1000);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.user!,
            sessionExpiry,
          },
        });

        // Set up API client with new token
        authService.setAuthToken(response.tokens.access_token);
      } else {
        throw new Error('Invalid response from login service');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR' });
      throw error; // Re-throw to let the UI handle the error
    }
  }, [state.deviceId, getOrCreateDeviceId, storeTokens]);

  // Register Function
  const register = useCallback(async (userData: RegisterDto) => {
    dispatch({ type: 'LOGIN_START' }); // Same loading state for registration

    try {
      const response = await authService.register(userData);

      if (response.success && response.user) {
        // Registration successful, but user needs email verification
        // Don't log them in yet - they need to verify email first
        dispatch({ type: 'LOGIN_ERROR' }); // Reset loading state
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR' });
      throw error; // Re-throw to let the UI handle the error
    }
  }, []);

  // Logout Function
  const logout = useCallback(async (fromAllDevices: boolean = false) => {
    dispatch({ type: 'LOGOUT_START' });

    try {
      if (state.networkStatus === 'online') {
        if (fromAllDevices) {
          await authService.logoutFromAllDevices();
        } else {
          await authService.logout();
        }
      } else {
        // Offline - add to pending actions
        const logoutAction = async () => {
          if (fromAllDevices) {
            await authService.logoutFromAllDevices();
          } else {
            await authService.logout();
          }
        };
        
        dispatch({ type: 'ADD_PENDING_ACTION', payload: logoutAction });
      }

      // Clear local storage regardless of network status
      await clearStoredTokens();
      authService.clearAuthToken();

      dispatch({ type: 'LOGOUT_SUCCESS' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local data even if server logout fails
      await clearStoredTokens();
      authService.clearAuthToken();
      dispatch({ type: 'LOGOUT_SUCCESS' });
    }
  }, [state.networkStatus, clearStoredTokens]);

  // Refresh Token Function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshTokenValue = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
      
      if (!refreshTokenValue) {
        return false;
      }

      const response = await authService.refreshToken();

      if (response.success && response.user && response.tokens) {
        // Store new tokens
        await storeTokens(
          response.tokens.access_token,
          response.tokens.refresh_token,
          response.user
        );

        // Calculate new session expiry
        const sessionExpiry = Date.now() + (response.tokens.expires_in * 1000);

        dispatch({
          type: 'REFRESH_TOKEN_SUCCESS',
          payload: {
            user: response.user!,
            sessionExpiry,
          },
        });

        // Update API client with new token
        authService.setAuthToken(response.tokens.access_token);

        return true;
      } else {
        // Refresh failed - logout user
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Refresh failed - logout user
      await logout();
      return false;
    }
  }, [storeTokens, logout]);

  // Update User Function
  const updateUser = useCallback(async (userData: Partial<User>) => {
    try {
      const response = await authService.updateProfile(userData);

      if (response.success && response.user) {
        // Update stored user data
        await SecureStore.setItemAsync(TOKEN_KEYS.USER_DATA, JSON.stringify(response.user));

        dispatch({
          type: 'UPDATE_USER',
          payload: response.user || null,
        });
      } else {
        throw new Error('Failed to update user profile');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }, []);

  // Check Session Validity
  const checkSessionValidity = useCallback((): boolean => {
    if (!state.sessionExpiry || !state.isAuthenticated) {
      return false;
    }

    return Date.now() < state.sessionExpiry;
  }, [state.sessionExpiry, state.isAuthenticated]);

  // Get Session Time Remaining
  const getSessionTimeRemaining = useCallback((): number => {
    if (!state.sessionExpiry || !state.isAuthenticated) {
      return 0;
    }

    return Math.max(0, state.sessionExpiry - Date.now());
  }, [state.sessionExpiry, state.isAuthenticated]);

  // Execute When Online
  const executeWhenOnline = useCallback((action: () => Promise<void>) => {
    if (state.networkStatus === 'online') {
      action().catch(error => console.error('Error executing online action:', error));
    } else {
      dispatch({ type: 'ADD_PENDING_ACTION', payload: action });
    }
  }, [state.networkStatus]);

  // Verify Device Integrity
  const verifyDeviceIntegrity = useCallback(async (): Promise<boolean> => {
    try {
      const storedDeviceId = await SecureStore.getItemAsync(TOKEN_KEYS.DEVICE_ID);
      return storedDeviceId === state.deviceId;
    } catch (error) {
      console.error('Error verifying device integrity:', error);
      return false;
    }
  }, [state.deviceId]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Deep Link Handler
  useEffect(() => {
    deepLinkService.initialize((url) => {
      // Handle auth-related deep links
      if (url.includes('/auth/verify-email')) {
        // Handle email verification
        const params = deepLinkService.parseDeepLink(url);
        if (params.token) {
          // Navigate to email verification screen with token
        }
      } else if (url.includes('/auth/reset-password')) {
        // Handle password reset
        const params = deepLinkService.parseDeepLink(url);
        if (params.token) {
          // Navigate to password reset screen with token
        }
      }
    });

    return () => {
      deepLinkService.cleanup();
    };
  }, []);

  // Context Value
  const contextValue: AuthContextType = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitializing: state.isInitializing,
    hasHydrated: state.hasHydrated,
    networkStatus: state.networkStatus,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateUser,

    // Session Management
    checkSessionValidity,
    getSessionTimeRemaining,

    // Offline Support
    executeWhenOnline,

    // Security
    verifyDeviceIntegrity,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
