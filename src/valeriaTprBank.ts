// ============================================================================
// Valeria+ · Banco de Cápsulas TPR — datos PUROS (sin imports de RN/Expo)
// Extraído de ValeriaTPRCapsule.tsx para que el corpus de voz (build-time,
// Node) pueda enumerarlo sin arrastrar react-native. El overlay lo re-exporta,
// así los imports históricos siguen funcionando.
// ============================================================================

export interface TprCommand { emoji: string; text: string; }
export interface TprCapsule { icon: string; title: string; commands: TprCommand[]; }

// Banco de cápsulas: órdenes cortas, imperativas y muy visuales (estilo Asher).
export const TPR_CAPSULES: TprCapsule[] = [
  {
    icon: '🙆', title: 'Simón dice… ¡cuerpo!',
    commands: [
      { emoji: '🧠', text: 'Tócate la cabeza.' },
      { emoji: '👃', text: 'Tócate la nariz.' },
      { emoji: '🙌', text: 'Levanta los brazos muy alto.' },
    ],
  },
  {
    icon: '🐾', title: 'Animales en acción',
    commands: [
      { emoji: '🐸', text: 'Salta como una rana.' },
      { emoji: '🐻', text: 'Camina como un oso, a cuatro patas.' },
      { emoji: '🐦', text: 'Vuela como un pájaro moviendo los brazos.' },
    ],
  },
  {
    icon: '⚡', title: '¡A moverse!',
    commands: [
      { emoji: '🦘', text: 'Salta tres veces.' },
      { emoji: '🌀', text: 'Da una vuelta entera.' },
      { emoji: '🪑', text: 'Siéntate en el suelo.' },
    ],
  },
  {
    icon: '🐢', title: 'Rápido y despacio',
    commands: [
      { emoji: '🐢', text: 'Camina muy, muy despacio, como una tortuga.' },
      { emoji: '🏃', text: 'Corre en tu sitio, ¡rápido, rápido!' },
      { emoji: '🗿', text: '¡Estatua! Quédate quieto sin moverte.' },
    ],
  },
  {
    icon: '👏', title: 'Manos que hablan',
    commands: [
      { emoji: '👏', text: 'Aplaude muy fuerte.' },
      { emoji: '👋', text: 'Di adiós con la mano.' },
      { emoji: '😘', text: 'Manda un beso volador.' },
    ],
  },
  {
    icon: '🎈', title: 'Grande y pequeño',
    commands: [
      { emoji: '🦒', text: 'Hazte muy grande, estírate hasta el cielo.' },
      { emoji: '⚽', text: 'Hazte pequeño como una pelota.' },
      { emoji: '🌳', text: 'Abre los brazos como un árbol gigante.' },
    ],
  },
  {
    icon: '🎭', title: 'Emociones con el cuerpo',
    commands: [
      { emoji: '😀', text: 'Pon cara de mucha alegría.' },
      { emoji: '😠', text: 'Enséñame el enfado con los brazos cruzados.' },
      { emoji: '🤗', text: 'Date un abrazo muy fuerte.' },
    ],
  },
  {
    icon: '🤖', title: 'El robot obediente',
    commands: [
      { emoji: '🤖', text: 'Camina como un robot diciendo bip, bop.' },
      { emoji: '🛑', text: 'Robot… ¡para!' },
      { emoji: '🔋', text: 'El robot se apaga: túmbate despacito.' },
    ],
  },
];

export const pickTprCapsule = (): TprCapsule =>
  TPR_CAPSULES[Math.floor(Math.random() * TPR_CAPSULES.length)];
