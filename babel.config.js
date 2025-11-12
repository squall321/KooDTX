module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@utils': './src/utils',
          '@hooks': './src/hooks',
          '@store': './src/store',
          '@types': './src/types',
          '@assets': './src/assets',
          '@config': './src/config',
          '@constants': './src/constants',
          '@models': './src/models',
          '@database': './src/database',
        },
      },
    ],
  ],
};
