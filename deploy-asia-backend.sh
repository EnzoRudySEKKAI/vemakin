#!/bin/bash

# Deploy Backend to Asia (after database migration)
# Usage: ./deploy-asia-backend.sh [DATABASE_PASSWORD]

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
NEW_INSTANCE_NAME="vemakin-asia"
SERVICE_NAME="backend-dev"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🚀 DÉPLOIEMENT BACKEND SUR ASIE (asia-east1)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Get password from argument or prompt
if [ -z "$1" ]; then
    echo -e "${YELLOW}⚠️  Mot de passe de la base de données requis${NC}"
    read -sp "Entrez le mot de passe PostgreSQL pour l'instance $NEW_INSTANCE_NAME: " DB_PASSWORD
    echo ""
else
    DB_PASSWORD="$1"
fi

# Verify gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Erreur: gcloud CLI n'est pas installé${NC}"
    exit 1
fi

gcloud config set project $PROJECT_ID --quiet
echo ""

# Step 1: Build Docker image
echo -e "${YELLOW}[1/4] Construction de l'image Docker...${NC}"
echo "   Cela peut prendre 2-3 minutes..."
gcloud builds submit backend-go \
  --tag gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --project $PROJECT_ID
echo -e "${GREEN}✓ Image Docker construite${NC}"
echo ""

# Step 2: Get Cloud SQL connection
echo -e "${YELLOW}[2/4] Configuration Cloud SQL...${NC}"
NEW_CLOUD_SQL_CONNECTION="$PROJECT_ID:$REGION:$NEW_INSTANCE_NAME"
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@/postgres?host=/cloudsql/${NEW_CLOUD_SQL_CONNECTION}"
echo "   Instance: $NEW_CLOUD_SQL_CONNECTION"
echo -e "${GREEN}✓ Configuration OK${NC}"
echo ""

# Step 3: Deploy to Cloud Run
echo -e "${YELLOW}[3/4] Déploiement sur Cloud Run...${NC}"
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"
echo "   Cela peut prendre 1-2 minutes..."

gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --add-cloudsql-instances $NEW_CLOUD_SQL_CONNECTION \
  --set-env-vars "DATABASE_URL=${DATABASE_URL}" \
  --set-env-vars "FIREBASE_PROJECT_ID=vemakin" \
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

BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)' --project=$PROJECT_ID)
echo -e "${GREEN}✓ Backend déployé: $BACKEND_URL${NC}"
echo ""

# Step 4: Verify deployment
echo -e "${YELLOW}[4/4] Vérification du déploiement...${NC}"
sleep 5

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health || echo "000")
CATALOG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/catalog/health || echo "000")

if [ "$HEALTH_STATUS" = "200" ] && [ "$CATALOG_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Tous les services sont opérationnels${NC}"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "📊 Résumé:"
    echo "   • Backend URL: $BACKEND_URL"
    echo "   • Health Check: $BACKEND_URL/health (status: $HEALTH_STATUS)"
    echo "   • Catalog Health: $BACKEND_URL/api/catalog/health (status: $CATALOG_STATUS)"
    echo ""
    echo "🧪 Tests:"
    echo "   curl $BACKEND_URL/health"
    echo "   curl $BACKEND_URL/api/catalog/health"
    echo ""
    echo -e "${BLUE}Latence attendue: ~50-150ms (vs 400-700ms avant)${NC}"
else
    echo -e "${YELLOW}⚠️  Vérification manuelle recommandée:${NC}"
    echo "   Health: $BACKEND_URL/health (status: $HEALTH_STATUS)"
    echo "   Catalog: $BACKEND_URL/api/catalog/health (status: $CATALOG_STATUS)"
    echo ""
    echo "📋 Logs:"
    echo "   gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME' --limit=20 --project=$PROJECT_ID"
fi

echo ""
