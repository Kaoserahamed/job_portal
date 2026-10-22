# Day 10: Application Model

## Repository

`job_portal` — Days 1-9 implemented on their own feature branches (Day 9 on `feature/day9-job-management`).

## Day 10 Task

Application model - application creation, status, cover letter, resume attachment | 1 PR

## Implementation

### Files

- `src/modules/application/model.js` — `ApplicationModel` (create, getById, getByApplicant, getByEmployer, updateStatus)
- `src/modules/application/controller.js` — `ApplicationController` (create, getById, getByApplicant, getByEmployer, updateStatus)
- `src/modules/application/routes.js` — `POST /jobs/:jobId/apply`, `GET /my`, `GET /employer`, `GET /:id`, `PATCH /:id/status`
- `tests/api.test.js` — "Applications API" integration tests

### Database

The `job_applications` table (migration `001_initial_schema.sql`) stores:

- `job_id` (FK to `jobs`)
- `applicant_id` (FK to `users`)
- `cover_letter` (TEXT)
- `resume_url` (TEXT)
- `status` (VARCHAR, default 'applied')
- `created_at`, `updated_at`
- `UNIQUE(job_id, applicant_id)` — one application per candidate per job

### API Contracts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/applications/jobs/:jobId/apply` | Required (candidate/admin) | Apply to a job |
| GET | `/api/v1/applications/my` | Required (candidate/admin) | Get authenticated candidate's applications |
| GET | `/api/v1/applications/employer` | Required (employer/admin) | Get applications for employer's jobs |
| GET | `/api/v1/applications/:id` | Required | Get an application by id |
| PATCH | `/api/v1/applications/:id/status` | Required (employer/admin) | Update application status |

### Validation

- `jobId` — required integer (path param)
- `coverLetter` — optional, trimmed
- `resumeUrl` — optional, must be a URL
- `status` — one of applied/reviewing/interviewing/offered/rejected/hired

### Role-based access

Applying requires an authenticated candidate or admin. Reading own applications requires candidate/admin. Reading employer applications and updating status require employer/admin.

### Duplicate application prevention

`ApplicationController.create` detects the unique constraint violation on `(job_id, applicant_id)` and returns 409 "Already applied to this job".

## Testing

Test command: `npm test` (runs `jest --testPathPattern=tests --coverage`)

The "Applications API" suite in `tests/api.test.js` covers:
- apply to a job (candidate) → 201
- get my applications → 200
- update application status (employer) → 200
- forbid candidate from updating application status → 403

All 30 tests pass.

### Coverage notes

`src/modules/application`:
- controller.js 57.62% statements — duplicate-application (409) and not-found paths not directly exercised
- model.js 66.66% statements — not-found branches not directly exercised

## Day 10 Outcome

Application model implemented with creation, status tracking, cover letter, resume attachment, candidate/employer views, and status updates with role-based access control. Tests pass. Documentation added. Committed to `feature/day10-application-model` and pushed directly to the branch (no pull request).
