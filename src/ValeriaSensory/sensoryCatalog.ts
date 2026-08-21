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
    category: 'appliance',
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
    category: 'appliance',
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
    category: 'appliance',
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
    category: 'appliance',
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
    category: 'nature',
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
    category: 'alert',
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
    category: 'alert',
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
    category: 'alert',
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
  classroom_ambience: {
    id: 'classroom_ambience',
    pictoIndex: 53,
    category: 'ecological',
    label: {
      es: 'Aula de colegio',
      gl: 'Aula do colexio',
      eu: 'Eskolako ikasgela',
      'es-DO': 'Aula de la escuela',
      'en-US': 'School Classroom',
    },
    description: {
      es: 'Murmullo de niños, movimiento de sillas, risas y eco del aula',
      gl: 'Murmurio de nenos, movemento de cadeiras e eco da aula',
      eu: 'Haurren marmarra, aulkien mugimendua eta gelako oihartzuna',
      'es-DO': 'Murmullo de niños, movimiento de sillas y eco del aula',
      'en-US': 'Children murmuring, chairs moving and classroom echo',
    },
    audioAssetKey: 'sensory_classroom_loop',
    calmStrategyTpr: {
      es: 'Manos en la mesa y respirar 3 veces con la gata',
      gl: 'Mans na mesa e respirar 3 veces coa gata',
      eu: 'Eskuak mahaian jarri eta 3 aldiz arnastu katuarekin',
      'es-DO': 'Manos sobre la mesa y respirar 3 veces con la gata',
      'en-US': 'Hands on desk and take 3 calm breaths with the cat',
    },
  },
  mall_ambience: {
    id: 'mall_ambience',
    pictoIndex: 54,
    category: 'ecological',
    label: {
      es: 'Centro comercial / Super',
      gl: 'Centro comercial / Super',
      eu: 'Merkataritza-gunea / Super',
      'es-DO': 'Plaza comercial / Súper',
      'en-US': 'Shopping Mall & Market',
    },
    description: {
      es: 'Bullicio de compras, carritos, pasos y megafonía suave',
      gl: 'Boliche de compras, carriños, pasos e megafonía suave',
      eu: 'Erosketen zalaparta, gurditxoak, urratsak eta megafonia',
      'es-DO': 'Bullicio de compras, carritos, pasos y megafonía suave',
      'en-US': 'Shopping bustle, carts rolling, steps and soft PA announcements',
    },
    audioAssetKey: 'sensory_mall_loop',
    calmStrategyTpr: {
      es: 'Sostener las manos del adulto y mirar un punto fijo',
      gl: 'Soster as mans do adulto e mirar un punto fixo',
      eu: 'Helduaren eskuak heldu eta puntu finko bati begiratu',
      'es-DO': 'Agarrar las manos del adulto y mirar un punto fijo',
      'en-US': 'Hold caregiver hands and focus on a calm spot',
    },
  },
  street_ambience: {
    id: 'street_ambience',
    pictoIndex: 55,
    category: 'ecological',
    label: {
      es: 'Calle viva y obras',
      gl: 'Rúa viva e obras',
      eu: 'Kaleko giroa eta obrak',
      'es-DO': 'Calle viva y construcción',
      'en-US': 'City Street & Works',
    },
    description: {
      es: 'Tráfico de coches, obreros trabajando y ruidos urbanos vivos',
      gl: 'Tráfico de coches, obreiros traballando e ruídos urbanos vivos',
      eu: 'Kotxeen trafikoa, langileak obretan eta hiriko zaratak',
      'es-DO': 'Tráfico de carros, obreros trabajando y ruidos urbanos vivos',
      'en-US': 'Passing traffic, construction workers and lively city sounds',
    },
    audioAssetKey: 'sensory_street_loop',
    calmStrategyTpr: {
      es: 'Abrazo de oso firme o apretar pelota antiestrés',
      gl: 'Aperta forte ou apertar pelota antiestrés',
      eu: 'Besarkada sendoa edo estresaren aurkako pilota estutu',
      'es-DO': 'Abrazo apretado o apretar pelota antiestrés',
      'en-US': 'Firm comforting hug or squeeze a stress ball',
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
    isAvailable: true, // Habilitado para simulación de ambientes ecológicos vivos
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
