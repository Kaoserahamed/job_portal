const { query } = require("../../config/database");

class EmployerModel {
  static async getByUserId(userId) {
    const result = await query(
      `SELECT e.id, e.user_id, e.company_name, e.description, e.branding, e.careers_page_url, e.created_at, e.updated_at,
              u.email, u.first_name, u.last_name, u.location
       FROM employers e
       JOIN users u ON u.id = e.user_id
       WHERE e.user_id = $1`,
      [userId],
    );
    return result.rows[0];
  }

  static async upsert({
    userId,
    companyName,
    description,
    branding,
    careersPageUrl,
  }) {
    const existing = await this.getByUserId(userId);
    if (existing) {
      const result = await query(
        `UPDATE employers SET company_name = $1, description = $2, branding = $3, careers_page_url = $4, updated_at = NOW()
         WHERE user_id = $5
         RETURNING id, user_id, company_name, description, branding, careers_page_url, created_at, updated_at`,
        [
          companyName,
          description,
          JSON.stringify(branding || {}),
          careersPageUrl,
          userId,
        ],
      );
      return result.rows[0];
    }
    const result = await query(
      `INSERT INTO employers (user_id, company_name, description, branding, careers_page_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, company_name, description, branding, careers_page_url, created_at`,
      [
        userId,
        companyName,
        description,
        JSON.stringify(branding || {}),
        careersPageUrl,
      ],
    );
    return result.rows[0];
  }
}

module.exports = EmployerModel;
