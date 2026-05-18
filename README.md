# AI Resume Analyzer

A production-ready full-stack resume analysis platform for uploading PDF resumes, scoring ATS readiness, and generating interview questions.

## Features

- JWT user authentication
- Resume PDF upload and text extraction
- ATS score analysis with keyword, structure, impact, contact, and readability scoring
- AI-ready interview question generation with a deterministic local fallback
- Dashboard with saved analysis history and recurring keyword gaps
- Responsive Tailwind CSS interface
- MongoDB persistence through Mongoose
- Docker Compose files for local and production-style deployment

## Tech Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: MongoDB, Mongoose
- Auth: JWT, bcrypt password hashing
- Uploads: Multer in-memory PDF upload pipeline
- PDF parsing: pdf-parse
- Tooling: npm workspaces, ESLint, TypeScript, Docker Compose

## Project Structure

```text
.
|-- apps
|   |-- api
|   |   |-- src
|   |   |   |-- config
|   |   |   |-- controllers
|   |   |   |-- middleware
|   |   |   |-- models
|   |   |   |-- routes
|   |   |   |-- services
|   |   |   |-- types
|   |   |   `-- utils
|   |   |-- package.json
|   |   `-- tsconfig.json
|   `-- web
|       |-- app
|       |-- components
|       |-- lib
|       |-- package.json
|       |-- tailwind.config.ts
|       `-- tsconfig.json
|-- .dockerignore
|-- .env.example
|-- .env.production.example
|-- .gitignore
|-- docker-compose.yml
|-- docker-compose.prod.yml
|-- package.json
|-- package-lock.json
|-- README.md
`-- tsconfig.base.json
```

## Folder and File Guide

- `apps/api`: Express API, MongoDB models, auth middleware, PDF parsing, ATS scoring, and dashboard endpoints.
- `apps/web`: Next.js frontend, authentication screens, dashboard UI, upload workflow, and API client.
- `.vscode/tasks.json`: VS Code tasks for running the full stack, frontend, API, and verification commands.
- `.env.example`: Safe development environment template. Copy this to `.env`.
- `.env.production.example`: Safe production environment template. Copy this to `.env.production` for deployment.
- `.gitignore`: Keeps dependencies, builds, logs, uploads, and local secrets out of Git.
- `docker-compose.yml`: Local MongoDB service.
- `docker-compose.prod.yml`: Production-style web, API, and MongoDB compose stack.
- `package.json`: Root workspace scripts.
- `package-lock.json`: Locked dependency graph for reproducible installs.

## Local Development

### 1. Install dependencies

```bash
npm install
```

This installs root dependencies and both npm workspaces: `apps/api` and `apps/web`.

### 2. Create local environment variables

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Update `JWT_SECRET` before using the app beyond local testing. Keep `.env` private; it is ignored by Git.

### 3. Start MongoDB

```bash
docker compose up -d
```

If Docker is unavailable, create a MongoDB Atlas cluster or run MongoDB locally, then update `MONGODB_URI` in `.env`.

### 4. Run the app

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:4000`
- Health check: `http://localhost:4000/health`

## Run in VS Code

1. Open the folder in VS Code:

   ```bash
   code .
   ```

2. Open the command palette with `Ctrl+Shift+P`.
3. Choose `Tasks: Run Task`.
4. Select one of:
   - `Run full stack dev`
   - `Run frontend dev`
   - `Run API dev`
   - `Verify project`

The full stack task requires MongoDB to be running first.

## Verification

Run these commands before pushing or deploying:

```bash
npm run typecheck
npm run lint
npm run build
```

What each command does:

- `npm run typecheck`: validates TypeScript across frontend and backend.
- `npm run lint`: checks code quality with ESLint.
- `npm run build`: creates production builds for both workspaces.

## Git Setup Commands

Use these commands when preparing the repository from scratch.

### 1. Initialize Git

```bash
git init
```

Creates the local `.git` repository folder.

### 2. Rename the default branch

```bash
git branch -M main
```

Uses `main` as the primary branch name.

### 3. Confirm ignored files

```bash
git status --ignored --short
```

Checks that local secrets and generated files are ignored.

### 4. Stage project files

```bash
git add .
```

Stages all tracked source, config, lockfile, and documentation files.

### 5. Commit the project

```bash
git commit -m "chore: initial project import"
```

Creates the first repository snapshot.

## GitHub Deployment Setup

### 1. Create a new GitHub repository

1. Go to `https://github.com/new`.
2. Enter a repository name, for example `ai-resume-analyzer`.
3. Choose `Public` or `Private`.
4. Do not add a README, `.gitignore`, or license on GitHub because this project already has local files.
5. Click `Create repository`.

### 2. Connect the local repository to GitHub

Replace `USERNAME` and `REPO`:

```bash
git remote add origin https://github.com/USERNAME/REPO.git
```

If you use SSH:

```bash
git remote add origin git@github.com:USERNAME/REPO.git
```

### 3. Push all code

```bash
git push -u origin main
```

This uploads the committed local repository and sets `origin/main` as the upstream branch.

### 4. Verify upload

```bash
git remote -v
git status
git log --oneline -5
```

Then open the GitHub repository in your browser and confirm the source files, README, and lockfile are present.

## Environment Safety

The repository intentionally ignores:

- `.env`
- `.env.local`
- `.env.development`
- `.env.test`
- `.env.production`
- `.env.*.local`
- `node_modules`
- `.next`
- `dist`
- `uploads`
- `*.log`

Only example files such as `.env.example` and `.env.production.example` should be committed.

## Production Deployment

1. Create production environment file:

   ```bash
   copy .env.production.example .env.production
   ```

2. Update production values:

   ```text
   JWT_SECRET=use_a_long_random_secret_here
   CLIENT_ORIGIN=https://your-domain.com
   NEXT_PUBLIC_API_URL=/api
   API_INTERNAL_URL=http://api:4000
   ```

3. Start the production stack:

   ```bash
   npm run deploy:compose
   ```

4. Stop the production stack:

   ```bash
   npm run deploy:compose:down
   ```

## API Endpoints

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/resumes/analyze`
- `GET /api/resumes`
- `GET /api/resumes/:id`
- `DELETE /api/resumes/:id`
- `GET /api/dashboard/summary`
