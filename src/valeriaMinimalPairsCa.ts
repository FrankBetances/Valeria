// ============================================================================
// Valeria+ · Parells Mínims en CATALÀ (pla ca-ES, CA-2.x)
//
// El banc castellà NO transfereix, i no per matisos: «perro» és «gos» i el
// contrast r̄/l desapareix. Però el motiu de fons és més gros — el català té
// contrastos fonològics que el castellà peninsular NO TÉ, i són justament els
// que fallen als infants catalanoparlants:
//
//   · Sonoritat sibilant /s/–/z/ ......... caça / casa, rossa / rosa
//     No existeix en castellà. L'error és l'ensordiment: /z/ → [s].
//   · Postalveolars /ʃ/ i /ʒ/ ............ peix / pes, joc / xoc
//     Tampoc existeixen en castellà. L'error és desafricar o avançar-les.
//   · Obertura vocàlica /ɔ/–/o/ ......... os / ós
//     El castellà té una sola /o/. El parell mínim de manual del català.
//   · Lateral palatal /ʎ/–/l/ ........... palla / pala, fill / fil
//     El ieisme històric del castellà l'ha neutralitzada; en català és viva.
//
// A això s'hi sumen els processos evolutius universals (rotacisme, frontalitza-
// ció velar, oclusivització) amb parells catalans propis. Principi clínic
// idèntic al de la resta de bancs: la substitució habitual ha de produir
// EXACTAMENT l'altra paraula del parell, i totes dues han de ser paraules
// reals, freqüents i il·lustrables per a un infant de 3 a 6 anys.
//
// ---------------------------------------------------------------------------
// Contrast DESCARTAT a propòsit: /b/–/v/ (labiodental)
// ---------------------------------------------------------------------------
// El banc castellà i el gallec tenen grup «Labiodental». Aquí no n'hi ha, i
// l'absència és una decisió clínica, no un oblit. El català CENTRAL és
// betacista: «vaca» i «baca» sonen igual per a la immensa majoria de parlants
// de Barcelona i comarques. Puntuar-ho com a error mesuraria distància
// respecte del valencià i del balear —que sí distingeixen—, no llenguatge.
// És el mateix criteri que la guia dialectal de l'en-US aplica al TH-fronting.
// Si algun dia hi ha una variant `ca-valencia`, el parell entra ALLÀ.//
// ESTAT: ✅ CATALÀ VALIDAT (29/8/2026) per Maria, parlant nativa de Barcelona:
// lèxic, registre i normativa del CENTRAL. La validació confirma també la
// decisió que més es podia discutir del banc —deixar /b/–/v/ fora, perquè el
// central és betacista— i que els parells triats són paraules que una criatura
// de Barcelona de 3 a 6 anys reconeix. El que això NO cobreix, i convé no
// confondre: el criteri LOGOPÈDIC (el que el gallec va tenir de la mà d'ACOPROS
// i l'anglès amb la firma d'una logopeda titulada) segueix pendent.
// ============================================================================
import { MinimalPair, PairGroup } from './valeriaMinimalPairs';

export const MINIMAL_PAIRS_CA: MinimalPair[] = [
  // ------------------------------------------------------------- Rotacisme
  {
    id: 'ca-rosa-llosa', code: 'PM-CA-1', group: 'Rotacisme',
    target: 'rosa', targetEmoji: '🌹', foil: 'llosa', foilEmoji: '🪨',
    phoneme: 'r̄ → ʎ', errorLabel: 'Rotacisme inicial',
    prompt: 'Digues: rosa.',
    onTarget: {
      say: 'Rosa! La teva llengua ha vibrat com una moto!',
      mission: 'Olorada de roses: oloreu tots dos una rosa imaginària i digueu «mmm» ben llarg.',
    },
    onFoil: {
      say: 'He sentit llosa, la pedra plana. Jo demanava rosa. Escolta…',
      cue: 'La llengua fa la moto darrere les dents: rrr.',
      mission: 'Mà al coll de l\'adult: l\'adult aguanta rrrr tres segons i l\'infant nota la vibració. Després, al revés.',
    },
  },
  {
    id: 'ca-serra-sella', code: 'PM-CA-2', group: 'Rotacisme',
    target: 'serra', targetEmoji: '🪚', foil: 'sella', foilEmoji: '🐎',
    phoneme: 'r̄ → ʎ', errorLabel: 'Rotacisme intervocàlic',
    prompt: 'Digues: serra.',
    onTarget: {
      say: 'Serra! Quina erra més forta!',
      mission: 'Serreu junts un tronc imaginari, endavant i enrere, dient rrr a cada passada.',
    },
    onFoil: {
      say: 'He sentit sella, la del cavall. La serra s\'ha quedat sense dents. Va: serra.',
      cue: 'L\'erra és una moto llarga al mig de la paraula.',
      mission: 'Cursa de motos: manillar imaginari cara a cara i accelereu amb rrr alhora.',
    },
  },

  // ------------------------------------------------- Sonoritat sibilant s/z
  {
    id: 'ca-casa-caza', code: 'PM-CA-3', group: 'Sonoritat sibilant',
    target: 'casa', targetEmoji: '🏠', foil: 'caça', foilEmoji: '🏹',
    phoneme: 'z → s', errorLabel: 'Ensordiment de la essa sonora',
    prompt: 'Digues: casa.',
    onTarget: {
      say: 'Casa! Aquesta essa brunzia com una abella!',
      mission: 'Feu la teulada ajuntant els braços en triangle damunt del cap de l\'infant.',
    },
    onFoil: {
      say: 'He sentit caça, la de la fletxa. A casa l\'essa brunz, no xiula. Escolta…',
      cue: 'Posa\'t la mà al coll: a casa la gola tremola, a caça no.',
      mission: 'Abella i serp: l\'adult diu zzzz amb la mà de l\'infant al coll, després sssss. L\'infant endevina quina tremola.',
    },
  },
  {
    id: 'ca-rosa-rossa', code: 'PM-CA-4', group: 'Sonoritat sibilant',
    target: 'rosa', targetEmoji: '🌷', foil: 'rossa', foilEmoji: '👱',
    phoneme: 'z → s', errorLabel: 'Ensordiment intervocàlic',
    prompt: 'Digues: rosa, la flor.',
    onTarget: {
      say: 'Rosa! L\'abella del mig ha brunzit ben fort!',
      mission: 'Regueu junts una rosa imaginària i compteu fins a tres mentre creix.',
    },
    onFoil: {
      say: 'He sentit rossa, la del cabell clar. La flor porta abella al mig: rosa.',
      cue: 'Allarga el so del mig i nota com et pica el coll: rooozzza.',
      mission: 'Mà al coll de tots dos alhora: dieu rosa i rossa seguides i busqueu quina fa pessigolles.',
    },
  },

  // ------------------------------------------------------ Xeix i ge (ʃ / ʒ)
  {
    id: 'ca-peix-pes', code: 'PM-CA-5', group: 'Xeix i ge',
    target: 'peix', targetEmoji: '🐟', foil: 'pes', foilEmoji: '⚖️',
    phoneme: 'ʃ → s', errorLabel: 'Avançament de la xeix',
    prompt: 'Digues: peix.',
    onTarget: {
      say: 'Peix! Quina xeix més ben feta!',
      mission: 'Nedeu tots dos per l\'habitació movent les mans com aletes fins a tocar la paret.',
    },
    onFoil: {
      say: 'He sentit pes, el de la balança. El peix acaba amb el so de callar: xxx. Escolta…',
      cue: 'Fes els llavis rodons, com per fer un petó, i bufa: xxx.',
      mission: 'Silenci de biblioteca: us mireu i feu xxxxx llarg amb el dit als llavis. Qui aguanti més, guanya.',
    },
  },
  {
    id: 'ca-joc-xoc', code: 'PM-CA-6', group: 'Xeix i ge',
    target: 'joc', targetEmoji: '🎲', foil: 'xoc', foilEmoji: '💥',
    phoneme: 'ʒ → ʃ', errorLabel: 'Ensordiment de la ge',
    prompt: 'Digues: joc.',
    onTarget: {
      say: 'Joc! La ge t\'ha sortit ben sonora!',
      mission: 'Tireu un dau imaginari i celebreu el número que surti amb un salt.',
    },
    onFoil: {
      say: 'He sentit xoc, el del cop. El joc comença amb el motor engegat: jjj. Va: joc.',
      cue: 'És la mateixa boca que xxx, però amb el motor del coll engegat: jjj.',
      mission: 'Motor engegat i apagat: mà al coll, dieu jjj (tremola) i xxx (no tremola), tres vegades cadascú.',
    },
  },

  // ------------------------------------------------------- Obertura vocàlica
  {
    id: 'ca-os-obert', code: 'PM-CA-7', group: 'Obertura vocàlica',
    target: 'os', targetEmoji: '🦴', foil: 'ós', foilEmoji: '🐻',
    phoneme: 'ɔ → o', errorLabel: 'Tancament de la o oberta',
    prompt: 'Digues: os, el de l\'esquelet.',
    onTarget: {
      say: 'Os! Que bé, has obert ben oberta la boca!',
      mission: 'Toqueu-vos junts l\'os del braç, el del genoll i el del cap.',
    },
    onFoil: {
      say: 'He sentit ós, l\'animal de la mel. L\'os de l\'esquelet obre més la boca. Escolta…',
      cue: 'Per a os la boca s\'obre com per al metge; per a ós es tanca com per fer un petó.',
      mission: 'Mirall de boques: l\'adult diu os i ós davant del mirall i l\'infant assenyala quina boca s\'obre més.',
    },
  },

  // -------------------------------------------------------------- Laterals
  {
    id: 'ca-palla-pala', code: 'PM-CA-8', group: 'Laterals',
    target: 'palla', targetEmoji: '🌾', foil: 'pala', foilEmoji: '🥄',
    phoneme: 'ʎ → l', errorLabel: 'Ieisme (pèrdua de l\'ela palatal)',
    prompt: 'Digues: palla.',
    onTarget: {
      say: 'Palla! La llengua ha tocat ben amunt!',
      mission: 'Feu un paller: apileu coixins i tireu-vos-hi al damunt tots dos.',
    },
    onFoil: {
      say: 'He sentit pala, la de la sorra. La palla té la llengua enganxada al sostre de la boca. Va: palla.',
      cue: 'Enganxa tota la llengua al paladar i deixa sortir l\'aire pels costats: lla.',
      mission: 'Llengua al sostre: l\'infant enganxa la llengua al paladar tres segons i després diu lla, lla, lla.',
    },
  },
  {
    id: 'ca-fill-fil', code: 'PM-CA-9', group: 'Laterals',
    target: 'fill', targetEmoji: '👦', foil: 'fil', foilEmoji: '🧵',
    phoneme: 'ʎ → l', errorLabel: 'Ieisme en posició final',
    prompt: 'Digues: fill.',
    onTarget: {
      say: 'Fill! Quina ela palatal més bonica!',
      mission: 'Abraçada de família: l\'adult diu «aquest és el meu fill» i us feu una abraçada.',
    },
    onFoil: {
      say: 'He sentit fil, el de cosir. El fill acaba amb la llengua ben amunt. Escolta…',
      cue: 'Al final de fill la llengua es queda enganxada dalt, no baixa.',
      mission: 'Cosir i abraçar: l\'adult fa veure que cus dient fil i després abraça dient fill. L\'infant repeteix el gest correcte.',
    },
  },

  // ---------------------------------------------------------------- Velars
  {
    id: 'ca-coll-toll', code: 'PM-CA-10', group: 'Velars',
    target: 'coll', targetEmoji: '🧣', foil: 'toll', foilEmoji: '💧',
    phoneme: 'k → t', errorLabel: 'Frontalització velar',
    prompt: 'Digues: coll.',
    onTarget: {
      say: 'Coll! Aquesta ca t\'ha sortit ben del fons!',
      mission: 'Bufanda imaginària: enrotlleu-vos-la al coll l\'un a l\'altre i feu «brrr» de fred.',
    },
    onFoil: {
      say: 'He sentit toll, el bassal de l\'aigua. La ca de coll surt del fons de la gola. Va: coll.',
      cue: 'Enrere, ben enrere: la llengua toca el sostre del fons, no les dents.',
      mission: 'Cap enrere: mireu tots dos al sostre estirats i digueu ca, ca, ca. Així la llengua cau sola cap enrere.',
    },
  },

  // -------------------------------------------------------- Oclusivització
  {
    id: 'ca-font-pont', code: 'PM-CA-11', group: 'Oclusivització',
    target: 'font', targetEmoji: '⛲', foil: 'pont', foilEmoji: '🌉',
    phoneme: 'f → p', errorLabel: 'Oclusivització de la efa',
    prompt: 'Digues: font.',
    onTarget: {
      say: 'Font! Quin bufec més llarg!',
      mission: 'Beveu junts d\'una font imaginària fent el soroll de l\'aigua.',
    },
    onFoil: {
      say: 'He sentit pont, el de passar el riu. La font bufa llarg, no fa explosió. Escolta…',
      cue: 'Les dents de dalt toquen el llavi de baix i l\'aire surt llarg: fff.',
      mission: 'Apagueu espelmes: deu espelmes imaginàries, una fff llarga per a cadascuna. Si sona pp, l\'espelma no s\'apaga.',
    },
  },

  // --------------------------------------------------------------- Nasals
  {
    id: 'ca-llum-lluny', code: 'PM-CA-12', group: 'Nasals',
    target: 'llum', targetEmoji: '💡', foil: 'lluny', foilEmoji: '🔭',
    phoneme: 'm → ɲ', errorLabel: 'Posteriorització nasal final',
    prompt: 'Digues: llum.',
    onTarget: {
      say: 'Llum! Has tancat els llavis just a temps!',
      mission: 'Enceneu i apagueu el llum de l\'habitació per torns, dient llum cada vegada.',
    },
    onFoil: {
      say: 'He sentit lluny, el de molt lluny. El llum tanca els llavis al final. Va: llum.',
      cue: 'Acaba amb els llavis ben tancats, com per fer un petó: mmm.',
      mission: 'Petó final: cada vegada que digueu llum, acabeu fent un petó a l\'aire. Si no hi ha petó, no hi ha llum.',
    },
  },
];

// Seccions del llistat en català. Els grups castellans no serveixen: aquest
// banc treballa contrastos que el castellà no té, i si la pantalla recorregués
// PAIR_GROUPS els parells catalans no caurien en CAP secció i la llista
// sortiria buida —sense error, sense log i sense parells—, que és exactament
// el que va passar amb l'anglès abans de PAIR_GROUPS_EN.
export const PAIR_GROUPS_CA: PairGroup[] = [
  'Rotacisme', 'Sonoritat sibilant', 'Xeix i ge', 'Obertura vocàlica',
  'Laterals', 'Velars', 'Oclusivització', 'Nasals',
];
