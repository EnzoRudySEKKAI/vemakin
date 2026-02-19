//
//  VButton.swift
//  VemakinApp-IOS
//
//  Design System - Button Component
//

import SwiftUI

struct VButton: View {
    enum ButtonStyle {
        case primary
        case secondary
        case ghost
        case danger
    }
    
    enum ButtonSize {
        case small    // 36pt height
        case medium   // 44pt height
        case large    // 52pt height
    }
    
    let title: String
    let style: ButtonStyle
    let size: ButtonSize
    let icon: String?
    let isLoading: Bool
    let isDisabled: Bool
    let action: () -> Void
    
    @Environment(\.colorScheme) private var colorScheme
    
    init(
        title: String,
        style: ButtonStyle = .primary,
        size: ButtonSize = .medium,
        icon: String? = nil,
        isLoading: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.style = style
        self.size = size
        self.icon = icon
        self.isLoading = isLoading
        self.isDisabled = isDisabled
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: VSpacing.sm) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: foregroundColor))
                        .scaleEffect(0.8)
                } else if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: iconSize))
                }
                
                Text(title)
                    .font(font)
            }
            .frame(maxWidth: .infinity)
            .frame(height: height)
            .background(backgroundColor)
            .foregroundColor(foregroundColor)
            .cornerRadius(VSpacing.radiusMd)
            .overlay(
                RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                    .stroke(borderColor, lineWidth: borderWidth)
            )
        }
        .disabled(isDisabled || isLoading)
        .buttonStyle(VButtonStyle())
        .opacity(isDisabled ? 0.5 : 1.0)
    }
    
    // MARK: - Style Computations
    
    private var backgroundColor: Color {
        switch style {
        case .primary:
            return colorScheme == .dark ? VColors.primaryDark : VColors.primary
        case .secondary:
            return colorScheme == .dark ? VColors.surfaceDark : VColors.surface
        case .ghost:
            return Color.clear
        case .danger:
            return colorScheme == .dark ? VColors.dangerDark : VColors.danger
        }
    }
    
    private var foregroundColor: Color {
        switch style {
        case .primary, .danger:
            return .white
        case .secondary:
            return colorScheme == .dark ? .white : VColors.textPrimary
        case .ghost:
            return colorScheme == .dark ? VColors.textSecondaryDark : VColors.textSecondary
        }
    }
    
    private var borderColor: Color {
        switch style {
        case .secondary:
            return colorScheme == .dark ? VColors.borderDark : VColors.border
        default:
            return Color.clear
        }
    }
    
    private var borderWidth: CGFloat {
        style == .secondary ? 1 : 0
    }
    
    private var height: CGFloat {
        switch size {
        case .small: return 36
        case .medium: return 44
        case .large: return 52
        }
    }
    
    private var font: Font {
        switch size {
        case .small: return VTypography.size14.weight(.semibold)
        case .medium: return VTypography.size16.weight(.semibold)
        case .large: return VTypography.size16.weight(.semibold)
        }
    }
    
    private var iconSize: CGFloat {
        switch size {
        case .small: return 14
        case .medium: return 16
        case .large: return 18
        }
    }
}

// MARK: - Button Style
struct VButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}
