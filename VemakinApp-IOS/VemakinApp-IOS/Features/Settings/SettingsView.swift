//
//  SettingsView.swift
//  VemakinApp-IOS
//
//  Settings Screen with Export/Import functionality
//

import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.modelContext) private var modelContext
    @Query private var projects: [LocalProject]
    @Query private var shots: [LocalShot]
    @Query private var equipment: [LocalEquipment]
    @Query private var tasks: [LocalTask]
    @Query private var notes: [LocalNote]
    
    @State private var showExportConfirmation = false
    @State private var showImportConfirmation = false
    @State private var showClearConfirmation = false
    @State private var showCloudMigration = false
    @State private var showFilePicker = false
    @State private var showSuccessAlert = false
    @State private var showErrorAlert = false
    @State private var successMessage = ""
    @State private var errorMessage = ""
    @State private var isExporting = false
    @State private var isImporting = false
    
    var userModeManager = UserModeManager.shared
    
    var body: some View {
        NavigationView {
            List {
                // Mode Section
                Section {
                    if userModeManager.isLocalMode {
                        LocalModeSection(
                            onMigrateToCloud: { showCloudMigration = true }
                        )
                    } else {
                        CloudModeSection()
                    }
                } header: {
                    Text("MODE")
                }
                
                // Data Section
                Section {
                    DataStatsRow(
                        projects: projects.count,
                        shots: shots.count,
                        equipment: equipment.count,
                        tasks: tasks.count,
                        notes: notes.count
                    )
                    
                    Button(action: { showExportConfirmation = true }) {
                        HStack {
                            Image(systemName: "square.and.arrow.up")
                            if isExporting {
                                ProgressView()
                                    .scaleEffect(0.8)
                            }
                            Text("Exporter les données")
                        }
                    }
                    .disabled(isExporting)
                    
                    Button(action: { showImportConfirmation = true }) {
                        HStack {
                            Image(systemName: "square.and.arrow.down")
                            if isImporting {
                                ProgressView()
                                    .scaleEffect(0.8)
                            }
                            Text("Importer des données")
                        }
                    }
                    .disabled(isImporting)
                    
                    Button(action: { showClearConfirmation = true }) {
                        HStack {
                            Image(systemName: "trash")
                            Text("Effacer toutes les données")
                        }
                        .foregroundColor(VColors.danger)
                    }
                } header: {
                    Text("DONNÉES LOCALES")
                }
                
                // Preferences Section
                Section {
                    Toggle("Mode sombre", isOn: .constant(colorScheme == .dark))
                    Toggle("Notifications", isOn: .constant(true))
                } header: {
                    Text("PRÉFÉRENCES")
                }
                
                // About Section
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(VColors.textMuted)
                    }
                    
                    Link("Conditions d'utilisation", destination: URL(string: "https://vemakin.com/terms")!)
                    Link("Politique de confidentialité", destination: URL(string: "https://vemakin.com/privacy")!)
                } header: {
                    Text("À PROPOS")
                }
            }
            .navigationTitle("Paramètres")
            .alert("Exporter les données", isPresented: $showExportConfirmation) {
                Button("Annuler", role: .cancel) {}
                Button("Exporter") {
                    exportData()
                }
            } message: {
                Text("Cela créera un fichier JSON avec toutes vos données. Vous pourrez le partager ou le sauvegarder.")
            }
            .alert("Importer des données", isPresented: $showImportConfirmation) {
                Button("Annuler", role: .cancel) {}
                Button("Choisir un fichier") {
                    showFilePicker = true
                }
            } message: {
                Text("Cela remplacera vos données actuelles. Assurez-vous d'avoir un backup.")
            }
            .alert("Effacer les données", isPresented: $showClearConfirmation) {
                Button("Annuler", role: .cancel) {}
                Button("Effacer", role: .destructive) {
                    clearAllData()
                }
            } message: {
                Text("Cette action est irréversible. Toutes vos données seront supprimées.")
            }
            .alert("Succès", isPresented: $showSuccessAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(successMessage)
            }
            .alert("Erreur", isPresented: $showErrorAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
            .sheet(isPresented: $showCloudMigration) {
                CloudMigrationView()
            }
            .fileImporter(
                isPresented: $showFilePicker,
                allowedContentTypes: [.json],
                allowsMultipleSelection: false
            ) { result in
                handleFileImport(result: result)
            }
        }
    }
    
    private func exportData() {
        isExporting = true
        
        Task {
            do {
                let url = try await DataExportService.shared.exportToJSON(from: modelContext)
                
                // Present share sheet
                await MainActor.run {
                    isExporting = false
                    showShareSheet(url: url)
                }
            } catch {
                await MainActor.run {
                    isExporting = false
                    errorMessage = "Erreur lors de l'export: \(error.localizedDescription)"
                    showErrorAlert = true
                }
            }
        }
    }
    
    private func importData(from url: URL) {
        isImporting = true
        
        Task {
            do {
                try await DataExportService.shared.importFromJSON(url, to: modelContext)
                
                await MainActor.run {
                    isImporting = false
                    successMessage = "Données importées avec succès !"
                    showSuccessAlert = true
                }
            } catch {
                await MainActor.run {
                    isImporting = false
                    errorMessage = "Erreur lors de l'import: \(error.localizedDescription)"
                    showErrorAlert = true
                }
            }
        }
    }
    
    private func handleFileImport(result: Result<[URL], Error>) {
        switch result {
        case .success(let urls):
            if let url = urls.first {
                // Start accessing security-scoped resource
                guard url.startAccessingSecurityScopedResource() else {
                    errorMessage = "Impossible d'accéder au fichier"
                    showErrorAlert = true
                    return
                }
                
                importData(from: url)
                
                // Stop accessing
                url.stopAccessingSecurityScopedResource()
            }
        case .failure(let error):
            errorMessage = "Erreur: \(error.localizedDescription)"
            showErrorAlert = true
        }
    }
    
    private func showShareSheet(url: URL) {
        // In a real app, you'd use UIActivityViewController
        // For now, just show success
        successMessage = "Export créé ! Le fichier est disponible dans le dossier temporaire."
        showSuccessAlert = true
    }
    
    private func clearAllData() {
        for project in projects {
            modelContext.delete(project)
        }
        for item in shots {
            modelContext.delete(item)
        }
        for item in equipment {
            modelContext.delete(item)
        }
        for item in tasks {
            modelContext.delete(item)
        }
        for item in notes {
            modelContext.delete(item)
        }
        
        successMessage = "Toutes les données ont été effacées."
        showSuccessAlert = true
    }
}

struct LocalModeSection: View {
    let onMigrateToCloud: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: VSpacing.md) {
            HStack {
                Image(systemName: "iphone")
                    .font(.title2)
                    .foregroundColor(VColors.primary)
                
                VStack(alignment: .leading) {
                    Text("Mode Local")
                        .font(VTypography.headline)
                    Text("Vos données sont stockées uniquement sur cet appareil")
                        .font(VTypography.caption)
                        .foregroundColor(VColors.textMuted)
                }
            }
            
            VButton(
                title: "Passer en mode Cloud",
                style: .secondary,
                size: .medium
            ) {
                onMigrateToCloud()
            }
        }
        .padding(.vertical, VSpacing.sm)
    }
}

struct CloudModeSection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: VSpacing.md) {
            HStack {
                Image(systemName: "icloud")
                    .font(.title2)
                    .foregroundColor(VColors.primary)
                
                VStack(alignment: .leading) {
                    Text("Mode Cloud")
                        .font(VTypography.headline)
                    Text("user@example.com")
                        .font(VTypography.caption)
                        .foregroundColor(VColors.textMuted)
                }
            }
            
            HStack {
                Text("Dernière synchro: Il y a 5 min")
                    .font(VTypography.caption)
                    .foregroundColor(VColors.textMuted)
                
                Spacer()
                
                Button("Synchroniser") {
                    // Trigger sync
                }
                .font(VTypography.subheadline)
                .foregroundColor(VColors.primary)
            }
            
            VButton(
                title: "Se déconnecter",
                style: .ghost,
                size: .medium
            ) {
                // Handle logout
            }
        }
        .padding(.vertical, VSpacing.sm)
    }
}

struct DataStatsRow: View {
    let projects: Int
    let shots: Int
    let equipment: Int
    let tasks: Int
    let notes: Int
    
    var body: some View {
        VStack(spacing: VSpacing.md) {
            HStack {
                StatItemCompact(icon: "folder", value: projects, label: "Projets")
                StatItemCompact(icon: "camera", value: shots, label: "Plans")
            }
            HStack {
                StatItemCompact(icon: "cube.box", value: equipment, label: "Matériel")
                StatItemCompact(icon: "checkmark.circle", value: tasks, label: "Tâches")
            }
            HStack {
                StatItemCompact(icon: "note.text", value: notes, label: "Notes")
                Spacer()
            }
        }
        .padding(.vertical, VSpacing.sm)
    }
}

struct StatItemCompact: View {
    let icon: String
    let value: Int
    let label: String
    
    var body: some View {
        HStack(spacing: VSpacing.sm) {
            Image(systemName: icon)
                .foregroundColor(VColors.primary)
            Text("\(value)")
                .font(VTypography.headline)
            Text(label)
                .font(VTypography.caption)
                .foregroundColor(VColors.textMuted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct CloudMigrationView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: VSpacing.xl) {
                Image(systemName: "icloud.and.arrow.up")
                    .font(.system(size: 80))
                    .foregroundColor(VColors.primary)
                
                Text("Migration vers le Cloud")
                    .font(VTypography.title)
                
                Text("Vos données locales seront synchronisées avec votre compte cloud.")
                    .font(VTypography.body)
                    .foregroundColor(VColors.textMuted)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                
                VStack(spacing: VSpacing.md) {
                    VButton(
                        title: "Commencer la migration",
                        style: .primary,
                        size: .large
                    ) {
                        // Start migration
                        dismiss()
                    }
                    
                    VButton(
                        title: "Annuler",
                        style: .ghost,
                        size: .medium
                    ) {
                        dismiss()
                    }
                }
                .padding(.horizontal)
                
                Spacer()
            }
            .padding()
            .navigationBarItems(trailing: Button("Fermer") { dismiss() })
        }
    }
}
