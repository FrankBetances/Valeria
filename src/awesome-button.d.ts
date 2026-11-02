// El índice del paquete importa también `themed/colors.js`, que usa `this`
// suelto y revienta en modo estricto (web y Hermes). Se importa solo el botón.
declare module 'react-native-really-awesome-button/lib/module/Button' {
  import Button from 'react-native-really-awesome-button/lib/typescript/src/Button';
  export default Button;
}
