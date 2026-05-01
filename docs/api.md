# API Documentation

Base URL: `/api/v1`

All responses use JSON. Errors follow a standardized format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "description is required",
    "details": null
  },
  "status": 400
}
```

## Authentication

The API uses two authentication methods:

- **JWT (session)** — For frontend and user-facing endpoints. Include the token in the `Authorization` header: `Authorization: Bearer <jwt_token>`
- **API Key** — For external tool access (Retrieval API). Include in the `Authorization` header: `Authorization: Bearer <api_key>`

---

## Auth

### POST /auth/login

Log in with email and password.

**Auth:** None

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**Errors:** 401 (invalid credentials), 403 (inactive account)

### POST /auth/logout

Invalidate the current session.

**Auth:** JWT

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### POST /auth/setup

Set password via invite token and activate account.

**Auth:** None

**Request:**
```json
{
  "inviteToken": "abc123-invite-token",
  "password": "newSecurePassword"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "New User",
    "role": "member"
  }
}
```

**Errors:** 400 (invalid/expired token)

### GET /auth/me

Get current authenticated user info.

**Auth:** JWT

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

---

## Users (Admin Only)

All user endpoints require JWT authentication with admin role.

### GET /users

List all users.

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /users

Create a new user and send invitation email.

**Request:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "member"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "member",
    "isActive": false
  }
}
```

**Errors:** 409 (email already exists), 400 (SMTP not configured)

### PUT /users/:id

Update user role or active status.

**Request:**
```json
{
  "role": "admin",
  "isActive": true
}
```

**Response (200):**
```json
{
  "user": { "id": "uuid", "email": "user@example.com", "role": "admin", "isActive": true }
}
```

### POST /users/:id/reinvite

Resend invitation email with a new invite token.

**Response (200):**
```json
{
  "message": "Invitation re-sent successfully"
}
```

---

## SMTP Configuration (Admin Only)

### GET /smtp-config

Get current SMTP configuration. Password is masked.

**Response (200):**
```json
{
  "config": {
    "id": "uuid",
    "host": "smtp.example.com",
    "port": 587,
    "username": "smtp-user",
    "passwordSet": true,
    "fromEmail": "noreply@example.com",
    "fromName": "Reviewdoo"
  }
}
```

### PUT /smtp-config

Create or update SMTP configuration.

**Request:**
```json
{
  "host": "smtp.example.com",
  "port": 587,
  "username": "smtp-user",
  "password": "smtp-password",
  "fromEmail": "noreply@example.com",
  "fromName": "Reviewdoo"
}
```

**Response (200):** Same as GET (password masked).

### POST /smtp-config/test

Send a test email to verify SMTP configuration.

**Request:**
```json
{
  "recipientEmail": "test@example.com"
}
```

**Response (200):**
```json
{
  "message": "Test email sent successfully"
}
```

---

## AI Model Configuration

Scoped to the authenticated user. Each user manages their own API keys.

### GET /ai-model-configs

List current user's AI model configurations.

**Auth:** JWT

**Response (200):**
```json
{
  "configs": [
    {
      "id": "uuid",
      "providerName": "gemini",
      "modelId": "text-embedding-004",
      "keySet": true,
      "usageType": "embedding",
      "isActive": true,
      "userId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /ai-model-configs

Create a new AI model configuration.

**Request:**
```json
{
  "providerName": "gemini",
  "modelId": "text-embedding-004",
  "apiKey": "AIzaSy...",
  "usageType": "embedding"
}
```

**Response (201):** Config object (API key masked as `keySet: true`).

**Errors:** 409 (active config already exists for this usage type)

### PUT /ai-model-configs/:id

Update an AI model configuration. Only configs owned by the current user can be updated.

**Request:**
```json
{
  "modelId": "gemini-1.5-flash",
  "usageType": "processing",
  "isActive": true
}
```

**Response (200):** Updated config object.

### DELETE /ai-model-configs/:id

Delete an AI model configuration.

**Response (200):**
```json
{
  "message": "AI model configuration deleted successfully"
}
```

---

## Authors

### GET /authors

**Auth:** JWT

**Response (200):**
```json
{
  "authors": [
    {
      "id": "uuid",
      "username": "senior-dev",
      "platform": "github",
      "displayName": null,
      "commentCount": 42,
      "lastIngested": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /authors

Create an author and trigger historical comment ingestion.

**Auth:** JWT

**Request:**
```json
{
  "username": "senior-dev",
  "platform": "github"
}
```

**Response (201):**
```json
{
  "author": {
    "id": "uuid",
    "username": "senior-dev",
    "platform": "github",
    "commentCount": 0
  }
}
```

**Errors:** 409 (username+platform already exists)

### DELETE /authors/:id

**Auth:** JWT

**Response (200):**
```json
{
  "message": "Author deleted successfully"
}
```

---

## Checklist Items

### GET /checklist-items

List items with pagination, filtering, and text search.

**Auth:** JWT

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Items per page (default: 20) |
| `language` | string | Filter by language |
| `category` | string | Filter by category (security, performance, readability, architecture, testing, error_handling, accessibility, other) |
| `severity` | string | Filter by severity (critical, major, minor, suggestion) |
| `fileType` | string | Filter by file pattern |
| `source` | string | Filter by source (ingested, manual) |
| `search` | string | Text search in description |

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "description": "Always validate user input before database queries",
      "severity": "critical",
      "category": "security",
      "languages": ["typescript", "javascript"],
      "filePatterns": ["*.ts", "*.js"],
      "source": "ingested",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### GET /checklist-items/:id

**Auth:** JWT

**Response (200):**
```json
{
  "item": {
    "id": "uuid",
    "description": "Always validate user input before database queries",
    "severity": "critical",
    "category": "security",
    "languages": ["typescript"],
    "filePatterns": ["*.ts"],
    "source": "ingested",
    "references": [
      {
        "id": "uuid",
        "url": "https://github.com/org/repo/pull/123#comment-456",
        "description": "Original review comment",
        "contributorUser": "senior-dev",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdBy": { "id": "uuid", "name": "Admin User" },
    "updatedBy": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /checklist-items

Create a checklist item manually.

**Auth:** JWT

**Request:**
```json
{
  "description": "Use parameterized queries to prevent SQL injection",
  "severity": "critical",
  "category": "security",
  "languages": ["typescript", "javascript"],
  "filePatterns": ["*.ts", "*.js"],
  "references": [
    {
      "url": "https://owasp.org/sql-injection",
      "description": "OWASP SQL Injection Guide"
    }
  ]
}
```

**Response (201):** Created item object.

### PUT /checklist-items/:id

Update a checklist item. Recomputes embedding if description changes.

**Auth:** JWT

**Request:**
```json
{
  "description": "Updated description",
  "severity": "major"
}
```

**Response (200):** Updated item object.

### DELETE /checklist-items/:id

Delete item and all associated references and embeddings.

**Auth:** JWT

**Response (200):**
```json
{
  "message": "Checklist item deleted successfully"
}
```

### POST /checklist-items/:id/references

Add a reference to an existing checklist item.

**Auth:** JWT

**Request:**
```json
{
  "url": "https://github.com/org/repo/pull/456#comment-789",
  "description": "Another related review comment",
  "contributorUser": "reviewer-name"
}
```

**Response (201):** Created reference object.

### DELETE /checklist-items/:id/references/:refId

Remove a reference from a checklist item.

**Auth:** JWT

**Response (200):**
```json
{
  "message": "Reference removed successfully"
}
```

### POST /checklist-items/semantic-search

Search checklist items by semantic similarity. Requires an active embedding AI model config.

**Auth:** JWT

**Request:**
```json
{
  "query": "SQL injection prevention",
  "limit": 10
}
```

**Response (200):**
```json
{
  "results": [
    {
      "id": "uuid",
      "description": "Use parameterized queries...",
      "severity": "critical",
      "category": "security",
      "similarityScore": 0.92
    }
  ]
}
```

---

## Guideline Sets

### GET /guideline-sets

**Auth:** JWT

**Response (200):**
```json
{
  "sets": [
    {
      "id": "uuid",
      "name": "JavaScript",
      "description": "JavaScript coding standards",
      "guidelines": [
        {
          "id": "uuid",
          "title": "Use strict equality",
          "description": "Always use === instead of ==",
          "severity": "major"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /guideline-sets

**Auth:** JWT

**Request:**
```json
{
  "name": "TypeScript",
  "description": "TypeScript coding standards"
}
```

**Response (201):** Created set object.

**Errors:** 409 (name already exists)

### PUT /guideline-sets/:id

**Auth:** JWT

**Request:**
```json
{
  "name": "TypeScript Standards",
  "description": "Updated description"
}
```

**Response (200):** Updated set object.

### DELETE /guideline-sets/:id

Delete set and all contained guidelines and embeddings.

**Auth:** JWT

**Response (200):**
```json
{
  "message": "Guideline set deleted successfully"
}
```

### POST /guideline-sets/:id/guidelines

Add a guideline to a set.

**Auth:** JWT

**Request:**
```json
{
  "title": "Prefer interfaces over type aliases",
  "description": "Use interfaces for object shapes as they support declaration merging",
  "severity": "suggestion"
}
```

**Response (201):** Created guideline object.

---

## Guidelines

### PUT /guidelines/:id

**Auth:** JWT

**Request:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "severity": "minor"
}
```

**Response (200):** Updated guideline object.

### DELETE /guidelines/:id

**Auth:** JWT

**Response (200):**
```json
{
  "message": "Guideline deleted successfully"
}
```

### POST /guidelines/semantic-search

**Auth:** JWT

**Request:**
```json
{
  "query": "error handling best practices",
  "limit": 5
}
```

**Response (200):**
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "Always catch async errors",
      "description": "Wrap async operations in try-catch...",
      "severity": "major",
      "similarityScore": 0.88
    }
  ]
}
```

---

## Ingestion Logs

### GET /ingestion-logs

**Auth:** JWT

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `pageSize` | number | Items per page |
| `status` | string | Filter by status (pending, running, completed, failed, paused) |
| `authorId` | string | Filter by author ID |

**Response (200):**
```json
{
  "logs": [
    {
      "id": "uuid",
      "status": "completed",
      "source": "webhook:github",
      "platform": "github",
      "commentsTotal": 150,
      "commentsFetched": 150,
      "errorDetails": null,
      "startedAt": "2024-01-01T00:00:00.000Z",
      "completedAt": "2024-01-01T00:05:00.000Z",
      "author": {
        "id": "uuid",
        "username": "senior-dev"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

### GET /ingestion-logs/:id

**Auth:** JWT

**Response (200):**
```json
{
  "log": {
    "id": "uuid",
    "status": "completed",
    "source": "historical",
    "platform": "github",
    "commentsTotal": 150,
    "commentsFetched": 150,
    "errorDetails": null,
    "startedAt": "2024-01-01T00:00:00.000Z",
    "completedAt": "2024-01-01T00:05:00.000Z"
  }
}
```

---

## Webhooks

### POST /webhooks/:platform

Receive PR comment events from source control platforms.

**Auth:** Webhook signature verification (GitHub: `X-Hub-Signature-256`, GitLab: `X-Gitlab-Token`)

**Supported platforms:** `github`, `gitlab`

The endpoint acknowledges immediately with 200 and processes the comment asynchronously.

**Response (200):**
```json
{
  "received": true,
  "logId": "uuid"
}
```

**Errors:** 401 (invalid signature), 400 (invalid payload)

---

## Retrieval API

### POST /retrieval

Retrieve relevant checklist items and guidelines for a PR context. Designed for consumption by AI coding IDEs.

**Auth:** API Key

**Request:**
```json
{
  "diff": "--- a/src/auth.ts\n+++ b/src/auth.ts\n@@ -10,6 +10,8 @@...",
  "files": ["src/auth.ts", "src/middleware/validate.ts"],
  "language": "typescript",
  "repository": "org/repo",
  "maxResults": 20,
  "tokenBudget": 4000
}
```

**Response (200):**
```json
{
  "checklistItems": [
    {
      "id": "uuid",
      "description": "Validate all user input before database queries",
      "severity": "critical",
      "category": "security",
      "languages": ["typescript"],
      "filePatterns": ["*.ts"],
      "source": "ingested",
      "referenceCount": 3,
      "similarityScore": 0.94
    }
  ],
  "guidelines": [
    {
      "id": "uuid",
      "title": "Use parameterized queries",
      "description": "Always use parameterized queries...",
      "severity": "critical",
      "guidelineSetName": "Security",
      "similarityScore": 0.91
    }
  ],
  "metadata": {
    "totalCandidates": 150,
    "returnedCount": 15,
    "tokenCount": 3800,
    "modelUsed": "text-embedding-004"
  }
}
```

**Errors:** 400 (empty diff and files), 503 (no embedding config available)

---

## Prompt Generator

### POST /prompt-generator

Generate a structured review prompt for AI coding IDEs.

**Auth:** JWT

**Request:**
```json
{
  "prNumber": "123",
  "branchName": "feature/auth-refactor",
  "repository": "org/repo",
  "files": ["src/auth.ts"],
  "tokenBudget": 4000
}
```

**Response (200):**
```json
{
  "prompt": "## Code Review Checklist\n\nBased on your team's review knowledge...\n\n### Critical\n- Validate all user input...\n\n### Guidelines\n- Use parameterized queries...",
  "metadata": {
    "checklistItemCount": 12,
    "guidelineCount": 5,
    "tokenCount": 3500,
    "truncated": false
  }
}
```

**Errors:** 400 (missing prNumber and branchName)
