//
//  ProPin.swift
//  Valeria
//
//  Píldora "Desbloquear Edición Profesional" + modal de PIN · port de
//  src/ValeriaProPin.tsx. Validación por hash SHA-256 (CryptoKit nativo, sin
//  texto plano). PIN maestro de demostración: 1985.
//

import SwiftUI
import CryptoKit

// "1985" en SHA-256.
private let MASTER_PIN_HASH = "78e370b587b145920213731b7c7c725e512b3b6577c51c800218a7c764c532ae"

private func sha256Hex(_ s: String) -> String {
    let digest = SHA256.hash(data: Data(s.utf8))
    return digest.map { String(format: "%02x", $0) }.joined()
}

// MARK: - Píldora de estado

struct ProUnlockPill: View {
    var unlocked: Bool
    var onPress: () -> Void

    var body: some View {
        Button { if !unlocked { onPress() } } label: {
            HStack(spacing: 9) {
                Text(unlocked ? "🔓" : "🔒").font(.system(size: 15))
                Text(unlocked ? "Modo profesional activo" : "Desbloquear Edición Profesional")
                    .font(.system(size: 14, weight: .heavy))
                    .foregroundStyle(unlocked ? Color(hex: "0a7d54") : VColor.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                if !unlocked {
                    Text("›").font(.system(size: 16)).foregroundStyle(VColor.textMuted)
                }
            }
            .padding(13)
            .background(unlocked ? VColor.successBg : VColor.card)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(unlocked ? Color(hex: "bfe9d4") : VColor.border, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .vCardShadow()
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Modal de PIN

struct ProPinModal: View {
    @Binding var isPresented: Bool
    var subtitle: String = "Introduce el PIN de 4 dígitos del logopeda para editar la prescripción."
    var onUnlock: () -> Void

    @State private var pin = ""
    @State private var pinErr = false

    var body: some View {
        ZStack {
            Color(hex: "0b1220", opacity: 0.55).ignoresSafeArea()
                .onTapGesture { close() }

            VStack(spacing: 0) {
                HStack {
                    Text("🔐").font(.system(size: 20))
                        .frame(width: 42, height: 42)
                        .background(VColor.primaryLight)
                        .clipShape(RoundedRectangle(cornerRadius: 13))
                    Spacer()
                    Button { close() } label: {
                        Text("✕").foregroundStyle(Color(hex: "6b7280")).fontWeight(.bold)
                            .frame(width: 30, height: 30)
                            .background(Color(hex: "f1f5f4"))
                            .clipShape(Circle())
                    }.buttonStyle(.plain)
                }

                Text("Modo Profesional")
                    .font(.system(size: 20, weight: .heavy))
                    .foregroundStyle(VColor.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, 12)
                Text(subtitle)
                    .font(.system(size: 13.5, weight: .semibold))
                    .foregroundStyle(VColor.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, 4)

                HStack(spacing: 13) {
                    ForEach(0..<4, id: \.self) { i in
                        let filled = i < pin.count
                        Circle()
                            .fill(pinErr ? Color(hex: "fecdd3") : (filled ? VColor.primary : Color.white))
                            .overlay(Circle().stroke(filled || pinErr ? .clear : Color(hex: "d8dedd"), lineWidth: 2))
                            .frame(width: 16, height: 16)
                    }
                }
                .padding(.top, 22).padding(.bottom, 6)

                Text("PIN incorrecto. Inténtalo de nuevo.")
                    .font(.system(size: 12.5, weight: .heavy))
                    .foregroundStyle(VColor.error)
                    .opacity(pinErr ? 1 : 0)
                    .frame(height: 18)

                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 11), count: 3), spacing: 11) {
                    ForEach(1...9, id: \.self) { d in key("\(d)") }
                    Color.clear.frame(height: 56)
                    key("0")
                    Button { pin = String(pin.dropLast()) } label: {
                        Text("⌫").font(.system(size: 20)).foregroundStyle(Color(hex: "6b7280"))
                            .frame(maxWidth: .infinity, minHeight: 56)
                            .background(Color.white)
                            .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(hex: "eef2f1"), lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                    }.buttonStyle(.plain)
                }
                .padding(.top, 14)

                Text("PIN de demostración: 1985")
                    .font(.system(size: 11, weight: .heavy))
                    .foregroundStyle(Color(hex: "c2cbca"))
                    .padding(.top, 16)
            }
            .padding(22)
            .frame(maxWidth: 320)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 24))
            .padding(24)
        }
    }

    private func key(_ d: String) -> some View {
        Button { press(d) } label: {
            Text(d)
                .font(.system(size: 24, weight: .semibold))
                .foregroundStyle(VColor.textPrimary)
                .frame(maxWidth: .infinity, minHeight: 56)
                .background(VColor.pageBg)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(hex: "eef2f1"), lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 16))
        }.buttonStyle(.plain)
    }

    private func press(_ d: String) {
        guard pin.count < 4 else { return }
        pin += d; pinErr = false
        if pin.count == 4 {
            if sha256Hex(pin) == MASTER_PIN_HASH {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.18) {
                    pin = ""; pinErr = false; onUnlock(); isPresented = false
                }
            } else {
                pinErr = true
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { pin = "" }
            }
        }
    }

    private func close() { pin = ""; pinErr = false; isPresented = false }
}
