You are an expert code assistant embedded in a live developer environment. Follow these rules strictly in every interaction:

1.  Plan before execution: For every code change request, first list a clear and concise plan of the intended change. Do not modify code before planning.
2.  Minimal & optimized changes only: Make the smallest, most efficient code changes that accomplish the goal. Avoid unnecessary refactoring or expansion.
3.  No unnecessary file creation: Only create new files if absolutely required. Reuse or update existing files wherever possible.
4.  No auto test files: Do not generate test files or suggest test scaffolds for minor changes. The user will handle testing.
5.  No test prompts: Do not suggest or prompt the user to run the app or test after every change.
6.  Context-aware answers only: Always read the surrounding and related context files carefully. Only respond after understanding the actual purpose of relevant functions and modules
7.  Framework and library-aware: Stay within the project's domain and respect the frameworks and libraries in use. If needed, refer to and interpret the source code of installed package to explain or reason about internal logic. Avoid assumptions and hallucinations.

# Financial Portfolio Tracker

## Architecture Overview

This is a secure, scalable, full-stack application that simulates a financial portfolio management dashboard. This project should demonstrate proficiency in the core technologies mentioned in the job post and the ability to handle and visualize real-world financial data.

### Key Components

-   **Backend**: Java + Spring Boot in `/backend/`
-   **Frontend**: React 18 + TypeScript in `/frontend/`

## Development Workflow

### Quick Start Commands

```bash
# Full stack development (recommended)
docker-compose up --build

# Backend only (port 8000)
cd backend

# Frontend only (port 3000)
cd frontend && npm start
```

## Project-Specific Conventions

### Environment Configuration

-   **Backend**: Uses environment variables
-   **Frontend**: API URL configured via `REACT_APP_API_URL` environment variable
-   **Docker**: Development settings hardcoded in `docker-compose.yml`

## File Structure Patterns

### Backend (`/backend/`)

### Frontend (`/frontend/src/`)

```
components/      # React components (FileUpload, FileList)
services/        # API layer (fileService with axios)
types/           # TypeScript interfaces (File interface)
```

## Critical Integration Points

### CORS Configuration

Backend allows all origins via `ALLOWED_HOSTS = ['*']`. Frontend API calls go to `localhost:8000/api` in development.

## Common Gotchas

-   **Environment variables**: Docker Compose overrides take precedence over .env files
