//
//  LocalEquipment.swift
//  VemakinApp-IOS
//
//  SwiftData Model - Local Equipment
//

import SwiftData
import Foundation

@Model
class LocalEquipment {
    @Attribute(.unique) var id: String
    var userId: String
    var name: String
    var catalogItemId: String?
    var customName: String?
    var serialNumber: String?
    var category: String // "Camera" | "Lens" | "Light" | etc.
    var pricePerDay: Double
    var rentalPrice: Double?
    var rentalFrequency: String? // "hour" | "day" | "week" | "month" | "year"
    var quantity: Int
    var isOwned: Bool
    var status: String // "operational" | "maintenance" | "broken" | "lost" | "sold"
    var brandName: String?
    var modelName: String?
    var specs: Data? // JSON encoded specs
    var purchaseDate: Date?
    var purchasePrice: Double?
    var notes: String?
    var createdAt: Date
    var updatedAt: Date
    
    init(id: String, userId: String, name: String, category: String) {
        self.id = id
        self.userId = userId
        self.name = name
        self.category = category
        self.pricePerDay = 0
        self.quantity = 1
        self.isOwned = true
        self.status = "operational"
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}
