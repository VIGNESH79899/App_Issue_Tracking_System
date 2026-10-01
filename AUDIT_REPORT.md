# AITS — Comprehensive Repository & Architecture Audit Report
**Date:** September 7, 2026  
**System:** Applications Issue Tracking System (AITS)  
**Author:** Senior Staff Systems & UX Engineering  

---

## 1. Repository Architecture

AITS is configured as a monolithic multi-package workspace managed via npm workspaces:

```
App_Issue_Track/
├── shared/           # @app-issue-track/shared (TypeScript types, DTOs, Enums, Zod validation schemas)
├── database/         # @app-issue-track/database (Prisma ORM schema, migrations, seed script)
├── backend/          # @app-issue-track/backend (Node.js + Express.js API, REST controllers, AI services)
├── frontend/         # @app-issue-track/frontend (React 19, TypeScript, Vite, Tailwind CSS)
├── tests/            # Root Playwright E2E configuration
└── docs/             # Architecture, schema, and API documentation
```

### Monorepo Workspaces & Tooling
- **Node.js**: v24.15.0 (Strict RFC 7230 HTTP header validation enforced)
- **TypeScript**: v5.7.3 across all workspaces
- **Build Tooling**: Vite v6.2.0 (frontend), `tsc` (backend/shared)
- **Package Manager**: npm v10 (monorepo workspaces enabled)
- **Database Engine**: PostgreSQL 16 (local instance active on port 5432)
- **Code Formatting**: Prettier 3.5.2

---

## 2. Frontend Architecture

- **Core Stack**: React 19.0.0, React Router DOM v7.2.0, Vite 6.2.0.
- **State & Data Fetching**: TanStack React Query v5.66.11 is configured at the root (`App.tsx`), but most pages currently bypass React Query and manually maintain state with `useState` and `useEffect`.
- **Styling**: Tailwind CSS v3.4.17 with custom brand colors (`#3b82f6` to `#1e3a8a`) and Inter typography.
- **Icons**: Lucide React v0.475.0.
- **Charts**: Recharts v2.15.1.
- **Form Management**: React Hook Form v7.54.2 with Zod resolvers.
- **HTTP Client**: Axios v1.8.1 configured via `frontend/src/services/apiClient.ts` with request interceptor (Bearer token injection) and response interceptor (`(response) => response.data`).
- **Bundle Analysis**: Current production build outputs a single JavaScript bundle of **1,127.48 kB** (299.97 kB gzip). Route code splitting is absent, resulting in all pages and charting libraries being loaded in the initial entry chunk.

---

## 3. Backend Architecture

- **Layered Flow**: Clean strict separation:
  $$\text{Route} \longrightarrow \text{Middleware} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Prisma} \longrightarrow \text{PostgreSQL}$$
- **Routing Engine**: Express 4.21.2 with modular routers aggregated in `backend/src/routes/index.ts` under `/api/v1/*`.
- **Error Handling**: Centralized `errorHandler.ts` catching `ApiError` instances, Prisma known request errors, Zod validation errors, and standard exceptions, generating uniform RFC-compliant JSON responses.
- **Observability**:
  - `metricsService.ts`: In-memory tracking of request counts, error rates, latencies (average & p95), rate-limit events, and database/AI failures.
  - `logger.ts`: Structured JSON logging with timestamp, level, request correlation ID (`X-Request-ID`), and execution latency.
  - `securityEvents.ts`: Security event buffer capturing auth failures, forbidden access, rate limits, and suspicious payloads.
  - `databaseHealth.ts`: Real-time query ping latency verification.

---

## 4. Database Architecture

- **Database Engine**: PostgreSQL 16
- **ORM**: Prisma Client v6.4.1
- **Schema Entities (`database/prisma/schema.prisma`)**:
  - `User`: Primary identity model supporting 4 canonical roles (`ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `REPORTER`).
  - `RefreshToken`: Secure persisted refresh tokens for session renewal.
  - `Application`: Top-level software enterprise product entities.
  - `Project`: Project workspaces scoped to applications with unique keys (e.g., `PAY`, `SDK`, `PORT`).
  - `ProjectMember`: Many-to-many relationship establishing project-level scoping and role assignments.
  - `Issue`: Central work item model with status (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `VERIFIED`, `CLOSED`, `REOPENED`), priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and severity (`COSMETIC` to `BLOCKER`).
  - `Comment`: Discussions with internal/external visibility flags.
  - `Attachment`: Uploaded asset metadata.
  - `IssueHistory`: Immutable audit trail for all state, assignment, priority, and severity changes.
  - `Notification`: User-targeted in-app notification records.
  - `Incident`: Enterprise operational incident records (`SEV1`-`SEV4`, `DETECTED` to `CLOSED`).
  - `IncidentTimeline`: Immutable event audit log of incident lifecycle transitions.
- **Indexes**: Optimal index coverage on `status`, `priority`, `severity`, `assigneeId`, `reporterId`, `applicationId`, `projectId`, and `createdAt`.

---

## 5. Authentication

- **Implementation**: JSON Web Tokens (JWT) using HMAC-SHA256 (`jsonwebtoken` v9.0.2).
- **Access Tokens**: Short/medium-lived (configured for 1 day in dev), passed via standard `Authorization: Bearer <token>` header.
- **Refresh Flow**: Dedicated `/auth/refresh` endpoint validating against the database `RefreshToken` table with revocation capability.
- **Security Check**: The `authenticateToken` middleware executes `prisma.user.findUnique` on each request to confirm the user exists and `isActive === true`. Deactivated accounts cannot perform any authenticated actions.
- **Storage**: Client stores `token` and `refreshToken` in browser `localStorage`.

---

## 6. Authorization

- **System-Level RBAC**: Enforced via `requireRole(...)` middleware across all routes:
  - `ADMIN`: Global administration, user management, system operations, all projects.
  - `PROJECT_MANAGER`: Application & project creation/editing, issue management, assignment, escalation.
  - `DEVELOPER`: Issue assignment, status workflow progression, technical comment creation.
  - `REPORTER`: Issue reporting, read access to authorized projects, comment submission.
- **Project-Level Scoping**: Enforced by `ProjectAccessService`:
  - `getAccessibleProjectIds`: Limits queries to projects where the user is an active member (unless user is `ADMIN`).
  - `canAccessIssue`: Validates that the requested issue belongs to a project the user is authorized to view.
  - `canManageProject`: Ensures only authorized project leads or admins can alter project memberships or delete projects.

---

## 7. AI Architecture

- **Provider**: Google Gemini (`@google/genai` v2.20.0).
- **Security & Architectural Isolation**:
  - AI engine has **zero direct access** to PostgreSQL.
  - Controllers gather verified database facts via standard services, sanitize the payload into structured prompts, and invoke Gemini.
  - Model responses are parsed and validated strictly against Zod schemas (`issueContextBuilder.ts`, `triageSchemas.ts`, `postIncidentAnalysisService.ts`).
  - All AI outputs are strictly **advisory**. AI recommendations (suggested priority, severity, component, duplicate candidates) require explicit user review and go through standard authenticated REST endpoints.
- **Fault Tolerance**: When Gemini is unavailable, disabled, or network requests fail, fallback advisory structures are returned. The primary issue tracking application continues to operate without degradation.

---

## 8. API Architecture

- **Endpoints Standard**: Uniform `/api/v1/` prefix across 19 route modules.
- **Response Format Envelope**:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional message",
    "timestamp": "2026-09-07T13:31:02.717Z"
  }
  ```
- **Error Format**:
  ```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "Human readable explanation",
      "details": []
    },
    "timestamp": "2026-09-07T13:31:02.717Z"
  }
  ```
- **HTTP Status Codes**: Semantic usage: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `429 Too Many Requests`, `500 Internal Error`.

---

## 9. UI/UX Assessment

1. **Information Architecture**:
   - Navigation is currently a single flat list of 12 items in the sidebar. It lacks grouping by operational domain (Workspace, Intelligence, Operations, Administration).
   - Header is underutilized; it lacks global search (Ctrl/Cmd+K) and breadcrumbs for deep navigation.
2. **Dashboard**:
   - Focuses primarily on basic issue counts and distribution charts.
   - Does not prioritize immediate operational questions: active critical backlog, SLA risk alerts, active SEV incidents, and unassigned workload.
3. **Issue Workspace**:
   - Table rows are somewhat bulky and lack clear visual density.
   - Filter bar is wide and could be more compact and structured with quick filter chips (e.g., "My Issues", "Critical Backlog", "SLA At Risk").
4. **Issue Detail**:
   - Functional, but lacks a clean action bar for quick actions (assign, status transition, priority change, incident escalation).
   - AI recommendations must be more distinctly badged as `AI SUGGESTION / ADVISORY`.
5. **Incident Command Center & War Room**:
   - Incidents require immediate operational clarity.
   - Timeline is informative, but the header and action buttons should emphasize the active operational phase (Acknowledge, Investigate, Mitigate, Resolve, Close).
6. **Command Center & Analytics**:
   - Advanced algorithms exist in the backend, but the frontend needs stronger information hierarchy and honest communication of data volume confidence.

---

## 10. Design Consistency Problems

- **Color Inconsistencies**: Multiple distinct styles for cards: some use `bg-slate-900 text-white`, others use `bg-indigo-50`, `bg-amber-50`, `bg-white border-slate-200`.
- **Badge Styling**: Different shapes and border styles for Priority, Severity, Status, and Incident badges across different pages.
- **Empty States**: Inconsistent implementation. Some pages use `EmptyState.tsx`, others render custom div blocks, and some use `AccessLockedCard.tsx` with differing tone.
- **Button Variants**: Inconsistent sizing (`text-xs`, `text-sm`, custom padding) between pages.
- **Typography & Hierarchy**: Section headers range from `text-xs font-bold uppercase tracking-wider` to `text-lg font-bold text-slate-900` with varying margins.

---

## 11. Performance Issues

1. **Frontend Bundle Size**:
   - A single monolithic bundle of `1,127 kB` is produced.
   - Heavy libraries (Recharts, Lucide, React Hook Form) are bundled into `index.js`.
   - **Resolution**: Implement React `lazy` and `Suspense` for page routes and configure Rollup chunking for vendors.
2. **Database Query Overhead in Auth**:
   - `authenticateToken` queries `prisma.user.findUnique` on every request. While necessary for real-time account deactivation, an in-memory short-TTL cache (e.g. 30s) or optimized query projection will minimize DB roundtrips.
3. **Unchecked Polling in Incidents**:
   - `IncidentCommandCenterPage.tsx` sets an unthrottled 15s interval polling loop that continues even if the user is idle.
4. **Direct API Calls vs React Query**:
   - TanStack React Query is installed but bypassed in 90% of components in favor of raw `useEffect` calls. This causes redundant re-fetching on component re-mounts.

---

## 12. Accessibility Issues

1. **Dialog Accessibility**:
   - Custom `Modal.tsx` and `ConfirmDialog.tsx` lack ARIA modal attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
   - Focus trapping is not implemented; tab keys can escape modals into background elements.
2. **Form Labels**:
   - Some input elements rely solely on `placeholder` attributes without accessible programmatic labels (`aria-label` or `<label for="...">`).
3. **Color Contrast**:
   - Certain badges use low-contrast combinations like `text-slate-400` on white backgrounds for critical metadata.
4. **Keyboard Navigation**:
   - Global search shortcut (Ctrl/Cmd+K) is missing.
   - Interactive table rows lack standard keyboard activation (`Enter` / `Space` handling).

---

## 13. Security Issues

1. **Node.js 24 Header Ingestion Incompatibility**:
   - In `backend/src/tests/observability/securityHeaders.test.ts`, Test 5 injects `bad\ninjection\r\ncontent` via Supertest. Under Node 24, Node's built-in HTTP client throws `TypeError: Invalid character in header content ["X-Request-ID"]` before transmission, causing the test to fail. The test and backend sanitizer must handle raw header validation cleanly.
2. **Test User Data Pollution**:
   - Automated tests run against the primary database and have accumulated 21 test accounts (`testuser_...`, `sec_user_...`, `unassigned_...`).
   - Testing scripts must use deterministic fixtures, isolated test setups, or proper teardown routines to avoid polluting the operational user directory.
3. **Error Leakage**:
   - Frontend catch blocks in various pages read `err.message` directly, occasionally risking exposing Axios internal error strings. All error display must be sanitized to user-friendly messages.

---

## 14. Broken / Incomplete Functionality

### 1. The Operations Page Root Cause ("Operations Unavailable")
- **File**: `frontend/src/services/operationsApi.ts`
- **Defect**:
  ```typescript
  // Current flawed implementation:
  async getOverview(): Promise<OperationsOverview> {
    const res = await apiClient.get('/operations/overview');
    return res.data.data; // <--- BUG: Evaluates to undefined!
  }
  ```
- **Root Cause**: `apiClient.ts` has a response interceptor:
  ```typescript
  apiClient.interceptors.response.use((response) => response.data, ...);
  ```
  Consequently, `apiClient.get(...)` returns the payload `{ success: true, data: { ... } }`.
  Accessing `res.data.data` attempts to read property `data` of the inner data object, resulting in `undefined`.
  `OperationsPage.tsx` checks `if (!overview) return <OperationsEmptyState />;`, which immediately displays the "Operations Unavailable" error state even when the backend is 100% healthy and returns HTTP 200.
- **Fix**: Standardize `operationsApi.ts` to return `(res as any).data` matching all other service modules.

### 2. Global Command Search (Ctrl/Cmd + K)
- The application currently has no global keyboard command palette or cross-entity search dialog.

### 3. Missing E2E Tests
- `tests/playwright.config.ts` points to `./e2e`, but `tests/e2e` directory does not exist (0 E2E tests).

### 4. Insufficient Historical Data Handling in Analytics
- When a project lacks historical data, Analytics currently either displays empty zeros or partial charts rather than an explicit "INSUFFICIENT HISTORICAL DATA" explanation state showing known facts vs requirements.

---

## 15. Technical Debt

- **Direct `err: any` Usage**: 48 instances across frontend pages where errors are typed as `any` and properties accessed unsafely.
- **Unused/Dead CSS**: Unreferenced utility classes in component files.
- **Inconsistent Component Extraction**: Several pages contain inline modal form definitions rather than separate cohesive component modules.

---

## 16. Test Coverage

- **Backend Test Suite**:
  - Test Runner: Vitest v3.0.7
  - Test Files: 45 files
  - Total Tests: 171 tests
  - Status: 170 Passed, 1 Failed (Node 24 header character test)
  - Domains Covered: Authentication, RBAC authorization, Project Scoping, Issues State Machine, SLA calculations, Routing Intelligence, AI Reliability, Database Health, Rate Limiting, CORS, Metrics.
- **Frontend Test Suite**:
  - Test Runner: Vitest v3.0.7
  - Test Files: 9 files
  - Total Tests: 40 tests
  - Status: 40 Passed
  - Note: Some frontend tests are shallow interface checks (`expect(true).toBe(true)`). Real component DOM rendering tests should be added.

---

## 17. E2E Coverage

- Playwright is configured in `tests/playwright.config.ts`.
- No E2E spec files currently exist in `tests/e2e`.
- Need dedicated E2E test suites covering Authentication, Issue Lifecycle, Incident Escalation, and Navigation.

---

## 18. Recommended Implementation Order

To execute the transformation systematically without breaking existing capabilities:

1. **Step 1: Design System Primitives**: Standardize core components (`Card`, `Badge`, `StatusBadge`, `PriorityBadge`, `SeverityBadge`, `Button`, `DataTable`, `EmptyState`, `ErrorState`, `SkeletonLoader`, `CommandDialog`).
2. **Step 2: Global Application Shell**: Redesign `SidebarNav` (grouped into Workspace, Engineering Intelligence, Operations, Administration) and `HeaderNav` with breadcrumbs and Ctrl/Cmd+K search trigger.
3. **Step 3: Global Command Search (Ctrl/Cmd + K)**: Implement search dialog querying issues, projects, applications, incidents, and navigation while respecting user permissions.
4. **Step 4: Operations Page Fix & Upgrade**: Fix `operationsApi.ts` response parsing bug and polish the admin operational cockpit.
5. **Step 5: Dashboard**: Overhaul `DashboardPage.tsx` to answer "What is happening in my engineering workspace right now?" with real metrics, SLA alerts, critical backlog, and active incidents.
6. **Step 6: Issues Workspace**: Enhance `IssuesPage.tsx` with high-density table, quick filters, clear sorting, and responsive layout.
7. **Step 7: Issue Detail**: Transform `IssueDetailPage.tsx` into a flagship page with unified action bar, clear AI advisory labels, activity timeline, and technical spec views.
8. **Step 8: Create Issue**: Streamline `CreateIssuePage.tsx` with clear 4-step wizard, validation, and AI triage suggestions.
9. **Step 9: Projects & Applications**: Elevate `ProjectsPage.tsx` and `ApplicationsPage.tsx` into first-class engineering entity workspaces.
10. **Step 10: Team & User Administration**: Upgrade `TeamPage.tsx` with capacity indicators and `UsersPage.tsx` with enterprise search, role filtering, and clean separation of test users.
11. **Step 11: Engineering Command Center**: Refine operational cockpit with clear health breakdowns and bottleneck explanations.
12. **Step 12: Engineering Analytics**: Implement professional "INSUFFICIENT HISTORICAL DATA" states and confidence metrics.
13. **Step 13: Incident Command Center & War Room**: Polish incident workflows, severity badges, and real-time response timeline.
14. **Step 14: Notifications**: Refine notifications inbox with unread filters and quick navigation.
15. **Step 15: Performance, Accessibility & Code-Splitting**: Route lazy-loading, ARIA focus management, and Node 24 security header test fix.
16. **Step 16: Verification, E2E & Final Regression**: Full test suite pass, lint pass, build pass, and complete visual verification.
