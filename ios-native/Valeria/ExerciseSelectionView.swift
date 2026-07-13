//
//  ExerciseSelectionView.swift
//  Valeria
//
//  Selección y Prescripción de Terapias · port de src/ValeriaExerciseSelectionScreen.tsx.
//  Hub de 4 bloques + lista prescribible (Audición/Lenguaje) con Modo Profesional (PIN).
//  Si el paciente activo usa audífono/implante, encamina primero al Test de Ling.
//

import SwiftUI

struct ExerciseSelectionView: View {
    @EnvironmentObject private var model: AppModel
    @EnvironmentObject private var router: Router

    enum Tab { case audicion, lenguaje }
    enum ViewMode { case hub, list }

    @State private var tab: Tab = .audicion
    @State private var view: ViewMode = .hub
    @State private var toast = ""
    @State private var pinOpen = false

    private var isAud: Bool { tab == .audicion }
    private var list: [ExerciseItem] { isAud ? Catalog.audicion : Catalog.lenguaje }
    private var active: [Bool] { isAud ? model.activeAud : model.activeLen }
    private var activeCount: Int { active.filter { $0 }.count }
    private var usesDevice: Bool { model.activePatient?.usesHearingDevice ?? false }

    private struct SectionRow { let index: Int; let item: ExerciseItem }
    private struct ListSection { let band: String?; let rows: [SectionRow] }

    /// Secciones de la lista: para Lenguaje una única sección sin cabecera; para
    /// Audición una por edad (las conocidas en orden + cualquier otra) y una
    /// final "Otras" para ítems sin banda, de modo que ningún ejercicio quede
    /// oculto por una edad no contemplada en Catalog.ageBands.
    private var sections: [ListSection] {
        let indexed = list.enumerated().map { SectionRow(index: $0.offset, item: $0.element) }
        guard isAud else { return [ListSection(band: nil, rows: indexed)] }
        let known = Catalog.ageBands
        var extra: [String] = []
        for row in indexed {
            if let a = row.item.age, !known.contains(a), !extra.contains(a) { extra.append(a) }
        }
        var out: [ListSection] = (known + extra).map { band in
            ListSection(band: band, rows: indexed.filter { $0.item.age == band })
        }
        let rest = indexed.filter { $0.item.age == nil }
        if !rest.isEmpty { out.append(ListSection(band: "Otras", rows: rest)) }
        return out.filter { !$0.rows.isEmpty }
    }

    var body: some View {
        ZStack {
            VColor.pageBg.ignoresSafeArea()
            if view == .hub { hubView } else { listView }
            if pinOpen {
                ProPinModal(isPresented: $pinOpen) {
                    model.professionalUnlocked = true
                    toast = "Modo profesional desbloqueado."
                }
            }
        }
    }

    // MARK: - HUB

    private var hubView: some View {
        VStack(spacing: 0) {
            VHeader {
                BackPill { router.pop() }.padding(.bottom, 10)
                Text("valeria+").font(.system(size: 13, weight: .heavy)).tracking(1).foregroundStyle(.white).padding(.bottom, 6)
                Text("Prescripción de Terapias").font(.system(size: 24, weight: .heavy)).foregroundStyle(.white)
                Text("Elige un bloque para practicar o prescribir")
                    .font(.system(size: 13, weight: .semibold)).foregroundStyle(Color.white.opacity(0.9)).padding(.top, 4)
                HStack(spacing: 8) {
                    gameChip("🔥 \(model.streak) \(model.streak == 1 ? "día de racha" : "días de racha")")
                    gameChip("🏅 Nivel \(model.level) · \(levelName(model.level))")
                }
                .padding(.top, 12)
            }

            ScrollView(showsIndicators: false) {
                VStack(spacing: 11) {
                    if !toast.isEmpty { toastBar }
                    Text("BLOQUES DE TERAPIA")
                        .font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textMuted)
                        .frame(maxWidth: .infinity, alignment: .leading).padding(.bottom, 1)

                    blockCard(icon: "🗣️", bg: "ede4fc", fg: "7c4fd0", title: "Pares Mínimos",
                              sub: "Dislalias: rotacismo, sigmatismo y más con juego de voz.") { router.push(.minimalPairs) }
                    blockCard(icon: "🧩", bg: "d6f5f2", fg: "00a39e", title: "Expansión Semántica",
                              sub: "Escenarios diarios, progresión léxica y contrastes con acción física.") { router.push(.semanticExpansion) }
                    blockCard(icon: "👂", bg: "e0edff", fg: "3b6fd4", title: "Audición",
                              sub: "Inspirado en el protocolo ACOPROS: sonidos, vocabulario, frases y uso social, organizado por edades.",
                              total: Catalog.audicion.count, activeN: model.activeAud.filter { $0 }.count) {
                        tab = .audicion; toast = ""; view = .list
                    }
                    blockCard(icon: "💬", bg: "fff1dc", fg: "d98a1f", title: "Lenguaje",
                              sub: "Protocolo familiar: atención conjunta, imitación, comprensión y más.",
                              total: Catalog.lenguaje.count, activeN: model.activeLen.filter { $0 }.count) {
                        tab = .lenguaje; toast = ""; view = .list
                    }

                    // Recordatorios
                    HStack(spacing: 11) {
                        Text("🔔").font(.system(size: 17))
                            .frame(width: 36, height: 36).background(Color(hex: "fffbeb")).clipShape(RoundedRectangle(cornerRadius: 12))
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Recordatorios de sesión").font(.system(size: 14, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                            Text("Hasta 4 avisos al día (9:00, 13:00, 17:00 y 20:00) en la pantalla de bloqueo para no perder la racha.")
                                .font(.system(size: 11.5, weight: .semibold)).foregroundStyle(VColor.textMuted)
                        }
                        Toggle("", isOn: $model.remindersEnabled).labelsHidden().tint(VColor.primary)
                    }
                    .padding(13)
                    .background(Color.white)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(VColor.border, lineWidth: 1))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .vCardShadow()
                    .padding(.top, 10)
                }
                .padding(18)
            }
        }
    }

    // MARK: - LISTA

    private var listView: some View {
        VStack(spacing: 0) {
            VHeader {
                BackPill(label: "‹ Bloques") { view = .hub; toast = "" }.padding(.bottom, 10)
                Text("valeria+").font(.system(size: 13, weight: .heavy)).tracking(1).foregroundStyle(.white).padding(.bottom, 6)
                Text(isAud ? "👂 Audición" : "💬 Lenguaje").font(.system(size: 24, weight: .heavy)).foregroundStyle(.white)
                Text(model.professionalUnlocked ? "Edición profesional habilitada" : "Modo Familia · solo lectura")
                    .font(.system(size: 13, weight: .semibold)).foregroundStyle(Color.white.opacity(0.9)).padding(.top, 4)
                HStack(spacing: 4) {
                    tabButton(.audicion, "Audición", Catalog.audicion.count)
                    tabButton(.lenguaje, "Lenguaje", Catalog.lenguaje.count)
                }
                .padding(4)
                .background(Color.white.opacity(0.16))
                .clipShape(RoundedRectangle(cornerRadius: 13))
                .padding(.top, 14)
            }

            ScrollView(showsIndicators: false) {
                VStack(spacing: 9) {
                    if !toast.isEmpty { toastBar.padding(.bottom, 5) }

                    ProUnlockPill(unlocked: model.professionalUnlocked) { pinOpen = true }
                        .padding(.bottom, 5)

                    sessionButton

                    HStack {
                        Text(isAud ? "PROTOCOLO ACOPROS · AUDICIÓN" : "PROTOCOLO FAMILIAR · LENGUAJE")
                            .font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.textMuted)
                        Spacer()
                        Text("\(activeCount) prescritos")
                            .font(.system(size: 12, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                            .padding(.vertical, 5).padding(.horizontal, 10)
                            .background(VColor.primaryLight).clipShape(RoundedRectangle(cornerRadius: 9))
                    }
                    .padding(.vertical, 10)

                    // Referencia del bloque: los evaluadores pedían saber en qué
                    // se basa el "protocolo ACOPROS" sin ir al manual.
                    if isAud {
                        HStack(alignment: .top, spacing: 9) {
                            Text("ℹ️").font(.system(size: 15))
                            Text("Actividades inspiradas en los materiales de rehabilitación auditiva de ACOPROS (Asociación Coruñesa de Promoción del Sordo), organizadas en 4 áreas: sonidos, vocabulario, frases y uso social. Las edades son orientativas: empieza por las de la edad de tu peque y deja que el logopeda ajuste la prescripción.")
                                .font(.system(size: 11.5, weight: .semibold)).foregroundStyle(Color(hex: "2c5382"))
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .padding(12)
                        .background(Color(hex: "eef6ff"))
                        .overlay(RoundedRectangle(cornerRadius: 13).stroke(Color(hex: "d3e5fb"), lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: 13))
                        .padding(.bottom, 5)
                    }

                    ForEach(sections, id: \.band) { section in
                        if let band = section.band {
                            HStack(spacing: 9) {
                                Text("👶 \(band.uppercased())")
                                    .font(.system(size: 11.5, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                                Rectangle().fill(VColor.borderActive).frame(height: 1)
                            }
                            .padding(.top, 10)
                        }
                        ForEach(section.rows, id: \.item.id) { row in
                            exerciseRow(row.index, row.item)
                        }
                    }

                    if model.professionalUnlocked {
                        Button { save() } label: {
                            Text("Guardar Prescripción").font(.system(size: 16, weight: .heavy)).foregroundStyle(.white)
                                .frame(maxWidth: .infinity).padding(.vertical, 16)
                                .background(VColor.primary).clipShape(RoundedRectangle(cornerRadius: 14)).vButtonShadow()
                        }.buttonStyle(.plain).padding(.top, 12)
                        Text("La selección se guarda en el dispositivo y la edición se bloquea de nuevo.")
                            .font(.system(size: 11.5, weight: .semibold)).foregroundStyle(VColor.textMuted)
                            .multilineTextAlignment(.center).padding(.top, 8)
                    } else {
                        HStack(spacing: 7) {
                            Text("🔒").font(.system(size: 13))
                            Text("Modo Familia · solo el logopeda puede modificar la prescripción.")
                                .font(.system(size: 12, weight: .bold)).foregroundStyle(VColor.textMuted)
                        }
                        .padding(.top, 18)
                    }
                }
                .padding(18)
            }
        }
    }

    // MARK: - piezas

    private var sessionButton: some View {
        let ids = list.enumerated().filter { active[$0.offset] }.map { $0.element.id }
        return Button {
            guard !ids.isEmpty else { return }
            router.push(usesDevice ? .lingTest(ids: ids) : .exercisePlayer(ids: ids))
        } label: {
            HStack(spacing: 11) {
                Text("🎯").font(.system(size: 17))
                VStack(alignment: .leading, spacing: 2) {
                    Text("Sesión completa").font(.system(size: 15, weight: .heavy)).foregroundStyle(.white)
                    Text("Los \(ids.count) ejercicios prescritos seguidos, con pausas de movimiento")
                        .font(.system(size: 11.5, weight: .semibold)).foregroundStyle(Color.white.opacity(0.9))
                }
                Spacer(minLength: 0)
                Text("▶").font(.system(size: 16, weight: .heavy)).foregroundStyle(.white)
            }
            .padding(14)
            .background(VColor.primary).clipShape(RoundedRectangle(cornerRadius: 16)).vButtonShadow()
            .opacity(ids.isEmpty ? 0.5 : 1)
        }
        .buttonStyle(.plain)
        .disabled(ids.isEmpty)
    }

    private func exerciseRow(_ i: Int, _ item: ExerciseItem) -> some View {
        let on = active[i]
        return HStack(spacing: 12) {
            Text(item.code)
                .font(.system(size: 12, weight: .heavy))
                .foregroundStyle(on ? VColor.primaryDark : VColor.textMuted)
                .frame(minWidth: 42, minHeight: 30).padding(.horizontal, 8)
                .background(on ? VColor.primaryLight : Color(hex: "f1f5f4"))
                .clipShape(RoundedRectangle(cornerRadius: 9))
            VStack(alignment: .leading, spacing: 2) {
                Text(item.name).font(.system(size: 14.5, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                Text(item.category).font(.system(size: 11.5, weight: .bold)).foregroundStyle(VColor.textMuted)
            }
            Spacer(minLength: 0)
            Button {
                router.push(usesDevice ? .lingTest(ids: [item.id]) : .exercisePlayer(ids: [item.id]))
            } label: {
                // 48×48: tamaño mínimo accesible (los evaluadores señalaron que
                // el botón anterior era muy pequeño para movilidad reducida).
                Text("▶").font(.system(size: 17)).foregroundStyle(VColor.primaryDark)
                    .frame(width: 48, height: 48)
                    .background(VColor.primaryLight)
                    .overlay(RoundedRectangle(cornerRadius: 15).stroke(VColor.borderActive, lineWidth: 1))
                    .clipShape(RoundedRectangle(cornerRadius: 15))
            }.buttonStyle(.plain)
            Toggle("", isOn: Binding(
                get: { active[i] },
                set: { newVal in
                    guard model.professionalUnlocked else { return }
                    if isAud { model.activeAud[i] = newVal } else { model.activeLen[i] = newVal }
                    toast = ""
                }
            ))
            .labelsHidden().tint(VColor.primary)
            .disabled(!model.professionalUnlocked)
            .opacity(model.professionalUnlocked ? 1 : 0.4)
        }
        .padding(12)
        .background(Color.white)
        .overlay(RoundedRectangle(cornerRadius: 15).stroke(on ? VColor.borderActive : VColor.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 15))
        .vCardShadow()
    }

    private func tabButton(_ t: Tab, _ title: String, _ count: Int) -> some View {
        let on = tab == t
        return Button { tab = t; toast = "" } label: {
            HStack(spacing: 7) {
                Text(title).font(.system(size: 14, weight: .heavy))
                    .foregroundStyle(on ? VColor.primaryDark : Color.white.opacity(0.85))
                Text("\(count)").font(.system(size: 11, weight: .heavy))
                    .foregroundStyle(on ? VColor.primaryDark : .white)
                    .padding(.horizontal, 7).padding(.vertical, 1)
                    .background(on ? VColor.primaryLight : Color.white.opacity(0.22))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            .frame(maxWidth: .infinity).padding(.vertical, 9)
            .background(on ? Color.white : .clear)
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }.buttonStyle(.plain)
    }

    private func gameChip(_ t: String) -> some View {
        Text(t).font(.system(size: 12, weight: .heavy)).foregroundStyle(.white)
            .padding(.horizontal, 11).padding(.vertical, 6)
            .background(Color.white.opacity(0.18))
            .overlay(RoundedRectangle(cornerRadius: 11).stroke(Color.white.opacity(0.32), lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 11))
    }

    private var toastBar: some View {
        HStack(spacing: 10) {
            Text("✓").foregroundStyle(.white).fontWeight(.heavy).font(.system(size: 13))
                .frame(width: 24, height: 24).background(VColor.primary).clipShape(Circle())
            Text(toast).font(.system(size: 13.5, weight: .bold)).foregroundStyle(VColor.textPrimary)
            Spacer(minLength: 0)
        }
        .padding(13)
        .background(VColor.primaryTint)
        .overlay(RoundedRectangle(cornerRadius: 13).stroke(VColor.primary, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 13))
    }

    private func blockCard(icon: String, bg: String, fg: String, title: String, sub: String,
                           total: Int? = nil, activeN: Int? = nil, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 13) {
                Text(icon).font(.system(size: 24))
                    .frame(width: 48, height: 48).background(Color(hex: bg)).clipShape(RoundedRectangle(cornerRadius: 15))
                VStack(alignment: .leading, spacing: 3) {
                    Text(title).font(.system(size: 16, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                    Text(sub).font(.system(size: 12, weight: .semibold)).foregroundStyle(VColor.textMuted)
                        .fixedSize(horizontal: false, vertical: true)
                    if let total, let activeN {
                        HStack(spacing: 8) {
                            Text("\(total) terapias").font(.system(size: 11, weight: .heavy)).foregroundStyle(Color(hex: fg))
                                .padding(.horizontal, 9).padding(.vertical, 3).background(Color(hex: bg)).clipShape(RoundedRectangle(cornerRadius: 8))
                            Text("\(activeN) activas").font(.system(size: 11.5, weight: .bold)).foregroundStyle(VColor.textMuted)
                        }
                        .padding(.top, 8)
                    }
                }
                Spacer(minLength: 0)
                Text("›").font(.system(size: 15, weight: .heavy)).foregroundStyle(.white)
                    .frame(width: 30, height: 30).background(Color(hex: fg)).clipShape(Circle())
            }
            .padding(15)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(VColor.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .vCardShadow()
        }.buttonStyle(.plain)
    }

    private func save() {
        model.professionalUnlocked = false
        let n = model.activeAud.filter { $0 }.count + model.activeLen.filter { $0 }.count
        toast = "Prescripción guardada · \(n) terapias activas."
    }
}
