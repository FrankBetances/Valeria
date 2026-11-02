// NativeWind 4 (guía oficial de React Native Reusables): JSX con className.
// babel-preset-expo añade solo el plugin de Reanimated cuando está instalado.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
