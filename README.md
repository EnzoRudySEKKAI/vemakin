# Vemakin - Production OS

Professional filmmaking management platform.

## 📂 Documentation
Full project documentation is available in the [doc/overview.md](./doc/overview.md) file.

## 🛠️ Quick Start

### 1. Database
```bash
./cloud_sql_proxy -instances=vemakin:us-central1:vemakin=tcp:5432
```

### 2. Backend (Port 8000)
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### 3. Frontend (Port 3000)
```bash
cd front
npm run dev
```
