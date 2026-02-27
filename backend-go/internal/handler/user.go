package handler

import (
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/dto"
	"github.com/vemakin/backend/internal/models"
)

func userToResponse(u models.User) dto.UserResponse {
	// Convert []byte (JSONB from DB) to []string
	var hubCardOrder []string
	if u.HubCardOrder != nil && len(u.HubCardOrder) > 0 {
		json.Unmarshal(u.HubCardOrder, &hubCardOrder)
	}

	return dto.UserResponse{
		ID:                   u.ID,
		Email:                u.Email,
		Name:                 u.Name,
		DarkMode:             u.DarkMode,
		LastProjectID:        u.LastProjectID,
		PostProdGridColumns:  u.PostProdGridColumns,
		NotesGridColumns:     u.NotesGridColumns,
		InventoryGridColumns: u.InventoryGridColumns,
		HubCardOrder:         hubCardOrder,
		HubShotsLimit:        u.HubShotsLimit,
		HubTasksLimit:        u.HubTasksLimit,
		HubNotesLimit:        u.HubNotesLimit,
		HubEquipmentLimit:    u.HubEquipmentLimit,
		FirstConnection:      u.FirstConnection,
		EmailVerified:        u.EmailVerified,
	}
}

func (h *Handler) GetUser(c echo.Context) error {
	userID := getUserID(c)
	email := c.Get("userEmail").(string)
	name := c.Get("userName").(string)

	user, err := h.userRepo.Upsert(c.Request().Context(), userID, email, name)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.JSON(http.StatusOK, userToResponse(*user))
}

func (h *Handler) UpdateUser(c echo.Context) error {
	userID := getUserID(c)

	var req dto.UpdateUserRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errorResponse(err))
	}

	updates := map[string]interface{}{}
	if req.DarkMode != nil {
		updates["dark_mode"] = *req.DarkMode
	}
	if req.LastProjectID != nil {
		updates["last_project_id"] = *req.LastProjectID
	}
	if req.PostProdGridColumns != nil {
		updates["post_prod_grid_columns"] = *req.PostProdGridColumns
	}
	if req.NotesGridColumns != nil {
		updates["notes_grid_columns"] = *req.NotesGridColumns
	}
	if req.InventoryGridColumns != nil {
		updates["inventory_grid_columns"] = *req.InventoryGridColumns
	}
	if req.HubCardOrder != nil {
		hubCardOrderJSON, _ := json.Marshal(req.HubCardOrder)
		updates["hub_card_order"] = hubCardOrderJSON
	}
	if req.HubShotsLimit != nil {
		updates["hub_shots_limit"] = *req.HubShotsLimit
	}
	if req.HubTasksLimit != nil {
		updates["hub_tasks_limit"] = *req.HubTasksLimit
	}
	if req.HubNotesLimit != nil {
		updates["hub_notes_limit"] = *req.HubNotesLimit
	}
	if req.HubEquipmentLimit != nil {
		updates["hub_equipment_limit"] = *req.HubEquipmentLimit
	}
	if req.FirstConnection != nil {
		updates["first_connection"] = *req.FirstConnection
	}

	if len(updates) == 0 {
		return c.JSON(http.StatusBadRequest, notFoundResponse("No fields to update"))
	}

	if err := h.userRepo.Update(c.Request().Context(), userID, updates); err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	user, err := h.userRepo.GetByID(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.JSON(http.StatusOK, userToResponse(*user))
}

type VerifyEmailRequest struct {
	Verified bool `json:"verified"`
}

func (h *Handler) VerifyEmail(c echo.Context) error {
	userID := getUserID(c)

	var req VerifyEmailRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errorResponse(err))
	}

	if err := h.userRepo.UpdateEmailVerified(c.Request().Context(), userID, req.Verified); err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	user, err := h.userRepo.GetByID(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.JSON(http.StatusOK, userToResponse(*user))
}
