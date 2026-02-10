from fastapi import HTTPException, status, Depends, Header, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import time
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

from fastapi.concurrency import run_in_threadpool

security = HTTPBearer()

# =============================================================================
# TOKEN AND USER CACHING
# =============================================================================

# In-memory cache for verified Firebase tokens
# Key: token string, Value: {decoded_token, expires_at}
_token_cache: Dict[str, Dict[str, Any]] = {}
TOKEN_CACHE_TTL = 300  # 5 minutes

# In-memory cache for verified users (avoid DB lookups)
# Key: user_id, Value: {exists: bool, created: bool, expires_at}
_user_cache: Dict[str, Dict[str, Any]] = {}
USER_CACHE_TTL = 300  # 5 minutes


def _get_cached_token(token: str) -> Optional[Dict[str, Any]]:
    """Get cached token if still valid."""
    cached = _token_cache.get(token)
    if cached and cached["expires_at"] > time.time():
        return cached["decoded_token"]
    # Remove expired entry
    if cached:
        del _token_cache[token]
    return None


def _log_cache_stats():
    """Log cache statistics."""
    now = time.time()
    token_count = len(_token_cache)
    user_count = len(_user_cache)
    valid_tokens = sum(1 for v in _token_cache.values() if v["expires_at"] > now)
    valid_users = sum(1 for v in _user_cache.values() if v["expires_at"] > now)
    print(
        f"[AUTH CACHE] Tokens: {valid_tokens}/{token_count}, Users: {valid_users}/{user_count}"
    )


def _cache_token(token: str, decoded_token: Dict[str, Any]) -> None:
    """Cache verified token."""
    _token_cache[token] = {
        "decoded_token": decoded_token,
        "expires_at": time.time() + TOKEN_CACHE_TTL,
    }


def _get_cached_user(uid: str) -> Optional[Dict[str, Any]]:
    """Get cached user if still valid."""
    cached = _user_cache.get(uid)
    if cached and cached["expires_at"] > time.time():
        return cached
    # Remove expired entry
    if cached:
        del _user_cache[uid]
    return None


def _cache_user(uid: str, exists: bool = True, created: bool = False) -> None:
    """Cache user existence."""
    _user_cache[uid] = {
        "exists": exists,
        "created": created,
        "expires_at": time.time() + USER_CACHE_TTL,
    }


# =============================================================================
# AUTHENTICATION
# =============================================================================


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
):
    """Get current user with token and user caching for performance."""
    token = creds.credentials
    auth_start = time.time()

    try:
        # 1. Check token cache first (avoid Firebase network call)
        cached_token = _get_cached_token(token)
        if cached_token:
            uid = cached_token["uid"]

            # 2. Check user cache (avoid DB query)
            cached_user = _get_cached_user(uid)
            if cached_user:
                # User is cached, return immediately
                elapsed = time.time() - auth_start
                print(f"[AUTH] Token cache HIT, User cache HIT | {elapsed:.3f}s")
                return cached_token

            # Token cached but user not cached - do quick DB check
            print(f"[AUTH] Token cache HIT, User cache MISS")

            def sync_db_ops_cached():
                db_user = db.query(models.User).filter(models.User.id == uid).first()
                if db_user:
                    _cache_user(uid, exists=True, created=False)
                else:
                    # User doesn't exist, create it
                    email = cached_token.get("email")
                    name = (
                        cached_token.get("name") or email.split("@")[0]
                        if email
                        else "User"
                    )
                    new_user = models.User(id=uid, email=email, name=name)
                    db.add(new_user)
                    db.commit()
                    db.refresh(new_user)
                    _cache_user(uid, exists=True, created=True)
                return db_user

            await run_in_threadpool(sync_db_ops_cached)
            elapsed = time.time() - auth_start
            print(f"[AUTH] Token cache HIT, User DB lookup | {elapsed:.3f}s")
            return cached_token

        # 3. Token not cached - verify with Firebase (network call)
        print(f"[AUTH] Token cache MISS - calling Firebase...")
        firebase_start = time.time()
        decoded_token = await run_in_threadpool(auth.verify_id_token, token)
        firebase_elapsed = time.time() - firebase_start
        _cache_token(token, decoded_token)
        uid = decoded_token["uid"]

        # 4. Check user cache again
        cached_user = _get_cached_user(uid)
        if cached_user:
            elapsed = time.time() - auth_start
            print(
                f"[AUTH] Token cache MISS ({firebase_elapsed:.3f}s), User cache HIT | Total: {elapsed:.3f}s"
            )
            return decoded_token

        # 5. Check if user exists in DB (only on cache miss)
        print(
            f"[AUTH] Token cache MISS ({firebase_elapsed:.3f}s), User cache MISS - DB lookup..."
        )
        db_start = time.time()

        def sync_db_ops():
            db_user = db.query(models.User).filter(models.User.id == uid).first()
            if not db_user:
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
                _cache_user(uid, exists=True, created=True)
            else:
                _cache_user(uid, exists=True, created=False)
            return db_user

        await run_in_threadpool(sync_db_ops)
        db_elapsed = time.time() - db_start
        total_elapsed = time.time() - auth_start
        print(
            f"[AUTH] Token cache MISS ({firebase_elapsed:.3f}s), User DB lookup ({db_elapsed:.3f}s) | Total: {total_elapsed:.3f}s"
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
