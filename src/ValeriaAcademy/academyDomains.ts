// ============================================================================
// Valeria+ · Academy — Metadatos de dominio y reglas de gamificación por silo
// Módulo PURO (sin estado ni efectos). Fuente única de verdad para:
//   · Identidad visual de cada dominio (acentos de alto contraste).
//   · Escala de niveles POR DOMINIO (nombres específicos, p. ej. "Experto en
//     Hipoacusia").
//   · Catálogo de insignias (milestones genéricos, namespaced por dominio).
//   · Mapeo Ficha de Registro (`patologia`) → dominio principal activo, usado
//     por la migración silenciosa y por el Feed de Prioridad.
// ============================================================================
import { AcademyBadge, AcademyDomain } from './academyTypes';

// Orden canónico de presentación en el hub.
export const ACADEMY_DOMAINS: AcademyDomain[] = [
  'lenguaje', 'hipoacusia', 'dislalias', 'dislexia', 'tea',
];

export interface AcademyDomainMeta {
  id: AcademyDomain;
  label: string;        // etiqueta larga de la tarjeta
  short: string;        // etiqueta corta (chips, feed)
  icon: string;         // emoji fallback (no rompe el binario)
  accentBg: string;     // fondo de acento (alto contraste con accentFg)
  accentFg: string;     // color de acento del dominio
  blurb: string;        // subtítulo de la tarjeta
  levelNames: string[]; // 5 peldaños; el último es el título "experto" del dominio
}

// Acentos de alto contraste, uno por dominio, para distinguir los silos de un
// vistazo sin depender de imágenes de red.
export const DOMAIN_META: Record<AcademyDomain, AcademyDomainMeta> = {
  lenguaje: {
    id: 'lenguaje',
    label: 'Lenguaje',
    short: 'Lenguaje',
    icon: '💬',
    accentBg: '#e0edff',
    accentFg: '#3b6fd4',
    blurb: 'Cómo aprenden a hablar, el porqué del TPR y qué vicios evitar.',
    levelNames: ['Novato', 'Acompañante', 'Guía', 'Mentor', 'Experto en Lenguaje'],
  },
  hipoacusia: {
    id: 'hipoacusia',
    label: 'Hipoacusia / Sordera',
    short: 'Hipoacusia',
    icon: '👂',
    accentBg: '#e5f0fb',
    accentFg: '#1f6fb2',
    blurb: 'Qué es la sordera, su abordaje y el manejo de los dispositivos.',
    levelNames: ['Novato', 'Iniciado', 'Práctico', 'Avanzado', 'Experto en Hipoacusia'],
  },
  dislalias: {
    id: 'dislalias',
    label: 'Dislalias',
    short: 'Dislalias',
    icon: '🗣️',
    accentBg: '#fdeef2',
    accentFg: '#c2477e',
    blurb: 'Puntos de articulación y práctica de los sonidos difíciles.',
    levelNames: ['Novato', 'Acompañante', 'Guía', 'Mentor', 'Experto en Dislalias'],
  },
  dislexia: {
    id: 'dislexia',
    label: 'Dislexia',
    short: 'Dislexia',
    icon: '🔤',
    accentBg: '#fff1dc',
    accentFg: '#d98a1f',
    blurb: 'Conciencia fonológica y apoyo a la lectura emergente.',
    levelNames: ['Novato', 'Acompañante', 'Guía', 'Mentor', 'Experto en Dislexia'],
  },
  tea: {
    id: 'tea',
    label: 'TEA',
    short: 'TEA',
    icon: '🧩',
    accentBg: '#e9f7ee',
    accentFg: '#2e9e5b',
    blurb: 'Comunicación, anticipación y regulación en el espectro autista.',
    levelNames: ['Novato', 'Acompañante', 'Guía', 'Mentor', 'Experto en TEA'],
  },
};

// --- Escala de niveles (idéntica pendiente en todos los silos) --------------
export const ACADEMY_XP_PER_LEVEL = 60;

export const domainLevelFor = (xp: number): number =>
  Math.floor(Math.max(0, xp) / ACADEMY_XP_PER_LEVEL) + 1;

export const domainLevelName = (domain: AcademyDomain, level: number): string => {
  const names = DOMAIN_META[domain].levelNames;
  return names[Math.min(Math.max(level - 1, 0), names.length - 1)];
};

// --- Catálogo de insignias (milestones genéricos por dominio) ---------------
// Se namespacea con el id del dominio → "hipoacusia:graduado". Cada silo
// mantiene su propio array; nunca se comparten entre dominios.
export interface AcademyBadgeDef {
  key: 'primeraCapsula' | 'mitad' | 'graduado' | 'perfecto';
  icon: string;
  name: string;
  desc: string;
}

export const DOMAIN_BADGE_DEFS: AcademyBadgeDef[] = [
  { key: 'primeraCapsula', icon: '📘', name: 'Primer paso',   desc: 'Completa tu primera cápsula del dominio.' },
  { key: 'mitad',          icon: '📗', name: 'A medio camino', desc: 'Completa la mitad del dominio.' },
  { key: 'graduado',       icon: '🎓', name: 'Dominio experto', desc: 'Completa todo el dominio.' },
  { key: 'perfecto',       icon: '💯', name: 'Sin fallos',     desc: 'Aprueba una cápsula sin ningún error.' },
];

export const badgeId = (domain: AcademyDomain, key: AcademyBadgeDef['key']): string =>
  `${domain}:${key}`;

// Resuelve un id de insignia namespaced → descriptor completo para la UI.
export const badgeFromId = (id: string): AcademyBadge | null => {
  const [domain, key] = id.split(':');
  const meta = DOMAIN_META[domain as AcademyDomain];
  const def = DOMAIN_BADGE_DEFS.find((b) => b.key === key);
  if (!meta || !def) return null;
  return { id, icon: def.icon, name: `${def.name} · ${meta.short}`, desc: def.desc };
};

// --- Mapeo Ficha de Registro → dominio principal activo ---------------------
// La Ficha guarda UN `patologia` de una lista cerrada. Lo traducimos al dominio
// silo correspondiente. Reutiliza el criterio de ValeriaExerciseSelectionScreen
// (regex de dispositivo auditivo). Por defecto: Lenguaje.
export const domainFromPatologia = (patologia?: string | null): AcademyDomain => {
  const p = (patologia ?? '').trim();
  if (!p) return 'lenguaje';
  if (/hipoacusia|audífono|audifono|implante coclear|sordera|coclear/i.test(p)) return 'hipoacusia';
  if (/tea|espectro autista|autis/i.test(p)) return 'tea';
  if (/dislalia/i.test(p)) return 'dislalias';
  if (/dislexia|lectura/i.test(p)) return 'dislexia';
  // 'Trastorno Específico del Lenguaje', 'Retraso Simple del Lenguaje', 'Otros'…
  return 'lenguaje';
};
