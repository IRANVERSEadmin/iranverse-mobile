import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LogoFeatureFlags {
  useSimpleLogo: boolean;
  enableAnimations: boolean;
  enableGyroscope: boolean;
  performanceMode: 'high' | 'medium' | 'low';
  maxAnimationComplexity: number;
}

const DEFAULT_LOGO_FLAGS: LogoFeatureFlags = {
  useSimpleLogo: false,
  enableAnimations: true,
  enableGyroscope: false,
  performanceMode: 'medium',
  maxAnimationComplexity: 3,
};

const STORAGE_KEY = '@iranverse_logo_feature_flags';

export class LogoFeatureFlagManager {
  private static instance: LogoFeatureFlagManager;
  private flags: LogoFeatureFlags = DEFAULT_LOGO_FLAGS;
  private loaded = false;

  static getInstance(): LogoFeatureFlagManager {
    if (!LogoFeatureFlagManager.instance) {
      LogoFeatureFlagManager.instance = new LogoFeatureFlagManager();
    }
    return LogoFeatureFlagManager.instance;
  }

  async loadFlags(): Promise<LogoFeatureFlags> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.flags = { ...DEFAULT_LOGO_FLAGS, ...JSON.parse(stored) };
      }
      this.loaded = true;
      return this.flags;
    } catch (error) {
      console.warn('Failed to load logo feature flags:', error);
      this.flags = DEFAULT_LOGO_FLAGS;
      this.loaded = true;
      return this.flags;
    }
  }

  async saveFlags(flags: Partial<LogoFeatureFlags>): Promise<void> {
    try {
      this.flags = { ...this.flags, ...flags };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.flags));
    } catch (error) {
      console.error('Failed to save logo feature flags:', error);
    }
  }

  getFlags(): LogoFeatureFlags {
    if (!this.loaded) {
      console.warn('Logo feature flags not loaded yet, using defaults');
    }
    return this.flags;
  }

  async setSimpleLogo(enabled: boolean): Promise<void> {
    await this.saveFlags({ useSimpleLogo: enabled });
  }

  async setAnimationsEnabled(enabled: boolean): Promise<void> {
    await this.saveFlags({ enableAnimations: enabled });
  }

  async setPerformanceMode(mode: 'high' | 'medium' | 'low'): Promise<void> {
    await this.saveFlags({ performanceMode: mode });
  }

  shouldUseSimpleLogo(): boolean {
    return this.flags.useSimpleLogo;
  }

  shouldEnableAnimations(): boolean {
    return this.flags.enableAnimations && !this.flags.useSimpleLogo;
  }

  shouldEnableGyroscope(): boolean {
    return this.flags.enableGyroscope && this.flags.enableAnimations && !this.flags.useSimpleLogo;
  }
}

export const logoFeatureFlags = LogoFeatureFlagManager.getInstance();