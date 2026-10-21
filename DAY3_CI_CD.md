# Day 3 CI/CD: Build / Test / Deploy Pipeline

## Repository
`job_portal` — Empty repository

## Pipeline Overview
GitHub Actions CI/CD pipeline template for a job portal platform (Node.js/Python + React).

### Trigger
- Push/Pull Request to `main`
- Manual workflow dispatch

### Stages (Planned)

#### 1. Lint & Format
- ESLint + Prettier (Node.js/React)
- Ruff/Black (Python, if backend is Python)

#### 2. Test
- Unit tests (Jest/Pytest)
- API integration tests (against test database)
- Resume parsing tests
- Matching algorithm tests

#### 3. Build
- `npm ci` + `npm run build` (Node.js/React)
- Docker multi-stage build
- Tag images with commit SHA

#### 4. Security Scan
- `npm audit` / `pip audit`
- Secret detection (no API keys, no credentials)
- Resume file scanning (virus/malware check for uploaded files)

#### 5. Deploy (on merge to `main`)
- Build and push Docker images
- Deploy with `docker compose up -d` (backend + database + frontend)
- Health check: `GET /api/jobs`
- Run database migrations

### Quality Gates
- All tests pass
- Build succeeds
- No secrets committed
- Linting clean

### Artifacts
- Docker images
- Test reports
- Coverage reports
- Deployment URL

## Day 3 Outcome
CI/CD pipeline documented. No code changes. 0 PRs. Ready for Day 4 (project restructuring).