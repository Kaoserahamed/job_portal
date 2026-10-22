const ApplicationModel = require("./model");

class ApplicationController {
  static async create(req, res) {
    try {
      const { coverLetter, resumeUrl } = req.body;
      const jobId = req.params.jobId;
      const application = await ApplicationModel.create({
        jobId,
        applicantId: req.user.userId,
        coverLetter,
        resumeUrl,
      });
      return res.status(201).json({ application });
    } catch (error) {
      console.error("Create application error:", error);
      if (String(error.message || "").includes("unique")) {
        return res.status(409).json({ error: "Already applied to this job" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getById(req, res) {
    try {
      const application = await ApplicationModel.getById(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      return res.json({ application });
    } catch (error) {
      console.error("Get application error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getByApplicant(req, res) {
    try {
      const applications = await ApplicationModel.getByApplicant(
        req.user.userId,
      );
      return res.json({ applications });
    } catch (error) {
      console.error("Get applications error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getByEmployer(req, res) {
    try {
      const applications = await ApplicationModel.getByEmployer(
        req.user.userId,
      );
      return res.json({ applications });
    } catch (error) {
      console.error("Get employer applications error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async updateStatus(req, res) {
    try {
      const application = await ApplicationModel.updateStatus(
        req.params.id,
        req.body.status,
      );
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      return res.json({ application });
    } catch (error) {
      console.error("Update application status error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = ApplicationController;
