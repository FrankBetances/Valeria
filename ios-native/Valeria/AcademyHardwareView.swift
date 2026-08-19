//
//  AcademyHardwareView.swift
//  Valeria
//
//  BottomSheet de Hipoacusia (Academy) · port de
//  src/ValeriaAcademy/{HipoacusiaBottomSheet,AcademyHardwareSvg}.tsx.
//  Modal in-place con dos ejes: Conceptos Clínicos y Manejo de Dispositivos
//  (Audífono · Implante Coclear · Osteointegrado), cada uno con esquemas
//  vectoriales (Canvas, cero red — port del react-native-svg original) y
//  micro-guías que inyectan XP en el silo 'hipoacusia' al marcarlas vistas.
//

import SwiftUI

struct AcademyHardwareView: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.dismiss) private var dismiss

    private enum SheetAxis { case conceptos, dispositivos }

    @State private var axis: SheetAxis = .conceptos
    @State private var device: HearingDeviceKey = .audifono

    private let accent = DOMAIN_META[.hipoacusia]!.accentFg
    private let accentBg = DOMAIN_META[.hipoacusia]!.accentBg

    var body: some View {
        let summary = model.academyDomainSummary(.hipoacusia)
        let pct = Int((summary.progress * 100).rounded())
        let activeDevice = HEARING_DEVICES.first { $0.key == device }!

        VStack(spacing: 0) {
            Capsule().fill(Color(hex: "d3dbdb")).frame(width: 42, height: 5).padding(.top, 8).padding(.bottom, 10)

            HStack(alignment: .top, spacing: 10) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("👂 Hipoacusia / Sordera").font(.system(size: 19, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                    Text("\(summary.completedCount)/\(summary.totalCount) guías · \(pct)% · 🏅 \(summary.levelName)")
                        .font(.system(size: 12.5, weight: .bold)).foregroundStyle(accent)
                }
                Spacer(minLength: 0)
                Button { dismiss() } label: {
                    Text("✕").font(.system(size: 15, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                        .frame(width: 34, height: 34).background(Color.white)
                        .overlay(Circle().stroke(VColor.border, lineWidth: 1)).clipShape(Circle())
                }.buttonStyle(.plain)
            }
            .padding(.horizontal, 16).padding(.bottom, 12)

            HStack(spacing: 6) {
                axisTab("Conceptos clínicos", .conceptos)
                axisTab("Manejo de dispositivos", .dispositivos)
            }
            .padding(.horizontal, 16)
            .overlay(Rectangle().fill(VColor.border).frame(height: 1), alignment: .bottom)

            ScrollView(showsIndicators: false) {
                VStack(spacing: 11) {
                    if axis == .conceptos {
                        schemaCard {
                            EarAnatomySchema(accent: accent).frame(width: 190, height: 190)
                        } caption: {
                            Text("Cómo viaja el sonido hasta la cóclea.")
                        }
                        ForEach(HIPOACUSIA_CONCEPTS) { u in guideCard(u) }
                    } else {
                        HStack(spacing: 8) {
                            ForEach(HEARING_DEVICES) { d in deviceTab(d) }
                        }
                        schemaCard {
                            deviceSchema(device, accent: accent).frame(width: 190, height: 190)
                        } caption: {
                            VStack(spacing: 6) {
                                Text(activeDevice.label).font(.system(size: 16, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                                Text(activeDevice.tagline).font(.system(size: 12.5, weight: .semibold))
                                    .foregroundStyle(VColor.textMuted).multilineTextAlignment(.center)
                            }
                        }
                        ForEach(activeDevice.guides) { u in guideCard(u) }
                    }
                }
                .padding(.horizontal, 16).padding(.top, 14).padding(.bottom, 24)
            }
        }
        .background(VColor.pageBg)
        .presentationDetents([.large])
        .presentationDragIndicator(.hidden)
    }

    private func axisTab(_ label: String, _ a: SheetAxis) -> some View {
        let active = axis == a
        return Button { axis = a } label: {
            VStack(spacing: 0) {
                Text(label).font(.system(size: 13, weight: .heavy))
                    .foregroundStyle(active ? accent : VColor.textMuted)
                    .multilineTextAlignment(.center).padding(.vertical, 10)
                Capsule().fill(active ? accent : .clear).frame(height: 3)
            }.frame(maxWidth: .infinity)
        }.buttonStyle(.plain)
    }

    private func deviceTab(_ d: HearingDevice) -> some View {
        let on = d.key == device
        return Button { device = d.key } label: {
            Text(d.short).font(.system(size: 13, weight: .heavy)).foregroundStyle(on ? .white : accent)
                .frame(maxWidth: .infinity).padding(.vertical, 10)
                .background(on ? accent : Color.white)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(accentBg, lineWidth: 1.5))
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }.buttonStyle(.plain)
    }

    @ViewBuilder
    private func schemaCard<Content: View, Caption: View>(
        @ViewBuilder _ content: () -> Content, @ViewBuilder caption: () -> Caption
    ) -> some View {
        VStack(spacing: 8) {
            content()
            caption()
        }
        .padding(.vertical, 16).padding(.horizontal, 12).frame(maxWidth: .infinity)
        .background(Color.white)
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(VColor.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 18)).vCardShadow()
    }

    private func guideCard(_ unit: AcademyGuideUnit) -> some View {
        let done = model.academyCompleted[unit.id] != nil
        return VStack(alignment: .leading, spacing: 9) {
            HStack(spacing: 11) {
                Text(unit.icon ?? "📄").font(.system(size: 18))
                    .frame(width: 38, height: 38).background(accentBg).clipShape(RoundedRectangle(cornerRadius: 12))
                Text(unit.heading).font(.system(size: 15.5, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                Spacer(minLength: 0)
            }
            Text(unit.body).font(.system(size: 14, weight: .semibold)).foregroundStyle(VColor.textSecondary).lineSpacing(4)
            Button {
                if !done { model.completeAcademyUnit(unit.id, quizScore: 1) }
            } label: {
                Text(done ? "✓ Visto · +\(unit.xp) XP" : "Marcar como visto · +\(unit.xp) XP")
                    .font(.system(size: 13.5, weight: .heavy))
                    .foregroundStyle(done ? accent : .white)
                    .frame(maxWidth: .infinity).padding(.vertical, 12)
                    .background(done ? accentBg : accent)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }.buttonStyle(.plain).disabled(done)
        }
        .padding(15).background(Color.white)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(done ? accent : VColor.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 16)).vCardShadow()
    }
}

// MARK: - Selector de esquema por dispositivo

@ViewBuilder
private func deviceSchema(_ key: HearingDeviceKey, accent: Color) -> some View {
    switch key {
    case .audifono: HearingAidSchema(accent: accent)
    case .implante: CochlearImplantSchema(accent: accent)
    case .osteo: BoneAnchoredSchema(accent: accent)
    }
}

// MARK: - Esquemas vectoriales (Canvas · port de AcademyHardwareSvg.tsx)
// Alto contraste, cero red. Los trazos aproximan la ilustración SVG original
// sobre un viewBox 200×200.

private let SCHEMA_INK = Color(hex: "1f2937")
private let SCHEMA_MUTED = Color(hex: "9aa6a5")
private let SCHEMA_FILL = Color(hex: "eef4f8")

private func schemaLabel(_ ctx: GraphicsContext, _ text: String, _ x: CGFloat, _ y: CGFloat, _ k: CGFloat, _ color: Color) {
    ctx.draw(
        Text(text).font(.system(size: 10.5 * k, weight: .bold)).foregroundColor(color),
        at: CGPoint(x: x * k, y: y * k), anchor: .leading
    )
}

/// Oído: pabellón, conducto auditivo, tímpano y cóclea en espiral.
struct EarAnatomySchema: View {
    var accent: Color = Color(hex: "1f6fb2")

    var body: some View {
        Canvas { ctx, size in
            let k = size.width / 200
            var pinna = Path()
            pinna.move(to: CGPoint(x: 58 * k, y: 40 * k))
            pinna.addCurve(to: CGPoint(x: 44 * k, y: 120 * k), control1: CGPoint(x: 30 * k, y: 46 * k), control2: CGPoint(x: 26 * k, y: 96 * k))
            pinna.addCurve(to: CGPoint(x: 66 * k, y: 158 * k), control1: CGPoint(x: 52 * k, y: 132 * k), control2: CGPoint(x: 50 * k, y: 150 * k))
            ctx.fill(pinna, with: .color(SCHEMA_FILL))
            ctx.stroke(pinna, with: .color(SCHEMA_INK), lineWidth: 5 * k)

            var canal = Path()
            canal.move(to: CGPoint(x: 66 * k, y: 100 * k)); canal.addLine(to: CGPoint(x: 120 * k, y: 100 * k))
            canal.move(to: CGPoint(x: 66 * k, y: 112 * k)); canal.addLine(to: CGPoint(x: 120 * k, y: 112 * k))
            ctx.stroke(canal, with: .color(SCHEMA_INK), style: StrokeStyle(lineWidth: 5 * k, lineCap: .round))

            var eardrum = Path()
            eardrum.move(to: CGPoint(x: 122 * k, y: 92 * k)); eardrum.addLine(to: CGPoint(x: 122 * k, y: 120 * k))
            ctx.stroke(eardrum, with: .color(accent), style: StrokeStyle(lineWidth: 6 * k, lineCap: .round))

            var cochlea = Path()
            cochlea.addArc(center: CGPoint(x: 148 * k, y: 100 * k), radius: 11 * k, startAngle: .degrees(0), endAngle: .degrees(300), clockwise: false)
            ctx.stroke(cochlea, with: .color(accent), style: StrokeStyle(lineWidth: 4 * k, lineCap: .round))
            ctx.fill(Path(ellipseIn: CGRect(x: (151 - 2.5) * k, y: (102 - 2.5) * k, width: 5 * k, height: 5 * k)), with: .color(accent))

            var wave = Path()
            wave.move(to: CGPoint(x: 30 * k, y: 92 * k))
            wave.addQuadCurve(to: CGPoint(x: 30 * k, y: 108 * k), control: CGPoint(x: 22 * k, y: 100 * k))
            ctx.stroke(wave, with: .color(SCHEMA_MUTED), style: StrokeStyle(lineWidth: 3 * k, lineCap: .round))

            schemaLabel(ctx, "Externo", 40, 182, k, SCHEMA_MUTED)
            schemaLabel(ctx, "Medio", 108, 182, k, SCHEMA_MUTED)
            schemaLabel(ctx, "Cóclea", 138, 182, k, accent)
        }
        .accessibilityLabel("Esquema del oído: pabellón, conducto auditivo, tímpano y cóclea.")
    }
}

/// Audífono retroauricular: cuerpo, micrófono, procesador, tubo y molde.
struct HearingAidSchema: View {
    var accent: Color = Color(hex: "1f6fb2")

    var body: some View {
        Canvas { ctx, size in
            let k = size.width / 200

            var earOutline = Path()
            earOutline.move(to: CGPoint(x: 150 * k, y: 44 * k))
            earOutline.addCurve(to: CGPoint(x: 112 * k, y: 158 * k), control1: CGPoint(x: 176 * k, y: 52 * k), control2: CGPoint(x: 176 * k, y: 140 * k))
            ctx.stroke(earOutline, with: .color(SCHEMA_MUTED), style: StrokeStyle(lineWidth: 3 * k, dash: [4 * k, 6 * k]))

            var body_ = Path()
            body_.move(to: CGPoint(x: 96 * k, y: 46 * k))
            body_.addCurve(to: CGPoint(x: 78 * k, y: 128 * k), control1: CGPoint(x: 70 * k, y: 50 * k), control2: CGPoint(x: 62 * k, y: 96 * k))
            body_.addCurve(to: CGPoint(x: 96 * k, y: 46 * k), control1: CGPoint(x: 100 * k, y: 138 * k), control2: CGPoint(x: 116 * k, y: 90 * k))
            body_.closeSubpath()
            ctx.fill(body_, with: .color(SCHEMA_FILL))
            ctx.stroke(body_, with: .color(SCHEMA_INK), lineWidth: 5 * k)

            ctx.fill(Path(ellipseIn: CGRect(x: (92 - 5) * k, y: (60 - 5) * k, width: 10 * k, height: 10 * k)), with: .color(accent))

            let chip = Path(roundedRect: CGRect(x: 82 * k, y: 80 * k, width: 16 * k, height: 16 * k), cornerRadius: 3 * k)
            ctx.fill(chip, with: .color(.white))
            ctx.stroke(chip, with: .color(SCHEMA_INK), lineWidth: 3 * k)

            var tube = Path()
            tube.move(to: CGPoint(x: 84 * k, y: 128 * k))
            tube.addQuadCurve(to: CGPoint(x: 132 * k, y: 138 * k), control: CGPoint(x: 100 * k, y: 152 * k))
            ctx.stroke(tube, with: .color(accent), style: StrokeStyle(lineWidth: 4.5 * k, lineCap: .round))

            let mold = Path(ellipseIn: CGRect(x: (140 - 12) * k, y: (132 - 9) * k, width: 24 * k, height: 18 * k))
            ctx.fill(mold, with: .color(SCHEMA_FILL))
            ctx.stroke(mold, with: .color(SCHEMA_INK), lineWidth: 5 * k)

            schemaLabel(ctx, "Micrófono", 28, 58, k, accent)
            schemaLabel(ctx, "Tubo", 62, 182, k, SCHEMA_MUTED)
            schemaLabel(ctx, "Molde", 116, 182, k, SCHEMA_MUTED)
        }
        .accessibilityLabel("Esquema de un audífono retroauricular: cuerpo, tubo y molde.")
    }
}

/// Implante coclear: procesador externo, antena con imán y electrodos.
struct CochlearImplantSchema: View {
    var accent: Color = Color(hex: "1f6fb2")

    var body: some View {
        Canvas { ctx, size in
            let k = size.width / 200

            var skin = Path()
            skin.move(to: CGPoint(x: 40 * k, y: 150 * k))
            skin.addCurve(to: CGPoint(x: 168 * k, y: 78 * k), control1: CGPoint(x: 40 * k, y: 70 * k), control2: CGPoint(x: 120 * k, y: 50 * k))
            ctx.stroke(skin, with: .color(SCHEMA_MUTED), style: StrokeStyle(lineWidth: 3 * k, dash: [4 * k, 6 * k]))

            var processor = Path()
            processor.move(to: CGPoint(x: 60 * k, y: 96 * k))
            processor.addCurve(to: CGPoint(x: 54 * k, y: 150 * k), control1: CGPoint(x: 44 * k, y: 100 * k), control2: CGPoint(x: 40 * k, y: 130 * k))
            processor.addCurve(to: CGPoint(x: 60 * k, y: 96 * k), control1: CGPoint(x: 72 * k, y: 156 * k), control2: CGPoint(x: 80 * k, y: 98 * k))
            processor.closeSubpath()
            ctx.fill(processor, with: .color(SCHEMA_FILL))
            ctx.stroke(processor, with: .color(SCHEMA_INK), lineWidth: 5 * k)
            ctx.fill(Path(ellipseIn: CGRect(x: (60 - 4) * k, y: (108 - 4) * k, width: 8 * k, height: 8 * k)), with: .color(accent))

            var cable = Path()
            cable.move(to: CGPoint(x: 72 * k, y: 104 * k))
            cable.addQuadCurve(to: CGPoint(x: 118 * k, y: 80 * k), control: CGPoint(x: 100 * k, y: 86 * k))
            ctx.stroke(cable, with: .color(accent), style: StrokeStyle(lineWidth: 4 * k, lineCap: .round))

            ctx.stroke(Path(ellipseIn: CGRect(x: (124 - 12) * k, y: (80 - 12) * k, width: 24 * k, height: 24 * k)), with: .color(SCHEMA_INK), lineWidth: 5 * k)
            ctx.fill(Path(ellipseIn: CGRect(x: (124 - 4) * k, y: (80 - 4) * k, width: 8 * k, height: 8 * k)), with: .color(accent))

            ctx.fill(Path(ellipseIn: CGRect(x: (124 - 7) * k, y: (98 - 7) * k, width: 14 * k, height: 14 * k)), with: .color(SCHEMA_FILL))
            ctx.stroke(Path(ellipseIn: CGRect(x: (124 - 7) * k, y: (98 - 7) * k, width: 14 * k, height: 14 * k)), with: .color(SCHEMA_INK), lineWidth: 4 * k)

            var electrodes = Path()
            electrodes.move(to: CGPoint(x: 126 * k, y: 104 * k))
            electrodes.addCurve(to: CGPoint(x: 154 * k, y: 128 * k), control1: CGPoint(x: 140 * k, y: 116 * k), control2: CGPoint(x: 150 * k, y: 118 * k))
            electrodes.addArc(center: CGPoint(x: 154 * k, y: 134 * k), radius: 6 * k, startAngle: .degrees(-90), endAngle: .degrees(120), clockwise: false)
            ctx.stroke(electrodes, with: .color(accent), style: StrokeStyle(lineWidth: 4.5 * k, lineCap: .round))

            schemaLabel(ctx, "Procesador", 18, 172, k, SCHEMA_MUTED)
            schemaLabel(ctx, "Antena / imán", 98, 44, k, accent)
            schemaLabel(ctx, "Electrodos", 126, 168, k, SCHEMA_MUTED)
        }
        .accessibilityLabel("Esquema de un implante coclear: procesador externo, antena con imán y electrodos en la cóclea.")
    }
}

/// Implante osteointegrado: procesador, pilar anclado al hueso y vía ósea.
struct BoneAnchoredSchema: View {
    var accent: Color = Color(hex: "1f6fb2")

    var body: some View {
        Canvas { ctx, size in
            let k = size.width / 200

            var bone = Path()
            bone.move(to: CGPoint(x: 150 * k, y: 40 * k))
            bone.addCurve(to: CGPoint(x: 60 * k, y: 150 * k), control1: CGPoint(x: 90 * k, y: 40 * k), control2: CGPoint(x: 60 * k, y: 90 * k))
            bone.addLine(to: CGPoint(x: 92 * k, y: 150 * k))
            bone.addCurve(to: CGPoint(x: 150 * k, y: 66 * k), control1: CGPoint(x: 92 * k, y: 96 * k), control2: CGPoint(x: 112 * k, y: 66 * k))
            bone.closeSubpath()
            ctx.fill(bone, with: .color(SCHEMA_FILL))
            ctx.stroke(bone, with: .color(SCHEMA_INK), lineWidth: 5 * k)

            var skin = Path()
            skin.move(to: CGPoint(x: 156 * k, y: 44 * k))
            skin.addCurve(to: CGPoint(x: 72 * k, y: 150 * k), control1: CGPoint(x: 100 * k, y: 44 * k), control2: CGPoint(x: 72 * k, y: 92 * k))
            ctx.stroke(skin, with: .color(SCHEMA_MUTED), style: StrokeStyle(lineWidth: 3 * k, dash: [4 * k, 6 * k]))

            let pillar = Path(roundedRect: CGRect(x: 96 * k, y: 78 * k, width: 10 * k, height: 22 * k), cornerRadius: 2 * k)
            ctx.fill(pillar, with: .color(.white))
            ctx.stroke(pillar, with: .color(SCHEMA_INK), lineWidth: 4 * k)

            ctx.stroke(Path(ellipseIn: CGRect(x: (101 - 15) * k, y: (70 - 15) * k, width: 30 * k, height: 30 * k)), with: .color(SCHEMA_INK), lineWidth: 5 * k)
            ctx.fill(Path(roundedRect: CGRect(x: (101 - 15) * k, y: (70 - 15) * k, width: 30 * k, height: 30 * k), cornerRadius: 15 * k), with: .color(SCHEMA_FILL))
            ctx.fill(Path(ellipseIn: CGRect(x: (101 - 5) * k, y: (70 - 5) * k, width: 10 * k, height: 10 * k)), with: .color(accent))

            var wave = Path()
            wave.move(to: CGPoint(x: 110 * k, y: 108 * k))
            wave.addQuadCurve(to: CGPoint(x: 120 * k, y: 134 * k), control: CGPoint(x: 124 * k, y: 118 * k))
            wave.addQuadCurve(to: CGPoint(x: 128 * k, y: 156 * k), control: CGPoint(x: 116 * k, y: 148 * k))
            ctx.stroke(wave, with: .color(accent), style: StrokeStyle(lineWidth: 4 * k, lineCap: .round, dash: [2 * k, 5 * k]))

            var cochlea = Path()
            cochlea.addArc(center: CGPoint(x: 150 * k, y: 150 * k), radius: 10 * k, startAngle: .degrees(0), endAngle: .degrees(300), clockwise: false)
            ctx.stroke(cochlea, with: .color(accent), style: StrokeStyle(lineWidth: 4.5 * k, lineCap: .round))

            schemaLabel(ctx, "Pilar (hueso)", 22, 112, k, SCHEMA_MUTED)
            schemaLabel(ctx, "Procesador", 62, 30, k, accent)
            schemaLabel(ctx, "Vía ósea", 118, 188, k, SCHEMA_MUTED)
        }
        .accessibilityLabel("Esquema de un implante osteointegrado: procesador, pilar anclado al hueso y transmisión por vía ósea.")
    }
}
