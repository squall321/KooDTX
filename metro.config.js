// eslint-disable-next-line @typescript-eslint/no-var-requires
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * Phase 163: Build Optimization
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    // Hermes optimization
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // Enable inline requires for better performance
      },
    }),
    // Minify code in production
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      compress: {
        drop_console: true, // Remove console.log in production
        dead_code: true,
        conditionals: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        side_effects: true,
      },
      mangle: {
        toplevel: true,
      },
      output: {
        comments: false,
        ascii_only: true,
      },
    },
  },
  resolver: {
    // Source extensions
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
    // Asset extensions
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ttf', 'otf', 'mp4'],
  },
  // Optimize cache
  cacheStores: [
    {
      get: async () => null,
      set: async () => {},
    },
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
