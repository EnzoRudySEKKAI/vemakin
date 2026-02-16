package handler

import (
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/constants"
	"github.com/vemakin/backend/internal/dto"
	"github.com/vemakin/backend/internal/models"
)

func shotToResponse(s models.Shot) dto.ShotResponse {
	equipmentIDs := []string{}
	preparedIDs := []string{}
	if err := json.Unmarshal(s.EquipmentIDs, &equipmentIDs); err != nil {
		equipmentIDs = []string{}
	}
	if err := json.Unmarshal(s.PreparedEquipmentIDs, &preparedIDs); err != nil {
		preparedIDs = []string{}
	}

	return dto.ShotResponse{
		ID:                   s.ID,
		ProjectID:            s.ProjectID,
		Title:                s.Title,
		Description:          s.Description,
		Status:               s.Status,
		StartTime:            ptrString(s.StartTime),
		Duration:             s.Duration,
		Location:             s.Location,
		Remarks:              ptrString(s.Remarks),
		Date:                 ptrString(s.Date),
		SceneNumber:          ptrString(s.SceneNumber),
		EquipmentIDs:         equipmentIDs,
		PreparedEquipmentIDs: preparedIDs,
		CreatedAt:            s.CreatedAt,
		UpdatedAt:            ptrTime(s.UpdatedAt),
	}
}

func (h *Handler) GetShots(c echo.Context) error {
	userID := getUserID(c)
	projectID, err := projectIDFromQuery(c)
	if err != nil {
		return err
	}

	skip, limit := paginationParams(c)

	shots, err := h.shotRepo.GetByProjectAndUser(c.Request().Context(), projectID, userID, limit, skip)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	response := make([]dto.ShotResponse, len(shots))
	for i, s := range shots {
		response[i] = shotToResponse(s)
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) CreateShot(c echo.Context) error {
	userID := getUserID(c)
	projectID, err := projectIDFromQuery(c)
	if err != nil {
		return err
	}

	if err := h.projectRepo.CheckOwnership(c.Request().Context(), projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Project not found"))
	}

	var req dto.CreateShotRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errorResponse(err))
	}

	reqMap := map[string]interface{}{
		"project_id":  projectID,
		"title":       req.Title,
		"description": req.Description,
		"status":      constants.StatusPending,
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
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.JSON(http.StatusCreated, shotToResponse(*shot))
}

func (h *Handler) GetShot(c echo.Context) error {
	userID := getUserID(c)
	shotID := c.Param("id")
	projectID := c.QueryParam("project_id")

	shot, err := h.shotRepo.GetByIDAndUser(c.Request().Context(), shotID, projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if shot == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Shot not found"))
	}

	return c.JSON(http.StatusOK, shotToResponse(*shot))
}

func (h *Handler) UpdateShot(c echo.Context) error {
	userID := getUserID(c)
	shotID := c.Param("id")
	projectID := c.QueryParam("project_id")

	if err := h.projectRepo.CheckOwnership(c.Request().Context(), projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Project not found"))
	}

	var req dto.UpdateShotRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errorResponse(err))
	}

	updates := map[string]interface{}{}
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
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if shot == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Shot not found"))
	}

	return c.JSON(http.StatusOK, shotToResponse(*shot))
}

func (h *Handler) DeleteShot(c echo.Context) error {
	userID := getUserID(c)
	shotID := c.Param("id")
	projectID := c.QueryParam("project_id")

	shot, err := h.shotRepo.GetByIDAndUser(c.Request().Context(), shotID, projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if shot == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Shot not found"))
	}

	err = h.shotRepo.Delete(c.Request().Context(), shotID, projectID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.NoContent(http.StatusNoContent)
}
