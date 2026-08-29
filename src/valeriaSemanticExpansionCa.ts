// ============================================================================
// Valeria+ · Expansió Semàntica en CATALÀ — pla ca-ES (CA-2.x)
// Versió catalana dels quatre blocs d'expansió lèxica (escenaris de vida
// diària, categories lèxiques, progressions de camp semàntic i càpsules de
// contrast). Mateixes interfícies que el banc base (valeriaSemanticExpansion);
// el contingut NO es tradueix paraula per paraula: es reescriu amb el lèxic
// català i amb les aproximacions fonètiques pròpies del català infantil
// (`stt_expected_array`).
//
// Les aproximacions no són les castellanes amb accent. Un infant català de
// tres anys redueix la vocal àtona a neutra abans que res —«cullera» surt
// «cuera», «tovallola» surt «bayola»—, simplifica els grups amb ela palatal
// («llet» → «iet») i cau la essa final («peus» → «peu»). Aquestes són les
// formes que hi ha a `stt_expected_array`: si hi haguéssim posat les
// castellanes, el jutge marcaria error en el desenvolupament normal.
//
// PER QUÈ EXISTEIX: sense aquest banc, una sessió en català arribava a
// Expansió Semàntica i queia al banc castellà, o sigui que l'infant sentia
// castellà amb la veu catalana. És el mateix forat que va tenir el gallec
// abans de GL-2.x i l'anglès abans d'EN-3.x.
//
// Mòdul PUR (enumerable en build-time): només importa tipus del banc base.//
// ESTAT: ✅ CATALÀ VALIDAT (29/8/2026) per Maria, parlant nativa de Barcelona:
// lèxic, registre i normativa del CENTRAL. La validació confirma també la
// decisió que més es podia discutir del banc —deixar /b/–/v/ fora, perquè el
// central és betacista— i que els parells triats són paraules que una criatura
// de Barcelona de 3 a 6 anys reconeix. El que això NO cobreix, i convé no
// confondre: el criteri LOGOPÈDIC (el que el gallec va tenir de la mà d'ACOPROS
// i l'anglès amb la firma d'una logopeda titulada) segueix pendent.
// ============================================================================
import {
  DailyScenario, LexicalCategory, ProgressionSequence, ContrastCapsule,
} from './valeriaSemanticExpansion';

// ---------------------------------------------------------------------------
// 1. Escenaris de la vida diària (2 substantius, 2 verbs, 1 adjectiu, 1 onom.)
// ---------------------------------------------------------------------------
export const DAILY_SCENARIOS_CA: DailyScenario[] = [
  {
    id: 'mati', title: 'Rutina del matí', icon: '☀️', subtitle: 'Despertar-se, rentar-se i vestir-se',
    items: [
      {
        id: 'mati-llit', type: 'sustantivo', label: 'llit', emoji: '🛏️',
        visual_prompt: 'Llit infantil vist de front, llençols llisos, sense fons (transparent), contorn gruixut, colors plans d\'alt contrast, sense ombres ni textures.',
        tts_string: 'Això és el llit. Digues: llit.',
        stt_expected_array: ['llit', 'it', 'lit', 'iit', 'llí'],
        parent_tpr_action: 'Pica suaument el llit amb la mà i seu-hi amb l\'infant abans d\'aixecar-vos junts.',
      },
      {
        id: 'mati-raspall', type: 'sustantivo', label: 'raspall', emoji: '🪥', pictogram: 'cepillo',
        visual_prompt: 'Raspall de dents infantil de perfil, mànec de color viu, sense fons, contorn gruixut, colors plans d\'alt contrast.',
        tts_string: 'Això és el raspall. Digues: raspall.',
        stt_expected_array: ['raspall', 'aspall', 'apall', 'laspall', 'raspai'],
        parent_tpr_action: 'Posa el raspall a la mà de l\'infant i feu junts el gest de rentar-vos les dents tres vegades.',
      },
      {
        id: 'mati-rentar', type: 'verbo', label: 'rentar', emoji: '🧼', pictogram: 'jabon',
        visual_prompt: 'Dues mans amb escuma de sabó, sense fons, contorn gruixut, colors plans d\'alt contrast.',
        tts_string: 'Al matí ens rentem la cara. Digues: rentar.',
        stt_expected_array: ['rentar', 'renta', 'entar', 'lentar', 'rentá'],
        parent_tpr_action: 'Fregueu-vos les mans l\'un a l\'altre com si tinguéssiu sabó, mentre dieu la paraula.',
      },
      {
        id: 'mati-vestir', type: 'verbo', label: 'vestir', emoji: '👕', pictogram: 'vestir',
        visual_prompt: 'Samarreta infantil de front, colors plans, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Després ens vestim. Digues: vestir.',
        stt_expected_array: ['vestir', 'vesti', 'estir', 'betir', 'vestí'],
        parent_tpr_action: 'Passeu junts el braç de l\'infant per la màniga de la samarreta dient la paraula a cada braç.',
      },
      {
        id: 'mati-net', type: 'adjetivo', label: 'net', emoji: '🖐️', pictogram: 'mano-limpia',
        visual_prompt: 'Una mà infantil oberta i neta, sense fons, contorn gruixut, colors plans d\'alt contrast.',
        tts_string: 'Ara tens el nas ben net. Digues: net.',
        stt_expected_array: ['net', 'ne', 'nen', 'net', 'nè'],
        parent_tpr_action: 'Ensenyeu-vos les mans l\'un a l\'altre i piqueu de mans quan totes dues estiguin netes.',
      },
      {
        id: 'mati-ring', type: 'onomatopeya', label: 'ring ring', emoji: '⏰',
        visual_prompt: 'Despertador clàssic de dues campanetes, sense fons, contorn gruixut, colors plans d\'alt contrast.',
        tts_string: 'El despertador sona: ring ring. Digues: ring ring.',
        stt_expected_array: ['ring ring', 'ring', 'rin rin', 'in in', 'ling'],
        parent_tpr_action: 'Feu vibrar les mans a l\'aire com un despertador mentre tots dos dieu «ring ring».',
      },
    ],
  },
  {
    id: 'menjar', title: 'Hora de menjar', icon: '🍽️', subtitle: 'Seure a taula i menjar',
    items: [
      {
        id: 'menjar-cullera', type: 'sustantivo', label: 'cullera', emoji: '🥄', pictogram: 'cuchara',
        visual_prompt: 'Cullera infantil de perfil, mànec curt de color viu, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Això és la cullera. Digues: cullera.',
        stt_expected_array: ['cullera', 'cuera', 'uera', 'tullera', 'cuiera'],
        parent_tpr_action: 'Posa la cullera a la mà de l\'infant i porteu-la junts a la boca fent el gest de menjar.',
      },
      {
        id: 'menjar-got', type: 'sustantivo', label: 'got', emoji: '🥛', pictogram: 'vaso',
        visual_prompt: 'Got infantil de front, mig ple, sense fons, contorn gruixut, colors plans d\'alt contrast.',
        tts_string: 'Això és el got. Digues: got.',
        stt_expected_array: ['got', 'ot', 'cot', 'go', 'gó'],
        parent_tpr_action: 'Feu un brindis amb els gots i beveu tots dos un glop alhora.',
      },
      {
        id: 'menjar-menjar', type: 'verbo', label: 'menjar', emoji: '😋', pictogram: 'comer',
        visual_prompt: 'Boca infantil oberta amb una cullera a prop, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'A taula mengem tots junts. Digues: menjar.',
        stt_expected_array: ['menjar', 'menja', 'enjar', 'mejar', 'menjá'],
        parent_tpr_action: 'Feu el gest de portar-vos menjar a la boca l\'un a l\'altre, tres vegades.',
      },
      {
        id: 'menjar-beure', type: 'verbo', label: 'beure', emoji: '🥤', pictogram: 'vaso',
        visual_prompt: 'Got amb canyeta vist de front, sense fons, contorn gruixut, colors plans d\'alt contrast.',
        tts_string: 'Quan tenim set, bevem aigua. Digues: beure.',
        stt_expected_array: ['beure', 'beue', 'eure', 'veure', 'beu'],
        parent_tpr_action: 'Beveu tots dos del got fent el soroll del glop ben exagerat.',
      },
      {
        id: 'menjar-bo', type: 'adjetivo', label: 'bo', emoji: '👌',
        visual_prompt: 'Mà infantil fent el gest d\'aprovació amb el polze, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Aquest dinar està molt bo. Digues: bo.',
        stt_expected_array: ['bo', 'o', 'po', 'bon', 'bó'],
        parent_tpr_action: 'Feu tots dos el gest del polze amunt i la cara de «mmm» després de cada mos.',
      },
      {
        id: 'menjar-nyam', type: 'onomatopeya', label: 'nyam nyam', emoji: '😋', pictogram: 'comer',
        visual_prompt: 'Cara infantil mastegant amb els ulls tancats de gust, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Quan menges fas: nyam nyam. Digues: nyam nyam.',
        stt_expected_array: ['nyam nyam', 'nyam', 'ñam ñam', 'yam yam', 'am am'],
        parent_tpr_action: 'Mastegueu tots dos a l\'aire dient «nyam nyam» ben fort.',
      },
    ],
  },
  {
    id: 'parc', title: 'Al parc', icon: '🌳', subtitle: 'Jugar i moure\'s a l\'aire lliure',
    items: [
      {
        id: 'parc-pilota', type: 'sustantivo', label: 'pilota', emoji: '⚽',
        visual_prompt: 'Pilota de futbol infantil vista de front, colors plans, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Això és la pilota. Digues: pilota.',
        stt_expected_array: ['pilota', 'piota', 'ilota', 'pilot', 'pilotá'],
        parent_tpr_action: 'Feu rodar la pilota l\'un cap a l\'altre per terra, dient la paraula a cada passada.',
      },
      {
        id: 'parc-tobogan', type: 'sustantivo', label: 'tobogan', emoji: '🛝', pictogram: 'tobogan',
        visual_prompt: 'Tobogan infantil de perfil amb escala, colors plans, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Això és el tobogan. Digues: tobogan.',
        stt_expected_array: ['tobogan', 'tobogá', 'obogan', 'togan', 'toboan'],
        parent_tpr_action: 'Feu baixar la mà de l\'infant per un pendent imaginari mentre dieu la paraula.',
      },
      {
        id: 'parc-correr', type: 'verbo', label: 'córrer', emoji: '🏃', pictogram: 'correr',
        visual_prompt: 'Silueta infantil corrent de perfil, colors plans, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Al parc podem córrer molt. Digues: córrer.',
        stt_expected_array: ['córrer', 'correr', 'core', 'corre', 'oder'],
        parent_tpr_action: 'Correu tots dos sense moure-us del lloc, marcant el pas amb les mans.',
      },
      {
        id: 'parc-saltar', type: 'verbo', label: 'saltar', emoji: '🤸', pictogram: 'saltar',
        visual_prompt: 'Silueta infantil saltant amb els braços amunt, colors plans, sense fons, contorn gruixut.',
        tts_string: 'També podem saltar ben amunt. Digues: saltar.',
        stt_expected_array: ['saltar', 'salta', 'altar', 'tatar', 'saltá'],
        parent_tpr_action: 'Salteu tots dos alhora tres vegades, comptant en veu alta.',
      },
      {
        id: 'parc-alt', type: 'adjetivo', label: 'alt', emoji: '🦒',
        visual_prompt: 'Girafa infantil de cos sencer, coll molt llarg, colors plans, sense fons, contorn gruixut.',
        tts_string: 'El tobogan és molt alt. Digues: alt.',
        stt_expected_array: ['alt', 'al', 'at', 'ált', 'aut'],
        parent_tpr_action: 'Estireu-vos tots dos de puntetes amb els braços amunt, tan alts com pugueu.',
      },
      {
        id: 'parc-bota', type: 'onomatopeya', label: 'boing', emoji: '⚽',
        visual_prompt: 'Pilota botant amb línies de moviment sota, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'La pilota bota i fa: boing. Digues: boing.',
        stt_expected_array: ['boing', 'boin', 'oing', 'buing', 'bo'],
        parent_tpr_action: 'Feu botar la mà com una pilota dient «boing» a cada bot.',
      },
    ],
  },
  {
    id: 'bany', title: 'Hora del bany', icon: '🛁', subtitle: 'Aigua, sabó i bombolles',
    items: [
      {
        id: 'bany-banyera', type: 'sustantivo', label: 'banyera', emoji: '🛁',
        visual_prompt: 'Banyera infantil de perfil amb escuma a dalt, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és la banyera. Digues: banyera.',
        stt_expected_array: ['banyera', 'banera', 'anyera', 'bayera', 'banyeá'],
        parent_tpr_action: 'Toqueu junts la vora de la banyera i feu el gest de posar-hi la mà a dins.',
      },
      {
        id: 'bany-sabo', type: 'sustantivo', label: 'sabó', emoji: '🧼', pictogram: 'jabon',
        visual_prompt: 'Pastilla de sabó amb escuma al costat, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és el sabó. Digues: sabó.',
        stt_expected_array: ['sabó', 'sabo', 'abó', 'tabó', 'saó'],
        parent_tpr_action: 'Passeu-vos el sabó de mà en mà fent bombolles imaginàries.',
      },
      {
        id: 'bany-banyar', type: 'verbo', label: 'banyar', emoji: '🛀', pictogram: 'banar',
        visual_prompt: 'Infant dins la banyera amb escuma al cap, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Al vespre ens banyem. Digues: banyar.',
        stt_expected_array: ['banyar', 'banya', 'anyar', 'bayar', 'banyá'],
        parent_tpr_action: 'Feu el gest de tirar-vos aigua per sobre l\'un a l\'altre dient la paraula.',
      },
      {
        id: 'bany-fregar', type: 'verbo', label: 'fregar', emoji: '🧽', pictogram: 'esponja',
        visual_prompt: 'Esponja de bany quadrada amb escuma, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Amb l\'esponja freguem l\'esquena. Digues: fregar.',
        stt_expected_array: ['fregar', 'frega', 'egar', 'pegar', 'fregá'],
        parent_tpr_action: 'Fregueu-vos l\'esquena l\'un a l\'altre amb la mà oberta, com si fos una esponja.',
      },
      {
        id: 'bany-calent', type: 'adjetivo', label: 'calent', emoji: '♨️',
        visual_prompt: 'Got amb vapor sortint cap amunt, colors plans, sense fons, contorn gruixut.',
        tts_string: 'L\'aigua del bany està calenta. Digues: calent.',
        stt_expected_array: ['calent', 'calen', 'alent', 'talent', 'caent'],
        parent_tpr_action: 'Toqueu tots dos l\'aigua i venteu-vos la mà com si cremés, exagerant molt.',
      },
      {
        id: 'bany-xof', type: 'onomatopeya', label: 'xof', emoji: '💦',
        visual_prompt: 'Esquitx d\'aigua amb gotes al voltant, colors plans, sense fons, contorn gruixut.',
        tts_string: 'L\'aigua cau i fa: xof. Digues: xof.',
        stt_expected_array: ['xof', 'of', 'chof', 'xo', 'txof'],
        parent_tpr_action: 'Piqueu tots dos l\'aigua (o la taula) amb la mà oberta dient «xof».',
      },
    ],
  },
  {
    id: 'nit', title: 'A dormir', icon: '🌙', subtitle: 'Conte, abraçada i cap al llit',
    items: [
      {
        id: 'nit-lluna', type: 'sustantivo', label: 'lluna', emoji: '🌙',
        visual_prompt: 'Lluna creixent de perfil amb estrelles petites, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és la lluna. Digues: lluna.',
        stt_expected_array: ['lluna', 'iuna', 'una', 'luna', 'llua'],
        parent_tpr_action: 'Mireu junts per la finestra i assenyaleu la lluna (o dibuixeu-la a l\'aire amb el dit).',
      },
      {
        id: 'nit-conte', type: 'sustantivo', label: 'conte', emoji: '📖',
        visual_prompt: 'Llibre infantil obert vist de front, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és el conte. Digues: conte.',
        stt_expected_array: ['conte', 'onte', 'tonte', 'cote', 'con'],
        parent_tpr_action: 'Obriu un llibre junts i passeu tres pàgines dient la paraula a cadascuna.',
      },
      {
        id: 'nit-dormir', type: 'verbo', label: 'dormir', emoji: '😴', pictogram: 'dormir',
        visual_prompt: 'Cara infantil dormint amb els ulls tancats, colors plans, sense fons, contorn gruixut.',
        tts_string: 'A la nit anem a dormir. Digues: dormir.',
        stt_expected_array: ['dormir', 'dormi', 'ormir', 'domir', 'dormí'],
        parent_tpr_action: 'Ajunteu les mans sota la galta tots dos i tanqueu els ulls tres segons.',
      },
      {
        id: 'nit-abracar', type: 'verbo', label: 'abraçar', emoji: '🤗', pictogram: 'abrazo',
        visual_prompt: 'Dues siluetes infantils abraçades, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Abans de dormir ens abracem. Digues: abraçar.',
        stt_expected_array: ['abraçar', 'abrasar', 'abraça', 'braçar', 'abaçar'],
        parent_tpr_action: 'Feu-vos una abraçada ben forta i compteu fins a tres sense deixar-vos anar.',
      },
      {
        id: 'nit-fosc', type: 'adjetivo', label: 'fosc', emoji: '🌑',
        visual_prompt: 'Cercle fosc amb una estrella petita al costat, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Quan apaguem el llum, tot està fosc. Digues: fosc.',
        stt_expected_array: ['fosc', 'fos', 'osc', 'posc', 'foc'],
        parent_tpr_action: 'Tapeu-vos els ulls amb les mans tots dos i digueu la paraula a les fosques.',
      },
      {
        id: 'nit-mussol', type: 'onomatopeya', label: 'uh uh', emoji: '🦉',
        visual_prompt: 'Mussol de front amb els ulls grans i rodons, colors plans, sense fons, contorn gruixut.',
        tts_string: 'A la nit el mussol fa: uh uh. Digues: uh uh.',
        stt_expected_array: ['uh uh', 'uh', 'u u', 'buh', 'hu hu'],
        parent_tpr_action: 'Feu tots dos els ulls rodons amb els dits i digueu «uh uh» amb veu greu.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. Categories lèxiques (progressió de dificultat N1 → N3, ES-08)
// ---------------------------------------------------------------------------
export const LEXICAL_CATEGORIES_CA: LexicalCategory[] = [
  {
    id: 'ca-cat-fruites', title: 'Fruites', icon: '🍎',
    subtitle: 'De la fruita de cada dia a la que es veu de tant en tant',
    items: [
      {
        id: 'ca-cat-fruites-poma', type: 'sustantivo', label: 'poma', emoji: '🍎', difficulty: 1,
        visual_prompt: 'Poma vermella de front amb una fulla verda, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és una poma. Digues: poma.',
        stt_expected_array: ['poma', 'oma', 'pom', 'poba', 'pomá'],
        parent_tpr_action: 'Feu junts el gest de mossegar una poma imaginària i digueu la paraula després del mos.',
      },
      {
        id: 'ca-cat-fruites-platan', type: 'sustantivo', label: 'plàtan', emoji: '🍌', difficulty: 1,
        visual_prompt: 'Plàtan groc de perfil lleugerament corbat, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és un plàtan. Digues: plàtan.',
        stt_expected_array: ['plàtan', 'platan', 'atan', 'patan', 'plata'],
        parent_tpr_action: 'Feu el gest de pelar un plàtan de dalt a baix amb tres estrebades, dient la paraula a cadascuna.',
      },
      {
        id: 'ca-cat-fruites-taronja', type: 'sustantivo', label: 'taronja', emoji: '🍊', difficulty: 1,
        visual_prompt: 'Taronja rodona de front amb una fulla, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és una taronja. Digues: taronja.',
        stt_expected_array: ['taronja', 'taronja', 'aronja', 'tarona', 'taonja'],
        parent_tpr_action: 'Feu rodar una taronja imaginària per la taula l\'un cap a l\'altre.',
      },
      {
        id: 'ca-cat-fruites-pera', type: 'sustantivo', label: 'pera', emoji: '🍐', difficulty: 2,
        visual_prompt: 'Pera verda de front amb el peduncle amunt, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és una pera. Digues: pera.',
        stt_expected_array: ['pera', 'era', 'pea', 'peda', 'perá'],
        parent_tpr_action: 'Dibuixeu junts la forma de la pera a l\'aire amb el dit, de dalt a baix.',
      },
      {
        id: 'ca-cat-fruites-pinya', type: 'sustantivo', label: 'pinya', emoji: '🍍', difficulty: 3,
        visual_prompt: 'Pinya tropical de front amb la corona de fulles, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és una pinya. Digues: pinya.',
        stt_expected_array: ['pinya', 'pina', 'inya', 'piña', 'pia'],
        parent_tpr_action: 'Poseu-vos les mans obertes al cap com la corona de la pinya i digueu la paraula.',
      },
      {
        id: 'ca-cat-fruites-cirera', type: 'sustantivo', label: 'cirera', emoji: '🍒', difficulty: 3,
        visual_prompt: 'Dues cireres vermelles unides per la cua, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és una cirera. Digues: cirera.',
        stt_expected_array: ['cirera', 'sirera', 'irera', 'cirea', 'tirera'],
        parent_tpr_action: 'Pengeu-vos dues cireres imaginàries de les orelles i digueu la paraula rient.',
      },
    ],
  },
  {
    id: 'ca-cat-animals', title: 'Animals', icon: '🐶',
    subtitle: 'Dels de casa als que només es veuen al zoo',
    items: [
      {
        id: 'ca-cat-animals-gos', type: 'sustantivo', label: 'gos', emoji: '🐶', difficulty: 1,
        visual_prompt: 'Cap de gos de front amb les orelles caigudes, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és un gos. Digues: gos.',
        stt_expected_array: ['gos', 'os', 'go', 'cos', 'gó'],
        parent_tpr_action: 'Poseu-vos tots dos de quatre grapes i lladreu tres vegades.',
      },
      {
        id: 'ca-cat-animals-gat', type: 'sustantivo', label: 'gat', emoji: '🐱', difficulty: 1,
        visual_prompt: 'Cap de gat de front amb les orelles punxegudes i bigotis, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és un gat. Digues: gat.',
        stt_expected_array: ['gat', 'at', 'ga', 'cat', 'gá'],
        parent_tpr_action: 'Dibuixeu-vos bigotis a l\'aire amb el dit i feu «meu» tots dos.',
      },
      {
        id: 'ca-cat-animals-anec', type: 'sustantivo', label: 'ànec', emoji: '🦆', difficulty: 2,
        visual_prompt: 'Ànec groc de perfil amb el bec taronja, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és un ànec. Digues: ànec.',
        stt_expected_array: ['ànec', 'anec', 'nec', 'anet', 'àne'],
        parent_tpr_action: 'Camineu tots dos com un ànec, balancejant-vos, i feu «qua qua».',
      },
      {
        id: 'ca-cat-animals-vaca', type: 'sustantivo', label: 'vaca', emoji: '🐄', difficulty: 2,
        visual_prompt: 'Vaca de perfil amb taques negres, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és una vaca. Digues: vaca.',
        stt_expected_array: ['vaca', 'baca', 'aca', 'vata', 'vacá'],
        parent_tpr_action: 'Poseu-vos les mans al cap com dues banyes i feu «muu» ben llarg.',
      },
      {
        id: 'ca-cat-animals-elefant', type: 'sustantivo', label: 'elefant', emoji: '🐘', difficulty: 3,
        visual_prompt: 'Elefant de perfil amb la trompa avall, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és un elefant. Digues: elefant.',
        stt_expected_array: ['elefant', 'elefan', 'efant', 'elefante', 'eant'],
        parent_tpr_action: 'Feu la trompa amb el braç davant del nas i balancegeu-la tots dos.',
      },
      {
        id: 'ca-cat-animals-girafa', type: 'sustantivo', label: 'girafa', emoji: '🦒', difficulty: 3,
        visual_prompt: 'Girafa de cos sencer amb el coll molt llarg i taques, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és una girafa. Digues: girafa.',
        stt_expected_array: ['girafa', 'jirafa', 'irafa', 'giafa', 'girafá'],
        parent_tpr_action: 'Estireu el coll amunt tots dos, tan amunt com pugueu, i digueu la paraula.',
      },
    ],
  },
  {
    id: 'ca-cat-transports', title: 'Transports', icon: '🚗',
    subtitle: 'Del que passa pel carrer al que gairebé no es veu mai',
    items: [
      {
        id: 'ca-cat-transports-cotxe', type: 'sustantivo', label: 'cotxe', emoji: '🚗', difficulty: 1,
        visual_prompt: 'Cotxe de joguina de front amb rodes grosses, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és un cotxe. Digues: cotxe.',
        stt_expected_array: ['cotxe', 'coche', 'otxe', 'cote', 'totxe'],
        parent_tpr_action: 'Agafeu un volant imaginari tots dos i gireu-lo a banda i banda.',
      },
      {
        id: 'ca-cat-transports-moto', type: 'sustantivo', label: 'moto', emoji: '🏍️', difficulty: 1,
        visual_prompt: 'Motocicleta de perfil, colors plans, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Això és una moto. Digues: moto.',
        stt_expected_array: ['moto', 'oto', 'mot', 'moco', 'motó'],
        parent_tpr_action: 'Agafeu el manillar imaginari i accelereu tots dos fent «rrrum».',
      },
      {
        id: 'ca-cat-transports-tren', type: 'sustantivo', label: 'tren', emoji: '🚆', difficulty: 2,
        visual_prompt: 'Tren de front amb dos fanals, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és un tren. Digues: tren.',
        stt_expected_array: ['tren', 'ten', 'en', 'tem', 'trè'],
        parent_tpr_action: 'Poseu-vos en fila i camineu com un tren dient «xuc-xuc» a cada pas.',
      },
      {
        id: 'ca-cat-transports-vaixell', type: 'sustantivo', label: 'vaixell', emoji: '🚢', difficulty: 2,
        visual_prompt: 'Vaixell de perfil amb xemeneia i onades sota, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és un vaixell. Digues: vaixell.',
        stt_expected_array: ['vaixell', 'vaixel', 'baixell', 'aixell', 'vaiell'],
        parent_tpr_action: 'Balancegeu-vos tots dos com si estiguéssiu dalt d\'un vaixell amb onades.',
      },
      {
        id: 'ca-cat-transports-avio', type: 'sustantivo', label: 'avió', emoji: '✈️', difficulty: 3,
        visual_prompt: 'Avió de perfil amb les ales esteses, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és un avió. Digues: avió.',
        stt_expected_array: ['avió', 'avio', 'abió', 'vió', 'avi'],
        parent_tpr_action: 'Obriu els braços com ales i voleu tots dos fins a l\'altra punta de l\'habitació.',
      },
      {
        id: 'ca-cat-transports-camio', type: 'sustantivo', label: 'camió', emoji: '🚚', difficulty: 3,
        visual_prompt: 'Camió de perfil amb remolc, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és un camió. Digues: camió.',
        stt_expected_array: ['camió', 'camio', 'amió', 'tamió', 'camí'],
        parent_tpr_action: 'Feu el clàxon del camió amb la mà tots dos i digueu la paraula després.',
      },
    ],
  },
  {
    id: 'ca-cat-colors', title: 'Colors', icon: '🎨',
    subtitle: 'Del vermell i el blau als que costen més d\'anomenar',
    items: [
      {
        id: 'ca-cat-colors-vermell', type: 'adjetivo', label: 'vermell', emoji: '🔴', pictogram: 'color-rojo', difficulty: 1,
        visual_prompt: 'Cercle vermell pla i saturat, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Aquest color és vermell. Digues: vermell.',
        stt_expected_array: ['vermell', 'bermell', 'ermell', 'vermei', 'vemell'],
        parent_tpr_action: 'Busqueu junts tres coses vermelles per l\'habitació i toqueu-les dient la paraula.',
      },
      {
        id: 'ca-cat-colors-blau', type: 'adjetivo', label: 'blau', emoji: '🔵', pictogram: 'color-azul', difficulty: 1,
        visual_prompt: 'Cercle blau pla i saturat, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Aquest color és blau. Digues: blau.',
        stt_expected_array: ['blau', 'lau', 'bau', 'brau', 'bla'],
        parent_tpr_action: 'Assenyaleu junts el cel (o una cosa blava) i digueu la paraula tots dos.',
      },
      {
        id: 'ca-cat-colors-groc', type: 'adjetivo', label: 'groc', emoji: '🟡', pictogram: 'color-amarillo', difficulty: 2,
        visual_prompt: 'Cercle groc pla i saturat, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Aquest color és groc. Digues: groc.',
        stt_expected_array: ['groc', 'roc', 'gloc', 'goc', 'grò'],
        parent_tpr_action: 'Feu el sol amb els braços oberts sobre el cap i digueu la paraula.',
      },
      {
        id: 'ca-cat-colors-verd', type: 'adjetivo', label: 'verd', emoji: '🟢', pictogram: 'color-verde', difficulty: 2,
        visual_prompt: 'Cercle verd pla i saturat, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Aquest color és verd. Digues: verd.',
        stt_expected_array: ['verd', 'ver', 'berd', 'vert', 'vé'],
        parent_tpr_action: 'Busqueu una fulla o una cosa verda i poseu-vos-la a la mà l\'un a l\'altre.',
      },
      {
        id: 'ca-cat-colors-lila', type: 'adjetivo', label: 'lila', emoji: '🟣', pictogram: 'color-morado', difficulty: 3,
        visual_prompt: 'Cercle lila pla i saturat, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Aquest color és lila. Digues: lila.',
        stt_expected_array: ['lila', 'ila', 'lil', 'liya', 'lilá'],
        parent_tpr_action: 'Barregeu a l\'aire el vermell i el blau amb el dit i digueu la paraula del color nou.',
      },
      {
        id: 'ca-cat-colors-marro', type: 'adjetivo', label: 'marró', emoji: '🟤', pictogram: 'color-marron', difficulty: 3,
        visual_prompt: 'Cercle marró pla i saturat, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Aquest color és marró. Digues: marró.',
        stt_expected_array: ['marró', 'marro', 'arró', 'maró', 'malró'],
        parent_tpr_action: 'Toqueu junts una cosa de fusta i digueu la paraula amb la mà a sobre.',
      },
    ],
  },
  {
    id: 'ca-cat-cos', title: 'El cos', icon: '🖐️',
    subtitle: 'Del que s\'assenyala sol al que s\'ha de buscar',
    items: [
      {
        id: 'ca-cat-cos-ma', type: 'sustantivo', label: 'mà', emoji: '🖐️', pictogram: 'mano', difficulty: 1,
        visual_prompt: 'Mà infantil oberta de front amb els cinc dits separats, sense fons, contorn gruixut.',
        tts_string: 'Això és la mà. Digues: mà.',
        stt_expected_array: ['mà', 'ma', 'man', 'bà', 'mán'],
        parent_tpr_action: 'Piqueu-vos les mans l\'un a l\'altre cinc vegades comptant en veu alta.',
      },
      {
        id: 'ca-cat-cos-peu', type: 'sustantivo', label: 'peu', emoji: '🦶', pictogram: 'pie', difficulty: 1,
        visual_prompt: 'Peu infantil descalç de perfil, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Això és el peu. Digues: peu.',
        stt_expected_array: ['peu', 'eu', 'pe', 'beu', 'peus'],
        parent_tpr_action: 'Toqueu-vos els peus l\'un a l\'altre amb la punta del dit i digueu la paraula.',
      },
      {
        id: 'ca-cat-cos-boca', type: 'sustantivo', label: 'boca', emoji: '👄', pictogram: 'boca', difficulty: 1,
        visual_prompt: 'Boca infantil somrient de front, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Això és la boca. Digues: boca.',
        stt_expected_array: ['boca', 'oca', 'poca', 'bota', 'bocá'],
        parent_tpr_action: 'Obriu i tanqueu la boca tots dos davant del mirall dient la paraula.',
      },
      {
        id: 'ca-cat-cos-ull', type: 'sustantivo', label: 'ull', emoji: '👁️', pictogram: 'ojo', difficulty: 2,
        visual_prompt: 'Ull infantil de front amb pestanyes, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'Això és l\'ull. Digues: ull.',
        stt_expected_array: ['ull', 'ui', 'ul', 'uy', 'ulls'],
        parent_tpr_action: 'Tapeu-vos un ull tots dos i mireu-vos amb l\'altre dient la paraula.',
      },
      {
        id: 'ca-cat-cos-genoll', type: 'sustantivo', label: 'genoll', emoji: '🦵', pictogram: 'rodilla', difficulty: 2,
        visual_prompt: 'Cama infantil de perfil amb el genoll marcat, sense fons, contorn gruixut.',
        tts_string: 'Això és el genoll. Digues: genoll.',
        stt_expected_array: ['genoll', 'jenoll', 'enoll', 'genoi', 'genol'],
        parent_tpr_action: 'Doblegueu el genoll tots dos tres vegades tocant-lo amb la mà.',
      },
      {
        id: 'ca-cat-cos-colze', type: 'sustantivo', label: 'colze', emoji: '💪', pictogram: 'codo', difficulty: 3,
        visual_prompt: 'Braç infantil doblegat de perfil amb el colze marcat, sense fons, contorn gruixut.',
        tts_string: 'Això és el colze. Digues: colze.',
        stt_expected_array: ['colze', 'colse', 'olze', 'coze', 'colde'],
        parent_tpr_action: 'Toqueu-vos els colzes l\'un amb l\'altre com una encaixada i digueu la paraula.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 3. Progressions de camp semàntic (concepte → part → acció → qualitat)
// Cap fase demana una onomatopeia: el criteri és el camp semàntic (ES-10).
// ---------------------------------------------------------------------------
export const PROGRESSION_SEQUENCES_CA: ProgressionSequence[] = [
  {
    id: 'ca-seq-cotxe', theme: 'Transport · El cotxe', icon: '🚗',
    phases: [
      {
        kind: 'concepto', label: 'cotxe', emoji: '🚗',
        visual_prompt: 'Cotxe de joguina de front, colors plans, rodes grosses, sense fons, alt contrast.',
        tts_string: 'Això és el cotxe. Digues: cotxe.',
        stt_expected_array: ['cotxe', 'coche', 'otxe', 'cote', 'totxe'],
        parent_tpr_action: 'Posa el cotxe a la mà de l\'infant, assenyala\'l i repetiu junts «cotxe» mentre el moveu.',
      },
      {
        kind: 'parte', label: 'roda', emoji: '🛞', pictogram: 'rueda',
        visual_prompt: 'Una roda de cotxe de front, negra amb llanta clara, sense fons, contorn gruixut.',
        tts_string: 'El cotxe té rodes. Digues: roda.',
        stt_expected_array: ['roda', 'oda', 'loda', 'rod', 'rodá'],
        parent_tpr_action: 'Agafeu el cotxe i feu girar una roda amb el dit de l\'infant, repetint «roda» a cada volta.',
      },
      {
        kind: 'accion', label: 'corre', emoji: '💨',
        visual_prompt: 'Cotxe de perfil amb línies de velocitat al darrere, sense fons, contorn gruixut.',
        tts_string: 'El cotxe corre molt. Digues: corre.',
        stt_expected_array: ['corre', 'core', 'orre', 'code', 'corré'],
        parent_tpr_action: 'Feu córrer el cotxe per terra d\'una punta a l\'altra mentre tots dos dieu «corre».',
      },
      {
        kind: 'cualidad', label: 'ràpid', emoji: '🚗',
        visual_prompt: 'Cotxe de perfil inclinat endavant amb tres línies de velocitat, sense fons, contorn gruixut.',
        tts_string: 'Aquest cotxe és molt ràpid. Digues: ràpid.',
        stt_expected_array: ['ràpid', 'rapid', 'apid', 'lapid', 'ràpi'],
        parent_tpr_action: 'Feu córrer el cotxe a poc a poc i després molt de pressa; digueu «ràpid» només quan corre.',
      },
    ],
  },
  {
    id: 'ca-seq-gos', theme: 'Animals · El gos', icon: '🐶',
    phases: [
      {
        kind: 'concepto', label: 'gos', emoji: '🐕',
        visual_prompt: 'Gos de cos sencer de perfil, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és el gos. Digues: gos.',
        stt_expected_array: ['gos', 'os', 'go', 'cos', 'gó'],
        parent_tpr_action: 'Feu junts de gos: de quatre grapes i tres lladrucs abans de dir la paraula.',
      },
      {
        kind: 'parte', label: 'pota', emoji: '🐾',
        visual_prompt: 'Petjada de gos amb els coixinets marcats, sense fons, contorn gruixut.',
        tts_string: 'El gos té quatre potes. Digues: pota.',
        stt_expected_array: ['pota', 'ota', 'bota', 'pot', 'potá'],
        parent_tpr_action: 'Poseu la mà de l\'infant a terra com una pota i camineu tots dos quatre passes.',
      },
      {
        kind: 'accion', label: 'salta', emoji: '⬆️',
        visual_prompt: 'Gos saltant de perfil amb les quatre potes enlaire, sense fons, contorn gruixut.',
        tts_string: 'El gos salta molt content. Digues: salta.',
        stt_expected_array: ['salta', 'alta', 'tata', 'sata', 'saltá'],
        parent_tpr_action: 'Salteu tots dos com el gos tres vegades dient la paraula a cada salt.',
      },
      {
        kind: 'cualidad', label: 'pelut', emoji: '🐕',
        visual_prompt: 'Gos de pèl llarg de front, textura de pèl marcada amb línies, sense fons, contorn gruixut.',
        tts_string: 'Aquest gos és molt pelut. Digues: pelut.',
        stt_expected_array: ['pelut', 'pelu', 'elut', 'peut', 'peludo'],
        parent_tpr_action: 'Acaroneu junts un peluix i digueu «pelut» mentre passeu la mà pel pèl.',
      },
    ],
  },
  {
    id: 'ca-seq-vaca', theme: 'Animals · La vaca', icon: '🐄',
    phases: [
      {
        kind: 'concepto', label: 'vaca', emoji: '🐄',
        visual_prompt: 'Vaca de perfil amb taques negres, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és la vaca. Digues: vaca.',
        stt_expected_array: ['vaca', 'baca', 'aca', 'vata', 'vacá'],
        parent_tpr_action: 'Feu les banyes amb els dits al cap tots dos i digueu la paraula mirant-vos.',
      },
      {
        kind: 'parte', label: 'llet', emoji: '🥛',
        visual_prompt: 'Got de llet blanca de front, colors plans, sense fons, contorn gruixut.',
        tts_string: 'La vaca ens dona llet. Digues: llet.',
        stt_expected_array: ['llet', 'iet', 'let', 'et', 'llé'],
        parent_tpr_action: 'Feu el gest de beure un got de llet tots dos i digueu la paraula al final del glop.',
      },
      {
        kind: 'accion', label: 'menja', emoji: '🌿',
        visual_prompt: 'Vaca amb el cap acotat sobre l\'herba, colors plans, sense fons, contorn gruixut.',
        tts_string: 'La vaca menja herba. Digues: menja.',
        stt_expected_array: ['menja', 'enja', 'meja', 'menla', 'menjá'],
        parent_tpr_action: 'Acoteu el cap tots dos com la vaca i feu que mengeu herba de terra.',
      },
      {
        kind: 'cualidad', label: 'gran', emoji: '🐄',
        visual_prompt: 'Vaca gran al costat d\'un vedell petit per comparar la mida, sense fons, contorn gruixut.',
        tts_string: 'La vaca és molt gran. Digues: gran.',
        stt_expected_array: ['gran', 'gan', 'ran', 'glan', 'grá'],
        parent_tpr_action: 'Obriu els braços tan amunt com pugueu tots dos per ensenyar com és de gran.',
      },
    ],
  },
  {
    id: 'ca-seq-gat', theme: 'Animals · El gat', icon: '🐱',
    phases: [
      {
        kind: 'concepto', label: 'gat', emoji: '🐈',
        visual_prompt: 'Gat de cos sencer de perfil amb la cua amunt, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és el gat. Digues: gat.',
        stt_expected_array: ['gat', 'at', 'ga', 'cat', 'gá'],
        parent_tpr_action: 'Feu «meu» tots dos i camineu de puntetes com un gat fins a la porta.',
      },
      {
        kind: 'parte', label: 'bigoti', emoji: '🐱',
        visual_prompt: 'Cara de gat de front amb els bigotis molt marcats, sense fons, contorn gruixut.',
        tts_string: 'El gat té bigotis. Digues: bigoti.',
        stt_expected_array: ['bigoti', 'bigot', 'igoti', 'bigo', 'bigotí'],
        parent_tpr_action: 'Dibuixeu-vos els bigotis a la cara amb el dit l\'un a l\'altre, tres a cada banda.',
      },
      {
        kind: 'accion', label: 'dorm', emoji: '😴',
        visual_prompt: 'Gat cargolat dormint amb els ulls tancats, sense fons, contorn gruixut.',
        tts_string: 'El gat dorm al sofà. Digues: dorm.',
        stt_expected_array: ['dorm', 'dom', 'orm', 'dorme', 'dò'],
        parent_tpr_action: 'Cargoleu-vos tots dos com el gat i tanqueu els ulls tres segons.',
      },
      {
        kind: 'cualidad', label: 'suau', emoji: '🐈',
        visual_prompt: 'Mà infantil acaronant l\'esquena d\'un gat, sense fons, contorn gruixut.',
        tts_string: 'El pèl del gat és molt suau. Digues: suau.',
        stt_expected_array: ['suau', 'sua', 'uau', 'tuau', 'suá'],
        parent_tpr_action: 'Acaroneu junts una manta o un peluix i digueu «suau» amb veu fluixeta.',
      },
    ],
  },
  {
    id: 'ca-seq-pluja', theme: 'Natura · La pluja', icon: '🌧️',
    phases: [
      {
        kind: 'concepto', label: 'aigua', emoji: '💧',
        visual_prompt: 'Gota d\'aigua gran de front, blava i brillant, sense fons, contorn gruixut.',
        tts_string: 'Això és l\'aigua. Digues: aigua.',
        stt_expected_array: ['aigua', 'aiga', 'igua', 'aua', 'aiwa'],
        parent_tpr_action: 'Obriu l\'aixeta un moment i poseu-hi la mà tots dos dient la paraula.',
      },
      {
        kind: 'parte', label: 'núvol', emoji: '☁️',
        visual_prompt: 'Núvol blanc arrodonit de front, sense fons, contorn gruixut, alt contrast.',
        tts_string: 'L\'aigua baixa del núvol. Digues: núvol.',
        stt_expected_array: ['núvol', 'nuvol', 'úvol', 'nubol', 'núvo'],
        parent_tpr_action: 'Mireu junts pel finestra i busqueu un núvol; assenyaleu-lo dient la paraula.',
      },
      {
        kind: 'accion', label: 'cau', emoji: '⬇️',
        visual_prompt: 'Tres gotes caient en vertical amb línies de moviment, sense fons, contorn gruixut.',
        tts_string: 'La pluja cau del cel. Digues: cau.',
        stt_expected_array: ['cau', 'au', 'tau', 'ca', 'cá'],
        parent_tpr_action: 'Feu caure els dits com gotes des de dalt fins als genolls de l\'infant.',
      },
      {
        kind: 'cualidad', label: 'mullat', emoji: '🤲',
        visual_prompt: 'Dues mans obertes amb gotes d\'aigua a sobre, sense fons, contorn gruixut.',
        tts_string: 'Amb la pluja tot queda mullat. Digues: mullat.',
        stt_expected_array: ['mullat', 'muat', 'ullat', 'muyat', 'mullá'],
        parent_tpr_action: 'Mulleu-vos un dit i toqueu-vos el braç l\'un a l\'altre dient la paraula.',
      },
    ],
  },
  {
    id: 'ca-seq-tren', theme: 'Transport · El tren', icon: '🚂',
    phases: [
      {
        kind: 'concepto', label: 'tren', emoji: '🚆',
        visual_prompt: 'Tren de front amb dos fanals encesos, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és el tren. Digues: tren.',
        stt_expected_array: ['tren', 'ten', 'en', 'tem', 'trè'],
        parent_tpr_action: 'Poseu-vos en fila i camineu com un tren fent «xuc-xuc» abans de dir la paraula.',
      },
      {
        kind: 'parte', label: 'vagó', emoji: '🚃',
        visual_prompt: 'Un vagó de tren sol, de perfil, amb finestres, sense fons, contorn gruixut.',
        tts_string: 'El tren porta molts vagons. Digues: vagó.',
        stt_expected_array: ['vagó', 'vago', 'agó', 'bagó', 'vagon'],
        parent_tpr_action: 'Poseu tres cadires en fila com vagons i toqueu-les una a una dient la paraula.',
      },
      {
        kind: 'accion', label: 'para', emoji: '🛑',
        visual_prompt: 'Tren aturat davant d\'un senyal vermell, sense fons, contorn gruixut.',
        tts_string: 'El tren para a l\'estació. Digues: para.',
        stt_expected_array: ['para', 'ara', 'pala', 'par', 'pará'],
        parent_tpr_action: 'Camineu com un tren i atureu-vos en sec quan l\'adult aixequi la mà.',
      },
      {
        kind: 'cualidad', label: 'llarg', emoji: '🚆',
        visual_prompt: 'Tren de perfil amb cinc vagons enganxats, ocupant tota l\'amplada, sense fons, contorn gruixut.',
        tts_string: 'Aquest tren és molt llarg. Digues: llarg.',
        stt_expected_array: ['llarg', 'iarg', 'larg', 'llar', 'llá'],
        parent_tpr_action: 'Estireu els braços tots dos tan lluny com pugueu per ensenyar com és de llarg.',
      },
    ],
  },
  {
    id: 'ca-seq-ocell', theme: 'Animals · L\'ocell', icon: '🐦',
    phases: [
      {
        kind: 'concepto', label: 'ocell', emoji: '🐦',
        visual_prompt: 'Ocell petit de perfil sobre una branca, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és l\'ocell. Digues: ocell.',
        stt_expected_array: ['ocell', 'ocei', 'oell', 'osell', 'ocel'],
        parent_tpr_action: 'Mireu junts per la finestra buscant un ocell i assenyaleu-lo dient la paraula.',
      },
      {
        kind: 'parte', label: 'ploma', emoji: '🪶',
        visual_prompt: 'Una ploma sola vista de perfil, colors plans, sense fons, contorn gruixut.',
        tts_string: 'L\'ocell té plomes. Digues: ploma.',
        stt_expected_array: ['ploma', 'poma', 'loma', 'plom', 'plomá'],
        parent_tpr_action: 'Bufeu junts una ploma imaginària des del palmell de la mà.',
      },
      {
        kind: 'accion', label: 'vola', emoji: '🐦',
        visual_prompt: 'Ocell amb les ales obertes en ple vol, sense fons, contorn gruixut.',
        tts_string: 'L\'ocell vola pel cel. Digues: vola.',
        stt_expected_array: ['vola', 'ola', 'bola', 'vol', 'volá'],
        parent_tpr_action: 'Obriu els braços com ales i voleu tots dos fins a l\'altra punta de l\'habitació.',
      },
      {
        kind: 'cualidad', label: 'petit', emoji: '🐤',
        visual_prompt: 'Pollet molt petit al costat d\'una mà per comparar la mida, sense fons, contorn gruixut.',
        tts_string: 'Aquest ocell és molt petit. Digues: petit.',
        stt_expected_array: ['petit', 'peti', 'etit', 'petí', 'pequit'],
        parent_tpr_action: 'Ajunteu el polze i l\'índex fins a deixar un forat mínim i mireu-hi a través tots dos.',
      },
    ],
  },
  {
    id: 'ca-seq-pa', theme: 'Alimentació · L\'esmorzar', icon: '🍞',
    phases: [
      {
        kind: 'concepto', label: 'pa', emoji: '🍞',
        visual_prompt: 'Llesca de pa de motlle de front, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és el pa. Digues: pa.',
        stt_expected_array: ['pa', 'ba', 'pan', 'à', 'pá'],
        parent_tpr_action: 'Poseu una llesca de pa a la mà de l\'infant i digueu la paraula abans del primer mos.',
      },
      {
        kind: 'parte', label: 'bol', emoji: '🍵',
        visual_prompt: 'Bol infantil de front, mig ple, colors plans, sense fons, contorn gruixut.',
        tts_string: 'A l\'esmorzar fem servir el bol. Digues: bol.',
        stt_expected_array: ['bol', 'ol', 'pol', 'bo', 'bó'],
        parent_tpr_action: 'Feu la forma del bol amb les dues mans juntes i digueu la paraula.',
      },
      {
        kind: 'accion', label: 'vull pa', emoji: '🙋',
        visual_prompt: 'Infant amb la mà aixecada assenyalant una llesca de pa, sense fons, contorn gruixut.',
        tts_string: 'Per demanar-ne més, diem: vull pa. Digues: vull pa.',
        stt_expected_array: ['vull pa', 'vui pa', 'ull pa', 'vull', 'buipa'],
        parent_tpr_action: 'Espera que l\'infant ho digui abans de donar-li el tros; celebra-ho amb una encaixada.',
      },
      {
        kind: 'cualidad', label: 'torrat', emoji: '🍞',
        visual_prompt: 'Llesca de pa torrat amb la vora daurada, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Aquest pa està torrat. Digues: torrat.',
        stt_expected_array: ['torrat', 'torra', 'orrat', 'totat', 'torrá'],
        parent_tpr_action: 'Compareu una llesca tova i una de torrada tocant-les tots dos amb el dit.',
      },
    ],
  },
  {
    id: 'ca-seq-globus', theme: 'Joc · El globus', icon: '🎈',
    phases: [
      {
        kind: 'concepto', label: 'globus', emoji: '🎈',
        visual_prompt: 'Globus vermell inflat amb el fil penjant, colors plans, sense fons, contorn gruixut.',
        tts_string: 'Això és el globus. Digues: globus.',
        stt_expected_array: ['globus', 'globu', 'obus', 'gobus', 'globo'],
        parent_tpr_action: 'Poseu el globus a les mans de l\'infant i feu-lo pujar i baixar dient la paraula.',
      },
      {
        kind: 'parte', label: 'corda', emoji: '🧵',
        visual_prompt: 'Un fil llarg i prim que penja en vertical, sense fons, contorn gruixut.',
        tts_string: 'El globus té una corda. Digues: corda.',
        stt_expected_array: ['corda', 'orda', 'colda', 'cord', 'cordá'],
        parent_tpr_action: 'Agafeu la corda del globus tots dos alhora i estireu-la suaument.',
      },
      {
        kind: 'accion', label: 'bufa', emoji: '💨',
        visual_prompt: 'Cara infantil de perfil bufant amb els llavis rodons, sense fons, contorn gruixut.',
        tts_string: 'Per inflar el globus, es bufa. Digues: bufa.',
        stt_expected_array: ['bufa', 'ufa', 'pufa', 'buf', 'bufá'],
        parent_tpr_action: 'Bufeu tots dos ben fort tres vegades abans de dir la paraula.',
      },
      {
        kind: 'cualidad', label: 'rodó', emoji: '🎈',
        visual_prompt: 'Globus perfectament esfèric vist de front, sense fons, contorn gruixut.',
        tts_string: 'El globus inflat és ben rodó. Digues: rodó.',
        stt_expected_array: ['rodó', 'rodo', 'odó', 'lodó', 'redó'],
        parent_tpr_action: 'Dibuixeu un cercle a l\'aire amb el dit tots dos alhora dient la paraula.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 4. Càpsules de contrast (ES-13: l'objecte que anomena l'àudio ha d'aparèixer
// al muntatge físic que es demana a l'adult).
// ---------------------------------------------------------------------------
export const CONTRAST_CAPSULES_CA: ContrastCapsule[] = [
  {
    id: 'ca-cap-gran-petit', code: 'CT-1', kind: 'adjetivos',
    pair: ['gran', 'petit'], icon: '🧸',
    physical_setup: 'Prepara dos ossets de peluix iguals però de mida diferent: un de clarament GRAN i un altre de clarament PETIT. Posa\'ls junts davant de l\'infant.',
    rounds: [
      {
        label: 'gran', emoji: '🧸', pictogram: 'osito-grande',
        tts_trigger: 'Quin és l\'osset GRAN? Dona-me\'l i digues-ho! Digues: gran.',
        stt_expected_array: ['gran', 'gan', 'ran', 'glan', 'grá'],
        parent_action: 'L\'infant t\'entrega l\'osset gran; abraceu-lo exagerant com és d\'enorme.',
      },
      {
        label: 'petit', emoji: '🧸', pictogram: 'osito-pequeno',
        tts_trigger: 'Ara al revés: quin és l\'osset PETIT? Dona-me\'l i digues-ho! Digues: petit.',
        stt_expected_array: ['petit', 'peti', 'etit', 'petí', 'pequit'],
        parent_action: 'L\'infant et dona l\'osset petit; amagueu-lo dins d\'una mà i digueu «petit» amb veu mini.',
      },
    ],
  },
  {
    id: 'ca-cap-net-brut', code: 'CT-2', kind: 'adjetivos',
    pair: ['net', 'brut'], icon: '🥄',
    physical_setup: 'Agafa dues culleres iguals: renta\'n una fins a deixar-la brillant i embruta l\'altra amb una mica de menjar o de fang. Posa-les l\'una al costat de l\'altra.',
    rounds: [
      {
        label: 'brut', emoji: '🥄', pictogram: 'cuchara-sucia',
        tts_trigger: 'Assenyala la cullera BRUTA. Com està, aquesta? Digues-ho. Digues: brut.',
        stt_expected_array: ['brut', 'but', 'rut', 'blut', 'brú'],
        parent_action: 'L\'infant assenyala la cullera bruta i tots dos feu cara de «puaj!» apartant-la.',
      },
      {
        label: 'net', emoji: '🥄', pictogram: 'cuchara-limpia',
        tts_trigger: 'I aquesta altra cullera, com està? Mira com brilla! Digues: net.',
        stt_expected_array: ['net', 'ne', 'nen', 'net', 'nè'],
        parent_action: 'Assenyaleu la cullera neta, bufeu-hi a sobre com si brillés i xoqueu les mans.',
      },
    ],
  },
  {
    id: 'ca-cap-obrir-tancar', code: 'CT-3', kind: 'verbos',
    pair: ['obrir', 'tancar'], icon: '📦',
    physical_setup: 'Posa davant de l\'infant una capsa amb tapa i fica-hi a dins, a la vista, la seva joguina preferida. Tanca la tapa.',
    rounds: [
      {
        label: 'obrir', emoji: '📦', pictogram: 'caja-abierta',
        tts_trigger: 'La joguina és dins de la capsa. Què fem per treure-la? Digues: obrir.',
        stt_expected_array: ['obrir', 'obre', 'obi', 'oir', 'obrí'],
        parent_action: 'Obriu la capsa junts, ben a poc a poc, i celebreu la troballa amb un «tatxan!».',
      },
      {
        label: 'tancar', emoji: '📦', pictogram: 'caja-cerrada',
        tts_trigger: 'Guardem la joguina a la capsa. Què fem amb la tapa? Digues: tancar.',
        stt_expected_array: ['tancar', 'tanca', 'ancar', 'tantar', 'tancá'],
        parent_action: 'L\'infant empeny la tapa fins a tancar-la del tot mentre diu la paraula.',
      },
    ],
  },
  {
    id: 'ca-cap-pujar-baixar', code: 'CT-4', kind: 'verbos',
    pair: ['pujar', 'baixar'], icon: '🚗',
    physical_setup: 'Fes una rampa recolzant un llibre gran inclinat i col·loca un cotxe de joguina al peu de la rampa.',
    rounds: [
      {
        label: 'pujar', emoji: '⬆️', pictogram: 'coche-subiendo',
        tts_trigger: 'El cotxe va a la muntanya. Què fa? Va cap amunt! Digues: pujar.',
        stt_expected_array: ['pujar', 'puja', 'ujar', 'putar', 'pujá'],
        parent_action: 'Pugeu el cotxe per la rampa ben a poc a poc mentre sona la paraula.',
      },
      {
        label: 'baixar', emoji: '⬇️', pictogram: 'coche-bajando',
        tts_trigger: 'Ara el cotxe va cap avall! Què fa? Digues: baixar.',
        stt_expected_array: ['baixar', 'baixa', 'aixar', 'basar', 'baixá'],
        parent_action: 'Deixeu anar el cotxe perquè baixi sol per la rampa; digueu «baixaaa!» mentre cau.',
      },
    ],
  },
  {
    id: 'ca-cap-fred-calent', code: 'CT-5', kind: 'adjetivos',
    pair: ['fred', 'calent'], icon: '🥤',
    physical_setup: 'Prepara dos gots: un amb aigua ben freda (amb gel si en tens) i un altre amb aigua tèbia. Posa\'ls davant de l\'infant.',
    rounds: [
      {
        label: 'fred', emoji: '🥤', pictogram: 'vaso-frio',
        tts_trigger: 'Toca els gots. Quin està FRED? Brrr! Digues: fred.',
        stt_expected_array: ['fred', 'fre', 'ed', 'pred', 'fré'],
        parent_action: 'L\'infant toca el got fred; tremoleu junts fent «brrr!» i arronsant les espatlles.',
      },
      {
        label: 'calent', emoji: '🥤', pictogram: 'vaso-caliente',
        tts_trigger: 'I aquest altre got, com està? Digues: calent.',
        stt_expected_array: ['calent', 'calen', 'alent', 'talent', 'caent'],
        parent_action: 'Toqueu el got tebi i venteu-vos la mà com si cremés, exagerant molt.',
      },
    ],
  },
  {
    id: 'ca-cap-encendre-apagar', code: 'CT-6', kind: 'verbos',
    pair: ['encendre', 'apagar'], icon: '💡',
    physical_setup: 'Col·loca\'t amb l\'infant al costat de l\'interruptor del llum (o agafa una llanterna). L\'habitació comença amb el llum apagat.',
    rounds: [
      {
        label: 'encendre', emoji: '💡', pictogram: 'bombilla-encendida',
        tts_trigger: 'Està fosc… Què fem amb el llum de l\'interruptor? Digues: encendre.',
        stt_expected_array: ['encendre', 'encend', 'cendre', 'endre', 'encendé'],
        parent_action: 'L\'infant prem l\'interruptor just quan ho diu i celebreu el llum amb un «ooooh!».',
      },
      {
        label: 'apagar', emoji: '💡', pictogram: 'bombilla-apagada',
        tts_trigger: 'Ara al revés. Què fem amb el llum de l\'interruptor? Digues: apagar.',
        stt_expected_array: ['apagar', 'apaga', 'paga', 'agar', 'apagá'],
        parent_action: 'L\'infant apaga el llum i us dieu «bona nit» amb veu de xiuxiueig.',
      },
    ],
  },
  {
    id: 'ca-cap-ple-buit', code: 'CT-7', kind: 'adjetivos',
    pair: ['ple', 'buit'], icon: '🧺',
    physical_setup: 'Prepara dues cistelles o capses iguals: omple\'n una fins dalt de joguines o mitjons i deixa l\'altra completament buida. Posa-les davant de l\'infant.',
    rounds: [
      {
        label: 'ple', emoji: '🧺', pictogram: 'cesta-llena',
        tts_trigger: 'Quina és la cistella PLENA de coses? Assenyala-la i digues-ho! Digues: ple.',
        stt_expected_array: ['ple', 'pe', 'le', 'ble', 'plé'],
        parent_action: 'L\'infant assenyala la cistella plena; aixequeu-la junts exagerant com pesa: «uf, plenaaa!».',
      },
      {
        label: 'buit', emoji: '🧺', pictogram: 'cesta-vacia',
        tts_trigger: 'I aquesta altra cistella, com està? Mira a dins! Digues: buit.',
        stt_expected_array: ['buit', 'bui', 'uit', 'puit', 'buí'],
        parent_action: 'Poseu la cistella buida cap per avall sobre el cap de l\'infant com un barret: no cau res, està buida!',
      },
    ],
  },
  {
    id: 'ca-cap-ficar-treure', code: 'CT-8', kind: 'verbos',
    pair: ['ficar', 'treure'], icon: '📥',
    physical_setup: 'Agafa una capsa oberta i tres joguines petites. Col·loca les joguines FORA de la capsa, davant de l\'infant.',
    rounds: [
      {
        label: 'ficar', emoji: '📥', pictogram: 'juguete-dentro',
        tts_trigger: 'Les joguines van a casa seva, dins de la capsa. Què fem? Digues: ficar.',
        stt_expected_array: ['ficar', 'fica', 'icar', 'pitar', 'ficá'],
        parent_action: 'L\'infant fica una joguina a la capsa a cada paraula; celebreu l\'última amb un «totes a dins!».',
      },
      {
        label: 'treure', emoji: '📤', pictogram: 'juguete-fuera',
        tts_trigger: 'Ara al revés. Què fem amb les joguines de la capsa? Digues: treure.',
        stt_expected_array: ['treure', 'treu', 'eure', 'teure', 'treué'],
        parent_action: 'L\'infant treu les joguines una a una; compteu-les en fila en sortir: «una, dues i tres a fora!».',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Textos fixos de la pantalla (reintent i tancament) en català. Van aquí, al
// costat del banc, perquè la locució resolgui l'asset neuronal català i no
// caigui al castellà — el «salt» de veu que es va detectar en gallec.
// ---------------------------------------------------------------------------
export const SEM_RETRY_CA = (label: string): string => `Una altra vegada! Digues: ${label}.`;
export const SEM_SESSION_DONE_CA = 'Sessió completada! Xoca aquesta mà!';
