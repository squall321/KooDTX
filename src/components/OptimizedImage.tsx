/**
 * Optimized Image Component
 * Phase 168: Image optimization with caching and lazy loading
 *
 * Features:
 * - Fast loading with react-native-fast-image
 * - Lazy loading
 * - Placeholder support
 * - Error handling
 * - Caching strategies
 * - Progressive loading
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  Text,
  Animated,
  Platform,
} from 'react-native';
import FastImage, {
  FastImageProps,
  Priority,
  ResizeMode,
  Source,
} from 'react-native-fast-image';

export interface OptimizedImageProps extends Omit<FastImageProps, 'source'> {
  source: Source | number;
  placeholder?: number; // Local image for placeholder
  fallback?: number; // Local image for error
  lazy?: boolean;
  fadeIn?: boolean;
  fadeDuration?: number;
  showLoadingIndicator?: boolean;
  cache?: 'immutable' | 'web' | 'cacheOnly';
  priority?: 'low' | 'normal' | 'high';
  containerStyle?: ViewStyle;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: Error) => void;
  testID?: string;
}

/**
 * Optimized Image Component
 * Uses FastImage for better performance and caching
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  placeholder,
  fallback,
  lazy = false,
  fadeIn = true,
  fadeDuration = 300,
  showLoadingIndicator = true,
  cache = 'immutable',
  priority = 'normal',
  containerStyle,
  style,
  onLoadStart,
  onLoadEnd,
  onError,
  resizeMode = 'cover',
  testID,
  ...rest
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (shouldLoad && !loading && fadeIn) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [shouldLoad, loading, fadeIn, fadeDuration, fadeAnim]);

  const handleLoadStart = useCallback(() => {
    if (!mountedRef.current) return;
    setLoading(true);
    setError(false);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    if (!mountedRef.current) return;
    setLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  const handleError = useCallback(
    (err: any) => {
      if (!mountedRef.current) return;
      setLoading(false);
      setError(true);
      onError?.(new Error('Image load failed'));
    },
    [onError]
  );

  const handleLoad = useCallback(() => {
    setShouldLoad(true);
  }, []);

  // Map cache prop to FastImage cache
  const getCacheControl = (): 'immutable' | 'web' | 'cacheOnly' => {
    return cache;
  };

  // Map priority prop to FastImage priority
  const getPriority = (): Priority => {
    switch (priority) {
      case 'low':
        return FastImage.priority.low;
      case 'high':
        return FastImage.priority.high;
      default:
        return FastImage.priority.normal;
    }
  };

  // Map resizeMode to FastImage resizeMode
  const getResizeMode = (): ResizeMode => {
    const modes: Record<string, ResizeMode> = {
      cover: FastImage.resizeMode.cover,
      contain: FastImage.resizeMode.contain,
      stretch: FastImage.resizeMode.stretch,
      center: FastImage.resizeMode.center,
    };
    return modes[resizeMode] || FastImage.resizeMode.cover;
  };

  // Render error state
  if (error && fallback) {
    return (
      <View style={[styles.container, containerStyle]} testID={`${testID}-error`}>
        <FastImage
          source={fallback}
          style={style}
          resizeMode={getResizeMode()}
          testID={`${testID}-fallback`}
        />
      </View>
    );
  }

  // Render error message
  if (error && !fallback) {
    return (
      <View style={[styles.container, styles.errorContainer, containerStyle, style]} testID={`${testID}-error`}>
        <Text style={styles.errorText}>Failed to load image</Text>
      </View>
    );
  }

  // Lazy loading - show placeholder until triggered
  if (!shouldLoad) {
    return (
      <View style={[styles.container, containerStyle]} testID={`${testID}-lazy`}>
        {placeholder && (
          <FastImage
            source={placeholder}
            style={style}
            resizeMode={getResizeMode()}
            testID={`${testID}-placeholder`}
          />
        )}
        {!placeholder && <View style={[styles.placeholderBox, style]} />}
      </View>
    );
  }

  // Determine source format
  const imageSource: Source =
    typeof source === 'number'
      ? source
      : {
          uri: source.uri,
          priority: getPriority(),
          cache: getCacheControl(),
        };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {/* Placeholder while loading */}
      {loading && placeholder && (
        <FastImage
          source={placeholder}
          style={[style, styles.placeholder]}
          resizeMode={getResizeMode()}
          testID={`${testID}-placeholder`}
        />
      )}

      {/* Loading indicator */}
      {loading && showLoadingIndicator && !placeholder && (
        <View style={[styles.loadingContainer, style]}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}

      {/* Actual image */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          fadeIn && { opacity: fadeAnim },
        ]}
      >
        <FastImage
          {...rest}
          source={imageSource}
          style={style}
          resizeMode={getResizeMode()}
          onLoadStart={handleLoadStart}
          onLoad={handleLoadEnd}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          testID={`${testID}-image`}
        />
      </Animated.View>
    </View>
  );
};

/**
 * Preload images for better UX
 */
export const preloadImages = (sources: Source[]): void => {
  FastImage.preload(sources);
};

/**
 * Clear image cache
 */
export const clearImageCache = async (): Promise<void> => {
  await FastImage.clearMemoryCache();
  await FastImage.clearDiskCache();
};

/**
 * Get cache size
 */
export const getCacheSize = async (): Promise<string> => {
  // Note: FastImage doesn't provide this API
  // This is a placeholder for future implementation
  return '0 MB';
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholderBox: {
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
  },
});

export default OptimizedImage;
