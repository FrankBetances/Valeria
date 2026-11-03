// Uniwind no necesita preset propio: babel-preset-expo y el plugin de worklets
// que añade solo cuando Reanimated 4 está instalado.
module.exports = function (api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };
};
