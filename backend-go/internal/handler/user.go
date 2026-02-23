package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/dto"
	"github.com/vemakin/backend/internal/models"
)

func userToResponse(u models.User) dto.UserResponse {
	return dto.UserResponse{
		ID:                   u.ID,
		Email:                u.Email,
		Name:                 u.Name,
		DarkMode:             u.DarkMode,
		LastProjectID:        u.LastProjectID,
		PostProdGridColumns:  u.PostProdGridColumns,
		NotesGridColumns:     u.NotesGridColumns,
		InventoryGridColumns: u.InventoryGridColumns,
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
