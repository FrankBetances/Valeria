// ============================================================================
// Aventuras con Lúa · La hoja, dibujada
//
// «Imprime y Juega» tenía diez fichas descritas y ninguna dibujada: el único
// botón compartía el texto de las instrucciones. Esto pinta la ficha de verdad
// —con los pictogramas del banco propio— para que se pueda usar desde la
// tableta o llevarse a papel.
//
// Lo que NO hace: generar un PDF. Eso pide `expo-print`, que es una dependencia
// nativa y obliga a prebuild; el render vive aquí para que el día que se añada
// solo haya que envolver este mismo árbol.
// ============================================================================
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FichaVisual } from "../../ValeriaPictograms";
import { LUA_COLORS, LUA_RADII } from "../Theme/luaTheme";
import type { LuaPrintableSheet as Sheet, LuaSheetCell } from "../Catalog/LuaPrintablesCatalog";

const Cell: React.FC<{ cell: LuaSheetCell; size?: number }> = ({ cell, size = 56 }) => (
  <View style={s.cell}>
    {cell.pic ? (
      <FichaVisual word={cell.label} emoji="" pic={cell.pic} size={size} />
    ) : (
      <View style={[s.blankBox, { width: size, height: size }]} />
    )}
    <Text style={s.cellLabel} numberOfLines={1}>{cell.label}</Text>
  </View>
);

const NameDateRule: React.FC<{ nameLabel: string; dateLabel: string }> = ({ nameLabel, dateLabel }) => (
  <View style={s.ruleRow}>
    <Text style={s.ruleTxt}>{`${nameLabel}: ______________________`}</Text>
    <Text style={s.ruleTxt}>{`${dateLabel}: ____________`}</Text>
  </View>
);

export const LuaPrintableSheet: React.FC<{
  sheet: Sheet;
  nameLabel: string;
  dateLabel: string;
}> = ({ sheet, nameLabel, dateLabel }) => {
  let body: React.ReactNode = null;

  switch (sheet.kind) {
    case "pic_cards": {
      const w = `${100 / sheet.cols}%` as const;
      body = (
        <View style={s.grid}>
          {sheet.cells.map((c, i) => (
            <View key={i} style={[{ width: w }, s.gridItem, sheet.cutGuides && s.cutGuide]}>
              <Cell cell={c} />
            </View>
          ))}
        </View>
      );
      break;
    }
    case "sequence":
      body = (
        <View style={s.seqRow}>
          {sheet.steps.map((st, i) => (
            <View key={i} style={s.seqStep}>
              <View style={s.seqNumber}><Text style={s.seqNumberTxt}>{i + 1}</Text></View>
              <Cell cell={st} size={52} />
            </View>
          ))}
        </View>
      );
      break;
    case "tracing":
      body = (
        <View>
          {sheet.letters.map((L) => (
            <View key={L} style={s.traceRow}>
              <Text style={s.traceModel}>{L}</Text>
              <View style={s.traceLine}>
                {Array.from({ length: sheet.repeats }).map((_, i) => (
                  <Text key={i} style={s.traceGhost}>{L}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      );
      break;
    case "columns":
      body = (
        <View>
          <View style={s.colRow}>
            {sheet.headings.map((h) => (
              <View key={h} style={s.colBox}>
                <Text style={s.colHeading}>{h}</Text>
              </View>
            ))}
          </View>
          <Text style={s.subHeading}>{"— — — — — — — — — — — — — — — —"}</Text>
          <View style={s.grid}>
            {sheet.chips.map((c, i) => (
              <View key={i} style={[{ width: "33.33%" }, s.gridItem, s.cutGuide]}>
                <Cell cell={c} size={44} />
              </View>
            ))}
          </View>
        </View>
      );
      break;
    case "word_gaps":
      body = (
        <View>
          {sheet.items.map((it, i) => (
            <View key={i} style={s.gapRow}>
              {it.pic ? <FichaVisual word="" emoji="" pic={it.pic} size={52} /> : null}
              <Text style={s.gapTemplate}>{it.template}</Text>
              <View style={s.drawBox} />
            </View>
          ))}
        </View>
      );
      break;
    case "rhyme_pairs":
      body = (
        <View>
          {sheet.pairs.map((p, i) => (
            <View key={i} style={s.domino}>
              <View style={s.dominoHalf}><Cell cell={p[0]} size={44} /></View>
              <View style={s.dominoDivider} />
              <View style={s.dominoHalf}><Cell cell={p[1]} size={44} /></View>
            </View>
          ))}
        </View>
      );
      break;
    case "wheel":
      body = (
        <View style={s.wheel}>
          {sheet.segments.map((seg) => (
            <View key={seg.label} style={[s.wheelSeg, { backgroundColor: seg.color }]}>
              {seg.pic ? <FichaVisual word={seg.label} emoji="" pic={seg.pic} size={44} /> : null}
              <Text style={s.wheelTxt}>{seg.label}</Text>
            </View>
          ))}
          <View style={s.wheelPin} />
        </View>
      );
      break;
    case "weekly":
      body = (
        <View style={s.table}>
          <View style={s.tableRow}>
            <View style={[s.tableCell, s.tableHeadCell, s.tableFirstCol]} />
            {sheet.days.map((d) => (
              <View key={d} style={[s.tableCell, s.tableHeadCell]}>
                <Text style={s.tableHeadTxt} numberOfLines={1}>{d.slice(0, 3)}</Text>
              </View>
            ))}
          </View>
          {sheet.rows.map((r) => (
            <View key={r} style={s.tableRow}>
              <View style={[s.tableCell, s.tableFirstCol]}>
                <Text style={s.tableRowTxt} numberOfLines={2}>{r}</Text>
              </View>
              {sheet.days.map((d) => <View key={d} style={s.tableCell} />)}
            </View>
          ))}
        </View>
      );
      break;
    case "diploma":
      body = (
        <View style={s.diploma}>
          <Text style={s.diplomaHeadline}>{sheet.headline}</Text>
          <Text style={s.diplomaBody}>{sheet.body}</Text>
          <Text style={s.diplomaRule}>{"____________________________"}</Text>
        </View>
      );
      break;
  }

  return (
    <View style={s.sheet}>
      {body}
      <NameDateRule nameLabel={nameLabel} dateLabel={dateLabel} />
    </View>
  );
};

const s = StyleSheet.create({
  // Proporción de folio y fondo blanco: lo que se ve es la hoja, no la app.
  sheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: LUA_RADII.lg,
    borderWidth: 1,
    borderColor: LUA_COLORS.borderStrong,
    padding: 14,
    marginTop: 12,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridItem: { alignItems: "center", paddingVertical: 10 },
  cutGuide: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: LUA_COLORS.borderStrong,
  },
  cell: { alignItems: "center" },
  cellLabel: {
    marginTop: 4, fontSize: 13, fontWeight: "700",
    color: LUA_COLORS.textPrimary, textAlign: "center",
  },
  blankBox: {
    borderWidth: 1, borderStyle: "dashed",
    borderColor: LUA_COLORS.borderStrong, borderRadius: 8,
  },
  seqRow: { flexDirection: "row", justifyContent: "space-between" },
  seqStep: { alignItems: "center", flex: 1 },
  seqNumber: {
    width: 22, height: 22, borderRadius: 11, marginBottom: 4,
    alignItems: "center", justifyContent: "center",
    backgroundColor: LUA_COLORS.primary,
  },
  seqNumberTxt: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  traceRow: { marginBottom: 14 },
  traceModel: { fontSize: 40, fontWeight: "800", color: LUA_COLORS.textPrimary },
  traceLine: {
    flexDirection: "row", gap: 10, borderBottomWidth: 1,
    borderBottomColor: LUA_COLORS.borderStrong, paddingBottom: 2,
  },
  traceGhost: { fontSize: 34, color: LUA_COLORS.border, fontWeight: "700" },
  colRow: { flexDirection: "row", gap: 8 },
  colBox: {
    flex: 1, minHeight: 96, borderWidth: 1, borderRadius: 8,
    borderColor: LUA_COLORS.borderStrong, alignItems: "center", paddingTop: 6,
  },
  colHeading: { fontSize: 13, fontWeight: "800", color: LUA_COLORS.textSecondary },
  subHeading: { textAlign: "center", color: LUA_COLORS.textMuted, marginVertical: 8 },
  gapRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginBottom: 12, minHeight: 60,
  },
  gapTemplate: { fontSize: 24, letterSpacing: 3, fontWeight: "800", color: LUA_COLORS.textPrimary },
  drawBox: {
    flex: 1, height: 60, borderWidth: 1, borderStyle: "dashed",
    borderColor: LUA_COLORS.borderStrong, borderRadius: 8,
  },
  domino: {
    flexDirection: "row", alignItems: "center", marginBottom: 10,
    borderWidth: 1, borderRadius: 10, borderColor: LUA_COLORS.borderStrong,
    paddingVertical: 8,
  },
  dominoHalf: { flex: 1, alignItems: "center" },
  dominoDivider: { width: 1, alignSelf: "stretch", backgroundColor: LUA_COLORS.borderStrong },
  wheel: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  wheelSeg: {
    width: "33.33%", paddingVertical: 12, alignItems: "center",
    borderWidth: 1, borderColor: "#FFFFFF",
  },
  wheelTxt: { fontSize: 13, fontWeight: "800", color: LUA_COLORS.textPrimary },
  wheelPin: {
    width: 18, height: 18, borderRadius: 9, marginTop: 10,
    borderWidth: 2, borderColor: LUA_COLORS.primary,
  },
  table: { borderWidth: 1, borderColor: LUA_COLORS.borderStrong, borderRadius: 8 },
  tableRow: { flexDirection: "row" },
  tableCell: {
    flex: 1, minHeight: 34, borderWidth: 0.5,
    borderColor: LUA_COLORS.border, alignItems: "center", justifyContent: "center",
  },
  tableFirstCol: { flex: 2, paddingHorizontal: 4 },
  tableHeadCell: { backgroundColor: LUA_COLORS.surfaceSubtle },
  tableHeadTxt: { fontSize: 11, fontWeight: "800", color: LUA_COLORS.textSecondary },
  tableRowTxt: { fontSize: 11, color: LUA_COLORS.textPrimary },
  diploma: { alignItems: "center", paddingVertical: 18 },
  diplomaHeadline: { fontSize: 30, fontWeight: "800", color: LUA_COLORS.primary },
  diplomaBody: {
    fontSize: 14, textAlign: "center", marginTop: 8,
    color: LUA_COLORS.textSecondary, paddingHorizontal: 12,
  },
  diplomaRule: { marginTop: 24, color: LUA_COLORS.textMuted, letterSpacing: 1 },
  ruleRow: {
    flexDirection: "row", justifyContent: "space-between",
    marginTop: 14, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: LUA_COLORS.border,
  },
  ruleTxt: { fontSize: 11, color: LUA_COLORS.textMuted },
});

export default LuaPrintableSheet;
