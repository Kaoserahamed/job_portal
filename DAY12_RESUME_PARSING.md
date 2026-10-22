# Day 12: Resume Parsing

## Repository

`job_portal` — Days 1-11 implemented on their own feature branches (Day 11 on `feature/day11-application-submission`).

## Day 12 Task

Resume parsing - PDF/DOCX parsing, skill extraction, experience extraction | 1 PR

## Implementation

### New dependencies

- `pdf-parse` — PDF text extraction
- `mammoth` — DOCX text extraction
- `multer` (already present) — in-memory file upload handling

### Files

- `migrations/003_create_resumes_table.sql` — `resumes` table
- `src/modules/resume/service.js` — `parseResume`, `extractSkills`, `extractExperience`, `parsePdf`, `parseDocx`
- `src/modules/resume/model.js` — `ResumeModel` (create, findById)
- `src/modules/resume/controller.js` — `ResumeController` (upload, getById)
- `src/modules/resume/routes.js` — `POST /resumes/upload`, `GET /resumes/:id`
- `src/app.js` — mounts `resumeRoutes` at `/api/v1/resumes`
- `tests/resume.test.js` — service + controller unit tests

### Database

The `resumes` table stores:

- `candidate_id` (FK to `users`)
- `file_url` (TEXT)
- `parsed_text` (TEXT)
- `skills_extracted` (JSONB, default `[]`)
- `experience_years` (INTEGER)
- `created_at`, `updated_at`

### API Contracts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/resumes/upload` | Required (candidate/admin) | Upload + parse a resume (PDF/DOCX) |
| GET | `/api/v1/resumes/:id` | Required | Get a parsed resume by id |

### Parsing behavior

- PDF files are parsed with `pdf-parse`
- DOCX files are parsed with `mammoth`
- Unsupported types return 400 "Unsupported file type"
- `extractSkills` matches text against a built-in common-skills list (case-insensitive, deduplicated)
- `extractExperience` finds the largest `N years`/`N+ years` mention, or `null` when none

### Validation

- `resume` file field is required (multipart)
- Max file size: 10 MB

### Role-based access

Upload requires an authenticated candidate or admin. Read requires authentication.

## Testing

Test command: `npm test` (runs `jest --testPathPattern=tests --coverage`)

`tests/resume.test.js` covers:
- skill extraction (matched, unmatched, deduplicated)
- experience extraction (years, `N+`, none, empty)
- PDF parsing
- DOCX parsing
- unsupported file type rejection
- resume upload (201, 400 no file)
- resume get by id (200, 404)

All 37 tests pass.

### Coverage notes

`src/modules/resume` controller uses `console.error` in error paths (consistent with the rest of the codebase); error branches are not directly exercised.

## Day 12 Outcome

Resume parsing implemented: PDF/DOCX text extraction, skill extraction, and experience extraction, with upload/get endpoints, a `resumes` table, migration, and unit tests. Documentation added. Committed to `feature/day12-resume-parsing` and pushed directly to the branch (no pull request).
