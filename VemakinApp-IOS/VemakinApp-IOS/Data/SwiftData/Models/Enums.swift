//
//  Enums.swift
//  VemakinApp-IOS
//
//  Enums for the app
//

import SwiftUI

enum EquipmentCategory: String, CaseIterable {
    case camera = "Camera"
    case lens = "Lens"
    case light = "Light"
    case audio = "Audio"
    case tripod = "Tripod"
    case stabilizer = "Stabilizer"
    case grip = "Grip"
    case monitoring = "Monitoring"
    case wireless = "Wireless"
    case drone = "Drone"
    case filter = "Filter"
    case props = "Props"
    case other = "Other"
    
    var icon: String {
        switch self {
        case .camera: return "camera.fill"
        case .lens: return "viewfinder"
        case .light: return "lightbulb.fill"
        case .audio: return "mic.fill"
        case .tripod: return "arrow.down.circle.fill"
        case .stabilizer: return "hand.raised.fill"
        case .grip: return "gearshape.fill"
        case .monitoring: return "tv.fill"
        case .wireless: return "wifi"
        case .drone: return "airplane"
        case .filter: return "circle.grid.2x2.fill"
        case .props: return "cube.fill"
        case .other: return "questionmark.circle.fill"
        }
    }
}

enum EquipmentStatus: String, CaseIterable {
    case operational = "operational"
    case maintenance = "maintenance"
    case broken = "broken"
    case lost = "lost"
    case sold = "sold"
    
    var displayName: String {
        switch self {
        case .operational: return "Operational"
        case .maintenance: return "In Maintenance"
        case .broken: return "Broken"
        case .lost: return "Lost"
        case .sold: return "Sold"
        }
    }
    
    var color: Color {
        switch self {
        case .operational: return VColors.success
        case .maintenance: return VColors.warning
        case .broken, .lost, .sold: return VColors.danger
        }
    }
}

enum TaskCategory: String, CaseIterable {
    case script = "Script"
    case editing = "Editing"
    case sound = "Sound"
    case vfx = "VFX"
    case color = "Color"
    
    var color: Color {
        switch self {
        case .script: return .purple
        case .editing: return .blue
        case .sound: return .orange
        case .vfx: return .green
        case .color: return .pink
        }
    }
}

enum TaskStatus: String, CaseIterable {
    case todo = "todo"
    case progress = "progress"
    case review = "review"
    case done = "done"
    
    var displayName: String {
        switch self {
        case .todo: return "To Do"
        case .progress: return "In Progress"
        case .review: return "Review"
        case .done: return "Done"
        }
    }
}

enum TaskPriority: String, CaseIterable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case critical = "critical"
    
    var displayName: String {
        rawValue.capitalized
    }
    
    var color: Color {
        switch self {
        case .low: return .gray
        case .medium: return .blue
        case .high: return .orange
        case .critical: return .red
        }
    }
}

enum UserMode: String, Codable {
    case local
    case cloud
    case migrating
}

enum Tab: String, CaseIterable {
    case overview = "Overview"
    case shots = "Shots"
    case inventory = "Inventory"
    case pipeline = "Pipeline"
    case notes = "Notes"
    
    var icon: String {
        switch self {
        case .overview: return "house.fill"
        case .shots: return "camera.fill"
        case .inventory: return "cube.box.fill"
        case .pipeline: return "list.bullet.rectangle.fill"
        case .notes: return "note.text"
        }
    }
}
