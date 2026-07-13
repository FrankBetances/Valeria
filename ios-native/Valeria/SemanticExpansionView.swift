//
//  SemanticExpansionView.swift
//  Valeria
//
//  Expansión Semántica / Progresión Léxica · port representativo de
//  src/ValeriaSemanticExpansionScreen.tsx. Tres modos (Escenarios, Progresión,
//  Contrastes) sobre un reproductor de pasos con consigna, acción física del
//  adulto y evaluación por estrellas (tutor como juez). Registra la sesión.
//

import SwiftUI

private enum SEMode: String, CaseIterable { case escenarios = "Escenarios", progresion = "Progresión", contrastes = "Contrastes" }

private struct SEStep: Identifiable {
    let id = UUID()
    let kicker: String
    let emoji: String
    let label: String
    let prompt: String
    let action: String   // acción física del adulto (parent_tpr_action)
}

private let STEPS: [SEMode: [SEStep]] = [
    .escenarios: [
        .init(kicker: "MAÑANA · SUSTANTIVO", emoji: "🪥", label: "cepillo", prompt: "¡A lavarse! ¿Qué es esto? Di: cepillo.", action: "Cepillad los dientes juntos frente al espejo."),
        .init(kicker: "COMIDA · VERBO", emoji: "🥄", label: "comer", prompt: "¡Tengo hambre! ¿Qué hacemos? Di: comer.", action: "Simulad dar de comer al osito por turnos."),
        .init(kicker: "PARQUE · SUSTANTIVO", emoji: "🛝", label: "tobogán", prompt: "¡Al parque! ¿Dónde subimos? Di: tobogán.", action: "Deslizad la mano por una rampa imaginaria: ¡uuuh!"),
    ],
    .progresion: [
        .init(kicker: "FASE 1 · ONOMATOPEYA", emoji: "🚗", label: "brum brum", prompt: "El coche hace… Di: brum brum.", action: "Empujad el coche por el suelo haciendo brum brum."),
        .init(kicker: "FASE 2 · SUSTANTIVO", emoji: "🚗", label: "coche", prompt: "¿Qué es? Di: coche.", action: "Señalad un coche de verdad por la ventana."),
        .init(kicker: "FASE 3 · VERBO", emoji: "🏁", label: "correr", prompt: "El coche… Di: correr.", action: "Corred juntos tres pasos y frenad."),
    ],
    .contrastes: [
        .init(kicker: "CONTRASTE · TAMAÑO", emoji: "🐘", label: "grande", prompt: "El elefante es… Di: grande.", action: "Estirad los brazos bien abiertos: ¡grande!"),
        .init(kicker: "CONTRASTE · TAMAÑO", emoji: "🐜", label: "pequeño", prompt: "La hormiga es… Di: pequeño.", action: "Encogeos hasta hacerse una bolita: pequeño."),
    ],
]

struct SemanticExpansionView: View {
    @EnvironmentObject private var router: Router
    @EnvironmentObject private var model: AppModel

    @State private var mode: SEMode = .escenarios
    @State private var idx = 0
    @State private var verdict: Int? = nil    // estrellas provisionales
    @State private var stars: [Int] = []
    @State private var finished = false

    private var steps: [SEStep] { STEPS[mode] ?? [] }
    private var step: SEStep { steps[min(idx, steps.count - 1)] }

    var body: some View {
        VStack(spacing: 0) {
            VHeader {
                BackPill { router.pop() }.padding(.bottom, 10)
                Text("🧩 Expansión Semántica").font(.system(size: 22, weight: .heavy)).foregroundStyle(.white)
                Text("\(model.activeName) · Progresión léxica")
                    .font(.system(size: 13, weight: .semibold)).foregroundStyle(Color.white.opacity(0.9)).padding(.top, 4)
                if !finished {
                    HStack(spacing: 4) {
                        ForEach(SEMode.allCases, id: \.self) { m in
                            let on = mode == m
                            Button { mode = m; idx = 0; verdict = nil } label: {
                                Text(m.rawValue).font(.system(size: 13, weight: .heavy))
                                    .foregroundStyle(on ? VColor.primaryDark : Color.white.opacity(0.85))
                                    .frame(maxWidth: .infinity).padding(.vertical, 9)
                                    .background(on ? Color.white : .clear)
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                            }.buttonStyle(.plain)
                        }
                    }
                    .padding(4).background(Color.white.opacity(0.16)).clipShape(RoundedRectangle(cornerRadius: 13)).padding(.top, 14)
                }
            }

            ScrollView(showsIndicators: false) {
                if !finished { stepView } else { doneView }
            }
        }
        .background(VColor.pageBg.ignoresSafeArea())
    }

    private var stepView: some View {
        VStack(spacing: 12) {
            HStack {
                Text(step.kicker).font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                Spacer()
                Text("\(idx + 1) / \(steps.count)").font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textMuted)
            }
            .padding(.top, 4)

            VStack(spacing: 12) {
                Text(step.emoji).font(.system(size: 64))
                    .frame(width: 120, height: 120).background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
                Text(step.label).font(.system(size: 26, weight: .black)).foregroundStyle(VColor.textPrimary)
                HStack(spacing: 7) {
                    Text("🔊").font(.system(size: 14))
                    Text("Oír la palabra").font(.system(size: 13, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                }
                .padding(.horizontal, 14).padding(.vertical, 9).background(VColor.primaryLight).clipShape(Capsule())
            }
            .padding(.vertical, 22).frame(maxWidth: .infinity)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 20).stroke(VColor.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 20)).vCardShadow()

            VStack(alignment: .leading, spacing: 10) {
                Text("CONSIGNA").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                Text(step.prompt).font(.system(size: 15, weight: .bold)).foregroundStyle(VColor.textPrimary)
                Divider().overlay(Color(hex: "d6efec"))
                HStack(spacing: 8) {
                    Text("🤸").font(.system(size: 16))
                    Text(step.action).font(.system(size: 13, weight: .bold)).foregroundStyle(VColor.textSecondary)
                }
            }
            .padding(16).frame(maxWidth: .infinity, alignment: .leading)
            .background(VColor.primaryTint)
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color(hex: "b8eee9"), lineWidth: 1.5))
            .clipShape(RoundedRectangle(cornerRadius: 18))

            VStack(spacing: 0) {
                Text("¿Cómo lo dijo? Tú decides").font(.system(size: 14, weight: .heavy)).foregroundStyle(VColor.textPrimary).padding(.bottom, 12)
                HStack(spacing: 10) {
                    starBtn(3, "Solo/a"); starBtn(2, "Repitiendo"); starBtn(1, "Asistido/a")
                }
            }
            .padding(16)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(VColor.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 18)).vCardShadow()

            if let v = verdict {
                Button { advance(v) } label: {
                    Text(idx + 1 >= steps.count ? "Terminar modo" : "Siguiente paso →")
                        .font(.system(size: 16, weight: .heavy)).foregroundStyle(.white)
                        .frame(maxWidth: .infinity).padding(.vertical, 16)
                        .background(VColor.primary).clipShape(RoundedRectangle(cornerRadius: 14)).vButtonShadow()
                }.buttonStyle(.plain)
            }
        }
        .padding(16)
    }

    private func starBtn(_ n: Int, _ label: String) -> some View {
        let on = verdict == n
        return Button { verdict = n } label: {
            VStack(spacing: 4) {
                Text(String(repeating: "★", count: n)).font(.system(size: 14)).foregroundStyle(on ? VColor.star : Color(hex: "dfe5e4"))
                Text(label).font(.system(size: 12, weight: .heavy)).foregroundStyle(on ? VColor.textPrimary : VColor.textMuted)
            }
            .frame(maxWidth: .infinity).padding(.vertical, 13)
            .background(on ? VColor.primaryTint : Color(hex: "f7fafa"))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(on ? VColor.primary : Color(hex: "eef3f3"), lineWidth: on ? 1.5 : 1))
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }.buttonStyle(.plain)
    }

    private var doneView: some View {
        let avg = stars.isEmpty ? 0 : Double(stars.reduce(0, +)) / Double(stars.count)
        return VStack(spacing: 0) {
            Text("🌟").font(.system(size: 36))
                .frame(width: 80, height: 80).background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 26)).padding(.top, 12)
            Text("¡Modo completado!").font(.system(size: 22, weight: .heavy)).foregroundStyle(VColor.textPrimary).padding(.top, 14)
            Text("Promedio \(String(format: "%.1f", avg)) / 3 en \(stars.count) pasos.")
                .font(.system(size: 13, weight: .semibold)).foregroundStyle(VColor.textMuted).padding(.top, 6)
            Text(String(repeating: "★", count: Int(avg.rounded()))).font(.system(size: 24)).foregroundStyle(VColor.star).padding(.top, 8)
            Button { router.push(.results) } label: {
                Text("Ver Resultados →").font(.system(size: 16, weight: .heavy)).foregroundStyle(.white)
                    .frame(maxWidth: .infinity).padding(.vertical, 16)
                    .background(VColor.primary).clipShape(RoundedRectangle(cornerRadius: 14)).vButtonShadow()
            }.buttonStyle(.plain).padding(.top, 20)
        }
        .padding(16)
    }

    private func advance(_ star: Int) {
        var next = stars; next.append(star)
        if idx + 1 >= steps.count {
            stars = next
            let avg = Double(next.reduce(0, +)) / Double(next.count)
            _ = model.registerSession(avg: avg, exercises: next.count, block: "Expansión Semántica")
            finished = true
        } else {
            stars = next; idx += 1; verdict = nil
        }
    }
}
