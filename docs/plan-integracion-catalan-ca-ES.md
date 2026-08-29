# Pla d'Integració del Català (`ca` / `ca-ES`) a Valeria+ v13

**Data:** 29 d'agost de 2026  
**Autors:** Equip Multidisciplinar de Localització Clínica (Worker M1 / Survey Explorer 2)  
**Versió de la Plataforma:** Valeria+ v13 (Expo SDK 54 / React Native 0.81 / TypeScript 5.9)  

---

## 1. Objectiu i Abast

Integrar el català (`ca` / `ca-ES`) com a tercer idioma oficial de la interfície d'usuari (`UiLang = 'es' | 'en' | 'ca'`) a la plataforma de salut digital **Valeria+**, assegurant:
1. **Paritat tipada 1:1 estricta** mitjançant `src/i18n/strings.ca.ts` contra el contracte `UiStrings` derivat de `src/i18n/strings.es.ts`.
2. **Adaptació clínica i cultural autèntica** sota els criteris normatius de l'**Institut d'Estudis Catalans (IEC)** i el **Centre de Terminologia de Catalunya (TERMCAT)**.
3. **Disponibilitat del skill especialitzat `valeria-i18n-ca-expert`** amb documentació de regles, glossari pediàtric i contracte de formatatge.
4. **Actualització del selector de llengua de la interfície** (`src/ValeriaUiLangPicker.tsx`) i gestió de persistència desacoblada de les varietats de veu terapèutica (`valeriaLocale.ts`).

---

## 2. Fonaments Lingüístics i Normatius (IEC / TERMCAT)

### 2.1. Glossari Canònic Pediàtric i Terapèutic

| Concepte Castellà (ES) | Terme Canònic Català (CA) | Terme US English (EN) | Termes Desaconsellats | Raó Clínica / Normativa |
| :--- | :--- | :--- | :--- | :--- |
| Tutor / Cuidador / Padre | **`Persona cuidadora`** / **`Cuidador/a`** / **`Adult acompanyant`** | `caregiver` | `Tutor legal`, `Pares` | Fórmula inclusiva pediàtrica estàndard (HSJD / CatSalut). |
| Niño / Niña / Menor / Peque | **`Infant`** (pl. `infants`) / **`Criatura`** / **`Nen / Nena`** | `child` | `Menor`, `Menut/da` | TERMCAT: persona en edat pediàtrica (0-12 anys). |
| Terapia auditivo-verbal (TAV) | **`Teràpia auditivoverbal`** | `Auditory-Verbal Therapy (AVT)` | `Teràpia auditiu-verbal` | Compostos de dos adjectius s'escriuen junts sense guió (IEC). |
| Implante coclear | **`Implant coclear`** (pl. `implants coclears`) | `cochlear implant` | `Dispositiu coclear` | Nomenclatura oficial TERMCAT. |
| Audífono / Prótesis | **`Audiòfon`** (pl. `audiòfons`) | `hearing aid` | `Aparell acústic` | Nomenclatura mèdica i ortogràfica normatives. |
| Hipoacusia / Pérdida auditiva | **`Hipoacúsia`** / **`Pèrdua auditiva`** | `hearing loss` | `Hipoacusia` (sense accent) | Accent agut a la *ú* segons l'IEC. |
| Sordera | **`Sordesa`** | `deafness` | `Sordera` | Normativa ortogràfica catalana per a pèrdua total. |
| Pares mínimos | **`Parells mínims`** | `minimal pairs` | `Pares mínims` | Terme fonològic i lingüístic estàndard. |
| Ajustes / Configuración | **`Ajustos`** | `Settings` | `Configuracions` | Estàndard d'Apple/Google en català per a apps. |
| Guardar / Guardar cambios | **`Desa els canvis`** / **`Desar`** | `Save changes` | `Guardar` | TERMCAT recomana *desar* per a operacions d'escriptura. |

### 2.2. Convencions Tipogràfiques i Morfosintàctiques

1. **Sentence Case**: Tota la interfície s'escriu en minúscules excepte la primera lletra (*«Desa els canvis»*, *«Inicia l'avaluació»*, *«Cal permís de micròfon»*).
2. **Apostrofació**: Aplicació estricta de l'apostrofació de l'IEC (*l'infant*, *l'avaluació*, *d'àudio*, *descarrega'l*).
3. **Ela Geminada**: Ús obligatori del punt volat (`l·l`) a *col·laboració*, *instal·lació*, *cancel·lar*.
4. **Interpolacions Neutres**: Construccions resistents a canvis de gènere o inicials vocàliques (*«Pacient: {{name}}»*, *«Nom de l'infant: {{name}}»*).

---

## 3. Arquitectura de Codi i Fitxers Afectats

### 3.1. Catàleg i18n
- **`src/i18n/strings.ca.ts`**: Nou fitxer amb 27 namespaces i ~1.784 línies que exporta `CA: UiStrings`.
- **`src/i18n/catalog.ts`**: Importació i registre de `CA` dins de `CATALOGUES: Record<UiLang, UiStrings> = { es: ES, en: EN, ca: CA }`.
- **`src/i18n/strings.es.ts` & `strings.en.ts`**: Inclusió de la clau `uiLangCa: 'Catalán'` / `uiLangCa: 'Catalan'`.

### 3.2. Selector d'Idioma i Estat
- **`src/valeriaUiLang.ts`**:
  - `export type UiLang = 'es' | 'en' | 'ca';`
  - `export const ALL_UI_LANGS: UiLang[] = ['es', 'en', 'ca'];`
  - `export const isUiLang = (v: unknown): v is UiLang => v === 'es' || v === 'en' || v === 'ca';`
- **`src/ValeriaUiLangPicker.tsx`**: Addició del botó per seleccionar `'ca'` (`Català`).

---

## 4. Estat real de la integració (actualitzat el 29 d'agost de 2026)

Aquesta secció substitueix la llista de *skills* i *plugins* d'Antigravity que
hi havia aquí: **cap d'aquells fitxers existia a la branca**. El pla els
declarava com a fets i no ho eren. El que hi ha ara, comprovat, és això:

### 4.1. Fet i verificat

| Capa | Estat | On es comprova |
| :--- | :--- | :--- |
| Catàleg d'interfície (`strings.ca.ts`) | ✅ Paritat 1:1 amb l'ES, 1 146 claus + 212 funcions | `test-challenger-final-ca-integration.js` (19/19) |
| Selector d'idioma d'interfície | ✅ Quatre opcions; «Català» mou TAMBÉ la varietat | TEST-2.5 |
| Varietat de teràpia `ca` (sisena) | ✅ `Locale`, `assetLang`, `speechLocale` (`ca-ES`), prosòdia | `npm run typecheck` + gates |
| Parells Mínims catalans | ✅ 12 parells, 8 grups propis (`PAIR_GROUPS_CA`) | Captura de pantalla |
| Expansió Semàntica catalana | ✅ 5 escenaris, 5 categories, 9 progressions, 8 càpsules | `check-content-rules`, `check-lexical-difficulty` |
| Audició · Llenguatge · TEA · Dislèxia | ✅ 37 exercicis + 21 variants reautoritzats | `check-adult-fields`, captura |
| Test de Ling | ✅ Sis sons i consignes en català | `check-adult-fields` |
| Càpsules TPR, Rutes, bancs de reforç | ✅ | `check-voice-corpus-coverage` |
| Metadades d'exercicis (noms, categories, edats) | ✅ Traduïdes | Captura |
| Dominis i insígnies d'Academy | ✅ Traduïts | Captura |
| Catàleg sensorial | ✅ 25 cadenes | `check-sensory-assets` |
| Corpus de veu | ✅ 858 locucions catalanes enumerades | `export-voice-corpus.js` |

### 4.2. Pendent, i declarat com a tal

| Què falta | Per què | Com es comporta mentrestant |
| :--- | :--- | :--- |
| ~~Locucions neuronals sintetitzades~~ | **FET** al run 51 (29/8/2026): 858 locucions, 52,6 min, 17,6 MB, sintetitzades amb Matxa-TTS del projecte AINA. El xip «✓ Veu Matxa (AINA)» ja apareix sol a la targeta de veu, perquè `hasAssetsFor('ca')` troba els assets al mapa. | — |
| **Escoltar el resultat** | Ningú del costat de la integració ha pogut ESCOLTAR-HO: les comprovacions fetes són objectives, no auditives (vegeu §5.5). | Cal escoltar les mostres del run i decidir si l'índex triat (`spks=0`) és el central. |
| **Càpsules formatives d'Academy** (~18 700 paraules) | La versió anglesa no va ser una traducció sinó una reautorització clínica; la catalana demana el mateix i no s'ha fet. | Es llegeixen en castellà **amb un avís a la capçalera d'Academy**. El buit està declarat a `src/i18n/uiLangFallback.ts` i el gate `check-ui-lang-fallback.js` no deixa que torni a ser silenciós. |
| ~~Validació del català~~ | **FET** (29/8/2026): **Maria**, **logopeda i parlant nativa de Barcelona**, ha validat els quatre bancs pels DOS eixos alhora —català central normatiu i criteri logopèdic—, que a la resta de varietats van caldre per separat. Sosté també la decisió del betacisme (/b/–/v/ fora) i que els dotze parells són paraules que una criatura de 3 a 6 anys de Barcelona reconeix. El banc queda **APROVAT PER A PRODUCCIÓ**. | — |

### 4.3. Etiquetes de rodatge

`Català` surt marcat **BETA** al selector de veu, igual que `English (US)`: és
etiqueta de rodatge (poques hores d'ús real), no un avís de contingut absent.


---

## 5. La veu: Matxa-TTS del projecte AINA

La veu catalana **no** surt de `rhasspy/piper-voices` com la castellana o
l'anglesa. És **Matxa-TTS**, el sistema de síntesi català del **projecte AINA**
(Barcelona Supercomputing Center · Generalitat de Catalunya), i això obliga a un
motor propi (`matxa`) a `scripts/generate-voice-assets.py`, al costat de
`piper` (es/en), `coqui` (Celtia, gl) i `ahotts` (HiTZ, eu).

### 5.1. Per què no pot anar pel motor Piper

Encara que el fitxer acabi en `.onnx`, són tres coses diferents:

| | Piper (VITS) | Matxa-TTS (Matcha) |
| :--- | :--- | :--- |
| Model acústic | VITS | Matcha-TTS (*flow matching*, ODE) |
| `scales` | tres valors (`noise`, `length`, `noise_dp`) | **dos** (`temperature`, `length_scale`) |
| Frontend | grafemes o fonemes empaquetats | **fonèmic**: espeak-ng (`ca`) via `phonemizer` |
| Vocoder | dins del VITS | propi; AINA l'exporta **end-to-end** amb l'acústic |

Passar-li tres `scales` a un model que n'espera dos desplaça el vector i el so
surt malament **sense donar error**. Donar-li lletres a un frontend fonèmic
produeix soroll, no accent. Cap de les dues coses les detecta un `try/except`.

### 5.2. El canari va saltar al run 50, i això és la prova que serveix

La primera versió d'aquest motor es va escriure amb `huggingface.co`
**bloquejat**: sense poder obrir el repositori ni llegir la signatura del model.
Al primer run real (**#50**, 29/8/2026) el canari va avortar amb
`len() of unsized object` i **zero fitxers escrits** — i el log va deixar
l'esquema real, que és tot el que calia:

```
[diag] projecte-aina/matxa-tts-cat-multiaccent: 11 fitxers
       onnx: matcha_multispeaker_cat_all_opset_15_10_steps.onnx
             matxa_multiaccent_wavenext_e2e.onnx      ← el triat
[diag] onnx inputs : x(int64) x_lengths(int64) scales[2](float) spks(int64)
[diag] onnx outputs: mel_lengths , hfwaveform
[diag] onnx metadata keys: []
```

Tres coses van quedar **verificades** contra el model real: el repositori
existeix amb aquest nom, l'export *end-to-end* hi és, i les entrades són
exactament les que el motor assumia. I una va quedar **desmentida**: l'àudio és
la SEGONA sortida (`hfwaveform`); la primera és `mel_lengths`. Agafar
`run(...)[0]` retornava un escalar, i `len()` d'un escalar és justament aquell
error. Ara les sortides es resolen **pel nom**, mai per posició, amb recanvi per
mida si algun dia l'export les reanomena. Comprovat reproduint l'error amb un
ONNX de joguina de la mateixa signatura.

**El run va sortir VERD tot i això**, perquè el pas de síntesi és
`continue-on-error` (si una veu falla, la resta del lot s'ha de publicar igual).
Aquell verd va fer creure que la veu ja estava feta. Per això el workflow escriu
ara un **resum a la portada del run**: quantes locucions tenen àudio i quantes
no, per idioma. «Verd» ja no es pot llegir com «fet».

### 5.3. Què fa el motor perquè això no acabi en 858 fitxers de soroll

1. **Descobriment**, no noms fixos: `_hf_discover` prova els repositoris
   candidats i el motor tria l'ONNX *end-to-end*. Si el repositori només publica
   l'acústic, **avorta**: encadenar un vocoder a cegues és exactament el que
   això evita.
2. **Diagnòstic complet al log**: entrades i sortides de l'ONNX amb les seves
   formes, metadades, mapa de símbols i llista d'accents i parlants.
3. **El mapa de símbolos del model mana**: si l'export porta `symbols` a les
   metadades, s'usa aquell. El conjunt per defecte de Matcha-TTS només s'utilitza
   com a última opció.
4. **CANARI abans del corpus**: una frase catalana real del banc se sintetitza
   primer i ha de sortir amb durada i energia plausibles. Si falla, el job mor
   allà, amb zero fitxers escrits, i el log ja porta l'esquema real per ajustar.
5. **Guarda per ítem**: silenci, NaN o durada implausible → aquell ítem es
   descarta, no s'escriu.
6. **No bloquejant**: com l'euskera, si tot això falla el lot de la resta
   d'idiomes es publica igual i el català degrada a la veu del sistema `ca-ES`.

### 5.4. Accent i parlant: es tria d'oïda, no de log

El model és multiaccent i la seva metadata ve **buida**: res no diu quin índex
de `spks` és el central, que és l'accent per al qual està escrit el banc (vegeu
la nota sobre el betacisme a `valeriaMinimalPairsCa.ts`). Això no es dedueix
d'un log: s'escolta.

Per això el canari sintetitza la frase de «Provar la veu» amb els quatre primers
índexs i el workflow les puja com a **artefacte del run**
(`matxa-muestras-acentos`). S'escolten, es tria, i es fixa:

```bash
python3 scripts/generate-voice-assets.py --lang ca --voice N
```

### 5.5. Què es va comprovar del lot, i què NO

El run 51 va sintetitzar les **858** locucions (52,6 min · 17,6 MB) i el gate de
cobertura va passar de l'avís a exigir-les: **4110/4110**. Però «hi ha 858
fitxers» no vol dir «sonen bé», i soroll ben empaquetat també ompliria 858
fitxers. Es va comprovar això, que és objectiu:

| Comprovació | Resultat | Què descarta |
| :--- | :--- | :--- |
| Correlació durada ↔ longitud del text | **r = 0,959** | Soroll uniforme: l'àudio segueix el text |
| Escala per estil (s/caràcter) | `slow` 0,152 · `child` 0,084 | El `length_scale` s'aplica de debò |
| Fitxers amb mida distinta | 844 / 858 | Un mateix àudio repetit |
| Fora de la guarda de plausibilitat | **0** | Silencis, NaN, durades absurdes |
| Extrems | 0,17 s = «la» · 22,6 s = una consigna d'adult sencera | Truncaments i cues mortes |

I això **no** es va comprovar, perquè no es pot des d'aquí:

- **Com sona.** Ningú de la integració ha escoltat ni un fitxer. La qualitat, la
  naturalitat i la prosòdia les jutja una persona.
- **Si l'accent és el central.** `spks=0` és una tria per defecte, no una
  decisió informada: la metadata del model ve buida. Les mostres dels quatre
  índexs són a l'artefacte `matxa-muestras-acentos` del run.
- **La revisió logopèdica** del banc, que segueix pendent com la de qualsevol
  altra varietat abans de publicar-se.
