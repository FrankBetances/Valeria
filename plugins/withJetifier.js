// Config plugin: reactiva Jetifier en gradle.properties. La plantilla de
// React Native 0.81 (Expo SDK 54) ya no lo trae, pero @react-native-voice/voice
// sigue dependiendo de las viejas com.android.support:* y sin Jetifier el build
// falla con clases duplicadas (androidx.core vs support-compat).
// Se puede retirar cuando la librería de voz publique una versión AndroidX.
const { withGradleProperties } = require('expo/config-plugins');

module.exports = function withJetifier(config) {
  return withGradleProperties(config, (cfg) => {
    const props = cfg.modResults;
    const existing = props.find((p) => p.type === 'property' && p.key === 'android.enableJetifier');
    if (existing) existing.value = 'true';
    else props.push({ type: 'property', key: 'android.enableJetifier', value: 'true' });
    return cfg;
  });
};
