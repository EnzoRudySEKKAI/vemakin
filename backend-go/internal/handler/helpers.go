package handler

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/dto"
)

func ptrTime(t sql.NullTime) *time.Time {
	if !t.Valid {
		return nil
	}
	return &t.Time
}

func ptrString(s sql.NullString) *string {
	if !s.Valid {
		return nil
	}
	return &s.String
}

func paginationParams(c echo.Context) (skip, limit int) {
	skip, _ = strconv.Atoi(c.QueryParam("skip"))
	limit, _ = strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 100
	}
	return skip, limit
}

func projectIDFromQuery(c echo.Context) (string, error) {
	id := c.QueryParam("project_id")
	if id == "" {
		return "", c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "project_id is required"})
	}
	return id, nil
}

func errorResponse(err error) dto.ErrorResponse {
	return dto.ErrorResponse{Error: err.Error()}
}

func notFoundResponse(msg string) dto.ErrorResponse {
	return dto.ErrorResponse{Error: msg}
}

func getUserID(c echo.Context) string {
	return c.Get("userID").(string)
}
