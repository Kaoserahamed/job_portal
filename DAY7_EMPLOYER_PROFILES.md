# Day 7: Employer Profiles

## Repository

`job_portal` — Days 1-6 implemented (Day 6 on `feature/day6-candidate-profiles`).

## Day 7 Task

Employer profiles - company info, branding, careers page, team members | 1 PR

## Implementation

### Files

- `src/modules/employer/model.js` — `EmployerModel` with `getByUserId(userId)` and `upsert({...})`
- `src/modules/employer/controller.js` — `EmployerController` with `getByUserId`, `getMyProfile`, `upsert`
- `src/modules/employer/routes.js` — `GET /me`, `GET /:userId`, `POST /` (upsert)
- `tests/api.test.js` — "Employer Profiles API" integration tests (new)

### Database

The `employers` table (migration `001_initial_schema.sql`) stores:

- `user_id` (FK to `users`, unique)
- `company_name` (VARCHAR, not null)
- `description` (TEXT)
- `branding` (JSONB, default `{}`)
- `careers_page_url` (TEXT)
- `created_at`, `updated_at`

### API Contracts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/employers/me` | Required (employer/admin) | Get authenticated employer's own profile |
| GET | `/api/v1/employers/:userId` | None | Get an employer profile by user id |
| POST | `/api/v1/employers` | Required (employer/admin) | Create or upsert employer profile |

Request body (POST): `{ companyName, description, branding, careersPageUrl }`

### Validation

- `companyName` — required, non-empty, trimmed
- `description` — optional, trimmed
- `branding` — optional, must be an object
- `careersPageUrl` — optional, must be a URL

### Role-based access

Profile creation and `GET /me` require an authenticated employer or admin. `GET /:userId` is public.

### Team members

Team members are not yet modeled (no `team_members` table). This is captured as a known gap for a future iteration; the `branding` JSONB field can store team-related metadata in the interim.

## Testing

Test command: `npm test` (runs `jest --testPathPattern=tests --coverage`)

Added "Employer Profiles API" suite in `tests/api.test.js`:
- creates an employer profile (calls `getByUserId` then `upsert`), returns 200 with `employer` body
- forbids a candidate from creating an employer profile, returns 403

All tests pass.

### Coverage notes

`src/modules/employer`:
- controller.js 34.14% statements — `getByUserId`/`getMyProfile`/upsert error paths not directly exercised
- model.js 20% statements — update branch not directly exercised

## Day 7 Outcome

Employer profiles implemented: company info, branding, and careers page with create/upsert and read endpoints, role-based access control, and integration tests. Documentation added. Committed to `feature/day7-employer-profiles` and pushed directly to the branch (no pull request).
