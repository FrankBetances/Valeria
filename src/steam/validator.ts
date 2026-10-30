// Validador de carga y de CI del motor STEAM (T0-B).
// Toda actividad lleva `adult_tap`. En turno verbal o estado de error,
// luz y háptico van `APAGADO`. SET_SOLO no exige enlace BLE.
import {
  CHILD_SPEECH_LOCALES,
  STEAM_ACTIVITY_IDS,
  STEAM_AR_MODES,
  STEAM_WORLD_IDS,
  type SteamActivity,
  type SteamActivityId,
  type SteamArMode,
  type SteamWorldId,
  type WorldEventSpec,
  type WorldManifest,
} from './types';

export type SteamValidationRule =
  | 'adult_tap'
  | 'verbal_or_error_silence'
  | 'set_solo_ble'
  | 'activity_binding'
  | 'child_speech'
  | 'tripartite_silence';

export interface SteamValidationIssue {
  readonly path: string;
  readonly rule: SteamValidationRule;
  readonly message: string;
}

export class SteamValidationError extends Error {
  readonly issues: readonly SteamValidationIssue[];

  constructor(issues: readonly SteamValidationIssue[]) {
    super(formatSteamValidationIssues(issues));
    this.name = 'SteamValidationError';
    this.issues = issues;
  }
}

export function formatSteamValidationIssues(issues: readonly SteamValidationIssue[]): string {
  return issues.map((issue) => `${issue.path} [${issue.rule}] ${issue.message}`).join('\n');
}

function issue(path: string, rule: SteamValidationRule, message: string): SteamValidationIssue {
  return { path, rule, message };
}

function includesAdultTap(methods: readonly string[] | undefined): boolean {
  return Array.isArray(methods) && methods.includes('adult_tap');
}

function silenceRequired(event: WorldEventSpec): boolean {
  return event.turn === 'verbal' || event.isErrorOrBlockedState === true;
}

export function validateWorldEvent(event: WorldEventSpec, path: string): SteamValidationIssue[] {
  const issues: SteamValidationIssue[] = [];
  if (!event) {
    issues.push(issue(path, 'adult_tap', 'Falta el evento.'));
    return issues;
  }
  if (!includesAdultTap(event.methods)) {
    issues.push(issue(`${path}.methods`, 'adult_tap', "El evento tiene que incluir 'adult_tap' en methods."));
  }
  if (silenceRequired(event)) {
    if (event.reaction?.light !== 'APAGADO') {
      issues.push(issue(
        `${path}.reaction.light`,
        'verbal_or_error_silence',
        "En turno verbal o estado de error, light tiene que ser 'APAGADO'.",
      ));
    }
    if (event.reaction?.haptic !== 'APAGADO') {
      issues.push(issue(
        `${path}.reaction.haptic`,
        'verbal_or_error_silence',
        "En turno verbal o estado de error, haptic tiene que ser 'APAGADO'.",
      ));
    }
  }
  return issues;
}

function expectedWorldId(id: SteamActivityId): SteamWorldId {
  if (id.startsWith('AR-SL')) return `S${Number(id.slice(5))}` as SteamWorldId;
  if (id.startsWith('AR-L')) return 'LUA';
  return `S${Number(id.slice(4))}` as SteamWorldId;
}

function modeMatchesActivityId(mode: SteamArMode, id: SteamActivityId): boolean {
  if (mode === 'LUA_SOLO') return id.startsWith('AR-L0');
  if (mode === 'SET_SOLO') return id.startsWith('AR-S') && !id.startsWith('AR-SL');
  return id.startsWith('AR-SL');
}

function isListed<T extends string>(value: string, list: readonly T[]): value is T {
  return (list as readonly string[]).includes(value);
}

function childSpeechIssues(speech: SteamActivity['childSpeech'] | undefined, path: string): SteamValidationIssue[] {
  const issues: SteamValidationIssue[] = [];
  for (const locale of CHILD_SPEECH_LOCALES) {
    const value = speech?.[locale];
    if (typeof value !== 'string') {
      issues.push(issue(
        `${path}.${locale}`,
        'child_speech',
        `Falta la locución del niño en ${locale}.`,
      ));
    }
  }
  return issues;
}

export function validateSteamActivity(activity: SteamActivity): SteamValidationIssue[] {
  const path = activity?.id ?? '(actividad)';
  const issues: SteamValidationIssue[] = [];

  if (!isListed(activity?.id ?? '', STEAM_ACTIVITY_IDS)) {
    issues.push(issue(path, 'activity_binding', 'El id no es una de las 28 actividades.'));
  }
  if (!isListed(activity?.mode ?? '', STEAM_AR_MODES)) {
    issues.push(issue(`${path}.mode`, 'activity_binding', 'La modalidad tiene que ser LUA_SOLO, SET_SOLO o SET_WITH_LUA.'));
  }
  if (!isListed(activity?.worldId ?? '', STEAM_WORLD_IDS)) {
    issues.push(issue(`${path}.worldId`, 'activity_binding', 'El mundo no está en el catálogo (LUA, S0–S6, S8–S11).'));
  }

  if (
    isListed(activity?.id ?? '', STEAM_ACTIVITY_IDS) &&
    isListed(activity?.mode ?? '', STEAM_AR_MODES) &&
    !modeMatchesActivityId(activity.mode, activity.id)
  ) {
    issues.push(issue(
      path,
      'activity_binding',
      `La modalidad ${activity.mode} no corresponde al id ${activity.id}.`,
    ));
  }

  if (
    isListed(activity?.id ?? '', STEAM_ACTIVITY_IDS) &&
    isListed(activity?.worldId ?? '', STEAM_WORLD_IDS) &&
    activity.worldId !== expectedWorldId(activity.id)
  ) {
    issues.push(issue(
      `${path}.worldId`,
      'activity_binding',
      `El mundo ${activity.worldId} no corresponde al id ${activity.id}.`,
    ));
  }

  if (!includesAdultTap(activity?.methods)) {
    issues.push(issue(`${path}.methods`, 'adult_tap', "La actividad tiene que incluir 'adult_tap' en methods."));
  }

  if (activity?.mode === 'SET_SOLO' && activity.bleRequired !== false) {
    issues.push(issue(
      `${path}.bleRequired`,
      'set_solo_ble',
      'En SET_SOLO no se exige enlace BLE: bleRequired tiene que ser false.',
    ));
  }

  if (typeof activity?.englishTpr !== 'string' || activity.englishTpr.trim() === '') {
    issues.push(issue(`${path}.englishTpr`, 'child_speech', 'Falta el comando TPR en inglés.'));
  }

  issues.push(...childSpeechIssues(activity?.childSpeech, `${path}.childSpeech`));

  const silenceSec = activity?.cycle?.observa?.mandatorySilenceSec;
  if (silenceSec !== 5) {
    issues.push(issue(
      `${path}.cycle.observa.mandatorySilenceSec`,
      'tripartite_silence',
      'El silencio de Observa tiene que ser 5 segundos.',
    ));
  }

  const events = activity?.events ?? [];
  events.forEach((event, index) => {
    issues.push(...validateWorldEvent(event, `${path}.events[${index}]`));
  });

  return issues;
}

export function validateSteamActivities(activities: readonly SteamActivity[]): SteamValidationIssue[] {
  return activities.flatMap((activity) => validateSteamActivity(activity));
}

export function validateWorldManifest(manifest: WorldManifest): SteamValidationIssue[] {
  const path = manifest?.id ?? '(manifiesto)';
  const issues: SteamValidationIssue[] = [];
  if (!isListed(manifest?.id ?? '', STEAM_WORLD_IDS)) {
    issues.push(issue(path, 'activity_binding', 'El manifiesto no usa un SteamWorldId del catálogo.'));
  }
  (manifest?.events ?? []).forEach((event, index) => {
    issues.push(...validateWorldEvent(event, `${path}.events[${index}]`));
  });
  (manifest?.challenges ?? []).forEach((challenge, index) => {
    if (challenge?.cycle?.observa?.mandatorySilenceSec !== 5) {
      issues.push(issue(
        `${path}.challenges[${index}].cycle.observa.mandatorySilenceSec`,
        'tripartite_silence',
        'El silencio de Observa tiene que ser 5 segundos.',
      ));
    }
  });
  return issues;
}

export function assertSteamActivity(activity: SteamActivity): void {
  const issues = validateSteamActivity(activity);
  if (issues.length > 0) throw new SteamValidationError(issues);
}

export function assertSteamActivities(activities: readonly SteamActivity[]): void {
  const issues = validateSteamActivities(activities);
  if (issues.length > 0) throw new SteamValidationError(issues);
}

export function assertWorldManifest(manifest: WorldManifest): void {
  const issues = validateWorldManifest(manifest);
  if (issues.length > 0) throw new SteamValidationError(issues);
}
