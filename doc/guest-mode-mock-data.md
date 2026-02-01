# Documentation: Mode Guest et Données Mock

## Vue d'ensemble

Le mode guest permet aux utilisateurs de tester l'application sans créer de compte Firebase. En mode guest, l'application utilise des données mock (fictives) stockées en mémoire côté backend au lieu de la base de données PostgreSQL.

---

## Architecture du Mode Guest

### Fonctionnement

1. **Frontend** : Détecte le mode guest via `localStorage` et envoie le header `X-Guest-Mode: true`
2. **Backend** : Vérifie le header et sert des données mock au lieu de la BDD
3. **Données** : Stockées en mémoire (RAM) pendant la session, perdues au redémarrage du serveur

### Flux de données

```
Utilisateur clique "Continuer en tant qu'invité"
        ↓
localStorage.setItem('vemakin_guest_mode', 'true')
        ↓
Axios intercepte toutes les requêtes
        ↓
Header "X-Guest-Mode: true" ajouté automatiquement
        ↓
Backend reçoit la requête avec header
        ↓
get_current_user_or_guest() détecte le mode guest
        ↓
Renvoie guest user sans vérifier Firebase
        ↓
Routers utilisent MockDatabase au lieu de PostgreSQL
```

---

## Fichiers modifiés

### Backend (Python/FastAPI)

#### 1. Nouveaux fichiers

```
backend/app/mock_data/
├── __init__.py              # Exports du module
├── fixtures.py              # Données mock (projet, shots, inventaire, etc.)
└── mock_db.py               # Classe MockDatabase avec CRUD en mémoire
```

#### 2. Fichiers modifiés

##### `backend/app/auth.py`
- **Ajout** : Fonction `get_current_user_or_guest()`
- **Modification** : Détection du header `X-Guest-Mode`
- **Logique** : Si header présent, retourne guest user sans auth Firebase

##### `backend/app/routers/*.py`
Tous les routers ont été modifiés :
- `projects.py` - CRUD projets
- `shots.py` - CRUD shots
- `inventory.py` - CRUD inventaire + conversion snake_case → camelCase
- `notes.py` - CRUD notes
- `postprod.py` - CRUD tâches post-prod
- `catalog.py` - Données catalogue (lecture seule)

**Changements** :
- Import de `get_current_user_or_guest` (remplace `get_current_user`)
- Import de `get_mock_db` depuis `mock_data`
- Vérification `if current_user.get("is_guest"):` dans chaque endpoint
- Logique conditionnelle : mock DB pour guest, PostgreSQL pour auth

##### `backend/app/schemas/schemas.py`
- **Non modifié** - Les schémas restent compatibles mode auth et guest

---

### Frontend (React/TypeScript)

#### Fichiers modifiés

##### `front/api/client.ts`
```typescript
// Avant
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Après
api.interceptors.request.use(async (config) => {
    const isGuestMode = localStorage.getItem('vemakin_guest_mode') === 'true';
    
    if (isGuestMode) {
        config.headers['X-Guest-Mode'] = 'true';
        return config;
    }
    
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

##### `front/hooks/useProductionStore.ts`
**Modifications** :
1. **Initialisation** : `isGuest` récupère valeur depuis localStorage
   ```typescript
   const [isGuest, setIsGuest] = useState(() => {
     return localStorage.getItem('vemakin_guest_mode') === 'true';
   });
   ```

2. **Nouveau useEffect** : Chargement des données en mode guest
   ```typescript
   useEffect(() => {
     if (isGuest) {
       // Fetch mock data
       const fetchGuestData = async () => { ... };
       fetchGuestData();
     }
   }, [isGuest]);
   ```

3. **Modification condition** : Autorise chargement sans user Firebase
   ```typescript
   // Avant
   if (!projectState?.id || !currentUser) return;
   
   // Après
   if (!projectState?.id || (!currentUser && !isGuest)) return;
   ```

4. **Fonction `enterGuest()`** : Active le mode guest
   ```typescript
   const enterGuest = useCallback(() => {
     setIsGuest(true);
     localStorage.setItem('vemakin_guest_mode', 'true');
     setCurrentUser(null);
     setMainView('overview');
   }, []);
   ```

5. **Fonction `logout()`** : Désactive le mode guest
   ```typescript
   const logout = useCallback(async () => {
     localStorage.removeItem('vemakin_guest_mode');
     setIsGuest(false);
     // ... reste inchangé
   }, []);
   ```

---

## Données Mock

### Structure des fixtures

#### `MOCK_PROJECT`
- 1 projet : "Mon Premier Film"
- ID : UUID valide (généré dynamiquement)

#### `MOCK_SHOTS` (5 items)
- Scène d'ouverture
- Interview
- Séquence action
- Portrait crépusculaire
- Scène finale

#### `MOCK_INVENTORY` (10 items)
**Owned (6)** :
- Sony A7S III (caméra)
- 3 objectifs Sony (24-70mm, 16-35mm, 85mm)
- DJI RS 3 Pro (stabilisateur)
- 2 lumières Aputure

**Rented (4)** :
- DJI Mavic 3 Pro (drone)
- Rode NTG5 (micro)
- Sennheiser MKH 416 (micro)
- Aputure MC RGBWW (petite LED)

#### `MOCK_NOTES` (3 items)
- To-do avant tournage
- Idées scène finale
- Contacts utiles

#### `MOCK_POSTPROD_TASKS` (5 items)
- Montage assemblage
- Étalonnage
- Mixage son
- Musique et sound design
- Export versions

### Format des données

Les données mock utilisent **snake_case** (format Python/PostgreSQL) :
```python
{
    "id": "cam-001",
    "user_id": "guest-user",
    "is_owned": True,           # ← snake_case
    "price_per_day": 0,         # ← snake_case
    "serial_number": "SONY123", # ← snake_case
    "created_at": "...",
}
```

Le backend convertit en **camelCase** pour le frontend :
```typescript
{
    id: "cam-001",
    isOwned: true,              // ← camelCase
    pricePerDay: 0,             // ← camelCase
    serialNumber: "SONY123",    // ← camelCase
}
```

---

## Comment désactiver le mode guest

### Méthode 1 : Revert complet (recommandé pour production)

#### Étape 1 : Supprimer les fichiers mock
```bash
cd /Users/enzorudysekkai/Documents/Vemakin
rm -rf backend/app/mock_data/
```

#### Étape 2 : Revert les routers backend

Pour chaque router (`projects.py`, `shots.py`, `inventory.py`, `notes.py`, `postprod.py`, `catalog.py`) :

**Remplacer** :
```python
from ..auth import get_current_user_or_guest
from ..mock_data import get_mock_db
```

**Par** :
```python
from ..auth import get_current_user
```

**Remplacer** :
```python
current_user: dict = Depends(get_current_user_or_guest)
```

**Par** :
```python
current_user: dict = Depends(get_current_user)
```

**Supprimer** tout le bloc conditionnel :
```python
if current_user.get("is_guest"):
    mock_db = get_mock_db()
    # ... logique mock
    return ...
```

**Garder uniquement** la logique PostgreSQL existante.

#### Étape 3 : Revert auth.py

**Option A** : Supprimer complètement la fonction guest
```python
# Supprimer toute la fonction get_current_user_or_guest()
# et revert get_current_user() à son état original
```

**Option B** : Garder mais ne pas l'utiliser (plus sûr)
- Laisser `get_current_user_or_guest()` dans auth.py
- Ne pas l'utiliser dans les routers

#### Étape 4 : Revert frontend

**Dans `front/api/client.ts`** :
```typescript
// Revert à l'original
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

**Dans `front/hooks/useProductionStore.ts`** :

1. **Réinitialiser isGuest** :
```typescript
const [isGuest, setIsGuest] = useState(false);
```

2. **Supprimer le useEffect guest** :
```typescript
// Supprimer tout le bloc:
useEffect(() => {
  if (isGuest) {
    const fetchGuestData = async () => { ... };
    fetchGuestData();
  }
}, [isGuest]);
```

3. **Revert la condition** :
```typescript
// Avant
if (!projectState?.id || (!currentUser && !isGuest)) return;

// Après
if (!projectState?.id || !currentUser) return;
```

4. **Simplifier enterGuest()** :
```typescript
const enterGuest = useCallback(() => {
  // Option 1: Supprimer complètement
  // Option 2: Rediriger vers signup
  setMainView('signup');
}, []);
```

5. **Simplifier logout()** :
```typescript
const logout = useCallback(async () => {
  try {
    await signOut(auth);
    // Retirer: localStorage.removeItem('vemakin_guest_mode');
    // Retirer: setIsGuest(false);
  } catch (error) {
    console.error("Logout failed", error);
  }
}, []);
```

#### Étape 5 : Supprimer le bouton "Guest" du Landing

**Dans `front/components/auth/LandingView.tsx`** :
- Supprimer ou commenter le bouton "Continuer en tant qu'invité"
- Ou le rediriger vers la page d'inscription

---

### Méthode 2 : Désactiver temporairement (feature flag)

#### Backend
Dans `backend/app/auth.py`, modifier la détection :
```python
async def get_current_user_or_guest(...):
    # Désactiver le mode guest
    ENABLE_GUEST_MODE = False  # ← Feature flag
    
    if ENABLE_GUEST_MODE and x_guest_mode and x_guest_mode.lower() == "true":
        # ... logique guest
    
    # Toujours requérir auth
    if not authorization:
        raise HTTPException(status_code=401, ...)
```

#### Frontend
Dans `front/components/auth/LandingView.tsx` :
```typescript
const ENABLE_GUEST_MODE = false;  // ← Feature flag

{ENABLE_GUEST_MODE && (
  <button onClick={enterGuest}>Continuer en tant qu'invité</button>
)}
```

**Avantages** :
- Code conservé pour futur usage
- Pas de suppression de fichiers
- Réactivation facile

---

## Tests après modification

### Vérifier le mode auth normal
1. Créer un compte Firebase
2. Se connecter
3. Vérifier que les données sont enregistrées en BDD
4. Créer un projet, shot, etc.
5. Recharger la page → données persistées

### Vérifier que le mode guest est désactivé
1. Aller sur la page de login
2. Vérifier que le bouton "Guest" n'est pas visible (ou désactivé)
3. Essayer de forcer l'URL avec `localStorage.setItem('vemakin_guest_mode', 'true')`
4. Vérifier que l'API retourne 401 Unauthorized

---

## Points de vigilance

### ⚠️ Ne pas oublier

1. **Schémas Pydantic** : Doivent rester compatibles auth et guest
2. **localStorage** : Nettoyer `vemakin_guest_mode` des navigateurs existants
3. **Tests** : Vérifier tous les flux CRUD en mode auth
4. **Documentation** : Mettre à jour la doc utilisateur si besoin

### 🔒 Sécurité

- Le mode guest bypass l'authentification Firebase
- Données mock en mémoire uniquement (pas de persistance)
- Pas d'accès aux données d'autres utilisateurs
- Isolation complète entre sessions guest

---

## Troubleshooting

### Problème : Données mock ne s'affichent pas
**Solution** : Vérifier que le backend est redémarré après modifications

### Problème : Erreur 401 en mode guest
**Solution** : Vérifier que le header `X-Guest-Mode: true` est bien envoyé

### Problème : Erreur CORS
**Solution** : Vérifier que `allow_headers=["*"]` inclut les headers personnalisés

### Problème : Champs manquants (ex: specs vides)
**Solution** : Vérifier la conversion snake_case → camelCase dans inventory.py

---

## Résumé des commandes

```bash
# Désactiver complètement (Méthode 1)
cd /Users/enzorudysekkai/Documents/Vemakin
rm -rf backend/app/mock_data/
# + modifications manuelles des routers et frontend

# Redémarrer le backend
uvicorn app.main:app --reload

# Redémarrer le frontend
npm run dev
```

---

## Notes pour le développeur

### Pourquoi cette implémentation ?
- **Flexibilité** : Switch facile entre auth et guest
- **Performance** : Mock en mémoire, pas de latence BDD
- **Isolation** : Données guest complètement séparées
- **Compatibilité** : Schémas inchangés, pas de migration

### Améliorations possibles
1. Persistance SQLite pour données guest
2. Migration automatique guest → auth
3. Limites d'utilisation (ex: 3 projets max en guest)
4. Watermark "DEMO" sur l'interface

---

**Date de création** : Février 2026  
**Auteur** : Assistant IA  
**Version** : 1.0
