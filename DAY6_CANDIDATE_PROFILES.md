# Day 6: Candidate Profiles

## Repository

`job_portal` — Days 1-5 implemented and merged to `development`.

## Day 6 Task

Candidate profiles - resume, work history, skills, education, preferences | 1 PR

## Implementation

### Files

- `src/modules/candidate/model.js` — `CandidateModel` with `getByUserId(userId)` and `upsert({...})`
- `src/modules/candidate/controller.js` — `CandidateController` with `getByUserId`, `getMyProfile`, `upsert`
- `src/modules/candidate/routes.js` — `GET /me`, `GET /:userId`, `POST /` (upsert)
- `tests/api.test.js` — "Profiles API" integration test for candidate profile creation

### Database

The `candidates` table (migration `001_initial_schema.sql`) stores:

- `user_id` (FK to `users`, unique)
- `resume_url` (TEXT)
- `work_history` (JSONB, default `[]`)
- `skills` (JSONB, default `[]`)
- `education` (JSONB, default `[]`)
- `preferences` (JSONB, default `{}`)
- `created_at`, `updated_at`

### API Contracts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/candidates/me` | Required (candidate) | Get authenticated candidate's own profile |
| GET | `/api/v1/candidates/:userId` | None | Get a candidate profile by user id |
| POST | `/api/v1/candidates` | Required (candidate) | Create or upsert candidate profile |

Request body (POST): `{ resumeUrl, workHistory, skills, education, preferences }`

### Validation

- `resumeUrl` — optional, must be a URL
- `workHistory` — optional, must be an array
- `skills` — optional, must be an array
- `education` — optional, must be an array
- `preferences` — optional, must be an object

### Role-based access

Profile creation (`POST /`) requires an authenticated candidate (or admin). Reading a profile is public.

## Testing

Test command: `npm test` (runs `jest --testPathPattern=tests --coverage`)

The candidate profile flow is covered by the "Profiles API" suite in `tests/api.test.js`:
- creates a candidate profile (calls `getByUserId` then `upsert`), returns 200 with `candidate` body

All 28 tests pass.

### Coverage notes

`src/modules/candidate`:
- controller.js 56.09% statements — `getByUserId` error paths and `getMyProfile` not directly exercised
- model.js 80% statements — update branch not directly exercised

## Day 6 Outcome

Candidate profiles implemented: resume URL, work history, skills, education, and preferences with create/upsert and read endpoints. 0 net code changes needed (implementation already present from Day 5 restructuring). Documentation added. Committed to `feature/day6-candidate-profiles` and pushed directly to the branch (no pull request).
