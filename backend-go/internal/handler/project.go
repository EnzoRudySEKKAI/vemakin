package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/dto"
	"github.com/vemakin/backend/internal/models"
)

func projectToResponse(p models.Project) dto.ProjectResponse {
	return dto.ProjectResponse{
		ID:        p.ID,
		Name:      p.Name,
		UserID:    p.UserID,
		CreatedAt: p.CreatedAt,
		UpdatedAt: ptrTime(p.UpdatedAt),
	}
}

func (h *Handler) GetProjects(c echo.Context) error {
	userID := getUserID(c)
	skip, limit := paginationParams(c)

	projects, err := h.projectRepo.GetByUser(c.Request().Context(), userID, limit, skip)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	response := make([]dto.ProjectResponse, len(projects))
	for i, p := range projects {
		response[i] = projectToResponse(p)
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) CreateProject(c echo.Context) error {
	userID := getUserID(c)

	var req dto.CreateProjectRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errorResponse(err))
	}

	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, notFoundResponse("name is required"))
	}

	project, err := h.projectRepo.Create(c.Request().Context(), userID, req.Name)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.JSON(http.StatusCreated, projectToResponse(*project))
}

func (h *Handler) GetProject(c echo.Context) error {
	userID := getUserID(c)
	projectID := c.Param("id")

	project, err := h.projectRepo.GetByID(c.Request().Context(), projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if project == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Project not found"))
	}

	return c.JSON(http.StatusOK, projectToResponse(*project))
}

func (h *Handler) UpdateProject(c echo.Context) error {
	userID := getUserID(c)
	projectID := c.Param("id")

	var req dto.UpdateProjectRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errorResponse(err))
	}

	if req.Name == nil || *req.Name == "" {
		return c.JSON(http.StatusBadRequest, notFoundResponse("name is required"))
	}

	project, err := h.projectRepo.Update(c.Request().Context(), projectID, userID, *req.Name)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if project == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Project not found"))
	}

	return c.JSON(http.StatusOK, projectToResponse(*project))
}

func (h *Handler) DeleteProject(c echo.Context) error {
	userID := getUserID(c)
	projectID := c.Param("id")

	err := h.projectRepo.Delete(c.Request().Context(), projectID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.NoContent(http.StatusNoContent)
}
