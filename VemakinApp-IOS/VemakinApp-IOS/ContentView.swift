//
//  ContentView.swift
//  VemakinApp-IOS
//
//  Main Content View with routing
//

import SwiftUI
import SwiftData

struct ContentView: View {
    @State private var userModeManager = UserModeManager.shared
    @State private var appState = AppState.shared
    @Environment(\.modelContext) private var modelContext
    
    var body: some View {
        Group {
            if appState.isShowingWelcome {
                WelcomeView(onLocalModeSelected: handleLocalModeSelected)
            } else {
                MainTabView()
                    .overlay {
                        if userModeManager.currentMode == .migrating {
                            MigrationOverlay()
                        }
                    }
            }
        }
        .onAppear(perform: seedCatalog)
    }
    
    private func seedCatalog() {
        CatalogSeeder.shared.seedIfNeeded(in: modelContext)
    }
    
    private func handleLocalModeSelected() {
        userModeManager.switchToLocalMode()
        let user = LocalUser(id: userModeManager.currentUserId)
        modelContext.insert(user)
        appState.isShowingWelcome = false
    }
}

struct MigrationOverlay: View {
    var body: some View {
        ZStack {
            Color.black.opacity(0.5)
                .ignoresSafeArea()
            
            VCard(variant: .elevated) {
                VStack(spacing: VSpacing.lg) {
                    ProgressView()
                        .scaleEffect(1.5)
                    
                    Text("Migration en cours...")
                        .font(VTypography.headline)
                    
                    Text("Veuillez patienter pendant que nous synchronisez vos données.")
                        .font(VTypography.subheadline)
                        .foregroundColor(VColors.textMuted)
                        .multilineTextAlignment(.center)
                }
                .padding()
            }
            .frame(maxWidth: 300)
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(for: LocalUser.self, inMemory: true)
}
