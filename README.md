# AI Resume Analyzer

A production-ready, full-stack resume analysis platform built for job seekers and hiring teams.

## What it does

- Upload PDF resumes and parse content automatically
- Analyze ATS readability, keyword coverage, and impact statements
- Generate interview questions from resume content and optional AI providers
- Provide JWT-authenticated user sessions and saved resume history
- Ship as a Docker-ready full-stack app with separate API and frontend services

## Tech stack

- `Next.js` App Router frontend
- `Node.js` + `Express` backend
- `MongoDB` + `Mongoose`
- `Tailwind CSS`
- `JWT` authentication
- `Docker` and Docker Compose for production-local parity
- `TypeScript` across frontend and backend

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and update values locally:

```bash
cp .env.example .env
```

> `JWT_SECRET` must be set to a secure random string.

Do not commit `.env`; it is excluded by `.gitignore`.

### 3. Start local services

```bash
docker compose up -d
```

If you do not use Docker, run a MongoDB instance separately and set `MONGODB_URI` in `.env`.

### 4. Run the app

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:4000`

## Verification

Run these commands to verify the codebase before deployment:

```bash
npm run typecheck
npm run lint
npm run build
```

## Production deployment

This repository is ready for production deployment with Docker Compose.

1. Copy production env example:

```bash
cp .env.production.example .env.production
```

2. Update the production environment values:

```bash
JWT_SECRET=use_a_long_random_secret_here
CLIENT_ORIGIN=https://your-domain.com
NEXT_PUBLIC_API_URL=/api
API_INTERNAL_URL=http://api:4000
```

3. Start the production stack:

```bash
npm run deploy:compose
```

4. Stop it when finished:

```bash
npm run deploy:compose:down
```

## Repository setup and GitHub deployment

### Initialize git

```bash
git init
git branch -M main
```

### Add files and commit

```bash
git add .
git commit -m "chore: initial project import"
```

### Create a GitHub repository manually

1. Open https://github.com/new
2. Set repository name to `create-a-production-ready-ai-resume`
3. Choose `Public` or `Private`
4. Do not add a README, `.gitignore`, or license on GitHub; those are already present locally
5. Create the repository

### Connect local repo to GitHub

Replace `USERNAME` and `REPO` with your GitHub username and repository name:

```bash
git remote add origin https://github.com/USERNAME/REPO.git
```

### Push code to GitHub

```bash
git push -u origin main
```

> If you prefer SSH and have keys configured, use `git remote add origin git@github.com:USERNAME/REPO.git` instead.

## Environment safety

The project already excludes local secrets and runtime artifacts in `.gitignore`:

- `.env`
- `.env.local`
- `.env.*.local`
- `.next`
- `dist`
- `node_modules`
- `*.log`
- `uploads`

Keep `.env` local and do not commit it.

## Project structure

```text
.
├── apps
│   ├── api
│   │   ├── src
│   │   │   ├── config
│   │   │   ├── controllers
│   │   │   ├── middleware
│   │   │   ├── models
│   │   │   ├── routes
│   │   │   ├── services
│   │   │   ├── types
│   │   │   └── utils
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web
│       ├── app
│       ├── components
│       ├── lib
│       ├── package.json
│       ├── tailwind.config.ts
│       └── tsconfig.json
├── docker-compose.yml
├── package.json
├── package-lock.json
├── tsconfig.base.json
├── .env.example
└── .gitignore
```

## Notes

- Do not commit `.env`
- Keep sensitive keys out of source control
- Use `docker compose` for local parity with production
- Push only after verifying `npm run build`

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
