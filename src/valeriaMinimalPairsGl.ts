// ============================================================================
// Valeria+ · Pares Mínimos en GALEGO (plan Proxecto Nós, GL-2.x)
//
// ESTADO: ✅ APROBADO PARA PRODUCCIÓN, los TRECE pares. Los siete primeros por
// la revisora logopeda gallegohablante (jul 2026); los seis de contrastes
// propios (PM-GL-8…13) por ACOPROS, evaluación y validación comunicada por
// Frank el 6/9/2026. Cableado por variedad (pairsForLocale) y locutado con la
// voz neuronal Celtia. El banco castellano NO transfiere (p. ej. "perro" es
// "can": pierde el contraste r̄/l), así que cada par se diseñó ad hoc con el
// mismo principio clínico: el error de sustitución habitual produce
// exactamente la otra palabra del par.
//
// Pares candidatos (fonología del galego estándar, con /θ/):
//   rúa/lúa · rei/lei (rotacismo r̄→l) · casa/caza (sigmatismo s→θ, marcado
//   region:'distincion' porque o occidente sesea) · cesta/testa (sigmatismo
//   oclusivo s→t) · cubo/tubo · boca/bota (frontalización velar k→t) ·
//   fonte/ponte (oclusivización f→p) · e os contrastes propios do galego:
//   xeo/cheo e xoia/soia (/ʃ/) · óso/oso e bóla/bola (abertura /ɔ/–/o/) ·
//   palla/pala (/ʎ/) · mel/pel (nasal)
// ============================================================================
import { MinimalPair, PairGroup } from './valeriaMinimalPairs';

export const MINIMAL_PAIRS_GL: MinimalPair[] = [
  {
    id: 'gl-rua-lua', code: 'PM-GL-1', group: 'Rotacismo',
    target: 'rúa', targetEmoji: '🛣️', foil: 'lúa', foilEmoji: '🌙',
    phoneme: 'r̄ → l', errorLabel: 'Rotacismo inicial',
    prompt: 'Di: rúa.',
    onTarget: {
      say: 'Rúa! A túa lingua vibrou coma unha moto!',
      mission: 'Carreira pola rúa: ide os dous ata a porta e volvede correndo a chocar os cinco.',
    },
    onFoil: {
      say: 'Escoitei lúa, a do ceo. Eu pedín rúa. Escoita…',
      cue: 'A lingua fai a moto detrás dos dentes: rrr.',
      mission: 'Man na gorxa do adulto: o adulto sostén rrrr tres segundos e o neno sente a vibración. Despois, ao revés.',
    },
  },
  {
    id: 'gl-rei-lei', code: 'PM-GL-2', group: 'Rotacismo',
    target: 'rei', targetEmoji: '👑', foil: 'lei', foilEmoji: '📜',
    phoneme: 'r̄ → l', errorLabel: 'Rotacismo inicial (xeneralización)',
    prompt: 'Di: rei.',
    onTarget: {
      say: 'Rei! Que erre tan forte!',
      mission: 'Coroación: o adulto ponche unha coroa imaxinaria e ti fas unha reverencia moi seria.',
    },
    onFoil: {
      say: 'Escoitei lei, a dos xuíces. O rei quedou sen coroa. Veña: rei.',
      cue: 'Punta da lingua arriba, e que trema.',
      mission: 'Trono real: o neno séntase no sofá coma un rei mentres di un rrr longo; o adulto aplaude cada erre.',
    },
  },
  {
    id: 'gl-casa-caza', code: 'PM-GL-3', group: 'Sigmatismo',
    target: 'casa', targetEmoji: '🏠', foil: 'caza', foilEmoji: '🏹',
    phoneme: 's → θ', errorLabel: 'Sigmatismo interdental',
    prompt: 'Di: casa.',
    // El galego occidental SESEA: en A Coruña y Pontevedra costeras y en parte
    // de Ourense no existe el contraste /s/–/θ/, así que puntuar este par ahí
    // mide la variedad do neno, non a súa fonoloxía. Mismo criterio que PM-5 en
    // castellano y que el /b/–/v/ descartado en el banco catalán por betacismo.
    region: 'distincion',
    onTarget: {
      say: 'Casa! Que serpe tan fina detrás dos dentes!',
      mission: 'Facede o tellado xuntando os brazos en triángulo por riba da cabeza do neno.',
    },
    onFoil: {
      say: 'Escoitei caza, a da frecha. A túa serpe escapou entre os dentes. Péchaos: casa.',
      cue: 'Dentes xuntos, sorriso, e a serpe sopra por detrás: sss.',
      mission: 'Serpe viaxeira: mentres dura o sss, o adulto esvara un dedo do ombreiro á man do neno. Se o ese rompe, a serpe volve ao ombreiro.',
    },
  },
  {
    id: 'gl-cesta-testa', code: 'PM-GL-4', group: 'Sigmatismo',
    target: 'cesta', targetEmoji: '🧺', targetPictogram: 'cesta', foil: 'testa', foilEmoji: '🙆',
    phoneme: 's → t', errorLabel: 'Sigmatismo oclusivo',
    prompt: 'Di: cesta.',
    onTarget: {
      say: 'Cesta! Ese sopro colle todas as mazás!',
      mission: 'Enchede a cesta: o neno bota tres xoguetes nunha caixa dicindo sss en cada un.',
    },
    onFoil: {
      say: 'Escoitei testa, a da cabeza. O ese non explota: sopra longo. Cesta.',
      cue: 'O te dá un golpe; o ese é aire que non se acaba.',
      mission: 'O muíño: palma do adulto diante da boca do neno. Con t-t-t sente golpes; con sss, un vento seguido que empuxa a man tres segundos.',
    },
  },
  {
    id: 'gl-cubo-tubo', code: 'PM-GL-5', group: 'Velares',
    target: 'cubo', targetEmoji: '🪣', targetPictogram: 'cubo', foil: 'tubo', foilEmoji: '🧪', foilPictogram: 'tubo',
    phoneme: 'k → t', errorLabel: 'Frontalización velar inicial',
    prompt: 'Di: cubo.',
    onTarget: {
      say: 'Cubo! Ese ka saíu da cova da gorxa!',
      mission: 'Transporta o coxín-cubo pesadísimo ata os pés do adulto, que o baleira levantándote no aire.',
    },
    onFoil: {
      say: 'Escoitei tubo, o do laboratorio. O ka do cubo nace atrás, na cova: cubo.',
      cue: 'O te vive nos dentes; o ka vive no fondo da gorxa.',
      mission: 'Gargarexos do xigante: cabeza atrás e ka-ka-ka. Dedos baixo o queixo do outro para sentir onde se move o ka.',
    },
  },
  {
    id: 'gl-boca-bota', code: 'PM-GL-6', group: 'Velares',
    target: 'boca', targetEmoji: '👄', foil: 'bota', foilEmoji: '👢',
    phoneme: 'k → t', errorLabel: 'Frontalización velar media',
    prompt: 'Di: boca.',
    onTarget: {
      say: 'Boca! Que ben soa ese ka no medio!',
      mission: 'Conta-dentes: sorriso xigante do adulto e o neno cóntalle cinco dentes co dedo. Despois, ao revés.',
    },
    onFoil: {
      say: 'Escoitei bota, a do pé. Boca soa atrás: boca.',
      cue: 'Boca moi aberta de león: a lingua vaise soa para atrás.',
      mission: 'Bocexo do león fronte a fronte: boca enorme e kaaa desde o fondo. Gaña o bocexo máis esaxerado.',
    },
  },
  {
    id: 'gl-fonte-ponte', code: 'PM-GL-7', group: 'Labiodental',
    target: 'fonte', targetEmoji: '⛲', foil: 'ponte', foilEmoji: '🌉', foilPictogram: 'puente',
    phoneme: 'f → p', errorLabel: 'Oclusivización de fricativa',
    prompt: 'Di: fonte.',
    onTarget: {
      say: 'Fonte! Ese sopro de coello mólla todo!',
      mission: 'Fonte humana: agáchate e brota cara arriba salpicando o adulto, que sacode o pelo empapado.',
    },
    onFoil: {
      say: 'Escoitei ponte, a de cruzar. O efe morde o labio e sopra: fonte.',
      cue: 'Dentes de coello sobre o labio de abaixo, e sopra.',
      mission: 'O papel voador: papeliño na palma do adulto. Con fff inclínase e aguanta; con pe só dá un salto. Reto: tres segundos voando.',
    },
  },

  // --------------------------------------------------------------------------
  // Contrastes PROPIOS do galego (set/2026) — os que non existen en castelán
  // --------------------------------------------------------------------------
  // Ata aquí o banco galego percorría a lista castelá de grupos, e por iso non
  // podía aloxar os tres contrastes que separan de verdade a fonoloxía galega
  // da castelá. É o mesmo argumento co que se defende o banco catalán no README
  // —«catro dos seus oito grupos nomean contrastes inexistentes en castelán»—,
  // e o galego ten tres deses catro:
  //
  //   · /ʃ/ (⟨x⟩: xeo, xoia), que o castelán perdeu no século XVII;
  //   · a abertura vocálica /ɔ/–/o/, que fai que o galego teña SETE vogais e o
  //     castelán cinco. É fonémica: óso e oso son palabras distintas;
  //   · a lateral palatal /ʎ/ (palla, ollo), viva en galego fronte ao castelán
  //     peninsular yeísta.
  //
  // Complétase ademais o que si tiña equivalente castelán e faltaba: nasais e
  // laterais, os dous grupos de PAIR_GROUPS que o banco galego deixaba baleiros.
  //
  // ✅ ESTADO: APROBADOS PARA PRODUCIÓN. Avaliados e validados por ACOPROS
  // (comunicado por Frank o 6/9/2026), coa mesma dobre esixencia que o resto do
  // repositorio pide sempre por separado: galego normativo E criterio
  // logopédico. Os sete primeiros seguen aprobados desde o 27/7/2026.
  {
    id: 'gl-xeo-cheo', code: 'PM-GL-8', group: 'Postalveolar',
    target: 'xeo', targetEmoji: '🧊', foil: 'cheo', foilEmoji: '🥛',
    phoneme: 'ʃ → tʃ', errorLabel: 'Africación da fricativa postalveolar',
    prompt: 'Di: xeo.',
    onTarget: {
      say: 'Xeo! Ese aire saíu longo e fresquiño!',
      mission: 'Estatuas de xeo: quedade os dous conxelados ata que un pestanexe.',
    },
    onFoil: {
      say: 'Escoitei cheo, o do vaso ata arriba. O xeo non dá golpe: escorrega. Escoita…',
      cue: 'Non pegues a lingua para arrincar: deixa saír o aire seguido, xxx.',
      mission: 'Man diante da boca: co xeo o aire sae continuo; co cheo dá un golpiño. Probade os dous e notade a diferenza.',
    },
  },
  {
    id: 'gl-xoia-soia', code: 'PM-GL-9', group: 'Postalveolar',
    target: 'xoia', targetEmoji: '💎', foil: 'soia', foilEmoji: '🫘',
    phoneme: 'ʃ → s', errorLabel: 'Adiantamento da postalveolar',
    prompt: 'Di: xoia.',
    onTarget: {
      say: 'Xoia! Que ben, a lingua foi para atrás!',
      mission: 'Tesouro: agochade un obxecto brillante e atopádeo entre os dous.',
    },
    onFoil: {
      say: 'Escoitei soia, a do prato. A xoia faise coa lingua máis atrás e os beizos adiantados. Veña: xoia.',
      cue: 'Bico de peixe cos beizos e a lingua recuada: xxx, non sss.',
      mission: 'Bico de peixe: poñede os dous morriños e soltade xxx tres segundos sen mover a lingua.',
    },
  },
  {
    id: 'gl-oso-aberto', code: 'PM-GL-10', group: 'Abertura vocálica',
    target: 'óso', targetEmoji: '🦴', foil: 'oso', foilEmoji: '🐻',
    phoneme: 'ɔ → o', errorLabel: 'Pechamento da vogal aberta',
    prompt: 'Di: óso, o do esqueleto.',
    onTarget: {
      say: 'Óso! Abriches moi ben a boca!',
      mission: 'Tocade xuntos o óso do brazo, o do xeonllo e o da cabeza.',
    },
    onFoil: {
      say: 'Escoitei oso, o animal do mel. O óso do esqueleto abre máis a boca. Escoita…',
      cue: 'Para óso a boca ábrese coma no médico; para oso péchase coma para dar un bico.',
      mission: 'Espello de bocas: o adulto di óso e oso diante do espello e o neno sinala cal abre máis.',
    },
  },
  {
    id: 'gl-bola-aberta', code: 'PM-GL-11', group: 'Abertura vocálica',
    target: 'bóla', targetEmoji: '⚽', foil: 'bola', foilEmoji: '🍞',
    phoneme: 'ɔ → o', errorLabel: 'Pechamento da vogal aberta (xeneralización)',
    prompt: 'Di: bóla, a de xogar.',
    onTarget: {
      say: 'Bóla! Esa o saíu ben aberta!',
      mission: 'Pase de bóla imaxinaria: tres pases sen que caia ao chan.',
    },
    onFoil: {
      say: 'Escoitei bola, a do pan. A bóla de xogar abre máis a boca. Veña: bóla.',
      cue: 'Boca máis aberta e queixo máis baixo: bóóóla.',
      mission: 'Man no queixo: baixa o queixo do adulto ao dicir bóla e nota que con bola case non baixa.',
    },
  },
  {
    id: 'gl-palla-pala', code: 'PM-GL-12', group: 'Laterais',
    target: 'palla', targetEmoji: '🌾', foil: 'pala', foilEmoji: '🥄',
    phoneme: 'ʎ → l', errorLabel: 'Despalatalización da lateral (ieísmo)',
    prompt: 'Di: palla.',
    onTarget: {
      say: 'Palla! A lingua tocou ben arriba!',
      mission: 'Palleiro: amoreade coxíns e tirádevos enriba os dous.',
    },
    onFoil: {
      say: 'Escoitei pala, a da area. A palla leva a lingua pegada ao teito da boca. Veña: palla.',
      cue: 'Pega toda a lingua ao paladar e deixa saír o aire polos lados: lla.',
      mission: 'Lingua ao teito: o neno pega a lingua ao paladar tres segundos e despois di lla, lla, lla.',
    },
  },
  {
    id: 'gl-mel-pel', code: 'PM-GL-13', group: 'Nasais',
    target: 'mel', targetEmoji: '🍯', foil: 'pel', foilEmoji: '🤚',
    phoneme: 'm → p', errorLabel: 'Desnasalización de bilabial',
    prompt: 'Di: mel.',
    onTarget: {
      say: 'Mel! Esa eme saíu zumbando polo nariz!',
      mission: 'Osos lambóns: metede a man no pote imaxinario e lambede cun mmm ben longo.',
    },
    onFoil: {
      say: 'Escoitei pel, a da man. O mel zumba polo nariz coma unha abella: mmmel.',
      cue: 'Beizos xuntos e motor de abella polo nariz: mmm.',
      mission: 'Dedo no nariz do outro: sostede mmmm tres segundos e notade a vibración. Co pe non treme nada.',
    },
  },
];

// Grupos do listado de pares en GALEGO. Ata agora o galego percorría
// PAIR_GROUPS (a lista castelá) e funcionaba porque compartía os catro primeiros
// nomes; cos contrastes propios xa non: 'Postalveolar', 'Abertura vocálica',
// 'Laterais' e 'Nasais' non existen nesa lista, e sen esta os seis pares novos
// non caerían en NINGUNHA sección — nin erro, nin log, nin pares —, que é
// exactamente o que lle pasou ao inglés antes de PAIR_GROUPS_EN.
export const PAIR_GROUPS_GL: PairGroup[] = [
  'Rotacismo', 'Sigmatismo', 'Postalveolar', 'Abertura vocálica',
  'Velares', 'Labiodental', 'Laterais', 'Nasais',
];
