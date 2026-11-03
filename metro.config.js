// Uniwind (Tailwind 4) compila global.css, que trae los estilos de HeroUI Native.
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, { cssEntryFile: './global.css' });
