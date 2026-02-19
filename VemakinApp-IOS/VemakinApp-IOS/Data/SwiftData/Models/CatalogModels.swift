//
//  CatalogModels.swift
//  VemakinApp-IOS
//
//  SwiftData Models - Catalog (Read-only, pre-populated)
//

import SwiftData
import Foundation

@Model
class CatalogCategory {
    @Attribute(.unique) var id: String
    var name: String
    var slug: String
    var iconName: String? // SF Symbol name
    var sortOrder: Int
    
    init(id: String, name: String, slug: String) {
        self.id = id
        self.name = name
        self.slug = slug
        self.sortOrder = 0
    }
}

@Model
class CatalogBrand {
    @Attribute(.unique) var id: String
    var categoryId: String
    var name: String
    var logoUrl: String?
    
    init(id: String, categoryId: String, name: String) {
        self.id = id
        self.categoryId = categoryId
        self.name = name
    }
}

@Model
class CatalogItem {
    @Attribute(.unique) var id: String
    var brandId: String
    var categoryId: String
    var name: String
    var itemDescription: String?
    var imageUrl: String?
    var specs: Data? // JSON specs
    var releaseYear: Int?
    var weight: Double? // in grams
    var dimensions: String? // "100x50x30mm"
    
    init(id: String, brandId: String, categoryId: String, name: String) {
        self.id = id
        self.brandId = brandId
        self.categoryId = categoryId
        self.name = name
    }
}
