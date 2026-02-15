package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/vemakin/backend/internal/models"
)

// ShotRepository handles shot data access
type ShotRepository struct {
	db *sqlx.DB
}

func NewShotRepository(db *sqlx.DB) *ShotRepository {
	return &ShotRepository{db: db}
}

func (r *ShotRepository) CountByProject(ctx context.Context, projectID string) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, `
		SELECT COUNT(*) FROM shots WHERE project_id = $1
	`, projectID)
	return count, err
}

func (r *ShotRepository) GetByProject(ctx context.Context, projectID string, limit, offset int) ([]models.Shot, error) {
	var shots []models.Shot
	err := r.db.SelectContext(ctx, &shots, `
		SELECT s.id, s.project_id, s.title, s.description, s.status, s.start_time, s.duration, 
		       s.location, s.location_lat, s.location_lng, s.remarks, s.date, s.scene_number, s.equipment_ids, s.prepared_equipment_ids,
		       s.created_at, s.updated_at
		FROM shots s
		WHERE s.project_id = $1 
		ORDER BY s.created_at DESC 
		LIMIT $2 OFFSET $3
	`, projectID, limit, offset)
	return shots, err
}

func (r *ShotRepository) GetByProjectAndUser(ctx context.Context, projectID, userID string, limit, offset int) ([]models.Shot, error) {
	var shots []models.Shot
	err := r.db.SelectContext(ctx, &shots, `
		WITH project_owner AS (
			SELECT 1 FROM projects WHERE id = $1 AND user_id = $2
		)
		SELECT s.id, s.project_id, s.title, s.description, s.status, s.start_time, s.duration, 
		       s.location, s.location_lat, s.location_lng, s.remarks, s.date, s.scene_number, s.equipment_ids, s.prepared_equipment_ids,
		       s.created_at, s.updated_at
		FROM shots s
		WHERE s.project_id = $1 AND EXISTS (SELECT 1 FROM project_owner)
		ORDER BY s.created_at DESC 
		LIMIT $3 OFFSET $4
	`, projectID, userID, limit, offset)
	return shots, err
}

func (r *ShotRepository) GetByID(ctx context.Context, id, projectID string) (*models.Shot, error) {
	var s models.Shot
	err := r.db.GetContext(ctx, &s, `
		SELECT id, project_id, title, description, status, start_time, duration, 
		       location, location_lat, location_lng, remarks, date, scene_number, equipment_ids, prepared_equipment_ids,
		       created_at, updated_at
		FROM shots 
		WHERE id = $1 AND project_id = $2
	`, id, projectID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &s, err
}

func (r *ShotRepository) GetByIDAndUser(ctx context.Context, id, projectID, userID string) (*models.Shot, error) {
	var s models.Shot
	err := r.db.GetContext(ctx, &s, `
		WITH project_owner AS (
			SELECT 1 FROM projects WHERE id = $1 AND user_id = $2
		)
		SELECT s.id, s.project_id, s.title, s.description, s.status, s.start_time, s.duration, 
		       s.location, s.location_lat, s.location_lng, s.remarks, s.date, s.scene_number, s.equipment_ids, s.prepared_equipment_ids,
		       s.created_at, s.updated_at
		FROM shots s
		WHERE s.id = $3 AND s.project_id = $1 AND EXISTS (SELECT 1 FROM project_owner)
	`, projectID, userID, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &s, err
}

func (r *ShotRepository) Create(ctx context.Context, req map[string]interface{}) (*models.Shot, error) {
	equipmentIDs, _ := json.Marshal(req["equipment_ids"])
	preparedIDs, _ := json.Marshal(req["prepared_equipment_ids"])

	var s models.Shot
	err := r.db.GetContext(ctx, &s, `
		INSERT INTO shots (id, project_id, title, description, status, start_time, duration, 
		       location, location_lat, location_lng, remarks, date, scene_number, equipment_ids, prepared_equipment_ids,
		       created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15)
		RETURNING id, project_id, title, description, status, start_time, duration, 
		       location, location_lat, location_lng, remarks, date, scene_number, equipment_ids, prepared_equipment_ids,
		       created_at, updated_at
	`, req["project_id"], req["title"], req["description"], req["status"], req["start_time"],
		req["duration"], req["location"], req["location_lat"], req["location_lng"], req["remarks"], req["date"], req["scene_number"],
		equipmentIDs, preparedIDs, time.Now())
	return &s, err
}

func (r *ShotRepository) Update(ctx context.Context, id, projectID string, updates map[string]interface{}) (*models.Shot, error) {
	// Build dynamic update query
	query := "UPDATE shots SET "
	var args []interface{}
	argCount := 0

	if v, ok := updates["title"]; ok && v != nil {
		argCount++
		query += fmt.Sprintf("title = $%d, ", argCount)
		args = append(args, v)
	}
	if v, ok := updates["description"]; ok && v != nil {
		argCount++
		query += fmt.Sprintf("description = $%d, ", argCount)
		args = append(args, v)
	}
	if v, ok := updates["status"]; ok && v != nil {
		argCount++
		query += fmt.Sprintf("status = $%d, ", argCount)
		args = append(args, v)
	}
	if v, ok := updates["start_time"]; ok && v != nil {
		argCount++
		query += fmt.Sprintf("start_time = $%d, ", argCount)
		args = append(args, v)
	}
	if v, ok := updates["duration"]; ok && v != nil {
		argCount++
		query += fmt.Sprintf("duration = $%d, ", argCount)
		args = append(args, v)
	}
	if v, ok := updates["location"]; ok && v != nil {
		argCount++
		query += fmt.Sprintf("location = $%d, ", argCount)
		args = append(args, v)
	}
	if v, ok := updates["location_lat"]; ok && v != nil {
		argCount++
		query += fmt.Sprintf("location_lat = $%d, ", argCount)
		args = append(args, v)
	}
	if v, ok := updates["location_lng"]; ok && v != nil {
		argCount++
		query += fmt.Sprintf("location_lng = $%d, ", argCount)
		args = append(args, v)
	}
	if v, ok := updates["remarks"]; ok && v != nil {
		argCount++
		query += fmt.Sprintf("remarks = $%d, ", argCount)
		args = append(args, v)
	}
	if v, ok := updates["date"]; ok && v != nil {
		argCount++
		query += fmt.Sprintf("date = $%d, ", argCount)
		args = append(args, v)
	}
	if v, ok := updates["scene_number"]; ok && v != nil {
		argCount++
		query += fmt.Sprintf("scene_number = $%d, ", argCount)
		args = append(args, v)
	}
	if v, ok := updates["equipment_ids"]; ok && v != nil {
		argCount++
		ids, _ := json.Marshal(v)
		query += fmt.Sprintf("equipment_ids = $%d, ", argCount)
		args = append(args, ids)
	}
	if v, ok := updates["prepared_equipment_ids"]; ok && v != nil {
		argCount++
		preparedIds, _ := json.Marshal(v)
		query += fmt.Sprintf("prepared_equipment_ids = $%d, ", argCount)
		args = append(args, preparedIds)
	}

	// Always update updated_at
	argCount++
	query += fmt.Sprintf("updated_at = $%d ", argCount)
	args = append(args, time.Now())

	// Add WHERE clause
	argCount++
	query += fmt.Sprintf("WHERE id = $%d AND project_id = $%d ", argCount, argCount+1)
	args = append(args, id, projectID)

	argCount++
	query += fmt.Sprintf("RETURNING id, project_id, title, description, status, start_time, duration, " +
		"location, location_lat, location_lng, remarks, date, scene_number, equipment_ids, prepared_equipment_ids, created_at, updated_at")

	var s models.Shot
	err := r.db.GetContext(ctx, &s, query, args...)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &s, err
}

func (r *ShotRepository) Delete(ctx context.Context, id, projectID string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM shots WHERE id = $1 AND project_id = $2`, id, projectID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}
