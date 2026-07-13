//
//  ExercisePlayerView.swift
//  Valeria
//
//  Player de Sesión de Terapia · port de src/ValeriaExercisePlayerScreen.tsx.
//  Flujo guiado en 4 pasos (consigna → mini-juego → movimiento → evaluación EPT-3)
//  con mini-juegos por tipo de ejercicio y recompensas estilo Duolingo al terminar.
//

import SwiftUI

// MARK: - Modelo de ejercicio del player

private enum Stage { case phrase, vowels, fill, intruder, emotions, instruction }
private struct Tile { let cap: String; let emoji: String }

private struct PlayerExercise {
    let code: String
    let name: String
    let category: String
    let read: String
    let stage: Stage
    let stageLabel: String
    let ept: [String]
    let move: String
    var phrase: String? = nil
    var phraseEmoji: String? = nil
    var tiles: [Tile] = []
    var fillBefore: String = ""; var fillAfter: String = ""; var fillAnswer: String = ""
    var fillEmoji: String = ""; var fillCap: String = ""
    var intruder: [Tile] = []; var intruderAnswer: Int = 0
    var emotionFace: String = ""; var emotionAnswer: String = ""
    var instrIcon: String = "🧠"; var instrHint: String = ""
}

private let VOWELS = ["a", "e", "i", "o", "u"]
private struct Emo { let face: String; let label: String }
private let EMO: [Emo] = [.init(face: "😀", label: "Feliz"), .init(face: "😢", label: "Triste"),
                         .init(face: "😠", label: "Enfadado"), .init(face: "😲", label: "Sorprendido")]

private func exercise(for id: String) -> PlayerExercise {
    switch id {
    case "ff1":
        return PlayerExercise(code: "FF-1", name: "Asociación vocal inicial", category: "Fonética-Fonología",
            read: "Mira las imágenes. Di cómo se llama cada una y con qué vocal empieza.",
            stage: .vowels, stageLabel: "Asocia imagen y vocal inicial",
            ept: ["No repite ni asocia la vocal inicial.",
                  "Acierta la vocal tras una pista visual o énfasis del tutor.",
                  "Nombra la imagen y asocia la vocal inicial de forma espontánea."],
            move: "Dibujad la vocal en el aire con el brazo bien grande cada vez que acierte.",
            tiles: [Tile(cap: "araña", emoji: "🕷️"), Tile(cap: "elefante", emoji: "🐘"), Tile(cap: "isla", emoji: "🏝️")])
    case "ff2":
        return PlayerExercise(code: "FF-2", name: "Articulación de vocales", category: "Fonética-Fonología",
            read: "Vamos a repetir esta palabra juntos, articulando bien cada vocal.",
            stage: .phrase, stageLabel: "Repite la palabra",
            ept: ["No imita el sonido o realiza una aproximación muy lejana.",
                  "Imita la vocal aislada correctamente tras el modelo del adulto.",
                  "Produce la vocal y la palabra completa articulando con precisión."],
            move: "Marchad por la sala pisando fuerte una sílaba en cada paso: ZA-PA-TO.",
            phrase: "ZAPATO", phraseEmoji: "👟")
    case "ff3":
        return PlayerExercise(code: "FF-3", name: "Completar vocal faltante", category: "Fonética-Fonología",
            read: "A esta palabra le falta una vocal. ¿Cuál es? Tócala para completarla.",
            stage: .fill, stageLabel: "Completa la vocal que falta",
            ept: ["No identifica la vocal que falta.",
                  "Completa la vocal tras una pista del tutor.",
                  "Completa la palabra de forma autónoma y la lee."],
            move: "Saltad una vez por cada letra de la palabra completa.",
            fillBefore: "S", fillAfter: "L", fillAnswer: "O", fillEmoji: "☀️", fillCap: "sol")
    case "se1":
        return PlayerExercise(code: "SE-1", name: "Detección del intruso", category: "Semántica",
            read: "Aquí hay cosas que van juntas y una que no pega. ¿Cuál es el intruso?",
            stage: .intruder, stageLabel: "Encuentra el intruso",
            ept: ["No detecta el elemento intruso.",
                  "Detecta el intruso con ayuda de categorías del tutor.",
                  "Detecta y justifica por qué el intruso no pertenece."],
            move: "Que el niño corra a tocar la pared cuando encuentre el intruso.",
            intruder: [Tile(cap: "manzana", emoji: "🍎"), Tile(cap: "plátano", emoji: "🍌"),
                       Tile(cap: "coche", emoji: "🚗"), Tile(cap: "uvas", emoji: "🍇")], intruderAnswer: 2)
    case "pr3":
        return PlayerExercise(code: "PR-3", name: "Reconocimiento de emociones", category: "Pragmática",
            read: "Mira la cara. ¿Cómo crees que se siente?",
            stage: .emotions, stageLabel: "Reconoce la emoción",
            ept: ["No reconoce la emoción.",
                  "Reconoce la emoción con apoyo del tutor.",
                  "Reconoce y nombra la emoción de forma espontánea."],
            move: "Poned juntos la cara de la emoción frente al espejo.",
            emotionFace: "😢", emotionAnswer: "Triste")
    default:
        let item = (Catalog.audicion + Catalog.lenguaje).first { $0.id == id }
        return PlayerExercise(code: item?.code ?? "EJ", name: item?.name ?? "Actividad guiada",
            category: item?.category ?? "Sesión", read: "Sigue la consigna con el niño y observa su respuesta.",
            stage: .instruction, stageLabel: "Actividad guiada",
            ept: ["No participa en la actividad.",
                  "Participa con apoyo del tutor.",
                  "Participa de forma autónoma y consigue el objetivo."],
            move: "Convertid la actividad en un juego de movimiento por la sala.",
            instrIcon: "🧠", instrHint: "Guía al niño paso a paso y refuerza cada intento.")
    }
}

private func starStr(_ n: Int) -> String { String(repeating: "★", count: n) + String(repeating: "☆", count: 3 - n) }

// MARK: - View

struct ExercisePlayerView: View {
    let sessionIds: [String]
    @EnvironmentObject private var router: Router
    @EnvironmentObject private var model: AppModel

    @State private var idx = 0
    @State private var results: [Int] = []
    @State private var picked: Int? = nil
    @State private var finished = false
    @State private var reward: SessionReward? = nil
    @State private var confetti = false

    // estado de mini-juegos
    @State private var vowelPick: String? = nil
    @State private var fillPick: String? = nil
    @State private var intruderPick: Int = -1
    @State private var emotionPick: String? = nil

    private var ids: [String] { sessionIds.isEmpty ? ["ff1", "ff2", "se1"] : sessionIds }
    private var ex: PlayerExercise { exercise(for: ids[min(idx, ids.count - 1)]) }

    var body: some View {
        ZStack {
            VColor.pageBg.ignoresSafeArea()
            VStack(spacing: 0) {
                header
                ScrollView(showsIndicators: false) {
                    if !finished { playing } else { done }
                }
            }
            if confetti { ConfettiView() }
        }
    }

    // MARK: header

    private var header: some View {
        VHeader {
            BackPill { router.pop() }.padding(.bottom, 10)
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 0) {
                    Text("valeria+").font(.system(size: 13, weight: .heavy)).tracking(1).foregroundStyle(.white).padding(.bottom, 6)
                    Text("Sesión de terapia").font(.system(size: 24, weight: .heavy)).foregroundStyle(.white)
                    Text("\(model.activeName) · \(ids.count) \(ids.count == 1 ? "ejercicio" : "ejercicios")")
                        .font(.system(size: 13, weight: .semibold)).foregroundStyle(Color.white.opacity(0.9)).padding(.top, 4)
                }
                Spacer()
                if !finished {
                    Text("\(idx + 1) / \(ids.count)")
                        .font(.system(size: 13, weight: .heavy)).foregroundStyle(.white)
                        .padding(.horizontal, 12).padding(.vertical, 7)
                        .background(Color.white.opacity(0.18))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.white.opacity(0.35), lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
            HStack(spacing: 6) {
                ForEach(0..<ids.count, id: \.self) { i in
                    Capsule().fill(Color.white.opacity(i < idx || finished ? 1 : i == idx ? 0.85 : 0.32)).frame(height: 7)
                }
            }
            .padding(.top, 14)
        }
    }

    // MARK: jugando

    private var playing: some View {
        VStack(spacing: 12) {
            // meta
            HStack(spacing: 9) {
                Text(ex.code).font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                    .padding(.horizontal, 9).padding(.vertical, 5).background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 9))
                VStack(alignment: .leading, spacing: 1) {
                    Text(ex.name).font(.system(size: 15, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                    Text(ex.category).font(.system(size: 11.5, weight: .bold)).foregroundStyle(VColor.textMuted)
                }
                Spacer(minLength: 0)
            }

            // PASO 1 · consigna
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 10) {
                    Text("📢").font(.system(size: 18))
                        .frame(width: 36, height: 36).background(VColor.primary).clipShape(RoundedRectangle(cornerRadius: 12))
                    VStack(alignment: .leading, spacing: 1) {
                        Text("PASO 1 · CONSIGNA DEL TUTOR").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                        Text("Léela en voz alta (o deja que la lea la app)").font(.system(size: 11.5, weight: .semibold)).foregroundStyle(VColor.textMuted)
                    }
                }
                Text(ex.read).font(.system(size: 15, weight: .bold)).foregroundStyle(VColor.textPrimary).padding(.top, 12)
                speakButton("Escuchar consigna").padding(.top, 12)
            }
            .padding(16)
            .background(VColor.primaryTint)
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color(hex: "b8eee9"), lineWidth: 1.5))
            .clipShape(RoundedRectangle(cornerRadius: 18)).vCardShadow()

            // PASO 2 · mini-juego
            VStack(spacing: 0) {
                Text("PASO 2 · \(ex.stageLabel.uppercased())")
                    .font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.textMuted)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.bottom, 14)
                stageContent
                Text("🔍 Toca cualquier imagen para verla en grande")
                    .font(.system(size: 11, weight: .semibold)).foregroundStyle(VColor.textMuted).padding(.top, 14)
            }
            .padding(16)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(VColor.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 18)).vCardShadow()

            // PASO 3 · movimiento
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 8) {
                    Text("🏃").font(.system(size: 17))
                        .frame(width: 34, height: 34).background(Color(hex: "fff1dc")).clipShape(RoundedRectangle(cornerRadius: 11))
                    Text("PASO 3 · VERSIÓN EN MOVIMIENTO").font(.system(size: 11, weight: .heavy)).foregroundStyle(Color(hex: "d98a1f"))
                    Spacer()
                }
                Text(ex.move).font(.system(size: 13.5, weight: .bold)).foregroundStyle(VColor.textPrimary).padding(.top, 11)
            }
            .padding(15)
            .background(Color(hex: "fffdf5"))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(hex: "f4e6b8"), lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 16))

            HStack(spacing: 8) {
                Text("👂").font(.system(size: 14))
                Text("Espera y observa la respuesta del niño").font(.system(size: 13, weight: .bold)).foregroundStyle(VColor.textSecondary)
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 4)

            // PASO 4 · EPT-3
            VStack(spacing: 0) {
                Text("PASO 4 · EVALUACIÓN").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.textMuted)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text("Evalúa con la escala EPT-3").font(.system(size: 16, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.top, 4)
                Text("Tres niveles: toca el que mejor describe su respuesta")
                    .font(.system(size: 12, weight: .semibold)).foregroundStyle(VColor.textMuted)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.top, 2).padding(.bottom, 12)
                ForEach(1...3, id: \.self) { val in
                    let on = picked == val
                    Button { pick(val) } label: {
                        HStack(spacing: 12) {
                            VStack(spacing: 2) {
                                Text(starStr(val)).font(.system(size: 15)).foregroundStyle(on ? VColor.star : Color(hex: "dfe5e4"))
                                Text("\(val)★").font(.system(size: 11, weight: .heavy)).foregroundStyle(on ? Color(hex: "92711a") : Color(hex: "c2cbca"))
                            }
                            .frame(width: 54)
                            Text(ex.ept[val - 1]).font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(on ? VColor.textPrimary : VColor.textSecondary)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .padding(12)
                        .background(on ? VColor.primaryTint : Color(hex: "f7fafa"))
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(on ? VColor.primary : Color(hex: "eef3f3"), lineWidth: on ? 1.5 : 1))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    }.buttonStyle(.plain).padding(.bottom, 9)
                }
            }
            .padding(16)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(VColor.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 18)).vCardShadow()
        }
        .padding(16)
    }

    // MARK: mini-juegos por stage

    @ViewBuilder private var stageContent: some View {
        switch ex.stage {
        case .phrase:
            VStack(spacing: 12) {
                if let e = ex.phraseEmoji { emojiTile(e, ex.phrase?.lowercased() ?? "", size: 92, bg: 1) }
                Text("“\(ex.phrase ?? "")”").font(.system(size: 26, weight: .black)).foregroundStyle(VColor.textPrimary)
                speakButton("Oír la palabra despacio")
                micCard(target: ex.phrase ?? "")
            }
        case .vowels:
            VStack(spacing: 12) {
                HStack(spacing: 14) {
                    ForEach(Array(ex.tiles.enumerated()), id: \.offset) { i, t in
                        VStack(spacing: 6) {
                            emojiTile(t.emoji, t.cap, size: 82, bg: i)
                            Text(t.cap).font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                        }
                    }
                }
                vowelRow(pick: vowelPick) { vowelPick = $0 }
            }
        case .fill:
            VStack(spacing: 12) {
                if !ex.fillEmoji.isEmpty { emojiTile(ex.fillEmoji, ex.fillCap, size: 86, bg: 5) }
                HStack(spacing: 10) {
                    Text(ex.fillBefore).font(.system(size: 40, weight: .black)).foregroundStyle(VColor.textPrimary)
                    let ok = fillPick == ex.fillAnswer
                    Text(fillPick ?? "?").font(.system(size: 34, weight: .black))
                        .foregroundStyle(fillPick == nil ? Color(hex: "c2cbca") : (ok ? .white : VColor.error))
                        .frame(width: 60, height: 66)
                        .background(fillPick == nil ? VColor.pageBg : (ok ? VColor.primary : VColor.errorBg))
                        .overlay(RoundedRectangle(cornerRadius: 14).stroke(ok ? VColor.primary : Color(hex: "e5e7eb"), lineWidth: 1.5))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    Text(ex.fillAfter).font(.system(size: 40, weight: .black)).foregroundStyle(VColor.textPrimary)
                }
                vowelRow(pick: fillPick, answer: ex.fillAnswer) { fillPick = $0 }
            }
        case .intruder:
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 2), spacing: 10) {
                ForEach(Array(ex.intruder.enumerated()), id: \.offset) { i, t in
                    let reveal = intruderPick >= 0
                    let isAns = i == ex.intruderAnswer
                    let ok = reveal && isAns
                    let bad = intruderPick == i && !isAns
                    Button { if intruderPick < 0 { intruderPick = i } } label: {
                        VStack(spacing: 8) {
                            emojiTile(t.emoji, t.cap, size: 84, bg: i)
                            HStack(spacing: 4) {
                                Text(t.cap).font(.system(size: 13, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                                Text(ok ? "✅" : bad ? "❌" : "").font(.system(size: 13))
                            }
                        }
                        .frame(maxWidth: .infinity).padding(10)
                        .background(Color.white)
                        .overlay(RoundedRectangle(cornerRadius: 16).stroke(ok ? VColor.success : bad ? VColor.error : VColor.border, lineWidth: ok || bad ? 2 : 1))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }.buttonStyle(.plain)
                }
            }
        case .emotions:
            VStack(spacing: 16) {
                VStack(spacing: 4) {
                    Text(ex.emotionFace).font(.system(size: 62))
                    Text("¿Cómo se siente?").font(.system(size: 14, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                }
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 2), spacing: 10) {
                    ForEach(EMO, id: \.label) { e in
                        let pickedEmo = emotionPick == e.label
                        let isAns = e.label == ex.emotionAnswer
                        let ok = pickedEmo && isAns; let bad = pickedEmo && !isAns
                        Button { if emotionPick == nil { emotionPick = e.label } } label: {
                            HStack {
                                Text(e.face).font(.system(size: 24))
                                Text(e.label).font(.system(size: 14, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                                Spacer()
                                Text(ok ? "✅" : bad ? "❌" : "").font(.system(size: 14))
                            }
                            .padding(12)
                            .background(Color.white)
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(ok ? VColor.success : bad ? VColor.error : VColor.border, lineWidth: ok || bad ? 2 : 1))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                        }.buttonStyle(.plain)
                    }
                }
            }
        case .instruction:
            VStack(spacing: 10) {
                Text(ex.instrIcon).font(.system(size: 32))
                    .frame(width: 80, height: 80).background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 22))
                Text(ex.instrHint).font(.system(size: 13, weight: .semibold)).foregroundStyle(VColor.textMuted)
                    .multilineTextAlignment(.center)
            }
        }
    }

    private func vowelRow(pick: String?, answer: String? = nil, onTap: @escaping (String) -> Void) -> some View {
        HStack(spacing: 8) {
            ForEach(VOWELS, id: \.self) { v in
                let on = pick == v
                let right = answer != nil && on && v == answer
                Button { onTap(v) } label: {
                    Text(v).font(.system(size: 20, weight: .heavy))
                        .foregroundStyle(on ? .white : VColor.textPrimary)
                        .frame(maxWidth: .infinity, minHeight: 48)
                        .background(right ? VColor.success : (on ? VColor.primary : VColor.pageBg))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(on ? .clear : Color(hex: "eef2f1"), lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }.buttonStyle(.plain)
            }
        }
    }

    private func emojiTile(_ emoji: String, _ cap: String, size: CGFloat, bg: Int) -> some View {
        let bgs = ["e6f9f8", "fff1dc", "ede4fc", "e0edff", "eafaf2", "fff1f2"]
        return Text(emoji).font(.system(size: size * 0.5))
            .frame(width: size, height: size)
            .background(Color(hex: bgs[bg % bgs.count]))
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private func speakButton(_ label: String) -> some View {
        HStack(spacing: 7) {
            Text("🔊").font(.system(size: 14))
            Text(label).font(.system(size: 13, weight: .heavy)).foregroundStyle(VColor.primaryDark)
        }
        .padding(.horizontal, 14).padding(.vertical, 9)
        .background(VColor.primaryLight)
        .clipShape(Capsule())
    }

    private func micCard(target: String) -> some View {
        HStack(spacing: 11) {
            Text("🎤").font(.system(size: 18))
                .frame(width: 40, height: 40).background(VColor.primary).clipShape(Circle())
            VStack(alignment: .leading, spacing: 2) {
                Text("Juego de voz").font(.system(size: 13.5, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                Text("Pulsa y que el niño diga: “\(target.lowercased())”").font(.system(size: 11.5, weight: .semibold)).foregroundStyle(VColor.textMuted)
            }
            Spacer(minLength: 0)
        }
        .padding(12)
        .background(VColor.primaryTint)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(hex: "b8eee9"), lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    // MARK: completado

    private var done: some View {
        let avg = results.isEmpty ? 0 : Double(results.reduce(0, +)) / Double(results.count)
        let fullStars = Int(avg.rounded())
        return VStack(spacing: 0) {
            Text("🎉").font(.system(size: 36))
                .frame(width: 80, height: 80).background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 26))
                .padding(.top, 8)
            Text("¡Sesión completada!").font(.system(size: 22, weight: .heavy)).foregroundStyle(VColor.textPrimary).padding(.top, 14)
            Text(ids.count == 1 ? "Has evaluado este ejercicio. El resultado se ha guardado en el dispositivo."
                 : "Has evaluado las \(ids.count) actividades del plan. El resultado se guardó en el dispositivo.")
                .font(.system(size: 13, weight: .semibold)).foregroundStyle(Color(hex: "6b7280"))
                .multilineTextAlignment(.center).padding(.top, 6).padding(.horizontal, 10)

            if let r = reward { rewardBox(r) }

            // promedio
            VStack(spacing: 0) {
                Text("PROMEDIO EPT-3 DE LA SESIÓN").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.textMuted)
                (Text(String(format: "%.1f", avg)).font(.system(size: 40, weight: .black)) + Text(" / 3").font(.system(size: 18, weight: .heavy)).foregroundColor(VColor.textMuted))
                    .foregroundColor(VColor.textPrimary).padding(.top, 4)
                Text(starStr(fullStars)).font(.system(size: 22)).foregroundStyle(VColor.star).padding(.top, 2)
                HStack(spacing: 8) {
                    ForEach(Array(results.enumerated()), id: \.offset) { i, v in
                        VStack(spacing: 3) {
                            Text(exercise(for: ids[i]).code).font(.system(size: 10, weight: .heavy)).foregroundStyle(VColor.textMuted)
                            Text(String(repeating: "★", count: v)).font(.system(size: 11)).foregroundStyle(VColor.star)
                        }
                        .frame(maxWidth: .infinity).padding(.vertical, 8)
                        .background(Color(hex: "f7fafa")).clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                }
                .padding(.top, 14)
            }
            .padding(16).frame(maxWidth: .infinity)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(VColor.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 18)).padding(.top, 16)

            Button { router.push(.results) } label: {
                Text("Ver Resultados →").font(.system(size: 16, weight: .heavy)).foregroundStyle(.white)
                    .frame(maxWidth: .infinity).padding(.vertical, 16)
                    .background(VColor.primary).clipShape(RoundedRectangle(cornerRadius: 14)).vButtonShadow()
            }.buttonStyle(.plain).padding(.top, 16)

            Button { restart() } label: {
                Text("Repetir sesión").font(.system(size: 13.5, weight: .heavy)).foregroundStyle(VColor.primaryDark).padding(.top, 12)
            }.buttonStyle(.plain)
        }
        .padding(16)
    }

    private func rewardBox(_ r: SessionReward) -> some View {
        VStack(spacing: 12) {
            HStack(spacing: 10) {
                VStack(spacing: 2) {
                    Text("+\(r.xpGained)").font(.system(size: 22, weight: .black)).foregroundStyle(VColor.primaryDark)
                    Text("XP").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.textMuted)
                }
                .frame(maxWidth: .infinity).padding(.vertical, 12).background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 14))
                VStack(spacing: 2) {
                    Text("🔥 \(r.streak)").font(.system(size: 22, weight: .black)).foregroundStyle(Color(hex: "d98a1f"))
                    Text(r.streak == 1 ? "día de racha" : "días de racha").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.textMuted)
                }
                .frame(maxWidth: .infinity).padding(.vertical, 12).background(Color(hex: "fff4e5")).clipShape(RoundedRectangle(cornerRadius: 14))
            }
            VStack(alignment: .leading, spacing: 6) {
                Text("Nivel \(r.level) · \(r.levelName)\(r.levelUp ? "  🎊 ¡SUBISTE DE NIVEL!" : "")")
                    .font(.system(size: 12.5, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(Color(hex: "eef3f3")).frame(height: 10)
                        Capsule().fill(VColor.primary).frame(width: geo.size.width * levelProgress(r.xpTotal), height: 10)
                    }
                }
                .frame(height: 10)
                Text("\(xpToNext(r.xpTotal)) XP para el siguiente nivel").font(.system(size: 11, weight: .bold)).foregroundStyle(VColor.textMuted)
            }
            if !r.newBadges.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("🏅 ¡LOGROS DESBLOQUEADOS!").font(.system(size: 11, weight: .heavy)).foregroundStyle(Color(hex: "d98a1f"))
                    ForEach(r.newBadges) { b in
                        HStack(spacing: 10) {
                            Text(b.icon).font(.system(size: 22))
                            VStack(alignment: .leading, spacing: 1) {
                                Text(b.name).font(.system(size: 13.5, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                                Text(b.desc).font(.system(size: 11.5, weight: .semibold)).foregroundStyle(VColor.textMuted)
                            }
                            Spacer(minLength: 0)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12).background(Color(hex: "fffdf3")).clipShape(RoundedRectangle(cornerRadius: 14))
            }
        }
        .padding(14)
        .background(VColor.pageBg)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.top, 16)
    }

    // MARK: acciones

    private func pick(_ val: Int) {
        picked = val
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
            var next = results; next.append(val)
            if idx + 1 >= ids.count {
                results = next
                let avg = Double(next.reduce(0, +)) / Double(next.count)
                reward = model.registerSession(avg: avg, exercises: next.count, block: "Sesión")
                finished = true
                withAnimation(.easeOut(duration: 0.4)) { confetti = true }
            } else {
                results = next; idx += 1; picked = nil
                vowelPick = nil; fillPick = nil; intruderPick = -1; emotionPick = nil
            }
        }
    }

    private func restart() {
        idx = 0; results = []; picked = nil; finished = false; reward = nil; confetti = false
        vowelPick = nil; fillPick = nil; intruderPick = -1; emotionPick = nil
    }
}

// MARK: - Confeti simple

private struct ConfettiView: View {
    @State private var drop = false
    private let colors: [Color] = [VColor.primary, VColor.star, Color(hex: "7c4fd0"), Color(hex: "3b6fd4"), Color(hex: "ef4444")]
    var body: some View {
        GeometryReader { geo in
            ZStack {
                ForEach(0..<40, id: \.self) { i in
                    Circle()
                        .fill(colors[i % colors.count])
                        .frame(width: 8, height: 8)
                        .position(x: CGFloat.random(in: 0...geo.size.width),
                                  y: drop ? geo.size.height + 20 : -20)
                        .opacity(drop ? 0 : 1)
                        .animation(.easeIn(duration: Double.random(in: 1.4...2.6)).delay(Double(i) * 0.02), value: drop)
                }
            }
            .onAppear { drop = true }
            .allowsHitTesting(false)
        }
        .ignoresSafeArea()
    }
}
