# Day 9: Job Management

## Repository

`job_portal` — Days 1-8 implemented on their own feature branches (Day 8 on `feature/day8-job-model`).

## Day 9 Task

Job management - CRUD, publishing, expiration, featured jobs | 1 PR

## Implementation

### New: Featured jobs

CRUD, publishing (`status`) and expiration (`application_deadline`) were already implemented. Day 9 adds **featured jobs**:

- `migrations/002_add_featured_jobs.sql` — adds `is_featured BOOLEAN DEFAULT false` to `jobs` and an index
- `src/modules/job/model.js` — `isFeatured` support in `create`, `getAll` (filter), `getById`, `update` (allowed field), `getByEmployer`
- `src/modules/job/controller.js` — new `getFeatured` action
- `src/modules/job/routes.js` — `GET /jobs/featured` (public), `isFeatured` filter on `GET /jobs`, `isFeatured` field on `POST /jobs`
- `tests/api.test.js` — featured job creation and featured listing tests

### Files

- `src/modules/job/model.js` — `JobModel` (getAll, getById, create, update, delete, getByEmployer)
- `src/modules/job/controller.js` — `JobController` (getAll, getById, create, update, delete, getByEmployer, getFeatured)
- `src/modules/job/routes.js` — job routes including `GET /jobs/featured`
- `tests/api.test.js` — "Jobs API" integration tests

### Database

`jobs` table now includes `is_featured` (migration `002_add_featured_jobs.sql`) in addition to the Day 8 fields (`title`, `description`, `requirements`, `location`, `salary_min/max`, `employment_type`, `experience_level`, `category`, `is_remote`, `application_deadline`, `status`).

### API Contracts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/jobs` | Optional | List jobs (search, filters incl. `isFeatured`, pagination) |
| GET | `/api/v1/jobs/featured` | Optional | List featured jobs |
| GET | `/api/v1/jobs/:id` | None | Get a job by id |
| POST | `/api/v1/jobs` | Required (employer/admin) | Create a job (incl. `isFeatured`) |
| PUT | `/api/v1/jobs/:id` | Required (employer/admin) | Update a job (incl. `is_featured`) |
| DELETE | `/api/v1/jobs/:id` | Required (employer/admin) | Delete a job |
| GET | `/api/v1/jobs/employer/my-jobs` | Required (employer/admin) | List employer's jobs |

### Validation

- `isFeatured` — optional boolean on create and list
- `is_featured` — allowed field on update

### Role-based access

Featured listing and job details are public. Create/update/delete require an authenticated employer or admin.

## Testing

Test command: `npm test` (runs `jest --testPathPattern=tests --coverage`)

Added to "Jobs API" suite in `tests/api.test.js`:
- creates a featured job (employer), returns 201 with `is_featured: true`
- lists featured jobs via `GET /api/v1/jobs/featured`, returns featured jobs

All 30 tests pass.

## Day 9 Outcome

Job management complete: CRUD, publishing (`status`), expiration (`application_deadline`), and featured jobs (`is_featured` flag + featured listing endpoint), with tests and documentation. Committed to `feature/day9-job-management` and pushed directly to the branch (no pull request).
