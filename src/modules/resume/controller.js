const ResumeService = require("./service");
const ResumeModel = require("./model");

class ResumeController {
  static async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const parsed = await ResumeService.parseResume(
        req.file.buffer,
        req.file.mimetype,
      );
      const resume = await ResumeModel.create({
        candidateId: req.user.userId,
        fileUrl: null,
        parsedText: parsed.parsedText,
        skillsExtracted: parsed.skillsExtracted,
        experienceYears: parsed.experienceYears,
      });
      return res.status(201).json({ resume });
    } catch (error) {
      console.error("Resume upload error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  static async getById(req, res) {
    try {
      const resume = await ResumeModel.findById(req.params.id);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      return res.json({ resume });
    } catch (error) {
      console.error("Get resume error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = ResumeController;
