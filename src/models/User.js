const { query } = require('../config/database');
const { hashPassword, comparePassword } = require('../services/auth.service');
const { generateAccessToken, generateRefreshToken } = require('../services/jwt.service');

class UserModel {
  static async create({ email, password, role, firstName, lastName, phone, location }) {
    const hashedPassword = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (email, password, role, first_name, last_name, phone, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, role, first_name, last_name, phone, location, created_at`,
      [email, hashedPassword, role, firstName, lastName, phone, location]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query(
      `SELECT id, email, password, role, first_name, last_name, phone, location, is_active, email_verified, created_at, updated_at
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT id, email, role, first_name, last_name, phone, location, is_active, email_verified, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    values.push(id);
    fields.push(`updated_at = NOW()`);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, email, role, first_name, last_name, phone, location, is_active, email_verified, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async verifyPassword(password, hashedPassword) {
    return comparePassword(password, hashedPassword);
  }
}

module.exports = UserModel;
