const express = require("express");
const { body, param } = require("express-validator");
const { authenticateToken } = require("../../shared/middleware/auth");
const {
  handleValidationErrors,
} = require("../../shared/middleware/validation");
const AssessmentController = require("./controller");

const router = express.Router();

router.post(
  "/:applicationId",
  authenticateToken,
  [
    param("applicationId").isInt(),
    body("type").isIn(["technical", "coding", "multiple_choice"]),
  ],
  handleValidationErrors,
  AssessmentController.create,
);

router.post(
  "/:id/submit",
  authenticateToken,
  [param("id").isInt(), body("answers").isArray()],
  handleValidationErrors,
  AssessmentController.submit,
);

router.get("/:id/results", authenticateToken, AssessmentController.getResults);

module.exports = router;
