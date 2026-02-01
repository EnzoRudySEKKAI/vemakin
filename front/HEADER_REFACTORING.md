# Architecture Atomique - Refactoring Header

## Résumé des modifications

### Avant
- **Header.tsx** : 979 lignes
- **Architecture** : Monolithique avec 78 props
- **Problèmes** : Code dupliqué, difficulté de maintenance

### Après
- **Header.tsx** : 316 lignes (-67%)
- **Architecture** : Atomique avec composants réutilisables

## Structure créée

### Molécules (composants réutilisables)
```
components/molecules/
├── SearchBar.tsx           # Barre de recherche avec DatePicker
├── SegmentControl.tsx      # Toggle segmenté (layout, status, ownership)
├── FilterDropdown.tsx      # Dropdown avancé avec animations
├── ProjectSelector.tsx     # Sélecteur de projet avec dropdown
├── MetricBadge.tsx         # Badges de métriques
└── FilterPills.tsx         # Pills scrollables pour catégories
```

### Organismes (filtres par vue)
```
components/organisms/header/
├── ShotsFilterBar.tsx      # Filtres pour la vue Shots
├── InventoryFilterBar.tsx  # Filtres pour la vue Inventory
├── PostProdFilterBar.tsx   # Filtres pour la vue PostProd
├── NotesFilterBar.tsx      # Filtres pour la vue Notes
└── DetailViewHeader.tsx    # Header pour les vues détail
```

## Fonctionnalités préservées

✅ **Calculs de padding** : `paddingTop`, `paddingBottom`, `--header-padding-top`
✅ **Classes CSS** : `cf-input-wrapper`, `cf-control`, `cf-segment-container`, etc.
✅ **Animations** : `AnimatePresence`, `motion.div`, transitions
✅ **Logique conditionnelle** : Affichage par vue (overview, shots, inventory, etc.)
✅ **Props** : Toutes les 70+ props conservées
✅ **Responsive** : Mobile/desktop avec md:hidden et hidden md:flex
✅ **Dark mode** : Classes `dark:` préservées
✅ **Glass morphism** : Classes `bg-white/80`, `backdrop-blur` conservées

## Exemples d'utilisation

### Dans le Header principal
```tsx
{mainView === 'shots' && (
  <ShotsFilterBar
    searchQuery={shotSearchQuery}
    onSearchChange={setShotSearchQuery}
    statusFilter={shotStatusFilter}
    onStatusChange={setShotStatusFilter}
    layout={shotLayout}
    onLayoutChange={setShotLayout}
    projectProgress={projectProgress}
    groupedShots={groupedShots}
    activeDate={activeDate}
    isDatePickerOpen={isDateSelectorOpen}
    onDatePickerToggle={() => setIsDateSelectorOpen(!isDateSelectorOpen)}
    onDateSelect={handleDateSelect}
  />
)}
```

### Dans un nouveau composant
```tsx
import { SearchBar } from '../molecules/SearchBar'
import { LayoutToggle } from '../molecules/SegmentControl'
import { FilterPills } from '../molecules/FilterPills'

// Utilisation
<SearchBar
  view="inventory"
  value={searchQuery}
  onChange={setSearchQuery}
  showDatePicker
  isDatePickerOpen={isOpen}
  onDatePickerToggle={toggle}
/>

<FilterPills
  options={['All', 'Camera', 'Lens', ...]}
  value={activeCategory}
  onChange={setCategory}
  scrollKey="inventory"
/>

<LayoutToggle
  value={layout}
  onChange={setLayout}
/>
```

## Bénéfices

1. **Cohérence** : Même style partout via les molécules
2. **Maintenance** : Modifier un composant = modifier partout
3. **Lisibilité** : Header passé de 979 à 316 lignes
4. **Réutilisation** : Les molécules peuvent être utilisées ailleurs
5. **Testabilité** : Composants petits et isolés

## Exports ajoutés

### molecules/index.ts
- SearchBar, SearchBarProps, SearchView
- SegmentControl, LayoutToggle, SegmentControlProps
- FilterDropdown, FilterDropdownProps
- ProjectSelector, ProjectSelectorProps
- MetricBadge, MetricsGroup
- FilterPills

### organisms/index.ts
- ShotsFilterBar, ShotsFilterBarProps
- InventoryFilterBar, InventoryFilterBarProps
- PostProdFilterBar, PostProdFilterBarProps
- NotesFilterBar, NotesFilterBarProps
- DetailViewHeader

## Prochaines étapes recommandées

1. **Navigation** : Refactoriser Navigation.tsx avec la même approche
2. **Cards** : Créer des composants de cartes réutilisables (ShotCard, InventoryCard, etc.)
3. **List Views** : Créer des templates pour les vues liste (ShotsView, InventoryView, etc.)
4. **Formulaires** : Standardiser les formulaires avec FormField
