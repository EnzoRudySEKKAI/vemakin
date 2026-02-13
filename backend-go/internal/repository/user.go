package repository

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/vemakin/backend/internal/models"
)

// UserRepository handles user data access
type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	var u models.User
	err := r.db.GetContext(ctx, &u, `SELECT id, email, name FROM users WHERE id = $1`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &u, err
}

func (r *UserRepository) Create(ctx context.Context, id, email, name string) (*models.User, error) {
	var u models.User
	err := r.db.GetContext(ctx, &u, `
		INSERT INTO users (id, email, name)
		VALUES ($1, $2, $3)
		ON CONFLICT (id) DO NOTHING
		RETURNING id, email, name
	`, id, email, name)
	if err == sql.ErrNoRows {
		// User already exists, fetch it
		return r.GetByID(ctx, id)
	}
	return &u, err
}

func (r *UserRepository) Upsert(ctx context.Context, id, email, name string) (*models.User, error) {
	var u models.User
	err := r.db.GetContext(ctx, &u, `
		INSERT INTO users (id, email, name)
		VALUES ($1, $2, $3)
		ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
		RETURNING id, email, name
	`, id, email, name)
	return &u, err
}
