package handler

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/dto"
	"github.com/vemakin/backend/internal/models"
)

func (h *Handler) GetInitialData(c echo.Context) error {
	userID := getUserID(c)
	projectID := c.QueryParam("project_id")
	ctx := c.Request().Context()

	type result struct {
		projects  []models.Project
		equipment []models.Equipment
		err       error
	}

	projectChan := make(chan result, 1)
	equipmentChan := make(chan result, 1)

	go func() {
		projects, err := h.projectRepo.GetByUser(ctx, userID, 100, 0)
		projectChan <- result{projects: projects, err: err}
	}()

	go func() {
		equipment, err := h.equipmentRepo.GetByUser(ctx, userID, 100, 0)
		equipmentChan <- result{equipment: equipment, err: err}
	}()

	pr := <-projectChan
	if pr.err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(pr.err))
	}

	er := <-equipmentChan
	if er.err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(er.err))
	}

	projectResponses := make([]dto.ProjectResponse, len(pr.projects))
	for i, p := range pr.projects {
		projectResponses[i] = projectToResponse(p)
	}

	catalogItemIDs := make([]string, 0, len(er.equipment))
	for _, e := range er.equipment {
		if e.CatalogItemID != nil && *e.CatalogItemID != "" {
			catalogItemIDs = append(catalogItemIDs, *e.CatalogItemID)
		}
	}

	specsMap := map[string]map[string]interface{}{}
	if len(catalogItemIDs) > 0 {
		var err error
		specsMap, err = h.equipmentRepo.GetSpecsBatch(ctx, catalogItemIDs)
		if err != nil {
			log.Printf("Warning: Failed to fetch specs batch: %v", err)
		}
	}

	equipmentResponses := make([]dto.EquipmentResponse, len(er.equipment))
	for i, e := range er.equipment {
		specs := specsMap[*e.CatalogItemID]
		equipmentResponses[i] = equipmentToResponse(e, specs)
	}

	response := dto.InitialDataResponse{
		Projects:  projectResponses,
		Inventory: equipmentResponses,
	}

	if projectID != "" {
		shots, err := h.shotRepo.GetByProjectAndUser(ctx, projectID, userID, 100, 0)
		if err != nil {
			log.Printf("Warning: Failed to fetch shots: %v", err)
		}
		shotResponses := make([]dto.ShotResponse, len(shots))
		for i, s := range shots {
			shotResponses[i] = shotToResponse(s)
		}
		response.Shots = shotResponses

		notes, err := h.noteRepo.GetByProjectAndUser(ctx, projectID, userID, 100, 0)
		if err != nil {
			log.Printf("Warning: Failed to fetch notes: %v", err)
		}
		noteResponses := make([]dto.NoteResponse, len(notes))
		for i, n := range notes {
			noteResponses[i] = noteToResponse(n)
		}
		response.Notes = noteResponses

		tasks, err := h.taskRepo.GetByProjectAndUser(ctx, projectID, userID, 100, 0)
		if err != nil {
			log.Printf("Warning: Failed to fetch tasks: %v", err)
		}
		taskResponses := make([]dto.TaskResponse, len(tasks))
		for i, t := range tasks {
			taskResponses[i] = taskToResponse(t)
		}
		response.Tasks = taskResponses
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) GetProjectData(c echo.Context) error {
	userID := getUserID(c)
	projectID := c.Param("id")
	ctx := c.Request().Context()

	if err := h.projectRepo.CheckOwnership(ctx, projectID, userID); err != nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Project not found"))
	}

	type result struct {
		data interface{}
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
		return c.JSON(http.StatusInternalServerError, errorResponse(shotsResult.err))
	}

	notesResult := <-notesChan
	if notesResult.err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(notesResult.err))
	}

	tasksResult := <-tasksChan
	if tasksResult.err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(tasksResult.err))
	}

	shots := shotsResult.data.([]models.Shot)
	notes := notesResult.data.([]models.Note)
	tasks := tasksResult.data.([]models.PostProdTask)

	shotResponses := make([]dto.ShotResponse, len(shots))
	for i, s := range shots {
		shotResponses[i] = shotToResponse(s)
	}

	noteResponses := make([]dto.NoteResponse, len(notes))
	for i, n := range notes {
		noteResponses[i] = noteToResponse(n)
	}

	taskResponses := make([]dto.TaskResponse, len(tasks))
	for i, t := range tasks {
		taskResponses[i] = taskToResponse(t)
	}

	return c.JSON(http.StatusOK, dto.ProjectDataResponse{
		Shots: shotResponses,
		Notes: noteResponses,
		Tasks: taskResponses,
	})
}
