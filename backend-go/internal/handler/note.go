package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/dto"
	"github.com/vemakin/backend/internal/models"
)

func noteToResponse(n models.Note) dto.NoteResponse {
	return dto.NoteResponse{
		ID:        n.ID,
		ProjectID: n.ProjectID,
		Title:     n.Title,
		Content:   n.Content,
		ShotID:    n.ShotID,
		TaskID:    n.TaskID,
		CreatedAt: n.CreatedAt,
		UpdatedAt: ptrTime(n.UpdatedAt),
	}
}

func (h *Handler) GetNotes(c echo.Context) error {
	userID := getUserID(c)
	projectID, err := projectIDFromQuery(c)
	if err != nil {
		return err
	}

	skip, limit := paginationParams(c)

	notes, err := h.noteRepo.GetByProjectAndUser(c.Request().Context(), projectID, userID, limit, skip)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	response := make([]dto.NoteResponse, len(notes))
	for i, n := range notes {
		response[i] = noteToResponse(n)
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) CreateNote(c echo.Context) error {
	userID := getUserID(c)
	projectID, err := projectIDFromQuery(c)
	if err != nil {
		return err
	}

	if err := h.projectRepo.CheckOwnership(c.Request().Context(), projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Project not found"))
	}

	var req dto.CreateNoteRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errorResponse(err))
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
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.JSON(http.StatusCreated, noteToResponse(*note))
}

func (h *Handler) GetNote(c echo.Context) error {
	userID := getUserID(c)
	noteID := c.Param("id")
	projectID := c.QueryParam("project_id")

	note, err := h.noteRepo.GetByIDAndUser(c.Request().Context(), noteID, projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if note == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Note not found"))
	}

	return c.JSON(http.StatusOK, noteToResponse(*note))
}

func (h *Handler) UpdateNote(c echo.Context) error {
	userID := getUserID(c)
	noteID := c.Param("id")
	projectID := c.QueryParam("project_id")

	if err := h.projectRepo.CheckOwnership(c.Request().Context(), projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Project not found"))
	}

	var req dto.UpdateNoteRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errorResponse(err))
	}

	updates := map[string]interface{}{}
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
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if note == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Note not found"))
	}

	return c.JSON(http.StatusOK, noteToResponse(*note))
}

func (h *Handler) DeleteNote(c echo.Context) error {
	userID := getUserID(c)
	noteID := c.Param("id")
	projectID := c.QueryParam("project_id")

	note, err := h.noteRepo.GetByIDAndUser(c.Request().Context(), noteID, projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if note == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Note not found"))
	}

	err = h.noteRepo.Delete(c.Request().Context(), noteID, projectID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.NoContent(http.StatusNoContent)
}
