//
//  LocalUser.swift
//  VemakinApp-IOS
//
//  SwiftData Model - Local User
//

import SwiftData
import Foundation

@Model
class LocalUser {
    @Attribute(.unique) var id: String
    var createdAt: Date
    var lastModified: Date
    var darkMode: Bool
    var lastProjectId: String?
    
    init(id: String) {
        self.id = id
        self.createdAt = Date()
        self.lastModified = Date()
        self.darkMode = true
    }
}
