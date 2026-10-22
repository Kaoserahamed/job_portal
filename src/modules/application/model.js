const { query } = require("../../config/database");

class ApplicationModel {
  static async create({ jobId, applicantId, coverLetter, resumeUrl }) {
    const result = await query(
      `INSERT INTO job_applications (job_id, applicant_id, cover_letter, resume_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, job_id, applicant_id, cover_letter, resume_url, status, created_at, updated_at`,
      [jobId, applicantId, coverLetter, resumeUrl],
    );
    return result.rows[0];
  }

  static async getById(id) {
    const result = await query(
      `SELECT id, job_id, applicant_id, cover_letter, resume_url, status, created_at, updated_at
       FROM job_applications WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }

  static async getByApplicant(applicantId) {
    const result = await query(
      `SELECT a.id, a.job_id, a.applicant_id, a.cover_letter, a.resume_url, a.status, a.created_at, a.updated_at,
              j.title AS job_title, j.location AS job_location
       FROM job_applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.applicant_id = $1
       ORDER BY a.created_at DESC`,
      [applicantId],
    );
    return result.rows;
  }

  static async getByEmployer(employerId) {
    const result = await query(
      `SELECT a.id, a.job_id, a.applicant_id, a.cover_letter, a.resume_url, a.status, a.created_at, a.updated_at,
              j.title AS job_title,
              u.id AS applicant_id, u.email AS applicant_email, u.first_name AS applicant_first_name, u.last_name AS applicant_last_name
       FROM job_applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN users u ON u.id = a.applicant_id
       WHERE j.employer_id = $1
       ORDER BY a.created_at DESC`,
      [employerId],
    );
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await query(
      `UPDATE job_applications SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, job_id, applicant_id, cover_letter, resume_url, status, created_at, updated_at`,
      [status, id],
    );
    return result.rows[0];
  }
}

module.exports = ApplicationModel;
