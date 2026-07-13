//
//  CreditsView.swift
//  Valeria
//
//  Pantalla de Créditos · port de src/ValeriaCreditsScreen.tsx.
//  Reconoce al autor clínico y a las entidades colaboradoras.
//

import SwiftUI

private struct Colaborador: Identifiable {
    let id = UUID()
    let icon: String
    let nombre: String
    let desc: String
}

private let COLABORADORES: [Colaborador] = [
    .init(icon: "🤝", nombre: "Acopros", desc: "Asociación de Colaboración y Promoción del Sordo"),
    .init(icon: "🗣️", nombre: "Quisqueya Habla", desc: "Rehabilitación del lenguaje"),
]

struct CreditsView: View {
    @EnvironmentObject private var router: Router
    @State private var float = false

    var body: some View {
        ZStack {
            VColor.primary.ignoresSafeArea()
            Circle().fill(.white).frame(width: 240, height: 240).opacity(0.12).offset(x: -150, y: -280)
            Circle().fill(.white).frame(width: 220, height: 220).opacity(0.08).offset(x: 160, y: 220)

            VStack(spacing: 0) {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        VStack(spacing: 8) {
                            BearMark(size: 54, variant: .brown)
                            Text("valeria")
                                .font(.system(size: 26, weight: .heavy))
                                .foregroundStyle(.white)
                        }
                        .padding(.top, 36)

                        Text("PROYECTO DESARROLLADO POR")
                            .font(.system(size: 12, weight: .heavy))
                            .tracking(2.5)
                            .foregroundStyle(Color.white.opacity(0.7))
                            .padding(.top, 30)

                        // Tarjeta del autor
                        VStack(spacing: 0) {
                            Text("🩺").font(.system(size: 34))
                                .frame(width: 74, height: 74)
                                .background(Color.white.opacity(0.92))
                                .clipShape(Circle())
                                .offset(y: float ? -6 : 0)
                            Text("Dr. Frank Betances")
                                .font(.system(size: 21, weight: .black))
                                .foregroundStyle(.white)
                                .padding(.top, 16)
                            Text("Otorrinolaringólogo infantil")
                                .font(.system(size: 13.5, weight: .bold))
                                .foregroundStyle(Color.white.opacity(0.88))
                                .padding(.top, 6)
                        }
                        .padding(.vertical, 24)
                        .frame(maxWidth: .infinity)
                        .background(Color.white.opacity(0.16))
                        .overlay(RoundedRectangle(cornerRadius: 22).stroke(Color.white.opacity(0.28), lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: 22))
                        .padding(.top, 16)

                        // Divisor
                        HStack(spacing: 12) {
                            Rectangle().fill(Color.white.opacity(0.3)).frame(height: 1)
                            Text("EN COLABORACIÓN CON")
                                .font(.system(size: 11.5, weight: .heavy))
                                .tracking(1.5)
                                .foregroundStyle(Color.white.opacity(0.75))
                                .fixedSize()
                            Rectangle().fill(Color.white.opacity(0.3)).frame(height: 1)
                        }
                        .padding(.top, 26)

                        // Colaboradores
                        VStack(spacing: 11) {
                            ForEach(COLABORADORES) { c in
                                HStack(spacing: 13) {
                                    Text(c.icon).font(.system(size: 20))
                                        .frame(width: 42, height: 42)
                                        .background(VColor.primaryLight)
                                        .clipShape(RoundedRectangle(cornerRadius: 13))
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(c.nombre).font(.system(size: 16, weight: .black)).foregroundStyle(VColor.dark)
                                        Text(c.desc).font(.system(size: 12, weight: .bold)).foregroundStyle(Color(hex: "5b6b6a"))
                                    }
                                    Spacer(minLength: 0)
                                }
                                .padding(.vertical, 15).padding(.horizontal, 18)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.white.opacity(0.94))
                                .clipShape(RoundedRectangle(cornerRadius: 15))
                            }
                        }
                        .padding(.top, 18)
                    }
                    .padding(.horizontal, 30)
                    .padding(.bottom, 20)
                }

                Button { router.push(.ficha) } label: {
                    Text("Continuar")
                        .font(.system(size: 17, weight: .heavy))
                        .foregroundStyle(VColor.primaryDark)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 17)
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .shadow(color: Color(hex: "0b1220", opacity: 0.18), radius: 18, x: 0, y: 8)
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 28)
                .padding(.bottom, 22).padding(.top, 8)
            }

            // Volver
            VStack {
                HStack {
                    BackPill { router.pop() }
                    Spacer()
                }
                .padding(.horizontal, 20).padding(.top, 8)
                Spacer()
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) { float = true }
        }
    }
}
