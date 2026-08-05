// ============================================================================
// Valeria+ · Acceso al catálogo de interfaz (EN-2.1)
//
// Dos formas de leer las cadenas, según quién pregunte:
//
//   useT()  — pantallas React. Se suscribe al idioma activo, así que cambiarlo
//             en ajustes repinta la app entera sin reiniciar ni volver atrás.
//   tNow()  — módulos que NO son componentes (notificaciones, exportación de
//             informes). Vive en `./catalog`, que es un módulo puro sin React:
//             los gates de CI compilan esos módulos y los ejecutan en Node.
//             Importar `tNow` desde aquí también funciona en la app, pero un
//             script debe importarlo de `./i18n/catalog` para no arrastrar React.
//
// Uso en pantalla:
//   const t = useT();
//   <Text>{t.welcome.start}</Text>
//   <Text>{t.patientSelect.subtitle(pacientes.length)}</Text>
//
// El acceso es por PROPIEDAD, no por clave de texto (`t('welcome.start')`):
// así una clave inexistente o mal escrita la caza el compilador, no el QA.
// ============================================================================
import { useSyncExternalStore } from 'react';
import { getUiLang, subscribeUiLang } from '../valeriaUiLang';
import { CATALOGUES, tNow, UiStrings } from './catalog';

// Catálogo activo, reactivo. `getUiLang` como snapshot es estable (devuelve un
// literal), así que useSyncExternalStore no entra en bucle de renders.
export function useT(): UiStrings {
  const lang = useSyncExternalStore(subscribeUiLang, getUiLang, getUiLang);
  return CATALOGUES[lang];
}

export { tNow };
export type { UiStrings };
