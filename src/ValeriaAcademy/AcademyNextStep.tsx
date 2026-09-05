// ============================================================================
// Valeria+ · Academy — Siguiente paso (V3.0)
// Sustituye al Feed de Prioridad, que ofrecía DOS cápsulas a la vez y con ellas
// se comía media pantalla: la cabecera medía 425 px de 844 y el catálogo de
// dominios —el contenido real— empezaba fuera de la vista.
//
// Ahora es UNA sola tarjeta: la siguiente cápsula que toca leer. Y no es la
// misma para siempre; la elección avanza con el progreso (semilla del dominio →
// resto de su catálogo → refuerzo transversal de Lenguaje), así que sigue
// sirviendo después de leer las dos primeras en vez de desaparecer.
//
// RESTRICCIÓN MDR / arquitectura: sigue siendo SOLO presentación. Lee la
// patología de la Ficha (STORAGE_KEYS.registro) para ordenar la sugerencia y no
// escribe nada. La cápsula pertenece a su dominio de origen y su XP se inyecta
// en ESE silo (lo garantiza academyStore vía capsule.domain).
// ============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, V } from '../valeriaTheme';
import { useT } from '../i18n';
import { domainMetaFor, domainFromPatologia } from './academyDomains';
import { capsulesForUiLang } from './academyContent';
import { getResults } from './academyStore';
import { AcademyCapsule, AcademyDomain } from './academyTypes';
import { BlockIcon } from '../ValeriaBlockIcons';
import { getUiLang } from '../valeriaUiLang';

// Por dónde se entra a cada dominio. Antes eran dos ids por dominio y se
// pintaban los dos; ahora es el ORDEN en que se recorren, y solo se enseña el
// primero que quede sin leer.
//
// Hipoacusia no tiene catálogo de cápsulas (su dominio son las guías del
// BottomSheet), así que su entrada son cápsulas de Lenguaje. Eso el usuario lo
// VE ahora: cuando el dominio de la cápsula no es el de la ficha, la tarjeta
// dice por qué. Antes el rótulo decía «Hipoacusia» sobre dos cápsulas marcadas
// «Lenguaje» y con el icono de oreja encima, sin explicación.
const PRIORITY_BY_DOMAIN: Record<AcademyDomain, string[]> = {
  lenguaje:   ['dev-input', 'med-adulto'],
  // Mitos: se entra por el que sostiene a todos los demás («se aprende
  // imitando»), porque desmontarlo es lo que hace entendible el resto del
  // método; el segundo es el que más caro se paga si nadie lo contradice a
  // tiempo («ya hablará»).
  mitos:      ['mito-imitacion', 'mito-esperar'],
  hipoacusia: ['dev-input', 'med-adulto'],
  dislalias:  ['dis-punto', 'dev-input'],
  dislexia:   ['dlx-fonologica', 'dev-input'],
  tea:        ['tea-anticipar', 'med-adulto'],
  // LSE: se entra por qué es la lengua, no por el vocabulario. La cápsula que
  // responde «¿signar retrasa el habla?» va la segunda a propósito: es la duda
  // que trae la familia, y contestarla antes de nada evita que el resto del
  // módulo se lea con esa sospecha de fondo.
  signos:     ['lse-que-es', 'lse-no-frena'],
};

// La siguiente cápsula sin leer, en tres escalones. El tercero existe porque
// Lenguaje es el sustrato común a todos los dominios: cuando el silo propio se
// agota (o no tiene catálogo, como Hipoacusia), lo que toca es reforzar ahí.
export const pickNextCapsule = (
  domain: AcademyDomain,
  capsules: AcademyCapsule[],
  done: Readonly<Record<string, unknown>>,
): AcademyCapsule | null => {
  const pending = (c: AcademyCapsule | undefined): c is AcademyCapsule => !!c && !done[c.id];
  for (const id of PRIORITY_BY_DOMAIN[domain] ?? []) {
    const seed = capsules.find((c) => c.id === id);
    if (pending(seed)) return seed;
  }
  return capsules.find((c) => c.domain === domain && !done[c.id])
    ?? capsules.find((c) => c.domain === 'lenguaje' && !done[c.id])
    ?? null;
};

export const AcademyNextStep: React.FC<{
  onOpenCapsule: (capsule: AcademyCapsule) => void;
  refreshKey?: number;
}> = ({ onOpenCapsule, refreshKey }) => {
  const t = useT();
  const [activeDomain, setActiveDomain] = useState<AcademyDomain>('lenguaje');

  // Lectura pasiva y única de la Ficha (JSON en claro). No bloquea el render.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.registro);
        if (alive && raw) setActiveDomain(domainFromPatologia(JSON.parse(raw)?.patologia));
      } catch (e) {
        /* sin Ficha: se mantiene 'lenguaje' */
      }
    })();
    return () => { alive = false; };
  }, []);

  const results = getResults();
  void refreshKey;

  const lang = getUiLang();
  const next = pickNextCapsule(activeDomain, capsulesForUiLang(lang), results);
  if (!next) return null;

  const cm = domainMetaFor(next.domain, lang);
  const borrowed = next.domain !== activeDomain;

  return (
    <View style={s.wrap}>
      <Text style={s.kicker}>{t.academy.nextStepKicker}</Text>

      <Pressable
        onPress={() => onOpenCapsule(next)}
        style={s.card}
        accessibilityRole="button"
        accessibilityLabel={t.academy.priorityA11y(next.title, cm.label)}
      >
        {/* Icono y rótulo del dominio DE LA CÁPSULA. Hasta aquí se pintaba el
            icono del dominio ACTIVO sobre el fondo del dominio de la cápsula:
            una cápsula de Lenguaje salía con la oreja de Hipoacusia. */}
        <View style={[s.icon, { backgroundColor: cm.accentBg }]}>
          <BlockIcon name={cm.icon} color={cm.accentFg} size={26} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.track, { color: cm.accentFg }]}>{cm.label.toUpperCase()}</Text>
          {/* Dos líneas, no una: los títulos son preguntas («¿Cómo aprenden a
              hablar?») y a una línea se cortaban TODOS. */}
          <Text style={s.title} numberOfLines={2}>{next.title}</Text>
          <Text style={s.summary} numberOfLines={2}>{next.summary}</Text>
          <Text style={s.meta}>{t.academy.readTime(next.minutes)} · {next.xp} XP</Text>
        </View>
        <View style={[s.chev, { backgroundColor: cm.accentFg }]}>
          <Text style={s.chevTxt}>›</Text>
        </View>
      </Pressable>

      {borrowed && (
        <Text style={s.reason}>
          {t.academy.nextStepReason(domainMetaFor(activeDomain, lang).label)}
        </Text>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  // Sin caja de color alrededor: la tarjeta blanca sobre el turquesa de la
  // cabecera ya se separa sola. El bloque azul que la envolvía era un
  // contenedor dentro de otro contenedor, y a 390 px eso es ruido.
  wrap: { marginTop: 16 },
  kicker: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 9 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, backgroundColor: '#fff', borderRadius: 16, padding: 14, ...V.shadow.card },
  icon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  track: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.6, marginBottom: 2 },
  title: { fontSize: 15.5, fontWeight: '800', color: V.color.textPrimary, lineHeight: 20 },
  summary: { fontSize: 12, fontWeight: '600', color: V.color.textSecondary, marginTop: 2, lineHeight: 16 },
  meta: { fontSize: 11, fontWeight: '700', color: V.color.textSecondary, marginTop: 6 },
  chev: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  chevTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  reason: { color: 'rgba(255,255,255,.92)', fontSize: 11.5, fontWeight: '700', marginTop: 8, lineHeight: 16 },
});

export default AcademyNextStep;
