// ============================================================================
// Valeria+ · Expansión Semántica en EUSKERA batua — plan ILENIA/NEL-GAITU
// Versión vasca de los tres bloques de expansión léxica (escenarios de vida
// diaria, progresiones onomatopeya→adjetivo y cápsulas de contraste). Mismas
// interfaces que el banco base (valeriaSemanticExpansion); el contenido NO se
// traduce literalmente: se REDISEÑA para el léxico y las aproximaciones
// fonéticas del euskera infantil (`stt_expected_array`).
//
// ESTADO: 📝 BORRADOR — pendiente de revisión de euskera normativo (batua) y
// criterio logopédico. Se locuta con la voz neuronal HiTZ-TTS (enumerado en el
// corpus). Módulo PURO (enumerable en build-time).
// ============================================================================
import {
  DailyScenario, ProgressionSequence, ContrastCapsule,
} from './valeriaSemanticExpansion';

// ---------------------------------------------------------------------------
// 1. Escenarios de la vida diaria (2 sustantivos, 2 verbos, 1 adjetivo, 1 onom.)
// ---------------------------------------------------------------------------
export const DAILY_SCENARIOS_EU: DailyScenario[] = [
  {
    id: 'goiza', title: 'Goizeko errutina', icon: '☀️', subtitle: 'Esnatu, garbitu eta jantzi',
    items: [
      {
        id: 'goiza-ohea', type: 'sustantivo', label: 'ohea', emoji: '🛏️',
        visual_prompt: 'Haur-ohea aurretik ikusita, izara lauak, hondorik gabe, ingerada lodia, kolore lauak, itzalik gabe.',
        tts_string: 'Hau ohea da. Goizean ohetik salto egiten dugu. Esan: ohea.',
        stt_expected_array: ['ohea', 'oea', 'oa', 'ohe'],
        parent_tpr_action: 'Jo ohean palmaditak eta eseri bertan haurrarekin, gero biok batera altxatzeko.',
      },
      {
        id: 'goiza-eskuila', type: 'sustantivo', label: 'eskuila', emoji: '🪥',
        visual_prompt: 'Hortzetako eskuila horizontalean pasta marra batekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau eskuila da. Eskuilarekin hortzak garbitzen ditugu. Esan: eskuila.',
        stt_expected_array: ['eskuila', 'ekuila', 'kuila', 'eskuil'],
        parent_tpr_action: 'Jarri eskuila (pastarik gabe) haurraren eskuan eta gidatu elkarrekin hortzak garbitzeko keinua.',
      },
      {
        id: 'goiza-garbitu', type: 'verbo', label: 'garbitu', emoji: '🧼',
        visual_prompt: 'Bi esku xaboi-burbuilekin igurzten, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Begira, eskuak garbitzen ditugu. Zer egiten dugu? Esan: garbitu.',
        stt_expected_array: ['garbitu', 'gabitu', 'arbitu', 'gabi'],
        parent_tpr_action: 'Igurtzi eskuak xaboiz bezala eta animatu haurra bereak igurztera hitzaren erritmoan.',
      },
      {
        id: 'goiza-jantzi', type: 'verbo', label: 'jantzi', emoji: '👕',
        visual_prompt: 'Haur-kamiseta aurretik silueta baten burutik sartzen, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Orain jantzi egiten gara. Burua kamisetan sartzen dugu. Esan: jantzi.',
        stt_expected_array: ['jantzi', 'antzi', 'atzi', 'jantz'],
        parent_tpr_action: 'Pasa kamiseta bat haurraren burutik eta, agertzean, ospatu "kuku!" batekin.',
      },
      {
        id: 'goiza-garbi', type: 'adjetivo', label: 'garbi', emoji: '✨',
        visual_prompt: 'Esku irekia distiratsu, inguruan izpiekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Begira zer esku! Garbi-garbi daude eta distira egiten dute. Nolakoak daude? Esan: garbi.',
        stt_expected_array: ['garbi', 'gabi', 'abi', 'garb'],
        parent_tpr_action: 'Erakutsi zure esku garbiak, putz egin haien gainean distiratuko balira bezala eta jo bostekoa.',
      },
      {
        id: 'goiza-rin', type: 'onomatopeya', label: 'rin rin', emoji: '⏰',
        visual_prompt: 'Iratzargailu klasikoa bi kanpaiekin eta alboetan dardara-marrak, hondorik gabe, kontraste handia.',
        tts_string: 'Iratzargailua jotzen ari da: Rin, rin! Nola egiten du iratzargailuak? Esan: rin, rin.',
        stt_expected_array: ['rin rin', 'rin', 'ri ri', 'in in'],
        parent_tpr_action: 'Estali zaitez lo bazeunde bezala eta, "rin, rin!" esatean, esnatu bat-batean besoak luzatuz.',
      },
    ],
  },
  {
    id: 'jatordua', title: 'Jateko ordua', icon: '🍽️', subtitle: 'Mahaian eseri eta jan',
    items: [
      {
        id: 'jan-koilara', type: 'sustantivo', label: 'koilara', emoji: '🥄',
        visual_prompt: 'Koilara bakarra goitik ikusita, kirtena behera, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Hau koilara da. Zopa koilararekin jaten dugu. Esan: koilara.',
        stt_expected_array: ['koilara', 'oilara', 'kolara', 'koila'],
        parent_tpr_action: 'Jarri koilara haurraren eskuan eta eraman elkarrekin ahora, jateko keinua eginez.',
      },
      {
        id: 'jan-basoa', type: 'sustantivo', label: 'basoa', emoji: '🥛',
        visual_prompt: 'Ura erdiraino duen basoa aurretik, hondorik gabe, kontraste handia, ura urdin lauan.',
        tts_string: 'Hau basoa da. Basoan ura dago. Esan: basoa.',
        stt_expected_array: ['basoa', 'asoa', 'baso', 'bao'],
        parent_tpr_action: 'Hurbildu basoa haurraren ezpainetara eta edan aldi berean "klu, klu" eginez.',
      },
      {
        id: 'jan-jan', type: 'verbo', label: 'jan', emoji: '😋',
        visual_prompt: 'Aho irekia janariaz betetako koilara jasotzen, profil sinplean, hondorik gabe, kontraste handia.',
        tts_string: 'Gose handia dut. Goazen jatera! Zer egiten dugu? Esan: jan.',
        stt_expected_array: ['jan', 'an', 'ñan', 'ja'],
        parent_tpr_action: 'Igurtzi tripa, ireki ahoa handi eta egin murtxikatzen ari bazina bezala, keinua puztuz.',
      },
      {
        id: 'jan-edan', type: 'verbo', label: 'edan', emoji: '🥤',
        visual_prompt: 'Haur-silueta baso okertu batetik edaten, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Egarri naiz. Goazen ura edatera! Zer egiten dugu? Esan: edan.',
        stt_expected_array: ['edan', 'eran', 'ean', 'eda'],
        parent_tpr_action: 'Okertu baso huts bat zure ahoaren gainean eta egin "klu, klu" haurrak imita zaitzan.',
      },
      {
        id: 'jan-goxo', type: 'adjetivo', label: 'goxo', emoji: '👌',
        visual_prompt: 'Aurpegi irribarretsua mihia aterata bihotz txiki batekin, hondorik gabe, kontraste handia.',
        tts_string: 'Mmm, zein goxo dagoen! Nola dago janaria? Esan: goxo.',
        stt_expected_array: ['goxo', 'oxo', 'gogo', 'gox'],
        parent_tpr_action: 'Miazkatu ezpainak, igurtzi tripa eta jarri gustuko aurpegia "mmm, goxo!" esanez.',
      },
      {
        id: 'jan-ñam', type: 'onomatopeya', label: 'ñam ñam', emoji: '😋',
        visual_prompt: 'Aho murtxikatzailea inguruan apurrekin eta mugimendu-marrekin, hondorik gabe, kontraste handia.',
        tts_string: 'Gaileta jaten dugu: Ñam, ñam! Nola egiten du ahoak? Esan: ñam, ñam.',
        stt_expected_array: ['ñam ñam', 'ñam', 'nam nam', 'am am'],
        parent_tpr_action: 'Murtxikatu era puztuan masailezurra asko mugituz eta haurrak zurekin murtxika dezala "ñam, ñam!" esatean.',
      },
    ],
  },
  {
    id: 'parkea', title: 'Parkean', icon: '🌳', subtitle: 'Kanpoan jolastu eta mugitu',
    items: [
      {
        id: 'parke-pilota', type: 'sustantivo', label: 'pilota', emoji: '⚽',
        visual_prompt: 'Pilota biribila kolore lauetan aurretik, hondorik gabe, kontraste handia, lurreko itzalik gabe.',
        tts_string: 'Hau pilota da. Parkean pilotarekin jolasten gara. Esan: pilota.',
        stt_expected_array: ['pilota', 'ilota', 'piota', 'pilo'],
        parent_tpr_action: 'Bota pilota erreal bat haurrarengana eta itxaron itzul dezan hitza errepikatu aurretik.',
      },
      {
        id: 'parke-txirristra', type: 'sustantivo', label: 'txirristra', emoji: '🛝',
        visual_prompt: 'Haur-txirristra albotik eskailerarekin eta arrapala kurbatuarekin, hondorik gabe, kontraste handia.',
        tts_string: 'Hau txirristra da. Txirristran igo eta behera irristatzen gara. Esan: txirristra.',
        stt_expected_array: ['txirristra', 'tirristra', 'txirista', 'txirri'],
        parent_tpr_action: 'Irristatu haurraren eskua zure beso okertutik behera, txirristraren arrapala balitz bezala.',
      },
      {
        id: 'parke-korrika', type: 'verbo', label: 'korrika', emoji: '🏃',
        visual_prompt: 'Haur-silueta korrika atzean abiadura-marrekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Azkar goaz! Parkean korrika egitea gustatzen zaigu. Zer egiten dugu? Esan: korrika.',
        stt_expected_array: ['korrika', 'orrika', 'korika', 'korri'],
        parent_tpr_action: 'Egin korrika zure lekuan besoak asko mugituz eta animatu haurra zurekin urrats batzuk egitera.',
      },
      {
        id: 'parke-salto', type: 'verbo', label: 'salto', emoji: '🤸',
        visual_prompt: 'Haur-silueta salto eginez oinak lurretik altxatuta jauzi-kurba batekin, hondorik gabe, kontraste handia.',
        tts_string: 'Gora! Igela bezala salto egiten dugu. Zer egiten dugu? Esan: salto.',
        stt_expected_array: ['salto', 'alto', 'atto', 'sato'],
        parent_tpr_action: 'Egin salto bi oinak batera "salto!" esanez jauzi bakoitzean eta haurrak zurekin salto egin dezala.',
      },
      {
        id: 'parke-altu', type: 'adjetivo', label: 'altu', emoji: '🦒',
        visual_prompt: 'Gora seinalatzen duen gezi handia punta-puntetan luzatutako silueta baten ondoan, hondorik gabe, kontraste handia.',
        tts_string: 'Zabua oso altu igotzen da! Nola doa? Esan: altu.',
        stt_expected_array: ['altu', 'atu', 'autu', 'alt'],
        parent_tpr_action: 'Luzatu zaitez punta-puntetan besoak zerurantz eta altxatu haurra besoetan "altu!" esanez.',
      },
      {
        id: 'parke-boing', type: 'onomatopeya', label: 'boing', emoji: '⚽',
        visual_prompt: 'Pilota bote eginez bi silueta mamu eta bote-gezi kurbatuekin, hondorik gabe, kontraste handia.',
        tts_string: 'Pilotak bote egiten du: Boing, boing! Nola egiten du pilotak? Esan: boing.',
        stt_expected_array: ['boing', 'boin', 'boi', 'bo bo'],
        parent_tpr_action: 'Bota pilota bat (edo zeu belaunekin) "boing!" esanez bote bakoitzean haurraren ondoan.',
      },
    ],
  },
  {
    id: 'bainua', title: 'Bainuaren ordua', icon: '🛁', subtitle: 'Ura, xaboia eta burbuilak',
    items: [
      {
        id: 'bainu-ontzia', type: 'sustantivo', label: 'bainuontzia', emoji: '🛁',
        visual_prompt: 'Bainuontzia hanketan albotik apar pixka batekin, hondorik gabe, kontraste handia, kolore lauak.',
        tts_string: 'Hau bainuontzia da. Bainuontzian bainatzen gara. Esan: bainuontzia.',
        stt_expected_array: ['bainuontzia', 'bainuontzi', 'ainuontzia', 'bainontzia'],
        parent_tpr_action: 'Seinalatu bainuontzia (edo aska bat) eta egin biok barrura sartzeko keinua hankak asko altxatuz.',
      },
      {
        id: 'bainu-xaboia', type: 'sustantivo', label: 'xaboia', emoji: '🧼',
        visual_prompt: 'Xaboi-pastilla hiru burbuilaz inguratuta, hondorik gabe, kontraste handia, kolore lauak.',
        tts_string: 'Hau xaboia da. Xaboiak burbuila asko egiten ditu. Esan: xaboia.',
        stt_expected_array: ['xaboia', 'saboia', 'aboia', 'xabo'],
        parent_tpr_action: 'Jarri xaboi-pastilla haurraren eskuetan eta biratu elkarrekin apar imajinarioa eginez.',
      },
      {
        id: 'bainu-bainatu', type: 'verbo', label: 'bainatu', emoji: '🛀',
        visual_prompt: 'Haur-silueta bainuontzi barruan burbuilekin, hondorik gabe, kontraste handia, ingerada lodia.',
        tts_string: 'Uretara! Panpina bainatuko dugu. Zer egiten dugu? Esan: bainatu.',
        stt_expected_array: ['bainatu', 'ainatu', 'banatu', 'baina'],
        parent_tpr_action: 'Igurtzi leunki haurraren besoak xaboiztatuko bazenu bezala "bainatu" errepikatuz.',
      },
      {
        id: 'bainu-igurtzi', type: 'verbo', label: 'igurtzi', emoji: '🧽',
        visual_prompt: 'Belakia igurzten mugimendu-marra biribilekin eta burbuilekin, hondorik gabe, kontraste handia.',
        tts_string: 'Igurtzi, igurtzi belakia. Zer egiten dugu? Esan: igurtzi.',
        stt_expected_array: ['igurtzi', 'igutzi', 'iurtzi', 'gurtzi'],
        parent_tpr_action: 'Igurtzi zirkulu leunak haurraren bizkarrean eskuarekin edo belaki batekin hitzaren erritmoan.',
      },
      {
        id: 'bainu-bero', type: 'adjetivo', label: 'bero', emoji: '♨️',
        visual_prompt: 'Baso edo bainuontzia hiru lurrun-marra uhinduarekin gora, hondorik gabe, kontraste handia.',
        tts_string: 'Ura epela dago. Nola dago ura? Esan: bero.',
        stt_expected_array: ['bero', 'ero', 'bebo', 'beo'],
        parent_tpr_action: 'Ukitu ura hatz batekin eta haizeztatu eskua puztuz: "uf, bero!".',
      },
      {
        id: 'bainu-txof', type: 'onomatopeya', label: 'txof', emoji: '💦',
        visual_prompt: 'Ur-zipriztina izar forman tantak kanpora aterata, hondorik gabe, kontraste handia.',
        tts_string: 'Urak zipriztintzen du: Txof, txof! Nola egiten du urak? Esan: txof.',
        stt_expected_array: ['txof', 'txof txof', 'tof', 'of'],
        parent_tpr_action: 'Jo palmaditak uraren gainean (edo izterraren gainean) "txof!" esanez kolpe bakoitzean.',
      },
    ],
  },
  {
    id: 'gaua', title: 'Lotara', icon: '🌙', subtitle: 'Ipuina, besarkada eta ohera',
    items: [
      {
        id: 'gau-ilargia', type: 'sustantivo', label: 'ilargia', emoji: '🌙',
        visual_prompt: 'Ilargi-erdi handi eta irribarretsua bi izar txikirekin, hondorik gabe, kontraste handia.',
        tts_string: 'Begira zerua. Hau ilargia da. Esan: ilargia.',
        stt_expected_array: ['ilargia', 'ilaria', 'iargia', 'ilargi'],
        parent_tpr_action: 'Marraztu elkarrekin zirkulu handi bat airean hatzarekin "ilaaargia" esanez.',
      },
      {
        id: 'gau-ipuina', type: 'sustantivo', label: 'ipuina', emoji: '📖',
        visual_prompt: 'Liburu irekia orrietatik ateratzen den izar batekin, hondorik gabe, kontraste handia.',
        tts_string: 'Lo egin aurretik ipuin bat irakurtzen dugu. Esan: ipuina.',
        stt_expected_array: ['ipuina', 'ipuna', 'puina', 'ipui'],
        parent_tpr_action: 'Hartu haurraren ipuin gogokoena, jarri haren eskuetan eta ireki elkarrekin oso poliki.',
      },
      {
        id: 'gau-lo', type: 'verbo', label: 'lo', emoji: '😴',
        visual_prompt: 'Aurpegitxoa begiak itxita burko baten gainean hiru "Z" letrarekin, hondorik gabe, kontraste handia.',
        tts_string: 'Isss… lotara joateko ordua da. Zer egiten dugu? Esan: lo.',
        stt_expected_array: ['lo', 'o', 'mo', 'lu'],
        parent_tpr_action: 'Elkartu eskuak masailaren azpian, itxi begiak eta egin zurrunga leun biok.',
      },
      {
        id: 'gau-besarkatu', type: 'verbo', label: 'besarkatu', emoji: '🤗',
        visual_prompt: 'Bi silueta besarkatzen bihotz txiki batekin gainean, hondorik gabe, kontraste handia.',
        tts_string: 'Gabon besarkada bat. Zer egiten dugu? Esan: besarkatu.',
        stt_expected_array: ['besarkatu', 'besakatu', 'bearkatu', 'besarka'],
        parent_tpr_action: 'Eman besarkada luze bat egiazkoa eta estutu pixka bat hitza esatean.',
      },
      {
        id: 'gau-ilun', type: 'adjetivo', label: 'ilun', emoji: '🌑',
        visual_prompt: 'Gaueko leihoa zeru ilunarekin eta izar batekin, hondorik gabe, kontraste handia.',
        tts_string: 'Argia itzali da. Dena ilun dago. Nola dago? Esan: ilun.',
        stt_expected_array: ['ilun', 'iun', 'inun', 'ilu'],
        parent_tpr_action: 'Estali haurraren begiak leunki bere esku propioekin eta destali bat-batean: "ilun… argia!".',
      },
      {
        id: 'gau-hontza', type: 'onomatopeya', label: 'uh uh', emoji: '🦉',
        visual_prompt: 'Hontza aurretik begi handiekin adar baten gainean, hondorik gabe, kontraste handia.',
        tts_string: 'Hontzak gauez kantatzen du: Uh, uh! Nola egiten du hontzak? Esan: uh, uh.',
        stt_expected_array: ['uh uh', 'u u', 'uh', 'uu'],
        parent_tpr_action: 'Jarri eskuak betaurreko gisa begien inguruan eta biratu burua hontza bat bezala "uh, uh!" esanez.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. Progresiones: Onomatopeya → Sustantivo → Verbo → Adjetivo
// ---------------------------------------------------------------------------
export const PROGRESSION_SEQUENCES_EU: ProgressionSequence[] = [
  {
    id: 'seq-kotxea', theme: 'Garraioa · Kotxea', icon: '🚗',
    phases: [
      {
        kind: 'onomatopeya', label: 'brum', emoji: '🚗',
        visual_prompt: 'Ihes-hodiaren ke-hodeia "BRUM" letra estilizatuekin, hondorik gabe, kontraste handia.',
        tts_string: 'Motorra abiatzen da: Brum, brum! Nola egiten du kotxeak? Esan: brum.',
        stt_expected_array: ['brum', 'brrum', 'brum brum', 'bum', 'bu bu'],
        parent_tpr_action: 'Bultza jostailuzko kotxe bat lurretik ezpainak dardaratuz "brrrum" eta animatu haurra imitatzera.',
      },
      {
        kind: 'sustantivo', label: 'kotxea', emoji: '🚗',
        visual_prompt: 'Jostailuzko kotxea aurretik, kolore lauak, gurpil handiak, hondorik gabe, kontraste handia.',
        tts_string: 'Brum, brum! Hau kotxea da. Zer da? Esan: kotxea.',
        stt_expected_array: ['kotxea', 'otxea', 'kotea', 'kotx'],
        parent_tpr_action: 'Jarri kotxea haurraren eskuan, seinalatu eta errepikatu elkarrekin "kotxea" mugitzen duzuen bitartean.',
      },
      {
        kind: 'verbo', label: 'dabil', emoji: '💨',
        visual_prompt: 'Kotxea atzean abiadura-marrekin eskuinerantz aurrera, hondorik gabe, kontraste handia.',
        tts_string: 'Begira, kotxea oso azkar dabil. Zer egiten du kotxeak? Esan: dabil.',
        stt_expected_array: ['dabil', 'abil', 'dabi', 'dail'],
        parent_tpr_action: 'Ibilarazi kotxea mahaian eta gero haurraren besoan, azkartuz "dabil" esatean.',
      },
      {
        kind: 'adjetivo', label: 'azkarra', emoji: '⚡',
        visual_prompt: 'Kotxea tximista batekin eta hiru abiadura-marra markaturekin, hondorik gabe, kontraste handia.',
        tts_string: 'Ai, zein azkar doan kotxea! Nolakoa da kotxea? Esan: azkarra.',
        stt_expected_array: ['azkarra', 'azkara', 'akarra', 'azka'],
        parent_tpr_action: 'Egin korrika haurrarekin eskutik urrats batzuk eta gelditu bat-batean "azkar… eta stop!" esanez.',
      },
    ],
  },
  {
    id: 'seq-txakurra', theme: 'Animaliak · Txakurra', icon: '🐶',
    phases: [
      {
        kind: 'onomatopeya', label: 'zaunk', emoji: '🐶',
        visual_prompt: 'Komiki-bunbuiloa "ZAUNK" eta txakur-aztarna batekin, hondorik gabe, kontraste handia.',
        tts_string: 'Txakurrak zaunka egiten du: Zaunk, zaunk! Nola egiten du txakurrak? Esan: zaunk.',
        stt_expected_array: ['zaunk', 'zaun', 'aunk', 'zau zau'],
        parent_tpr_action: 'Jarri lau hanketan eta zaunka egin "zaunk, zaunk!" burua mugituz, haurrak zurekin egin dezan.',
      },
      {
        kind: 'sustantivo', label: 'txakurra', emoji: '🐕',
        visual_prompt: 'Txakurra eserita aurretik, belarriak eroriak, kolore lauak, hondorik gabe, kontraste handia.',
        tts_string: 'Zaunk, zaunk! Hau txakurra da. Zer da? Esan: txakurra.',
        stt_expected_array: ['txakurra', 'takurra', 'txakura', 'txaku'],
        parent_tpr_action: 'Seinalatu jostailuzko txakur bat edo argazki bat eta laztandu elkarrekin "txakurra" errepikatuz.',
      },
      {
        kind: 'verbo', label: 'salto', emoji: '⬆️',
        visual_prompt: 'Txakurra airean hankak bilduta jauzi-kurba batekin, hondorik gabe, kontraste handia.',
        tts_string: 'Begira, txakurrak salto egiten du pilota hartzeko. Zer egiten du txakurrak? Esan: salto.',
        stt_expected_array: ['salto', 'alto', 'atto', 'sato'],
        parent_tpr_action: 'Salto eginarazi jostailuzko txakurrari eta salto egin biok batera "salto!" esanez.',
      },
      {
        kind: 'adjetivo', label: 'iletsua', emoji: '🧸',
        visual_prompt: 'Txakurra ile oso harroarekin eta testura leun-marrekin, hondorik gabe, kontraste handia.',
        tts_string: 'Ukitu! Txakurra bigun eta iletsua da. Nolakoa da txakurra? Esan: iletsua.',
        stt_expected_array: ['iletsua', 'iletsu', 'ietsua', 'iletua'],
        parent_tpr_action: 'Laztandu panpina edo manta leun bat eta esan "iletsua" eskua poliki pasatuz.',
      },
    ],
  },
  {
    id: 'seq-behia', theme: 'Animaliak · Behia', icon: '🐄',
    phases: [
      {
        kind: 'onomatopeya', label: 'muu', emoji: '🐄',
        visual_prompt: 'Komiki-bunbuiloa "MUU" eta joare batekin, hondorik gabe, kontraste handia.',
        tts_string: 'Behiak egiten du: Muuu! Nola egiten du behiak? Esan: muu.',
        stt_expected_array: ['muu', 'mu', 'muuu', 'mú'],
        parent_tpr_action: 'Jarri eskuak adar gisa buruan eta egin "muuu!" soinua luzatuz haurrarekin.',
      },
      {
        kind: 'sustantivo', label: 'behia', emoji: '🐄',
        visual_prompt: 'Behia zutik profilean orbanekin, kolore lauak, hondorik gabe, kontraste handia.',
        tts_string: 'Muuu! Hau behia da. Zer da? Esan: behia.',
        stt_expected_array: ['behia', 'beia', 'bia', 'behi'],
        parent_tpr_action: 'Seinalatu jostailuzko behi bat edo argazki bat eta ibili haren orbanak hatzarekin "behia" esanez.',
      },
      {
        kind: 'verbo', label: 'jaten', emoji: '🌿',
        visual_prompt: 'Behia burua makurtuta belar berdearen gainean, hondorik gabe, kontraste handia.',
        tts_string: 'Begira, behiak belarra jaten du zelaian. Zer egiten du behiak? Esan: jaten.',
        stt_expected_array: ['jaten', 'aten', 'ñaten', 'jate'],
        parent_tpr_action: 'Makurtu burua behia bezala eta egin belarra murtxikatzen ari zaretela masailezurra mugituz "jaten" esatean.',
      },
      {
        kind: 'adjetivo', label: 'handia', emoji: '🔎',
        visual_prompt: 'Behia haur-silueta txiki baten ondoan tamaina-kontrastea markatzeko, hondorik gabe, kontraste handia.',
        tts_string: 'Ala! Behia oso handia da. Nolakoa da behia? Esan: handia.',
        stt_expected_array: ['handia', 'andia', 'hania', 'handi'],
        parent_tpr_action: 'Zabaldu besoak ahal duzuen guztia eta jarri punta-puntetan "haaandia!" esanez.',
      },
    ],
  },
  {
    id: 'seq-katua', theme: 'Animaliak · Katua', icon: '🐱',
    phases: [
      {
        kind: 'onomatopeya', label: 'miau', emoji: '🐱',
        visual_prompt: 'Komiki-bunbuiloa "MIAU" eta artile-mataza batekin, hondorik gabe, kontraste handia.',
        tts_string: 'Katuak miau egiten du: Miau, miau! Nola egiten du katuak? Esan: miau.',
        stt_expected_array: ['miau', 'mia', 'niau', 'miau miau'],
        parent_tpr_action: 'Igurtzi aurpegia eskuarekin katu bat garbitzen bezala eta egin "miau!" haurrarekin.',
      },
      {
        kind: 'sustantivo', label: 'katua', emoji: '🐈',
        visual_prompt: 'Katua eserita aurretik buztana kiribilduta, kolore lauak, hondorik gabe, kontraste handia.',
        tts_string: 'Miau! Hau katua da. Zer da? Esan: katua.',
        stt_expected_array: ['katua', 'atua', 'katu', 'kato'],
        parent_tpr_action: 'Seinalatu jostailuzko katu bat edo argazki bat eta laztandu haren bizkarra "katua" errepikatuz.',
      },
      {
        kind: 'verbo', label: 'lo egiten', emoji: '😴',
        visual_prompt: 'Katua kizkurtuta begiak itxita hiru "Z" gainean, hondorik gabe, kontraste handia.',
        tts_string: 'Isss… katua bere ohean lo egiten ari da. Zer egiten du katuak? Esan: lo egiten.',
        stt_expected_array: ['lo egiten', 'lo eiten', 'lo', 'loiten'],
        parent_tpr_action: 'Elkartu eskuak masailaren azpian, itxi begiak eta egin "isss" haurrak zurekin "lo egin" dezan.',
      },
      {
        kind: 'adjetivo', label: 'leuna', emoji: '🪶',
        visual_prompt: 'Katua luma batekin bere ilea ukituz eta testura leun-marrekin, hondorik gabe, kontraste handia.',
        tts_string: 'Ukitu! Katuaren ilea oso leuna da. Nolakoa da katua? Esan: leuna.',
        stt_expected_array: ['leuna', 'euna', 'lena', 'leun'],
        parent_tpr_action: 'Pasa luma bat edo zapi bat haurraren besotik oso poliki "leuna" esanez.',
      },
    ],
  },
  {
    id: 'seq-euria', theme: 'Natura · Euria', icon: '🌧️',
    phases: [
      {
        kind: 'onomatopeya', label: 'plisti plasta', emoji: '💧',
        visual_prompt: 'Hiru ur-tanta erortzen uhin txikiekin talka egitean, hondorik gabe, kontraste handia.',
        tts_string: 'Euria erortzen da: Plisti, plasta! Nola egiten du euriak? Esan: plisti, plasta.',
        stt_expected_array: ['plisti plasta', 'plisti', 'pisti pasta', 'plas plas'],
        parent_tpr_action: 'Jo hatzekin mahaian euri-tantak bezala eta haurrak zurekin "euria" egin dezan.',
      },
      {
        kind: 'sustantivo', label: 'ura', emoji: '💧',
        visual_prompt: 'Ur-tanta handi eta distiratsu bat aurretik, urdin laua, hondorik gabe, kontraste handia.',
        tts_string: 'Plisti, plasta! Hau ura da. Zer da? Esan: ura.',
        stt_expected_array: ['ura', 'ua', 'uda', 'u'],
        parent_tpr_action: 'Busti hatz bat ur errealean eta ukitu eskua hotza nabarituz "ura" esaten duzuen bitartean.',
      },
      {
        kind: 'verbo', label: 'erortzen', emoji: '⬇️',
        visual_prompt: 'Ur-tanta behera gezi batekin eta gorago silueta mamu bat, hondorik gabe, kontraste handia.',
        tts_string: 'Begira, ura zerutik erortzen da. Zer egiten du urak? Esan: erortzen.',
        stt_expected_array: ['erortzen', 'erotzen', 'eortzen', 'erorten'],
        parent_tpr_action: 'Altxatu eskuak gora eta jaitsi hatzak mugituz lurreraino "erortzeeen" esanez.',
      },
      {
        kind: 'adjetivo', label: 'busti', emoji: '💦',
        visual_prompt: 'Eskua ur-tantak irristatzen eta zipriztin txikiekin, hondorik gabe, kontraste handia.',
        tts_string: 'Ai! Eskua busti dago. Nola dago eskua? Esan: busti.',
        stt_expected_array: ['busti', 'buti', 'usti', 'busi'],
        parent_tpr_action: 'Busti pixka bat haurraren eskua zapi busti batekin eta esan "busti" eskuak astinduz.',
      },
    ],
  },
  {
    id: 'seq-trena', theme: 'Garraioa · Trena', icon: '🚂',
    phases: [
      {
        kind: 'onomatopeya', label: 'txu txu', emoji: '🚂',
        visual_prompt: 'Jostailuzko lokomotora ke-hodeiarekin eta "TXU" letra estilizatuekin, hondorik gabe, kontraste handia.',
        tts_string: 'Trenak egiten du: Txu, txu! Nola egiten du trenak? Esan: txu, txu.',
        stt_expected_array: ['txu txu', 'txu', 'tutu', 'tu tu'],
        parent_tpr_action: 'Egin trentxo bat: haurra zure gerritik heltzen da eta aurrera egin korridorean "txu-txu" erritmoan.',
      },
      {
        kind: 'sustantivo', label: 'trena', emoji: '🚆',
        visual_prompt: 'Hiru bagoiko trena profilean bide zuzen baten gainean, kolore lauak, hondorik gabe, kontraste handia.',
        tts_string: 'Txu, txu! Hau trena da. Zer da? Esan: trena.',
        stt_expected_array: ['trena', 'tena', 'terena', 'tren'],
        parent_tpr_action: 'Lerrokatu hiru koxin edo kutxa bagoi gisa eta seinalatu banan-banan "trena" esanez.',
      },
      {
        kind: 'verbo', label: 'gelditzen', emoji: '🛑',
        visual_prompt: 'Trena gelditua stop seinale gorri baten aurrean, hondorik gabe, kontraste handia.',
        tts_string: 'Trena geltokira iristen da eta… gelditzen da! Zer egiten du trenak? Esan: gelditzen.',
        stt_expected_array: ['gelditzen', 'geditzen', 'geltzen', 'geldizen'],
        parent_tpr_action: 'Ibili tren bat bezala gelan eta, "gelditu!" entzutean, geratu estatua bezala izoztuta.',
      },
      {
        kind: 'adjetivo', label: 'luzea', emoji: '📏',
        visual_prompt: 'Bagoi askoko tren oso luzea muturretik muturrera gezi horizontal batekin, hondorik gabe, kontraste handia.',
        tts_string: 'Zenbat bagoi! Trena oso luzea da. Nolakoa da trena? Esan: luzea.',
        stt_expected_array: ['luzea', 'uzea', 'luea', 'luze'],
        parent_tpr_action: 'Luzatu besoak alboetara ahal duzuen guztia "luuuzea" esanez.',
      },
    ],
  },
  {
    id: 'seq-txoria', theme: 'Animaliak · Txoria', icon: '🐦',
    phases: [
      {
        kind: 'onomatopeya', label: 'pio pio', emoji: '🐣',
        visual_prompt: 'Komiki-bunbuiloa "PIO PIO" eta txitatxo bat agertzen, hondorik gabe, kontraste handia.',
        tts_string: 'Txoritxoak kantatzen du: Pio, pio! Nola egiten du txoriak? Esan: pio, pio.',
        stt_expected_array: ['pio pio', 'pio', 'io io', 'pi pi'],
        parent_tpr_action: 'Elkartu hatzak irekitzen eta ixten den moko bat bezala eta egin "pio, pio" biok batera.',
      },
      {
        kind: 'sustantivo', label: 'txoria', emoji: '🐦',
        visual_prompt: 'Txoria profilean adar baten gainean pausatuta, kolore lauak, hondorik gabe, kontraste handia.',
        tts_string: 'Pio, pio! Hau txoria da. Zer da? Esan: txoria.',
        stt_expected_array: ['txoria', 'toria', 'txoia', 'txori'],
        parent_tpr_action: 'Bilatu txori bat leihotik edo marrazki batean, seinalatu eta agurtu eskuarekin.',
      },
      {
        kind: 'verbo', label: 'hegan', emoji: '🕊️',
        visual_prompt: 'Txoria hegoak zabalduta hegaldi-marra kurbatuekin, hondorik gabe, kontraste handia.',
        tts_string: 'Begira, txoriak hegan egiten du zeruan. Zer egiten du txoriak? Esan: hegan.',
        stt_expected_array: ['hegan', 'egan', 'hean', 'gan'],
        parent_tpr_action: 'Egin korrika gelan besoak hego gisa, gora eta behera altxatuz.',
      },
      {
        kind: 'adjetivo', label: 'txikia', emoji: '🐤',
        visual_prompt: 'Txoritxo txiki-txikia bi esku irekiren barruan katilu gisa, hondorik gabe, kontraste handia.',
        tts_string: 'Txoritxoa oso txikia da. Nolakoa da txoria? Esan: txikia.',
        stt_expected_array: ['txikia', 'tikia', 'txiia', 'txiki'],
        parent_tpr_action: 'Elkartu eskuak asko txoritxo txiki bat helduko bazenute bezala eta hitz egin poliki.',
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
    physical_setup: 'Prestatu animalia bereko bi panpina baina tamaina desberdinekoak: bat argi eta garbi HANDIA eta bestea argi eta garbi TXIKIA. Jarri elkarren ondoan haurraren aurrean.',
    rounds: [
      {
        label: 'handia', emoji: '🐘',
        tts_trigger: 'Zein da panpina HANDIA? Emadazu eta esan! Esan: handia.',
        stt_expected_array: ['handia', 'andia', 'hania', 'handi'],
        parent_action: 'Haurrak panpina handia ematen dizu esaten duen bitartean; besarkatu zein erraldoia den puztuz.',
      },
      {
        label: 'txikia', emoji: '🐭',
        tts_trigger: 'Orain alderantziz: zein da TXIKIA? Emadazu eta esan! Esan: txikia.',
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
        label: 'zikin', emoji: '🐷',
        tts_trigger: 'Seinalatu koilara ZIKINA. Nola dago hau? Esan: zikin.',
        stt_expected_array: ['zikin', 'ikin', 'ziki', 'tikin'],
        parent_action: 'Haurrak koilara zikina seinalatzen du eta biok "puaj!" aurpegia jartzen duzue baztertuz.',
      },
      {
        label: 'garbi', emoji: '✨',
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
        label: 'ireki', emoji: '🔓',
        tts_trigger: 'Jostailua barruan dago. Zer egingo dugu ateratzeko? Goazen IREKITZERA! Esan: ireki.',
        stt_expected_array: ['ireki', 'irek', 'ieki', 'ike'],
        parent_action: 'Ireki kutxa elkarrekin, oso poliki, eta ospatu jostailua aurkitzea "tatxan!" batekin.',
      },
      {
        label: 'itxi', emoji: '🔒',
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
        tts_trigger: 'Kotxea mendira doa. Zer egiten du? IGO egiten du! Esan: igo.',
        stt_expected_array: ['igo', 'io', 'go', 'igu'],
        parent_action: 'Igo kotxea arrapalatik oso poliki hitza entzuten den bitartean.',
      },
      {
        label: 'jaitsi', emoji: '⬇️',
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
        label: 'hotz', emoji: '❄️',
        tts_trigger: 'Ukitu basoak. Zein dago HOTZ? Brrr! Esan: hotz.',
        stt_expected_array: ['hotz', 'otz', 'hots', 'ho'],
        parent_action: 'Haurrak baso hotza ukitzen du; dardaratu biok "brrr!" sorbaldak uzkurtuz.',
      },
      {
        label: 'bero', emoji: '🔥',
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
        tts_trigger: 'Ilun dago… Zer egingo dugu argiarekin? PIZTU dezagun! Esan: piztu.',
        stt_expected_array: ['piztu', 'iztu', 'pistu', 'pitu'],
        parent_action: 'Haurrak etengailua sakatzen du esatean eta argia ospatzen duzue "ooooh!" batekin.',
      },
      {
        label: 'itzali', emoji: '🌑',
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
