# CI/CD Setup Guide

This guide explains how to configure GitHub Actions for automatic deployment of Vemakin to DEV and PROD environments.

## 🚀 Quick Overview

**Branch Strategy:**
- Push to `dev/*` branches → Deploys to DEV environment
- Push to `release/*` branches → Deploys to PROD environment

**Infrastructure:**
- **DEV**: Cloud Run (backend) + Firebase Hosting (frontend) - Project `vemakin`
- **PROD**: Cloud Run (backend) + Firebase Hosting (frontend) - Project `vemakin-prod`

**Authentication Method:** Workload Identity Federation (OIDC) - No long-lived service account keys

---

## 🔐 Prerequisites

### 1. Google Cloud Projects Setup

Ensure you have two GCP projects:
- `vemakin` (DEV)
- `vemakin-prod` (PROD)

### 2. Enable Required APIs

Run in both projects (DEV and PROD):

```bash
# Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable iamcredentials.googleapis.com
```

---

## 🔧 Setup Workload Identity Federation (DEV)

### Step 1: Get Project Number

```bash
# For DEV project
gcloud projects describe vemakin --format="value(projectNumber)"
# Save this number - you'll need it later
```

### Step 2: Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions" \
  --project=vemakin

# Grant required permissions
gcloud projects add-iam-policy-binding vemakin \
  --member="serviceAccount:github-actions@vemakin.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding vemakin \
  --member="serviceAccount:github-actions@vemakin.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding vemakin \
  --member="serviceAccount:github-actions@vemakin.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### Step 3: Create Workload Identity Pool

```bash
# Create the Workload Identity Pool
gcloud iam workload-identity-pools create github-pool \
  --project=vemakin \
  --location=global \
  --display-name="GitHub Pool"

# Create the OIDC provider
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --project=vemakin \
  --location=global \
  --workload-identity-pool=github-pool \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.branch=assertion.ref" \
  --attribute-condition="assertion.repository=='EnzoRudySEKKAI/vemakin'" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### Step 4: Allow GitHub Actions to Impersonate Service Account

```bash
# Get the Workload Identity Pool provider resource name
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools providers describe github-provider \
  --project=vemakin \
  --location=global \
  --workload-identity-pool=github-pool \
  --format="value(name)")

# Grant permission for GitHub Actions to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding \
  github-actions@vemakin.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/EnzoRudySEKKAI/vemakin"
```

Replace `PROJECT_NUMBER` with the number from Step 1.

---

## 🔧 Setup Workload Identity Federation (PROD)

Repeat the same steps for the PROD project:

```bash
# Get project number
gcloud projects describe vemakin-prod --format="value(projectNumber)"

# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions" \
  --project=vemakin-prod

# Grant permissions
gcloud projects add-iam-policy-binding vemakin-prod \
  --member="serviceAccount:github-actions@vemakin-prod.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding vemakin-prod \
  --member="serviceAccount:github-actions@vemakin-prod.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding vemakin-prod \
  --member="serviceAccount:github-actions@vemakin-prod.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create Workload Identity Pool
gcloud iam workload-identity-pools create github-pool \
  --project=vemakin-prod \
  --location=global \
  --display-name="GitHub Pool"

# Create OIDC provider
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --project=vemakin-prod \
  --location=global \
  --workload-identity-pool=github-pool \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.branch=assertion.ref" \
  --attribute-condition="assertion.repository=='EnzoRudySEKKAI/vemakin'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Grant impersonation permission
gcloud iam service-accounts add-iam-policy-binding \
  github-actions@vemakin-prod.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER_PROD/locations/global/workloadIdentityPools/github-pool/attribute.repository/EnzoRudySEKKAI/vemakin"
```

---

## 🔐 Configure GitHub Secrets

### 1. Get Required Values

```bash
# Get DEV project number
gcloud projects describe vemakin --format="value(projectNumber)"

# Get PROD project number
gcloud projects describe vemakin-prod --format="value(projectNumber)"
```

### 2. Generate Firebase Token

```bash
firebase login:ci
```

Copy the token displayed.

### 3. Add Secrets to GitHub Repository

Go to: `https://github.com/EnzoRudySEKKAI/vemakin/settings/secrets/actions`

Add the following secrets:

#### For DEV Environment:

| Secret Name | Value | How to Get |
|------------|-------|-----------|
| `GCP_PROJECT_NUMBER` | DEV project number | From gcloud command above |
| `DATABASE_URL_DEV` | `postgresql://postgres:PASSWORD@/postgres?host=/cloudsql/vemakin:us-central1:vemakin` | Replace PASSWORD |
| `FIREBASE_API_KEY_DEV` | Firebase API key | Firebase Console → Project Settings |
| `FIREBASE_AUTH_DOMAIN_DEV` | `vemakin.firebaseapp.com` | Firebase Console |
| `FIREBASE_STORAGE_BUCKET_DEV` | `vemakin.firebasestorage.app` | Firebase Console |
| `FIREBASE_MESSAGING_SENDER_ID_DEV` | 827644761647 | Firebase Console |
| `FIREBASE_APP_ID_DEV` | Firebase App ID | Firebase Console → Project Settings |
| `BACKEND_URL_DEV` | `https://backend-dev-stx3twx4mq-uc.a.run.app` | Cloud Run URL |
| `FIREBASE_TOKEN` | Token from `firebase login:ci` | CLI output |

#### For PROD Environment:

| Secret Name | Value | How to Get |
|------------|-------|-----------|
| `GCP_PROJECT_NUMBER_PROD` | PROD project number | From gcloud command above |
| `DATABASE_URL_PROD` | Cloud SQL connection string for PROD | Replace with PROD values |
| `FIREBASE_API_KEY_PROD` | Firebase API key (PROD project) | Firebase Console PROD |
| `FIREBASE_AUTH_DOMAIN_PROD` | `vemakin-prod.firebaseapp.com` | Firebase Console PROD |
| `FIREBASE_STORAGE_BUCKET_PROD` | `vemakin-prod.firebasestorage.app` | Firebase Console PROD |
| `FIREBASE_MESSAGING_SENDER_ID_PROD` | PROD sender ID | Firebase Console PROD |
| `FIREBASE_APP_ID_PROD` | Firebase App ID (PROD) | Firebase Console PROD |
| `BACKEND_URL_PROD` | Cloud Run URL for PROD | Will be generated after first PROD deployment |

---

## 🧪 Testing the Setup

### Test DEV Deployment

1. Create a new branch:
   ```bash
   git checkout -b dev/test-cicd
   git push origin dev/test-cicd
   ```

2. Make a small change to backend or frontend
3. Commit and push
4. Go to GitHub Actions tab to see the deployment in progress

### Test PROD Deployment

1. Create a new branch:
   ```bash
   git checkout -b release/v1.0.0
   git push origin release/v1.0.0
   ```

2. Make a small change
3. Commit and push
4. Check GitHub Actions for PROD deployment

---

## 📝 Workflow Files

The following workflows are created in `.github/workflows/`:

1. **deploy-backend-dev.yml** - Deploys backend to Cloud Run DEV on push to `dev/*`
2. **deploy-backend-prod.yml** - Deploys backend to Cloud Run PROD on push to `release/*`
3. **deploy-frontend-dev.yml** - Deploys frontend to Firebase DEV on push to `dev/*`
4. **deploy-frontend-prod.yml** - Deploys frontend to Firebase PROD on push to `release/*`

---

## 🔍 Monitoring Deployments

### GitHub Actions
- Go to: `https://github.com/EnzoRudySEKKAI/vemakin/actions`
- View real-time logs
- See deployment status

### Cloud Console
- **Cloud Run**: https://console.cloud.google.com/run
- **Firebase Hosting**: https://console.firebase.google.com/project/vemakin/hosting

---

## 🚨 Troubleshooting

### "Unable to impersonate service account"
- Check that the Workload Identity Pool is created
- Verify the attribute condition matches your repository
- Ensure the service account has the `roles/iam.workloadIdentityUser` role

### "Permission denied" on Cloud Build
- Verify the service account has `roles/cloudbuild.builds.editor`

### "Permission denied" on Cloud Run
- Verify the service account has `roles/run.admin`

### Firebase deployment fails
- Check that `FIREBASE_TOKEN` secret is set correctly
- Verify Firebase CLI is installed in the workflow

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Cloud Run CI/CD](https://cloud.google.com/run/docs/continuous-deployment-with-cloud-build)
- [Firebase Hosting GitHub Actions](https://firebase.google.com/docs/hosting/github-integration)
