// ============================================================================
// Valeria+ · Expansión Semántica en EUSKERA batua — plan ILENIA/NEL-GAITU
// Versión vasca de los tres bloques de expansión léxica (escenarios de vida
// diaria, progresiones onomatopeya→adjetivo y cápsulas de contraste). Mismas
// interfaces que el banco base (valeriaSemanticExpansion); el contenido NO se
// traduce literalmente: se REDISEÑA para el léxico y las aproximaciones
// fonéticas del euskera infantil (`stt_expected_array`).
//
// ESTADO: ✅ APROBADO PARA PRODUCCIÓN (revisión logopédica de Ulertuz y de
// euskera normativo/batua cumplida). Se locuta con la voz neuronal HiTZ-TTS
// (enumerado en el corpus). Módulo PURO (enumerable en build-time).
// ============================================================================
import {
  DailyScenario, LexicalCategory, ProgressionSequence, ContrastCapsule,
} from './valeriaSemanticExpansion';

// ---------------------------------------------------------------------------
// 1. Escenarios de la vida diaria (2 sustantivos, 2 verbos, 1 adjetivo, 1 onom.)
// ---------------------------------------------------------------------------
export const DAILY_SCENARIOS_EU: DailyScenario[] = [
  {
    id: 'goiza', title: 'Goizeko errutina', icon: '☀️', subtitle: 'Esnatu, garbitu, jantzi eta gosaldu',
    items: [
      {
        id: 'goiza-esnatu', type: 'verbo', label: 'esnatu', emoji: '⏰', pictogram: 'despertador',
        visual_prompt: 'Despertador clásico con dos campanas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Lehenik esnatu egiten gara. Esan: esnatu.',
        stt_expected_array: ['esnatu', 'esnatzen', 'snatu', 'esnau', 'esnatu da'],
        parent_tpr_action: 'Estali zaitez lotan bazeunde bezala eta luzatu haurrarekin «rin, rin» entzutean.',
      },
      {
        id: 'goiza-garbitu', type: 'verbo', label: 'garbitu', emoji: '🧼', pictogram: 'jabon',
        visual_prompt: 'Pastilla de jabón con burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Gero garbitu egiten gara. Esan: garbitu.',
        stt_expected_array: ['garbitu', 'garbi', 'arbitu', 'garbitzen', 'galbitu'],
        parent_tpr_action: 'Igurtzi eskuak elkarrekin xaboia emango bazenute bezala.',
      },
      {
        id: 'goiza-jantzi', type: 'verbo', label: 'jantzi', emoji: '👕', pictogram: 'vestir',
        visual_prompt: 'Camiseta infantil de frente, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Ondoren janzten gara. Esan: jantzi.',
        stt_expected_array: ['jantzi', 'jantzia', 'antzi', 'janzi', 'jantsi'],
        parent_tpr_action: 'Sartu kamiseta bat haurraren burutik eta ospatu agertzean.',
      },
      {
        id: 'goiza-gosaldu', type: 'verbo', label: 'gosaldu', emoji: '🥛', pictogram: 'vaso-leche',
        visual_prompt: 'Vaso de leche lleno, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Azkenik gosaltzen dugu. Esan: gosaldu.',
        stt_expected_array: ['gosaldu', 'gosari', 'osaldu', 'gosaltzen', 'gosadu'],
        parent_tpr_action: 'Egin kontu esne-baso bat edaten duzuela bi eskuekin.',
      },
    ],
  },
  {
    id: 'jatordua', title: 'Jateko ordua', icon: '🍽️', subtitle: 'Garbitu, eseri, jan eta jaso',
    items: [
      {
        id: 'jatordua-garbitu', type: 'verbo', label: 'garbitu', emoji: '🧼', pictogram: 'jabon',
        visual_prompt: 'Pastilla de jabón con burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Lehenik eskuak garbitzen ditugu. Esan: garbitu.',
        stt_expected_array: ['garbitu', 'garbi', 'arbitu', 'garbitzen', 'galbitu'],
        parent_tpr_action: 'Igurtzi eskuak elkarrekin xaboia emango bazenute bezala.',
      },
      {
        id: 'jatordua-eseri', type: 'verbo', label: 'eseri', emoji: '🪑', pictogram: 'silla',
        visual_prompt: 'Silla de madera de frente, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Gero mahaian esertzen gara. Esan: eseri.',
        stt_expected_array: ['eseri', 'eseri da', 'seri', 'eserri', 'esertzen'],
        parent_tpr_action: 'Eseri elkarrekin bi aulkitan, bata bestearen aurrean.',
      },
      {
        id: 'jatordua-jan', type: 'verbo', label: 'jan', emoji: '🥄', pictogram: 'comer',
        visual_prompt: 'Niño comiendo con cuchara, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Ondoren otordua hasten dugu. Esan: jan.',
        stt_expected_array: ['jan', 'jaten', 'an', 'jana', 'yan'],
        parent_tpr_action: 'Eraman elkarrekin koilara irudikatu bat ahora.',
      },
      {
        id: 'jatordua-jaso', type: 'verbo', label: 'jaso', emoji: '🍽️', pictogram: 'plato',
        visual_prompt: 'Plato vacío con tenedor y cuchara, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Azkenik platera jasotzen dugu. Esan: jaso.',
        stt_expected_array: ['jaso', 'jasotzen', 'aso', 'jasu', 'haso'],
        parent_tpr_action: 'Eraman elkarrekin plater bat (benetakoa edo irudikatua) sukaldera.',
      },
    ],
  },
  {
    id: 'parkea', title: 'Parkean', icon: '🌳', subtitle: 'Zapatak, parkea, txirrista eta etxera',
    items: [
      {
        id: 'parkea-zapatak', type: 'sustantivo', label: 'zapatak', emoji: '👟', pictogram: 'zapato',
        visual_prompt: 'Zapato infantil de perfil, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Lehenik zapatak janzten ditugu. Esan: zapatak.',
        stt_expected_array: ['zapatak', 'zapata', 'apatak', 'sapatak', 'zapatok'],
        parent_tpr_action: 'Seinalatu haurraren zapatak eta ukitu elkarrekin.',
      },
      {
        id: 'parkea-parkea', type: 'sustantivo', label: 'parkea', emoji: '🌳', pictogram: 'arbol',
        visual_prompt: 'Árbol frondoso, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Gero parkera goaz. Esan: parkea.',
        stt_expected_array: ['parkea', 'parke', 'arkea', 'parkia', 'pakea'],
        parent_tpr_action: 'Ibili elkarrekin pauso batzuk gelan zehar «parkerantz».',
      },
      {
        id: 'parkea-txirrista', type: 'sustantivo', label: 'txirrista', emoji: '🛝', pictogram: 'tobogan',
        visual_prompt: 'Tobogán infantil de perfil, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Ondoren txirristatik jaisten gara. Esan: txirrista.',
        stt_expected_array: ['txirrista', 'txirristа', 'irrista', 'tirrista', 'txirista'],
        parent_tpr_action: 'Egin elkarrekin irristatzeko keinua besoak gora.',
      },
      {
        id: 'parkea-etxea', type: 'sustantivo', label: 'etxea', emoji: '🏠', pictogram: 'casa',
        visual_prompt: 'Casa sencilla con tejado y puerta, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Azkenik etxera itzultzen gara. Esan: etxea.',
        stt_expected_array: ['etxea', 'etxe', 'txea', 'etsea', 'etxia'],
        parent_tpr_action: 'Elkartu eskuak buru gainean teilatu bat eginez.',
      },
    ],
  },
  {
    id: 'bainua', title: 'Bainuaren ordua', icon: '🛁', subtitle: 'Bainuontzia, xaboia, ura eta eskuoihala',
    items: [
      {
        id: 'bainua-bainuontzia', type: 'sustantivo', label: 'bainuontzia', emoji: '🛁', pictogram: 'banera',
        visual_prompt: 'Bañera con patas y agua, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Lehenik bainuontzian sartzen gara. Esan: bainuontzia.',
        stt_expected_array: ['bainuontzia', 'bainuontzi', 'ainuontzia', 'bainontzia', 'bainua'],
        parent_tpr_action: 'Altxatu elkarrekin hanka bat bainuontzian sartuko bazinete bezala.',
      },
      {
        id: 'bainua-xaboia', type: 'sustantivo', label: 'xaboia', emoji: '🧽', pictogram: 'esponja',
        visual_prompt: 'Esponja amarilla con espuma, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Gero xaboia ematen dugu. Esan: xaboia.',
        stt_expected_array: ['xaboia', 'xabo', 'aboia', 'saboia', 'xaboi'],
        parent_tpr_action: 'Igurtzi haurraren besoak belaki irudikatu batekin.',
      },
      {
        id: 'bainua-ura', type: 'sustantivo', label: 'ura', emoji: '💧', pictogram: 'gota',
        visual_prompt: 'Gota de agua azul, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Ondoren urarekin garbitzen gara. Esan: ura.',
        stt_expected_array: ['ura', 'ur', 'ula', 'uda', 'hura'],
        parent_tpr_action: 'Utzi hatzak haurraren buru gainera erortzen tantak bezala.',
      },
      {
        id: 'bainua-eskuoihala', type: 'sustantivo', label: 'eskuoihala', emoji: '🧺', pictogram: 'toalla',
        visual_prompt: 'Toalla doblada, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Azkenik eskuoihalarekin lehortzen gara. Esan: eskuoihala.',
        stt_expected_array: ['eskuoihala', 'eskuoihal', 'kuoihala', 'eskoihala', 'oihala'],
        parent_tpr_action: 'Bildu haurra eskuoihal batean (edo zure besoetan) eta lehortu.',
      },
    ],
  },
  {
    id: 'gaua', title: 'Lotara', icon: '🌙', subtitle: 'Pijama, hortzak, ipuina eta lotara',
    items: [
      {
        id: 'gaua-pijama', type: 'sustantivo', label: 'pijama', emoji: '👕', pictogram: 'pijama',
        visual_prompt: 'Pijama infantil de dos piezas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Lehenik pijama janzten dugu. Esan: pijama.',
        stt_expected_array: ['pijama', 'pixama', 'ijama', 'piyama', 'pijam'],
        parent_tpr_action: 'Seinalatu haurraren pijama eta ukitu botoiak elkarrekin.',
      },
      {
        id: 'gaua-hortzak', type: 'sustantivo', label: 'hortzak', emoji: '🪥', pictogram: 'cepillo',
        visual_prompt: 'Cepillo de dientes con pasta, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Gero hortzak garbitzen ditugu. Esan: hortzak.',
        stt_expected_array: ['hortzak', 'hortz', 'ortzak', 'hotzak', 'hortzek'],
        parent_tpr_action: 'Egin elkarrekin hortzak eskuilatzeko keinua.',
      },
      {
        id: 'gaua-ipuina', type: 'sustantivo', label: 'ipuina', emoji: '📖', pictogram: 'libro',
        visual_prompt: 'Libro de cuentos abierto, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Ondoren ipuin bat irakurtzen dugu. Esan: ipuina.',
        stt_expected_array: ['ipuina', 'ipuin', 'puina', 'ipuia', 'ipuna'],
        parent_tpr_action: 'Ireki eskuak liburu bat bezala eta pasa orri bat elkarrekin.',
      },
      {
        id: 'gaua-lotara', type: 'sustantivo', label: 'lotara', emoji: '😴', pictogram: 'dormir',
        visual_prompt: 'Niño dormido en la almohada, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Azkenik ohera goaz. Esan: lotara.',
        stt_expected_array: ['lotara', 'lo', 'otara', 'lotala', 'lotaa'],
        parent_tpr_action: 'Jarri burua eskuen gainean eta itxi begiak.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// KATEGORIA LEXIKOAK · Categorías léxicas en euskera (DC-1 opción C · ES-08)
//
// ⚠️ ESTADO: BORRADOR · PENDIENTE DE VALIDACIÓN POR HABLANTE NATIVO.
// El resto de este banco lo validaron hablantes de euskera en julio de 2026,
// pero ESTE bloque es posterior a esa revisión: son cadenas nuevas que nadie ha
// leído todavía. Requieren la misma validación que el resto antes de publicar,
// con dos focos: la forma absolutiva definida de cada palabra y, sobre todo,
// las aproximaciones de `stt_expected_array`, que codifican cómo suena la
// palabra en boca de un niño vasco de tres o cuatro años — eso no se deduce
// del castellano.
//
// La progresión de dificultad se calibra con la misma lógica de familiaridad
// que fijó ACOPROS, no con la complejidad articulatoria.
// ---------------------------------------------------------------------------
export const LEXICAL_CATEGORIES_EU: LexicalCategory[] = [
  {
    id: 'eu-cat-fruta', title: 'Frutak', icon: '🍎',
    subtitle: 'Egunerokotik noizean behin ikusten denera',
    items: [
      {
        id: 'eu-cat-fruta-sagarra', type: 'sustantivo', label: 'sagarra', emoji: '🍎', difficulty: 1,
        visual_prompt: 'Sagar gorria aurretik hosto berdearekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau sagarra da. Esan: sagarra.',
        stt_expected_array: ['sagarra', 'sagara', 'agarra', 'sagar', 'tagarra'],
        parent_tpr_action: 'Eman haginkada bat sagar bati eta imitatu biek karraska: ñau!',
      },
      {
        id: 'eu-cat-fruta-platanoa', type: 'sustantivo', label: 'platanoa', emoji: '🍌', difficulty: 1,
        visual_prompt: 'Platano horia okertuta alboetatik ikusita, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau platanoa da. Esan: platanoa.',
        stt_expected_array: ['platanoa', 'platano', 'patanoa', 'tanoa', 'palatanoa'],
        parent_tpr_action: 'Zuritu platano bat elkarrekin, tira bakoitza poliki jaitsiz hitza esaten duzuen bitartean.',
      },
      {
        id: 'eu-cat-fruta-laranja', type: 'sustantivo', label: 'laranja', emoji: '🍊', difficulty: 1,
        visual_prompt: 'Laranja osoa aurretik hostoarekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau laranja da. Esan: laranja.',
        stt_expected_array: ['laranja', 'laanja', 'aranja', 'lanja', 'laranha'],
        parent_tpr_action: 'Bota laranja bat mahai gainean batetik bestera, pase bakoitzean izendatuz.',
      },
      {
        id: 'eu-cat-fruta-udarea', type: 'sustantivo', label: 'udarea', emoji: '🍐', difficulty: 2,
        visual_prompt: 'Udare berdea alboetatik kirtenarekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau udarea da. Esan: udarea.',
        stt_expected_array: ['udarea', 'udare', 'uarea', 'darea', 'udalea'],
        parent_tpr_action: 'Marraztu udarearen silueta airean hatzarekin: zabala behean, estua goian.',
      },
      {
        id: 'eu-cat-fruta-anana', type: 'sustantivo', label: 'anana', emoji: '🍍', difficulty: 3,
        visual_prompt: 'Anana osoa hosto-koroarekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau anana da. Esan: anana.',
        stt_expected_array: ['anana', 'anan', 'nana', 'ananas', 'aana'],
        parent_tpr_action: 'Jarri eskuak zabalik buru gainean ananaren koroa bezala eta esan hitza.',
      },
      {
        id: 'eu-cat-fruta-gerezia', type: 'sustantivo', label: 'gerezia', emoji: '🍒', difficulty: 3,
        visual_prompt: 'Bi gerezi gorri kirtenetik lotuta, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau gerezia da. Esan: gerezia.',
        stt_expected_array: ['gerezia', 'gerezi', 'erezia', 'geezia', 'keresia'],
        parent_tpr_action: 'Zintzilikatu bi gerezi belarritik belarritakoak bezala eta barre egin elkarrekin.',
      },
    ],
  },
  {
    id: 'eu-cat-animaliak', title: 'Animaliak', icon: '🐶',
    subtitle: 'Etxekoetatik zoologikoan bakarrik ikusten direnetara',
    items: [
      {
        id: 'eu-cat-animaliak-txakurra', type: 'sustantivo', label: 'txakurra', emoji: '🐶', difficulty: 1,
        visual_prompt: 'Txakur baten burua aurretik, belarriak eroriak, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau txakurra da. Esan: txakurra.',
        stt_expected_array: ['txakurra', 'takurra', 'txakur', 'akurra', 'txakua'],
        parent_tpr_action: 'Jarri lau hankatan eta eman hiru pauso elkarrekin zaunka eginez.',
      },
      {
        id: 'eu-cat-animaliak-katua', type: 'sustantivo', label: 'katua', emoji: '🐱', difficulty: 1,
        visual_prompt: 'Katu baten burua aurretik bibote markatuekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau katua da. Esan: katua.',
        stt_expected_array: ['katua', 'katu', 'atua', 'tatua', 'kaua'],
        parent_tpr_action: 'Luzatu katu bat esnatzean bezala eta igurtzi burua bestearen besoaren kontra.',
      },
      {
        id: 'eu-cat-animaliak-ahatea', type: 'sustantivo', label: 'ahatea', emoji: '🦆', difficulty: 2,
        visual_prompt: 'Ahatea alboetatik moko laranjarekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau ahatea da. Esan: ahatea.',
        stt_expected_array: ['ahatea', 'ahate', 'atea', 'aatea', 'ahatia'],
        parent_tpr_action: 'Ibili ilaran isatsa mugituz ahateak bezala ateraino.',
      },
      {
        id: 'eu-cat-animaliak-behia', type: 'sustantivo', label: 'behia', emoji: '🐄', difficulty: 2,
        visual_prompt: 'Behia alboetatik orbanekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau behia da. Esan: behia.',
        stt_expected_array: ['behia', 'beia', 'behi', 'bea', 'peia'],
        parent_tpr_action: 'Jarri bi hatz buruan adarrak bezala eta esan hitza elkarri begira.',
      },
      {
        id: 'eu-cat-animaliak-elefantea', type: 'sustantivo', label: 'elefantea', emoji: '🐘', difficulty: 3,
        visual_prompt: 'Elefantea alboetatik tronpa altxatuta, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau elefantea da. Esan: elefantea.',
        stt_expected_array: ['elefantea', 'elefante', 'efantea', 'lefantea', 'efatea'],
        parent_tpr_action: 'Egin tronpa besoa aurpegiaren aurrean zintzilik utzita eta kulunkatu esatean.',
      },
      {
        id: 'eu-cat-animaliak-jirafa', type: 'sustantivo', label: 'jirafa', emoji: '🦒', difficulty: 3,
        visual_prompt: 'Jirafa osorik lepo luzearekin eta orbanekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau jirafa da. Esan: jirafa.',
        stt_expected_array: ['jirafa', 'irafa', 'jifafa', 'girafa', 'jiafa'],
        parent_tpr_action: 'Luzatu lepoa eta besoak ahalik eta gorenera, hosto bat hartzeko bezala.',
      },
    ],
  },
  {
    id: 'eu-cat-garraioak', title: 'Garraioak', icon: '🚗',
    subtitle: 'Kalean pasatzen denetik ia inoiz ikusten ez denera',
    items: [
      {
        id: 'eu-cat-garraioak-kotxea', type: 'sustantivo', label: 'kotxea', emoji: '🚗', difficulty: 1,
        visual_prompt: 'Kotxea alboetatik, kolore lauak, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau kotxea da. Esan: kotxea.',
        stt_expected_array: ['kotxea', 'kotxe', 'otxea', 'kotea', 'totxea'],
        parent_tpr_action: 'Bultza jostailuzko kotxe bat lurretik haurraren oinarekin talka egin arte.',
      },
      {
        id: 'eu-cat-garraioak-motorra', type: 'sustantivo', label: 'motorra', emoji: '🏍️', difficulty: 1,
        visual_prompt: 'Motozikleta alboetatik, kolore lauak, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau motorra da. Esan: motorra.',
        stt_expected_array: ['motorra', 'motor', 'otorra', 'motoa', 'botorra'],
        parent_tpr_action: 'Heldu irudizko esku-lekuari eta azeleratu biek batera motor-hotsa eginez.',
      },
      {
        id: 'eu-cat-garraioak-trena', type: 'sustantivo', label: 'trena', emoji: '🚆', difficulty: 2,
        visual_prompt: 'Trena alboetatik bi bagoirekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau trena da. Esan: trena.',
        stt_expected_array: ['trena', 'tena', 'tren', 'telena', 'ena'],
        parent_tpr_action: 'Egin tren bat: haurra gerritik heltzen dizu eta bira bat ematen duzue gelan.',
      },
      {
        id: 'eu-cat-garraioak-itsasontzia', type: 'sustantivo', label: 'itsasontzia', emoji: '🚢', difficulty: 2,
        visual_prompt: 'Itsasontzia alboetatik ur-lerro baten gainean, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau itsasontzia da. Esan: itsasontzia.',
        stt_expected_array: ['itsasontzia', 'itsasontzi', 'sasontzia', 'itasontzia', 'itsaontzia'],
        parent_tpr_action: 'Eseri lurrean eta kulunkatu itsasontzia olatuekin igo eta jaitsiko balitz bezala.',
      },
      {
        id: 'eu-cat-garraioak-hegazkina', type: 'sustantivo', label: 'hegazkina', emoji: '✈️', difficulty: 3,
        visual_prompt: 'Hegazkina behetik ikusita hegalak zabalik, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau hegazkina da. Esan: hegazkina.',
        stt_expected_array: ['hegazkina', 'hegazkin', 'egazkina', 'egaskina', 'hegakina'],
        parent_tpr_action: 'Zabaldu besoak hegalak bezala eta eman bira bat gelan bihurguneetan okertuz.',
      },
      {
        id: 'eu-cat-garraioak-kamioia', type: 'sustantivo', label: 'kamioia', emoji: '🚚', difficulty: 3,
        visual_prompt: 'Kamioia alboetatik karga-kaxarekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau kamioia da. Esan: kamioia.',
        stt_expected_array: ['kamioia', 'kamioi', 'amioia', 'tamioia', 'kamioa'],
        parent_tpr_action: 'Kargatu hiru jostailu kaxa batean eta arrastatu elkarrekin atoia balitz bezala.',
      },
    ],
  },
  {
    id: 'eu-cat-koloreak', title: 'Koloreak', icon: '🎨',
    subtitle: 'Gorritik eta urdinetik izendatzen zailagoak direnetara',
    items: [
      {
        id: 'eu-cat-koloreak-gorria', type: 'adjetivo', label: 'gorria', emoji: '🔴', pictogram: 'color-rojo', difficulty: 1,
        visual_prompt: 'Zirkulu gorri betea ingerada lodiarekin, hondorik gabe, gradienterik gabe.',
        tts_string: 'Kolore hau gorria da. Esan: gorria.',
        stt_expected_array: ['gorria', 'goria', 'orria', 'gorri', 'koria'],
        parent_tpr_action: 'Bilatu elkarrekin hiru gauza gorri gelan eta ukitu kolorea izendatuz.',
      },
      {
        id: 'eu-cat-koloreak-urdina', type: 'adjetivo', label: 'urdina', emoji: '🔵', pictogram: 'color-azul', difficulty: 1,
        visual_prompt: 'Zirkulu urdin betea ingerada lodiarekin, hondorik gabe, gradienterik gabe.',
        tts_string: 'Kolore hau urdina da. Esan: urdina.',
        stt_expected_array: ['urdina', 'urdin', 'udina', ' udia', 'urina'],
        parent_tpr_action: 'Seinalatu zerua edo haurraren arropako zerbait urdina eta esan kolorea batera.',
      },
      {
        id: 'eu-cat-koloreak-horia', type: 'adjetivo', label: 'horia', emoji: '🟡', pictogram: 'color-amarillo', difficulty: 2,
        visual_prompt: 'Zirkulu hori betea ingerada lodiarekin, hondorik gabe, gradienterik gabe.',
        tts_string: 'Kolore hau horia da. Esan: horia.',
        stt_expected_array: ['horia', 'oria', 'hori', 'oia', 'horiya'],
        parent_tpr_action: 'Egin eguzki handi bat besoekin eta esan kolorea gorantz begira.',
      },
      {
        id: 'eu-cat-koloreak-berdea', type: 'adjetivo', label: 'berdea', emoji: '🟢', pictogram: 'color-verde', difficulty: 2,
        visual_prompt: 'Zirkulu berde betea ingerada lodiarekin, hondorik gabe, gradienterik gabe.',
        tts_string: 'Kolore hau berdea da. Esan: berdea.',
        stt_expected_array: ['berdea', 'berde', 'erdea', 'bedea', 'peldea'],
        parent_tpr_action: 'Atera hosto edo landare bat bilatzera eta ukitu kolorea esaten duzuen bitartean.',
      },
      {
        id: 'eu-cat-koloreak-morea', type: 'adjetivo', label: 'morea', emoji: '🟣', pictogram: 'color-morado', difficulty: 3,
        visual_prompt: 'Zirkulu more betea ingerada lodiarekin, hondorik gabe, gradienterik gabe.',
        tts_string: 'Kolore hau morea da. Esan: morea.',
        stt_expected_array: ['morea', 'more', 'orea', 'molea', 'boea'],
        parent_tpr_action: 'Nahastu haurraren aurrean gorri eta urdin apur bat eta izendatu ateratzen dena.',
      },
      {
        id: 'eu-cat-koloreak-marroia', type: 'adjetivo', label: 'marroia', emoji: '🟤', pictogram: 'color-marron', difficulty: 3,
        visual_prompt: 'Zirkulu marroi betea ingerada lodiarekin, hondorik gabe, gradienterik gabe.',
        tts_string: 'Kolore hau marroia da. Esan: marroia.',
        stt_expected_array: ['marroia', 'marroi', 'maroia', 'aroia', 'baroia'],
        parent_tpr_action: 'Ukitu elkarrekin egurrezko zerbait —mahai bat, aulki bat— eta esan kolorea ukitzean.',
      },
    ],
  },
  {
    id: 'eu-cat-gorputza', title: 'Gorputza', icon: '🖐️',
    subtitle: 'Bakarrik seinalatzen denetik bilatu behar denera',
    items: [
      {
        id: 'eu-cat-gorputza-eskua', type: 'sustantivo', label: 'eskua', emoji: '🖐️', pictogram: 'mano', difficulty: 1,
        visual_prompt: 'Esku irekia aurretik bost hatzak banatuta, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau eskua da. Esan: eskua.',
        stt_expected_array: ['eskua', 'esku', 'ekua', 'skua', 'ezkua'],
        parent_tpr_action: 'Jo eskuak hiru aldiz, silaba bakoitzeko bat, elkarri begietara begira.',
      },
      {
        id: 'eu-cat-gorputza-oina', type: 'sustantivo', label: 'oina', emoji: '🦶', pictogram: 'pie', difficulty: 1,
        visual_prompt: 'Oin biluzia alboetatik, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau oina da. Esan: oina.',
        stt_expected_array: ['oina', 'oin', 'ona', 'oña', 'oia'],
        parent_tpr_action: 'Jarri oinak elkarren ondoan eta konparatu tamaina, gero hiru zapladatxo lurrean.',
      },
      {
        id: 'eu-cat-gorputza-ahoa', type: 'sustantivo', label: 'ahoa', emoji: '👄', pictogram: 'boca', difficulty: 2,
        visual_prompt: 'Ahoa aurretik pixka bat irekita, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau ahoa da. Esan: ahoa.',
        stt_expected_array: ['ahoa', 'aoa', 'aho', 'aa', 'ahua'],
        parent_tpr_action: 'Jarri ispiluaren aurrean eta ireki eta itxi ahoa batera, oso poliki.',
      },
      {
        id: 'eu-cat-gorputza-begia', type: 'sustantivo', label: 'begia', emoji: '👁️', pictogram: 'ojo', difficulty: 2,
        visual_prompt: 'Begi irekia aurretik betileekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau begia da. Esan: begia.',
        stt_expected_array: ['begia', 'begi', 'egia', 'beia', 'pegia'],
        parent_tpr_action: 'Jolastu begiak estali eta agertzera "kuku!" batekin hitza esaten duzuen bakoitzean.',
      },
      {
        id: 'eu-cat-gorputza-belauna', type: 'sustantivo', label: 'belauna', emoji: '🦵', pictogram: 'rodilla', difficulty: 3,
        visual_prompt: 'Hanka alboetatik belauna markatuta eta tolestuta, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau belauna da. Esan: belauna.',
        stt_expected_array: ['belauna', 'belaun', 'elauna', 'beauna', 'pelauna'],
        parent_tpr_action: 'Tolestu belaunak batera kokoriko jarri arte eta igo hitza esanez.',
      },
      {
        id: 'eu-cat-gorputza-ukondoa', type: 'sustantivo', label: 'ukondoa', emoji: '💪', pictogram: 'codo', difficulty: 3,
        visual_prompt: 'Besoa tolestuta alboetatik ukondoa ondo markatuta, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau ukondoa da. Esan: ukondoa.',
        stt_expected_array: ['ukondoa', 'ukondo', 'kondoa', 'ukonoa', 'utondoa'],
        parent_tpr_action: 'Agurtu elkar ukondoak joz, hiru aldiz jarraian.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. Progresioak EREMU SEMANTIKOAREN arabera (7) · DC-2, A aukera
//    Kontzeptua → zatia → ekintza → nolakotasuna.
//    OHARRA: banku hau ZIRRIBORROA da (ILENIA/NEL-GAITU planaren EU-2.x), eta
//    eremu semantikoaren hitz berriak (gurpila, hanka, esnea, isatsa, hodeia,
//    bagoia, luma) euskaldun batek berrikusi behar ditu grabatu aurretik.
// ---------------------------------------------------------------------------
export const PROGRESSION_SEQUENCES_EU: ProgressionSequence[] = [
  {
    id: 'seq-kotxea', theme: 'Garraioa · Kotxea', icon: '🚗',
    phases: [
      {
        kind: 'concepto', label: 'kotxea', emoji: '🚗',
        visual_prompt: 'Jostailuzko kotxea aurretik, kolore lauak, gurpil handiak, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Hau kotxea da. Esan: kotxea.',
        stt_expected_array: ['kotxea', 'otxea', 'kotea', 'kotx'],
        parent_tpr_action: 'Jarri kotxea umearen eskuan, seinalatu eta esan “kotxea” elkarrekin mugitzen duzuen bitartean.',
      },
      {
        kind: 'parte', label: 'gurpila', emoji: '🛞',
        pictogram: 'rueda',
        visual_prompt: 'Kotxe baten gurpil bat aurretik, beltza llanta argiarekin, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Kotxeak gurpilak ditu. Esan: gurpila.',
        stt_expected_array: ['gurpila', 'gurpil', 'urpila', 'gupila'],
        parent_tpr_action: 'Hartu kotxea eta biratu gurpil bat umearen hatzarekin, “gurpila” esanez bira bakoitzean.',
      },
      {
        kind: 'accion', label: 'dabil', emoji: '💨',
        pictogram: 'correr',
        visual_prompt: 'Kotxea abiadura marrekin atzetik, eskuinera doa, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Kotxea azkar dabil. Esan: dabil.',
        stt_expected_array: ['dabil', 'abil', 'dabi', 'dail'],
        parent_tpr_action: 'Eraman kotxea mahai gainetik umearen besora, “dabil” esatean azkartuz.',
      },
      {
        kind: 'cualidad', label: 'azkarra', emoji: '🚗',
        visual_prompt: 'Kotxea tximista batekin eta hiru abiadura marrarekin, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Kotxea oso azkarra da. Esan: azkarra.',
        stt_expected_array: ['azkarra', 'azkara', 'akarra', 'azka'],
        parent_tpr_action: 'Korrika egin umearekin eskutik helduta eta gelditu bat-batean: “azkar… eta stop!”.',
      },
    ],
  },
  {
    id: 'seq-txakurra', theme: 'Animaliak · Txakurra', icon: '🐶',
    phases: [
      {
        kind: 'concepto', label: 'txakurra', emoji: '🐕',
        visual_prompt: 'Txakurra eserita aurretik, belarriak eroriak, kolore lauak, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Hau txakurra da. Esan: txakurra.',
        stt_expected_array: ['txakurra', 'takurra', 'txakura', 'txaku'],
        parent_tpr_action: 'Seinalatu jostailuzko txakur bat edo argazki bat eta laztandu elkarrekin “txakurra” esanez.',
      },
      {
        kind: 'parte', label: 'hanka', emoji: '🐾',
        visual_prompt: 'Txakur baten hanka arrastoa lau behatzekin eta koltxoinarekin, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Txakurrak lau hanka ditu. Esan: hanka.',
        stt_expected_array: ['hanka', 'anka', 'hanke', 'aka'],
        parent_tpr_action: 'Jarri eskuak lurrean hanken moduan eta ibili lau hankatan pauso batzuk “hanka” esanez.',
      },
      {
        kind: 'accion', label: 'salto', emoji: '⬆️',
        pictogram: 'saltar',
        visual_prompt: 'Txakurra airean hankak bilduta eta salto kurba batekin, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Txakurrak salto egiten du pilota hartzeko. Esan: salto.',
        stt_expected_array: ['salto', 'alto', 'atto', 'sato'],
        parent_tpr_action: 'Eman salto jostailuzko txakurrarekin eta salto egin biok batera “salto!” esanez.',
      },
      {
        kind: 'cualidad', label: 'iletsua', emoji: '🐕',
        visual_prompt: 'Txakurra ile oso harroarekin eta ehundura leunaren marrekin, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Txakurra bigun eta iletsua da. Esan: iletsua.',
        stt_expected_array: ['iletsua', 'iletsu', 'ietsua', 'iletua'],
        parent_tpr_action: 'Laztandu panpina bat edo manta leun bat eta esan “iletsua” eskua poliki pasatzen duzuen bitartean.',
      },
    ],
  },
  {
    id: 'seq-behia', theme: 'Animaliak · Behia', icon: '🐄',
    phases: [
      {
        kind: 'concepto', label: 'behia', emoji: '🐄',
        visual_prompt: 'Behia zutik alboetatik, orbanekin, kolore lauak, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Hau behia da. Esan: behia.',
        stt_expected_array: ['behia', 'beia', 'bia', 'behi'],
        parent_tpr_action: 'Seinalatu jostailuzko behi bat edo argazki bat eta jarraitu orbanak hatzarekin “behia” esanez.',
      },
      {
        kind: 'parte', label: 'esnea', emoji: '🥛',
        pictogram: 'vaso-leche',
        visual_prompt: 'Esne edalontzi bat goraino beteta, zuri laua, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Behiak esnea ematen du. Esan: esnea.',
        stt_expected_array: ['esnea', 'esne', 'enea', 'esnia'],
        parent_tpr_action: 'Bota esne apur bat bere edalontzian eta eman zurrutada bat bakoitzak “esnea” esan ondoren.',
      },
      {
        kind: 'accion', label: 'jaten', emoji: '🌿',
        visual_prompt: 'Behia burua makurtuta belar berdearen gainean, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Behiak belarra jaten du. Esan: jaten.',
        stt_expected_array: ['jaten', 'aten', 'ñaten', 'jate'],
        parent_tpr_action: 'Makurtu burua behiaren moduan eta egin belarra murtxikatzen ari zaretela “jaten” esatean.',
      },
      {
        kind: 'cualidad', label: 'handia', emoji: '🐄',
        visual_prompt: 'Behia ume silueta txiki baten ondoan, tamaina kontrastea markatzeko, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Behia oso handia da. Esan: handia.',
        stt_expected_array: ['handia', 'andia', 'hania', 'handi'],
        parent_tpr_action: 'Ireki besoak ahalik eta gehien eta jarri puntetan “haaandia!” esanez.',
      },
    ],
  },
  {
    id: 'seq-katua', theme: 'Animaliak · Katua', icon: '🐱',
    phases: [
      {
        kind: 'concepto', label: 'katua', emoji: '🐈',
        visual_prompt: 'Katua eserita aurretik isatsa kiribilduta, kolore lauak, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Hau katua da. Esan: katua.',
        stt_expected_array: ['katua', 'atua', 'katu', 'kato'],
        parent_tpr_action: 'Seinalatu jostailuzko katu bat edo argazki bat eta laztandu bizkarra “katua” esanez.',
      },
      {
        kind: 'parte', label: 'isatsa', emoji: '🐈',
        visual_prompt: 'Katu baten isats luze eta kiribildua lehen planoan, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Katuak isats luzea du. Esan: isatsa.',
        stt_expected_array: ['isatsa', 'isats', 'satsa', 'isasa'],
        parent_tpr_action: 'Marraztu isats bat airean bizkarretik hasita eta kiribildu eskua “isatsa” esatean.',
      },
      {
        kind: 'accion', label: 'lo egiten', emoji: '😴',
        pictogram: 'dormir',
        visual_prompt: 'Katua kiribilduta begiak itxita eta hiru “Z” gainean, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Katua bere ohean lo egiten ari da. Esan: lo egiten.',
        stt_expected_array: ['lo egiten', 'lo eiten', 'lo', 'loiten'],
        parent_tpr_action: 'Elkartu eskuak masailaren azpian, itxi begiak eta egin “isss” umea “lotara” gonbidatuz.',
      },
      {
        kind: 'cualidad', label: 'leuna', emoji: '🐈',
        visual_prompt: 'Katua esku batek bizkarra laztantzen diola eta ehundura leunaren marrekin, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Katuaren ilea oso leuna da. Esan: leuna.',
        stt_expected_array: ['leuna', 'euna', 'lena', 'leun'],
        parent_tpr_action: 'Pasatu luma bat edo zapi bat umearen besotik oso poliki “leuna” esanez.',
      },
    ],
  },
  {
    id: 'seq-euria', theme: 'Natura · Euria', icon: '🌧️',
    phases: [
      {
        kind: 'concepto', label: 'ura', emoji: '💧',
        visual_prompt: 'Ur tanta handi eta distiratsu bat aurretik, urdin laua, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Hau ura da. Esan: ura.',
        stt_expected_array: ['ura', 'ua', 'uda', 'u'],
        parent_tpr_action: 'Busti hatz bat benetako uretan eta ukitu eskua hotza nabarituz “ura” esanez.',
      },
      {
        kind: 'parte', label: 'hodeia', emoji: '☁️',
        visual_prompt: 'Hodei gris biribildua hiru tanta erortzen direla azpitik, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Ura hodeitik erortzen da. Esan: hodeia.',
        stt_expected_array: ['hodeia', 'odeia', 'hodei', 'odei'],
        parent_tpr_action: 'Seinalatu hodei bat leihotik (edo marraztu bat airean) eta esan “hodeia” putz eginez.',
      },
      {
        kind: 'accion', label: 'erortzen', emoji: '⬇️',
        visual_prompt: 'Ur tanta gezi batekin behera eta silueta mamu bat goraxeago, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Ura zerutik erortzen da. Esan: erortzen.',
        stt_expected_array: ['erortzen', 'erotzen', 'eortzen', 'erorten'],
        parent_tpr_action: 'Igo eskuak gora eta jaitsi hatzak mugituz lurreraino “erortzen” esanez.',
      },
      {
        kind: 'cualidad', label: 'busti', emoji: '🤲',
        pictogram: 'manos-mojadas',
        visual_prompt: 'Bi esku ireki ur tantak irristatzen zaizkiela eta zipriztin txikiak, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Eskua busti dago. Esan: busti.',
        stt_expected_array: ['busti', 'buti', 'usti', 'busi'],
        parent_tpr_action: 'Busti apur bat umearen eskua zapi batekin eta esan “busti” eskuak astinduz.',
      },
    ],
  },
  {
    id: 'seq-trena', theme: 'Garraioa · Trena', icon: '🚂',
    phases: [
      {
        kind: 'concepto', label: 'trena', emoji: '🚆',
        visual_prompt: 'Hiru bagoiko trena alboetatik bide zuzen baten gainean, kolore lauak, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Hau trena da. Esan: trena.',
        stt_expected_array: ['trena', 'tena', 'terena', 'tren'],
        parent_tpr_action: 'Egin trentxo bat: umea gerritik heltzen zaizu eta korridorean aurrera “trena” esanez.',
      },
      {
        kind: 'parte', label: 'bagoia', emoji: '🚃',
        visual_prompt: 'Tren bagoi bakar bat alboetatik, leiho karratuekin eta gurpilekin, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Trenak bagoi asko ditu. Esan: bagoia.',
        stt_expected_array: ['bagoia', 'bagoi', 'agoia', 'bagoa'],
        parent_tpr_action: 'Jarri ilaran hiru kutxa edo kuxin bagoien moduan eta lotu banan-banan “bagoia” esanez.',
      },
      {
        kind: 'accion', label: 'gelditzen', emoji: '🛑',
        pictogram: 'parar',
        visual_prompt: 'Trena geldirik nasa baten ondoan stop seinale batekin, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Trena geltokian gelditzen da. Esan: gelditzen.',
        stt_expected_array: ['gelditzen', 'geditzen', 'geltzen', 'geldizen'],
        parent_tpr_action: 'Aurrera egin tren baten moduan eta gelditu bat-batean “gelditzen!” esatean, guztiz geldi.',
      },
      {
        kind: 'cualidad', label: 'luzea', emoji: '🚆',
        visual_prompt: 'Bagoi askoko trena irudiaren alde batetik bestera luzatzen dena, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Trena oso luzea da. Esan: luzea.',
        stt_expected_array: ['luzea', 'uzea', 'luea', 'luze'],
        parent_tpr_action: 'Banandu besoak ahalik eta gehien trena zein “luuuzea” den markatuz.',
      },
    ],
  },
  {
    id: 'seq-txoria', theme: 'Animaliak · Txoria', icon: '🐦',
    phases: [
      {
        kind: 'concepto', label: 'txoria', emoji: '🐦',
        pictogram: 'pajaro',
        visual_prompt: 'Txori txiki bat alboetatik adar batean pausatuta, kolore lauak, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Hau txoria da. Esan: txoria.',
        stt_expected_array: ['txoria', 'toria', 'txoia', 'txori'],
        parent_tpr_action: 'Bilatu txori bat leihotik edo marrazki batean, seinalatu eta agurtu eskuarekin.',
      },
      {
        kind: 'parte', label: 'luma', emoji: '🪶',
        pictogram: 'pluma',
        visual_prompt: 'Luma bakar bat aurretik, erdiko ardatza markatuta, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Txoriak lumak ditu. Esan: luma.',
        stt_expected_array: ['luma', 'lumak', 'uma', 'lume'],
        parent_tpr_action: 'Putz egin benetako luma bati (edo paper zati bati) flota dezan eta esan “luma” hartzean.',
      },
      {
        kind: 'accion', label: 'hegan', emoji: '🐦',
        pictogram: 'pajaro',
        visual_prompt: 'Txoria hegoak zabalik hegan eta ibilbide kurba batekin, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Txoriak hegan egiten du zeruan. Esan: hegan.',
        stt_expected_array: ['hegan', 'egan', 'hean', 'gan'],
        parent_tpr_action: 'Ireki besoak hegoen moduan eta eman buelta bat gelan “hegan” esanez.',
      },
      {
        kind: 'cualidad', label: 'txikia', emoji: '🐤',
        visual_prompt: 'Txori txiki-txikia esku ireki batek eusten diola, tamaina markatzeko, hondorik gabe, kontraste handia, ertz lodia.',
        tts_string: 'Txoria oso txikia da. Esan: txikia.',
        stt_expected_array: ['txikia', 'tikia', 'txiia', 'txiki'],
        parent_tpr_action: 'Elkartu erakuslea eta hatz lodia zulotxo bat utziz eta begiratu bertatik “txikia” esanez.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 3. Cápsulas de contraste (adjetivos y verbos antónimos), dos vueltas.
// ---------------------------------------------------------------------------
export const CONTRAST_CAPSULES_EU: ContrastCapsule[] = [
  {
    id: 'cap-handi-txiki', code: 'CT-EU-1', kind: 'adjetivos', pair: ['handia', 'txikia'], icon: '🧸',
    physical_setup: 'Prestatu bi hartzatxo berdin baina tamaina desberdinekoak: bat argi eta garbi HANDIA eta bestea argi eta garbi TXIKIA. Jarri elkarren ondoan haurraren aurrean.',
    rounds: [
      {
        label: 'handia', emoji: '🧸',
        pictogram: 'osito-grande',
        tts_trigger: 'Zein da panpina HANDIA? Emadazu eta esan! Esan: handia.',
        stt_expected_array: ['handia', 'andia', 'hania', 'handi'],
        parent_action: 'Haurrak panpina handia ematen dizu esaten duen bitartean; besarkatu zein erraldoia den puztuz.',
      },
      {
        label: 'txikia', emoji: '🧸',
        pictogram: 'osito-pequeno',
        tts_trigger: 'Orain alderantziz: zein hartzatxo da TXIKIA? Emadazu eta esan! Esan: txikia.',
        stt_expected_array: ['txikia', 'tikia', 'txiia', 'txiki'],
        parent_action: 'Haurrak txikia ematen dizu; ezkutatu esku batean eta esan "txikia" ahots txiki-txikiz.',
      },
    ],
  },
  {
    id: 'cap-garbi-zikin', code: 'CT-EU-2', kind: 'adjetivos', pair: ['garbi', 'zikin'], icon: '🥄',
    physical_setup: 'Hartu bi koilara berdin: garbitu bat distiratsu utzi arte eta zikindu bestea janari edo lohi pixka batekin. Jarri bata bestearen ondoan.',
    rounds: [
      {
        label: 'zikin', emoji: '🥄',
        pictogram: 'cuchara-sucia',
        tts_trigger: 'Seinalatu koilara ZIKINA. Nola dago hau? Esan: zikin.',
        stt_expected_array: ['zikin', 'ikin', 'ziki', 'tikin'],
        parent_action: 'Haurrak koilara zikina seinalatzen du eta biok "puaj!" aurpegia jartzen duzue baztertuz.',
      },
      {
        label: 'garbi', emoji: '🥄',
        pictogram: 'cuchara-limpia',
        tts_trigger: 'Eta beste koilara hau, nola dago? Begira nola distiratzen duen! Esan: garbi.',
        stt_expected_array: ['garbi', 'gabi', 'abi', 'garb'],
        parent_action: 'Seinalatu garbia, putz egin haren gainean distiratuko balira bezala eta jo bostekoa.',
      },
    ],
  },
  {
    id: 'cap-ireki-itxi', code: 'CT-EU-3', kind: 'verbos', pair: ['ireki', 'itxi'], icon: '📦',
    physical_setup: 'Jarri haurraren aurrean estalkidun kutxa bat eta sartu barruan, ikusgai, bere jostailu gogokoena. Itxi estalkia.',
    rounds: [
      {
        label: 'ireki', emoji: '📦',
        pictogram: 'caja-abierta',
        tts_trigger: 'Jostailua barruan dago. Zer egingo dugu ateratzeko? Goazen IREKITZERA! Esan: ireki.',
        stt_expected_array: ['ireki', 'irek', 'ieki', 'ike'],
        parent_action: 'Ireki kutxa elkarrekin, oso poliki, eta ospatu jostailua aurkitzea "tatxan!" batekin.',
      },
      {
        label: 'itxi', emoji: '📦',
        pictogram: 'caja-cerrada',
        tts_trigger: 'Jostailua gordeko dugu. Zer egingo dugu estalkiarekin? ITXI dezagun! Esan: itxi.',
        stt_expected_array: ['itxi', 'iti', 'txi', 'itx'],
        parent_action: 'Haurrak estalkia bultzatzen du erabat itxi arte hitza esaten duen bitartean.',
      },
    ],
  },
  {
    id: 'cap-igo-jaitsi', code: 'CT-EU-4', kind: 'verbos', pair: ['igo', 'jaitsi'], icon: '🚗',
    physical_setup: 'Egin arrapala bat liburu handi bat okertuta jarrita eta jarri jostailuzko kotxe bat arrapalaren oinean.',
    rounds: [
      {
        label: 'igo', emoji: '⬆️',
        pictogram: 'coche-subiendo',
        tts_trigger: 'Kotxea mendira doa. Zer egiten du? IGO egiten du! Esan: igo.',
        stt_expected_array: ['igo', 'io', 'go', 'igu'],
        parent_action: 'Igo kotxea arrapalatik oso poliki hitza entzuten den bitartean.',
      },
      {
        label: 'jaitsi', emoji: '⬇️',
        pictogram: 'coche-bajando',
        tts_trigger: 'Orain kotxea behera doa! Zer egiten du? Esan: jaitsi.',
        stt_expected_array: ['jaitsi', 'aitsi', 'jaisi', 'jaits'],
        parent_action: 'Askatu kotxea eta utzi bakarrik jaisten arrapalatik; esan "jaitsiii!" erortzen den bitartean.',
      },
    ],
  },
  {
    id: 'cap-hotz-bero', code: 'CT-EU-5', kind: 'adjetivos', pair: ['hotz', 'bero'], icon: '🥤',
    physical_setup: 'Prestatu bi baso: bat ur oso hotzarekin (izotzarekin ahal bada) eta bestea ur epelarekin. Jarri haurraren aurrean.',
    rounds: [
      {
        label: 'hotz', emoji: '🥤',
        pictogram: 'vaso-frio',
        tts_trigger: 'Ukitu basoak. Zein dago HOTZ? Brrr! Esan: hotz.',
        stt_expected_array: ['hotz', 'otz', 'hots', 'ho'],
        parent_action: 'Haurrak baso hotza ukitzen du; dardaratu biok "brrr!" sorbaldak uzkurtuz.',
      },
      {
        label: 'bero', emoji: '🥤',
        pictogram: 'vaso-caliente',
        tts_trigger: 'Eta beste baso hau, nola dago? Esan: bero.',
        stt_expected_array: ['bero', 'ero', 'beo', 'bebo'],
        parent_action: 'Ukitu baso epela eta haizeztatu eskua erreko balizue bezala, asko puztuz.',
      },
    ],
  },
  {
    id: 'cap-piztu-itzali', code: 'CT-EU-6', kind: 'verbos', pair: ['piztu', 'itzali'], icon: '💡',
    physical_setup: 'Jarri haurrarekin argiaren etengailuaren ondoan (edo hartu linterna bat). Gela argia itzalita hasten da.',
    rounds: [
      {
        label: 'piztu', emoji: '💡',
        pictogram: 'bombilla-encendida',
        tts_trigger: 'Ilun dago… Zer egingo dugu argiarekin? PIZTU dezagun! Esan: piztu.',
        stt_expected_array: ['piztu', 'iztu', 'pistu', 'pitu'],
        parent_action: 'Haurrak etengailua sakatzen du esatean eta argia ospatzen duzue "ooooh!" batekin.',
      },
      {
        label: 'itzali', emoji: '💡',
        pictogram: 'bombilla-apagada',
        tts_trigger: 'Orain alderantziz. Zer egingo dugu argiarekin? ITZALI dezagun! Esan: itzali.',
        stt_expected_array: ['itzali', 'itali', 'izali', 'itza'],
        parent_action: 'Haurrak argia itzaltzen du eta "gabon" esaten diozue elkarri xuxurla ahotsez.',
      },
    ],
  },
];

// Frases fijas de la variedad para la enumeración de voz (reintento y cierre).
export const SEM_RETRY_EU = (label: string): string => `Berriro! Esan: ${label}.`;
export const SEM_SESSION_DONE_EU = 'Saioa amaituta! Jo bostekoa!';

// ES-07 · Rutinas ordenables (ACOPROS, 3.ª ronda): consigna del paso de
// ordenar (la locuta la app al niño) y repaso que hace el adulto al acabar.
export const SEM_ORDER_EU = {
  prompt: 'Ordena dezagun errutina. Zer egiten dugu lehenik?',
  action: 'Errepasatu errutina elkarrekin ozen, marrazki bakoitza seinalatuz: lehenik, gero, ondoren eta azkenik.',
};
