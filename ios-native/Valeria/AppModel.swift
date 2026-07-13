//
//  AppModel.swift
//  Valeria
//
//  Estado de la app en memoria para la iteración de usabilidad. Sustituye la
//  persistencia cifrada (AsyncStorage) del proyecto RN por un ObservableObject
//  con datos de muestra, de modo que el flujo completo sea navegable en device
//  sin backend. La lógica de gamificación es un port de src/valeriaGamification.ts.
//

import SwiftUI

// MARK: - Paciente

struct Patient: Identifiable, Hashable {
    let id = UUID()
    var nombre: String = ""
    var fecha: String = ""
    var nhc: String = ""
    var genero: String = ""
    var tutor: String = ""
    var vinculo: String = ""
    var email: String = ""
    var tel: String = ""
    var patologia: String = ""
    var medico: String = ""
    var logopeda: String = ""

    /// El flujo exige Test de Ling previo si usa audífono o implante.
    var usesHearingDevice: Bool {
        patologia.range(of: "Audífono|Implante Coclear", options: .regularExpression) != nil
    }

    var avatar: String {
        let g = genero.lowercased()
        if g.contains("niña") { return "👧" }
        if g.contains("niño") { return "👦" }
        return "🧒"
    }
}

// MARK: - Catálogo de ejercicios (prescripción)

struct ExerciseItem: Identifiable, Hashable {
    let id: String
    let code: String
    let name: String
    let category: String
}

enum Catalog {
    static let audicion: [ExerciseItem] = [
        .init(id: "ff1", code: "FF-1", name: "Asociación vocal inicial", category: "Fonética-Fonología"),
        .init(id: "ff2", code: "FF-2", name: "Articulación de vocales", category: "Fonética-Fonología"),
        .init(id: "ff3", code: "FF-3", name: "Completar vocal faltante", category: "Fonética-Fonología"),
        .init(id: "se1", code: "SE-1", name: "Detección del intruso", category: "Semántica"),
        .init(id: "se2", code: "SE-2", name: "Adivinanza por letra", category: "Semántica"),
        .init(id: "se3", code: "SE-3", name: "Prendas y órdenes", category: "Semántica"),
        .init(id: "ms1", code: "MS-1", name: "Singular / plural", category: "Morfosintaxis"),
        .init(id: "ms2", code: "MS-2", name: "Flexión de género", category: "Morfosintaxis"),
        .init(id: "ms3", code: "MS-3", name: "Estructura S-V-O", category: "Morfosintaxis"),
        .init(id: "pr1", code: "PR-1", name: "Preguntas tipo ¿qué?", category: "Pragmática"),
        .init(id: "pr2", code: "PR-2", name: "Adaptación del discurso", category: "Pragmática"),
        .init(id: "pr3", code: "PR-3", name: "Reconocimiento de emociones", category: "Pragmática"),
        .init(id: "pr4", code: "PR-4", name: "Petición de repetición", category: "Pragmática"),
    ]
    static let lenguaje: [ExerciseItem] = [
        .init(id: "atencion_conjunta", code: "M-1", name: "Atención Conjunta", category: "Mirar, burbujas y nombre"),
        .init(id: "imitacion", code: "M-2", name: "Imitación Motora/Verbal", category: "Aplausos, tambor y sílabas"),
        .init(id: "comprension", code: "M-3", name: "Comprensión Verbal", category: "Órdenes, cuerpo y categorías"),
        .init(id: "expresion", code: "M-4", name: "Expresión Verbal", category: "Onomatopeyas, nombrar y frases"),
        .init(id: "comunicacion_funcional", code: "M-5", name: "Comunicación Funcional", category: "Pedir \"más\", \"ayuda\", \"quiero\""),
        .init(id: "regulacion_conductual", code: "M-6", name: "Regulación Conductual", category: "Transiciones, rutinas y fichas"),
        .init(id: "interaccion_social", code: "M-7", name: "Interacción Social", category: "Turnos, juego simbólico, emociones"),
    ]
}

// MARK: - Gamificación (port de valeriaGamification.ts)

struct Badge: Identifiable, Hashable {
    let id: String
    let icon: String
    let name: String
    let desc: String
}

let ALL_BADGES: [Badge] = [
    .init(id: "primera",  icon: "🌱", name: "Primer paso",     desc: "Completa tu primera sesión."),
    .init(id: "racha3",   icon: "🔥", name: "En llamas",       desc: "3 días seguidos practicando."),
    .init(id: "racha7",   icon: "⚡", name: "Semana perfecta", desc: "7 días seguidos practicando."),
    .init(id: "ses10",    icon: "🎓", name: "Practicante",     desc: "Completa 10 sesiones."),
    .init(id: "perfecta", icon: "⭐", name: "Sesión estrella", desc: "Logra 3★ en todos los ejercicios."),
]

private let LEVEL_NAMES = ["Osezno", "Oso Curioso", "Oso Valiente", "Oso Explorador", "Oso Sabio", "Gran Oso", "Oso Legendario"]
private let XP_PER_LEVEL = 100

func levelFor(_ xp: Int) -> Int { xp / XP_PER_LEVEL + 1 }
func levelName(_ level: Int) -> String { LEVEL_NAMES[min(level - 1, LEVEL_NAMES.count - 1)] }
func levelProgress(_ xp: Int) -> Double { Double(xp % XP_PER_LEVEL) / Double(XP_PER_LEVEL) }
func xpToNext(_ xp: Int) -> Int { XP_PER_LEVEL - (xp % XP_PER_LEVEL) }

struct SessionReward {
    var xpGained: Int
    var xpTotal: Int
    var streak: Int
    var streakExtended: Bool
    var level: Int
    var levelUp: Bool
    var levelName: String
    var newBadges: [Badge]
    var perfect: Bool
}

// MARK: - Historial de sesión (panel de resultados)

struct SessionRecord: Identifiable, Hashable {
    let id = UUID()
    var date: String
    var block: String       // "Audición", "Lenguaje", "Pares Mínimos"…
    var avg: Double         // promedio EPT-3 (0..3)
    var exercises: Int
}

// MARK: - Modelo raíz

final class AppModel: ObservableObject {
    // Pacientes
    @Published var patients: [Patient]
    @Published var activePatient: Patient?

    // Prescripción (todos activos por defecto)
    @Published var activeAud: [Bool]
    @Published var activeLen: [Bool]
    @Published var professionalUnlocked = false
    @Published var remindersEnabled = false

    // Gamificación
    @Published var xp: Int = 240
    @Published var streak: Int = 4
    @Published var sessions: Int = 8
    @Published var perfects: Int = 2
    @Published var unlockedBadgeIds: Set<String> = ["primera", "racha3"]

    // Historial para el panel de resultados
    @Published var history: [SessionRecord]

    var level: Int { levelFor(xp) }

    init() {
        patients = [
            Patient(nombre: "Lucía M.", fecha: "14 / 03 / 2019", nhc: "HC-2041", genero: "Niña",
                    tutor: "Carmen Ruiz", vinculo: "Madre", email: "carmen@correo.com", tel: "600 123 456",
                    patologia: "Hipoacusia con Implante Coclear", medico: "Dra. Alonso", logopeda: "Marta Vidal"),
            Patient(nombre: "Diego P.", fecha: "02 / 09 / 2020", nhc: "HC-1877", genero: "Niño",
                    tutor: "Javier P.", vinculo: "Padre", email: "javier@correo.com", tel: "611 987 654",
                    patologia: "Trastorno Específico del Lenguaje", medico: "Dr. Sanz", logopeda: "Marta Vidal"),
        ]
        activeAud = Array(repeating: true, count: Catalog.audicion.count)
        activeLen = Array(repeating: true, count: Catalog.lenguaje.count)
        history = [
            SessionRecord(date: "8 jul", block: "Audición", avg: 2.6, exercises: 4),
            SessionRecord(date: "6 jul", block: "Pares Mínimos", avg: 2.2, exercises: 3),
            SessionRecord(date: "4 jul", block: "Lenguaje", avg: 2.9, exercises: 5),
            SessionRecord(date: "2 jul", block: "Audición", avg: 2.4, exercises: 4),
        ]
    }

    func addPatient(_ p: Patient) {
        patients.append(p)
        activePatient = p
    }

    var activeName: String { activePatient?.nombre ?? "Lucía M." }

    /// Registra una sesión terminada y devuelve la recompensa (port simplificado).
    func registerSession(avg: Double, exercises: Int, block: String) -> SessionReward {
        let perfect = avg >= 2.95
        let streakExtended = true
        streak += 1
        let base = 20 + exercises * 5
        let precision = Int((avg * 10).rounded())
        let streakBonus = min(streak, 7) * 2
        let perfectBonus = perfect ? 15 : 0
        let gained = base + precision + streakBonus + perfectBonus

        let prevLevel = level
        xp += gained
        sessions += 1
        if perfect { perfects += 1 }
        let newLevel = level

        var newly: [Badge] = []
        func tryUnlock(_ id: String, _ cond: Bool) {
            if cond, !unlockedBadgeIds.contains(id), let b = ALL_BADGES.first(where: { $0.id == id }) {
                unlockedBadgeIds.insert(id)
                newly.append(b)
            }
        }
        tryUnlock("primera", sessions >= 1)
        tryUnlock("racha3", streak >= 3)
        tryUnlock("racha7", streak >= 7)
        tryUnlock("ses10", sessions >= 10)
        tryUnlock("perfecta", perfect)

        history.insert(SessionRecord(date: "hoy", block: block, avg: avg, exercises: exercises), at: 0)

        return SessionReward(
            xpGained: gained, xpTotal: xp, streak: streak, streakExtended: streakExtended,
            level: newLevel, levelUp: newLevel > prevLevel, levelName: levelName(newLevel),
            newBadges: newly, perfect: perfect
        )
    }
}
