package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/cache"
	"github.com/vemakin/backend/internal/dto"
	"github.com/vemakin/backend/internal/models"
	"github.com/vemakin/backend/internal/repository"
)

// Helper function to convert sql.NullTime to *time.Time
func nullTimeToPtr(t sql.NullTime) *time.Time {
	if t.Valid {
		return &t.Time
	}
	return nil
}

type Handler struct {
	db            interface{}
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

// Health check
func (h *Handler) Health(c echo.Context) error {
	ctx := c.Request().Context()
	err := h.projectRepo.Ping(ctx)

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

// Root endpoint
func (h *Handler) Root(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"message": "Vemakin Backend is running (Go)",
	})
}

// Get current user
func (h *Handler) GetMe(c echo.Context) error {
	userID := c.Get("userID").(string)
	email := c.Get("userEmail").(string)

	return c.JSON(http.StatusOK, dto.UserInfoResponse{
		UID:   userID,
		Email: email,
	})
}

// ============ Projects ============

func (h *Handler) GetProjects(c echo.Context) error {
	userID := c.Get("userID").(string)
	skip, _ := strconv.Atoi(c.QueryParam("skip"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 100
	}

	projects, err := h.projectRepo.GetByUser(c.Request().Context(), userID, limit, skip)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	var response []dto.ProjectResponse
	for _, p := range projects {
		response = append(response, dto.ProjectResponse{
			ID:        p.ID,
			Name:      p.Name,
			UserID:    p.UserID,
			CreatedAt: p.CreatedAt,
			UpdatedAt: nullTimeToPtr(p.UpdatedAt),
		})
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) CreateProject(c echo.Context) error {
	userID := c.Get("userID").(string)

	var req dto.CreateProjectRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	}

	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "name is required"})
	}

	project, err := h.projectRepo.Create(c.Request().Context(), userID, req.Name)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	return c.JSON(http.StatusCreated, dto.ProjectResponse{
		ID:        project.ID,
		Name:      project.Name,
		UserID:    project.UserID,
		CreatedAt: project.CreatedAt,
		UpdatedAt: nullTimeToPtr(project.UpdatedAt),
	})
}

func (h *Handler) GetProject(c echo.Context) error {
	userID := c.Get("userID").(string)
	projectID := c.Param("id")

	project, err := h.projectRepo.GetByID(c.Request().Context(), projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if project == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Project not found"})
	}

	return c.JSON(http.StatusOK, dto.ProjectResponse{
		ID:        project.ID,
		Name:      project.Name,
		UserID:    project.UserID,
		CreatedAt: project.CreatedAt,
		UpdatedAt: nullTimeToPtr(project.UpdatedAt),
	})
}

func (h *Handler) UpdateProject(c echo.Context) error {
	userID := c.Get("userID").(string)
	projectID := c.Param("id")

	var req dto.UpdateProjectRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	}

	if req.Name == nil || *req.Name == "" {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "name is required"})
	}

	project, err := h.projectRepo.Update(c.Request().Context(), projectID, userID, *req.Name)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if project == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Project not found"})
	}

	return c.JSON(http.StatusOK, dto.ProjectResponse{
		ID:        project.ID,
		Name:      project.Name,
		UserID:    project.UserID,
		CreatedAt: project.CreatedAt,
		UpdatedAt: nullTimeToPtr(project.UpdatedAt),
	})
}

func (h *Handler) DeleteProject(c echo.Context) error {
	userID := c.Get("userID").(string)
	projectID := c.Param("id")

	err := h.projectRepo.Delete(c.Request().Context(), projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	return c.NoContent(http.StatusNoContent)
}

// ============ Shots ============

func (h *Handler) GetShots(c echo.Context) error {
	userID := c.Get("userID").(string)
	projectID := c.QueryParam("project_id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "project_id is required"})
	}

	skip, _ := strconv.Atoi(c.QueryParam("skip"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 100
	}

	// Use CTE-based query that checks ownership in same query
	shots, err := h.shotRepo.GetByProjectAndUser(c.Request().Context(), projectID, userID, limit, skip)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	var response []dto.ShotResponse
	for _, s := range shots {
		response = append(response, h.shotToResponse(s))
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) CreateShot(c echo.Context) error {
	userID := c.Get("userID").(string)
	projectID := c.QueryParam("project_id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "project_id is required"})
	}

	// Verify ownership using CTE
	if err := h.projectRepo.CheckOwnership(c.Request().Context(), projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Project not found"})
	}

	var req dto.CreateShotRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	}

	reqMap := map[string]interface{}{
		"project_id":  projectID,
		"title":       req.Title,
		"description": req.Description,
		"status":      "pending",
		"duration":    "1h",
	}
	if req.Status != "" {
		reqMap["status"] = req.Status
	}
	if req.Duration != "" {
		reqMap["duration"] = req.Duration
	}
	if req.Location != "" {
		reqMap["location"] = req.Location
	}
	if req.Date != nil {
		reqMap["date"] = *req.Date
	}

	shot, err := h.shotRepo.Create(c.Request().Context(), reqMap)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	return c.JSON(http.StatusCreated, h.shotToResponse(*shot))
}

func (h *Handler) GetShot(c echo.Context) error {
	userID := c.Get("userID").(string)
	shotID := c.Param("id")
	projectID := c.QueryParam("project_id")

	// Use CTE-based query that checks ownership in same query
	shot, err := h.shotRepo.GetByIDAndUser(c.Request().Context(), shotID, projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if shot == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Shot not found"})
	}

	return c.JSON(http.StatusOK, h.shotToResponse(*shot))
}

func (h *Handler) UpdateShot(c echo.Context) error {
	userID := c.Get("userID").(string)
	shotID := c.Param("id")
	projectID := c.QueryParam("project_id")

	if err := h.projectRepo.CheckOwnership(c.Request().Context(), projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Project not found"})
	}

	var req dto.UpdateShotRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	}

	updates := make(map[string]interface{})
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.StartTime != nil {
		updates["start_time"] = *req.StartTime
	}
	if req.Duration != nil {
		updates["duration"] = *req.Duration
	}
	if req.Location != nil {
		updates["location"] = *req.Location
	}
	if req.Remarks != nil {
		updates["remarks"] = *req.Remarks
	}
	if req.Date != nil {
		updates["date"] = *req.Date
	}
	if req.SceneNumber != nil {
		updates["scene_number"] = *req.SceneNumber
	}
	if req.EquipmentIDs != nil {
		updates["equipment_ids"] = *req.EquipmentIDs
	}
	if req.PreparedEquipmentIDs != nil {
		updates["prepared_equipment_ids"] = *req.PreparedEquipmentIDs
	}

	shot, err := h.shotRepo.Update(c.Request().Context(), shotID, projectID, updates)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if shot == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Shot not found"})
	}

	return c.JSON(http.StatusOK, h.shotToResponse(*shot))
}

func (h *Handler) DeleteShot(c echo.Context) error {
	userID := c.Get("userID").(string)
	shotID := c.Param("id")
	projectID := c.QueryParam("project_id")

	// Use CTE-based query that checks ownership in same query
	shot, err := h.shotRepo.GetByIDAndUser(c.Request().Context(), shotID, projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if shot == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Shot not found"})
	}

	err = h.shotRepo.Delete(c.Request().Context(), shotID, projectID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) shotToResponse(s models.Shot) dto.ShotResponse {
	equipmentIDs := []string{}
	preparedIDs := []string{}
	json.Unmarshal(s.EquipmentIDs, &equipmentIDs)
	json.Unmarshal(s.PreparedEquipmentIDs, &preparedIDs)

	return dto.ShotResponse{
		ID:                   s.ID,
		ProjectID:            s.ProjectID,
		Title:                s.Title,
		Description:          s.Description,
		Status:               s.Status,
		StartTime:            nilIfNull(s.StartTime),
		Duration:             s.Duration,
		Location:             s.Location,
		Remarks:              nilIfNull(s.Remarks),
		Date:                 nilIfNull(s.Date),
		SceneNumber:          nilIfNull(s.SceneNumber),
		EquipmentIDs:         equipmentIDs,
		PreparedEquipmentIDs: preparedIDs,
		CreatedAt:            s.CreatedAt,
		UpdatedAt:            nullTimeToPtr(s.UpdatedAt),
	}
}

func nilIfNull(s sql.NullString) *string {
	if !s.Valid {
		return nil
	}
	return &s.String
}

// Helper to build EquipmentResponse WITHOUT specs (for bulk endpoints)
func (h *Handler) buildEquipmentResponseBasic(e models.Equipment) dto.EquipmentResponse {
	return dto.EquipmentResponse{
		ID:              e.ID,
		UserID:          e.UserID,
		Name:            e.Name,
		CatalogItemID:   e.CatalogItemID,
		CustomName:      e.CustomName,
		SerialNumber:    e.SerialNumber,
		Category:        e.Category,
		PricePerDay:     e.PricePerDay,
		RentalPrice:     e.RentalPrice,
		RentalFrequency: e.RentalFrequency,
		Quantity:        e.Quantity,
		IsOwned:         e.IsOwned,
		Status:          e.Status,
		Specs:           make(map[string]interface{}),
		CreatedAt:       e.CreatedAt,
		UpdatedAt:       nullTimeToPtr(e.UpdatedAt),
	}
}

// Helper to build EquipmentResponse with specs (for individual item endpoints)
func (h *Handler) buildEquipmentResponse(ctx context.Context, e models.Equipment) dto.EquipmentResponse {
	// Fetch specs if catalog_item_id exists
	specs := make(map[string]interface{})
	if e.CatalogItemID != nil && *e.CatalogItemID != "" {
		specs, _ = h.equipmentRepo.GetSpecsForCatalogItem(ctx, *e.CatalogItemID)
		if specs == nil {
			specs = make(map[string]interface{})
		}
	}

	return dto.EquipmentResponse{
		ID:              e.ID,
		UserID:          e.UserID,
		Name:            e.Name,
		CatalogItemID:   e.CatalogItemID,
		CustomName:      e.CustomName,
		SerialNumber:    e.SerialNumber,
		Category:        e.Category,
		PricePerDay:     e.PricePerDay,
		RentalPrice:     e.RentalPrice,
		RentalFrequency: e.RentalFrequency,
		Quantity:        e.Quantity,
		IsOwned:         e.IsOwned,
		Status:          e.Status,
		Specs:           specs,
		CreatedAt:       e.CreatedAt,
		UpdatedAt:       nullTimeToPtr(e.UpdatedAt),
	}
}

// ============ Equipment ============

func (h *Handler) GetInventory(c echo.Context) error {
	userID := c.Get("userID").(string)
	skip, _ := strconv.Atoi(c.QueryParam("skip"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 100
	}

	equipment, err := h.equipmentRepo.GetByUser(c.Request().Context(), userID, limit, skip)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	// Batch fetch specs for all equipment with catalog_item_id
	catalogItemIDs := make([]string, 0, len(equipment))
	for _, e := range equipment {
		if e.CatalogItemID != nil && *e.CatalogItemID != "" {
			catalogItemIDs = append(catalogItemIDs, *e.CatalogItemID)
		}
	}

	specsMap := make(map[string]map[string]interface{})
	if len(catalogItemIDs) > 0 {
		specsMap, _ = h.equipmentRepo.GetSpecsBatch(c.Request().Context(), catalogItemIDs)
	}

	var response []dto.EquipmentResponse
	for _, e := range equipment {
		specs := specsMap[*e.CatalogItemID]
		if specs == nil {
			specs = make(map[string]interface{})
		}

		response = append(response, dto.EquipmentResponse{
			ID:              e.ID,
			UserID:          e.UserID,
			Name:            e.Name,
			CatalogItemID:   e.CatalogItemID,
			CustomName:      e.CustomName,
			SerialNumber:    e.SerialNumber,
			Category:        e.Category,
			PricePerDay:     e.PricePerDay,
			RentalPrice:     e.RentalPrice,
			RentalFrequency: e.RentalFrequency,
			Quantity:        e.Quantity,
			IsOwned:         e.IsOwned,
			Status:          e.Status,
			Specs:           specs,
			CreatedAt:       e.CreatedAt,
			UpdatedAt:       nullTimeToPtr(e.UpdatedAt),
		})
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) CreateEquipment(c echo.Context) error {
	userID := c.Get("userID").(string)

	var req dto.CreateEquipmentRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	}

	reqMap := map[string]interface{}{
		"user_id":       userID,
		"name":          req.Name,
		"category":      req.Category,
		"price_per_day": req.PricePerDay,
		"quantity":      req.Quantity,
		"is_owned":      req.IsOwned,
		"status":        "operational",
	}
	if req.CatalogItemID != nil {
		reqMap["catalog_item_id"] = *req.CatalogItemID
	}
	if req.CustomName != nil {
		reqMap["custom_name"] = *req.CustomName
	}
	if req.SerialNumber != nil {
		reqMap["serial_number"] = *req.SerialNumber
	}
	if req.RentalPrice != nil {
		reqMap["rental_price"] = *req.RentalPrice
	}
	if req.RentalFrequency != nil {
		reqMap["rental_frequency"] = *req.RentalFrequency
	}
	if req.Status != "" {
		reqMap["status"] = req.Status
	}

	equipment, err := h.equipmentRepo.Create(c.Request().Context(), reqMap)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	return c.JSON(http.StatusCreated, dto.EquipmentResponse{
		ID:              equipment.ID,
		UserID:          equipment.UserID,
		Name:            equipment.Name,
		CatalogItemID:   equipment.CatalogItemID,
		CustomName:      equipment.CustomName,
		SerialNumber:    equipment.SerialNumber,
		Category:        equipment.Category,
		PricePerDay:     equipment.PricePerDay,
		RentalPrice:     equipment.RentalPrice,
		RentalFrequency: equipment.RentalFrequency,
		Quantity:        equipment.Quantity,
		IsOwned:         equipment.IsOwned,
		Status:          equipment.Status,
		Specs:           h.buildEquipmentResponse(c.Request().Context(), *equipment).Specs,
		CreatedAt:       equipment.CreatedAt,
		UpdatedAt:       nullTimeToPtr(equipment.UpdatedAt),
	})
}

func (h *Handler) GetEquipment(c echo.Context) error {
	userID := c.Get("userID").(string)
	equipmentID := c.Param("id")

	equipment, err := h.equipmentRepo.GetByID(c.Request().Context(), equipmentID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if equipment == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Equipment not found"})
	}

	return c.JSON(http.StatusOK, dto.EquipmentResponse{
		ID:              equipment.ID,
		UserID:          equipment.UserID,
		Name:            equipment.Name,
		CatalogItemID:   equipment.CatalogItemID,
		CustomName:      equipment.CustomName,
		SerialNumber:    equipment.SerialNumber,
		Category:        equipment.Category,
		PricePerDay:     equipment.PricePerDay,
		RentalPrice:     equipment.RentalPrice,
		RentalFrequency: equipment.RentalFrequency,
		Quantity:        equipment.Quantity,
		IsOwned:         equipment.IsOwned,
		Status:          equipment.Status,
		Specs:           h.buildEquipmentResponse(c.Request().Context(), *equipment).Specs,
		CreatedAt:       equipment.CreatedAt,
		UpdatedAt:       nullTimeToPtr(equipment.UpdatedAt),
	})
}

func (h *Handler) UpdateEquipment(c echo.Context) error {
	userID := c.Get("userID").(string)
	equipmentID := c.Param("id")

	var req dto.UpdateEquipmentRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	}

	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.CatalogItemID != nil {
		updates["catalog_item_id"] = *req.CatalogItemID
	}
	if req.CustomName != nil {
		updates["custom_name"] = *req.CustomName
	}
	if req.SerialNumber != nil {
		updates["serial_number"] = *req.SerialNumber
	}
	if req.Category != nil {
		updates["category"] = *req.Category
	}
	if req.PricePerDay != nil {
		updates["price_per_day"] = *req.PricePerDay
	}
	if req.RentalPrice != nil {
		updates["rental_price"] = *req.RentalPrice
	}
	if req.RentalFrequency != nil {
		updates["rental_frequency"] = *req.RentalFrequency
	}
	if req.Quantity != nil {
		updates["quantity"] = *req.Quantity
	}
	if req.IsOwned != nil {
		updates["is_owned"] = *req.IsOwned
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}

	equipment, err := h.equipmentRepo.Update(c.Request().Context(), equipmentID, userID, updates)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if equipment == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Equipment not found"})
	}

	return c.JSON(http.StatusOK, dto.EquipmentResponse{
		ID:              equipment.ID,
		UserID:          equipment.UserID,
		Name:            equipment.Name,
		CatalogItemID:   equipment.CatalogItemID,
		CustomName:      equipment.CustomName,
		SerialNumber:    equipment.SerialNumber,
		Category:        equipment.Category,
		PricePerDay:     equipment.PricePerDay,
		RentalPrice:     equipment.RentalPrice,
		RentalFrequency: equipment.RentalFrequency,
		Quantity:        equipment.Quantity,
		IsOwned:         equipment.IsOwned,
		Status:          equipment.Status,
		Specs:           h.buildEquipmentResponse(c.Request().Context(), *equipment).Specs,
		CreatedAt:       equipment.CreatedAt,
		UpdatedAt:       nullTimeToPtr(equipment.UpdatedAt),
	})
}

func (h *Handler) DeleteEquipment(c echo.Context) error {
	userID := c.Get("userID").(string)
	equipmentID := c.Param("id")

	err := h.equipmentRepo.Delete(c.Request().Context(), equipmentID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	return c.NoContent(http.StatusNoContent)
}

// ============ Notes ============

func (h *Handler) GetNotes(c echo.Context) error {
	userID := c.Get("userID").(string)
	projectID := c.QueryParam("project_id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "project_id is required"})
	}

	skip, _ := strconv.Atoi(c.QueryParam("skip"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 100
	}

	notes, err := h.noteRepo.GetByProjectAndUser(c.Request().Context(), projectID, userID, limit, skip)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	var response []dto.NoteResponse
	for _, n := range notes {
		response = append(response, dto.NoteResponse{
			ID:        n.ID,
			ProjectID: n.ProjectID,
			Title:     n.Title,
			Content:   n.Content,
			ShotID:    n.ShotID,
			TaskID:    n.TaskID,
			CreatedAt: n.CreatedAt,
			UpdatedAt: nullTimeToPtr(n.UpdatedAt),
		})
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) CreateNote(c echo.Context) error {
	userID := c.Get("userID").(string)
	projectID := c.QueryParam("project_id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "project_id is required"})
	}

	if err := h.projectRepo.CheckOwnership(c.Request().Context(), projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Project not found"})
	}

	var req dto.CreateNoteRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	}

	reqMap := map[string]interface{}{
		"project_id": projectID,
		"title":      req.Title,
		"content":    req.Content,
	}
	if req.ShotID != nil {
		reqMap["shot_id"] = *req.ShotID
	}
	if req.TaskID != nil {
		reqMap["task_id"] = *req.TaskID
	}

	note, err := h.noteRepo.Create(c.Request().Context(), reqMap)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	return c.JSON(http.StatusCreated, dto.NoteResponse{
		ID:        note.ID,
		ProjectID: note.ProjectID,
		Title:     note.Title,
		Content:   note.Content,
		ShotID:    note.ShotID,
		TaskID:    note.TaskID,
		CreatedAt: note.CreatedAt,
		UpdatedAt: nullTimeToPtr(note.UpdatedAt),
	})
}

func (h *Handler) GetNote(c echo.Context) error {
	userID := c.Get("userID").(string)
	noteID := c.Param("id")
	projectID := c.QueryParam("project_id")

	note, err := h.noteRepo.GetByIDAndUser(c.Request().Context(), noteID, projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if note == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Note not found"})
	}

	return c.JSON(http.StatusOK, dto.NoteResponse{
		ID:        note.ID,
		ProjectID: note.ProjectID,
		Title:     note.Title,
		Content:   note.Content,
		ShotID:    note.ShotID,
		TaskID:    note.TaskID,
		CreatedAt: note.CreatedAt,
		UpdatedAt: nullTimeToPtr(note.UpdatedAt),
	})
}

func (h *Handler) UpdateNote(c echo.Context) error {
	userID := c.Get("userID").(string)
	noteID := c.Param("id")
	projectID := c.QueryParam("project_id")

	if err := h.projectRepo.CheckOwnership(c.Request().Context(), projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Project not found"})
	}

	var req dto.UpdateNoteRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	}

	updates := make(map[string]interface{})
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Content != nil {
		updates["content"] = *req.Content
	}
	if req.ShotID != nil {
		updates["shot_id"] = *req.ShotID
	}
	if req.TaskID != nil {
		updates["task_id"] = *req.TaskID
	}

	note, err := h.noteRepo.Update(c.Request().Context(), noteID, projectID, updates)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if note == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Note not found"})
	}

	return c.JSON(http.StatusOK, dto.NoteResponse{
		ID:        note.ID,
		ProjectID: note.ProjectID,
		Title:     note.Title,
		Content:   note.Content,
		ShotID:    note.ShotID,
		TaskID:    note.TaskID,
		CreatedAt: note.CreatedAt,
		UpdatedAt: nullTimeToPtr(note.UpdatedAt),
	})
}

func (h *Handler) DeleteNote(c echo.Context) error {
	userID := c.Get("userID").(string)
	noteID := c.Param("id")
	projectID := c.QueryParam("project_id")

	note, err := h.noteRepo.GetByIDAndUser(c.Request().Context(), noteID, projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if note == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Note not found"})
	}

	err = h.noteRepo.Delete(c.Request().Context(), noteID, projectID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	return c.NoContent(http.StatusNoContent)
}

// ============ Tasks ============

func (h *Handler) GetTasks(c echo.Context) error {
	userID := c.Get("userID").(string)
	projectID := c.QueryParam("project_id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "project_id is required"})
	}

	skip, _ := strconv.Atoi(c.QueryParam("skip"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 100
	}

	tasks, err := h.taskRepo.GetByProjectAndUser(c.Request().Context(), projectID, userID, limit, skip)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	var response []dto.TaskResponse
	for _, t := range tasks {
		response = append(response, dto.TaskResponse{
			ID:          t.ID,
			ProjectID:   t.ProjectID,
			Category:    t.Category,
			Title:       t.Title,
			Status:      t.Status,
			Priority:    t.Priority,
			DueDate:     t.DueDate,
			Description: t.Description,
			CreatedAt:   t.CreatedAt,
			UpdatedAt:   nullTimeToPtr(t.UpdatedAt),
		})
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) CreateTask(c echo.Context) error {
	userID := c.Get("userID").(string)
	projectID := c.QueryParam("project_id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "project_id is required"})
	}

	if err := h.projectRepo.CheckOwnership(c.Request().Context(), projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Project not found"})
	}

	var req dto.CreateTaskRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	}

	reqMap := map[string]interface{}{
		"project_id": projectID,
		"category":   req.Category,
		"title":      req.Title,
		"status":     "todo",
		"priority":   "medium",
	}
	if req.Status != "" {
		reqMap["status"] = req.Status
	}
	if req.Priority != "" {
		reqMap["priority"] = req.Priority
	}
	if req.DueDate != nil {
		reqMap["due_date"] = *req.DueDate
	}
	if req.Description != nil {
		reqMap["description"] = *req.Description
	}

	task, err := h.taskRepo.Create(c.Request().Context(), reqMap)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	return c.JSON(http.StatusCreated, dto.TaskResponse{
		ID:          task.ID,
		ProjectID:   task.ProjectID,
		Category:    task.Category,
		Title:       task.Title,
		Status:      task.Status,
		Priority:    task.Priority,
		DueDate:     task.DueDate,
		Description: task.Description,
		CreatedAt:   task.CreatedAt,
		UpdatedAt:   nullTimeToPtr(task.UpdatedAt),
	})
}

func (h *Handler) GetTask(c echo.Context) error {
	userID := c.Get("userID").(string)
	taskID := c.Param("id")
	projectID := c.QueryParam("project_id")

	task, err := h.taskRepo.GetByIDAndUser(c.Request().Context(), taskID, projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if task == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Task not found"})
	}

	return c.JSON(http.StatusOK, dto.TaskResponse{
		ID:          task.ID,
		ProjectID:   task.ProjectID,
		Category:    task.Category,
		Title:       task.Title,
		Status:      task.Status,
		Priority:    task.Priority,
		DueDate:     task.DueDate,
		Description: task.Description,
		CreatedAt:   task.CreatedAt,
		UpdatedAt:   nullTimeToPtr(task.UpdatedAt),
	})
}

func (h *Handler) UpdateTask(c echo.Context) error {
	userID := c.Get("userID").(string)
	taskID := c.Param("id")
	projectID := c.QueryParam("project_id")

	if err := h.projectRepo.CheckOwnership(c.Request().Context(), projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Project not found"})
	}

	var req dto.UpdateTaskRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	}

	updates := make(map[string]interface{})
	if req.Category != nil {
		updates["category"] = *req.Category
	}
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.Priority != nil {
		updates["priority"] = *req.Priority
	}
	if req.DueDate != nil {
		updates["due_date"] = *req.DueDate
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}

	task, err := h.taskRepo.Update(c.Request().Context(), taskID, projectID, updates)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if task == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Task not found"})
	}

	return c.JSON(http.StatusOK, dto.TaskResponse{
		ID:          task.ID,
		ProjectID:   task.ProjectID,
		Category:    task.Category,
		Title:       task.Title,
		Status:      task.Status,
		Priority:    task.Priority,
		DueDate:     task.DueDate,
		Description: task.Description,
		CreatedAt:   task.CreatedAt,
		UpdatedAt:   nullTimeToPtr(task.UpdatedAt),
	})
}

func (h *Handler) DeleteTask(c echo.Context) error {
	userID := c.Get("userID").(string)
	taskID := c.Param("id")
	projectID := c.QueryParam("project_id")

	task, err := h.taskRepo.GetByIDAndUser(c.Request().Context(), taskID, projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if task == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Task not found"})
	}

	err = h.taskRepo.Delete(c.Request().Context(), taskID, projectID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	return c.NoContent(http.StatusNoContent)
}

// ============ Catalog ============

func (h *Handler) GetCategories(c echo.Context) error {
	// Try cache first
	if h.catalogCache.IsLoaded() {
		categories := h.catalogCache.GetCategories()
		// Only use cache if it has actual data
		if len(categories) > 0 {
			var response []dto.CategoryResponse
			for _, cat := range categories {
				response = append(response, dto.CategoryResponse{
					ID:   cat.ID,
					Name: cat.Name,
					Slug: cat.Slug,
				})
			}
			return c.JSON(http.StatusOK, response)
		}
	}

	// Fallback to database
	categories, err := h.catalogRepo.GetCategories(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	var response []dto.CategoryResponse
	for _, cat := range categories {
		response = append(response, dto.CategoryResponse{
			ID:   cat.ID,
			Name: cat.Name,
			Slug: cat.Slug,
		})
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) GetBrands(c echo.Context) error {
	categoryID := c.QueryParam("category_id")
	var catID *string
	if categoryID != "" {
		catID = &categoryID
	}

	// Try cache first
	if h.catalogCache.IsLoaded() {
		brands := h.catalogCache.GetBrands(catID)
		var response []dto.BrandResponse
		for _, brand := range brands {
			response = append(response, dto.BrandResponse{
				ID:   brand.ID,
				Name: brand.Name,
			})
		}
		return c.JSON(http.StatusOK, response)
	}

	// Fallback to database
	brands, err := h.catalogRepo.GetBrands(c.Request().Context(), catID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	var response []dto.BrandResponse
	for _, brand := range brands {
		response = append(response, dto.BrandResponse{
			ID:   brand.ID,
			Name: brand.Name,
		})
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) GetItems(c echo.Context) error {
	categoryID := c.QueryParam("category_id")
	brandID := c.QueryParam("brand_id")

	var catID, brID *string
	if categoryID != "" {
		catID = &categoryID
	}
	if brandID != "" {
		brID = &brandID
	}

	// Try cache first
	if h.catalogCache.IsLoaded() {
		items := h.catalogCache.GetItems(catID, brID)
		var response []dto.GearCatalogResponse
		for _, item := range items {
			specs := h.catalogCache.GetSpecs(item.ID)
			response = append(response, dto.GearCatalogResponse{
				ID:          item.ID,
				BrandID:     item.BrandID,
				CategoryID:  item.CategoryID,
				Name:        item.Name,
				Description: item.Description,
				ImageURL:    item.ImageURL,
				Specs:       specs,
				CreatedAt:   item.CreatedAt,
			})
		}
		return c.JSON(http.StatusOK, response)
	}

	// Fallback to database
	items, err := h.catalogRepo.GetItems(c.Request().Context(), catID, brID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	var response []dto.GearCatalogResponse
	for _, item := range items {
		response = append(response, dto.GearCatalogResponse{
			ID:         item.ID,
			BrandID:    item.BrandID,
			CategoryID: item.CategoryID,
			Name:       item.Name,
		})
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) GetItem(c echo.Context) error {
	itemID := c.Param("id")

	item, err := h.catalogRepo.GetItemByID(c.Request().Context(), itemID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if item == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Item not found"})
	}

	// Get specs
	specs, _ := h.catalogRepo.GetSpecs(c.Request().Context(), itemID, "")

	return c.JSON(http.StatusOK, dto.GearCatalogResponse{
		ID:          item.ID,
		BrandID:     item.BrandID,
		CategoryID:  item.CategoryID,
		Name:        item.Name,
		Description: item.Description,
		ImageURL:    item.ImageURL,
		Specs:       specs,
		CreatedAt:   item.CreatedAt,
	})
}

func (h *Handler) GetItemSpecs(c echo.Context) error {
	itemID := c.Param("id")

	specs, err := h.catalogRepo.GetSpecs(c.Request().Context(), itemID, "")
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	return c.JSON(http.StatusOK, specs)
}

func (h *Handler) GetCatalogHealth(c echo.Context) error {
	return c.JSON(http.StatusOK, h.catalogCache.GetStats())
}

// ============ Bulk ============

func (h *Handler) GetInitialData(c echo.Context) error {
	userID := c.Get("userID").(string)
	projectID := c.QueryParam("project_id")

	ctx := c.Request().Context()

	type projectResult struct {
		projects []models.Project
		err      error
	}
	type equipmentResult struct {
		equipment []models.Equipment
		err       error
	}

	projectChan := make(chan projectResult, 1)
	equipmentChan := make(chan equipmentResult, 1)

	go func() {
		projects, err := h.projectRepo.GetByUser(ctx, userID, 100, 0)
		projectChan <- projectResult{projects: projects, err: err}
	}()

	go func() {
		equipment, err := h.equipmentRepo.GetByUser(ctx, userID, 100, 0)
		equipmentChan <- equipmentResult{equipment: equipment, err: err}
	}()

	pr := <-projectChan
	if pr.err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: pr.err.Error()})
	}

	er := <-equipmentChan
	if er.err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: er.err.Error()})
	}

	var projectResponses []dto.ProjectResponse
	for _, p := range pr.projects {
		projectResponses = append(projectResponses, dto.ProjectResponse{
			ID:        p.ID,
			Name:      p.Name,
			UserID:    p.UserID,
			CreatedAt: p.CreatedAt,
			UpdatedAt: nullTimeToPtr(p.UpdatedAt),
		})
	}

	// Batch load specs for equipment
	catalogItemIDs := make([]string, 0, len(er.equipment))
	for _, e := range er.equipment {
		if e.CatalogItemID != nil && *e.CatalogItemID != "" {
			catalogItemIDs = append(catalogItemIDs, *e.CatalogItemID)
		}
	}

	specsMap := make(map[string]map[string]interface{})
	if len(catalogItemIDs) > 0 {
		specsMap, _ = h.equipmentRepo.GetSpecsBatch(ctx, catalogItemIDs)
	}

	var equipmentResponses []dto.EquipmentResponse
	for _, e := range er.equipment {
		specs := specsMap[*e.CatalogItemID]
		if specs == nil {
			specs = make(map[string]interface{})
		}
		equipmentResponses = append(equipmentResponses, dto.EquipmentResponse{
			ID:              e.ID,
			UserID:          e.UserID,
			Name:            e.Name,
			CatalogItemID:   e.CatalogItemID,
			CustomName:      e.CustomName,
			SerialNumber:    e.SerialNumber,
			Category:        e.Category,
			PricePerDay:     e.PricePerDay,
			RentalPrice:     e.RentalPrice,
			RentalFrequency: e.RentalFrequency,
			Quantity:        e.Quantity,
			IsOwned:         e.IsOwned,
			Status:          e.Status,
			Specs:           specs,
			CreatedAt:       e.CreatedAt,
			UpdatedAt:       nullTimeToPtr(e.UpdatedAt),
		})
	}

	response := dto.InitialDataResponse{
		Projects:  projectResponses,
		Inventory: equipmentResponses,
	}

	if projectID != "" {
		shots, _ := h.shotRepo.GetByProjectAndUser(ctx, projectID, userID, 100, 0)
		var shotResponses []dto.ShotResponse
		for _, s := range shots {
			shotResponses = append(shotResponses, h.shotToResponse(s))
		}
		response.Shots = shotResponses

		notes, _ := h.noteRepo.GetByProjectAndUser(ctx, projectID, userID, 100, 0)
		var noteResponses []dto.NoteResponse
		for _, n := range notes {
			noteResponses = append(noteResponses, dto.NoteResponse{
				ID:        n.ID,
				ProjectID: n.ProjectID,
				Title:     n.Title,
				Content:   n.Content,
				ShotID:    n.ShotID,
				TaskID:    n.TaskID,
				CreatedAt: n.CreatedAt,
				UpdatedAt: nullTimeToPtr(n.UpdatedAt),
			})
		}
		response.Notes = noteResponses

		tasks, _ := h.taskRepo.GetByProjectAndUser(ctx, projectID, userID, 100, 0)
		var taskResponses []dto.TaskResponse
		for _, t := range tasks {
			taskResponses = append(taskResponses, dto.TaskResponse{
				ID:          t.ID,
				ProjectID:   t.ProjectID,
				Category:    t.Category,
				Title:       t.Title,
				Status:      t.Status,
				Priority:    t.Priority,
				DueDate:     t.DueDate,
				Description: t.Description,
				CreatedAt:   t.CreatedAt,
				UpdatedAt:   nullTimeToPtr(t.UpdatedAt),
			})
		}
		response.Tasks = taskResponses
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) GetProjectData(c echo.Context) error {
	userID := c.Get("userID").(string)
	projectID := c.Param("id")

	ctx := c.Request().Context()

	if err := h.projectRepo.CheckOwnership(ctx, projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Project not found"})
	}

	type result struct {
		data any
		err  error
	}

	shotsChan := make(chan result, 1)
	notesChan := make(chan result, 1)
	tasksChan := make(chan result, 1)

	go func() {
		shots, err := h.shotRepo.GetByProjectAndUser(ctx, projectID, userID, 100, 0)
		shotsChan <- result{data: shots, err: err}
	}()

	go func() {
		notes, err := h.noteRepo.GetByProjectAndUser(ctx, projectID, userID, 100, 0)
		notesChan <- result{data: notes, err: err}
	}()

	go func() {
		tasks, err := h.taskRepo.GetByProjectAndUser(ctx, projectID, userID, 100, 0)
		tasksChan <- result{data: tasks, err: err}
	}()

	shotsResult := <-shotsChan
	if shotsResult.err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: shotsResult.err.Error()})
	}

	notesResult := <-notesChan
	if notesResult.err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: notesResult.err.Error()})
	}

	tasksResult := <-tasksChan
	if tasksResult.err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: tasksResult.err.Error()})
	}

	shots := shotsResult.data.([]models.Shot)
	notes := notesResult.data.([]models.Note)
	tasks := tasksResult.data.([]models.PostProdTask)

	var shotResponses []dto.ShotResponse
	for _, s := range shots {
		shotResponses = append(shotResponses, h.shotToResponse(s))
	}

	var noteResponses []dto.NoteResponse
	for _, n := range notes {
		noteResponses = append(noteResponses, dto.NoteResponse{
			ID:        n.ID,
			ProjectID: n.ProjectID,
			Title:     n.Title,
			Content:   n.Content,
			ShotID:    n.ShotID,
			TaskID:    n.TaskID,
			CreatedAt: n.CreatedAt,
			UpdatedAt: nullTimeToPtr(n.UpdatedAt),
		})
	}

	var taskResponses []dto.TaskResponse
	for _, t := range tasks {
		taskResponses = append(taskResponses, dto.TaskResponse{
			ID:          t.ID,
			ProjectID:   t.ProjectID,
			Category:    t.Category,
			Title:       t.Title,
			Status:      t.Status,
			Priority:    t.Priority,
			DueDate:     t.DueDate,
			Description: t.Description,
			CreatedAt:   t.CreatedAt,
			UpdatedAt:   nullTimeToPtr(t.UpdatedAt),
		})
	}

	return c.JSON(http.StatusOK, dto.ProjectDataResponse{
		Shots: shotResponses,
		Notes: noteResponses,
		Tasks: taskResponses,
	})
}

// ============ Users ============

// GetUser returns the current user's profile including preferences
func (h *Handler) GetUser(c echo.Context) error {
	userID := c.Get("userID").(string)

	user, err := h.userRepo.GetByID(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}
	if user == nil {
		return c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "User not found"})
	}

	return c.JSON(http.StatusOK, dto.UserResponse{
		ID:       user.ID,
		Email:    user.Email,
		Name:     user.Name,
		DarkMode: user.DarkMode,
	})
}

// UpdateUser updates the current user's profile and preferences
func (h *Handler) UpdateUser(c echo.Context) error {
	userID := c.Get("userID").(string)

	var req dto.UpdateUserRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	}

	updates := make(map[string]interface{})
	if req.DarkMode != nil {
		updates["dark_mode"] = *req.DarkMode
	}

	if len(updates) == 0 {
		return c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "No fields to update"})
	}

	if err := h.userRepo.Update(c.Request().Context(), userID, updates); err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	user, err := h.userRepo.GetByID(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
	}

	return c.JSON(http.StatusOK, dto.UserResponse{
		ID:       user.ID,
		Email:    user.Email,
		Name:     user.Name,
		DarkMode: user.DarkMode,
	})
}
