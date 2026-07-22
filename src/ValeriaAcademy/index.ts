// ============================================================================
// Valeria+ · Academy — Punto de entrada del módulo (V2.0 · HUB MULTIDOMINIO)
// ============================================================================
export { ValeriaAcademyScreen, default } from './ValeriaAcademyScreen';
export { AcademyHubCard } from './AcademyHubCard';
export { AcademyDomainCard } from './AcademyDomainCard';
export { AcademyPriorityFeed } from './AcademyPriorityFeed';
export { HipoacusiaBottomSheet } from './HipoacusiaBottomSheet';
export {
  EarAnatomySvg,
  HearingAidSvg,
  CochlearImplantSvg,
  BoneAnchoredSvg,
  deviceSchemaFor,
} from './AcademyHardwareSvg';
export {
  useAcademySummary,
  useAcademyDomainSummary,
  getSummarySnapshot,
  getDomainSnapshot,
  getDomainBadges,
  hydrateAcademy,
  completeCapsule,
  completeGuideUnit,
  isCapsuleDone,
} from './academyStore';
export {
  ACADEMY_DOMAINS,
  DOMAIN_META,
  domainFromPatologia,
  domainLevelFor,
  domainLevelName,
} from './academyDomains';
export { ACADEMY_CAPSULES, ACADEMY_TOTAL } from './academyContent';
export { HIPOACUSIA_CONCEPTS, HEARING_DEVICES, HIPOACUSIA_UNITS } from './academyHardware';
export { DOMAIN_TOTALS, ACADEMY_GRAND_TOTAL } from './academyRegistry';
export type {
  AcademyDomain,
  ValeriaAcademyState,
  AcademyDomainSilo,
  AcademySummary,
  AcademyDomainSummary,
  AcademyCapsule,
  AcademyCapsuleResult,
  AcademyGuideUnit,
  HearingDevice,
  HearingDeviceKey,
} from './academyTypes';
