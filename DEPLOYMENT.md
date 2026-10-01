# AITS — Production Deployment & Operations Manual

This document provides end-to-end guidance for deploying, maintaining, and scaling the **Applications Issue Tracking System (AITS)** in production environments.

- **GitHub Repository**: [https://github.com/VIGNESH79899/App_Issue_Tracking_System.git](https://github.com/VIGNESH79899/App_Issue_Tracking_System.git)

---

## Deployment Options at a Glance

| Deployment Path | Best For | Complexity | Cost |
| :--- | :--- | :--- | :--- |
| **Option A: Render Blueprint** | 1-Click Cloud Deployment (Backend + Frontend + Managed Postgres) | Easiest | Free tier available |
| **Option B: Vercel + Render / Supabase** | High-performance CDN for Frontend + Cloud Backend & DB | Easy | Free tier available |
| **Option C: Docker Compose on VPS** | Dedicated Ubuntu Server (AWS, DigitalOcean, Hetzner, Linode) | Intermediate | $5-$10/mo VPS |

---

## Option A: 1-Click Cloud Deployment via Render Blueprint

This repository includes a pre-configured `render.yaml` specification that provisions:
1. **Managed PostgreSQL Database**
2. **Node.js Web Service** (`aits-backend`) with automatic Prisma migrations on deploy
3. **Static Web Site** (`aits-frontend`) with SPA rewrites

### Steps:
1. Log in to [Render.com](https://render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository: `VIGNESH79899/App_Issue_Tracking_System`.
4. Render will parse `render.yaml` and display the 3 services (`aits-postgres`, `aits-backend`, `aits-frontend`).
5. Click **Apply**.
6. Once deployed:
   - Copy the URL of your backend (e.g., `https://aits-backend.onrender.com`).
   - Go to your `aits-frontend` settings -> Environment Variables.
   - Set `VITE_API_BASE_URL` to `https://aits-backend.onrender.com/api/v1` and trigger a manual redeploy.
7. Open the frontend URL in your browser!

---

## Option B: Vercel (Frontend) + Render / Neon (Backend & Database)

### 1. Database (Neon or Supabase)
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Copy the pooled connection string (`DATABASE_URL`).

### 2. Backend (Render Web Service)
1. On [Render](https://render.com), click **New +** -> **Web Service**.
2. Connect `VIGNESH79899/App_Issue_Tracking_System`.
3. Set the following build and run settings:
   - **Root Directory**: leave empty
   - **Build Command**: `npm ci && npm run build:backend`
   - **Start Command**: `npm run db:deploy && npm start`
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `HOST`: `0.0.0.0`
   - `DATABASE_URL`: *(your Neon/Supabase connection string with `?sslmode=require`)*
   - `JWT_SECRET`: *(32+ character random string)*
   - `CORS_ORIGIN`: `*` *(or your Vercel frontend URL once deployed)*
5. Click **Deploy Web Service**.

### 3. Frontend (Vercel)
1. On [Vercel](https://vercel.com), click **Add New...** -> **Project**.
2. Import `VIGNESH79899/App_Issue_Tracking_System`.
3. Vercel automatically detects the included `vercel.json`:
   - **Build Command**: `npm run build:frontend`
   - **Output Directory**: `frontend/dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://<your-render-backend-name>.onrender.com/api/v1`
5. Click **Deploy**.

---

## Option C: Self-Hosted Production via Docker Compose (VPS / Server)

### 1. Clone & Setup
```bash
git clone https://github.com/VIGNESH79899/App_Issue_Tracking_System.git /opt/aits
cd /opt/aits
cp .env.example .env
```

### 2. Configure `.env`
Edit `/opt/aits/.env`:
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `POSTGRES_PASSWORD`: Choose a strong password
- `CORS_ORIGIN`: Your domain (e.g., `https://aits.yourdomain.com`)

### 3. Launch Containers
```bash
docker compose up -d --build
```

### 4. Run Migrations & Initial Seed
```bash
# Run Prisma migrations
docker compose exec backend npx prisma migrate deploy --schema=database/prisma/schema.prisma

# Seed default initial users and sample data
docker compose exec backend npx prisma db seed
```

### 5. Verify Health
```bash
docker compose ps
curl http://localhost:5000/api/v1/health/live
curl http://localhost:5173/healthz
```

---

## Default Administrative Credentials

Upon database seed, the following baseline user accounts are provisioned:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@system.local` | `Password123!` |
| **Project Manager** | `pm@system.local` | `Password123!` |
| **Lead Developer** | `dev@system.local` | `Password123!` |
| **QA / Reporter** | `reporter@system.local` | `Password123!` |

> 🔒 **Security Note**: Log in immediately as `admin@system.local`, navigate to **Users** or **Profile**, and update default passwords.

---

## Environment Variables Reference

| Variable | Required | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Runtime mode |
| `PORT` | No | `5000` | HTTP port for backend |
| `HOST` | No | `0.0.0.0` | Bind host address |
| `DATABASE_URL` | Yes | - | PostgreSQL connection URL |
| `JWT_SECRET` | Yes | - | Secret for signing JWTs (min 16 chars) |
| `JWT_EXPIRES_IN` | No | `1d` | Auth token expiry duration |
| `CORS_ORIGIN` | Yes | `*` | Allowed client origins (comma-separated) |
| `UPLOAD_DIR` | No | `uploads` | Local upload directory |
| `MAX_FILE_SIZE_MB` | No | `10` | Max file upload size in MB |
| `AI_ENABLED` | No | `false` | Enable/disable Google Gemini AI Triage |
| `GEMINI_API_KEY` | If AI enabled | - | Google Gemini AI API key |
| `VITE_API_BASE_URL` | Frontend | `/api/v1` | URL of the backend API |
