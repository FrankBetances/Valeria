// ============================================================================
// Aventuras con Lúa · Xogos en GALEGO
//
// Tres clases de cambio, e a diferenza entre elas importa:
//
// 1. TRADUCIR O RÓTULO, conservando o debuxo. É o caso das froitas tropicais:
//    o pictograma É unha papaia, así que en galego chámase papaia. Cambiar o
//    debuxo non se pode —vén do banco propio— e mentir co rótulo, tampouco.
//
// 2. REAUTORIZAR O ESTÍMULO cando o obxectivo clínico depende do son. Os
//    cazadores do /s/ levaban «silla», que en galego é «cadeira» e NON empeza
//    por /s/: o exercicio quedaba roto. Entra «semente», que si. O mesmo co
//    completar palabras: «perro» é «can», tres letras, non dá para agochar
//    unha; entra «pato» (PA_O). Sen isto o xogo pediría algo imposible.
//
// 3. CAMBIAR O REFERENTE cando o léxico dominicano non ensina nada aquí. Na
//    clasificación de froitas entran mazá, uvas e amorodo, que teñen debuxo
//    propio no banco e están na mesa dun neno de Lugo.
//
// O que NON cambia: a franxa de idade, o tipo de xogo, os grupos de
// clasificación e a estrutura. Iso vén do catálogo base.
//
// ✅ Avaliado e validado por ACOPROS (comunicado por Frank o 6/9/2026).
// ============================================================================
import type { LuaGame } from '../LuaGamesCatalog';

export type LuaGameOverride = Partial<Pick<LuaGame,
  'title' | 'subtitle' | 'instructions' | 'groups' | 'clues' | 'items'>>;

export const LUA_GAMES_GL: Record<string, LuaGameOverride> = {
  lua_game_01: {
    title: 'Memorama: sons do campo',
    subtitle: '8 tarxetas, 4 parellas',
    instructions: 'Busca as parellas iguais e di o nome en voz alta.',
    items: [
      { pic: 'perro', label: 'Can' }, { pic: 'gato', label: 'Gato' },
      { pic: 'pato', label: 'Pato' }, { pic: 'casa', label: 'Casa' },
    ],
  },
  lua_game_02: {
    title: 'Memorama: instrumentos musicais',
    subtitle: '8 tarxetas, 4 parellas',
    instructions: 'Atopa as parellas e imita o son de cada instrumento.',
    items: [
      { pic: 'tambora', label: 'Tambor' }, { pic: 'pandereta', label: 'Pandeireta' },
      { pic: 'maracas', label: 'Maracas' }, { pic: 'casa', label: 'Casa' },
    ],
  },
  lua_game_03: {
    title: 'Froitas tropicais',
    subtitle: 'Une cada froita co seu nome',
    instructions: 'Nomea cada froita en voz alta e únea co seu nome escrito.',
    items: [
      { pic: 'mango', label: 'Mango' }, { pic: 'lechosa', label: 'Papaia' },
      { pic: 'chinola', label: 'Maracuxá' }, { pic: 'platano', label: 'Plátano' },
    ],
  },
  lua_game_04: {
    title: 'Imaxe-palabra: na praia',
    subtitle: 'Que atoparías na praia?',
    instructions: 'Toca cada imaxe e di o seu nome. Cal destas cousas atoparías na praia?',
    items: [
      { pic: 'ola', label: 'Onda' }, { pic: 'concha', label: 'Cuncha' },
      { pic: 'sol', label: 'Sol' }, { pic: 'barco', label: 'Barquiño' },
    ],
  },
  lua_game_05: {
    // «Perro» sae: en galego é «can» e con tres letras non hai onde agochar
    // unha. Entra «pato», que ten debuxo propio e dá PA_O.
    title: 'Completa a palabra: animais',
    subtitle: 'Escribe a letra que falta',
    instructions: 'Escribe na liña a letra que falta para completar o nome do animal.',
    items: [
      { pic: 'gato', label: 'Gato', template: 'GA_O' },
      { pic: 'pato', label: 'Pato', template: 'PA_O' },
      { pic: 'vaca', label: 'Vaca', template: 'VA_A' },
      { pic: 'gallina', label: 'Galiña', template: 'GA_IÑA' },
    ],
  },
  lua_game_06: {
    // «Silla» é «cadeira» e non empeza por /s/. Entra «semente».
    title: 'Cazadores de sons: o son /s/',
    subtitle: 'Rodea as que empezan por /s/',
    instructions: 'Rodea as imaxes cuxo nome empeza co son /s/.',
    items: [
      { pic: 'sol', label: 'Sol', isTarget: true }, { pic: 'sapo', label: 'Sapo', isTarget: true },
      { pic: 'semilla', label: 'Semente', isTarget: true }, { pic: 'sandia', label: 'Sandía', isTarget: true },
    ],
  },
  lua_game_07: {
    title: 'Quebracabezas de secuencia: a semente medra',
    subtitle: 'Ordena do 1 ao 4',
    instructions: 'Ordena as 4 tarxetas do 1 ao 4 para amosar como medra a planta.',
    items: [
      { pic: 'semilla', label: 'Semente' }, { pic: 'brote', label: 'Gromo' },
      { pic: 'planta', label: 'Planta' }, { pic: 'arbol', label: 'Árbore' },
    ],
  },
  lua_game_08: {
    // Froitas da mesa dun neno de aquí, coas fichas que xa existen no banco.
    title: 'As casiñas das categorías',
    subtitle: 'Cada debuxo ao seu grupo',
    instructions: 'Coloca cada debuxo na súa casiña: froitas ou animais.',
    groups: ['Froitas', 'Animais'],
    items: [
      { pic: 'manzana', label: 'Mazá', group: 'Froitas' },
      { pic: 'gato', label: 'Gato', group: 'Animais' },
      { pic: 'uvas', label: 'Uvas', group: 'Froitas' },
      { pic: 'perro', label: 'Can', group: 'Animais' },
      { pic: 'fresa', label: 'Amorodo', group: 'Froitas' },
      { pic: 'sapo', label: 'Sapo', group: 'Animais' },
    ],
  },
  lua_game_09: {
    title: 'Atopa a diferenza',
    subtitle: '3 filas, un distinto en cada unha',
    instructions: 'En cada fila, busca o debuxo que é diferente aos demais.',
    groups: ['Fila 1', 'Fila 2', 'Fila 3'],
    items: [
      { pic: 'arbol', label: 'Árbore', group: 'Fila 1' },
      { pic: 'arbol', label: 'Árbore', group: 'Fila 1' },
      { pic: 'casa', label: 'Casa', group: 'Fila 1', isTarget: true },
      { pic: 'arbol', label: 'Árbore', group: 'Fila 1' },
      { pic: 'manzana', label: 'Mazá', group: 'Fila 2' },
      { pic: 'cometa', label: 'Papaventos', group: 'Fila 2', isTarget: true },
      { pic: 'manzana', label: 'Mazá', group: 'Fila 2' },
      { pic: 'manzana', label: 'Mazá', group: 'Fila 2' },
      { pic: 'gato', label: 'Gato', group: 'Fila 3' },
      { pic: 'gato', label: 'Gato', group: 'Fila 3' },
      { pic: 'perro', label: 'Can', group: 'Fila 3', isTarget: true },
      { pic: 'gato', label: 'Gato', group: 'Fila 3' },
    ],
  },
  lua_game_10: {
    title: 'Vocabulario: familia de palabras — a praia',
    subtitle: 'Di unha palabra relacionada',
    instructions: 'Di unha palabra relacionada coa praia en cada oco baleiro.',
    items: [
      { pic: 'ola', label: 'Praia' },
      { label: '' }, { label: '' }, { label: '' },
      { label: '' }, { label: '' },
    ],
  },
  lua_game_11: {
    title: 'Caixa de sons máxica',
    subtitle: 'Dous sons moi distintos',
    instructions: 'Toca o debuxo e escoita o seu son. Cal soa distinto?',
    items: [
      { pic: 'perro', label: 'Can' }, { pic: 'gallina', label: 'Galiña' },
    ],
  },
  lua_game_12: {
    title: 'Quen son?',
    subtitle: 'Imaxe e palabra, vocabulario básico',
    instructions: 'Toca o debuxo e di o seu nome comigo.',
    items: [
      { pic: 'gato', label: 'Gato' }, { pic: 'pato', label: 'Pato' },
      { pic: 'vaca', label: 'Vaca' }, { pic: 'sapo', label: 'Sapo' },
    ],
  },
  lua_game_13: {
    title: 'Atopa o meu nome',
    subtitle: 'Dúas opcións grandes e claras',
    instructions: 'Dígoche unha palabra e ti tocas o seu debuxo.',
    items: [
      { pic: 'pelota', label: 'Pelota' }, { pic: 'manzana', label: 'Mazá' },
    ],
  },
  lua_game_14: {
    title: 'Monta a árbore',
    subtitle: 'Quebracabezas: ordena e nomea ao completar',
    instructions: 'Ordena as pezas da árbore do 1 ao 4 e di o seu nome ao rematar.',
    items: [
      { pic: 'semilla', label: 'Semente' }, { pic: 'brote', label: 'Gromo' },
      { pic: 'planta', label: 'Mata' }, { pic: 'arbol', label: 'Árbore' },
    ],
  },
  lua_game_15: {
    title: 'O sapo choutón',
    subtitle: 'Ordena a historia do 1 ao 4',
    instructions: 'Ordena as tarxetas para contar a onde chouta o sapo.',
    items: [
      { pic: 'sapo', label: 'O sapo' }, { pic: 'ola', label: 'Chouta ao río' },
      { pic: 'arbol', label: 'Sobe á árbore' }, { pic: 'luna', label: 'Canta de noite' },
    ],
  },
  lua_game_16: {
    title: 'Simón di',
    subtitle: 'Atención e instrucións',
    instructions: 'Só se digo «Simón di», fai o que ves no debuxo.',
    items: [
      { pic: 'saltar', label: 'Chouta' }, { pic: 'correr', label: 'Corre' },
      { pic: 'soplar', label: 'Sopra' }, { pic: 'abrazo', label: 'Aperta' },
      { pic: 'parar', label: 'Para' }, { pic: 'dormir', label: 'Fai que dormes' },
    ],
  },
  lua_game_17: {
    title: 'O tren das letras',
    subtitle: 'Sons iniciais, nivel avanzado',
    instructions: 'Sobe ao tren só as palabras que empezan co son /m/.',
    // Tres dianas e tres distractores, coma no banco base: «mazá» tamén empeza
    // por /m/, así que non pode ser distractor. Quedan coco e palma, que en
    // galego se din igual e teñen ficha propia.
    items: [
      { pic: 'mango', label: 'Mango', isTarget: true }, { pic: 'mesa', label: 'Mesa', isTarget: true },
      { pic: 'mano', label: 'Man', isTarget: true }, { pic: 'coco', label: 'Coco' },
      { pic: 'palma', label: 'Palma' }, { pic: 'sol', label: 'Sol' },
    ],
  },
  lua_game_18: {
    title: 'Como me sinto?',
    subtitle: 'Clasificación emocional',
    instructions: 'Coloca cada cara onde vai: gústame ou cústame sentirme así.',
    groups: ['Gústame sentirme así', 'Cústame sentirme así'],
    items: [
      { pic: 'cara-feliz', label: 'Feliz', group: 'Gústame sentirme así' },
      { pic: 'cara-tranquila', label: 'Tranquilo', group: 'Gústame sentirme así' },
      { pic: 'cara-sorprendida', label: 'Sorprendido', group: 'Gústame sentirme así' },
      { pic: 'cara-triste', label: 'Triste', group: 'Cústame sentirme así' },
      { pic: 'cara-enojada', label: 'Enfadado', group: 'Cústame sentirme así' },
      { pic: 'cara-asustada', label: 'Asustado', group: 'Cústame sentirme así' },
    ],
  },
  lua_game_19: {
    title: 'Adiviña a palabra secreta',
    subtitle: 'Pistas progresivas',
    instructions: 'Escoita as pistas, da máis difícil á máis fácil, e adiviña.',
    clues: [
      'Medra moi alta e abanea co vento.',
      'Dá sombra no patio e na praia.',
      'Dela cae a mazá.',
    ],
    items: [
      { pic: 'arbol', label: 'Árbore', isTarget: true },
      { pic: 'casa', label: 'Casa' },
      { pic: 'barco', label: 'Barco' },
    ],
  },
  lua_game_20: {
    title: 'As palabras da miña casa',
    subtitle: 'Oito obxectos de todos os días',
    instructions: 'Toca cada debuxo e di o seu nome en voz alta.',
    items: [
      { pic: 'perro', label: 'Can' }, { pic: 'gato', label: 'Gato' },
      { pic: 'pelota', label: 'Pelota' }, { pic: 'casa', label: 'Casa' },
      { pic: 'sol', label: 'Sol' }, { pic: 'pan', label: 'Pan' },
      { pic: 'vaso', label: 'Vaso' }, { pic: 'zapato', label: 'Zapato' },
    ],
  },
  lua_game_21: {
    title: 'A rutina da mañá',
    subtitle: 'Ordena os catro pasos',
    instructions: 'Ordena os pasos da mañá: espertar, lavarse, vestirse e almorzar.',
    items: [
      { pic: 'dormir', label: 'Espertar' }, { pic: 'mano-limpia', label: 'Lavarse' },
      { pic: 'vestir', label: 'Vestirse' }, { pic: 'comer', label: 'Almorzar' },
    ],
  },
  lua_game_22: {
    title: 'Bingo de sons: o son /p/',
    subtitle: 'Marca as que empezan por /p/',
    instructions: 'Marca as imaxes cuxo nome empeza co son /p/.',
    items: [
      { pic: 'pato', label: 'Pato', isTarget: true }, { pic: 'pelota', label: 'Pelota', isTarget: true },
      { pic: 'pan', label: 'Pan', isTarget: true }, { pic: 'pajaro', label: 'Paxaro', isTarget: true },
      { pic: 'sol', label: 'Sol' }, { pic: 'mesa', label: 'Mesa' },
      { pic: 'gato', label: 'Gato' }, { pic: 'casa', label: 'Casa' },
      { pic: 'luna', label: 'Lúa' },
    ],
  },
  lua_game_23: {
    title: 'Como me sinto hoxe?',
    subtitle: 'Escolle a túa cara do día',
    instructions: 'Mira as caras e toca a que di como te sentes hoxe.',
    items: [
      { pic: 'cara-feliz', label: 'Feliz' }, { pic: 'cara-triste', label: 'Triste' },
      { pic: 'cara-enojada', label: 'Enfadado' }, { pic: 'cara-sorprendida', label: 'Sorprendido' },
      { pic: 'cara-asustada', label: 'Asustado' }, { pic: 'cara-tranquila', label: 'Tranquilo' },
    ],
  },
  lua_game_24: {
    title: 'Completa a palabra: na casa',
    subtitle: 'Falta unha letra en cada unha',
    instructions: 'Di que letra falta para completar cada palabra.',
    items: [
      { pic: 'sol', label: 'Sol', template: '_ O L' },
      { pic: 'casa', label: 'Casa', template: 'C A _ A' },
      { pic: 'pelota', label: 'Pelota', template: 'P E L O _ A' },
      { pic: 'mesa', label: 'Mesa', template: 'M E _ A' },
    ],
  },
  lua_game_25: {
    title: 'Animais, froitas e roupa',
    subtitle: 'Tres grupos, nove debuxos',
    instructions: 'Coloca cada debuxo no seu grupo: animais, froitas ou roupa.',
    groups: ['Animais', 'Froitas', 'Roupa'],
    items: [
      { pic: 'perro', label: 'Can', group: 'Animais' },
      { pic: 'gato', label: 'Gato', group: 'Animais' },
      { pic: 'vaca', label: 'Vaca', group: 'Animais' },
      { pic: 'manzana', label: 'Mazá', group: 'Froitas' },
      { pic: 'uvas', label: 'Uvas', group: 'Froitas' },
      { pic: 'fresa', label: 'Amorodo', group: 'Froitas' },
      { pic: 'zapato', label: 'Zapato', group: 'Roupa' },
      { pic: 'gorra', label: 'Gorra', group: 'Roupa' },
      { pic: 'bufanda', label: 'Bufanda', group: 'Roupa' },
    ],
  },
};
