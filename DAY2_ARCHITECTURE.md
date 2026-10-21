# Day 2 Architecture: Service Boundaries, Database Schema, API Contracts

## Repository
`job_portal` — Empty repository

## Proposed Concept
Comprehensive job portal with AI resume matching, video interviews, skills assessment, salary insights, employer branding, and applicant tracking system.

## Service Boundaries
| Service | Responsibility | Technology |
|---------|---------------|------------|
| Job Service | Job CRUD, publishing, expiration, featured jobs | Node.js/Python, PostgreSQL |
| Candidate Service | Profiles, resume parsing, skills extraction, work history | Node.js/Python, PostgreSQL, object storage |
| Employer Service | Company profiles, branding, careers page, team members | Node.js/Python, PostgreSQL |
| Application Service | Application creation, status tracking, resume attachment | Node.js/Python, PostgreSQL |
| Assessment Service | Skills tests, coding challenges, scoring, feedback | Node.js/Python, code execution sandbox |
| Matching Service | AI resume matching, candidate ranking, recommendations | Python, ML models, vector search |
| Video Service | Interview scheduling, recording, playback | Node.js, Zoom/Teams integration |
| Analytics Service | Time-to-hire, cost-per-hire, source effectiveness | Node.js/Python, PostgreSQL |
| Frontend | Job search, candidate dashboard, employer dashboard | React, TypeScript |

## Database Schema (PostgreSQL)
- `users` — id, email, password_hash, role (candidate/employer/admin), created_at
- `candidates` — id, user_id, resume_url, work_history, skills, education, preferences, created_at
- `resumes` — id, candidate_id, file_url, parsed_text, skills_extracted, experience_years, created_at
- `employers` — id, user_id, company_name, description, branding, careers_page_url, created_at
- `jobs` — id, employer_id, title, description, requirements, salary_range, location, employment_type, status, created_at, expires_at
- `job_applications` — id, job_id, candidate_id, status, cover_letter, resume_id, created_at, updated_at
- `assessments` — id, application_id, type (technical/coding/multiple_choice), score, feedback, created_at
- `interviews` — id, application_id, scheduled_at, interviewer_id, video_url, status, created_at
- `salary_insights` — id, job_title, location, min_salary, max_salary, median, source, created_at
- `employer_branding` — id, employer_id, culture_page, testimonials, benefits, created_at
- `job_alerts` — id, candidate_id, criteria, email_enabled, last_sent, created_at
- `bookmarks` — id, candidate_id, job_id, created_at
- `hire_decisions` — id, application_id, decision, offer_letter_url, accepted_at, created_at

## API Contracts
### Jobs
- `GET /api/v1/jobs` → list (search, filters, pagination)
- `POST /api/v1/jobs` — {title, requirements, salaryRange, location} → {job}
- `GET /api/v1/jobs/{id}` → {job, employer}
- `PUT /api/v1/jobs/{id}` → {job}
- `DELETE /api/v1/jobs/{id}` → 204

### Candidates
- `POST /api/v1/candidates` → {candidate}
- `GET /api/v1/candidates/{id}` → {profile, applications}
- `POST /api/v1/resumes/upload` — {file} → {resumeId, parsedData}
- `GET /api/v1/resumes/{id}` → {parsedData}

### Applications
- `POST /api/v1/applications` — {jobId, coverLetter, resumeId} → {application}
- `GET /api/v1/applications` → list (candidate view)
- `GET /api/v1/applications/{id}` → {application, status}
- `PUT /api/v1/applications/{id}/status` — {status} → {application}

### Employers
- `POST /api/v1/employers` → {employer}
- `GET /api/v1/employers/{id}` → {profile, jobs, applications}
- `PUT /api/v1/employers/branding` — {culture, testimonials} → 204

### Assessments
- `POST /api/v1/assessments` — {applicationId, type} → {assessmentId}
- `POST /api/v1/assessments/{id}/submit` — {answers} → {score, feedback}
- `GET /api/v1/assessments/{id}/results` → {score, breakdown}

### Matching
- `GET /api/v1/matching/recommendations` — {candidateId} → {jobs, scores}
- `GET /api/v1/matching/candidates` — {jobId} → {candidates, scores}

### Salary
- `GET /api/v1/salary-insights` — {jobTitle, location} → {range, median}

## Technical Notes
- No code exists; empty repository
- Resume parsing: PDF/DOCX parsing, skill extraction, experience extraction
- AI matching: semantic matching, skills/experience/education/location weighting
- Video interviews: scheduled interviews, recording, storage
- Skills assessment: technical tests, coding challenges, multiple choice
- Salary insights: ranges, compensation data, location-based
- No authentication, no matching engine, no assessment engine yet

## Day 2 Outcome
Architecture design documented. No code changes. 0 PRs. Ready for Day 3 (CI/CD pipeline).