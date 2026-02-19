//
//  CatalogSeeder.swift
//  VemakinApp-IOS
//
//  Seeds catalog data from JSON
//

import SwiftData
import Foundation

class CatalogSeeder {
    static let shared = CatalogSeeder()
    
    private init() {}
    
    func seedIfNeeded(in context: ModelContext) {
        Task {
            // Check if already seeded
            let descriptor = FetchDescriptor<CatalogCategory>()
            guard let existing = try? context.fetch(descriptor), existing.isEmpty else {
                print("Catalog already seeded")
                return
            }
            
            // Create default categories
            await seedDefaultCatalog(in: context)
        }
    }
    
    private func seedDefaultCatalog(in context: ModelContext) async {
        // Create default categories
        let categories = [
            CatalogCategory(id: "1", name: "Camera", slug: "camera"),
            CatalogCategory(id: "2", name: "Lens", slug: "lens"),
            CatalogCategory(id: "3", name: "Light", slug: "light"),
            CatalogCategory(id: "4", name: "Audio", slug: "audio"),
            CatalogCategory(id: "5", name: "Tripod", slug: "tripod"),
            CatalogCategory(id: "6", name: "Stabilizer", slug: "stabilizer"),
        ]
        
        for category in categories {
            context.insert(category)
        }
        
        // Create default brands
        let brands = [
            CatalogBrand(id: "1", categoryId: "1", name: "Sony"),
            CatalogBrand(id: "2", categoryId: "1", name: "Canon"),
            CatalogBrand(id: "3", categoryId: "1", name: "Panasonic"),
            CatalogBrand(id: "4", categoryId: "2", name: "Sigma"),
            CatalogBrand(id: "5", categoryId: "2", name: "Zeiss"),
            CatalogBrand(id: "6", categoryId: "3", name: "Aputure"),
        ]
        
        for brand in brands {
            context.insert(brand)
        }
        
        // Create sample items
        let items = [
            CatalogItem(id: "1", brandId: "1", categoryId: "1", name: "Sony A7S III"),
            CatalogItem(id: "2", brandId: "1", categoryId: "1", name: "Sony A7 IV"),
            CatalogItem(id: "3", brandId: "2", categoryId: "1", name: "Canon R5"),
            CatalogItem(id: "4", brandId: "2", categoryId: "1", name: "Canon R6"),
            CatalogItem(id: "5", brandId: "4", categoryId: "2", name: "Sigma 24-70mm f/2.8"),
            CatalogItem(id: "6", brandId: "6", categoryId: "3", name: "Aputure 120D II"),
        ]
        
        for item in items {
            context.insert(item)
        }
        
        do {
            try context.save()
            print("✅ Catalog seeded successfully")
        } catch {
            print("❌ Failed to seed catalog: \(error)")
        }
    }
}
