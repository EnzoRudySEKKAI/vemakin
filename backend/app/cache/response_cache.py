"""Simple in-memory cache for API responses."""

from typing import Any, Optional
from datetime import datetime, timedelta
import threading


class SimpleCache:
    """Thread-safe in-memory cache with TTL support."""

    def __init__(self):
        self._cache: dict[str, dict[str, Any]] = {}
        self._lock = threading.RLock()

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired."""
        with self._lock:
            if key not in self._cache:
                return None

            entry = self._cache[key]
            if datetime.utcnow() > entry["expires_at"]:
                del self._cache[key]
                return None

            return entry["value"]

    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        """Set value in cache with TTL."""
        with self._lock:
            self._cache[key] = {
                "value": value,
                "expires_at": datetime.utcnow() + timedelta(seconds=ttl_seconds),
            }

    def delete(self, key: str) -> None:
        """Delete a specific key from cache."""
        with self._lock:
            if key in self._cache:
                del self._cache[key]

    def delete_pattern(self, pattern: str) -> None:
        """Delete all keys matching a pattern."""
        with self._lock:
            keys_to_delete = [k for k in self._cache.keys() if pattern in k]
            for key in keys_to_delete:
                del self._cache[key]

    def clear(self) -> None:
        """Clear all cache entries."""
        with self._lock:
            self._cache.clear()


# Global cache instance
cache = SimpleCache()


def get_cache_key(prefix: str, user_id: str, suffix: str = "") -> str:
    """Generate a cache key with prefix, user_id, and optional suffix."""
    if suffix:
        return f"{prefix}:{user_id}:{suffix}"
    return f"{prefix}:{user_id}"
