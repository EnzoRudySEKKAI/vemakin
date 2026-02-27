package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/cache"
	"github.com/vemakin/backend/internal/dto"
	"github.com/vemakin/backend/internal/repository"
)

type Handler struct {
	db            *repository.DB
	projectRepo   *repository.ProjectRepository
	shotRepo      *repository.ShotRepository
	equipmentRepo *repository.EquipmentRepository
	noteRepo      *repository.NoteRepository
	taskRepo      *repository.TaskRepository
	catalogRepo   *repository.CatalogRepository
	userRepo      *repository.UserRepository
	catalogCache  *cache.CatalogCache
}

func NewHandler(
	db *repository.DB,
	projectRepo *repository.ProjectRepository,
	shotRepo *repository.ShotRepository,
	equipmentRepo *repository.EquipmentRepository,
	noteRepo *repository.NoteRepository,
	taskRepo *repository.TaskRepository,
	catalogRepo *repository.CatalogRepository,
	userRepo *repository.UserRepository,
	catalogCache *cache.CatalogCache,
) *Handler {
	return &Handler{
		db:            db,
		projectRepo:   projectRepo,
		shotRepo:      shotRepo,
		equipmentRepo: equipmentRepo,
		noteRepo:      noteRepo,
		taskRepo:      taskRepo,
		catalogRepo:   catalogRepo,
		userRepo:      userRepo,
		catalogCache:  catalogCache,
	}
}

func (h *Handler) Health(c echo.Context) error {
	ctx := c.Request().Context()
	err := h.db.Ping(ctx)

	health := dto.HealthResponse{
		Status: "ok",
		DB:     "connected",
		Cache:  h.catalogCache.GetStats(),
	}

	if err != nil {
		health.DB = "error: " + err.Error()
		health.Status = "degraded"
	}

	return c.JSON(http.StatusOK, health)
}

func (h *Handler) Root(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"message": "Vemakin Backend",
	})
}

func (h *Handler) GetMe(c echo.Context) error {
	userID := getUserID(c)
	email := c.Get("userEmail").(string)

	return c.JSON(http.StatusOK, dto.UserInfoResponse{
		UID:   userID,
		Email: email,
	})
}

type SyncEmailVerifiedRequest struct {
	EmailVerified bool `json:"emailVerified"`
}

func (h *Handler) SyncEmailVerified(c echo.Context) error {
	userID := getUserID(c)
	email := c.Get("userEmail").(string)
	name := c.Get("userName").(string)

	var req SyncEmailVerifiedRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}

	_, err := h.userRepo.Upsert(c.Request().Context(), userID, email, name, req.EmailVerified)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to sync email verified status")
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status": "updated",
	})
}

type CreateUserRequest struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	Name          string `json:"name"`
	EmailVerified bool   `json:"emailVerified"`
}

func (h *Handler) CreateUser(c echo.Context) error {
	var req CreateUserRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}

	if req.ID == "" || req.Email == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "id and email are required")
	}

	_, err := h.userRepo.Create(c.Request().Context(), req.ID, req.Email, req.Name, req.EmailVerified)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create user")
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status": "created",
	})
}
