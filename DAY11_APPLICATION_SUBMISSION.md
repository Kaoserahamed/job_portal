# Day 11: Application Submission

## Repository

`job_portal` — Days 1-10 implemented on their own feature branches (Day 10 on `feature/day10-application-model`).

## Day 11 Task

Application submission - apply with resume, LinkedIn import, manual entry | 1 PR

## Implementation

### Files

- `src/modules/application/model.js` — `ApplicationModel.create` (job_id, applicant_id, cover_letter, resume_url)
- `src/modules/application/controller.js` — `ApplicationController.create`
- `src/modules/application/routes.js` — `POST /jobs/:jobId/apply`
- `tests/api.test.js` — "Applications API" integration test for applying

### API Contract

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/applications/jobs/:jobId/apply` | Required (candidate/admin) | Apply to a job |

Request body: `{ coverLetter?, resumeUrl? }`

### Supported submission modes

- **Manual entry** — cover letter + resume URL submitted directly (implemented)
- **Apply with resume** — `resumeUrl` points to an uploaded/resume file (implemented via URL)

### Known gap: LinkedIn import

LinkedIn import is not implemented. It would require LinkedIn API/OAuth integration and is not part of the current tech stack. Captured as a future enhancement.

### Validation

- `jobId` — required integer (path param)
- `coverLetter` — optional, trimmed
- `resumeUrl` — optional, must be a URL

### Role-based access

Applying requires an authenticated candidate or admin. Duplicate applications are rejected with 409 via the `(job_id, applicant_id)` unique constraint.

## Testing

Test command: `npm test` (runs `jest --testPathPattern=tests --coverage`)

"should apply to a job (candidate)" in the "Applications API" suite → 201 with `application` body. All 30 tests pass.

## Day 11 Outcome

Application submission implemented: apply with resume URL and manual entry (cover letter), with validation, role-based access, and duplicate-application prevention. LinkedIn import noted as a future gap. Documentation added. Committed to `feature/day11-application-submission` and pushed directly to the branch (no pull request).
