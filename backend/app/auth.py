from fastapi import HTTPException, status, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db
from .models import models

# Initialize Firebase Admin
# If GOOGLE_APPLICATION_CREDENTIALS is set in env, it uses that.
# Otherwise it tries to use Application Default Credentials.
try:
    if not firebase_admin._apps:
        # If specific creds file is provided in settings
        if settings.GOOGLE_APPLICATION_CREDENTIALS:
            cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS)
            firebase_admin.initialize_app(cred)
        else:
            # Use default credentials (good for Cloud Run and local GCloud Auth)
            firebase_admin.initialize_app()
except Exception as e:
    print(f"Error initializing Firebase Admin: {e}")

import time
from fastapi.concurrency import run_in_threadpool

security = HTTPBearer()

async def get_current_user(
    creds: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    token = creds.credentials
    start_time = time.time()
    print(f"[{start_time:.3f}] DEBUG: Authenticating token...")
    
    try:
        # Verify the ID token - this is a blocking call, run in threadpool
        decoded_token = await run_in_threadpool(auth.verify_id_token, token)
        verify_time = time.time()
        uid = decoded_token['uid']
        print(f"[{verify_time:.3f}] DEBUG: Token verified for UID: {uid} (took {verify_time - start_time:.3f}s)")
        
        # Check if user exists in DB
        db_query_start = time.time()
        print(f"[{db_query_start:.3f}] DEBUG: Querying DB for user {uid}...")
        
        # db.query is a blocking SQLAlchemy call
        def sync_db_ops():
            db_user = db.query(models.User).filter(models.User.id == uid).first()
            if not db_user:
                print(f"DEBUG: User {uid} not in DB, creating...")
                email = decoded_token.get('email')
                name = decoded_token.get('name') or email.split('@')[0] if email else "User"
                new_user = models.User(id=uid, email=email, name=name)
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                return True
            return False

        created = await run_in_threadpool(sync_db_ops)
        db_time = time.time()
        print(f"[{db_time:.3f}] DEBUG: DB user handled (took {db_time - db_query_start:.3f}s)")
            
        return decoded_token
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
