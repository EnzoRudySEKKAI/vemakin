package repository

import (
	"context"
	"strconv"

	"github.com/jmoiron/sqlx"
	"github.com/vemakin/backend/internal/models"
)

type CatalogRepository struct {
	db *sqlx.DB
}

func NewCatalogRepository(db *sqlx.DB) *CatalogRepository {
	return &CatalogRepository{db: db}
}

func (r *CatalogRepository) GetCategories(ctx context.Context) ([]models.Category, error) {
	var categories []models.Category
	err := r.db.SelectContext(ctx, &categories, `SELECT id, name, slug FROM categories ORDER BY name`)
	return categories, err
}

func (r *CatalogRepository) GetBrands(ctx context.Context, categoryID *string) ([]models.Brand, error) {
	if categoryID != nil && *categoryID != "" {
		var brands []models.Brand
		err := r.db.SelectContext(ctx, &brands, `
			SELECT DISTINCT b.id, b.name
			FROM brands b
			JOIN gear_catalog gc ON gc.brand_id = b.id
			WHERE gc.category_id = $1
			ORDER BY b.name
		`, categoryID)
		return brands, err
	}

	var brands []models.Brand
	err := r.db.SelectContext(ctx, &brands, `SELECT id, name FROM brands ORDER BY name`)
	return brands, err
}

// GetAllBrandsGroupedByCategory returns all brands grouped by category ID in a single query
func (r *CatalogRepository) GetAllBrandsGroupedByCategory(ctx context.Context) (map[string][]models.Brand, error) {
	rows, err := r.db.QueryxContext(ctx, `
		SELECT DISTINCT c.id as category_id, b.id, b.name
		FROM categories c
		JOIN gear_catalog gc ON gc.category_id = c.id
		JOIN brands b ON b.id = gc.brand_id
		ORDER BY c.id, b.name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	brandsByCategory := make(map[string][]models.Brand)
	for rows.Next() {
		var categoryID string
		var brand models.Brand
		if err := rows.Scan(&categoryID, &brand.ID, &brand.Name); err != nil {
			continue
		}
		brandsByCategory[categoryID] = append(brandsByCategory[categoryID], brand)
	}

	return brandsByCategory, nil
}

func (r *CatalogRepository) GetItems(ctx context.Context, categoryID, brandID *string) ([]models.GearCatalog, error) {
	query := `SELECT id, brand_id, category_id, name, description, image_url, created_at FROM gear_catalog WHERE 1=1`
	args := []interface{}{}
	argCount := 0

	if categoryID != nil && *categoryID != "" {
		argCount++
		query += " AND category_id = $" + strconv.Itoa(argCount)
		args = append(args, *categoryID)
	}
	if brandID != nil && *brandID != "" {
		argCount++
		query += " AND brand_id = $" + strconv.Itoa(argCount)
		args = append(args, *brandID)
	}
	query += " ORDER BY name"

	var items []models.GearCatalog
	err := r.db.SelectContext(ctx, &items, query, args...)
	return items, err
}

func (r *CatalogRepository) GetItemByID(ctx context.Context, itemID string) (*models.GearCatalog, error) {
	var item models.GearCatalog
	err := r.db.GetContext(ctx, &item, `
		SELECT id, brand_id, category_id, name, description, image_url, created_at 
		FROM gear_catalog WHERE id = $1
	`, itemID)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *CatalogRepository) GetSpecs(ctx context.Context, itemID, categorySlug string) (map[string]interface{}, error) {
	specs := make(map[string]interface{})

	slug := categorySlug
	if slug == "" {
		var category struct {
			Slug string `db:"slug"`
		}
		err := r.db.GetContext(ctx, &category, `SELECT slug FROM categories WHERE id = (SELECT category_id FROM gear_catalog WHERE id = $1)`, itemID)
		if err != nil {
			return specs, nil
		}
		slug = category.Slug
	}

	specsQueries := map[string]string{
		"camera":     "SELECT sensor, resolution, mount, dynamic_range, native_iso, media, frame_rate, weight FROM specs_cameras WHERE gear_id = $1",
		"lens":       "SELECT focal_length, aperture, mount, coverage, focus_type, weight FROM specs_lenses WHERE gear_id = $1",
		"audio":      "SELECT type, pattern, freq_response, sensitivity, max_spl, power, connector, weight FROM specs_audio WHERE gear_id = $1",
		"light":      "SELECT type, power_draw, color_temp, cri, mount, control, weight FROM specs_lights WHERE gear_id = $1",
		"monitor":    "SELECT screen, resolution, brightness, inputs, power, features, dimensions, weight FROM specs_monitoring WHERE gear_id = $1",
		"props":      "SELECT type, era, material, condition, quantity, dimensions, power, weight FROM specs_props WHERE gear_id = $1",
		"stabilizer": "SELECT type, max_payload, axes, battery_life, connectivity, dimensions, weight FROM specs_stabilizers WHERE gear_id = $1",
		"tripod":     "SELECT head_type, max_payload, bowl_size, height_range, material, counterbalance, weight FROM specs_tripods WHERE gear_id = $1",
		"wireless":   "SELECT range, delay, resolution, inputs, freq, power, multicast, weight FROM specs_wireless WHERE gear_id = $1",
		"drone":      "SELECT type, camera, res, flight_time, transmission, sensors, speed, weight FROM specs_drones WHERE gear_id = $1",
		"filter":     "SELECT type, density, size, stops, effect, strength, mount, material, weight FROM specs_filters WHERE gear_id = $1",
		"grip":       "SELECT type, max_load, max_height, min_height, footprint, material, mount, weight FROM specs_grip WHERE gear_id = $1",
	}

	query, ok := specsQueries[slug]
	if !ok {
		return specs, nil
	}

	rows, err := r.db.QueryxContext(ctx, query, itemID)
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
			specs[ToCamelCase(col)] = values[i]
		}
	}

	return specs, nil
}

// GetAllSpecsGroupedByGearID returns all specs grouped by gear ID in a single batch query per category
func (r *CatalogRepository) GetAllSpecsGroupedByGearID(ctx context.Context, categorySlugs []string) (map[string]map[string]interface{}, error) {
	specsByGearID := make(map[string]map[string]interface{})

	specsQueries := map[string]string{
		"camera":     "SELECT gear_id, sensor, resolution, mount, dynamic_range, native_iso, media, frame_rate, weight FROM specs_cameras",
		"lens":       "SELECT gear_id, focal_length, aperture, mount, coverage, focus_type, weight FROM specs_lenses",
		"audio":      "SELECT gear_id, type, pattern, freq_response, sensitivity, max_spl, power, connector, weight FROM specs_audio",
		"light":      "SELECT gear_id, type, power_draw, color_temp, cri, mount, control, weight FROM specs_lights",
		"monitor":    "SELECT gear_id, screen, resolution, brightness, inputs, power, features, dimensions, weight FROM specs_monitoring",
		"props":      "SELECT gear_id, type, era, material, condition, quantity, dimensions, power, weight FROM specs_props",
		"stabilizer": "SELECT gear_id, type, max_payload, axes, battery_life, connectivity, dimensions, weight FROM specs_stabilizers",
		"tripod":     "SELECT gear_id, head_type, max_payload, bowl_size, height_range, material, counterbalance, weight FROM specs_tripods",
		"wireless":   "SELECT gear_id, range, delay, resolution, inputs, freq, power, multicast, weight FROM specs_wireless",
		"drone":      "SELECT gear_id, type, camera, res, flight_time, transmission, sensors, speed, weight FROM specs_drones",
		"filter":     "SELECT gear_id, type, density, size, stops, effect, strength, mount, material, weight FROM specs_filters",
		"grip":       "SELECT gear_id, type, max_load, max_height, min_height, footprint, material, mount, weight FROM specs_grip",
	}

	for _, slug := range categorySlugs {
		query, ok := specsQueries[slug]
		if !ok {
			continue
		}

		rows, err := r.db.QueryxContext(ctx, query)
		if err != nil {
			continue
		}

		for rows.Next() {
			values, err := rows.SliceScan()
			if err != nil {
				continue
			}
			columns, _ := rows.Columns()
			if len(values) > 0 {
				gearID := values[0].(string)
				specs := make(map[string]interface{})
				for i := 1; i < len(columns) && i < len(values); i++ {
					specs[ToCamelCase(columns[i])] = values[i]
				}
				specsByGearID[gearID] = specs
			}
		}
		rows.Close()
	}

	return specsByGearID, nil
}

func ToCamelCase(s string) string {
	if len(s) == 0 {
		return s
	}

	result := make([]rune, 0, len(s))
	upperNext := true

	for _, c := range s {
		if c == '_' {
			upperNext = true
			continue
		}
		if upperNext {
			result = append(result, toUpper(c))
			upperNext = false
		} else {
			result = append(result, c)
		}
	}

	return string(result)
}

func toUpper(c rune) rune {
	if c >= 'a' && c <= 'z' {
		return c - 'a' + 'A'
	}
	return c
}
