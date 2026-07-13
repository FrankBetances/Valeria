//
//  PatientSelectView.swift
//  Valeria
//
//  Selección de Paciente · port de src/ValeriaPatientSelectScreen.tsx.
//  Lista los pacientes del dispositivo y permite retomar o registrar uno nuevo.
//

import SwiftUI

struct PatientSelectView: View {
    @EnvironmentObject private var model: AppModel
    @EnvironmentObject private var router: Router

    private var subtitle: String {
        switch model.patients.count {
        case 0: return "Continúa donde lo dejaste"
        case 1: return "1 paciente registrado en este dispositivo"
        default: return "\(model.patients.count) pacientes registrados en este dispositivo"
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            VHeader {
                BackPill(label: "‹ Volver") { router.popToRoot() }
                    .padding(.bottom, 10)
                Text("valeria")
                    .font(.system(size: 20, weight: .heavy)).foregroundStyle(.white)
                    .padding(.bottom, 8)
                Text("Selecciona un paciente")
                    .font(.system(size: 24, weight: .heavy)).foregroundStyle(.white)
                Text(subtitle)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color.white.opacity(0.9))
                    .padding(.top, 4)
            }

            ScrollView(showsIndicators: false) {
                VStack(spacing: 12) {
                    ForEach(model.patients) { p in
                        Button { select(p) } label: { patientCard(p) }
                            .buttonStyle(.plain)
                    }

                    if model.patients.isEmpty { emptyState }

                    Button { router.push(.ficha) } label: {
                        HStack(spacing: 8) {
                            Text("＋").font(.system(size: 18, weight: .heavy))
                            Text("Registrar nuevo paciente").font(.system(size: 15, weight: .heavy))
                        }
                        .foregroundStyle(VColor.primaryDark)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 15)
                        .background(VColor.card)
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .strokeBorder(VColor.primary, style: StrokeStyle(lineWidth: 1.5, dash: [6, 4]))
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .buttonStyle(.plain)
                    .padding(.top, 6)

                    Text("🔒  Pacientes almacenados y cifrados en este dispositivo.")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(VColor.textMuted)
                        .multilineTextAlignment(.center)
                        .padding(.top, 18)
                }
                .padding(18)
            }
        }
        .background(VColor.pageBg.ignoresSafeArea())
    }

    private func patientCard(_ p: Patient) -> some View {
        HStack(spacing: 13) {
            Text(p.avatar).font(.system(size: 23))
                .frame(width: 48, height: 48)
                .background(VColor.primaryLight)
                .clipShape(RoundedRectangle(cornerRadius: 15))
            VStack(alignment: .leading, spacing: 3) {
                Text(p.nombre.isEmpty ? "Paciente" : p.nombre)
                    .font(.system(size: 16, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                    .lineLimit(1)
                Text(p.patologia.isEmpty ? "Sin diagnóstico asignado" : p.patologia)
                    .font(.system(size: 12, weight: .bold)).foregroundStyle(VColor.textMuted)
                    .lineLimit(1)
            }
            Spacer(minLength: 0)
            Text(p.nhc.isEmpty ? "—" : p.nhc)
                .font(.system(size: 11, weight: .heavy)).foregroundStyle(VColor.primaryDark)
                .padding(.vertical, 5).padding(.horizontal, 9)
                .background(VColor.primaryLight)
                .clipShape(RoundedRectangle(cornerRadius: 9))
            Text("›").font(.system(size: 18, weight: .heavy)).foregroundStyle(VColor.primary)
        }
        .padding(.vertical, 14).padding(.horizontal, 15)
        .background(VColor.card)
        .overlay(RoundedRectangle(cornerRadius: 17).stroke(VColor.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 17))
        .vCardShadow()
    }

    private var emptyState: some View {
        VStack(spacing: 0) {
            Text("🗂️").font(.system(size: 32))
                .frame(width: 72, height: 72)
                .background(VColor.primaryLight)
                .clipShape(Circle())
            Text("Aún no hay pacientes")
                .font(.system(size: 17, weight: .heavy)).foregroundStyle(VColor.textPrimary)
                .padding(.top, 18)
            Text("Registra tu primer paciente para empezar a prescribir terapias.")
                .font(.system(size: 13.5, weight: .semibold)).foregroundStyle(Color(hex: "6b7280"))
                .multilineTextAlignment(.center).frame(maxWidth: 240).padding(.top, 6)
        }
        .padding(.vertical, 36)
    }

    private func select(_ p: Patient) {
        model.activePatient = p
        router.push(.exerciseSelection)
    }
}
