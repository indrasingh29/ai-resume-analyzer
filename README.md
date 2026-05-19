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
|-- .devcontainer
|-- .env.codespaces.example
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
- `.devcontainer/devcontainer.json`: GitHub Codespaces and Dev Containers configuration.
- `.devcontainer/docker-compose.yml`: Codespaces app container plus MongoDB sidecar service.
- `.vscode/tasks.json`: VS Code tasks for running the full stack, frontend, API, and verification commands.
- `.env.codespaces.example`: Safe Codespaces environment template. Codespaces copies this to `.env` automatically.
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

## Run in GitHub Codespaces

This project is ready for a browser-based VS Code workflow through GitHub Codespaces.

### 1. Push the repository to GitHub

Create a GitHub repository, add it as `origin`, and push `main`:

```bash
git remote add origin https://github.com/USERNAME/ai-resume-analyzer.git
git push -u origin main
```

### 2. Create a Codespace

1. Open the repository on GitHub.
2. Click `Code`.
3. Open the `Codespaces` tab.
4. Click `Create codespace on main`.

GitHub will read `.devcontainer/devcontainer.json`, start the Node.js development container, start the MongoDB sidecar, install dependencies, and copy `.env.codespaces.example` to `.env`.

### 3. Run the full stack

In the Codespaces terminal:

```bash
npm run dev
```

Ports are configured automatically:

- `3000`: Next.js frontend
- `4000`: Express API
- `27017`: MongoDB sidecar

Open the forwarded `3000` port to use the app in your browser. API calls use `/api` through the Next.js rewrite, so the browser does not need a separate backend URL.

### 4. Codespaces environment

Codespaces uses these development values:

```text
MONGODB_URI=mongodb://mongo:27017/ai_resume_analyzer
NEXT_PUBLIC_API_URL=/api
API_INTERNAL_URL=http://localhost:4000
```

Do not commit real secrets. `.env` remains ignored by Git.

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

## Deploy on Render

This repository includes `render.yaml`, so Render can create both production services from the GitHub repo:

- `ai-resume-analyzer-api`: Express API web service
- `ai-resume-analyzer-web`: Next.js web service

Render does not provide a native MongoDB database service, so use MongoDB Atlas for production data.

### 1. Create a MongoDB Atlas database

1. Go to `https://cloud.mongodb.com`.
2. Create a free cluster.
3. Create a database user with a strong password.
4. In Network Access, allow Render to connect. For a portfolio demo, `0.0.0.0/0` is the simplest option. For stricter production use, restrict by provider/network policy.
5. Copy the connection string and set the database name to `ai_resume_analyzer`.

Example format:

```text
mongodb+srv://USERNAME:PASSWORD@cluster-name.mongodb.net/ai_resume_analyzer?retryWrites=true&w=majority
```

Do not commit this value.

### 2. Deploy from GitHub to Render

1. Push the latest code to GitHub.
2. Open `https://dashboard.render.com`.
3. Click `New +`.
4. Choose `Blueprint`.
5. Connect the GitHub repository.
6. Render detects `render.yaml`.
7. When prompted for environment variables, provide:
   - `MONGODB_URI`: your MongoDB Atlas connection string
8. Deploy the Blueprint.

The frontend service uses `NEXT_PUBLIC_API_URL=/api` and proxies requests to the API service over Render's private service networking.
If you want OpenAI-generated questions instead of the built-in deterministic generator, add `OPENAI_API_KEY` to the API service environment later and redeploy.

### 3. Confirm the live app

After deploy, open:

```text
https://ai-resume-analyzer-web.onrender.com
```

Also check the API health endpoint:

```text
https://ai-resume-analyzer-api.onrender.com/health
```

If Render gives a different frontend URL, update `CLIENT_ORIGIN` on the API service to match the actual frontend origin and redeploy the API.

### 4. LinkedIn-ready demo checklist

- Create one demo account.
- Upload a sample PDF resume.
- Confirm ATS score, keyword gaps, strengths, improvements, and interview questions display correctly.
- Open the dashboard and confirm the saved analysis appears.
- Use the frontend Render URL as the project link on LinkedIn.

## Accessing Data

The app stores production data in MongoDB Atlas through `MONGODB_URI`.

Main collections:

- `users`: registered user accounts with hashed passwords
- `resumeanalyses`: saved resume analysis results, ATS scores, extracted text preview, and interview questions

Ways to view the data:

- In the app: open the dashboard after logging in.
- In MongoDB Atlas: open the cluster, click `Browse Collections`, then select the `ai_resume_analyzer` database.
- In MongoDB Compass: connect with the same Atlas URI.
- Locally with Docker:

```bash
docker exec -it ai-resume-analyzer-mongo mongosh ai_resume_analyzer
```

Useful local MongoDB commands:

```javascript
show collections
db.users.find().pretty()
db.resumeanalyses.find().pretty()
```

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
