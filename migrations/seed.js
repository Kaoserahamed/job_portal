const { Pool } = require('pg');

async function seed() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'job_portal_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    // Seed some sample data
    await pool.query(`
      INSERT INTO users (email, password, role, first_name, last_name, location)
      VALUES 
        ('employer@example.com', '$2b$12$LQv3c1yqBWVHxEg0LLDh0uGz3Y5X3LZQz5LQv3c1yqBWVHxEg0LLDh', 'employer', 'Tech', 'Corp', 'San Francisco, CA'),
        ('candidate@example.com', '$2b$12$LQv3c1yqBWVHxEg0LLDh0uGz3Y5X3LZQz5LQv3c1yqBWVHxEg0LLDh', 'candidate', 'John', 'Developer', 'Austin, TX')
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await pool.end();
  }
}

seed();
