"""
Mock data fixtures for Guest Mode
Provides realistic demo data when user is not authenticated
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any
import uuid

# Guest user identifier
GUEST_USER_UID = "guest-user"

# Current date for realistic timestamps
NOW = datetime.now()

# UUIDs for all entities (regenerated for consistency)
SHOT_UUIDS = [str(uuid.uuid4()) for _ in range(5)]
EQUIPMENT_UUIDS = [str(uuid.uuid4()) for _ in range(10)]
NOTE_UUIDS = [str(uuid.uuid4()) for _ in range(3)]
TASK_UUIDS = [str(uuid.uuid4()) for _ in range(5)]
CATEGORY_UUIDS = [str(uuid.uuid4()) for _ in range(7)]
BRAND_UUIDS = [str(uuid.uuid4()) for _ in range(8)]
CATALOG_UUIDS = [str(uuid.uuid4()) for _ in range(5)]

# =============================================================================
# PROJECT
# =============================================================================

MOCK_PROJECT = {
    "id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
    "name": "Mon Premier Film",
    "user_id": GUEST_USER_UID,
    "created_at": (NOW - timedelta(days=30)).isoformat(),
    "updated_at": (NOW - timedelta(days=2)).isoformat(),
}

# =============================================================================
# SHOTS
# =============================================================================

MOCK_SHOTS = [
    {
        "id": SHOT_UUIDS[0],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "title": "Scène d'ouverture - Vue sur la ville",
        "description": "Plan large au drone de la ville au lever du soleil",
        "date": (NOW + timedelta(days=5)).strftime("%Y-%m-%d"),
        "start_time": "06:30",
        "duration": "2h",
        "status": "pending",
        "location": "Toit immeuble Centre-ville",
        "remarks": "Vérifier autorisation drone",
        "scene_number": "1A",
        "equipment_ids": [EQUIPMENT_UUIDS[0], EQUIPMENT_UUIDS[4]],
        "prepared_equipment_ids": [],
        "created_at": (NOW - timedelta(days=20)).isoformat(),
        "updated_at": (NOW - timedelta(days=5)).isoformat(),
    },
    {
        "id": SHOT_UUIDS[1],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "title": "Interview protagoniste",
        "description": "Interview en intérieur avec éclairage naturel",
        "date": (NOW + timedelta(days=5)).strftime("%Y-%m-%d"),
        "start_time": "14:00",
        "duration": "1.5h",
        "status": "pending",
        "location": "Café Le Central",
        "remarks": "Réserver la table du fond",
        "scene_number": "2A",
        "equipment_ids": [EQUIPMENT_UUIDS[0], EQUIPMENT_UUIDS[1], EQUIPMENT_UUIDS[6]],
        "prepared_equipment_ids": [],
        "created_at": (NOW - timedelta(days=18)).isoformat(),
        "updated_at": (NOW - timedelta(days=4)).isoformat(),
    },
    {
        "id": SHOT_UUIDS[2],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "title": "Séquence action - Course poursuite",
        "description": "Plans caméra embarquée et stabilisée",
        "date": (NOW + timedelta(days=7)).strftime("%Y-%m-%d"),
        "start_time": "10:00",
        "duration": "3h",
        "status": "pending",
        "location": "Vieille ville - Ruelles",
        "remarks": "Sécurité sur le tournage",
        "scene_number": "3A",
        "equipment_ids": [EQUIPMENT_UUIDS[0], EQUIPMENT_UUIDS[5], EQUIPMENT_UUIDS[2]],
        "prepared_equipment_ids": [],
        "created_at": (NOW - timedelta(days=15)).isoformat(),
        "updated_at": (NOW - timedelta(days=3)).isoformat(),
    },
    {
        "id": SHOT_UUIDS[3],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "title": "Portrait crépusculaire",
        "description": "Portrait extérieur à la golden hour",
        "date": (NOW + timedelta(days=7)).strftime("%Y-%m-%d"),
        "start_time": "19:00",
        "duration": "1h",
        "status": "pending",
        "location": "Parc municipal",
        "remarks": "Prévoir lumière LED en backup",
        "scene_number": "4A",
        "equipment_ids": [EQUIPMENT_UUIDS[0], EQUIPMENT_UUIDS[3], EQUIPMENT_UUIDS[8]],
        "prepared_equipment_ids": [],
        "created_at": (NOW - timedelta(days=12)).isoformat(),
        "updated_at": (NOW - timedelta(days=2)).isoformat(),
    },
    {
        "id": SHOT_UUIDS[4],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "title": "Scène finale - Confrontation",
        "description": "Dialogue intense entre les deux personnages",
        "date": (NOW + timedelta(days=10)).strftime("%Y-%m-%d"),
        "start_time": "16:00",
        "duration": "2.5h",
        "status": "pending",
        "location": "Studio A",
        "remarks": "Tours de parole importants",
        "scene_number": "5A",
        "equipment_ids": [
            EQUIPMENT_UUIDS[0],
            EQUIPMENT_UUIDS[1],
            EQUIPMENT_UUIDS[7],
            EQUIPMENT_UUIDS[9],
        ],
        "prepared_equipment_ids": [],
        "created_at": (NOW - timedelta(days=10)).isoformat(),
        "updated_at": (NOW - timedelta(days=1)).isoformat(),
    },
]

# =============================================================================
# INVENTORY / EQUIPMENT
# =============================================================================

MOCK_INVENTORY = [
    {
        "id": EQUIPMENT_UUIDS[0],
        "user_id": GUEST_USER_UID,
        "name": "Sony A7S III",
        "category": "Camera",
        "brand": "Sony",
        "model": "ILCE-7SM3",
        "serial_number": "SONY123456",
        "purchase_date": "2023-06-15",
        "purchase_price": 350000,
        "currency": "EUR",
        "price_per_day": 0,
        "rental_price": None,
        "rental_frequency": None,
        "quantity": 1,
        "is_owned": True,
        "status": "operational",
        "notes": "Caméra principale - excellente en basse lumière",
        "created_at": (NOW - timedelta(days=100)).isoformat(),
        "updated_at": (NOW - timedelta(days=10)).isoformat(),
        "specs": {
            "sensor": "12.1MP Full-Frame Exmor R BSI CMOS",
            "video_resolution": "4K UHD up to 120fps",
            "iso_range": "80-102400 (expandable to 409600)",
            "stabilization": "5-axis in-body stabilization",
            "recording_format": "10-bit 4:2:2 internal",
            "weight": "614g",
            "battery_life": "Approx. 510 shots",
        },
    },
    {
        "id": EQUIPMENT_UUIDS[1],
        "user_id": GUEST_USER_UID,
        "name": "Sony 24-70mm f/2.8 GM",
        "category": "Lens",
        "brand": "Sony",
        "model": "SEL2470GM",
        "serial_number": "LENS789012",
        "purchase_date": "2023-06-15",
        "purchase_price": 220000,
        "currency": "EUR",
        "price_per_day": 0,
        "rental_price": None,
        "rental_frequency": None,
        "quantity": 1,
        "is_owned": True,
        "status": "operational",
        "notes": "Zoom standard - optique pro",
        "created_at": (NOW - timedelta(days=100)).isoformat(),
        "updated_at": (NOW - timedelta(days=10)).isoformat(),
        "specs": {
            "focal_length": "24-70mm",
            "aperture": "f/2.8 constant",
            "elements_groups": "18 elements in 13 groups",
            "filter_size": "82mm",
            "weight": "886g",
            "stabilization": "No",
        },
    },
    {
        "id": EQUIPMENT_UUIDS[2],
        "user_id": GUEST_USER_UID,
        "name": "Sony 16-35mm f/2.8 GM",
        "category": "Lens",
        "brand": "Sony",
        "model": "SEL1635GM",
        "serial_number": "LENS345678",
        "purchase_date": "2023-08-20",
        "purchase_price": 240000,
        "currency": "EUR",
        "price_per_day": 0,
        "rental_price": None,
        "rental_frequency": None,
        "quantity": 1,
        "is_owned": True,
        "status": "operational",
        "notes": "Grand-angle - parfait pour les architectures",
        "created_at": (NOW - timedelta(days=60)).isoformat(),
        "updated_at": (NOW - timedelta(days=10)).isoformat(),
        "specs": {
            "focal_length": "16-35mm",
            "aperture": "f/2.8 constant",
            "elements_groups": "16 elements in 13 groups",
            "filter_size": "82mm",
            "weight": "680g",
            "angle_of_view": "107°-63°",
        },
    },
    {
        "id": EQUIPMENT_UUIDS[3],
        "user_id": GUEST_USER_UID,
        "name": "Sony 85mm f/1.4 GM",
        "category": "Lens",
        "brand": "Sony",
        "model": "SEL85F14GM",
        "serial_number": "LENS901234",
        "purchase_date": "2023-09-10",
        "purchase_price": 180000,
        "currency": "EUR",
        "price_per_day": 0,
        "rental_price": None,
        "rental_frequency": None,
        "quantity": 1,
        "is_owned": True,
        "status": "operational",
        "notes": "Portrait - bokeh exceptionnel",
        "created_at": (NOW - timedelta(days=50)).isoformat(),
        "updated_at": (NOW - timedelta(days=10)).isoformat(),
        "specs": {
            "focal_length": "85mm",
            "aperture": "f/1.4",
            "elements_groups": "11 elements in 8 groups",
            "filter_size": "77mm",
            "weight": "820g",
            "min_focus_distance": "0.8m",
        },
    },
    {
        "id": EQUIPMENT_UUIDS[4],
        "user_id": GUEST_USER_UID,
        "name": "DJI Mavic 3 Pro",
        "category": "Drone",
        "brand": "DJI",
        "model": "Mavic 3 Pro",
        "serial_number": "DJI567890",
        "purchase_date": None,
        "purchase_price": 0,
        "currency": "EUR",
        "price_per_day": 15000,
        "rental_price": 450000,
        "rental_frequency": "month",
        "quantity": 1,
        "is_owned": False,
        "status": "operational",
        "notes": "Drone triple capteur - Hasselblad",
        "created_at": (NOW - timedelta(days=25)).isoformat(),
        "updated_at": (NOW - timedelta(days=5)).isoformat(),
        "specs": {
            "camera": "Triple camera system (24mm, 70mm, 166mm)",
            "sensor": "4/3 CMOS Hasselblad",
            "video_resolution": "5.1K up to 50fps",
            "flight_time": "43 minutes",
            "range": "15km transmission",
            "obstacle_sensing": "Omnidirectional",
            "weight": "958g",
        },
    },
    {
        "id": EQUIPMENT_UUIDS[5],
        "user_id": GUEST_USER_UID,
        "name": "DJI RS 3 Pro",
        "category": "Stabilizer",
        "brand": "DJI",
        "model": "RS 3 Pro",
        "serial_number": "RS3123456",
        "purchase_date": "2023-07-12",
        "purchase_price": 95000,
        "currency": "EUR",
        "price_per_day": 0,
        "rental_price": None,
        "rental_frequency": None,
        "quantity": 1,
        "is_owned": True,
        "status": "operational",
        "notes": "Stabilisateur pro - charge lourde",
        "created_at": (NOW - timedelta(days=80)).isoformat(),
        "updated_at": (NOW - timedelta(days=10)).isoformat(),
        "specs": {
            "payload": "4.5kg",
            "battery_life": "12 hours",
            "weight": "1.5kg",
            "stabilization_axes": "3-axis",
            "touchscreen": "1.8-inch OLED",
        },
    },
    {
        "id": EQUIPMENT_UUIDS[6],
        "user_id": GUEST_USER_UID,
        "name": "Rode NTG5",
        "category": "Audio",
        "brand": "Rode",
        "model": "NTG5",
        "serial_number": "RODE789012",
        "purchase_date": None,
        "purchase_price": 0,
        "currency": "EUR",
        "price_per_day": 800,
        "rental_price": 24000,
        "rental_frequency": "month",
        "quantity": 1,
        "is_owned": False,
        "status": "operational",
        "notes": "Micro canon léger - excellent pour l'extérieur",
        "created_at": (NOW - timedelta(days=70)).isoformat(),
        "updated_at": (NOW - timedelta(days=10)).isoformat(),
        "specs": {
            "type": "Condenser shotgun",
            "polar_pattern": "Supercardioid",
            "frequency_response": "20Hz - 20kHz",
            "sensitivity": "-23dB",
            "weight": "76g",
            "length": "203mm",
        },
    },
    {
        "id": EQUIPMENT_UUIDS[7],
        "user_id": GUEST_USER_UID,
        "name": "Sennheiser MKH 416",
        "category": "Audio",
        "brand": "Sennheiser",
        "model": "MKH 416",
        "serial_number": "SENN345678",
        "purchase_date": None,
        "purchase_price": 0,
        "currency": "EUR",
        "price_per_day": 1200,
        "rental_price": 36000,
        "rental_frequency": "month",
        "quantity": 1,
        "is_owned": False,
        "status": "operational",
        "notes": "Micro canon pro - standard cinéma",
        "created_at": (NOW - timedelta(days=35)).isoformat(),
        "updated_at": (NOW - timedelta(days=10)).isoformat(),
        "specs": {
            "type": "RF condenser shotgun",
            "polar_pattern": "Supercardioid",
            "frequency_response": "40Hz - 20kHz",
            "sensitivity": "-32dB",
            "weight": "175g",
            "length": "250mm",
        },
    },
    {
        "id": EQUIPMENT_UUIDS[8],
        "user_id": GUEST_USER_UID,
        "name": "Aputure 600x Pro",
        "category": "Lighting",
        "brand": "Aputure",
        "model": "600x Pro",
        "serial_number": "APUT901234",
        "purchase_date": "2023-09-25",
        "purchase_price": 140000,
        "currency": "EUR",
        "price_per_day": 0,
        "rental_price": None,
        "rental_frequency": None,
        "quantity": 1,
        "is_owned": True,
        "status": "operational",
        "notes": "LED puissante - bicolore 2700-6500K",
        "created_at": (NOW - timedelta(days=40)).isoformat(),
        "updated_at": (NOW - timedelta(days=10)).isoformat(),
        "specs": {
            "power": "600W",
            "color_temperature": "2700K-6500K",
            "cri": "95+",
            "beam_angle": "120°",
            "dimming": "0-100%",
            "weight": "4.8kg",
            "battery_option": "V-mount",
        },
    },
    {
        "id": EQUIPMENT_UUIDS[9],
        "user_id": GUEST_USER_UID,
        "name": "Aputure MC RGBWW",
        "category": "Lighting",
        "brand": "Aputure",
        "model": "MC",
        "serial_number": "APUT567890",
        "purchase_date": "2023-12-01",
        "purchase_price": 12000,
        "currency": "EUR",
        "price_per_day": 0,
        "rental_price": None,
        "rental_frequency": None,
        "quantity": 2,
        "is_owned": True,
        "status": "operational",
        "notes": "Petite LED RGB - éclairage d'ambiance",
        "created_at": (NOW - timedelta(days=15)).isoformat(),
        "updated_at": (NOW - timedelta(days=5)).isoformat(),
        "specs": {
            "power": "10W",
            "color_temperature": "3200K-6500K",
            "rgb": "Full RGB",
            "battery_life": "100 minutes",
            "weight": "130g",
            "mount": "Magnetic + 1/4 screw",
        },
    },
]

# =============================================================================
# NOTES
# =============================================================================

MOCK_NOTES = [
    {
        "id": NOTE_UUIDS[0],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "user_id": GUEST_USER_UID,
        "title": "To-do avant tournage",
        "content": "• Vérifier batteries (toutes chargées ?)\n• Cartes SD formatées\n• Vérifier météo pour le jour J\n• Confirmer accès toit avec immeuble\n• Prévoir café pour l'équipe",
        "created_at": (NOW - timedelta(days=5)).isoformat(),
        "updated_at": (NOW - timedelta(days=1)).isoformat(),
    },
    {
        "id": NOTE_UUIDS[1],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "user_id": GUEST_USER_UID,
        "title": "Idées scène finale",
        "content": "Essayer différents angles pour la confrontation :\n- Contre-plongée sur le protagoniste\n- Plans serrés sur les réactions\n- Éclairage dramatique côté\n\nRéférence : fin de 'Heat' (1995)",
        "created_at": (NOW - timedelta(days=8)).isoformat(),
        "updated_at": (NOW - timedelta(days=2)).isoformat(),
    },
    {
        "id": NOTE_UUIDS[2],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "user_id": GUEST_USER_UID,
        "title": "Contacts utiles",
        "content": "Studio A :\n• Jean Dupont - Réservation : 06 12 34 56 78\n• Tarif : 200€/jour\n\nCafé Le Central :\n• Maria - Propriétaire\n• OK pour tournage lundi 14h\n• Demander autorisation écriture",
        "created_at": (NOW - timedelta(days=10)).isoformat(),
        "updated_at": (NOW - timedelta(days=3)).isoformat(),
    },
]

# =============================================================================
# POST-PROD TASKS
# =============================================================================

MOCK_POSTPROD_TASKS = [
    {
        "id": TASK_UUIDS[0],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "user_id": GUEST_USER_UID,
        "title": "Montage assemblage",
        "description": "Assembler tous les rushs et créer la première version",
        "category": "Editing",
        "status": "todo",
        "priority": "high",
        "due_date": (NOW + timedelta(days=20)).strftime("%Y-%m-%d"),
        "created_at": (NOW - timedelta(days=2)).isoformat(),
        "updated_at": (NOW - timedelta(days=1)).isoformat(),
    },
    {
        "id": TASK_UUIDS[1],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "user_id": GUEST_USER_UID,
        "title": "Étalonnage première version",
        "description": "Créer un LUT cohérent pour tout le film",
        "category": "Color Grading",
        "status": "todo",
        "priority": "medium",
        "due_date": (NOW + timedelta(days=25)).strftime("%Y-%m-%d"),
        "created_at": (NOW - timedelta(days=2)).isoformat(),
        "updated_at": (NOW - timedelta(days=1)).isoformat(),
    },
    {
        "id": TASK_UUIDS[2],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "user_id": GUEST_USER_UID,
        "title": "Mixage son",
        "description": "Nettoyer les pistes audio et mixer dialogue/ambiance",
        "category": "Sound",
        "status": "todo",
        "priority": "high",
        "due_date": (NOW + timedelta(days=28)).strftime("%Y-%m-%d"),
        "created_at": (NOW - timedelta(days=2)).isoformat(),
        "updated_at": (NOW - timedelta(days=1)).isoformat(),
    },
    {
        "id": TASK_UUIDS[3],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "user_id": GUEST_USER_UID,
        "title": "Musique et sound design",
        "description": "Sélectionner musiques libres de droits et créer sound design",
        "category": "Music",
        "status": "todo",
        "priority": "medium",
        "due_date": (NOW + timedelta(days=30)).strftime("%Y-%m-%d"),
        "created_at": (NOW - timedelta(days=2)).isoformat(),
        "updated_at": (NOW - timedelta(days=1)).isoformat(),
    },
    {
        "id": TASK_UUIDS[4],
        "project_id": "4df9dc12-33aa-4fcb-9e4b-ad5bc059bcf0",
        "user_id": GUEST_USER_UID,
        "title": "Export versions livraison",
        "description": "Exporter en 4K, 1080p et bande-annonce",
        "category": "Export",
        "status": "todo",
        "priority": "low",
        "due_date": (NOW + timedelta(days=35)).strftime("%Y-%m-%d"),
        "created_at": (NOW - timedelta(days=2)).isoformat(),
        "updated_at": (NOW - timedelta(days=1)).isoformat(),
    },
]

# =============================================================================
# CATALOG (Read-only reference data)
# =============================================================================

MOCK_CATALOG_CATEGORIES = [
    {"id": CATEGORY_UUIDS[0], "name": "Camera", "slug": "camera", "icon": "camera"},
    {"id": CATEGORY_UUIDS[1], "name": "Lens", "slug": "lens", "icon": "aperture"},
    {"id": CATEGORY_UUIDS[2], "name": "Audio", "slug": "audio", "icon": "mic"},
    {"id": CATEGORY_UUIDS[3], "name": "Lighting", "slug": "lighting", "icon": "light"},
    {
        "id": CATEGORY_UUIDS[4],
        "name": "Stabilizer",
        "slug": "stabilizer",
        "icon": "gimbal",
    },
    {"id": CATEGORY_UUIDS[5], "name": "Drone", "slug": "drone", "icon": "drone"},
    {
        "id": CATEGORY_UUIDS[6],
        "name": "Accessories",
        "slug": "accessories",
        "icon": "package",
    },
]

MOCK_CATALOG_BRANDS = [
    {"id": BRAND_UUIDS[0], "name": "Sony", "logo_url": None},
    {"id": BRAND_UUIDS[1], "name": "Canon", "logo_url": None},
    {"id": BRAND_UUIDS[2], "name": "DJI", "logo_url": None},
    {"id": BRAND_UUIDS[3], "name": "Rode", "logo_url": None},
    {"id": BRAND_UUIDS[4], "name": "Sennheiser", "logo_url": None},
    {"id": BRAND_UUIDS[5], "name": "Aputure", "logo_url": None},
    {"id": BRAND_UUIDS[6], "name": "Blackmagic", "logo_url": None},
    {"id": BRAND_UUIDS[7], "name": "RED", "logo_url": None},
]

MOCK_CATALOG_ITEMS = [
    {
        "id": CATALOG_UUIDS[0],
        "name": "Sony A7S III",
        "category_id": CATEGORY_UUIDS[0],
        "brand_id": BRAND_UUIDS[0],
        "model": "ILCE-7SM3",
        "description": "Full-frame mirrorless avec capteur 12MP BSI - excellent en basse lumière",
        "image_url": None,
    },
    {
        "id": CATALOG_UUIDS[1],
        "name": "Sony 24-70mm f/2.8 GM",
        "category_id": CATEGORY_UUIDS[1],
        "brand_id": BRAND_UUIDS[0],
        "model": "SEL2470GM",
        "description": "Zoom standard professionnel - optique G Master",
        "image_url": None,
    },
    {
        "id": CATALOG_UUIDS[2],
        "name": "DJI Mavic 3 Pro",
        "category_id": CATEGORY_UUIDS[5],
        "brand_id": BRAND_UUIDS[2],
        "model": "Mavic 3 Pro",
        "description": "Drone triple capteur avec Hasselblad - 5.1K video",
        "image_url": None,
    },
    {
        "id": CATALOG_UUIDS[3],
        "name": "Rode NTG5",
        "category_id": CATEGORY_UUIDS[2],
        "brand_id": BRAND_UUIDS[3],
        "model": "NTG5",
        "description": "Micro canon supercardioïde léger - broadcast quality",
        "image_url": None,
    },
    {
        "id": CATALOG_UUIDS[4],
        "name": "Aputure 600x Pro",
        "category_id": CATEGORY_UUIDS[3],
        "brand_id": BRAND_UUIDS[5],
        "model": "600x Pro",
        "description": "LED bi-couleur 600W - 2700K à 6500K",
        "image_url": None,
    },
]

# =============================================================================
# GROUPED DATA (for frontend convenience)
# =============================================================================


def get_mock_project_data() -> Dict[str, Any]:
    """Returns complete project data for the guest user"""
    return {
        "project": MOCK_PROJECT,
        "shots": MOCK_SHOTS,
        "notes": MOCK_NOTES,
        "tasks": MOCK_POSTPROD_TASKS,
    }


def get_mock_inventory() -> List[Dict[str, Any]]:
    """Returns guest user inventory"""
    return MOCK_INVENTORY


def get_mock_catalog() -> Dict[str, List[Dict[str, Any]]]:
    """Returns catalog reference data"""
    return {
        "categories": MOCK_CATALOG_CATEGORIES,
        "brands": MOCK_CATALOG_BRANDS,
        "items": MOCK_CATALOG_ITEMS,
    }
