//
//  View+Extensions.swift
//  VemakinApp-IOS
//
//  View Extensions
//

import SwiftUI

// MARK: - Rounded Rectangle Extension for specific corners
extension RoundedRectangle {
    init(cornerRadius: CGFloat, corners: UIRectCorner) {
        // For now, use standard rounded rectangle
        // In production, you'd use a custom shape for specific corners
        self.init(cornerRadius: cornerRadius)
    }
}
