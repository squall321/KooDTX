/**
 * React Native Configuration
 * Phase 163: Build Optimization
 */

module.exports = {
  project: {
    ios: {
      sourceDir: './ios',
    },
    android: {
      sourceDir: './android',
    },
  },
  assets: ['./src/assets/fonts/', './src/assets/images/'],
  dependencies: {
    // Disable auto-linking for specific packages if needed
    // 'package-name': {
    //   platforms: {
    //     android: null,
    //     ios: null,
    //   },
    // },
  },
};
