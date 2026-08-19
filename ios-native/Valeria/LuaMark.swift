//
//  LuaMark.swift
//  Valeria
//
//  Lúa, la gata · pinta las dos poses que genera scripts/build-brand-assets.js
//  desde la rejilla de src/ValeriaCatPixel.tsx.
//
//  Sustituye a BearMark: el oso pardo lo retiró Frank el 9/8/2026 y este port
//  seguía dibujándolo meses después, porque SwiftUI no lee la rejilla y nadie
//  regeneraba nada aquí. Ahora las dos superficies —la app de React Native y
//  este port— salen del MISMO sprite: si cambia la rejilla, `npm run
//  build:brand` reescribe estos PNG y no hay una segunda mascota que mantener.
//
//  No dibujes la gata a mano en Swift: sería la tercera fuente de verdad, que
//  es justo lo que el gate check-lua-mascot-mirror.js existe para impedir.
//

import SwiftUI

enum LuaPose { case head, sit }

/// Por debajo de este ancho el cuerpo entero deja la cara en menos de 30 px y
/// se emborrona. Mismo umbral que `HEAD_BELOW` en ValeriaCatPixel.tsx.
private let headBelow: CGFloat = 90

struct LuaMark: View {
    var size: CGFloat = 96
    /// Por omisión la elige el tamaño: cabeza si es pequeño, cuerpo si es grande.
    var pose: LuaPose?

    var body: some View {
        let chosen = pose ?? (size < headBelow ? .head : .sit)
        Image(chosen == .head ? "LuaHead" : "LuaSit")
            .resizable()
            .interpolation(.none)          // píxel art: sin suavizado entre celdas
            .scaledToFit()
            .frame(width: size)
            .accessibilityHidden(true)
    }
}

#Preview {
    HStack(spacing: 24) {
        LuaMark(size: 54)
        LuaMark(size: 104)
    }
    .padding()
    .background(VColor.primary)
}
