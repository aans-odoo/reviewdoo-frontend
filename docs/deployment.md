# Production Deployment

## Prerequisites

- **Node.js** 18+ runtime
- **PostgreSQL** 14+ with the [pgvector](https://github.com/pgvector/pgvector) extension
- **SMTP server** for sending invitation emails
- AI provider API keys (Gemini and/or OpenRouter) — configured per-user via the UI

## Build

```bash
# Install dependencies
npm install

# Build backend
npm run backend:build

# Build frontend
npm run frontend:build
```

The backend compiles to `backend/dist/`. The frontend builds to `frontend/dist/`.

## Environment Configuration

Create `backend/.env` with production values:

```env
# Database
DATABASE_URL="postgresql://user:password@db-host:5432/reviewdoo?schema=public"

# Security — use strong random values
JWT_SECRET="<random-string-min-32-chars>"
ENCRYPTION_KEY="<64-hex-chars>"

# Server
PORT=3000
CORS_ORIGINS="https://your-domain.com"

# External tool access
API_KEY="<strong-random-api-key>"

# Webhook verification (optional)
WEBHOOK_SECRET="<webhook-secret>"
```

Generate secure values:

```bash
# JWT secret
openssl rand -base64 48

# Encryption key (64 hex chars = 32 bytes)
openssl rand -hex 32

# API key
openssl rand -base64 32
```

## Database Setup

```bash
cd backend

# Apply migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed initial data (optional — creates admin user)
npm run prisma:seed
```

The seed script creates a default admin user (`admin@example.com` / `admin123`). Change the password immediately after first login.

## Running

### Backend

```bash
cd backend
node dist/server.js
```

The backend serves the REST API on the configured port (default: 3000).

### Frontend

Serve the `frontend/dist/` directory with any static file server. Configure it to route all paths to `index.html` for client-side routing.

**Nginx example:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker (example)

```dockerfile
# Backend
FROM node:18-alpine AS backend
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --production
COPY backend/dist ./dist
COPY backend/prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

```dockerfile
# Frontend
FROM nginx:alpine
COPY frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## Webhook Configuration

### GitHub

1. Go to your repository → Settings → Webhooks → Add webhook
2. Set Payload URL to `https://your-domain.com/api/v1/webhooks/github`
3. Set Content type to `application/json`
4. Set Secret to the same value as `WEBHOOK_SECRET` in your `.env`
5. Select "Issue comments" and "Pull request review comments" events

### GitLab

1. Go to your project → Settings → Webhooks
2. Set URL to `https://your-domain.com/api/v1/webhooks/gitlab`
3. Set Secret token to the same value as `WEBHOOK_SECRET` in your `.env`
4. Select "Note events" trigger

## Post-Deployment Checklist

1. Verify the database connection and migrations are applied
2. Log in with the seeded admin account and change the password
3. Configure SMTP settings via the admin UI
4. Invite team members
5. Each user configures their AI model API keys via the AI Model Config page
6. Add authors to start ingesting PR comments
7. Configure webhooks on your source control platform for real-time ingestion

## Monitoring

- Check `GET /api/v1/ingestion-logs` for ingestion job status and errors
- Monitor application logs for AI provider errors and webhook processing failures
- The backend logs to stdout — pipe to your preferred log aggregation service

## Backup

Back up the PostgreSQL database regularly. The database contains all checklist items, guidelines, embeddings, user accounts, and ingestion history.

```bash
pg_dump -h db-host -U user reviewdoo > backup.sql
```
