//
//  VStrings.swift
//  Valeria
//
//  Catálogo de textos del port nativo · espejo de src/i18n/strings.es.ts y
//  strings.en.ts.
//
//  Las pantallas tenían el castellano escrito dentro del cuerpo de la vista,
//  así que este port no podía enseñarse en inglés ni aunque el sistema lo
//  estuviera. Aquí viven los textos de Bienvenida y de Créditos, copiados
//  LETRA A LETRA del catálogo de React Native: si allí cambia una consigna,
//  cambia también aquí, o las dos superficies dicen cosas distintas.
//
//  Alcance honesto: solo esas dos pantallas. El resto del port (Academy,
//  ejercicios, ficha, resultados) sigue con el castellano incrustado y no se
//  traduce; cuando le toque, se amplía esta misma estructura.
//
//  El idioma sale del sistema. La app de React Native tiene además un selector
//  explícito que se guarda (valeriaUiLang); este port no tiene dónde
//  guardarlo, así que sigue al idioma del teléfono, que es el comportamiento
//  «Automático» del selector.
//

import SwiftUI

struct VWelcomeStrings {
    let tagline: String
    let sub: String
    let start: String
    let hasPatient: String
    let trust: String
}

struct VCreditsStrings {
    let kicker: String
    let authorRole: String
    let collaborators: String
    let acoprosDesc: String
    let quisqueyaDesc: String
}

struct VStrings {
    let welcome: VWelcomeStrings
    let credits: VCreditsStrings
    let cont: String

    static let es = VStrings(
        welcome: VWelcomeStrings(
            tagline: "Terapia auditiva y de lenguaje, en casa y guiada por ti.",
            sub: "Tú diriges cada ejercicio y valoras la respuesta del niño. Valeria registra el progreso.",
            start: "Comenzar",
            hasPatient: "Ya tengo un paciente registrado",
            trust: "Datos cifrados en el dispositivo · RGPD / HIPAA"
        ),
        credits: VCreditsStrings(
            kicker: "Proyecto desarrollado por",
            authorRole: "Otorrinolaringólogo infantil",
            collaborators: "En colaboración con",
            acoprosDesc: "Asociación de Colaboración y Promoción del Sordo",
            quisqueyaDesc: "Rehabilitación del lenguaje"
        ),
        cont: "Continuar"
    )

    static let en = VStrings(
        welcome: VWelcomeStrings(
            tagline: "Listening and language therapy at home, guided by you.",
            sub: "You lead every exercise and score how your child responds. Valeria keeps track of the progress.",
            start: "Get started",
            hasPatient: "I already have a patient",
            trust: "Data encrypted on this device · HIPAA / GDPR"
        ),
        credits: VCreditsStrings(
            kicker: "A project by",
            authorRole: "Pediatric ENT specialist",
            collaborators: "In collaboration with",
            acoprosDesc: "Association for the Support and Advancement of the Deaf",
            quisqueyaDesc: "Language rehabilitation"
        ),
        cont: "Continue"
    )

    /// Catálogo activo. Nombre propio de la marca y del autor fuera: no se traducen.
    static var current: VStrings {
        (Locale.preferredLanguages.first ?? "es").hasPrefix("en") ? .en : .es
    }
}
