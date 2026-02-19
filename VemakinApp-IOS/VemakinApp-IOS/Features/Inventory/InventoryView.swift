//
//  InventoryView.swift
//  VemakinApp-IOS
//
//  Inventory with Equipment Grid/List - Updated to match Web Frontend
//

import SwiftUI
import SwiftData

struct InventoryView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.colorScheme) private var colorScheme
    @Query private var equipment: [LocalEquipment]
    @State private var viewMode: ViewMode = .grid
    @State private var selectedCategory: String? = nil
    @State private var ownershipFilter: OwnershipFilter = .all
    @State private var showAddEquipment = false
    @State private var searchText = ""
    
    enum ViewMode: String, CaseIterable {
        case grid = "Grid"
        case list = "List"
    }
    
    enum OwnershipFilter: String, CaseIterable {
        case all = "All"
        case owned = "Own"
        case rented = "Rent"
    }
    
    // MARK: - Filtered Equipment
    var filteredEquipment: [LocalEquipment] {
        var filtered = equipment
        
        // Category filter
        if let category = selectedCategory {
            filtered = filtered.filter { $0.category == category }
        }
        
        // Ownership filter
        switch ownershipFilter {
        case .owned:
            filtered = filtered.filter { $0.isOwned }
        case .rented:
            filtered = filtered.filter { !$0.isOwned }
        case .all:
            break
        }
        
        // Search filter
        if !searchText.isEmpty {
            filtered = filtered.filter {
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                ($0.customName?.localizedCaseInsensitiveContains(searchText) ?? false) ||
                ($0.brandName?.localizedCaseInsensitiveContains(searchText) ?? false)
            }
        }
        
        return filtered
    }
    
    // MARK: - Grouped Equipment
    var groupedEquipment: [(category: String, items: [LocalEquipment])] {
        let grouped = Dictionary(grouping: filteredEquipment) { $0.category }
        return grouped.sorted { $0.key < $1.key }.map { (category: $0.key, items: $0.value) }
    }
    
    // MARK: - Categories with Counts
    var categoriesWithCounts: [(name: String, count: Int)] {
        let allCategories = Set(equipment.map { $0.category })
        return allCategories.map { category in
            let count = equipment.filter { $0.category == category }.count
            return (name: category, count: count)
        }.sorted { $0.name < $1.name }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // MARK: - Category Filter Chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: VSpacing.sm) {
                        CategoryFilterChip(
                            title: "All",
                            count: equipment.count,
                            isSelected: selectedCategory == nil
                        ) {
                            selectedCategory = nil
                        }
                        
                        ForEach(categoriesWithCounts, id: \.name) { category in
                            CategoryFilterChip(
                                title: category.name,
                                count: category.count,
                                isSelected: selectedCategory == category.name
                            ) {
                                selectedCategory = category.name
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, VSpacing.sm)
                }
                
                // MARK: - Search and Filters Bar
                HStack(spacing: VSpacing.md) {
                    // Search
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        TextField("Search equipment...", text: $searchText)
                            .font(VTypography.size14)
                    }
                    .padding()
                    .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                    .cornerRadius(VSpacing.radiusLg)
                    .overlay(
                        RoundedRectangle(cornerRadius: VSpacing.radiusLg)
                            .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                    )
                    
                    // Ownership Filter
                    HStack(spacing: 0) {
                        ForEach(OwnershipFilter.allCases, id: \.self) { filter in
                            Button(action: { ownershipFilter = filter }) {
                                Text(filter.rawValue)
                                    .font(VTypography.size12Medium)
                                    .padding(.horizontal, VSpacing.md)
                                    .padding(.vertical, VSpacing.sm)
                                    .background(ownershipFilter == filter ? VColors.primary : Color.clear)
                                    .foregroundColor(ownershipFilter == filter ? .white : VColors.textMutedColor(for: colorScheme))
                            }
                        }
                    }
                    .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                    .cornerRadius(VSpacing.radiusMd)
                    .overlay(
                        RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                            .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                    )
                    
                    // View Mode Toggle
                    HStack(spacing: 0) {
                        Button(action: { viewMode = .grid }) {
                            Image(systemName: "square.grid.2x2")
                                .font(VTypography.size14)
                                .frame(width: 36, height: 36)
                                .background(viewMode == .grid ? VColors.primary : Color.clear)
                                .foregroundColor(viewMode == .grid ? .white : VColors.textMutedColor(for: colorScheme))
                                .cornerRadius(VSpacing.radiusSm)
                        }
                        
                        Button(action: { viewMode = .list }) {
                            Image(systemName: "list.bullet")
                                .font(VTypography.size14)
                                .frame(width: 36, height: 36)
                                .background(viewMode == .list ? VColors.primary : Color.clear)
                                .foregroundColor(viewMode == .list ? .white : VColors.textMutedColor(for: colorScheme))
                                .cornerRadius(VSpacing.radiusSm)
                        }
                    }
                    .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                    .cornerRadius(VSpacing.radiusMd)
                    .overlay(
                        RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                            .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                    )
                }
                .padding(.horizontal)
                .padding(.bottom, VSpacing.md)
                
                // MARK: - Content
                if equipment.isEmpty {
                    EmptyInventoryView()
                } else if filteredEquipment.isEmpty {
                    NoFilteredInventoryView()
                } else {
                    ScrollView {
                        if viewMode == .grid {
                            EquipmentGridView(groupedEquipment: groupedEquipment)
                        } else {
                            EquipmentListView(equipment: filteredEquipment)
                        }
                    }
                }
            }
            .background(VColors.backgroundColor(for: colorScheme))
            .navigationTitle("Equipment")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showAddEquipment = true }) {
                        Image(systemName: "plus")
                            .font(VTypography.size16Semibold)
                    }
                }
            }
            .sheet(isPresented: $showAddEquipment) {
                AddEquipmentView()
            }
        }
    }
}

// MARK: - Category Filter Chip
struct CategoryFilterChip: View {
    let title: String
    let count: Int
    let isSelected: Bool
    let action: () -> Void
    
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: VSpacing.xs) {
                Text(title)
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

// MARK: - Equipment Grid View
struct EquipmentGridView: View {
    let groupedEquipment: [(category: String, items: [LocalEquipment])]
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        VStack(spacing: VSpacing.xl) {
            ForEach(groupedEquipment, id: \.category) { group in
                VStack(alignment: .leading, spacing: 0) {
                    // Category Header
                    HStack(spacing: VSpacing.sm) {
                        Image(systemName: categoryIcon(for: group.category))
                            .font(VTypography.size16)
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        
                        Text(group.category)
                            .font(VTypography.size16Semibold)
                            .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                    }
                    .padding(VSpacing.lg)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                    .cornerRadius(VSpacing.radiusXl, corners: [.topLeft, .topRight])
                    .overlay(
                        RoundedRectangle(cornerRadius: VSpacing.radiusXl)
                            .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
                    )
                    
                    // Equipment Grid
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: VSpacing.md) {
                        ForEach(group.items) { item in
                            EquipmentGridCard(equipment: item)
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
        .padding()
    }
    
    private func categoryIcon(for category: String) -> String {
        if let equipCategory = EquipmentCategory(rawValue: category) {
            return equipCategory.icon
        }
        return "cube.box"
    }
}

// MARK: - Equipment Grid Card (Web Style)
struct EquipmentGridCard: View {
    let equipment: LocalEquipment
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            EquipmentCardHeader(equipment: equipment)
            
            Divider()
                .background(VColors.borderColor(for: colorScheme))
            
            // Specs Grid
            EquipmentCardSpecs(equipment: equipment)
                .padding(VSpacing.md)
        }
        .background(colorScheme == .dark ? VColors.backgroundDark : Color.gray.opacity(0.03))
        .cornerRadius(VSpacing.radiusLg)
        .overlay(
            RoundedRectangle(cornerRadius: VSpacing.radiusLg)
                .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
        )
    }
}

// MARK: - Equipment Card Header
struct EquipmentCardHeader: View {
    let equipment: LocalEquipment
    @Environment(\.colorScheme) private var colorScheme
    
    private var title: String {
        equipment.customName ?? equipment.name
    }
    
    private var subtitle: String {
        if equipment.customName != nil {
            let identity = equipment.modelName ?? ""
            if let brand = equipment.brandName {
                return "\(brand) \(identity)".trimmingCharacters(in: .whitespaces)
            }
            return identity
        }
        return equipment.brandName ?? ""
    }
    
    var body: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: VSpacing.xs) {
                Text(title)
                    .font(VTypography.size14Medium)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                    .lineLimit(1)
                
                if !subtitle.isEmpty {
                    Text(subtitle)
                        .font(VTypography.size10)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .lineLimit(1)
                }
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: VSpacing.xs) {
                Text(equipment.isOwned ? "Owned" : "Rented")
                    .font(VTypography.size10Medium)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
                
                if !equipment.isOwned {
                    let price = Int(equipment.rentalPrice ?? equipment.pricePerDay)
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("$")
                            .font(VTypography.size10)
                        Text("\(price)")
                            .font(VTypography.size12Medium)
                    }
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    
                    Text("/\(equipment.rentalFrequency ?? "Day")")
                        .font(VTypography.size10)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme).opacity(0.7))
                }
            }
        }
        .padding(VSpacing.md)
    }
}

// MARK: - Equipment Card Specs
struct EquipmentCardSpecs: View {
    let equipment: LocalEquipment
    @Environment(\.colorScheme) private var colorScheme
    
    private var specs: [(key: String, value: String)] {
        guard let specsData = equipment.specs,
              let json = try? JSONSerialization.jsonObject(with: specsData) as? [String: String] else {
            return []
        }
        return Array(json.prefix(4)).map { (key: $0.key, value: $0.value) }
    }
    
    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: VSpacing.sm) {
            // Real specs
            ForEach(0..<min(specs.count, 4), id: \.self) { index in
                let spec = specs[index]
                SpecItem(key: spec.key, value: spec.value)
            }
            
            // Empty placeholders
            let emptyCount = max(0, 4 - specs.count)
            ForEach(0..<emptyCount, id: \.self) { _ in
                SpecItem(key: "—", value: "—", isPlaceholder: true)
            }
        }
    }
}

// MARK: - Spec Item
struct SpecItem: View {
    let key: String
    let value: String
    var isPlaceholder: Bool = false
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(key)
                .font(VTypography.size9)
                .fontWeight(.bold)
                .textCase(.uppercase)
                .foregroundColor(textColor.opacity(isPlaceholder ? 0.3 : 0.7))
                .lineLimit(1)
            
            Text(value)
                .font(VTypography.size11)
                .foregroundColor(textColor.opacity(isPlaceholder ? 0.3 : 1.0))
                .lineLimit(1)
        }
    }
    
    private var textColor: Color {
        isPlaceholder 
            ? (colorScheme == .dark ? Color.white : Color.gray)
            : VColors.textSecondaryColor(for: colorScheme)
    }
}

// MARK: - Equipment List View
struct EquipmentListView: View {
    let equipment: [LocalEquipment]
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("Equipment")
                    .font(VTypography.size16Semibold)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                
                Spacer()
                
                Text("\(equipment.count) items")
                    .font(VTypography.size12)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
            }
            .padding(VSpacing.lg)
            .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
            .cornerRadius(VSpacing.radiusXl, corners: [.topLeft, .topRight])
            .overlay(
                RoundedRectangle(cornerRadius: VSpacing.radiusXl)
                    .stroke(VColors.borderColor(for: colorScheme), lineWidth: 0.5)
            )
            
            // List
            VStack(spacing: VSpacing.sm) {
                ForEach(equipment) { item in
                    EquipmentListRow(equipment: item)
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
        .padding()
    }
}

// MARK: - Equipment List Row
struct EquipmentListRow: View {
    let equipment: LocalEquipment
    @Environment(\.colorScheme) private var colorScheme
    
    private var displayInfo: (title: String, subtitle: String) {
        let title = equipment.customName ?? equipment.name
        var subtitle = ""
        
        if equipment.customName != nil {
            let identity = equipment.modelName ?? ""
            subtitle = equipment.brandName != nil ? "\(equipment.brandName!) \(identity)".trimmingCharacters(in: .whitespaces) : identity
        } else {
            subtitle = equipment.brandName ?? ""
        }
        
        return (title, subtitle)
    }
    
    var body: some View {
        HStack(spacing: VSpacing.md) {
            // Content
            VStack(alignment: .leading, spacing: VSpacing.xs) {
                Text(displayInfo.title)
                    .font(VTypography.size14Medium)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                    .lineLimit(1)
                
                if !displayInfo.subtitle.isEmpty {
                    Text(displayInfo.subtitle)
                        .font(VTypography.size10)
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .lineLimit(1)
                }
            }
            
            Spacer()
            
            // Ownership & Price
            VStack(alignment: .trailing, spacing: VSpacing.xs) {
                Text(equipment.isOwned ? "Owned" : "Rented")
                    .font(VTypography.size10Medium)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
                
                if !equipment.isOwned {
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("$")
                            .font(VTypography.size10)
                        Text("\(Int(equipment.rentalPrice ?? equipment.pricePerDay))")
                            .font(VTypography.size12Medium)
                    }
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
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
}

// MARK: - Empty Inventory View
struct EmptyInventoryView: View {
    @Environment(\.colorScheme) private var colorScheme
    @State private var showAddEquipment = false
    
    var body: some View {
        VStack(spacing: VSpacing.xl) {
            Spacer()
            
            Image(systemName: "cube.box")
                .font(.system(size: 60))
                .foregroundColor(VColors.textMutedColor(for: colorScheme))
            
            VStack(spacing: VSpacing.md) {
                Text("Empty Repository")
                    .font(VTypography.title2)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                
                Text("No items in your inventory yet.")
                    .font(VTypography.subheadline)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    .multilineTextAlignment(.center)
            }
            
            Button(action: { showAddEquipment = true }) {
                HStack(spacing: VSpacing.sm) {
                    Image(systemName: "plus")
                    Text("Add Equipment")
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
        .sheet(isPresented: $showAddEquipment) {
            AddEquipmentView()
        }
    }
}

// MARK: - No Filtered Inventory View
struct NoFilteredInventoryView: View {
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        VStack(spacing: VSpacing.xl) {
            Spacer()
            
            Image(systemName: "magnifyingglass")
                .font(.system(size: 60))
                .foregroundColor(VColors.textMutedColor(for: colorScheme))
            
            VStack(spacing: VSpacing.md) {
                Text("No Items Found")
                    .font(VTypography.title2)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                
                Text("No items match your criteria.")
                    .font(VTypography.subheadline)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
                    .multilineTextAlignment(.center)
            }
            
            Spacer()
        }
        .padding()
    }
}

// MARK: - Add Equipment View
struct AddEquipmentView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    @State private var name = ""
    @State private var customName = ""
    @State private var selectedCategory: EquipmentCategory = .camera
    @State private var brandName = ""
    @State private var modelName = ""
    @State private var serialNumber = ""
    @State private var isOwned = true
    @State private var pricePerDay: Double = 0
    @State private var rentalPrice: Double = 0
    @State private var rentalFrequency = "Day"
    @State private var notes = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section("Basic Information") {
                    TextField("Name", text: $name)
                    TextField("Custom Name (optional)", text: $customName)
                    
                    Picker("Category", selection: $selectedCategory) {
                        ForEach(EquipmentCategory.allCases, id: \.self) { category in
                            Label(category.rawValue, systemImage: category.icon)
                                .tag(category)
                        }
                    }
                }
                
                Section("Details") {
                    TextField("Brand", text: $brandName)
                    TextField("Model", text: $modelName)
                    TextField("Serial Number", text: $serialNumber)
                }
                
                Section("Ownership") {
                    Toggle("Owned", isOn: $isOwned)
                    
                    if !isOwned {
                        TextField("Rental Price", value: $rentalPrice, format: .number)
                        Picker("Rental Frequency", selection: $rentalFrequency) {
                            Text("Hour").tag("Hour")
                            Text("Day").tag("Day")
                            Text("Week").tag("Week")
                            Text("Month").tag("Month")
                        }
                    }
                }
                
                Section("Notes") {
                    TextEditor(text: $notes)
                        .frame(minHeight: 100)
                }
            }
            .navigationTitle("New Equipment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveEquipment()
                    }
                    .disabled(name.isEmpty)
                    .font(VTypography.size16Semibold)
                }
            }
        }
    }
    
    private func saveEquipment() {
        let equipment = LocalEquipment(
            id: UUID().uuidString,
            userId: UserModeManager.shared.currentUserId,
            name: name,
            category: selectedCategory.rawValue
        )
        equipment.customName = customName.isEmpty ? nil : customName
        equipment.brandName = brandName.isEmpty ? nil : brandName
        equipment.modelName = modelName.isEmpty ? nil : modelName
        equipment.serialNumber = serialNumber.isEmpty ? nil : serialNumber
        equipment.isOwned = isOwned
        if !isOwned {
            equipment.rentalPrice = rentalPrice
            equipment.rentalFrequency = rentalFrequency
        }
        equipment.notes = notes.isEmpty ? nil : notes
        
        modelContext.insert(equipment)
        dismiss()
    }
}
