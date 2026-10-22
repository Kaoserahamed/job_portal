const express = require('express');
const {
  body,
  param,
  query,
} = require('express-validator');
const {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
} = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const AuthController = require('../controllers/AuthController');
const JobController = require('../controllers/JobController');
const ProfileController = require('../controllers/ProfileController');

const router = express.Router();

// Auth routes
router.post(
  '/auth/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').optional().isIn(['candidate', 'employer', 'admin']),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('phone').optional().trim(),
    body('location').optional().trim(),
  ],
  handleValidationErrors,
  AuthController.register
);

router.post(
  '/auth/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  handleValidationErrors,
  AuthController.login
);

router.post('/auth/refresh', AuthController.refreshToken);
router.get('/auth/me', authenticateToken, AuthController.me);

// Job routes
router.get(
  '/jobs',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category').optional().trim(),
    query('location').optional().trim(),
    query('employmentType').optional().isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
    query('isRemote').optional().isBoolean(),
    query('search').optional().trim(),
  ],
  handleValidationErrors,
  optionalAuth,
  JobController.getAll
);

router.get('/jobs/:id', JobController.getById);

router.post(
  '/jobs',
  authenticateToken,
  authorizeRoles('employer', 'admin'),
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('requirements').optional().trim(),
    body('location').notEmpty().trim(),
    body('salaryMin').optional().isNumeric(),
    body('salaryMax').optional().isNumeric(),
    body('employmentType').isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
    body('experienceLevel').optional().trim(),
    body('category').optional().trim(),
    body('isRemote').optional().isBoolean(),
    body('applicationDeadline').optional().isISO8601(),
  ],
  handleValidationErrors,
  JobController.create
);

router.put(
  '/jobs/:id',
  authenticateToken,
  authorizeRoles('employer', 'admin'),
  JobController.update
);

router.delete(
  '/jobs/:id',
  authenticateToken,
  authorizeRoles('employer', 'admin'),
  JobController.delete
);

router.get('/jobs/employer/my-jobs', authenticateToken, authorizeRoles('employer', 'admin'), JobController.getByEmployer);

router.post(
  '/jobs/:id/apply',
  authenticateToken,
  authorizeRoles('candidate', 'admin'),
  [
    body('coverLetter').optional().trim(),
    body('resumeUrl').optional().isURL(),
  ],
  handleValidationErrors,
  JobController.apply
);

router.get('/jobs/applications/my', authenticateToken, authorizeRoles('candidate', 'admin'), JobController.getMyApplications);
router.get('/jobs/applications/employer', authenticateToken, authorizeRoles('employer', 'admin'), JobController.getEmployerApplications);

router.patch(
  '/jobs/applications/:id/status',
  authenticateToken,
  authorizeRoles('employer', 'admin'),
  [
    body('status').isIn(['applied', 'reviewing', 'interviewing', 'offered', 'rejected', 'hired']),
  ],
  handleValidationErrors,
  JobController.updateApplicationStatus
);

// Profile routes
router.get('/profiles/:userId', ProfileController.getByUserId);
router.get('/profiles/me', authenticateToken, ProfileController.getMyProfile);
router.post(
  '/profiles',
  authenticateToken,
  [
    body('headline').optional().trim(),
    body('bio').optional().trim(),
    body('skills').optional().isArray(),
    body('experience').optional().isArray(),
    body('education').optional().isArray(),
    body('portfolioUrl').optional().isURL(),
    body('linkedinUrl').optional().isURL(),
    body('githubUrl').optional().isURL(),
  ],
  handleValidationErrors,
  ProfileController.upsert
);

module.exports = router;
