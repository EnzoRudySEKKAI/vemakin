# Migration Guide: Move to Asia (asia-east1)

This guide will help you migrate the entire Vemakin stack from `us-central1` (Iowa) to `asia-east1` (Taiwan) for better latency from China.

## ⚠️ Prerequisites

- [ ] Database password ready
- [ ] ~15-30 minutes downtime acceptable
- [ ] gcloud CLI installed and authenticated
- [ ] Firebase CLI installed

## 📋 Migration Steps

### Step 1: Create New Cloud SQL Instance in Asia (5 min)

```bash
# Set variables
PROJECT_ID="vemakin"
REGION="asia-east1"
INSTANCE_NAME="vemakin-asia"

gcloud sql instances create $INSTANCE_NAME \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --storage-size=10GB \
  --storage-auto-increase \
  --availability-type=zonal \
  --project=$PROJECT_ID
```

### Step 2: Migrate Database (10-15 min)

```bash
# Create snapshot of current US database
gcloud sql backups create \
  --instance=vemakin \
  --project=$PROJECT_ID

# Export database to Cloud Storage
BUCKET_NAME="vemakin-db-backups"
gsutil mb -p $PROJECT_ID gs://$BUCKET_NAME 2>/dev/null || true

gcloud sql export sql vemakin \
  gs://$BUCKET_NAME/vemakin-migration.sql \
  --database=postgres \
  --project=$PROJECT_ID

# Import to new Asia instance
gcloud sql import sql $INSTANCE_NAME \
  gs://$BUCKET_NAME/vemakin-migration.sql \
  --database=postgres \
  --project=$PROJECT_ID

# Set password (use same password as before)
gcloud sql users set-password postgres \
  --instance=$INSTANCE_NAME \
  --password=YOUR_DB_PASSWORD \
  --project=$PROJECT_ID
```

### Step 3: Update Cloud SQL Connection Name

After creating the new instance, get the connection name:

```bash
gcloud sql instances describe $INSTANCE_NAME \
  --format='value(connectionName)' \
  --project=$PROJECT_ID
# Should return: vemakin:asia-east1:vemakin-asia
```

### Step 4: Deploy Backend to Asia (3 min)

```bash
# Use the updated deploy script (already updated in this branch)
./deploy-dev.sh YOUR_DB_PASSWORD
```

This will:
- Build and deploy backend to `asia-east1`
- Update Firebase Hosting rewrite rules
- Deploy frontend

### Step 5: Verify Migration

```bash
# Check backend health
BACKEND_URL=$(gcloud run services describe backend-dev \
  --region=asia-east1 \
  --format='value(status.url)' \
  --project=vemakin)

curl $BACKEND_URL/health
curl $BACKEND_URL/api/catalog/health
```

### Step 6: Update Cloud SQL Proxy (for local development)

Update your `start-proxy.sh` script to connect to the new Asia instance:

```bash
#!/bin/bash

PROJECT_ID="vemakin"
INSTANCE_NAME="vemakin-asia"  # Updated to Asia instance
REGION="asia-east1"

echo "Starting Cloud SQL proxy for $INSTANCE_NAME..."
cloud-sql-proxy --port 5432 $PROJECT_ID:$REGION:$INSTANCE_NAME
```

### Step 7: Cleanup (Optional)

After confirming everything works:

```bash
# Delete old US Cloud SQL instance (only after confirming migration works!)
gcloud sql instances delete vemakin --project=$PROJECT_ID

# Delete migration backup
gsutil rm gs://vemakin-db-backups/vemakin-migration.sql
```

## 🚀 Quick Deploy Commands

If you've already done the migration, use these for future deployments:

```bash
# Deploy to Asia
./deploy-dev.sh YOUR_PASSWORD

# Or manually:
gcloud builds submit backend-go --tag gcr.io/vemakin/backend-dev
gcloud run deploy backend-dev \
  --image gcr.io/vemakin/backend-dev \
  --region asia-east1 \
  --add-cloudsql-instances vemakin:asia-east1:vemakin-asia \
  --set-env-vars "DATABASE_URL=postgresql://postgres:PASSWORD@/postgres?host=/cloudsql/vemakin:asia-east1:vemakin-asia" \
  --allow-unauthenticated \
  --project vemakin
```

## 📊 Expected Results

- **Before (us-central1)**: 400-700ms response time
- **After (asia-east1)**: 50-150ms response time (with VPN from China)
- **Distance**: ~12,000km → ~1,500km

## 🆘 Rollback Plan

If something goes wrong:

1. Point backend back to us-central1 database temporarily
2. Keep both databases in sync until migration is verified
3. Or restore the snapshot to the old instance

## 📝 Files Already Updated in This Branch

- ✅ `.github/workflows/deploy-dev.yml` - Updated to asia-east1
- ✅ `deploy-dev.sh` - Updated to asia-east1  
- ✅ `front/api/client.ts` - Fixed API URL fallback
- ✅ Backend code optimized for performance

**Ready to execute the migration?**
Run the commands above starting with Step 1.
