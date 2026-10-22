# Job Portal API

A comprehensive job portal platform with AI resume matching, video interviews, skills assessment, salary insights, employer branding, and applicant tracking system.

## Phase 1 - Days 4 & 5 (Implemented)

### Day 4 - Project restructuring

Separate modules for job, candidate, employer, application, and assessment services under `src/modules/`, each with its own model, controller, and routes.

### Day 5 - Authentication

Candidate / employer / admin roles, JWT access + refresh tokens, bcrypt password hashing, MFA (TOTP via speakeasy), OAuth2 authorize/callback endpoints (Google, GitHub), and role-based access control middleware.

## Tech Stack

- Node.js 20, Express.js
- PostgreSQL (database)
- JWT + bcryptjs (authentication)
- speakeasy + qrcode (MFA/TOTP)
- Jest + Supertest (testing)
- express-validator (validation)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# Start the server
npm run dev
```

## Docker

```bash
docker compose up --build
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register (candidate/employer/admin)
- `POST /api/v1/auth/login` - Login (with optional MFA token)
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Current user
- `POST /api/v1/auth/mfa/setup` - MFA setup (authenticated)
- `POST /api/v1/auth/mfa/verify` - Verify & enable MFA (authenticated)
- `POST /api/v1/auth/mfa/disable` - Disable MFA (authenticated)
- `GET /api/v1/auth/oauth2/:provider/authorize` - OAuth2 authorize (google/github)
- `GET /api/v1/auth/oauth2/:provider/callback` - OAuth2 callback

### Jobs

- `GET /api/v1/jobs` - List jobs (search, filters, pagination)
- `GET /api/v1/jobs/:id` - Job details
- `POST /api/v1/jobs` - Create job (employer/admin)
- `PUT /api/v1/jobs/:id` - Update job (employer/admin)
- `DELETE /api/v1/jobs/:id` - Delete job (employer/admin)
- `GET /api/v1/jobs/employer/my-jobs` - Employer's jobs

### Applications

- `POST /api/v1/applications/jobs/:jobId/apply` - Apply to job (candidate)
- `GET /api/v1/applications/:id` - Application details
- `GET /api/v1/applications/my` - My applications (candidate)
- `GET /api/v1/applications/employer` - Employer applications
- `PATCH /api/v1/applications/:id/status` - Update status (employer)

### Candidates

- `GET /api/v1/candidates/:userId` - Candidate profile
- `GET /api/v1/candidates/me` - My profile
- `POST /api/v1/candidates` - Create/update profile

### Employers

- `GET /api/v1/employers/:userId` - Employer profile
- `GET /api/v1/employers/me` - My employer profile
- `POST /api/v1/employers` - Create/update employer profile

### Assessments

- `POST /api/v1/assessments/:applicationId` - Create assessment
- `POST /api/v1/assessments/:id/submit` - Submit assessment
- `GET /api/v1/assessments/:id/results` - Assessment results

### Health

- `GET /health` - Health check

## Testing

```bash
npm test
```

## License

MIT
