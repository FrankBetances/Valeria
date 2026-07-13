//
//  ResultsDashboardView.swift
//  Valeria
//
//  Panel de Resultados y Evolución · port de src/ValeriaPatientResultsDashboardScreen.tsx.
//  Adherencia semanal (anillo), evolución por estrellas (línea) e historial de sesiones,
//  más el resumen de gamificación. Lee el historial en memoria del AppModel.
//

import SwiftUI

struct ResultsDashboardView: View {
    @EnvironmentObject private var model: AppModel
    @EnvironmentObject private var router: Router

    private let weeklyGoal = 5

    private var doneThisWeek: Int { min(model.history.count, weeklyGoal) }
    private var adherence: Double { Double(doneThisWeek) / Double(weeklyGoal) }
    private var lastFive: [SessionRecord] { Array(model.history.prefix(5).reversed()) }

    var body: some View {
        VStack(spacing: 0) {
            VHeader {
                BackPill(label: "‹ Ejercicios") { router.pop() }.padding(.bottom, 10)
                Text("valeria+").font(.system(size: 13, weight: .heavy)).tracking(1).foregroundStyle(.white).padding(.bottom, 6)
                Text("Resultados y Evolución").font(.system(size: 24, weight: .heavy)).foregroundStyle(.white)
                Text("\(model.activeName) · NHC \(model.activePatient?.nhc ?? "HC-2041")")
                    .font(.system(size: 13, weight: .semibold)).foregroundStyle(Color.white.opacity(0.9)).padding(.top, 4)
            }

            ScrollView(showsIndicators: false) {
                VStack(spacing: 14) {
                    gamificationCard
                    adherenceCard
                    evolutionCard
                    historyCard
                    HStack(spacing: 11) {
                        Button { router.push(.exercisePlayer(ids: [])) } label: {
                            Text("Nueva sesión").font(.system(size: 15, weight: .heavy)).foregroundStyle(.white)
                                .frame(maxWidth: .infinity).padding(.vertical, 15)
                                .background(VColor.primary).clipShape(RoundedRectangle(cornerRadius: 14)).vButtonShadow()
                        }.buttonStyle(.plain)
                        Button { router.popToRoot() } label: {
                            Text("Inicio").font(.system(size: 15, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                                .frame(maxWidth: .infinity).padding(.vertical, 15)
                                .background(Color.white)
                                .overlay(RoundedRectangle(cornerRadius: 14).stroke(VColor.primary, lineWidth: 1.5))
                                .clipShape(RoundedRectangle(cornerRadius: 14))
                        }.buttonStyle(.plain)
                    }
                }
                .padding(18)
            }
        }
        .background(VColor.pageBg.ignoresSafeArea())
    }

    // MARK: gamificación

    private var gamificationCard: some View {
        cardContainer {
            HStack(spacing: 12) {
                Text("🏅").font(.system(size: 26))
                    .frame(width: 52, height: 52).background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 16))
                VStack(alignment: .leading, spacing: 3) {
                    Text("Nivel \(model.level) · \(levelName(model.level))").font(.system(size: 16, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                    Text("🔥 \(model.streak) días · \(model.sessions) sesiones · \(model.xp) XP")
                        .font(.system(size: 12, weight: .bold)).foregroundStyle(VColor.textMuted)
                }
                Spacer(minLength: 0)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color(hex: "eef3f3")).frame(height: 10)
                    Capsule().fill(VColor.primary).frame(width: geo.size.width * levelProgress(model.xp), height: 10)
                }
            }
            .frame(height: 10).padding(.top, 12)
            Text("\(xpToNext(model.xp)) XP para el siguiente nivel")
                .font(.system(size: 11, weight: .bold)).foregroundStyle(VColor.textMuted)
                .frame(maxWidth: .infinity, alignment: .leading).padding(.top, 6)

            HStack(spacing: 8) {
                ForEach(ALL_BADGES) { b in
                    let on = model.unlockedBadgeIds.contains(b.id)
                    Text(b.icon).font(.system(size: 18))
                        .frame(width: 38, height: 38)
                        .background(on ? VColor.primaryLight : Color(hex: "f1f5f4"))
                        .clipShape(Circle())
                        .opacity(on ? 1 : 0.4)
                }
                Spacer(minLength: 0)
            }
            .padding(.top, 12)
        }
    }

    // MARK: adherencia

    private var adherenceCard: some View {
        cardContainer {
            Text("ADHERENCIA SEMANAL").font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textMuted)
                .frame(maxWidth: .infinity, alignment: .leading)
            HStack(spacing: 18) {
                ZStack {
                    Circle().stroke(Color(hex: "eef3f3"), lineWidth: 12).frame(width: 96, height: 96)
                    Circle().trim(from: 0, to: adherence)
                        .stroke(VColor.primary, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                        .rotationEffect(.degrees(-90)).frame(width: 96, height: 96)
                    VStack(spacing: 0) {
                        Text("\(Int(adherence * 100))%").font(.system(size: 22, weight: .black)).foregroundStyle(VColor.textPrimary)
                        Text("\(doneThisWeek)/\(weeklyGoal)").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.textMuted)
                    }
                }
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 6) {
                        ForEach(0..<weeklyGoal, id: \.self) { i in
                            Circle().fill(i < doneThisWeek ? VColor.primary : Color(hex: "e5eaea")).frame(width: 16, height: 16)
                        }
                    }
                    Text(doneThisWeek >= weeklyGoal ? "¡Meta semanal cumplida! 🎉" : "\(weeklyGoal - doneThisWeek) sesiones para la meta")
                        .font(.system(size: 13, weight: .bold)).foregroundStyle(VColor.textSecondary)
                }
                Spacer(minLength: 0)
            }
            .padding(.top, 12)
        }
    }

    // MARK: evolución (gráfico de línea)

    private var evolutionCard: some View {
        cardContainer {
            Text("EVOLUCIÓN POR ESTRELLAS (EPT-3)").font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textMuted)
                .frame(maxWidth: .infinity, alignment: .leading)
            let points = lastFive
            Canvas { ctx, size in
                let padL: CGFloat = 28, padB: CGFloat = 22, padT: CGFloat = 10, padR: CGFloat = 8
                let plotW = size.width - padL - padR
                let plotH = size.height - padT - padB
                func x(_ i: Int) -> CGFloat { points.count <= 1 ? padL + plotW / 2 : padL + CGFloat(i) / CGFloat(points.count - 1) * plotW }
                func y(_ v: Double) -> CGFloat { padT + CGFloat((3 - v) / 2) * plotH }
                // rejilla 1..3
                for g in 1...3 {
                    var line = Path()
                    line.move(to: CGPoint(x: padL, y: y(Double(g))))
                    line.addLine(to: CGPoint(x: size.width - padR, y: y(Double(g))))
                    ctx.stroke(line, with: .color(Color(hex: "eef3f3")), lineWidth: 1)
                    ctx.draw(Text("\(g)★").font(.system(size: 9, weight: .bold)).foregroundColor(Color(hex: "9aa6a5")),
                             at: CGPoint(x: padL - 12, y: y(Double(g))))
                }
                guard !points.isEmpty else { return }
                var poly = Path()
                for (i, p) in points.enumerated() {
                    let pt = CGPoint(x: x(i), y: y(p.avg))
                    if i == 0 { poly.move(to: pt) } else { poly.addLine(to: pt) }
                }
                ctx.stroke(poly, with: .color(VColor.primary), style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
                for (i, p) in points.enumerated() {
                    let pt = CGPoint(x: x(i), y: y(p.avg))
                    ctx.fill(Path(ellipseIn: CGRect(x: pt.x - 5, y: pt.y - 5, width: 10, height: 10)), with: .color(VColor.primaryDark))
                    ctx.draw(Text(p.date).font(.system(size: 8, weight: .semibold)).foregroundColor(Color(hex: "9aa6a5")),
                             at: CGPoint(x: pt.x, y: size.height - 8))
                }
            }
            .frame(height: 170).padding(.top, 8)
        }
    }

    // MARK: historial

    private var historyCard: some View {
        cardContainer {
            Text("HISTORIAL DE SESIONES").font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textMuted)
                .frame(maxWidth: .infinity, alignment: .leading).padding(.bottom, 4)
            ForEach(model.history) { s in
                HStack(spacing: 12) {
                    VStack(spacing: 0) {
                        Text(s.date).font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                    }
                    .frame(width: 46, height: 46).background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 12))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(s.block).font(.system(size: 14, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                        Text("\(s.exercises) ejercicios").font(.system(size: 11.5, weight: .bold)).foregroundStyle(VColor.textMuted)
                    }
                    Spacer(minLength: 0)
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(String(repeating: "★", count: Int(s.avg.rounded()))).font(.system(size: 12)).foregroundStyle(VColor.star)
                        Text(String(format: "%.1f / 3", s.avg)).font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                    }
                }
                .padding(.vertical, 8)
                if s.id != model.history.last?.id {
                    Divider().overlay(Color(hex: "f1f5f4"))
                }
            }
        }
    }

    // MARK: contenedor

    @ViewBuilder private func cardContainer<C: View>(@ViewBuilder _ content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 0) { content() }
            .padding(16)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(VColor.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .vCardShadow()
    }
}
