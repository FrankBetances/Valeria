//
//  MinimalPairsView.swift
//  Valeria
//
//  Pares Mínimos (dislalias) · port representativo de src/ValeriaMinimalPairsScreen.tsx.
//  Contraste fonológico con el tutor como juez: pide la palabra objetivo y marca si
//  el niño la dijo o la sustituyó por el par (foil). Puntúa con estrellas y registra
//  la sesión. El motor de voz (STT/TTS) del original se sustituye por juicio del tutor.
//

import SwiftUI

private struct MinPair: Identifiable {
    let id = UUID()
    let code: String
    let group: String
    let target: String
    let targetEmoji: String
    let foil: String
    let foilEmoji: String
    let phoneme: String
    let errorLabel: String
    let prompt: String
    let onTargetSay: String
    let onFoilSay: String
    let cue: String
}

private let PAIRS: [MinPair] = [
    .init(code: "PM-1", group: "Rotacismo", target: "rana", targetEmoji: "🐸", foil: "lana", foilEmoji: "🧶",
          phoneme: "r̄ → l", errorLabel: "Rotacismo inicial", prompt: "¡Dile a papá cuál quieres! Di: rana.",
          onTargetSay: "¡Rrrana! ¡Tu lengua vibró como una moto!",
          onFoilSay: "Escuché lana, la del ovillo. Yo pedí rrrana.",
          cue: "La lengua hace la moto detrás de los dientes: rrr."),
    .init(code: "PM-2", group: "Rotacismo", target: "perro", targetEmoji: "🐶", foil: "pelo", foilEmoji: "💇",
          phoneme: "r̄ → l", errorLabel: "Rotacismo intervocálico", prompt: "¿Quién hace guau? Di: perro.",
          onTargetSay: "¡Perrro! ¡Qué erre tan fuerte!",
          onFoilSay: "Escuché pelo, el de la cabeza. El perro se quedó sin ladrar.",
          cue: "La erre es una moto larga en medio de la palabra."),
    .init(code: "PM-5", group: "Sigmatismo", target: "sopa", targetEmoji: "🍜", foil: "topa", foilEmoji: "🚫",
          phoneme: "s → t", errorLabel: "Frontalización", prompt: "¡Rica! Pídesela. Di: sopa.",
          onTargetSay: "¡Sssopa! Silba como una serpiente.",
          onFoilSay: "Escuché topa, no existe. Vamos: sssopa.",
          cue: "El aire sale finito por los dientes: sss."),
]

struct MinimalPairsView: View {
    @EnvironmentObject private var router: Router
    @EnvironmentObject private var model: AppModel

    private let total = PAIRS.count
    @State private var idx = 0
    @State private var verdict: String? = nil   // "target" | "foil"
    @State private var stars: [Int] = []
    @State private var finished = false

    private var pair: MinPair { PAIRS[min(idx, total - 1)] }

    var body: some View {
        VStack(spacing: 0) {
            header
            ScrollView(showsIndicators: false) {
                if !finished { trial } else { doneView }
            }
        }
        .background(VColor.pageBg.ignoresSafeArea())
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 0) {
            BackPill { router.pop() }.padding(.bottom, 10)
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 0) {
                    Text("🗣️ Pares Mínimos").font(.system(size: 22, weight: .heavy)).foregroundStyle(.white)
                    Text("\(model.activeName) · Dislalias fonológicas")
                        .font(.system(size: 13, weight: .semibold)).foregroundStyle(Color.white.opacity(0.9)).padding(.top, 4)
                }
                Spacer()
                if !finished {
                    Text("\(idx + 1) / \(total)").font(.system(size: 13, weight: .heavy)).foregroundStyle(.white)
                        .padding(.horizontal, 12).padding(.vertical, 7)
                        .background(Color.white.opacity(0.2)).clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 22).padding(.top, 18).padding(.bottom, 16)
        .background(Color(hex: "7c4fd0"))
        .clipShape(BottomRoundedRectangle(radius: 26))
    }

    private var trial: some View {
        VStack(spacing: 12) {
            HStack(spacing: 8) {
                Text(pair.code).font(.system(size: 12, weight: .heavy)).foregroundStyle(Color(hex: "7c4fd0"))
                    .padding(.horizontal, 9).padding(.vertical, 5).background(Color(hex: "ede4fc")).clipShape(RoundedRectangle(cornerRadius: 9))
                Text(pair.group).font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                Spacer()
                Text(pair.phoneme).font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textMuted)
            }
            .padding(.top, 4)

            // par de fichas
            HStack(spacing: 12) {
                pairCard(pair.targetEmoji, pair.target, highlight: true)
                Text("vs").font(.system(size: 14, weight: .black)).foregroundStyle(VColor.textMuted)
                pairCard(pair.foilEmoji, pair.foil, highlight: false)
            }

            // consigna
            VStack(alignment: .leading, spacing: 10) {
                Text("CONSIGNA DEL TUTOR").font(.system(size: 11, weight: .heavy)).foregroundStyle(Color(hex: "7c4fd0"))
                Text(pair.prompt).font(.system(size: 15, weight: .bold)).foregroundStyle(VColor.textPrimary)
                HStack(spacing: 7) {
                    Text("🔊").font(.system(size: 14))
                    Text("Escuchar consigna").font(.system(size: 13, weight: .heavy)).foregroundStyle(Color(hex: "7c4fd0"))
                }
                .padding(.horizontal, 14).padding(.vertical, 9).background(Color(hex: "ede4fc")).clipShape(Capsule())
            }
            .padding(16).frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(hex: "faf7ff"))
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color(hex: "e0d4f7"), lineWidth: 1.5))
            .clipShape(RoundedRectangle(cornerRadius: 18))

            // tutor como juez
            VStack(spacing: 0) {
                Text("Tú eres el juez · ¿qué dijo el niño?").font(.system(size: 14, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                Text("El reconocimiento de voz llega en la build con micrófono").font(.system(size: 11.5, weight: .semibold)).foregroundStyle(VColor.textMuted)
                    .padding(.top, 2).padding(.bottom, 12)
                HStack(spacing: 10) {
                    judgeButton("✅  Dijo “\(pair.target)”", bg: VColor.success, on: verdict == "target") { verdict = "target" }
                    judgeButton("↩︎  Dijo “\(pair.foil)”", bg: VColor.error, on: verdict == "foil") { verdict = "foil" }
                }
            }
            .padding(16)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(VColor.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 18)).vCardShadow()

            if let v = verdict {
                let ok = v == "target"
                HStack(spacing: 10) {
                    Text(ok ? "🎉" : "🔧").font(.system(size: 17))
                    VStack(alignment: .leading, spacing: 3) {
                        Text(ok ? pair.onTargetSay : pair.onFoilSay).font(.system(size: 13, weight: .bold)).foregroundStyle(VColor.textPrimary)
                        if !ok { Text("Pista: \(pair.cue)").font(.system(size: 11.5, weight: .semibold)).foregroundStyle(VColor.textMuted) }
                    }
                    Spacer(minLength: 0)
                }
                .padding(14)
                .background(ok ? VColor.successBg : Color(hex: "fff7ed"))
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(ok ? Color(hex: "bfe9d4") : Color(hex: "fcd9a8"), lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 16))

                Button { advance(ok ? 3 : 1) } label: {
                    Text(idx + 1 >= total ? "Terminar sesión" : "Siguiente par →")
                        .font(.system(size: 16, weight: .heavy)).foregroundStyle(.white)
                        .frame(maxWidth: .infinity).padding(.vertical, 16)
                        .background(Color(hex: "7c4fd0")).clipShape(RoundedRectangle(cornerRadius: 14))
                }.buttonStyle(.plain)
            }
        }
        .padding(16)
    }

    private func pairCard(_ emoji: String, _ word: String, highlight: Bool) -> some View {
        VStack(spacing: 8) {
            Text(emoji).font(.system(size: 44))
                .frame(width: 92, height: 92)
                .background(highlight ? Color(hex: "ede4fc") : VColor.pageBg)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 20).stroke(highlight ? Color(hex: "7c4fd0") : VColor.border, lineWidth: highlight ? 2 : 1))
            Text(word).font(.system(size: 15, weight: .heavy)).foregroundStyle(VColor.textPrimary)
        }
        .frame(maxWidth: .infinity)
    }

    private func judgeButton(_ label: String, bg: Color, on: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label).font(.system(size: 13, weight: .heavy)).foregroundStyle(on ? .white : bg)
                .frame(maxWidth: .infinity).padding(.vertical, 13)
                .background(on ? bg : bg.opacity(0.1))
                .overlay(RoundedRectangle(cornerRadius: 13).stroke(bg, lineWidth: on ? 0 : 1.5))
                .clipShape(RoundedRectangle(cornerRadius: 13))
        }.buttonStyle(.plain)
    }

    private var doneView: some View {
        let avg = stars.isEmpty ? 0 : Double(stars.reduce(0, +)) / Double(stars.count)
        return VStack(spacing: 0) {
            Text("🎉").font(.system(size: 36))
                .frame(width: 80, height: 80).background(Color(hex: "ede4fc")).clipShape(RoundedRectangle(cornerRadius: 26)).padding(.top, 12)
            Text("¡Pares completados!").font(.system(size: 22, weight: .heavy)).foregroundStyle(VColor.textPrimary).padding(.top, 14)
            Text("Promedio \(String(format: "%.1f", avg)) / 3 en \(stars.count) pares.")
                .font(.system(size: 13, weight: .semibold)).foregroundStyle(VColor.textMuted).padding(.top, 6)
            Text(String(repeating: "★", count: Int(avg.rounded()))).font(.system(size: 24)).foregroundStyle(VColor.star).padding(.top, 8)
            Button { router.push(.results) } label: {
                Text("Ver Resultados →").font(.system(size: 16, weight: .heavy)).foregroundStyle(.white)
                    .frame(maxWidth: .infinity).padding(.vertical, 16)
                    .background(Color(hex: "7c4fd0")).clipShape(RoundedRectangle(cornerRadius: 14))
            }.buttonStyle(.plain).padding(.top, 20)
        }
        .padding(16)
    }

    private func advance(_ star: Int) {
        var next = stars; next.append(star)
        if idx + 1 >= total {
            stars = next
            let avg = Double(next.reduce(0, +)) / Double(next.count)
            _ = model.registerSession(avg: avg, exercises: next.count, block: "Pares Mínimos")
            finished = true
        } else {
            stars = next; idx += 1; verdict = nil
        }
    }
}
