-- Featured jobs flag
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON jobs(is_featured);
