const { query } = require('../config/database');

class ApplicationModel {
  static async create({ jobId, applicantId, coverLetter, resumeUrl }) {
    const result = await query(
      `INSERT INTO applications (job_id, applicant_id, cover_letter, resume_url, status)
       VALUES ($1, $2, $3, $4, 'applied')
       RETURNING id, job_id, applicant_id, cover_letter, resume_url, status, created_at, updated_at`,
      [jobId, applicantId, coverLetter, resumeUrl]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT a.id, a.job_id, a.applicant_id, a.cover_letter, a.resume_url, a.status, a.created_at, a.updated_at,
              j.title as job_title, j.employer_id,
              u.id as applicant_id, u.first_name, u.last_name, u.email as applicant_email
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON a.applicant_id = u.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByApplicant(applicantId) {
    const result = await query(
      `SELECT a.id, a.job_id, a.cover_letter, a.resume_url, a.status, a.created_at, a.updated_at,
              j.title as job_title, j.location, j.salary_min, j.salary_max,
              u.id as employer_id, u.first_name as employer_first_name, u.last_name as employer_last_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON j.employer_id = u.id
       WHERE a.applicant_id = $1
       ORDER BY a.created_at DESC`,
      [applicantId]
    );
    return result.rows;
  }

  static async findByEmployer(employerId) {
    const result = await query(
      `SELECT a.id, a.job_id, a.applicant_id, a.cover_letter, a.resume_url, a.status, a.created_at, a.updated_at,
              j.title as job_title,
              u.id as applicant_id, u.first_name as applicant_first_name, u.last_name as applicant_last_name,
              u.email as applicant_email
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN users u ON a.applicant_id = u.id
       WHERE j.employer_id = $1
       ORDER BY a.created_at DESC`,
      [employerId]
    );
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await query(
      `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, job_id, applicant_id, cover_letter, resume_url, status, created_at, updated_at`,
      [status, id]
    );
    return result.rows[0];
  }

  static async hasApplied(jobId, applicantId) {
    const result = await query(
      `SELECT id FROM applications WHERE job_id = $1 AND applicant_id = $2`,
      [jobId, applicantId]
    );
    return result.rows.length > 0;
  }
}

module.exports = ApplicationModel;
