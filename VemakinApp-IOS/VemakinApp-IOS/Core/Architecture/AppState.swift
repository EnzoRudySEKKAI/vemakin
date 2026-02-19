//
//  AppState.swift
//  VemakinApp-IOS
//
//  Architecture - App State
//

import SwiftUI
import SwiftData

@Observable
class AppState {
    static let shared = AppState()
    
    var selectedProject: LocalProject?
    var selectedTab: Tab = .overview
    var isShowingWelcome: Bool = true
    
    private init() {}
}
