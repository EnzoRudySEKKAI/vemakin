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
