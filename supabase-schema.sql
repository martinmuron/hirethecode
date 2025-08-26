-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (main user table)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('developer', 'company')),
  display_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create developer profiles table
CREATE TABLE developer_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  rate DECIMAL(10,2),
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  portfolio_url TEXT,
  github_url TEXT,
  website_url TEXT,
  country TEXT
);

-- Create company profiles table  
CREATE TABLE company_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  about TEXT,
  website_url TEXT,
  industry TEXT,
  size TEXT
);

-- Create skills table
CREATE TABLE skills (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL
);

-- Create developer_skills junction table
CREATE TABLE developer_skills (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id BIGINT REFERENCES skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  PRIMARY KEY (user_id, skill_id)
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  timeline TEXT,
  location_pref TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_skills junction table
CREATE TABLE project_skills (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  skill_id BIGINT REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);

-- Create project_intake table (for smart matching)
CREATE TABLE project_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitted_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  contact_email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table (mirrors Stripe data)
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY, -- Stripe subscription ID
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  product_tier TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_developer_skills_skill_id ON developer_skills(skill_id);
CREATE INDEX idx_developer_skills_user_id ON developer_skills(user_id);
CREATE INDEX idx_project_skills_skill_id ON project_skills(skill_id);
CREATE INDEX idx_project_skills_project_id ON project_skills(project_id);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Full-text search indexes
CREATE INDEX idx_developer_profiles_bio_fts ON developer_profiles USING gin(to_tsvector('english', bio));
CREATE INDEX idx_projects_description_fts ON projects USING gin(to_tsvector('english', description));

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Public profile visibility for active subscribers
CREATE POLICY "Public profiles visible to active subscribers" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = auth.uid() 
      AND status IN ('active', 'trialing')
    )
  );

-- Developer profiles policies
CREATE POLICY "Developers can manage own profile" ON developer_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Developer profiles visible to active subscribers" ON developer_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = auth.uid() 
      AND status IN ('active', 'trialing')
    )
  );

-- Company profiles policies  
CREATE POLICY "Companies can manage own profile" ON company_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Company profiles visible to active subscribers" ON company_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = auth.uid() 
      AND status IN ('active', 'trialing')
    )
  );

-- Developer skills policies
CREATE POLICY "Developers can manage own skills" ON developer_skills
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Developer skills visible to active subscribers" ON developer_skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = auth.uid() 
      AND status IN ('active', 'trialing')
    )
  );

-- Projects policies
CREATE POLICY "Companies can manage own projects" ON projects
  FOR ALL USING (auth.uid() = company_id);

CREATE POLICY "Projects visible to active subscribers" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = auth.uid() 
      AND status IN ('active', 'trialing')
    )
  );

-- Project skills policies
CREATE POLICY "Companies can manage project skills" ON project_skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_id 
      AND projects.company_id = auth.uid()
    )
  );

CREATE POLICY "Project skills visible to active subscribers" ON project_skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE user_id = auth.uid() 
      AND status IN ('active', 'trialing')
    )
  );

-- Project intake policies
CREATE POLICY "Users can submit project intake" ON project_intake
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can view project intake" ON project_intake
  FOR SELECT USING (false); -- Only accessible via service role

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Insert some common skills
INSERT INTO skills (slug, label) VALUES
  ('javascript', 'JavaScript'),
  ('typescript', 'TypeScript'),
  ('python', 'Python'),
  ('java', 'Java'),
  ('rust', 'Rust'),
  ('go', 'Go'),
  ('react', 'React'),
  ('vue', 'Vue.js'),
  ('angular', 'Angular'),
  ('nodejs', 'Node.js'),
  ('nextjs', 'Next.js'),
  ('php', 'PHP'),
  ('laravel', 'Laravel'),
  ('django', 'Django'),
  ('rails', 'Ruby on Rails'),
  ('postgresql', 'PostgreSQL'),
  ('mysql', 'MySQL'),
  ('mongodb', 'MongoDB'),
  ('redis', 'Redis'),
  ('aws', 'AWS'),
  ('gcp', 'Google Cloud'),
  ('azure', 'Microsoft Azure'),
  ('docker', 'Docker'),
  ('kubernetes', 'Kubernetes'),
  ('graphql', 'GraphQL'),
  ('rest-api', 'REST API'),
  ('microservices', 'Microservices'),
  ('devops', 'DevOps'),
  ('mobile-dev', 'Mobile Development'),
  ('react-native', 'React Native'),
  ('flutter', 'Flutter'),
  ('ios', 'iOS'),
  ('android', 'Android'),
  ('ui-ux', 'UI/UX Design'),
  ('figma', 'Figma'),
  ('machine-learning', 'Machine Learning'),
  ('data-science', 'Data Science'),
  ('blockchain', 'Blockchain'),
  ('web3', 'Web3'),
  ('solidity', 'Solidity')
ON CONFLICT (slug) DO NOTHING;