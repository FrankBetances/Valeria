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
// Mòdul PUR (enumerable en build-time): només importa tipus del banc base.
//
// ESTAT: ✅ APROVAT PER A PRODUCCIÓ (29/8/2026). Validat per **Maria**,
// logopeda i parlant nativa de Barcelona, que cobreix els DOS eixos alhora
// —cosa que als altres bancs va caldre demanar per separat—: català central
// normatiu (lèxic, registre, ortografia) i criteri logopèdic (els contrastos,
// les progressions i l'escala EPT-3).
//
// La seva validació sosté, a més, la decisió que més es podia discutir del
// banc de parells: deixar /b/–/v/ FORA perquè el català central és betacista.
// Això no era comprovable des de la fonologia de manual; calia una parlant de
// Barcelona que a més sàpiga què s'hi puntua. També confirma que els dotze
// parells són paraules que una criatura de 3 a 6 anys d'allà reconeix.
// ============================================================================
import {
  DailyScenario, LexicalCategory, ProgressionSequence, ContrastCapsule,
} from './valeriaSemanticExpansion';

// ---------------------------------------------------------------------------
// 1. Escenaris de la vida diària (2 substantius, 2 verbs, 1 adjectiu, 1 onom.)
// ---------------------------------------------------------------------------
export const DAILY_SCENARIOS_CA: DailyScenario[] = [
  {
    id: 'mati', title: 'Rutina del matí', icon: '☀️', subtitle: 'Despertar-se, rentar-se, vestir-se i esmorzar',
    items: [
      {
        id: 'mati-despertar', type: 'verbo', label: 'despertar', emoji: '⏰', pictogram: 'despertador',
        visual_prompt: 'Despertador clásico con dos campanas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primer ens despertem. Digues: despertar.',
        stt_expected_array: ['despertar', 'desperta', 'pertar', 'espertar', 'despertá'],
        parent_tpr_action: 'Tapa\'t com si dormissis i estira\'t amb l\'infant quan soni el «ring, ring».',
      },
      {
        id: 'mati-rentar', type: 'verbo', label: 'rentar', emoji: '🧼', pictogram: 'jabon',
        visual_prompt: 'Pastilla de jabón con burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Després ens rentem. Digues: rentar.',
        stt_expected_array: ['rentar', 'renta', 'entar', 'rentá', 'tentar'],
        parent_tpr_action: 'Fregueu-vos les mans junts com si us ensabonéssiu.',
      },
      {
        id: 'mati-vestir', type: 'verbo', label: 'vestir', emoji: '👕', pictogram: 'vestir',
        visual_prompt: 'Camiseta infantil de frente, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Llavors ens vestim. Digues: vestir.',
        stt_expected_array: ['vestir', 'vesti', 'estir', 'bestir', 'vestí'],
        parent_tpr_action: 'Passa una samarreta pel cap de l\'infant i celebreu-ho quan surti.',
      },
      {
        id: 'mati-esmorzar', type: 'verbo', label: 'esmorzar', emoji: '🥛', pictogram: 'vaso-leche',
        visual_prompt: 'Vaso de leche lleno, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Al final esmorzem. Digues: esmorzar.',
        stt_expected_array: ['esmorzar', 'esmorza', 'morzar', 'esmozar', 'esmorzá'],
        parent_tpr_action: 'Feu veure junts que beveu un got de llet amb les dues mans.',
      },
    ],
  },
  {
    id: 'menjar', title: 'Hora de menjar', icon: '🍽️', subtitle: 'Rentar-se, seure, menjar i recollir',
    items: [
      {
        id: 'menjar-rentar', type: 'verbo', label: 'rentar', emoji: '🧼', pictogram: 'jabon',
        visual_prompt: 'Pastilla de jabón con burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primer ens rentem les mans. Digues: rentar.',
        stt_expected_array: ['rentar', 'renta', 'entar', 'rentá', 'tentar'],
        parent_tpr_action: 'Fregueu-vos les mans junts com si us ensabonéssiu.',
      },
      {
        id: 'menjar-seure', type: 'verbo', label: 'seure', emoji: '🪑', pictogram: 'silla',
        visual_prompt: 'Silla de madera de frente, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Després seiem a taula. Digues: seure.',
        stt_expected_array: ['seure', 'seu', 'eure', 'sure', 'seuré'],
        parent_tpr_action: 'Seieu junts en dues cadires, l\'un davant de l\'altre.',
      },
      {
        id: 'menjar-menjar', type: 'verbo', label: 'menjar', emoji: '🥄', pictogram: 'comer',
        visual_prompt: 'Niño comiendo con cuchara, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Llavors mengem. Digues: menjar.',
        stt_expected_array: ['menjar', 'menja', 'enjar', 'menjá', 'menyar'],
        parent_tpr_action: 'Porteu junts una cullera imaginària a la boca.',
      },
      {
        id: 'menjar-recollir', type: 'verbo', label: 'recollir', emoji: '🍽️', pictogram: 'plato',
        visual_prompt: 'Plato vacío con tenedor y cuchara, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Al final recollim el plat. Digues: recollir.',
        stt_expected_array: ['recollir', 'recull', 'collir', 'recolli', 'ecollir'],
        parent_tpr_action: 'Porteu junts un plat (de veritat o imaginari) fins a la cuina.',
      },
    ],
  },
  {
    id: 'parc', title: 'Al parc', icon: '🌳', subtitle: 'Sabates, parc, tobogan i cap a casa',
    items: [
      {
        id: 'parc-sabates', type: 'sustantivo', label: 'sabates', emoji: '👟', pictogram: 'zapato',
        visual_prompt: 'Zapato infantil de perfil, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primer ens posem les sabates. Digues: sabates.',
        stt_expected_array: ['sabates', 'sabata', 'abates', 'sapates', 'bates'],
        parent_tpr_action: 'Assenyaleu les sabates de l\'infant i toqueu-les junts.',
      },
      {
        id: 'parc-parc', type: 'sustantivo', label: 'parc', emoji: '🌳', pictogram: 'arbol',
        visual_prompt: 'Árbol frondoso, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Després anem al parc. Digues: parc.',
        stt_expected_array: ['parc', 'par', 'pac', 'parque', 'arc'],
        parent_tpr_action: 'Camineu junts uns passos per l\'habitació cap «al parc».',
      },
      {
        id: 'parc-tobogan', type: 'sustantivo', label: 'tobogan', emoji: '🛝', pictogram: 'tobogan',
        visual_prompt: 'Tobogán infantil de perfil, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Llavors baixem pel tobogan. Digues: tobogan.',
        stt_expected_array: ['tobogan', 'tobogán', 'bogan', 'obogan', 'togan'],
        parent_tpr_action: 'Feu junts el gest de lliscar amb els braços enlaire.',
      },
      {
        id: 'parc-casa', type: 'sustantivo', label: 'casa', emoji: '🏠', pictogram: 'casa',
        visual_prompt: 'Casa sencilla con tejado y puerta, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Al final tornem a casa. Digues: casa.',
        stt_expected_array: ['casa', 'asa', 'caça', 'cada', 'tasa'],
        parent_tpr_action: 'Ajunteu les mans sobre el cap fent una teulada.',
      },
    ],
  },
  {
    id: 'bany', title: 'Hora del bany', icon: '🛁', subtitle: 'Banyera, sabó, aigua i tovallola',
    items: [
      {
        id: 'bany-banyera', type: 'sustantivo', label: 'banyera', emoji: '🛁', pictogram: 'banera',
        visual_prompt: 'Bañera con patas y agua, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primer entrem a la banyera. Digues: banyera.',
        stt_expected_array: ['banyera', 'banera', 'anyera', 'bañera', 'banyea'],
        parent_tpr_action: 'Aixequeu junts una cama com si entréssiu a la banyera.',
      },
      {
        id: 'bany-sabo', type: 'sustantivo', label: 'sabó', emoji: '🧽', pictogram: 'esponja',
        visual_prompt: 'Esponja amarilla con espuma, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Després ens ensabonem. Digues: sabó.',
        stt_expected_array: ['sabó', 'sabo', 'abó', 'sapó', 'jabón'],
        parent_tpr_action: 'Fregueu els braços de l\'infant amb una esponja imaginària.',
      },
      {
        id: 'bany-aigua', type: 'sustantivo', label: 'aigua', emoji: '💧', pictogram: 'gota',
        visual_prompt: 'Gota de agua azul, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Llavors ens esbandim amb aigua. Digues: aigua.',
        stt_expected_array: ['aigua', 'aiga', 'igua', 'agua', 'aiwa'],
        parent_tpr_action: 'Deixeu caure els dits sobre el cap de l\'infant com si fossin gotes.',
      },
      {
        id: 'bany-tovallola', type: 'sustantivo', label: 'tovallola', emoji: '🧺', pictogram: 'toalla',
        visual_prompt: 'Toalla doblada, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Al final ens eixuguem amb la tovallola. Digues: tovallola.',
        stt_expected_array: ['tovallola', 'tovalla', 'vallola', 'tovayola', 'tovallo'],
        parent_tpr_action: 'Emboliqueu l\'infant amb una tovallola (o amb els teus braços) i eixugueu-lo.',
      },
    ],
  },
  {
    id: 'nit', title: 'A dormir', icon: '🌙', subtitle: 'Pijama, dents, conte i a dormir',
    items: [
      {
        id: 'nit-pijama', type: 'sustantivo', label: 'pijama', emoji: '👕', pictogram: 'pijama',
        visual_prompt: 'Pijama infantil de dos piezas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primer ens posem el pijama. Digues: pijama.',
        stt_expected_array: ['pijama', 'pixama', 'ijama', 'piyama', 'pijam'],
        parent_tpr_action: 'Assenyaleu el pijama de l\'infant i toqueu els botons junts.',
      },
      {
        id: 'nit-dents', type: 'sustantivo', label: 'dents', emoji: '🪥', pictogram: 'cepillo',
        visual_prompt: 'Cepillo de dientes con pasta, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Després ens rentem les dents. Digues: dents.',
        stt_expected_array: ['dents', 'dent', 'ents', 'dens', 'tents'],
        parent_tpr_action: 'Feu junts el gest de rentar-vos les dents.',
      },
      {
        id: 'nit-conte', type: 'sustantivo', label: 'conte', emoji: '📖', pictogram: 'libro',
        visual_prompt: 'Libro de cuentos abierto, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Llavors llegim un conte. Digues: conte.',
        stt_expected_array: ['conte', 'onte', 'cote', 'tonte', 'conta'],
        parent_tpr_action: 'Obriu les mans com un llibre i passeu una pàgina junts.',
      },
      {
        id: 'nit-dormir', type: 'verbo', label: 'dormir', emoji: '😴', pictogram: 'dormir',
        visual_prompt: 'Niño dormido en la almohada, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Al final anem a dormir. Digues: dormir.',
        stt_expected_array: ['dormir', 'dormí', 'ormir', 'domir', 'dorm'],
        parent_tpr_action: 'Recolzeu el cap a les mans juntes i tanqueu els ulls.',
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

// ES-07 · Rutinas ordenables (ACOPROS, 3.ª ronda): consigna del paso de
// ordenar (la locuta la app al niño) y repaso que hace el adulto al acabar.
export const SEM_ORDER_CA = {
  prompt: 'Ordenem la rutina. Què fem primer?',
  action: 'Repasseu junts la rutina en veu alta assenyalant cada dibuix: primer, després, llavors i al final.',
};
