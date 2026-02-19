//
//  DataExportService.swift
//  VemakinApp-IOS
//
//  Service for exporting and importing local data
//

import SwiftData
import Foundation

class DataExportService {
    static let shared = DataExportService()
    
    private init() {}
    
    func exportToJSON(from context: ModelContext) async throws -> URL {
        let exportData = try await gatherAllData(from: context)
        
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        encoder.dateEncodingStrategy = .iso8601
        
        let data = try encoder.encode(exportData)
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd_HH-mm-ss"
        let filename = "vemakin_export_\(formatter.string(from: Date())).json"
        
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(filename)
        try data.write(to: url)
        
        return url
    }
    
    func importFromJSON(_ url: URL, to context: ModelContext) async throws {
        let data = try Data(contentsOf: url)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let importData = try decoder.decode(DataExport.self, from: data)
        
        // Clear existing data
        try await clearAllData(from: context)
        
        // Import new data
        for project in importData.projects {
            context.insert(project)
        }
        for shot in importData.shots {
            context.insert(shot)
        }
        for equipment in importData.equipment {
            context.insert(equipment)
        }
        for task in importData.tasks {
            context.insert(task)
        }
        for note in importData.notes {
            context.insert(note)
        }
        
        try context.save()
    }
    
    private func gatherAllData(from context: ModelContext) async throws -> DataExport {
        let projects = try context.fetch(FetchDescriptor<LocalProject>())
        let shots = try context.fetch(FetchDescriptor<LocalShot>())
        let equipment = try context.fetch(FetchDescriptor<LocalEquipment>())
        let tasks = try context.fetch(FetchDescriptor<LocalTask>())
        let notes = try context.fetch(FetchDescriptor<LocalNote>())
        
        return DataExport(
            exportDate: Date(),
            appVersion: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0",
            userId: UserModeManager.shared.currentUserId,
            projects: projects,
            shots: shots,
            equipment: equipment,
            tasks: tasks,
            notes: notes
        )
    }
    
    private func clearAllData(from context: ModelContext) async throws {
        let projects = try context.fetch(FetchDescriptor<LocalProject>())
        let shots = try context.fetch(FetchDescriptor<LocalShot>())
        let equipment = try context.fetch(FetchDescriptor<LocalEquipment>())
        let tasks = try context.fetch(FetchDescriptor<LocalTask>())
        let notes = try context.fetch(FetchDescriptor<LocalNote>())
        
        for item in projects { context.delete(item) }
        for item in shots { context.delete(item) }
        for item in equipment { context.delete(item) }
        for item in tasks { context.delete(item) }
        for item in notes { context.delete(item) }
        
        try context.save()
    }
}

// MARK: - Data Export Model
struct DataExport: Codable {
    let exportDate: Date
    let appVersion: String
    let userId: String
    let projects: [LocalProject]
    let shots: [LocalShot]
    let equipment: [LocalEquipment]
    let tasks: [LocalTask]
    let notes: [LocalNote]
}
