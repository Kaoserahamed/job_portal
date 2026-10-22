# Day 8: Job Model

## Repository

`job_portal` — Days 1-7 implemented (Day 7 on `feature/day7-employer-profiles`).

## Day 8 Task

Job model - job creation, requirements, salary range, location, employment type | 1 PR

## Implementation

### Files

- `src/models/Job.js` — legacy `JobModel` (create, findAll, findById, update, delete, findByEmployer)
- `src/modules/job/model.js` — modular `JobModel` (create, getAll, getById, update, delete, getByEmployer)
- `src/modules/job/controller.js` — `JobController` (getAll, getById, create, update, delete, getByEmployer)
- `src/modules/job/routes.js` — `GET /jobs`, `GET /jobs/:id`, `POST /jobs`, `PUT /jobs/:id`, `DELETE /jobs/:id`, `GET /jobs/employer/my-jobs`
- `tests/api.test.js` — "Jobs API" integration tests

### Database

The `jobs` table (migration `001_initial_schema.sql`) stores:

- `employer_id` (FK to `users`)
- `title` (VARCHAR, not null)
- `description` (TEXT, not null)
- `requirements` (TEXT)
- `location` (VARCHAR, not null)
- `salary_min`, `salary_max` (INTEGER)
- `employment_type` (VARCHAR, not null)
- `experience_level` (VARCHAR)
- `category` (VARCHAR)
- `is_remote` (BOOLEAN, default false)
- `application_deadline` (TIMESTAMP WITH TIME ZONE)
- `status` (VARCHAR, default 'active')
- `created_at`, `updated_at`

### API Contracts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/jobs` | Optional | List jobs with search, filters, pagination |
| GET | `/api/v1/jobs/:id` | None | Get a job by id |
| POST | `/api/v1/jobs` | Required (employer/admin) | Create a job |
| PUT | `/api/v1/jobs/:id` | Required (employer/admin) | Update a job |
| DELETE | `/api/v1/jobs/:id` | Required (employer/admin) | Delete a job |
| GET | `/api/v1/jobs/employer/my-jobs` | Required (employer/admin) | List employer's jobs |

### Validation

- `title`, `description`, `location`, `employmentType` — required
- `salaryMin`, `salaryMax` — optional numeric
- `employmentType` — one of full-time/part-time/contract/freelance/internship
- `isRemote` — optional boolean
- `applicationDeadline` — optional ISO8601

### Role-based access

Job creation/update/delete and my-jobs require an authenticated employer or admin. Job listing and job details are public.

## Testing

Test command: `npm test` (runs `jest --testPathPattern=tests --coverage`)

The "Jobs API" suite in `tests/api.test.js` covers create (employer allowed, candidate forbidden), list with filters, get by id, 404, update own job, delete own job, employer jobs. All 30 tests pass.

### Coverage notes

`src/modules/job`:
- controller.js 63.15% statements — error paths not directly exercised
- model.js 80% statements — delete/not-found branches not directly exercised

## Day 8 Outcome

Job model implemented with creation, requirements, salary range, location, employment type, plus full CRUD and employer-scoped queries. Tests pass. Documentation added. Committed to `feature/day8-job-model` and pushed directly to the branch (no pull request).
