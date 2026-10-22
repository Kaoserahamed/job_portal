const JobModel = require("./model");

class JobController {
  static async getAll(req, res) {
    try {
      const { jobs, total, page, limit } = await JobModel.getAll(req.query);
      return res.json({ jobs, total, page, limit });
    } catch (error) {
      console.error("Get jobs error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getById(req, res) {
    try {
      const job = await JobModel.getById(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      return res.json({ job });
    } catch (error) {
      console.error("Get job error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async create(req, res) {
    try {
      const job = await JobModel.create({
        employerId: req.user.userId,
        ...req.body,
      });
      return res.status(201).json({ job });
    } catch (error) {
      console.error("Create job error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async update(req, res) {
    try {
      const job = await JobModel.update(req.params.id, req.body);
      if (!job) {
        return res.status(404).json({ error: "Job not found or no changes" });
      }
      return res.json({ job });
    } catch (error) {
      console.error("Update job error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async delete(req, res) {
    try {
      const job = await JobModel.delete(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Delete job error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getByEmployer(req, res) {
    try {
      const jobs = await JobModel.getByEmployer(req.user.userId);
      return res.json({ jobs });
    } catch (error) {
      console.error("Get employer jobs error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = JobController;
