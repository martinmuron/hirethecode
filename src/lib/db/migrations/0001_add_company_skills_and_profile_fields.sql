ALTER TABLE company_profiles 
ADD COLUMN experience_level TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead', 'any')),
ADD COLUMN work_style TEXT CHECK (work_style IN ('remote', 'hybrid', 'onsite', 'flexible'));

-- Create company skills junction table
CREATE TABLE company_skills (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    importance TEXT NOT NULL CHECK (importance IN ('nice_to_have', 'preferred', 'required')) DEFAULT 'preferred',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, skill_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_company_skills_user_id ON company_skills(user_id);
CREATE INDEX idx_company_skills_skill_id ON company_skills(skill_id);
CREATE INDEX idx_company_skills_importance ON company_skills(importance);
CREATE INDEX idx_company_profiles_experience_level ON company_profiles(experience_level);
CREATE INDEX idx_company_profiles_work_style ON company_profiles(work_style);
