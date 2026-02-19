//
//  WelcomeView.swift
//  VemakinApp-IOS
//
//  Welcome Screen - First Launch
//

import SwiftUI

struct WelcomeView: View {
    @Environment(\.colorScheme) private var colorScheme
    @State private var showLogin = false
    @State private var showRegister = false
    var onLocalModeSelected: () -> Void
    
    var body: some View {
        VStack(spacing: 40) {
            Spacer()
            
            // Logo
            VStack(spacing: 16) {
                Image(systemName: "camera.aperture")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 120, height: 120)
                    .foregroundStyle(VColors.primary)
                
                VStack(spacing: 8) {
                    Text("Vemakin")
                        .font(VTypography.largeTitle)
                        .foregroundColor(colorScheme == .dark ? .white : VColors.textPrimary)
                    
                    Text("Production OS for Filmmakers")
                        .font(VTypography.title3)
                        .foregroundColor(VColors.textMuted)
                }
            }
            
            Spacer()
            
            VStack(spacing: 16) {
                Button(action: onLocalModeSelected) {
                    Text("Continuer sans compte")
                        .font(VTypography.size16.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(VColors.primary)
                        .foregroundColor(.white)
                        .cornerRadius(16)
                }
                
                Text("Vos données restent sur cet appareil")
                    .font(VTypography.caption)
                    .foregroundColor(VColors.textMuted)
                
                Divider()
                    .padding(.vertical, 8)
                
                Button(action: { showLogin = true }) {
                    Text("Se connecter")
                        .font(VTypography.size16.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(colorScheme == .dark ? VColors.surfaceDark : VColors.surface)
                        .foregroundColor(colorScheme == .dark ? .white : VColors.textPrimary)
                        .cornerRadius(16)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(colorScheme == .dark ? VColors.borderDark : VColors.border, lineWidth: 1)
                        )
                }
                
                Button(action: { showRegister = true }) {
                    Text("Créer un compte")
                        .font(VTypography.size16.weight(.semibold))
                        .foregroundColor(colorScheme == .dark ? VColors.textSecondaryDark : VColors.textSecondary)
                }
            }
            
            Spacer()
        }
        .padding()
        .background(colorScheme == .dark ? VColors.backgroundDark : VColors.background)
        .sheet(isPresented: $showLogin) {
            LoginView()
        }
        .sheet(isPresented: $showRegister) {
            RegisterView()
        }
    }
}

struct LoginView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var password = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: VSpacing.xl) {
                Text("Se connecter")
                    .font(VTypography.title)
                
                VStack(spacing: VSpacing.lg) {
                    VTextField(
                        title: "Email",
                        placeholder: "votre@email.com",
                        text: $email,
                        keyboardType: .emailAddress,
                        autocapitalization: .never
                    )
                    
                    VTextField(
                        title: "Mot de passe",
                        placeholder: "••••••••",
                        text: $password,
                        isSecure: true
                    )
                }
                
                Button(action: {
                    dismiss()
                }) {
                    Text("Se connecter")
                        .font(VTypography.size16.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(VColors.primary)
                        .foregroundColor(.white)
                        .cornerRadius(16)
                }
                
                Spacer()
            }
            .padding()
            .navigationBarItems(trailing: Button("Fermer") { dismiss() })
        }
    }
}

struct RegisterView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: VSpacing.xl) {
                Text("Créer un compte")
                    .font(VTypography.title)
                
                VStack(spacing: VSpacing.lg) {
                    VTextField(
                        title: "Email",
                        placeholder: "votre@email.com",
                        text: $email,
                        keyboardType: .emailAddress,
                        autocapitalization: .never
                    )
                    
                    VTextField(
                        title: "Mot de passe",
                        placeholder: "••••••••",
                        text: $password,
                        isSecure: true
                    )
                    
                    VTextField(
                        title: "Confirmer le mot de passe",
                        placeholder: "••••••••",
                        text: $confirmPassword,
                        isSecure: true
                    )
                }
                
                Button(action: {
                    dismiss()
                }) {
                    Text("Créer un compte")
                        .font(VTypography.size16.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(VColors.primary)
                        .foregroundColor(.white)
                        .cornerRadius(16)
                }
                
                Spacer()
            }
            .padding()
            .navigationBarItems(trailing: Button("Fermer") { dismiss() })
        }
    }
}
