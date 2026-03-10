# Assignment Log Book API

REST API built with Next.js (App Router) to manage assignments. It supports list, create, detail, update, delete, and includes Swagger/OpenAPI documentation.

## Setup

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## API Design

| Method | Endpoint | Description | Request Body | Success Response | Error Response |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/assignments` | List assignments | - | `200` `{ items: Assignment[], count }` | - |
| POST | `/api/assignments` | Create assignment | `AssignmentCreate` | `201` `Assignment` | `400` `ErrorResponse` |
| GET | `/api/assignments/{id}` | Assignment detail | - | `200` `Assignment` | `404` `ErrorResponse` |
| PUT | `/api/assignments/{id}` | Update assignment (partial) | `AssignmentUpdate` | `200` `Assignment` | `400/404` `ErrorResponse` |
| DELETE | `/api/assignments/{id}` | Delete assignment | - | `200` `{ message, item }` | `404` `ErrorResponse` |

### Schema Summary

- `Assignment`
  - `id` string
  - `title` string (required)
  - `description` string (optional)
  - `dueDate` ISO date-time string (optional)
  - `status` one of `pending`, `in_progress`, `completed`
  - `createdAt`, `updatedAt` ISO date-time strings
- `AssignmentCreate`
  - `title` required, others optional
- `AssignmentUpdate`
  - any subset of fields from `AssignmentCreate`
- `ErrorResponse`
  - `{ error: { message: string, details?: string[] } }`

## Swagger / OpenAPI

- OpenAPI JSON: `http://localhost:3000/api/docs`
- Swagger UI: `http://localhost:3000/docs`

Note: Swagger UI loads assets from `unpkg.com` CDN. If you are offline, use the JSON endpoint instead.

## Testing (Success + Error Scenarios)

> Replace `{id}` with a real id returned from the create endpoint.

### Create Assignment

```bash
curl -X POST http://localhost:3000/api/assignments \
  -H "Content-Type: application/json" \
  -d '{"title":"Math homework","description":"Chapter 2","dueDate":"2026-03-15T10:00:00.000Z","status":"pending"}'
```

### List Assignments

```bash
curl http://localhost:3000/api/assignments
```

### Get Assignment Detail

```bash
curl http://localhost:3000/api/assignments/{id}
```

### Update Assignment

```bash
curl -X PUT http://localhost:3000/api/assignments/{id} \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

### Delete Assignment

```bash
curl -X DELETE http://localhost:3000/api/assignments/{id}
```

## Data Storage

Assignments are stored locally in `data/assignments.json` to imitate an actual database.
