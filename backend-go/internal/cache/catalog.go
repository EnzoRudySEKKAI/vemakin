package cache

import (
	"context"
	"encoding/json"
	"os"
	"sync"
	"time"

	"github.com/vemakin/backend/internal/models"
	"github.com/vemakin/backend/internal/repository"
)

type CatalogCache struct {
	mu         sync.RWMutex
	data       *CacheData
	filePath   string
	lastUpdate time.Time
	loaded     bool
}

type CacheData struct {
	Categories       []models.Category                 `json:"categories"`
	BrandsByCategory map[string][]models.Brand         `json:"brandsByCategory"`
	ItemsByID        map[string]models.GearCatalog     `json:"itemsByID"`
	SpecsByGearID    map[string]map[string]interface{} `json:"specsByGearID"`
}

func NewCatalogCache(filePath string) *CatalogCache {
	return &CatalogCache{
		filePath: filePath,
		data:     &CacheData{},
	}
}

func (c *CatalogCache) Load() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Try to load from JSON file
	if data, err := os.ReadFile(c.filePath); err == nil {
		var cacheData CacheData
		if err := json.Unmarshal(data, &cacheData); err == nil {
			c.data = &cacheData
			c.loaded = true
			return nil
		}
	}

	return c.loadFromDB()
}

func (c *CatalogCache) loadFromDB() error {
	// This will be called during startup to warm the cache
	// Implementation depends on having db access
	c.loaded = true
	return nil
}

func (c *CatalogCache) WarmFromDB(repo *repository.CatalogRepository) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	ctx := context.Background()

	// Load categories
	categories, err := repo.GetCategories(ctx)
	if err != nil {
		return err
	}
	c.data.Categories = categories

	// Load brands by category
	brandsByCategory := make(map[string][]models.Brand)
	for _, cat := range categories {
		brands, _ := repo.GetBrands(ctx, &cat.ID)
		brandsByCategory[cat.ID] = brands
	}
	c.data.BrandsByCategory = brandsByCategory

	// Load items
	items, err := repo.GetItems(ctx, nil, nil)
	if err != nil {
		return err
	}
	itemsByID := make(map[string]models.GearCatalog)
	for _, item := range items {
		itemsByID[item.ID] = item
	}
	c.data.ItemsByID = itemsByID

	// Load specs
	specsByGearID := make(map[string]map[string]interface{})
	// Note: In production, you'd load all specs in bulk
	c.data.SpecsByGearID = specsByGearID

	c.lastUpdate = time.Now()
	c.loaded = true

	// Save to JSON
	return c.saveToJSON()
}

func (c *CatalogCache) saveToJSON() error {
	// Ensure directory exists
	dir := c.filePath[:len(c.filePath)-len("/catalog_cache.json")]
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(c.data, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(c.filePath, data, 0644)
}

func (c *CatalogCache) IsLoaded() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.loaded
}

func (c *CatalogCache) GetCategories() []models.Category {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.data.Categories
}

func (c *CatalogCache) GetBrands(categoryID *string) []models.Brand {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if categoryID != nil {
		return c.data.BrandsByCategory[*categoryID]
	}

	// Return all unique brands
	seen := make(map[string]bool)
	var allBrands []models.Brand
	for _, brands := range c.data.BrandsByCategory {
		for _, brand := range brands {
			if !seen[brand.ID] {
				seen[brand.ID] = true
				allBrands = append(allBrands, brand)
			}
		}
	}
	return allBrands
}

func (c *CatalogCache) GetItems(categoryID, brandID *string) []models.GearCatalog {
	c.mu.RLock()
	defer c.mu.RUnlock()

	var items []models.GearCatalog
	for _, item := range c.data.ItemsByID {
		if categoryID != nil && item.CategoryID != *categoryID {
			continue
		}
		if brandID != nil && item.BrandID != *brandID {
			continue
		}
		items = append(items, item)
	}
	return items
}

func (c *CatalogCache) GetItem(itemID string) *models.GearCatalog {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, ok := c.data.ItemsByID[itemID]
	if !ok {
		return nil
	}
	return &item
}

func (c *CatalogCache) GetSpecs(itemID string) map[string]interface{} {
	c.mu.RLock()
	defer c.mu.RUnlock()

	return c.data.SpecsByGearID[itemID]
}

func (c *CatalogCache) GetStats() map[string]interface{} {
	c.mu.RLock()
	defer c.mu.RUnlock()

	return map[string]interface{}{
		"is_loaded":        c.loaded,
		"last_updated":     c.lastUpdate,
		"categories_count": len(c.data.Categories),
		"brands_count":     len(c.data.BrandsByCategory),
		"items_count":      len(c.data.ItemsByID),
		"specs_count":      len(c.data.SpecsByGearID),
	}
}
