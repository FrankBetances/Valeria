// ============================================================================
// Valeria+ · Selector de idioma de la INTERFAZ (EN-2.2)
//
// Tres opciones, no dos, y la tercera es la que evita el soporte:
//
//   Automático · la UI sigue a la variedad de terapia (comportamiento de
//                siempre: sin `en-US`, todo el mundo ve castellano).
//   Español    · pone la app entera en castellano.
//   English    · pone la app entera en inglés: textos Y locuciones.
//
// Sin «Automático» no habría forma de VOLVER al acoplamiento por defecto una
// vez tocado el selector, y el adulto se quedaría con una elección pegada sin
// saber por qué su app no cambia al cambiar de variedad.
//
// Elegir un idioma mueve TAMBIÉN la variedad de terapia (setAppLanguage): en
// inglés, la app suena en inglés. Quien quiera el desacople bilingüe —interfaz
// en un idioma, terapia en otro— lo consigue tocando después «Voz de la app»,
// que es el eje de la terapia y no se ha ido a ninguna parte.
// ============================================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { V } from './valeriaTheme';
import { useT } from './i18n';
import {
  UiLang, getUiLang, isUiLangExplicit, setAppLanguage, clearUiLangOverride, subscribeUiLang,
} from './valeriaUiLang';
import { getLocale } from './valeriaLocale';

type Choice = 'auto' | UiLang;

// `onLight`: el selector nació para vivir SOBRE LA CABECERA TURQUESA (Créditos),
// así que su paleta es blanca y translúcida. Puesto tal cual sobre el fondo claro
// de página, el texto blanco queda ilegible y la tarjeta se ve lavada. Esta
// variante cambia solo los colores; sin la prop, el aspecto es el de siempre.
export const ValeriaUiLangPicker: React.FC<{ compact?: boolean; onLight?: boolean }> = ({ compact, onLight }) => {
  const t = useT();

  // Estado local espejo: el módulo de idioma no es un store de React, así que
  // se fuerza el repintado con el mismo evento al que se suscribe useT().
  const [, force] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => subscribeUiLang(force), []);

  const current: Choice = isUiLangExplicit() ? getUiLang() : 'auto';

  const choose = (c: Choice): void => {
    if (c === 'auto') { void clearUiLangOverride(getLocale()); return; }
    // Cambia la app ENTERA: textos y locuciones. Ver setAppLanguage.
    void setAppLanguage(c);
  };

  const options: { key: Choice; label: string; hint?: string }[] = [
    { key: 'auto', label: t.settings.uiLangAuto, hint: t.settings.uiLangAutoHint },
    { key: 'es', label: t.settings.uiLangEs },
    { key: 'en', label: t.settings.uiLangEn },
    { key: 'ca', label: t.settings.uiLangCa },
  ];

  return (
    <View style={[s.card, compact && s.cardCompact, onLight && s.cardLight]}>
      <Text style={[s.title, onLight && s.titleLight]}>{t.settings.uiLangTitle}</Text>
      <Text style={[s.hint, onLight && s.hintLight]}>{t.settings.uiLangHint}</Text>

      <View style={s.row}>
        {options.map((o) => {
          const on = current === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => { choose(o.key); }}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={o.label}
              style={[s.chip, onLight && s.chipLight, on && s.chipOn, on && onLight && s.chipOnLight]}
            >
              <Text style={[s.chipTxt, onLight && s.chipTxtLight, on && s.chipTxtOn, on && onLight && s.chipTxtOnLight]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {current === 'auto' ? <Text style={[s.autoHint, onLight && s.autoHintLight]}>{t.settings.uiLangAutoHint}</Text> : null}
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 18,
    paddingVertical: 16, paddingHorizontal: 16,
  },
  cardCompact: { paddingVertical: 12, paddingHorizontal: 12 },
  title: { fontSize: 14, fontWeight: '900', color: '#fff' },
  hint: {
    marginTop: 5, fontSize: 11.5, fontWeight: V.font.bold, lineHeight: 16,
    color: 'rgba(255,255,255,0.78)',
  },
  row: { marginTop: 12, flexDirection: 'row', gap: 8 },
  chip: {
    // `flex: 1` reparte el ancho: tres opciones apiladas a la izquierda con
    // huecos desiguales se veían amontonadas. Segmentado, ocupan la fila.
    flex: 1, alignItems: 'center',
    paddingVertical: 11, paddingHorizontal: 10, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  chipOn: { backgroundColor: '#fff', borderColor: '#fff' },
  chipTxt: { fontSize: 13, fontWeight: '800', color: '#fff', textAlign: 'center' },
  chipTxtOn: { color: V.color.primaryDark },
  autoHint: {
    marginTop: 9, fontSize: 11, fontWeight: V.font.bold,
    color: 'rgba(255,255,255,0.66)',
  },

  // ---- Variante sobre fondo claro (pestaña Ajustes) ----
  cardLight: { backgroundColor: V.color.card, borderColor: V.color.border, ...V.shadow.card },
  titleLight: { color: V.color.textPrimary },
  hintLight: { color: V.color.textMuted },
  chipLight: { borderColor: V.color.border, backgroundColor: V.color.pageBg },
  chipOnLight: { backgroundColor: V.color.primary, borderColor: V.color.primary },
  chipTxtLight: { color: V.color.textSecondary },
  chipTxtOnLight: { color: '#fff' },
  autoHintLight: { color: V.color.textMuted },
});

export default ValeriaUiLangPicker;
