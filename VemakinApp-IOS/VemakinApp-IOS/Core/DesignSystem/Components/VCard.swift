//
//  VCard.swift
//  VemakinApp-IOS
//
//  Design System - Card Component (Matching Web Frontend)
//

import SwiftUI

struct VCard<Content: View>: View {
    enum CardVariant {
        case `default`     // White/Dark background with border
        case glass         // Glassmorphism effect with blur
        case flat          // Subtle background
        case window        // macOS window style
        case elevated      // With shadow
        case hover         // Interactive hover state
    }
    
    let variant: CardVariant
    let padding: CGFloat
    let content: Content
    
    @Environment(\.colorScheme) private var colorScheme
    
    init(
        variant: CardVariant = .default,
        padding: CGFloat = VSpacing.lg,
        @ViewBuilder content: () -> Content
    ) {
        self.variant = variant
        self.padding = padding
        self.content = content()
    }
    
    var body: some View {
        content
            .padding(padding)
            .background(backgroundView)
            .cornerRadius(VSpacing.radiusXl)
            .overlay(
                RoundedRectangle(cornerRadius: VSpacing.radiusXl)
                    .stroke(borderColor, lineWidth: borderWidth)
            )
            .shadow(
                color: shadowColor,
                radius: shadowRadius,
                x: 0,
                y: shadowY
            )
    }
    
    @ViewBuilder
    private var backgroundView: some View {
        switch variant {
        case .default:
            colorScheme == .dark ? VColors.surfaceDark : VColors.surface
        case .glass:
            VGlassBackground()
        case .flat:
            colorScheme == .dark 
                ? VColors.surfaceDark.opacity(0.5) 
                : VColors.background.opacity(0.5)
        case .window:
            VColors.backgroundDarker
        case .elevated:
            colorScheme == .dark ? VColors.surfaceDark : VColors.surface
        case .hover:
            colorScheme == .dark ? VColors.surfaceDark : VColors.surface
        }
    }
    
    private var borderColor: Color {
        switch variant {
        case .window:
            return Color.white.opacity(0.08)
        case .glass:
            return colorScheme == .dark 
                ? Color.white.opacity(0.05)
                : Color.white.opacity(0.2)
        case .flat:
            return colorScheme == .dark
                ? Color.white.opacity(0.05)
                : Color.gray.opacity(0.1)
        default:
            return colorScheme == .dark 
                ? VColors.borderDark 
                : VColors.border
        }
    }
    
    private var borderWidth: CGFloat {
        switch variant {
        case .window:
            return 1
        case .glass:
            return 0.5
        case .flat:
            return 0.5
        default:
            return 0.5
        }
    }
    
    private var shadowColor: Color {
        switch variant {
        case .elevated:
            return Color.black.opacity(colorScheme == .dark ? 0.3 : 0.1)
        case .window:
            return Color.black.opacity(colorScheme == .dark ? 0.5 : 0.1)
        default:
            return Color.clear
        }
    }
    
    private var shadowRadius: CGFloat {
        switch variant {
        case .elevated:
            return 8
        case .window:
            return 10
        default:
            return 0
        }
    }
    
    private var shadowY: CGFloat {
        switch variant {
        case .elevated:
            return 4
        case .window:
            return 10
        default:
            return 0
        }
    }
}

// MARK: - Glass Background
struct VGlassBackground: View {
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        ZStack {
            if colorScheme == .dark {
                VColors.surfaceDark.opacity(0.9)
            } else {
                VColors.surface.opacity(0.8)
            }
        }
        .background(.ultraThinMaterial)
    }
}

// MARK: - Web-Style Card Header (matching web Card component)
struct VCardHeader: View {
    let title: String
    var subtitle: String? = nil
    var badge: String? = nil
    var badgeColor: Color? = nil
    var rightView: AnyView? = nil
    
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        HStack {
            // Left: Title section
            HStack(spacing: VSpacing.sm) {
                Text(title)
                    .font(VTypography.size16Semibold)
                    .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                
                if let badge = badge {
                    Text(badge)
                        .font(VTypography.size10Medium)
                        .fontDesign(.monospaced)
                        .padding(.horizontal, VSpacing.sm)
                        .padding(.vertical, 2)
                        .background(
                            colorScheme == .dark 
                                ? Color.white.opacity(0.05)
                                : Color.gray.opacity(0.1)
                        )
                        .foregroundColor(VColors.textMutedColor(for: colorScheme))
                        .cornerRadius(VSpacing.radiusSm)
                }
            }
            
            Spacer()
            
            // Right: Custom view or subtitle
            if let rightView = rightView {
                rightView
            } else if let subtitle = subtitle {
                Text(subtitle)
                    .font(VTypography.size12)
                    .foregroundColor(VColors.textMutedColor(for: colorScheme))
            }
        }
        .padding(.horizontal, VSpacing.lg)
        .padding(.vertical, VSpacing.md)
        .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
        .cornerRadius(VSpacing.radiusXl, corners: [.topLeft, .topRight])
    }
}

// MARK: - Web-Style List Item Card
struct VListItemCard: View {
    let title: String
    var subtitle: String? = nil
    var leftIndicator: AnyView? = nil
    var rightView: AnyView? = nil
    var onTap: (() -> Void)? = nil
    
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        Button(action: { onTap?() }) {
            HStack(spacing: VSpacing.md) {
                // Left indicator
                if let leftIndicator = leftIndicator {
                    leftIndicator
                }
                
                // Content
                VStack(alignment: .leading, spacing: VSpacing.xs) {
                    Text(title)
                        .font(VTypography.size14Medium)
                        .foregroundColor(VColors.textPrimaryColor(for: colorScheme))
                        .lineLimit(1)
                    
                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(VTypography.size12)
                            .foregroundColor(VColors.textMutedColor(for: colorScheme))
                            .lineLimit(1)
                    }
                }
                
                Spacer()
                
                // Right view
                if let rightView = rightView {
                    rightView
                }
            }
            .padding(VSpacing.md)
            .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
            .cornerRadius(VSpacing.radiusLg)
            .overlay(
                RoundedRectangle(cornerRadius: VSpacing.radiusLg)
                    .stroke(
                        colorScheme == .dark ? VColors.borderDark : VColors.border,
                        lineWidth: 0.5
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Corner Radius Extension
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}
