package middleware

import (
	"time"

	"github.com/labstack/echo/v4"
)

// CacheHeadersMiddleware adds appropriate cache headers based on route
func CacheHeadersMiddleware() echo.MiddlewareFunc {
	cacheDurations := map[string]int{
		"/catalog":   3600, // 1 hour
		"/projects":  60,   // 1 minute
		"/shots":     30,   // 30 seconds
		"/notes":     30,   // 30 seconds
		"/postprod":  30,   // 30 seconds
		"/inventory": 60,   // 1 minute
	}

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			err := next(c)
			if err != nil {
				return err
			}

			// Only cache GET requests
			if c.Request().Method != "GET" {
				c.Response().Header().Set("Cache-Control", "no-store")
				return nil
			}

			path := c.Path()
			maxAge := 0

			for routePrefix, duration := range cacheDurations {
				if len(path) >= len(routePrefix) && path[:len(routePrefix)] == routePrefix {
					maxAge = duration
					break
				}
			}

			if maxAge > 0 {
				c.Response().Header().Set("Cache-Control", "private, max-age="+string(rune('0'+maxAge)))
				c.Response().Header().Set("Vary", "Authorization")
			} else {
				c.Response().Header().Set("Cache-Control", "no-store")
			}

			return nil
		}
	}
}

// TimingMiddleware logs request duration
func TimingMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()
			err := next(c)
			duration := time.Since(start)

			// Add timing header
			c.Response().Header().Set("X-Request-Time", duration.String())

			// Log slow requests
			if duration > time.Second {
				c.Logger().Warnf("Slow request: %s %s took %v", c.Request().Method, c.Request().URL.Path, duration)
			}

			return err
		}
	}
}
