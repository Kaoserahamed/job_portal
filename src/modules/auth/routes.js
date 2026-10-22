const express = require("express");
const { body } = require("express-validator");
const { authenticateToken } = require("../../shared/middleware/auth");
const {
  handleValidationErrors,
} = require("../../shared/middleware/validation");
const AuthController = require("./controller");

const router = express.Router();

// Auth routes
router.post(
  "/auth/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
    body("role").optional().isIn(["candidate", "employer", "admin"]),
    body("firstName").optional().trim(),
    body("lastName").optional().trim(),
    body("phone").optional().trim(),
    body("location").optional().trim(),
  ],
  handleValidationErrors,
  AuthController.register,
);

router.post(
  "/auth/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
    body("mfaToken").optional().trim(),
  ],
  handleValidationErrors,
  AuthController.login,
);

router.post("/auth/refresh", AuthController.refreshToken);
router.get("/auth/me", authenticateToken, AuthController.me);

// MFA routes
router.post("/auth/mfa/setup", authenticateToken, AuthController.mfaSetup);
router.post(
  "/auth/mfa/verify",
  authenticateToken,
  [body("token").notEmpty(), body("secret").notEmpty()],
  handleValidationErrors,
  AuthController.mfaVerify,
);
router.post("/auth/mfa/disable", authenticateToken, AuthController.mfaDisable);

// OAuth2 routes
router.get("/auth/oauth2/:provider/authorize", AuthController.oauth2Authorize);
router.get("/auth/oauth2/:provider/callback", AuthController.oauth2Callback);

module.exports = router;
