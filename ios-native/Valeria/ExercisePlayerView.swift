//
//  ExercisePlayerView.swift
//  Valeria
//
//  Player de Sesión de Terapia · port de src/ValeriaExercisePlayerScreen.tsx.
//  Flujo guiado en 4 pasos (consigna → mini-juego → movimiento → evaluación EPT-3)
//  con mini-juegos por tipo de ejercicio y recompensas estilo Duolingo al terminar.
//
//  V2 · feedback de los evaluadores del bloque de Audición (paridad con RN):
//   · Voz real (AVSpeechSynthesizer es-ES): consignas, palabras y refuerzos.
//   · Consignas en lenguaje llano; el texto es para el adulto.
//   · Tarjeta "Necesitarás" cuando la actividad usa material real, y edad
//     orientativa visible en cada ejercicio.
//   · FF-1 une imagen ↔ vocal de verdad; SE-2 con opciones visuales; MS-1
//     uno/muchos; MS-2 escucha-y-toca; MS-3 ordena las fichas (sin dados).
//   · PR-1/PR-2 registran la respuesta por escrito; PR-2 con escenas tocables.
//   · Explicación en lenguaje sencillo de la escala EPT-3.
//

import SwiftUI
import AVFoundation

// MARK: - Voz (TTS es-ES) · port ligero de src/valeriaVoice.ts

final class VoiceBox {
    static let shared = VoiceBox()
    private let synth = AVSpeechSynthesizer()
    private let praiseBank = ["¡Muy bien! ¡Lo has dicho genial!", "¡Bravo! ¡Qué bien ha sonado!",
                              "¡Genial! ¡Cada vez te sale mejor!", "¡Súper! ¡Lo dijiste clarísimo!"]
    private let almostBank = ["¡Casi casi! Escucha bien y otra vez…", "¡Uy, por poquito! Vamos a probar de nuevo.",
                              "¡Ya casi lo tienes! Escucha y repite."]

    func speak(_ text: String, rate: Float = 0.48, pitch: Float = 1.0) {
        synth.stopSpeaking(at: .immediate)
        let u = AVSpeechUtterance(string: text)
        u.voice = AVSpeechSynthesisVoice(language: "es-ES")
        u.rate = rate
        u.pitchMultiplier = pitch
        synth.speak(u)
    }
    /// Palabra objetivo muy despacio (modelado fonético).
    func speakSlow(_ text: String) { speak(text.lowercased(), rate: 0.34, pitch: 1.1) }
    /// Voz "cuentacuentos" para dirigirse al niño.
    func speakChild(_ text: String) { speak(text, rate: 0.46, pitch: 1.15) }
    func praise() -> String { praiseBank.randomElement() ?? "¡Muy bien!" }
    func almost() -> String { almostBank.randomElement() ?? "¡Casi!" }
    /// Nombra lo tocado y celebra/anima en la misma locución (asociación directa).
    func verdict(name: String, ok: Bool) { speakChild("\(name). \(ok ? praise() : almost())") }
    func stop() { synth.stopSpeaking(at: .immediate) }
}

// MARK: - Modelo de ejercicio del player

private enum Stage { case phrase, vowels, fill, intruder, emotions, instruction, choice, plural, order }
private struct Tile { let cap: String; let emoji: String }
private struct SceneExample { let emoji: String; let label: String; let say: String }
private struct PluralData { let cap: String; let capPlural: String; let emoji: String }
private struct PartData { let role: String; let cap: String; let emoji: String }

private struct PlayerExercise {
    let code: String
    let name: String
    let category: String
    let read: String
    let stage: Stage
    let stageLabel: String
    let ept: [String]
    let move: String
    var age: String? = nil
    var materials: String? = nil
    var phrase: String? = nil
    var phraseEmoji: String? = nil
    var tiles: [Tile] = []
    var fillBefore: String = ""; var fillAfter: String = ""; var fillAnswer: String = ""
    var fillEmoji: String = ""; var fillCap: String = ""
    var intruder: [Tile] = []; var intruderAnswer: Int = 0
    var emotionFace: String = ""; var emotionAnswer: String = ""
    var instrIcon: String = "🧠"; var instrHint: String = ""
    var choicePrompt: String = ""; var choiceLabel: String = "Oír la pregunta"; var choiceSlow: Bool = false
    var options: [Tile] = []; var optionAnswer: Int = 0
    var plural: PluralData? = nil
    var parts: [PartData] = []; var sentence: String = ""
    var capture: String? = nil
    var micTarget: String? = nil; var micPrompt: String? = nil
    var scenes: [SceneExample] = []
}

private let VOWELS = ["A", "E", "I", "O", "U"]
private struct Emo { let face: String; let label: String }
private let EMO: [Emo] = [.init(face: "😀", label: "Alegría"), .init(face: "😢", label: "Tristeza"),
                          .init(face: "😠", label: "Enfado"), .init(face: "🤕", label: "Dolor")]

/// Vocal inicial sin tildes: águila → A (para FF-1).
private func initialVowel(_ cap: String) -> String {
    let folded = cap.folding(options: .diacriticInsensitive, locale: Locale(identifier: "es"))
    return String(folded.prefix(1)).uppercased()
}

// Código, nombre, categoría y edad vienen del catálogo compartido (AppModel),
// igual que src/valeriaExerciseMeta.ts en la app RN: sin duplicados que deriven.
private func catalogMeta(_ id: String) -> ExerciseItem? {
    (Catalog.audicion + Catalog.lenguaje).first { $0.id == id }
}

private func exercise(for id: String) -> PlayerExercise {
    let m = catalogMeta(id)
    let code = m?.code ?? "EJ"
    let name = m?.name ?? "Actividad guiada"
    let cat = m?.category ?? "Sesión"
    let age = m?.age
    switch id {
    case "ff1":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "El niño toca una imagen para oír su nombre y después toca la vocal con la que empieza. La app le dice si acertó.",
            stage: .vowels, stageLabel: "Une cada imagen con su vocal",
            ept: ["Todavía no une la imagen con su vocal, ni con ayuda.",
                  "Acierta la vocal cuando el adulto le da una pista.",
                  "Une cada imagen con su vocal él solo."],
            move: "Dibujad la vocal en el aire con el brazo bien grande cada vez que acierte.",
            age: age,
            tiles: [Tile(cap: "araña", emoji: "🕷️"), Tile(cap: "elefante", emoji: "🐘"), Tile(cap: "isla", emoji: "🏝️")])
    case "ff2":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "Di tú primero la palabra, cerca del niño y despacio, y anímale a repetirla. La voz de la app es solo un apoyo extra.",
            stage: .phrase, stageLabel: "Repite la palabra",
            ept: ["Todavía no imita el sonido o queda muy lejos de la palabra.",
                  "Repite la palabra después de oírtela a ti varias veces.",
                  "Dice la palabra él solo, con todas sus vocales claras."],
            move: "Marchad por la sala pisando fuerte una sílaba en cada paso: ZA-PA-TO.",
            age: age, phrase: "ZAPATO", phraseEmoji: "👟")
    case "ff3":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "Primero pulsa 🔊 para que el niño oiga la palabra completa. Después, que toque la vocal que le falta a la palabra escrita.",
            stage: .fill, stageLabel: "Escucha la palabra y completa la vocal",
            ept: ["Todavía no encuentra la vocal que falta, ni con ayuda.",
                  "Completa la palabra si le repites el sonido o le das una pista.",
                  "Escucha la palabra y toca la vocal que falta él solo."],
            move: "Cuando encuentre la vocal, brazos arriba formando un sol gigante.",
            age: age, fillBefore: "S", fillAfter: "L", fillAnswer: "O", fillEmoji: "☀️", fillCap: "sol")
    case "se1":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "Pulsa 🔊 para oír el nombre de las cuatro fichas. Tres van juntas y una no. El niño toca la que NO va con las demás.",
            stage: .intruder, stageLabel: "Toca la ficha que no va con las demás",
            ept: ["Todavía no encuentra la ficha que no va con las demás.",
                  "La encuentra cuando le haces una pregunta de ayuda («¿cuáles se comen?»).",
                  "La encuentra él solo y explica por qué no va con las otras."],
            move: "Si se come, tocaos la barriga; si es el intruso, ¡salto de estrella!",
            age: age,
            intruder: [Tile(cap: "manzana", emoji: "🍎"), Tile(cap: "plátano", emoji: "🍌"),
                       Tile(cap: "uva", emoji: "🍇"), Tile(cap: "coche", emoji: "🚗")], intruderAnswer: 3)
    case "se2":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "Pulsa 🔊 para oír la adivinanza (o léela tú). El niño responde tocando una de las tres imágenes.",
            stage: .choice, stageLabel: "Escucha la adivinanza y toca la respuesta",
            ept: ["Todavía no adivina la respuesta, ni con más pistas.",
                  "Acierta después de repetirle la adivinanza o darle otra pista.",
                  "Acierta a la primera, solo con oír la adivinanza."],
            move: "Buscad por la habitación un objeto real que empiece por la misma letra.",
            age: age,
            choicePrompt: "Empieza por pe, y es una fruta amarilla y alargada. ¿Qué es?",
            choiceLabel: "Oír la adivinanza",
            options: [Tile(cap: "plátano", emoji: "🍌"), Tile(cap: "pera", emoji: "🍐"), Tile(cap: "pelota", emoji: "⚽")],
            optionAnswer: 0)
    case "se3":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "Coge el muñeco y la ropa. Dale al niño una orden cada vez: «Ponle el gorro al muñeco». Cambia de prenda en cada turno.",
            stage: .instruction, stageLabel: "Escucha la orden y viste al muñeco",
            ept: ["Todavía no reconoce las prendas ni cumple la orden.",
                  "Pone la prenda correcta si antes se lo enseñas tú una vez.",
                  "Escucha la orden y viste al muñeco él solo."],
            move: "Jugad a vestirse de verdad: que traiga el gorro corriendo y se lo ponga.",
            age: age, materials: "Un muñeco o peluche y prendas de verdad: gorro, zapatos, camiseta…",
            instrIcon: "🧥", instrHint: "El niño escucha tu orden y viste al muñeco con la prenda correcta.")
    case "ms1":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "El niño toca la tarjeta donde hay MUCHOS. Después pregúntale «¿qué son?» para que lo diga con la ese final: «gatos».",
            stage: .plural, stageLabel: "Toca donde hay muchos y dilo",
            ept: ["Todavía no distingue entre «uno» y «muchos».",
                  "Dice el plural («gatos») si tú se lo dices antes.",
                  "Toca donde hay muchos y dice el plural él solo."],
            move: "Un salto grande si hay UNO, muchos saltitos seguidos si hay MUCHOS.",
            age: age, plural: PluralData(cap: "gato", capPlural: "gatos", emoji: "🐱"))
    case "ms2":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "Pulsa 🔊 para oír la palabra. El niño toca la imagen correcta. Después jugad al revés: tú señalas una imagen y él dice la palabra.",
            stage: .choice, stageLabel: "Escucha la palabra y toca la imagen",
            ept: ["Todavía confunde las palabras de chico y de chica.",
                  "Acierta si le recuerdas el final de la palabra: «niñ-o», «niñ-a».",
                  "Toca la imagen y dice la palabra correcta él solo."],
            move: "Un lado de la sala es \"niño\" y el otro \"niña\": ¡corre al lado correcto!",
            age: age,
            choicePrompt: "niña", choiceLabel: "Oír la palabra", choiceSlow: true,
            options: [Tile(cap: "niño", emoji: "👦"), Tile(cap: "niña", emoji: "👧")], optionAnswer: 1)
    case "ms3":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "Pulsa 🔊 para que el niño oiga la frase. Después, que toque las fichas en orden para construirla: quién, qué hace y qué cosa.",
            stage: .order, stageLabel: "Escucha la frase y ordena las fichas",
            ept: ["Solo dice palabras sueltas («niño», «manzana»).",
                  "Construye la frase si tú le ayudas a empezarla.",
                  "Ordena las fichas y dice la frase completa él solo."],
            move: "Teatralizad la frase: el niño hace de actor y \"come\" una manzana imaginaria.",
            age: age,
            parts: [PartData(role: "Sujeto", cap: "niño", emoji: "👦"),
                    PartData(role: "Verbo", cap: "come", emoji: "😋"),
                    PartData(role: "Objeto", cap: "manzana", emoji: "🍎")],
            sentence: "El niño come la manzana.")
    case "pr1":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "Señala cosas de la habitación y pregúntale: «¿Qué es esto?». Escribe abajo lo que responda el niño.",
            stage: .instruction, stageLabel: "Pregunta y registra su respuesta",
            ept: ["Todavía no responde a la pregunta.",
                  "Responde si primero le das tú un ejemplo de respuesta.",
                  "Responde él solo e incluso te hace preguntas a ti."],
            move: "Pasead por la casa como exploradores señalando objetos: \"¿qué es esto?\" en cada parada.",
            age: age, instrIcon: "💬",
            instrHint: "Primero responde él a tus preguntas; luego anímale a preguntarte a ti «¿qué es esto?».",
            capture: "Pregúntale «¿qué es esto?» señalando un objeto y escribe su respuesta.")
    case "pr2":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "El peluche está dormido: hablad muy bajito para no despertarlo. Cuando «se despierte», volved a la voz normal. Registra abajo cómo lo hace.",
            stage: .instruction, stageLabel: "Voz bajita o voz normal según el juego",
            ept: ["Habla igual de fuerte aunque el peluche duerma.",
                  "Baja la voz cuando tú se lo recuerdas.",
                  "Cambia él solo entre voz bajita y voz normal según el juego."],
            move: "Caminad de puntillas hablando bajito; a la señal, ¡voz normal y paso fuerte!",
            age: age, materials: "Un peluche o muñeco",
            instrIcon: "😴",
            instrHint: "Peluche dormido = voz bajita. Peluche despierto = voz normal. El niño debe cambiar su voz con el juego.",
            capture: "Escribe cómo habló el niño: ¿bajó la voz con el peluche dormido?",
            scenes: [SceneExample(emoji: "😴", label: "Dormido → voz bajita", say: "Shhh… el peluche está dormido. Hablamos muy muy bajito."),
                     SceneExample(emoji: "😀", label: "Despierto → voz normal", say: "¡Ya se despertó el peluche! Ahora hablamos con voz normal.")])
    case "pr3":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "Mira la cara grande con el niño. Pulsa 🔊 si quiere oír las opciones. Él toca cómo se siente la cara.",
            stage: .emotions, stageLabel: "Reconoce la emoción",
            ept: ["Todavía no reconoce cómo se siente la cara.",
                  "Acierta la emoción si le das pistas («mira su boca»).",
                  "Dice la emoción él solo y explica por qué se siente así."],
            move: "Imitad la emoción con todo el cuerpo: cara, brazos y postura de estatua.",
            age: age, emotionFace: "😀", emotionAnswer: "Alegría")
    case "pr4":
        return PlayerExercise(code: code, name: name, category: cat,
            read: "Tápate la boca y di una palabra casi sin voz. Si el niño no la entiende, debe pedirte: «¿qué?» o «¿cómo?». Eso es lo que practicamos: pedir que se lo repitan.",
            stage: .instruction, stageLabel: "Aprende a pedir que se lo repitan",
            ept: ["Se queda callado o abandona cuando no entiende algo.",
                  "Pide «¿qué?» si tú le recuerdas que puede pedirlo.",
                  "Pide «¿qué?» o «¿cómo?» él solo cuando no entiende."],
            move: "Susurra una orden desde lejos; si no se entiende, que venga corriendo y pida \"¿qué?\".",
            age: age, instrIcon: "🙋",
            instrHint: "El objetivo NO es repetir palabras: es que el niño aprenda a pedir que le repitas lo que no entendió.",
            micTarget: "cómo", micPrompt: "Cuando no te entienda, anímale a pedir: «¿cómo?» o «¿qué?»")
    default:
        return PlayerExercise(code: code, name: name, category: cat,
            read: "Sigue la consigna con el niño y observa su respuesta.",
            stage: .instruction, stageLabel: "Actividad guiada",
            ept: ["Todavía no participa en la actividad.",
                  "Participa con ayuda del adulto.",
                  "Participa él solo y consigue el objetivo."],
            move: "Convertid la actividad en un juego de movimiento por la sala.",
            age: age, instrIcon: "🧠", instrHint: "Guía al niño paso a paso y celebra cada intento.")
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
    @State private var eptInfoOpen = false

    // estado de mini-juegos
    @State private var fillPick: String? = nil
    @State private var intruderPick: Int = -1
    @State private var emotionPick: String? = nil
    @State private var matchSel: Int = -1
    @State private var matchOk: Set<Int> = []
    @State private var wrongVowel: String? = nil
    @State private var choicePick: Int = -1
    @State private var pluralPick: String? = nil
    @State private var orderPicks: [Int] = []
    @State private var captureText: String = ""

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
        .onDisappear { VoiceBox.shared.stop() }
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
                if let age = ex.age {
                    Text("👶 \(age)").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                        .padding(.horizontal, 9).padding(.vertical, 5).background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 9))
                }
            }

            // Material real necesario: se anuncia ANTES de empezar la actividad
            if let materials = ex.materials {
                HStack(alignment: .center, spacing: 11) {
                    Text("🧺").font(.system(size: 18))
                    VStack(alignment: .leading, spacing: 3) {
                        Text("ANTES DE EMPEZAR · NECESITARÁS").font(.system(size: 10.5, weight: .heavy)).foregroundStyle(Color(hex: "92711a"))
                        Text(materials).font(.system(size: 13, weight: .bold)).foregroundStyle(Color(hex: "7c4a0e"))
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    Spacer(minLength: 0)
                }
                .padding(13)
                .background(Color(hex: "fffbeb"))
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(hex: "f4e6b8"), lineWidth: 1.5))
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }

            // PASO 1 · consigna
            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: 10) {
                    Text("📢").font(.system(size: 18))
                        .frame(width: 36, height: 36).background(VColor.primary).clipShape(RoundedRectangle(cornerRadius: 12))
                    VStack(alignment: .leading, spacing: 1) {
                        Text("PASO 1 · CONSIGNA DEL TUTOR").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                        Text("Este texto es para el adulto: díselo al niño con tus palabras")
                            .font(.system(size: 11.5, weight: .semibold)).foregroundStyle(VColor.textMuted)
                    }
                }
                Text(ex.read).font(.system(size: 15, weight: .bold)).foregroundStyle(VColor.textPrimary).padding(.top, 12)
                    .fixedSize(horizontal: false, vertical: true)
                speakButton("Escuchar consigna") { VoiceBox.shared.speakChild(ex.read) }.padding(.top, 12)
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
                    speakButton(nil) { VoiceBox.shared.speakChild(ex.move) }
                }
                Text(ex.move).font(.system(size: 13.5, weight: .bold)).foregroundStyle(VColor.textPrimary).padding(.top, 11)
                    .fixedSize(horizontal: false, vertical: true)
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
                Text("¿Cómo le ha salido?").font(.system(size: 16, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.top, 4)
                Text("Toca la frase que mejor describa su respuesta")
                    .font(.system(size: 12, weight: .semibold)).foregroundStyle(VColor.textMuted)
                    .frame(maxWidth: .infinity, alignment: .leading).padding(.top, 2).padding(.bottom, 10)

                // Explicación en lenguaje llano de la escala EPT-3
                Button { eptInfoOpen.toggle() } label: {
                    Text("\(eptInfoOpen ? "▾" : "ℹ️") ¿Qué es la escala EPT-3?")
                        .font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                        .padding(.horizontal, 10).padding(.vertical, 5)
                        .background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 9))
                }.buttonStyle(.plain).padding(.bottom, 10)
                if eptInfoOpen {
                    Text("La EPT-3 es la escala de 3 niveles con la que se anota cómo respondió el niño en cada actividad: 1★ todavía no lo consigue, 2★ lo consigue con ayuda del adulto y 3★ lo consigue él solo. No es una nota: sirve para que el logopeda vea el progreso entre sesiones.")
                        .font(.system(size: 12.5, weight: .semibold)).foregroundStyle(VColor.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(12)
                        .background(VColor.pageBg)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .padding(.bottom, 12)
                }

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
                                .fixedSize(horizontal: false, vertical: true)
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
                speakButton("Oír la palabra despacio") { VoiceBox.shared.speakSlow(ex.phrase ?? "") }
                // Con pérdida auditiva la voz sintética cuesta de imitar: el
                // modelo principal debe ser la voz en vivo del adulto.
                Text("💡 El mejor modelo es tu voz: dísela tú primero, cerca y despacio. La voz de la app es solo un refuerzo.")
                    .font(.system(size: 12, weight: .bold)).foregroundStyle(VColor.textSecondary)
                    .multilineTextAlignment(.center).fixedSize(horizontal: false, vertical: true)
                micCard(target: ex.phrase ?? "", prompt: nil)
            }
        case .vowels:
            // FF-1 · unir de verdad cada imagen con su vocal:
            // 1) toca la imagen (la app la nombra) · 2) toca su vocal.
            VStack(spacing: 12) {
                Text("1º Toca una imagen para oír su nombre · 2º Toca la vocal con la que empieza")
                    .font(.system(size: 12, weight: .bold)).foregroundStyle(VColor.textSecondary)
                    .multilineTextAlignment(.center).fixedSize(horizontal: false, vertical: true)
                HStack(spacing: 12) {
                    ForEach(Array(ex.tiles.enumerated()), id: \.offset) { i, t in
                        let doneTile = matchOk.contains(i)
                        let sel = matchSel == i
                        Button { tapMatchTile(i) } label: {
                            VStack(spacing: 5) {
                                emojiTile(t.emoji, t.cap, size: 74, bg: i)
                                Text(t.cap).font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                                Text(doneTile ? "✅ \(initialVowel(t.cap))" : sel ? "👆 elegida" : " ")
                                    .font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                            }
                            .padding(6)
                            .background(doneTile ? VColor.successBg : sel ? VColor.primaryTint : Color.clear)
                            .overlay(RoundedRectangle(cornerRadius: 16).stroke(doneTile ? VColor.success : sel ? VColor.primary : Color.clear, lineWidth: 2))
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                        }.buttonStyle(.plain)
                    }
                }
                HStack(spacing: 8) {
                    ForEach(VOWELS, id: \.self) { v in
                        let used = ex.tiles.enumerated().contains { matchOk.contains($0.offset) && initialVowel($0.element.cap) == v }
                        let wrong = wrongVowel == v
                        Button { tapMatchVowel(v) } label: {
                            Text(v).font(.system(size: 20, weight: .heavy))
                                .foregroundStyle(used ? .white : wrong ? VColor.error : VColor.textPrimary)
                                .frame(maxWidth: .infinity, minHeight: 48)
                                .background(used ? VColor.primary : wrong ? VColor.errorBg : VColor.pageBg)
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(hex: "eef2f1"), lineWidth: 1))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }.buttonStyle(.plain)
                    }
                }
                if matchOk.count == ex.tiles.count {
                    Text("🎉 ¡Todas unidas! Puedes evaluar abajo.")
                        .font(.system(size: 13, weight: .heavy)).foregroundStyle(Color(hex: "0f8a63"))
                }
                speakButton("Oír todos los nombres") { VoiceBox.shared.speakSlow(ex.tiles.map { $0.cap }.joined(separator: ", ")) }
            }
        case .fill:
            VStack(spacing: 12) {
                if !ex.fillEmoji.isEmpty { emojiTile(ex.fillEmoji, ex.fillCap, size: 86, bg: 5) }
                // Primero se OYE la palabra completa; después se completa.
                speakButton("1º Oír la palabra completa") { VoiceBox.shared.speakSlow(ex.fillCap) }
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
                vowelRow(pick: fillPick, answer: ex.fillAnswer) { v in
                    if fillPick != v {
                        fillPick = v
                        VoiceBox.shared.speakChild(v == ex.fillAnswer ? VoiceBox.shared.praise() : VoiceBox.shared.almost())
                    }
                }
            }
        case .intruder:
            VStack(spacing: 12) {
                // Apoyo auditivo pedido por los evaluadores: oír las palabras.
                speakButton("Oír las palabras") { VoiceBox.shared.speakSlow(ex.intruder.map { $0.cap }.joined(separator: ", ")) }
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 2), spacing: 10) {
                    ForEach(Array(ex.intruder.enumerated()), id: \.offset) { i, t in
                        let reveal = intruderPick >= 0
                        let isAns = i == ex.intruderAnswer
                        let ok = reveal && isAns
                        let bad = intruderPick == i && !isAns
                        Button {
                            if intruderPick != i {
                                intruderPick = i
                                VoiceBox.shared.verdict(name: t.cap, ok: isAns)
                            }
                        } label: {
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
            }
        case .emotions:
            VStack(spacing: 16) {
                VStack(spacing: 8) {
                    Text(ex.emotionFace).font(.system(size: 62))
                    Text("¿Cómo se siente?").font(.system(size: 14, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                    // Apoyo auditivo: oír las opciones antes de elegir.
                    speakButton("Oír las opciones") {
                        VoiceBox.shared.speakChild("¿Cómo se siente? ¿\(EMO.map { $0.label }.joined(separator: ", "))?")
                    }
                }
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 2), spacing: 10) {
                    ForEach(EMO, id: \.label) { e in
                        let pickedEmo = emotionPick == e.label
                        let isAns = e.label == ex.emotionAnswer
                        let ok = pickedEmo && isAns; let bad = pickedEmo && !isAns
                        Button {
                            if emotionPick != e.label {
                                emotionPick = e.label
                                VoiceBox.shared.verdict(name: e.label, ok: isAns)
                            }
                        } label: {
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
        case .choice:
            // SE-2 / MS-2 · escucha el audio y toca la imagen correcta.
            VStack(spacing: 12) {
                speakButton(ex.choiceLabel) {
                    if ex.choiceSlow { VoiceBox.shared.speakSlow(ex.choicePrompt) }
                    else { VoiceBox.shared.speakChild(ex.choicePrompt) }
                }
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: ex.options.count), spacing: 10) {
                    ForEach(Array(ex.options.enumerated()), id: \.offset) { i, t in
                        let tapped = choicePick == i
                        let isAns = i == ex.optionAnswer
                        let ok = tapped && isAns
                        let bad = tapped && !isAns
                        Button {
                            if choicePick != i {
                                choicePick = i
                                VoiceBox.shared.verdict(name: t.cap, ok: isAns)
                            }
                        } label: {
                            VStack(spacing: 8) {
                                emojiTile(t.emoji, t.cap, size: 74, bg: i)
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
            }
        case .plural:
            // MS-1 · apoyo visual real: tarjeta con UNO frente a tarjeta con MUCHOS.
            VStack(spacing: 12) {
                if let p = ex.plural {
                    HStack(spacing: 11) {
                        pluralCard(kind: "one", count: 1, label: "un \(p.cap)", emoji: p.emoji)
                        pluralCard(kind: "many", count: 3, label: "muchos \(p.capPlural)", emoji: p.emoji)
                    }
                    micCard(target: p.capPlural, prompt: "Pregúntale «¿qué son?» y que diga: “\(p.capPlural)”")
                }
            }
        case .order:
            // MS-3 · escucha la frase y ordénala tocando las fichas en pantalla.
            VStack(spacing: 12) {
                speakButton("1º Oír la frase") { VoiceBox.shared.speakChild(ex.sentence) }
                // Huecos donde va cayendo la frase en orden
                HStack(spacing: 9) {
                    ForEach(Array(ex.parts.enumerated()), id: \.offset) { i, p in
                        let filled: PartData? = i < orderPicks.count ? ex.parts[orderPicks[i]] : nil
                        VStack(spacing: 4) {
                            Text(roleQuestion(p.role)).font(.system(size: 10, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                            Text(filled?.emoji ?? "·").font(.system(size: 26))
                            Text(filled?.cap ?? " ").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                        }
                        .frame(maxWidth: .infinity).padding(.vertical, 9)
                        .background(filled != nil ? VColor.successBg : Color.clear)
                        .overlay(RoundedRectangle(cornerRadius: 14)
                            .stroke(filled != nil ? VColor.success : Color(hex: "b8eee9"),
                                    style: StrokeStyle(lineWidth: 2, dash: filled != nil ? [] : [5])))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                }
                // Fichas desordenadas (rotación en una posición): tocarlas en
                // orden construye la frase; vale para cualquier nº de fichas.
                HStack(spacing: 12) {
                    ForEach(Array(ex.parts.indices), id: \.self) { k in
                        let i = (k + 1) % ex.parts.count
                        let used = orderPicks.contains(i)
                        Button { tapOrder(i) } label: {
                            VStack(spacing: 5) {
                                emojiTile(ex.parts[i].emoji, ex.parts[i].cap, size: 74, bg: i + 2)
                                Text(ex.parts[i].cap).font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                            }
                            .opacity(used ? 0.25 : 1)
                        }.buttonStyle(.plain).disabled(used)
                    }
                }
                let complete = orderPicks.count == ex.parts.count
                let correct = complete && orderPicks == Array(0..<ex.parts.count)
                if correct {
                    Text("🎉 “\(ex.sentence)”").font(.system(size: 15, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                        .frame(maxWidth: .infinity).padding(11)
                        .background(VColor.primaryTint)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(VColor.borderActive, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                if complete && !correct {
                    Text("Casi… vuelve a escuchar la frase y probad otra vez.")
                        .font(.system(size: 13, weight: .heavy)).foregroundStyle(Color(hex: "0f8a63"))
                }
                if !orderPicks.isEmpty && !complete {
                    Button { orderPicks = [] } label: {
                        Text("↺ Volver a empezar").font(.system(size: 12.5, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                    }.buttonStyle(.plain)
                }
            }
        case .instruction:
            VStack(spacing: 10) {
                Text(ex.instrIcon).font(.system(size: 32))
                    .frame(width: 80, height: 80).background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 22))
                Text(ex.instrHint).font(.system(size: 13, weight: .semibold)).foregroundStyle(VColor.textMuted)
                    .multilineTextAlignment(.center).fixedSize(horizontal: false, vertical: true)
                // Escenas tocables: apoyo visual + ejemplo hablado (PR-2).
                if !ex.scenes.isEmpty {
                    HStack(spacing: 11) {
                        ForEach(ex.scenes, id: \.label) { sc in
                            Button { VoiceBox.shared.speakChild(sc.say) } label: {
                                VStack(spacing: 7) {
                                    Text(sc.emoji).font(.system(size: 34))
                                    Text(sc.label).font(.system(size: 12.5, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                                        .multilineTextAlignment(.center).fixedSize(horizontal: false, vertical: true)
                                    Text("🔊 Oír ejemplo").font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                                }
                                .frame(maxWidth: .infinity).padding(.vertical, 14).padding(.horizontal, 8)
                                .background(VColor.pageBg)
                                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(hex: "eef2f1"), lineWidth: 1.5))
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                            }.buttonStyle(.plain)
                        }
                    }
                    .padding(.top, 4)
                }
                // Registro de respuesta libre por escrito (PR-1, PR-2).
                if let capture = ex.capture {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("📝 REGISTRA SU RESPUESTA").font(.system(size: 11, weight: .heavy)).foregroundStyle(Color(hex: "92711a"))
                        Text(capture).font(.system(size: 13, weight: .bold)).foregroundStyle(VColor.textPrimary)
                            .fixedSize(horizontal: false, vertical: true)
                        TextField("Escribe aquí lo que dijo…", text: $captureText, axis: .vertical)
                            .font(.system(size: 14, weight: .semibold))
                            .padding(10)
                            .background(Color.white)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(hex: "e9e2c9"), lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        if !captureText.isEmpty {
                            Text("✓ Respuesta registrada: úsala para elegir la evaluación de abajo.")
                                .font(.system(size: 12, weight: .bold)).foregroundStyle(Color(hex: "0f8a63"))
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(14)
                    .background(Color(hex: "fffdf5"))
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(hex: "f0e6c8"), lineWidth: 1.5))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .padding(.top, 4)
                }
                // Práctica de la fórmula de reparación (PR-4): «¿cómo?» o «¿qué?».
                if let target = ex.micTarget {
                    micCard(target: target, prompt: ex.micPrompt)
                }
            }
        }
    }

    private func pluralCard(kind: String, count: Int, label: String, emoji: String) -> some View {
        let tapped = pluralPick == kind
        let isAns = kind == "many"
        return Button {
            if pluralPick != kind {
                pluralPick = kind
                VoiceBox.shared.speakChild("\(label). \(isAns ? VoiceBox.shared.praise() : "Ahí solo hay uno. Busca donde hay muchos.")")
            }
        } label: {
            VStack(spacing: 6) {
                Text(String(repeating: emoji + " ", count: count).trimmingCharacters(in: .whitespaces))
                    .font(.system(size: count == 1 ? 48 : 27)).multilineTextAlignment(.center)
                Text(label).font(.system(size: 13, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                Text(tapped ? (isAns ? "✅" : "❌") : " ").font(.system(size: 14))
            }
            .frame(maxWidth: .infinity).padding(.vertical, 16).padding(.horizontal, 8)
            .background(tapped ? (isAns ? VColor.successBg : VColor.errorBg) : Color.white)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(tapped ? (isAns ? VColor.success : VColor.error) : Color(hex: "eef3f3"), lineWidth: 1.5))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }.buttonStyle(.plain)
    }

    private func roleQuestion(_ role: String) -> String {
        role == "Sujeto" ? "¿QUIÉN?" : role == "Verbo" ? "¿QUÉ HACE?" : "¿QUÉ COSA?"
    }

    // MARK: acciones de mini-juego

    private func tapMatchTile(_ i: Int) {
        guard !matchOk.contains(i) else { return }
        matchSel = i
        VoiceBox.shared.speakSlow(ex.tiles[i].cap)
    }

    private func tapMatchVowel(_ v: String) {
        guard matchSel >= 0 else { VoiceBox.shared.speakChild("Primero toca una imagen."); return }
        if initialVowel(ex.tiles[matchSel].cap) == v {
            matchOk.insert(matchSel)
            matchSel = -1
            VoiceBox.shared.speakChild(VoiceBox.shared.praise())
        } else {
            wrongVowel = v
            VoiceBox.shared.speakChild(VoiceBox.shared.almost())
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.9) {
                if wrongVowel == v { wrongVowel = nil }
            }
        }
    }

    private func tapOrder(_ i: Int) {
        guard !orderPicks.contains(i) else { return }
        orderPicks.append(i)
        if orderPicks.count == ex.parts.count {
            if orderPicks == Array(0..<ex.parts.count) {
                VoiceBox.shared.speakChild("\(VoiceBox.shared.praise()) \(ex.sentence)")
            } else {
                VoiceBox.shared.speakChild(VoiceBox.shared.almost())
                let snapshot = orderPicks
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.4) {
                    if orderPicks == snapshot { orderPicks = [] }
                }
            }
        } else {
            VoiceBox.shared.speakSlow(ex.parts[i].cap)
        }
    }

    // MARK: piezas compartidas

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

    /// Píldora 🔊 que habla de verdad al pulsarla (label nil = solo icono).
    private func speakButton(_ label: String?, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 7) {
                Text("🔊").font(.system(size: 14))
                if let label { Text(label).font(.system(size: 13, weight: .heavy)).foregroundStyle(VColor.primaryDark) }
            }
            .padding(.horizontal, label == nil ? 9 : 14).padding(.vertical, 9)
            .background(VColor.primaryLight)
            .clipShape(Capsule())
        }.buttonStyle(.plain)
    }

    private func micCard(target: String, prompt: String?) -> some View {
        HStack(spacing: 11) {
            Button { VoiceBox.shared.speakSlow(target) } label: {
                Text("🔊").font(.system(size: 18))
                    .frame(width: 40, height: 40).background(VColor.primary).clipShape(Circle())
            }.buttonStyle(.plain)
            VStack(alignment: .leading, spacing: 2) {
                Text("Juego de voz").font(.system(size: 13.5, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                Text(prompt ?? "Toca 🔊 para oír el modelo y que el niño diga: “\(target.lowercased())”")
                    .font(.system(size: 11.5, weight: .semibold)).foregroundStyle(VColor.textMuted)
                    .fixedSize(horizontal: false, vertical: true)
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
                Text("PROMEDIO DE LA SESIÓN · ESCALA EPT-3 (DE 1★ A 3★)")
                    .font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.textMuted)
                    .multilineTextAlignment(.center)
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

    private func resetEphemeral() {
        fillPick = nil; intruderPick = -1; emotionPick = nil
        matchSel = -1; matchOk = []; wrongVowel = nil
        choicePick = -1; pluralPick = nil; orderPicks = []
        captureText = ""; eptInfoOpen = false
    }

    private func pick(_ val: Int) {
        picked = val
        VoiceBox.shared.stop()
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
                resetEphemeral()
            }
        }
    }

    private func restart() {
        idx = 0; results = []; picked = nil; finished = false; reward = nil; confetti = false
        resetEphemeral()
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
