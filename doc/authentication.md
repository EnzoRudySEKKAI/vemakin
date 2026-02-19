# Authentication & Security

## 🔐 Identity Provider
- **Provider**: Firebase Authentication.
- **Methods**: Email/Password, Google Sign-in.
- **Token Type**: JWT (Firebase ID Token).

## 🔄 Auth Lifecycle

### **1. Frontend Login**
- The user authenticates via `firebase/auth` in `front/firebase.ts`.
- `onAuthStateChanged` is observed in `useProductionStore.ts`.
- On state change, the Firebase ID Token is retrieved and stored for the session.

### **2. Frontend Interceptor**
- All API calls pass through `front/api/client.ts`.
- An Axios **Request Interceptor** automatically fetches the latest ID token from Firebase and adds it to the headers:
  ```http
  Authorization: Bearer <ID_TOKEN>
  ```

### **3. Backend Verification**
The backend implements a multi-step verification in `backend/app/auth.py`:
1.  **Extract Header**: Securely retrieves the Bearer token.
2.  **Verify with Firebase**: Uses `firebase_admin.auth.verify_id_token`. This confirms the token is valid and issued by the correct project.
3.  **Sync User**: 
    - If the Firebase UID does not exist in the local `users` table, a new entry is created.
    - This ensures every authenticated request has a corresponding local database user record.
4.  **Async/Performance**: 
    - Verification is wrapped in `run_in_threadpool` to prevent blocking the FastAPI event loop during network calls to Google's servers.

## 🛡️ Security Measures
- **CORS (Cross-Origin Resource Sharing)**: 
    - Restricted to authorized development ports: 3000, 3002, 5173.
    - Credentials (cookies/headers) are allowed.
- **Dependency Injection**: Every protected route uses `Depends(get_current_user)` to enforce authentication before execution.
- **Database Isolation**: Queries consistently filter by `current_user['uid']`.
