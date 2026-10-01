# AITS — Production Deployment & Operations Manual

This document provides end-to-end guidance for deploying, maintaining, and scaling the **Applications Issue Tracking System (AITS)** in production environments.

---

## 1. Quick Start: Single-Host Production via Docker Compose

The fastest and most resilient way to run AITS in production is using Docker Compose. It provisions an isolated network containing:
- **PostgreSQL 16** with automated health checks & persistent data volumes.
- **AITS Backend API** with multi-stage build, non-root execution (`USER node`), signal forwarding (`dumb-init`), and automatic database health probes.
- **AITS Frontend (Nginx)** with SPA client-side routing fallback, Gzip compression, immutable asset caching, security headers, and built-in reverse proxy for `/api/` and `/uploads/`.

### Deployment Steps

1. **Clone the repository on your production server:**
   ```bash
   git clone <repo-url> /opt/aits
   cd /opt/aits
   ```

2. **Configure your production environment file:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `JWT_SECRET`: A secure 32+ character random string (`openssl rand -base64 32`)
   - `POSTGRES_PASSWORD`: A strong PostgreSQL database password
   - `CORS_ORIGIN`: Your production domains (e.g., `https://aits.yourcompany.com`)
   - `GEMINI_API_KEY`: (Optional) Your Google AI key if enabling AI Triage and Analysis

3. **Deploy the stack:**
   ```bash
   docker compose up -d --build
   ```

4. **Run database migrations and initial seed (first-time deployment only):**
   ```bash
   # Run Prisma migrations non-interactively
   docker compose exec backend npx prisma migrate deploy --schema=database/prisma/schema.prisma

   # Seed default administrative and operational roles (idempotent)
   docker compose exec backend npx prisma db seed
   ```

5. **Verify Stack Health:**
   ```bash
   docker compose ps
   curl http://localhost:5000/api/v1/health
   curl http://localhost:5000/api/v1/health/live
   curl http://localhost:5000/api/v1/health/ready
   curl http://localhost:5173/healthz
   ```

---

## 2. Default Administrative Access

When the database seed is executed, the following baseline accounts are provisioned:

| Role | Email | Default Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@system.local` | `Password123!` |
| **Project Manager** | `pm@system.local` | `Password123!` |
| **Lead Developer** | `dev@system.local` | `Password123!` |
| **QA / Reporter** | `reporter@system.local` | `Password123!` |

> **Production Security Note**: Immediately log in as `admin@system.local`, change passwords, or create new administrator credentials and deactivate default test accounts.

---

## 3. Cloud Split Deployment (Vercel + Render / Railway + Managed Postgres)

For scalable, serverless, or microservice deployments:

### Backend (Render / Railway / AWS ECS / Fly.io)
- **Root Directory**: `backend` (or monorepo root)
- **Build Command**: `npm ci && npm run build --workspace=shared && npm run db:generate --workspace=database && npm run build --workspace=backend`
- **Start Command**: `npm run start --workspace=backend`
- **Required Environment Variables**:
  - `NODE_ENV=production`
  - `PORT=5000` (or assigned by platform)
  - `HOST=0.0.0.0`
  - `DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname>?sslmode=require`
  - `JWT_SECRET=<32+ char secret>`
  - `CORS_ORIGIN=https://your-frontend.vercel.app`

### Frontend (Vercel / Netlify / Cloudflare Pages)
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api/v1`

---

## 4. Reverse Proxy & SSL/TLS Configuration (Host Nginx + Certbot)

When hosting behind an external domain name with HTTPS:

```nginx
# /etc/nginx/sites-available/aits.yourdomain.com
server {
    server_name aits.yourdomain.com;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:5173; # Frontend container
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Issue SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d aits.yourdomain.com
```

---

## 5. Health Checks & Observability Endpoints

| Endpoint | Method | Purpose | Normal Response |
| :--- | :--- | :--- | :--- |
| `/api/v1/health` | `GET` | Overall System & DB Connectivity | `{"success":true,"data":{"status":"UP"}}` |
| `/api/v1/health/live` | `GET` | Process Liveness (Kubernetes probe) | `{"success":true,"data":{"status":"ALIVE"}}` |
| `/api/v1/health/ready` | `GET` | Dependency Readiness probe | `{"success":true,"data":{"status":"READY"}}` |
| `/api/v1/operations/metrics` | `GET` | Observability & Latency Metrics | Detailed operational metrics |
| `/healthz` | `GET` | Frontend Nginx Liveness | `200 OK` |

---

## 6. Backup & Restore Procedures

### Database Backup
```bash
docker compose exec postgres pg_dump -U postgres -d app_issue_track -F c -b -v -f /tmp/backup.dump
docker cp app_issue_track_postgres:/tmp/backup.dump ./backups/
```

### Database Restore
```bash
docker cp ./backups/backup.dump app_issue_track_postgres:/tmp/restore.dump
docker compose exec postgres pg_restore -U postgres -d app_issue_track -c -v /tmp/restore.dump
```

### Uploads Backup
```bash
tar -czvf uploads_backup.tar.gz ./uploads/
```
