// Validador de los manifiestos S0–S6 (plan §2.3, §4 R1). Lo corre
// scripts/check-steam-manifests.js en CI; la app no valida al arrancar,
// para que un error de contenido no tumbe la pantalla de inicio.
import {
  ADULT_UI_LANGS,
  CHALLENGE_LADDER,
  STEAM_WORLD_ORDER,
  type AdultText,
  type ChallengeNumber,
  type WorldEventSpec,
  type WorldManifest,
} from './types';

export interface SteamValidationIssue {
  readonly path: string;
  readonly message: string;
}

function textIssues(text: AdultText | undefined, path: string): SteamValidationIssue[] {
  return ADULT_UI_LANGS.filter((lang) => typeof text?.[lang] !== 'string' || text[lang].trim() === '')
    .map((lang) => ({ path: `${path}.${lang}`, message: `Falta el texto del adulto en ${lang}.` }));
}

export function validateWorldEvent(event: WorldEventSpec, path: string): SteamValidationIssue[] {
  const issues: SteamValidationIssue[] = [];
  if (!event.methods.includes('adult_tap')) {
    issues.push({ path: `${path}.methods`, message: "Todo evento lleva 'adult_tap' (plan §0.3)." });
  }
  if (event.turn === 'verbal' || event.isErrorOrBlockedState === true) {
    if (event.reaction.light !== 'APAGADO' || event.reaction.haptic !== 'APAGADO') {
      issues.push({ path: `${path}.reaction`, message: 'En turno verbal o en error, luz y háptico van APAGADO.' });
    }
  }
  issues.push(...textIssues(event.title, `${path}.title`));
  issues.push(...textIssues(event.childAction, `${path}.childAction`));
  issues.push(...textIssues(event.word.adultHint, `${path}.word.adultHint`));
  return issues;
}

export function validateWorldManifest(manifest: WorldManifest): SteamValidationIssue[] {
  const path = manifest.id;
  const issues: SteamValidationIssue[] = [];
  if (!(STEAM_WORLD_ORDER as readonly string[]).includes(manifest.id)) {
    issues.push({ path, message: 'El mundo no es S0–S6.' });
  }
  for (const key of ['title', 'phenomenon', 'targetAudienceContext'] as const) {
    issues.push(...textIssues(manifest[key], `${path}.${key}`));
  }
  issues.push(...textIssues(manifest.story.anticipationMicroStory, `${path}.story.anticipationMicroStory`));
  issues.push(...textIssues(manifest.story.closingMicroStory, `${path}.story.closingMicroStory`));

  const eventIds = new Set<string>();
  manifest.events.forEach((event, i) => {
    if (!event.id.startsWith(`${manifest.id}.`)) issues.push({ path: `${path}.events[${i}]`, message: `El id ${event.id} no es de ${manifest.id}.` });
    if (eventIds.has(event.id)) issues.push({ path: `${path}.events[${i}]`, message: `Evento repetido: ${event.id}.` });
    eventIds.add(event.id);
    issues.push(...validateWorldEvent(event, `${path}.events[${i}]`));
  });

  const markers = new Set<number>();
  manifest.pieces.forEach((piece) => {
    if (piece.instanceMarkerIds.length !== piece.quantity) {
      issues.push({ path: `${path}.pieces.${piece.code}`, message: 'Hace falta un marcador por instancia (plan §0.1 A2).' });
    }
    piece.instanceMarkerIds.forEach((id) => {
      if (markers.has(id)) issues.push({ path: `${path}.pieces.${piece.code}`, message: `Marcador ${id} repetido en el mundo.` });
      markers.add(id);
    });
  });

  // Escalera completa: cinco retos, uno por franja y estadio (v2.1).
  const numbers = manifest.challenges.map((c) => c.number).join(',');
  if (numbers !== '1,2,3,4,5') {
    issues.push({ path: `${path}.challenges`, message: `Hacen falta los retos 1 a 5 en orden; hay ${numbers || 'ninguno'}.` });
  }
  manifest.challenges.forEach((c) => {
    const cp = `${path}.${c.id}`;
    const rung = CHALLENGE_LADDER[c.number as ChallengeNumber];
    if (c.id !== `${manifest.id}-C${c.number}`) issues.push({ path: cp, message: 'El id no coincide con el mundo y el número.' });
    if (!rung || c.ageBand !== rung.ageBand || c.neuroStage !== rung.neuroStage) {
      issues.push({ path: cp, message: 'Franja de edad o estadio fuera de la escalera.' });
    }
    if (c.cycle.observa.mandatorySilenceSec !== 5) issues.push({ path: cp, message: 'El silencio de Observa son 5 s.' });
    if (c.targetEvents.length === 0) issues.push({ path: cp, message: 'El reto no apunta a ningún evento.' });
    c.targetEvents.forEach((id) => {
      if (!eventIds.has(id)) issues.push({ path: cp, message: `El evento ${id} no existe en ${manifest.id}.` });
    });
    if (c.skillAxes.length === 0) issues.push({ path: cp, message: 'Falta el eje de habilidad.' });
    const texts: [AdultText, string][] = [
      [c.title, 'title'],
      [c.achievementCriterion, 'achievementCriterion'],
      [c.qualitativeObservation, 'qualitativeObservation'],
      [c.cycle.observa.phenomenonTrigger, 'observa.phenomenonTrigger'],
      [c.cycle.observa.socraticQuestion, 'observa.socraticQuestion'],
      [c.cycle.experimenta.adultStepByStep, 'experimenta.adultStepByStep'],
      [c.cycle.experimenta.hints.level1Socratic, 'experimenta.level1Socratic'],
      [c.cycle.experimenta.hints.level2PhysicalModel, 'experimenta.level2PhysicalModel'],
      [c.cycle.construye.tangibleMakeChallenge, 'construye.tangibleMakeChallenge'],
      [c.cycle.construye.transferQuestion, 'construye.transferQuestion'],
    ];
    texts.forEach(([text, key]) => issues.push(...textIssues(text, `${cp}.${key}`)));
  });
  return issues;
}
