const express = require("express");
const multer = require("multer");
const {
  authenticateToken,
  authorizeRoles,
} = require("../../shared/middleware/auth");
const ResumeController = require("./controller");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post(
  "/upload",
  authenticateToken,
  authorizeRoles("candidate", "admin"),
  upload.single("resume"),
  ResumeController.upload,
);
router.get("/:id", authenticateToken, ResumeController.getById);

module.exports = router;
