// ============================================================================
// Valeria+ · Acceso al catálogo de interfaz (EN-2.1)
//
// Dos formas de leer las cadenas, según quién pregunte:
//
//   useT()  — pantallas React. Se suscribe al idioma activo, así que cambiarlo
//             en ajustes repinta la app entera sin reiniciar ni volver atrás.
//   tNow()  — módulos que no son componentes (notificaciones, exportación de
//             informes). Lee el idioma del momento, sin suscripción.
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
import { ES, UiStrings } from './strings.es';
import { EN } from './strings.en';

const CATALOGUES: Record<'es' | 'en', UiStrings> = { es: ES, en: EN };

// Catálogo activo ahora mismo. Para módulos fuera del árbol de React.
export const tNow = (): UiStrings => CATALOGUES[getUiLang()];

// Catálogo activo, reactivo. `getUiLang` como snapshot es estable (devuelve un
// literal), así que useSyncExternalStore no entra en bucle de renders.
export function useT(): UiStrings {
  const lang = useSyncExternalStore(subscribeUiLang, getUiLang, getUiLang);
  return CATALOGUES[lang];
}

export type { UiStrings };
