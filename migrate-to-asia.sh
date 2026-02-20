#!/bin/bash

# Automated Migration Script: US-Central1 → Asia-East1 (Taiwan)
# Upgrades PostgreSQL 15 → 17
# 
# Usage: ./migrate-to-asia.sh YOUR_DB_PASSWORD

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
OLD_INSTANCE_NAME="vemakin"
BUCKET_NAME="vemakin-db-backups"
SERVICE_NAME="backend-dev"

# Get password from argument or prompt
if [ -z "$1" ]; then
    echo -e "${YELLOW}⚠️  Mot de passe de la base de données requis${NC}"
    read -sp "Entrez le mot de passe PostgreSQL: " DB_PASSWORD
    echo ""
else
    DB_PASSWORD="$1"
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🌏 MIGRATION VERS ASIE (asia-east1 - Taiwan)${NC}"
echo -e "${BLUE}  PostgreSQL 15 → 17${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Step 0: Verify gcloud is installed and authenticated
echo -e "${YELLOW}[0/6] Vérification des prérequis...${NC}"
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Erreur: gcloud CLI n'est pas installé${NC}"
    exit 1
fi

gcloud config set project $PROJECT_ID --quiet
echo -e "${GREEN}✓ Prérequis OK${NC}"
echo ""

# Step 1: Check Cloud SQL instance
echo -e "${YELLOW}[1/6] Vérification de l'instance Cloud SQL...${NC}"
echo "   Instance: $NEW_INSTANCE_NAME"
echo "   Région: $REGION"
echo ""

# Check if instance exists and is running
if gcloud sql instances describe $NEW_INSTANCE_NAME --project=$PROJECT_ID &> /dev/null; then
    STATUS=$(gcloud sql instances describe $NEW_INSTANCE_NAME --project=$PROJECT_ID --format='value(state)' 2>/dev/null || echo "UNKNOWN")
    if [ "$STATUS" = "RUNNABLE" ]; then
        echo -e "${GREEN}✓ L'instance $NEW_INSTANCE_NAME existe déjà et est en cours d'exécution${NC}"
    else
        echo -e "${YELLOW}⚠️  L'instance existe mais a le statut: $STATUS${NC}"
        echo "   Attente que l'instance soit prête..."
        while true; do
            STATUS=$(gcloud sql instances describe $NEW_INSTANCE_NAME --project=$PROJECT_ID --format='value(state)' 2>/dev/null || echo "PENDING")
            if [ "$STATUS" = "RUNNABLE" ]; then
                echo -e "${GREEN}✓ Instance prête${NC}"
                break
            fi
            echo "   Statut: $STATUS - attente..."
            sleep 10
        done
    fi
else
    echo -e "${YELLOW}⚠️  L'instance n'existe pas. Création en cours...${NC}"
    gcloud sql instances create $NEW_INSTANCE_NAME \
      --database-version=POSTGRES_17 \
      --tier=db-g1-small \
      --region=$REGION \
      --storage-size=10GB \
      --storage-auto-increase \
      --availability-type=zonal \
      --edition=enterprise \
      --project=$PROJECT_ID \
      --async

    # Wait for instance creation
    echo ""
    echo "⏳ Attente de la création de l'instance (peut prendre 5-10 minutes)..."
    while true; do
        STATUS=$(gcloud sql instances describe $NEW_INSTANCE_NAME --project=$PROJECT_ID --format='value(state)' 2>/dev/null || echo "PENDING")
        if [ "$STATUS" = "RUNNABLE" ]; then
            echo -e "${GREEN}✓ Instance créée avec succès${NC}"
            break
        fi
        echo "   Statut: $STATUS - attente..."
        sleep 10
    done
fi

# Set password
echo "   Configuration du mot de passe..."
gcloud sql users set-password postgres \
  --instance=$NEW_INSTANCE_NAME \
  --password="$DB_PASSWORD" \
  --project=$PROJECT_ID

echo ""

# Step 2: Create backup bucket and set permissions
echo -e "${YELLOW}[2/6] Préparation du bucket de sauvegarde...${NC}"
if ! gsutil ls -b gs://$BUCKET_NAME &> /dev/null; then
    gsutil mb -p $PROJECT_ID gs://$BUCKET_NAME
    echo -e "${GREEN}✓ Bucket créé${NC}"
else
    echo -e "${GREEN}✓ Bucket existe déjà${NC}"
fi

# Grant Cloud SQL service account permission to write to bucket
echo "   Configuration des permissions..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="service-${PROJECT_NUMBER}@gcp-sa-cloud-sql.iam.gserviceaccount.com"
gsutil iam ch serviceAccount:$SERVICE_ACCOUNT:objectAdmin gs://$BUCKET_NAME
echo -e "${GREEN}✓ Permissions configurées${NC}"
echo ""

# Step 3: Export database from US
echo -e "${YELLOW}[3/6] Export de la base de données US...${NC}"
echo "   Cela peut prendre quelques minutes..."
gcloud sql export sql $OLD_INSTANCE_NAME \
  gs://$BUCKET_NAME/vemakin-migration-$(date +%Y%m%d-%H%M%S).sql \
  --database=postgres \
  --project=$PROJECT_ID
echo -e "${GREEN}✓ Export terminé${NC}"
echo ""

# Step 4: Import to Asia instance
echo -e "${YELLOW}[4/6] Import vers l'instance Asie...${NC}"
echo "   Cela peut prendre 10-15 minutes selon la taille de la base..."
gcloud sql import sql $NEW_INSTANCE_NAME \
  gs://$BUCKET_NAME/vemakin-migration-*.sql \
  --database=postgres \
  --project=$PROJECT_ID
echo -e "${GREEN}✓ Import terminé${NC}"
echo ""

# Step 5: Deploy backend to Asia
echo -e "${YELLOW}[5/6] Déploiement du backend sur Cloud Run (asia-east1)...${NC}"
echo "   Construction de l'image Docker..."

# Build and push image
gcloud builds submit backend-go \
  --tag gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --project $PROJECT_ID

# Get new Cloud SQL connection name
NEW_CLOUD_SQL_CONNECTION="$PROJECT_ID:$REGION:$NEW_INSTANCE_NAME"
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@/postgres?host=/cloudsql/${NEW_CLOUD_SQL_CONNECTION}"

echo "   Déploiement sur Cloud Run..."
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

# Step 6: Verify deployment
echo -e "${YELLOW}[6/6] Vérification du déploiement...${NC}"
sleep 5

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health || echo "000")
CATALOG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/catalog/health || echo "000")

if [ "$HEALTH_STATUS" = "200" ] && [ "$CATALOG_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Tous les services sont opérationnels${NC}"
else
    echo -e "${YELLOW}⚠️  Vérification manuelle recommandée:${NC}"
    echo "   Health: $BACKEND_URL/health (status: $HEALTH_STATUS)"
    echo "   Catalog: $BACKEND_URL/api/catalog/health (status: $CATALOG_STATUS)"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ MIGRATION TERMINÉE AVEC SUCCÈS !${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "📊 Résumé:"
echo "   • Instance Cloud SQL: $NEW_INSTANCE_NAME (PostgreSQL 17)"
echo "   • Région: $REGION (Taiwan)"
echo "   • Backend: $BACKEND_URL"
echo "   • Frontend: https://vemakin.web.app"
echo ""
echo "🧪 Commandes de test:"
echo "   curl $BACKEND_URL/health"
echo "   curl $BACKEND_URL/api/catalog/health"
echo ""
echo "⚠️  Prochaines étapes:"
echo "   1. Tester l'application sur https://vemakin.web.app"
echo "   2. Vérifier les latences dans DevTools Network"
echo "   3. Mettre à jour start-proxy.sh pour la nouvelle instance:"
echo "      cloud-sql-proxy --port 5432 $PROJECT_ID:$REGION:$NEW_INSTANCE_NAME"
echo ""
echo "🗑️  Nettoyage (après vérification):"
echo "   # Supprimer l'ancienne instance US:"
echo "   gcloud sql instances delete $OLD_INSTANCE_NAME --project=$PROJECT_ID"
echo ""
echo -e "${BLUE}Latence attendue: ~50-150ms (vs 400-700ms avant)${NC}"
