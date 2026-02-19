//
//  LocalNote.swift
//  VemakinApp-IOS
//
//  SwiftData Model - Local Note
//

import SwiftData
import Foundation

@Model
class LocalNote {
    @Attribute(.unique) var id: String
    var projectId: String
    var title: String
    var content: String
    var shotId: String?
    var taskId: String?
    var attachmentUrls: [String] // Local file paths
    var createdAt: Date
    var updatedAt: Date
    
    var project: LocalProject?
    
    init(id: String, projectId: String, title: String) {
        self.id = id
        self.projectId = projectId
        self.title = title
        self.content = ""
        self.attachmentUrls = []
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}
