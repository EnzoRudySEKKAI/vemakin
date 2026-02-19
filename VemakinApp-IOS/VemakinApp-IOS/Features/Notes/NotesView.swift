//
//  NotesView.swift
//  VemakinApp-IOS
//
//  Notes List - Updated to match Web Frontend
//

import SwiftUI
import SwiftData

struct NotesView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.colorScheme) private var colorScheme
    @Query private var notes: [LocalNote]
    @Query private var shots: [LocalShot]
    @Query private var tasks: [LocalTask]
    @State private var showAddNote = false
    @State private var searchText = ""
    @State private var selectedCategory: NoteCategoryFilter = .all
    @State private var sortBy: NoteSortOption = .updated
    
    enum NoteCategoryFilter: String, CaseIterable {
        case all = "All"
        case shots = "Shots"
        case general = "General"
        case script = "Script"
        case editing = "Editing"
        case sound = "Sound"
        case vfx = "VFX"
        case color = "Color"
    }
    
    enum NoteSortOption: String, CaseIterable {
        case updated = "Updated"
        case created = "Created"
        case alpha = "Name"
    }
    
    // MARK: - Filtered & Sorted Notes
    var filteredNotes: [LocalNote] {
        var filtered = notes
        
        // Search filter
        if !searchText.isEmpty {
            filtered = filtered.filter {
                $0.title.localizedCaseInsensitiveContains(searchText) ||
                $0.content.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // Category filter
        switch selectedCategory {
        case .all:
            break
        case .shots:
            filtered = filtered.filter { $0.shotId != nil }
        case .general:
            filtered = filtered.filter { $0.shotId == nil && $0.taskId == nil }
        case .script, .editing, .sound, .vfx, .color:
            let category = selectedCategory.rawValue
            filtered = filtered.filter { note in
                if let taskId = note.taskId,
                   let task = tasks.first(where: { $0.id == taskId }) {
                    return task.category == category
                }
                return false
            }
        }
        
        return filtered
    }
    
    var sortedNotes: [LocalNote] {
        switch sortBy {
        case .updated:
            return filteredNotes.sorted { $0.updatedAt > $1.updatedAt }
        case .created:
            return filteredNotes.sorted { $0.createdAt > $1.createdAt }
        case .alpha:
            return filteredNotes.sorted { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending }
        }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // MARK: - Category Filters
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: VSpacing.sm) {
                        ForEach(NoteCategoryFilter.allCases, id: \.self) { category in
                            NoteCategoryChip(
                                title: category.rawValue,
                                isSelected: selectedCategory == category
                            ) {
                                selectedCategory = category
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, VSpacing.sm)
                }
                
                // MARK: - Search & Sort Bar
                HStack(spacing: VSpacing.md) {
                    // Search
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        TextField("Search notes...", text: $searchText)
                            .font(VTypography.size14)
                    }
                    .padding()
                    .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                    .cornerRadius(VSpacing.radiusLg)
                    .overlay(
                        RoundedRectangle(cornerRadius: VSpacing.radiusLg)
                            .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                    )
                    
                    // Sort Menu
                    Menu {
                        ForEach(NoteSortOption.allCases, id: \.self) { option in
                            Button(action: { sortBy = option }) {
                                Label(option.rawValue, systemImage: sortBy == option ? "checkmark" : "")
                            }
                        }
                    } label: {
                        HStack(spacing: VSpacing.xs) {
                            Image(systemName: "arrow.up.arrow.down")
                            Text(sortBy.rawValue)
                        }
                        .font(VTypography.size12Medium)
                        .foregroundColor(VColors.textSecondaryColor(for: colorScheme))
                        .padding(.horizontal, VSpacing.md)
                        .padding(.vertical, VSpacing.sm)
                        .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                        .cornerRadius(VSpacing.radiusMd)
                        .overlay(
                            RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                                .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                        )
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, VSpacing.md)
                
                // MARK: - Content
                if notes.isEmpty {
                    EmptyNotesView()
                } else if filteredNotes.isEmpty {
                    NoFilteredNotesView()
                } else {
                    ScrollView {
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: VSpacing.md) {
                            ForEach(sortedNotes) { note in
                                NoteGridCard(
                                    note: note,
                                    linkedShot: note.shotId != nil ? shots.first(where: { $0.id == note.shotId }) : nil,
                                    linkedTask: note.taskId != nil ? tasks.first(where: { $0.id == note.taskId }) : nil
                                )
                            }
                        }
                        .padding()
                    }
                }
            }
            .background(VColors.backgroundColor(for: colorScheme))
            .navigationTitle("Notes")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showAddNote = true }) {
                        Image(systemName: "plus")
                            .font(VTypography.size16Semibold)
                    }
                }
            }
            .sheet(isPresented: $showAddNote) {
                AddNoteView()
            }
        }
    }
}

// MARK: - Note Category Chip
struct NoteCategoryChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(VTypography.size12Medium)
                .padding(.horizontal, VSpacing.md)
                .padding(.vertical, VSpacing.sm)
                .background(isSelected ? VColors.primary : (colorScheme == .dark ? VColors.surfaceDark : VColors.surface))
                .foregroundColor(isSelected ? .white : VColors.textSecondaryColor(for: colorScheme))
                .cornerRadius(VSpacing.radiusFull)
                .overlay(
                    RoundedRectangle(cornerRadius: VSpacing.radiusFull)
                        .stroke(
                            isSelected ? VColors.primary : VColors.borderColor(for: colorScheme),
                            lineWidth: 1
                        )
                )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Note Grid Card (Web Style)
struct NoteGridCard: View {
    let note: LocalNote
    let linkedShot: LocalShot?
    let linkedTask: LocalTask?
    @Environment(\.colorScheme) private var colorScheme
    
    var contextIcon: String {
        if linkedShot != nil {
            return "camera.fill"
        } else if linkedTask != nil {
            switch linkedTask?.category {
            case "Script": return "pencil.line"
            case "Editing": return "scissors"
            case "Sound": return "music.note"
            case "VFX": return "layers"
            case "Color": return "paintpalette"
            default: return "bolt.fill"
            }
        }
        return "note.text"
    }
    
    var contextLabel: String {
        if let shot = linkedShot {
            return "Scene \(shot.sceneNumber ?? "--")"
        } else if let task = linkedTask {
            return task.category
        }
        return "General Note"
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: VSpacing.md) {
            // Header with Icon
            HStack(spacing: VSpacing.sm) {
                ZStack {
                    RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                        .fill(colorScheme == .dark ? VColors.backgroundDark : Color.gray.opacity(0.1))
                        .frame(width: 32, height: 32)
                    
                    Image(systemName: contextIcon)
                        .font(VTypography.size14)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                }
                
                Text(contextLabel.uppercased())
                    .font(VTypography.size10)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
                
                Spacer()
            }
            
            // Content
            VStack(alignment: .leading, spacing: VSpacing.xs) {
                Text(note.title)
                    .font(VTypography.size14Medium)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                    .lineLimit(1)
                
                if !note.content.isEmpty {
                    Text(note.content)
                        .font(VTypography.size12)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .lineLimit(2)
                }
            }
            
            // Footer
            HStack {
                HStack(spacing: VSpacing.xs) {
                    Image(systemName: "calendar")
                        .font(VTypography.size10)
                    Text(formatDate(note.updatedAt))
                        .font(VTypography.size10)
                }
                .foregroundColor(VColors.textMutedColor(for: colorScheme).opacity(0.7))
                
                Spacer()
                
                if !note.attachmentUrls.isEmpty {
                    HStack(spacing: VSpacing.xs) {
                        Image(systemName: "paperclip")
                            .font(VTypography.size10)
                        Text("\(note.attachmentUrls.count)")
                            .font(VTypography.size10)
                    }
                    .foregroundColor(VColors.textMutedColor(for: colorScheme).opacity(0.7))
                }
            }
        }
        .padding(VSpacing.md)
        .background(colorScheme == .dark ? VColors.backgroundDark : Color.gray.opacity(0.05))
        .cornerRadius(VSpacing.radiusLg)
        .overlay(
            RoundedRectangle(cornerRadius: VSpacing.radiusLg)
                .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
        )
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: date)
    }
}

// MARK: - Empty Notes View
struct EmptyNotesView: View {
    @Environment(\.colorScheme) private var colorScheme
    @State private var showAddNote = false
    
    var body: some View {
        VStack(spacing: VSpacing.xl) {
            Spacer()
            
            Image(systemName: "note.text")
                .font(.system(size: 60))
                .foregroundColor(VColors.textMutedColor(for: colorScheme))
            
            VStack(spacing: VSpacing.md) {
                Text("No Notes Found")
                    .font(VTypography.title2)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                
                Text("Create your first note to get started.")
                    .font(VTypography.subheadline)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    .multilineTextAlignment(.center)
            }
            
            Button(action: { showAddNote = true }) {
                HStack(spacing: VSpacing.sm) {
                    Image(systemName: "plus")
                    Text("Add Note")
                }
                .font(VTypography.size14Semibold)
                .foregroundColor(.white)
                .padding(.horizontal, VSpacing.xl)
                .padding(.vertical, VSpacing.md)
                .background(VColors.primary)
                .cornerRadius(VSpacing.radiusLg)
            }
            
            Spacer()
        }
        .padding()
        .sheet(isPresented: $showAddNote) {
            AddNoteView()
        }
    }
}

// MARK: - No Filtered Notes View
struct NoFilteredNotesView: View {
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        VStack(spacing: VSpacing.xl) {
            Spacer()
            
            Image(systemName: "magnifyingglass")
                .font(.system(size: 60))
                .foregroundColor(VColors.textMutedColor(for: colorScheme))
            
            VStack(spacing: VSpacing.md) {
                Text("No Notes Found")
                    .font(VTypography.title2)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                
                Text("Try adjusting your filters.")
                    .font(VTypography.subheadline)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    .multilineTextAlignment(.center)
            }
            
            Spacer()
        }
        .padding()
    }
}

// MARK: - Add Note View
struct AddNoteView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    @State private var title = ""
    @State private var content = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section("Note Information") {
                    TextField("Title", text: $title)
                }
                
                Section("Content") {
                    TextEditor(text: $content)
                        .frame(minHeight: 200)
                }
            }
            .navigationTitle("New Note")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveNote()
                    }
                    .disabled(title.isEmpty)
                    .font(VTypography.size16Semibold)
                }
            }
        }
    }
    
    private func saveNote() {
        let note = LocalNote(
            id: UUID().uuidString,
            projectId: "default",
            title: title
        )
        note.content = content
        
        modelContext.insert(note)
        dismiss()
    }
}

// MARK: - Note Detail View (for future navigation)
struct NoteDetailView: View {
    let note: LocalNote
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var colorScheme
    @State private var isEditing = false
    @State private var editedTitle = ""
    @State private var editedContent = ""
    
    var body: some View {
        ScrollView {
            VStack(spacing: VSpacing.xl) {
                if isEditing {
                    // Edit Mode
                    VStack(spacing: VSpacing.lg) {
                        VStack(alignment: .leading, spacing: VSpacing.sm) {
                            Text("Title")
                                .font(VTypography.size12Medium)
                                .foregroundColor(VColors.textMutedColor(for: colorScheme))
                            
                            TextField("Note title", text: $editedTitle)
                                .font(VTypography.size16)
                                .padding()
                                .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                                .cornerRadius(VSpacing.radiusMd)
                                .overlay(
                                    RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                                        .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                                )
                        }
                        
                        VStack(alignment: .leading, spacing: VSpacing.sm) {
                            Text("Content")
                                .font(VTypography.size12Medium)
                                .foregroundColor(VColors.textMutedColor(for: colorScheme))
                            
                            TextEditor(text: $editedContent)
                                .frame(minHeight: 200)
                                .padding(VSpacing.sm)
                                .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                                .cornerRadius(VSpacing.radiusMd)
                                .overlay(
                                    RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                                        .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                                )
                        }
                        
                        HStack(spacing: VSpacing.md) {
                            Button(action: { isEditing = false }) {
                                Text("Cancel")
                                    .font(VTypography.size14Medium)
                                    .foregroundColor(VColors.textSecondaryColor(for: colorScheme))
                                    .padding(.horizontal, VSpacing.lg)
                                    .padding(.vertical, VSpacing.md)
                                    .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                                    .cornerRadius(VSpacing.radiusMd)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                                            .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                                    )
                            }
                            
                            Button(action: saveChanges) {
                                Text("Save")
                                    .font(VTypography.size14Semibold)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, VSpacing.lg)
                                    .padding(.vertical, VSpacing.md)
                                    .background(VColors.primary)
                                    .cornerRadius(VSpacing.radiusMd)
                            }
                        }
                    }
                    .padding()
                } else {
                    // View Mode
                    VStack(alignment: .leading, spacing: VSpacing.md) {
                        Text(note.title)
                            .font(VTypography.size20Bold)
                            .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                        
                        HStack(spacing: VSpacing.sm) {
                            Text("Created \(formatDate(note.createdAt))")
                            Text("•")
                            Text("Updated \(formatDate(note.updatedAt))")
                        }
                        .font(VTypography.size12)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                    .cornerRadius(VSpacing.radiusXl)
                    .overlay(
                        RoundedRectangle(cornerRadius: VSpacing.radiusXl)
                            .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                    )
                    
                    if !note.content.isEmpty {
                        VStack(alignment: .leading, spacing: VSpacing.md) {
                            Text(note.content)
                                .font(VTypography.size14)
                                .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .padding()
                        .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                        .cornerRadius(VSpacing.radiusXl)
                        .overlay(
                            RoundedRectangle(cornerRadius: VSpacing.radiusXl)
                                .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                        )
                    }
                }
            }
            .padding()
        }
        .background(VColors.backgroundColor(for: colorScheme))
        .navigationTitle("Note")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(isEditing ? "Done" : "Edit") {
                    if isEditing {
                        isEditing = false
                    } else {
                        editedTitle = note.title
                        editedContent = note.content
                        isEditing = true
                    }
                }
            }
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
    
    private func saveChanges() {
        note.title = editedTitle
        note.content = editedContent
        note.updatedAt = Date()
        isEditing = false
    }
}
