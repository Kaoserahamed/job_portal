const { query } = require("../../config/database");

class ResumeModel {
  static async create({
    candidateId,
    fileUrl,
    parsedText,
    skillsExtracted,
    experienceYears,
  }) {
    const result = await query(
      `INSERT INTO resumes (candidate_id, file_url, parsed_text, skills_extracted, experience_years)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, candidate_id, file_url, parsed_text, skills_extracted, experience_years, created_at`,
      [
        candidateId,
        fileUrl,
        parsedText,
        JSON.stringify(skillsExtracted || []),
        experienceYears,
      ],
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT id, candidate_id, file_url, parsed_text, skills_extracted, experience_years, created_at, updated_at
       FROM resumes WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }
}

module.exports = ResumeModel;
