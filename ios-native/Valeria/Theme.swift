//
//  Theme.swift
//  Valeria
//
//  Tokens de diseño unificados (V3.0) · port de src/valeriaTheme.ts.
//  Fuente única de verdad para color, radios, tipografía y sombras.
//

import SwiftUI
import UIKit

// MARK: - Color desde hex

extension Color {
    /// Inicializa un Color desde un hex de 6 dígitos ("#00c4be" o "00c4be").
    init(hex: String, opacity: Double = 1) {
        let s = hex.hasPrefix("#") ? String(hex.dropFirst()) : hex
        var rgb: UInt64 = 0
        Scanner(string: s).scanHexInt64(&rgb)
        self.init(
            .sRGB,
            red: Double((rgb >> 16) & 0xFF) / 255,
            green: Double((rgb >> 8) & 0xFF) / 255,
            blue: Double(rgb & 0xFF) / 255,
            opacity: opacity
        )
    }
}

// MARK: - Paleta de marca

enum VColor {
    static let primary      = Color(hex: "00c4be") // Turquesa marca Valeria
    static let primaryDark  = Color(hex: "00a39e") // Hover / activos
    static let primaryLight = Color(hex: "e6f9f8") // Fondo destacado
    static let primaryTint  = Color(hex: "f0fdf9") // Fondo muy suave (instrucciones)
    static let pageBg       = Color(hex: "f6fafa") // Fondo de página
    static let card         = Color(hex: "ffffff")
    static let border       = Color(hex: "e9eeee")
    static let borderActive = Color(hex: "cdeeec")
    static let textPrimary  = Color(hex: "1f2937")
    static let textSecondary = Color(hex: "4b5563")
    static let textMuted    = Color(hex: "9aa6a5")
    static let error        = Color(hex: "ef4444")
    static let errorBg      = Color(hex: "fff1f2")
    static let success      = Color(hex: "10b981")
    static let successBg    = Color(hex: "eafaf2")
    static let star         = Color(hex: "facc15")
    static let dark         = Color(hex: "0b1220")
}

// MARK: - Radios

enum VRadius {
    static let card: CGFloat = 16
    static let field: CGFloat = 12
    static let button: CGFloat = 14
    static let pill: CGFloat = 14
}

// MARK: - Sombras reutilizables

extension View {
    /// Sombra suave de tarjeta.
    func vCardShadow() -> some View {
        shadow(color: Color(hex: "0f172a", opacity: 0.08), radius: 10, x: 0, y: 2)
    }

    /// Sombra turquesa de botón primario.
    func vButtonShadow() -> some View {
        shadow(color: Color(hex: "00c4be", opacity: 0.32), radius: 12, x: 0, y: 8)
    }
}

// MARK: - Cabecera turquesa reutilizable (esquinas inferiores redondeadas)

struct VHeader<Content: View>: View {
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 22)
        .padding(.top, 18)
        .padding(.bottom, 16)
        .background(VColor.primary)
        .clipShape(BottomRoundedRectangle(radius: 26))
    }
}

/// Rectángulo con solo las dos esquinas inferiores redondeadas.
struct BottomRoundedRectangle: Shape {
    var radius: CGFloat = 26
    func path(in rect: CGRect) -> Path {
        Path(
            UIBezierPath(
                roundedRect: rect,
                byRoundingCorners: [.bottomLeft, .bottomRight],
                cornerRadii: CGSize(width: radius, height: radius)
            ).cgPath
        )
    }
}

/// Píldora "‹ Volver" translúcida usada en las cabeceras.
struct BackPill: View {
    var label: String = "‹ Volver"
    var action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 12, weight: .heavy))
                .foregroundStyle(.white)
                .padding(.horizontal, 11)
                .padding(.vertical, 5)
                .background(Color.white.opacity(0.18))
                .overlay(
                    RoundedRectangle(cornerRadius: 11)
                        .stroke(Color.white.opacity(0.32), lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: 11))
        }
        .buttonStyle(.plain)
    }
}
