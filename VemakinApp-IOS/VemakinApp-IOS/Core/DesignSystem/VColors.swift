//
//  VColors.swift
//  VemakinApp-IOS
//
//  Design System - Colors (Matching Web Frontend)
//

import SwiftUI

struct VColors {
    // MARK: - Primary
    static let primary = Color(hex: "#3762E3")      // Light mode
    static let primaryDark = Color(hex: "#4E47DD")  // Dark mode
    static let primaryLightHover = Color(hex: "#2952D1")
    static let primaryDarkHover = Color(hex: "#3F39D1")
    
    // MARK: - Background
    static let background = Color(hex: "#F2F2F7")      // Light
    static let backgroundDark = Color(hex: "#0F1116")  // Dark
    static let backgroundDarker = Color(hex: "#090A0D") // Dark secondary
    
    // MARK: - Surface (Cards, containers)
    static let surface = Color.white
    static let surfaceDark = Color(hex: "#16181D")
    static let surfaceDarker = Color(hex: "#0F1116")
    
    // MARK: - Glass Surface
    static let glassLight = Color.white.opacity(0.8)
    static let glassDark = Color(hex: "#16181D").opacity(0.95)
    
    // MARK: - Border
    static let border = Color(hex: "#E5E5E5")
    static let borderDark = Color.white.opacity(0.08)
    static let borderDarkHover = Color.white.opacity(0.12)
    
    // MARK: - Text
    static let textPrimary = Color(hex: "#111827")
    static let textPrimaryDark = Color.white
    static let textSecondary = Color(hex: "#374151")
    static let textSecondaryDark = Color(hex: "#E5E5E5")
    static let textMuted = Color(hex: "#6B7280")
    static let textMutedDark = Color(hex: "#9CA3AF")
    static let textPlaceholder = Color(hex: "#9CA3AF")
    static let textPlaceholderDark = Color(hex: "#6B7280")
    
    // MARK: - Semantic Colors
    static let success = Color(hex: "#22C55E")
    static let successDark = Color(hex: "#27CA40")
    static let warning = Color(hex: "#F97316")
    static let warningDark = Color(hex: "#FFBD2E")
    static let danger = Color(hex: "#EF4444")
    static let dangerDark = Color(hex: "#FF5F56")
    static let info = Color(hex: "#3B82F6")
    static let infoDark = Color(hex: "#4E47DD")
    
    // MARK: - Timeline
    static let timelineDone = Color(hex: "#27CA40")
    static let timelineCurrent = Color(hex: "#4E47DD")
    static let timelinePending = Color(hex: "#3A3A3C")
    
    // MARK: - Traffic Lights (macOS style)
    static let trafficRed = Color(hex: "#FF5F56")
    static let trafficYellow = Color(hex: "#FFBD2E")
    static let trafficGreen = Color(hex: "#27CA40")
    
    // MARK: - Priority Colors
    static let priorityCritical = Color(hex: "#EF4444")
    static let priorityHigh = Color(hex: "#F97316")
    static let priorityMedium = Color(hex: "#EAB308")
    static let priorityLow = Color(hex: "#6B7280")
    
    // MARK: - Category Colors
    static let categoryScript = Color.purple
    static let categoryEditing = Color.blue
    static let categorySound = Color.orange
    static let categoryVFX = Color.green
    static let categoryColor = Color.pink
    
    // MARK: - Helper Methods
    static func primaryColor(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? primaryDark : primary
    }
    
    static func backgroundColor(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? backgroundDark : background
    }
    
    static func surfaceColor(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? surfaceDark : surface
    }
    
    static func textPrimaryColor(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? textPrimaryDark : textPrimary
    }
    
    static func textSecondaryColor(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? textSecondaryDark : textSecondary
    }
    
    static func textMutedColor(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? textMutedDark : textMuted
    }
    
    static func borderColor(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? borderDark : border
    }
}

// MARK: - Color Extension for Hex
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
