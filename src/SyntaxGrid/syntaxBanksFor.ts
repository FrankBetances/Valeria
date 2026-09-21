// ============================================================================
// Valeria+ · Catálogos Léxicos para Cuadrícula Sintáctica en las 6 Variedades
// Mapea a pictogramas voxel existentes en ValeriaPixelArt y acciones TPR
// ============================================================================
import type { Locale } from '../valeriaLocale';
import type { SyntaxVocabularyBank, SyntaxItem } from './syntaxGridTypes';

const BANK_ES: SyntaxVocabularyBank = {
  locale: 'es',
  subjects: [
    { id: 'sub_yo', role: 'subject', label: 'Yo', emoji: '👦', pictogramKey: 'osito-pequeno', tprAction: 'Se señala a sí mismo', ttsText: 'Yo' },
    { id: 'sub_lua', role: 'subject', label: 'Lúa', emoji: '🐱', tprAction: 'Mueve las manos como bigotes de gata', ttsText: 'Lúa' },
    { id: 'sub_nino', role: 'subject', label: 'El niño', emoji: '🧒', pictogramKey: 'osito-grande', tprAction: 'Señala hacia adelante', ttsText: 'El niño' },
    { id: 'sub_pollito', role: 'subject', label: 'El pollito', emoji: '🐥', pictogramKey: 'pollito', tprAction: 'Aletea los brazos como pollito', ttsText: 'El pollito' },
  ],
  actions: [
    { id: 'act_come', role: 'action', label: 'come', emoji: '🍽️', tprAction: 'Hace el gesto de llevarse comida a la boca', ttsText: 'come' },
    { id: 'act_bebe', role: 'action', label: 'bebe', emoji: '🥛', pictogramKey: 'taza', tprAction: 'Hace el gesto de beber de un vaso', ttsText: 'bebe' },
    { id: 'act_juega', role: 'action', label: 'juega', emoji: '⚽', tprAction: 'Salta o hace rebotar una pelota imaginaria', ttsText: 'juega con' },
    { id: 'act_mira', role: 'action', label: 'mira', emoji: '👀', tprAction: 'Se pone los dedos alrededor de los ojos como prismáticos', ttsText: 'mira' },
    { id: 'act_toca', role: 'action', label: 'toca', emoji: '🥁', pictogramKey: 'tambora', tprAction: 'Toca un tambor imaginario con las dos manos', ttsText: 'toca' },
  ],
  objects: [
    { id: 'obj_manzana', role: 'object', label: 'la manzana', emoji: '🍎', pictogramKey: 'manzana', tprAction: 'Muerde una fruta imaginaria', ttsText: 'la manzana' },
    { id: 'obj_pan', role: 'object', label: 'el pan', emoji: '🥖', pictogramKey: 'pan', tprAction: 'Parte un pan con las manos', ttsText: 'el pan' },
    { id: 'obj_pez', role: 'object', label: 'el pez', emoji: '🐟', pictogramKey: 'pez', tprAction: 'Mueve la mano ondulando como pez', ttsText: 'el pez' },
    { id: 'obj_flor', role: 'object', label: 'la flor', emoji: '🌸', pictogramKey: 'flor', tprAction: 'Huele una flor imaginaria e inhala profundo', ttsText: 'la flor' },
    { id: 'obj_tambora', role: 'object', label: 'la tambora', emoji: '🪘', pictogramKey: 'tambora', tprAction: 'Hace ritmo pam pam sobre las piernas', ttsText: 'la tambora' },
  ],
};

const BANK_GL: SyntaxVocabularyBank = {
  locale: 'gl',
  subjects: [
    { id: 'sub_eu', role: 'subject', label: 'Eu', emoji: '👦', pictogramKey: 'osito-pequeno', tprAction: 'Apúntase a si mesmo', ttsText: 'Eu' },
    { id: 'sub_lua', role: 'subject', label: 'Lúa', emoji: '🐱', tprAction: 'Fai os bigotes da gata coas mans', ttsText: 'Lúa' },
    { id: 'sub_neno', role: 'subject', label: 'O neno', emoji: '🧒', pictogramKey: 'osito-grande', tprAction: 'Sinala cara adiante', ttsText: 'O neno' },
    { id: 'sub_pitino', role: 'subject', label: 'O pitiño', emoji: '🐥', pictogramKey: 'pollito', tprAction: 'Bate as ás coma un pitiño', ttsText: 'O pitiño' },
  ],
  actions: [
    { id: 'act_come', role: 'action', label: 'come', emoji: '🍽️', tprAction: 'Leva a man á boca coma se comese', ttsText: 'come' },
    { id: 'act_bebe', role: 'action', label: 'bebe', emoji: '🥛', pictogramKey: 'taza', tprAction: 'Fai o xesto de beber dun vaso', ttsText: 'bebe' },
    { id: 'act_xoga', role: 'action', label: 'xoga', emoji: '⚽', tprAction: 'Fai botar unha pelota imaxinaria', ttsText: 'xoga con' },
    { id: 'act_mira', role: 'action', label: 'mira', emoji: '👀', tprAction: 'Pon as mans en prismáticos nos ollos', ttsText: 'mira' },
    { id: 'act_toca', role: 'action', label: 'toca', emoji: '🥁', pictogramKey: 'tambora', tprAction: 'Toca un tambor coas dúas mans', ttsText: 'toca' },
  ],
  objects: [
    { id: 'obj_maza', role: 'object', label: 'a mazá', emoji: '🍎', pictogramKey: 'manzana', tprAction: 'Trisca unha mazá imaxinaria', ttsText: 'a mazá' },
    { id: 'obj_pan', role: 'object', label: 'o pan', emoji: '🥖', pictogramKey: 'pan', tprAction: 'Párteo pan coas mans', ttsText: 'o pan' },
    { id: 'obj_peixe', role: 'object', label: 'o peixe', emoji: '🐟', pictogramKey: 'pez', tprAction: 'Ondula a man coma un peixe', ttsText: 'o peixe' },
    { id: 'obj_flor', role: 'object', label: 'a flor', emoji: '🌸', pictogramKey: 'flor', tprAction: 'Cheira unha flor e respira fondo', ttsText: 'a flor' },
    { id: 'obj_tambor', role: 'object', label: 'o tambor', emoji: '🪘', pictogramKey: 'tambora', tprAction: 'Bate nas pernas co ritmo', ttsText: 'o tambor' },
  ],
};

const BANK_ES_DO: SyntaxVocabularyBank = {
  locale: 'es-DO',
  subjects: [
    { id: 'sub_yo', role: 'subject', label: 'Yo', emoji: '👦', pictogramKey: 'osito-pequeno', tprAction: 'Se señala con alegría', ttsText: 'Yo' },
    { id: 'sub_lua', role: 'subject', label: 'Lúa', emoji: '🐱', tprAction: 'Mueve las manos como bigotes de gata', ttsText: 'Lúa' },
    { id: 'sub_nino', role: 'subject', label: 'El niño', emoji: '🧒', pictogramKey: 'osito-grande', tprAction: 'Señala hacia adelante', ttsText: 'El niño' },
    { id: 'sub_pollito', role: 'subject', label: 'El pollito', emoji: '🐥', pictogramKey: 'pollito', tprAction: 'Aletea como pollito alegre', ttsText: 'El pollito' },
  ],
  actions: [
    { id: 'act_come', role: 'action', label: 'come', emoji: '🍽️', tprAction: 'Gesto de comer sabroso', ttsText: 'come' },
    { id: 'act_bebe', role: 'action', label: 'bebe', emoji: '🥛', pictogramKey: 'taza', tprAction: 'Gesto de tomar jugo fresco', ttsText: 'bebe' },
    { id: 'act_juega', role: 'action', label: 'juega', emoji: '⚽', tprAction: 'Gesto de tirar y atrapar', ttsText: 'juega con' },
    { id: 'act_mira', role: 'action', label: 'mira', emoji: '👀', tprAction: 'Ojos bien abiertos con las manos', ttsText: 'mira' },
    { id: 'act_toca', role: 'action', label: 'toca', emoji: '🪘', pictogramKey: 'tambora', tprAction: 'Toca la tambora con ritmo caribeño', ttsText: 'toca' },
  ],
  objects: [
    { id: 'obj_mango', role: 'object', label: 'el mango', emoji: '🥭', pictogramKey: 'mango', tprAction: 'Muerde un mango dulce', ttsText: 'el mango' },
    { id: 'obj_chinola', role: 'object', label: 'la chinola', emoji: '🍈', pictogramKey: 'chinola', tprAction: 'Saborea jugo de chinola', ttsText: 'la chinola' },
    { id: 'obj_tambora', role: 'object', label: 'la tambora', emoji: '🪘', pictogramKey: 'tambora', tprAction: 'Toca pam pam con alegría', ttsText: 'la tambora' },
    { id: 'obj_maracas', role: 'object', label: 'las maracas', emoji: '🪇', pictogramKey: 'maracas', tprAction: 'Sacude las manos como maracas', ttsText: 'las maracas' },
    { id: 'obj_cometa', role: 'object', label: 'la chichigua', emoji: '🪁', pictogramKey: 'cometa', tprAction: 'Sostiene el hilo de una chichigua al viento', ttsText: 'la chichigua' },
  ],
};

const BANK_EU: SyntaxVocabularyBank = {
  locale: 'eu',
  subjects: [
    { id: 'sub_ni', role: 'subject', label: 'Nik', emoji: '👦', pictogramKey: 'osito-pequeno', tprAction: 'Bere burua seinalatzen du', ttsText: 'Nik' },
    { id: 'sub_lua', role: 'subject', label: 'Luak', emoji: '🐱', tprAction: 'Katuaren biboteak egiten ditu', ttsText: 'Luak' },
    { id: 'sub_umea', role: 'subject', label: 'Umeak', emoji: '🧒', pictogramKey: 'osito-grande', tprAction: 'Aurrera seinalatzen du', ttsText: 'Umeak' },
    { id: 'sub_txitxa', role: 'subject', label: 'Txitoak', emoji: '🐥', pictogramKey: 'pollito', tprAction: 'Hegalak astintzen ditu txito baten moduan', ttsText: 'Txitoak' },
  ],
  actions: [
    { id: 'act_jan', role: 'action', label: 'jaten du', emoji: '🍽️', tprAction: 'Eskua ahora eramaten du jaten bezala', ttsText: 'jaten du' },
    { id: 'act_edan', role: 'action', label: 'edaten du', emoji: '🥛', pictogramKey: 'taza', tprAction: 'Basotik edateko keinua egiten du', ttsText: 'edaten du' },
    { id: 'act_jolas', role: 'action', label: 'jolasten du', emoji: '⚽', tprAction: 'Pilotarekin salto egiten du', ttsText: 'jolasten du' },
    { id: 'act_ikusi', role: 'action', label: 'ikusten du', emoji: '👀', tprAction: 'Begiak adi jartzen ditu', ttsText: 'ikusten du' },
    { id: 'act_jo', role: 'action', label: 'jotzen du', emoji: '🥁', pictogramKey: 'tambora', tprAction: 'Danborra jotzen du bi eskuekin', ttsText: 'jotzen du' },
  ],
  objects: [
    { id: 'obj_sagarra', role: 'object', label: 'sagarra', emoji: '🍎', pictogramKey: 'manzana', tprAction: 'Sagar bat hozkatzen du', ttsText: 'sagarra' },
    { id: 'obj_ogia', role: 'object', label: 'ogia', emoji: '🥖', pictogramKey: 'pan', tprAction: 'Ogia puskatzen du eskuekin', ttsText: 'ogia' },
    { id: 'obj_arraina', role: 'object', label: 'arraina', emoji: '🐟', pictogramKey: 'pez', tprAction: 'Eskua arrain baten gisa mugitzen du', ttsText: 'arraina' },
    { id: 'obj_lorea', role: 'object', label: 'lorea', emoji: '🌸', pictogramKey: 'flor', tprAction: 'Lorea usaintzen du', ttsText: 'lorea' },
    { id: 'obj_danborra', role: 'object', label: 'danborra', emoji: '🪘', pictogramKey: 'tambora', tprAction: 'Danborraren erritmoa hanketan', ttsText: 'danborra' },
  ],
};

const BANK_EN: SyntaxVocabularyBank = {
  locale: 'en-US',
  subjects: [
    { id: 'sub_i', role: 'subject', label: 'I', emoji: '👦', pictogramKey: 'osito-pequeno', tprAction: 'Points gently to self', ttsText: 'I' },
    { id: 'sub_lua', role: 'subject', label: 'Lua', emoji: '🐱', tprAction: 'Mimics cat whiskers with fingers', ttsText: 'Lua' },
    { id: 'sub_child', role: 'subject', label: 'The child', emoji: '🧒', pictogramKey: 'osito-grande', tprAction: 'Points forward', ttsText: 'The child' },
    { id: 'sub_chick', role: 'subject', label: 'The chick', emoji: '🐥', pictogramKey: 'pollito', tprAction: 'Flaps arms like wings', ttsText: 'The chick' },
  ],
  actions: [
    { id: 'act_eat', role: 'action', label: 'eats', emoji: '🍽️', tprAction: 'Brings hand to mouth as if eating', ttsText: 'eats' },
    { id: 'act_drink', role: 'action', label: 'drinks', emoji: '🥛', pictogramKey: 'taza', tprAction: 'Mimics drinking from a cup', ttsText: 'drinks' },
    { id: 'act_play', role: 'action', label: 'plays with', emoji: '⚽', tprAction: 'Bounces an imaginary ball', ttsText: 'plays with' },
    { id: 'act_see', role: 'action', label: 'sees', emoji: '👀', tprAction: 'Shapes hands like binoculars over eyes', ttsText: 'sees' },
    { id: 'act_play_music', role: 'action', label: 'plays', emoji: '🥁', pictogramKey: 'tambora', tprAction: 'Taps hands on lap like drum', ttsText: 'plays' },
  ],
  objects: [
    { id: 'obj_apple', role: 'object', label: 'the apple', emoji: '🍎', pictogramKey: 'manzana', tprAction: 'Bites an imaginary crisp apple', ttsText: 'the apple' },
    { id: 'obj_bread', role: 'object', label: 'the bread', emoji: '🥖', pictogramKey: 'pan', tprAction: 'Breaks bread with both hands', ttsText: 'the bread' },
    { id: 'obj_fish', role: 'object', label: 'the fish', emoji: '🐟', pictogramKey: 'pez', tprAction: 'Wiggles hand like a swimming fish', ttsText: 'the fish' },
    { id: 'obj_flower', role: 'object', label: 'the flower', emoji: '🌸', pictogramKey: 'flor', tprAction: 'Inhales deep smelling a flower', ttsText: 'the flower' },
    { id: 'obj_drum', role: 'object', label: 'the drum', emoji: '🪘', pictogramKey: 'tambora', tprAction: 'Taps rhythm on thighs', ttsText: 'the drum' },
  ],
};

const BANK_CA: SyntaxVocabularyBank = {
  locale: 'ca',
  subjects: [
    { id: 'sub_jo', role: 'subject', label: 'Jo', emoji: '👦', pictogramKey: 'osito-pequeno', tprAction: 'S’assenyala a si mateix', ttsText: 'Jo' },
    { id: 'sub_lua', role: 'subject', label: 'La Lúa', emoji: '🐱', tprAction: 'Fa els bigotis de gata amb els dits', ttsText: 'La Lúa' },
    { id: 'sub_nen', role: 'subject', label: 'El nen', emoji: '🧒', pictogramKey: 'osito-grande', tprAction: 'Assenyala endavant', ttsText: 'El nen' },
    { id: 'sub_pollet', role: 'subject', label: 'El pollet', emoji: '🐥', pictogramKey: 'pollito', tprAction: 'Batega les ales com un pollet', ttsText: 'El pollet' },
  ],
  actions: [
    { id: 'act_menja', role: 'action', label: 'menja', emoji: '🍽️', tprAction: 'Fa el gest de menjar', ttsText: 'menja' },
    { id: 'act_beu', role: 'action', label: 'beu', emoji: '🥛', pictogramKey: 'taza', tprAction: 'Fa com si begués d’un got', ttsText: 'beu' },
    { id: 'act_juga', role: 'action', label: 'juga amb', emoji: '⚽', tprAction: 'Bota una pilota imaginària', ttsText: 'juga amb' },
    { id: 'act_mira', role: 'action', label: 'mira', emoji: '👀', tprAction: 'Posa les mans com prismàtics als ulls', ttsText: 'mira' },
    { id: 'act_toca', role: 'action', label: 'toca', emoji: '🥁', pictogramKey: 'tambora', tprAction: 'Toca un tambor amb les mans', ttsText: 'toca' },
  ],
  objects: [
    { id: 'obj_poma', role: 'object', label: 'la poma', emoji: '🍎', pictogramKey: 'manzana', tprAction: 'Mossega una poma fresca', ttsText: 'la poma' },
    { id: 'obj_pa', role: 'object', label: 'el pa', emoji: '🥖', pictogramKey: 'pan', tprAction: 'Trenca el pa amb les mans', ttsText: 'el pa' },
    { id: 'obj_peix', role: 'object', label: 'el peix', emoji: '🐟', pictogramKey: 'pez', tprAction: 'Ondula la mà com un peix', ttsText: 'el peix' },
    { id: 'obj_flor', role: 'object', label: 'la flor', emoji: '🌸', pictogramKey: 'flor', tprAction: 'Ensuma una flor i respira profund', ttsText: 'la flor' },
    { id: 'obj_tambor', role: 'object', label: 'el tambor', emoji: '🪘', pictogramKey: 'tambora', tprAction: 'Pica de mans sobre les cuixes', ttsText: 'el tambor' },
  ],
};

export function getSyntaxBankForLocale(locale: Locale): SyntaxVocabularyBank {
  switch (locale) {
    case 'gl':
      return BANK_GL;
    case 'es-DO':
      return BANK_ES_DO;
    case 'eu':
      return BANK_EU;
    case 'en-US':
      return BANK_EN;
    case 'ca':
      return BANK_CA;
    case 'es':
    default:
      return BANK_ES;
  }
}
