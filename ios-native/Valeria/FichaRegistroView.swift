//
//  FichaRegistroView.swift
//  Valeria
//
//  Ficha de Registro Sociodemográfico · port de src/ValeriaFichaRegistroScreen.tsx.
//  Datos del niño/a, tutor y equipo médico. Valida obligatorios y formato de email.
//

import SwiftUI
import UIKit

private let PATOLOGIAS = [
    "Hipoacusia con Implante Coclear", "Hipoacusia con Audífono", "Hipoacusia sin Audífono",
    "Trastorno Específico del Lenguaje", "Retraso Simple del Lenguaje",
    "Trastorno del Espectro Autista (TEA)", "Dislalia", "Otros",
]
private let VINCULOS = ["Madre", "Padre", "Tutor legal", "Logopeda"]
private let GENEROS = ["Niña", "Niño", "Otro"]

private func isEmail(_ v: String) -> Bool {
    v.trimmingCharacters(in: .whitespaces)
        .range(of: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", options: .regularExpression) != nil
}

struct FichaRegistroView: View {
    @EnvironmentObject private var model: AppModel
    @EnvironmentObject private var router: Router

    @State private var f = Patient()
    @State private var errNombre = false
    @State private var errNhc = false
    @State private var errTutor = false
    @State private var errEmail = false
    @State private var emailMsg = "Este campo es obligatorio."
    @State private var success = false

    var body: some View {
        VStack(spacing: 0) {
            VHeader {
                BackPill { router.pop() }.padding(.bottom, 10)
                Text("valeria+").font(.system(size: 13, weight: .heavy)).tracking(1)
                    .foregroundStyle(.white).padding(.bottom, 6)
                Text("Ficha de Registro").font(.system(size: 24, weight: .heavy)).foregroundStyle(.white)
                Text("Datos sociodemográficos del paciente")
                    .font(.system(size: 13, weight: .semibold)).foregroundStyle(Color.white.opacity(0.9))
                    .padding(.top, 4)
            }

            ScrollView(showsIndicators: false) {
                VStack(spacing: 14) {
                    // Niño/a
                    card {
                        sectionHead("🧒", "Niño / Niña")
                        field("Nombre y apellidos", required: true, error: errNombre, errorText: "Este campo es obligatorio.") {
                            input("Nombre del paciente", text: $f.nombre, error: errNombre) { errNombre = false; success = false }
                        }
                        HStack(spacing: 11) {
                            field("Fecha de nacimiento") {
                                input("DD / MM / AAAA", text: $f.fecha, keyboard: .numbersAndPunctuation) { success = false }
                            }
                            field("NHC", required: true, error: errNhc, errorText: "El NHC es obligatorio.") {
                                input("HC-…", text: $f.nhc, error: errNhc) { errNhc = false; success = false }
                            }
                            .frame(width: 120)
                        }
                        label("Género")
                        HStack(spacing: 8) {
                            ForEach(GENEROS, id: \.self) { g in
                                let on = f.genero == g
                                Button { f.genero = g; success = false } label: {
                                    Text(g).font(.system(size: 14, weight: .heavy))
                                        .foregroundStyle(on ? .white : VColor.textSecondary)
                                        .frame(maxWidth: .infinity).padding(.vertical, 11)
                                        .background(on ? VColor.primary : VColor.pageBg)
                                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(on ? VColor.primary : Color(hex: "eef2f1"), lineWidth: 1))
                                        .clipShape(RoundedRectangle(cornerRadius: 12))
                                }.buttonStyle(.plain)
                            }
                        }
                    }

                    // Tutor
                    card {
                        sectionHead("👪", "Tutor / Cuidador")
                        field("Nombre completo", required: true, error: errTutor, errorText: "Este campo es obligatorio.") {
                            input("Nombre del tutor", text: $f.tutor, error: errTutor) { errTutor = false; success = false }
                        }
                        field("Vínculo familiar") {
                            menu(selection: $f.vinculo, placeholder: "Selecciona el vínculo…", options: VINCULOS)
                        }
                        field("Correo electrónico", required: true, error: errEmail, errorText: emailMsg) {
                            input("tutor@correo.com", text: $f.email, error: errEmail, keyboard: .emailAddress) { errEmail = false; success = false }
                        }
                        field("Teléfono / WhatsApp", hint: "Se usará para enviar los reportes clínicos.") {
                            input("Ej. 600 123 456", text: $f.tel, keyboard: .phonePad) { success = false }
                        }
                    }

                    // Diagnóstico
                    card {
                        sectionHead("🩺", "Diagnóstico y equipo médico")
                        field("Patología / diagnóstico") {
                            menu(selection: $f.patologia, placeholder: "Selecciona una patología…", options: PATOLOGIAS)
                        }
                        field("Médico prescriptor (ORL / Pediatra)") {
                            input("Dr./Dra. …", text: $f.medico) { }
                        }
                        field("Logopeda asignado") {
                            input("Nombre del logopeda", text: $f.logopeda) { }
                        }
                    }

                    if success {
                        HStack(spacing: 10) {
                            Text("✓").foregroundStyle(.white).fontWeight(.heavy)
                                .frame(width: 24, height: 24).background(VColor.primary).clipShape(Circle())
                            Text("Ficha guardada y cifrada en el dispositivo.")
                                .font(.system(size: 13.5, weight: .bold)).foregroundStyle(VColor.textPrimary)
                            Spacer(minLength: 0)
                        }
                        .padding(14)
                        .background(VColor.primaryTint)
                        .overlay(RoundedRectangle(cornerRadius: 13).stroke(VColor.primary, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: 13))
                    }

                    Button { guardar() } label: {
                        Text("Guardar ficha").font(.system(size: 16, weight: .heavy)).foregroundStyle(.white)
                            .frame(maxWidth: .infinity).padding(.vertical, 16)
                            .background(VColor.primary).clipShape(RoundedRectangle(cornerRadius: 14))
                            .vButtonShadow()
                    }.buttonStyle(.plain)

                    if success {
                        Button { router.push(.exerciseSelection) } label: {
                            Text("Continuar a Prescripción →")
                                .font(.system(size: 15, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                                .frame(maxWidth: .infinity).padding(.vertical, 15)
                                .background(Color.white)
                                .overlay(RoundedRectangle(cornerRadius: 14).stroke(VColor.primary, lineWidth: 1.5))
                                .clipShape(RoundedRectangle(cornerRadius: 14))
                        }.buttonStyle(.plain)
                    }

                    HStack(spacing: 6) {
                        Text("🔒").font(.system(size: 11))
                        Text("Almacenamiento local cifrado (AES-256) · cumple RGPD / HIPAA.")
                            .font(.system(size: 11, weight: .semibold)).foregroundStyle(VColor.textMuted)
                    }
                    .padding(.top, 4)
                }
                .padding(18)
            }
        }
        .background(VColor.pageBg.ignoresSafeArea())
    }

    // MARK: acciones

    private func guardar() {
        let emailEmpty = f.email.trimmingCharacters(in: .whitespaces).isEmpty
        let emailBad = !emailEmpty && !isEmail(f.email)
        errNombre = f.nombre.trimmingCharacters(in: .whitespaces).isEmpty
        errNhc = f.nhc.trimmingCharacters(in: .whitespaces).isEmpty
        errTutor = f.tutor.trimmingCharacters(in: .whitespaces).isEmpty
        errEmail = emailEmpty || emailBad
        emailMsg = emailBad ? "Introduce un correo válido." : "Este campo es obligatorio."
        if errNombre || errNhc || errTutor || errEmail { success = false; return }
        model.addPatient(f)
        success = true
    }

    // MARK: subcomponentes

    @ViewBuilder private func card<C: View>(@ViewBuilder _ content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 0) { content() }
            .padding(17)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(VColor.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .vCardShadow()
    }

    private func sectionHead(_ icon: String, _ title: String) -> some View {
        HStack(spacing: 9) {
            Text(icon).font(.system(size: 17))
                .frame(width: 34, height: 34).background(VColor.primaryLight)
                .clipShape(RoundedRectangle(cornerRadius: 11))
            Text(title).font(.system(size: 16, weight: .heavy)).foregroundStyle(VColor.textPrimary)
        }
        .padding(.bottom, 15)
    }

    private func label(_ t: String) -> some View {
        Text(t).font(.system(size: 12.5, weight: .heavy)).foregroundStyle(VColor.textSecondary)
            .frame(maxWidth: .infinity, alignment: .leading).padding(.bottom, 6)
    }

    @ViewBuilder private func field<C: View>(_ lbl: String, required: Bool = false, error: Bool = false, errorText: String = "", hint: String = "", @ViewBuilder _ content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            (Text(lbl) + (required ? Text(" *").foregroundColor(VColor.error) : Text("")))
                .font(.system(size: 12.5, weight: .heavy)).foregroundStyle(VColor.textSecondary)
                .padding(.bottom, 6)
            content()
            if error {
                Text(errorText).font(.system(size: 11.5, weight: .bold)).foregroundStyle(VColor.error).padding(.top, 4)
            } else if !hint.isEmpty {
                Text(hint).font(.system(size: 11, weight: .semibold)).foregroundStyle(VColor.textMuted).padding(.top, 5)
            }
        }
        .padding(.bottom, 13)
    }

    private func input(_ placeholder: String, text: Binding<String>, error: Bool = false, keyboard: UIKeyboardType = .default, onChange: @escaping () -> Void = {}) -> some View {
        TextField(placeholder, text: text)
            .font(.system(size: 15)).foregroundStyle(VColor.textPrimary)
            .keyboardType(keyboard)
            .autocorrectionDisabled()
            .padding(.horizontal, 14).padding(.vertical, 13)
            .background(error ? VColor.errorBg : VColor.pageBg)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(error ? VColor.error : Color(hex: "e5e7eb"), lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .onChange(of: text.wrappedValue) { _ in onChange() }
    }

    private func menu(selection: Binding<String>, placeholder: String, options: [String]) -> some View {
        Menu {
            ForEach(options, id: \.self) { o in
                Button(o) { selection.wrappedValue = o; success = false }
            }
        } label: {
            HStack {
                Text(selection.wrappedValue.isEmpty ? placeholder : selection.wrappedValue)
                    .font(.system(size: 15))
                    .foregroundStyle(selection.wrappedValue.isEmpty ? Color(hex: "9ca3af") : VColor.textPrimary)
                Spacer()
                Text("▼").font(.system(size: 12)).foregroundStyle(VColor.primary)
            }
            .padding(.horizontal, 14).padding(.vertical, 13)
            .background(VColor.pageBg)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(hex: "e5e7eb"), lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}
