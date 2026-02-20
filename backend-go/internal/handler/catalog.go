package handler

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/dto"
	"github.com/vemakin/backend/internal/models"
)

func categoryToResponse(c models.Category) dto.CategoryResponse {
	return dto.CategoryResponse{
		ID:   c.ID,
		Name: c.Name,
		Slug: c.Slug,
	}
}

func brandToResponse(b models.Brand) dto.BrandResponse {
	return dto.BrandResponse{
		ID:   b.ID,
		Name: b.Name,
	}
}

func (h *Handler) GetCategories(c echo.Context) error {
	if h.catalogCache.IsLoaded() {
		categories := h.catalogCache.GetCategories()
		if len(categories) > 0 {
			c.Response().Header().Set("Cache-Control", "public, max-age=3600")
			response := make([]dto.CategoryResponse, len(categories))
			for i, cat := range categories {
				response[i] = categoryToResponse(cat)
			}
			return c.JSON(http.StatusOK, response)
		}
	}

	categories, err := h.catalogRepo.GetCategories(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	response := make([]dto.CategoryResponse, len(categories))
	for i, cat := range categories {
		response[i] = categoryToResponse(cat)
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) GetBrands(c echo.Context) error {
	categoryID := c.QueryParam("category_id")
	var catID *string
	if categoryID != "" {
		catID = &categoryID
	}

	if h.catalogCache.IsLoaded() {
		brands := h.catalogCache.GetBrands(catID)
		response := make([]dto.BrandResponse, len(brands))
		for i, brand := range brands {
			response[i] = brandToResponse(brand)
		}
		c.Response().Header().Set("Cache-Control", "public, max-age=3600")
		return c.JSON(http.StatusOK, response)
	}

	brands, err := h.catalogRepo.GetBrands(c.Request().Context(), catID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	response := make([]dto.BrandResponse, len(brands))
	for i, brand := range brands {
		response[i] = brandToResponse(brand)
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

	if h.catalogCache.IsLoaded() {
		items := h.catalogCache.GetItems(catID, brID)
		response := make([]dto.GearCatalogResponse, len(items))
		for i, item := range items {
			specs := h.catalogCache.GetSpecs(item.ID)
			response[i] = dto.GearCatalogResponse{
				ID:          item.ID,
				BrandID:     item.BrandID,
				CategoryID:  item.CategoryID,
				Name:        item.Name,
				Description: item.Description,
				ImageURL:    item.ImageURL,
				Specs:       specs,
				CreatedAt:   item.CreatedAt,
			}
		}
		c.Response().Header().Set("Cache-Control", "public, max-age=3600")
		return c.JSON(http.StatusOK, response)
	}

	items, err := h.catalogRepo.GetItems(c.Request().Context(), catID, brID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	response := make([]dto.GearCatalogResponse, len(items))
	for i, item := range items {
		response[i] = dto.GearCatalogResponse{
			ID:         item.ID,
			BrandID:    item.BrandID,
			CategoryID: item.CategoryID,
			Name:       item.Name,
		}
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) GetItem(c echo.Context) error {
	itemID := c.Param("id")

	// Try cache first
	if h.catalogCache.IsLoaded() {
		item := h.catalogCache.GetItem(itemID)
		if item != nil {
			// Add cache headers for browser caching
			c.Response().Header().Set("Cache-Control", "public, max-age=3600")
			c.Response().Header().Set("ETag", itemID)

			specs := h.catalogCache.GetSpecs(itemID)
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
	}

	// Fallback to database
	item, err := h.catalogRepo.GetItemByID(c.Request().Context(), itemID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if item == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Item not found"))
	}

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

	// Try cache first
	if h.catalogCache.IsLoaded() {
		specs := h.catalogCache.GetSpecs(itemID)
		if specs != nil {
			c.Response().Header().Set("Cache-Control", "public, max-age=3600")
			c.Response().Header().Set("ETag", itemID)
			return c.JSON(http.StatusOK, specs)
		}
	}

	specs, err := h.catalogRepo.GetSpecs(c.Request().Context(), itemID, "")
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.JSON(http.StatusOK, specs)
}

func (h *Handler) GetCatalogHealth(c echo.Context) error {
	return c.JSON(http.StatusOK, h.catalogCache.GetStats())
}

func (h *Handler) RefreshCatalogCache(c echo.Context) error {
	log.Println("[ADMIN] Manual catalog cache refresh requested")

	if err := h.catalogCache.WarmFromDB(h.catalogRepo); err != nil {
		log.Printf("[ADMIN] Failed to refresh catalog cache: %v", err)
		return c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to refresh cache: " + err.Error()})
	}

	log.Println("[ADMIN] Catalog cache refresh completed successfully")
	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Catalog cache refreshed successfully",
		"stats":   h.catalogCache.GetStats(),
	})
}
