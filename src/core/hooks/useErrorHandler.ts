// src/core/hooks/useErrorHandler.ts
// IRANVERSE Error Handler Hook - Component-level error management
// Provides easy error handling utilities for React components

import { useCallback, useEffect } from 'react';
import { errorHandler, ErrorReport, withErrorHandling, tryCatch } from '../utils/errorHandler';

export interface UseErrorHandlerOptions {
  context?: Record<string, any>;
  onError?: (error: ErrorReport) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  // Update error context when component mounts or options change
  useEffect(() => {
    if (options.context) {
      errorHandler.updateContext(options.context);
    }
  }, [options.context]);

  // Subscribe to error events if callback provided
  useEffect(() => {
    if (options.onError) {
      errorHandler.addErrorListener(options.onError);
      return () => {
        errorHandler.removeErrorListener(options.onError!);
      };
    }
  }, [options.onError]);

  // Capture error with component context
  const captureError = useCallback((
    error: Error | string,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ) => {
    return errorHandler.captureError(error, {
      severity,
      context: options.context,
    });
  }, [options.context]);

  // Wrap async function with error handling
  const wrapAsync = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T
  ): T => {
    return withErrorHandling(fn, options.context);
  }, [options.context]);

  // Try-catch wrapper
  const tryAsync = useCallback(async <T>(
    fn: () => Promise<T>,
    fallback?: T
  ): Promise<T | undefined> => {
    return tryCatch(fn, {
      fallback,
      context: options.context,
    });
  }, [options.context]);

  // Handle API calls with error handling
  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
      fallback?: T;
    }
  ): Promise<T | undefined> => {
    try {
      const result = await apiCall();
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      captureError(error as Error, 'medium');
      options?.onError?.(error as Error);
      return options?.fallback;
    }
  }, [captureError]);

  return {
    captureError,
    wrapAsync,
    tryAsync,
    handleApiCall,
  };
}

// Hook for handling form errors
export function useFormErrorHandler(formName: string) {
  const { captureError } = useErrorHandler({
    context: { form: formName },
  });

  const handleFieldError = useCallback((
    fieldName: string,
    error: string | Error
  ) => {
    captureError(error, 'low');
  }, [captureError]);

  const handleSubmitError = useCallback((
    error: Error,
    fields?: Record<string, string>
  ) => {
    captureError(error, 'medium');
    return fields || {};
  }, [captureError]);

  return {
    handleFieldError,
    handleSubmitError,
  };
}

// Hook for handling navigation errors
export function useNavigationErrorHandler() {
  const { captureError } = useErrorHandler({
    context: { type: 'navigation' },
  });

  const handleNavigationError = useCallback((
    error: Error,
    route?: string
  ) => {
    captureError(error, 'medium');
  }, [captureError]);

  return {
    handleNavigationError,
  };
}