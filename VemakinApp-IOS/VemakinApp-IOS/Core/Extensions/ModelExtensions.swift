//
//  ModelExtensions.swift
//  VemakinApp-IOS
//
//  Extensions for SwiftData Models
//

import SwiftUI

// MARK: - LocalShot Extensions
extension LocalShot {
    func toggleStatus() {
        status = (status == "done") ? "pending" : "done"
        updatedAt = Date()
    }
}

// MARK: - LocalTask Extensions
extension LocalTask {
    var statusDisplayName: String {
        switch status {
        case "todo": return "To Do"
        case "progress": return "In Progress"
        case "review": return "Review"
        case "done": return "Done"
        default: return status.capitalized
        }
    }
}
