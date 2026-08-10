// ============================================================================
// Valeria+ · Academy — Contenido del dominio Hipoacusia (V2.0)
// Módulo PURO. Se sirve como micro-guías (AcademyGuideUnit) dentro del
// BottomSheet de Hipoacusia, en dos ejes:
//   1. Conceptos Clínicos  → qué es la sordera y su abordaje terapéutico.
//   2. Manejo de Dispositivos → Audífono, Implante Coclear, Osteointegrado,
//      cada uno con micro-guías: Cómo funciona · Manejo básico · Cuidados.
//
// Cada unidad inyecta su XP en el silo 'hipoacusia' al marcarse como vista.
// Regla MDR: contenido formativo para el cuidador. Nunca instruye a modificar
// parámetros de programación del dispositivo (eso es competencia del audiólogo).
// ============================================================================
import { AcademyGuideUnit, HearingDevice } from './academyTypes';
import type { BlockIconName } from '../ValeriaBlockIcons';

// --- Eje 1 · Conceptos Clínicos ---------------------------------------------
export const HIPOACUSIA_CONCEPTS: AcademyGuideUnit[] = [
  {
    id: 'hip-concepto-que-es',
    domain: 'hipoacusia',
    xp: 15,
    icon: 'hearing',
    heading: '¿Qué es la hipoacusia?',
    body: 'La hipoacusia es una disminución de la capacidad de oír. Puede ser leve o profunda (sordera), afectar a uno o ambos oídos, y estar presente desde el nacimiento o aparecer después. Lo decisivo no es solo "cuánto oye", sino cuánto lenguaje llega al cerebro en los primeros años, cuando más aprende.',
  },
  {
    id: 'hip-concepto-tipos',
    domain: 'hipoacusia',
    xp: 15,
    icon: 'compass',
    heading: 'Dónde falla el sonido',
    body: 'De transmisión (conductiva): el sonido no cruza bien el oído externo o medio. Neurosensorial: el problema está en la cóclea o el nervio. Mixta: ambas. El tipo y el grado los determina el equipo médico mediante audiometrías; esa información guía qué dispositivo conviene.',
  },
  {
    id: 'hip-concepto-abordaje',
    domain: 'hipoacusia',
    xp: 20,
    icon: 'clinical',
    heading: 'El abordaje terapéutico',
    body: 'Detectar pronto, equipar (audífono o implante) y estimular el lenguaje: ese es el trío. El dispositivo devuelve el acceso al sonido, pero no "enseña" a entender por sí solo. El cerebro aprende a interpretar lo que ahora oye gracias a la terapia auditivo-verbal y a un adulto que le da baño de lenguaje cada día.',
  },
  {
    id: 'hip-concepto-rol',
    domain: 'hipoacusia',
    xp: 20,
    icon: 'family',
    heading: 'Tu papel con el dispositivo',
    body: 'Tú garantizas que el dispositivo esté puesto, encendido y en buen estado durante todas las horas de vigilia ("ojos abiertos, oídos puestos"). Detectas si algo no suena bien y avisas al audiólogo. Nunca ajustas la programación por tu cuenta: eso lo hace el profesional. Tu constancia diaria es la mitad de la terapia.',
  },
  // Bloque de Realidad Aumentada · AR-2. Va aquí, en Conceptos Clínicos, y no
  // como cápsula suelta: quien pregunta "¿oye de dónde viene?" está ya dentro
  // de este eje. Explica qué mide el VRA y por qué en casa se juega sin
  // cronómetro, que es la duda que aparece al ver `latencyMs` vacío.
  {
    id: 'hip-vra-que-es',
    domain: 'hipoacusia',
    xp: 20,
    icon: 'bell',
    heading: 'Girar la cabeza hacia el sonido',
    body: 'Oír no es solo detectar: es saber de DÓNDE viene. Esa orientación —girar la cabeza hacia la fuente— es una de las conductas más antiguas que evalúa la audiología infantil, y se llama VRA. Lo que importa no es solo si gira, sino cuánto tarda: un giro seguro y rápido no dice lo mismo que uno dudoso a los dos segundos. Hasta ahora eso se anotaba a ojo.',
  },
  {
    id: 'hip-vra-instrumentado',
    domain: 'hipoacusia',
    xp: 20,
    icon: 'timer',
    heading: 'La versión con cronómetro',
    body: 'El ejercicio AR-2 hace lo mismo que la campanita de siempre, pero la cámara mide el giro en milisegundos en lugar de estimarlo. Para que ese número valga hacen falta dos altavoces por cable a los lados: el altavoz del móvil no separa izquierda de derecha, y el Bluetooth añade un retraso variable justo del tamaño de lo que se quiere medir. Sin ese montaje el juego funciona igual —tu peque gira, el perro celebra— pero la app NO apunta un tiempo en vez de apuntar uno inventado. Un dato que falta y lo dice es honesto; uno que parece bueno y está sesgado, no.',
  },
];

// --- Eje 2 · Manejo de Dispositivos -----------------------------------------
export const HEARING_DEVICES: HearingDevice[] = [
  {
    key: 'audifono',
    label: 'Audífono',
    short: 'Audífono',
    tagline: 'Amplifica el sonido para un oído que aún oye algo.',
    guides: [
      {
        id: 'hip-audifono-funciona',
        domain: 'hipoacusia',
        xp: 15,
        icon: 'speaker',
        heading: 'Cómo funciona',
        body: 'Un micrófono capta el sonido, un procesador lo amplifica según la pérdida del niño y un altavoz lo envía al oído por un molde. Aprovecha la audición que queda, haciéndola más fuerte y clara. Es la opción cuando la cóclea conserva función suficiente.',
      },
      {
        id: 'hip-audifono-manejo',
        domain: 'hipoacusia',
        xp: 15,
        icon: 'gesture',
        heading: 'Manejo básico',
        body: 'Enciende, comprueba que el molde entra cómodo y sin pitidos (el pitido, o feedback, suele indicar mal encaje). Ajusta el volumen solo al valor indicado por el audiólogo. Retíralo para dormir y para el agua. Guárdalo siempre en su estuche.',
      },
      {
        id: 'hip-audifono-cuidados',
        domain: 'hipoacusia',
        xp: 15,
        icon: 'drop',
        heading: 'Cuidados y mantenimiento',
        body: 'Limpia el molde con un paño seco; nunca lo mojes con el aparato puesto. Usa el deshumidificador cada noche para evitar humedad. Revisa la pila o carga a diario. Ante cera acumulada o sonido apagado, cambia el filtro antiencerado o consulta. Lejos del calor y de manos pequeñas.',
      },
    ],
  },
  {
    key: 'implante',
    label: 'Implante Coclear',
    short: 'Implante',
    tagline: 'Estimula el nervio auditivo cuando el audífono no basta.',
    guides: [
      {
        id: 'hip-implante-funciona',
        domain: 'hipoacusia',
        xp: 20,
        icon: 'magnet',
        heading: 'Cómo funciona',
        body: 'Tiene dos partes: una externa (procesador con micrófono y una antena con imán) y una interna, implantada en cirugía. El procesador convierte el sonido en señales que la antena transmite por la piel al receptor interno; unos electrodos en la cóclea estimulan directamente el nervio auditivo. No amplifica: sustituye a las células dañadas.',
      },
      {
        id: 'hip-implante-manejo',
        domain: 'hipoacusia',
        xp: 20,
        icon: 'material',
        heading: 'Manejo básico',
        body: 'Coloca el procesador sobre la oreja y acerca la antena a la cabeza: el imán la fija sola sobre el implante. Comprueba que la luz indicadora confirma conexión. Usa el imán y el cable de la fuerza adecuada para el niño. En bebés, un accesorio de retención evita caídas. Retíralo para dormir, el baño y la piscina.',
      },
      {
        id: 'hip-implante-cuidados',
        domain: 'hipoacusia',
        xp: 20,
        icon: 'battery',
        heading: 'Cuidados y mantenimiento',
        body: 'Seca el procesador cada noche en el deshumidificador. Protege la antena de tirones y de la electricidad estática (toboganes de plástico). Revisa cable, imán y baterías a diario. La parte interna no se toca. Si deja de responder, prueba batería y cable antes de avisar al centro implantador.',
      },
    ],
  },
  {
    key: 'osteo',
    label: 'Osteointegrado',
    short: 'Osteo',
    tagline: 'Lleva el sonido al oído interno a través del hueso.',
    guides: [
      {
        id: 'hip-osteo-funciona',
        domain: 'hipoacusia',
        xp: 20,
        icon: 'hearing',
        heading: 'Cómo funciona',
        body: 'El implante osteointegrado transforma el sonido en vibración y la transmite por el hueso del cráneo directamente a la cóclea, saltándose el oído externo y medio. Es útil en hipoacusias de transmisión o cuando no se puede usar un molde. El procesador se sujeta a un pilar anclado al hueso o a un imán bajo la piel.',
      },
      {
        id: 'hip-osteo-manejo',
        domain: 'hipoacusia',
        xp: 20,
        icon: 'autism',
        heading: 'Manejo básico',
        body: 'Acopla el procesador al pilar o al imán con un clic suave; comprueba que queda firme. Enciende y ajusta al programa indicado. En niños pequeños suele empezarse con una banda elástica blanda (softband) antes de la cirugía. Retíralo para dormir y para el agua salvo modelos específicos.',
      },
      {
        id: 'hip-osteo-cuidados',
        domain: 'hipoacusia',
        xp: 20,
        icon: 'drop',
        heading: 'Cuidados y mantenimiento',
        body: 'Si hay pilar, limpia a diario la piel alrededor según indique el equipo, vigilando enrojecimiento. Mantén el procesador seco y en el deshumidificador por la noche. Revisa batería y sujeción. Cuida la banda softband para que no apriete de más. Ante molestia o piel irritada, consulta antes de forzar el uso.',
      },
    ],
  },
];

// Todas las unidades del dominio Hipoacusia (conceptos + guías de dispositivo),
// aplanadas — el registro de contenido las suma al total del silo 'hipoacusia'.
export const HIPOACUSIA_UNITS: AcademyGuideUnit[] = [
  ...HIPOACUSIA_CONCEPTS,
  ...HEARING_DEVICES.flatMap((d) => d.guides),
];
