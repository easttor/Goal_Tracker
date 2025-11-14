-- Migration: create_user_activity_and_templates
-- Created at: 1762210532


-- Create user_activity table for tracking achievements
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  goals_completed_count INT DEFAULT 0,
  tasks_completed_count INT DEFAULT 0,
  habits_completed_count INT DEFAULT 0,
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- Create goal_templates table
CREATE TABLE IF NOT EXISTS public.goal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT DEFAULT 'Target',
  color TEXT DEFAULT 'blue',
  default_tasks JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
  ON public.user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity"
  ON public.user_activity FOR UPDATE
  USING (auth.uid() = user_id);

-- Add RLS policies for goal_templates
ALTER TABLE public.goal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public templates"
  ON public.goal_templates FOR SELECT
  USING (is_public = TRUE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON public.user_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_goal_templates_category ON public.goal_templates(category);

-- Function to track user login
CREATE OR REPLACE FUNCTION track_user_login()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_activity (user_id, activity_date, last_login_at)
  VALUES (NEW.id, CURRENT_DATE, NOW())
  ON CONFLICT (user_id, activity_date) 
  DO UPDATE SET last_login_at = NOW(), updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for tracking logins (when user logs in)
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at)
  EXECUTE FUNCTION track_user_login();

-- Function to update activity counters
CREATE OR REPLACE FUNCTION increment_activity_counter(
  p_user_id UUID,
  p_counter_type TEXT,
  p_increment INT DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_activity (user_id, activity_date, goals_completed_count, tasks_completed_count, habits_completed_count)
  VALUES (
    p_user_id,
    CURRENT_DATE,
    CASE WHEN p_counter_type = 'goals' THEN p_increment ELSE 0 END,
    CASE WHEN p_counter_type = 'tasks' THEN p_increment ELSE 0 END,
    CASE WHEN p_counter_type = 'habits' THEN p_increment ELSE 0 END
  )
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    goals_completed_count = CASE WHEN p_counter_type = 'goals' THEN user_activity.goals_completed_count + p_increment ELSE user_activity.goals_completed_count END,
    tasks_completed_count = CASE WHEN p_counter_type = 'tasks' THEN user_activity.tasks_completed_count + p_increment ELSE user_activity.tasks_completed_count END,
    habits_completed_count = CASE WHEN p_counter_type = 'habits' THEN user_activity.habits_completed_count + p_increment ELSE user_activity.habits_completed_count END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default goal templates
INSERT INTO public.goal_templates (title, description, category, icon, color, default_tasks) VALUES
('Fitness Journey', 'Get in shape and build healthy habits', 'Health', 'Heart', 'red', 
 '[{"text":"Complete 30-minute workout","dueDate":""},{"text":"Drink 8 glasses of water daily","dueDate":""},{"text":"Track meals for a week","dueDate":""}]'::jsonb),
('Career Growth', 'Advance your professional development', 'Career', 'Briefcase', 'blue',
 '[{"text":"Update resume and LinkedIn","dueDate":""},{"text":"Learn a new skill","dueDate":""},{"text":"Network with 5 professionals","dueDate":""}]'::jsonb),
('Learn a Language', 'Master a new language', 'Education', 'BookOpen', 'purple',
 '[{"text":"Complete Duolingo lesson daily","dueDate":""},{"text":"Watch content in target language","dueDate":""},{"text":"Practice speaking for 15 minutes","dueDate":""}]'::jsonb),
('Financial Freedom', 'Build wealth and financial security', 'Finance', 'DollarSign', 'green',
 '[{"text":"Create monthly budget","dueDate":""},{"text":"Save 20% of income","dueDate":""},{"text":"Research investment options","dueDate":""}]'::jsonb),
('Reading Challenge', 'Read more books this year', 'Personal', 'Book', 'indigo',
 '[{"text":"Read for 30 minutes daily","dueDate":""},{"text":"Finish one book this month","dueDate":""},{"text":"Join a book club","dueDate":""}]'::jsonb),
('Home Organization', 'Declutter and organize living space', 'Home', 'Home', 'orange',
 '[{"text":"Clean out one room","dueDate":""},{"text":"Donate unused items","dueDate":""},{"text":"Create organization system","dueDate":""}]'::jsonb),
('Creative Project', 'Complete a creative endeavor', 'Personal', 'Palette', 'pink',
 '[{"text":"Brainstorm project ideas","dueDate":""},{"text":"Create project plan","dueDate":""},{"text":"Work on project 1 hour daily","dueDate":""}]'::jsonb),
('Social Connections', 'Strengthen relationships', 'Social', 'Users', 'cyan',
 '[{"text":"Schedule weekly friend meetup","dueDate":""},{"text":"Call family members","dueDate":""},{"text":"Join social group or club","dueDate":""}]'::jsonb)
ON CONFLICT DO NOTHING;
;