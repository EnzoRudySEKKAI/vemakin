//
//  PipelineView.swift
//  VemakinApp-IOS
//
//  Pipeline Tasks - Updated to match Web Frontend
//

import SwiftUI
import SwiftData

struct PipelineView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.colorScheme) private var colorScheme
    @Query private var tasks: [LocalTask]
    @State private var showAddTask = false
    @State private var selectedCategory: String? = nil
    @State private var selectedStatus: String? = nil
    @State private var expandedTaskMenu: String? = nil
    
    // MARK: - Filtered Tasks
    var filteredTasks: [LocalTask] {
        var filtered = tasks
        
        if let category = selectedCategory {
            filtered = filtered.filter { $0.category == category }
        }
        
        if let status = selectedStatus {
            filtered = filtered.filter { $0.status == status }
        }
        
        return filtered
    }
    
    // MARK: - Tasks by Status
    var tasksByStatus: [(status: String, tasks: [LocalTask])] {
        let statuses = ["todo", "progress", "review", "done"]
        return statuses.map { status in
            let statusTasks = filteredTasks.filter { $0.status == status }
            return (status: status, tasks: statusTasks)
        }.filter { !$0.tasks.isEmpty }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // MARK: - Category Filters
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: VSpacing.sm) {
                        PipelineFilterChip(
                            title: "All",
                            isSelected: selectedCategory == nil
                        ) {
                            selectedCategory = nil
                        }
                        
                        ForEach(TaskCategory.allCases, id: \.self) { category in
                            PipelineFilterChip(
                                title: category.rawValue,
                                color: category.color,
                                isSelected: selectedCategory == category.rawValue
                            ) {
                                selectedCategory = category.rawValue
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, VSpacing.sm)
                }
                
                // MARK: - Status Filters
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: VSpacing.sm) {
                        ForEach(["todo", "progress", "review", "done"], id: \.self) { status in
                            StatusFilterChip(
                                status: status,
                                count: filteredTasks.filter { $0.status == status }.count,
                                isSelected: selectedStatus == status
                            ) {
                                selectedStatus = selectedStatus == status ? nil : status
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, VSpacing.md)
                }
                
                // MARK: - Content
                if tasks.isEmpty {
                    EmptyPipelineView()
                } else if filteredTasks.isEmpty {
                    NoFilteredTasksView()
                } else {
                    ScrollView {
                        VStack(spacing: VSpacing.lg) {
                            ForEach(tasksByStatus, id: \.status) { group in
                                StatusSection(
                                    status: group.status,
                                    tasks: group.tasks,
                                    expandedTaskMenu: $expandedTaskMenu
                                )
                            }
                        }
                        .padding()
                    }
                }
            }
            .background(VColors.backgroundColor(for: colorScheme))
            .navigationTitle("Pipeline")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showAddTask = true }) {
                        Image(systemName: "plus")
                            .font(VTypography.size16Semibold)
                    }
                }
            }
            .sheet(isPresented: $showAddTask) {
                AddTaskView()
            }
        }
    }
}

// MARK: - Pipeline Filter Chip
struct PipelineFilterChip: View {
    let title: String
    var color: Color? = nil
    let isSelected: Bool
    let action: () -> Void
    
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: VSpacing.xs) {
                if let color = color {
                    Circle()
                        .fill(color)
                        .frame(width: 8, height: 8)
                }
                
                Text(title)
                    .font(VTypography.size12Medium)
            }
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

// MARK: - Status Filter Chip
struct StatusFilterChip: View {
    let status: String
    let count: Int
    let isSelected: Bool
    let action: () -> Void
    
    @Environment(\.colorScheme) private var colorScheme
    
    var statusInfo: (name: String, color: Color) {
        switch status {
        case "todo": return ("To Do", Color.gray)
        case "progress": return ("In Progress", VColors.primary)
        case "review": return ("Review", VColors.warning)
        case "done": return ("Done", VColors.success)
        default: return (status.capitalized, Color.gray)
        }
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: VSpacing.sm) {
                Circle()
                    .fill(statusInfo.color)
                    .frame(width: 8, height: 8)
                
                Text(statusInfo.name)
                    .font(VTypography.size12Medium)
                
                Text("\(count)")
                    .font(VTypography.size10)
                    .fontDesign(.monospaced)
                    .padding(.horizontal, VSpacing.xs)
                    .padding(.vertical, 1)
                    .background(
                        isSelected 
                            ? Color.white.opacity(0.3)
                            : (colorScheme == .dark 
                                ? Color.white.opacity(0.05)
                                : Color.gray.opacity(0.1))
                    )
                    .cornerRadius(4)
            }
            .padding(.horizontal, VSpacing.md)
            .padding(.vertical, VSpacing.sm)
            .background(isSelected ? statusInfo.color : (colorScheme == .dark ? VColors.surfaceDark : VColors.surface))
            .foregroundColor(isSelected ? .white : VColors.textSecondaryColor(for: colorScheme))
            .cornerRadius(VSpacing.radiusFull)
            .overlay(
                RoundedRectangle(cornerRadius: VSpacing.radiusFull)
                    .stroke(
                        isSelected ? statusInfo.color : VColors.borderColor(for: colorScheme),
                        lineWidth: 1
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Status Section
struct StatusSection: View {
    let status: String
    let tasks: [LocalTask]
    @Binding var expandedTaskMenu: String?
    @Environment(\.colorScheme) private var colorScheme
    
    var statusInfo: (name: String, color: Color) {
        switch status {
        case "todo": return ("To Do", Color.gray)
        case "progress": return ("In Progress", VColors.primary)
        case "review": return ("Review", VColors.warning)
        case "done": return ("Done", VColors.success)
        default: return (status.capitalized, Color.gray)
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                HStack(spacing: VSpacing.sm) {
                    Circle()
                        .fill(statusInfo.color)
                        .frame(width: 8, height: 8)
                    
                    Text(statusInfo.name)
                        .font(VTypography.size16Semibold)
                        .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                }
                
                Spacer()
                
                Text("\(tasks.count)")
                    .font(VTypography.size12Semibold)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    .padding(.horizontal, VSpacing.sm)
                    .padding(.vertical, VSpacing.xs)
                    .background(colorScheme == .dark ? VColors.backgroundDark : VColors.background)
                    .cornerRadius(VSpacing.radiusSm)
            }
            .padding(VSpacing.lg)
            .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
            .cornerRadius(VSpacing.radiusXl, corners: [.topLeft, .topRight])
            .overlay(
                RoundedRectangle(cornerRadius: VSpacing.radiusXl)
                    .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
            )
            
            // Tasks
            VStack(spacing: VSpacing.md) {
                ForEach(tasks) { task in
                    TaskCard(
                        task: task,
                        isMenuOpen: expandedTaskMenu == task.id,
                        onToggleMenu: {
                            expandedTaskMenu = expandedTaskMenu == task.id ? nil : task.id
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

// MARK: - Task Card
struct TaskCard: View {
    let task: LocalTask
    let isMenuOpen: Bool
    let onToggleMenu: () -> Void
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.modelContext) private var modelContext
    
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
    
    var categoryColor: Color {
        if let category = TaskCategory(rawValue: task.category) {
            return category.color
        }
        return .gray
    }
    
    var priorityColor: Color {
        switch task.priority {
        case "critical": return VColors.danger
        case "high": return VColors.warning
        case "medium": return VColors.warning.opacity(0.7)
        default: return VColors.primary
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: VSpacing.md) {
            // Header
            HStack(spacing: VSpacing.md) {
                // Category Icon
                ZStack {
                    RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                        .fill(colorScheme == .dark ? VColors.backgroundDark : Color.gray.opacity(0.1))
                        .frame(width: 36, height: 36)
                    
                    Image(systemName: categoryIcon)
                        .font(VTypography.size16)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                }
                
                VStack(alignment: .leading, spacing: VSpacing.xs) {
                    Text(task.category.uppercased())
                        .font(VTypography.size10)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    
                    if let dueDate = task.dueDate {
                        HStack(spacing: VSpacing.xs) {
                            Image(systemName: "calendar")
                                .font(VTypography.size10)
                            Text(formatDate(dueDate))
                                .font(VTypography.size10)
                        }
                        .foregroundColor(VColors.textMutedColor(for: colorScheme).opacity(0.7))
                    }
                }
                
                Spacer()
                
                // Priority Badge
                Text(task.priority.capitalized)
                    .font(VTypography.size10Medium)
                    .padding(.horizontal, VSpacing.sm)
                    .padding(.vertical, 2)
                    .background(priorityColor.opacity(0.2))
                    .foregroundColor(priorityColor)
                    .cornerRadius(VSpacing.radiusSm)
            }
            
            // Title & Description
            VStack(alignment: .leading, spacing: VSpacing.xs) {
                Text(task.title)
                    .font(VTypography.size14Medium)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                
                if let description = task.taskDescription, !description.isEmpty {
                    Text(description)
                        .font(VTypography.size12)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .lineLimit(2)
                } else {
                    Text("No specific details provided.")
                        .font(VTypography.size12)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme).opacity(0.7))
                        .lineLimit(2)
                }
            }
            
            // Status Dropdown
            ZStack(alignment: .bottom) {
                Button(action: onToggleMenu) {
                    HStack {
                        HStack(spacing: VSpacing.sm) {
                            Circle()
                                .fill(statusColor)
                                .frame(width: 6, height: 6)
                            
                            Text(task.status.capitalized)
                                .font(VTypography.size12Medium)
                        }
                        .foregroundColor(VColors.textSecondaryColor(for: colorScheme))
                        
                        Spacer()
                        
                        Image(systemName: "chevron.down")
                            .font(VTypography.size12)
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                            .rotationEffect(.degrees(isMenuOpen ? 180 : 0))
                    }
                    .padding(.horizontal, VSpacing.md)
                    .padding(.vertical, VSpacing.sm)
                    .background(colorScheme == .dark ? VColors.backgroundDark : Color.gray.opacity(0.05))
                    .cornerRadius(VSpacing.radiusMd)
                    .overlay(
                        RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                            .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                    )
                }
                .buttonStyle(PlainButtonStyle())
                
                // Status Menu
                if isMenuOpen {
                    VStack(spacing: 0) {
                        ForEach(["todo", "progress", "review", "done"], id: \.self) { status in
                            Button(action: { updateStatus(to: status) }) {
                                HStack {
                                    Text(status.capitalized)
                                        .font(VTypography.size12Medium)
                                        .foregroundColor(task.status == status ? .white : VColors.textSecondaryColor(for: colorScheme))
                                    
                                    Spacer()
                                    
                                    if task.status == status {
                                        Image(systemName: "checkmark")
                                            .font(VTypography.size12)
                                            .foregroundColor(.white)
                                    }
                                }
                                .padding(.horizontal, VSpacing.md)
                                .padding(.vertical, VSpacing.sm)
                                .background(task.status == status ? VColors.primary : Color.clear)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                    .cornerRadius(VSpacing.radiusMd)
                    .overlay(
                        RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                            .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                    )
                    .shadow(color: Color.black.opacity(0.2), radius: 8, x: 0, y: 4)
                    .padding(.bottom, 40)
                    .zIndex(1)
                }
            }
        }
        .padding(VSpacing.md)
        .background(colorScheme == .dark ? VColors.backgroundDark : Color.gray.opacity(0.03))
        .cornerRadius(VSpacing.radiusLg)
        .overlay(
            RoundedRectangle(cornerRadius: VSpacing.radiusLg)
                .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
        )
    }
    
    private var statusColor: Color {
        switch task.status {
        case "done": return VColors.success
        case "progress": return VColors.primary
        case "review": return VColors.warning
        default: return Color.gray
        }
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
    
    private func updateStatus(to status: String) {
        task.status = status
        task.updatedAt = Date()
    }
}

// MARK: - Empty Pipeline View
struct EmptyPipelineView: View {
    @Environment(\.colorScheme) private var colorScheme
    @State private var showAddTask = false
    
    var body: some View {
        VStack(spacing: VSpacing.xl) {
            Spacer()
            
            Image(systemName: "scissors")
                .font(.system(size: 60))
                .foregroundColor(VColors.textMutedColor(for: colorScheme))
            
            VStack(spacing: VSpacing.md) {
                Text("Empty Pipeline")
                    .font(VTypography.title2)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                
                Text("No active tasks found. Add your first task.")
                    .font(VTypography.subheadline)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    .multilineTextAlignment(.center)
            }
            
            Button(action: { showAddTask = true }) {
                HStack(spacing: VSpacing.sm) {
                    Image(systemName: "plus")
                    Text("Add Task")
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
        .sheet(isPresented: $showAddTask) {
            AddTaskView()
        }
    }
}

// MARK: - No Filtered Tasks View
struct NoFilteredTasksView: View {
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        VStack(spacing: VSpacing.xl) {
            Spacer()
            
            Image(systemName: "checkmark.circle")
                .font(.system(size: 60))
                .foregroundColor(VColors.textMutedColor(for: colorScheme))
            
            VStack(spacing: VSpacing.md) {
                Text("No Tasks Found")
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

// MARK: - Add Task View
struct AddTaskView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    @State private var title = ""
    @State private var description = ""
    @State private var selectedCategory: TaskCategory = .editing
    @State private var selectedPriority: TaskPriority = .medium
    @State private var dueDate: Date = Date()
    @State private var hasDueDate = false
    
    var body: some View {
        NavigationView {
            Form {
                Section("Task Information") {
                    TextField("Title", text: $title)
                    TextField("Description", text: $description)
                }
                
                Section("Category") {
                    Picker("Category", selection: $selectedCategory) {
                        ForEach(TaskCategory.allCases, id: \.self) { category in
                            HStack {
                                Circle()
                                    .fill(category.color)
                                    .frame(width: 8, height: 8)
                                Text(category.rawValue)
                            }
                            .tag(category)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section("Priority") {
                    Picker("Priority", selection: $selectedPriority) {
                        ForEach(TaskPriority.allCases, id: \.self) { priority in
                            Text(priority.displayName).tag(priority)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section("Due Date") {
                    Toggle("Set due date", isOn: $hasDueDate)
                    if hasDueDate {
                        DatePicker("Date", selection: $dueDate, displayedComponents: .date)
                    }
                }
            }
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveTask()
                    }
                    .disabled(title.isEmpty)
                    .font(VTypography.size16Semibold)
                }
            }
        }
    }
    
    private func saveTask() {
        let formatter = ISO8601DateFormatter()
        
        let task = LocalTask(
            id: UUID().uuidString,
            projectId: "default",
            category: selectedCategory.rawValue,
            title: title
        )
        task.taskDescription = description.isEmpty ? nil : description
        task.priority = selectedPriority.rawValue
        if hasDueDate {
            task.dueDate = formatter.string(from: dueDate)
        }
        
        modelContext.insert(task)
        dismiss()
    }
}
