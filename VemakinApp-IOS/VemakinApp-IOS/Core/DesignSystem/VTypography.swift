//
//  VTypography.swift
//  VemakinApp-IOS
//
//  Design System - Typography (Matching Web Frontend)
//

import SwiftUI

struct VTypography {
    // MARK: - Font Families
    static let fontFamily = "SF Pro" // System font
    
    // MARK: - Web-Style Sizes (matching design-system.ts)
    static let size8: Font = .system(size: 8, weight: .regular)
    static let size8Bold: Font = .system(size: 8, weight: .bold)
    
    static let size9: Font = .system(size: 9, weight: .regular)
    static let size9Bold: Font = .system(size: 9, weight: .bold)
    
    static let size10: Font = .system(size: 10, weight: .regular)
    static let size10Medium: Font = .system(size: 10, weight: .medium)
    static let size10Semibold: Font = .system(size: 10, weight: .semibold)
    static let size10Bold: Font = .system(size: 10, weight: .bold)
    
    static let size11: Font = .system(size: 11, weight: .regular)
    static let size11Medium: Font = .system(size: 11, weight: .medium)
    static let size11Semibold: Font = .system(size: 11, weight: .semibold)
    
    static let size12: Font = .system(size: 12, weight: .regular)
    static let size12Medium: Font = .system(size: 12, weight: .medium)
    static let size12Semibold: Font = .system(size: 12, weight: .semibold)
    static let size12Bold: Font = .system(size: 12, weight: .bold)
    
    static let size13: Font = .system(size: 13, weight: .regular)
    static let size13Medium: Font = .system(size: 13, weight: .medium)
    static let size13Semibold: Font = .system(size: 13, weight: .semibold)
    
    static let size14: Font = .system(size: 14, weight: .regular)
    static let size14Medium: Font = .system(size: 14, weight: .medium)
    static let size14Semibold: Font = .system(size: 14, weight: .semibold)
    static let size14Bold: Font = .system(size: 14, weight: .bold)
    
    static let size15: Font = .system(size: 15, weight: .regular)
    static let size15Medium: Font = .system(size: 15, weight: .medium)
    static let size15Semibold: Font = .system(size: 15, weight: .semibold)
    
    static let size16: Font = .system(size: 16, weight: .regular)
    static let size16Medium: Font = .system(size: 16, weight: .medium)
    static let size16Semibold: Font = .system(size: 16, weight: .semibold)
    static let size16Bold: Font = .system(size: 16, weight: .bold)
    
    static let size18: Font = .system(size: 18, weight: .regular)
    static let size18Medium: Font = .system(size: 18, weight: .medium)
    static let size18Semibold: Font = .system(size: 18, weight: .semibold)
    static let size18Bold: Font = .system(size: 18, weight: .bold)
    
    static let size20: Font = .system(size: 20, weight: .regular)
    static let size20Medium: Font = .system(size: 20, weight: .medium)
    static let size20Semibold: Font = .system(size: 20, weight: .semibold)
    static let size20Bold: Font = .system(size: 20, weight: .bold)
    
    static let size24: Font = .system(size: 24, weight: .regular)
    static let size24Medium: Font = .system(size: 24, weight: .medium)
    static let size24Semibold: Font = .system(size: 24, weight: .semibold)
    static let size24Bold: Font = .system(size: 24, weight: .bold)
    
    static let size28: Font = .system(size: 28, weight: .regular)
    static let size28Bold: Font = .system(size: 28, weight: .bold)
    
    static let size32: Font = .system(size: 32, weight: .regular)
    static let size32Bold: Font = .system(size: 32, weight: .bold)
    
    // MARK: - iOS Presets (for reference)
    static let largeTitle: Font = .largeTitle.weight(.bold)       // 34pt bold
    static let title: Font = .title.weight(.bold)                 // 28pt bold
    static let title2: Font = .title2.weight(.bold)               // 22pt bold
    static let title3: Font = .title3.weight(.semibold)           // 20pt semibold
    static let headline: Font = .headline.weight(.semibold)       // 17pt semibold
    static let body: Font = .body.weight(.regular)                // 17pt regular
    static let callout: Font = .callout.weight(.regular)          // 16pt regular
    static let subheadline: Font = .subheadline.weight(.regular)  // 15pt regular
    static let footnote: Font = .footnote.weight(.regular)        // 13pt regular
    static let caption: Font = .caption.weight(.regular)          // 12pt regular
    static let caption2: Font = .caption2.weight(.regular)        // 11pt regular
}
