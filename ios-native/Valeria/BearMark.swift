//
//  BearMark.swift
//  Valeria
//
//  Mascota / marca del oso · port de src/ValeriaBearLogo.tsx (react-native-svg).
//  Dibuja el oso dentro de un viewBox 200×200 usando Canvas. Variantes brown
//  (marca), white (sobre turquesa) y teal.
//

import SwiftUI

enum BearVariant { case brown, white, teal }

private struct BearPalette {
    var body: Color
    var innerEar: Color
    var muzzle: Color
    var features: Color
    var cheeks: Color?
    var highlight: Color?
}

private func palette(_ v: BearVariant) -> BearPalette {
    switch v {
    case .brown:
        return BearPalette(
            body: Color(hex: "a9744f"),
            innerEar: Color(hex: "f3ddba"),
            muzzle: Color(hex: "f6e8d2"),
            features: Color(hex: "3d2a1a"),
            cheeks: Color(hex: "e29873", opacity: 0.47),
            highlight: .white
        )
    case .teal:
        return BearPalette(
            body: VColor.primary,
            innerEar: .white,
            muzzle: Color.white.opacity(0.85),
            features: .white,
            cheeks: nil,
            highlight: nil
        )
    case .white:
        return BearPalette(
            body: .white,
            innerEar: Color(hex: "bff0ed"),
            muzzle: VColor.primaryLight,
            features: VColor.dark,
            cheeks: nil,
            highlight: .white
        )
    }
}

/// El oso, sin fondo, dibujado a partir del viewBox 200×200 del original.
struct BearMark: View {
    var size: CGFloat = 120
    var variant: BearVariant = .brown

    var body: some View {
        let p = palette(variant)
        Canvas { ctx, canvasSize in
            let k = canvasSize.width / 200.0
            func circle(_ cx: CGFloat, _ cy: CGFloat, _ r: CGFloat, _ color: Color) {
                let rect = CGRect(x: (cx - r) * k, y: (cy - r) * k, width: 2 * r * k, height: 2 * r * k)
                ctx.fill(Path(ellipseIn: rect), with: .color(color))
            }
            func ellipse(_ cx: CGFloat, _ cy: CGFloat, _ rx: CGFloat, _ ry: CGFloat, _ color: Color) {
                let rect = CGRect(x: (cx - rx) * k, y: (cy - ry) * k, width: 2 * rx * k, height: 2 * ry * k)
                ctx.fill(Path(ellipseIn: rect), with: .color(color))
            }

            // orejas
            circle(74, 74, 37, p.body)
            circle(126, 74, 37, p.body)
            circle(74, 78, 17, p.innerEar)
            circle(126, 78, 17, p.innerEar)
            // cabeza
            ellipse(100, 118, 83, 75, p.body)
            // rubor
            if let cheeks = p.cheeks {
                ellipse(54, 136, 12, 8, cheeks)
                ellipse(146, 136, 12, 8, cheeks)
            }
            // ojos
            ellipse(84, 108, 9.5, 11.5, p.features)
            ellipse(116, 108, 9.5, 11.5, p.features)
            if let hl = p.highlight {
                circle(81, 104, 3, hl)
                circle(113, 104, 3, hl)
            }
            // hocico
            ellipse(100, 142, 35, 25, p.muzzle)
            ellipse(100, 128, 10, 7, p.features)
        }
        .frame(width: size, height: size)
    }
}

/// Icono de la app: oso pardo sobre squircle turquesa con degradado y brillo.
struct AppIconTile: View {
    var size: CGFloat = 120

    var body: some View {
        let r = size * 0.225
        ZStack {
            LinearGradient(
                colors: [Color(hex: "16d3cc"), VColor.primary, Color(hex: "00a8a2")],
                startPoint: .top, endPoint: .bottom
            )
            Circle()
                .fill(Color.white.opacity(0.16))
                .frame(width: size * 0.92, height: size * 0.92)
                .offset(x: -size * 0.18, y: -size * 0.22)
            BearMark(size: size * 0.78, variant: .brown)
        }
        .frame(width: size, height: size)
        .clipShape(RoundedRectangle(cornerRadius: r, style: .continuous))
        .shadow(color: Color(hex: "009690", opacity: 0.34), radius: 26, x: 0, y: 14)
    }
}

#Preview {
    HStack(spacing: 24) {
        BearMark(size: 104, variant: .brown)
        AppIconTile(size: 104)
    }
    .padding()
    .background(VColor.primary)
}
