//
//  LocalShot.swift
//  VemakinApp-IOS
//
//  SwiftData Model - Local Shot
//

import SwiftData
import Foundation

@Model
class LocalShot {
    @Attribute(.unique) var id: String
    var projectId: String
    var title: String
    var shotDescription: String
    var status: String // "pending" | "done"
    var startTime: String? // Format "HH:mm"
    var duration: String // Format "2h30" or "150min"
    var location: String
    var locationLat: Double?
    var locationLng: Double?
    var remarks: String?
    var date: String // ISO8601 date
    var sceneNumber: String?
    var equipmentIds: [String]
    var preparedEquipmentIds: [String]
    var createdAt: Date
    var updatedAt: Date
    
    var project: LocalProject?
    
    init(id: String, projectId: String, title: String) {
        self.id = id
        self.projectId = projectId
        self.title = title
        self.shotDescription = ""
        self.status = "pending"
        self.duration = ""
        self.location = ""
        self.date = ISO8601DateFormatter().string(from: Date())
        self.equipmentIds = []
        self.preparedEquipmentIds = []
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}
