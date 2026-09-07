# Applications Issue Tracking System — Comprehensive REST API Specification

**Base API URL**: `/api/v1`

---

## Standard JSON Response Structure

### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "timestamp": "2026-08-31T20:45:00.000Z"
}
```

### Paginated Response (`200 OK`)
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2026-08-31T20:45:00.000Z"
}
```

### Error Response (`400`, `401`, `403`, `404`, `409`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": []
  },
  "timestamp": "2026-08-31T20:45:00.000Z"
}
```

---

## Complete API Endpoint Directory

### 1. System Health
| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/health` | `GET` | Public | All | Service uptime and DB status |

---

### 2. Authentication (`/api/v1/auth`)
| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/auth/register` | `POST` | Public | All | Register user account |
| `/api/v1/auth/login` | `POST` | Public | All | Authenticate & return tokens |
| `/api/v1/auth/refresh` | `POST` | Public | All | Exchange refresh token for new access token |
| `/api/v1/auth/logout` | `POST` | Bearer Token | All | Revoke stateful refresh token |
| `/api/v1/auth/me` | `GET` | Bearer Token | All | Retrieve current user profile |

---

### 3. Users (`/api/v1/users`)
| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/users` | `GET` | Bearer Token | `ADMIN`, `PROJECT_MANAGER` | List all users |
| `/api/v1/users/:id` | `GET` | Bearer Token | All | Fetch single user profile |
| `/api/v1/users/:id` | `PUT` | Bearer Token | `ADMIN` / Self | Update profile |
| `/api/v1/users/:id/status` | `PATCH` | Bearer Token | `ADMIN` | Activate/deactivate account |
| `/api/v1/users/:id/role` | `PATCH` | Bearer Token | `ADMIN` | Change user role |

---

### 4. Applications (`/api/v1/applications`)
| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/applications` | `GET` | Bearer Token | All | List applications |
| `/api/v1/applications/:id` | `GET` | Bearer Token | All | Fetch application details |
| `/api/v1/applications` | `POST` | Bearer Token | `ADMIN`, `PROJECT_MANAGER` | Create application |
| `/api/v1/applications/:id` | `PUT` | Bearer Token | `ADMIN`, `PROJECT_MANAGER` | Update application |
| `/api/v1/applications/:id` | `DELETE` | Bearer Token | `ADMIN` | Delete application |

---

### 5. Projects (`/api/v1/projects`)
| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/projects` | `GET` | Bearer Token | All | List projects (`?applicationId=`) |
| `/api/v1/projects/:id` | `GET` | Bearer Token | All | Fetch project details |
| `/api/v1/projects` | `POST` | Bearer Token | `ADMIN`, `PROJECT_MANAGER` | Create project |
| `/api/v1/projects/:id` | `PUT` | Bearer Token | `ADMIN`, `PROJECT_MANAGER` | Update project |
| `/api/v1/projects/:id` | `DELETE` | Bearer Token | `ADMIN` | Delete project |
| `/api/v1/projects/:id/members` | `GET` | Bearer Token | All | List team members |
| `/api/v1/projects/:id/members` | `POST` | Bearer Token | `ADMIN`, `PROJECT_MANAGER` | Add team member |
| `/api/v1/projects/:id/members/:userId` | `DELETE` | Bearer Token | `ADMIN`, `PROJECT_MANAGER` | Remove member |

---

### 6. Issues (`/api/v1/issues`)
| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/issues` | `GET` | Bearer Token | All | Filter/search/paginate issues |
| `/api/v1/issues/:id` | `GET` | Bearer Token | All | Fetch issue details |
| `/api/v1/issues` | `POST` | Bearer Token | All | Report new issue |
| `/api/v1/issues/:id` | `PUT` | Bearer Token | All | Update issue fields |
| `/api/v1/issues/:id/status` | `PATCH` | Bearer Token | All | Change status (validated transition) |
| `/api/v1/issues/:id/assign` | `PATCH` | Bearer Token | `ADMIN`, `PM`, `DEVELOPER` | Assign issue |
| `/api/v1/issues/:id` | `DELETE` | Bearer Token | `ADMIN`, `PROJECT_MANAGER` | Delete issue |
| `/api/v1/issues/:id/history` | `GET` | Bearer Token | All | Fetch issue history audit log |

---

### 7. Comments (`/api/v1/issues/:id/comments`, `/api/v1/comments/:id`)
| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/issues/:id/comments` | `GET` | Bearer Token | All | List issue comments |
| `/api/v1/issues/:id/comments` | `POST` | Bearer Token | All | Post comment |
| `/api/v1/comments/:id` | `PUT` | Bearer Token | Author | Update comment |
| `/api/v1/comments/:id` | `DELETE` | Bearer Token | Author / `ADMIN` | Delete comment |

---

### 8. Attachments (`/api/v1/issues/:id/attachments`, `/api/v1/attachments/:id`)
| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/issues/:id/attachments` | `GET` | Bearer Token | All | List issue attachments |
| `/api/v1/issues/:id/attachments` | `POST` | Bearer Token | All | Upload file attachment |
| `/api/v1/attachments/:id` | `DELETE` | Bearer Token | Uploader / `ADMIN` | Delete attachment |

---

### 9. Notifications (`/api/v1/notifications`)
| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/notifications` | `GET` | Bearer Token | All | Fetch user notifications |
| `/api/v1/notifications/:id/read` | `PUT` | Bearer Token | Recipient | Mark notification read |
| `/api/v1/notifications/read-all` | `PUT` | Bearer Token | Recipient | Mark all read |

---

### 10. Dashboard Analytics (`/api/v1/dashboard`)
| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/dashboard/summary` | `GET` | Bearer Token | All | Total/open/resolved metrics |
| `/api/v1/dashboard/issues-by-status` | `GET` | Bearer Token | All | Issues grouped by status |
| `/api/v1/dashboard/issues-by-priority` | `GET` | Bearer Token | All | Issues grouped by priority |
| `/api/v1/dashboard/issues-by-severity` | `GET` | Bearer Token | All | Issues grouped by severity |
| `/api/v1/dashboard/issues-by-application` | `GET` | Bearer Token | All | Issues grouped by application |
| `/api/v1/dashboard/developer-workload` | `GET` | Bearer Token | All | Active workload per developer |
| `/api/v1/dashboard/resolution-metrics` | `GET` | Bearer Token | All | Average resolution time (hours) |
