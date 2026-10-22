const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const config = require("./config");

const authRoutes = require("./modules/auth/routes");
const jobRoutes = require("./modules/job/routes");
const applicationRoutes = require("./modules/application/routes");
const candidateRoutes = require("./modules/candidate/routes");
const employerRoutes = require("./modules/employer/routes");
const assessmentRoutes = require("./modules/assessment/routes");

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes (versioned)
app.use("/api/v1", authRoutes);
app.use("/api/v1", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/candidates", candidateRoutes);
app.use("/api/v1/employers", employerRoutes);
app.use("/api/v1/assessments", assessmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
