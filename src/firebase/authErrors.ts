// ============================================================================
// Valeria+ · Normalización de errores de Firebase Auth
//
// Antes este módulo devolvía la frase en castellano ya montada. Con la app en
// dos idiomas (EN-2.3) eso no vale: el mensaje se guarda en el estado de la
// pantalla y, si viniera cerrado, cambiar de idioma con un error visible lo
// dejaría en el idioma anterior. Y de fondo hay algo peor: un módulo de
// infraestructura acabaría siendo dueño de texto de interfaz.
//
// Aquí solo se NORMALIZA. Varios códigos de Firebase colapsan a propósito en un
// mismo caso: «usuario no encontrado», «contraseña incorrecta» y «credencial
// inválida» son, para quien mira la pantalla, lo mismo —y distinguirlos le
// diría a un atacante si el correo existe—. La traducción vive en el catálogo
// (`t.auth.error`).
// ============================================================================

export type AuthErrorCode =
  | 'invalidEmail'
  | 'missingPassword'
  | 'weakPassword'
  | 'emailInUse'
  | 'badCredentials'
  | 'tooManyRequests'
  | 'network'
  | 'notAllowed'
  | 'unknown';

export function authErrorCode(error: unknown): AuthErrorCode {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'invalidEmail';
    case 'auth/missing-password':
      return 'missingPassword';
    case 'auth/weak-password':
      return 'weakPassword';
    case 'auth/email-already-in-use':
      return 'emailInUse';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'badCredentials';
    case 'auth/too-many-requests':
      return 'tooManyRequests';
    case 'auth/network-request-failed':
      return 'network';
    case 'auth/operation-not-allowed':
      return 'notAllowed';
    default:
      return 'unknown';
  }
}
