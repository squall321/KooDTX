/**
 * Asset Optimization Utilities
 * Phase 152: Helper functions for asset optimization
 *
 * Features:
 * - Image dimension calculation
 * - Asset preloading
 * - Memory management
 */

import { Image, Platform, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Calculate optimal image dimensions for screen
 */
export const calculateOptimalImageSize = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = SCREEN_WIDTH,
  maxHeight: number = SCREEN_HEIGHT
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // Scale down if too wide
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  // Scale down if too tall
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width, height };
};

/**
 * Get appropriate image resolution based on pixel ratio
 */
export const getImageResolution = (): '1x' | '2x' | '3x' => {
  const pixelRatio = Platform.select({
    ios: Image.resolveAssetSource({ uri: 'dummy' }).scale,
    android: 1,
    default: 1,
  });

  if (pixelRatio >= 3) return '3x';
  if (pixelRatio >= 2) return '2x';
  return '1x';
};

/**
 * Preload images
 */
export const preloadImages = async (
  imageUris: string[]
): Promise<void> => {
  try {
    const promises = imageUris.map(uri => {
      return Image.prefetch(uri);
    });
    await Promise.all(promises);
    console.log(`Successfully preloaded ${imageUris.length} images`);
  } catch (error) {
    console.error('Failed to preload images:', error);
  }
};

/**
 * Get image size from URI
 */
export const getImageSize = (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve({ width, height });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

/**
 * Calculate responsive size based on screen width
 */
export const responsiveSize = (size: number, baseWidth: number = 375): number => {
  return Math.round((size * SCREEN_WIDTH) / baseWidth);
};

/**
 * Calculate responsive font size
 */
export const responsiveFontSize = (fontSize: number, baseWidth: number = 375): number => {
  const scale = SCREEN_WIDTH / baseWidth;
  const newSize = fontSize * scale;
  return Math.round(newSize);
};

/**
 * Check if image URI is valid
 */
export const isValidImageUri = (uri: string): boolean => {
  if (!uri) return false;

  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const extension = uri.toLowerCase().substring(uri.lastIndexOf('.'));

  return validExtensions.includes(extension) || uri.startsWith('http') || uri.startsWith('data:image');
};

/**
 * Image optimization configuration
 */
export const ImageOptimizationConfig = {
  /**
   * Maximum image dimensions
   */
  maxDimensions: {
    thumbnail: { width: 100, height: 100 },
    small: { width: 200, height: 200 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 },
    full: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  },

  /**
   * Image quality settings (0-100)
   */
  quality: {
    thumbnail: 60,
    low: 70,
    medium: 80,
    high: 90,
    original: 100,
  },

  /**
   * Supported image formats
   */
  supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] as const,

  /**
   * Cache settings
   */
  cache: {
    maxSize: 100 * 1024 * 1024, // 100MB
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

/**
 * Asset type definitions
 */
export type ImageQuality = keyof typeof ImageOptimizationConfig.quality;
export type ImageSize = keyof typeof ImageOptimizationConfig.maxDimensions;
export type SupportedImageFormat = typeof ImageOptimizationConfig.supportedFormats[number];

export default {
  calculateOptimalImageSize,
  getImageResolution,
  preloadImages,
  getImageSize,
  responsiveSize,
  responsiveFontSize,
  isValidImageUri,
  ImageOptimizationConfig,
};
