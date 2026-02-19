# CAHIER DES CHARGES - VEMAKIN iOS

**Version:** 1.0  
**Date:** February 2026  
**Project:** Vemakin iOS Application  
**Platform:** iOS 17.0+  
**Framework:** SwiftUI + Swift Data  

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Design System détaillé](#3-design-system-détaillé)
4. [Flux utilisateur](#4-flux-utilisateur)
5. [Écrans et fonctionnalités](#5-écrans-et-fonctionnalités)
6. [Modèles de données](#6-modèles-de-données)
7. [Intégration API](#7-intégration-api)
8. [Mode Local-only](#8-mode-local-only)
9. [Migration et synchronisation](#9-migration-et-synchronisation)
10. [Tests et qualité](#10-tests-et-qualité)
11. [Actions manuelles requises](#11-actions-manuelles-requises)
12. [Checklist de développement](#12-checklist-de-développement)

---

## 1. VUE D'ENSEMBLE DU PROJET

### 1.1 Objectif

Créer une application iOS native pour Vemakin (Production OS pour le cinéma) avec les caractéristiques suivantes :

- **Mode sans compte** : L'utilisateur peut utiliser l'app entièrement sans créer de compte
- **Mode cloud** : Synchronisation avec le backend existant en Go
- **Mode hybride** : Commencer en local, migrer vers le cloud plus tard
- **100% offline capable** : Toutes les fonctionnalités marchent sans internet
- **Catalogue de matériel inclus** : Base de données complète embarquée dans l'app

### 1.2 Fonctionnalités principales

1. **Gestion des projets** - CRUD complet
2. **Gestion des plans (Shots)** - Timeline, checklists, localisation
3. **Inventaire** - Matériel personnel avec catalogue intégré
4. **Pipeline post-production** - Kanban board avec tâches
5. **Notes** - Liées aux plans et tâches
6. **Synchronisation** - Cloud avec résolution de conflits

### 1.3 Contraintes techniques

- iOS 17.0 minimum (SwiftUI moderne, Swift Data)
- Swift 5.9+ avec async/await
- Swift Data pour le stockage local
- Firebase Auth pour l'authentification cloud
- Design identique à l'application web React existante

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Structure du projet

```
Vemakin-iOS/
├── App/
│   ├── VemakinApp.swift
│   ├── AppDelegate.swift
│   └── Info.plist
├── Core/
│   ├── Architecture/
│   │   ├── UserModeManager.swift
│   │   ├── DIContainer.swift
│   │   └── NavigationCoordinator.swift
│   ├── DesignSystem/
│   │   ├── VColors.swift
│   │   ├── VTypography.swift
│   │   ├── VSpacing.swift
│   │   └── Components/
│   │       ├── VButton.swift
│   │       ├── VCard.swift
│   │       ├── VTextField.swift
│   │       ├── VTimeline.swift
│   │       ├── VGlassEffect.swift
│   │       └── VStatusBadge.swift
│   └── Extensions/
├── Data/
│   ├── SwiftData/
│   │   ├── Models/
│   │   │   ├── LocalUser.swift
│   │   │   ├── LocalProject.swift
│   │   │   ├── LocalShot.swift
│   │   │   ├── LocalEquipment.swift
│   │   │   ├── LocalTask.swift
│   │   │   ├── LocalNote.swift
│   │   │   ├── CatalogCategory.swift
│   │   │   ├── CatalogBrand.swift
│   │   │   └── CatalogItem.swift
│   │   ├── Repositories/
│   │   │   ├── ProjectRepository.swift
│   │   │   ├── ShotRepository.swift
│   │   │   ├── EquipmentRepository.swift
│   │   │   ├── TaskRepository.swift
│   │   │   └── NoteRepository.swift
│   │   └── CatalogSeeder.swift
│   ├── Remote/
│   │   ├── API/
│   │   │   ├── APIClient.swift
│   │   │   ├── APIEndpoints.swift
│   │   │   └── APIModels.swift
│   │   ├── Firebase/
│   │   │   └── FirebaseAuthService.swift
│   │   └── Sync/
│   │       ├── SyncEngine.swift
│   │       ├── DataMigrationService.swift
│   │       └── ConflictResolver.swift
│   └── Export/
│       └── DataExportService.swift
├── Features/
│   ├── Welcome/
│   ├── Auth/
│   ├── Dashboard/
│   ├── Projects/
│   ├── Shots/
│   ├── Inventory/
│   ├── Pipeline/
│   ├── Notes/
│   └── Settings/
└── Resources/
    ├── Assets.xcassets/
    ├── catalog_seed.json
    └── Localizable.strings
```

### 2.2 Architecture MVVM + Clean Architecture

**Couche Présentation (UI)**
- Views en SwiftUI
- ViewModels avec `@Observable`
- Gestion d'état réactive

**Couche Domain**
- Entités (modèles métier)
- Use Cases (logique métier)
- Repository Protocols

**Couche Data**
- Swift Data (local)
- API Client (remote)
- Repositories (implémentations)

---

## 3. DESIGN SYSTEM DÉTAILLÉ

### 3.1 Palette de couleurs

```swift
// Fichier: Core/DesignSystem/VColors.swift

import SwiftUI

struct VColors {
    // MARK: - Primary
    static let primary = Color(hex: "#3762E3")      // Light mode
    static let primaryDark = Color(hex: "#4E47DD")  // Dark mode
    
    // MARK: - Background
    static let background = Color(hex: "#F2F2F7")      // Light
    static let backgroundDark = Color(hex: "#0F1116")  // Dark
    static let backgroundDarker = Color(hex: "#090A0D") // Dark secondary
    
    // MARK: - Surface (Cards, containers)
    static let surface = Color.white
    static let surfaceDark = Color(hex: "#16181D")
    static let surfaceDarker = Color(hex: "#0F1116")
    
    // MARK: - Border
    static let border = Color(hex: "#E5E5E5")
    static let borderDark = Color.white.opacity(0.08)
    
    // MARK: - Text
    static let textPrimary = Color(hex: "#111827")
    static let textPrimaryDark = Color.white
    static let textSecondary = Color(hex: "#374151")
    static let textSecondaryDark = Color(hex: "#E5E5E5")
    static let textMuted = Color(hex: "#6B7280")
    static let textMutedDark = Color(hex: "#9CA3AF")
    
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
}

// MARK: - Extensions
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
```

### 3.2 Typographie

```swift
// Fichier: Core/DesignSystem/VTypography.swift

import SwiftUI

struct VTypography {
    // MARK: - Font Families
    static let fontFamily = "SF Pro" // System font
    
    // MARK: - Sizes
    static let size10: Font = .system(size: 10, weight: .regular)
    static let size12: Font = .system(size: 12, weight: .regular)
    static let size14: Font = .system(size: 14, weight: .regular)
    static let size16: Font = .system(size: 16, weight: .regular)
    static let size18: Font = .system(size: 18, weight: .regular)
    static let size20: Font = .system(size: 20, weight: .regular)
    static let size24: Font = .system(size: 24, weight: .regular)
    static let size32: Font = .system(size: 32, weight: .regular)
    
    // MARK: - Presets
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
```

### 3.3 Espacements et Layout

```swift
// Fichier: Core/DesignSystem/VSpacing.swift

import SwiftUI

struct VSpacing {
    // MARK: - Padding
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let xxl: CGFloat = 24
    static let xxxl: CGFloat = 32
    
    // MARK: - Component Spacing
    static let cardPadding: CGFloat = 16
    static let sectionSpacing: CGFloat = 24
    static let elementSpacing: CGFloat = 12
    
    // MARK: - Corner Radius
    static let radiusSm: CGFloat = 12
    static let radiusMd: CGFloat = 16
    static let radiusLg: CGFloat = 20
    static let radiusXl: CGFloat = 24
    static let radiusFull: CGFloat = 9999
}
```

### 3.4 Composants UI détaillés

#### VButton

```swift
// Fichier: Core/DesignSystem/Components/VButton.swift

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
```

#### VCard

```swift
// Fichier: Core/DesignSystem/Components/VCard.swift

import SwiftUI

struct VCard<Content: View>: View {
    enum CardVariant {
        case `default`     // White/Dark background
        case glass         // Glassmorphism effect
        case flat          // Subtle background
        case window        // macOS window style
        case elevated      // With shadow
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
        default:
            return colorScheme == .dark 
                ? VColors.borderDark 
                : VColors.border
        }
    }
    
    private var borderWidth: CGFloat {
        variant == .window ? 1 : 0.5
    }
    
    private var shadowColor: Color {
        variant == .elevated 
            ? Color.black.opacity(colorScheme == .dark ? 0.3 : 0.1)
            : Color.clear
    }
    
    private var shadowRadius: CGFloat {
        variant == .elevated ? 8 : 0
    }
    
    private var shadowY: CGFloat {
        variant == .elevated ? 4 : 0
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
```

#### VTextField

```swift
// Fichier: Core/DesignSystem/Components/VTextField.swift

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
    @State private var isFocused: Bool = false
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
            .onTapGesture {
                isFocused = true
            }
            
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
```

#### VTimelineItem

```swift
// Fichier: Core/DesignSystem/Components/VTimeline.swift

import SwiftUI

struct VTimelineItem: View {
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
```

---

## 4. FLUX UTILISATEUR

### 4.1 Premier lancement

```
┌─────────────────────────────────────────────────────────────────┐
│                     Premier Lancement                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│ Splash Screen│
│   (Logo)     │
└──────┬───────┘
       │
       ▼
┌──────────────────┐     ┌──────────────────┐
│  A déjà un mode  │────▶│   Restaurer le   │
│   enregistré ?   │     │   mode précédent │
└──────┬───────────┘     └──────────────────┘
       │ Non
       ▼
┌─────────────────────────────────────────────┐
│              Écran de bienvenue              │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │              LOGO                   │   │
│  │           VEMAKIN                   │   │
│  │   Production OS for Filmmakers      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Continuer sans compte              │   │
│  │  (données locales uniquement)       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Se connecter                       │   │
│  │  (compte existant)                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Créer un compte                    │   │
│  │  (synchronisation cloud)            │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
       │
       ├──▶ "Continuer sans compte" ──▶ Mode Local
       │                                    (Création user local)
       │
       ├──▶ "Se connecter" ───────────▶ Écran Login
       │                                    └──▶ Mode Cloud
       │
       └──▶ "Créer un compte" ────────▶ Écran Inscription
                                            └──▶ Mode Cloud
```

### 4.2 Mode Local - Navigation principale

```
┌─────────────────────────────────────────────────────────────────┐
│                    Navigation - Mode Local                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           Tab Bar (Bottom)              │
├──────────┬──────────┬──────────┬────────┤
│ Overview │  Shots   │ Inventory│ Pipeline│ Notes │
│  (house) │(camera)  │ (box)    │ (list)  │(note) │
└──────────┴──────────┴──────────┴────────┘

Chaque onglet a une NavigationView imbriquée :

Overview (Vue d'ensemble)
├── Liste des projets récents
├── Statistiques rapides
├── Shots du jour
└── Tâches en retard

Shots (Plans)
├── Liste/Timeline des shots
├── Filtres (date, statut)
├── Créer nouveau shot
├── Détail d'un shot
│   ├── Édition
│   ├── Checklist équipement
│   └── Notes associées

Inventory (Inventaire)
├── Grid/Liste du matériel
├── Filtres (catégorie, statut)
├── Créer nouvel équipement
├── Détail équipement
│   ├── Édition
│   └── Lien vers catalogue
└── Catalogue (browse)
    ├── Catégories
    ├── Marques
    └── Items avec specs

Pipeline (Post-prod)
├── Kanban board (4 colonnes)
│   ├── TODO
│   ├── IN PROGRESS
│   ├── REVIEW
│   └── DONE
├── Filtres (catégorie, priorité)
├── Créer nouvelle tâche
└── Détail tâche

Notes
├── Liste des notes
├── Filtres (projet, date)
├── Créer nouvelle note
└── Détail note (éditeur riche)
```

### 4.3 Mode Cloud - Navigation

Identique au mode local, mais avec :
- Indicateur de sync dans la navbar
- Option "Synchroniser maintenant" dans Settings
- Gestion des conflits si nécessaire

### 4.4 Migration Local → Cloud

```
┌─────────────────────────────────────────────────────────────────┐
│              Migration Local vers Cloud                          │
└─────────────────────────────────────────────────────────────────┘

1. Utilisateur se connecte/crée compte
       │
       ▼
2. Détection données locales existantes
       │
       ├──▶ Aucune donnée ────────▶ Mode Cloud direct
       │
       └──▶ Données trouvées
              │
              ▼
       ┌──────────────────────────────┐
       │   Dialog : Migrer les données? │
       │                              │
       │   "Vous avez X projets,      │
       │    Y shots en local"         │
       │                              │
       │   [Oui, migrer]              │
       │   [Non, commencer frais]     │
       └──────────────────────────────┘
              │
              ├──▶ "Non" ────────────▶ Suppression données locales
              │                         Mode Cloud (vide)
              │
              └──▶ "Oui"
                     │
                     ▼
              ┌─────────────────┐
              │  Vérification   │
              │ compte cloud    │
              │ a déjà données? │
              └────────┬────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌────────┐   ┌──────────┐  ┌──────────┐
    │  Vide  │   │ Données  │  │ Conflits │
    └───┬────┘   │ existantes│  │ détectés │
        │        └────┬─────┘  └────┬─────┘
        │             │             │
        ▼             ▼             ▼
   Upload direct   Merge data    Résolution
   local→cloud    intelligent   manuelle
        │             │             │
        └─────────────┴─────────────┘
                      │
                      ▼
               ┌──────────────┐
               │ Confirmation │
               │ migration    │
               │ réussie      │
               └──────────────┘
```

---

## 5. ÉCRANS ET FONCTIONNALITÉS

### 5.1 Écran de bienvenue (WelcomeView)

**Objectif** : Permettre à l'utilisateur de choisir son mode

**Layout** :
```
┌─────────────────────────────────────┐
│                                     │
│           [LOGO 120x120]            │
│                                     │
│          VEMAKIN                    │
│   Production OS for Filmmakers      │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Continuer sans compte      │   │
│  │  → Données stockées localement│  │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Se connecter               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Créer un compte            │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Comportement** :
- Si appui sur "Continuer sans compte" → Mode Local
- Si appui sur "Se connecter" → Modal LoginView
- Si appui sur "Créer un compte" → Modal RegisterView

**Code SwiftUI** :
```swift
struct WelcomeView: View {
    @Environment(UserModeManager.self) private var modeManager
    @State private var showLogin = false
    @State private var showRegister = false
    
    var body: some View {
        VStack(spacing: 40) {
            Spacer()
            
            // Logo
            Image("vemakin_logo")
                .resizable()
                .scaledToFit()
                .frame(width: 120, height: 120)
            
            VStack(spacing: 8) {
                Text("Vemakin")
                    .font(VTypography.largeTitle)
                
                Text("Production OS for Filmmakers")
                    .font(VTypography.title3)
                    .foregroundColor(VColors.textMuted)
            }
            
            Spacer()
            
            VStack(spacing: 16) {
                VButton(
                    title: "Continuer sans compte",
                    style: .primary,
                    size: .large
                ) {
                    modeManager.switchToLocalMode()
                }
                
                Text("Vos données restent sur cet appareil")
                    .font(VTypography.caption)
                    .foregroundColor(VColors.textMuted)
                
                Divider()
                    .padding(.vertical, 8)
                
                VButton(
                    title: "Se connecter",
                    style: .secondary,
                    size: .medium
                ) {
                    showLogin = true
                }
                
                VButton(
                    title: "Créer un compte",
                    style: .ghost,
                    size: .medium
                ) {
                    showRegister = true
                }
            }
            
            Spacer()
        }
        .padding()
        .sheet(isPresented: $showLogin) {
            LoginView()
        }
        .sheet(isPresented: $showRegister) {
            RegisterView()
        }
    }
}
```

### 5.2 Liste des Shots (ShotsListView)

**Deux modes d'affichage** : Timeline et Liste

**Mode Timeline** :
```
┌─────────────────────────────────────┐
│ Shots              [+] [filter]     │
├─────────────────────────────────────┤
│ [Timeline] [Liste]                  │
├─────────────────────────────────────┤
│                                     │
│  Lun 15 Fév 2026                    │
│  ━━━━━━━━━━━━━━━━━━                 │
│                                     │
│  ●─────[Shot Card 1]─────────────▶  │
│  │      Scene 1 - Opening          │
│  │      08:00 • 2h • Paris        │
│  │                                 │
│  ●─────[Shot Card 2]─────────────▶  │
│  │      Scene 2 - Park            │
│  │      10:30 • 1h30 • Lyon       │
│  │                                 │
│  ●                                  │
│                                     │
│  Mar 16 Fév 2026                    │
│  ━━━━━━━━━━━━━━━━━━                 │
│                                     │
│  ●─────[Shot Card 3]─────────────▶  │
│         Scene 3 - Studio           │
│         09:00 • 4h • Marseille     │
│                                     │
└─────────────────────────────────────┘
```

**Mode Liste** :
```
┌─────────────────────────────────────┐
│ Shots              [+] [filter]     │
├─────────────────────────────────────┤
│ [Timeline] [Liste]                  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [S1] Opening Scene          │   │
│  │     15 Fév • 08:00 • Paris  │   │
│  │     [3 équipements]         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [S2] Park Scene             │   │
│  │     15 Fév • 10:30 • Lyon   │   │
│  │     [5 équipements]         │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Features** :
- Pull-to-refresh
- Segmented control Timeline/Liste
- Search bar
- Filtres (date, statut, location)
- FAB (Floating Action Button) pour ajouter
- Swipe actions (delete, edit)

### 5.3 Détail d'un Shot (ShotDetailView)

```
┌─────────────────────────────────────┐
│ ⟨ Back    Shot Detail      [Edit]   │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  SCENE 1                    │   │
│  │  Opening Shot               │   │
│  │                             │   │
│  │  [Description du plan...]   │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  DÉTAILS                            │
│  ━━━━━━━━━━━━━━━━━━                 │
│                                     │
│  📅 Date        15 Février 2026    │
│  🕐 Heure       08:00 - 10:00      │
│  📍 Location    Paris, France      │
│  ⏱️ Durée       2h00               │
│  📝 Notes       2 notes            │
│                                     │
│  ÉQUIPEMENT REQUIS                  │
│  ━━━━━━━━━━━━━━━━━━                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ☑️ Camera Sony A7S III      │   │
│  │ ☐  Lens 24-70mm             │   │
│  │ ☑️ Tripod Manfrotto         │   │
│  │ ☐  Light Panel              │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Ajouter équipement]               │
│                                     │
│  REMARQUES                          │
│  ━━━━━━━━━━━━━━━━━━                 │
│  [Zone de texte...]                 │
│                                     │
└─────────────────────────────────────┘
```

**Sections** :
1. **Header** - Scene number, Title, Description
2. **Détails** - Date, time, location, duration
3. **Équipement** - Checklist interactive
4. **Notes** - Remarques texte libre
5. **Actions** - Edit, Delete, Duplicate

### 5.4 Inventaire (InventoryView)

**Deux modes d'affichage** : Grid et Liste

**Mode Grid** :
```
┌─────────────────────────────────────┐
│ Inventory          [+] [filter]     │
├─────────────────────────────────────┤
│ [Grid] [List]  [All ▼] [Owned ▼]   │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │   📷     │  │   🎥     │        │
│  │          │  │          │        │
│  │ Camera   │  │ Lens     │        │
│  │ Sony A7S │  │ 24-70mm  │        │
│  │          │  │          │        │
│  │ [Owned]  │  │ [Rented] │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │   💡     │  │   🎤     │        │
│  │          │  │          │        │
│  │ Light    │  │ Micro    │        │
│  │ Aputure  │  │ Rode     │        │
│  │          │  │          │        │
│  │ [Owned]  │  │ [Owned]  │        │
│  └──────────┘  └──────────┘        │
│                                     │
└─────────────────────────────────────┘
```

**Features** :
- Grid 2 colonnes ou liste
- Filtres par catégorie (Camera, Lens, Light, etc.)
- Filtre Owned/Rented/All
- Search
- Quick actions (tap to view, long press for menu)

### 5.5 Catalogue (CatalogBrowserView)

```
┌─────────────────────────────────────┐
│ ⟨ Back    Catalog           [Search]│
├─────────────────────────────────────┤
│                                     │
│  CATEGORIES                         │
│  ━━━━━━━━━━━━━━━━━━                 │
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │ 📷 │ │ 🎥 │ │ 💡 │ │ 🎤 │       │
│  │Cam │ │Lens│ │Lit │ │Aud │       │
│  └────┘ └────┘ └────┘ └────┘       │
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │ 🎬 │ │ 📺 │ │ ✈️  │ │ 🎯 │       │
│  │Tri │ │Mon │ │Dro │ │Stab│       │
│  └────┘ └────┘ └────┘ └────┘       │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Sony A7S III                       │
│  ├─ Sony A7IV                       │
│  ├─ Canon R5                        │
│  ├─ Canon R6                        │
│  └─ Panasonic S1H                   │
│                                     │
│  [Voir fiche technique]             │
│                                     │
└─────────────────────────────────────┘
```

**Navigation** :
1. Sélection catégorie
2. Sélection marque (optionnel)
3. Liste des items
4. Détail avec specs techniques

### 5.6 Pipeline Kanban (PipelineView)

```
┌─────────────────────────────────────┐
│ Pipeline      [+] [filter]          │
├─────────────────────────────────────┤
│                                     │
│ ┌──────────┬──────────┬──────────┬──────────┐
│ │  TODO    │IN PROGRESS│ REVIEW  │  DONE    │
│ │    5     │    3     │    2    │    8     │
│ ├──────────┼──────────┼──────────┼──────────┤
│ │          │          │          │          │
│ │ ┌────┐   │ ┌────┐   │ ┌────┐   │ ┌────┐   │
│ │ │Task│   │ │Task│   │ │Task│   │ │Task│   │
│ │ │ 1  │   │ │ 4  │   │ │ 7  │   │ │10  │   │
│ │ │[H] │   │ │[H] │   │ │[M] │   │ │[L] │   │
│ │ └────┘   │ └────┘   │ └────┘   │ └────┘   │
│ │          │          │          │          │
│ │ ┌────┐   │ ┌────┐   │ ┌────┐   │ ┌────┐   │
│ │ │Task│   │ │Task│   │ │Task│   │ │Task│   │
│ │ │ 2  │   │ │ 5  │   │ │ 8  │   │ │11  │   │
│ │ │[M] │   │ │[H] │   │ │[H] │   │ │[M] │   │
│ │ └────┘   │ └────┘   │ └────┘   │ └────┘   │
│ │          │          │          │          │
│ │ ┌────┐   │ ┌────┐   │          │ ┌────┐   │
│ │ │Task│   │ │Task│   │          │ │Task│   │
│ │ │ 3  │   │ │ 6  │   │          │ │12  │   │
│ │ │[L] │   │ │[M] │   │          │ │[H] │   │
│ │ └────┘   │ └────┘   │          │ └────┘   │
│ │          │          │          │          │
│ └──────────┴──────────┴──────────┴──────────┘
│                                     │
│ [H] = High  [M] = Medium  [L] = Low │
│                                     │
└─────────────────────────────────────┘
```

**Interactions** :
- Drag & drop entre colonnes
- Tap pour détail
- Swipe pour actions rapides
- FAB pour nouvelle tâche

### 5.7 Notes (NotesView)

```
┌─────────────────────────────────────┐
│ Notes               [+]             │
├─────────────────────────────────────┤
│ [All ▼] [Search...          ]       │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Note sur le plan 15         │   │
│  │                             │   │
│  │ Idées pour la prochaine     │   │
│  │ prise de vue...             │   │
│  │                             │   │
│  │ 📎 2 attachments             │   │
│  │ 🎬 Lié à: Shot #3            │   │
│  │ 📅 15 Fév 2026               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Réunion post-prod           │   │
│  │                             │   │
│  │ Points à aborder avec       │   │
│  │ l'équipe de montage...      │   │
│  │                             │   │
│  │ 📋 Lié à: Task "Editing"     │   │
│  │ 📅 14 Fév 2026               │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 5.8 Settings (SettingsView)

**Mode Local** :
```
┌─────────────────────────────────────┐
│ Settings                            │
├─────────────────────────────────────┤
│                                     │
│  MODE LOCAL                         │
│  ━━━━━━━━━━━━━━━━━━                 │
│  Vos données sont stockées          │
│  uniquement sur cet appareil        │
│                                     │
│  [Passer en mode Cloud →]           │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  DONNÉES LOCALES                    │
│  ━━━━━━━━━━━━━━━━━━                 │
│                                     │
│  Export Data                        │
│  → Créer une sauvegarde             │
│                                     │
│  Import Data                        │
│  → Restaurer depuis fichier         │
│                                     │
│  Clear All Data                     │
│  → Supprimer toutes les données     │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  PRÉFÉRENCES                        │
│  ━━━━━━━━━━━━━━━━━━                 │
│                                     │
│  Dark Mode               [Toggle]   │
│                                     │
│  Notifications           [Toggle]   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  À PROPOS                           │
│  ━━━━━━━━━━━━━━━━━━                 │
│                                     │
│  Version 1.0                        │
│  Conditions d'utilisation           │
│  Politique de confidentialité       │
│                                     │
└─────────────────────────────────────┘
```

**Mode Cloud** :
```
┌─────────────────────────────────────┐
│ Settings                            │
├─────────────────────────────────────┤
│                                     │
│  COMPTE                             │
│  ━━━━━━━━━━━━━━━━━━                 │
│  user@email.com                     │
│                                     │
│  Synchronisation                    │
│  Dernière sync: Il y a 5 min        │
│                                     │
│  [Synchroniser maintenant]          │
│                                     │
│  [Se déconnecter]                   │
│                                     │
│  ─────────────────────────────────  │
│  (reste identique)                  │
└─────────────────────────────────────┘
```

---

## 6. MODÈLES DE DONNÉES

### 6.1 Swift Data Models (Local)

```swift
// MARK: - Local User
@Model
class LocalUser {
    @Attribute(.unique) var id: String
    var createdAt: Date
    var lastModified: Date
    var darkMode: Bool
    var lastProjectId: String?
    
    @Relationship(deleteRule: .cascade, inverse: \LocalProject.user)
    var projects: [LocalProject]?
    
    @Relationship(deleteRule: .cascade, inverse: \LocalEquipment.user)
    var equipment: [LocalEquipment]?
    
    init(id: String) {
        self.id = id
        self.createdAt = Date()
        self.lastModified = Date()
        self.darkMode = true
    }
}

// MARK: - Local Project
@Model
class LocalProject {
    @Attribute(.unique) var id: String
    var userId: String
    var name: String
    var projectDescription: String?
    var createdAt: Date
    var updatedAt: Date
    
    @Relationship(deleteRule: .cascade, inverse: \LocalShot.project)
    var shots: [LocalShot]?
    
    @Relationship(deleteRule: .cascade, inverse: \LocalNote.project)
    var notes: [LocalNote]?
    
    @Relationship(deleteRule: .cascade, inverse: \LocalTask.project)
    var tasks: [LocalTask]?
    
    init(id: String, userId: String, name: String) {
        self.id = id
        self.userId = userId
        self.name = name
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}

// MARK: - Local Shot
@Model
class LocalShot {
    @Attribute(.unique) var id: String
    var projectId: String
    var title: String
    var shotDescription: String
    var status: String // "pending" | "done"
    var startTime: String? // Format "HH:mm"
    var duration: String // Format "2h30" or "150min"
    var location: String
    var locationLat: Double?
    var locationLng: Double?
    var remarks: String?
    var date: String // ISO8601 date
    var sceneNumber: String?
    var equipmentIds: [String]
    var preparedEquipmentIds: [String]
    var createdAt: Date
    var updatedAt: Date
    
    @Relationship(inverse: \LocalProject.shots)
    var project: LocalProject?
    
    @Relationship(deleteRule: .nullify, inverse: \LocalNote.shot)
    var notes: [LocalNote]?
    
    init(id: String, projectId: String, title: String) {
        self.id = id
        self.projectId = projectId
        self.title = title
        self.shotDescription = ""
        self.status = "pending"
        self.duration = ""
        self.location = ""
        self.date = ISO8601DateFormatter().string(from: Date())
        self.equipmentIds = []
        self.preparedEquipmentIds = []
        self.createdAt = Date()
        self.updatedAt = Date()
    }
    
    var isDone: Bool {
        get { status == "done" }
        set { status = newValue ? "done" : "pending" }
    }
}

// MARK: - Local Equipment
@Model
class LocalEquipment {
    @Attribute(.unique) var id: String
    var userId: String
    var name: String
    var catalogItemId: String?
    var customName: String?
    var serialNumber: String?
    var category: String // "Camera" | "Lens" | "Light" | etc.
    var pricePerDay: Double
    var rentalPrice: Double?
    var rentalFrequency: String? // "hour" | "day" | "week" | "month" | "year"
    var quantity: Int
    var isOwned: Bool
    var status: String // "operational" | "maintenance" | "broken" | "lost" | "sold"
    var brandName: String?
    var modelName: String?
    var specs: Data? // JSON encoded specs
    var purchaseDate: Date?
    var purchasePrice: Double?
    var notes: String?
    var createdAt: Date
    var updatedAt: Date
    
    @Relationship(inverse: \LocalUser.equipment)
    var user: LocalUser?
    
    init(id: String, userId: String, name: String, category: String) {
        self.id = id
        self.userId = userId
        self.name = name
        self.category = category
        self.pricePerDay = 0
        self.quantity = 1
        self.isOwned = true
        self.status = "operational"
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}

// MARK: - Local Task (Post-prod)
@Model
class LocalTask {
    @Attribute(.unique) var id: String
    var projectId: String
    var category: String // "Script" | "Editing" | "Sound" | "VFX" | "Color"
    var title: String
    var status: String // "todo" | "progress" | "review" | "done"
    var priority: String // "low" | "medium" | "high" | "critical"
    var dueDate: String? // ISO8601
    var taskDescription: String?
    var metadata: Data? // JSON additional data
    var createdAt: Date
    var updatedAt: Date
    
    @Relationship(inverse: \LocalProject.tasks)
    var project: LocalProject?
    
    @Relationship(deleteRule: .nullify, inverse: \LocalNote.task)
    var notes: [LocalNote]?
    
    init(id: String, projectId: String, category: String, title: String) {
        self.id = id
        self.projectId = projectId
        self.category = category
        self.title = title
        self.status = "todo"
        self.priority = "medium"
        self.createdAt = Date()
        self.updatedAt = Date()
    }
    
    var statusDisplayName: String {
        switch status {
        case "todo": return "To Do"
        case "progress": return "In Progress"
        case "review": return "Review"
        case "done": return "Done"
        default: return status.capitalized
        }
    }
}

// MARK: - Local Note
@Model
class LocalNote {
    @Attribute(.unique) var id: String
    var projectId: String
    var title: String
    var content: String
    var shotId: String?
    var taskId: String?
    var attachmentUrls: [String] // Local file paths
    var createdAt: Date
    var updatedAt: Date
    
    @Relationship(inverse: \LocalProject.notes)
    var project: LocalProject?
    
    @Relationship(inverse: \LocalShot.notes)
    var shot: LocalShot?
    
    @Relationship(inverse: \LocalTask.notes)
    var task: LocalTask?
    
    init(id: String, projectId: String, title: String) {
        self.id = id
        self.projectId = projectId
        self.title = title
        self.content = ""
        self.attachmentUrls = []
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}

// MARK: - Catalog Models (Read-only, pre-populated)
@Model
class CatalogCategory {
    @Attribute(.unique) var id: String
    var name: String
    var slug: String
    var iconName: String? // SF Symbol name
    var sortOrder: Int
    
    @Relationship(deleteRule: .cascade, inverse: \CatalogBrand.category)
    var brands: [CatalogBrand]?
    
    @Relationship(deleteRule: .cascade, inverse: \CatalogItem.category)
    var items: [CatalogItem]?
    
    init(id: String, name: String, slug: String) {
        self.id = id
        self.name = name
        self.slug = slug
        self.sortOrder = 0
    }
}

@Model
class CatalogBrand {
    @Attribute(.unique) var id: String
    var categoryId: String
    var name: String
    var logoUrl: String?
    
    @Relationship(inverse: \CatalogCategory.brands)
    var category: CatalogCategory?
    
    @Relationship(deleteRule: .cascade, inverse: \CatalogItem.brand)
    var items: [CatalogItem]?
    
    init(id: String, categoryId: String, name: String) {
        self.id = id
        self.categoryId = categoryId
        self.name = name
    }
}

@Model
class CatalogItem {
    @Attribute(.unique) var id: String
    var brandId: String
    var categoryId: String
    var name: String
    var itemDescription: String?
    var imageUrl: String?
    var specs: Data? // JSON specs
    var releaseYear: Int?
    var weight: Double? // in grams
    var dimensions: String? // "100x50x30mm"
    
    @Relationship(inverse: \CatalogCategory.items)
    var category: CatalogCategory?
    
    @Relationship(inverse: \CatalogBrand.items)
    var brand: CatalogBrand?
    
    init(id: String, brandId: String, categoryId: String, name: String) {
        self.id = id
        self.brandId = brandId
        self.categoryId = categoryId
        self.name = name
    }
}
```

### 6.2 Enums et Types

```swift
// MARK: - Enums

enum EquipmentCategory: String, CaseIterable {
    case camera = "Camera"
    case lens = "Lens"
    case light = "Light"
    case audio = "Audio"
    case tripod = "Tripod"
    case stabilizer = "Stabilizer"
    case grip = "Grip"
    case monitoring = "Monitoring"
    case wireless = "Wireless"
    case drone = "Drone"
    case filter = "Filter"
    case props = "Props"
    case other = "Other"
    
    var icon: String {
        switch self {
        case .camera: return "camera.fill"
        case .lens: return "viewfinder"
        case .light: return "lightbulb.fill"
        case .audio: return "mic.fill"
        case .tripod: return "arrow.down.circle.fill"
        case .stabilizer: return "hand.raised.fill"
        case .grip: return "gearshape.fill"
        case .monitoring: return "tv.fill"
        case .wireless: return "wifi"
        case .drone: return "airplane"
        case .filter: return "circle.grid.2x2.fill"
        case .props: return "cube.fill"
        case .other: return "questionmark.circle.fill"
        }
    }
}

enum EquipmentStatus: String, CaseIterable {
    case operational = "operational"
    case maintenance = "maintenance"
    case broken = "broken"
    case lost = "lost"
    case sold = "sold"
    
    var displayName: String {
        switch self {
        case .operational: return "Operational"
        case .maintenance: return "In Maintenance"
        case .broken: return "Broken"
        case .lost: return "Lost"
        case .sold: return "Sold"
        }
    }
    
    var color: Color {
        switch self {
        case .operational: return VColors.success
        case .maintenance: return VColors.warning
        case .broken, .lost, .sold: return VColors.danger
        }
    }
}

enum TaskCategory: String, CaseIterable {
    case script = "Script"
    case editing = "Editing"
    case sound = "Sound"
    case vfx = "VFX"
    case color = "Color"
    
    var color: Color {
        switch self {
        case .script: return .purple
        case .editing: return .blue
        case .sound: return .orange
        case .vfx: return .green
        case .color: return .pink
        }
    }
}

enum TaskStatus: String, CaseIterable {
    case todo = "todo"
    case progress = "progress"
    case review = "review"
    case done = "done"
    
    var displayName: String {
        switch self {
        case .todo: return "To Do"
        case .progress: return "In Progress"
        case .review: return "Review"
        case .done: return "Done"
        }
    }
}

enum TaskPriority: String, CaseIterable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case critical = "critical"
    
    var displayName: String {
        rawValue.capitalized
    }
    
    var color: Color {
        switch self {
        case .low: return .gray
        case .medium: return .blue
        case .high: return .orange
        case .critical: return .red
        }
    }
}

enum UserMode: String, Codable {
    case local
    case cloud
    case migrating
}
```

---

## 7. INTÉGRATION API

### 7.1 Configuration API

```swift
// APIConfig.swift
struct APIConfig {
    #if DEBUG
    static let baseURL = "http://localhost:8080"
    #else
    static let baseURL = "https://api.vemakin.com"
    #endif
    
    static let timeout: TimeInterval = 30
    static let retryCount = 3
}
```

### 7.2 Endpoints API

```swift
// APIEndpoints.swift
enum APIEndpoint {
    // Auth
    case login(email: String, password: String)
    case register(email: String, password: String)
    case logout
    case refreshToken
    
    // Users
    case getCurrentUser
    case updateUser(darkMode: Bool?, lastProjectId: String?)
    
    // Projects
    case listProjects
    case createProject(name: String, description: String?)
    case updateProject(id: String, name: String, description: String?)
    case deleteProject(id: String)
    
    // Shots
    case listShots(projectId: String, skip: Int, limit: Int)
    case createShot(projectId: String, shot: ShotDTO)
    case updateShot(id: String, shot: ShotDTO)
    case deleteShot(id: String, projectId: String)
    
    // Equipment
    case listEquipment
    case createEquipment(equipment: EquipmentDTO)
    case updateEquipment(id: String, equipment: EquipmentDTO)
    case deleteEquipment(id: String)
    
    // Tasks
    case listTasks(projectId: String)
    case createTask(projectId: String, task: TaskDTO)
    case updateTask(id: String, task: TaskDTO)
    case deleteTask(id: String, projectId: String)
    
    // Notes
    case listNotes(projectId: String)
    case createNote(projectId: String, note: NoteDTO)
    case updateNote(id: String, note: NoteDTO)
    case deleteNote(id: String, projectId: String)
    
    // Catalog (read-only)
    case listCategories
    case listBrands(categoryId: String?)
    case listItems(categoryId: String?, brandId: String?)
    case getItemSpecs(itemId: String)
    
    // Bulk operations
    case bulkUpload(data: BulkDataDTO)
    case bulkDownload(lastSync: Date?)
    
    var path: String {
        switch self {
        case .login: return "/auth/login"
        case .register: return "/auth/register"
        case .logout: return "/auth/logout"
        case .refreshToken: return "/auth/refresh"
        case .getCurrentUser: return "/users/me"
        case .updateUser: return "/users/me"
        case .listProjects: return "/projects"
        case .createProject: return "/projects"
        case .updateProject(let id, _, _): return "/projects/\(id)"
        case .deleteProject(let id): return "/projects/\(id)"
        case .listShots: return "/shots"
        case .createShot: return "/shots"
        case .updateShot(let id, _): return "/shots/\(id)"
        case .deleteShot(let id, _): return "/shots/\(id)"
        case .listEquipment: return "/inventory"
        case .createEquipment: return "/inventory"
        case .updateEquipment(let id, _): return "/inventory/\(id)"
        case .deleteEquipment(let id): return "/inventory/\(id)"
        case .listTasks: return "/postprod"
        case .createTask: return "/postprod"
        case .updateTask(let id, _): return "/postprod/\(id)"
        case .deleteTask(let id, _): return "/postprod/\(id)"
        case .listNotes: return "/notes"
        case .createNote: return "/notes"
        case .updateNote(let id, _): return "/notes/\(id)"
        case .deleteNote(let id, _): return "/notes/\(id)"
        case .listCategories: return "/catalog/categories"
        case .listBrands: return "/catalog/brands"
        case .listItems: return "/catalog/items"
        case .getItemSpecs(let id): return "/catalog/items/\(id)/specs"
        case .bulkUpload: return "/bulk/upload"
        case .bulkDownload: return "/bulk/download"
        }
    }
    
    var method: String {
        switch self {
        case .login, .register, .createProject, .createShot, .createEquipment, .createTask, .createNote, .bulkUpload:
            return "POST"
        case .logout, .deleteProject, .deleteShot, .deleteEquipment, .deleteTask, .deleteNote:
            return "DELETE"
        case .updateUser, .updateProject, .updateShot, .updateEquipment, .updateTask, .updateNote:
            return "PATCH"
        default:
            return "GET"
        }
    }
}

// MARK: - DTOs
struct ShotDTO: Codable {
    let id: String
    let projectId: String
    let title: String
    let description: String
    let status: String
    let startTime: String?
    let duration: String
    let location: String
    let locationLat: Double?
    let locationLng: Double?
    let remarks: String?
    let date: String
    let sceneNumber: String?
    let equipmentIds: [String]
    let preparedEquipmentIds: [String]
}

struct EquipmentDTO: Codable {
    let id: String
    let name: String
    let catalogItemId: String?
    let customName: String?
    let serialNumber: String?
    let category: String
    let pricePerDay: Double
    let rentalPrice: Double?
    let rentalFrequency: String?
    let quantity: Int
    let isOwned: Bool
    let status: String
    let brandName: String?
    let modelName: String?
    let specs: Data?
}

struct TaskDTO: Codable {
    let id: String
    let projectId: String
    let category: String
    let title: String
    let status: String
    let priority: String
    let dueDate: String?
    let description: String?
}

struct NoteDTO: Codable {
    let id: String
    let projectId: String
    let title: String
    let content: String
    let shotId: String?
    let taskId: String?
}

struct BulkDataDTO: Codable {
    let projects: [ProjectDTO]?
    let shots: [ShotDTO]?
    let equipment: [EquipmentDTO]?
    let tasks: [TaskDTO]?
    let notes: [NoteDTO]?
}
```

### 7.3 API Client

```swift
// APIClient.swift
import Foundation

actor APIClient {
    static let shared = APIClient()
    
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = APIConfig.timeout
        self.session = URLSession(configuration: config)
        
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        
        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
    }
    
    func request<T: Decodable>(_ endpoint: APIEndpoint) async throws -> T {
        guard let url = URL(string: APIConfig.baseURL + endpoint.path) else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth token if in cloud mode
        if UserModeManager.shared.currentMode == .cloud {
            let token = try await FirebaseAuthService.shared.getIDToken()
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Add body for POST/PATCH
        if ["POST", "PATCH"].contains(endpoint.method) {
            request.httpBody = try encodeBody(for: endpoint)
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        switch httpResponse.statusCode {
        case 200...299:
            return try decoder.decode(T.self, from: data)
        case 401:
            throw APIError.unauthorized
        case 404:
            throw APIError.notFound
        case 500...599:
            throw APIError.serverError(httpResponse.statusCode)
        default:
            throw APIError.unknown(httpResponse.statusCode)
        }
    }
    
    private func encodeBody(for endpoint: APIEndpoint) throws -> Data? {
        // Implementation depends on endpoint
        return nil
    }
}

enum APIError: Error {
    case invalidURL
    case invalidResponse
    case unauthorized
    case notFound
    case serverError(Int)
    case unknown(Int)
    case decodingError(Error)
}
```

---

## 8. MODE LOCAL-ONLY

### 8.1 Architecture du mode local

Le mode local utilise **Swift Data** (iOS 17+) pour persister toutes les données localement. Aucune connexion internet n'est requise.

**Caractéristiques** :
- UUID local généré automatiquement
- Toutes les fonctionnalités disponibles
- Catalogue complet embarqué
- Export/Import JSON pour backup
- Migration possible vers cloud

### 8.2 UserModeManager

```swift
// Core/Architecture/UserModeManager.swift

import SwiftUI
import FirebaseAuth

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
    
    var isLocalMode: Bool {
        currentMode == .local
    }
    
    var isCloudMode: Bool {
        currentMode == .cloud
    }
    
    func switchToLocalMode() {
        // Generate new local ID
        currentUserId = UUID().uuidString
        defaults.set(currentUserId, forKey: localUserIdKey)
        currentMode = .local
    }
    
    func switchToCloudMode(user: User) async throws {
        let hasLocalData = try await checkForLocalData()
        
        if hasLocalData {
            // Will show migration dialog
            currentMode = .migrating
        } else {
            currentUserId = user.uid
            currentMode = .cloud
        }
    }
    
    private func checkForLocalData() async throws -> Bool {
        // Check if any local data exists
        return false // Implement actual check
    }
}
```

### 8.3 Catalogue embarqué

Le catalogue complet doit être inclus dans le bundle de l'app.

**Processus de création du seed** :
```bash
#!/bin/bash
# Script: generate_catalog_seed.sh
# À exécuter manuellement quand le backend catalogue est mis à jour

echo "Fetching catalog data from backend..."

# Fetch all data
curl -s "http://localhost:8080/catalog/categories" > /tmp/categories.json
curl -s "http://localhost:8080/catalog/brands" > /tmp/brands.json  
curl -s "http://localhost:8080/catalog/items?limit=10000" > /tmp/items.json

# Create seed file
node << 'EOF'
const fs = require('fs');

const categories = JSON.parse(fs.readFileSync('/tmp/categories.json', 'utf8'));
const brands = JSON.parse(fs.readFileSync('/tmp/brands.json', 'utf8'));
const items = JSON.parse(fs.readFileSync('/tmp/items.json', 'utf8'));

const seed = {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    categories: categories,
    brands: brands,
    items: items.map(item => ({
        ...item,
        // Ensure all required fields
        specs: item.specs || {},
        description: item.description || ""
    }))
};

fs.writeFileSync('catalog_seed.json', JSON.stringify(seed, null, 2));
console.log(`Catalog seed created with ${categories.length} categories, ${brands.length} brands, ${items.length} items`);
console.log(`File size: ${(fs.statSync('catalog_seed.json').size / 1024 / 1024).toFixed(2)} MB`);
EOF

# Copy to resources
mv catalog_seed.json Vemakin-iOS/Resources/
echo "Done!"
```

**CatalogSeeder** :
```swift
// Data/SwiftData/CatalogSeeder.swift

import SwiftData

class CatalogSeeder {
    static let shared = CatalogSeeder()
    
    func seedIfNeeded(in container: ModelContainer) async {
        let context = ModelContext(container)
        
        // Check if already seeded
        let descriptor = FetchDescriptor<CatalogCategory>()
        guard let existing = try? context.fetch(descriptor), existing.isEmpty else {
            print("Catalog already seeded")
            return
        }
        
        guard let url = Bundle.main.url(forResource: "catalog_seed", withExtension: "json"),
              let data = try? Data(contentsOf: url) else {
            print("ERROR: catalog_seed.json not found in bundle!")
            return
        }
        
        do {
            let seed = try JSONDecoder().decode(CatalogSeed.self, from: data)
            
            // Insert categories
            for category in seed.categories {
                context.insert(category)
            }
            
            // Insert brands
            for brand in seed.brands {
                context.insert(brand)
            }
            
            // Insert items
            for item in seed.items {
                context.insert(item)
            }
            
            try context.save()
            print("✅ Catalog seeded successfully with \(seed.items.count) items")
        } catch {
            print("❌ Failed to seed catalog: \(error)")
        }
    }
}

struct CatalogSeed: Codable {
    let version: String
    let generatedAt: String
    let categories: [CatalogCategory]
    let brands: [CatalogBrand]
    let items: [CatalogItem]
}
```

### 8.4 Export/Import JSON

```swift
// Data/Export/DataExportService.swift

import SwiftData

class DataExportService {
    private let context: ModelContext
    
    init(context: ModelContext) {
        self.context = context
    }
    
    func exportToJSON() async throws -> URL {
        let export = try await gatherAllData()
        
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        encoder.dateEncodingStrategy = .iso8601
        
        let data = try encoder.encode(export)
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd_HH-mm-ss"
        let filename = "vemakin_export_\(formatter.string(from: Date())).json"
        
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(filename)
        try data.write(to: url)
        
        return url
    }
    
    func importFromJSON(_ url: URL) async throws {
        let data = try Data(contentsOf: url)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let importData = try decoder.decode(DataExport.self, from: data)
        
        // Clear existing data
        try await clearAllData()
        
        // Import new data
        for project in importData.projects {
            context.insert(project)
        }
        for shot in importData.shots {
            context.insert(shot)
        }
        for equipment in importData.equipment {
            context.insert(equipment)
        }
        for task in importData.tasks {
            context.insert(task)
        }
        for note in importData.notes {
            context.insert(note)
        }
        
        try context.save()
    }
    
    private func gatherAllData() async throws -> DataExport {
        let projects = try context.fetch(FetchDescriptor<LocalProject>())
        let shots = try context.fetch(FetchDescriptor<LocalShot>())
        let equipment = try context.fetch(FetchDescriptor<LocalEquipment>())
        let tasks = try context.fetch(FetchDescriptor<LocalTask>())
        let notes = try context.fetch(FetchDescriptor<LocalNote>())
        
        return DataExport(
            exportDate: Date(),
            appVersion: Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0",
            projects: projects,
            shots: shots,
            equipment: equipment,
            tasks: tasks,
            notes: notes
        )
    }
    
    private func clearAllData() async throws {
        try context.delete(model: LocalProject.self)
        try context.delete(model: LocalShot.self)
        try context.delete(model: LocalEquipment.self)
        try context.delete(model: LocalTask.self)
        try context.delete(model: LocalNote.self)
        try context.save()
    }
}

struct DataExport: Codable {
    let exportDate: Date
    let appVersion: String
    let projects: [LocalProject]
    let shots: [LocalShot]
    let equipment: [LocalEquipment]
    let tasks: [LocalTask]
    let notes: [LocalNote]
}
```

---

## 9. MIGRATION ET SYNCHRONISATION

### 9.1 DataMigrationService

```swift
// Data/Remote/Sync/DataMigrationService.swift

import SwiftData
import FirebaseAuth

class DataMigrationService {
    private let localContext: ModelContext
    private let apiClient: APIClient
    
    func migrateToCloud(firebaseUser: User) async throws -> MigrationResult {
        // Step 1: Extract local data
        let localData = try await extractLocalData()
        
        // Step 2: Check cloud data
        let cloudData = try await fetchCloudData()
        
        // Step 3: Merge data
        let mergedData = try await mergeData(local: localData, cloud: cloudData)
        
        // Step 4: Upload to cloud
        try await uploadToCloud(mergedData, userId: firebaseUser.uid)
        
        // Step 5: Clear local data
        try await clearLocalData()
        
        return MigrationResult(
            projectsMigrated: mergedData.projects.count,
            shotsMigrated: mergedData.shots.count,
            equipmentMigrated: mergedData.equipment.count,
            tasksMigrated: mergedData.tasks.count,
            notesMigrated: mergedData.notes.count
        )
    }
    
    private func extractLocalData() async throws -> LocalData {
        return LocalData(
            projects: try localContext.fetch(FetchDescriptor<LocalProject>()),
            shots: try localContext.fetch(FetchDescriptor<LocalShot>()),
            equipment: try localContext.fetch(FetchDescriptor<LocalEquipment>()),
            tasks: try localContext.fetch(FetchDescriptor<LocalTask>()),
            notes: try localContext.fetch(FetchDescriptor<LocalNote>())
        )
    }
    
    private func fetchCloudData() async throws -> CloudData {
        // Fetch from API
        return CloudData(projects: [], shots: [], equipment: [], tasks: [], notes: [])
    }
    
    private func mergeData(local: LocalData, cloud: CloudData) async throws -> MergedData {
        // Merge projects
        var mergedProjects = cloud.projects
        for localProject in local.projects {
            if !mergedProjects.contains(where: { $0.name == localProject.name }) {
                mergedProjects.append(localProject)
            }
        }
        
        // Similar for other entities
        
        return MergedData(
            projects: mergedProjects,
            shots: local.shots + cloud.shots,
            equipment: local.equipment + cloud.equipment,
            tasks: local.tasks + cloud.tasks,
            notes: local.notes + cloud.notes
        )
    }
    
    private func uploadToCloud(_ data: MergedData, userId: String) async throws {
        let dto = BulkDataDTO(
            projects: data.projects.map { $0.toDTO() },
            shots: data.shots.map { $0.toDTO() },
            equipment: data.equipment.map { $0.toDTO() },
            tasks: data.tasks.map { $0.toDTO() },
            notes: data.notes.map { $0.toDTO() }
        )
        
        _ = try await apiClient.request(APIEndpoint.bulkUpload(data: dto)) as APIResponse
    }
}

struct MigrationResult {
    let projectsMigrated: Int
    let shotsMigrated: Int
    let equipmentMigrated: Int
    let tasksMigrated: Int
    let notesMigrated: Int
}
```

### 9.2 Vue de migration

```swift
// Features/Welcome/MigrationView.swift

struct MigrationView: View {
    @State private var isMigrating = false
    @State private var progress: Double = 0
    @State private var result: MigrationResult?
    @State private var error: Error?
    
    let onComplete: () -> Void
    
    var body: some View {
        VStack(spacing: 24) {
            if isMigrating {
                migrationProgressView
            } else if let result = result {
                migrationSuccessView(result: result)
            } else if error != nil {
                migrationErrorView
            } else {
                migrationPromptView
            }
        }
        .padding()
    }
    
    private var migrationProgressView: some View {
        VStack(spacing: 16) {
            ProgressView(value: progress)
                .progressViewStyle(.linear)
            
            Text("Migration en cours...")
                .font(VTypography.headline)
            
            Text("\(Int(progress * 100))%")
                .font(VTypography.caption)
                .foregroundColor(VColors.textMuted)
        }
    }
    
    private func migrationSuccessView(result: MigrationResult) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(VColors.success)
            
            Text("Migration réussie !")
                .font(VTypography.title2)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("• \(result.projectsMigrated) projets")
                Text("• \(result.shotsMigrated) plans")
                Text("• \(result.equipmentMigrated) équipements")
                Text("• \(result.tasksMigrated) tâches")
                Text("• \(result.notesMigrated) notes")
            }
            
            VButton(
                title: "Continuer",
                style: .primary,
                size: .large
            ) {
                onComplete()
            }
        }
    }
    
    private var migrationErrorView: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 60))
                .foregroundColor(VColors.danger)
            
            Text("Erreur de migration")
                .font(VTypography.headline)
            
            VButton(
                title: "Réessayer",
                style: .primary,
                size: .medium
            ) {
                startMigration()
            }
        }
    }
    
    private var migrationPromptView: some View {
        VStack(spacing: 16) {
            Image(systemName: "icloud.and.arrow.up")
                .font(.system(size: 60))
                .foregroundColor(VColors.primary)
            
            Text("Migrer vos données ?")
                .font(VTypography.title2)
            
            Text("Vous avez des données locales qui peuvent être migrées vers votre compte cloud.")
                .multilineTextAlignment(.center)
                .foregroundColor(VColors.textMuted)
            
            VStack(spacing: 12) {
                VButton(
                    title: "Oui, migrer mes données",
                    style: .primary,
                    size: .large
                ) {
                    startMigration()
                }
                
                VButton(
                    title: "Non, commencer frais",
                    style: .secondary,
                    size: .medium
                ) {
                    skipMigration()
                }
            }
        }
    }
    
    private func startMigration() {
        isMigrating = true
        // Start migration process
    }
    
    private func skipMigration() {
        // Clear local data and continue
        onComplete()
    }
}
```

---

## 10. TESTS ET QUALITÉ

### 10.1 Tests unitaires

```swift
// Tests/UnitTests/ShotRepositoryTests.swift

import XCTest
import SwiftData
@testable import Vemakin

@MainActor
final class ShotRepositoryTests: XCTestCase {
    var container: ModelContainer!
    var context: ModelContext!
    var repository: ShotRepository!
    
    override func setUp() {
        super.setUp()
        
        let config = ModelConfiguration(isStoredInMemoryOnly: true)
        container = try! ModelContainer(
            for: LocalShot.self, LocalProject.self,
            configurations: config
        )
        context = ModelContext(container)
        repository = ShotRepository(context: context)
    }
    
    func testCreateShot() async throws {
        let shot = LocalShot(
            id: UUID().uuidString,
            projectId: "project-1",
            title: "Test Shot"
        )
        
        try await repository.save(shot)
        
        let fetched = try await repository.fetch(byId: shot.id)
        XCTAssertEqual(fetched?.title, "Test Shot")
    }
    
    func testUpdateShot() async throws {
        let shot = LocalShot(
            id: UUID().uuidString,
            projectId: "project-1",
            title: "Original"
        )
        
        try await repository.save(shot)
        
        shot.title = "Updated"
        try await repository.save(shot)
        
        let fetched = try await repository.fetch(byId: shot.id)
        XCTAssertEqual(fetched?.title, "Updated")
    }
    
    func testDeleteShot() async throws {
        let shot = LocalShot(
            id: UUID().uuidString,
            projectId: "project-1",
            title: "To Delete"
        )
        
        try await repository.save(shot)
        try await repository.delete(shot)
        
        let fetched = try await repository.fetch(byId: shot.id)
        XCTAssertNil(fetched)
    }
}
```

### 10.2 Tests UI

```swift
// Tests/UITests/ShotsUITests.swift

import XCTest

final class ShotsUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        app = XCUIApplication()
        app.launchArguments = ["--uitesting", "--reset-data"]
        app.launch()
    }
    
    func testCreateShot() {
        // Select continue without account
        app.buttons["Continuer sans compte"].tap()
        
        // Navigate to shots
        app.tabBars.buttons["Shots"].tap()
        
        // Tap add button
        app.navigationBars["Shots"].buttons["Add"].tap()
        
        // Fill form
        let titleField = app.textFields["Title"]
        titleField.tap()
        titleField.typeText("Test Shot")
        
        // Save
        app.buttons["Save"].tap()
        
        // Verify
        XCTAssertTrue(app.staticTexts["Test Shot"].exists)
    }
    
    func testToggleShotStatus() {
        // Create shot first
        testCreateShot()
        
        // Tap status indicator
        app.buttons["pending"].firstMatch.tap()
        
        // Verify status changed
        XCTAssertTrue(app.buttons["done"].exists)
    }
}
```

### 10.3 Performance Tests

```swift
// Tests/PerformanceTests/CatalogPerformanceTests.swift

import XCTest
@testable import Vemakin

final class CatalogPerformanceTests: XCTestCase {
    func testCatalogLoadingPerformance() {
        measure {
            // Load catalog
            let expectation = expectation(description: "Catalog loaded")
            
            Task {
                _ = try? await CatalogRepository.shared.fetchAllItems()
                expectation.fulfill()
            }
            
            wait(for: [expectation], timeout: 5)
        }
    }
}
```

---

## 11. ACTIONS MANUELLES REQUISES

### 11.1 Configuration initiale (Une fois)

**1. Créer le projet Xcode**
```bash
# MANUEL: Créer un nouveau projet Xcode
# - Ouvrir Xcode 15+
# - File → New → Project
# - Sélectionner "App" sous iOS
# - Nom: Vemakin
# - Organization: Votre org
# - Interface: SwiftUI
# - Language: Swift
# - Storage: Swift Data
```

**2. Configuration Firebase**
```bash
# MANUEL: Configuration Firebase
# 1. Aller sur https://console.firebase.google.com
# 2. Créer un nouveau projet "Vemakin"
# 3. Ajouter une app iOS
#    - Bundle ID: com.votreorg.vemakin
#    - Télécharger GoogleService-Info.plist
# 4. Placer GoogleService-Info.plist dans Vemakin-iOS/Resources/
# 5. Activer Authentication (Email/Password)
```

**3. Générer le catalogue seed**
```bash
# MANUEL: Exécuter ce script quand le backend catalogue est prêt

# Prerequisites: Node.js installé
# Le backend doit être accessible

cd Vemakin-iOS

# Créer le script
cat > generate_catalog.sh << 'EOF'
#!/bin/bash
BACKEND_URL="http://localhost:8080"  # Modifier selon votre backend

echo "Fetching catalog data..."

curl -s "$BACKEND_URL/catalog/categories" > /tmp/categories.json
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to fetch categories"
    exit 1
fi

curl -s "$BACKEND_URL/catalog/brands" > /tmp/brands.json
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to fetch brands"
    exit 1
fi

curl -s "$BACKEND_URL/catalog/items?limit=10000" > /tmp/items.json
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to fetch items"
    exit 1
fi

# Node script to combine
node << 'NODE_EOF'
const fs = require('fs');

const categories = JSON.parse(fs.readFileSync('/tmp/categories.json', 'utf8'));
const brands = JSON.parse(fs.readFileSync('/tmp/brands.json', 'utf8'));
const items = JSON.parse(fs.readFileSync('/tmp/items.json', 'utf8'));

const seed = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    categories: categories,
    brands: brands,
    items: items
};

fs.writeFileSync('Resources/catalog_seed.json', JSON.stringify(seed, null, 2));
console.log('✅ catalog_seed.json created');
console.log(`   Categories: ${categories.length}`);
console.log(`   Brands: ${brands.length}`);
console.log(`   Items: ${items.length}`);
console.log(`   Size: ${(fs.statSync('Resources/catalog_seed.json').size / 1024 / 1024).toFixed(2)} MB`);
NODE_EOF

EOF

chmod +x generate_catalog.sh
./generate_catalog.sh
```

**4. Configuration des assets**
```bash
# MANUEL: Ajouter les images
# 1. Ouvrir Assets.xcassets dans Xcode
# 2. Créer un nouvel asset "vemakin_logo"
# 3. Ajouter les images @1x, @2x, @3x
# 4. Répéter pour les icônes de catégories si nécessaire
```

**5. Configuration App Icon**
```bash
# MANUEL: Créer l'icône de l'app
# 1. Utiliser un outil comme https://appicon.co/
# 2. Générer tous les formats requis
# 3. Drag & drop dans Assets.xcassets/AppIcon
```

### 11.2 Développement régulier

**Mise à jour du catalogue**
```bash
# MANUEL: Exécuter quand le backend catalogue change
./generate_catalog.sh
# Puis rebuild l'app
```

**Tests manuels**
```
MANUEL: Scénarios de test à vérifier

1. Premier lancement
   ☐ L'écran de bienvenue s'affiche
   ☐ "Continuer sans compte" fonctionne
   ☐ Mode local activé

2. Création de données
   ☐ Créer un projet
   ☐ Créer un shot avec équipement
   ☐ Créer un item d'inventaire
   ☐ Créer une tâche dans le pipeline
   ☐ Créer une note

3. Mode local
   ☐ Toutes les fonctionnalités marchent
   ☐ Export JSON fonctionne
   ☐ Import JSON fonctionne
   ☐ Pas de crash sans réseau

4. Migration
   ☐ Avec données locales, se connecter
   ☐ Dialog de migration s'affiche
   ☐ Migration réussie
   ☐ Données présentes en cloud

5. Mode cloud
   ☐ Synchronisation automatique
   ☐ Conflits résolus correctement
   ☐ Déconnexion fonctionne
```

### 11.3 Déploiement

**Configuration signing**
```
MANUEL: Configuration signing pour App Store

1. Apple Developer Portal
   ☐ Créer App ID (com.votreorg.vemakin)
   ☐ Activer les capabilities nécessaires

2. Xcode
   ☐ Sélectionner la team
   ☐ Générer le provisioning profile
   ☐ Vérifier que build succeed

3. App Store Connect
   ☐ Créer la fiche de l'app
   ☐ Upload screenshots
   ☐ Remplir les métadonnées
```

---

## 12. CHECKLIST DE DÉVELOPPEMENT

### Phase 1: Foundation

- [ ] Créer le projet Xcode avec Swift Data
- [ ] Configurer Firebase (GoogleService-Info.plist)
- [ ] Créer les modèles Swift Data
- [ ] Implémenter le Design System (colors, typography, components)
- [ ] Créer UserModeManager
- [ ] Créer WelcomeView
- [ ] Configurer le ModelContainer

### Phase 2: Local-Only Infrastructure

- [ ] Implémenter CatalogSeeder
- [ ] Créer catalog_seed.json
- [ ] Implémenter tous les repositories
- [ ] Créer DataExportService (export/import)
- [ ] Tester le mode local complet

### Phase 3: Core Features

- [ ] Projects (CRUD complet)
- [ ] Shots (timeline + list views)
- [ ] Equipment checklists
- [ ] Location picker
- [ ] Inventory (grid + list)
- [ ] Catalog browser

### Phase 4: Pipeline & Notes

- [ ] Kanban board
- [ ] Drag & drop
- [ ] Task management
- [ ] Notes system
- [ ] Rich text editor

### Phase 5: Migration & Cloud

- [ ] Firebase Auth integration
- [ ] API Client
- [ ] DataMigrationService
- [ ] MigrationView
- [ ] Sync engine
- [ ] Conflict resolution

### Phase 6: Polish

- [ ] Settings (les deux modes)
- [ ] Dark mode optimization
- [ ] Haptic feedback
- [ ] App icon
- [ ] Launch screen
- [ ] Onboarding
- [ ] Documentation

### Phase 7: Release

- [ ] Tests unitaires > 80% coverage
- [ ] Tests UI complets
- [ ] Performance tests
- [ ] Beta TestFlight
- [ ] App Store submission

---

## ANNEXES

### A. Structure du fichier catalog_seed.json

```json
{
  "version": "1.0.0",
  "generatedAt": "2026-02-19T10:00:00Z",
  "categories": [
    {
      "id": "cat-1",
      "name": "Camera",
      "slug": "camera",
      "iconName": "camera.fill",
      "sortOrder": 1
    }
  ],
  "brands": [
    {
      "id": "brand-1",
      "categoryId": "cat-1",
      "name": "Sony"
    }
  ],
  "items": [
    {
      "id": "item-1",
      "brandId": "brand-1",
      "categoryId": "cat-1",
      "name": "A7S III",
      "description": "Full-frame mirrorless camera",
      "imageUrl": "https://...",
      "specs": {
        "sensor": "12.1MP Full-Frame",
        "video": "4K 120fps",
        "iso": "80-102400"
      },
      "releaseYear": 2020,
      "weight": 614
    }
  ]
}
```

### B. Commandes utiles

```bash
# Build
xcodebuild -scheme Vemakin -destination 'platform=iOS Simulator,name=iPhone 15 Pro'

# Test
xcodebuild test -scheme Vemakin -destination 'platform=iOS Simulator,name=iPhone 15 Pro'

# Archive
xcodebuild archive -scheme Vemakin -archivePath Vemakin.xcarchive

# Export IPA
xcodebuild -exportArchive -archivePath Vemakin.xcarchive -exportPath ./build
```

### C. Ressources externes

- **Design System**: Basé sur `/front/design-system.ts`
- **API**: Backend Go existant
- **Catalog**: À générer depuis le backend
- **Icons**: SF Symbols (système)
- **Auth**: Firebase Authentication

---

## CONTACT ET SUPPORT

Pour questions sur ce cahier des charges:
- Référencer le nom de la section
- Indiquer la version du document (1.0)

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-19  
**Status:** Ready for implementation
