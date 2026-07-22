// ============================================================================
// Valeria+ · Audición y Lenguaje en EUSKERA batua — plan ILENIA/NEL-GAITU
//
// ESTADO: ✅ APROBADO PARA PRODUCCIÓN (revisión logopédica de Ulertuz y de
// euskera normativo/batua cumplida). A diferencia del override dominicano (dialectal, parcial),
// aquí el contenido está REAUTORIZADO en euskera: cada ejercicio redefine sus
// cadenas visibles/locutables (consigna, fichas, prompts, EPT-3, movimiento…).
// Los ejercicios de fonología/ortografía se adaptan al euskera:
//   · Vocales (FF-1/FF-3): mismas 5 vocales; palabras vascas.
//   · Morfosintaxis (MS-1 plural -ak, MS-2 sin género gramatical, MS-3 orden SOV).
//   · Dislexia: rimas, síntesis fonémica y pseudopalabras propias del euskera.
// Se locuta con la voz neuronal HiTZ-TTS (enumerado en el corpus). Módulo PURO.
// ============================================================================
import type { Exercise } from './valeriaExerciseBank';

// ---- Constantes de pantalla localizadas (las consume el player por variedad) ----
export const EMO_EU: { face: string; label: string }[] = [
  { face: '😀', label: 'Poza' }, { face: '😢', label: 'Tristura' },
  { face: '😠', label: 'Haserrea' }, { face: '🤕', label: 'Mina' },
];
export const SESSION_DONE_LEAD_EU = 'Saioa amaituta!';
export const PLURAL_HINT_EU = 'Hor bakarra dago. Bilatu asko dauden lekua.';
export const EMOTION_PROMPT_EU = 'Nola sentitzen da?';
export const TOUCH_IMAGE_HINT_EU = 'Lehenengo, ukitu irudi bat.';

// Veredictos hablados del juego de micrófono (MicPracticeCard), indexados por
// MatchLevel (0 = otra vez, 1 = casi, 2 = genial). Los consume la UI vía
// micVerdictSayFor(loc) para que en euskera suene el asset neuronal HiTZ en
// lugar del veredicto castellano (que rompía la continuidad de la voz vasca).
export const MIC_VERDICT_SAY_EU: [string, string, string] = [
  'Berriro entzungo dugu.',
  'Ia-ia! Berriro saiatuko gara.',
  'Oso ondo! Bikain esan duzu!',
];

// Veredictos y piezas fijas de voz (espejo de EXERCISE_FIXED_LINES en euskera).
export const EXERCISE_FIXED_LINES_EU: { style: 'tutor' | 'child' | 'slow'; text: string }[] = [
  ...MIC_VERDICT_SAY_EU.map((t) => ({ style: 'child' as const, text: t })),
  { style: 'child', text: TOUCH_IMAGE_HINT_EU },
  ...EMO_EU.map((e) => ({ style: 'child' as const, text: e.label })),
  { style: 'child', text: SESSION_DONE_LEAD_EU },
  { style: 'child', text: PLURAL_HINT_EU },
  // Prompt de emociones con opciones (SpeakButton «Oír las opciones» de PR-3):
  // MISMO literal que construye emotionPromptFor(loc) en el player, para que
  // resuelva el asset neuronal en vez de caer a la voz del sistema.
  { style: 'tutor', text: `${EMOTION_PROMPT_EU} ${EMO_EU.map((e) => e.label).join(', ')}?` },
];

// ---------------------------------------------------------------------------
// Overrides por ejercicio (ronda 1). Reautorización completa en euskera.
// ---------------------------------------------------------------------------
export const EXERCISE_EU: Record<string, Partial<Exercise>> = {
  // ===================== AUDICIÓN (Fonética-Fonología) =====================
  ff1: {
    read: 'Umeak irudi bat ukitzen du bere izena entzuteko eta gero hasten den bokala ukitzen du. Aplikazioak asmatu duen esaten dio.',
    stageLabel: 'Lotu irudi bakoitza bere bokalarekin',
    tiles: [{ cap: 'armiarma', emoji: '🕷️' }, { cap: 'elefantea', emoji: '🐘' }, { cap: 'igela', emoji: '🐸' }],
    move: 'Marraztu bokala airean besoarekin oso handi asmatzen duen bakoitzean.',
    ept: ['Oraindik ez du irudia bere bokalarekin lotzen, laguntzarekin ere ez.', 'Bokala asmatzen du helduak pista bat ematen dionean.', 'Irudi bakoitza bere bokalarekin lotzen du berak bakarrik.'],
  },
  ff2: {
    read: 'Esan zuk lehenengo hitza, umearengandik gertu eta poliki, eta animatu errepikatzera. Aplikazioaren ahotsa laguntza gehigarria besterik ez da.',
    stageLabel: 'Errepikatu hitza', phrase: 'ZAPATA', phraseEmoji: '👟',
    move: 'Ibili gelan zehar silaba bakoitzean zapaldu gogor: ZA-PA-TA.',
    ept: ['Oraindik ez du soinua imitatzen edo hitzetik oso urrun geratzen da.', 'Hitza errepikatzen du zuri behin baino gehiagotan entzun ondoren.', 'Hitza berak bakarrik esaten du, bokal guztiak argi.'],
  },
  ff3: {
    read: 'Lehenengo sakatu 🔊 umeak hitz osoa entzun dezan. Gero, idatzitako hitzari falta zaion bokala uki dezala.',
    stageLabel: 'Entzun hitza eta osatu bokala', fillBefore: 'K', fillAfter: 'TU', fillAnswer: 'A', fillEmoji: '🐱', fillCap: 'katu',
    move: 'Bokala aurkitzean, besoak gora katu handi bat eginez.',
    ept: ['Oraindik ez du falta den bokala aurkitzen, laguntzarekin ere ez.', 'Hitza osatzen du soinua errepikatzen badiozu edo pista bat ematen badiozu.', 'Hitza entzun eta falta den bokala berak bakarrik ukitzen du.'],
  },
  se1: {
    read: 'Sakatu 🔊 lau fitxen izena entzuteko. Hiru elkarrekin doaz eta bat ez. Umeak besteekin joaten EZ dena ukitzen du.',
    stageLabel: 'Ukitu besteekin joaten ez den fitxa',
    intruder: [{ cap: 'sagarra', emoji: '🍎' }, { cap: 'platanoa', emoji: '🍌' }, { cap: 'mahatsa', emoji: '🍇' }, { cap: 'kotxea', emoji: '🚗' }], intruderAnswer: 3,
    move: 'Jaten bada, ukitu tripa; intrusoa bada, izar-salto!',
    ept: ['Oraindik ez du besteekin joaten ez den fitxa aurkitzen.', 'Aurkitzen du laguntza-galdera bat egiten diozunean ("zeintzuk jaten dira?").', 'Berak bakarrik aurkitzen du eta zergatik ez doan azaltzen du.'],
  },
  se2: {
    read: 'Sakatu 🔊 asmakizuna entzuteko (edo irakurri zuk). Umeak hiru irudietako bat ukituz erantzuten du.',
    stageLabel: 'Entzun asmakizuna eta ukitu erantzuna',
    choicePrompt: 'Horia da, luzea eta biguna, eta tximinoei asko gustatzen zaie. Zer da?', choiceLabel: 'Asmakizuna entzun', choiceVoice: 'tutor',
    options: [{ cap: 'platanoa', emoji: '🍌' }, { cap: 'udarea', emoji: '🍐' }, { cap: 'pilota', emoji: '⚽' }], optionAnswer: 0,
    move: 'Bilatu gelan zehar hasieran soinu bera duen objektu erreal bat.',
    ept: ['Oraindik ez du erantzuna asmatzen, pista gehiagorekin ere ez.', 'Asmatzen du asmakizuna errepikatu edo beste pista bat eman ondoren.', 'Lehenengoan asmatzen du, asmakizuna entzun besterik ez.'],
  },
  se3: {
    materials: 'Panpina edo txotxongilo bat eta benetako arropak: txapela, zapatak, kamiseta…',
    read: 'Hartu panpina eta arropa. Eman umeari agindu bat aldiro: "Jarri txapela panpinari". Aldatu arropa txandaka.',
    stageLabel: 'Entzun agindua eta jantzi panpina', instrHint: 'Umeak zure agindua entzun eta panpina arropa egokiarekin janzten du.',
    move: 'Jolastu benetan janzten: ekar dezala txapela korrika eta jantzi.',
    ept: ['Oraindik ez ditu arropak ezagutzen ez du agindua betetzen.', 'Arropa egokia jartzen du lehenago behin erakusten badiozu.', 'Agindua entzun eta panpina berak bakarrik janzten du.'],
  },
  ms1: {
    read: 'Umeak ASKO dauden txartela ukitzen du. Gero galdetu "zer dira?" pluralez esan dezan: "katuak".',
    stageLabel: 'Ukitu asko dauden lekua eta esan',
    plural: { cap: 'katu', capPlural: 'katuak', emoji: '🐱', gender: 'm' },
    move: 'Salto handi bat BAT badago, salto txiki asko ASKO badaude.',
    ept: ['Oraindik ez du "bat" eta "asko" bereizten.', 'Plurala ("katuak") esaten du zuk lehenago esaten badiozu.', 'Asko dauden lekua ukitu eta plurala berak bakarrik esaten du.'],
  },
  ms2: {
    read: 'Sakatu 🔊 hitza entzuteko. Umeak irudi egokia ukitzen du. Gero alderantziz: zuk irudi bat seinalatu eta berak hitza esaten du.',
    stageLabel: 'Entzun hitza eta ukitu irudia',
    choicePrompt: 'neska', choiceLabel: 'Hitza entzun', choiceVoice: 'slow',
    options: [{ cap: 'mutila', emoji: '👦' }, { cap: 'neska', emoji: '👧' }], optionAnswer: 1,
    move: 'Gelaren alde bat "mutila" da eta bestea "neska": korri egin alde egokira!',
    ept: ['Oraindik nahasten ditu mutil eta neska hitzak.', 'Asmatzen du hitzaren amaiera gogorarazten badiozu.', 'Irudia ukitu eta hitz egokia berak bakarrik esaten du.'],
  },
  ms3: {
    read: 'Sakatu 🔊 umeak esaldia entzun dezan. Gero, fitxak ordenan ukitu dezala eraikitzeko: nork, zer eta zer egiten duen. Euskaraz aditza azkena doa.',
    stageLabel: 'Entzun esaldia eta ordenatu fitxak',
    parts: [{ role: 'Subjektua', cap: 'mutilak', emoji: '👦' }, { role: 'Objektua', cap: 'sagarra', emoji: '🍎' }, { role: 'Aditza', cap: 'jaten du', emoji: '😋' }], sentence: 'Mutilak sagarra jaten du.',
    move: 'Antzeztu esaldia: umeak aktore lana egiten du eta sagar imajinario bat "jaten du".',
    ept: ['Hitz solteak baino ez ditu esaten ("mutila", "sagarra").', 'Esaldia eraikitzen du zuk hasten laguntzen badiozu.', 'Fitxak ordenatu eta esaldi osoa berak bakarrik esaten du.'],
  },
  pr1: {
    read: 'Seinalatu gelako gauzak eta galdetu: "Zer da hau?". Grabatu edo idatzi behean umeak erantzuten duena.',
    instrHint: 'Lehenengo berak erantzuten die zure galderei; gero animatu zuri "zer da hau?" galdetzera.',
    capture: 'Galdetu "zer da hau?" objektu bat seinalatuz. Grabatu mikroarekin edo idatzi bere erantzuna.',
    move: 'Ibili etxean esploratzaile gisa objektuak seinalatuz: "zer da hau?" geldialdi bakoitzean.',
    ept: ['Oraindik ez dio galderari erantzuten.', 'Erantzuten du lehenago zuk erantzun-adibide bat ematen badiozu.', 'Berak bakarrik erantzuten du eta zuri ere galderak egiten dizkizu.'],
  },
  pr2: {
    materials: 'Panpina edo txotxongilo bat',
    read: 'Panpina lo dago: hitz egin oso baxu ez esnatzeko. "Esnatzen" denean, itzuli ahots normalera. Idatzi behean nola egiten duen.',
    instrHint: 'Panpina lo = ahots baxua. Panpina esna = ahots normala. Umeak bere ahotsa aldatu behar du jolasarekin.',
    scenes: [
      { emoji: '😴', label: 'Lo → ahots baxua', say: 'Isss… panpina lo dago. Oso-oso baxu hitz egiten dugu.' },
      { emoji: '😀', label: 'Esna → ahots normala', say: 'Panpina esnatu da! Orain ahots normalarekin hitz egiten dugu.' },
    ],
    capture: 'Grabatu edo idatzi nola hitz egin duen umeak: jaitsi al du ahotsa panpina lo zegoenean?',
    move: 'Ibili puntetan baxu hitz eginez; seinalean, ahots normala eta pauso gogorra!',
    ept: ['Berdin ozen hitz egiten du panpina lo egon arren.', 'Ahotsa jaisten du zuk gogorarazten diozunean.', 'Berak bakarrik aldatzen du ahots baxutik normalera jolasaren arabera.'],
  },
  pr3: {
    read: 'Begiratu aurpegi handia umearekin. Sakatu 🔊 aukerak entzun nahi baditu. Berak aurpegia nola sentitzen den ukitzen du.',
    stageLabel: 'Ezagutu emozioa', emotionFace: '😀', emotionAnswer: 'Poza',
    move: 'Imitatu emozioa gorputz osoarekin: aurpegia, besoak eta estatua-jarrera.',
    ept: ['Oraindik ez du ezagutzen aurpegia nola sentitzen den.', 'Emozioa asmatzen du pistak ematen badizkiozu ("begiratu ahoari").', 'Emozioa berak bakarrik esaten du eta zergatik sentitzen den azaltzen du.'],
  },
  pr4: {
    read: 'Estali ahoa eta esan hitz bat ia ahotsik gabe. Umeak ulertzen ez badu, eskatu behar dizu: "zer?" edo "nola?". Hori da lantzen duguna: errepikatzeko eskatzea.',
    instrHint: 'Helburua EZ da hitzak errepikatzea: umeak ikas dezala ulertu ez duena errepikatzeko eskatzen.',
    micTarget: 'zer', micAlt: ['nola', 'barkatu'], micPrompt: 'Ulertzen ez dizunean, sakatu mikroa eta eska dezala: "zer?" edo "nola?"',
    move: 'Xuxurlatu agindu bat urrunetik; ulertzen ez bada, etor dadila korrika eta eska dezala "zer?".',
    ept: ['Isilik geratzen da edo uzten du zerbait ulertzen ez duenean.', '"Zer?" eskatzen du eska dezakeela gogorarazten diozunean.', '"Zer?" edo "nola?" berak bakarrik eskatzen du ulertzen ez duenean.'],
  },

  // ============================ LENGUAJE (ACOPROS) ============================
  atencion_conjunta: {
    read: 'Deitu umeari bere izenez eta egin burbuilak. Bilatu bere begirada eta begi-kontaktua.',
    instrHint: 'Garatu begi-kontaktua, begiradaren jarraipena eta izenari erantzutea.',
    move: 'Jarraitu eta lehertu burbuilak elkarrekin: burbuila bat, begirada bat.',
    ept: ['Laguntza fisikoa behar du begirada une batez eusteko.', 'Bere izenari erantzuten dio behin baino gehiagotan deitu ondoren.', 'Berak bakarrik begiratzen dizu eta zure begirada jarraitzen du.'],
    levels: [
      { label: 'Inicial', instrIcon: '🫧', read: 'Hurbildu burbuilak zure aurpegitik oso gertu eta deitu bere izena. Bilatu begi-kontaktu labur bat, une batekoa bada ere.', instrHint: 'Interes handiko estimulua eta oso gertukoa. Edozein begirada laburrek balio du.' },
      { label: 'Intermedio', instrIcon: '👀', read: 'Egin burbuilak beso baten distantziara. Deitu bere izena eta seinalatu hatzarekin burbuiletara.', instrHint: 'Begiradaren jarraipena bultzatzen du tutoreak seinalatzen duen lekura.' },
      { label: 'Avanzado', instrIcon: '🙋', read: 'Gelaren beste aldetik, deitu bere izena behin bakarrik estimulu motibatzailerik gabe.', instrHint: 'Izenari erantzun espontaneoa bilatzen du, laguntza bisualik gabe.' },
    ],
  },
  imitacion: {
    read: 'Egin keinu bat (txalo jo, danborra jo) eta animatu imitatzera. Orain silaba bat: "pa-pa".',
    instrHint: 'Keinu motore lodiak eta ahoskatze sinpleak imitatzen ditu ispiluan.',
    move: 'Giza ispilua: imitatu keinu handiak (besoak, saltoak, bueltak) txandaka.',
    ept: ['Oraindik ez ditu keinuak ez soinuak kopiatzen.', 'Keinu edo soinu solteak imitatzen ditu helduaren laguntzarekin.', 'Keinuak eta soinuak ikusi bezain laster errepikatzen ditu, ispilu bat bezala.'],
    levels: [
      { label: 'Inicial', instrIcon: '👏', read: 'Jo txalo poliki bere aurrean eta gidatu bere eskuak lehen aldian. Errepikatu keinua bakarrik.', instrHint: 'Keinu motore lodi isolatua, laguntza fisikoarekin behar bada.' },
      { label: 'Intermedio', instrIcon: '🥁', read: 'Jo danborra bi aldiz eta esan "pa-pa". Itxaron keinua edo soinua imita dezan laguntza fisikorik gabe.', instrHint: 'Keinu + silaba sekuentzia laburra, eredu bisuala soilik.' },
      { label: 'Avanzado', instrIcon: '🪞', read: 'Konbinatu keinu bat eta silaba berri bat ("ta-ta" + salto) eta ikusi ispiluan imitatzen duen, berehala eta eredua errepikatu gabe.', instrHint: 'Konbinazio berri baten berehalako imitazioa, eredua errepikatu gabe.' },
    ],
  },
  comprension: {
    read: 'Eman urrats bateko agindu bat: "Emadazu pilota". Eskatu gorputz-atalak seinala ditzan.',
    instrHint: 'Urrats bateko aginduak ulertzen ditu eta gorputz-atalak eta objektuak identifikatzen.',
    move: 'Jolastu "Simonek dio" urrats bateko aginduekin eta gorputz-atalekin.',
    ept: ['Ez ditu aginduak betetzen ez ditu eskatutako elementuak seinalatzen.', 'Agindua betetzen du seinalatze-keinuen laguntzarekin.', 'Agindu hitzezko hutsa ulertu eta betetzen du.'],
    levels: [
      { label: 'Inicial', instrIcon: '🤲', read: 'Esan "Emadazu pilota" pilota hatzarekin seinalatzen duzun bitartean.', instrHint: 'Urrats bateko agindua tutorearen keinu-laguntza zuzenarekin.' },
      { label: 'Intermedio', instrIcon: '🧍', read: 'Eskatu "Ukitu sudurra" eta "Ukitu burua" laguntza-keinurik gabe.', instrHint: 'Gorputz-atalak identifikatzea hitzezko agindu hutsarekin.' },
      { label: 'Avanzado', instrIcon: '🧩', read: 'Esan keinurik gabe: "Emadazu pilota eta eseri". Ikusi bi urratsak ordenan betetzen dituen.', instrHint: 'Bi urratseko hitzezko agindua, keinu-laguntzarik gabe.' },
    ],
  },
  expresion: {
    read: 'Nola egiten du txakurrak? "Zaunk". Animatu izendatzera eta eskatzera: "ura nahi dut".',
    stageLabel: 'Gogoratu eta izendatu', phrase: 'URA NAHI DUT', phraseEmoji: '💧',
    move: 'Iturrira lasterketa: "ura" hitz magikoa esaten badu bakarrik irekitzen da.',
    ept: ['Keinuak edo marmarrak baino ez ditu erabiltzen behar duena eskatzeko.', 'Hitz sinpleak esaten ditu zuri entzun ondoren.', 'Hitzak eta bi hitzeko esaldiak berak bakarrik esaten ditu.'],
    levels: [
      { label: 'Inicial', instrIcon: '🐶', read: 'Erakutsi txakurraren panpina eta eredua eman: "Zaunk". Itxaron onomatopeia errepika dezan.', instrHint: 'Onomatopeia baten imitazio zuzena helduaren ereduaren ondoren.' },
      { label: 'Intermedio', instrIcon: '🏷️', read: 'Erakutsi ur-baso bat ezer esan gabe eta galdetu: "Zer da hau?".', instrHint: 'Objektu ezagun bat espontaneoki izendatzea, eredurik gabe.' },
      { label: 'Avanzado', instrIcon: '🗣️', read: 'Eskaini baso hutsa eta itxaron espontaneoki "ura nahi dut" eska dezan bi hitzak konbinatuz.', instrHint: 'Bi hitzen konbinazio espontaneoa eskaera funtzional batean.' },
    ],
  },
  comunicacion_funcional: {
    read: 'Gelditu zerbait dibertigarria egiten eta itxaron. Animatu "gehiago" edo "lagundu" eskatzera.',
    instrHint: 'Jolasa edo laguntza eskatzen du hitzekin, keinuekin edo zeinuekin.',
    move: 'Zabua, hegazkina edo kilimak: gelditu jolasa eta itxaron "gehiago" eska dezan.',
    ept: ['Frustratu egiten da edo ez du komunikatzen saiatzen zerbait gaizki ateratzen denean.', 'Laguntza edo "gehiago" eskatzen du zuk lehenago hitza esaten badiozu.', 'Hitzekin edo zeinuekin eskatzen du, berak bakarrik eta asmo argiarekin.'],
    levels: [
      { label: 'Inicial', instrIcon: '🤚', read: 'Gelditu jolas dibertigarri bat (kilimak, zabua) eta eredua eman keinua + "gehiago" hitza. Lagundu imitatzen.', instrHint: '"Gehiago" eskaera tutoreak ereduztatutako keinu eta hitzarekin.' },
      { label: 'Intermedio', instrIcon: '🔒', read: 'Eman gustuko zerbait duen ontzi itxi bat eta itxaron. Frustratzen bada, iradoki ahopeka "lagundu".', instrHint: '"Lagundu" eskaera oztopo baten aurrean, hitzezko pista partzialarekin.' },
      { label: 'Avanzado', instrIcon: '💬', read: 'Sortu beste behar-egoera bat (jostailua eskuz kanpo) inolako pistarik eman gabe eta itxaron eskaera espontaneoa.', instrHint: 'Eskaeraren hasiera espontaneoa, hitzezko edo keinuzko pistarik gabe.' },
    ],
  },
  regulacion_conductual: {
    read: 'Abisatu jarduera-aldaketaz agenda bisualarekin eta itxaron lasai.',
    instrHint: 'Jarduera-aldaketa aurreikusi eta onartzen du laguntza bisualarekin eta fitxekin.',
    move: 'Ibili elkarrekin hurrengo jardueraruntz trantsizioen abestia kantatuz.',
    ept: ['Haserretu egiten da edo deskontrolatzen da jarduera-aldaketetan.', 'Aldaketa onartzen du fitxa bat sari gisa irabazten badu.', 'Jarduera lasai eta bere kabuz aldatzen du.'],
    levels: [
      { label: 'Inicial', instrIcon: '🖼️', read: 'Erakutsi hurrengo jardueraren irudia eta egin atzera-kontaketa bisuala 5etik 1era aldatu aurretik.', instrHint: 'Aurreikuspena laguntza bisual sendoarekin eta atzera-kontaketarekin.' },
      { label: 'Intermedio', instrIcon: '🎫', read: 'Abisatu aldaketa behin bakarrik eta eskaini fitxa bat jarduera lasai amaitzean.', instrHint: 'Aldaketa onartzen du fitxa-sarien laguntzarekin.' },
      { label: 'Avanzado', instrIcon: '📅', read: 'Utzi bere agenda bisuala bakarrik kontsultatzen eta trantsizioa egiten, abisatu behar izan gabe.', instrHint: 'Trantsizio autonomoa agenda jarraituz, tutorearen abisu zuzenik gabe.' },
    ],
  },
  interaccion_social: {
    read: 'Jolastu txandaka: "Orain zu, orain ni". Hasi jolas sinboliko sinple bat.',
    instrHint: 'Txandak errespetatzen ditu, jolas sinbolikoa hasten du eta afektiboki erantzuten.',
    move: 'Pasatu pilota bat biraka: pilota duenak bakarrik hitz egiten du. Txanda eta mugimendua!',
    ept: ['Bakarrik jolasten du eta txandak partekatzeari uko egiten dio.', 'Txandak onartzen ditu eta parte hartzen du zuk jolasa gidatzen baduzu.', 'Besteekin jolasak hasten ditu eta emateko eta hartzeko jarrera mantentzen du.'],
    levels: [
      { label: 'Inicial', instrIcon: '🔁', read: 'Pilatu bloke bat eta esan "orain zu". Lagundu fisikoki txandari erantzuten ez badio.', instrHint: 'Txanda sinple gidatua, laguntza fisikoarekin behar bada.' },
      { label: 'Intermedio', instrIcon: '🍽️', read: 'Eskaini panpina bat eta koilara bat; eredua eman "eman diezaiogun jaten" eta itxaron jolas sinbolikoa jarrai dezan.', instrHint: 'Jolas sinboliko laburraren hasiera ereduaren laguntzarekin.' },
      { label: 'Avanzado', instrIcon: '🎭', read: 'Utzi berak proposa dezan txanda- edo jolas sinboliko bat eta mantendu trukea gidatu gabe.', instrHint: 'Elkarrekikotasun espontaneoa: umeak hasi eta mantentzen du trukea.' },
    ],
  },

  // ==================== REHABILITACIÓN AUDITIVA (ACOPROS) ====================
  // Faltaban en la reautorización inicial: en euskera caían al castellano base
  // y el corpus los sintetizaba con la voz vasca (castellano con fonética
  // vasca = «suena mal los ejercicios»). Reautorizados en batua.
  ra1: {
    read: 'Lehenengo isiltasunean: esan zure ahots normalarekin "bilatu behia" eta uki dezala. Lasai asmatzen duenean, igo POLIKI-POLIKI atzeko zarata Panel Nagusitik (behean) eta errepikatu beste animalia batekin. Zure ahotsa da seinalea: ez egin oihurik ez exageratu; nekatuta ikusten baduzu, jaitsi zarata.',
    stageLabel: 'Entzun helduaren ahotsa eta ukitu animalia',
    choicePrompt: 'Bilatu behia.', choiceLabel: 'Laguntza: agindua entzun', choiceVoice: 'tutor',
    options: [{ cap: 'behia', emoji: '🐄' }, { cap: 'ardia', emoji: '🐑' }, { cap: 'zaldia', emoji: '🐴' }, { cap: 'oiloa', emoji: '🐔' }],
    optionAnswer: 0,
    move: 'Baserria etxean: ezkutatu peluxezko animaliak eta bilatu elkarrekin musika baxuarekin.',
    ept: ['Oraindik ez du eskatutako animalia aurkitzen, isiltasunean ere ez.', 'Isiltasunean asmatzen du, baina agindua galtzen du zarata igotzean.', 'Eskatutako animalia aurkitzen du atzeko zarata altua egon arren.'],
  },
  ra2: {
    read: 'LEHENENGO ahotsik gabe: esan hitza ezpainak bakarrik mugituz, poliki eta zure aurpegia ondo argiztatuta, eta umeak irudia uki dezala zure ezpainak irakurriz. GERO sakatu 🔊 soinua itzultzeko eta baieztatzeko. Ez zuzendu "ez" batekin: errepikatu eredua ahotsa eta ezpainak batera.',
    stageLabel: 'Irakurri helduaren ezpainak eta ukitu irudia',
    choicePrompt: 'ahatea', choiceLabel: 'Gero: hitza ahotsarekin entzun', choiceVoice: 'slow',
    options: [{ cap: 'ahatea', emoji: '🦆' }, { cap: 'ilargia', emoji: '🌙' }, { cap: 'eguzkia', emoji: '☀️' }],
    optionAnswer: 0,
    move: 'Jolastu ispilu mutura: batek hitz bat ahotsik gabe esaten du eta besteak asmatzen du. Aldatu rolak!',
    ept: ['Oraindik ez du hitzik ezagutzen ezpainengatik bakarrik.', 'Ezagutzen du gero eredua ahotsarekin eta ezpainekin batera ematen badiozu.', 'Hitza berak bakarrik ezagutzen du, ezpainak irakurriz soilik.'],
  },
  ra3: {
    read: 'Ia berdin soinatzen duten lau hitz. Esan zuk helburu-hitza ahots normalarekin eta uki dezala. Txanda bakoitzean zaildu pixka bat gehiago ZURE GORPUTZAREKIN: jaitsi zure ahotsaren bolumena edo urrundu pauso bat gehiago. Aplikazioak ez du bolumena ukitzen: estresorea zu zara, eta zuk erabakitzen duzu noiz gelditu.',
    stageLabel: 'Entzun hitza eta ukitu irudi egokia',
    choicePrompt: 'behia', choiceLabel: 'Laguntza: hitza entzun', choiceVoice: 'slow',
    options: [{ cap: 'behia', emoji: '🐄' }, { cap: 'begia', emoji: '👁️' }, { cap: 'ogia', emoji: '🍞' }, { cap: 'zubia', emoji: '🌉' }],
    optionAnswer: 0,
    move: 'Telefono bidaiaria: xuxurlatu hitza belarrira gelako izkina bakoitzetik.',
    ept: ['Oraindik antzeko hitzak nahasten ditu, ahots hurbil eta argiarekin ere.', 'Asmatzen du ahots normalarekin eta gertu, baina huts egiten du ahotsa jaistean edo urruntzean.', 'Hitz zuzena bereizten du ahots baxuarekin edo urrunetik ere.'],
  },
  ra4: {
    read: 'Sakatu 🔊 hiru urratseko agindu OSOA entzun dezan. Gero, giza kandadua: eutsi bere eskuei leuntasunez eta kontatu 5era isilik ukitzen utzi aurretik. Itxaronaldi horrek agindua memorian gordetzera behartzen du, ez korrika hustera.',
    stageLabel: 'Entzun hiru urratsak, itxaron eta ukitu ordenan',
    parts: [{ role: 'Lehenengo', cap: 'eguzkia', emoji: '☀️' }, { role: 'Gero', cap: 'txakurra', emoji: '🐶' }, { role: 'Ondoren', cap: 'etxea', emoji: '🏠' }],
    sentence: 'Ukitu eguzkia, gero txakurra eta ondoren etxea.',
    move: 'Aginduen zirkuitua: "ukitu atea, gero sofa eta ondoren leihoa", 5 segundoko itxaronaldi berarekin.',
    ept: ['Oraindik ez du sekuentzia gordetzen: ikusten duen lehenengoa ukitzen du.', 'Sekuentzia osatzen du agindua errepikatzen badiozu edo urrats bat gogorarazten badiozu.', 'Hiru urratsak itxaronaldian gordetzen ditu eta ordenan ukitzen ditu berak bakarrik.'],
  },
  ra5: {
    materials: 'Txintxarri bat, giltza batzuk edo txintxirrin bat (garbi soinatzen duen zerbait)',
    read: 'Jarri umearen ATZEAN, ikusten ez zaituen lekuan. Egin soinua objektuarekin alde batean (ezkerrean edo eskuinean) eta seinala dezala besoarekin soinua nondik etorri den begiratzera BIRATU AURRETIK. Txandakatu aldeak patroi finkorik gabe.',
    instrHint: 'Entzumen binaurala: zein aldetatik dator soinua? Seinalatu begiratu aurretik. Gakoa alde bakarreko inplantea duten erabiltzaileetan.',
    capture: 'Idatzi zein alde asmatzen duen gehien eta zein kostatzen zaion (adib. "ia beti asmatzen du eskuinean, zalantza egiten du ezkerrean").',
    move: 'Marco Polo soinuduna: begiak itxita, ibil dadila soinatzen duen txintxarrirantz.',
    ept: ['Oraindik ez du soinuaren aldea kokatzen: ausaz seinalatzen du edo ez du erantzuten.', 'Aldea asmatzen du soinua behin baino gehiagotan errepikatzen baduzu edo oso ozen bada.', 'Alde zuzena lehenengoan seinalatzen du, soinu leunekin ere.'],
  },

  // ================================ TEA (PRT + TCC) ================================
  tea1: {
    read: 'Jarri objektu oso erakargarri bat zure aurpegiaren eta umearen artean. Itxaron 3 segundo inolako pistarik eman AURRETIK (instigazio atzeratua): zigiluaren botoia itxaron horren ondoren bakarrik desblokeatzen da. Sakatu Zigilu Bikoitza zurekin (ez objektuarekin) benetako begi-kontaktua dagoenean BAKARRIK.',
    instrHint: 'Triangelatu arreta: objektua → zure begirada → umea. Zigilua begi-kontaktu erreala arte eusten da; 3 segundoko itxaronaldia da instigazio atzeratua (Time Delay).',
    move: 'Ezkutatu objektua bizkarraren atzean eta ibili poliki: bila diezazula begirada erakutsi aurretik.',
    ept: ['Oraindik ez du begirada objektuaren eta zure aurpegiaren artean txandakatzen, itxaronaldiarekin ere ez.', 'Begiratzen dizu objektua zure aurpegiaren ondoan eusten baduzu eta pista bat ematen badiozu.', 'Objektua→zu begirada berak bakarrik txandakatzen du, 3 segundoko itxaronaldiaren barruan.'],
  },
  tea2: {
    read: 'Ariketa honek Panel Nagusiko Etendura Pragmatikoa erabiltzen du: aplikazioa nahita izozten duzu (agindu absurdua edo isiltasuna) eta umeak komunikazioa nola konpontzen duen behatzen duzu. Estresore MANUALA eta berehala itzulgarria da: zuk erabakitzen duzu noiz hasi eta noiz amaitu. Ireki behean Panel Nagusian eta erregistratu erabilitako estrategia.',
    instrHint: '"Frustrazio erabilgarria" %100 gizakiarena da: aplikazioak ez du inoiz bakarrik eteten. Erregistratu konponketa-estrategia (errepikatzeko eskatu, keinua, birformulatu…) etenduran bertan.',
    move: 'Konponketa lortu ondoren, ospatu esku-talka oso puztu batekin.',
    ept: ['Ez du etendura erregistratzen: isolatu edo gainezka egiten du konpontzen saiatu gabe.', 'Keinu edo begiradaz konpontzen du zuk itxaronaldia lasai eusten badiozu.', 'Berak bakarrik konpontzen du hitzezko eskaerarekin ("zer?", "berriro") edo birformulatuz.'],
  },
  tea3: {
    read: 'Sakatu 🔊 aplikazioaren ahotsak agindu motorea eman dezan eta, soinuak dirauen BITARTEAN, egin zuk kontrako ekintza bat (ahotsak "ukitu sudurra" dio eta zuk burua ukitzen duzu). Helburua umeak AUDIOA jarraitzea eta zure keinuaren kopia inhibitzea da.',
    instrHint: 'Ekopraxiaren inhibizioa: ahotsa jarraitu, ez zure gorputza. Txandakatu agindu koherenteak eta koherentgabeak aurrez asma ez dezan.',
    move: 'Jolastu "ahotsak agintzen du": soinuzko aginduak balio du, helduaren keinuak engainatzen du. Aldatu rolak!',
    ept: ['Beti kopiatzen du zure keinua (ekopraxia sistematikoa), agindua entzun arren.', 'Audioa jarraitzen du "egin DIONAK dioena, ez NIK egiten dudana" gogorarazten badiozu.', 'Hitzezko agindua berak bakarrik jarraitzen du zure keinuak kontra egin arren.'],
  },
  tea4: {
    read: 'Gehien gustatzen ari zaion jolasaren erdian, sakatu "Eten orain": mugimendu-kapsula bat-bateko bat agertuko da. Behatu trantsizioa: onartzen du, protesta egin eta jarraitzen du, ala uzten du? Zuk erabakitzen duzu une zehatza; aplikazioak ez du inoiz bakarrik eteten.',
    instrHint: 'Malgutasun kognitiboa aurreikusi gabeko trantsizioen aurrean. Etena manuala eta itzulgarria da: kapsula berehala salta dezakezu gainezka egiten badu.',
    move: 'Bihurtu etena jolas: "estatua!", hiru arnasketa putz eginda eta jarduerara itzuli.',
    ept: ['Saioa uzten du edo gainezka egiten du etenarekin, laguntzarekin ere.', 'Trantsizioa onartzen du zuk aurreikusi eta kapsula lagundzen badiozu.', 'Etena onartzen du, kapsula egiten du eta jarduera berak bakarrik berrartzen du.'],
  },
  tea5: {
    read: 'Sakatu 🔊 lau fitxak entzuteko. Hiru elkarrekin doaz eta bat ez: umeak besteekin joaten EZ dena ukitzen du. Gero igo POLIKI-POLIKI atzeko zarata Panel Nagusitik eta errepikatu beste txanda batekin: idatzi asmatzea nola aldatzen den zarata-maila bakoitzarekin.',
    stageLabel: 'Ukitu besteekin joaten ez den fitxa',
    intruder: [{ cap: 'txakurra', emoji: '🐶' }, { cap: 'katua', emoji: '🐱' }, { cap: 'zaldia', emoji: '🐴' }, { cap: 'koilara', emoji: '🥄' }], intruderAnswer: 3,
    move: 'Sailkatu benetako jostailuak bi kutxatan (animaliak / jatekoak) atzean musika baxuarekin.',
    ept: ['Oraindik ez du kategoria sailkatzen, isiltasunean ere ez.', 'Isiltasunean sailkatzen du, baina kategoria galtzen du zarata igotzean.', 'Sailkapen zuzena mantentzen du atzeko zarata altua egon arren.'],
  },

  tea6: {
    read: 'Sakatu 🔊 agindua BI pista aldi berean (forma ETA kolorea) entzuteko. Pista bakarrari erantzuten badio eta huts egiten badu (zirkulu gorria ukitzen du), EZ zigortu: esan zuk kontingentzia naturaltasunez —"hori gorria da, baina zirkulua da; nik karratua nahi dut"— eta utzi berriro saiatzen. Saritu komunikazio-saiakera, ez perfekzioa.',
    stageLabel: 'Ukitu BI pista zuzenak dituen fitxa',
    choicePrompt: 'Karratu gorria.', choiceLabel: 'Agindua entzun', choiceVoice: 'tutor',
    options: [{ cap: 'karratu gorria', emoji: '🟥' }, { cap: 'zirkulu gorria', emoji: '🔴' }, { cap: 'karratu urdina', emoji: '🟦' }],
    optionAnswer: 0,
    move: 'Bi pistako bilaketa etxean: "ekarri zerbait BIGUNA eta URDINA". Ospatu aurkikuntza bakoitza.',
    ept: ['Pista bakarrari erantzuten dio (kolorea bakarrik edo forma bakarrik), laguntzarekin ere.', 'Bi pistak asmatzen ditu zuk kontingentzia xehatzen badiozu ("gorria bai, baina zirkulua ez").', 'Bi pista aldiberekoei berak bakarrik erantzuten die, lehenengo aginduan.'],
  },

  // ============================== DISLEXIA (fonología) ==============================
  dx1: {
    read: 'Sakatu 🔊 ahotsak serie osoa eman dezan. Hiru hitzek antzeko soinua dute eta batek ez: umeak besteen soinua EZ duen hitzaren bozgorailua ukitzen du. Testu-laguntzarik gabe: belarria bakarrik.',
    stageLabel: 'Entzun seriea eta ukitu berdin soinatzen ez duena',
    intruder: [{ cap: 'gozoa', emoji: '🔊' }, { cap: 'beroa', emoji: '🔊' }, { cap: 'astoa', emoji: '🔊' }, { cap: 'liburu', emoji: '🔊' }], intruderAnswer: 3,
    move: 'Belaunean palmada errimatzen duen hitz bakoitzean; besoak gurutze intrusoak jotzean.',
    ept: ['Oraindik ez du errimatzen ez duen hitza isolatzen, seriea errepikatuta ere.', 'Aurkitzen du seriea polikiago edo binaka errepikatzen badiozu.', 'Intrusoa berak bakarrik isolatzen du seriea behin entzunda.'],
  },
  dx2: {
    read: 'Umeak pantailako esaldia ozen irakurtzen du, tiraldi batean eta silabakatu gabe. Lasai lortzen duenean, aktibatu Hartz Distraitzailea eta zarata pixka bat Panel Nagusitik eta errepikatu beste txanda batekin: baloratu zuk jariotasuna, ez aplikazioak.',
    stageLabel: 'Irakurri esaldia tiraldi batean', phrase: 'HARTZAK OGIA JATEN DU', phraseEmoji: '🐻',
    move: 'Irakurri esaldia ibiliz: pauso bat hitzeko, silaben artean gelditu gabe.',
    ept: ['Silabakatzen du edo hitz bakoitzean gelditzen da, distraitzailerik gabe ere.', 'Jario irakurtzen du isiltasunean, baina berriro silabakatzen du hartzarekin edo zaratarekin.', 'Irakurketa jarioa mantentzen du interferentzia bisual eta zaratarekin ere.'],
  },
  dx3: {
    read: 'Sakatu "Soinuak entzun": aplikazioak soinu bakoitza banaka ematen du, artean etenaldi batekin. Umeak lotu eta hitz osoa esan behar du. Jaso fusioa mikroarekin; ezagutzak huts egiten badu edo motel badoa, baloratu zuk behean eskalarekin.',
    stageLabel: 'Lotu soinuak eta esan hitza',
    phonemes: ['sss', 'u', 'a'], phonemeGapMs: 500,
    phrase: 'SUA', phraseEmoji: '🔥',
    move: 'Salto bat soinu bakoitzeko eta, hitz osoa esatean, izar-salto!',
    ept: ['Oraindik ez ditu soinuak lotzen: fonema solteak errepikatzen ditu edo uzten du.', 'Hitza fusionatzen du soinuak etenaldi txikiagoarekin errepikatzen badizkiozu.', 'Soinuak lotu eta hitz osoa berak bakarrik esaten du lehenengoan.'],
  },
  dx4: {
    read: 'Pantailako hitza asmatua da: ezin da igarri, deskodetu baino ez. Umeak ozen irakurtzen du entzuten den bezala. Gehienez 5 saio: mugara iristean, aplikazioak nahitaezko mugimendu-etenaldi bat proposatzen du deskargatzeko.',
    stageLabel: 'Irakurri hitz asmatua entzuten den bezala', phrase: 'MELUTA', phraseEmoji: '🪄',
    maxTrials: 5,
    move: 'Esan pseudohitza silabako palmada batekin: ME-LU-TA.',
    ept: ['Oraindik ez du pseudohitza deskodetzen: benetako hitzengatik ordezkatzen du.', 'Helduaren silabakatze-laguntzarekin edo eredu batzuen ondoren irakurtzen du.', 'Berak bakarrik deskodetzen du, osorik eta benetako hitz bihurtu gabe.'],
  },
  dx5: {
    read: 'Esan umeari zein letra bilatu (laukiko handia) eta panelean aurkitzen dituen GUZTIAK uki ditzala. Letra biki biratuek (b/d, p/q) engainatu nahi dute. Karga gehiago nahi baduzu, aktibatu Hartz Distraitzailea Panel Nagusitik.',
    stageLabel: 'Aurkitu letra objektibo guztiak',
    move: 'Marraztu letra objektiboa erraldoi airean: "b"-ren tripa aurrera begira dago, irakurtzean bezala.',
    ept: ['Oraindik letra biratuak sistematikoki nahasten ditu (b/d, p/q).', 'Letra objektiboak pistekin aurkitzen ditu ("begiratu norantz begiratzen duen tripak").', 'Letra objektibo guztiak berak bakarrik aurkitzen ditu, biratuetan erori gabe.'],
  },
  dx6: {
    read: 'Umeak marrazki bakoitza OZEN izendatzen du eta irakurketa-ordenan (ezkerretik eskuinera), izendatzean ukituz. Estresorea zu zara: jarraitu bere hatza pantailan zurearekin, harrapaketa-jolas bat bezala. Kronometrorik gabe: azkarregi edo frustratuta ikusten baduzu, moteldu zure hatza edo gelditu jazarpena.',
    stageLabel: 'Izendatu marrazki bakoitza ordenan, gelditu gabe!',
    tiles: [
      { cap: 'eguzkia', emoji: '☀️' }, { cap: 'katua', emoji: '🐱' }, { cap: 'ogia', emoji: '🍞' }, { cap: 'lorea', emoji: '🌸' },
      { cap: 'ogia', emoji: '🍞' }, { cap: 'lorea', emoji: '🌸' }, { cap: 'eguzkia', emoji: '☀️' }, { cap: 'katua', emoji: '🐱' },
      { cap: 'katua', emoji: '🐱' }, { cap: 'eguzkia', emoji: '☀️' }, { cap: 'lorea', emoji: '🌸' }, { cap: 'ogia', emoji: '🍞' },
    ],
    move: 'Etxeko RAN: errepasatu apalategi bat objektu bakoitza jarraian izendatuz, lerro bat irakurtzen bezala.',
    ept: ['Oraindik etenaldi luzeekin izendatzen du edo irakurketa-ordena galtzen du.', 'Matrize osoa izendatzen du baina marrazki batzuetan trabatzen da edo eredua behar du.', 'Matrize osoa jarraian izendatzen du, jarioz eta ordenan, hatzaren jazarpenarekin ere.'],
  },
};

// ---------------------------------------------------------------------------
// Overrides por RONDA (VARIANTS). Sustituyen a las rondas base en euskera.
// ---------------------------------------------------------------------------
export const VARIANTS_EU: Record<string, Partial<Exercise>[]> = {
  ff1: [
    {},
    { tiles: [{ cap: 'otsoa', emoji: '🐺' }, { cap: 'untxia', emoji: '🐰' }, { cap: 'igela', emoji: '🐸' }] },
    { tiles: [{ cap: 'arrautza', emoji: '🥚' }, { cap: 'elurra', emoji: '❄️' }, { cap: 'oiloa', emoji: '🐔' }] },
  ],
  ff2: [
    {},
    { phrase: 'PILOTA', phraseEmoji: '⚽' },
    { phrase: 'TXAKURRA', phraseEmoji: '🐕' },
  ],
  ff3: [
    {},
    { fillBefore: 'S', fillAfter: 'I', fillAnswer: 'E', fillEmoji: '6️⃣', fillCap: 'sei' },
    { fillBefore: 'L', fillAfter: 'RE', fillAnswer: 'O', fillEmoji: '🌸', fillCap: 'lore' },
  ],
  se1: [
    {},
    {
      read: 'Sakatu 🔊 lau fitxen izena entzuteko. Hiru animaliak dira eta bat ez. Umeak besteekin joaten EZ dena ukitzen du.',
      intruder: [{ cap: 'txakurra', emoji: '🐶' }, { cap: 'katua', emoji: '🐱' }, { cap: 'behia', emoji: '🐄' }, { cap: 'zapata', emoji: '👟' }],
      intruderAnswer: 3,
    },
    {
      read: 'Sakatu 🔊 lau fitxen izena entzuteko. Hiru janzteko dira eta bat ez. Umeak besteekin joaten EZ dena ukitzen du.',
      intruder: [{ cap: 'txapela', emoji: '🧢' }, { cap: 'kamiseta', emoji: '👕' }, { cap: 'zapata', emoji: '👟' }, { cap: 'platanoa', emoji: '🍌' }],
      intruderAnswer: 3,
    },
  ],
  se2: [
    {},
    {
      choicePrompt: 'Gorria eta biribila da, eta zuhaitzetan hazten da. Zer da?',
      options: [{ cap: 'sagarra', emoji: '🍎' }, { cap: 'tximeleta', emoji: '🦋' }, { cap: 'motorra', emoji: '🏍️' }], optionAnswer: 0,
    },
    {
      choicePrompt: 'Zeruan distiratzen du eta beroa ematen digu. Zer da?',
      options: [{ cap: 'eguzkia', emoji: '☀️' }, { cap: 'sugea', emoji: '🐍' }, { cap: 'zopa', emoji: '🍲' }], optionAnswer: 0,
    },
  ],
  ms1: [
    {},
    {
      read: 'Umeak ASKO dauden txartela ukitzen du. Gero galdetu "zer dira?" pluralez esan dezan: "loreak".',
      plural: { cap: 'lore', capPlural: 'loreak', emoji: '🌸', gender: 'f' },
    },
    {
      read: 'Umeak ASKO dauden txartela ukitzen du. Gero galdetu "zer dira?" pluralez esan dezan: "arrainak".',
      plural: { cap: 'arrain', capPlural: 'arrainak', emoji: '🐟', gender: 'm' },
    },
  ],
  ms2: [
    {},
    { choicePrompt: 'amona', options: [{ cap: 'aitona', emoji: '👴' }, { cap: 'amona', emoji: '👵' }], optionAnswer: 1 },
    { choicePrompt: 'errege', options: [{ cap: 'errege', emoji: '🤴' }, { cap: 'erregina', emoji: '👸' }], optionAnswer: 0 },
  ],
  ms3: [
    {},
    {
      parts: [{ role: 'Subjektua', cap: 'neskak', emoji: '👧' }, { role: 'Objektua', cap: 'pilota', emoji: '⚽' }, { role: 'Aditza', cap: 'botatzen du', emoji: '🤾' }],
      sentence: 'Neskak pilota botatzen du.',
    },
    {
      parts: [{ role: 'Subjektua', cap: 'txakurrak', emoji: '🐶' }, { role: 'Objektua', cap: 'hezurra', emoji: '🦴' }, { role: 'Aditza', cap: 'jaten du', emoji: '😋' }],
      sentence: 'Txakurrak hezurra jaten du.',
    },
  ],
  pr3: [
    {},
    { emotionFace: '😢', emotionAnswer: 'Tristura' },
    { emotionFace: '😠', emotionAnswer: 'Haserrea' },
  ],
  // ---- Rehabilitación auditiva ACOPROS ----
  ra1: [
    {},
    { choicePrompt: 'Bilatu ardia.', optionAnswer: 1 },
    { choicePrompt: 'Bilatu oiloa.', optionAnswer: 3 },
  ],
  ra2: [
    {},
    { choicePrompt: 'ahoa', options: [{ cap: 'ahoa', emoji: '👄' }, { cap: 'lorea', emoji: '🌸' }, { cap: 'trena', emoji: '🚆' }], optionAnswer: 0 },
    { choicePrompt: 'hartza', options: [{ cap: 'hartza', emoji: '🐻' }, { cap: 'oina', emoji: '🦶' }, { cap: 'mahatsa', emoji: '🍇' }], optionAnswer: 0 },
  ],
  ra3: [
    {},
    { choicePrompt: 'begia', optionAnswer: 1 },
    { choicePrompt: 'zubia', optionAnswer: 3 },
  ],
  ra4: [
    {},
    {
      parts: [{ role: 'Lehenengo', cap: 'ilargia', emoji: '🌙' }, { role: 'Gero', cap: 'katua', emoji: '🐱' }, { role: 'Ondoren', cap: 'lorea', emoji: '🌸' }],
      sentence: 'Ukitu ilargia, gero katua eta ondoren lorea.',
    },
    {
      parts: [{ role: 'Lehenengo', cap: 'ogia', emoji: '🍞' }, { role: 'Gero', cap: 'arraina', emoji: '🐟' }, { role: 'Ondoren', cap: 'zuhaitza', emoji: '🌳' }],
      sentence: 'Ukitu ogia, gero arraina eta ondoren zuhaitza.',
    },
  ],
  // ---- TEA ----
  tea5: [
    {},
    {
      read: 'Sakatu 🔊 lau fitxak entzuteko. Hiru jaten dira eta bat ez: umeak besteekin joaten EZ dena ukitzen du. Igo zarata Panel Nagusitik txandaz txanda eta idatzi asmatzea nola aldatzen den.',
      intruder: [{ cap: 'sagarra', emoji: '🍎' }, { cap: 'ogia', emoji: '🍞' }, { cap: 'gazta', emoji: '🧀' }, { cap: 'pilota', emoji: '⚽' }],
      intruderAnswer: 3,
    },
    {
      read: 'Sakatu 🔊 lau fitxak entzuteko. Hiru janzteko dira eta bat ez: umeak besteekin joaten EZ dena ukitzen du. Mantendu probatzen ari zaren zarata-maila eta konparatu aurreko txandekin.',
      intruder: [{ cap: 'txapela', emoji: '🧢' }, { cap: 'kamiseta', emoji: '👕' }, { cap: 'zapata', emoji: '👟' }, { cap: 'marrubia', emoji: '🍓' }],
      intruderAnswer: 3,
    },
  ],
  tea6: [
    {},
    {
      choicePrompt: 'Zirkulu urdina.',
      options: [{ cap: 'zirkulu urdina', emoji: '🔵' }, { cap: 'karratu urdina', emoji: '🟦' }, { cap: 'zirkulu gorria', emoji: '🔴' }],
      optionAnswer: 0,
    },
    {
      choicePrompt: 'Izar horia.',
      options: [{ cap: 'zirkulu horia', emoji: '🟡' }, { cap: 'izar horia', emoji: '⭐' }, { cap: 'bihotz horia', emoji: '💛' }],
      optionAnswer: 1,
    },
  ],
  // ---- Dislexia ----
  dx1: [
    {},
    { intruder: [{ cap: 'iluna', emoji: '🔊' }, { cap: 'biguna', emoji: '🔊' }, { cap: 'astuna', emoji: '🔊' }, { cap: 'sagarra', emoji: '🔊' }], intruderAnswer: 3 },
    { intruder: [{ cap: 'handia', emoji: '🔊' }, { cap: 'txikia', emoji: '🔊' }, { cap: 'gorria', emoji: '🔊' }, { cap: 'zuhaitza', emoji: '🔊' }], intruderAnswer: 3 },
  ],
  dx2: [
    {},
    { phrase: 'NESKAK ZUKUA EDATEN DU', phraseEmoji: '🧃' },
    { phrase: 'NIRE KATUAK SALTO EGITEN DU', phraseEmoji: '🐱' },
  ],
  dx3: [
    {},
    { phonemes: ['a', 'mmm', 'a'], phrase: 'AMA', phraseEmoji: '👩' },
    { phonemes: ['i', 'lll', 'e'], phrase: 'ILE', phraseEmoji: '💇' },
  ],
  dx4: [
    {},
    { phrase: 'TXABIRO', phraseEmoji: '🌀' },
    { phrase: 'GASNELO', phraseEmoji: '🎈' },
  ],
  dx5: [
    {},
    { rotationTargets: { target: 'd', grid: ['d', 'b', 'q', 'd', 'p', 'b', 'd', 'q', 'b', 'p', 'd', 'b'] } },
    { rotationTargets: { target: 'p', grid: ['p', 'q', 'b', 'p', 'd', 'q', 'p', 'b', 'q', 'd', 'p', 'q'] } },
  ],
  dx6: [
    {},
    {
      tiles: [
        { cap: 'ilargia', emoji: '🌙' }, { cap: 'txakurra', emoji: '🐶' }, { cap: 'etxea', emoji: '🏠' }, { cap: 'arraina', emoji: '🐟' },
        { cap: 'etxea', emoji: '🏠' }, { cap: 'arraina', emoji: '🐟' }, { cap: 'ilargia', emoji: '🌙' }, { cap: 'txakurra', emoji: '🐶' },
        { cap: 'txakurra', emoji: '🐶' }, { cap: 'ilargia', emoji: '🌙' }, { cap: 'arraina', emoji: '🐟' }, { cap: 'etxea', emoji: '🏠' },
      ],
    },
    {
      // RAN de colores: la serie cromática básica en euskera.
      tiles: [
        { cap: 'gorria', emoji: '🟥' }, { cap: 'urdina', emoji: '🟦' }, { cap: 'berdea', emoji: '🟩' }, { cap: 'horia', emoji: '🟨' },
        { cap: 'berdea', emoji: '🟩' }, { cap: 'horia', emoji: '🟨' }, { cap: 'gorria', emoji: '🟥' }, { cap: 'urdina', emoji: '🟦' },
        { cap: 'urdina', emoji: '🟦' }, { cap: 'berdea', emoji: '🟩' }, { cap: 'horia', emoji: '🟨' }, { cap: 'gorria', emoji: '🟥' },
      ],
    },
  ],
};
