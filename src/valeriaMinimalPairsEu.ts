// ============================================================================
// Valeria+ · Pares Mínimos en EUSKERA batua (plan ILENIA/NEL-GAITU · HiTZ)
//
// ESTADO: ✅ APROBADO PARA PRODUCCIÓN (revisión logopédica de Ulertuz y de
// euskera normativo/batua cumplida). Cableado por variedad (pairsForLocale) y locutado con la
// voz neuronal HiTZ-TTS. El banco castellano/gallego NO transfiere: el euskera
// tiene un sistema de sibilantes propio (s̺ apical vs s̻ laminal vs ʃ) y de
// africadas (ts̺ · ts̻ · tʃ) que no existe en las otras variedades, así que
// cada par se diseña ad hoc con el mismo principio detector: el error de
// sustitución habitual del niño produce EXACTAMENTE la otra palabra del par.
//
// Contrastes cubiertos (fonología del euskera batua):
//   su/zu      s̺ → s̻  (sigmatismo: apical → laminal, contraste s/z propio)
//   hotz/hots  ts̻ → ts̺ (africada laminal → apical, contraste tz/ts)
//   hitz/hits  ts̻ → ts̺ (generalización del contraste africado)
//   txalo/talo tʃ → t   (oclusivización/desafricación de la africada palatal)
//   karta/tarta k → t    (frontalización velar inicial, error infantil universal)
//
// Nota dialectal: anclado en batua. La `h` es muda en la mayoría de euskalkis
// (no marca contraste aquí). Los pares s/z y ts/tz dependen de que la variedad
// del niño distinga sibilantes; márquense con `region` si se detecta neutralización.
// Protocolo: docs/protocolo-pares-minimos-eu.md (pendiente, EU-2.2).
// ============================================================================
import { MinimalPair } from './valeriaMinimalPairs';

export const MINIMAL_PAIRS_EU: MinimalPair[] = [
  {
    id: 'eu-su-zu', code: 'PM-EU-1', group: 'Sigmatismo',
    target: 'su', targetEmoji: '🔥', foil: 'zu', foilEmoji: '🫵',
    phoneme: 's̺ → s̻', errorLabel: 'Sigmatismo laminal (s → z)',
    prompt: 'Zerk erretzen du? Esan: su.',
    onTarget: {
      say: 'Su! Zure mihiaren puntak ondo egin du sss hori!',
      mission: 'Su txikia: elkarrekin hatzak goian mugitu sugarrak balira bezala, eta putz egin denok batera.',
    },
    onFoil: {
      say: 'Zu entzun dut, hatzarekin seinalatzen dena. Nik su eskatu dut, sugarrena. Entzun…',
      cue: 'Mihiaren punta hortzen atzean altxatuta: sss luze bat, ez z motza.',
      mission: 'Sua eta ura: aitak edo amak "sss" egiten duen bitartean, umeak eskua hurbiltzen du beroa sentitzeko. Gero, alderantziz.',
    },
  },
  {
    id: 'eu-hotz-hots', code: 'PM-EU-2', group: 'Sigmatismo',
    target: 'hotz', targetEmoji: '🥶', foil: 'hots', foilEmoji: '🔊',
    phoneme: 'ts̻ → ts̺', errorLabel: 'Africada laminal → apical (tz → ts)',
    prompt: 'Neguan elurretan nola gaude? Esan: hotz.',
    onTarget: {
      say: 'Hotz! Tz hori ondo atera zaizu, elurra bezain garbi!',
      mission: 'Hotzaren dantza: biok dardarka jarri, besoak igurtziz, "brrr" esanez hiru segundoz.',
    },
    onFoil: {
      say: 'Hots entzun dut, zaratarena. Nik hotz eskatu dut, elurrarena. Mihia aurreraxeago: hotz.',
      cue: 'Tz-k mihia hortzetan jartzen du eta indar handiagoz ateratzen da airea.',
      mission: 'Bero/hotz jokoa: aitak edo amak eskua ematen dio umeari; "hotz" esatean dardara egiten dute biek.',
    },
  },
  {
    id: 'eu-hitz-hits', code: 'PM-EU-3', group: 'Sigmatismo',
    target: 'hitz', targetEmoji: '🗣️', foil: 'hits', foilEmoji: '😔',
    phoneme: 'ts̻ → ts̺', errorLabel: 'Africada laminal → apical (generalización)',
    prompt: 'Ahoarekin zer esaten dugu? Esan: hitz.',
    onTarget: {
      say: 'Hitz! Tz hori indartsu atera da, kanpai bat bezala!',
      mission: 'Hitz-katea: txandaka hitz bat esaten duzue bakoitzak, eskua jo arte.',
    },
    onFoil: {
      say: 'Hits entzun dut, tristearena. Nik hitz eskatu dut, ahokoa. Bukaeran indarra: hitz.',
      cue: 'Amaierako tz-k mihia hortzen kontra estutzen du: ez utzi ahula joaten.',
      mission: 'Kanpaia: umeak "hitz" esaten duen bakoitzean, aitak edo amak txalo bat jotzen du tz-a ozena bada.',
    },
  },
  {
    id: 'eu-txalo-talo', code: 'PM-EU-4', group: 'Velares',
    target: 'txalo', targetEmoji: '👏', foil: 'talo', foilEmoji: '🫓',
    phoneme: 'tʃ → t', errorLabel: 'Oclusivización de africada palatal',
    prompt: 'Pozik gaudenean eskuekin zer egiten dugu? Esan: txalo.',
    onTarget: {
      say: 'Txalo! Tx hori trena bezala atera da, txu-txu!',
      mission: 'Txalo jaialdia: biok hiru txalo ozen jo, tx-a esagerratuz bakoitzean.',
    },
    onFoil: {
      say: 'Talo entzun dut, artoarena, jatekoa. Nik txalo eskatu dut, eskuena. Trena bezala: txalo.',
      cue: 'Tx trena da: mihia sabaira igo eta "txu" egiten du; t-k kolpe soil bat baino ez.',
      mission: 'Trena eta kolpea: aitak "t-t-t" (kolpeak) eta gero "txu-txu" (trena) egiten ditu; umeak asmatu behar du zein den txalo-koa.',
    },
  },
  {
    id: 'eu-karta-tarta', code: 'PM-EU-5', group: 'Velares',
    target: 'karta', targetEmoji: '🃏', foil: 'tarta', foilEmoji: '🎂',
    phoneme: 'k → t', errorLabel: 'Frontalización velar inicial',
    prompt: 'Zerekin jolasten gara mahaian? Esan: karta.',
    onTarget: {
      say: 'Karta! K hori eztarriaren zulotik atera da, sakon-sakon!',
      mission: 'Karta-dorrea: elkarrekin hiru karta (edo koxin) pilatu, bakoitza jartzean "karta" esanez.',
    },
    onFoil: {
      say: 'Tarta entzun dut, urtebetetzekoa. Nik karta eskatu dut, jolastekoa. K-a atzean jaiotzen da: karta.',
      cue: 'T-a hortzetan bizi da; k-a eztarriaren hondoan, kobazuloan.',
      mission: 'Erraldoiaren eztula: burua atzera bota eta "ka-ka-ka"; hatzak kokotsaren azpian, k-a non mugitzen den sentitzeko.',
    },
  },
];
