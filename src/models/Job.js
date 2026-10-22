const { query } = require('../config/database');

class JobModel {
  static async create({ employerId, title, description, requirements, location, salaryMin, salaryMax, employmentType, experienceLevel, category, isRemote, applicationDeadline }) {
    const result = await query(
      `INSERT INTO jobs (employer_id, title, description, requirements, location, salary_min, salary_max, employment_type, experience_level, category, is_remote, application_deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
       RETURNING id, employer_id, title, description, requirements, location, salary_min, salary_max, employment_type, experience_level, category, is_remote, application_deadline, status, created_at, updated_at`,
      [employerId, title, description, requirements, location, salaryMin, salaryMax, employmentType, experienceLevel, category, isRemote, applicationDeadline]
    );
    return result.rows[0];
  }

  static async findAll({ page = 1, limit = 20, category, location, employmentType, isRemote, search }) {
    const offset = (page - 1) * limit;
    let conditions = ['status = $1'];
    const values = ['active'];
    let paramIndex = 2;

    if (category) {
      conditions.push(`category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }
    if (location) {
      conditions.push(`location ILIKE $${paramIndex}`);
      values.push(`%${location}%`);
      paramIndex++;
    }
    if (employmentType) {
      conditions.push(`employment_type = $${paramIndex}`);
      values.push(employmentType);
      paramIndex++;
    }
    if (isRemote !== undefined) {
      conditions.push(`is_remote = $${paramIndex}`);
      values.push(isRemote);
      paramIndex++;
    }
    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT j.id, j.title, j.description, j.requirements, j.location, j.salary_min, j.salary_max,
              j.employment_type, j.experience_level, j.category, j.is_remote, j.application_deadline,
              j.status, j.created_at, j.updated_at,
              u.id as employer_id, u.first_name, u.last_name, u.email as employer_email
       FROM jobs j
       JOIN users u ON j.employer_id = u.id
       WHERE ${whereClause}
       ORDER BY j.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM jobs WHERE ${whereClause}`,
      values
    );

    return {
      jobs: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    };
  }

  static async findById(id) {
    const result = await query(
      `SELECT j.id, j.employer_id, j.title, j.description, j.requirements, j.location, j.salary_min,
              j.salary_max, j.employment_type, j.experience_level, j.category, j.is_remote,
              j.application_deadline, j.status, j.created_at, j.updated_at,
              u.id as employer_id, u.first_name, u.last_name, u.email as employer_email
       FROM jobs j
       JOIN users u ON j.employer_id = u.id
       WHERE j.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async update(id, employerId, updates) {
    const fields = [];
    const values = [id, employerId];
    let paramIndex = 3;

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);

    const result = await query(
      `UPDATE jobs SET ${fields.join(', ')} WHERE id = $1 AND employer_id = $2
       RETURNING id, employer_id, title, description, requirements, location, salary_min, salary_max,
               employment_type, experience_level, category, is_remote, application_deadline, status,
               created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async delete(id, employerId) {
    const result = await query(
      `DELETE FROM jobs WHERE id = $1 AND employer_id = $2 RETURNING id`,
      [id, employerId]
    );
    return result.rows[0];
  }

  static async findByEmployer(employerId) {
    const result = await query(
      `SELECT id, title, description, requirements, location, salary_min, salary_max,
              employment_type, experience_level, category, is_remote, application_deadline,
              status, created_at, updated_at
       FROM jobs WHERE employer_id = $1
       ORDER BY created_at DESC`,
      [employerId]
    );
    return result.rows;
  }
}

module.exports = JobModel;
