//
//  RootView.swift
//  Valeria
//
//  Host de navegación del port nativo. Reproduce el stack del AppNavigator RN:
//    Welcome → Credits → (PatientSelect | Ficha) → ExerciseSelection
//            → LingTest → ExercisePlayer → Results
//  Las cabeceras propias de cada pantalla ocultan la barra de navegación nativa.
//

import SwiftUI

// MARK: - Rutas

enum Route: Hashable {
    case credits
    case patientSelect
    case ficha
    case exerciseSelection
    case lingTest(ids: [String])
    case exercisePlayer(ids: [String])
    case minimalPairs
    case semanticExpansion
    case results
}

// MARK: - Router

final class Router: ObservableObject {
    @Published var path: [Route] = []

    func push(_ route: Route) { path.append(route) }
    func pop() { if !path.isEmpty { path.removeLast() } }
    func popToRoot() { path.removeAll() }
}

// MARK: - Root

struct RootView: View {
    @StateObject private var model = AppModel()
    @StateObject private var router = Router()

    var body: some View {
        NavigationStack(path: $router.path) {
            WelcomeView()
                .navigationBarBackButtonHidden(true)
                .navigationDestination(for: Route.self) { route in
                    destination(for: route)
                        .navigationBarBackButtonHidden(true)
                        .toolbar(.hidden, for: .navigationBar)
                }
        }
        .environmentObject(model)
        .environmentObject(router)
        .tint(VColor.primary)
    }

    @ViewBuilder
    private func destination(for route: Route) -> some View {
        switch route {
        case .credits:            CreditsView()
        case .patientSelect:      PatientSelectView()
        case .ficha:              FichaRegistroView()
        case .exerciseSelection:  ExerciseSelectionView()
        case .lingTest(let ids):  LingTestView(sessionIds: ids)
        case .exercisePlayer(let ids): ExercisePlayerView(sessionIds: ids)
        case .minimalPairs:       MinimalPairsView()
        case .semanticExpansion:  SemanticExpansionView()
        case .results:            ResultsDashboardView()
        }
    }
}

#Preview {
    RootView()
}
