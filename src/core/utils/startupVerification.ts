// src/utils/startupVerification.ts
// IRANVERSE Enterprise Startup Verification System
// Comprehensive dependency and component validation
// Built for 90M users - Production-ready error prevention

export interface StartupCheck {
  name: string;
  check: () => boolean | Promise<boolean>;
  critical: boolean;
  description: string;
}

export interface StartupResult {
  success: boolean;
  failedChecks: string[];
  warnings: string[];
  timestamp: number;
}

class StartupVerificationSystem {
  private checks: StartupCheck[] = [];

  constructor() {
    this.initializeDefaultChecks();
  }

  private initializeDefaultChecks() {
    // React Native Environment
    this.addCheck({
      name: 'react-native-core',
      check: () => {
        try {
          return typeof require('react-native') === 'object';
        } catch {
          return false;
        }
      },
      critical: true,
      description: 'React Native core modules',
    });

    // Navigation Dependencies
    this.addCheck({
      name: 'navigation-core',
      check: () => {
        try {
          require('@react-navigation/native');
          require('@react-navigation/native-stack');
          return true;
        } catch {
          return false;
        }
      },
      critical: true,
      description: 'React Navigation dependencies',
    });

    // Expo Dependencies
    this.addCheck({
      name: 'expo-core',
      check: () => {
        try {
          require('expo-status-bar');
          return true;
        } catch {
          return false;
        }
      },
      critical: true,
      description: 'Expo core dependencies',
    });

    // Animation Libraries
    this.addCheck({
      name: 'animation-libs',
      check: () => {
        try {
          require('react-native-reanimated');
          require('react-native-gesture-handler');
          return true;
        } catch {
          return false;
        }
      },
      critical: false,
      description: 'Animation and gesture libraries',
    });

    // Safe Area Dependencies
    this.addCheck({
      name: 'safe-area',
      check: () => {
        try {
          require('react-native-safe-area-context');
          return true;
        } catch {
          return false;
        }
      },
      critical: true,
      description: 'Safe area context provider',
    });

    // UI Component Dependencies
    this.addCheck({
      name: 'ui-components',
      check: () => {
        try {
          // Check if our theme provider exists
          require('../components/theme/ThemeProvider');
          return true;
        } catch {
          return false;
        }
      },
      critical: true,
      description: 'IRANVERSE UI component system',
    });
  }

  addCheck(check: StartupCheck) {
    this.checks.push(check);
  }

  async runVerification(): Promise<StartupResult> {
    const result: StartupResult = {
      success: true,
      failedChecks: [],
      warnings: [],
      timestamp: Date.now(),
    };

    console.log('🚀 IRANVERSE Startup Verification System');
    console.log('========================================');

    for (const check of this.checks) {
      try {
        console.log(`Checking ${check.name}...`);
        const checkResult = await check.check();
        
        if (!checkResult) {
          if (check.critical) {
            result.failedChecks.push(`${check.name}: ${check.description}`);
            result.success = false;
            console.error(`❌ CRITICAL: ${check.name} failed`);
          } else {
            result.warnings.push(`${check.name}: ${check.description}`);
            console.warn(`⚠️  WARNING: ${check.name} failed`);
          }
        } else {
          console.log(`✅ ${check.name} passed`);
        }
      } catch (error) {
        if (check.critical) {
          result.failedChecks.push(`${check.name}: Exception - ${error}`);
          result.success = false;
          console.error(`❌ CRITICAL: ${check.name} threw exception:`, error);
        } else {
          result.warnings.push(`${check.name}: Exception - ${error}`);
          console.warn(`⚠️  WARNING: ${check.name} threw exception:`, error);
        }
      }
    }

    console.log('========================================');
    if (result.success) {
      console.log('✅ All critical startup checks passed!');
    } else {
      console.error('❌ Critical startup checks failed:', result.failedChecks);
    }
    
    if (result.warnings.length > 0) {
      console.warn('⚠️  Warnings:', result.warnings);
    }

    return result;
  }
}

export const startupVerification = new StartupVerificationSystem();

// Export convenience function
export const verifyStartup = () => startupVerification.runVerification();