//
//  VTextField.swift
//  VemakinApp-IOS
//
//  Design System - Text Field Component
//

import SwiftUI

struct VTextField: View {
    let title: String
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var keyboardType: UIKeyboardType = .default
    var autocapitalization: TextInputAutocapitalization = .sentences
    var isRequired: Bool = false
    var errorMessage: String?
    
    @Environment(\.colorScheme) private var colorScheme
    @FocusState private var isFocused: Bool
    @State private var showPassword: Bool = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: VSpacing.sm) {
            // Label
            HStack(spacing: 4) {
                Text(title)
                    .font(VTypography.subheadline.weight(.medium))
                    .foregroundColor(colorScheme == .dark ? VColors.textSecondaryDark : VColors.textSecondary)
                
                if isRequired {
                    Text("*")
                        .foregroundColor(VColors.danger)
                }
            }
            
            // Input
            HStack {
                Group {
                    if isSecure && !showPassword {
                        SecureField(placeholder, text: $text)
                    } else {
                        TextField(placeholder, text: $text)
                    }
                }
                .font(VTypography.body)
                .keyboardType(keyboardType)
                .textInputAutocapitalization(autocapitalization)
                .foregroundColor(colorScheme == .dark ? .white : VColors.textPrimary)
                .focused($isFocused)
                
                if isSecure {
                    Button(action: { showPassword.toggle() }) {
                        Image(systemName: showPassword ? "eye.slash" : "eye")
                            .foregroundColor(VColors.textMuted)
                    }
                }
            }
            .padding(.horizontal, VSpacing.md)
            .frame(height: 52)
            .background(backgroundColor)
            .cornerRadius(VSpacing.radiusMd)
            .overlay(
                RoundedRectangle(cornerRadius: VSpacing.radiusMd)
                    .stroke(borderColor, lineWidth: isFocused || errorMessage != nil ? 2 : 1)
            )
            
            // Error message
            if let error = errorMessage {
                Text(error)
                    .font(VTypography.caption)
                    .foregroundColor(VColors.danger)
            }
        }
    }
    
    private var backgroundColor: Color {
        colorScheme == .dark ? VColors.surfaceDark : VColors.surface
    }
    
    private var borderColor: Color {
        if errorMessage != nil {
            return VColors.danger
        }
        return isFocused 
            ? (colorScheme == .dark ? VColors.primaryDark : VColors.primary)
            : (colorScheme == .dark ? VColors.borderDark : VColors.border)
    }
}
