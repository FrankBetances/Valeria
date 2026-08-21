// ============================================================================
// Valeria+ · Integración Sensorial Auditiva — Catálogo de Estímulos y Actividades
// Catálogo multivariedad (es · gl · eu · es-DO · en-US).
// ============================================================================
import { Locale } from '../valeriaLocale';
import { AuditorySensoryExercise, SensoryStimulus, SensoryTriggerId } from './sensoryTypes';

export const SENSORY_TRIGGERS: Record<SensoryTriggerId, SensoryStimulus> = {
  vacuum: {
    id: 'vacuum',
    pictoIndex: 45,
    label: {
      es: 'Aspiradora',
      gl: 'Aspiradora',
      eu: 'Xurgagailua',
      'es-DO': 'Aspiradora',
      'en-US': 'Vacuum Cleaner',
    },
    audioAssetKey: 'sensory_vacuum_loop',
    calmStrategyTpr: {
      es: 'Amasar plastilina con fuerza como la gata',
      gl: 'Amasar plastilina con forza como a gata',
      eu: 'Plastilina indartsu estutu katuak bezala',
      'es-DO': 'Apretar masilla con fuerza como la gata',
      'en-US': 'Squeeze playdough firmly like the cat',
    },
  },
  blender: {
    id: 'blender',
    pictoIndex: 46,
    label: {
      es: 'Licuadora',
      gl: 'Licuadora',
      eu: 'Iraugailua',
      'es-DO': 'Licuadora',
      'en-US': 'Blender',
    },
    audioAssetKey: 'sensory_blender_loop',
    calmStrategyTpr: {
      es: 'Manos en las rodillas y respirar profundo',
      gl: 'Mans nos xeonllos e respirar fondo',
      eu: 'Eskuak belaunetan jarri eta sakon arnastu',
      'es-DO': 'Manos en las rodillas y respirar hondo',
      'en-US': 'Hands on knees and take a deep breath',
    },
  },
  hairdryer: {
    id: 'hairdryer',
    pictoIndex: 47,
    label: {
      es: 'Secador de pelo',
      gl: 'Secador de pelo',
      eu: 'Ile-lehorgailua',
      'es-DO': 'Secador de pelo',
      'en-US': 'Hair Dryer',
    },
    audioAssetKey: 'sensory_hairdryer_loop',
    calmStrategyTpr: {
      es: 'Abrazo de oso / presión en hombros',
      gl: 'Aperta forte / presión nos ombreiros',
      eu: 'Besarkada estua / sorbaldetan presioa',
      'es-DO': 'Abrazo apretado / presión en hombros',
      'en-US': 'Firm self-hug / gentle shoulder pressure',
    },
  },
  hand_dryer: {
    id: 'hand_dryer',
    pictoIndex: 48,
    label: {
      es: 'Secador de manos',
      gl: 'Secador de mans',
      eu: 'Esku-lehorgailua',
      'es-DO': 'Secador de manos',
      'en-US': 'Hand Dryer',
    },
    audioAssetKey: 'sensory_hand_dryer_loop',
    calmStrategyTpr: {
      es: 'Frotar las palmas suavemente',
      gl: 'Fregar as palmas amodo',
      eu: 'Esku-ahurrak emeki igurtzi',
      'es-DO': 'Frotar las palmas suavemente',
      'en-US': 'Rub hands gently together',
    },
  },
  thunder: {
    id: 'thunder',
    pictoIndex: 49,
    label: {
      es: 'Tormenta / Trueno',
      gl: 'Treboada / Trono',
      eu: 'Ekaitza / Tximista',
      'es-DO': 'Tormenta / Trueno',
      'en-US': 'Thunderstorm',
    },
    audioAssetKey: 'sensory_thunder_loop',
    calmStrategyTpr: {
      es: 'Mirar la pantalla fija y contar 3 respiraciones',
      gl: 'Mirar a pantalla fixa e contar 3 respiracións',
      eu: 'Pantailari begira geratu eta 3 arnasketa zenbatu',
      'es-DO': 'Mirar la pantalla fija y contar 3 respiraciones',
      'en-US': 'Focus on screen and count 3 breaths',
    },
  },
  siren: {
    id: 'siren',
    pictoIndex: 50,
    label: {
      es: 'Sirena',
      gl: 'Serea',
      eu: 'Sirena',
      'es-DO': 'Sirena',
      'en-US': 'Siren',
    },
    audioAssetKey: 'sensory_siren_loop',
    calmStrategyTpr: {
      es: 'Tocar hombro izquierdo con mano derecha',
      gl: 'Tocar ombreiro esquerdo coa man dereita',
      eu: 'Eskuineko eskuarekin ezkerreko sorbalda ukitu',
      'es-DO': 'Tocar hombro izquierdo con mano derecha',
      'en-US': 'Cross hand to touch opposite shoulder',
    },
  },
  fireworks: {
    id: 'fireworks',
    pictoIndex: 51,
    label: {
      es: 'Pirotecnia',
      gl: 'Foguetes',
      eu: 'Su artifizialak',
      'es-DO': 'Fuegos artificiales',
      'en-US': 'Fireworks',
    },
    audioAssetKey: 'sensory_fireworks_loop',
    calmStrategyTpr: {
      es: 'Apretar cojín o manos juntas',
      gl: 'Apertar almofada ou mans xuntas',
      eu: 'Kuxina edo eskuak batera estutu',
      'es-DO': 'Apretar cojín o manos juntas',
      'en-US': 'Squeeze a cushion or clasp hands',
    },
  },
  school_bell: {
    id: 'school_bell',
    pictoIndex: 52,
    label: {
      es: 'Timbre escolar',
      gl: 'Timbre do colexio',
      eu: 'Eskolako txirrina',
      'es-DO': 'Timbre del colegio',
      'en-US': 'School Bell',
    },
    audioAssetKey: 'sensory_school_bell_loop',
    calmStrategyTpr: {
      es: 'Postura de estatua tranquila',
      gl: 'Postura de estatua tranquila',
      eu: 'Estatua lasaiaren jarrera',
      'es-DO': 'Postura de estatua tranquila',
      'en-US': 'Freeze in a calm statue posture',
    },
  },
};

export const SENSORY_TRIGGER_LIST: SensoryStimulus[] = Object.values(SENSORY_TRIGGERS);

// 6 Actividades del módulo de Integración Sensorial Auditiva
export const AUDITORY_INTEGRATION_ACTIVITIES: AuditorySensoryExercise[] = [
  {
    id: 'ISA-01',
    titleKey: 'isa01Title',
    descKey: 'isa01Desc',
    iconName: 'sensory_ear',
    defaultDurationSec: 60,
    isAvailable: true,
  },
  {
    id: 'ISA-02',
    titleKey: 'isa02Title',
    descKey: 'isa02Desc',
    iconName: 'sensory_anticipation',
    defaultDurationSec: 90,
    isAvailable: false,
  },
  {
    id: 'ISA-03',
    titleKey: 'isa03Title',
    descKey: 'isa03Desc',
    iconName: 'sensory_ear',
    defaultDurationSec: 120,
    isAvailable: false,
  },
  {
    id: 'ISA-04',
    titleKey: 'isa04Title',
    descKey: 'isa04Desc',
    iconName: 'noise_filter',
    defaultDurationSec: 90,
    isAvailable: false,
  },
  {
    id: 'ISA-05',
    titleKey: 'isa05Title',
    descKey: 'isa05Desc',
    iconName: 'noise_filter',
    defaultDurationSec: 120,
    isAvailable: false,
  },
  {
    id: 'ISA-06',
    titleKey: 'isa06Title',
    descKey: 'isa06Desc',
    iconName: 'calm_breath',
    defaultDurationSec: 150,
    isAvailable: false,
  },
];

export const getTriggerLabel = (triggerId: SensoryTriggerId, locale: Locale = 'es'): string => {
  const t = SENSORY_TRIGGERS[triggerId];
  if (!t) return triggerId;
  return t.label[locale] ?? t.label.es;
};

export const getCalmStrategy = (triggerId: SensoryTriggerId, locale: Locale = 'es'): string => {
  const t = SENSORY_TRIGGERS[triggerId];
  if (!t) return '';
  return t.calmStrategyTpr[locale] ?? t.calmStrategyTpr.es;
};
