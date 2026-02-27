package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/vemakin/backend/internal/auth"
)

type AuthMiddleware struct {
	firebaseAuth *auth.FirebaseAuth
}

func NewAuthMiddleware(firebaseAuth *auth.FirebaseAuth) *AuthMiddleware {
	return &AuthMiddleware{firebaseAuth: firebaseAuth}
}

func (m *AuthMiddleware) Authenticate() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			tokenData, err := m.verifyToken(c)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
			}

			if !tokenData.EmailVerified {
				return echo.NewHTTPError(http.StatusForbidden, "email not verified")
			}

			c.Set("userID", tokenData.UID)
			c.Set("userEmail", tokenData.Email)
			c.Set("userName", tokenData.Name)
			c.Set("userEmailVerified", tokenData.EmailVerified)

			return next(c)
		}
	}
}

func (m *AuthMiddleware) OptionalAuth() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				c.Set("userID", "")
				return next(c)
			}

			tokenData, err := m.verifyToken(c)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
			}

			c.Set("userID", tokenData.UID)
			c.Set("userEmail", tokenData.Email)
			c.Set("userName", tokenData.Name)
			c.Set("userEmailVerified", tokenData.EmailVerified)

			return next(c)
		}
	}
}

func (m *AuthMiddleware) verifyToken(c echo.Context) (*auth.CachedToken, error) {
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "Missing authorization header")
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "Invalid authorization header format")
	}

	token := parts[1]
	tokenData, err := m.firebaseAuth.VerifyIDToken(c.Request().Context(), token)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired token")
	}

	return tokenData, nil
}
