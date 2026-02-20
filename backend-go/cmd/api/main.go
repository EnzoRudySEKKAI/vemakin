package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"
	"github.com/robfig/cron/v3"
	"github.com/vemakin/backend/internal/auth"
	"github.com/vemakin/backend/internal/cache"
	"github.com/vemakin/backend/internal/config"
	"github.com/vemakin/backend/internal/handler"
	"github.com/vemakin/backend/internal/middleware"
	"github.com/vemakin/backend/internal/repository"
)

func main() {
	cfg := config.Load()

	db, err := repository.NewDB(cfg.GetDSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	projectRepo := repository.NewProjectRepository(db.DB)
	shotRepo := repository.NewShotRepository(db.DB)
	equipmentRepo := repository.NewEquipmentRepository(db.DB)
	noteRepo := repository.NewNoteRepository(db.DB)
	taskRepo := repository.NewTaskRepository(db.DB)
	catalogRepo := repository.NewCatalogRepository(db.DB)
	userRepo := repository.NewUserRepository(db.DB)

	catalogCache := cache.NewCatalogCache(cfg.CacheFile)
	if err := catalogCache.Load(); err != nil {
		log.Printf("Warning: Failed to load catalog cache: %v", err)
	}

	// Warm up cache from database on startup
	log.Println("Warming up catalog cache from database...")
	if err := catalogCache.WarmFromDB(catalogRepo); err != nil {
		log.Printf("Warning: Failed to warm up catalog cache: %v", err)
	} else {
		log.Println("Catalog cache warmed up successfully")
	}

	firebaseAuth, err := auth.NewFirebaseAuth(cfg.GoogleApplicationCredentials, cfg.FirebaseProjectID)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase: %v", err)
	}
	defer firebaseAuth.Close()

	h := handler.NewHandler(
		db,
		projectRepo,
		shotRepo,
		equipmentRepo,
		noteRepo,
		taskRepo,
		catalogRepo,
		userRepo,
		catalogCache,
	)

	authMiddleware := middleware.NewAuthMiddleware(firebaseAuth)

	e := echo.New()
	e.HideBanner = true
	e.HidePort = true

	e.Use(echomiddleware.Recover())
	e.Use(echomiddleware.RequestLoggerWithConfig(echomiddleware.RequestLoggerConfig{
		LogStatus: true,
		LogURI:    true,
		LogValuesFunc: func(c echo.Context, v echomiddleware.RequestLoggerValues) error {
			log.Printf("REQUEST: uri=%s status=%d latency=%v", v.URI, v.Status, v.Latency)
			return nil
		},
	}))

	e.Use(echomiddleware.CORSWithConfig(echomiddleware.CORSConfig{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"http://localhost:3002",
			"http://127.0.0.1:3002",
			"http://localhost:5173",
			"http://127.0.0.1:5173",
			"https://vemakin.web.app",
			"https://vemakin.firebaseapp.com",
			"https://*.vemakin.web.app",
			"https://*.vemakin.firebaseapp.com",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}))

	c := cron.New()
	_, err = c.AddFunc(fmt.Sprintf("0 %d * * *", cfg.CacheRefreshHour), func() {
		log.Println("[SCHEDULER] Starting daily catalog cache refresh...")
		if err := catalogCache.WarmFromDB(catalogRepo); err != nil {
			log.Printf("[SCHEDULER] Failed to refresh catalog cache: %v", err)
		} else {
			log.Println("[SCHEDULER] Catalog cache refresh completed")
		}
	})
	if err != nil {
		log.Printf("Warning: Failed to schedule cache refresh: %v", err)
	}
	c.Start()

	routes(e, h, authMiddleware)

	go func() {
		addr := fmt.Sprintf(":%s", cfg.Port)
		if err := e.Start(addr); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Println("Shutting down server...")
	if err := e.Shutdown(ctx); err != nil {
		log.Fatal(err)
	}

	c.Stop()
	log.Println("Server stopped")
}

func routes(e *echo.Echo, h *handler.Handler, authMiddleware *middleware.AuthMiddleware) {
	// Public routes (no auth required)
	e.GET("/", h.Root)
	e.GET("/health", h.Health)

	// API routes (all under /api prefix)
	api := e.Group("/api")

	// Protected API routes require authentication
	protected := api.Group("")
	protected.Use(authMiddleware.Authenticate())

	protected.GET("/users/me", h.GetMe)
	protected.GET("/users/profile", h.GetUser)
	protected.PATCH("/users/profile", h.UpdateUser)

	protected.GET("/projects", h.GetProjects)
	protected.POST("/projects", h.CreateProject)
	protected.GET("/projects/:id", h.GetProject)
	protected.PATCH("/projects/:id", h.UpdateProject)
	protected.DELETE("/projects/:id", h.DeleteProject)

	protected.GET("/shots", h.GetShots)
	protected.POST("/shots", h.CreateShot)
	protected.GET("/shots/:id", h.GetShot)
	protected.PATCH("/shots/:id", h.UpdateShot)
	protected.DELETE("/shots/:id", h.DeleteShot)

	protected.GET("/notes", h.GetNotes)
	protected.POST("/notes", h.CreateNote)
	protected.GET("/notes/:id", h.GetNote)
	protected.PATCH("/notes/:id", h.UpdateNote)
	protected.DELETE("/notes/:id", h.DeleteNote)

	protected.GET("/postprod", h.GetTasks)
	protected.POST("/postprod", h.CreateTask)
	protected.GET("/postprod/:id", h.GetTask)
	protected.PATCH("/postprod/:id", h.UpdateTask)
	protected.DELETE("/postprod/:id", h.DeleteTask)

	protected.GET("/inventory", h.GetInventory)
	protected.POST("/inventory", h.CreateEquipment)
	protected.GET("/inventory/:id", h.GetEquipment)
	protected.PATCH("/inventory/:id", h.UpdateEquipment)
	protected.DELETE("/inventory/:id", h.DeleteEquipment)

	protected.GET("/catalog/categories", h.GetCategories)
	protected.GET("/catalog/brands", h.GetBrands)
	protected.GET("/catalog/items", h.GetItems)
	protected.GET("/catalog/items/:id", h.GetItem)
	protected.GET("/catalog/items/:id/specs", h.GetItemSpecs)
	protected.GET("/catalog/health", h.GetCatalogHealth)

	protected.POST("/admin/catalog/refresh", h.RefreshCatalogCache)

	protected.GET("/bulk/initial", h.GetInitialData)
	protected.GET("/bulk/project/:id", h.GetProjectData)
}
