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

func (r *ShotRepository) GetByProject(ctx context.Context, projectID string, limit, offset int) ([]models.Shot, error) {
	var shots []models.Shot
	err := r.db.SelectContext(ctx, &shots, `
		SELECT id, project_id, title, description, status, start_time, duration, 
		       location, remarks, date, scene_number, equipment_ids, prepared_equipment_ids,
		       created_at, updated_at
		FROM shots 
		WHERE project_id = $1 
		ORDER BY created_at DESC 
		LIMIT $2 OFFSET $3
	`, projectID, limit, offset)
	return shots, err
}

func (r *ShotRepository) GetByID(ctx context.Context, id, projectID string) (*models.Shot, error) {
	var s models.Shot
	err := r.db.GetContext(ctx, &s, `
		SELECT id, project_id, title, description, status, start_time, duration, 
		       location, remarks, date, scene_number, equipment_ids, prepared_equipment_ids,
		       created_at, updated_at
		FROM shots 
		WHERE id = $1 AND project_id = $2
	`, id, projectID)
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
		       location, remarks, date, scene_number, equipment_ids, prepared_equipment_ids,
		       created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
		RETURNING id, project_id, title, description, status, start_time, duration, 
		       location, remarks, date, scene_number, equipment_ids, prepared_equipment_ids,
		       created_at, updated_at
	`, req["project_id"], req["title"], req["description"], req["status"], req["start_time"],
		req["duration"], req["location"], req["remarks"], req["date"], req["scene_number"],
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
		"location, remarks, date, scene_number, equipment_ids, prepared_equipment_ids, created_at, updated_at")

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
