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
// Só texto: a franxa de idade, o tipo de acción e os debuxos veñen do catálogo
// base. Aquí non se duplica estrutura.
// ============================================================================
import type { LuaSong } from '../LuaSongsCatalog';

export type LuaSongOverride = Partial<Omit<LuaSong, 'interactiveTask'>> & {
  interactiveTask?: Partial<LuaSong['interactiveTask']>;
};

export const LUA_SONGS_GL: Record<string, LuaSongOverride> = {
  lua_song_01: {
    title: 'Bos días, sol',
    subtitle: 'Rutina da mañá e benvida ao día',
    consigna: 'Canta esta canción cada mañá. Cando digas «sol», sinala a fiestra.',
    lyrics: [
      'Bos días, sol bonito,',
      'bos días, meu amigo,',
      'abro xa os olliños,',
      'e véñote saudar.',
      'Érgome da cama,',
      'estírome con ganas,',
      'bos días á miña casa,',
      'comeza un día lindo!',
    ],
    interactiveTask: {
      title: 'Debuxa o sol sorrinte',
      description: 'Debuxa na pantalla o sol brillando e a túa cara sorrindo ao espertar.',
    },
  },
  lua_song_02: {
    title: 'Contando cunchas',
    subtitle: 'Canción rítmica para contar do 1 ao 10',
    consigna: 'Canta con Lúa. Cada vez que digas un número, toca a cuncha na pantalla.',
    lyrics: [
      'Unha, dúas, tres cunchas,',
      'catro, cinco, seis,',
      'as cunchas da praia',
      'cóntoas outra vez.',
      'Sete, oito, nove,',
      'dez e rematei,',
      'a xogar coa area,',
      'que ben o merecín!',
    ],
    interactiveTask: {
      title: 'Conta e toca 10 cunchas',
      description: 'Toca as 10 cunchas numeradas do 1 ao 10 en orde para encher o cesto.',
    },
  },
  lua_song_03: {
    title: 'As cores do arco da vella',
    subtitle: 'Discriminación cromática e rima',
    consigna: 'Canta e sinala cada franxa do arco da vella na pantalla mentres nomeas a súa cor.',
    lyrics: [
      'Vermello coma un amorodo,',
      'laranxa coma o sol,',
      'amarelo moi brillante,',
      'verde coma unha folla,',
      'azul coma o ceo,',
      'morado coma unha flor,',
      'todos xuntos alá arriba,',
      'fan o arco da vella de cor!',
    ],
    interactiveTask: {
      title: 'Toca as cores',
      description: 'Toca cada cor no arco da vella: vermello, laranxa, amarelo, verde, azul e morado.',
      elements: ['Vermello', 'Laranxa', 'Amarelo', 'Verde', 'Azul', 'Morado'],
    },
  },
  lua_song_04: {
    title: 'O baile das vogais',
    subtitle: 'Praxias articulatorias e motricidade corporal',
    consigna: 'Canta cada vogal con Lúa e fai o movemento que lle toca.',
    lyrics: [
      'Co A abro os brazos,',
      'co E estiro os pés,',
      'co I fágome pequeno,',
      'co O dou voltas tamén,',
      'co U agáchome un pouco,',
      'e bailamos outra vez!',
    ],
    interactiveTask: {
      title: 'Repite a vogal e fai o movemento',
      description: 'Toca cada vogal na pantalla para escoitar o seu son e ver bailar a Lúa.',
    },
  },
  lua_song_05: {
    title: 'Animais do curral',
    subtitle: 'Repertorio onomatopeico e discriminación',
    consigna: 'Canta e imita o son de cada animal cando apareza xunto a Lúa.',
    lyrics: [
      'No meu curral hai un canciño,',
      'que fai guau, guau, guau!,',
      'tamén vive unha galiña,',
      'que fai cacaracá!,',
      'e non falta a vaquiña,',
      'que fai muuu, muuu, muuu!,',
      'todos cantan no curral,',
      'e eu canto canda ti!',
    ],
    interactiveTask: {
      title: 'Toca o animal e fai o seu son',
      description: 'Toca o can, a galiña, a vaca e o gato para escoitar e repetir as súas onomatopeas.',
      elements: ['Can', 'Galiña', 'Vaca', 'Gato'],
    },
  },
  lua_song_06: {
    title: 'Lava as mansiñas',
    subtitle: 'Hábito de hixiene e secuencia en 4 pasos (20 segundos)',
    consigna: 'Canta esta canción mentres lavas as mans de verdade. Vinte segundos enteiros!',
    lyrics: [
      'Lava as túas mansiñas,',
      'con auga e con xabón,',
      'por diante, por detrás,',
      'quítalles o xerme e algo máis,',
      'un, dous, tres, catro,',
      'cinco, seis, xa está,',
      'mansiñas ben limpiñas,',
      'para poder xogar!',
    ],
    interactiveTask: {
      title: 'Numera os 4 pasos',
      description: 'Ordena do 1 ao 4: 1. Molla as mans, 2. Frota con xabón, 3. Aclara, 4. Sécaas.',
      elements: ['Molla as mans', 'Frota con xabón', 'Aclara', 'Sécaas'],
    },
  },
  lua_song_07: {
    title: 'O meu corpo móvese',
    subtitle: 'Esquema corporal e propiocepción',
    consigna: 'Canta e toca cada parte do teu corpo que Lúa vai nomeando.',
    lyrics: [
      'Toco a miña cabeza, toco os meus ombros,',
      'toco a miña barriga e toco os meus cóbados,',
      'movo as mansiñas, movo os peíños,',
      'así se move todo o meu corpiño.',
    ],
    interactiveTask: {
      title: 'Sinala as partes do corpo',
      description: 'Toca no avatar de Lúa: cabeza, ombros, barriga e cóbados.',
      elements: ['Cabeza', 'Ombros', 'Barriga', 'Cóbados'],
    },
  },
  lua_song_08: {
    title: 'A roda das froitas',
    subtitle: 'Vocabulario nutricional, rima e quendas',
    consigna: 'Canta en roda collidos da man e sinala a froita que se nomee.',
    lyrics: [
      'Imos á roda das froitas,',
      'mazá, pera e amorodo tamén,',
      'damos voltas e voltas,',
      'cantando a canción outra vez,',
      'uvas doces e maduras,',
      'todos as queremos comer,',
      'ai que rica a froita,',
      'comémola en familia tamén!',
    ],
    interactiveTask: {
      title: 'Escolle as froitas da roda',
      description: 'Toca a mazá, a pera, o amorodo e as uvas na froiteira.',
      elements: ['Mazá', 'Pera', 'Amorodo', 'Uvas'],
    },
  },
  lua_song_09: {
    title: 'Grazas e por favor',
    subtitle: 'Pragmática social e fórmulas de cortesía',
    consigna: 'Canta e practica dicir «grazas» e «por favor» con Lúa ou cun amigo.',
    lyrics: [
      'Se ti queres algo,',
      'di por favor,',
      'e cando cho dan,',
      'di grazas con amor,',
      'as palabras máxicas',
      'abren o corazón,',
      'por favor e grazas,',
      'así se di mellor!',
    ],
    interactiveTask: {
      title: 'Practica con Lúa',
      description: 'Pide algo dicindo «Por favor…» e responde cun alegre «Moitas grazas!».',
      elements: ['«Por favor…»', '«Moitas grazas!»'],
    },
  },
  lua_song_10: {
    title: 'A gardar os xoguetes',
    subtitle: 'Funcións executivas e transición ordenada de peche',
    consigna: 'Canta esta canción mentres axudas a ordenar os xoguetes ao rematar a sesión.',
    lyrics: [
      'A gardar, a gardar,',
      'cada cousa no seu sitio,',
      'os xoguetes á súa caixa,',
      'os libros ao seu andel,',
      'cando todo está ordenado,',
      'sentímonos importantes,',
      'a gardar, a gardar,',
      'e despois a descansar!',
    ],
    interactiveTask: {
      title: 'Cada cousa no seu sitio',
      description: 'Arrastra a pelota á caixa dos xoguetes e o conto ao andel dos libros.',
      elements: ['Pelota → Caixa dos xoguetes', 'Conto → Andel dos libros'],
    },
  },
};
