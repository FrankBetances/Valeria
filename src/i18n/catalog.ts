// ============================================================================
// Valeria+ · Catálogo activo · MÓDULO PURO (EN-2.4)
//
// Aquí vive `tNow()` y nada más. Está separado de `i18n/index.ts` —que expone
// el hook `useT()`— por la misma razón que `valeriaVoiceCorpus` es puro: un
// script de Node tiene que poder compilar y ejecutar los módulos de datos sin
// arrastrar React ni Expo.
//
// Lo descubrió el gate `check-reminder-slots.js`: compila
// `valeriaNotifications.ts` con tsc y lo ejecuta en Node. Al localizar las
// notificaciones, ese módulo pasó a importar el catálogo; si el catálogo trae
// React por dentro (useSyncExternalStore), el gate revienta con
// «Cannot find module 'react'» aunque el código de producción funcione.
//
// Regla, entonces: los módulos que no son componentes importan de AQUÍ; las
// pantallas importan `useT` de `./i18n`.
// ============================================================================
import { getUiLang } from '../valeriaUiLang';
import { ES, UiStrings } from './strings.es';
import { EN } from './strings.en';

export const CATALOGUES: Record<'es' | 'en', UiStrings> = { es: ES, en: EN };

// Catálogo activo ahora mismo. Sin suscripción: quien lo llama lee el idioma
// del momento (notificaciones al programarse, informes al generarse).
export const tNow = (): UiStrings => CATALOGUES[getUiLang()];

export type { UiStrings };
