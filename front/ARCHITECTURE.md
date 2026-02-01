# Architecture Atomique - Vemakin Frontend

Cette documentation décrit la nouvelle architecture basée sur Atomic Design implémentée dans le frontend.

## Structure des dossiers

```
components/
├── atoms/              # Éléments de base indivisibles
│   ├── Button.tsx      # Boutons avec variants (primary, secondary, danger...)
│   ├── Input.tsx       # Inputs avec variants (default, glass, underline)
│   ├── Badge.tsx       # Badges avec variants et états
│   └── Text.tsx        # Système de typographie unifié
│
├── molecules/          # Combinaisons simples d'atomes
│   ├── ActionButton.tsx    # Boutons d'action (Edit/Save/Delete/Cancel)
│   ├── FilterPill.tsx      # Pills de filtres cliquables
│   ├── FormField.tsx       # Combinaison Label + Input + Error
│   ├── StatusToggle.tsx    # Toggle de statut (Pending/Completed)
│   └── DetailSection.tsx   # Sections pour les DetailViews
│
├── organisms/          # Composants métier complexes
│   └── DetailViewLayout.tsx    # Template réutilisable pour toutes les pages détail
│
├── ui/                 # Composants UI existants (conservés)
│   ├── GlassCard.tsx
│   ├── ConfirmModal.tsx
│   └── ...
│
└── [feature]/          # Composants métier spécifiques
    └── DetailView.tsx  # Refactorisés avec la nouvelle architecture

hooks/
├── useDetailView.ts    # Hook générique pour la gestion des DetailViews
└── useHeaderSetup.ts   # Hook pour la configuration du header
```

## Atomes créés

### Button
Bouton unifié avec variants :
- `primary` : Bleu avec shadow
- `secondary` : Blanc/gris avec bordure
- `ghost` : Transparent
- `danger` : Rouge
- `success` : Vert
- `warning` : Orange

Props : `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon`, `fullWidth`, `glass`

### Input
Input unifié avec variants :
- `default` : Style standard avec bordure
- `glass` : Style glass morphism
- `underline` : Style avec bordure bottom uniquement

Props : `variant`, `size`, `error`, `label`, `leftIcon`, `rightIcon`

### Badge
Badge pour filtres et statuts :
- Variants : `default`, `primary`, `success`, `warning`, `danger`, `info`, `ghost`
- Supporte l'état `isActive` et les `count`

### Text
Système de typographie unifié :
- Variants : `h1`, `h2`, `h3`, `h4`, `title`, `subtitle`, `body`, `caption`, `label`
- Colors : `default`, `primary`, `secondary`, `muted`, `success`, `warning`, `danger`

## Molécules créées

### ActionButton
Bouton d'action spécifique pour DetailViews :
- Types : `edit`, `delete`, `save`, `cancel`, `retake`, `calendar`
- Gère automatiquement les styles et icônes
- `ActionButtonGroup` : Groupe Edit/Delete ou Cancel/Save

### FilterPill
Pill cliquable pour barres de filtres :
- Supporte l'état actif/inactif
- Affiche optionnellement un count
- Animations hover/click

### StatusToggle
Toggle de statut Pending/Completed :
- Animation du point indicateur
- Changement de couleur automatique
- Icon change selon le statut

### DetailSection
Section pour DetailViews :
- Titre avec style cohérent
- Support action dans le header
- Animation d'entrée
- Bordure optionnelle

## Organisme créé

### DetailViewLayout
Template réutilisable pour toutes les pages détail :
```tsx
<DetailViewLayout
  title={item.name}
  subtitle={optional}
  detailLabel="Label pour le header"
  onBack={handleClose}
  actions={<ActionButtonGroup ... />}
  sidebar={<SidebarContent />}
  size="default | wide | full"
>
  {content}
</DetailViewLayout>
```

Gère automatiquement :
- L'intégration avec HeaderActionsContext
- Le layout responsive (grid 8/4)
- Les animations
- Le scroll
- Le cleanup à la fermeture

## Hooks créés

### useDetailView
Hook générique pour la gestion des DetailViews :
```typescript
const {
  isEditing,
  setIsEditing,
  editedItem,
  setEditedItem,
  hasChanges,
  showDeleteConfirm,
  handleSave,
  handleCancel,
  handleDelete,
  handleFieldChange
} = useDetailView({ item, onUpdate, onDelete })
```

### useHeaderSetup
Hook pour configurer le header :
```typescript
useHeaderSetup({
  title: item.name,
  subtitle: optional,
  detailLabel: 'Detail',
  onBack: handleClose,
  actions: <ActionButtonGroup ... />
})
```

## Refactoring effectué

### Avant (code dupliqué)
- 4 DetailViews avec ~85% de code identique
- ~521 lignes par fichier
- Actions buttons définis 4 fois
- Header setup dupliqué 4 fois
- Layout container dupliqué 4 fois
- Gestion du state édition dupliquée 4 fois

### Après (architecture atomique)
- **ShotDetailView** : ~250 lignes (-50%)
- **EquipmentDetailView** : ~200 lignes (-47%)
- **NoteDetailView** : ~180 lignes (-46%)
- **TaskDetailView** : ~220 lignes (-45%)

Components réutilisables :
- `DetailViewLayout` : Layout commun
- `ActionButtonGroup` : Actions standardisées
- `StatusToggle` : Toggle de statut
- `useDetailView` : State management
- `useHeaderSetup` : Header integration

## Bénéfices

1. **Cohérence UI** : Même style garanti partout via les atomes
2. **Maintenance** : Modifier un atome = modifier partout
3. **Lisibilité** : Composants petits et focalisés
4. **Testabilité** : Facile à tester unitairement
5. **Performance** : Moins de code, meilleur tree-shaking
6. **Onboarding** : Structure claire pour nouveaux développeurs

## Comment utiliser

### Créer une nouvelle page détail
```tsx
import { DetailViewLayout } from '../organisms/DetailViewLayout'
import { ActionButtonGroup } from '../molecules/ActionButton'
import { useDetailView } from '../../hooks/useDetailView'

export const NewDetailView: React.FC<Props> = ({ item, onClose, onUpdate, onDelete }) => {
  const { isEditing, setIsEditing, editedItem, ... } = useDetailView({ item, onUpdate, onDelete })

  return (
    <DetailViewLayout
      title={item.name}
      detailLabel="Detail"
      onBack={onClose}
      actions={
        <ActionButtonGroup
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onDelete={() => setShowDeleteConfirm(true)}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      }
      sidebar={<SidebarContent />}
    >
      {/* Contenu principal */}
    </DetailViewLayout>
  )
}
```

### Utiliser les atomes dans une vue existante
```tsx
import { Button } from '../atoms/Button'
import { Text } from '../atoms/Text'
import { Badge } from '../atoms/Badge'

// Remplace les boutons inline
<Button variant="primary" onClick={handleSave}>Save</Button>

// Remplace les titres/textes
<Text variant="h3">Title</Text>
<Text variant="body" color="muted">Description</Text>

// Remplace les badges
<Badge variant="success" isActive={isCompleted}>Completed</Badge>
```

## Migration future recommandée

1. **Header** : Refactoriser Header.tsx (978 lignes) avec les atomes
2. **Cards** : Migrer ShotCard, InventoryCard, etc. vers ItemCard system
3. **Views liste** : Créer ListViewTemplate pour ShotsView, InventoryView, etc.
4. **Formulaires** : Utiliser FormField pour tous les formulaires

## Notes de design

- Le glass morphism est conservé via les classes CSS existantes
- Les couleurs suivent le design system : `#3762E3` (light), `#4E47DD` (dark)
- Les animations utilisent Framer Motion avec des durées cohérentes
- Le dark mode est géré via les classes `dark:` de Tailwind
