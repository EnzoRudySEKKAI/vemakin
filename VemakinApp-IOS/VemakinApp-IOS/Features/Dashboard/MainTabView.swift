//
//  MainTabView.swift
//  VemakinApp-IOS
//
//  Main Tab Navigation - Updated to match Web Frontend
//

import SwiftUI
import SwiftData

struct MainTabView: View {
    @State private var appState = AppState.shared
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        TabView(selection: $appState.selectedTab) {
            OverviewView()
                .tabItem {
                    Label("Overview", systemImage: "house.fill")
                }
                .tag(Tab.overview)
            
            ShotsView()
                .tabItem {
                    Label("Shots", systemImage: "camera.fill")
                }
                .tag(Tab.shots)
            
            InventoryView()
                .tabItem {
                    Label("Inventory", systemImage: "cube.box.fill")
                }
                .tag(Tab.inventory)
            
            PipelineView()
                .tabItem {
                    Label("Pipeline", systemImage: "list.bullet.rectangle.fill")
                }
                .tag(Tab.pipeline)
            
            NotesView()
                .tabItem {
                    Label("Notes", systemImage: "note.text")
                }
                .tag(Tab.notes)
        }
        .accentColor(VColors.primary)
        .preferredColorScheme(.dark) // Default to dark mode like web app
    }
}

// MARK: - Overview View (Matching Web Frontend)
struct OverviewView: View {
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.modelContext) private var modelContext
    @Query private var projects: [LocalProject]
    @Query private var shots: [LocalShot]
    @Query private var tasks: [LocalTask]
    @Query private var notes: [LocalNote]
    @Query private var equipment: [LocalEquipment]
    
    // MARK: - Greeting based on time
    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Good morning"
        case 12..<17: return "Good afternoon"
        case 17..<22: return "Good evening"
        default: return "Good night"
        }
    }
    
    // MARK: - Stats Computations
    private var inventoryStats: (total: Int, owned: Int, rented: Int, categories: [String: Int]) {
        let total = equipment.count
        let owned = equipment.filter { $0.isOwned }.count
        let rented = total - owned
        
        var categoryCounts: [String: Int] = [:]
        equipment.forEach { item in
            categoryCounts[item.category, default: 0] += 1
        }
        
        return (total, owned, rented, categoryCounts)
    }
    
    private var upcomingShots: [LocalShot] {
        shots
            .filter { $0.status == "pending" }
            .sorted { $0.date < $1.date }
            .prefix(4)
            .map { $0 }
    }
    
    private var pendingTasks: [LocalTask] {
        tasks
            .filter { $0.status != "done" }
            .sorted {
                let priorityOrder = ["critical": 0, "high": 1, "medium": 2, "low": 3]
                return (priorityOrder[$0.priority] ?? 4) < (priorityOrder[$1.priority] ?? 4)
            }
            .prefix(4)
            .map { $0 }
    }
    
    private var recentNotes: [LocalNote] {
        notes
            .sorted { $0.updatedAt > $1.updatedAt }
            .prefix(3)
            .map { $0 }
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: VSpacing.xxl) {
                    // MARK: - Header with Greeting
                    VStack(alignment: .leading, spacing: VSpacing.sm) {
                        Text(greeting)
                            .font(VTypography.size24Bold)
                            .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                        
                        // Production Selector (placeholder)
                        HStack(spacing: VSpacing.sm) {
                            Image(systemName: "film.fill")
                                .font(VTypography.size12)
                                .foregroundColor(VColors.primary)
                            
                            Text(projects.first?.name ?? "My Production")
                                .font(VTypography.size14Medium)
                                .foregroundColor(VColors.textSecondaryColor(for: colorScheme))
                            
                            Image(systemName: "chevron.down")
                                .font(VTypography.size10)
                                .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        }
                        .padding(.horizontal, VSpacing.md)
                        .padding(.vertical, VSpacing.sm)
                        .background(
                            RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                                .fill(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                                .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                        )
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    
                    // MARK: - Stats Grid
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: VSpacing.lg) {
                        // Timeline Card
                        TimelineOverviewCard(
                            pendingCount: shots.filter { $0.status == "pending" }.count,
                            shots: Array(upcomingShots)
                        )
                        
                        // Equipment Card
                        EquipmentOverviewCard(stats: inventoryStats)
                        
                        // Tasks Card
                        TasksOverviewCard(
                            pendingCount: tasks.filter { $0.status != "done" }.count,
                            tasks: Array(pendingTasks)
                        )
                        
                        // Notes Card
                        NotesOverviewCard(
                            totalCount: notes.count,
                            notes: Array(recentNotes)
                        )
                    }
                }
                .padding()
            }
            .background(VColors.backgroundColor(for: colorScheme))
            .navigationTitle("")
            .navigationBarHidden(true)
        }
    }
}

// MARK: - Timeline Overview Card
struct TimelineOverviewCard: View {
    let pendingCount: Int
    let shots: [LocalShot]
    @Environment(\.colorScheme) private var colorScheme
    @State private var appState = AppState.shared
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                HStack(spacing: VSpacing.sm) {
                    Text("Timeline")
                        .font(VTypography.size16Semibold)
                        .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                    
                    Text("\(pendingCount) Shots left")
                        .font(VTypography.size10Medium)
                        .fontDesign(.monospaced)
                        .padding(.horizontal, VSpacing.sm)
                        .padding(.vertical, 2)
                        .background(
                            colorScheme == .dark 
                                ? Color.white.opacity(0.05)
                                : Color.gray.opacity(0.1)
                        )
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .cornerRadius(VSpacing.radiusSm)
                }
                
                Spacer()
                
                Button(action: { appState.selectedTab = .shots }) {
                    Text("View all")
                        .font(VTypography.size10Medium)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .padding(.horizontal, VSpacing.sm)
                        .padding(.vertical, 2)
                        .background(
                            colorScheme == .dark 
                                ? Color.white.opacity(0.05)
                                : Color.gray.opacity(0.1)
                        )
                        .cornerRadius(VSpacing.radiusSm)
                }
            }
            .padding(VSpacing.lg)
            .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
            
            // Content
            VStack(spacing: VSpacing.sm) {
                if shots.isEmpty {
                    VStack(spacing: VSpacing.md) {
                        Image(systemName: "film")
                            .font(.system(size: 24))
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        
                        Text("No upcoming shots")
                            .font(VTypography.size14)
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(VSpacing.xl)
                } else {
                    ForEach(shots) { shot in
                        TimelineShotRow(shot: shot)
                    }
                }
            }
            .padding(VSpacing.lg)
        }
        .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
        .cornerRadius(VSpacing.radiusXl)
        .overlay(
            RoundedRectangle(cornerRadius: VSpacing.radiusXl)
                .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
        )
    }
}

// MARK: - Timeline Shot Row
struct TimelineShotRow: View {
    let shot: LocalShot
    @Environment(\.colorScheme) private var colorScheme
    
    var statusColor: Color {
        shot.status == "done" ? VColors.timelineDone : VColors.timelinePending
    }
    
    var body: some View {
        HStack(spacing: VSpacing.md) {
            // Status bar
            HStack(spacing: VSpacing.xs) {
                RoundedRectangle(cornerRadius: 2)
                    .fill(statusColor)
                    .frame(width: 3, height: 32)
                
                if let startTime = shot.startTime {
                    Text(startTime)
                        .font(VTypography.size10)
                        .fontDesign(.monospaced)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                }
            }
            
            // Content
            VStack(alignment: .leading, spacing: VSpacing.xs) {
                Text(shot.title)
                    .font(VTypography.size14Medium)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                    .lineLimit(1)
                
                let dateText = formatDate(shot.date)
                Text("\(dateText) • \(shot.duration)")
                    .font(VTypography.size12)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
            }
            
            Spacer()
        }
        .padding(VSpacing.md)
        .background(
            colorScheme == .dark 
                ? VColors.backgroundDark 
                : Color.gray.opacity(0.05)
        )
        .cornerRadius(VSpacing.radiusLg)
        .overlay(
            RoundedRectangle(cornerRadius: VSpacing.radiusLg)
                .stroke(
                    colorScheme == .dark 
                        ? Color.white.opacity(0.05)
                        : Color.gray.opacity(0.1),
                    lineWidth: 0.5
                )
        )
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "MMM d"
            return displayFormatter.string(from: date)
        }
        return dateString
    }
}

// MARK: - Equipment Overview Card
struct EquipmentOverviewCard: View {
    let stats: (total: Int, owned: Int, rented: Int, categories: [String: Int])
    @Environment(\.colorScheme) private var colorScheme
    @State private var appState = AppState.shared
    
    private var topCategories: [(name: String, count: Int)] {
        stats.categories
            .sorted { $0.value > $1.value }
            .prefix(3)
            .map { (name: $0.key, count: $0.value) }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                HStack(spacing: VSpacing.sm) {
                    Text("Equipment")
                        .font(VTypography.size16Semibold)
                        .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                    
                    Text("\(stats.total) Items")
                        .font(VTypography.size10Medium)
                        .fontDesign(.monospaced)
                        .padding(.horizontal, VSpacing.sm)
                        .padding(.vertical, 2)
                        .background(
                            colorScheme == .dark 
                                ? Color.white.opacity(0.05)
                                : Color.gray.opacity(0.1)
                        )
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .cornerRadius(VSpacing.radiusSm)
                }
                
                Spacer()
                
                Button(action: { appState.selectedTab = .inventory }) {
                    Text("View all")
                        .font(VTypography.size10Medium)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .padding(.horizontal, VSpacing.sm)
                        .padding(.vertical, 2)
                        .background(
                            colorScheme == .dark 
                                ? Color.white.opacity(0.05)
                                : Color.gray.opacity(0.1)
                        )
                        .cornerRadius(VSpacing.radiusSm)
                }
            }
            .padding(VSpacing.lg)
            .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
            
            // Content
            VStack(spacing: VSpacing.lg) {
                if stats.total == 0 {
                    VStack(spacing: VSpacing.md) {
                        Image(systemName: "cube.box")
                            .font(.system(size: 24))
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        
                        Text("No equipment found")
                            .font(VTypography.size14)
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(VSpacing.xl)
                } else {
                    // Stats Grid
                    HStack(spacing: VSpacing.md) {
                        EquipmentStatBox(
                            label: "Total gear",
                            value: "\(stats.total)"
                        )
                        
                        EquipmentStatBox(
                            label: "Categories",
                            value: "\(stats.categories.count)"
                        )
                    }
                    
                    // Ownership breakdown
                    HStack(spacing: VSpacing.xl) {
                        HStack(spacing: VSpacing.sm) {
                            Circle()
                                .fill(VColors.primary)
                                .frame(width: 8, height: 8)
                            
                            Text("\(stats.owned)")
                                .font(VTypography.size12)
                                .foregroundColor(VColors.textSecondaryColor(for: colorScheme))
                            
                            Text("Owned")
                                .font(VTypography.size12)
                                .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        }
                        
                        HStack(spacing: VSpacing.sm) {
                            Circle()
                                .fill(Color.gray.opacity(0.5))
                                .frame(width: 8, height: 8)
                            
                            Text("\(stats.rented)")
                                .font(VTypography.size12)
                                .foregroundColor(VColors.textSecondaryColor(for: colorScheme))
                            
                            Text("Rented")
                                .font(VTypography.size12)
                                .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        }
                    }
                    
                    // Category distribution
                    if !topCategories.isEmpty {
                        VStack(alignment: .leading, spacing: VSpacing.md) {
                            Text("Top distributions")
                                .font(VTypography.size10Medium)
                                .foregroundColor(VColors.textMutedColor(for: colorScheme))
                            
                            ForEach(topCategories, id: \.name) { category in
                                VStack(alignment: .leading, spacing: VSpacing.xs) {
                                    HStack {
                                        Text(category.name)
                                            .font(VTypography.size10)
                                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                                        
                                        Spacer()
                                        
                                        Text("\(category.count)")
                                            .font(VTypography.size10)
                                            .fontDesign(.monospaced)
                                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                                    }
                                    
                                    GeometryReader { geometry in
                                        ZStack(alignment: .leading) {
                                            RoundedRectangle(cornerRadius: 2)
                                                .fill(colorScheme == .dark 
                                                    ? Color.white.opacity(0.05)
                                                    : Color.gray.opacity(0.1)
                                                )
                                                .frame(height: 4)
                                            
                                            RoundedRectangle(cornerRadius: 2)
                                                .fill(Color.gray.opacity(0.4))
                                                .frame(
                                                    width: stats.total > 0 
                                                        ? geometry.size.width * CGFloat(category.count) / CGFloat(stats.total)
                                                        : 0,
                                                    height: 4
                                                )
                                        }
                                    }
                                    .frame(height: 4)
                                }
                            }
                        }
                    }
                }
            }
            .padding(VSpacing.lg)
        }
        .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
        .cornerRadius(VSpacing.radiusXl)
        .overlay(
            RoundedRectangle(cornerRadius: VSpacing.radiusXl)
                .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
        )
    }
}

// MARK: - Equipment Stat Box
struct EquipmentStatBox: View {
    let label: String
    let value: String
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        VStack(alignment: .leading, spacing: VSpacing.xs) {
            Text(label)
                .font(VTypography.size10)
                .foregroundColor(VColors.textMutedColor(for: colorScheme))
            
            Text(value)
                .font(VTypography.size24Bold)
                .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(VSpacing.md)
        .background(
            colorScheme == .dark 
                ? VColors.backgroundDark 
                : Color.gray.opacity(0.05)
        )
        .cornerRadius(VSpacing.radiusLg)
        .overlay(
            RoundedRectangle(cornerRadius: VSpacing.radiusLg)
                .stroke(
                    colorScheme == .dark 
                        ? Color.white.opacity(0.05)
                        : Color.gray.opacity(0.1),
                    lineWidth: 0.5
                )
        )
    }
}

// MARK: - Tasks Overview Card
struct TasksOverviewCard: View {
    let pendingCount: Int
    let tasks: [LocalTask]
    @Environment(\.colorScheme) private var colorScheme
    @State private var appState = AppState.shared
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                HStack(spacing: VSpacing.sm) {
                    Text("Tasks")
                        .font(VTypography.size16Semibold)
                        .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                    
                    Text("\(pendingCount) Tasks left")
                        .font(VTypography.size10Medium)
                        .fontDesign(.monospaced)
                        .padding(.horizontal, VSpacing.sm)
                        .padding(.vertical, 2)
                        .background(
                            colorScheme == .dark 
                                ? Color.white.opacity(0.05)
                                : Color.gray.opacity(0.1)
                        )
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .cornerRadius(VSpacing.radiusSm)
                }
                
                Spacer()
                
                Button(action: { appState.selectedTab = .pipeline }) {
                    Text("View all")
                        .font(VTypography.size10Medium)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .padding(.horizontal, VSpacing.sm)
                        .padding(.vertical, 2)
                        .background(
                            colorScheme == .dark 
                                ? Color.white.opacity(0.05)
                                : Color.gray.opacity(0.1)
                        )
                        .cornerRadius(VSpacing.radiusSm)
                }
            }
            .padding(VSpacing.lg)
            .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
            
            // Content
            VStack(spacing: VSpacing.sm) {
                if tasks.isEmpty {
                    VStack(spacing: VSpacing.md) {
                        Image(systemName: "bolt")
                            .font(.system(size: 24))
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        
                        Text("All caught up")
                            .font(VTypography.size14)
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(VSpacing.xl)
                } else {
                    ForEach(tasks) { task in
                        TaskRow(task: task)
                    }
                }
            }
            .padding(VSpacing.lg)
        }
        .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
        .cornerRadius(VSpacing.radiusXl)
        .overlay(
            RoundedRectangle(cornerRadius: VSpacing.radiusXl)
                .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
        )
    }
}

// MARK: - Task Row
struct TaskRow: View {
    let task: LocalTask
    @Environment(\.colorScheme) private var colorScheme
    
    var categoryIcon: String {
        switch task.category {
        case "Script": return "pencil.line"
        case "Editing": return "scissors"
        case "Sound": return "music.note"
        case "VFX": return "layers"
        case "Color": return "paintpalette"
        default: return "bolt"
        }
    }
    
    var priorityColor: Color {
        switch task.priority {
        case "critical", "high": return VColors.danger
        case "medium": return VColors.warning
        default: return VColors.primary
        }
    }
    
    var body: some View {
        HStack(spacing: VSpacing.md) {
            // Icon
            Image(systemName: categoryIcon)
                .font(VTypography.size14)
                .foregroundColor(VColors.textMutedColor(for: colorScheme))
                .frame(width: 20)
            
            // Content
            VStack(alignment: .leading, spacing: VSpacing.xs) {
                Text(task.title)
                    .font(VTypography.size14Medium)
                    .foregroundColor(task.status == "done" 
                        ? VColors.textMutedColor(for: colorScheme)
                        : VColors.textPrimaryColor(for: colorScheme)
                    )
                    .lineLimit(1)
                    .strikethrough(task.status == "done")
                
                Text(task.category)
                    .font(VTypography.size12)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
            }
            
            Spacer()
            
            // Priority badge
            Text(task.priority.capitalized)
                .font(VTypography.size10Medium)
                .padding(.horizontal, VSpacing.sm)
                .padding(.vertical, 2)
                .background(priorityColor.opacity(0.2))
                .foregroundColor(priorityColor)
                .cornerRadius(VSpacing.radiusSm)
        }
        .padding(VSpacing.md)
        .background(
            colorScheme == .dark 
                ? VColors.backgroundDark 
                : Color.gray.opacity(0.05)
        )
        .cornerRadius(VSpacing.radiusLg)
        .overlay(
            RoundedRectangle(cornerRadius: VSpacing.radiusLg)
                .stroke(
                    colorScheme == .dark 
                        ? Color.white.opacity(0.05)
                        : Color.gray.opacity(0.1),
                    lineWidth: 0.5
                )
        )
    }
}

// MARK: - Notes Overview Card
struct NotesOverviewCard: View {
    let totalCount: Int
    let notes: [LocalNote]
    @Environment(\.colorScheme) private var colorScheme
    @State private var appState = AppState.shared
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                HStack(spacing: VSpacing.sm) {
                    Text("Notes")
                        .font(VTypography.size16Semibold)
                        .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                    
                    Text("\(totalCount) Notes")
                        .font(VTypography.size10Medium)
                        .fontDesign(.monospaced)
                        .padding(.horizontal, VSpacing.sm)
                        .padding(.vertical, 2)
                        .background(
                            colorScheme == .dark 
                                ? Color.white.opacity(0.05)
                                : Color.gray.opacity(0.1)
                        )
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .cornerRadius(VSpacing.radiusSm)
                }
                
                Spacer()
                
                Button(action: { appState.selectedTab = .notes }) {
                    Text("View all")
                        .font(VTypography.size10Medium)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .padding(.horizontal, VSpacing.sm)
                        .padding(.vertical, 2)
                        .background(
                            colorScheme == .dark 
                                ? Color.white.opacity(0.05)
                                : Color.gray.opacity(0.1)
                        )
                        .cornerRadius(VSpacing.radiusSm)
                }
            }
            .padding(VSpacing.lg)
            .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
            
            // Content
            VStack(spacing: VSpacing.sm) {
                if notes.isEmpty {
                    VStack(spacing: VSpacing.md) {
                        Image(systemName: "note.text")
                            .font(.system(size: 24))
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        
                        Text("No notes")
                            .font(VTypography.size14)
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(VSpacing.xl)
                } else {
                    ForEach(notes) { note in
                        NoteRowView(note: note)
                    }
                }
            }
            .padding(VSpacing.lg)
        }
        .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
        .cornerRadius(VSpacing.radiusXl)
        .overlay(
            RoundedRectangle(cornerRadius: VSpacing.radiusXl)
                .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
        )
    }
}

// MARK: - Note Row View
struct NoteRowView: View {
    let note: LocalNote
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        VStack(alignment: .leading, spacing: VSpacing.xs) {
            HStack {
                Text(note.title)
                    .font(VTypography.size14Medium)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                    .lineLimit(1)
                
                Spacer()
                
                Text(formatDate(note.updatedAt))
                    .font(VTypography.size10)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
            }
            
            if !note.content.isEmpty {
                Text(note.content)
                    .font(VTypography.size12)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    .lineLimit(2)
            }
        }
        .padding(VSpacing.md)
        .background(
            colorScheme == .dark 
                ? VColors.backgroundDark 
                : Color.gray.opacity(0.05)
        )
        .cornerRadius(VSpacing.radiusLg)
        .overlay(
            RoundedRectangle(cornerRadius: VSpacing.radiusLg)
                .stroke(
                    colorScheme == .dark 
                        ? Color.white.opacity(0.05)
                        : Color.gray.opacity(0.1),
                    lineWidth: 0.5
                )
        )
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: date)
    }
}
