package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/vemakin/backend/internal/models"
)

type NoteRepository struct {
	db *sqlx.DB
}

func NewNoteRepository(db *sqlx.DB) *NoteRepository {
	return &NoteRepository{db: db}
}

func (r *NoteRepository) GetByProjectAndUser(ctx context.Context, projectID, userID string, limit, offset int) ([]models.Note, error) {
	var notes []models.Note
	err := r.db.SelectContext(ctx, &notes, `
		WITH project_owner AS (
			SELECT 1 FROM projects WHERE id = $1 AND user_id = $2
		)
		SELECT n.id, n.project_id, n.title, n.content, n.shot_id, n.task_id, n.created_at, n.updated_at
		FROM notes n
		WHERE n.project_id = $1 AND EXISTS (SELECT 1 FROM project_owner)
		ORDER BY n.updated_at DESC 
		LIMIT $3 OFFSET $4
	`, projectID, userID, limit, offset)
	return notes, err
}

func (r *NoteRepository) GetByIDAndUser(ctx context.Context, id, projectID, userID string) (*models.Note, error) {
	var n models.Note
	err := r.db.GetContext(ctx, &n, `
		WITH project_owner AS (
			SELECT 1 FROM projects WHERE id = $1 AND user_id = $2
		)
		SELECT n.id, n.project_id, n.title, n.content, n.shot_id, n.task_id, n.created_at, n.updated_at
		FROM notes n
		WHERE n.id = $3 AND n.project_id = $1 AND EXISTS (SELECT 1 FROM project_owner)
	`, projectID, userID, id)
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
