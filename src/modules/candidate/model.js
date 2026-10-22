const { query } = require("../../config/database");

class CandidateModel {
  static async getByUserId(userId) {
    const result = await query(
      `SELECT c.id, c.user_id, c.resume_url, c.work_history, c.skills, c.education, c.preferences, c.created_at, c.updated_at,
              u.email, u.first_name, u.last_name, u.location
       FROM candidates c
       JOIN users u ON u.id = c.user_id
       WHERE c.user_id = $1`,
      [userId],
    );
    return result.rows[0];
  }

  static async upsert({
    userId,
    resumeUrl,
    workHistory,
    skills,
    education,
    preferences,
  }) {
    const existing = await this.getByUserId(userId);
    if (existing) {
      const result = await query(
        `UPDATE candidates SET resume_url = $1, work_history = $2, skills = $3, education = $4, preferences = $5, updated_at = NOW()
         WHERE user_id = $6
         RETURNING id, user_id, resume_url, work_history, skills, education, preferences, created_at, updated_at`,
        [
          resumeUrl,
          JSON.stringify(workHistory || []),
          JSON.stringify(skills || []),
          JSON.stringify(education || []),
          JSON.stringify(preferences || {}),
          userId,
        ],
      );
      return result.rows[0];
    }
    const result = await query(
      `INSERT INTO candidates (user_id, resume_url, work_history, skills, education, preferences)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, resume_url, work_history, skills, education, preferences, created_at`,
      [
        userId,
        resumeUrl,
        JSON.stringify(workHistory || []),
        JSON.stringify(skills || []),
        JSON.stringify(education || []),
        JSON.stringify(preferences || {}),
      ],
    );
    return result.rows[0];
  }
}

module.exports = CandidateModel;
