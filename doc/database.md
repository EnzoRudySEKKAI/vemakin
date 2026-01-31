# Database Documentation

## 🗄️ Database Engine
- **Engine**: PostgreSQL 15+ (Google Cloud SQL)
- **Host**: Local access via `cloud_sql_proxy` on port 5432.
- **ORM**: SQLAlchemy 2.0.

## 📊 Core Schema

### **1. Identity**
- **`users`**:
    - `id` (String - Primary Key): Maps directly to **Firebase UID**.
    - `email` (String - Unique).
    - `name` (String).
    - *Note: Switched from internal UUIDs to Firebase UIDs to simplify Auth-to-DB mapping.*

### **2. Production Management**
- **`projects`**:
    - `id` (UUID).
    - `name` (String).
    - `user_id` (String - FK to users.id).
- **`shots`**:
    - `id` (UUID).
    - `project_id` (UUID - FK).
    - `title`, `description`, `status`.
    - `scene_number`, `startTime`, `duration`.
    - `equipment_ids`, `prepared_equipment_ids` (JSONB/Array of JSON).
- **`notes` & `post_prod_tasks`**:
    - Linked to `project_id`.
    - Support for shot-specific notes via `shot_id`.

### **3. Inventory & Gear Catalog**
- **`user_inventory`**:
    - `id` (UUID).
    - `user_id` (String - FK).
    - `catalog_item_id` (UUID - FK to gear_catalog).
    - `custom_name`, `status`, `quantity`, `price_per_day`.
    - `is_owned` (Boolean).
    - **Specs Architecture**:
    - Specs are stored in specialized tables (e.g., `specs_cameras`) for type-safety and performance.
    - `gear_catalog` and `user_inventory` both pull from these tables dynamically via a centralized utility (`catalog_utils.py`).
    - API endpoints for the catalog now include the `specs` object by default.

## ⚙️ The Technical Specs System
The catalog uses a specialized EAV-like approach but with dedicated tables for performance and type-safety.

| Category Slug | Specs Table | Key Fields |
| :--- | :--- | :--- |
| `camera` | `specs_cameras` | Sensor, Mount, Max Resolution, Dynamic Range |
| `lens` | `specs_lenses` | Focal Length, Aperture, Format, Mount |
| `audio` | `specs_audio` | Type, Pattern, Connector |
| `light` | `specs_lights` | Power, Color Temp, CRI |
| `monitor` | `specs_monitoring` | Size, Resolution, Brightness |
| `drone` | `specs_drones` | Flight Time, Range, Weight |

*Full list includes: `audio`, `camera`, `lens`, `light`, `monitor`, `prop`, `stabilizer`, `tripod`, `wireless`, `drone`, `filter`, `grip`.*
