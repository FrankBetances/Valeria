//
//  ValeriaApp.swift
//  Valeria
//
//  Punto de entrada nativo (@main) del port iOS de Valeria+.
//

import SwiftUI
import UIKit
import FirebaseCore

/// AppDelegate responsable del arranque de servicios nativos (Firebase).
///
/// La inicialización de Firebase es DEFENSIVA a propósito: solo se ejecuta si
/// `GoogleService-Info.plist` está presente en el bundle. Esto permite iterar
/// visualmente en simulador y dispositivo físico ANTES de que el equipo añada
/// el plist de credenciales, sin provocar crashes en el arranque.
final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        Self.configureFirebaseIfAvailable()
        return true
    }

    /// Configura Firebase únicamente si el plist de credenciales está en el bundle.
    static func configureFirebaseIfAvailable() {
        guard Bundle.main.url(forResource: "GoogleService-Info", withExtension: "plist") != nil else {
            #if DEBUG
            print("⚠️ [Valeria] GoogleService-Info.plist ausente · Firebase NO inicializado (modo iteración visual).")
            #endif
            return
        }
        FirebaseApp.configure()
        #if DEBUG
        print("✅ [Valeria] Firebase inicializado.")
        #endif
    }
}

@main
struct ValeriaApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}
