// ============================================================================
// Valeria+ · Traducción de códigos de error de Firebase Auth a mensajes claros
// en español para mostrar al profesional.
// ============================================================================
export function authErrorToMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'El correo no tiene un formato válido.';
    case 'auth/missing-password':
      return 'Escribe tu contraseña.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Inténtalo de nuevo en unos minutos.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Comprueba tu red e inténtalo otra vez.';
    case 'auth/operation-not-allowed':
      return 'El acceso por correo y contraseña no está habilitado en el proyecto.';
    default:
      return 'No se ha podido completar la operación. Inténtalo de nuevo.';
  }
}
