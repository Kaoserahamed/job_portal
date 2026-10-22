const EmployerModel = require("./model");

class EmployerController {
  static async getByUserId(req, res) {
    try {
      const employer = await EmployerModel.getByUserId(req.params.userId);
      if (!employer) {
        return res.status(404).json({ error: "Employer not found" });
      }
      return res.json({ employer });
    } catch (error) {
      console.error("Get employer error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getMyProfile(req, res) {
    try {
      const employer = await EmployerModel.getByUserId(req.user.userId);
      if (!employer) {
        return res.status(404).json({ error: "Employer profile not found" });
      }
      return res.json({ employer });
    } catch (error) {
      console.error("Get my employer profile error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async upsert(req, res) {
    try {
      const employer = await EmployerModel.upsert({
        userId: req.user.userId,
        companyName: req.body.companyName,
        description: req.body.description,
        branding: req.body.branding,
        careersPageUrl: req.body.careersPageUrl,
      });
      return res.json({ employer });
    } catch (error) {
      console.error("Upsert employer error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = EmployerController;
