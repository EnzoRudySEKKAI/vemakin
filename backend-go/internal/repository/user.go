package repository

import (
	"context"
	"database/sql"
	"strconv"

	"github.com/jmoiron/sqlx"
	"github.com/vemakin/backend/internal/models"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	var u models.User
	err := r.db.GetContext(ctx, &u, `SELECT id, email, name, dark_mode, last_project_id, post_prod_grid_columns, notes_grid_columns, inventory_grid_columns, hub_card_order FROM users WHERE id = $1`, id)
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
		RETURNING id, email, name, dark_mode, last_project_id, post_prod_grid_columns, notes_grid_columns, inventory_grid_columns, hub_card_order
	`, id, email, name)
	if err == sql.ErrNoRows {
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
		RETURNING id, email, name, dark_mode, last_project_id, post_prod_grid_columns, notes_grid_columns, inventory_grid_columns, hub_card_order
	`, id, email, name)
	return &u, err
}

func (r *UserRepository) Update(ctx context.Context, id string, updates map[string]interface{}) error {
	query := `UPDATE users SET `
	params := []interface{}{}
	paramCount := 0

	for field, value := range updates {
		if paramCount > 0 {
			query += ", "
		}
		paramCount++
		query += field + " = $" + strconv.Itoa(paramCount)
		params = append(params, value)
	}

	paramCount++
	query += " WHERE id = $" + strconv.Itoa(paramCount)
	params = append(params, id)

	_, err := r.db.ExecContext(ctx, query, params...)
	return err
}
