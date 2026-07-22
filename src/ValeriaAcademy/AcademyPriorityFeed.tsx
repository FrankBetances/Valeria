// ============================================================================
// Valeria+ · Academy — Feed de Prioridad (V2.0)
// Cabecera del hub. Lee PASIVAMENTE la patología de la Ficha de Registro
// (STORAGE_KEYS.registro) para inferir el dominio principal activo y sugerir 1-2
// cápsulas transversales ("Tu prioridad de hoy").
//
// RESTRICCIÓN MDR / arquitectura: es SOLO una capa de presentación para reducir
// la carga cognitiva. NO crea dominios ad-hoc ni mezcla estados: al abrir una
// sugerencia, la cápsula pertenece a su dominio de origen y su XP se inyecta en
// ESE silo (lo garantiza academyStore vía capsule.domain). El feed nunca escribe.
// ============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, V } from '../valeriaTheme';
import { DOMAIN_META, domainFromPatologia } from './academyDomains';
import { ACADEMY_CAPSULES } from './academyContent';
import { getResults } from './academyStore';
import { AcademyCapsule, AcademyDomain } from './academyTypes';

// Prioridad transversal sugerida por dominio activo. Mezcla la cápsula clave del
// propio dominio con un refuerzo de Lenguaje (el sustrato común a todo el habla).
// Cada id apunta a una cápsula real; su XP siempre irá a su silo de origen.
const PRIORITY_BY_DOMAIN: Record<AcademyDomain, string[]> = {
  lenguaje:   ['dev-input', 'med-adulto'],
  hipoacusia: ['dev-input', 'med-adulto'],
  dislalias:  ['dis-punto', 'dev-input'],
  dislexia:   ['dlx-fonologica', 'dev-input'],
  tea:        ['tea-anticipar', 'med-adulto'],
};

const byId = (id: string): AcademyCapsule | undefined => ACADEMY_CAPSULES.find((c) => c.id === id);

export const AcademyPriorityFeed: React.FC<{
  onOpenCapsule: (capsule: AcademyCapsule) => void;
  refreshKey?: number;
}> = ({ onOpenCapsule, refreshKey }) => {
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

  const results = getResults(); // refreshKey fuerza recálculo tras completar
  void refreshKey;

  const suggestions = (PRIORITY_BY_DOMAIN[activeDomain] ?? [])
    .map(byId)
    .filter((c): c is AcademyCapsule => !!c && !results[c.id])
    .slice(0, 2);

  if (suggestions.length === 0) return null;

  const meta = DOMAIN_META[activeDomain];

  return (
    <View style={s.wrap}>
      <View style={s.headRow}>
        <Text style={s.kicker}>⭐ TU PRIORIDAD DE HOY</Text>
        <View style={[s.domainTag, { backgroundColor: 'rgba(255,255,255,.18)' }]}>
          <Text style={s.domainTagTxt}>{meta.icon} {meta.short}</Text>
        </View>
      </View>
      {suggestions.map((c) => {
        const cm = DOMAIN_META[c.domain];
        return (
          <Pressable
            key={c.id}
            onPress={() => onOpenCapsule(c)}
            style={s.item}
            accessibilityRole="button"
            accessibilityLabel={`Prioridad sugerida: ${c.title}. Dominio ${cm.short}.`}
          >
            <View style={[s.itemIcon, { backgroundColor: cm.accentBg }]}>
              <Text style={{ fontSize: 20 }}>{c.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.itemTitle} numberOfLines={1}>{c.title}</Text>
              <Text style={s.itemSub} numberOfLines={1}>{c.summary}</Text>
            </View>
            <View style={[s.itemChip, { borderColor: cm.accentFg }]}>
              <Text style={[s.itemChipTxt, { color: cm.accentFg }]}>{cm.short}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  wrap: { backgroundColor: 'rgba(255,255,255,.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,.28)', borderRadius: 16, padding: 12, marginTop: 14 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  kicker: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  domainTag: { borderRadius: 9, paddingHorizontal: 8, paddingVertical: 3 },
  domainTagTxt: { color: '#fff', fontSize: 10.5, fontWeight: '800' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#fff', borderRadius: 13, padding: 10, marginBottom: 8 },
  itemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontWeight: '800', color: V.color.textPrimary },
  itemSub: { fontSize: 11.5, fontWeight: '600', color: V.color.textMuted, marginTop: 1 },
  itemChip: { borderWidth: 1.5, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4 },
  itemChipTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
});

export default AcademyPriorityFeed;
