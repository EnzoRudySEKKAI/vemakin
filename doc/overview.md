# Vemakin - Project Documentation

## 🚀 Project Overview
Vemakin is a Production OS designed for filmmaking and media production management. It enables users to manage projects, inventory, shot lists, notes, and post-production tasks in a centralized, synchronized ecosystem.

---

## 🏗️ Architecture

### **Frontend**
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with environment modes (development/production)
- **State Management**: custom React hooks (`useProductionStore`) simulating a store pattern with local and persistent state
- **API Client**: Axios with interceptors for Firebase ID Token injection
- **Deployment**: Firebase Hosting (DEV: https://vemakin.web.app)
- **Mobile**: Capacitor support (iOS/Android) with platform-specific CORS handling
- **Key Components**:
    - `InventoryView`: Manages user equipment and explores the Gear Catalog.
    - `ActionSuite`: Centralized modal for creating all entities (Projects, Shots, Gear, etc.).
    - `GearForm`: Dynamic form with real-time catalog fetching (Brands, Categories, Specs).

### **Backend**
- **Framework**: FastAPI (Python 3.13)
- **ORM**: SQLAlchemy with connection pooling (QueuePool, pool_size=10)
- **Database**: PostgreSQL (Google Cloud SQL - us-central1)
- **Authentication**: Firebase Admin SDK with async token verification
- **Server**: Gunicorn + UvicornWorker for production (2 workers, 4 threads)
- **Deployment**: Cloud Run (DEV: https://backend-dev-stx3twx4mq-uc.a.run.app)
- **Container**: Multi-stage Docker build (Python 3.13-slim)
- **Routers**:
    - `/projects`: CRUD for user projects.
    - `/inventory`: Personal gear management.
    - `/catalog`: Global gear database and technical specs.
    - `/shots`, `/notes`, `/postprod`: Production tracking.

### **Database & Infrastructure**
- **Cloud SQL**: Managed PostgreSQL instance in `us-central1`
- **Cloud SQL Proxy**: Used for local development to securely connect to the Cloud SQL instance via TCP (Port 5432)
- **Cloud Run**: Auto-scaling (0-10 instances), 512Mi memory, 1 CPU
- **Firebase**: Handles User Authentication and secure token generation
- **Firebase Hosting**: Static hosting with SPA routing and cache optimization

---

## 🛠️ Setup & Development

### **1. Database Proxy**
To connect to the production database locally:
```bash
./cloud_sql_proxy -instances=vemakin:us-central1:vemakin=tcp:5432
```

### **2. Backend**
Located in `/backend`.
- **Environment**: `.env` file handles `DATABASE_URL` and `FIREBASE_PROJECT_ID`.
- **Local Development**:
```bash
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
- **Production**: Gunicorn with UvicornWorker (see Dockerfile)

### **3. Frontend**
Located in `/front`.
- **Local Development**:
```bash
# Use deployed backend (default)
npm run dev

# Use local backend
VITE_API_URL=http://localhost:8000 npm run dev
```
- **Environment Files**:
    - `.env.development` - Local dev config ( Firebase project: vemakin)
    - `.env.production` - Production build config
    - `.env` - Base Firebase configuration

### **4. Mobile (Capacitor)**
```bash
# Sync web assets to native projects
npm run cap:sync

# Open iOS project
npm run cap:ios

# Open Android project (if configured)
npm run cap:android
```

---

## 🚀 Deployment

### **Infrastructure DEV**

| Service | URL | Technology |
|---------|-----|------------|
| Frontend | https://vemakin.web.app | Firebase Hosting |
| Backend | https://backend-dev-stx3twx4mq-uc.a.run.app | Cloud Run |
| Database | vemakin:us-central1:vemakin | Cloud SQL PostgreSQL |
| Auth | vemakin | Firebase Auth |

### **Deploy Backend (Cloud Run)**

Prerequisites:
- gcloud CLI installed and authenticated
- Docker configured
- Database password

```bash
cd backend
./deploy-dev.sh YOUR_DB_PASSWORD
```

**Script Features:**
- Builds Docker image with Cloud Build
- Deploys to Cloud Run with auto-scaling
- Connects Cloud SQL automatically
- Configures environment variables

**Manual Deployment:**
```bash
gcloud builds submit --tag gcr.io/vemakin/backend-dev
gcloud run deploy backend-dev \
  --image gcr.io/vemakin/backend-dev \
  --platform managed \
  --region us-central1 \
  --add-cloudsql-instances vemakin:us-central1:vemakin \
  --set-env-vars "DATABASE_URL=postgresql://postgres:PASSWORD@/postgres?host=/cloudsql/vemakin:us-central1:vemakin" \
  --allow-unauthenticated
```

### **Deploy Frontend (Firebase Hosting)**

Prerequisites:
- firebase CLI installed (`npm install -g firebase-tools`)
- Authenticated (`firebase login`)

```bash
# Using script
./deploy-front-dev.sh

# Manual steps
cd front
npm install
npm run build
cd ..
firebase deploy --only hosting
```

**Configuration Files:**
- `firebase.json` - Hosting configuration (SPA routing, caching)
- `.firebaserc` - Default project: vemakin

---

## 📱 Mobile Applications

### **Capacitor Configuration**

**iOS:**
- Origin: `capacitor://localhost`
- Scheme: Default Capacitor
- Config: `ios/App/App/Info.plist`

**Android:**
- Origin: `https://localhost`
- Scheme: HTTPS (configured in `capacitor.config.ts`)
- Config: `androidScheme: 'https'`

### **CORS for Mobile**

Backend CORS origins include mobile-specific entries:
- `capacitor://localhost` (iOS)
- `https://localhost` (Android)
- `http://localhost` (Fallback)

---

## 📋 Features Implemented

### **Gear Catalog Integration**
- **Unified Database**: Real brands and models for Camera, Audio, Lenses, etc.
- **Auto-Specs**: Selecting a catalog item automatically retrieves technical specifications (e.g., Sensor size, Focal length, Weight).
- **Sync**: User inventory items are linked to catalog IDs for data consistency.

### **Production Suite**
- **Project Isolation**: Data is filtered by the active project.
- **Contextual Actions**: Adding notes or tasks directly from a shot or project view.
- **Offline Resilience**: Initial data fetching pattern designed to minimize blocking during startup.

### **Multi-Platform Support**
- **Web**: Responsive web app with PWA capabilities
- **iOS**: Native app via Capacitor
- **Android**: Native app via Capacitor
- **Desktop**: Electron support (via Capacitor community plugin)

---

## 🔐 Security

### **Authentication**
- **Firebase Auth**: Email/Password provider enabled
- **Token Verification**: Backend validates Firebase ID tokens via Admin SDK
- **UID Mapping**: Users are created in the local database upon their first visit via Firebase UID to ensure data ownership.
- **Guest Mode**: Supports unauthenticated access via `X-Guest-Mode` header.

### **CORS Configuration**
```python
origins = [
    # Local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://[::1]:3000",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://[::1]:3002",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://[::1]:5173",
    # Production (Firebase Hosting)
    "https://vemakin.web.app",
    "https://vemakin.firebaseapp.com",
    "https://*.vemakin.web.app",
    "https://*.vemakin.firebaseapp.com",
    # Mobile apps (Capacitor)
    "capacitor://localhost",
    "https://localhost",
    "http://localhost",
]
```

### **Security Headers**
Firebase Hosting configured with:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Cache control for static assets (1 year for `/assets/**`)

### **Environment Variables**
- Database credentials: Stored in Cloud Run environment (not in code)
- Firebase config: Public keys only (safe to commit)
- API URLs: Mode-specific (.env.development vs .env.production)

---

## 🐳 Docker Configuration

### **Multi-Stage Build**

**Stage 1: Builder**
- Python 3.13-slim
- Installs build dependencies (gcc, libpq-dev)
- Creates virtual environment
- Installs requirements

**Stage 2: Production**
- Minimal runtime image
- Copies venv from builder
- Includes libpq5 for PostgreSQL
- Runs gunicorn with uvicorn workers

**Health Check**
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1
```

---

## 🗂️ Project Structure

```
Vemakin/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── auth.py            # Firebase auth middleware
│   │   ├── config.py          # Pydantic settings
│   │   ├── database.py        # SQLAlchemy connection pooling
│   │   ├── main.py            # FastAPI app with CORS
│   │   ├── models/            # Database models
│   │   ├── routers/           # API endpoints
│   │   └── schemas/           # Pydantic schemas
│   ├── Dockerfile             # Multi-stage container
│   ├── deploy-dev.sh          # Cloud Run deployment script
│   ├── requirements.txt       # Python dependencies
│   └── .dockerignore          # Docker exclusions
├── front/                     # React Frontend
│   ├── src/                   # React components
│   ├── api/                   # Axios client with auth interceptors
│   ├── public/                # Static assets
│   ├── capacitor.config.ts    # Capacitor configuration
│   ├── firebase.json          # Firebase Hosting config (root)
│   └── vite.config.ts         # Vite build configuration
├── deploy-front-dev.sh        # Firebase Hosting deployment
├── firebase.json              # Firebase Hosting configuration
├── .firebaserc               # Firebase project selector
└── doc/
    └── overview.md           # This documentation
```

---

## 🔄 Development Workflow

### **Local Development (Full Stack)**

1. **Start Database Proxy**
   ```bash
   ./cloud_sql_proxy -instances=vemakin:us-central1:vemakin=tcp:5432
   ```

2. **Start Backend**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```

3. **Start Frontend (Local API)**
   ```bash
   cd front
   VITE_API_URL=http://localhost:8000 npm run dev
   ```

### **Local Development (Deployed Backend)**

1. **Start Frontend (Deployed API)**
   ```bash
   cd front
   npm run dev  # Uses https://backend-dev-stx3twx4mq-uc.a.run.app
   ```

### **Mobile Development**

1. **Build Web Assets**
   ```bash
   cd front
   npm run build
   ```

2. **Sync to Native Projects**
   ```bash
   npm run cap:sync
   ```

3. **Open in IDE**
   ```bash
   npm run cap:ios      # Xcode
   # or
   npx cap open android # Android Studio
   ```

---

## 📝 Environment Variables Reference

### **Backend (.env)**
```bash
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/postgres
FIREBASE_PROJECT_ID=vemakin
GOOGLE_APPLICATION_CREDENTIALS=    # Optional (Cloud Run uses service account)
```

### **Frontend (.env.development)**
```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=vemakin.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vemakin
VITE_FIREBASE_STORAGE_BUCKET=vemakin.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=827644761647
VITE_FIREBASE_APP_ID=
VITE_API_URL=https://backend-dev-stx3twx4mq-uc.a.run.app
```

---

## 🚦 Status

- ✅ Backend: Deployed on Cloud Run (DEV)
- ✅ Frontend: Deployed on Firebase Hosting (DEV)
- ✅ Database: Cloud SQL PostgreSQL (connected)
- ✅ Authentication: Firebase Auth (Email/Password enabled)
- ✅ Mobile: CORS configured for iOS/Android
- ⏳ CI/CD: GitHub Actions (pending implementation)
