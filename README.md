# Uptask Backend (MERN)

Backend REST API for the Uptask MERN project. This service exposes authentication, projects, tasks, notes, and team management endpoints, and is designed to be consumed by the React frontend:

Frontend repository: https://github.com/aaronmasm/Uptask_Frontend


## Description
Uptask is a project and task manager for teams. It lets you create and manage projects, organize tasks with statuses, collaborate with team members, and add notes — with authentication and access control.

## Overview
- Stack: Node.js + Express (v5), TypeScript, MongoDB (Mongoose)
- Auth: JWT stored in HTTP-only cookie; request validation with express-validator
- Utilities/Middleware: dotenv, cors, cookie-parser, morgan, colors
- Email: Nodemailer (SMTP)
- Package manager: npm (package-lock.json present)
- Entry point: src/index.ts (starts server using src/server.ts)
- API base paths: /api/auth, /api/projects


## Requirements
- Node.js LTS (recommended)
- npm (bundled with Node.js)
- MongoDB database
- SMTP credentials for transactional emails (account confirmation, password recovery)


## Getting started
1) Clone and install dependencies
- git clone <this-repo-url>
- cd uptask_backend
- npm install

2) Create an .env file in the project root with the following variables
Note: Do not commit the real values; these are examples only.

```
# Server
PORT=4000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=mongodb://127.0.0.1:27017/uptask

# Auth
JWT_SECRET=your-very-strong-secret

# Email (SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525                    # Typical Mailtrap port; verify for your provider
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

3) Run in development
- npm run dev
  - Starts Nodemon with ts-node at src/index.ts

Optional: there is also a dev:api script which runs the same entrypoint with an extra --api flag. The codebase does not currently branch on this flag; it is safe to ignore unless you add custom behavior.
- npm run dev:api

4) Build and run (production-like)
- npm run build   # transpiles TypeScript to ./dist
- npm start       # runs node ./dist/index.js


## Available npm scripts
- dev: nodemon --exec ts-node src/index.ts
- dev:api: nodemon --exec ts-node src/index.ts --api (currently same behavior as dev)
- build: tsc
- start: node ./dist/index.js


## Environment variables
- PORT: Port where the API listens (default 4000 if not set)
- FRONTEND_URL: Origin allowed by CORS (e.g., http://localhost:5173)
- DATABASE_URL: MongoDB connection string
- JWT_SECRET: Secret used to sign/verify JWT tokens
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS: SMTP configuration for Nodemailer


## Project structure
```
uptask_backend/
├─ src/
│  ├─ index.ts            # Entry: reads PORT and starts server.listen
│  ├─ server.ts           # Express app: CORS, JSON, cookies, logging, routes
│  ├─ config/
│  │  ├─ db.ts            # connectDB() uses DATABASE_URL
│  │  ├─ cors.ts          # corsConfig uses FRONTEND_URL and credentials
│  │  └─ nodemailer.ts    # transporter from SMTP_* env vars
│  ├─ controllers/        # AuthController, ProjectController, TaskController, etc.
│  ├─ middleware/         # auth (JWT from cookie), validation, project, task
│  ├─ models/             # Mongoose schemas (User, Project, Task, Note, ...)
│  └─ routes/
│     ├─ authRoutes.ts    # /api/auth
│     └─ projectRoutes.ts # /api/projects (projects, tasks, teams, notes)
├─ tsconfig.json          # TypeScript configuration
├─ package.json           # Scripts and dependencies
└─ README.md
```


## API endpoints (high level)
- /api/auth
  - POST /create-account, /confirm-account, /login, /logout, /request-code,
    /forgot-password, /validate-token, /update-password/:token
  - GET /user, PATCH /profile, PATCH /update-password, POST /check-password
- /api/projects
  - CRUD for projects; tasks (CRUD and status), team members (add/remove), notes

Detailed per-route request/response shapes are defined in controllers and validators.


## CORS and cookies
- CORS is restricted to FRONTEND_URL and credentials are enabled
- Auth middleware reads JWT from req.cookies.token; ensure the frontend sends credentials (fetch with credentials: 'include')


## Development tips
- Ensure MongoDB is running and DATABASE_URL points to a valid instance
- Use a separate JWT_SECRET and SMTP credentials for local development
- If you change environment variables, restart the dev server (Nodemon will reload on file changes but not always on .env changes)


## Related repositories
- Frontend (React): https://github.com/aaronmasm/Uptask_Frontend


## License
This project is licensed under the MIT License. See the LICENSE file for details.


