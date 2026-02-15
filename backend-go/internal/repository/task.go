package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/vemakin/backend/internal/models"
)

// TaskRepository handles post-production task data access
type TaskRepository struct {
	db *sqlx.DB
}

func NewTaskRepository(db *sqlx.DB) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) CountByProject(ctx context.Context, projectID string) (int, error) {
	var count int
	err := r.db.GetContext(ctx, &count, `
		SELECT COUNT(*) FROM post_prod_tasks WHERE project_id = $1
	`, projectID)
	return count, err
}

func (r *TaskRepository) GetByProject(ctx context.Context, projectID string, limit, offset int) ([]models.PostProdTask, error) {
	var tasks []models.PostProdTask
	err := r.db.SelectContext(ctx, &tasks, `
		SELECT id, project_id, category, title, status, priority, due_date, description, created_at, updated_at
		FROM post_prod_tasks 
		WHERE project_id = $1 
		ORDER BY created_at ASC 
		LIMIT $2 OFFSET $3
	`, projectID, limit, offset)
	return tasks, err
}

func (r *TaskRepository) GetByProjectAndUser(ctx context.Context, projectID, userID string, limit, offset int) ([]models.PostProdTask, error) {
	var tasks []models.PostProdTask
	err := r.db.SelectContext(ctx, &tasks, `
		WITH project_owner AS (
			SELECT 1 FROM projects WHERE id = $1 AND user_id = $2
		)
		SELECT t.id, t.project_id, t.category, t.title, t.status, t.priority, t.due_date, t.description, t.created_at, t.updated_at
		FROM post_prod_tasks t
		WHERE t.project_id = $1 AND EXISTS (SELECT 1 FROM project_owner)
		ORDER BY t.created_at ASC 
		LIMIT $3 OFFSET $4
	`, projectID, userID, limit, offset)
	return tasks, err
}

func (r *TaskRepository) GetByID(ctx context.Context, id, projectID string) (*models.PostProdTask, error) {
	var t models.PostProdTask
	err := r.db.GetContext(ctx, &t, `
		SELECT id, project_id, category, title, status, priority, due_date, description, created_at, updated_at
		FROM post_prod_tasks 
		WHERE id = $1 AND project_id = $2
	`, id, projectID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &t, err
}

func (r *TaskRepository) GetByIDAndUser(ctx context.Context, id, projectID, userID string) (*models.PostProdTask, error) {
	var t models.PostProdTask
	err := r.db.GetContext(ctx, &t, `
		WITH project_owner AS (
			SELECT 1 FROM projects WHERE id = $1 AND user_id = $2
		)
		SELECT t.id, t.project_id, t.category, t.title, t.status, t.priority, t.due_date, t.description, t.created_at, t.updated_at
		FROM post_prod_tasks t
		WHERE t.id = $3 AND t.project_id = $1 AND EXISTS (SELECT 1 FROM project_owner)
	`, projectID, userID, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &t, err
}

func (r *TaskRepository) Create(ctx context.Context, req map[string]interface{}) (*models.PostProdTask, error) {
	var t models.PostProdTask
	err := r.db.GetContext(ctx, &t, `
		INSERT INTO post_prod_tasks (id, project_id, category, title, status, priority, due_date, description, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $8)
		RETURNING id, project_id, category, title, status, priority, due_date, description, created_at, updated_at
	`, req["project_id"], req["category"], req["title"], req["status"],
		req["priority"], req["due_date"], req["description"], time.Now())
	return &t, err
}

func (r *TaskRepository) Update(ctx context.Context, id, projectID string, updates map[string]interface{}) (*models.PostProdTask, error) {
	query := "UPDATE post_prod_tasks SET "
	var args []interface{}
	argCount := 0

	fields := []string{"category", "title", "status", "priority", "due_date", "description"}

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
	query += "RETURNING id, project_id, category, title, status, priority, due_date, description, created_at, updated_at"

	var t models.PostProdTask
	err := r.db.GetContext(ctx, &t, query, args...)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &t, err
}

func (r *TaskRepository) Delete(ctx context.Context, id, projectID string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM post_prod_tasks WHERE id = $1 AND project_id = $2`, id, projectID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}
