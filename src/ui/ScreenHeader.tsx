// Cabecera única de las pantallas de módulo, montada con los componentes de
// React Native Reusables (src/components/ui: Text, Button, Badge, MIT) y las
// clases de NativeWind. Una sola cabecera para toda la app (CLAUDE.md, regla 5).
import React from 'react';
import { View } from 'react-native';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Text } from '../components/ui/text';
import { BlockIcon, BlockIconName } from '../ValeriaBlockIcons';

interface Props {
  /** Sin `onBack` no hay botón de vuelta. */
  onBack?: () => void;
  backLabel: string;
  /** Línea pequeña en mayúsculas sobre el título: a qué parte de la app pertenece. */
  kicker?: string;
  icon?: BlockIconName;
  title: string;
  subtitle?: string;
  /** Dato corto a la derecha del título («6 de 6 recomendadas»). */
  badge?: string;
  /** Fila opcional bajo el subtítulo: pestañas, cifras… */
  children?: React.ReactNode;
  /** Fondo: por defecto el turquesa de la marca (Academy lo cambia por dominio). */
  color?: string;
  /** Pieza a la derecha del bloque de título: la gata, un botón. */
  trailing?: React.ReactNode;
  /** Barra segmentada de progreso de una sesión. */
  dots?: { total: number; index: number; finished?: boolean };
}

export const ScreenHeader: React.FC<Props> = ({ onBack, backLabel, kicker, icon, title, subtitle, badge, children, color, trailing, dots }) => (
  <View className="bg-primary rounded-b-[26px] px-6 pb-4 pt-3" style={color ? { backgroundColor: color } : undefined}>
    {onBack && (
      <Button variant="ghost" size="sm" onPress={onBack} hitSlop={12} accessibilityLabel={backLabel}
        className="mb-3 self-start rounded-xl border border-white/30 bg-white/20 px-3 active:bg-white/30">
        <Text className="text-xs font-extrabold text-white">{`‹ ${backLabel}`}</Text>
      </Button>
    )}
    <View className="flex-row items-center">
      <View className="min-w-0 flex-1">
        {!!kicker && <Text className="mb-0.5 text-[11.5px] font-extrabold uppercase tracking-widest text-white/85">{kicker}</Text>}
        <View className="flex-row items-center">
          {icon && <View className="mr-2.5"><BlockIcon name={icon} color="#ffffff" size={24} /></View>}
          <Text variant="h3" className="min-w-0 flex-1 font-extrabold text-white" role="heading">{title}</Text>
          {!!badge && (
            <Badge variant="outline" className="ml-3 border-white/30 bg-white/20 px-3 py-1.5">
              <Text className="text-xs font-extrabold text-white" numberOfLines={1}>{badge}</Text>
            </Badge>
          )}
        </View>
        {!!subtitle && <Text className="mt-1 text-sm font-semibold text-white/90">{subtitle}</Text>}
      </View>
      {trailing && <View className="ml-3">{trailing}</View>}
    </View>
    {dots && (
      <View className="mt-3.5 flex-row gap-1.5">
        {Array.from({ length: dots.total }, (_, i) => {
          const done = dots.finished || i < dots.index;
          const current = !dots.finished && i === dots.index;
          return <View key={i} className={`h-[7px] flex-1 rounded ${done ? 'bg-white' : current ? 'bg-white/85' : 'bg-white/30'}`} />;
        })}
      </View>
    )}
    {children}
  </View>
);

export default ScreenHeader;
