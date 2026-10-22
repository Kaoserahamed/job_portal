const AssessmentModel = require("./model");

class AssessmentController {
  static async create(req, res) {
    try {
      const { type } = req.body;
      const assessment = await AssessmentModel.create({
        applicationId: req.params.applicationId,
        type,
      });
      return res.status(201).json({ assessmentId: assessment.id, assessment });
    } catch (error) {
      console.error("Create assessment error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async submit(req, res) {
    try {
      const { answers } = req.body;
      const score = AssessmentController._score(answers);
      const feedback = AssessmentController._feedback(score);
      const assessment = await AssessmentModel.submit(req.params.id, {
        answers,
        score,
        feedback,
      });
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      return res.json({ score, feedback, assessment });
    } catch (error) {
      console.error("Submit assessment error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getResults(req, res) {
    try {
      const assessment = await AssessmentModel.getResults(req.params.id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      return res.json({
        score: assessment.score,
        breakdown: assessment.feedback,
      });
    } catch (error) {
      console.error("Get assessment results error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static _score(answers) {
    if (!Array.isArray(answers)) return 0;
    const correct = answers.filter((a) => a.correct).length;
    return Math.round((correct / answers.length) * 100);
  }

  static _feedback(score) {
    if (score >= 80) return "Excellent performance";
    if (score >= 60) return "Good performance";
    if (score >= 40) return "Needs improvement";
    return "Unsatisfactory";
  }
}

module.exports = AssessmentController;
