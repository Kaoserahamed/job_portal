-- Resumes table (parsed candidate resumes)
CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT,
  parsed_text TEXT,
  skills_extracted JSONB DEFAULT '[]',
  experience_years INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_resumes_candidate_id ON resumes(candidate_id);
