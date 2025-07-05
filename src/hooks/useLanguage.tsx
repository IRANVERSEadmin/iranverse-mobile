// src/hooks/useLanguage.ts
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { I18nManager, Platform } from 'react-native';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import message dictionaries
import { authMessages } from '../i18n/authMessages';
import { LocalizationConfig, TranslationKeys } from '../types/auth.types';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'iranverse_language_preference';

// Supported languages
export type SupportedLanguage = 'english' | 'farsi';
export type LanguageCode = 'en' | 'fa';

// Language configuration
interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  isRTL: boolean;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
}

// Language configurations
const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  english: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    isRTL: false,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'h:mm A',
    numberFormat: 'en-US',
    currencyFormat: 'USD',
  },
  farsi: {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    isRTL: true,
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm',
    numberFormat: 'fa-IR',
    currencyFormat: 'IRR',
  },
};

// Language detection utilities
export class LanguageDetector {
  /**
   * Detect device language
   */
  static detectDeviceLanguage(): SupportedLanguage {
    const deviceLocale = Localization.getLocales()[0]?.languageTag?.toLowerCase() || 'en';
    
    // Check for Persian/Farsi variants
    if (deviceLocale.includes('fa') || 
        deviceLocale.includes('persian') || 
        deviceLocale.includes('farsi') ||
        deviceLocale.includes('ir')) {
      return 'farsi';
    }
    
    // Default to English
    return 'english';
  }

  /**
   * Detect text language based on character analysis
   */
  static detectTextLanguage(text: string): SupportedLanguage {
    if (!text || text.trim().length === 0) {
      return 'english';
    }

    // Persian Unicode range: \u0600-\u06FF
    const persianChars = text.match(/[\u0600-\u06FF]/g);
    const englishChars = text.match(/[A-Za-z]/g);
    
    const persianCount = persianChars ? persianChars.length : 0;
    const englishCount = englishChars ? englishChars.length : 0;
    
    return persianCount > englishCount ? 'farsi' : 'english';
  }

  /**
   * Check if system supports RTL
   */
  static isRTLSupported(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }
}

// Hook for language management
export interface UseLanguageReturn {
  // Current language state
  language: SupportedLanguage;
  languageCode: LanguageCode;
  isRTL: boolean;
  config: LanguageConfig;
  
  // Language actions
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  detectAndSetLanguage: (text?: string) => Promise<void>;
  
  // Translation function
  t: (key: string, params?: Record<string, string | number>) => string;
  
  // Formatting utilities
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  formatNumber: (number: number) => string;
  formatCurrency: (amount: number) => string;
  
  // Utility functions
  isCurrentLanguage: (lang: SupportedLanguage) => boolean;
  getAvailableLanguages: () => Array<{ key: SupportedLanguage; label: string; nativeLabel: string }>;
}

export const useLanguage = (): UseLanguageReturn => {
  // State
  const [language, setLanguageState] = useState<SupportedLanguage>('english');
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoized configuration
  const config = useMemo(() => LANGUAGE_CONFIGS[language], [language]);
  const isRTL = useMemo(() => config.isRTL, [config]);
  const languageCode = useMemo(() => config.code, [config]);

  // Initialize language from storage or device settings
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // First, try to get saved language preference
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        
        if (savedLanguage && (savedLanguage === 'english' || savedLanguage === 'farsi')) {
          setLanguageState(savedLanguage as SupportedLanguage);
        } else {
          // Fallback to device language detection
          const detectedLanguage = LanguageDetector.detectDeviceLanguage();
          setLanguageState(detectedLanguage);
          
          // Save the detected language for future use
          await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLanguage);
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        // Fallback to English if there's an error
        setLanguageState('english');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeLanguage();
  }, []);

  // Update RTL layout when language changes
  useEffect(() => {
    if (!isInitialized) return;

    const updateRTLLayout = async () => {
      try {
        if (LanguageDetector.isRTLSupported()) {
          const shouldUseRTL = isRTL;
          
          // Only update if the RTL state is different
          if (I18nManager.isRTL !== shouldUseRTL) {
            await I18nManager.forceRTL(shouldUseRTL);
            
            // Note: In a real app, you might want to restart the app here
            // for RTL changes to take full effect on Android
            if (Platform.OS === 'android' && shouldUseRTL !== I18nManager.isRTL) {
              console.warn('RTL layout change requires app restart on Android');
            }
          }
        }
      } catch (error) {
        console.error('Error updating RTL layout:', error);
      }
    };

    updateRTLLayout();
  }, [isRTL, isInitialized]);

  // Set language function
  const setLanguage = useCallback(async (newLanguage: SupportedLanguage) => {
    try {
      setLanguageState(newLanguage);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  }, []);

  // Toggle language function
  const toggleLanguage = useCallback(async () => {
    const newLanguage = language === 'english' ? 'farsi' : 'english';
    await setLanguage(newLanguage);
  }, [language, setLanguage]);

  // Detect and set language based on text
  const detectAndSetLanguage = useCallback(async (text?: string) => {
    if (text) {
      const detectedLanguage = LanguageDetector.detectTextLanguage(text);
      if (detectedLanguage !== language) {
        await setLanguage(detectedLanguage);
      }
    } else {
      const deviceLanguage = LanguageDetector.detectDeviceLanguage();
      if (deviceLanguage !== language) {
        await setLanguage(deviceLanguage);
      }
    }
  }, [language, setLanguage]);

  // Translation function with fallback
  const t = useCallback((
    key: string, 
    params: Record<string, string | number> = {}
  ): string => {
    try {
      // Get the message from the appropriate language dictionary
      const messages = authMessages[language] || authMessages.english;
      let message = messages[key as keyof typeof messages];
      
      // Fallback to English if key not found in current language
      if (!message && language !== 'english') {
        message = authMessages.english[key as keyof typeof authMessages.english];
      }
      
      // If still no message, return the key itself
      if (!message) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }

      // Replace parameters in the message
      return Object.entries(params).reduce<string>(
        (msg, [paramKey, value]) => msg.replace(`{${paramKey}}`, String(value)),
        message
      );
    } catch (error) {
      console.error('Error in translation function:', error);
      return key;
    }
  }, [language]);

  // Format date according to language settings
  const formatDate = useCallback((date: Date): string => {
    try {
      if (language === 'farsi') {
        // Use Persian calendar for Farsi
        return new Intl.DateTimeFormat('fa-IR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(date);
      } else {
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(date);
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toDateString();
    }
  }, [language]);

  // Format time according to language settings
  const formatTime = useCallback((date: Date): string => {
    try {
      if (language === 'farsi') {
        return new Intl.DateTimeFormat('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(date);
      } else {
        return new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(date);
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return date.toTimeString();
    }
  }, [language]);

  // Format number according to language settings
  const formatNumber = useCallback((number: number): string => {
    try {
      if (language === 'farsi') {
        return new Intl.NumberFormat('fa-IR').format(number);
      } else {
        return new Intl.NumberFormat('en-US').format(number);
      }
    } catch (error) {
      console.error('Error formatting number:', error);
      return number.toString();
    }
  }, [language]);

  // Format currency according to language settings
  const formatCurrency = useCallback((amount: number): string => {
    try {
      if (language === 'farsi') {
        return new Intl.NumberFormat('fa-IR', {
          style: 'currency',
          currency: 'IRR',
          minimumFractionDigits: 0,
        }).format(amount);
      } else {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
      }
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${amount}`;
    }
  }, [language]);

  // Check if given language is current
  const isCurrentLanguage = useCallback((lang: SupportedLanguage): boolean => {
    return language === lang;
  }, [language]);

  // Get available languages list
  const getAvailableLanguages = useCallback(() => {
    return Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => ({
      key: key as SupportedLanguage,
      label: config.name,
      nativeLabel: config.nativeName,
    }));
  }, []);

  return {
    // Current language state
    language,
    languageCode,
    isRTL,
    config,
    
    // Language actions
    setLanguage,
    toggleLanguage,
    detectAndSetLanguage,
    
    // Translation function
    t,
    
    // Formatting utilities
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,
    
    // Utility functions
    isCurrentLanguage,
    getAvailableLanguages,
  };
};

// Language context for advanced use cases


interface LanguageContextType extends UseLanguageReturn {
  isInitialized: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const languageHook = useLanguage();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simple initialization check
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const value: LanguageContextType = {
    ...languageHook,
    isInitialized,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  
  return context;
};

// Export language detector for standalone use
// Export removed to avoid conflict

// Export language configurations
export { LANGUAGE_CONFIGS };

// Default export
export default useLanguage;
