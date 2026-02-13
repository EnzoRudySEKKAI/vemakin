package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/vemakin/backend/internal/models"
)

// EquipmentRepository handles equipment data access
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

// GetSpecsForCatalogItem fetches specs for a catalog item based on its category
func (r *EquipmentRepository) GetSpecsForCatalogItem(ctx context.Context, catalogItemID string) (map[string]interface{}, error) {
	specs := make(map[string]interface{})

	// Get category slug for the catalog item
	var categorySlug string
	err := r.db.GetContext(ctx, &categorySlug, `
		SELECT c.slug 
		FROM categories c
		JOIN gear_catalog gc ON gc.category_id = c.id
		WHERE gc.id = $1
	`, catalogItemID)
	if err != nil {
		return specs, nil // Return empty specs if no category found
	}

	// Map category slugs to their specs tables
	specsQueries := map[string]string{
		"camera":     "SELECT sensor, resolution, mount, dynamic_range, native_iso, media, frame_rate, weight FROM specs_cameras WHERE gear_id = $1",
		"lens":       "SELECT focal_length, aperture, mount, coverage, focus_type, weight FROM specs_lenses WHERE gear_id = $1",
		"audio":      "SELECT type, pattern, freq_response, sensitivity, max_spl, power, connector, weight FROM specs_audio WHERE gear_id = $1",
		"light":      "SELECT type, power_draw, color_temp, cri, mount, control, weight FROM specs_lights WHERE gear_id = $1",
		"monitor":    "SELECT screen, resolution, brightness, inputs, power, features, dimensions, weight FROM specs_monitoring WHERE gear_id = $1",
		"prop":       "SELECT type, era, material, condition, quantity, dimensions, power, weight FROM specs_props WHERE gear_id = $1",
		"stabilizer": "SELECT type, max_payload, axes, battery_life, connectivity, dimensions, weight FROM specs_stabilizers WHERE gear_id = $1",
		"tripod":     "SELECT head_type, max_payload, bowl_size, height_range, material, counterbalance, weight FROM specs_tripods WHERE gear_id = $1",
		"wireless":   "SELECT range, delay, resolution, inputs, freq, power, multicast, weight FROM specs_wireless WHERE gear_id = $1",
		"drone":      "SELECT type, camera, res, flight_time, transmission, sensors, speed, weight FROM specs_drones WHERE gear_id = $1",
		"filter":     "SELECT type, density, size, stops, effect, strength, mount, material, weight FROM specs_filters WHERE gear_id = $1",
		"grip":       "SELECT type, max_load, max_height, min_height, footprint, material, mount, weight FROM specs_grip WHERE gear_id = $1",
	}

	query, ok := specsQueries[categorySlug]
	if !ok {
		return specs, nil // Unknown category, return empty specs
	}

	// Query the specs table
	rows, err := r.db.QueryxContext(ctx, query, catalogItemID)
	if err != nil {
		return specs, nil
	}
	defer rows.Close()

	for rows.Next() {
		values, err := rows.SliceScan()
		if err != nil {
			fmt.Printf("[DEBUG] SliceScan error: %v\n", err)
			continue
		}
		columns, _ := rows.Columns()
		fmt.Printf("[DEBUG] Got %d columns\n", len(columns))
		for i, col := range columns {
			if i < len(values) {
				specs[toCamelCase(col)] = values[i]
				fmt.Printf("[DEBUG] Setting %s = %v\n", toCamelCase(col), values[i])
			}
		}
	}

	if err := rows.Err(); err != nil {
		fmt.Printf("[DEBUG] rows.Err(): %v\n", err)
	}

	fmt.Printf("[DEBUG] Returning %d specs\n", len(specs))

	return specs, nil
}
