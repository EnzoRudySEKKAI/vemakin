package auth

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/allegro/bigcache"
	"github.com/rs/zerolog/log"
	"google.golang.org/api/option"
)

type FirebaseAuth struct {
	client   *auth.Client
	cache    *bigcache.BigCache
	cacheTTL time.Duration
	mu       sync.RWMutex
}

type CachedToken struct {
	UID     string `json:"uid"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Expires int64  `json:"expires"`
}

func NewFirebaseAuth(credentialsPath string, projectID string) (*FirebaseAuth, error) {
	ctx := context.Background()

	var app *firebase.App
	var err error

	config := &firebase.Config{
		ProjectID: projectID,
	}

	if credentialsPath != "" {
		opt := option.WithCredentialsFile(credentialsPath)
		app, err = firebase.NewApp(ctx, config, opt)
	} else {
		app, err = firebase.NewApp(ctx, config)
	}

	if err != nil {
		log.Error().Err(err).Msg("Failed to initialize Firebase app")
		return nil, err
	}

	client, err := app.Auth(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Failed to initialize Firebase Auth")
		return nil, err
	}

	cache, err := bigcache.NewBigCache(bigcache.DefaultConfig(5 * time.Minute))
	if err != nil {
		log.Warn().Err(err).Msg("Failed to initialize token cache, proceeding without cache")
		cache = nil
	}

	return &FirebaseAuth{
		client:   client,
		cache:    cache,
		cacheTTL: 5 * time.Minute,
	}, nil
}

func (f *FirebaseAuth) VerifyIDToken(ctx context.Context, tokenString string) (*CachedToken, error) {
	if f.cache != nil {
		if cached, err := f.cache.Get(tokenString); err == nil {
			var cachedToken CachedToken
			if json.Unmarshal(cached, &cachedToken) == nil {
				if cachedToken.Expires > time.Now().Unix() {
					return &cachedToken, nil
				}
			}
		}
	}

	token, err := f.client.VerifyIDToken(ctx, tokenString)
	if err != nil {
		return nil, err
	}

	uid := token.UID
	email, _ := token.Claims["email"].(string)
	name, _ := token.Claims["name"].(string)
	if name == "" && email != "" {
		name = email[:len(email)-len("@"+extractDomain(email))]
	}

	if email == "" || name == "" {
		userRecord, err := f.client.GetUser(ctx, uid)
		if err == nil {
			if email == "" {
				email = userRecord.Email
			}
			if name == "" {
				name = userRecord.DisplayName
				if name == "" && email != "" {
					name = email[:len(email)-len("@"+extractDomain(email))]
				}
			}
		}
	}

	cachedToken := &CachedToken{
		UID:     uid,
		Email:   email,
		Name:    name,
		Expires: time.Now().Add(f.cacheTTL).Unix(),
	}

	if f.cache != nil {
		if data, err := json.Marshal(cachedToken); err == nil {
			f.cache.Set(tokenString, data)
		}
	}

	return cachedToken, nil
}

func extractDomain(email string) string {
	parts := ""
	for i := len(email) - 1; i >= 0; i-- {
		if email[i] == '@' {
			parts = email[i+1:]
			break
		}
	}
	return parts
}

func (f *FirebaseAuth) Close() error {
	if f.cache != nil {
		return f.cache.Close()
	}
	return nil
}
