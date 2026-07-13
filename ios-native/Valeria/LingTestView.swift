//
//  LingTestView.swift
//  Valeria
//
//  Test de Ling · port de src/ValeriaLingTestScreen.tsx.
//  Comprobación auditiva previa (solo audífono/implante). El tutor produce cada
//  sonido y puntúa la respuesta del niño (2 Identifica · 1 Detecta · 0 Sin resp.).
//

import SwiftUI

private struct LingSound: Identifiable {
    let id = UUID()
    let sym: String
    let say: String
    let freq: String
    let fc: String
    let hint: String
}

private let SOUNDS: [LingSound] = [
    .init(sym: "m",  say: "“mmm”",  freq: "Grave · ~250 Hz",      fc: "3b82f6", hint: "Sonido nasal, vibración en los labios."),
    .init(sym: "u",  say: "“uuu”",  freq: "Grave · ~300 Hz",      fc: "3b82f6", hint: "Vocal posterior, boca redondeada."),
    .init(sym: "a",  say: "“aaa”",  freq: "Media · ~1 kHz",       fc: "10b981", hint: "Vocal abierta y central."),
    .init(sym: "i",  say: "“iii”",  freq: "Media-aguda · ~2 kHz", fc: "f59e0b", hint: "Vocal cerrada anterior."),
    .init(sym: "sh", say: "“shhh”", freq: "Aguda · ~3 kHz",       fc: "f97316", hint: "Fricativa, flujo de aire continuo."),
    .init(sym: "s",  say: "“sss”",  freq: "Muy aguda · ~5 kHz",   fc: "ef4444", hint: "Fricativa aguda — el más difícil de oír."),
]

private struct ScaleOpt { let level: Int; let title: String; let desc: String; let color: String }
private let SCALE: [ScaleOpt] = [
    .init(level: 2, title: "Identifica", desc: "Repite o reconoce el sonido correctamente.", color: "10b981"),
    .init(level: 1, title: "Detecta", desc: "Reacciona o levanta la mano al oírlo.", color: "f59e0b"),
    .init(level: 0, title: "Sin respuesta", desc: "No reacciona al sonido.", color: "ef4444"),
]

struct LingTestView: View {
    let sessionIds: [String]
    @EnvironmentObject private var router: Router
    @EnvironmentObject private var model: AppModel

    enum Phase { case ask, test, done }
    @State private var phase: Phase = .ask
    @State private var idx = 0
    @State private var results: [Int] = []
    @State private var picked: Int? = nil
    @State private var ripple = false

    var body: some View {
        VStack(spacing: 0) {
            header
            ScrollView(showsIndicators: false) {
                VStack(spacing: 12) {
                    switch phase {
                    case .ask: askPhase
                    case .test: testPhase
                    case .done: donePhase
                    }
                }
                .padding(16)
            }
        }
        .background(VColor.pageBg.ignoresSafeArea())
    }

    // MARK: header

    private var header: some View {
        VHeader {
            BackPill { onBack() }.padding(.bottom, 10)
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 0) {
                    Text("valeria+").font(.system(size: 13, weight: .heavy)).tracking(1).foregroundStyle(.white).padding(.bottom, 6)
                    Text(phase == .done ? "Test completado" : "Test de Ling")
                        .font(.system(size: 24, weight: .heavy)).foregroundStyle(.white)
                    Text("\(model.activeName) · " + (phase == .ask ? "Comprobación auditiva" : phase == .test ? "6 sonidos de Ling" : "Resultado de hoy"))
                        .font(.system(size: 13, weight: .semibold)).foregroundStyle(Color.white.opacity(0.9)).padding(.top, 4)
                }
                Spacer()
                if phase == .test {
                    Text("\(idx + 1) / \(SOUNDS.count)")
                        .font(.system(size: 13, weight: .heavy)).foregroundStyle(.white)
                        .padding(.horizontal, 12).padding(.vertical, 7)
                        .background(Color.white.opacity(0.18))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.white.opacity(0.35), lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
            if phase == .test {
                HStack(spacing: 6) {
                    ForEach(0..<SOUNDS.count, id: \.self) { i in
                        Capsule().fill(Color.white.opacity(i < idx ? 1 : i == idx ? 0.85 : 0.32)).frame(height: 7)
                    }
                }
                .padding(.top, 14)
            }
        }
    }

    // MARK: fase ask

    private var askPhase: some View {
        VStack(spacing: 0) {
            VStack(spacing: 0) {
                Text("👂").font(.system(size: 38))
                    .frame(width: 78, height: 78).background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 24))
                Text("Antes de empezar").font(.system(size: 21, weight: .heavy)).foregroundStyle(VColor.textPrimary).padding(.top, 18)
                (Text("¿El paciente usa ") + Text("audífonos").bold() + Text(" o ") + Text("implante coclear").bold() + Text("?"))
                    .font(.system(size: 14.5, weight: .bold)).foregroundStyle(VColor.textSecondary)
                    .multilineTextAlignment(.center).frame(maxWidth: 280).padding(.top, 8)
                Text("Si los usa, conviene comprobar primero que oye bien hoy con el Test de Ling.")
                    .font(.system(size: 12.5, weight: .semibold)).foregroundStyle(VColor.textMuted)
                    .multilineTextAlignment(.center).frame(maxWidth: 285).padding(.top, 8)
            }

            choice(icon: "🦻", iconBg: VColor.primary, title: "Sí, usa audífonos / implante",
                   sub: "Realizar Test de Ling (6 sonidos)", chevron: VColor.primaryDark, border: VColor.borderActive) {
                phase = .test; idx = 0; results = []; picked = nil
            }
            .padding(.top, 24)

            choice(icon: "🚀", iconBg: Color(hex: "f1f5f4"), title: "No",
                   sub: "Ir directamente a los ejercicios", chevron: VColor.textMuted, border: VColor.border) {
                goExercises()
            }
            .padding(.top, 11)

            HStack(spacing: 9) {
                Text("💡").font(.system(size: 15))
                (Text("El Test de Ling no usa el micrófono. ") + Text("Tú produces cada sonido").bold() + Text(" y marcas cómo responde el niño."))
                    .font(.system(size: 12, weight: .bold)).foregroundStyle(Color(hex: "8a7320"))
            }
            .padding(13)
            .background(Color(hex: "fffdf3"))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(hex: "f4e6b8"), lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .padding(.top, 20)
        }
    }

    private func choice(icon: String, iconBg: Color, title: String, sub: String, chevron: Color, border: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 13) {
                Text(icon).font(.system(size: 22))
                    .frame(width: 46, height: 46).background(iconBg).clipShape(RoundedRectangle(cornerRadius: 14))
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.system(size: 16, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                    Text(sub).font(.system(size: 12.5, weight: .bold)).foregroundStyle(VColor.textMuted)
                }
                Spacer(minLength: 0)
                Text("›").font(.system(size: 18, weight: .heavy)).foregroundStyle(chevron)
            }
            .padding(16)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 17).stroke(border, lineWidth: 1.5))
            .clipShape(RoundedRectangle(cornerRadius: 17))
            .vCardShadow()
        }.buttonStyle(.plain)
    }

    // MARK: fase test

    private var testPhase: some View {
        let ex = SOUNDS[min(idx, SOUNDS.count - 1)]
        return VStack(spacing: 12) {
            // instrucción
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 10) {
                    Text("🤫").font(.system(size: 18))
                        .frame(width: 36, height: 36).background(VColor.primary).clipShape(RoundedRectangle(cornerRadius: 12))
                    VStack(alignment: .leading, spacing: 1) {
                        Text("TU TURNO, TUTOR").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                        Text("Cúbrete la boca y produce el sonido").font(.system(size: 12.5, weight: .bold)).foregroundStyle(VColor.textPrimary)
                    }
                }
                (Text("Que el niño ") + Text("no te lea los labios").bold() + Text(". Repite el sonido 2–3 veces y observa su reacción."))
                    .font(.system(size: 13.5, weight: .bold)).foregroundStyle(VColor.textPrimary).padding(.top, 11)
            }
            .padding(15)
            .background(VColor.primaryTint)
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color(hex: "b8eee9"), lineWidth: 1.5))
            .clipShape(RoundedRectangle(cornerRadius: 18))

            // escenario del sonido
            VStack(spacing: 0) {
                Text("PRODUCE ESTE SONIDO").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.textMuted).padding(.bottom, 14)
                ZStack {
                    Circle().stroke(Color(hex: "b8eee9"), lineWidth: 2).frame(width: 130, height: 130)
                        .scaleEffect(ripple ? 1.7 : 0.7).opacity(ripple ? 0 : 0.55)
                    Text(ex.sym).font(.system(size: 48, weight: .black)).foregroundStyle(.white)
                        .frame(width: 130, height: 130).background(VColor.primaryDark).clipShape(Circle()).vButtonShadow()
                }
                Text(ex.say).font(.system(size: 22, weight: .heavy)).foregroundStyle(VColor.textPrimary).padding(.top, 18)
                HStack(spacing: 7) {
                    Circle().fill(Color(hex: ex.fc)).frame(width: 8, height: 8)
                    Text(ex.freq).font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                }
                .padding(.horizontal, 12).padding(.vertical, 7)
                .background(VColor.pageBg)
                .overlay(RoundedRectangle(cornerRadius: 11).stroke(Color(hex: "eef2f1"), lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 11)).padding(.top, 9)
                Text(ex.hint).font(.system(size: 12.5, weight: .semibold)).foregroundStyle(VColor.textMuted)
                    .multilineTextAlignment(.center).padding(.top, 11).padding(.horizontal, 12)
            }
            .padding(.vertical, 22).padding(.horizontal, 16)
            .frame(maxWidth: .infinity)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 20).stroke(VColor.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 20)).vCardShadow()

            // escala
            VStack(spacing: 0) {
                Text("¿Cómo respondió?").font(.system(size: 16, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                Text("Marca la respuesta del niño a este sonido").font(.system(size: 12, weight: .semibold)).foregroundStyle(VColor.textMuted).padding(.top, 2).padding(.bottom, 13)
                ForEach(SCALE, id: \.level) { o in
                    let on = picked == o.level
                    Button { pick(o.level) } label: {
                        HStack(spacing: 12) {
                            Text("\(o.level)").font(.system(size: 14, weight: .black))
                                .foregroundStyle(on ? .white : Color(hex: o.color))
                                .frame(width: 30, height: 30)
                                .background(on ? Color(hex: o.color) : Color.white)
                                .overlay(Circle().stroke(on ? .clear : Color(hex: o.color, opacity: 0.33), lineWidth: 2))
                                .clipShape(Circle())
                            VStack(alignment: .leading, spacing: 2) {
                                Text(o.title).font(.system(size: 14.5, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                                Text(o.desc).font(.system(size: 12, weight: .bold)).foregroundStyle(VColor.textMuted)
                            }
                            Spacer(minLength: 0)
                        }
                        .padding(12)
                        .background(on ? Color(hex: o.color, opacity: 0.08) : Color(hex: "f7fafa"))
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(on ? Color(hex: o.color) : Color(hex: "eef3f3"), lineWidth: on ? 1.5 : 1))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .buttonStyle(.plain).padding(.bottom, 9)
                }
            }
            .padding(16)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(VColor.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 18)).vCardShadow()
        }
        .onAppear { withAnimation(.easeOut(duration: 2.2).repeatForever(autoreverses: false)) { ripple = true } }
    }

    // MARK: fase done

    private var donePhase: some View {
        let ident = results.filter { $0 == 2 }.count
        let detect = results.filter { $0 >= 1 }.count
        let total = SOUNDS.count
        var icon = "🎉", badgeBg = VColor.primaryLight, title = "¡Oye con claridad!"
        var sub = "Identificó los 6 sonidos. El equipo auditivo funciona bien hoy."
        var recIcon = "✅", recBg = VColor.successBg, recBorder = Color(hex: "bfe9d4"), recColor = Color(hex: "0a7d54")
        var recText = "Todo en orden. Puedes continuar con los ejercicios de audición con normalidad."
        if detect < total {
            icon = "🔧"; badgeBg = Color(hex: "fff1e6"); title = "Revisar el equipo"
            sub = "No reaccionó a algún sonido. Comprueba pilas, molde y volumen antes de seguir."
            recIcon = "⚠️"; recBg = Color(hex: "fff7ed"); recBorder = Color(hex: "fcd9a8"); recColor = Color(hex: "9a5b13")
            recText = "Revisa el audífono / implante (pilas, conexión, programa) y repite el test. Si persiste, consulta con el ORL."
        } else if ident < total {
            icon = "👂"; badgeBg = Color(hex: "fffbeb"); title = "Detecta todos los sonidos"
            sub = "Detectó los 6, e identificó \(ident) de 6. Puede continuar con la sesión."
            recIcon = "💡"; recBg = Color(hex: "fffdf3"); recBorder = Color(hex: "f4e6b8"); recColor = Color(hex: "8a7320")
            recText = "Refuerza con apoyo del tutor los sonidos más agudos (sh, s). Puedes continuar con los ejercicios."
        }

        return VStack(spacing: 13) {
            VStack(spacing: 0) {
                Text(icon).font(.system(size: 36))
                    .frame(width: 72, height: 72).background(badgeBg).clipShape(RoundedRectangle(cornerRadius: 24))
                Text(title).font(.system(size: 21, weight: .heavy)).foregroundStyle(VColor.textPrimary).padding(.top, 16)
                Text(sub).font(.system(size: 13, weight: .semibold)).foregroundStyle(Color(hex: "6b7280"))
                    .multilineTextAlignment(.center).padding(.top, 7).padding(.horizontal, 6)

                HStack(spacing: 7) {
                    ForEach(Array(SOUNDS.enumerated()), id: \.offset) { i, snd in
                        let lv = i < results.count ? results[i] : 0
                        let color = lv == 2 ? "10b981" : lv == 1 ? "f59e0b" : "ef4444"
                        let mark = lv == 2 ? "✓" : lv == 1 ? "~" : "✕"
                        VStack(spacing: 7) {
                            Text(snd.sym).font(.system(size: 19, weight: .black)).foregroundStyle(VColor.textPrimary)
                            Text(mark).font(.system(size: 10, weight: .black)).foregroundStyle(.white)
                                .frame(width: 18, height: 18).background(Color(hex: color)).clipShape(Circle())
                        }
                        .frame(maxWidth: .infinity).padding(.top, 11).padding(.bottom, 9)
                        .background(Color(hex: "f7fafa"))
                        .overlay(RoundedRectangle(cornerRadius: 13).stroke(Color(hex: "eef3f3"), lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: 13))
                    }
                }
                .padding(.top, 20)

                HStack(spacing: 14) {
                    legend("10b981", "Identifica"); legend("f59e0b", "Detecta"); legend("ef4444", "Sin resp.")
                }
                .padding(.top, 16)
            }
            .padding(.vertical, 26).padding(.horizontal, 20)
            .frame(maxWidth: .infinity)
            .background(Color.white).clipShape(RoundedRectangle(cornerRadius: 22))
            .shadow(color: Color(hex: "0f172a", opacity: 0.07), radius: 22, x: 0, y: 6)

            HStack(spacing: 10) {
                Text(recIcon).font(.system(size: 17))
                Text(recText).font(.system(size: 12.5, weight: .bold)).foregroundStyle(recColor)
                Spacer(minLength: 0)
            }
            .padding(14)
            .background(recBg)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(recBorder, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 16))

            Button { goExercises() } label: {
                Text("Comenzar ejercicios →").font(.system(size: 16, weight: .heavy)).foregroundStyle(.white)
                    .frame(maxWidth: .infinity).padding(.vertical, 16)
                    .background(VColor.primary).clipShape(RoundedRectangle(cornerRadius: 15)).vButtonShadow()
            }.buttonStyle(.plain)

            Button { phase = .test; idx = 0; results = []; picked = nil } label: {
                Text("Repetir test").font(.system(size: 13.5, weight: .heavy)).foregroundStyle(VColor.primaryDark)
            }.buttonStyle(.plain)
        }
    }

    private func legend(_ color: String, _ label: String) -> some View {
        HStack(spacing: 5) {
            Circle().fill(Color(hex: color)).frame(width: 10, height: 10)
            Text(label).font(.system(size: 11, weight: .bold)).foregroundStyle(Color(hex: "6b7280"))
        }
    }

    // MARK: acciones

    private func pick(_ level: Int) {
        guard picked == nil else { return }
        picked = level
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.42) {
            results.append(level)
            if idx + 1 >= SOUNDS.count { phase = .done }
            else { idx += 1; picked = nil }
        }
    }

    private func goExercises() { router.push(.exercisePlayer(ids: sessionIds)) }

    private func onBack() {
        if phase == .test || phase == .done { phase = .ask } else { router.pop() }
    }
}
