//
//  VTimeline.swift
//  VemakinApp-IOS
//
//  Design System - Timeline Component
//

import SwiftUI

struct VTimelineItemView: View {
    let shot: LocalShot
    let isLast: Bool
    let onTap: () -> Void
    let onToggleStatus: () -> Void
    
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        HStack(alignment: .top, spacing: VSpacing.md) {
            // Timeline indicator
            VStack(spacing: 0) {
                // Status dot
                Button(action: onToggleStatus) {
                    Circle()
                        .fill(statusColor)
                        .frame(width: 14, height: 14)
                        .overlay(
                            Circle()
                                .stroke(Color.white.opacity(0.2), lineWidth: 2)
                        )
                        .overlay(
                            Group {
                                if shot.status == "done" {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 8, weight: .bold))
                                        .foregroundColor(.white)
                                }
                            }
                        )
                }
                
                // Connector line
                if !isLast {
                    Rectangle()
                        .fill(statusColor.opacity(0.3))
                        .frame(width: 2)
                        .frame(maxHeight: .infinity)
                }
            }
            .frame(width: 20)
            
            // Content
            VCard(variant: .glass) {
                VStack(alignment: .leading, spacing: VSpacing.sm) {
                    // Header
                    HStack {
                        // Scene number badge
                        if let sceneNumber = shot.sceneNumber, !sceneNumber.isEmpty {
                            Text(sceneNumber)
                                .font(VTypography.caption.weight(.bold))
                                .padding(.horizontal, VSpacing.sm)
                                .padding(.vertical, 4)
                                .background(VColors.primary.opacity(0.2))
                                .foregroundColor(VColors.primary)
                                .cornerRadius(6)
                        }
                        
                        Spacer()
                        
                        // Status indicator
                        StatusBadge(status: shot.status)
                    }
                    
                    // Title
                    Text(shot.title)
                        .font(VTypography.headline)
                        .foregroundColor(colorScheme == .dark ? .white : VColors.textPrimary)
                    
                    // Time & Duration
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(VTypography.caption)
                        Text("\(shot.startTime ?? "--:--") • \(shot.duration)")
                            .font(VTypography.subheadline)
                    }
                    .foregroundColor(VColors.textMuted)
                    
                    // Location
                    if !shot.location.isEmpty {
                        HStack(spacing: 4) {
                            Image(systemName: "mappin")
                                .font(VTypography.caption)
                            Text(shot.location)
                                .font(VTypography.subheadline)
                        }
                        .foregroundColor(VColors.textMuted)
                    }
                    
                    // Equipment count
                    if !shot.equipmentIds.isEmpty {
                        HStack(spacing: 4) {
                            Image(systemName: "camera")
                                .font(VTypography.caption)
                            Text("\(shot.equipmentIds.count) equipment")
                                .font(VTypography.caption)
                        }
                        .foregroundColor(VColors.textMuted)
                    }
                }
            }
            .onTapGesture(perform: onTap)
        }
    }
    
    private var statusColor: Color {
        switch shot.status {
        case "done":
            return VColors.timelineDone
        case "pending":
            return VColors.timelinePending
        default:
            return VColors.timelinePending
        }
    }
}

struct StatusBadge: View {
    let status: String
    
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        Text(status.capitalized)
            .font(VTypography.caption.weight(.medium))
            .padding(.horizontal, VSpacing.sm)
            .padding(.vertical, 4)
            .background(backgroundColor)
            .foregroundColor(foregroundColor)
            .cornerRadius(VSpacing.radiusSm)
    }
    
    private var backgroundColor: Color {
        switch status {
        case "done":
            return VColors.success.opacity(0.2)
        case "pending":
            return VColors.warning.opacity(0.2)
        case "operational":
            return VColors.success.opacity(0.2)
        case "maintenance":
            return VColors.warning.opacity(0.2)
        case "broken", "lost", "sold":
            return VColors.danger.opacity(0.2)
        default:
            return VColors.surfaceDark.opacity(0.5)
        }
    }
    
    private var foregroundColor: Color {
        switch status {
        case "done", "operational":
            return VColors.success
        case "pending", "maintenance":
            return VColors.warning
        case "broken", "lost", "sold":
            return VColors.danger
        default:
            return VColors.textSecondary
        }
    }
}
