const CandidateModel = require("./model");

class CandidateController {
  static async getByUserId(req, res) {
    try {
      const candidate = await CandidateModel.getByUserId(req.params.userId);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      return res.json({ candidate });
    } catch (error) {
      console.error("Get candidate error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getMyProfile(req, res) {
    try {
      const candidate = await CandidateModel.getByUserId(req.user.userId);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate profile not found" });
      }
      return res.json({ candidate });
    } catch (error) {
      console.error("Get my profile error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async upsert(req, res) {
    try {
      const candidate = await CandidateModel.upsert({
        userId: req.user.userId,
        resumeUrl: req.body.resumeUrl,
        workHistory: req.body.workHistory,
        skills: req.body.skills,
        education: req.body.education,
        preferences: req.body.preferences,
      });
      return res.json({ candidate });
    } catch (error) {
      console.error("Upsert candidate error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = CandidateController;
