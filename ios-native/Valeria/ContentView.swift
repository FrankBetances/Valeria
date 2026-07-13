//
//  ContentView.swift
//  Valeria
//
//  Pantalla raíz placeholder del port nativo. Punto de partida para iterar
//  usabilidad de las pantallas en dispositivo físico vía Firebase App Distribution.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Color.accentColor.opacity(0.08).ignoresSafeArea()

            VStack(spacing: 16) {
                Image(systemName: "waveform.circle.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 96, height: 96)
                    .foregroundStyle(Color.accentColor)

                Text("Valeria+")
                    .font(.largeTitle.bold())

                Text("Port nativo iOS · iteración de usabilidad")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding()
        }
    }
}

#Preview {
    ContentView()
}
