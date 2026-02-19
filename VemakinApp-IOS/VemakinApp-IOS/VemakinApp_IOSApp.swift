//
//  VemakinApp_IOSApp.swift
//  VemakinApp-IOS
//
//  Main App Entry Point
//

import SwiftUI
import SwiftData

@main
struct VemakinApp_IOSApp: App {
    let container: ModelContainer
    
    init() {
        // Initialize SwiftData container with all models
        let schema = Schema([
            LocalUser.self,
            LocalProject.self,
            LocalShot.self,
            LocalEquipment.self,
            LocalTask.self,
            LocalNote.self,
            CatalogCategory.self,
            CatalogBrand.self,
            CatalogItem.self,
        ])
        
        let modelConfiguration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: false
        )
        
        do {
            container = try ModelContainer(
                for: schema,
                configurations: [modelConfiguration]
            )
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(container)
    }
}
