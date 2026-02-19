package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/vemakin/backend/internal/models"
)

type ProjectRepository struct {
	db *sqlx.DB
}

func NewProjectRepository(db *sqlx.DB) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) GetByUser(ctx context.Context, userID string, limit, offset int) ([]models.Project, error) {
	var projects []models.Project
	err := r.db.SelectContext(ctx, &projects, `
		SELECT id, name, user_id, created_at, updated_at 
		FROM projects 
		WHERE user_id = $1 
		ORDER BY created_at DESC 
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)
	return projects, err
}

func (r *ProjectRepository) GetByID(ctx context.Context, id, userID string) (*models.Project, error) {
	var p models.Project
	err := r.db.GetContext(ctx, &p, `
		SELECT id, name, user_id, created_at, updated_at 
		FROM projects 
		WHERE id = $1 AND user_id = $2
	`, id, userID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &p, err
}

func (r *ProjectRepository) Create(ctx context.Context, userID, name string) (*models.Project, error) {
	var p models.Project
	err := r.db.GetContext(ctx, &p, `
		INSERT INTO projects (id, name, user_id, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $3)
		RETURNING id, name, user_id, created_at, updated_at
	`, name, userID, time.Now())
	return &p, err
}

func (r *ProjectRepository) Update(ctx context.Context, id, userID string, name string) (*models.Project, error) {
	var p models.Project
	err := r.db.GetContext(ctx, &p, `
		UPDATE projects 
		SET name = $1, updated_at = $2
		WHERE id = $3 AND user_id = $4
		RETURNING id, name, user_id, created_at, updated_at
	`, name, time.Now(), id, userID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &p, err
}

func (r *ProjectRepository) Delete(ctx context.Context, id, userID string) error {
	result, err := r.db.ExecContext(ctx, `
		DELETE FROM projects WHERE id = $1 AND user_id = $2
	`, id, userID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *ProjectRepository) CheckOwnership(ctx context.Context, projectID, userID string) error {
	var exists bool
	err := r.db.GetContext(ctx, &exists, `
		SELECT EXISTS(SELECT 1 FROM projects WHERE id = $1 AND user_id = $2)
	`, projectID, userID)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("project not found")
	}
	return nil
}
