const JobModel = require('../models/Job');
const ApplicationModel = require('../models/Application');

class JobController {
  static async create(req, res) {
    try {
      const { title, description, requirements, location, salaryMin, salaryMax, employmentType, experienceLevel, category, isRemote, applicationDeadline } = req.body;

      const job = await JobModel.create({
        employerId: req.user.userId,
        title,
        description,
        requirements,
        location,
        salaryMin,
        salaryMax,
        employmentType,
        experienceLevel,
        category,
        isRemote,
        applicationDeadline,
      });

      res.status(201).json({ message: 'Job created successfully', job });
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getAll(req, res) {
    try {
      const { page, limit, category, location, employmentType, isRemote, search } = req.query;
      const result = await JobModel.findAll({ page, limit, category, location, employmentType, isRemote: isRemote === 'true', search });
      res.json(result);
    } catch (error) {
      console.error('Get jobs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req, res) {
    try {
      const job = await JobModel.findById(req.params.id);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      res.json({ job });
    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req, res) {
    try {
      const job = await JobModel.update(req.params.id, req.user.userId, req.body);
      if (!job) {
        return res.status(404).json({ error: 'Job not found or not authorized' });
      }
      res.json({ message: 'Job updated successfully', job });
    } catch (error) {
      console.error('Update job error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async delete(req, res) {
    try {
      const job = await JobModel.delete(req.params.id, req.user.userId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found or not authorized' });
      }
      res.json({ message: 'Job deleted successfully' });
    } catch (error) {
      console.error('Delete job error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getByEmployer(req, res) {
    try {
      const jobs = await JobModel.findByEmployer(req.user.userId);
      res.json({ jobs });
    } catch (error) {
      console.error('Get employer jobs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async apply(req, res) {
    try {
      const { jobId } = req.params;
      const { coverLetter, resumeUrl } = req.body;

      const hasApplied = await ApplicationModel.hasApplied(jobId, req.user.userId);
      if (hasApplied) {
        return res.status(409).json({ error: 'Already applied to this job' });
      }

      const application = await ApplicationModel.create({
        jobId: parseInt(jobId, 10),
        applicantId: req.user.userId,
        coverLetter,
        resumeUrl,
      });

      res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
      console.error('Apply job error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMyApplications(req, res) {
    try {
      const applications = await ApplicationModel.findByApplicant(req.user.userId);
      res.json({ applications });
    } catch (error) {
      console.error('Get my applications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getEmployerApplications(req, res) {
    try {
      const applications = await ApplicationModel.findByEmployer(req.user.userId);
      res.json({ applications });
    } catch (error) {
      console.error('Get employer applications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateApplicationStatus(req, res) {
    try {
      const { status } = req.body;
      const application = await ApplicationModel.updateStatus(req.params.id, status);
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }
      res.json({ message: 'Application status updated', application });
    } catch (error) {
      console.error('Update application status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = JobController;
