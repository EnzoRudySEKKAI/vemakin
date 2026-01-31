# Vemakin - Project Documentation

## 🚀 Project Overview
Vemakin is a Production OS designed for filmmaking and media production management. It enables users to manage projects, inventory, shot lists, notes, and post-production tasks in a centralized, synchronized ecosystem.

---

## 🏗️ Architecture

### **Frontend**
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **State Management**: custom React hooks (`useProductionStore`) simulating a store pattern with local and persistent state.
- **API Client**: Axios with interceptors for Firebase ID Token injection.
- **Key Components**:
    - `InventoryView`: Manages user equipment and explores the Gear Catalog.
    - `ActionSuite`: Centralized modal for creating all entities (Projects, Shots, Gear, etc.).
    - `GearForm`: Dynamic form with real-time catalog fetching (Brands, Categories, Specs).

### **Backend**
- **Framework**: FastAPI (Python 3.13).
- **ORM**: SQLAlchemy.
- **Database**: PostgreSQL (Hosted on Google Cloud SQL).
- **Authentication**: Firebase Admin SDK (Asynchronous middleware for token verification).
- **Routers**:
    - `/projects`: CRUD for user projects.
    - `/inventory`: Personal gear management.
    - `/catalog`: Global gear database and technical specs.
    - `/shots`, `/notes`, `/postprod`: Production tracking.

### **Database & Infrastructure**
- **Cloud SQL**: Managed PostgreSQL instance in `us-central1`.
- **Cloud SQL Proxy**: Used for local development to securely connect to the Cloud SQL instance via TCP (Port 5432).
- **Firebase**: Handles User Authentication and secure token generation.

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
- **Run Command**:
```bash
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### **3. Frontend**
Located in `/front`.
- **Port**: Typically running on `localhost:3000` or `3002`.
- **Auth**: Connects to Firebase using credentials in `.env`.
- **Run Command**:
```bash
npm run dev
```

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

---

## 🔐 Security
- **CORS**: Configured in `main.py` to allow specific local origins (`localhost:3000`, `3002`, `5173`).
- **Auth Middleware**: Every private endpoint verifies the `Authorization: Bearer <token>` header against Firebase.
- **UID Mapping**: Users are created in the local database upon their first visit via Firebase UID to ensure data ownership.
