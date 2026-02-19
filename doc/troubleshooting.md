# Troubleshooting & Resolution History

This log tracks major issues encountered and resolved during development.

---

## ❌ Issue: CORS 405 Method Not Allowed
- **Symptom**: `OPTIONS` preflight requests were failing on `/users/me`.
- **Cause**: Backend middleware configuration was strictly handling trailing slashes or missing appropriate CORS headers for preflight.
- **Fix**: Re-implemented standard `CORSMiddleware` in `main.py` and ensured allowed methods included `OPTIONS`.

## ❌ Issue: CORS 400 Bad Request
- **Symptom**: `OPTIONS` call failing after port changes.
- **Cause**: Port mismatch. The frontend was running on port `3002` or `3000`, but only `5173` was allowed in the backend.
- **Fix**: Expanded the `origins` list in `main.py` to include `localhost:3000`, `3002`, and their `[::1]` (IPv6) counterparts.

## ❌ Issue: 307 Temporary Redirect
- **Symptom**: `POST` requests were being redirected to `GET`, causing failures.
- **Cause**: FastAPI's `redirect_slashes=True` (default) was adding/removing slashes on non-matching URL paths.
- **Fix**: Set `redirect_slashes=False` in `FastAPI()` initialization and standardized frontend API paths.

## ❌ Issue: Backend Hang (Pending Requests)
- **Symptom**: `/projects` or `/users/me` would stay in `(pending)` state indefinitely.
- **Cause**: Blocking network calls in the authentication middleware (Firebase verification) were starving the server's threadpool.
- **Fix**: 
    - Refactored `get_current_user` to be `async`.
    - Wrapped blocking Firebase and SQLAlchemy calls in `run_in_threadpool`.
    - Added timestamped debug logging for observability.

## ❌ Issue: Database Connection Refused (5432)
- **Symptom**: Backend crashed with `psycopg2.OperationalError: Connection refused`.
- **Cause**: Cloud SQL Proxy was trying to use a Unix Socket instead of TCP, or was not started.
- **Fix**: Standardized the Proxy startup command to use TCP:
  `./cloud_sql_proxy -instances=vemakin:us-central1:vemakin=tcp:5432`

## ❌ Issue: Inventory 422 Unprocessable Content
- **Symptom**: `POST /inventory` failed when adding new gear.
- **Cause**: 
    - Frontend missing initial values for `isOwned` and `price`.
    - Backend missing fields like `serialNumber` and `rentalPrice` in the schema.
- **Fix**: 
    - Initialized `gearForm` state with default values in `ActionSuite.tsx`.
    - Expanded `models.py` and `schemas.py` to include new fields.
    - Added data migration to the existing database table.

## ❌ Issue: Inventory 500 Error
- **Symptom**: Fetching inventory failed on schema mismatch.
- **Cause**: Local `user_inventory` table columns (snake_case) didn't match the ORM model or were missing fields like `custom_name`.
- **Fix**: Developed `reset_inventory_table.py` to recreate the table with the correct schema and link it to the Gear Catalog.
