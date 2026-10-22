const { query } = require('../config/database');

class ProfileModel {
  static async upsert({ userId, headline, bio, skills, experience, education, portfolioUrl, linkedinUrl, githubUrl }) {
    const result = await query(
      `INSERT INTO profiles (user_id, headline, bio, skills, experience, education, portfolio_url, linkedin_url, github_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id)
       DO UPDATE SET headline = EXCLUDED.headline, bio = EXCLUDED.bio, skills = EXCLUDED.skills,
                     experience = EXCLUDED.experience, education = EXCLUDED.education,
                     portfolio_url = EXCLUDED.portfolio_url, linkedin_url = EXCLUDED.linkedin_url,
                     github_url = EXCLUDED.github_url, updated_at = NOW()
       RETURNING id, user_id, headline, bio, skills, experience, education, portfolio_url, linkedin_url, github_url, created_at, updated_at`,
      [userId, headline, bio, skills, experience, education, portfolioUrl, linkedinUrl, githubUrl]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await query(
      `SELECT id, user_id, headline, bio, skills, experience, education, portfolio_url, linkedin_url, github_url, created_at, updated_at
       FROM profiles WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT p.id, p.user_id, p.headline, p.bio, p.skills, p.experience, p.education,
              p.portfolio_url, p.linkedin_url, p.github_url, p.created_at, p.updated_at,
              u.email, u.first_name, u.last_name, u.role
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = ProfileModel;
