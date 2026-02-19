//
//  ProjectsListView.swift
//  VemakinApp-IOS
//
//  Projects List
//

import SwiftUI
import SwiftData

struct ProjectsListView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.colorScheme) private var colorScheme
    @Query private var projects: [LocalProject]
    @State private var showAddProject = false
    @State private var newProjectName = ""
    @State private var newProjectDescription = ""
    
    var body: some View {
        List {
            ForEach(projects) { project in
                NavigationLink(destination: ProjectDetailView(project: project)) {
                    ProjectRow(project: project)
                }
            }
            .onDelete(perform: deleteProjects)
        }
        .navigationTitle("Projets")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showAddProject = true }) {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showAddProject) {
            NavigationView {
                Form {
                    Section("Informations") {
                        TextField("Nom du projet", text: $newProjectName)
                        TextField("Description (optionnelle)", text: $newProjectDescription)
                    }
                }
                .navigationTitle("Nouveau projet")
                .navigationBarItems(
                    leading: Button("Annuler") { showAddProject = false },
                    trailing: Button("Créer") {
                        addProject()
                        showAddProject = false
                    }
                    .disabled(newProjectName.isEmpty)
                )
            }
        }
    }
    
    private func addProject() {
        let project = LocalProject(
            id: UUID().uuidString,
            userId: UserModeManager.shared.currentUserId,
            name: newProjectName
        )
        project.projectDescription = newProjectDescription.isEmpty ? nil : newProjectDescription
        modelContext.insert(project)
        
        newProjectName = ""
        newProjectDescription = ""
    }
    
    private func deleteProjects(offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(projects[index])
        }
    }
}

struct ProjectRow: View {
    let project: LocalProject
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(project.name)
                .font(.headline)
            
            if let desc = project.projectDescription {
                Text(desc)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }
            
            HStack {
                Label("\(project.shots?.count ?? 0)", systemImage: "camera")
                    .font(.caption)
                Label("\(project.tasks?.count ?? 0)", systemImage: "checkmark.circle")
                    .font(.caption)
            }
            .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

struct ProjectDetailView: View {
    let project: LocalProject
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @State private var isEditing = false
    @State private var editedName = ""
    @State private var editedDescription = ""
    
    var body: some View {
        ScrollView {
            VStack(spacing: VSpacing.xl) {
                if isEditing {
                    VCard {
                        VStack(spacing: VSpacing.lg) {
                            VTextField(
                                title: "Nom",
                                placeholder: "Nom du projet",
                                text: $editedName
                            )
                            
                            VTextField(
                                title: "Description",
                                placeholder: "Description (optionnelle)",
                                text: $editedDescription
                            )
                            
                            HStack {
                                VButton(
                                    title: "Annuler",
                                    style: .ghost,
                                    size: .medium
                                ) {
                                    isEditing = false
                                }
                                
                                VButton(
                                    title: "Sauvegarder",
                                    style: .primary,
                                    size: .medium
                                ) {
                                    saveChanges()
                                }
                            }
                        }
                    }
                } else {
                    VCard(variant: .glass) {
                        VStack(alignment: .leading, spacing: VSpacing.md) {
                            Text(project.name)
                                .font(VTypography.title)
                            
                            if let desc = project.projectDescription {
                                Text(desc)
                                    .font(VTypography.body)
                                    .foregroundColor(VColors.textMuted)
                            }
                            
                            HStack(spacing: VSpacing.xl) {
                                StatItem(icon: "camera", value: "\(project.shots?.count ?? 0)", label: "Plans")
                                StatItem(icon: "checkmark.circle", value: "\(project.tasks?.count ?? 0)", label: "Tâches")
                                StatItem(icon: "note.text", value: "\(project.notes?.count ?? 0)", label: "Notes")
                            }
                            .padding(.top, VSpacing.md)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                
                // Quick Actions
                VStack(alignment: .leading, spacing: VSpacing.lg) {
                    Text("Actions rapides")
                        .font(VTypography.title3)
                    
                    HStack(spacing: VSpacing.md) {
                        QuickActionButton(icon: "camera.fill", title: "Ajouter un plan", color: .purple) {
                            // Navigate to add shot
                        }
                        
                        QuickActionButton(icon: "checkmark.circle.fill", title: "Ajouter une tâche", color: .green) {
                            // Navigate to add task
                        }
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Détails du projet")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(isEditing ? "Terminé" : "Modifier") {
                    if isEditing {
                        isEditing = false
                    } else {
                        editedName = project.name
                        editedDescription = project.projectDescription ?? ""
                        isEditing = true
                    }
                }
            }
        }
    }
    
    private func saveChanges() {
        project.name = editedName
        project.projectDescription = editedDescription.isEmpty ? nil : editedDescription
        project.updatedAt = Date()
        isEditing = false
    }
}

struct StatItem: View {
    let icon: String
    let value: String
    let label: String
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
            Text(value)
                .font(.headline)
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

struct QuickActionButton: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VCard(variant: .flat) {
                VStack(spacing: VSpacing.sm) {
                    Image(systemName: icon)
                        .font(.title2)
                        .foregroundColor(color)
                    Text(title)
                        .font(VTypography.subheadline)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
}
