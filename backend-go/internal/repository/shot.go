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

type ShotRepository struct {
	db *sqlx.DB
}

func NewShotRepository(db *sqlx.DB) *ShotRepository {
	return &ShotRepository{db: db}
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
	query := "UPDATE shots SET "
	var args []interface{}
	argCount := 0

	fields := map[string]string{
		"title":                  "title",
		"description":            "description",
		"status":                 "status",
		"start_time":             "start_time",
		"duration":               "duration",
		"location":               "location",
		"location_lat":           "location_lat",
		"location_lng":           "location_lng",
		"remarks":                "remarks",
		"date":                   "date",
		"scene_number":           "scene_number",
		"equipment_ids":          "equipment_ids",
		"prepared_equipment_ids": "prepared_equipment_ids",
	}

	for key, column := range fields {
		if v, ok := updates[key]; ok && v != nil {
			argCount++
			if key == "equipment_ids" || key == "prepared_equipment_ids" {
				ids, _ := json.Marshal(v)
				query += fmt.Sprintf("%s = $%d, ", column, argCount)
				args = append(args, ids)
			} else {
				query += fmt.Sprintf("%s = $%d, ", column, argCount)
				args = append(args, v)
			}
		}
	}

	argCount++
	query += fmt.Sprintf("updated_at = $%d ", argCount)
	args = append(args, time.Now())

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
