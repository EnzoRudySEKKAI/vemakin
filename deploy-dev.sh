#!/bin/bash

# Script de déploiement DEV pour Cloud Run (Go Backend + Frontend)
# Usage: ./deploy-dev.sh [DATABASE_PASSWORD]

set -e

# Configuration
PROJECT_ID="vemakin"
REGION="asia-east1"
SERVICE_NAME="backend-dev"
CLOUD_SQL_CONNECTION="vemakin:asia-east1:vemakin"
FIREBASE_PROJECT_ID="vemakin"
FRONTEND_URL="https://vemakin.web.app"

# Chemins
BACKEND_DIR="backend-go"
FRONTEND_DIR="front"

# Vérifier que gcloud est installé
if ! command -v gcloud &> /dev/null; then
    echo "❌ Erreur: gcloud CLI n'est pas installé"
    echo "   Installez-le: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Erreur: Docker n'est pas installé"
    echo "   Installez Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Vérifier Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Erreur: firebase CLI n'est pas installé"
    echo "   Installez-le: npm install -g firebase-tools"
    exit 1
fi

# Vérifier l'authentification
echo "🔐 Vérification de l'authentification GCP..."
gcloud auth list --filter=status:ACTIVE --format="value(account)" > /dev/null 2>&1 || {
    echo "❌ Non authentifié. Exécutez: gcloud auth login"
    exit 1
}

# Vérifier l'authentification Firebase
echo "🔐 Vérification de l'authentification Firebase..."
firebase login || {
    echo "❌ Non authentifié Firebase. Exécutez: firebase login"
    exit 1
}

# Définir le projet
echo "📁 Configuration du projet: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Récupérer le mot de passe DB
if [ -z "$1" ]; then
    echo ""
    echo "⚠️  Mot de passe de la base de données requis"
    echo "   Usage: ./deploy-dev.sh VOTRE_MOT_DE_PASSE_DB"
    echo ""
    read -sp "Entrez le mot de passe PostgreSQL: " DB_PASSWORD
    echo ""
else
    DB_PASSWORD="$1"
fi

# ============================================
# BACKEND - Déploiement Go sur Cloud Run
# ============================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🖥️  DÉPLOIEMENT BACKEND (Go)"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Vérifier que le répertoire backend existe
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Erreur: Répertoire backend '$BACKEND_DIR' introuvable"
    exit 1
fi

# Construction de l'image Docker
echo "🔨 Construction de l'image Docker..."
echo "   Cela peut prendre quelques minutes..."

# Configurer Docker pour utiliser gcloud comme credential helper
gcloud auth configure-docker --quiet

# Construire et pousser l'image
gcloud builds submit "$BACKEND_DIR" \
    --tag gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --project $PROJECT_ID

# Déploiement sur Cloud Run
echo ""
echo "🚀 Déploiement sur Cloud Run..."
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"

# Construire l'URL de connexion Cloud SQL (socket Unix)
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@/postgres?host=/cloudsql/${CLOUD_SQL_CONNECTION}"

gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --add-cloudsql-instances $CLOUD_SQL_CONNECTION \
  --set-env-vars "DATABASE_URL=${DATABASE_URL}" \
  --set-env-vars "FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}" \
  --set-env-vars "ENV=production" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80 \
  --project $PROJECT_ID

# Récupérer l'URL du service backend
echo ""
echo "📋 Récupération de l'URL du service..."
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)' --project $PROJECT_ID)

echo ""
echo "✅ Backend déployé avec succès !"
echo "   URL: $BACKEND_URL"

# ============================================
# FRONTEND - Déploiement sur Firebase Hosting
# ============================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🌐 DÉPLOIEMENT FRONTEND (React + Firebase)"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Vérifier que le répertoire frontend existe
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Erreur: Répertoire frontend '$FRONTEND_DIR' introuvable"
    exit 1
fi

# Créer fichier .env.production avec l'URL du backend
echo ""
echo "📝 Configuration de l'environnement de production..."
echo "   BACKEND_URL: $BACKEND_URL"

# Aller dans le répertoire frontend
cd "$FRONTEND_DIR"

# Créer .env.production avec les variables
cat > .env.production << EOF
VITE_API_URL=$BACKEND_URL
EOF

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installation des dépendances frontend..."
    npm install
fi

# Construire le frontend
echo ""
echo "🔨 Construction du frontend..."
echo "   Cela peut prendre quelques minutes..."

npm run build

# Déployer sur Firebase Hosting
echo ""
echo "🚀 Déploiement sur Firebase Hosting..."
firebase deploy --only hosting --project $FIREBASE_PROJECT_ID

# Retourner au répertoire racine
cd ..

echo ""
echo "✅ Déploiement terminé avec succès !"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🌐 URL du frontend: $FRONTEND_URL"
echo "  🔗 URL du backend:  $BACKEND_URL"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Endpoints disponibles:"
echo "   Backend Health: ${BACKEND_URL}/health"
echo "   Frontend:       $FRONTEND_URL"
echo ""
echo "🧪 Test rapide backend:"
echo "   curl ${BACKEND_URL}/health"
echo ""
echo "⚙️  Configuration Firebase Auth:"
echo "   Ajoutez cette URL aux domaines autorisés dans Firebase Auth:"
echo "   ${BACKEND_URL}"
echo ""
