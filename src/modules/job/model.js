const { query } = require("../../config/database");

class JobModel {
  static async getAll({
    page = 1,
    limit = 20,
    category,
    location,
    employmentType,
    isRemote,
    search,
  } = {}) {
    const values = [];
    let conditions = ["status = $1"];
    values.push("active");
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
      values.push(isRemote === "true");
      paramIndex++;
    }
    if (search) {
      conditions.push(
        `(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`,
      );
      values.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }

    const offset = (page - 1) * limit;

    const countResult = await query(
      `SELECT COUNT(*) FROM jobs WHERE ${conditions.join(" AND ")}`,
      values,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await query(
      `SELECT j.id, j.employer_id, j.title, j.description, j.requirements, j.location,
              j.salary_min, j.salary_max, j.employment_type, j.experience_level, j.category,
              j.is_remote, j.application_deadline, j.status, j.created_at, j.updated_at,
              u.email AS employer_email, u.first_name AS employer_first_name, u.last_name AS employer_last_name
       FROM jobs j
       JOIN users u ON u.id = j.employer_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY j.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset],
    );

    return {
      jobs: result.rows,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
  }

  static async getById(id) {
    const result = await query(
      `SELECT j.id, j.employer_id, j.title, j.description, j.requirements, j.location,
              j.salary_min, j.salary_max, j.employment_type, j.experience_level, j.category,
              j.is_remote, j.application_deadline, j.status, j.created_at, j.updated_at,
              u.email AS employer_email, u.first_name AS employer_first_name, u.last_name AS employer_last_name
       FROM jobs j
       JOIN users u ON u.id = j.employer_id
       WHERE j.id = $1`,
      [id],
    );
    return result.rows[0];
  }

  static async create({
    employerId,
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
  }) {
    const result = await query(
      `INSERT INTO jobs (employer_id, title, description, requirements, location, salary_min, salary_max, employment_type, experience_level, category, is_remote, application_deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, employer_id, title, description, requirements, location, salary_min, salary_max, employment_type, experience_level, category, is_remote, application_deadline, status, created_at`,
      [
        employerId,
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
      ],
    );
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = [
      "title",
      "description",
      "requirements",
      "location",
      "salary_min",
      "salary_max",
      "employment_type",
      "experience_level",
      "category",
      "is_remote",
      "application_deadline",
      "status",
    ];
    for (const [key, value] of Object.entries(updates)) {
      if (!allowed.includes(key)) continue;
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    if (fields.length === 0) return null;

    values.push(id);
    fields.push(`updated_at = NOW()`);

    const result = await query(
      `UPDATE jobs SET ${fields.join(", ")} WHERE id = $${paramIndex}
       RETURNING id, employer_id, title, description, requirements, location, salary_min, salary_max, employment_type, experience_level, category, is_remote, application_deadline, status, created_at, updated_at`,
      values,
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query("DELETE FROM jobs WHERE id = $1 RETURNING id", [
      id,
    ]);
    return result.rows[0];
  }

  static async getByEmployer(employerId) {
    const result = await query(
      `SELECT id, employer_id, title, description, requirements, location, salary_min, salary_max, employment_type, experience_level, category, is_remote, application_deadline, status, created_at
       FROM jobs WHERE employer_id = $1 ORDER BY created_at DESC`,
      [employerId],
    );
    return result.rows;
  }
}

module.exports = JobModel;
