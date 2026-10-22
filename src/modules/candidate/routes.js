const express = require("express");
const { body } = require("express-validator");
const { authenticateToken } = require("../../shared/middleware/auth");
const {
  handleValidationErrors,
} = require("../../shared/middleware/validation");
const CandidateController = require("./controller");

const router = express.Router();

router.get("/me", authenticateToken, CandidateController.getMyProfile);
router.get("/:userId", CandidateController.getByUserId);

router.post(
  "/",
  authenticateToken,
  [
    body("resumeUrl").optional().isURL(),
    body("workHistory").optional().isArray(),
    body("skills").optional().isArray(),
    body("education").optional().isArray(),
    body("preferences").optional().isObject(),
  ],
  handleValidationErrors,
  CandidateController.upsert,
);

module.exports = router;
