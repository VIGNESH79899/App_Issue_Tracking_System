# Applications Issue Tracking System — Architecture Specification

## 1. System Overview

The Applications Issue Tracking System is a multi-tier, full-stack web application designed for enterprise and academic software engineering teams to track, triage, assign, and resolve application bugs, tasks, and enhancements.

## 2. Layered Architecture Design

```
+-----------------------------------------------------------------------+
|                           REACT FRONTEND                              |
|   Pages / Views -> Components -> Hooks -> API Services (Axios)        |
+-----------------------------------------------------------------------+
                                   | HTTP/REST (JSON)
                                   v
+-----------------------------------------------------------------------+
|                          EXPRESS BACKEND                              |
|   Routes -> Middlewares (Auth/RBAC/Zod) -> Controllers -> Services    |
+-----------------------------------------------------------------------+
                                   | Prisma ORM
                                   v
+-----------------------------------------------------------------------+
|                         POSTGRESQL DATABASE                           |
|   Relational Schema (Users, Apps, Projects, Issues, Comments, etc.)   |
+-----------------------------------------------------------------------+
```

### Clean Layering Rules
1. **Routes Layer**: Handles URL paths and HTTP verb bindings. Routes do not contain business logic or DB calls.
2. **Controllers Layer**: Extracts request parameters/body, delegates business operation to Services, and formats HTTP responses.
3. **Services Layer**: Encapsulates pure business rules, transaction boundaries, and DB operations via Prisma.
4. **Shared Contracts Layer (`/shared`)**: Houses single-source-of-truth TypeScript types, enums, and Zod schemas shared by both Frontend and Backend.

---

## 3. Canonical Issue Status Lifecycle

```
          +------------+
          |    OPEN    |
          +------------+
                |
                v
          +------------+          +------------+
          |  ASSIGNED  | -------> |   CLOSED   |
          +------------+          +------------+
                |                       ^
                v                       |
          +------------+                |
          | IN_PROGRESS|                |
          +------------+                |
                |                       |
                v                       |
          +------------+                |
          |  RESOLVED  | ---------------+
          +------------+
           |          ^
           v          |
     +----------+ +----------+
     | VERIFIED | | REOPENED |
     +----------+ +----------+
```

### Transition Enforcement Rules
* `OPEN`: May transition to `ASSIGNED` or `CLOSED`.
* `ASSIGNED`: May transition to `IN_PROGRESS`, `OPEN`, or `CLOSED`.
* `IN_PROGRESS`: May transition to `RESOLVED`, `ASSIGNED`, or `OPEN`.
* `RESOLVED`: May transition to `VERIFIED`, `REOPENED`, or `CLOSED`.
* `VERIFIED`: May transition to `CLOSED` or `REOPENED`.
* `CLOSED`: May transition to `REOPENED`.
* `REOPENED`: May transition to `IN_PROGRESS` or `ASSIGNED`.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Action | ADMIN | PROJECT_MANAGER | DEVELOPER | REPORTER |
|---|---|---|---|---|
| Manage System Users | ✅ | ❌ | ❌ | ❌ |
| Create / Manage Applications | ✅ | ✅ | ❌ | ❌ |
| Create / Manage Projects | ✅ | ✅ | ❌ | ❌ |
| Report New Issue | ✅ | ✅ | ✅ | ✅ |
| Assign Issue | ✅ | ✅ | ✅ | ❌ |
| Update Issue Status | ✅ | ✅ | ✅ | Only reported |
| Add Comments / Attachments | ✅ | ✅ | ✅ | ✅ |
| View System Analytics / Dashboard | ✅ | ✅ | ✅ | ✅ |
