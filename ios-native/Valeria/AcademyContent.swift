//
//  AcademyContent.swift
//  Valeria
//
//  Contenido y tipos de Valeria Academy (V2.0 · HUB MULTIDOMINIO) · port de
//  src/ValeriaAcademy/{academyTypes,academyDomains,academyContent,academyHardware,
//  academyRegistry}.ts. Módulo PURO: sin estado de usuario ni efectos.
//
//  Cinco silos de gamificación (Lenguaje, Hipoacusia, Dislalias, Dislexia, TEA)
//  que NUNCA mezclan su XP. El adulto es el motor clínico; la XP es refuerzo de
//  aprendizaje del cuidador, jamás una señal clínica.
//

import SwiftUI

// MARK: - Dominios

enum AcademyDomain: String, CaseIterable, Hashable {
    case lenguaje, hipoacusia, dislalias, dislexia, tea
}

struct AcademyDomainMeta {
    let label: String
    let short: String
    let icon: String
    let accentBg: Color
    let accentFg: Color
    let blurb: String
    let levelNames: [String]
}

let ACADEMY_DOMAINS: [AcademyDomain] = AcademyDomain.allCases

let DOMAIN_META: [AcademyDomain: AcademyDomainMeta] = [
    .lenguaje: .init(
        label: "Lenguaje", short: "Lenguaje", icon: "💬",
        accentBg: Color(hex: "e0edff"), accentFg: Color(hex: "3b6fd4"),
        blurb: "Cómo aprenden a hablar, el porqué del TPR y qué vicios evitar.",
        levelNames: ["Novato", "Acompañante", "Guía", "Mentor", "Experto en Lenguaje"]
    ),
    .hipoacusia: .init(
        label: "Hipoacusia / Sordera", short: "Hipoacusia", icon: "👂",
        accentBg: Color(hex: "e5f0fb"), accentFg: Color(hex: "1f6fb2"),
        blurb: "Qué es la sordera, su abordaje y el manejo de los dispositivos.",
        levelNames: ["Novato", "Iniciado", "Práctico", "Avanzado", "Experto en Hipoacusia"]
    ),
    .dislalias: .init(
        label: "Dislalias", short: "Dislalias", icon: "🗣️",
        accentBg: Color(hex: "fdeef2"), accentFg: Color(hex: "c2477e"),
        blurb: "Puntos de articulación y práctica de los sonidos difíciles.",
        levelNames: ["Novato", "Acompañante", "Guía", "Mentor", "Experto en Dislalias"]
    ),
    .dislexia: .init(
        label: "Dislexia", short: "Dislexia", icon: "🔤",
        accentBg: Color(hex: "fff1dc"), accentFg: Color(hex: "d98a1f"),
        blurb: "Conciencia fonológica y apoyo a la lectura emergente.",
        levelNames: ["Novato", "Acompañante", "Guía", "Mentor", "Experto en Dislexia"]
    ),
    .tea: .init(
        label: "TEA", short: "TEA", icon: "🧩",
        accentBg: Color(hex: "e9f7ee"), accentFg: Color(hex: "2e9e5b"),
        blurb: "Comunicación, anticipación y regulación en el espectro autista.",
        levelNames: ["Novato", "Acompañante", "Guía", "Mentor", "Experto en TEA"]
    ),
]

let ACADEMY_XP_PER_LEVEL = 60

func domainLevelFor(_ xp: Int) -> Int { max(0, xp) / ACADEMY_XP_PER_LEVEL + 1 }

func domainLevelName(_ domain: AcademyDomain, _ level: Int) -> String {
    let names = DOMAIN_META[domain]!.levelNames
    return names[min(max(level - 1, 0), names.count - 1)]
}

// MARK: - Insignias

struct AcademyBadge: Identifiable, Hashable {
    let id: String
    let icon: String
    let name: String
    let desc: String
}

enum AcademyBadgeKey: String, CaseIterable {
    case primeraCapsula, mitad, graduado, perfecto
}

struct AcademyBadgeDef {
    let key: AcademyBadgeKey
    let icon: String
    let name: String
    let desc: String
}

let DOMAIN_BADGE_DEFS: [AcademyBadgeDef] = [
    .init(key: .primeraCapsula, icon: "📘", name: "Primer paso", desc: "Completa tu primera cápsula del dominio."),
    .init(key: .mitad, icon: "📗", name: "A medio camino", desc: "Completa la mitad del dominio."),
    .init(key: .graduado, icon: "🎓", name: "Dominio experto", desc: "Completa todo el dominio."),
    .init(key: .perfecto, icon: "💯", name: "Sin fallos", desc: "Aprueba una cápsula sin ningún error."),
]

func badgeId(_ domain: AcademyDomain, _ key: AcademyBadgeKey) -> String { "\(domain.rawValue):\(key.rawValue)" }

func badgeFromId(_ id: String) -> AcademyBadge? {
    let parts = id.split(separator: ":")
    guard parts.count == 2, let domain = AcademyDomain(rawValue: String(parts[0])),
          let key = AcademyBadgeKey(rawValue: String(parts[1])),
          let meta = DOMAIN_META[domain], let def = DOMAIN_BADGE_DEFS.first(where: { $0.key == key })
    else { return nil }
    return AcademyBadge(id: id, icon: def.icon, name: "\(def.name) · \(meta.short)", desc: def.desc)
}

/// Mapeo Ficha de Registro (`patologia`) → dominio principal activo.
func domainFromPatologia(_ patologia: String?) -> AcademyDomain {
    let p = (patologia ?? "").trimmingCharacters(in: .whitespaces)
    if p.isEmpty { return .lenguaje }
    func matches(_ pattern: String) -> Bool { p.range(of: pattern, options: [.regularExpression, .caseInsensitive]) != nil }
    if matches("hipoacusia|audífono|audifono|implante coclear|sordera|coclear") { return .hipoacusia }
    if matches("tea|espectro autista|autis") { return .tea }
    if matches("dislalia") { return .dislalias }
    if matches("dislexia|lectura") { return .dislexia }
    return .lenguaje
}

// MARK: - Cápsulas de Conocimiento (dominio Lenguaje/Dislalias/Dislexia/TEA)

enum AcademyTrack: String { case desarrollo, tpr, vicios, mediada }

struct TrackAccent { let bg: Color; let fg: Color; let label: String }

let TRACK_ACCENT: [AcademyTrack: TrackAccent] = [
    .desarrollo: .init(bg: Color(hex: "e0edff"), fg: Color(hex: "3b6fd4"), label: "CÓMO APRENDEN A HABLAR"),
    .tpr: .init(bg: Color(hex: "d6f5f2"), fg: Color(hex: "00a39e"), label: "POR QUÉ EL TPR"),
    .vicios: .init(bg: Color(hex: "fdeef2"), fg: Color(hex: "c2477e"), label: "VICIOS A EVITAR"),
    .mediada: .init(bg: Color(hex: "fff1dc"), fg: Color(hex: "d98a1f"), label: "TERAPIA MEDIADA"),
]

let ACADEMY_PASS_THRESHOLD = 0.6

struct AcademySlide: Hashable {
    var icon: String? = nil
    let heading: String
    let body: String
}

struct AcademyQuizQuestion: Hashable {
    let prompt: String
    let options: [String]
    let answer: Int
    let rationale: String
}

struct AcademyCapsule: Identifiable, Hashable {
    let id: String
    let domain: AcademyDomain
    let track: AcademyTrack
    let icon: String
    let title: String
    let summary: String
    let minutes: Int
    let xp: Int
    let slides: [AcademySlide]
    let quiz: [AcademyQuizQuestion]

    static func == (l: AcademyCapsule, r: AcademyCapsule) -> Bool { l.id == r.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

let ACADEMY_CAPSULES: [AcademyCapsule] = [
    // ================================================================ LENGUAJE
    // --------------------------------------------------------------- desarrollo
    .init(id: "dev-input", domain: .lenguaje, track: .desarrollo, icon: "👂", title: "El baño de lenguaje",
          summary: "Los niños aprenden a hablar escuchando mucho antes de producir.", minutes: 2, xp: 20,
          slides: [
            .init(icon: "🌊", heading: "Primero se escucha, después se habla",
                  body: "El cerebro infantil construye el lenguaje a partir de la cantidad y calidad de habla que recibe. A esto lo llamamos \"input\" o baño de lenguaje. Antes de decir su primera palabra, tu peque ya ha oído miles de repeticiones."),
            .init(icon: "🔁", heading: "La repetición no aburre: consolida",
                  body: "Repetir la misma palabra en contextos distintos (\"mira el perro\", \"el perro corre\", \"¿dónde está el perro?\") es exactamente lo que el cerebro necesita para fijar el significado y el sonido. No temas repetir."),
            .init(icon: "🎧", heading: "Audición primero (método auditivo-verbal)",
                  body: "En terapia auditivo-verbal damos prioridad al oído: nombramos antes de mostrar, para que el niño use la escucha y no solo la lectura labial o el gesto. Por eso muchos ejercicios dicen la palabra ANTES de enseñar la imagen."),
          ],
          quiz: [
            .init(prompt: "¿Qué ocurre normalmente antes de que un niño diga su primera palabra?",
                  options: ["Ya ha escuchado muchísimo lenguaje", "Aprende a leer", "Necesita ver la boca del adulto"], answer: 0,
                  rationale: "La comprensión y la escucha preceden a la producción: el input es la materia prima del lenguaje."),
            .init(prompt: "Repetir una palabra en varios contextos…",
                  options: ["Confunde al niño", "Consolida el significado y el sonido", "Solo sirve para bebés"], answer: 1,
                  rationale: "La repetición contextualizada es el mecanismo natural de consolidación del lenguaje."),
          ]),
    .init(id: "dev-turnos", domain: .lenguaje, track: .desarrollo, icon: "🏓", title: "Conversar es por turnos",
          summary: "El ida y vuelta (\"serve and return\") es el motor del lenguaje.", minutes: 2, xp: 20,
          slides: [
            .init(icon: "🏓", heading: "Servir y devolver",
                  body: "El lenguaje se aprende en intercambios: el niño mira algo o hace un sonido (sirve) y tú respondes nombrando y ampliando (devuelves). Cada turno que le devuelves construye red neuronal."),
            .init(icon: "⏳", heading: "El poder de esperar",
                  body: "Tras una pregunta o un modelo, cuenta mentalmente hasta 5 en silencio. Ese tiempo de espera le da al niño la oportunidad de iniciar. Adelantarnos le roba el turno y le enseña a esperar a que hablemos por él."),
          ],
          quiz: [
            .init(prompt: "Después de dar un modelo o hacer una pregunta, conviene…",
                  options: ["Responder tú enseguida", "Esperar en silencio unos segundos", "Repetir la pregunta más alto"], answer: 1,
                  rationale: "La pausa de espera le cede el turno al niño y previene que aprenda a depender del adulto."),
          ]),
    // --------------------------------------------------------------------- tpr
    .init(id: "tpr-porque", domain: .lenguaje, track: .tpr, icon: "🤸", title: "¿Por qué mover el cuerpo?",
          summary: "El TPR ancla el sonido a una acción física y baja la carga.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "🧠", heading: "Escuchar + mover = recordar",
                  body: "El Total Physical Response (TPR, de Asher) empareja cada orden hablada con un movimiento de todo el cuerpo. Vincular sonido y acción crea una huella de memoria mucho más fuerte que solo oír o solo ver."),
            .init(icon: "🔋", heading: "Sin presión de \"producir\"",
                  body: "En TPR el niño demuestra que ENTIENDE moviéndose, sin obligación de hablar todavía. Eso descarga la ansiedad de rendimiento y mantiene la motivación: puede triunfar aunque aún no articule bien."),
            .init(icon: "🎯", heading: "Por eso confirmas tú",
                  body: "En las cápsulas TPR de Valeria la app dicta la orden y TÚ confirmas si la cumplió. Tú eres el juez clínico: la app nunca decide sola si acertó. Así el criterio siempre es humano."),
          ],
          quiz: [
            .init(prompt: "La ventaja principal de emparejar el sonido con un movimiento es…",
                  options: ["Cansar al niño", "Crear una huella de memoria más fuerte", "Que hable más rápido"], answer: 1,
                  rationale: "La doble vía auditivo-motora consolida mejor el aprendizaje que un solo canal."),
            .init(prompt: "En una cápsula TPR, ¿quién decide si el niño cumplió la orden?",
                  options: ["La app, automáticamente", "El adulto que acompaña", "Nadie, da igual"], answer: 1,
                  rationale: "El adulto es el motor clínico y el único que valida: la app orquesta, no diagnostica."),
          ]),
    // ------------------------------------------------------------------- vicios
    .init(id: "vicio-corregir", domain: .lenguaje, track: .vicios, icon: "🚫", title: "No corrijas: remodela",
          summary: "Decir \"está mal\" apaga; repetir bien la palabra enseña.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "🚫", heading: "El vicio de \"así no se dice\"",
                  body: "Corregir explícitamente (\"no, se dice perro, no peo\") interrumpe la comunicación y frustra. El niño aprende que hablar es arriesgado y habla menos."),
            .init(icon: "♻️", heading: "Remodelado (recast)",
                  body: "En su lugar, devuelve la palabra bien dicha de forma natural, dentro de la frase: si dice \"peo\", tú respondes \"¡Sí! Un PERRO grande\". Le das el modelo correcto sin señalar el error. Esto es el recast, la técnica reina de la terapia mediada."),
          ],
          quiz: [
            .init(prompt: "Si el niño dice \"peo\" señalando un perro, lo mejor es…",
                  options: ["\"No, se dice perro\"", "\"¡Sí, un perro grande!\"", "Ignorarlo"], answer: 1,
                  rationale: "El remodelado (recast) ofrece el modelo correcto sin castigar el intento comunicativo."),
          ]),
    .init(id: "vicio-preguntas", domain: .lenguaje, track: .vicios, icon: "❓", title: "El examen encubierto",
          summary: "Bombardear con \"¿qué es esto?\" convierte el juego en test.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "❓", heading: "Demasiadas preguntas de test",
                  body: "Preguntar sin parar \"¿qué es? ¿de qué color? ¿cuántos hay?\" pone al niño a examen. Cuando ya sabemos la respuesta y solo queremos que la diga, se nota, y baja las ganas de participar."),
            .init(icon: "💬", heading: "Comenta más, pregunta menos",
                  body: "Cambia una parte de las preguntas por comentarios y descripciones (\"¡mira, se cayó la torre!\"). Los comentarios modelan lenguaje sin exigir respuesta y dan más ejemplos para imitar. Una buena proporción es comentar más que preguntar."),
          ],
          quiz: [
            .init(prompt: "Para que el niño no viva la sesión como un examen conviene…",
                  options: ["Hacer más preguntas", "Comentar y describir más que preguntar", "Quedarse en silencio"], answer: 1,
                  rationale: "Los comentarios modelan lenguaje sin la presión de responder correctamente."),
          ]),
    // ------------------------------------------------------------------ mediada
    .init(id: "med-adulto", domain: .lenguaje, track: .mediada, icon: "🧑‍🏫", title: "Tú eres el terapeuta",
          summary: "La app es la herramienta; el motor clínico eres tú.", minutes: 2, xp: 20,
          slides: [
            .init(icon: "🧑‍🏫", heading: "Terapia MEDIADA por un adulto",
                  body: "Valeria+ no \"trata\" al niño sola. Es una herramienta que TÚ manejas: eliges el ejercicio, das el modelo, esperas, refuerzas y decides cuándo parar. El progreso depende de esa mediación humana."),
            .init(icon: "📱", heading: "Tú manejas la navegación",
                  body: "Recuerda el encuadre: el adulto controla los menús y solo cede la tableta cuando el ejercicio ya ha empezado. Por eso esta formación y los ajustes viven fuera del alcance del juego del niño."),
            .init(icon: "🛑", heading: "Parar también es terapia",
                  body: "No hay un mínimo que cumplir. Si tu peque se cansa o se desborda, parar a tiempo protege la motivación para mañana. Una sesión corta y feliz vale más que una larga y forzada."),
          ],
          quiz: [
            .init(prompt: "En Valeria+, ¿cuál es el papel del adulto?",
                  options: ["Mero espectador", "El motor clínico que media toda la sesión", "Solo encender la tableta"], answer: 1,
                  rationale: "La terapia es mediada: el adulto elige, modela, refuerza y decide. La app es la herramienta."),
            .init(prompt: "Si el niño se desborda a mitad de la sesión, lo correcto es…",
                  options: ["Terminar todos los ejercicios igualmente", "Parar: no hay mínimo obligatorio", "Subir la dificultad"], answer: 1,
                  rationale: "Parar a tiempo preserva la motivación; no existe una cuota que forzar."),
          ]),
    .init(id: "dev-autoconversacion", domain: .lenguaje, track: .desarrollo, icon: "🎙️", title: "Narra lo que pasa",
          summary: "Poner voz a lo que hacéis multiplica el lenguaje que oye.", minutes: 2, xp: 20,
          slides: [
            .init(icon: "🗣️", heading: "Autoconversación (self-talk)",
                  body: "Cuenta en voz alta lo que TÚ haces mientras lo haces: \"abro el grifo… el agua está calentita… lavamos las manos\". Sin preguntar nada. El niño oye lenguaje pegado a la acción, en el momento justo en que cobra sentido."),
            .init(icon: "👀", heading: "Habla paralela (parallel talk)",
                  body: "Ahora narra lo que hace ÉL: \"estás metiendo el coche… ¡lo empujas fuerte!\". Le prestas las palabras que aún no tiene para lo que ya está viviendo. Es el andamiaje perfecto: significado + sonido + interés, todo a la vez."),
            .init(icon: "🔤", heading: "Frases cortas y claras",
                  body: "Ajusta el tamaño de tus frases a las suyas más una pizca. Si él dice palabras sueltas, tú usa frases de dos o tres. Ni telegrama ni discurso: un modelo que le queda a un pasito por delante."),
          ],
          quiz: [
            .init(prompt: "La \"habla paralela\" consiste en…",
                  options: ["Narrar lo que el niño está haciendo", "Corregir su pronunciación", "Hablar de otra cosa para distraerlo"], answer: 0,
                  rationale: "Poner palabras a la acción del niño le da el modelo justo para lo que ya le interesa."),
            .init(prompt: "El tamaño ideal de tus frases es…",
                  options: ["Lo más largas posible", "Un pasito por delante de las suyas", "Siempre una sola palabra"], answer: 1,
                  rationale: "Modelar \"una pizca por encima\" mantiene el input comprensible y a la vez estimulante."),
          ]),
    .init(id: "med-expansion", domain: .lenguaje, track: .mediada, icon: "🌱", title: "Expandir y enriquecer",
          summary: "Recoge lo que dice y devuélvelo un poco más completo.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "➕", heading: "Expandir: completa la frase",
                  body: "Si el niño dice \"coche\", tú devuelves la versión completa: \"sí, el coche rojo\". No le pides que repita: solo le muestras cómo suena su idea entera. Recoges su palabra y la enmarcas en una frase bien formada."),
            .init(icon: "✨", heading: "Extender: añade una idea",
                  body: "Un paso más: aporta información nueva. \"El coche rojo… corre muy rápido\". Expandir arregla la forma; extender suma contenido. Juntas convierten una palabra en una conversación sin que el niño sienta examen."),
          ],
          quiz: [
            .init(prompt: "Si el niño dice \"agua\" y respondes \"sí, quieres más agua\", estás…",
                  options: ["Corrigiendo un error", "Expandiendo su mensaje", "Haciendo una pregunta de test"], answer: 1,
                  rationale: "Expandir devuelve la idea del niño en una frase completa, sin exigir repetición."),
          ]),

    // =============================================================== DISLALIAS
    .init(id: "dis-punto", domain: .dislalias, track: .tpr, icon: "👅", title: "Cada sonido, un lugar",
          summary: "La lengua y los labios tienen un punto exacto para cada fonema.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "📍", heading: "El punto de articulación",
                  body: "Una dislalia es la dificultad para producir un sonido concreto. Cada fonema se forma en un lugar de la boca: la /r/ vibra detrás de los dientes, la /k/ atrás, la /s/ con el aire entre los dientes. Saber DÓNDE va cada sonido es el primer paso para ayudar."),
            .init(icon: "🪞", heading: "El espejo es tu aliado",
                  body: "Colócate a la altura del niño frente a un espejo. Ver la boca (la tuya y la suya) hace visible algo invisible. Exagera un poco el gesto del sonido diana y deja que te imite sin prisa."),
          ],
          quiz: [
            .init(prompt: "Ante un sonido que al niño le cuesta, lo primero es…",
                  options: ["Pedirle que lo repita más alto", "Saber en qué punto de la boca se forma", "Cambiar de palabra"], answer: 1,
                  rationale: "Conocer el punto de articulación permite dar pistas concretas en lugar de repetir sin más."),
          ]),
    .init(id: "dis-edades", domain: .dislalias, track: .desarrollo, icon: "📅", title: "Cada sonido a su tiempo",
          summary: "No todos los sonidos llegan a la vez: hay un calendario.", minutes: 2, xp: 20,
          slides: [
            .init(icon: "🗓️", heading: "Los sonidos maduran por orden",
                  body: "Las vocales y sonidos como /m/, /p/, /t/ aparecen pronto. Otros, como /s/, /l/ o la /r/ vibrante, tardan más y pueden no estar del todo hasta los 5-6 años. Que un peque de 3 años aún no diga bien la /r/ suele ser parte del desarrollo, no un problema."),
            .init(icon: "⚖️", heading: "Cuándo consultar",
                  body: "Preocupa más si a los 3-4 años apenas se le entiende, si pierde sonidos que ya tenía, o si evita hablar. La decisión de intervenir la toma el logopeda; tu papel es observar, anotar ejemplos y consultar sin alarmarte antes de tiempo."),
          ],
          quiz: [
            .init(prompt: "Que un niño de 3 años no pronuncie bien la /r/ vibrante…",
                  options: ["Es siempre un trastorno", "Suele ser parte del desarrollo normal", "Significa que no oye bien"], answer: 1,
                  rationale: "La /r/ es de adquisición tardía; a esa edad su ausencia rara vez es patológica."),
          ]),
    .init(id: "dis-erre", domain: .dislalias, track: .tpr, icon: "🐯", title: "La erre, con calma",
          summary: "El sonido más difícil no se fuerza: se prepara.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "🌬️", heading: "La /r/ necesita vibración y aire",
                  body: "La /r/ fuerte pide que la punta de la lengua vibre suelta detrás de los dientes con un buen chorro de aire. Es un equilibrio fino que muchos niños tardan en lograr. Presionar (\"¡dilo bien!\") solo genera tensión, y la tensión es justo lo contrario de lo que la /r/ necesita."),
            .init(icon: "🎈", heading: "Preparar el terreno jugando",
                  body: "Ayudan los juegos que sueltan la lengua y trabajan el aire: imitar una moto (\"brrrm\"), hacer vibrar los labios, decir \"tara-tara-tara\" rápido. Son juegos, no deberes. Si a pesar del juego no aparece, el logopeda tiene técnicas específicas para provocarla."),
          ],
          quiz: [
            .init(prompt: "Ante la /r/ que no sale, lo MENOS útil es…",
                  options: ["Jugar a imitar una moto", "Presionar para que la diga ya", "Consultar con el logopeda"], answer: 1,
                  rationale: "La presión genera tensión, y la vibrante requiere una lengua relajada y suelta."),
          ]),
    .init(id: "dis-praxias", domain: .dislalias, track: .tpr, icon: "👄", title: "Gimnasia de la boca",
          summary: "Labios, lengua y soplo se entrenan como un juego.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "🤸", heading: "Praxias: mover para articular",
                  body: "Los sonidos necesitan una boca ágil. Las praxias son ejercicios de labios y lengua: sacar y meter la lengua, tocar las comisuras, inflar las mejillas, hacer \"morritos\" y sonrisa. Frente al espejo y por turnos, se convierten en un juego de imitación."),
            .init(icon: "🫧", heading: "El soplo, dosificado",
                  body: "Soplar velas, pompas, matasuegras o mover una bolita con una pajita trabaja el control del aire que muchos sonidos necesitan. Poco rato y con pausas: si el peque se marea, paramos. Como siempre, es apoyo lúdico, no una tabla de ejercicios obligatoria."),
          ],
          quiz: [
            .init(prompt: "Las praxias orofaciales sirven para…",
                  options: ["Cansar al niño", "Dar agilidad a labios y lengua", "Sustituir a la terapia"], answer: 1,
                  rationale: "Una musculatura oral ágil facilita la articulación; son un apoyo lúdico, no un sustituto de la terapia."),
          ]),

    // ================================================================ DISLEXIA
    .init(id: "dlx-fonologica", domain: .dislexia, track: .desarrollo, icon: "🔤", title: "Jugar con los sonidos",
          summary: "La lectura empieza mucho antes de las letras: en el oído.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "🎵", heading: "Conciencia fonológica",
                  body: "Antes de leer, el niño necesita \"oír\" las partes de las palabras: que \"mesa\" empieza como \"mano\", que \"gato\" rima con \"pato\", que \"sol\" tiene tres sonidos. Esta habilidad, la conciencia fonológica, es el mejor predictor de una lectura fácil."),
            .init(icon: "👏", heading: "Sin lápiz ni papel",
                  body: "Se entrena jugando: dar palmas por sílabas, buscar palabras que empiecen igual, inventar rimas. Son juegos orales, cotidianos, sin presión. Para el niño es un juego; para su cerebro lector es el andamiaje."),
          ],
          quiz: [
            .init(prompt: "La conciencia fonológica se entrena mejor…",
                  options: ["Copiando letras muchas veces", "Con juegos orales de sonidos y rimas", "Leyendo en voz alta cuanto antes"], answer: 1,
                  rationale: "Es una habilidad auditiva: se construye jugando con los sonidos, no copiando grafías."),
          ]),
    .init(id: "dlx-alerta", domain: .dislexia, track: .desarrollo, icon: "🚦", title: "Señales para estar atentos",
          summary: "Detectar pronto abre la puerta a apoyar a tiempo.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "🔎", heading: "Pistas antes de leer",
                  body: "Antes de aprender a leer, algunas señales invitan a observar: le cuesta aprender rimas o canciones, confunde palabras parecidas, tarda en aprender los nombres de las letras o los colores, o le cuesta encontrar la palabra que busca (\"eso… la cosa esa\")."),
            .init(icon: "📖", heading: "Pistas al empezar a leer",
                  body: "Ya con la lectura: lee muy despacio y con mucho esfuerzo, cambia el orden de las letras, adivina palabras por el contexto, o evita leer en voz alta. Un solo indicio no diagnostica nada; el diagnóstico lo hace un profesional. Tú aportas observaciones útiles."),
          ],
          quiz: [
            .init(prompt: "Ante varias señales de alerta de dislexia, lo adecuado es…",
                  options: ["Diagnosticarla en casa", "Observar, anotar y consultar con un profesional", "Esperar sin decir nada"], answer: 1,
                  rationale: "La familia detecta y aporta ejemplos; el diagnóstico corresponde al profesional."),
          ]),
    .init(id: "dlx-rimas", domain: .dislexia, track: .desarrollo, icon: "🎶", title: "Rimas, sílabas y sonido inicial",
          summary: "Tres juegos orales que preparan el cerebro lector.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "🥁", heading: "Contar sílabas con el cuerpo",
                  body: "Dar palmas, saltos o pasos por cada sílaba (\"ca-ba-llo\", tres) hace visible que las palabras se parten en trozos. Es el primer nivel de segmentar el habla, y se juega en cualquier momento: en el coche, en la cola del súper."),
            .init(icon: "🎵", heading: "Buscar rimas y sonido inicial",
                  body: "\"¿Qué rima con gato? Pa-to, za-pa-to…\". Y también: \"¿qué empieza como sol? So-pa, so-l-dado\". Aislar el primer sonido y encontrar rimas afina el oído fonológico, el mejor cimiento para descifrar las letras después."),
          ],
          quiz: [
            .init(prompt: "Dar palmas por cada sílaba ayuda al niño a…",
                  options: ["Escribir más rápido", "Segmentar las palabras en sonidos", "Memorizar el abecedario"], answer: 1,
                  rationale: "Segmentar en sílabas es un paso clave de la conciencia fonológica que sostiene la lectura."),
          ]),
    .init(id: "dlx-lectura-compartida", domain: .dislexia, track: .mediada, icon: "📚", title: "Leer juntos sin presión",
          summary: "Compartir el cuento protege las ganas de leer.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "🤝", heading: "La lectura es un plan agradable",
                  body: "Para un niño con dificultades, leer puede volverse una batalla. Cámbialo: lee tú la mayor parte y deja que él aporte lo que pueda (una palabra repetida, el final de la frase, señalar dibujos). El objetivo hoy es disfrutar la historia juntos, no rendir."),
            .init(icon: "❤️", heading: "Cuida la autoestima lectora",
                  body: "Nunca le hagas leer en voz alta delante de otros si le cuesta; eso deja huella. Celebra el esfuerzo, no solo el acierto. Un niño que asocia los libros con un rato cálido contigo conserva la motivación que necesitará para el trabajo específico con el especialista."),
          ],
          quiz: [
            .init(prompt: "Con un niño al que le cuesta leer, en la lectura compartida conviene…",
                  options: ["Que lea él solo en voz alta ante todos", "Leer tú la mayor parte y disfrutar juntos", "Corregir cada error al momento"], answer: 1,
                  rationale: "Proteger el placer de leer preserva la motivación, base del trabajo posterior."),
          ]),

    // ===================================================================== TEA
    .init(id: "tea-anticipar", domain: .tea, track: .mediada, icon: "🧩", title: "Anticipar da seguridad",
          summary: "Saber qué viene después reduce la ansiedad y libera atención.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "🗺️", heading: "El mundo, más predecible",
                  body: "Para muchos niños del espectro, lo inesperado angustia. Anticipar lo que va a pasar —con una foto, un pictograma o una frase corta y constante— convierte el día en algo manejable. Un mundo predecible deja recursos libres para comunicarse."),
            .init(icon: "⏱️", heading: "Avisa los cambios",
                  body: "Antes de terminar una actividad, avisa: \"dos más y guardamos\". Los finales bruscos desbordan. Un aviso breve y siempre igual respeta su ritmo y previene el desborde, sin negociaciones largas."),
          ],
          quiz: [
            .init(prompt: "Anticipar lo que va a ocurrir sirve sobre todo para…",
                  options: ["Que el niño obedezca más rápido", "Reducir la ansiedad y liberar atención", "Alargar las actividades"], answer: 1,
                  rationale: "La predictibilidad baja la carga emocional y deja recursos para la comunicación."),
          ]),
    .init(id: "tea-visual", domain: .tea, track: .mediada, icon: "🖼️", title: "Apoyos visuales",
          summary: "Lo que se ve permanece; lo que se dice, vuela.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "📌", heading: "Ver ayuda a comprender",
                  body: "Muchos niños del espectro procesan mejor lo visual que lo auditivo. Una foto, un pictograma o un dibujo sencillo acompañando a la palabra hace la información más clara y estable: la imagen sigue ahí aunque el sonido ya haya pasado."),
            .init(icon: "🗂️", heading: "Agendas y secuencias",
                  body: "Una tira de pictogramas con \"primero… luego… después\" convierte una rutina en algo predecible y visible. El niño ve qué toca y qué viene, y muchas veces la señala él mismo. Reduce la ansiedad y, de paso, es un soporte de comunicación."),
            .init(icon: "🔧", heading: "Sencillos y consistentes",
                  body: "No hace falta material caro: valen fotos reales o dibujos claros, siempre los mismos para cada cosa. La consistencia es la clave; cambiar el símbolo cada día rompe la referencia. Empieza por dos o tres momentos del día y crece poco a poco."),
          ],
          quiz: [
            .init(prompt: "Los apoyos visuales ayudan sobre todo porque…",
                  options: ["Son más bonitos", "La información permanece y no depende de recordar lo dicho", "Sustituyen al lenguaje para siempre"], answer: 1,
                  rationale: "La imagen es estable en el tiempo, a diferencia del sonido, y descarga la memoria auditiva."),
          ]),
    .init(id: "tea-pedir", domain: .tea, track: .tpr, icon: "🙌", title: "Enseñar a pedir",
          summary: "Comunicar para conseguir algo es la función más potente.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "🎯", heading: "Pedir abre la comunicación",
                  body: "La petición es la puerta de entrada: cuando el niño descubre que un gesto, un pictograma o una palabra logran que le des lo que quiere, la comunicación cobra sentido para él. Antes que nombrar colores o contar, prioriza que aprenda a PEDIR lo que le importa."),
            .init(icon: "⏸️", heading: "Crea la oportunidad",
                  body: "Deja su juguete preferido a la vista pero fuera de alcance, o dale la merienda a trocitos. Esas pequeñas \"pausas provocadas\" generan un motivo real para comunicarse. Espera su señal, y en cuanto pida —como sea— responde al instante para que aprenda que comunicar funciona."),
          ],
          quiz: [
            .init(prompt: "Al enseñar a comunicar en TEA, conviene priorizar…",
                  options: ["Que nombre muchos objetos", "Que aprenda a pedir lo que quiere", "Que repita frases largas"], answer: 1,
                  rationale: "La petición da sentido inmediato a comunicar: obtiene algo deseado, lo que refuerza el intento."),
          ]),
    .init(id: "tea-intereses", domain: .tea, track: .desarrollo, icon: "🚂", title: "Sus intereses son la puerta",
          summary: "Lo que le apasiona es el mejor punto de encuentro.", minutes: 2, xp: 25,
          slides: [
            .init(icon: "💡", heading: "Únete a su mundo",
                  body: "Si le fascinan los trenes, los dinosaurios o girar ruedas, no lo veas como un obstáculo: es tu vía de entrada. Sentarte a su lado y compartir ESE interés, en sus términos, construye la conexión desde la que después surge la comunicación."),
            .init(icon: "🌉", heading: "Del interés al intercambio",
                  body: "Desde su tema favorito puedes tender puentes: nombrar, esperar turnos, introducir una palabra nueva, provocar una petición. Partir de lo que ya le motiva hace que el aprendizaje no sea una imposición, sino una prolongación de su juego."),
          ],
          quiz: [
            .init(prompt: "Los intereses intensos del niño conviene tratarlos como…",
                  options: ["Algo que hay que eliminar", "Una puerta de entrada para conectar y comunicar", "Un premio solo al final"], answer: 1,
                  rationale: "Partir de su motivación crea conexión y contextos naturales de comunicación."),
          ]),
]

// MARK: - Contenido de hardware / guías (dominio Hipoacusia)

struct AcademyGuideUnit: Identifiable, Hashable {
    let id: String
    let domain: AcademyDomain
    let xp: Int
    var icon: String? = nil
    let heading: String
    let body: String
}

enum HearingDeviceKey: String, CaseIterable { case audifono, implante, osteo }

struct HearingDevice: Identifiable {
    var id: HearingDeviceKey { key }
    let key: HearingDeviceKey
    let label: String
    let short: String
    let tagline: String
    let guides: [AcademyGuideUnit]
}

let HIPOACUSIA_CONCEPTS: [AcademyGuideUnit] = [
    .init(id: "hip-concepto-que-es", domain: .hipoacusia, xp: 15, icon: "👂", heading: "¿Qué es la hipoacusia?",
          body: "La hipoacusia es una disminución de la capacidad de oír. Puede ser leve o profunda (sordera), afectar a uno o ambos oídos, y estar presente desde el nacimiento o aparecer después. Lo decisivo no es solo \"cuánto oye\", sino cuánto lenguaje llega al cerebro en los primeros años, cuando más aprende."),
    .init(id: "hip-concepto-tipos", domain: .hipoacusia, xp: 15, icon: "🧭", heading: "Dónde falla el sonido",
          body: "De transmisión (conductiva): el sonido no cruza bien el oído externo o medio. Neurosensorial: el problema está en la cóclea o el nervio. Mixta: ambas. El tipo y el grado los determina el equipo médico mediante audiometrías; esa información guía qué dispositivo conviene."),
    .init(id: "hip-concepto-abordaje", domain: .hipoacusia, xp: 20, icon: "🩺", heading: "El abordaje terapéutico",
          body: "Detectar pronto, equipar (audífono o implante) y estimular el lenguaje: ese es el trío. El dispositivo devuelve el acceso al sonido, pero no \"enseña\" a entender por sí solo. El cerebro aprende a interpretar lo que ahora oye gracias a la terapia auditivo-verbal y a un adulto que le da baño de lenguaje cada día."),
    .init(id: "hip-concepto-rol", domain: .hipoacusia, xp: 20, icon: "🧑‍🏫", heading: "Tu papel con el dispositivo",
          body: "Tú garantizas que el dispositivo esté puesto, encendido y en buen estado durante todas las horas de vigilia (\"ojos abiertos, oídos puestos\"). Detectas si algo no suena bien y avisas al audiólogo. Nunca ajustas la programación por tu cuenta: eso lo hace el profesional. Tu constancia diaria es la mitad de la terapia."),
]

let HEARING_DEVICES: [HearingDevice] = [
    .init(key: .audifono, label: "Audífono", short: "Audífono", tagline: "Amplifica el sonido para un oído que aún oye algo.", guides: [
        .init(id: "hip-audifono-funciona", domain: .hipoacusia, xp: 15, icon: "🔊", heading: "Cómo funciona",
              body: "Un micrófono capta el sonido, un procesador lo amplifica según la pérdida del niño y un altavoz lo envía al oído por un molde. Aprovecha la audición que queda, haciéndola más fuerte y clara. Es la opción cuando la cóclea conserva función suficiente."),
        .init(id: "hip-audifono-manejo", domain: .hipoacusia, xp: 15, icon: "✋", heading: "Manejo básico",
              body: "Enciende, comprueba que el molde entra cómodo y sin pitidos (el pitido, o feedback, suele indicar mal encaje). Ajusta el volumen solo al valor indicado por el audiólogo. Retíralo para dormir y para el agua. Guárdalo siempre en su estuche."),
        .init(id: "hip-audifono-cuidados", domain: .hipoacusia, xp: 15, icon: "🧴", heading: "Cuidados y mantenimiento",
              body: "Limpia el molde con un paño seco; nunca lo mojes con el aparato puesto. Usa el deshumidificador cada noche para evitar humedad. Revisa la pila o carga a diario. Ante cera acumulada o sonido apagado, cambia el filtro antiencerado o consulta. Lejos del calor y de manos pequeñas."),
    ]),
    .init(key: .implante, label: "Implante Coclear", short: "Implante", tagline: "Estimula el nervio auditivo cuando el audífono no basta.", guides: [
        .init(id: "hip-implante-funciona", domain: .hipoacusia, xp: 20, icon: "🧲", heading: "Cómo funciona",
              body: "Tiene dos partes: una externa (procesador con micrófono y una antena con imán) y una interna, implantada en cirugía. El procesador convierte el sonido en señales que la antena transmite por la piel al receptor interno; unos electrodos en la cóclea estimulan directamente el nervio auditivo. No amplifica: sustituye a las células dañadas."),
        .init(id: "hip-implante-manejo", domain: .hipoacusia, xp: 20, icon: "🧷", heading: "Manejo básico",
              body: "Coloca el procesador sobre la oreja y acerca la antena a la cabeza: el imán la fija sola sobre el implante. Comprueba que la luz indicadora confirma conexión. Usa el imán y el cable de la fuerza adecuada para el niño. En bebés, un accesorio de retención evita caídas. Retíralo para dormir, el baño y la piscina."),
        .init(id: "hip-implante-cuidados", domain: .hipoacusia, xp: 20, icon: "🔋", heading: "Cuidados y mantenimiento",
              body: "Seca el procesador cada noche en el deshumidificador. Protege la antena de tirones y de la electricidad estática (toboganes de plástico). Revisa cable, imán y baterías a diario. La parte interna no se toca. Si deja de responder, prueba batería y cable antes de avisar al centro implantador."),
    ]),
    .init(key: .osteo, label: "Osteointegrado", short: "Osteo", tagline: "Lleva el sonido al oído interno a través del hueso.", guides: [
        .init(id: "hip-osteo-funciona", domain: .hipoacusia, xp: 20, icon: "🦴", heading: "Cómo funciona",
              body: "El implante osteointegrado transforma el sonido en vibración y la transmite por el hueso del cráneo directamente a la cóclea, saltándose el oído externo y medio. Es útil en hipoacusias de transmisión o cuando no se puede usar un molde. El procesador se sujeta a un pilar anclado al hueso o a un imán bajo la piel."),
        .init(id: "hip-osteo-manejo", domain: .hipoacusia, xp: 20, icon: "🧩", heading: "Manejo básico",
              body: "Acopla el procesador al pilar o al imán con un clic suave; comprueba que queda firme. Enciende y ajusta al programa indicado. En niños pequeños suele empezarse con una banda elástica blanda (softband) antes de la cirugía. Retíralo para dormir y para el agua salvo modelos específicos."),
        .init(id: "hip-osteo-cuidados", domain: .hipoacusia, xp: 20, icon: "🧽", heading: "Cuidados y mantenimiento",
              body: "Si hay pilar, limpia a diario la piel alrededor según indique el equipo, vigilando enrojecimiento. Mantén el procesador seco y en el deshumidificador por la noche. Revisa batería y sujeción. Cuida la banda softband para que no apriete de más. Ante molestia o piel irritada, consulta antes de forzar el uso."),
    ]),
]

let HIPOACUSIA_UNITS: [AcademyGuideUnit] = HIPOACUSIA_CONCEPTS + HEARING_DEVICES.flatMap { $0.guides }

// MARK: - Registro de contenido completable

struct AcademyCompletable { let id: String; let domain: AcademyDomain; let xp: Int; let hasQuiz: Bool }

let COMPLETABLE_BY_ID: [String: AcademyCompletable] = {
    var out: [String: AcademyCompletable] = [:]
    for c in ACADEMY_CAPSULES { out[c.id] = .init(id: c.id, domain: c.domain, xp: c.xp, hasQuiz: true) }
    for u in HIPOACUSIA_UNITS { out[u.id] = .init(id: u.id, domain: u.domain, xp: u.xp, hasQuiz: false) }
    return out
}()

let DOMAIN_TOTALS: [AcademyDomain: Int] = {
    var out: [AcademyDomain: Int] = [:]
    for d in ACADEMY_DOMAINS { out[d] = 0 }
    for c in COMPLETABLE_BY_ID.values { out[c.domain, default: 0] += 1 }
    return out
}()

let ACADEMY_GRAND_TOTAL = COMPLETABLE_BY_ID.count

// MARK: - Vistas derivadas para el hub

struct AcademyDomainSummary {
    let domain: AcademyDomain
    let completedCount: Int
    let totalCount: Int
    var progress: Double { totalCount > 0 ? Double(completedCount) / Double(totalCount) : 0 }
    let level: Int
    let levelName: String
    let xp: Int
    let badgeCount: Int
}

struct AcademySummary {
    let completedCount: Int
    let totalCount: Int
    var progress: Double { totalCount > 0 ? Double(completedCount) / Double(totalCount) : 0 }
    let xp: Int
    let badgeCount: Int
}
