const request = require('supertest');
const app = require('../src/app');
const { query } = require('../src/config/database');

describe('Job Portal API', () => {
  let accessToken;
  let employerToken;
  let jobId;
  let applicationId;

  beforeAll(async () => {
    // Register candidate
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'candidate@test.com',
        password: 'password123',
        role: 'candidate',
        firstName: 'John',
        lastName: 'Doe',
      });

    const candidateLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'candidate@test.com', password: 'password123' });
    accessToken = candidateLogin.body.accessToken;

    // Register employer
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'employer@test.com',
        password: 'password123',
        role: 'employer',
        firstName: 'Jane',
        lastName: 'Smith',
      });

    const employerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employer@test.com', password: 'password123' });
    employerToken = employerLogin.body.accessToken;
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'password123',
          role: 'candidate',
          firstName: 'New',
          lastName: 'User',
        });
      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.accessToken).toBeDefined();
    });

    it('should not register duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'candidate@test.com',
          password: 'password123',
          role: 'candidate',
        });
      expect(res.status).toBe(409);
    });

    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'candidate@test.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'candidate@test.com', password: 'wrongpassword' });
      expect(res.status).toBe(401);
    });
  });

  describe('Jobs', () => {
    it('should create a job (employer)', async () => {
      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Senior Software Engineer',
          description: 'We are looking for a senior software engineer.',
          requirements: '5+ years experience with Node.js',
          location: 'New York, NY',
          salaryMin: 100000,
          salaryMax: 150000,
          employmentType: 'full-time',
          experienceLevel: 'senior',
          category: 'Engineering',
          isRemote: false,
        });
      expect(res.status).toBe(201);
      expect(res.body.job).toBeDefined();
      jobId = res.body.job.id;
    });

    it('should get all jobs', async () => {
      const res = await request(app).get('/api/v1/jobs');
      expect(res.status).toBe(200);
      expect(res.body.jobs).toBeDefined();
      expect(res.body.total).toBeGreaterThan(0);
    });

    it('should get job by id', async () => {
      const res = await request(app).get(`/api/v1/jobs/${jobId}`);
      expect(res.status).toBe(200);
      expect(res.body.job.id).toBe(jobId);
    });

    it('should update job (employer)', async () => {
      const res = await request(app)
        .put(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ title: 'Senior Software Engineer - Updated' });
      expect(res.status).toBe(200);
      expect(res.body.job.title).toBe('Senior Software Engineer - Updated');
    });

    it('should not allow candidate to update job', async () => {
      const res = await request(app)
        .put(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Hacked Title' });
      expect(res.status).toBe(403);
    });
  });

  describe('Applications', () => {
    it('should apply to a job (candidate)', async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${jobId}/apply`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ coverLetter: 'I am interested in this position.' });
      expect(res.status).toBe(201);
      expect(res.body.application).toBeDefined();
      applicationId = res.body.application.id;
    });

    it('should not allow duplicate application', async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${jobId}/apply`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ coverLetter: 'Duplicate application' });
      expect(res.status).toBe(409);
    });

    it('should get my applications (candidate)', async () => {
      const res = await request(app)
        .get('/api/v1/jobs/applications/my')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.applications).toBeDefined();
    });

    it('should get employer applications', async () => {
      const res = await request(app)
        .get('/api/v1/jobs/applications/employer')
        .set('Authorization', `Bearer ${employerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.applications).toBeDefined();
    });

    it('should update application status (employer)', async () => {
      const res = await request(app)
        .patch(`/api/v1/jobs/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'reviewing' });
      expect(res.status).toBe(200);
      expect(res.body.application.status).toBe('reviewing');
    });
  });

  describe('Profiles', () => {
    it('should create/update profile (candidate)', async () => {
      const res = await request(app)
        .post('/api/v1/profiles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          headline: 'Software Engineer',
          bio: 'Experienced developer',
          skills: ['JavaScript', 'Node.js', 'React'],
          experience: [{ title: 'Developer', company: 'Tech Co', duration: '3 years' }],
          education: [{ degree: 'BS Computer Science', school: 'University' }],
          portfolioUrl: 'https://portfolio.example.com',
          linkedinUrl: 'https://linkedin.com/in/testuser',
          githubUrl: 'https://github.com/testuser',
        });
      expect(res.status).toBe(200);
      expect(res.body.profile).toBeDefined();
    });

    it('should get my profile', async () => {
      const res = await request(app)
        .get('/api/v1/profiles/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.profile).toBeDefined();
    });
  });

  afterAll(async () => {
    await query('DELETE FROM applications');
    await query('DELETE FROM jobs');
    await query('DELETE FROM profiles');
    await query('DELETE FROM users');
    await query.end();
  });
});
