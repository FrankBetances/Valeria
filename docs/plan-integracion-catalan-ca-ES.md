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

## 4. Skills i Plugins d'Antigravity

S'han creat les definicions del nou skill especialitzat:
- **Skill Principal**: `.agents/worker_m1/skills/valeria-i18n-ca-expert/`
  - `SKILL.md`
  - `references/clinical_glossary_and_iec_termcat.md`
  - `references/typescript_contract_and_formatting.md`
- **Plugin Bundled**: `.agents/worker_m1/plugins/valeria-i18n-ca-expert-plugin/`
  - `plugin.json`
  - `skills/valeria-i18n-ca-expert/SKILL.md`
  - `skills/valeria-i18n-ca-expert/references/clinical_glossary_and_iec_termcat.md`
  - `skills/valeria-i18n-ca-expert/references/typescript_contract_and_formatting.md`
- **Actualització del Project Skill**: `.agents/worker_m1/skills/valeria-project-expert/SKILL.md`
