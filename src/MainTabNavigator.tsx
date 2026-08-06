// ============================================================================
// Valeria+ · Barra de pestañas inferior (v11) — Sprint 2.2
//
// Saca de la lista kilométrica del hub las dos cosas que el adulto necesita
// alcanzar en un toque —su formación y sus ajustes— y las pone donde el pulgar
// ya está. Sustituye al patrón actual, en el que Academy vive a media pantalla
// de scroll y los ajustes (recordatorios, voz, acceso profesional) al final.
//
// ---------------------------------------------------------------------------
// DOS DECISIONES QUE NO SON ESTÉTICAS
// ---------------------------------------------------------------------------
//
// 1. LOS NOMBRES DE RUTA NO SE TRADUCEN NI SE RENOMBRAN.
//    La pestaña se llama `ExerciseSelection`, igual que la ruta clásica, y
//    muestra «Terapias» solo como etiqueta visible. `valeriaTelemetry.noteScreen`
//    indexa el tiempo por NOMBRE DE RUTA (cur.screens): rebautizarla a
//    «Terapias» partiría en dos la serie del piloto y dejaría huérfanos los
//    datos previos. Misma razón para conservar `Academy`.
//
//    Colisión conocida y buscada: `Academy` existe también como ruta del stack
//    raíz (la usa el hub clásico). React Navigation resuelve `navigate` desde
//    el navegador más cercano hacia arriba, así que desde dentro de las
//    pestañas va a la PESTAÑA, y desde el stack clásico al SCREEN del stack.
//    Las dos rutas se llaman igual a propósito: la telemetría las suma.
//
// 2. LA BARRA NO VUELVE A APLICAR EL SAFE AREA.
//    `SafeFrame` (AppNavigator) ya reserva `insets.bottom` para la barra de
//    gestos. BottomTabBar, por su cuenta, volvería a sumar ese inset y la
//    barra quedaría flotando alta en Android 15 edge-to-edge. Por eso el
//    `tabBarStyle` fija `height` y `paddingBottom` explícitos, que en v6
//    sobrescriben el cálculo interno. Verificar en QA con gestos Y con los
//    tres botones clásicos.
// ============================================================================
import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { V } from './valeriaTheme';
import { BlockIcon, BlockIconName } from './ValeriaBlockIcons';
import { useT } from './i18n';
import ValeriaAcademyScreen from './ValeriaAcademy';
import ValeriaHubV11Screen from './ValeriaHubV11Screen';
import ValeriaSettingsScreen from './ValeriaSettingsScreen';

export type ValeriaTabParamList = {
  ExerciseSelection: undefined;
  Academy: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<ValeriaTabParamList>();

// Mismo set SVG que las tarjetas del hub. Antes eran emoji del sistema, que
// cambian de estilo y de peso entre plataformas y no casan con nada.
const tabIcon = (name: BlockIconName) => ({ color }: { color: string }) => (
  <BlockIcon name={name} color={color} size={23} />
);

export const MainTabNavigator: React.FC = () => {
  const t = useT();

  return (
    <Tab.Navigator
      initialRouteName="ExerciseSelection"
      screenOptions={{
        headerShown: false, // cada pantalla trae su cabecera turquesa
        tabBarActiveTintColor: V.color.primaryDark,
        tabBarInactiveTintColor: V.color.textMuted,
        tabBarStyle: s.bar,
        tabBarLabelStyle: s.label,
        tabBarItemStyle: s.item,
      }}
    >
      <Tab.Screen
        name="ExerciseSelection"
        component={ValeriaHubV11Screen}
        options={{
          tabBarLabel: t.tabs.therapies,
          tabBarIcon: tabIcon('tabTherapies'),
          tabBarAccessibilityLabel: t.tabs.therapiesA11y,
        }}
      />
      <Tab.Screen
        name="Academy"
        component={ValeriaAcademyScreen}
        options={{
          tabBarLabel: t.tabs.academy,
          tabBarIcon: tabIcon('tabAcademy'),
          tabBarAccessibilityLabel: t.tabs.academyA11y,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={ValeriaSettingsScreen}
        options={{
          tabBarLabel: t.tabs.settings,
          tabBarIcon: tabIcon('tabSettings'),
          tabBarAccessibilityLabel: t.tabs.settingsA11y,
        }}
      />
    </Tab.Navigator>
  );
};

const s = StyleSheet.create({
  // height + paddingBottom explícitos: anulan el safe area interno de v6, que
  // aquí sería doble. Ver nota 2 de la cabecera.
  bar: {
    height: 58,
    paddingBottom: 6,
    paddingTop: 6,
    backgroundColor: V.color.card,
    borderTopWidth: 1,
    borderTopColor: V.color.border,
    elevation: 0,
  },
  item: { minHeight: V.touchMin },
  label: { ...V.type.caption, fontWeight: V.font.extrabold },
});

export default MainTabNavigator;
