from fastapi import HTTPException, status, Depends, Header, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from .config import settings
from .database import get_db
from .models import models
from .mock_data import GUEST_USER_UID, get_mock_db

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
    db: Session = Depends(get_db),
):
    token = creds.credentials
    start_time = time.time()
    print(f"[{start_time:.3f}] DEBUG: Authenticating token...")

    try:
        # Verify the ID token - this is a blocking call, run in threadpool
        decoded_token = await run_in_threadpool(auth.verify_id_token, token)
        verify_time = time.time()
        uid = decoded_token["uid"]
        print(
            f"[{verify_time:.3f}] DEBUG: Token verified for UID: {uid} (took {verify_time - start_time:.3f}s)"
        )

        # Check if user exists in DB
        db_query_start = time.time()
        print(f"[{db_query_start:.3f}] DEBUG: Querying DB for user {uid}...")

        # db.query is a blocking SQLAlchemy call
        def sync_db_ops():
            db_user = db.query(models.User).filter(models.User.id == uid).first()
            if not db_user:
                print(f"DEBUG: User {uid} not in DB, creating...")
                email = decoded_token.get("email")
                name = (
                    decoded_token.get("name") or email.split("@")[0]
                    if email
                    else "User"
                )
                new_user = models.User(id=uid, email=email, name=name)
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                return True
            return False

        created = await run_in_threadpool(sync_db_ops)
        db_time = time.time()
        print(
            f"[{db_time:.3f}] DEBUG: DB user handled (took {db_time - db_query_start:.3f}s)"
        )

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


# =============================================================================
# GUEST MODE AUTHENTICATION
# =============================================================================


async def get_current_user_or_guest(
    authorization: Optional[str] = Header(None),
    x_guest_mode: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Authenticate user - supports both Firebase auth and Guest mode.

    If X-Guest-Mode header is set to "true", returns guest user without Firebase verification.
    Otherwise, verifies Firebase token as usual.

    Usage in routers:
        current_user: Dict = Depends(get_current_user_or_guest)
        if current_user.get("is_guest"):
            # Use mock database
        else:
            # Use real database
    """
    # Check if guest mode is requested
    if x_guest_mode and x_guest_mode.lower() == "true":
        print(f"DEBUG: Guest mode detected - serving mock data")

        # Return guest user token format (compatible with existing code)
        return {
            "uid": GUEST_USER_UID,
            "email": "guest@vemakin.local",
            "name": "Guest",
            "is_guest": True,
        }

    # Otherwise, proceed with normal Firebase authentication
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Parse Bearer token from Authorization header
    try:
        scheme, token = authorization.split(" ", 1)
        if scheme.lower() != "bearer":
            raise ValueError("Invalid scheme")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication format. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create HTTPAuthorizationCredentials object for get_current_user
    creds = HTTPAuthorizationCredentials(scheme=scheme, credentials=token)
    return await get_current_user(creds, db)
