# Job Portal API

A comprehensive job portal platform with AI resume matching, video interviews, skills assessment, salary insights, employer branding, and applicant tracking system.

## Features

- **Authentication**: OAuth2, JWT access/refresh tokens, passwordless magic links, social login (Google/GitHub)
- **Role-Based Access Control**: Candidate, Employer, Admin roles
- **Job Management**: Create, read, update, delete job postings
- **Applications**: Apply to jobs, track application status, employer-side application management
- **Profiles**: Candidate profiles with skills, experience, education
- **Search & Filter**: Filter jobs by category, location, employment type, remote status
- **Resume Parsing**: Upload and parse resumes
- **Skills Assessment**: Technical assessment integration

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, OAuth2, bcryptjs
- **Caching**: Redis
- **Testing**: Jest, Supertest
- **Validation**: express-validator

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis (optional, for caching)

### Installation

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

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user (authenticated)

#### Jobs
- `GET /api/v1/jobs` - List jobs (with filters)
- `GET /api/v1/jobs/:id` - Get job details
- `POST /api/v1/jobs` - Create job (employer only)
- `PUT /api/v1/jobs/:id` - Update job (employer only)
- `DELETE /api/v1/jobs/:id` - Delete job (employer only)
- `GET /api/v1/jobs/employer/my-jobs` - Get employer's jobs

#### Applications
- `POST /api/v1/jobs/:id/apply` - Apply to job (candidate only)
- `GET /api/v1/jobs/applications/my` - Get my applications (candidate)
- `GET /api/v1/jobs/applications/employer` - Get applications for employer's jobs
- `PATCH /api/v1/jobs/applications/:id/status` - Update application status (employer)

#### Profiles
- `GET /api/v1/profiles/:userId` - Get user profile
- `GET /api/v1/profiles/me` - Get my profile (authenticated)
- `POST /api/v1/profiles` - Create/update profile (authenticated)

## Testing

```bash
npm test
```

## License

MIT
