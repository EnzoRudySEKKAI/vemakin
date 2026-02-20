#!/bin/bash

# Deploy Frontend to Firebase Hosting (configured for asia-east1 backend)
# Usage: ./deploy-asia-frontend.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="vemakin"
REGION="asia-east1"
SERVICE_NAME="backend-dev"
FRONTEND_DIR="front"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🌐 DÉPLOIEMENT FRONTEND SUR FIREBASE HOSTING${NC}"
echo -e "${BLUE}  Backend: asia-east1 (Taiwan)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Verify prerequisites
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Erreur: firebase CLI n'est pas installé${NC}"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
echo -e "${YELLOW}[1/4] Vérification de l'authentification Firebase...${NC}"
firebase login:ci > /dev/null 2>&1 || {
    echo -e "${RED}❌ Non authentifié Firebase. Exécutez: firebase login${NC}"
    exit 1
}
echo -e "${GREEN}✓ Authentifié${NC}"
echo ""

# Step 1: Update firebase.json to point to asia-east1
echo -e "${YELLOW}[2/4] Mise à jour de firebase.json...${NC}"
echo "   Configuration du proxy API vers asia-east1..."

# Create backup
cp firebase.json firebase.json.backup
echo "   ✓ Backup créé: firebase.json.backup"

# Update the region in firebase.json
sed -i '' 's/"region": "us-central1"/"region": "asia-east1"/' firebase.json
echo -e "${GREEN}✓ firebase.json mis à jour (region: asia-east1)${NC}"
echo ""

# Step 2: Build frontend
echo -e "${YELLOW}[3/4] Construction du frontend...${NC}"
echo "   Installation des dépendances..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    npm ci || npm install
fi

echo "   Build production..."
cat > .env.production << EOF
VITE_API_URL=/api
EOF

npm run build
cd ..
echo -e "${GREEN}✓ Frontend construit${NC}"
echo ""

# Step 3: Deploy to Firebase Hosting
echo -e "${YELLOW}[4/4] Déploiement sur Firebase Hosting...${NC}"
firebase deploy --only hosting --project $PROJECT_ID

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ FRONTEND DÉPLOYÉ AVEC SUCCÈS !${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "📊 Résumé:"
echo "   • URL Frontend: https://vemakin.web.app"
echo "   • Backend Proxy: /api → asia-east1"
echo "   • Region: asia-east1 (Taiwan)"
echo ""
echo "🧪 Tests:"
echo "   1. Ouvrir https://vemakin.web.app"
echo "   2. Ouvrir DevTools (F12) → Network"
echo "   3. Vérifier que les appels API sont vers /api (pas de latence US)"
echo ""
echo -e "${BLUE}Latence attendue: ~50-150ms (vs 400-700ms avant)${NC}"
echo ""

# Optional: Show diff
echo "📋 Modifications firebase.json:"
diff firebase.json.backup firebase.json || true
echo ""

# Ask if user wants to keep backup
read -p "Supprimer le backup firebase.json.backup ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm firebase.json.backup
    echo "✓ Backup supprimé"
else
    echo "✓ Backup conservé: firebase.json.backup"
fi
