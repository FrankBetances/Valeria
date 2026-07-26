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

// Muestra REDUCIDA del banco de React Native, no una copia. Se mantiene corta a
// propósito (este port existe para probar navegación y estética en dispositivo),
// pero debe respetar las decisiones clínicas que ACOPROS validó en julio de 2026,
// porque lo que se ve aquí se toma por lo que hace la app:
//
//   · DC-2 · La progresión NO arranca en onomatopeya. Amplía el campo semántico
//     del concepto: concepto → parte → acción → cualidad.
//   · ES-13 · Congruencia: el objeto del audio, el de la imagen y el del setup
//     son el mismo; solo varía el atributo. Nada de un elefante para «grande» y
//     una hormiga para «pequeño».
//   · ES-06 · El objetivo se nombra UNA vez antes de pedirlo.
//
// Fuente de verdad: src/valeriaSemanticExpansion.ts y el plan en
// docs/plan-mejoras-acopros-logopedas.json.
private let STEPS: [SEMode: [SEStep]] = [
    .escenarios: [
        .init(kicker: "MAÑANA · SUSTANTIVO", emoji: "🪥", label: "cepillo", prompt: "Esto es el cepillo. Di: cepillo.", action: "Pon el cepillo (sin pasta) en la mano del niño y guiad juntos el gesto de cepillar."),
        .init(kicker: "COMIDA · SUSTANTIVO", emoji: "🥄", label: "cuchara", prompt: "Esto es la cuchara. Di: cuchara.", action: "Pon la cuchara en la mano del niño y llevadla juntos a la boca."),
        .init(kicker: "PARQUE · SUSTANTIVO", emoji: "🛝", label: "tobogán", prompt: "Esto es el tobogán. Di: tobogán.", action: "Deslizad la mano por una rampa imaginaria: ¡uuuh!"),
    ],
    .progresion: [
        .init(kicker: "PASO 1 · CONCEPTO", emoji: "🚗", label: "coche", prompt: "Esto es el coche. Di: coche.", action: "Señalad un coche de verdad por la ventana."),
        .init(kicker: "PASO 2 · PARTE", emoji: "🛞", label: "rueda", prompt: "El coche tiene ruedas. Di: rueda.", action: "Girad una rueda del coche de juguete con el dedo."),
        .init(kicker: "PASO 3 · ACCIÓN", emoji: "🚗", label: "corre", prompt: "Mira lo que hace el coche. Di: corre.", action: "Empujad el coche por el suelo y corred detrás."),
    ],
    // Mismo objeto en las dos vueltas (osito), solo cambia el tamaño.
    .contrastes: [
        .init(kicker: "CONTRASTE · VUELTA 1 · COMPRENDER", emoji: "🧸", label: "grande", prompt: "¿Cuál es el osito GRANDE? ¡Dámelo y dilo! Di: grande.", action: "El niño te entrega el osito grande; abrazadlo exagerando lo enorme que es."),
        .init(kicker: "CONTRASTE · VUELTA 2 · DECIR", emoji: "🧸", label: "pequeño", prompt: "Ahora al revés: ¿cuál es el osito PEQUEÑO? Di: pequeño.", action: "El niño te da el osito pequeño; escondedlo en una mano con vocecita mini."),
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
                // X-06 · Este port es un demostrador de navegación y estética, con
                // una muestra corta del contenido. No sustituye a la app de React
                // Native en validación clínica: aquí no hay antesala de material
                // (ES-11), ni vuelta de comprensión por selección (ES-12), ni
                // pictogramas (ES-09). Decirlo en pantalla evita que una sesión de
                // prueba se lea como «así funciona la app».
                Text("Demostración · muestra corta del contenido. La sesión completa, con preparación previa, selección de imagen y pictogramas, está en la app principal.")
                    .font(.system(size: 11.5, weight: .semibold))
                    .foregroundStyle(VColor.textMuted)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 16).padding(.top, 12)

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
