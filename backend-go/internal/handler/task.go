package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/constants"
	"github.com/vemakin/backend/internal/dto"
	"github.com/vemakin/backend/internal/models"
)

func taskToResponse(t models.PostProdTask) dto.TaskResponse {
	return dto.TaskResponse{
		ID:          t.ID,
		ProjectID:   t.ProjectID,
		Category:    t.Category,
		Title:       t.Title,
		Status:      t.Status,
		Priority:    t.Priority,
		DueDate:     t.DueDate,
		Description: t.Description,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   ptrTime(t.UpdatedAt),
	}
}

func (h *Handler) GetTasks(c echo.Context) error {
	userID := getUserID(c)
	projectID, err := projectIDFromQuery(c)
	if err != nil {
		return err
	}

	skip, limit := paginationParams(c)

	tasks, err := h.taskRepo.GetByProjectAndUser(c.Request().Context(), projectID, userID, limit, skip)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	response := make([]dto.TaskResponse, len(tasks))
	for i, t := range tasks {
		response[i] = taskToResponse(t)
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) CreateTask(c echo.Context) error {
	userID := getUserID(c)
	projectID, err := projectIDFromQuery(c)
	if err != nil {
		return err
	}

	if err := h.projectRepo.CheckOwnership(c.Request().Context(), projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Project not found"))
	}

	var req dto.CreateTaskRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errorResponse(err))
	}

	reqMap := map[string]interface{}{
		"project_id": projectID,
		"category":   req.Category,
		"title":      req.Title,
		"status":     constants.StatusTodo,
		"priority":   constants.PriorityMedium,
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
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.JSON(http.StatusCreated, taskToResponse(*task))
}

func (h *Handler) GetTask(c echo.Context) error {
	userID := getUserID(c)
	taskID := c.Param("id")
	projectID := c.QueryParam("project_id")

	task, err := h.taskRepo.GetByIDAndUser(c.Request().Context(), taskID, projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if task == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Task not found"))
	}

	return c.JSON(http.StatusOK, taskToResponse(*task))
}

func (h *Handler) UpdateTask(c echo.Context) error {
	userID := getUserID(c)
	taskID := c.Param("id")
	projectID := c.QueryParam("project_id")

	if err := h.projectRepo.CheckOwnership(c.Request().Context(), projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Project not found"))
	}

	var req dto.UpdateTaskRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errorResponse(err))
	}

	updates := map[string]interface{}{}
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
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if task == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Task not found"))
	}

	return c.JSON(http.StatusOK, taskToResponse(*task))
}

func (h *Handler) DeleteTask(c echo.Context) error {
	userID := getUserID(c)
	taskID := c.Param("id")
	projectID := c.QueryParam("project_id")

	task, err := h.taskRepo.GetByIDAndUser(c.Request().Context(), taskID, projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if task == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Task not found"))
	}

	err = h.taskRepo.Delete(c.Request().Context(), taskID, projectID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.NoContent(http.StatusNoContent)
}
