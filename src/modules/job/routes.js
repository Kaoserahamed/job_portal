const express = require("express");
const { body, query } = require("express-validator");
const {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
} = require("../../shared/middleware/auth");
const {
  handleValidationErrors,
} = require("../../shared/middleware/validation");
const JobController = require("./controller");

const router = express.Router();

router.get(
  "/jobs",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("category").optional().trim(),
    query("location").optional().trim(),
    query("employmentType")
      .optional()
      .isIn(["full-time", "part-time", "contract", "freelance", "internship"]),
    query("isRemote").optional().isBoolean(),
    query("isFeatured").optional().isBoolean(),
    query("search").optional().trim(),
  ],
  handleValidationErrors,
  optionalAuth,
  JobController.getAll,
);

router.get("/jobs/featured", optionalAuth, JobController.getFeatured);
router.get("/jobs/:id", JobController.getById);

router.post(
  "/jobs",
  authenticateToken,
  authorizeRoles("employer", "admin"),
  [
    body("title").notEmpty().trim(),
    body("description").notEmpty().trim(),
    body("requirements").optional().trim(),
    body("location").notEmpty().trim(),
    body("salaryMin").optional().isNumeric(),
    body("salaryMax").optional().isNumeric(),
    body("employmentType").isIn([
      "full-time",
      "part-time",
      "contract",
      "freelance",
      "internship",
    ]),
    body("experienceLevel").optional().trim(),
    body("category").optional().trim(),
    body("isRemote").optional().isBoolean(),
    body("isFeatured").optional().isBoolean(),
    body("applicationDeadline").optional().isISO8601(),
  ],
  handleValidationErrors,
  JobController.create,
);

router.put(
  "/jobs/:id",
  authenticateToken,
  authorizeRoles("employer", "admin"),
  JobController.update,
);

router.delete(
  "/jobs/:id",
  authenticateToken,
  authorizeRoles("employer", "admin"),
  JobController.delete,
);

router.get(
  "/jobs/employer/my-jobs",
  authenticateToken,
  authorizeRoles("employer", "admin"),
  JobController.getByEmployer,
);

module.exports = router;
