//
//  LocalProject.swift
//  VemakinApp-IOS
//
//  SwiftData Model - Local Project
//

import SwiftData
import Foundation

@Model
class LocalProject {
    @Attribute(.unique) var id: String
    var userId: String
    var name: String
    var projectDescription: String?
    var createdAt: Date
    var updatedAt: Date
    
    @Relationship(deleteRule: .cascade, inverse: \LocalShot.project)
    var shots: [LocalShot]?
    
    @Relationship(deleteRule: .cascade, inverse: \LocalTask.project)
    var tasks: [LocalTask]?
    
    @Relationship(deleteRule: .cascade, inverse: \LocalNote.project)
    var notes: [LocalNote]?
    
    init(id: String, userId: String, name: String) {
        self.id = id
        self.userId = userId
        self.name = name
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}
