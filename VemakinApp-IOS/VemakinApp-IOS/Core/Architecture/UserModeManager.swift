//
//  UserModeManager.swift
//  VemakinApp-IOS
//
//  Architecture - User Mode Manager
//

import SwiftUI
import SwiftData

@Observable
class UserModeManager {
    static let shared = UserModeManager()
    
    private let defaults = UserDefaults.standard
    private let modeKey = "user_mode"
    private let localUserIdKey = "local_user_id"
    
    private(set) var currentMode: UserMode {
        didSet {
            defaults.set(currentMode.rawValue, forKey: modeKey)
        }
    }
    
    private(set) var currentUserId: String
    
    var isLocalMode: Bool {
        currentMode == .local
    }
    
    var isCloudMode: Bool {
        currentMode == .cloud
    }
    
    private init() {
        // Load saved mode or default to local
        if let savedMode = defaults.string(forKey: modeKey),
           let mode = UserMode(rawValue: savedMode) {
            self.currentMode = mode
        } else {
            self.currentMode = .local
        }
        
        // Load or generate local user ID
        if let savedId = defaults.string(forKey: localUserIdKey) {
            self.currentUserId = savedId
        } else {
            self.currentUserId = UUID().uuidString
            defaults.set(self.currentUserId, forKey: localUserIdKey)
        }
    }
    
    func switchToLocalMode() {
        // Generate new local ID
        currentUserId = UUID().uuidString
        defaults.set(currentUserId, forKey: localUserIdKey)
        currentMode = .local
    }
    
    func switchToCloudMode(userId: String) async throws {
        let hasLocalData = await checkForLocalData()
        
        if hasLocalData {
            // Will show migration dialog
            currentMode = .migrating
        } else {
            currentUserId = userId
            currentMode = .cloud
        }
    }
    
    func completeMigrationToCloud(userId: String) {
        currentUserId = userId
        currentMode = .cloud
    }
    
    func cancelMigration() {
        currentMode = .local
    }
    
    private func checkForLocalData() async -> Bool {
        // For now, simplified check - in real implementation would check SwiftData
        return false
    }
}
