# To-do Dashboard — React + Vite + Fastify + MySQL

A task manager with a responsive pink-and-white dashboard, task search, deadline sorting, completion counts, create/edit dialogs, overdue indicators, and keyboard-accessible controls.

## Requirements
- Node.js 18+ and npm
- MySQL 8+ (or a compatible MySQL server)

## 1. Configure and run the backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL connection details
npm install
npm run dev
```

Create the database/table if needed:

```bash
mysql -u root -p < schema.sql
```

The API listens on `http://localhost:3333` by default. Check `http://localhost:3333/health` for its health response.

## 2. Configure and run the frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. Set `VITE_API_URL` in `frontend/.env` if the backend is hosted elsewhere. Re-run Vite after changing environment variables.

Production build check:

```bash
cd frontend
npm run build
npm run preview
```

## API contract used

| Method | Route | Request | Response |
|---|---|---|---|
| `GET` | `/api/tasks?search=&status=all\|pending\|completed` | Query params | `{ tasks, total, completed }` |
| `POST` | `/api/tasks` | `{ "title": "...", "dueDate": "YYYY-MM-DD" }` (date optional/null) | `201` and task object |
| `PATCH` | `/api/tasks/:id` | `{ completed?: boolean, title?: string, dueDate?: "YYYY-MM-DD"\|null }` | Updated task object |
| `DELETE` | `/api/tasks/:id` | No body | `204` |

Task objects use `id`, `title`, `completed`, `due_date`, and `created_at`. The frontend uses these real endpoints and does not persist task data locally.

## Notes / backend limitations
- The backend's search currently matches `title` only; the frontend sends the search query to the API. To search additional fields, those fields must first exist in the task schema and be included in the server-side search query.
- The current schema only supports title, completion status, and due date, so the task form intentionally exposes only those fields.
- Counts returned by the current API are global, even when a search or status filter is active. The dashboard presents those server totals, while the list is filtered by the selected view.
