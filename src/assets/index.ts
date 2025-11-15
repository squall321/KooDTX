/**
 * Assets Index
 * Phase 152: Central export point for all assets
 *
 * Features:
 * - Type-safe asset imports
 * - Asset preloading
 * - Asset optimization helpers
 */

/**
 * Image assets
 * Add your images here as they are created
 */
export const Images = {
  // Logo variants
  logo: {
    // primary: require('./images/logos/logo-primary.png'),
    // white: require('./images/logos/logo-white.png'),
    // dark: require('./images/logos/logo-dark.png'),
  },

  // Icons
  icons: {
    // home: require('./images/icons/home.png'),
    // settings: require('./images/icons/settings.png'),
  },

  // Illustrations
  illustrations: {
    // emptyState: require('./images/illustrations/empty-state.png'),
    // onboarding: require('./images/illustrations/onboarding.png'),
  },

  // Backgrounds
  backgrounds: {
    // gradient: require('./images/backgrounds/gradient.png'),
  },
};

/**
 * Animation assets
 */
export const Animations = {
  // loading: require('./animations/loading.json'),
  // success: require('./animations/success.json'),
  // error: require('./animations/error.json'),
};

/**
 * Sound assets
 */
export const Sounds = {
  // notification: require('./sounds/notification.mp3'),
  // success: require('./sounds/success.mp3'),
  // error: require('./sounds/error.mp3'),
};

/**
 * Asset types
 */
export type ImageAsset = keyof typeof Images;
export type AnimationAsset = keyof typeof Animations;
export type SoundAsset = keyof typeof Sounds;

/**
 * Asset helper functions
 */
export const AssetHelpers = {
  /**
   * Get image source
   */
  getImage: (category: keyof typeof Images, name: string) => {
    return (Images[category] as any)[name];
  },

  /**
   * Get animation source
   */
  getAnimation: (name: string) => {
    return (Animations as any)[name];
  },

  /**
   * Get sound source
   */
  getSound: (name: string) => {
    return (Sounds as any)[name];
  },
};

export default {
  Images,
  Animations,
  Sounds,
  AssetHelpers,
};
