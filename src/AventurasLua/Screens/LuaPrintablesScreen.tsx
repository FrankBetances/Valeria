// ============================================================================
// Valeria+ · Aventuras con Lúa · Galería de Material Imprimible
// 10 fichas manipulativas, secuencias de rutinas y diplomas listos para usar.
// ============================================================================
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "../../i18n";
import { BlockIcon } from "../../ValeriaBlockIcons";
import { CatPixel } from "../../ValeriaCatPixel";
import { LUA_COLORS, LUA_RADII } from "../Theme/luaTheme";
import { LuaPrintableItem, LUA_PRINTABLES_CATALOG } from "../index";

interface Props {
  navigation: any;
  route: {
    params?: {
      printId?: string;
    };
  };
}

export const LuaPrintablesScreen: React.FC<Props> = ({ navigation, route }) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { printId } = route.params || {};

  const [selectedId, setSelectedId] = useState<string>(
    printId || LUA_PRINTABLES_CATALOG[0]?.id || "lua_print_01"
  );

  const selectedItem: LuaPrintableItem | undefined =
    LUA_PRINTABLES_CATALOG.find((p) => p.id === selectedId) || LUA_PRINTABLES_CATALOG[0];

  const handleSharePrintable = async (item: LuaPrintableItem) => {
    try {
      await Share.share({
        title: item.title,
        message: `${item.title}\n${item.subtitle}\n\n${item.instructions}\n\nMateriales: ${item.materialsNeeded.join(", ")}`,
      });
    } catch (e) {
      // cancelado por el usuario
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Barra superior */}
      <View style={s.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t.common.back}
          hitSlop={12}
        >
          <Text style={s.backTxt}>←</Text>
        </Pressable>
        <View style={s.titleWrap}>
          <Text style={s.headerTitle}>{t.luaHub.secPrintablesTitle}</Text>
          <Text style={s.headerSub}>{t.luaHub.secPrintablesSub}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Ficha seleccionada en detalle */}
        {selectedItem && (
          <View style={s.detailCard}>
            <View style={s.detailHeader}>
              <View style={[s.detailIcon, { backgroundColor: LUA_COLORS.mintLight }]}>
                <BlockIcon name="printable" color={LUA_COLORS.mintDark} size={28} />
              </View>
              <View style={s.detailHeaderTxt}>
                <Text style={s.detailTitle}>{selectedItem.title}</Text>
                <Text style={s.detailSub}>{selectedItem.subtitle}</Text>
              </View>
            </View>

            <View style={s.metaSection}>
              <Text style={s.metaLabel}>{t.luaHub.printableGoal}</Text>
              <Text style={s.metaVal}>{selectedItem.instructions}</Text>
            </View>

            {selectedItem.materialsNeeded.length > 0 && (
              <View style={s.metaSection}>
                <Text style={s.metaLabel}>{t.luaHub.printableInstructions}</Text>
                <View style={s.materialsList}>
                  {selectedItem.materialsNeeded.map((mat, idx) => (
                    <Text key={idx} style={s.materialItem}>
                      • {mat}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            <Pressable
              onPress={() => handleSharePrintable(selectedItem)}
              style={s.shareBtn}
              accessibilityRole="button"
              accessibilityLabel={t.luaHub.printableShare}
            >
              <BlockIcon name="printable" color="#FFFFFF" size={20} />
              <Text style={s.shareBtnTxt}>{t.luaHub.printableShare}</Text>
            </Pressable>
          </View>
        )}

        {/* Lista completa de recursos */}
        <Text style={s.catalogHeading}>{t.luaHub.secPrintablesTitle}</Text>
        <View style={s.itemsGrid}>
          {LUA_PRINTABLES_CATALOG.map((item) => {
            const isCurrent = item.id === selectedId;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedId(item.id)}
                style={[s.catalogItem, isCurrent && s.catalogItemActive]}
                accessibilityRole="button"
                accessibilityLabel={item.title} // i18n-exempt: catálogo clínico dinámico
              >
                <View style={s.catalogItemIcon}>
                  <BlockIcon
                    name="printable"
                    color={isCurrent ? LUA_COLORS.mintDark : LUA_COLORS.textMuted}
                    size={22}
                  />
                </View>
                <View style={s.catalogItemBody}>
                  <Text
                    style={[s.catalogItemTitle, isCurrent && s.catalogItemTitleActive]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text style={s.catalogItemSub} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LUA_COLORS.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LUA_COLORS.divider,
    backgroundColor: LUA_COLORS.surface,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LUA_COLORS.surfaceSubtle,
    marginRight: 12,
  },
  backTxt: {
    fontSize: 22,
    color: LUA_COLORS.textPrimary,
    fontWeight: "700",
  },
  titleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: LUA_COLORS.primary,
  },
  headerSub: {
    fontSize: 12,
    color: LUA_COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  detailCard: {
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.lg,
    padding: 18,
    borderWidth: 2,
    borderColor: LUA_COLORS.mint,
    marginBottom: 24,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  detailHeaderTxt: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: LUA_COLORS.textPrimary,
    marginBottom: 2,
  },
  detailSub: {
    fontSize: 13,
    color: LUA_COLORS.textSecondary,
  },
  metaSection: {
    marginBottom: 14,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: LUA_COLORS.primaryDark,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  metaVal: {
    fontSize: 14,
    color: LUA_COLORS.textSecondary,
    lineHeight: 20,
  },
  materialsList: {
    gap: 4,
  },
  materialItem: {
    fontSize: 13,
    color: LUA_COLORS.textSecondary,
  },
  shareBtn: {
    minHeight: 48,
    borderRadius: LUA_RADII.md,
    backgroundColor: LUA_COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  shareBtnTxt: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  catalogHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: LUA_COLORS.textPrimary,
    marginBottom: 12,
  },
  itemsGrid: {
    gap: 10,
  },
  catalogItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.md,
    padding: 12,
    borderWidth: 1,
    borderColor: LUA_COLORS.border,
    minHeight: 64,
  },
  catalogItemActive: {
    borderColor: LUA_COLORS.mint,
    backgroundColor: LUA_COLORS.mintLight,
  },
  catalogItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LUA_COLORS.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  catalogItemBody: {
    flex: 1,
  },
  catalogItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: LUA_COLORS.textPrimary,
    marginBottom: 2,
  },
  catalogItemTitleActive: {
    color: LUA_COLORS.mintDark,
  },
  catalogItemSub: {
    fontSize: 12,
    color: LUA_COLORS.textMuted,
  },
});
