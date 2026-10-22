# job_portal Authentication Module

## Overview
Authentication system for candidate/employer/admin roles with OAuth2, JWT, and MFA.

## Files
- `services/job/auth.py` - Authentication logic
- `services/job/models.py` - User and role models
- `services/job/middleware.py` - Auth middleware and RBAC
- `services/job/routes/auth.py` - Auth API routes
- `services/job/mfa.py` - Multi-factor authentication

## Features
- Candidate, employer, and admin account registration/login
- JWT-based session management
- OAuth2 provider integration
- Role-Based Access Control (RBAC)
- Multi-factor authentication (MFA)
- Password hashing with bcrypt
- Session timeout handling

## Tech Stack
- Node.js/Python
- PostgreSQL
- JWT
- OAuth2
- bcrypt for password hashing

## Day 5 Outcome
Authentication module implemented. 1 PR created targeting development.