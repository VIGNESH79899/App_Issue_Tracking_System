# Applications Issue Tracking System

An enterprise-grade, web-based issue tracking platform that enables software engineering teams to report, triage, assign, track, and resolve application defects and feature requests across their software project lifecycle.

## Tech Stack Architecture

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v7
- **State & Data Fetching**: TanStack React Query v5
- **HTTP Client**: Axios
- **Form Validation**: React Hook Form + Zod
- **UI Components & Icons**: Lucide React + Recharts

### Backend
- **Runtime**: Node.js + Express.js + TypeScript
- **ORM**: Prisma ORM
- **Database**: PostgreSQL 16
- **Authentication**: JWT + bcrypt
- **Input Validation**: Zod
- **Security**: Helmet, CORS

### Shared & DevOps
- **Shared Contracts**: `@app-issue-track/shared` (DTOs, Enums, Zod Schemas)
- **Containerization**: Docker & Docker Compose
- **Testing**: Vitest + React Testing Library + Playwright

---

## Workspace Directory Structure

```
app-issue-track/
├── /shared       # Shared DTOs, Enums, Status Lifecycle, and Zod schemas
├── /database     # Prisma schema, migrations, and database seed script
├── /backend      # Express REST API service with clean layered architecture
├── /frontend     # Vite + React single page application
├── /docs         # Architecture & API contract documentation
└── /tests        # E2E test suite configuration
```

---

## Environment Variables Configuration

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Default local environment values:
```env
NODE_ENV=development
PORT=5000
HOST=localhost
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_issue_track?schema=public"
JWT_SECRET=super-secret-jwt-key-replace-in-production-minimum-32-chars
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## Getting Started & Commands

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Docker & Docker Compose (for PostgreSQL)

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local PostgreSQL Database
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Generate Prisma Client & Seed Database
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Build Shared Contracts & Application Packages
```bash
npm run build
```

### 5. Start Development Servers
```bash
npm run dev
```

The application will be accessible at:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/v1`
- **Health Endpoint**: `http://localhost:5000/api/v1/health`

---

## Initial Default Credentials (Seeded)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@system.local` | `Password123!` |
| Project Manager | `pm@system.local` | `Password123!` |
| Developer | `dev@system.local` | `Password123!` |
| Reporter | `reporter@system.local` | `Password123!` |
