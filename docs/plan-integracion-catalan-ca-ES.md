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
| **Locucions neuronals sintetitzades** | La veu Ona (Piper `ca_ES`, projecte AINA/UPC) està configurada a `generate-voice-assets.py`, però el workflow `voice-assets.yml` encara no s'ha executat. **El nom del checkpoint no s'ha pogut verificar**: la política de xarxa de l'entorn d'integració bloqueja `huggingface.co`. Si el nom fos un altre, la descàrrega falla al job, amb un 404 sorollós. | La varietat funciona i parla amb la veu catalana del dispositiu. La targeta de «Veu de l'aplicació» ho DIU en pantalla, i el xip «✓ Veu Ona» només apareix quan hi ha assets de debò (`hasAssetsFor('ca')`). |
| **Càpsules formatives d'Academy** (~18 700 paraules) | La versió anglesa no va ser una traducció sinó una reautorització clínica; la catalana demana el mateix i no s'ha fet. | Es llegeixen en castellà **amb un avís a la capçalera d'Academy**. El buit està declarat a `src/i18n/uiLangFallback.ts` i el gate `check-ui-lang-fallback.js` no deixa que torni a ser silenciós. |
| **Revisió logopèdica del banc català** | Cap dels altres bancs es va publicar sense ella (el gallec la va tenir el 27/7, l'anglès una logopeda titulada de Howard el 16/8). | El contingut és a producció darrere del commutador `CA_THERAPY_CONTENT_READY` de `valeriaLocale.ts`: si la revisió troba problemes, es baixa aquest booleà i la varietat torna a castellà sense tocar res més. |

### 4.3. Etiquetes de rodatge

`Català` surt marcat **BETA** al selector de veu, igual que `English (US)`: és
etiqueta de rodatge (poques hores d'ús real), no un avís de contingut absent.
