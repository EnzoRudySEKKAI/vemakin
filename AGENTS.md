# Vemakin - Agent Development Guide

## Project Overview

Vemakin is a Production OS for filmmaking and media production management. The project consists of:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Go with Echo framework + PostgreSQL
- **Auth**: Firebase Authentication
- **Mobile**: Capacitor (iOS/Electron)

## Project Structure

```
/front          # React frontend application
  /api          # API client and services
  /components   # React components
  /hooks        # Custom React hooks
  /routes       # Route components
  /stores       # Zustand state stores
  /utils        # Utility functions
  /types.ts     # TypeScript type definitions

/backend-go     # Go backend API
  /cmd/api      # Application entry point
  /internal     # Internal packages
    /handler    # HTTP handlers
    /repository # Database layer
    /models     # Data models
    /dto        # Data transfer objects
    /middleware # HTTP middleware
    /auth       # Firebase authentication
    /config     # Configuration
    /cache      # In-memory caching

/doc            # Project documentation
```

## Commands

### Frontend

```bash
# Install dependencies
npm install

# Development (port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Capacitor commands
npm run cap:sync    # Sync with native platforms
npm run cap:ios     # Open iOS in Xcode
npm run cap:electron # Open in Electron
```

### Backend

```bash
# Build the Go application
cd backend-go
go build -o api ./cmd/api/

# Run the backend (port 8080 by default)
./api

# Run with custom port
PORT=8080 ./api
```

### Development Environment (Full Stack)

```bash
# Start Cloud SQL proxy, backend, and frontend
./start-dev.sh
```

This script:
1. Starts Cloud SQL proxy on port 5432
2. Builds and runs the Go backend on port 8080
3. Starts the frontend on port 3000 with API URL configured

## Code Style

### Frontend (TypeScript/React)

**Imports**
- Use absolute imports with `@/` prefix (configured in tsconfig.json)
- Order imports: external libs → internal modules → local components/hooks
- Use named exports for better tree-shaking

```typescript
// Good
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'
import { Card } from '@/components/ui/Card'
import { Shot, Equipment } from '@/types'

// Avoid
import * as API from '../api/index'
```

**Types**
- Use explicit return types for functions used across modules
- Use `interface` for public API types, `type` for unions/utilities
- All API responses are transformed from snake_case to camelCase via `humps`

**Naming**
- Components: PascalCase (e.g., `OverviewView`, `ShotCard`)
- Hooks: camelCase with `use` prefix (e.g., `useApi`, `useHeaderSetup`)
- Variables/functions: camelCase
- Constants: SCREAMING_SNAKE_CASE for config values, camelCase for others
- Files: camelCase for utilities, PascalCase for components

**Component Patterns**
- Use functional components with TypeScript
- Use `React.FC<Props>` for typed component definition
- Define component props using interfaces
- Use displayName for debugging: `Component.displayName = 'Component'`
- Memoize expensive computations with `useMemo`
- Use early returns for cleaner conditional rendering

**State Management**
- Use Zustand for global state (see `/stores`)
- Use React Query for server state
- Keep component-local state with `useState`

**Styling**
- Use Tailwind CSS utility classes
- Use dark mode classes: `dark:bg-[#16181D]`, `dark:text-white/80`
- Use design tokens from `design-system.ts`
- Use `clsx` and `tailwind-merge` for conditional classes

**Error Handling**
- Use try/catch with async/await
- Return meaningful error messages to users
- Handle API errors in interceptors (see `api/client.ts`)

### Backend (Go)

**Package Structure**
- Main entry: `cmd/api/main.go`
- Handlers: `internal/handler/`
- Repositories: `internal/repository/`
- Models: `internal/models/`
- DTOs: `internal/dto/`

**Error Handling**
- Return JSON errors with appropriate HTTP status codes
- Use helper functions: `errorResponse()`, `notFoundResponse()`

```go
// Return error
return c.JSON(http.StatusInternalServerError, errorResponse(err))

// Return not found
return c.JSON(http.StatusNotFound, notFoundResponse("Project not found"))
```

**Database**
- Use `sqlx` for database operations
- Use migrations in `/migrations` folder
- PostgreSQL via Cloud SQL proxy

**Authentication**
- Firebase JWT validation via middleware
- User ID extracted from context: `getUserID(c)`

**Naming**
- Functions: PascalCase (exported), camelCase (internal)
- Variables: camelCase
- Constants: PascalCase or camelCase
- Files: snake_case.go

## API Conventions

### Request/Response
- Frontend sends camelCase, backend expects snake_case
- Response transformation handled by axios interceptors
- All endpoints require Firebase JWT token (except public routes)

### Routes Structure
```
/                       # Health check
/health                 # Health check
/users/me               # Current user
/projects               # CRUD
/shots                  # CRUD
/notes                  # CRUD
/postprod               # Tasks CRUD
/inventory              # Equipment CRUD
/catalog/*              # Read-only gear catalog
/admin/*                # Admin endpoints
/bulk/*                 # Bulk data endpoints
```

## Testing

Currently, there are no test files in the project. When adding tests:
- Frontend: Use Vitest or similar
- Backend: Use Go's testing package

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080
```

### Backend (.env)
```
DATABASE_URL=...
PORT=8080
FIREBASE_PROJECT_ID=...
GOOGLE_APPLICATION_CREDENTIALS=...
CACHE_REFRESH_HOUR=0
```

## Important Notes

- The frontend uses `humps` library to convert between camelCase (JS) and snake_case (API)
- All private routes require valid Firebase JWT token
- The backend uses in-memory caching for catalog data (BigCache)
- Cron job refreshes catalog cache daily at configured hour

## Agent Workflow

### Branching Strategy

When making code changes, **always create a new branch** and use pull requests. Never commit directly to `main`.

**Starting a new task:**
```bash
# 1. CRITICAL: Always pull latest main first
# This ensures your branch is created from the most recent code
git checkout main
git pull origin main

# 2. Create a descriptive feature branch from updated main
git checkout -b feature/descriptive-name

# Example: git checkout -b feature/add-user-authentication
# Example: git checkout -b fix/resolve-login-error
```

⚠️ **IMPORTANT:** Always run `git pull origin main` before creating a new branch. This prevents merge conflicts and ensures you're working with the latest codebase.

**Making changes:**
```bash
# Make your changes, then commit
git add <files>
git commit -m "type: descriptive message"

# Push the branch to remote
git push -u origin feature/descriptive-name
```

**When user says "finished":**
1. Ensure all changes are committed
2. Push the branch to GitHub
3. Create a pull request (do NOT merge directly to main)
4. Provide the PR URL to the user

```bash
# Example workflow when finished:
git push origin feature/descriptive-name
# Then create PR via GitHub CLI or API
gh pr create --title "Title" --body "Description" --base main
```

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring
- `docs:` - Documentation changes
- `ci:` - CI/CD changes
- `chore:` - Maintenance tasks
