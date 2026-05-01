# Architecture Overview

## System Components

Reviewdoo is a full-stack TypeScript monorepo with four main components:

### Backend (Node.js + Express)

The REST API server handles all business logic, data processing, and external integrations.

**Layers:**

- **Routes** (`src/routes/`) — HTTP endpoint definitions with request validation. Routes are organized under `v1/` and aggregated in `routes/index.ts`, mounted at `/api/v1`.
- **Middleware** (`src/middleware/`) — Cross-cutting concerns: JWT authentication, role-based access control, API key authentication for external tools, request validation, and global error handling.
- **Services** (`src/services/`) — Core business logic. Each service handles a specific domain: auth, users, SMTP, authors, ingestion, processing pipeline, checklist items, guidelines, retrieval, prompt generation, and AI config.
- **Providers** (`src/providers/`) — AI model abstraction layer. A common `AIProvider` interface with implementations for Gemini and OpenRouter. New providers can be added by implementing the same interface.
- **Jobs** (`src/jobs/`) — Background processing. An in-memory job queue manages historical ingestion jobs with progress tracking and rate limit handling.
- **Utils** (`src/utils/`) — Shared utilities: AES-256-GCM encryption, JWT sign/verify, bcrypt password hashing, token counting, and custom error classes.
- **Types** (`src/types/`) — Shared TypeScript interfaces for API request/response shapes, domain models, and Express augmentation.

### Frontend (React + Vite)

A single-page application providing the management dashboard.

**Layers:**

- **Pages** (`src/pages/`) — Top-level route components, one per management screen.
- **Components** (`src/components/`) — Reusable UI: auth guards, layout (sidebar, header), shared primitives (data table, pagination, status badges, confirm dialog), and shadcn/ui base components.
- **Hooks** (`src/hooks/`) — React hooks for auth context and data fetching.
- **Lib** (`src/lib/`) — HTTP client with JWT attachment and utility functions.

### Database (PostgreSQL + pgvector)

A single PostgreSQL database handles both relational data and vector similarity search via the pgvector extension.

**Key models:**

| Model | Purpose |
|-------|---------|
| User | Accounts with role-based access (admin/member) |
| SmtpConfig | System-wide email delivery settings |
| Author | Tracked reviewers whose PR comments are ingested |
| ChecklistItem | Structured review insights with severity, category, languages, file patterns |
| Reference | Links to original PR comments or custom URLs, associated with checklist items |
| GuidelineSet | Named collections of coding guidelines |
| Guideline | Individual coding standards within a set |
| IngestionLog | Ingestion job tracking with status, progress, and error details |
| AIModelConfig | Per-user AI provider configurations (provider, model, encrypted API key, usage type) |
| Embedding | Vector representations of checklist items (1536 dimensions) |
| GuidelineEmbedding | Vector representations of guidelines (1536 dimensions) |

**Managed by Prisma ORM** with type-safe queries, migration management, and seed scripts.

### AI Provider Layer

AI interactions are abstracted behind a provider interface:

```
AIProvider interface
├── generateEmbedding(text) → number[]
└── extractInsight(comment) → ExtractedInsight
```

**Supported providers:**
- **Gemini** — Google's AI models for embedding and processing
- **OpenRouter** — Multi-model gateway supporting various AI models

Each user configures their own API keys and model selections per usage type (embedding vs. processing). This avoids shared rate limits.

## Data Flow

### Ingestion Pipeline

```
Source Control Platform
    │
    ├── Webhook (real-time) ──→ Signature verification ──→ Acknowledge (200)
    │                                                          │
    └── Historical scraping (background job) ─────────────────┘
                                                               │
                                                               ▼
                                                    Processing Pipeline
                                                    ┌─────────────────┐
                                                    │ 1. Normalize     │
                                                    │ 2. AI Extract    │
                                                    │ 3. AI Embed      │
                                                    │ 4. Deduplicate   │
                                                    │ 5. Persist       │
                                                    └────────┬────────┘
                                                             │
                                              ┌──────────────┴──────────────┐
                                              │                             │
                                        New item found              Duplicate found
                                              │                             │
                                    Create ChecklistItem          Add Reference to
                                    + Embedding + Reference       existing item
```

### Retrieval Pipeline

```
AI Coding IDE
    │
    POST /retrieval (diff + files + language)
    │
    ▼
Compute context embedding (user's embedding model)
    │
    ▼
Semantic similarity search (pgvector cosine distance)
    │
    ├── ChecklistItem embeddings
    └── Guideline embeddings
    │
    ▼
Apply filters (language, repository)
    │
    ▼
Rank by similarity score
    │
    ▼
Enforce token budget (truncate lower-ranked results)
    │
    ▼
Return ranked results with metadata
```

## Authentication and Authorization

- **JWT sessions** — Login returns a signed JWT token. All authenticated endpoints verify the token via middleware.
- **Role-based access** — Two roles: `admin` and `member`. Admin-only routes (user management, SMTP config) are protected by role middleware that returns 403 for non-admin users.
- **API key auth** — The Retrieval API uses a static API key for external tool access, separate from JWT auth.
- **Invite-only accounts** — No self-service signup. Admins create users, the system sends an invitation email with a token, and the user sets their password via the setup endpoint.

## Security

- **Encryption at rest** — AI provider API keys and SMTP passwords are encrypted with AES-256-GCM before storage. Plaintext keys are never returned in API responses.
- **Password hashing** — User passwords are hashed with bcrypt.
- **Webhook signature verification** — GitHub (HMAC-SHA256) and GitLab (token comparison) signatures are verified using timing-safe comparison.
- **CORS** — Configurable allowed origins via environment variable.
- **Input validation** — All endpoints validate request bodies before processing.

## Error Handling

Custom error classes map to standardized HTTP responses:

| Error Class | HTTP Status | Code |
|-------------|-------------|------|
| ValidationError | 400 | VALIDATION_ERROR |
| UnauthorizedError | 401 | UNAUTHORIZED |
| ForbiddenError | 403 | FORBIDDEN |
| NotFoundError | 404 | NOT_FOUND |
| ConflictError | 409 | CONFLICT |
| AIProviderError | 502 | AI_PROVIDER_ERROR |
| ServiceUnavailableError | 503 | SERVICE_UNAVAILABLE |

A global error handler middleware catches all errors and returns the standardized JSON format.
