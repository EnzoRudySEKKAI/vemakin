package dto

import (
	"time"
)

type CreateProjectRequest struct {
	Name string `json:"name" validate:"required"`
}

type UpdateProjectRequest struct {
	Name *string `json:"name"`
}

type CreateShotRequest struct {
	ProjectID            string   `json:"project_id" validate:"required"`
	Title                string   `json:"title" validate:"required"`
	Description          string   `json:"description"`
	Status               string   `json:"status"`
	StartTime            *string  `json:"start_time"`
	Duration             string   `json:"duration"`
	Location             string   `json:"location"`
	Remarks              *string  `json:"remarks"`
	Date                 *string  `json:"date"`
	SceneNumber          *string  `json:"scene_number"`
	EquipmentIDs         []string `json:"equipment_ids"`
	PreparedEquipmentIDs []string `json:"prepared_equipment_ids"`
}

type UpdateShotRequest struct {
	Title                *string   `json:"title"`
	Description          *string   `json:"description"`
	Status               *string   `json:"status"`
	StartTime            *string   `json:"start_time"`
	Duration             *string   `json:"duration"`
	Location             *string   `json:"location"`
	Remarks              *string   `json:"remarks"`
	Date                 *string   `json:"date"`
	SceneNumber          *string   `json:"scene_number"`
	EquipmentIDs         *[]string `json:"equipment_ids"`
	PreparedEquipmentIDs *[]string `json:"prepared_equipment_ids"`
}

type CreateEquipmentRequest struct {
	Name            string   `json:"name" validate:"required"`
	CatalogItemID   *string  `json:"catalog_item_id"`
	CustomName      *string  `json:"custom_name"`
	SerialNumber    *string  `json:"serial_number"`
	Category        string   `json:"category"`
	PricePerDay     float64  `json:"price_per_day"`
	RentalPrice     *float64 `json:"rental_price"`
	RentalFrequency *string  `json:"rental_frequency"`
	Quantity        int      `json:"quantity"`
	IsOwned         bool     `json:"is_owned"`
	Status          string   `json:"status"`
}

type UpdateEquipmentRequest struct {
	Name            *string  `json:"name"`
	CatalogItemID   *string  `json:"catalog_item_id"`
	CustomName      *string  `json:"custom_name"`
	SerialNumber    *string  `json:"serial_number"`
	Category        *string  `json:"category"`
	PricePerDay     *float64 `json:"price_per_day"`
	RentalPrice     *float64 `json:"rental_price"`
	RentalFrequency *string  `json:"rental_frequency"`
	Quantity        *int     `json:"quantity"`
	IsOwned         *bool    `json:"is_owned"`
	Status          *string  `json:"status"`
}

type CreateNoteRequest struct {
	ProjectID string  `json:"project_id" validate:"required"`
	Title     string  `json:"title" validate:"required"`
	Content   string  `json:"content"`
	ShotID    *string `json:"shot_id"`
	TaskID    *string `json:"task_id"`
}

type UpdateNoteRequest struct {
	Title   *string `json:"title"`
	Content *string `json:"content"`
	ShotID  *string `json:"shot_id"`
	TaskID  *string `json:"task_id"`
}

type CreateTaskRequest struct {
	ProjectID   string  `json:"project_id" validate:"required"`
	Category    string  `json:"category" validate:"required"`
	Title       string  `json:"title" validate:"required"`
	Status      string  `json:"status"`
	Priority    string  `json:"priority"`
	DueDate     *string `json:"due_date"`
	Description *string `json:"description"`
}

type UpdateTaskRequest struct {
	Category    *string `json:"category"`
	Title       *string `json:"title"`
	Status      *string `json:"status"`
	Priority    *string `json:"priority"`
	DueDate     *string `json:"due_date"`
	Description *string `json:"description"`
}

type ProjectResponse struct {
	ID        string     `json:"id"`
	Name      string     `json:"name"`
	UserID    string     `json:"userId"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt *time.Time `json:"updatedAt,omitempty"`
}

type ShotResponse struct {
	ID                   string     `json:"id"`
	ProjectID            string     `json:"projectId"`
	Title                string     `json:"title"`
	Description          string     `json:"description"`
	Status               string     `json:"status"`
	StartTime            *string    `json:"startTime"`
	Duration             string     `json:"duration"`
	Location             string     `json:"location"`
	Remarks              *string    `json:"remarks"`
	Date                 *string    `json:"date"`
	SceneNumber          *string    `json:"sceneNumber"`
	EquipmentIDs         []string   `json:"equipmentIds"`
	PreparedEquipmentIDs []string   `json:"preparedEquipmentIds"`
	CreatedAt            time.Time  `json:"createdAt"`
	UpdatedAt            *time.Time `json:"updatedAt,omitempty"`
}

type EquipmentResponse struct {
	ID              string                 `json:"id"`
	UserID          string                 `json:"user_id"`
	Name            string                 `json:"name"`
	CatalogItemID   *string                `json:"catalog_item_id"`
	CustomName      *string                `json:"custom_name"`
	SerialNumber    *string                `json:"serial_number"`
	Category        string                 `json:"category"`
	PricePerDay     float64                `json:"price_per_day"`
	RentalPrice     *float64               `json:"rental_price"`
	RentalFrequency *string                `json:"rental_frequency"`
	Quantity        int                    `json:"quantity"`
	IsOwned         bool                   `json:"is_owned"`
	Status          string                 `json:"status"`
	BrandName       *string                `json:"brand_name,omitempty"`
	ModelName       *string                `json:"model_name,omitempty"`
	Specs           map[string]interface{} `json:"specs"`
	CreatedAt       time.Time              `json:"created_at"`
	UpdatedAt       *time.Time             `json:"updated_at,omitempty"`
}

type NoteResponse struct {
	ID        string     `json:"id"`
	ProjectID string     `json:"projectId"`
	Title     string     `json:"title"`
	Content   string     `json:"content"`
	ShotID    *string    `json:"shotId"`
	TaskID    *string    `json:"taskId"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt *time.Time `json:"updatedAt,omitempty"`
}

type TaskResponse struct {
	ID          string     `json:"id"`
	ProjectID   string     `json:"projectId"`
	Category    string     `json:"category"`
	Title       string     `json:"title"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	DueDate     *string    `json:"dueDate"`
	Description *string    `json:"description"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   *time.Time `json:"updatedAt,omitempty"`
}

type CategoryResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type BrandResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type GearCatalogResponse struct {
	ID          string                 `json:"id"`
	BrandID     string                 `json:"brandId"`
	CategoryID  string                 `json:"categoryId"`
	Name        string                 `json:"name"`
	Description *string                `json:"description"`
	ImageURL    *string                `json:"imageUrl"`
	Specs       map[string]interface{} `json:"specs"`
	CreatedAt   time.Time              `json:"createdAt"`
}

type InitialDataResponse struct {
	Projects  []ProjectResponse   `json:"projects"`
	Inventory []EquipmentResponse `json:"inventory"`
	Shots     []ShotResponse      `json:"shots,omitempty"`
	Notes     []NoteResponse      `json:"notes,omitempty"`
	Tasks     []TaskResponse      `json:"tasks,omitempty"`
}

type ProjectDataResponse struct {
	Shots []ShotResponse `json:"shots"`
	Notes []NoteResponse `json:"notes"`
	Tasks []TaskResponse `json:"tasks"`
}

type HealthResponse struct {
	Status string                 `json:"status"`
	DB     string                 `json:"db"`
	Cache  map[string]interface{} `json:"cache"`
}

type UserInfoResponse struct {
	UID   string `json:"uid"`
	Email string `json:"email"`
}

type UserResponse struct {
	ID                   string   `json:"id"`
	Email                string   `json:"email"`
	Name                 string   `json:"name"`
	DarkMode             *bool    `json:"darkMode"`
	LastProjectID        *string  `json:"lastProjectId"`
	PostProdGridColumns  *int     `json:"postProdGridColumns"`
	NotesGridColumns     *int     `json:"notesGridColumns"`
	InventoryGridColumns *int     `json:"inventoryGridColumns"`
	HubCardOrder         []string `json:"hubCardOrder"`
	HubShotsLimit        *int     `json:"hubShotsLimit"`
	HubTasksLimit        *int     `json:"hubTasksLimit"`
	HubNotesLimit        *int     `json:"hubNotesLimit"`
	HubEquipmentLimit    *int     `json:"hubEquipmentLimit"`
}

type UpdateUserRequest struct {
	DarkMode             *bool    `json:"dark_mode"`
	LastProjectID        *string  `json:"last_project_id"`
	PostProdGridColumns  *int     `json:"post_prod_grid_columns"`
	NotesGridColumns     *int     `json:"notes_grid_columns"`
	InventoryGridColumns *int     `json:"inventory_grid_columns"`
	HubCardOrder         []string `json:"hub_card_order"`
	HubShotsLimit        *int     `json:"hub_shots_limit"`
	HubTasksLimit        *int     `json:"hub_tasks_limit"`
	HubNotesLimit        *int     `json:"hub_notes_limit"`
	HubEquipmentLimit    *int     `json:"hub_equipment_limit"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type PaginationResponse struct {
	Total   int  `json:"total"`
	Limit   int  `json:"limit"`
	Offset  int  `json:"offset"`
	HasMore bool `json:"hasMore"`
}

func NewPaginationResponse(total, limit, offset int) PaginationResponse {
	return PaginationResponse{
		Total:   total,
		Limit:   limit,
		Offset:  offset,
		HasMore: offset+limit < total,
	}
}
