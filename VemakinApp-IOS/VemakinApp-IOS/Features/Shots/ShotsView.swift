//
//  ShotsView.swift
//  VemakinApp-IOS
//
//  Shots List with Timeline - Updated to match Web Frontend
//

import SwiftUI
import SwiftData

struct ShotsView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.colorScheme) private var colorScheme
    @Query private var shots: [LocalShot]
    @Query private var equipment: [LocalEquipment]
    @State private var viewMode: ViewMode = .timeline
    @State private var statusFilter: StatusFilter = .all
    @State private var showAddShot = false
    @State private var searchText = ""
    @State private var expandedChecklist: String? = nil
    
    enum ViewMode: String, CaseIterable {
        case timeline = "Timeline"
        case list = "List"
    }
    
    enum StatusFilter: String, CaseIterable {
        case all = "All"
        case pending = "To do"
        case done = "Done"
    }
    
    // MARK: - Filtered Data
    var filteredShots: [LocalShot] {
        var filtered = shots
        
        if !searchText.isEmpty {
            filtered = filtered.filter { shot in
                shot.title.localizedCaseInsensitiveContains(searchText) ||
                shot.location.localizedCaseInsensitiveContains(searchText) ||
                (shot.sceneNumber?.localizedCaseInsensitiveContains(searchText) ?? false)
            }
        }
        
        switch statusFilter {
        case .pending:
            filtered = filtered.filter { $0.status == "pending" }
        case .done:
            filtered = filtered.filter { $0.status == "done" }
        case .all:
            break
        }
        
        return filtered
    }
    
    var groupedShots: [(date: String, shots: [LocalShot])] {
        let grouped = Dictionary(grouping: filteredShots) { $0.date }
        return grouped.sorted { $0.key < $1.key }.map { (date: $0.key, shots: $0.value) }
    }
    
    // MARK: - Progress Stats
    var progressStats: (completed: Int, total: Int) {
        let completed = shots.filter { $0.status == "done" }.count
        return (completed, shots.count)
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // MARK: - Header with Progress
                VStack(spacing: VSpacing.md) {
                    // Progress Indicator
                    HStack(spacing: VSpacing.sm) {
                        Text("\(progressStats.completed)/\(progressStats.total)")
                            .font(VTypography.size20Bold)
                            .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                        
                        Text("FINISHED")
                            .font(VTypography.size12)
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        
                        Spacer()
                    }
                    
                    // Filter Chips
                    HStack(spacing: VSpacing.sm) {
                        FilterChip(
                            title: "All",
                            isSelected: statusFilter == .all
                        ) {
                            statusFilter = .all
                        }
                        
                        FilterChip(
                            title: "To do",
                            isSelected: statusFilter == .pending
                        ) {
                            statusFilter = .pending
                        }
                        
                        FilterChip(
                            title: "Done",
                            isSelected: statusFilter == .done
                        ) {
                            statusFilter = .done
                        }
                        
                        Spacer()
                        
                        // View Mode Toggle
                        HStack(spacing: 0) {
                            ForEach(ViewMode.allCases, id: \.self) { mode in
                                Button(action: { viewMode = mode }) {
                                    Text(mode.rawValue)
                                        .font(VTypography.size12Medium)
                                        .padding(.horizontal, VSpacing.md)
                                        .padding(.vertical, VSpacing.sm)
                                        .background(viewMode == mode ? VColors.primary : Color.clear)
                                        .foregroundColor(viewMode == mode ? .white : VColors.textMutedColor(for: colorScheme))
                                }
                            }
                        }
                        .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                        .cornerRadius(VSpacing.radiusMd)
                        .overlay(
                            RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                                .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                        )
                    }
                }
                .padding()
                .background(VColors.backgroundColor(for: colorScheme))
                
                // MARK: - Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    TextField("Search shots...", text: $searchText)
                        .font(VTypography.size14)
                }
                .padding()
                .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                .cornerRadius(VSpacing.radiusLg)
                .overlay(
                    RoundedRectangle(cornerRadius: VSpacing.radiusLg)
                        .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                )
                .padding(.horizontal)
                .padding(.bottom, VSpacing.md)
                
                // MARK: - Content
                if shots.isEmpty {
                    EmptyShotsView()
                } else if filteredShots.isEmpty {
                    NoFilteredResultsView()
                } else {
                    ScrollView {
                        if viewMode == .timeline {
                            TimelineShotsView(
                                groupedShots: groupedShots,
                                equipment: equipment,
                                expandedChecklist: $expandedChecklist
                            )
                        } else {
                            ListShotsView(
                                shots: filteredShots,
                                equipment: equipment,
                                expandedChecklist: $expandedChecklist
                            )
                        }
                    }
                }
            }
            .background(VColors.backgroundColor(for: colorScheme))
            .navigationTitle("Timeline")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showAddShot = true }) {
                        Image(systemName: "plus")
                            .font(VTypography.size16Semibold)
                    }
                }
            }
            .sheet(isPresented: $showAddShot) {
                AddShotView()
            }
        }
    }
}

// MARK: - Filter Chip
struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(VTypography.size12Medium)
                .padding(.horizontal, VSpacing.lg)
                .padding(.vertical, VSpacing.sm)
                .background(isSelected ? VColors.primary : Color.clear)
                .foregroundColor(isSelected ? .white : VColors.textMutedColor(for: colorScheme))
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

// MARK: - Timeline Shots View
struct TimelineShotsView: View {
    let groupedShots: [(date: String, shots: [LocalShot])]
    let equipment: [LocalEquipment]
    @Binding var expandedChecklist: String?
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        VStack(spacing: VSpacing.xl) {
            ForEach(groupedShots, id: \.date) { group in
                DateSection(
                    date: group.date,
                    shots: group.shots,
                    equipment: equipment,
                    expandedChecklist: $expandedChecklist
                )
            }
        }
        .padding()
    }
}

// MARK: - Date Section
struct DateSection: View {
    let date: String
    let shots: [LocalShot]
    let equipment: [LocalEquipment]
    @Binding var expandedChecklist: String?
    @Environment(\.colorScheme) private var colorScheme
    
    private var formattedDate: String {
        let formatter = ISO8601DateFormatter()
        if let dateObj = formatter.date(from: date) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "EEEE, MMMM d"
            return displayFormatter.string(from: dateObj)
        }
        return date
    }
    
    private var sunTimes: (sunrise: String, sunset: String) {
        // Simplified sun time calculation (would need location in real app)
        return ("06:24", "19:42")
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: VSpacing.lg) {
            // Date Header with Sun Times
            HStack {
                Text(formattedDate.capitalized)
                    .font(VTypography.size16Semibold)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                
                Spacer()
                
                HStack(spacing: VSpacing.lg) {
                    HStack(spacing: VSpacing.xs) {
                        Image(systemName: "sun.max.fill")
                            .font(VTypography.size12)
                            .foregroundColor(.orange.opacity(0.6))
                        Text(sunTimes.sunrise)
                            .font(VTypography.size12)
                            .foregroundColor(.orange.opacity(0.6))
                    }
                    
                    HStack(spacing: VSpacing.xs) {
                        Image(systemName: "moon.fill")
                            .font(VTypography.size12)
                            .foregroundColor(VColors.primary.opacity(0.6))
                        Text(sunTimes.sunset)
                            .font(VTypography.size12)
                            .foregroundColor(VColors.primary.opacity(0.6))
                    }
                }
            }
            .padding(VSpacing.lg)
            .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
            .cornerRadius(VSpacing.radiusXl, corners: [.topLeft, .topRight])
            .overlay(
                RoundedRectangle(cornerRadius: VSpacing.radiusXl)
                    .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
            )
            
            // Shots
            VStack(spacing: VSpacing.md) {
                ForEach(shots) { shot in
                    WebStyleShotCard(
                        shot: shot,
                        equipment: equipment,
                        isChecklistOpen: expandedChecklist == shot.id,
                        onToggleChecklist: {
                            expandedChecklist = expandedChecklist == shot.id ? nil : shot.id
                        }
                    )
                }
            }
            .padding(VSpacing.lg)
            .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
            .cornerRadius(VSpacing.radiusXl, corners: [.bottomLeft, .bottomRight])
            .overlay(
                RoundedRectangle(cornerRadius: VSpacing.radiusXl)
                    .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
            )
        }
    }
}

// MARK: - Web Style Shot Card
struct WebStyleShotCard: View {
    let shot: LocalShot
    let equipment: [LocalEquipment]
    let isChecklistOpen: Bool
    let onToggleChecklist: () -> Void
    @Environment(\.colorScheme) private var colorScheme
    
    var statusColor: Color {
        shot.status == "done" ? VColors.timelineDone : VColors.timelinePending
    }
    
    private func calculateEndTime(startTime: String, duration: String) -> String {
        // Simple time calculation (would need proper parsing in production)
        return startTime
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Main Card Content
            HStack(spacing: VSpacing.md) {
                // Left: Status bar and time
                HStack(spacing: VSpacing.sm) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(statusColor)
                        .frame(width: 3, height: 40)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(shot.startTime ?? "--:--")
                            .font(VTypography.size11)
                            .fontDesign(.monospaced)
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        
                        if let startTime = shot.startTime {
                            Text(calculateEndTime(startTime: startTime, duration: shot.duration))
                                .font(VTypography.size11)
                                .fontDesign(.monospaced)
                                .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        }
                    }
                }
                .frame(width: 70, alignment: .leading)
                
                // Content
                VStack(alignment: .leading, spacing: VSpacing.xs) {
                    Text(shot.title)
                        .font(VTypography.size14Medium)
                        .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                        .lineLimit(1)
                    
                    HStack(spacing: VSpacing.sm) {
                        Text("Sc \(shot.sceneNumber ?? "--")")
                            .font(VTypography.size10)
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                            .textCase(.uppercase)
                        
                        Text("|")
                            .font(VTypography.size10)
                            .foregroundColor(colorScheme == .dark 
                                ? Color.white.opacity(0.1)
                                : Color.gray.opacity(0.2)
                            )
                        
                        HStack(spacing: 2) {
                            Image(systemName: "mappin")
                                .font(VTypography.size10)
                            Text(shot.location.isEmpty ? "No location" : shot.location)
                                .font(VTypography.size11)
                        }
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .lineLimit(1)
                    }
                }
                
                Spacer()
                
                // Status Toggle
                Button(action: toggleStatus) {
                    Image(systemName: shot.status == "done" ? "checkmark" : "")
                        .font(VTypography.size12Bold)
                        .foregroundColor(shot.status == "done" ? .white : VColors.textMutedColor(for: colorScheme))
                        .frame(width: 32, height: 32)
                        .background(shot.status == "done" ? VColors.primary : Color.clear)
                        .cornerRadius(VSpacing.radiusSm)
                        .overlay(
                            RoundedRectangle(cornerRadius: VSpacing.radiusSm)
                                .stroke(
                                    shot.status == "done" 
                                        ? Color.clear 
                                        : VColors.borderColor(for: colorScheme),
                                    lineWidth: 1
                                )
                        )
                }
            }
            .padding(VSpacing.md)
            .background(colorScheme == .dark ? VColors.backgroundDark : Color.gray.opacity(0.03))
            
            // Expanded Checklist
            if isChecklistOpen && !shot.equipmentIds.isEmpty {
                VStack(spacing: VSpacing.sm) {
                    HStack {
                        Button(action: onToggleChecklist) {
                            HStack(spacing: VSpacing.xs) {
                                Text("Checklist")
                                    .font(VTypography.size12Semibold)
                                Image(systemName: "chevron.up")
                                    .font(VTypography.size12)
                            }
                            .padding(.horizontal, VSpacing.md)
                            .padding(.vertical, VSpacing.sm)
                            .background(
                                colorScheme == .dark 
                                    ? Color.white.opacity(0.1)
                                    : Color.gray.opacity(0.15)
                            )
                            .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                            .cornerRadius(VSpacing.radiusMd)
                        }
                        
                        Spacer()
                        
                        // Gear count
                        HStack(spacing: VSpacing.xs) {
                            Image(systemName: "cube.box")
                                .font(VTypography.size12)
                            Text("Gear \(shot.preparedEquipmentIds.count)/\(shot.equipmentIds.count)")
                                .font(VTypography.size12Semibold)
                        }
                        .foregroundColor(VColors.primary)
                    }
                    
                    // Equipment checklist
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: VSpacing.sm) {
                        ForEach(shot.equipmentIds, id: \.self) { equipmentId in
                            if let equip = equipment.first(where: { $0.id == equipmentId }) {
                                EquipmentCheckItem(
                                    equipment: equip,
                                    isPrepared: shot.preparedEquipmentIds.contains(equipmentId),
                                    onToggle: { toggleEquipment(equipmentId) }
                                )
                            }
                        }
                    }
                }
                .padding(VSpacing.md)
                .background(colorScheme == .dark ? VColors.backgroundDark : Color.gray.opacity(0.03))
                .overlay(
                    Rectangle()
                        .fill(VColors.borderColor(for: colorScheme))
                        .frame(height: 0.5)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                )
            }
        }
        .background(colorScheme == .dark ? VColors.backgroundDark : Color.gray.opacity(0.03))
        .cornerRadius(VSpacing.radiusLg)
        .overlay(
            RoundedRectangle(cornerRadius: VSpacing.radiusLg)
                .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
        )
    }
    
    private func toggleStatus() {
        shot.status = shot.status == "done" ? "pending" : "done"
        shot.updatedAt = Date()
    }
    
    private func toggleEquipment(_ equipmentId: String) {
        if let index = shot.preparedEquipmentIds.firstIndex(of: equipmentId) {
            shot.preparedEquipmentIds.remove(at: index)
        } else {
            shot.preparedEquipmentIds.append(equipmentId)
        }
        shot.updatedAt = Date()
    }
}

// MARK: - Equipment Check Item
struct EquipmentCheckItem: View {
    let equipment: LocalEquipment
    let isPrepared: Bool
    let onToggle: () -> Void
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        Button(action: onToggle) {
            HStack {
                Text(equipment.customName ?? equipment.name)
                    .font(VTypography.size11)
                    .foregroundColor(isPrepared ? VColors.primary : VColors.textMutedColor(for: colorScheme))
                    .lineLimit(1)
                
                Spacer()
                
                Circle()
                    .fill(isPrepared ? VColors.primary : Color.clear)
                    .frame(width: 16, height: 16)
                    .overlay(
                        Circle()
                            .stroke(
                                isPrepared ? VColors.primary : VColors.borderColor(for: colorScheme),
                                lineWidth: 1.5
                            )
                    )
                    .overlay(
                        Image(systemName: "checkmark")
                            .font(VTypography.size8Bold)
                            .foregroundColor(.white)
                            .opacity(isPrepared ? 1 : 0)
                    )
            }
            .padding(.horizontal, VSpacing.sm)
            .padding(.vertical, VSpacing.sm)
            .background(
                isPrepared 
                    ? VColors.primary.opacity(0.1)
                    : (colorScheme == .dark 
                        ? VColors.backgroundDarker 
                        : Color.white)
            )
            .cornerRadius(VSpacing.radiusMd)
            .overlay(
                RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                    .stroke(
                        isPrepared 
                            ? VColors.primary.opacity(0.3)
                            : VColors.borderColor(for: colorScheme),
                        lineWidth: 0.5
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - List Shots View
struct ListShotsView: View {
    let shots: [LocalShot]
    let equipment: [LocalEquipment]
    @Binding var expandedChecklist: String?
    
    var body: some View {
        LazyVStack(spacing: VSpacing.md) {
            ForEach(shots) { shot in
                WebStyleShotCard(
                    shot: shot,
                    equipment: equipment,
                    isChecklistOpen: expandedChecklist == shot.id,
                    onToggleChecklist: {
                        expandedChecklist = expandedChecklist == shot.id ? nil : shot.id
                    }
                )
            }
        }
        .padding()
    }
}

// MARK: - Empty Shots View
struct EmptyShotsView: View {
    @Environment(\.colorScheme) private var colorScheme
    @State private var showAddShot = false
    
    var body: some View {
        VStack(spacing: VSpacing.xl) {
            Spacer()
            
            Image(systemName: "camera")
                .font(.system(size: 60))
                .foregroundColor(VColors.textMutedColor(for: colorScheme))
            
            VStack(spacing: VSpacing.md) {
                Text("Empty Timeline")
                    .font(VTypography.title2)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                
                Text("Begin your production by scheduling the first scene.")
                    .font(VTypography.subheadline)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    .multilineTextAlignment(.center)
            }
            
            Button(action: { showAddShot = true }) {
                HStack(spacing: VSpacing.sm) {
                    Image(systemName: "plus")
                    Text("Schedule First Shot")
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
        .sheet(isPresented: $showAddShot) {
            AddShotView()
        }
    }
}

// MARK: - No Filtered Results View
struct NoFilteredResultsView: View {
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        VStack(spacing: VSpacing.xl) {
            Spacer()
            
            Image(systemName: "magnifyingglass")
                .font(.system(size: 60))
                .foregroundColor(VColors.textMutedColor(for: colorScheme))
            
            VStack(spacing: VSpacing.md) {
                Text("No Matches Found")
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

// MARK: - Add Shot View
struct AddShotView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    @State private var title = ""
    @State private var description = ""
    @State private var sceneNumber = ""
    @State private var location = ""
    @State private var startTime = ""
    @State private var duration = ""
    @State private var date = Date()
    
    var body: some View {
        NavigationView {
            Form {
                Section("Shot Information") {
                    TextField("Title", text: $title)
                    TextField("Scene Number", text: $sceneNumber)
                    TextField("Description", text: $description)
                }
                
                Section("Schedule") {
                    TextField("Location", text: $location)
                    TextField("Start Time (HH:mm)", text: $startTime)
                    TextField("Duration", text: $duration)
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                }
            }
            .navigationTitle("New Shot")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveShot()
                    }
                    .disabled(title.isEmpty)
                    .font(VTypography.size16Semibold)
                }
            }
        }
    }
    
    private func saveShot() {
        let formatter = ISO8601DateFormatter()
        
        let shot = LocalShot(
            id: UUID().uuidString,
            projectId: "default",
            title: title
        )
        shot.shotDescription = description
        shot.sceneNumber = sceneNumber.isEmpty ? nil : sceneNumber
        shot.location = location
        shot.startTime = startTime.isEmpty ? nil : startTime
        shot.duration = duration.isEmpty ? "5min" : duration
        shot.date = formatter.string(from: date)
        
        modelContext.insert(shot)
        dismiss()
    }
}
