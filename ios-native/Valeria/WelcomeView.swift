//
//  WelcomeView.swift
//  Valeria
//
//  Pantalla de Bienvenida · port de src/ValeriaWelcomeScreen.tsx.
//  Splash de marca con mascota (entrada elástica, flotación/balanceo, halo).
//

import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject private var router: Router

    @State private var appear = false
    @State private var float = false
    @State private var halo = false

    var body: some View {
        ZStack {
            VColor.primary.ignoresSafeArea()

            // círculos decorativos
            Circle().fill(.white).frame(width: 240, height: 240)
                .opacity(0.12).offset(x: 150, y: -260)
            Circle().fill(.white).frame(width: 200, height: 200)
                .opacity(0.08).offset(x: -150, y: 180)

            VStack {
                Spacer()

                // Mascota + halo
                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.85), lineWidth: 2)
                        .frame(width: 150, height: 150)
                        .scaleEffect(halo ? 1.55 : 1.0)
                        .opacity(halo ? 0 : 0.45)

                    BearMark(size: 104, variant: .brown)
                        .frame(width: 150, height: 150)
                        .background(Color.white.opacity(0.9))
                        .clipShape(RoundedRectangle(cornerRadius: 42, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 42, style: .continuous)
                                .stroke(Color.white.opacity(0.55), lineWidth: 1)
                        )
                        .scaleEffect(appear ? 1 : 0.2)
                        .offset(y: float ? -7 : 0)
                        .rotationEffect(.degrees(float ? 2.5 : -2.5))
                }

                Text("valeria+")
                    .font(.system(size: 30, weight: .heavy))
                    .foregroundStyle(.white)
                    .tracking(1)
                    .padding(.top, 28)

                Text("Terapia auditiva y de lenguaje, en casa y guiada por ti.")
                    .font(.system(size: 17, weight: .bold))
                    .foregroundStyle(Color.white.opacity(0.95))
                    .multilineTextAlignment(.center)
                    .lineSpacing(3)
                    .frame(maxWidth: 280)
                    .padding(.top, 14)

                Text("Tú diriges cada ejercicio y valoras la respuesta del niño. Valeria registra el progreso.")
                    .font(.system(size: 13.5, weight: .semibold))
                    .foregroundStyle(Color.white.opacity(0.78))
                    .multilineTextAlignment(.center)
                    .lineSpacing(3)
                    .frame(maxWidth: 270)
                    .padding(.top, 10)

                Spacer()

                // Acciones
                VStack(spacing: 12) {
                    Button { router.push(.credits) } label: {
                        Text("Comenzar")
                            .font(.system(size: 17, weight: .heavy))
                            .foregroundStyle(VColor.primaryDark)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 17)
                            .background(Color.white)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                            .shadow(color: Color(hex: "0b1220", opacity: 0.18), radius: 26, x: 0, y: 12)
                    }.buttonStyle(.plain)

                    Button { router.push(.patientSelect) } label: {
                        Text("Ya tengo un paciente registrado")
                            .font(.system(size: 14.5, weight: .heavy))
                            .foregroundStyle(.white)
                            .padding(.vertical, 8)
                    }.buttonStyle(.plain)

                    HStack(spacing: 6) {
                        Text("🔒").font(.system(size: 11))
                        Text("Datos cifrados en el dispositivo · RGPD / HIPAA")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(Color.white.opacity(0.72))
                    }
                    .padding(.top, 2)
                }
                .padding(.horizontal, 28)
                .padding(.bottom, 28)
                .opacity(appear ? 1 : 0)
                .offset(y: appear ? 0 : 18)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.5)) { appear = true }
            withAnimation(.easeInOut(duration: 1.9).repeatForever(autoreverses: true)) { float = true }
            withAnimation(.easeOut(duration: 2.2).repeatForever(autoreverses: false)) { halo = true }
        }
    }
}
