//
//  LocalTask.swift
//  VemakinApp-IOS
//
//  SwiftData Model - Local Task (Post-prod)
//

import SwiftData
import Foundation

@Model
class LocalTask {
    @Attribute(.unique) var id: String
    var projectId: String
    var category: String // "Script" | "Editing" | "Sound" | "VFX" | "Color"
    var title: String
    var status: String // "todo" | "progress" | "review" | "done"
    var priority: String // "low" | "medium" | "high" | "critical"
    var dueDate: String? // ISO8601
    var taskDescription: String?
    var metadata: Data? // JSON additional data
    var createdAt: Date
    var updatedAt: Date
    
    var project: LocalProject?
    
    init(id: String, projectId: String, category: String, title: String) {
        self.id = id
        self.projectId = projectId
        self.category = category
        self.title = title
        self.status = "todo"
        self.priority = "medium"
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}
