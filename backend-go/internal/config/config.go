package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                         string
	Environment                  string
	LogLevel                     string
	DBHost                       string
	DBPort                       string
	DBUser                       string
	DBPass                       string
	DBName                       string
	DatabaseURL                  string
	FirebaseProjectID            string
	GoogleApplicationCredentials string
	CacheFile                    string
	CacheRefreshHour             int
}

func Load() *Config {
	envFiles := []string{
		".env",
		"./.env",
		"../.env",
		"backend-go/.env",
	}

	for _, envFile := range envFiles {
		if _, err := os.Stat(envFile); err == nil {
			if err := godotenv.Load(envFile); err == nil {
				log.Printf("Loaded .env from: %s", envFile)
				break
			}
		}
	}

	log.Printf("DATABASE_URL from env: %s", getEnv("DATABASE_URL", "not set"))

	return &Config{
		Port:                         getEnv("PORT", "8080"),
		Environment:                  getEnv("ENV", "development"),
		LogLevel:                     getEnv("LOG_LEVEL", "info"),
		DBHost:                       getEnv("DB_HOST", "localhost"),
		DBPort:                       getEnv("DB_PORT", "5432"),
		DBUser:                       getEnv("DB_USER", "postgres"),
		DBPass:                       getEnv("DB_PASS", "postgres"),
		DBName:                       getEnv("DB_NAME", "vemakin"),
		DatabaseURL:                  getEnv("DATABASE_URL", ""),
		FirebaseProjectID:            getEnv("FIREBASE_PROJECT_ID", "vemakin"),
		GoogleApplicationCredentials: getEnv("GOOGLE_APPLICATION_CREDENTIALS", ""),
		CacheFile:                    getEnv("CATALOG_CACHE_FILE", "./data/catalog_cache.json"),
		CacheRefreshHour:             getEnvInt("CACHE_REFRESH_HOUR", 3),
	}
}

func (c *Config) GetDSN() string {
	if c.DatabaseURL != "" {
		return c.DatabaseURL
	}
	return "host=" + c.DBHost + " port=" + c.DBPort + " user=" + c.DBUser + " password=" + c.DBPass + " dbname=" + c.DBName + " sslmode=require"
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvDuration(key string, defaultValue time.Duration) time.Duration {
	if value, exists := os.LookupEnv(key); exists {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
