#!/bin/bash

# Script de déploiement DEV pour Cloud Run
# Usage: ./deploy-dev.sh [DATABASE_PASSWORD]

set -e

# Configuration
PROJECT_ID="vemakin"
REGION="us-central1"
SERVICE_NAME="backend-dev"
CLOUD_SQL_CONNECTION="vemakin:us-central1:vemakin"
FIREBASE_PROJECT_ID="vemakin"
FRONTEND_URL="https://vemakin.web.app"

# Vérifier que gcloud est installé
if ! command -v gcloud &> /dev/null; then
    echo "❌ Erreur: gcloud CLI n'est pas installé"
    echo "   Installez-le: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Vérifier l'authentification
echo "🔐 Vérification de l'authentification GCP..."
gcloud auth list --filter=status:ACTIVE --format="value(account)" > /dev/null 2>&1 || {
    echo "❌ Non authentifié. Exécutez: gcloud auth login"
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

# Construction de l'image Docker
echo ""
echo "🔨 Construction de l'image Docker..."
echo "   Cela peut prendre quelques minutes..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

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
  --allow-unauthenticated \
  --port 8000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80

# Récupérer l'URL du service
echo ""
echo "📋 Récupération de l'URL du service..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo "✅ Déploiement terminé avec succès !"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🌐 URL du backend DEV: $SERVICE_URL"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Endpoints disponibles:"
echo "   Health check: ${SERVICE_URL}/health"
echo "   API root:     ${SERVICE_URL}/"
echo ""
echo "🧪 Test rapide:"
echo "   curl ${SERVICE_URL}/health"
echo ""
echo "⚙️  Configuration Firebase Auth:"
echo "   Ajoutez cette URL aux domaines autorisés dans Firebase Auth:"
echo "   ${SERVICE_URL}"
echo ""
