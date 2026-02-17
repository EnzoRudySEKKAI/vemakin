package handler

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/constants"
	"github.com/vemakin/backend/internal/dto"
	"github.com/vemakin/backend/internal/models"
)

func equipmentToResponse(e models.Equipment, specs map[string]interface{}) dto.EquipmentResponse {
	if specs == nil {
		specs = map[string]interface{}{}
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
		UpdatedAt:       ptrTime(e.UpdatedAt),
	}
}

func (h *Handler) GetInventory(c echo.Context) error {
	userID := getUserID(c)
	skip, limit := paginationParams(c)

	ctx := c.Request().Context()
	equipment, err := h.equipmentRepo.GetByUser(ctx, userID, limit, skip)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	catalogItemIDs := make([]string, 0, len(equipment))
	for _, e := range equipment {
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

	response := make([]dto.EquipmentResponse, len(equipment))
	for i, e := range equipment {
		var specs map[string]interface{}
		if e.CatalogItemID != nil {
			specs = specsMap[*e.CatalogItemID]
		}
		response[i] = equipmentToResponse(e, specs)
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) CreateEquipment(c echo.Context) error {
	userID := getUserID(c)

	var req dto.CreateEquipmentRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errorResponse(err))
	}

	reqMap := map[string]interface{}{
		"user_id":       userID,
		"name":          req.Name,
		"category":      req.Category,
		"price_per_day": req.PricePerDay,
		"quantity":      req.Quantity,
		"is_owned":      req.IsOwned,
		"status":        constants.StatusOperational,
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

	ctx := c.Request().Context()
	equipment, err := h.equipmentRepo.Create(ctx, reqMap)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	var specs map[string]interface{}
	if equipment.CatalogItemID != nil {
		specs, err = h.equipmentRepo.GetSpecsForCatalogItem(ctx, *equipment.CatalogItemID)
		if err != nil {
			log.Printf("Warning: Failed to fetch specs for catalog item %s: %v", *equipment.CatalogItemID, err)
		}
	}

	return c.JSON(http.StatusCreated, equipmentToResponse(*equipment, specs))
}

func (h *Handler) GetEquipment(c echo.Context) error {
	userID := getUserID(c)
	equipmentID := c.Param("id")

	ctx := c.Request().Context()
	equipment, err := h.equipmentRepo.GetByID(ctx, equipmentID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if equipment == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Equipment not found"))
	}

	var specs map[string]interface{}
	if equipment.CatalogItemID != nil {
		specs, err = h.equipmentRepo.GetSpecsForCatalogItem(ctx, *equipment.CatalogItemID)
		if err != nil {
			log.Printf("Warning: Failed to fetch specs for catalog item %s: %v", *equipment.CatalogItemID, err)
		}
	}

	return c.JSON(http.StatusOK, equipmentToResponse(*equipment, specs))
}

func (h *Handler) UpdateEquipment(c echo.Context) error {
	userID := getUserID(c)
	equipmentID := c.Param("id")

	var req dto.UpdateEquipmentRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, errorResponse(err))
	}

	updates := map[string]interface{}{}
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

	ctx := c.Request().Context()
	equipment, err := h.equipmentRepo.Update(ctx, equipmentID, userID, updates)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}
	if equipment == nil {
		return c.JSON(http.StatusNotFound, notFoundResponse("Equipment not found"))
	}

	var specs map[string]interface{}
	if equipment.CatalogItemID != nil {
		specs, err = h.equipmentRepo.GetSpecsForCatalogItem(ctx, *equipment.CatalogItemID)
		if err != nil {
			log.Printf("Warning: Failed to fetch specs for catalog item %s: %v", *equipment.CatalogItemID, err)
		}
	}

	return c.JSON(http.StatusOK, equipmentToResponse(*equipment, specs))
}

func (h *Handler) DeleteEquipment(c echo.Context) error {
	userID := getUserID(c)
	equipmentID := c.Param("id")

	err := h.equipmentRepo.Delete(c.Request().Context(), equipmentID, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	return c.NoContent(http.StatusNoContent)
}
