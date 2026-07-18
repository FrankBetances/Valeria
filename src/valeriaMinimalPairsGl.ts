// ============================================================================
// Valeria+ · Pares Mínimos en GALEGO (plan Proxecto Nós, GL-2.x)
//
// ESTADO: ✅ APROBADO PARA PRODUCCIÓN (validación logopédica y de gallego
// normativo cumplida). Cableado por variedad (pairsForLocale) y locutado con
// la voz neuronal Celtia. El banco castellano NO transfiere (p. ej. "perro" es
// "can": pierde el contraste r̄/l), así que cada par se diseñó ad hoc con el
// mismo principio clínico: el error de sustitución habitual produce
// exactamente la otra palabra del par.
//
// Pares candidatos (fonología del galego estándar, con /θ/):
//   rúa/lúa · rei/lei (rotacismo r̄→l) · casa/caza (sigmatismo s→θ) ·
//   cesta/testa (sigmatismo oclusivo s→t) · cubo/tubo · boca/bota
//   (frontalización velar k→t) · fonte/ponte (oclusivización f→p)
// ============================================================================
import { MinimalPair } from './valeriaMinimalPairs';

export const MINIMAL_PAIRS_GL: MinimalPair[] = [
  {
    id: 'gl-rua-lua', code: 'PM-GL-1', group: 'Rotacismo',
    target: 'rúa', targetEmoji: '🛣️', foil: 'lúa', foilEmoji: '🌙',
    phoneme: 'r̄ → l', errorLabel: 'Rotacismo inicial',
    prompt: 'Por onde pasan os coches? Di: rúa.',
    onTarget: {
      say: 'Rrrúa! A túa lingua vibrou coma unha moto!',
      mission: 'Carreira pola rúa: ide os dous ata a porta e volvede correndo a chocar os cinco.',
    },
    onFoil: {
      say: 'Escoitei lúa, a do ceo. Eu pedín rrrúa. Escoita…',
      cue: 'A lingua fai a moto detrás dos dentes: rrr.',
      mission: 'Man na gorxa de papá: papá sostén rrrr tres segundos e o neno sente a vibración. Despois, ao revés.',
    },
  },
  {
    id: 'gl-rei-lei', code: 'PM-GL-2', group: 'Rotacismo',
    target: 'rei', targetEmoji: '👑', foil: 'lei', foilEmoji: '📜',
    phoneme: 'r̄ → l', errorLabel: 'Rotacismo inicial (xeneralización)',
    prompt: 'Quen leva a coroa? Di: rei.',
    onTarget: {
      say: 'Rrrei! Que erre tan forte!',
      mission: 'Coroación: papá ponche unha coroa imaxinaria e ti fas unha reverencia moi seria.',
    },
    onFoil: {
      say: 'Escoitei lei, a dos xuíces. O rei quedou sen coroa. Veña: rrrei.',
      cue: 'Punta da lingua arriba, e que trema.',
      mission: 'Trono real: o neno séntase no sofá coma un rei mentres di un rrr longo; papá aplaude cada erre.',
    },
  },
  {
    id: 'gl-casa-caza', code: 'PM-GL-3', group: 'Sigmatismo',
    target: 'casa', targetEmoji: '🏠', foil: 'caza', foilEmoji: '🏹',
    phoneme: 's → θ', errorLabel: 'Sigmatismo interdental',
    prompt: 'Onde vive o osiño? Di: casa.',
    onTarget: {
      say: 'Casa! Que serpe tan fina detrás dos dentes!',
      mission: 'Facede o tellado xuntando os brazos en triángulo por riba da cabeza do neno.',
    },
    onFoil: {
      say: 'Escoitei caza, a da frecha. A túa serpe escapou entre os dentes. Péchaos: casa.',
      cue: 'Dentes xuntos, sorriso, e a serpe sopra por detrás: sss.',
      mission: 'Serpe viaxeira: mentres dura o sss, papá esvara un dedo do ombreiro á man do neno. Se o ese rompe, a serpe volve ao ombreiro.',
    },
  },
  {
    id: 'gl-cesta-testa', code: 'PM-GL-4', group: 'Sigmatismo',
    target: 'cesta', targetEmoji: '🧺', foil: 'testa', foilEmoji: '🙆',
    phoneme: 's → t', errorLabel: 'Sigmatismo oclusivo',
    prompt: 'Onde van as mazás? Di: cesta.',
    onTarget: {
      say: 'Cesta! Ese sopro colle todas as mazás!',
      mission: 'Enchede a cesta: o neno bota tres xoguetes nunha caixa dicindo sss en cada un.',
    },
    onFoil: {
      say: 'Escoitei testa, a da cabeza. O ese non explota: sopra longo. Cesta.',
      cue: 'O te dá un golpe; o ese é aire que non se acaba.',
      mission: 'O muíño: palma de papá diante da boca do neno. Con t-t-t sente golpes; con sss, un vento seguido que empuxa a man tres segundos.',
    },
  },
  {
    id: 'gl-cubo-tubo', code: 'PM-GL-5', group: 'Velares',
    target: 'cubo', targetEmoji: '🪣', foil: 'tubo', foilEmoji: '🧪',
    phoneme: 'k → t', errorLabel: 'Frontalización velar inicial',
    prompt: 'Con que facemos o castelo de area? Di: cubo.',
    onTarget: {
      say: 'Cubo! Ese ka saíu da cova da gorxa!',
      mission: 'Transporta o coxín-cubo pesadísimo ata os pés de papá, que o baleira levantándote no aire.',
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
    prompt: 'Con que damos bicos? Di: boca.',
    onTarget: {
      say: 'Boca! Que ben soa ese ka no medio!',
      mission: 'Conta-dentes: sorriso xigante de papá e o neno cóntalle cinco dentes co dedo. Despois, ao revés.',
    },
    onFoil: {
      say: 'Escoitei bota, a do pé. Boca soa atrás: boca.',
      cue: 'Boca moi aberta de león: a lingua vaise soa para atrás.',
      mission: 'Bocexo do león fronte a fronte: boca enorme e kaaa desde o fondo. Gaña o bocexo máis esaxerado.',
    },
  },
  {
    id: 'gl-fonte-ponte', code: 'PM-GL-7', group: 'Labiodental',
    target: 'fonte', targetEmoji: '⛲', foil: 'ponte', foilEmoji: '🌉',
    phoneme: 'f → p', errorLabel: 'Oclusivización de fricativa',
    prompt: 'De onde sae a auga? Di: fonte.',
    onTarget: {
      say: 'Fonte! Ese sopro de coello mólla todo!',
      mission: 'Fonte humana: agáchate e brota cara arriba salpicando a papá, que sacode o pelo empapado.',
    },
    onFoil: {
      say: 'Escoitei ponte, a de cruzar. O efe morde o labio e sopra: fonte.',
      cue: 'Dentes de coello sobre o labio de abaixo, e sopra.',
      mission: 'O papel voador: papeliño na palma de papá. Con fff inclínase e aguanta; con pe só dá un salto. Reto: tres segundos voando.',
    },
  },
];
