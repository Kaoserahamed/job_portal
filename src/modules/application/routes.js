const express = require("express");
const { body, param } = require("express-validator");
const {
  authenticateToken,
  authorizeRoles,
} = require("../../shared/middleware/auth");
const {
  handleValidationErrors,
} = require("../../shared/middleware/validation");
const ApplicationController = require("./controller");

const router = express.Router();

router.post(
  "/jobs/:jobId/apply",
  authenticateToken,
  authorizeRoles("candidate", "admin"),
  [
    param("jobId").isInt(),
    body("coverLetter").optional().trim(),
    body("resumeUrl").optional().isURL(),
  ],
  handleValidationErrors,
  ApplicationController.create,
);

router.get(
  "/my",
  authenticateToken,
  authorizeRoles("candidate", "admin"),
  ApplicationController.getByApplicant,
);
router.get(
  "/employer",
  authenticateToken,
  authorizeRoles("employer", "admin"),
  ApplicationController.getByEmployer,
);

router.get("/:id", authenticateToken, ApplicationController.getById);

router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("employer", "admin"),
  [
    param("id").isInt(),
    body("status").isIn([
      "applied",
      "reviewing",
      "interviewing",
      "offered",
      "rejected",
      "hired",
    ]),
  ],
  handleValidationErrors,
  ApplicationController.updateStatus,
);

module.exports = router;
