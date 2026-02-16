package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/vemakin/backend/internal/models"
)

var specsTableNames = map[string]string{
	"camera":     "specs_cameras",
	"lens":       "specs_lenses",
	"audio":      "specs_audio",
	"light":      "specs_lights",
	"monitor":    "specs_monitoring",
	"prop":       "specs_props",
	"stabilizer": "specs_stabilizers",
	"tripod":     "specs_tripods",
	"wireless":   "specs_wireless",
	"drone":      "specs_drones",
	"filter":     "specs_filters",
	"grip":       "specs_grip",
}

var specsColumns = map[string][]string{
	"camera":     {"sensor", "resolution", "mount", "dynamic_range", "native_iso", "media", "frame_rate", "weight"},
	"lens":       {"focal_length", "aperture", "mount", "coverage", "focus_type", "weight"},
	"audio":      {"type", "pattern", "freq_response", "sensitivity", "max_spl", "power", "connector", "weight"},
	"light":      {"type", "power_draw", "color_temp", "cri", "mount", "control", "weight"},
	"monitor":    {"screen", "resolution", "brightness", "inputs", "power", "features", "dimensions", "weight"},
	"prop":       {"type", "era", "material", "condition", "quantity", "dimensions", "power", "weight"},
	"stabilizer": {"type", "max_payload", "axes", "battery_life", "connectivity", "dimensions", "weight"},
	"tripod":     {"head_type", "max_payload", "bowl_size", "height_range", "material", "counterbalance", "weight"},
	"wireless":   {"range", "delay", "resolution", "inputs", "freq", "power", "multicast", "weight"},
	"drone":      {"type", "camera", "res", "flight_time", "transmission", "sensors", "speed", "weight"},
	"filter":     {"type", "density", "size", "stops", "effect", "strength", "mount", "material", "weight"},
	"grip":       {"type", "max_load", "max_height", "min_height", "footprint", "material", "mount", "weight"},
}

type EquipmentRepository struct {
	db *sqlx.DB
}

func NewEquipmentRepository(db *sqlx.DB) *EquipmentRepository {
	return &EquipmentRepository{db: db}
}

func (r *EquipmentRepository) GetByUser(ctx context.Context, userID string, limit, offset int) ([]models.Equipment, error) {
	var equipment []models.Equipment
	err := r.db.SelectContext(ctx, &equipment, `
		SELECT id, user_id, name, catalog_item_id, custom_name, serial_number, category,
		       price_per_day, rental_price, rental_frequency, quantity, is_owned, status,
		       created_at, updated_at
		FROM user_inventory 
		WHERE user_id = $1 
		ORDER BY created_at DESC 
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)
	return equipment, err
}

func (r *EquipmentRepository) GetByID(ctx context.Context, id, userID string) (*models.Equipment, error) {
	var e models.Equipment
	err := r.db.GetContext(ctx, &e, `
		SELECT id, user_id, name, catalog_item_id, custom_name, serial_number, category,
		       price_per_day, rental_price, rental_frequency, quantity, is_owned, status,
		       created_at, updated_at
		FROM user_inventory 
		WHERE id = $1 AND user_id = $2
	`, id, userID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &e, err
}

func (r *EquipmentRepository) Create(ctx context.Context, req map[string]interface{}) (*models.Equipment, error) {
	var e models.Equipment
	err := r.db.GetContext(ctx, &e, `
		INSERT INTO user_inventory (id, user_id, name, catalog_item_id, custom_name, serial_number, category,
		       price_per_day, rental_price, rental_frequency, quantity, is_owned, status,
		       created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
		RETURNING id, user_id, name, catalog_item_id, custom_name, serial_number, category,
		       price_per_day, rental_price, rental_frequency, quantity, is_owned, status,
		       created_at, updated_at
	`, req["user_id"], req["name"], req["catalog_item_id"], req["custom_name"],
		req["serial_number"], req["category"], req["price_per_day"], req["rental_price"],
		req["rental_frequency"], req["quantity"], req["is_owned"], req["status"], time.Now())
	return &e, err
}

func (r *EquipmentRepository) Update(ctx context.Context, id, userID string, updates map[string]interface{}) (*models.Equipment, error) {
	query := "UPDATE user_inventory SET "
	var args []interface{}
	argCount := 0

	fields := []string{"name", "catalog_item_id", "custom_name", "serial_number", "category",
		"price_per_day", "rental_price", "rental_frequency", "quantity", "is_owned", "status"}

	for _, field := range fields {
		if v, ok := updates[field]; ok && v != nil {
			argCount++
			query += fmt.Sprintf("%s = $%d, ", field, argCount)
			args = append(args, v)
		}
	}

	argCount++
	query += fmt.Sprintf("updated_at = $%d ", argCount)
	args = append(args, time.Now())

	argCount++
	query += fmt.Sprintf("WHERE id = $%d AND user_id = $%d ", argCount, argCount+1)
	args = append(args, id, userID)

	argCount++
	query += "RETURNING id, user_id, name, catalog_item_id, custom_name, serial_number, category," +
		" price_per_day, rental_price, rental_frequency, quantity, is_owned, status, created_at, updated_at"

	var e models.Equipment
	err := r.db.GetContext(ctx, &e, query, args...)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &e, err
}

func (r *EquipmentRepository) Delete(ctx context.Context, id, userID string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM user_inventory WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *EquipmentRepository) GetSpecsForCatalogItem(ctx context.Context, catalogItemID string) (map[string]interface{}, error) {
	specs := make(map[string]interface{})

	var categorySlug string
	err := r.db.GetContext(ctx, &categorySlug, `
		SELECT c.slug 
		FROM categories c
		JOIN gear_catalog gc ON gc.category_id = c.id
		WHERE gc.id = $1
	`, catalogItemID)
	if err != nil {
		return specs, nil
	}

	return getSpecsByCategorySlug(ctx, r.db, categorySlug, catalogItemID)
}

func (r *EquipmentRepository) GetSpecsBatch(ctx context.Context, catalogItemIDs []string) (map[string]map[string]interface{}, error) {
	if len(catalogItemIDs) == 0 {
		return make(map[string]map[string]interface{}), nil
	}

	type itemCategory struct {
		ItemID       string `db:"id"`
		CategorySlug string `db:"slug"`
	}

	var items []itemCategory
	query := `
		SELECT gc.id, c.slug
		FROM gear_catalog gc
		JOIN categories c ON c.id = gc.category_id
		WHERE gc.id = ANY($1)
	`
	err := r.db.SelectContext(ctx, &items, query, catalogItemIDs)
	if err != nil {
		return make(map[string]map[string]interface{}), nil
	}

	itemsByCategory := make(map[string][]string)
	for _, item := range items {
		itemsByCategory[item.CategorySlug] = append(itemsByCategory[item.CategorySlug], item.ItemID)
	}

	result := make(map[string]map[string]interface{})

	for categorySlug, itemIDs := range itemsByCategory {
		tableName, ok := specsTableNames[categorySlug]
		if !ok {
			continue
		}

		columns := specsColumns[categorySlug]
		if len(columns) == 0 {
			continue
		}

		columnList := "gear_id"
		for _, col := range columns {
			columnList += ", " + col
		}

		sqlQuery := fmt.Sprintf("SELECT %s FROM %s WHERE gear_id = ANY($1)", columnList, tableName)
		rows, err := r.db.QueryxContext(ctx, sqlQuery, itemIDs)
		if err != nil {
			continue
		}

		for rows.Next() {
			specs := make(map[string]interface{})
			values, err := rows.SliceScan()
			if err != nil {
				continue
			}
			columns, _ := rows.Columns()
			var gearID string
			for i, col := range columns {
				if col == "gear_id" {
					if i < len(values) {
						gearID = fmt.Sprintf("%v", values[i])
					}
					continue
				}
				if i < len(values) {
					specs[ToCamelCase(col)] = values[i]
				}
			}
			if gearID != "" {
				result[gearID] = specs
			}
		}
		rows.Close()
	}

	return result, nil
}

func getSpecsByCategorySlug(ctx context.Context, db *sqlx.DB, categorySlug, catalogItemID string) (map[string]interface{}, error) {
	specs := make(map[string]interface{})

	tableName, ok := specsTableNames[categorySlug]
	if !ok {
		return specs, nil
	}

	columns := specsColumns[categorySlug]
	if len(columns) == 0 {
		return specs, nil
	}

	columnList := columns[0]
	for i := 1; i < len(columns); i++ {
		columnList += ", " + columns[i]
	}

	sqlQuery := fmt.Sprintf("SELECT %s FROM %s WHERE gear_id = $1", columnList, tableName)

	rows, err := db.QueryxContext(ctx, sqlQuery, catalogItemID)
	if err != nil {
		return specs, nil
	}
	defer rows.Close()

	for rows.Next() {
		values, err := rows.SliceScan()
		if err != nil {
			continue
		}
		columns, _ := rows.Columns()
		for i, col := range columns {
			if i < len(values) {
				specs[ToCamelCase(col)] = values[i]
			}
		}
	}

	return specs, nil
}
