// ============================================================================
// Valeria+ · Academy — Metadatos de dominio y reglas de gamificación por silo
// Módulo PURO (sin estado ni efectos). Fuente única de verdad para:
//   · Identidad visual de cada dominio (acentos de alto contraste).
//   · Escala de niveles POR DOMINIO (nombres específicos, p. ej. "Experto en
//     Hipoacusia" / "Hearing Loss Expert").
//   · Catálogo de insignias (milestones genéricos, namespaced por dominio).
//   · Mapeo Ficha de Registro (`patologia`) → dominio principal activo, usado
//     por la migración silenciosa y por el Feed de Prioridad.
// ============================================================================
import type { BlockIconName } from '../ValeriaBlockIcons';
import type { UiLang } from '../valeriaUiLang';
import { AcademyBadge, AcademyDomain } from './academyTypes';

// Orden canónico de presentación en el hub.
export const ACADEMY_DOMAINS: AcademyDomain[] = [
  'lenguaje', 'mitos', 'hipoacusia', 'dislalias', 'dislexia', 'tea', 'signos',
];

export interface AcademyDomainMeta {
  id: AcademyDomain;
  label: string;        // etiqueta larga de la tarjeta
  short: string;        // etiqueta corta (chips, feed)
  icon: BlockIconName;  // icono del set propio (ValeriaBlockIcons)
  accentBg: string;     // fondo de acento (alto contraste con accentFg)
  accentFg: string;     // color de acento del dominio
  blurb: string;        // subtítulo de la tarjeta
  levelNames: string[]; // 5 peldaños; el último es el título "experto" del dominio
}

// 'mitos' va SEGUNDO a propósito: es la sección que responde a lo que la
// familia ya trae oído de casa ("ya hablará", "lo confunden dos idiomas", "eso
// es vagancia"). Dejarla al final la escondía bajo seis tarjetas justo para
// quien más falta le hace leerla antes de empezar nada.
// Acentos de alto contraste, uno por dominio, para distinguir los silos de un
// vistazo sin depender de imágenes de red.
export const DOMAIN_META_ES: Record<AcademyDomain, AcademyDomainMeta> = {
  lenguaje: {
    id: 'lenguaje',
    label: 'Lenguaje',
    short: 'Lenguaje',
    icon: 'language',
    accentBg: '#e0edff',
    accentFg: '#3b6fd4',
    blurb: 'Cómo aprenden a hablar, el porqué del TPR y qué vicios evitar.',
    levelNames: ['Novato', 'Acompañante', 'Guía', 'Mentor', 'Experto en Lenguaje'],
  },
  mitos: {
    id: 'mitos',
    label: 'Mitos y verdades',
    short: 'Mitos',
    icon: 'zoom',
    accentBg: '#ffe9e4',
    accentFg: '#cf4b39',
    blurb: '¿Mito o realidad? Lo que se dice del habla, el autismo y la dislexia.',
    levelNames: ['Curioso', 'Preguntón', 'Detective', 'Cazamitos', 'Experto en Mitos'],
  },
  hipoacusia: {
    id: 'hipoacusia',
    label: 'Hipoacusia / Sordera',
    short: 'Hipoacusia',
    icon: 'hearing',
    accentBg: '#e5f0fb',
    accentFg: '#1f6fb2',
    blurb: 'Qué es la sordera, su abordaje y el manejo de los dispositivos.',
    levelNames: ['Novato', 'Iniciado', 'Práctico', 'Avanzado', 'Experto en Hipoacusia'],
  },
  dislalias: {
    id: 'dislalias',
    label: 'Dislalias',
    short: 'Dislalias',
    icon: 'mic',
    accentBg: '#fdeef2',
    accentFg: '#c2477e',
    blurb: 'Puntos de articulación y práctica de los sonidos difíciles.',
    levelNames: ['Novato', 'Acompañante', 'Guía', 'Mentor', 'Experto en Dislalias'],
  },
  dislexia: {
    id: 'dislexia',
    label: 'Dislexia',
    short: 'Dislexia',
    icon: 'dyslexia',
    accentBg: '#fff1dc',
    accentFg: '#d98a1f',
    blurb: 'Conciencia fonológica y apoyo a la lectura emergente.',
    levelNames: ['Novato', 'Acompañante', 'Guía', 'Mentor', 'Experto en Dislexia'],
  },
  tea: {
    id: 'tea',
    label: 'TEA',
    short: 'TEA',
    icon: 'autism',
    accentBg: '#e9f7ee',
    accentFg: '#2e9e5b',
    blurb: 'Comunicación, anticipación y regulación en el espectro autista.',
    levelNames: ['Novato', 'Acompañante', 'Guía', 'Mentor', 'Experto en TEA'],
  },
  signos: {
    id: 'signos',
    label: 'Lengua de Signos (LSE)',
    short: 'LSE',
    icon: 'gesture',
    accentBg: '#efe9fd',
    accentFg: '#6d4ac2',
    blurb: 'Qué es la LSE, por qué no frena el habla y los primeros signos útiles.',
    levelNames: ['Novato', 'Iniciado', 'Practicante', 'Avanzado', 'Experto en LSE'],
  },
};

export const DOMAIN_META_EN: Record<AcademyDomain, AcademyDomainMeta> = {
  lenguaje: {
    id: 'lenguaje',
    label: 'Language',
    short: 'Language',
    icon: 'language',
    accentBg: '#e0edff',
    accentFg: '#3b6fd4',
    blurb: 'How children learn to talk, the role of TPR, and habits to avoid.',
    levelNames: ['Novice', 'Companion', 'Guide', 'Mentor', 'Language Expert'],
  },
  mitos: {
    id: 'mitos',
    label: 'Myths & facts',
    short: 'Myths',
    icon: 'zoom',
    accentBg: '#ffe9e4',
    accentFg: '#cf4b39',
    blurb: 'Myth or fact? Common beliefs about speech, autism, and dyslexia.',
    levelNames: ['Curious', 'Questioner', 'Detective', 'Mythbuster', 'Myths Expert'],
  },
  hipoacusia: {
    id: 'hipoacusia',
    label: 'Hearing loss / Deafness',
    short: 'Hearing',
    icon: 'hearing',
    accentBg: '#e5f0fb',
    accentFg: '#1f6fb2',
    blurb: 'Understanding hearing loss, intervention approaches, and managing devices.',
    levelNames: ['Novice', 'Initiate', 'Practitioner', 'Advanced', 'Hearing Loss Expert'],
  },
  dislalias: {
    id: 'dislalias',
    label: 'Articulation (speech sounds)',
    short: 'Speech',
    icon: 'mic',
    accentBg: '#fdeef2',
    accentFg: '#c2477e',
    blurb: 'Placement of articulation and practicing challenging speech sounds.',
    levelNames: ['Novice', 'Companion', 'Guide', 'Mentor', 'Articulation Expert'],
  },
  dislexia: {
    id: 'dislexia',
    label: 'Dyslexia',
    short: 'Dyslexia',
    icon: 'dyslexia',
    accentBg: '#fff1dc',
    accentFg: '#d98a1f',
    blurb: 'Phonological awareness and supporting emergent reading.',
    levelNames: ['Novice', 'Companion', 'Guide', 'Mentor', 'Dyslexia Expert'],
  },
  tea: {
    id: 'tea',
    label: 'Autism (ASD)',
    short: 'ASD',
    icon: 'autism',
    accentBg: '#e9f7ee',
    accentFg: '#2e9e5b',
    blurb: 'Communication, anticipation, and emotional regulation on the autism spectrum.',
    levelNames: ['Novice', 'Companion', 'Guide', 'Mentor', 'Autism Expert'],
  },
  signos: {
    id: 'signos',
    label: 'Sign language (ASL/LSE)',
    short: 'Signs',
    icon: 'gesture',
    accentBg: '#efe9fd',
    accentFg: '#6d4ac2',
    blurb: 'What sign language is, why it supports speech, and first useful signs.',
    levelNames: ['Novice', 'Initiate', 'Practitioner', 'Advanced', 'Signing Expert'],
  },
};

export const domainMetaFor = (domain: AcademyDomain, lang: UiLang = 'es'): AcademyDomainMeta =>
  (lang === 'en' ? DOMAIN_META_EN : DOMAIN_META_ES)[domain];

export const allDomainMetaFor = (lang: UiLang = 'es'): Record<AcademyDomain, AcademyDomainMeta> =>
  lang === 'en' ? DOMAIN_META_EN : DOMAIN_META_ES;

// Compatibilidad retroactiva: DOMAIN_META estático
export const DOMAIN_META: Record<AcademyDomain, AcademyDomainMeta> = DOMAIN_META_ES;

// --- Escala de niveles (idéntica pendiente en todos los silos) --------------
export const ACADEMY_XP_PER_LEVEL = 60;

export const domainLevelFor = (xp: number): number =>
  Math.floor(Math.max(0, xp) / ACADEMY_XP_PER_LEVEL) + 1;

export const domainLevelName = (domain: AcademyDomain, level: number, lang: UiLang = 'es'): string => {
  const meta = domainMetaFor(domain, lang);
  const names = meta.levelNames;
  return names[Math.min(Math.max(level - 1, 0), names.length - 1)];
};

// --- Catálogo de insignias (milestones genéricos por dominio) ---------------
export interface AcademyBadgeDef {
  key: 'primeraCapsula' | 'mitad' | 'graduado' | 'perfecto';
  icon: BlockIconName;
  name: string;
  desc: string;
}

export const DOMAIN_BADGE_DEFS_ES: AcademyBadgeDef[] = [
  { key: 'primeraCapsula', icon: 'check', name: 'Primer paso',   desc: 'Completa tu primera cápsula del dominio.' },
  { key: 'mitad',          icon: 'chart', name: 'A medio camino', desc: 'Completa la mitad del dominio.' },
  { key: 'graduado',       icon: 'tabAcademy', name: 'Dominio experto', desc: 'Completa todo el dominio.' },
  { key: 'perfecto',       icon: 'level', name: 'Sin fallos',     desc: 'Aprueba una cápsula sin ningún error.' },
];

export const DOMAIN_BADGE_DEFS_EN: AcademyBadgeDef[] = [
  { key: 'primeraCapsula', icon: 'check', name: 'First step',   desc: 'Complete your first capsule in this domain.' },
  { key: 'mitad',          icon: 'chart', name: 'Halfway there', desc: 'Complete half of this domain.' },
  { key: 'graduado',       icon: 'tabAcademy', name: 'Domain expert', desc: 'Complete all capsules in this domain.' },
  { key: 'perfecto',       icon: 'level', name: 'Flawless',     desc: 'Pass a capsule quiz with zero errors.' },
];

export const badgeDefsFor = (lang: UiLang = 'es'): AcademyBadgeDef[] =>
  lang === 'en' ? DOMAIN_BADGE_DEFS_EN : DOMAIN_BADGE_DEFS_ES;

// Se namespacea con el id del dominio → "hipoacusia:graduado". Cada silo
// mantiene su propio array; nunca se comparten entre dominios.
export const DOMAIN_BADGE_DEFS: AcademyBadgeDef[] = DOMAIN_BADGE_DEFS_ES;

export const badgeId = (domain: AcademyDomain, key: AcademyBadgeDef['key']): string =>
  `${domain}:${key}`;

// Resuelve un id de insignia namespaced → descriptor completo para la UI.
export const badgeFromId = (id: string, lang: UiLang = 'es'): AcademyBadge | null => {
  const [domain, key] = id.split(':');
  const meta = domainMetaFor(domain as AcademyDomain, lang);
  const defs = badgeDefsFor(lang);
  const def = defs.find((b) => b.key === key);
  if (!meta || !def) return null;
  return { id, icon: def.icon, name: `${def.name} · ${meta.short}`, desc: def.desc };
};

// --- Mapeo Ficha de Registro → dominio principal activo ---------------------
// La Ficha guarda UN `patologia` de una lista cerrada. Lo traducimos al dominio
// silo correspondiente. Reutiliza el criterio de ValeriaBlockListScreen
// (regex de dispositivo auditivo). Por defecto: Lenguaje.
export const domainFromPatologia = (patologia?: string | null): AcademyDomain => {
  const p = (patologia ?? '').trim();
  if (!p) return 'lenguaje';
  // 'Trastorno Específico del Lenguaje', 'Retraso Simple del Lenguaje', 'Otros'…
  if (/hipoacusia|audífono|audifono|hearing|implant|implante coclear|sordera|coclear/i.test(p)) return 'hipoacusia';
  if (/tea|espectro autista|autis|asd/i.test(p)) return 'tea';
  if (/dislalia|speech|articulation/i.test(p)) return 'dislalias';
  if (/dislexia|dyslexia|lectura|reading/i.test(p)) return 'dislexia';
  return 'lenguaje';
};
