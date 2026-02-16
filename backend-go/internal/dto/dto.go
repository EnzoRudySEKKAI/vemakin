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
	ProjectID            string   `json:"projectId" validate:"required"`
	Title                string   `json:"title" validate:"required"`
	Description          string   `json:"description"`
	Status               string   `json:"status"`
	StartTime            *string  `json:"startTime"`
	Duration             string   `json:"duration"`
	Location             string   `json:"location"`
	Remarks              *string  `json:"remarks"`
	Date                 *string  `json:"date"`
	SceneNumber          *string  `json:"sceneNumber"`
	EquipmentIDs         []string `json:"equipmentIds"`
	PreparedEquipmentIDs []string `json:"preparedEquipmentIds"`
}

type UpdateShotRequest struct {
	Title                *string   `json:"title"`
	Description          *string   `json:"description"`
	Status               *string   `json:"status"`
	StartTime            *string   `json:"startTime"`
	Duration             *string   `json:"duration"`
	Location             *string   `json:"location"`
	Remarks              *string   `json:"remarks"`
	Date                 *string   `json:"date"`
	SceneNumber          *string   `json:"sceneNumber"`
	EquipmentIDs         *[]string `json:"equipmentIds"`
	PreparedEquipmentIDs *[]string `json:"preparedEquipmentIds"`
}

type CreateEquipmentRequest struct {
	Name            string   `json:"name" validate:"required"`
	CatalogItemID   *string  `json:"catalogItemId"`
	CustomName      *string  `json:"customName"`
	SerialNumber    *string  `json:"serialNumber"`
	Category        string   `json:"category"`
	PricePerDay     float64  `json:"pricePerDay"`
	RentalPrice     *float64 `json:"rentalPrice"`
	RentalFrequency *string  `json:"rentalFrequency"`
	Quantity        int      `json:"quantity"`
	IsOwned         bool     `json:"isOwned"`
	Status          string   `json:"status"`
}

type UpdateEquipmentRequest struct {
	Name            *string  `json:"name"`
	CatalogItemID   *string  `json:"catalogItemId"`
	CustomName      *string  `json:"customName"`
	SerialNumber    *string  `json:"serialNumber"`
	Category        *string  `json:"category"`
	PricePerDay     *float64 `json:"pricePerDay"`
	RentalPrice     *float64 `json:"rentalPrice"`
	RentalFrequency *string  `json:"rentalFrequency"`
	Quantity        *int     `json:"quantity"`
	IsOwned         *bool    `json:"isOwned"`
	Status          *string  `json:"status"`
}

type CreateNoteRequest struct {
	ProjectID string  `json:"projectId" validate:"required"`
	Title     string  `json:"title" validate:"required"`
	Content   string  `json:"content"`
	ShotID    *string `json:"shotId"`
	TaskID    *string `json:"taskId"`
}

type UpdateNoteRequest struct {
	Title   *string `json:"title"`
	Content *string `json:"content"`
	ShotID  *string `json:"shotId"`
	TaskID  *string `json:"taskId"`
}

type CreateTaskRequest struct {
	ProjectID   string  `json:"projectId" validate:"required"`
	Category    string  `json:"category" validate:"required"`
	Title       string  `json:"title" validate:"required"`
	Status      string  `json:"status"`
	Priority    string  `json:"priority"`
	DueDate     *string `json:"dueDate"`
	Description *string `json:"description"`
}

type UpdateTaskRequest struct {
	Category    *string `json:"category"`
	Title       *string `json:"title"`
	Status      *string `json:"status"`
	Priority    *string `json:"priority"`
	DueDate     *string `json:"dueDate"`
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
	UserID          string                 `json:"userId"`
	Name            string                 `json:"name"`
	CatalogItemID   *string                `json:"catalogItemId"`
	CustomName      *string                `json:"customName"`
	SerialNumber    *string                `json:"serialNumber"`
	Category        string                 `json:"category"`
	PricePerDay     float64                `json:"pricePerDay"`
	RentalPrice     *float64               `json:"rentalPrice"`
	RentalFrequency *string                `json:"rentalFrequency"`
	Quantity        int                    `json:"quantity"`
	IsOwned         bool                   `json:"isOwned"`
	Status          string                 `json:"status"`
	BrandName       *string                `json:"brandName,omitempty"`
	ModelName       *string                `json:"modelName,omitempty"`
	Specs           map[string]interface{} `json:"specs"`
	CreatedAt       time.Time              `json:"createdAt"`
	UpdatedAt       *time.Time             `json:"updatedAt,omitempty"`
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
	ID            string  `json:"id"`
	Email         string  `json:"email"`
	Name          string  `json:"name"`
	DarkMode      *bool   `json:"darkMode"`
	LastProjectID *string `json:"lastProjectId"`
}

type UpdateUserRequest struct {
	DarkMode *bool `json:"dark_mode"`
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
