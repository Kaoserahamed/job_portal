const express = require("express");
const { body } = require("express-validator");
const {
  authenticateToken,
  authorizeRoles,
} = require("../../shared/middleware/auth");
const {
  handleValidationErrors,
} = require("../../shared/middleware/validation");
const EmployerController = require("./controller");

const router = express.Router();

router.get(
  "/me",
  authenticateToken,
  authorizeRoles("employer", "admin"),
  EmployerController.getMyProfile,
);
router.get("/:userId", EmployerController.getByUserId);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("employer", "admin"),
  [
    body("companyName").notEmpty().trim(),
    body("description").optional().trim(),
    body("branding").optional().isObject(),
    body("careersPageUrl").optional().isURL(),
  ],
  handleValidationErrors,
  EmployerController.upsert,
);

module.exports = router;
