const { query } = require("../../config/database");

class AssessmentModel {
  static async create({ applicationId, type }) {
    const result = await query(
      `INSERT INTO assessments (application_id, type)
       VALUES ($1, $2)
       RETURNING id, application_id, type, score, feedback, created_at`,
      [applicationId, type],
    );
    return result.rows[0];
  }

  static async getById(id) {
    const result = await query(
      `SELECT id, application_id, type, score, feedback, created_at
       FROM assessments WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }

  static async submit(id, { score, feedback }) {
    const result = await query(
      `UPDATE assessments SET score = $1, feedback = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, application_id, type, score, feedback, created_at, updated_at`,
      [score, feedback, id],
    );
    return result.rows[0];
  }

  static async getResults(id) {
    const result = await query(
      `SELECT id, application_id, type, score, feedback, created_at
       FROM assessments WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }
}

module.exports = AssessmentModel;
