// ============================================================================
// Aventuras con Lúa · Cancións en GALEGO
//
// NON son traducións. Cada peza REAUTORÍZASE: a rima ten que funcionar en
// galego e o obxectivo clínico ten que sobrevivir intacto —contar do 1 ao 10,
// as cinco vogais con praxia, a secuencia de catro pasos do lavado de mans—.
// Traducir verso a verso rompe as dúas cousas á vez.
//
// E cambia o referente cando o castelán trae o dominicano das 50 follas: os
// cocos da palma pasan a ser cunchas da praia, e mango/lechosa/chinola/guineo
// a mazá/pera/amorodo/uvas. Un neno de Lugo non conta cocos, e o vocabulario
// nutricional só ensina se é o da súa mesa. O ARCO DA VELLA, ademais, non ten
// substituto: é o nome galego e non se di doutro xeito.
//
// ✅ Avaliado e validado por ACOPROS (comunicado por Frank o 6/9/2026).
//
// 11/2026 · ACOPROS pediu cancións XA COÑECIDAS que canta o adulto. Son as
// tradicionais do catálogo base e cántanse coa súa letra de sempre (en castelán):
// aquí vai en galego todo o que rodea a canción. Se ACOPROS indica cancións
// tradicionais galegas, a letra cámbiase nesta táboa.
//
// Só texto: a franxa de idade, o tipo de acción e os debuxos veñen do catálogo
// base. Aquí non se duplica estrutura.
// ============================================================================
import type { LuaSong } from '../LuaSongsCatalog';

export type LuaSongOverride = Partial<Omit<LuaSong, 'interactiveTask'>> & {
  interactiveTask?: Partial<LuaSong['interactiveTask']>;
};

export const LUA_SONGS_GL: Record<string, LuaSongOverride> = {
  lua_song_01: {
    title: 'Sol, solecito',
    subtitle: 'Canción tradicional · rutina da mañá',
    consigna: 'Cántaa ti ao comezar o día, amodo. Ao dicir «sol», sinalade xuntos a fiestra.',
    lyrics: [
      'Sol, solecito,',
      'caliéntame un poquito,',
      'por hoy, por mañana,',
      'por toda la semana.',
    ],
    interactiveTask: {
      title: 'Debuxa o sol sorrinte',
      description: 'Debuxa na pantalla o sol brillando e a túa cara sorrindo ao espertar.',
    },
  },
  lua_song_02: {
    title: 'Un elefante se balanceaba',
    subtitle: 'Canción tradicional · contar do 1 ao 10',
    consigna: 'Cántaa ti e sumade un elefante en cada volta, ata dez. Toca o número cada vez que chega outro.',
    lyrics: [
      'Un elefante se balanceaba',
      'sobre la tela de una araña.',
      'Como veía que resistía,',
      'fue a llamar a otro elefante.',
      'Dos elefantes se balanceaban',
      'sobre la tela de una araña.',
      'Como veían que resistía,',
      'fueron a llamar a otro elefante.',
    ],
    interactiveTask: {
      title: 'Conta os elefantes',
      description: 'Toca un número cada vez que chega outro elefante, do 1 ao 10.',
    },
  },
  lua_song_03: {
    title: 'De colores',
    subtitle: 'Canción tradicional · as cores',
    consigna: 'Cántaa ti e sinalade cada cor na pantalla e no que teñades arredor.',
    lyrics: [
      'De colores,',
      'de colores se visten los campos en la primavera.',
      'De colores,',
      'de colores son los pajaritos que vienen de fuera.',
      'De colores,',
      'de colores es el arco iris que vemos lucir.',
      'Y por eso los grandes amores',
      'de muchos colores me gustan a mí.',
    ],
    interactiveTask: {
      title: 'Toca as cores',
      description: 'Toca cada cor: vermello, laranxa, amarelo, verde, azul e morado.',
      elements: ['Vermello', 'Laranxa', 'Amarelo', 'Verde', 'Azul', 'Morado'],
    },
  },
  lua_song_04: {
    title: 'La mar estaba serena',
    subtitle: 'Canción tradicional · xogo de vogais',
    consigna: 'Cántaa ti primeiro normal. Despois escollede unha vogal e cantádea cambiando todas as vogais por esa.',
    lyrics: [
      'La mar estaba serena,',
      'serena estaba la mar.',
      'Con la a:',
      'La mar astaba sarana,',
      'sarana astaba la mar.',
      'Con la i:',
      'Li mir istibi sirini,',
      'sirini istibi li mir.',
    ],
    interactiveTask: {
      title: 'Escolle a vogal',
      description: 'Toca unha vogal e cantade a canción enteira só con ela.',
    },
  },
  lua_song_05: {
    title: 'Los pollitos dicen',
    subtitle: 'Canción tradicional · sons de animais',
    consigna: 'Cántaa ti e facede xuntos o «pío, pío, pío» e o xesto de acubillarse.',
    lyrics: [
      'Los pollitos dicen',
      'pío, pío, pío,',
      'cuando tienen hambre,',
      'cuando tienen frío.',
      'La gallina busca',
      'el maíz y el trigo,',
      'les da la comida',
      'y les presta abrigo.',
      'Bajo sus dos alas,',
      'acurrucaditos,',
      'hasta el otro día',
      'duermen los pollitos.',
    ],
    interactiveTask: {
      title: 'Toca o animal e fai o seu son',
      description: 'Toca o pitiño e a galiña e imitade como fai cada un.',
      elements: ['Pitiño', 'Galiña'],
    },
  },
  lua_song_06: {
    title: 'Pimpón',
    subtitle: 'Canción tradicional · lavarse',
    consigna: 'Cántaa ti mentres facedes coma Pimpón: lavar a cara e as mans con auga e xabón.',
    lyrics: [
      'Pimpón es un muñeco',
      'muy guapo y de cartón,',
      'se lava la carita',
      'con agua y con jabón.',
      'Pimpón, dame la mano',
      'con un fuerte apretón,',
      'que quiero ser tu amigo,',
      'Pimpón, Pimpón, Pimpón.',
    ],
    interactiveTask: {
      title: 'Numera os 4 pasos',
      description: 'Ordena do 1 ao 4: 1. Molla as mans, 2. Frota con xabón, 3. Aclara, 4. Sécaas.',
      elements: ['Molla as mans', 'Frota con xabón', 'Aclara', 'Sécaas'],
    },
  },
  lua_song_07: {
    title: 'Cabeza, ombros, xeonllos e pés',
    subtitle: 'Canción tradicional · as partes do corpo',
    consigna: 'Cántaa ti e tocade cada parte do corpo ao nomeala. Cada volta, un pouco máis rápido.',
    lyrics: [
      'Cabeza, hombros, rodillas, pies,',
      'rodillas, pies.',
      'Cabeza, hombros, rodillas, pies,',
      'rodillas, pies.',
      'Ojos, orejas, boca y nariz.',
      'Cabeza, hombros, rodillas, pies,',
      'rodillas, pies.',
    ],
    interactiveTask: {
      title: 'Sinala as partes do corpo',
      description: 'Toca cabeza, ombros, xeonllos e pés.',
      elements: ['Cabeza', 'Ombros', 'Xeonllos', 'Pés'],
    },
  },
  lua_song_08: {
    title: 'Naranja dulce',
    subtitle: 'Canción tradicional · froitas e quendas',
    consigna: 'Cántaa ti en roda, da man. Ao rematar, unha aperta.',
    lyrics: [
      'Naranja dulce,',
      'limón partido,',
      'dame un abrazo',
      'que yo te pido.',
    ],
    interactiveTask: {
      title: 'As froitas da canción',
      description: 'Toca a laranxa e o limón.',
      elements: ['Laranxa', 'Limón'],
    },
  },
  lua_song_09: {
    title: 'Al corro de la patata',
    subtitle: 'Canción tradicional · xogar xuntos',
    consigna: 'Cantádea en roda, da man. Pídese xogar cun «por favor» e ao rematar danse as grazas.',
    lyrics: [
      'Al corro de la patata,',
      'comeremos ensalada,',
      'lo que comen los señores,',
      'naranjitas y limones.',
      '¡Achupé, achupé,',
      'sentadita me quedé!',
    ],
    interactiveTask: {
      title: 'Practica con Lúa',
      description: 'Pide xogar cun «Por favor…» e responde cun alegre «Moitas grazas!».',
      elements: ['«Por favor…»', '«Moitas grazas!»'],
    },
  },
  lua_song_10: {
    title: 'Estrellita, ¿dónde estás?',
    subtitle: 'Canción tradicional · calma e peche',
    consigna: 'Cántaa ti baixiño para pechar a sesión, mentres recolledes os xoguetes.',
    lyrics: [
      'Estrellita, ¿dónde estás?',
      'Me pregunto qué serás.',
      'En el cielo o en el mar,',
      'un diamante de verdad.',
      'Estrellita, ¿dónde estás?',
      'Me pregunto qué serás.',
    ],
    interactiveTask: {
      title: 'Cada cousa no seu sitio',
      description: 'Arrastra a pelota á caixa dos xoguetes e o conto ao andel dos libros.',
      elements: ['Pelota → Caixa dos xoguetes', 'Conto → Andel dos libros'],
    },
  },
};
