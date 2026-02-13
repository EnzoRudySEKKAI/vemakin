package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/vemakin/backend/internal/models"
)

// NoteRepository handles note data access
type NoteRepository struct {
	db *sqlx.DB
}

func NewNoteRepository(db *sqlx.DB) *NoteRepository {
	return &NoteRepository{db: db}
}

func (r *NoteRepository) GetByProject(ctx context.Context, projectID string, limit, offset int) ([]models.Note, error) {
	var notes []models.Note
	err := r.db.SelectContext(ctx, &notes, `
		SELECT id, project_id, title, content, shot_id, task_id, created_at, updated_at
		FROM notes 
		WHERE project_id = $1 
		ORDER BY updated_at DESC 
		LIMIT $2 OFFSET $3
	`, projectID, limit, offset)
	return notes, err
}

func (r *NoteRepository) GetByID(ctx context.Context, id, projectID string) (*models.Note, error) {
	var n models.Note
	err := r.db.GetContext(ctx, &n, `
		SELECT id, project_id, title, content, shot_id, task_id, created_at, updated_at
		FROM notes 
		WHERE id = $1 AND project_id = $2
	`, id, projectID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &n, err
}

func (r *NoteRepository) Create(ctx context.Context, req map[string]interface{}) (*models.Note, error) {
	var n models.Note
	err := r.db.GetContext(ctx, &n, `
		INSERT INTO notes (id, project_id, title, content, shot_id, task_id, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $6)
		RETURNING id, project_id, title, content, shot_id, task_id, created_at, updated_at
	`, req["project_id"], req["title"], req["content"], req["shot_id"], req["task_id"], time.Now())
	return &n, err
}

func (r *NoteRepository) Update(ctx context.Context, id, projectID string, updates map[string]interface{}) (*models.Note, error) {
	query := "UPDATE notes SET "
	var args []interface{}
	argCount := 0

	fields := []string{"title", "content", "shot_id", "task_id"}

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
	query += fmt.Sprintf("WHERE id = $%d AND project_id = $%d ", argCount, argCount+1)
	args = append(args, id, projectID)

	argCount++
	query += "RETURNING id, project_id, title, content, shot_id, task_id, created_at, updated_at"

	var n models.Note
	err := r.db.GetContext(ctx, &n, query, args...)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &n, err
}

func (r *NoteRepository) Delete(ctx context.Context, id, projectID string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM notes WHERE id = $1 AND project_id = $2`, id, projectID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}
